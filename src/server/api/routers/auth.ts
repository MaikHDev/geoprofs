import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import type { PermissionKey } from "~/shared/permissions";
import { roles } from "~/server/db/schema";

export const authRouter = createTRPCRouter({
  getMyPermissions: protectedProcedure.query(({ ctx }): PermissionKey[] => {
    return Array.from(ctx.perms);
  }),

  getRoles: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .selectDistinctOn([roles.roleName], {
        roleName: roles.roleName,
      })
      .from(roles);
    return result.map((role) => role.roleName);
  }),
});
