import { db } from "~/server/db";
import { permissions, rolePermissions } from "~/server/db/schema";

interface RolePermissionAssignment {
  roleId: number;
  permissionId: number;
}

export async function seedRolesHasPermissions() {
  // Get all permissions first
  const allPermissions = await db.select().from(permissions);

  // Helper function to get permission IDs by resource and actions
  const getPermissionIds = (resource: string, actions: string[]) => {
    return allPermissions
      .filter((p) => p.resource === resource && actions.includes(p.action))
      .map((p) => p.id);
  };

  // Helper to create "all" permissions (create, read, update, delete)
  const getAllActions = (resource: string) => {
    return getPermissionIds(resource, ["create", "read", "update", "delete"]);
  };

  // Helper to create "default" permissions (create, read, update, delete)
  const getDefaultActions = (resource: string) => {
    return getPermissionIds(resource, ["create", "read", "update", "delete"]);
  };

  const rolePermissionAssignments: RolePermissionAssignment[] = [];

  // Role IDs (assuming: 1=Admin, 2=OfficeManager, 3=Manager, 4=Employee)
  const ADMIN_ROLE_ID = 1;
  const OFFICE_MANAGER_ROLE_ID = 2;
  const MANAGER_ROLE_ID = 3;
  const EMPLOYEE_ROLE_ID = 4;

  // === USER MANAGEMENT CONTEXT ===

  // UserUseOthers
  rolePermissionAssignments.push(
    ...getPermissionIds("UserUseOthers", ["create", "delete"]).flatMap(
      (pid) => [
        { roleId: ADMIN_ROLE_ID, permissionId: pid },
        { roleId: OFFICE_MANAGER_ROLE_ID, permissionId: pid },
      ],
    ),
  );

  // UserCredentials
  rolePermissionAssignments.push(
    ...getPermissionIds("UserCredentials", ["read", "update"]).flatMap(
      (pid) => [
        { roleId: ADMIN_ROLE_ID, permissionId: pid },
        { roleId: OFFICE_MANAGER_ROLE_ID, permissionId: pid },
        { roleId: MANAGER_ROLE_ID, permissionId: pid },
        { roleId: EMPLOYEE_ROLE_ID, permissionId: pid },
      ],
    ),
  );

  // UserCredentialsUseOthers
  rolePermissionAssignments.push(
    ...getPermissionIds("UserCredentialsUseOthers", ["read", "update"]).flatMap(
      (pid) => [
        { roleId: ADMIN_ROLE_ID, permissionId: pid },
        { roleId: OFFICE_MANAGER_ROLE_ID, permissionId: pid },
      ],
    ),
  );

  // UserProfile
  rolePermissionAssignments.push(
    ...getPermissionIds("UserProfile", ["read", "update"]).flatMap((pid) => [
      { roleId: ADMIN_ROLE_ID, permissionId: pid },
      { roleId: OFFICE_MANAGER_ROLE_ID, permissionId: pid },
      { roleId: MANAGER_ROLE_ID, permissionId: pid },
      { roleId: EMPLOYEE_ROLE_ID, permissionId: pid },
    ]),
  );

  // UserProfileUseOthers
  rolePermissionAssignments.push(
    ...getPermissionIds("UserProfileUseOthers", ["read", "update"]).flatMap(
      (pid) => [
        { roleId: ADMIN_ROLE_ID, permissionId: pid },
        { roleId: OFFICE_MANAGER_ROLE_ID, permissionId: pid },
      ],
    ),
    ...getPermissionIds("UserProfileUseOthers", ["read"]).map((pid) => ({
      roleId: MANAGER_ROLE_ID,
      permissionId: pid,
    })),
  );

  // UserRole (default = all actions)
  rolePermissionAssignments.push(
    ...getDefaultActions("UserRole").flatMap((pid) => [
      { roleId: ADMIN_ROLE_ID, permissionId: pid },
      { roleId: OFFICE_MANAGER_ROLE_ID, permissionId: pid },
    ]),
    ...getPermissionIds("UserRole", ["read"]).flatMap((pid) => [
      { roleId: MANAGER_ROLE_ID, permissionId: pid },
      { roleId: EMPLOYEE_ROLE_ID, permissionId: pid },
    ]),
  );

  // UserRoleUseOthers (default = all actions)
  rolePermissionAssignments.push(
    ...getDefaultActions("UserRoleUseOthers").flatMap((pid) => [
      { roleId: ADMIN_ROLE_ID, permissionId: pid },
      { roleId: OFFICE_MANAGER_ROLE_ID, permissionId: pid },
    ]),
    ...getPermissionIds("UserRoleUseOthers", ["read"]).map((pid) => ({
      roleId: MANAGER_ROLE_ID,
      permissionId: pid,
    })),
  );

  // UserDepartment (default = all actions)
  rolePermissionAssignments.push(
    ...getDefaultActions("UserDepartment").flatMap((pid) => [
      { roleId: ADMIN_ROLE_ID, permissionId: pid },
      { roleId: OFFICE_MANAGER_ROLE_ID, permissionId: pid },
    ]),
    ...getPermissionIds("UserDepartment", ["read"]).flatMap((pid) => [
      { roleId: MANAGER_ROLE_ID, permissionId: pid },
      { roleId: EMPLOYEE_ROLE_ID, permissionId: pid },
    ]),
  );

  // UserDepartmentUseOthers (default = all actions)
  rolePermissionAssignments.push(
    ...getDefaultActions("UserDepartmentUseOthers").flatMap((pid) => [
      { roleId: ADMIN_ROLE_ID, permissionId: pid },
      { roleId: OFFICE_MANAGER_ROLE_ID, permissionId: pid },
    ]),
    ...getPermissionIds("UserDepartmentUseOthers", ["read"]).flatMap((pid) => [
      { roleId: MANAGER_ROLE_ID, permissionId: pid },
      { roleId: EMPLOYEE_ROLE_ID, permissionId: pid },
    ]),
  );

  // === LEAVE REQUEST MANAGEMENT ===

  // LeaveRequest (default = all actions)
  rolePermissionAssignments.push(
    ...getDefaultActions("LeaveRequest").flatMap((pid) => [
      { roleId: MANAGER_ROLE_ID, permissionId: pid },
      { roleId: EMPLOYEE_ROLE_ID, permissionId: pid },
    ]),
  );

  // LeaveRequestUseOthers (default = all actions)
  rolePermissionAssignments.push(
    ...getDefaultActions("LeaveRequestUseOthers").flatMap((pid) => [
      { roleId: ADMIN_ROLE_ID, permissionId: pid },
      { roleId: OFFICE_MANAGER_ROLE_ID, permissionId: pid },
      { roleId: MANAGER_ROLE_ID, permissionId: pid },
    ]),
  );

  // LeaveRequestReviewUseOthers (create, read only)
  rolePermissionAssignments.push(
    ...getPermissionIds("LeaveRequestReviewUseOthers", [
      "create",
      "read",
    ]).flatMap((pid) => [
      { roleId: OFFICE_MANAGER_ROLE_ID, permissionId: pid },
      { roleId: MANAGER_ROLE_ID, permissionId: pid },
    ]),
  );

  // === ORGANISATION MANAGEMENT ===

  // Department (default = all actions)
  rolePermissionAssignments.push(
    ...getDefaultActions("Department").flatMap((pid) => [
      { roleId: ADMIN_ROLE_ID, permissionId: pid },
      { roleId: OFFICE_MANAGER_ROLE_ID, permissionId: pid },
    ]),
    ...getPermissionIds("Department", ["read"]).flatMap((pid) => [
      { roleId: MANAGER_ROLE_ID, permissionId: pid },
      { roleId: EMPLOYEE_ROLE_ID, permissionId: pid },
    ]),
  );

  // === ROLE & PERMISSION MANAGEMENT ===

  // Permission (default = all actions)
  rolePermissionAssignments.push(
    ...getDefaultActions("Permission").flatMap((pid) => [
      { roleId: ADMIN_ROLE_ID, permissionId: pid },
      { roleId: OFFICE_MANAGER_ROLE_ID, permissionId: pid },
    ]),
  );

  // Role (default = all actions)
  rolePermissionAssignments.push(
    ...getDefaultActions("Role").flatMap((pid) => [
      { roleId: ADMIN_ROLE_ID, permissionId: pid },
      { roleId: OFFICE_MANAGER_ROLE_ID, permissionId: pid },
    ]),
    ...getPermissionIds("Role", ["read"]).map((pid) => ({
      roleId: MANAGER_ROLE_ID,
      permissionId: pid,
    })),
  );

  // RolePermission (default = all actions)
  rolePermissionAssignments.push(
    ...getDefaultActions("RolePermission").flatMap((pid) => [
      { roleId: ADMIN_ROLE_ID, permissionId: pid },
      { roleId: OFFICE_MANAGER_ROLE_ID, permissionId: pid },
    ]),
    ...getPermissionIds("RolePermission", ["read"]).map((pid) => ({
      roleId: MANAGER_ROLE_ID,
      permissionId: pid,
    })),
  );

  // === LOGGING & AUDITING ===

  // All Log resources (read, delete only) - Admin only
  const logResources = [
    "Log",
    "LogPermissions",
    "LogUsers",
    "LogRoles",
    "LogLeaveRequests",
    "LogDepartments",
  ];

  logResources.forEach((resource) => {
    rolePermissionAssignments.push(
      ...getPermissionIds(resource, ["read", "delete"]).map((pid) => ({
        roleId: ADMIN_ROLE_ID,
        permissionId: pid,
      })),
    );
  });

  // Clear existing role permissions
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(rolePermissions);

  // Insert new role permissions
  if (rolePermissionAssignments.length > 0) {
    await db
      .insert(rolePermissions)
      .values(rolePermissionAssignments)
      .onConflictDoNothing()
      .execute();
  }

  console.log(
    `Role Permissions seeded: ${rolePermissionAssignments.length} assignments created`,
  );
}
