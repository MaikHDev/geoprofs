import {
  createTRPCRouter,
  protectedProcedure,
  requirePermission,
} from "../trpc";
import { requestForLeave, user } from "~/server/db/schema";
import { and, asc, eq, gte, inArray, ne } from "drizzle-orm";
import { z } from "zod";
import { logAction } from "../../../../utils/log-handle";
import { TRPCError } from "@trpc/server";

export const leaveRequestsRouter = createTRPCRouter({
  listPendingRequests: protectedProcedure
    .use(requirePermission("LeaveRequestUseOthers.read"))
    .query(async ({ ctx }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return ctx.db
        .select({
          id: requestForLeave.id,
          reason: requestForLeave.reasonOfLeave,
          status: requestForLeave.status,
          reasoning: requestForLeave.reasoning,
          start: requestForLeave.dateLeaveStart,
          end: requestForLeave.dateLeaveEnd,
          createdAt: requestForLeave.createdAt,
          requesterName: user.name,
          requesterEmail: user.email,
        })
        .from(requestForLeave)
        .leftJoin(user, eq(user.id, requestForLeave.userId))
        .where(
          and(
            eq(requestForLeave.status, "pending"),
            ne(requestForLeave.userId, ctx.user!.id),
            gte(requestForLeave.dateLeaveEnd, today),
          ),
        )
        .orderBy(requestForLeave.createdAt);
    }),

  getById: protectedProcedure
    .use(requirePermission("LeaveRequestUseOthers.read"))
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [req] = await ctx.db
        .select({
          id: requestForLeave.id,
          reason: requestForLeave.reasonOfLeave,
          status: requestForLeave.status,
          start: requestForLeave.dateLeaveStart,
          end: requestForLeave.dateLeaveEnd,
          reasoning: requestForLeave.reasoning,
          feedback: requestForLeave.feedback,
          reviewer: requestForLeave.reviewer,
          requesterName: user.name,
          requesterEmail: user.email,
        })
        .from(requestForLeave)
        .leftJoin(user, eq(user.id, requestForLeave.userId))
        .where(
          and(
            eq(requestForLeave.id, input.id),
            ne(requestForLeave.userId, ctx.user!.id),
            gte(requestForLeave.dateLeaveEnd, today),
          ),
        )
        .limit(1);

      if (!req) return null;

      if (!req.reviewer) {
        await ctx.db
          .update(requestForLeave)
          .set({
            reviewer: ctx.user!.id,
            updatedAt: new Date(),
          })
          .where(eq(requestForLeave.id, input.id));
      }

      return req;
    }),

  updateMultipleStatus: protectedProcedure
    .use(requirePermission("LeaveRequestReviewUseOthers.create"))
    .input(
      z.object({
        ids: z.array(z.number().min(1)),
        status: z.enum(["approved", "denied"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await ctx.db
        .update(requestForLeave)
        .set({
          status: input.status,
          reviewer: ctx.session.user.id,
          updatedAt: new Date(),
        })
        .where(
          and(
            inArray(requestForLeave.id, input.ids),
            ne(requestForLeave.userId, ctx.user!.id),
            gte(requestForLeave.dateLeaveEnd, today),
          ),
        );
    }),

  updateStatus: protectedProcedure
    .use(requirePermission("LeaveRequestReviewUseOthers.create"))
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["approved", "denied"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [existing] = await ctx.db
        .select({ status: requestForLeave.status })
        .from(requestForLeave)
        .where(
          and(
            eq(requestForLeave.id, input.id),
            ne(requestForLeave.userId, ctx.user!.id),
            gte(requestForLeave.dateLeaveEnd, today),
          ),
        );

      if (!existing)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "The selected request can't be updated since it doesn't exist",
        });
      if (existing.status === "approved" || existing.status === "denied") {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This request has already been handled",
        });
      }

      const [updatedExisting] = await ctx.db
        .update(requestForLeave)
        .set({
          status: input.status,
          reviewer: ctx.session.user.id,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(requestForLeave.id, input.id),
            ne(requestForLeave.userId, ctx.user!.id),
            gte(requestForLeave.dateLeaveEnd, today),
          ),
        )
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

  viewStatus: protectedProcedure
    .use(requirePermission("LeaveRequest.read"))
    .query(({ ctx }) => {
      return ctx.db.query.requestForLeave.findMany({
        where: (r) => eq(r.userId, ctx.session.user.id),
        columns: {
          id: true,
          dateLeaveStart: true,
          dateLeaveEnd: true,
          status: true,
          reasonOfLeave: true,
          reasoning: true,
          createdAt: true,
        },
        orderBy: (r) => asc(r.status),
      });
    }),
});