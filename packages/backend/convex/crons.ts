import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "Cleanup dead livekit calls",
  { minutes: 60 },
  internal.agent.actions.cleanDeadConversations,
);

export default crons;
