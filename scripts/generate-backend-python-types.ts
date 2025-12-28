import { exec } from "child_process";
import { mkdirSync, readFileSync, watch, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";
import { promisify } from "util";

// -----------------------------
// CLI argument parsing
// -----------------------------
type CliOptions = {
  isDev: boolean;
  outPath: string; // Absolute path to Python output
  specPath: string; // Absolute path to spec.json location
  showHelp: boolean;
  convexDir: string; // Absolute path to convex project directory
};

function printHelp(): void {
  console.log(
    [
      "Usage: tsx generate-convex-python-client.ts [options]",
      "",
      "Options:",
      "  --help                 Show this help and exit",
      "  --dev                  Watch Convex sources and regenerate on changes.",
      "                         In dev mode, spec.json is stored in the OS temp dir.",
      "  --convex-dir <path>    REQUIRED. Path to the Convex project directory",
      "  --out <path>           REQUIRED. Write generated Python client to the given file path",
      "  --output <path>        Alias for --out"
    ].join("\n")
  );
}

function parseArgs(argv: string[]): CliOptions {
  const args = argv.slice(2);
  let isDev = false;
  let outPath = "";
  let showHelp = false;
  let convexDir = "";

  // Always use a temp file for spec.json to avoid repo writes
  let specPath = join(
    tmpdir(),
    `convex-spec-${Date.now()}-${Math.random().toString(36).slice(2)}.json`
  );

  for (let i = 0; i < args.length; i++) {
    const token = args[i];
    if (token === "--help" || token === "-h") {
      showHelp = true;
      continue;
    }
    if (token === "--dev") {
      isDev = true;
      // In dev mode, write spec.json into a unique temp file (already the default)
      specPath = join(
        tmpdir(),
        `convex-spec-${Date.now()}-${Math.random().toString(36).slice(2)}.json`
      );
      continue;
    }
    if (token === "--out" || token === "--output") {
      const next = args[i + 1];
      if (!next || next.startsWith("-")) {
        throw new Error(`${token} requires a file path argument`);
      }
      outPath = next.startsWith("/") ? next : join(process.cwd(), next);
      i += 1;
      continue;
    }
    // Support --out=/abs/path style
    if (token.startsWith("--out=") || token.startsWith("--output=")) {
      const [, value] = token.split("=");
      if (!value) throw new Error(`${token} requires a file path value`);
      outPath = value.startsWith("/") ? value : join(process.cwd(), value);
      continue;
    }
    if (token === "--convex-dir" || token === "--convexDir") {
      const next = args[i + 1];
      if (!next || next.startsWith("-")) {
        throw new Error(`${token} requires a directory path argument`);
      }
      convexDir = next.startsWith("/") ? next : join(process.cwd(), next);
      i += 1;
      continue;
    }
    if (token.startsWith("--convex-dir=") || token.startsWith("--convexDir=")) {
      const [, value] = token.split("=");
      if (!value) throw new Error(`${token} requires a directory path value`);
      convexDir = value.startsWith("/") ? value : join(process.cwd(), value);
      continue;
    }
  }

  return { isDev, outPath, specPath, showHelp, convexDir };
}

const options = parseArgs(process.argv);
if (options.showHelp) {
  printHelp();
  process.exit(0);
}
const specPath = options.specPath;
let outputPythonPath = options.outPath;
const convexDir = options.convexDir;

// Validate required args
if (!convexDir || !outputPythonPath) {
  console.error("Error: --convex-dir and --out are required.");
  printHelp();
  process.exit(1);
}

interface TypeDef {
  type: string;
  value?: any;
  fieldType?: TypeDef;
  optional?: boolean;
  tableName?: string;
}

interface FunctionDef {
  identifier: string;
  functionType: "Query" | "Mutation" | "Action";
  args: TypeDef;
  returns: TypeDef;
  visibility: { kind: string };
}

// Convert camelCase to snake_case
function camelToSnake(str: string): string {
  return str.replace(
    /[A-Z]/g,
    (letter, index) => `${index > 0 ? "_" : ""}${letter.toLowerCase()}`
  );
}

// Convert Convex types to Python types
function convexTypeToPython(
  typeDef: TypeDef,
  requiredImports: Set<string>
): string {
  switch (typeDef.type) {
    case "any":
      requiredImports.add("Any");
      return "Any";
    case "string":
      return "str";
    case "id":
      if (typeDef.tableName) {
        return (
          typeDef.tableName.charAt(0).toUpperCase() +
          typeDef.tableName.slice(1) +
          "Id"
        );
      }
      return "str";
    case "number":
      return "float";
    case "boolean":
      return "bool";
    case "null":
      return "None";
    case "array":
      const elementType = convexTypeToPython(typeDef.value, requiredImports);
      requiredImports.add("List");
      return `List[${elementType}]`;
    case "object":
      return "dict";
    case "union":
      const unionTypes = typeDef.value.map((t: TypeDef) =>
        convexTypeToPython(t, requiredImports)
      );
      requiredImports.add("Union");
      return `Union[${unionTypes.join(", ")}]`;
    case "literal":
      requiredImports.add("Literal");
      return `Literal[${JSON.stringify(typeDef.value)}]`;
    default:
      requiredImports.add("Any");
      return "Any";
  }
}

// Parse function identifier into module and function name
function parseIdentifier(identifier: string): {
  module: string;
  functionName: string;
  constantName: string;
  className: string;
} {
  const [file, func] = identifier.split(":");
  const module = file.replace(/\.(js|ts)$/, "");

  // Convert to different naming conventions
  const moduleSnake = camelToSnake(module).toUpperCase();
  const funcSnake = camelToSnake(func).toUpperCase();
  const constantName = `${moduleSnake}_${funcSnake}_NAME`;
  const className =
    module.charAt(0).toUpperCase() +
    module.slice(1) +
    func.charAt(0).toUpperCase() +
    func.slice(1);

  return { module, functionName: func, constantName, className };
}

// Helper to check if a type definition is a non-empty object
function isNonEmptyObject(typeDef: TypeDef): boolean {
  return (
    typeDef.type === "object" &&
    typeDef.value &&
    Object.keys(typeDef.value).length > 0
  );
}

// Helper to get the inner object type from array or direct object
function getObjectType(typeDef: TypeDef): TypeDef | null {
  if (isNonEmptyObject(typeDef)) {
    return typeDef;
  }
  if (
    typeDef.type === "array" &&
    typeDef.value &&
    isNonEmptyObject(typeDef.value)
  ) {
    return typeDef.value;
  }
  return null;
}

// Generate dataclass fields with nested classes
function generateDataclassBody(
  objectType: TypeDef,
  requiredImports: Set<string>,
  indent: string = "    "
): string {
  if (objectType.type !== "object" || !objectType.value) {
    return `${indent}pass`;
  }

  const lines: string[] = [];
  const fields: string[] = [];
  const nestedClassNames = new Set<string>();

  // First, generate any nested dataclasses
  for (const [fieldName, fieldDef] of Object.entries(objectType.value)) {
    const field = fieldDef as { fieldType: TypeDef; optional: boolean };
    const objType = getObjectType(field.fieldType);

    if (objType) {
      const className = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
      if (!nestedClassNames.has(className)) {
        nestedClassNames.add(className);
        lines.push(`${indent}@dataclass`);
        lines.push(`${indent}class ${className}(JSONWizard):`);

        const nestedBody = generateDataclassBody(
          objType,
          requiredImports,
          indent + "    "
        );
        lines.push(nestedBody);
        lines.push("");
      }
    }
  }

  // Then, generate the fields
  for (const [fieldName, fieldDef] of Object.entries(objectType.value)) {
    const field = fieldDef as { fieldType: TypeDef; optional: boolean };
    let fieldType: string;

    if (isNonEmptyObject(field.fieldType)) {
      fieldType = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
    } else if (
      field.fieldType.type === "array" &&
      field.fieldType.value &&
      isNonEmptyObject(field.fieldType.value)
    ) {
      const className = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
      fieldType = `List[${className}]`;
      requiredImports.add("List");
    } else {
      fieldType = convexTypeToPython(field.fieldType, requiredImports);
    }

    if (field.optional) {
      fieldType = `Optional[${fieldType}]`;
      requiredImports.add("Optional");
    }

    fields.push(`${indent}${camelToSnake(fieldName)}: ${fieldType}`);
  }

  if (lines.length > 0) {
    return [...lines, ...fields].join("\n");
  } else if (fields.length > 0) {
    return fields.join("\n");
  }
  return `${indent}pass`;
}

// Generate a dataclass for Args or Result
function generateDataclass(
  name: string,
  typeDef: TypeDef,
  requiredImports: Set<string>
): string {
  const lines: string[] = [];

  lines.push("@dataclass");
  lines.push(`class ${name}(JSONWizard):`);

  if (
    typeDef.type === "object" &&
    typeDef.value &&
    Object.keys(typeDef.value).length > 0
  ) {
    lines.push(generateDataclassBody(typeDef, requiredImports));
  } else {
    lines.push("    pass");
  }

  return lines.join("\n");
}

function collectTableNames(typeDef: TypeDef, tableNames: Set<string>) {
  if (typeDef.type === "id" && typeDef.tableName) {
    tableNames.add(typeDef.tableName);
  }

  if (typeDef.value) {
    if (Array.isArray(typeDef.value)) {
      typeDef.value.forEach((t) => collectTableNames(t, tableNames));
    } else if (typeof typeDef.value === "object") {
      Object.values(typeDef.value).forEach((v: any) => {
        if (v.fieldType) {
          collectTableNames(v.fieldType, tableNames);
        }
      });
    }
  }
}
// Generate the complete Python client file
function generatePythonClient() {
  const spec = JSON.parse(readFileSync(specPath, "utf-8"));
  const allLines: string[] = [];
  const requiredImports = new Set<string>(["Generic", "TypeVar"]);
  const tableNames = new Set<string>();

  const publicFunctions = spec.functions
    .filter((f: FunctionDef) => f.visibility?.kind === "public")
    .map((func: FunctionDef) => {
      const { module, functionName, constantName, className } = parseIdentifier(
        func.identifier
      );
      // Pre-scan for imports and table names
      collectTableNames(func.args, tableNames);
      collectTableNames(func.returns, tableNames);
      generateDataclass(`tmp`, func.args, requiredImports);
      generateDataclass(`tmp`, func.returns, requiredImports);
      return { module, functionName, func, constantName, className };
    });

  // Generate imports
  requiredImports.add("Type");
  if (tableNames.size > 0) {
    requiredImports.add("NewType");
  }
  allLines.push(`from typing import ${[...requiredImports].sort().join(", ")}`);
  allLines.push(
    "from convex import ConvexClient, QuerySubscription, convex_to_json"
  );
  allLines.push("from dataclasses import dataclass");
  allLines.push("from dataclass_wizard import JSONWizard");
  allLines.push("");

  // Generate branded ID types
  if (tableNames.size > 0) {
    [...tableNames].sort().forEach((tableName) => {
      const typeName =
        tableName.charAt(0).toUpperCase() + tableName.slice(1) + "Id";
      allLines.push(`${typeName} = NewType("${typeName}", str)`);
    });
    allLines.push("");
  }

  // Add shared definitions
  allLines.push('T = TypeVar("T", bound=JSONWizard)');
  allLines.push("");
  allLines.push("");
  allLines.push("class Subscription(Generic[T]):");
  allLines.push(
    '    """Type-safe wrapper for QuerySubscription that converts results to dataclass instances."""'
  );
  allLines.push("");
  allLines.push(
    "    def __init__(self, subscription: QuerySubscription, result_type: Type[T]):"
  );
  allLines.push("        self._subscription = subscription");
  allLines.push("        self._result_type = result_type");
  allLines.push("");
  allLines.push('    def __iter__(self) -> "Subscription[T]":');
  allLines.push('        """Return self as iterator."""');
  allLines.push("        return self");
  allLines.push("");
  allLines.push("    def __next__(self) -> T:");
  allLines.push(
    '        """Get next result and convert to dataclass instance."""'
  );
  allLines.push("        result = self._subscription.__next__()");
  allLines.push("        # Convert ConvexValue to JSON-compatible dict");
  allLines.push("        json_result = convex_to_json(result)");
  allLines.push("        if not isinstance(json_result, dict):");
  allLines.push(
    '            raise TypeError(f"Expected dict result, got {type(json_result)}")'
  );
  allLines.push("        return self._result_type.from_dict(json_result)");
  allLines.push("");
  allLines.push('    def __aiter__(self) -> "Subscription[T]":');
  allLines.push('        """Return self as async iterator."""');
  allLines.push("        return self");
  allLines.push("");
  allLines.push("    async def __anext__(self) -> T:");
  allLines.push(
    '        """Get next async result and convert to dataclass instance."""'
  );
  allLines.push("        result = await self._subscription.__anext__()");
  allLines.push("        # Convert ConvexValue to JSON-compatible dict");
  allLines.push("        json_result = convex_to_json(result)");
  allLines.push("        if not isinstance(json_result, dict):");
  allLines.push(
    '            raise TypeError(f"Expected dict result, got {type(json_result)}")'
  );
  allLines.push("        return self._result_type.from_dict(json_result)");
  allLines.push("");
  allLines.push("    def unsubscribe(self) -> None:");
  allLines.push('        """Unsubscribe from the query."""');
  allLines.push("        self._subscription.unsubscribe()");
  allLines.push("");
  allLines.push("class ConvexFunction:");
  allLines.push("    _client: ConvexClient");
  allLines.push("");
  allLines.push("    def __init__(self, client: ConvexClient) -> None:");
  allLines.push("        self._client = client");
  allLines.push("");

  // Generate all dataclasses and name constants
  for (const { func, constantName, className } of publicFunctions) {
    const cleanIdentifier = func.identifier.replace(/\.js:/, ":");
    allLines.push(`${constantName} = "${cleanIdentifier}"`);
    allLines.push("");
    allLines.push(
      generateDataclass(`${className}Args`, func.args, requiredImports)
    );
    allLines.push("");
    allLines.push(
      generateDataclass(`${className}Result`, func.returns, requiredImports)
    );
    allLines.push("");
  }

  // Main Convex class
  allLines.push("class Convex:");

  const modules = new Map<string, typeof publicFunctions>();
  for (const funcData of publicFunctions) {
    if (!modules.has(funcData.module)) {
      modules.set(funcData.module, []);
    }
    modules.get(funcData.module)!.push(funcData);
  }

  // Generate nested classes for each module
  for (const [moduleName, functions] of modules.entries()) {
    const moduleClassName = `_${
      moduleName.charAt(0).toUpperCase() + moduleName.slice(1)
    }`;
    allLines.push(`    class ${moduleClassName}:`);

    for (const { functionName, func, constantName, className } of functions) {
      const functionClassName = `_${
        functionName.charAt(0).toUpperCase() + functionName.slice(1)
      }`;
      allLines.push(`        class ${functionClassName}(ConvexFunction):`);

      const argsClassName = `${className}Args`;
      const resultClassName = `${className}Result`;
      const hasArgs = !(
        func.args.type === "any" ||
        Object.keys(func.args.value || {}).length === 0
      );
      const argsParam = hasArgs ? `self, args: ${argsClassName}` : "self";
      const argsCall = hasArgs ? `, args=args.to_dict()` : "";
      const funcType =
        func.functionType === "Mutation"
          ? "mutate"
          : func.functionType.toLowerCase();

      allLines.push(
        `            def ${funcType}(${argsParam}) -> ${resultClassName}:`
      );
      allLines.push(`                return ${resultClassName}.from_dict(`);
      allLines.push(
        `                    self._client.${func.functionType.toLowerCase()}(${constantName}${argsCall})`
      );
      allLines.push(`                )`);

      if (func.functionType === "Query") {
        allLines.push(``);
        allLines.push(
          `            def subscribe(${argsParam}) -> Subscription[${resultClassName}]:`
        );
        allLines.push(
          `                raw_subscription = self._client.subscribe(${constantName}${argsCall})`
        );
        allLines.push(
          `                return Subscription(raw_subscription, ${resultClassName})`
        );
      }
      allLines.push("");
    }

    // Generate properties and __init__ for the module class
    functions.forEach(({ functionName }: { functionName: string }) => {
      const functionClassName = `_${
        functionName.charAt(0).toUpperCase() + functionName.slice(1)
      }`;
      allLines.push(
        `        ${camelToSnake(functionName)}: ${functionClassName}`
      );
    });
    allLines.push("");
    allLines.push("        def __init__(self, client: ConvexClient):");
    for (const { functionName } of functions) {
      const functionClassName = `_${
        functionName.charAt(0).toUpperCase() + functionName.slice(1)
      }`;
      allLines.push(
        `            self.${camelToSnake(functionName)} = self.${functionClassName}(client)`
      );
    }
    allLines.push("");
  }

  // Generate properties and __init__ for the Convex class
  for (const moduleName of modules.keys()) {
    const moduleClassName = `_${
      moduleName.charAt(0).toUpperCase() + moduleName.slice(1)
    }`;
    allLines.push(`    ${camelToSnake(moduleName)}: ${moduleClassName}`);
  }
  allLines.push("");
  allLines.push("    def __init__(self, deployment_url: str):");
  allLines.push("        client = ConvexClient(deployment_url)");
  for (const moduleName of modules.keys()) {
    const moduleClassName = `_${
      moduleName.charAt(0).toUpperCase() + moduleName.slice(1)
    }`;
    allLines.push(
      `        self.${camelToSnake(moduleName)} = self.${moduleClassName}(client)`
    );
  }
  allLines.push("");

  const pythonClient = allLines.join("\n");
  // Ensure output directory exists
  mkdirSync(dirname(outputPythonPath), { recursive: true });
  writeFileSync(outputPythonPath, pythonClient);

  console.log("Generated Python client");
}

async function waitForServer(url: string, timeout: number = 60000) {
  const startTime = Date.now();
  console.log(`Waiting for server at ${url}...`);

  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log("Server is ready.");
        return;
      }
    } catch (error) {
      // Ignore connection errors and retry
    }
    await new Promise((resolve) => setTimeout(resolve, 2000)); // wait 2 seconds
  }

  throw new Error(
    `Server at ${url} did not become available within ${timeout / 1000}s.`
  );
}

