import {
  createTRPCRouter,
  protectedProcedure,
  requirePermission,
} from "../trpc";
import { requestForLeave, user } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { logAction } from "../../../../utils/log-handle";
import { TRPCError } from "@trpc/server";

export const leaveRequestsRouter = createTRPCRouter({
  listPendingRequests: protectedProcedure
    .use(requirePermission("leaveRequest.read"))
    .query(async ({ ctx }) => {
      return ctx.db
        .select({
          id: requestForLeave.id,
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
        .select()
        .from(requestForLeave)
        .where(eq(requestForLeave.id, input.id));

      if (!existing) throw new TRPCError({code: 'BAD_REQUEST', message: "The selected request can't be updated since it doesn't exist"});
      if (existing.status === "approved" || existing.status === "denied") {
        throw new TRPCError({code: 'CONFLICT', message: "This request has already been handled"});
      }

      const [updatedExisting] = await ctx.db
        .update(requestForLeave)
        .set({
          status: input.status,
          reviewer: ctx.session.user.id,
          updatedAt: new Date(),
        })
        .where(eq(requestForLeave.id, input.id))
        .returning();

      await logAction({
        logContext: "leave_requests",
        logEvent: "assigned",
        userId: ctx.session.user.id,
        details: {
          context: "leave_requests",
          before: existing,
          after: updatedExisting,
        },
      });
    }),
});
