import { permissions } from "~/server/db/schema";
import { db } from "~/server/db";
import type { InferInsertModel } from "drizzle-orm";

type Permission = InferInsertModel<typeof permissions>;

export async function seedPermissions() {
  const permissionActions = ["create", "read", "update", "delete"] as const;
  type Action = (typeof permissionActions)[number];

  type PermissionConfig = {
    actions: readonly Action[];
    includeUseOthers?: boolean;
  };

  const permissionGroups: Record<string, PermissionConfig> = {
    UserRole: { actions: permissionActions, includeUseOthers: true },
    UserDepartment: { actions: permissionActions, includeUseOthers: true },
    LeaveRequest: { actions: permissionActions, includeUseOthers: true },

    Log: { actions: ["read", "delete"] },
    LogPermissions: { actions: ["read", "delete"] },
    LogUsers: { actions: ["read", "delete"] },
    LogRoles: { actions: ["read", "delete"] },
    LogLeaveRequests: { actions: ["read", "delete"] },
    LogDepartments: { actions: ["read", "delete"] },

    UserCredentials: { actions: ["read", "update"], includeUseOthers: true },
    LeaveRequestReview: { actions: ["create", "read"], includeUseOthers: true },
    UserProfile: { actions: ["read", "update"], includeUseOthers: true },

    UserUseOthers: { actions: ["create", "delete"] },
    LeaveRequestReviewUseOthers: { actions: ["create", "read"] },

    Permission: { actions: permissionActions },
    Role: { actions: permissionActions },
    RolePermission: { actions: permissionActions },
    Department: { actions: permissionActions },
  };

  const predefinedPermissions: Permission[] = [];

  for (const [resource, config] of Object.entries(permissionGroups)) {
    const { actions, includeUseOthers } = config;

    actions.forEach((action) => {
      predefinedPermissions.push({ action, resource });

      if (includeUseOthers) {
        predefinedPermissions.push({
          action,
          resource: `${resource}UseOthers`,
        });
      }
    });
  }

  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(permissions);

  await db
    .insert(permissions)
    .values(predefinedPermissions)
    .onConflictDoNothing()
    .execute();

  console.log("Permissions seeded");
}