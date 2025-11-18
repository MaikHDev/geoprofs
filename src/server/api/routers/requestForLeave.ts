import z from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  requirePermission,
} from "../trpc";
import { ReasonsForLeave, requestForLeave } from "~/server/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { logAction } from "../../../../utils/log-handle";
import { TRPCError } from "@trpc/server";

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

      const [existing] = await ctx.db
        .select({
          requestCount: ctx.db.$count(requestForLeave),
        })
        .from(requestForLeave)
        .where(
          and(
            sql`DATE(${requestForLeave.dateLeaveStart})
              =
              DATE
              (
              ${input.dateLeaveStart}
              )`,
            sql`DATE(
              ${requestForLeave.dateLeaveEnd}
              )
              =
              DATE
              (
              ${input.dateLeaveEnd}
              )`,
            eq(requestForLeave.userId, ctx.user.id),
          ),
        )
        .limit(1);

      if (existing && existing.requestCount > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You have already placed a request of leave for that date.",
        });
      }

      const newRequest = await ctx.db
        .insert(requestForLeave)
        .values({
          userId: ctx.session.user.id,
          reasonOfLeave: input.reasonOfLeave,
          dateLeaveStart: input.dateLeaveStart,
          dateLeaveEnd: input.dateLeaveEnd,
          reasoning: input.reasoning,
        })
        .returning();

      await logAction({
        logContext: "leave_requests",
        logEvent: "created",
        userId: ctx.session.user.id,
        details: {
          context: "leave_requests",
          after: newRequest[0],
        },
      });
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
          reasonOfLeave: input.reasonOfLeave,
          dateLeaveStart: input.dateLeaveStart,
          dateLeaveEnd: input.dateLeaveEnd,
          reasoning: input.reasoning,
        })
        .where(eq(requestForLeave.id, input.id))
        .returning();

      await logAction({
        logContext: "leave_requests",
        logEvent: "changed",
        userId: ctx.session.user.id,
        details: {
          context: "leave_requests",
          before: result[0],
          after: newRequest[0],
        },
      });

      return result[0] ?? null;
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
