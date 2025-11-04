import z from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  requirePermission,
} from "../trpc";
import { ReasonsForLeave, requestForLeave } from "~/server/db/schema";
import { eq } from "drizzle-orm";

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

      const request = await ctx.db
        .select()
        .from(requestForLeave)
        .where(eq(requestForLeave.id, input.id))
        .limit(1);
      return request[0];
    }),
});
