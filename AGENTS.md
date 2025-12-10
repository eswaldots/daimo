# Agent Instructions for Daimo

## Build/Lint/est Commands

- **Root**: `pnpm build` (all), `pnpm lint` (all), `pnpm check-types` (all), `pnpm format` (Prettier), `pnpm dev` (all)
- **Apps/web**: `pnpm dev` (Next.js), `pnpm build` (Next.js), `pnpm lint` (ESLint)
- **Packages/backend**: `pnpm dev` (Convex), `pnpm typecheck` (TypeScript)
- **Packages/ui**: `pnpm lint` (ESLint), `pnpm check-types` (TypeScript)
- **Note**: No test framework configured yet.

## Code Style Guidelines

- **TypeScript**: Strict mode across all packages
- **ESLint**: Shared configs (`@repo/eslint-config`)
- **Formatting**: Prettier with default settings
- **Imports**: Group React → external modules → internal aliases (`@/`) → relative
- **Exports**: Prefer named exports over default exports
- **Naming**: camelCase (variables/functions), PascalCase (components/types)
- **Error handling**: In Convex backend, throw `ConvexError` with user-facing messages (currently in Spanish)
- **Styling**: Tailwind CSS with shadcn/ui components
- **File structure**: Follow existing patterns in each workspace

**After changes**: Run lint and typecheck commands to ensure correctness.
