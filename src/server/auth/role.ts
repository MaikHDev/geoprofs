import { db } from "~/server/db";
import { roles, userRoles } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function getUserRole(userEmail: string) {
  if (!userEmail) return null;

  const [userRole] = await db
    .select({
      role: roles.roleName,
    })
    .from(userRoles)
    .leftJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userEmail, userEmail))
    .limit(1);

  return userRole;
}
