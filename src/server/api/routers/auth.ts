import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import type { PermissionKey } from "~/shared/permissions";

export const authRouter = createTRPCRouter({
    getMyPermissions: protectedProcedure.query(({ ctx }): PermissionKey[] => {
        return Array.from(ctx.perms) as PermissionKey[];
    }),
});
