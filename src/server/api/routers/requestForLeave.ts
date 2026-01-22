import z from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  requirePermission,
} from "../trpc";
import { ReasonsForLeave, requestForLeave } from "~/server/db/schema";
import { and, eq, sql, isNull } from "drizzle-orm";
import { logAction } from "../../../../utils/log-handle";
import { TRPCError } from "@trpc/server";

export const requestForLeaveRouter = createTRPCRouter({
  create: protectedProcedure
    .use(requirePermission("LeaveRequest.create"))
    .input(
      z.object({
        reasonOfLeave: z.enum(ReasonsForLeave.enumValues),
        dateLeaveStart: z.date(),
        dateLeaveEnd: z.date(),
        reasoning: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const start = new Date(input.dateLeaveStart);
      const end = new Date(input.dateLeaveEnd);

      if (start < today || end < today) {
        throw new Error("Dates cannot be in the past.");
      }

      const existing = await ctx.db.$count(
        requestForLeave,
        and(
          sql`DATE(
                ${requestForLeave.dateLeaveStart}
                )
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
      );

      if (existing > 0) {
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
        reasonOfLeave: z.enum(ReasonsForLeave.enumValues),
        dateLeaveStart: z.date(),
        dateLeaveEnd: z.date(),
        reasoning: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const start = new Date(input.dateLeaveStart);
      const end = new Date(input.dateLeaveEnd);

      if (start < today || end < today) {
        throw new Error("Dates cannot be in the past.");
      }

      const [existing] = await ctx.db
        .select()
        .from(requestForLeave)
        .where(
          and(
            eq(requestForLeave.id, input.id),
            eq(requestForLeave.userId, ctx.user.id),
            eq(requestForLeave.status, "pending"),
            isNull(requestForLeave.reviewer),
          ),
        )
        .limit(1);

      if (!existing) {
        throw new Error(
          "You can no longer modify this request because it is being reviewed or already handled.",
        );
      }

      const [newRequest] = await ctx.db
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
          before: existing,
          after: newRequest,
        },
      });

      return newRequest;
    }),

  getById: protectedProcedure
    .use(requirePermission("LeaveRequest.read"))
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) return;

      const [result] = await ctx.db
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

      return result;
    }),
});
