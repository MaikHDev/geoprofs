import { permissions } from "~/server/db/schema";
import { db } from "~/server/db";

interface Permission {
  name: string;
  resource: string;
  action: "create" | "read" | "update" | "delete";
  id?: number;
  createdAt?: Date;
  description?: string;
}

export async function seedPermissions() {
  const predefinedPermissions: Permission[] = [
    { id: 1, name: "create leave request", action: "create", resource: "leave_request", createdAt: new Date() },
    { id: 2, name: "read leave request", action: "read", resource: "leave_request", createdAt: new Date() },
    { id: 3, name: "update leave request", action: "update", resource: "leave_request", createdAt: new Date() },
    { id: 4, name: "delete leave request", action: "update", resource: "leave_request", createdAt: new Date() },
  ];

  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(permissions);

  await db.insert(permissions).values(predefinedPermissions).onConflictDoNothing().execute();

  console.log("Permissions seeded");
}