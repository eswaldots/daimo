import { TableAggregate } from "@convex-dev/aggregate";
import { Triggers } from "convex-helpers/server/triggers";
import {
  customCtx,
  customMutation,
} from "convex-helpers/server/customFunctions";
import { components } from "./_generated/api";
import { Id, DataModel } from "./_generated/dataModel";
import { mutation } from "./_generated/server";

const aggregateStarsByCharacter = new TableAggregate<{
  Namespace: Id<"characters">;
  Key: Id<"characters">;
  DataModel: DataModel;
  TableName: "stars";
}>(components.aggregateStarsByCharacter, {
  sortKey: (doc) => doc.starredCharacter,
  // Only a number because the existence of the table sums one star
  sumValue: () => 1,
  namespace: (doc) => doc.starredCharacter,
});

// This will update the stars count
const triggers = new Triggers<DataModel>();
triggers.register("stars", aggregateStarsByCharacter.trigger());

// We need to use this on stars mutation to update the count
export const mutationWithAgreggateTrigger = customMutation(
  mutation,
  customCtx(triggers.wrapDB),
);
