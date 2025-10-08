import { db } from "~/server/db";
import { permissions, rolePermissions, userRoles } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import type { PermissionKey } from "~/shared/permissions";

export async function loadUserPermissionSet(
  userId: string,
): Promise<Set<PermissionKey>> {
  if (!userId) return new Set<PermissionKey>();

  const rows = await db
    .select({
      resource: permissions.resource,
      action: permissions.action,
    })
    .from(userRoles)
    .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(userRoles.userId, userId));

  const keys = rows.map<PermissionKey>((r) => `${r.resource}.${r.action}`);
  return new Set<PermissionKey>(keys);
}
