import {createTRPCRouter, protectedProcedure, requirePermission,} from "~/server/api/trpc";
import {LogContext, LogEvents, logs, roles, user, userRoles} from "~/server/db/schema";
import {z} from "zod";
import {and, eq, getTableColumns} from "drizzle-orm";
import {TRPCError} from "@trpc/server";

export const auditTrailRouter = createTRPCRouter({
    getLogData: protectedProcedure
        .use(requirePermission("Log.read"))
        .input(z.object({
            logContext: z.enum(LogContext.enumValues),
            logEvent: z.enum(LogEvents.enumValues),
        }))
        .query(({ctx, input}) => {
            if (!ctx.user) return;

            switch (input.logContext) {
                case 'leave_requests':
                    if (!ctx.hasPermission("LogLeaveRequests.read")) throw new TRPCError({code: "UNAUTHORIZED"})
                    break;
                case 'roles':
                    if (!ctx.hasPermission("LogRoles.read")) throw new TRPCError({code: "UNAUTHORIZED"})
                    break;
                case 'users':
                    if (!ctx.hasPermission("LogUsers.read")) throw new TRPCError({code: "UNAUTHORIZED"})
                    break;
                case 'permissions':
                    if (!ctx.hasPermission("LogPermissions.read")) throw new TRPCError({code: "UNAUTHORIZED"})
                    break;
                case 'departments':
                    if (!ctx.hasPermission("LogDepartments.read")) throw new TRPCError({code: "UNAUTHORIZED"})
                    break;
                default:
                    throw new TRPCError({code: "UNAUTHORIZED"})
            }


            return ctx.db.select({
                ...getTableColumns(logs),
                user: {
                    email: user.email,
                    name: user.name,
                    lastName: user.lastName,
                    role: roles.roleName,
                },
            }).from(logs)
                .leftJoin(user, eq(logs.userId, user.id))
                .leftJoin(userRoles, eq(user.email, userRoles.userEmail))
                .leftJoin(roles, eq(userRoles.roleId, roles.id))
                .where(and(
                    eq(logs.logContext, input.logContext),
                    eq(logs.logEvent, input.logEvent),
                ))


        }),
});