function run() {
  const isDev = options.isDev;
  let lastSpec = "";
  const convexDevUrl = "http://127.0.0.1:3210";

  const regenerate = async () => {
    try {
      // Capture stdout from pnpm convex function-spec (avoid shell redirection)
      const { stdout } = await promisify(exec)(`cd ${convexDir} && bun convex function-spec`, {
        cwd: convexDir
      });
      const newSpec = stdout;

      // Only regenerate if spec has changed
      if (newSpec !== lastSpec) {
        console.log("Spec changed. Regenerating client...");
        lastSpec = newSpec;

        // Write to file (dev: temp dir; non-dev: repo default path)
        writeFileSync(specPath, newSpec);
        generatePythonClient();
      } else {
        console.log("No changes in spec. Skipping regeneration.");
      }
    } catch (error) {
      console.error("Error generating spec:", error);
    }
  };

  if (!isDev) {
    // One-off generation: create spec, then generate client
    regenerate()
      .then(() => void 0)
      .catch((error) => {
        console.error(error.message);
        process.exit(1);
      });
    return;
  }

  console.log("Running in dev mode.");
  waitForServer(convexDevUrl)
    .then(() => {
      console.log("Performing initial generation...");
      return regenerate();
    })
    .then(() => {
      console.log("Watching for file changes...");

      let debounceTimeout: NodeJS.Timeout | null = null;
      const convexSrcPath = join(convexDir, "src");

      watch(convexSrcPath, { recursive: true }, (_, filename) => {
        if (!filename) return;

        if (debounceTimeout) clearTimeout(debounceTimeout);

        debounceTimeout = setTimeout(async () => {
          console.log(`Change detected in ${filename}. Generating new spec...`);
          await regenerate();
        }, 2000); // 2-second debounce
      });
    })
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
}

run();
