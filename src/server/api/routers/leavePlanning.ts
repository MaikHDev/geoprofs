import {
  createTRPCRouter,
  protectedProcedure,
  requirePermission,
} from "../trpc";
import { z } from "zod";
import { requestForLeave, user, userDepartments } from "~/server/db/schema";
import { and, eq, gte, lte, inArray } from "drizzle-orm";

export const leavePlanningRouter = createTRPCRouter({
  getDepartmentOverview: protectedProcedure
    .use(requirePermission("LeaveRequestUseOthers.read"))
    .input(
      z.object({
        from: z.date(),
        to: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const departmentsUserBelongsTo = ctx.db
        .select({
          departmentName: userDepartments.departmentName,
        })
        .from(userDepartments)
        .where(eq(userDepartments.userId, ctx.user!.id));

      return ctx.db
        .select({
          requestId: requestForLeave.id,
          userId: requestForLeave.userId,
          userName: user.name,
          departmentName: userDepartments.departmentName,
          dateLeaveStart: requestForLeave.dateLeaveStart,
          dateLeaveEnd: requestForLeave.dateLeaveEnd,
          reasonOfLeave: requestForLeave.reasonOfLeave,
        })
        .from(requestForLeave)
        .innerJoin(user, eq(user.id, requestForLeave.userId))
        .innerJoin(userDepartments, eq(userDepartments.userId, user.id))
        .where(
          and(
            eq(requestForLeave.status, "approved"),
            inArray(userDepartments.departmentName, departmentsUserBelongsTo),
            gte(requestForLeave.dateLeaveEnd, input.from),
            lte(requestForLeave.dateLeaveStart, input.to),
          ),
        );
    }),
});
