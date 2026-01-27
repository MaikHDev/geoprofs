import {
  createTRPCRouter,
  protectedProcedure,
  requirePermission,
} from "~/server/api/trpc";
import {
  account,
  logs,
  requestForLeave,
  user,
  userDepartments,
} from "~/server/db/schema";
import { and, desc, eq } from "drizzle-orm";

export const profileRouter = createTRPCRouter({
  getAccountInfo: protectedProcedure
    .use(requirePermission("UserProfile.read"))
    .query(async ({ ctx }) => {
      if (!ctx?.user?.id) return;

      const [loginResult] = await ctx.db
        .select({
          date: logs.createdAt,
        })
        .from(logs)
        .where(
          and(
            eq(logs.userId, ctx.user.id),
            eq(logs.logContext, "users"),
            eq(logs.logEvent, "logged_in"),
          ),
        )
        .orderBy(desc(logs.createdAt))
        .limit(1);

      const vacationDays = await ctx.db
        .select({
          dateStart: requestForLeave.dateLeaveStart,
          dateEnd: requestForLeave.dateLeaveEnd,
        })
        .from(requestForLeave)
        .where(
          and(
            eq(requestForLeave.userId, ctx.user.id),
            eq(requestForLeave.status, "approved"),
          ),
        );
      let vacationDaysUsed = 0;
      vacationDays.forEach((day) => {
        const start = new Date(day.dateStart);
        const end = new Date(day.dateEnd);

        const diffMs = end.getTime() - start.getTime();

        // convert to days
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1;

        vacationDaysUsed += diffDays;
      });

      const [profileResult] = await ctx.db
        .select({
          totalVacationDays: user.vacationDays,
          userCreatedAt: user.createdAt,
          image: user.image,
          csn: account.csn,
          department: userDepartments.departmentName,
        })
        .from(user)
        .where(eq(user.id, ctx.user.id))
        .innerJoin(account, eq(account.userId, user.id))
        .leftJoin(userDepartments, eq(account.userId, userDepartments.userId));

      return {
        ...profileResult,
        vacationDaysUsed,
        lastLogin: loginResult?.date,
      };
    }),
});
