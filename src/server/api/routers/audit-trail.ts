import {
  createTRPCRouter,
  protectedProcedure,
  requirePermission,
} from "~/server/api/trpc";
import { logs, user } from "~/server/db/schema";
import { and, eq, type InferSelectModel } from "drizzle-orm";

export const auditTrailRouter = createTRPCRouter({
  getAllLogs: protectedProcedure
    .use(requirePermission("log.read"))
    .query(({ ctx }) => {
      return ctx.db.query.logs.findMany({
        with: {
          user: {
            columns: {
              name: true,
              lastName: true,
            },
          },
        },
      });
    }),

  getUserLoggedIn: protectedProcedure
    .use(requirePermission("LogUsers.read"))
    .query(({ ctx }) => {
      return ctx.db
        .select()
        .from(logs)
        .where(
          and(eq(logs.logEvent, "logged_in"), eq(logs.logContext, "users")),
        );
    }),

  getUsersCreatedAt: protectedProcedure
    .use(requirePermission("LogUsers.read"))
    .query(async ({ ctx }) => {
      const result = await ctx.db
        .select({
          details: logs.details,
        })
        .from(logs)
        .where(and(eq(logs.logEvent, "created"), eq(logs.logContext, "users")));

      return result
        .map((row) => {
          const userdata = row.details?.after as Partial<
            InferSelectModel<typeof user>
          >;
          return userdata
            ? {
                id: userdata.id,
                firstName: userdata.name,
                lastName: userdata.lastName,
                email: userdata.email,
                createdAt: userdata.createdAt,
              }
            : null;
        })
        .filter(Boolean);
    }),
});
