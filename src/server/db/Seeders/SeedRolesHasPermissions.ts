import { db } from "~/server/db";
import { permissions, rolePermissions, roles } from "~/server/db/schema";
import type { InferInsertModel } from "drizzle-orm";

type RoleHasPermissions = InferInsertModel<typeof rolePermissions>;

export async function seedRolesHasPermissions() {
  const allRoles = await db.select().from(roles);
  const roleMap = new Map(allRoles.map((r) => [r.roleName, r.id]));

  const allPermissions = await db.select().from(permissions);
  const permissionMap = new Map(
    allPermissions.map((p) => [`${p.resource}.${p.action}`, p.id]),
  );

  const excludeLoggingResourcesOfficeManager = [
    "Log",
    "LogPermissions",
    "LogUsers",
    "LogRoles",
    "LogLeaveRequests",
    "LogDepartments",
  ];

  const excludePermissionsAdmin = [
    "LeaveRequest",
    "LeaveRequestReviewUseOthers",
  ];

  const rolePermissionConfig: Record<string, string[]> = {
    Admin: ["*-LeaveRequest"],

    OfficeManager: ["*-logs"],

    Manager: [
      "UserCredentials.read",
      "UserProfile.read",
      "UserProfileUseOthers.read",
      "UserRole.read",
      "UserRoleUseOthers.read",
      "UserDepartment.read",
      "UserDepartmentUseOthers.read",
      "LeaveRequest.create",
      "LeaveRequest.read",
      "LeaveRequest.update",
      "LeaveRequest.delete",
      "LeaveRequestUseOthers.create",
      "LeaveRequestUseOthers.read",
      "LeaveRequestUseOthers.update",
      "LeaveRequestUseOthers.delete",
      "LeaveRequestReviewUseOthers.create",
      "LeaveRequestReviewUseOthers.read",
      "Department.read",
      "Role.read",
      "RolePermission.read",
    ],

    Employee: [
      "UserCredentials.read",
      "UserProfile.read",
      "UserRole.read",
      "UserDepartment.read",
      "UserDepartmentUseOthers.read",
      "LeaveRequest.create",
      "LeaveRequest.read",
      "LeaveRequest.update",
      "LeaveRequest.delete",
      "Department.read",
    ],
  };

  const predefinedRolesHasPermissions: RoleHasPermissions[] = [];

  for (const [roleName, perms] of Object.entries(rolePermissionConfig)) {
    const roleId = roleMap.get(roleName);
    if (!roleId) throw new Error(`Role not found: ${roleName}`);

    let permissionIds: number[];

    if (perms.includes("*-LeaveRequest")) {
      permissionIds = allPermissions
        .filter((p) => !excludePermissionsAdmin.includes(p.resource))
        .map((p) => p.id);
    } else if (perms.includes("*-logs")) {
      permissionIds = allPermissions
        .filter(
          (p) => !excludeLoggingResourcesOfficeManager.includes(p.resource),
        )
        .map((p) => p.id);
    } else {
      permissionIds = perms.map((key) => {
        const id = permissionMap.get(key);
        if (!id) throw new Error(`Unknown permission: ${key}`);
        return id;
      });
    }

    for (const permissionId of permissionIds) {
      predefinedRolesHasPermissions.push({
        roleId,
        permissionId,
        assignedAt: new Date(),
      });
    }
  }

  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(rolePermissions);

  await db
    .insert(rolePermissions)
    .values(predefinedRolesHasPermissions)
    .onConflictDoNothing()
    .execute();

  console.log("RolesHasPermissions seeded");
}
