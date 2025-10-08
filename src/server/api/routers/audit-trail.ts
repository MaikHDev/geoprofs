import {z} from "zod";

import {createTRPCRouter, protectedProcedure} from "~/server/api/trpc";

export const auditTrailRouter = createTRPCRouter({
    getAllLogs: protectedProcedure
        .query(async ({ctx}) => {
            return "hello"
        }),


});
