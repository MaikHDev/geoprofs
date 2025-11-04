import {
  createTRPCRouter,
  protectedProcedure,
  requirePermission,
} from "../trpc";
import { requestForLeave, user } from "~/server/db/schema";
import { eq, lte, not } from "drizzle-orm";
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
    .query(async ({ ctx, input }) => {
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

  updateStatus: protectedProcedure
    .use(requirePermission("leaveRequest.update"))
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["approved", "denied"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({ status: requestForLeave.status })
        .from(requestForLeave)
        .where(eq(requestForLeave.id, input.id));

      if (!existing) throw new Error("Request not found");
      if (existing.status === "approved" || existing.status === "denied") {
        throw new Error("This request has already been handled");
      }

      await ctx.db
        .update(requestForLeave)
        .set({
          status: input.status,
          reviewer: ctx.session.user.id,
          updatedAt: new Date(),
        })
        .where(eq(requestForLeave.id, input.id));
    }),

  viewStatus: protectedProcedure
    .use(requirePermission("leaveRequest.read"))
    .query(({ ctx }) => {
      const date = new Date();
      return ctx.db.query.requestForLeave.findMany({
        columns: {
          id: true,
          dateLeaveStart: true,
          dateLeaveEnd: true,
          status: true,
          reasonOfLeave: true,
          createdAt: true,
        },
        where: (r) => not(lte(r.dateLeaveStart, date)),
      });
    }),
});
