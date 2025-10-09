import {z} from "zod";

import {createTRPCRouter, protectedProcedure} from "~/server/api/trpc";
import {logs} from "~/server/db/schema";
import {and, eq} from "drizzle-orm";


export const auditTrailRouter = createTRPCRouter({
    getAllLogs: protectedProcedure
        .query(({ctx}) => {
            return ctx.db.query.logs.findMany({
                with: {
                    user: {
                        columns: {
                            name: true,
                            lastName: true,
                        },
                    }
                }
            });
        }),

    getUserLoggedIn: protectedProcedure
        .query(({ctx}) => {
            return ctx.db.select().from(logs).where(and(
                eq(logs.logEvent, "logged_in"),
                eq(logs.logContext, "users"),
            ));
        }),


});
