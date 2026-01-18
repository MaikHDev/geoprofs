import { db } from "~/server/db";
import { permissions, rolePermissions } from "~/server/db/schema";

interface RolesHasPermissions {
  roleId: number;
  permissionId: number;
  assignedAt?: Date;
  id?: string;
}

export async function seedRolesHasPermissions() {
  const predefinedRolesHasPermissions: RolesHasPermissions[] = [];

  const perms = db.select().from(permissions);

  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(rolePermissions);

  await db
    .insert(rolePermissions)
    .values(predefinedRolesHasPermissions)
    .onConflictDoNothing()
    .execute();

  console.log("RolesHasPermissions seeded");
}
