import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { ReasonsForLeave, requestForLeave, } from "~/server/db/schema";
import { db } from "~/server/db";
import { eq } from "drizzle-orm";


export const requestForLeaveRouter = createTRPCRouter({
    create: protectedProcedure
    .input(
        z.object({  
            subject: z.string(),
            reasonOfLeave: z.enum(ReasonsForLeave.enumValues),
            dateLeaveStart: z.date(),
            dateLeaveEnd: z.date(),
            reasoning: z.string(),
        })
    )
    .mutation(async ({ ctx, input }) => {
        const newRequest = await db
        .insert(requestForLeave)
        .values({
            userId: ctx.session.user.id,
            subject: input.subject,
            reasonOfLeave: input.reasonOfLeave,
            dateLeaveStart: input.dateLeaveStart,
            dateLeaveEnd: input.dateLeaveEnd,
            reasoning: input.reasoning,
            feedback: "",
            reviewer: ctx.session.user.id,
        })
        .returning();

        return newRequest[0];
    }

    ),
    update: protectedProcedure
    .input(
        z.object({ 
            id: z.number(), 
            subject: z.string(),
            reasonOfLeave: z.enum(ReasonsForLeave.enumValues),
            dateLeaveStart: z.date(),
            dateLeaveEnd: z.date(),
            reasoning: z.string(),
        })
    )
    .mutation(async ({ ctx, input }) => {
        const newRequest = await db
        .update(requestForLeave)
        .set({
            userId: ctx.session.user.id,
            subject: input.subject,
            reasonOfLeave: input.reasonOfLeave,
            dateLeaveStart: input.dateLeaveStart,
            dateLeaveEnd: input.dateLeaveEnd,
            reasoning: input.reasoning,
            feedback: "",
            reviewer: ctx.session.user.id,
        })
        .where(eq(requestForLeave.id, input.id))
        .returning();

        return newRequest[0];
    }

    ),
    getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
    const request = await db
        .select()
        .from(requestForLeave)
        .where(eq(requestForLeave.id, input.id))
        .limit(1);
    return request[0];
    }),
})