import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { db } from "~/server/db";
import { requestForLeave, user } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const leaveRequestsRouter = createTRPCRouter({

  listPendingRequests: publicProcedure.query(async () => {

    return db
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
});