import {
    createTRPCRouter,
    protectedProcedure,
    requirePermission,
} from "~/server/api/trpc";
import {LogEvents} from "~/server/db/schema";
import {z} from "zod";


export const auditTrailRouter = createTRPCRouter({
    getAllLogs: protectedProcedure
        .use(requirePermission("log.read"))
        .query(({ctx}) => {
            return ctx.db.query.logs.findMany({
                with: {
                    user: {
                        columns: {
                            name: true,
                            lastName: true,
                        },
                    },
                },
            });
        }),
    getUsers: protectedProcedure
        .use(requirePermission("LogUsers.read"))
        .input(z.object({
            event: z.enum(LogEvents.enumValues),
        }))
        .query(async ({ctx, input}) => {
            const {event} = input;
            return ctx.db.query.logs.findMany({
                with: {
                    user: {
                        columns: {
                            name: true,
                            lastName: true,
                        },
                    },
                },
                where: (logs, {and, eq}) => and(eq(logs.logEvent, event), eq(logs.logContext, "users")),
            });
        }),
    getRequestsForLeave: protectedProcedure
        .use(requirePermission("LogLeaveRequests.read"))
        .input(z.object({
            event: z.enum(LogEvents.enumValues),
        }))
        .query(async ({ctx, input}) => {
            const {event} = input;
            return ctx.db.query.logs.findMany({
                with: {
                    user: {
                        columns: {
                            name: true,
                            lastName: true,
                        },
                    },
                },
                where: (logs, {and, eq}) => and(eq(logs.logEvent, event), eq(logs.logContext, "leave_requests")),
            });
        }),
})

