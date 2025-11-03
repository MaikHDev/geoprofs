import { db } from "~/server/db";
import { rolePermissions } from "~/server/db/schema";
import type { InferInsertModel } from "drizzle-orm";

type RoleHasPermissions = InferInsertModel<typeof rolePermissions>;

export async function seedRolesHasPermissions() {
  const predefinedRolesHasPermissions: RoleHasPermissions[] = [
    { roleId: 1, permissionId: 1, assignedAt: new Date() },
    { roleId: 1, permissionId: 2, assignedAt: new Date()  },
    { roleId: 1, permissionId: 3, assignedAt: new Date()  },
    { roleId: 1, permissionId: 4, assignedAt: new Date()  },
  ];

  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(rolePermissions);

  await db.insert(rolePermissions).values(predefinedRolesHasPermissions).onConflictDoNothing().execute();

  console.log("RolesHasPermissions seeded");
}