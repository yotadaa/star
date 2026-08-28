import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "expire anonymous Blog reading windows",
  { hourUTC: 2, minuteUTC: 20 },
  internal.blogAnalytics.cleanupExpiredWindows,
  {},
);

export default crons;
