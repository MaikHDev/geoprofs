import {
  createTRPCRouter,
  protectedProcedure,
  requirePermission,
} from "~/server/api/trpc";
import {
  LogContext,
  LogEvents,
  logs,
  roles,
  user,
  userRoles,
} from "~/server/db/schema";
import { z } from "zod";
import { and, eq, getTableColumns } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { TrpcErrorlikeMessages } from "~/trpc/trpc-errorlike-messages";

export const auditTrailRouter = createTRPCRouter({
  getLogData: protectedProcedure
    .use(requirePermission("Log.read"))
    .input(
      z.object({
        logContext: z.enum(LogContext.enumValues),
        logEvent: z.enum(LogEvents.enumValues),
      }),
    )
    .query(({ ctx, input }) => {
      if (!ctx.user) return;
      const error = TrpcErrorlikeMessages.permission.message;

      switch (input.logContext) {
        case "leave_requests":
          if (!ctx.hasPermission("LogLeaveRequests.read"))
            throw new TRPCError({ code: "UNAUTHORIZED", message: error });
          break;
        case "roles":
          if (!ctx.hasPermission("LogRoles.read"))
            throw new TRPCError({ code: "UNAUTHORIZED", message: error });
          break;
        case "users":
          if (!ctx.hasPermission("LogUsers.read"))
            throw new TRPCError({ code: "UNAUTHORIZED", message: error });
          break;
        case "permissions":
          if (!ctx.hasPermission("LogPermissions.read"))
            throw new TRPCError({ code: "UNAUTHORIZED", message: error });
          break;
        case "departments":
          if (!ctx.hasPermission("LogDepartments.read"))
            throw new TRPCError({ code: "UNAUTHORIZED", message: error });
          break;
        default:
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message:
              "You don't have the required permissions to see these data",
          });
      }

      return ctx.db
        .select({
          ...getTableColumns(logs),
          user: {
            email: user.email,
            name: user.name,
            lastName: user.lastName,
            role: roles.roleName,
          },
        })
        .from(logs)
        .innerJoin(user, eq(logs.userId, user.id))
        .innerJoin(userRoles, eq(user.email, userRoles.userEmail))
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .where(
          and(
            eq(logs.logContext, input.logContext),
            eq(logs.logEvent, input.logEvent),
          ),
        );
    }),
});
