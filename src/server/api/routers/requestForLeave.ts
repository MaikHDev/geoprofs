import z from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  requirePermission,
} from "../trpc";
import { ReasonsForLeave, requestForLeave } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";

export const requestForLeaveRouter = createTRPCRouter({
  create: protectedProcedure
    .use(requirePermission("LeaveRequest.create"))
    .input(
      z.object({
        subject: z.string(),
        reasonOfLeave: z.enum(ReasonsForLeave.enumValues),
        dateLeaveStart: z.date(),
        dateLeaveEnd: z.date(),
        reasoning: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) return;

      const date = new Date();

      if (
        input.dateLeaveStart.getDay() < date.getDay() ||
        input.dateLeaveEnd.getDay() < date.getDay()
      ) {
        return;
      }

      const newRequest = await ctx.db
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
    }),

  update: protectedProcedure
    .use(requirePermission("LeaveRequest.update"))
    .input(
      z.object({
        id: z.number(),
        subject: z.string(),
        reasonOfLeave: z.enum(ReasonsForLeave.enumValues),
        dateLeaveStart: z.date(),
        dateLeaveEnd: z.date(),
        reasoning: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) return;
      const date = new Date();

      if (
        input.dateLeaveStart.getDay() < date.getDay() ||
        input.dateLeaveEnd.getDay() < date.getDay()
      ) {
        return;
      }
      const result = await ctx.db
        .select()
        .from(requestForLeave)
        .where(
          and(
            eq(requestForLeave.id, input.id),
            eq(requestForLeave.userId, ctx.user.id),
            eq(requestForLeave.status, "pending"),
          ),
        )
        .limit(1);

      if (!result) return;

      const newRequest = await ctx.db
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
    }),

  getById: protectedProcedure
    .use(requirePermission("LeaveRequest.read"))
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) return;

       const result = await ctx.db
        .select()
        .from(requestForLeave)
        .where(
          and(
            eq(requestForLeave.id, input.id),
            eq(requestForLeave.userId, ctx.user.id),
            eq(requestForLeave.status, "pending"),
          ),
        )
        .limit(1);
        
        return result[0] ?? null;
    }),
});
