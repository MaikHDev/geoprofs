import { createTRPCRouter, protectedProcedure, requirePermission } from "../trpc";
import { requestForLeave, user } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const leaveRequestsRouter = createTRPCRouter({

  listPendingRequests: protectedProcedure
    .use(requirePermission("leaveRequest.read"))
    .query(async ({ ctx }) => {

    return ctx.db
      .select({
        id: requestForLeave.id,
        subject: requestForLeave.subject,
        reason: requestForLeave.reasonOfLeave,
        status: requestForLeave.status,
        start: requestForLeave.dateLeaveStart,
        end: requestForLeave.dateLeaveEnd,
        createdAt: requestForLeave.createdAt,
        requesterName: user.name,
        requesterEmail: user.email,
      })
      .from(requestForLeave)
      .leftJoin(user, eq(user.id, requestForLeave.userId))
      .where(eq(requestForLeave.status, "pending"))
      .orderBy(requestForLeave.createdAt);
    }),

  getById: protectedProcedure
    .use(requirePermission("leaveRequest.read"))
    .input(z.object({ id: z.number() }))
    .query(async ({ctx, input }) => {
      const [req] = await ctx.db
        .select({
          id: requestForLeave.id,
          subject: requestForLeave.subject,
          reason: requestForLeave.reasonOfLeave,
          status: requestForLeave.status,
          start: requestForLeave.dateLeaveStart,
          end: requestForLeave.dateLeaveEnd,
          reasoning: requestForLeave.reasoning,
          feedback: requestForLeave.feedback,
          requesterName: user.name,
          requesterEmail: user.email,
        })
        .from(requestForLeave)
        .leftJoin(user, eq(user.id, requestForLeave.userId))
        .where(eq(requestForLeave.id, input.id));

      return req ?? null;
    }),

  approve: protectedProcedure
    .use(requirePermission("leaveRequest.update"))
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(requestForLeave)
        .set({
          status: "approved",
          reviewer: ctx.session.user.id,
          updatedAt: new Date(),
        })
        .where(eq(requestForLeave.id, input.id));
    }),

  deny: protectedProcedure
    .use(requirePermission("leaveRequest.update"))
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(requestForLeave)
        .set({
          status: "denied",
          reviewer: ctx.session.user.id,
          updatedAt: new Date(),
        })
        .where(eq(requestForLeave.id, input.id));
    }),
});