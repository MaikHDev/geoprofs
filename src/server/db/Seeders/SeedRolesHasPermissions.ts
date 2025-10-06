
import { db } from "~/server/db";
import { rolePermissions } from "~/server/db/schema";

interface RolesHasPermissions {
  roleId: number;
  permissionId: number;
  assignedAt?: Date;
  id?: string;
}

export async function seedRolesHasPermissions() {
  const predefinedRolesHasPermissions: RolesHasPermissions[] = [
    { id: "1", roleId: 1, permissionId: 1, assignedAt: new Date() },
    { id: "2", roleId: 1, permissionId: 2, assignedAt: new Date()  },
    { id: "3", roleId: 1, permissionId: 3, assignedAt: new Date()  },
    { id: "4", roleId: 1, permissionId: 4, assignedAt: new Date()  },

  ];

  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(rolePermissions);

  await db.insert(rolePermissions).values(predefinedRolesHasPermissions).onConflictDoNothing().execute();

  console.log("RolesHasPermissions seeded");
}