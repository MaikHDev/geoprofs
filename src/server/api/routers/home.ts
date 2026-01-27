import { eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure, requirePermission } from "~/server/api/trpc";
import { requestForLeave } from "~/server/db/schema";


export const homeRouter = createTRPCRouter({
    reminderView: protectedProcedure
    .use(requirePermission("LeaveRequestUseOthers.read"))
    .query(({ ctx }) => {
      return ctx.db.query.requestForLeave.findMany({
        where: (r) => 
          eq(requestForLeave.status, "pending"),
        columns: {
          id: true,
          dateLeaveStart: true,
          dateLeaveEnd: true,
          status: true,
          reasonOfLeave: true,
          reasoning: true,
          createdAt: true,
        },
      });
    }),
});
