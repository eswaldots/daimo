import { defineSchema } from "convex/server";
import { tables as generatedTables } from "./generatedSchema";

export const tables = {
  ...generatedTables,
  user: generatedTables.user
    .searchIndex("search_name", {
      searchField: "name",
      staged: false,
    })
    .searchIndex("search_email", {
      searchField: "email",
      staged: false,
    }),
};

const schema = defineSchema(tables);

export default schema;
