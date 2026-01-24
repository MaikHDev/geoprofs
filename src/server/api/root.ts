import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { leaveRequestsRouter } from "~/server/api/routers/leaveRequest";
import { auditTrailRouter } from "~/server/api/routers/audit-trail";
import { requestForLeaveRouter } from "./routers/requestForLeave";
import { leavePlanningRouter } from "./routers/leavePlanning";
import { authRouter } from "~/server/api/routers/auth";
import { userAccountRouter } from "~/server/api/routers/userAccount";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auditTrail: auditTrailRouter,
  requestForLeave: requestForLeaveRouter,
  auth: authRouter,
  leaveRequest: leaveRequestsRouter,
  userAccount: userAccountRouter,
  leavePlanning: leavePlanningRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
