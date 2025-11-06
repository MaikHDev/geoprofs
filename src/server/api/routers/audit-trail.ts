import {
  createTRPCRouter,
  protectedProcedure,
  requirePermission,
} from "~/server/api/trpc";
import { LogEvents, logs } from "~/server/db/schema";
import { z } from "zod";

export const auditTrailRouter = createTRPCRouter({
  getAllLogs: protectedProcedure
    .use(requirePermission("Log.read"))
    .query(({ ctx }) => {
      return ctx.db
        .selectDistinctOn([logs.logContext, logs.logEvent], {
          logContext: logs.logContext,
          logEvent: logs.logEvent,
        })
        .from(logs);
    }),
  getUsers: protectedProcedure
    .use(requirePermission("LogUsers.read"))
    .input(
      z.object({
        event: z.enum(LogEvents.enumValues),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { event } = input;
      return ctx.db.query.logs.findMany({
        with: {
          user: {
            columns: {
              name: true,
              lastName: true,
            },
          },
        },
        where: (logs, { and, eq }) =>
          and(eq(logs.logEvent, event), eq(logs.logContext, "users")),
      });
    }),
  getRequestsForLeave: protectedProcedure
    .use(requirePermission("LogLeaveRequests.read"))
    .input(
      z.object({
        event: z.enum(LogEvents.enumValues),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { event } = input;
      return ctx.db.query.logs.findMany({
        with: {
          user: {
            columns: {
              name: true,
              lastName: true,
            },
          },
        },
        where: (logs, { and, eq }) =>
          and(eq(logs.logEvent, event), eq(logs.logContext, "leave_requests")),
      });
    }),

  // createLogs: protectedProcedure
  //   .input(z.object({
  //       logEvent: NewLog["logEvent"],
  //       logContext: NewLog["logContext"],
  //       userId: NewLog["userId"],
  //       details?: NewLog["details"],
  //   }))
});
