import { permissions } from "~/server/db/schema";
import { db } from "~/server/db";

interface Permission {
  resource: string;
  action: "create" | "read" | "update" | "delete";
  id?: number;
  createdAt?: Date;
  description?: string;
}

export async function seedPermissions() {
  const permissionActions = ["create", "read", "update", "delete"] as const;
  const permissionContexts = {
    UserCredentials: permissionActions,
    UserProfile: permissionActions,
    UserRole: permissionActions,
    UserDepartment: permissionActions,
    LeaveRequest: permissionActions,
    LeaveRequestReview: ["create", "read"] as const,
    Department: permissionActions,
    Permission: permissionActions,
    Role: permissionActions,
    RolePermission: permissionActions,
    Log: ["read", "delete"] as const,
    LogPermissions: ["read", "delete"] as const,
    LogUsers: ["read", "delete"] as const,
    LogRoles: ["read", "delete"] as const,
    LogLeaveRequests: ["read", "delete"] as const,
    LogDepartments: ["read", "delete"] as const,
  }
  const predefinedPermissions: Permission[] = [];

  Object.entries(permissionContexts).forEach(([resource, actions]) => {

    actions.forEach((action) => {
      predefinedPermissions.push({ action, resource });
    });
  })

  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(permissions);

  await db.insert(permissions).values(predefinedPermissions).onConflictDoNothing().execute();

  console.log("Permissions seeded");
}