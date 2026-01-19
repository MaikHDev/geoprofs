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

  // Define all permission contexts based on your mission file
  const permissionContexts = {
    // User Management - Own resources
    UserCredentials: permissionActions,
    UserProfile: permissionActions,
    UserRole: permissionActions,
    UserDepartment: permissionActions,

    // User Management - Others' resources
    UserUseOthers: ["create", "delete"] as const,
    UserCredentialsUseOthers: ["read", "update"] as const,
    UserProfileUseOthers: ["read", "update"] as const,
    UserRoleUseOthers: permissionActions,
    UserDepartmentUseOthers: permissionActions,

    // Leave Request Management
    LeaveRequest: permissionActions,
    LeaveRequestUseOthers: permissionActions,
    LeaveRequestReviewUseOthers: ["create", "read"] as const,

    // Organisation Management
    Department: permissionActions,

    // Role & Permission Management
    Permission: permissionActions,
    Role: permissionActions,
    RolePermission: permissionActions,

    // Logging & Auditing
    Log: ["read", "delete"] as const,
    LogPermissions: ["read", "delete"] as const,
    LogUsers: ["read", "delete"] as const,
    LogRoles: ["read", "delete"] as const,
    LogLeaveRequests: ["read", "delete"] as const,
    LogDepartments: ["read", "delete"] as const,
  };

  const predefinedPermissions: Permission[] = [];

  Object.entries(permissionContexts).forEach(([resource, actions]) => {
    actions.forEach((action) => {
      predefinedPermissions.push({
        action,
        resource,
        description: `${action} permission for ${resource}`,
      });
    });
  });

  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(permissions);

  await db
    .insert(permissions)
    .values(predefinedPermissions)
    .onConflictDoNothing()
    .execute();

  console.log(
    `Permissions seeded: ${predefinedPermissions.length} permissions created`,
  );
}
