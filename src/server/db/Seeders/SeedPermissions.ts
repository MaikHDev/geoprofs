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

      // user management
    { id: 1, name: "create user credentials", action: "create", resource: "UserCredentials", createdAt: new Date() },
      { id: 1, name: "read user credentials", action: "read", resource: "UserCredentials", createdAt: new Date() },
      { id: 1, name: "update user credentials", action: "update", resource: "UserCredentials", createdAt: new Date() },
      { id: 1, name: "delete user credentials", action: "delete", resource: "UserCredentials", createdAt: new Date() },

      { id: 1, name: "create user profile", action: "create", resource: "UserProfile", createdAt: new Date() },
      { id: 1, name: "read user profile", action: "read", resource: "UserProfile", createdAt: new Date() },
      { id: 1, name: "update user profile", action: "update", resource: "UserProfile", createdAt: new Date() },
      { id: 1, name: "delete user profile", action: "delete", resource: "UserProfile", createdAt: new Date() },

      { id: 1, name: "create user role", action: "create", resource: "UserRole", createdAt: new Date() },
      { id: 1, name: "read user role", action: "read", resource: "UserRole", createdAt: new Date() },
      { id: 1, name: "update user role", action: "update", resource: "UserRole", createdAt: new Date() },
      { id: 1, name: "delete user role", action: "delete", resource: "UserRole", createdAt: new Date() },

      { id: 1, name: "create user department", action: "create", resource: "UserDepartment", createdAt: new Date() },
      { id: 1, name: "read user department", action: "read", resource: "UserDepartment", createdAt: new Date() },
      { id: 1, name: "update user department", action: "update", resource: "UserDepartment", createdAt: new Date() },
      { id: 1, name: "delete user department", action: "delete", resource: "UserDepartment", createdAt: new Date() },

      // request for leave management
      { id: 1, name: "create leave request", action: "create", resource: "LeaveRequest", createdAt: new Date() },
      { id: 1, name: "read leave request", action: "read", resource: "LeaveRequest", createdAt: new Date() },
      { id: 1, name: "update leave request", action: "update", resource: "LeaveRequest", createdAt: new Date() },
      { id: 1, name: "delete leave request", action: "delete", resource: "LeaveRequest", createdAt: new Date() },

      { id: 1, name: "create leave request review", action: "create", resource: "LeaveRequestReview", createdAt: new Date() },
      { id: 1, name: "read leave request review", action: "read", resource: "LeaveRequestReview", createdAt: new Date() },

      // organisation management
      { id: 1, name: "create department", action: "create", resource: "Department", createdAt: new Date() },
      { id: 1, name: "read department", action: "read", resource: "Department", createdAt: new Date() },
      { id: 1, name: "update department", action: "update", resource: "Department", createdAt: new Date() },
      { id: 1, name: "delete department", action: "delete", resource: "Department", createdAt: new Date() },

      // role & permission management
      { id: 1, name: "create permission", action: "create", resource: "Permission", createdAt: new Date() },
        { id: 1, name: "read permission", action: "read", resource: "Permission", createdAt: new Date() },
        { id: 1, name: "update permission", action: "update", resource: "Permission", createdAt: new Date() },
        { id: 1, name: "delete permission", action: "delete", resource: "Permission", createdAt: new Date() },

      { id: 1, name: "create role", action: "create", resource: "Role", createdAt: new Date() },
        { id: 1, name: "read role", action: "read", resource: "Role", createdAt: new Date() },
        { id: 1, name: "update role", action: "update", resource: "Role", createdAt: new Date() },
        { id: 1, name: "delete role", action: "delete", resource: "Role", createdAt: new Date() },

      { id: 1, name: "create role permission", action: "create", resource: "RolePermission", createdAt: new Date() },
        { id: 1, name: "read role permission", action: "read", resource: "RolePermission", createdAt: new Date() },
        { id: 1, name: "update role permission", action: "update", resource: "RolePermission", createdAt: new Date() },
        { id: 1, name: "delete role permission", action: "delete", resource: "RolePermission", createdAt: new Date() },

      // logging & auditing
        { id: 1, name: "read log", action: "read", resource: "Log", createdAt: new Date() },
      { id: 1, name: "delete log", action: "delete", resource: "Log", createdAt: new Date() },

      { id: 1, name: "read log permissions", action: "read", resource: "LogPermissions", createdAt: new Date() },
        { id: 1, name: "delete log permissions", action: "delete", resource: "LogPermissions", createdAt: new Date() },

      { id: 1, name: "read log users", action: "read", resource: "LogUsers", createdAt: new Date() },
        { id: 1, name: "delete log users", action: "delete", resource: "LogUsers", createdAt: new Date() },

      { id: 1, name: "read log roles", action: "read", resource: "LogRoles", createdAt: new Date() },
        { id: 1, name: "delete log roles", action: "delete", resource: "LogRoles", createdAt: new Date() },

      { id: 1, name: "read log leave requests", action: "read", resource: "LogLeaveRequests", createdAt: new Date() },
        { id: 1, name: "delete log leave requests", action: "delete", resource: "LogLeaveRequests", createdAt: new Date() },

      { id: 1, name: "read log departments", action: "read", resource: "LogDepartments", createdAt: new Date() },
        { id: 1, name: "delete log departments", action: "delete", resource: "LogDepartments", createdAt: new Date() },

  ];

  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(permissions);

  await db.insert(permissions).values(predefinedPermissions).onConflictDoNothing().execute();

  console.log("Permissions seeded");
}