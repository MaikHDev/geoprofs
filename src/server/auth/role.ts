import { db } from "~/server/db";
import { roles, user, userRoles } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function getUserRole(userEmail: string) {
  if (!userEmail) return null;

  const [userRole] = await db
    .select({
      lastName: user.lastName,
      role: roles.roleName,
    })
    .from(user)
    .leftJoin(userRoles, eq(user.email, userRoles.userEmail))
    .leftJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(user.email, userEmail))
    .limit(1);

  return userRole;
}
