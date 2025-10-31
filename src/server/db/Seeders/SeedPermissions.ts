import { permissions } from "~/server/db/schema";
import { db } from "~/server/db";
import type {InferInsertModel} from "drizzle-orm";

type Permission = InferInsertModel<typeof permissions>;

export async function seedPermissions() {
    const predefinedPermissions: Permission[] = [

        // user management
        { name: "create user credentials", action: "create", resource: "UserCredentials" },
        { name: "read user credentials", action: "read", resource: "UserCredentials" },
        { name: "update user credentials", action: "update", resource: "UserCredentials" },
        { name: "delete user credentials", action: "delete", resource: "UserCredentials" },

        { name: "create user profile", action: "create", resource: "UserProfile" },
        { name: "read user profile", action: "read", resource: "UserProfile" },
        { name: "update user profile", action: "update", resource: "UserProfile" },
        { name: "delete user profile", action: "delete", resource: "UserProfile" },

        { name: "create user role", action: "create", resource: "UserRole" },
        { name: "read user role", action: "read", resource: "UserRole" },
        { name: "update user role", action: "update", resource: "UserRole" },
        { name: "delete user role", action: "delete", resource: "UserRole" },

        { name: "create user department", action: "create", resource: "UserDepartment" },
        { name: "read user department", action: "read", resource: "UserDepartment" },
        { name: "update user department", action: "update", resource: "UserDepartment" },
        { name: "delete user department", action: "delete", resource: "UserDepartment" },

        // request for leave management
        { name: "create leave request", action: "create", resource: "LeaveRequest" },
        { name: "read leave request", action: "read", resource: "LeaveRequest" },
        { name: "update leave request", action: "update", resource: "LeaveRequest" },
        { name: "delete leave request", action: "delete", resource: "LeaveRequest" },

        { name: "create leave request review", action: "create", resource: "LeaveRequestReview" },
        { name: "read leave request review", action: "read", resource: "LeaveRequestReview" },

        // organisation management
        { name: "create department", action: "create", resource: "Department" },
        { name: "read department", action: "read", resource: "Department" },
        { name: "update department", action: "update", resource: "Department" },
        { name: "delete department", action: "delete", resource: "Department" },

        // role & permission management
        { name: "create permission", action: "create", resource: "Permission" },
        { name: "read permission", action: "read", resource: "Permission" },
        { name: "update permission", action: "update", resource: "Permission" },
        { name: "delete permission", action: "delete", resource: "Permission" },

        { name: "create role", action: "create", resource: "Role" },
        { name: "read role", action: "read", resource: "Role" },
        { name: "update role", action: "update", resource: "Role" },
        { name: "delete role", action: "delete", resource: "Role" },

        { name: "create role permission", action: "create", resource: "RolePermission" },
        { name: "read role permission", action: "read", resource: "RolePermission" },
        { name: "update role permission", action: "update", resource: "RolePermission" },
        { name: "delete role permission", action: "delete", resource: "RolePermission" },

        // logging & auditing
        { name: "read log", action: "read", resource: "Log" },
        { name: "delete log", action: "delete", resource: "Log" },

        { name: "read log permissions", action: "read", resource: "LogPermissions" },
        { name: "delete log permissions", action: "delete", resource: "LogPermissions" },

        { name: "read log users", action: "read", resource: "LogUsers" },
        { name: "delete log users", action: "delete", resource: "LogUsers" },

        { name: "read log roles", action: "read", resource: "LogRoles" },
        { name: "delete log roles", action: "delete", resource: "LogRoles" },

        { name: "read log leave requests", action: "read", resource: "LogLeaveRequests" },
        { name: "delete log leave requests", action: "delete", resource: "LogLeaveRequests" },

        { name: "read log departments", action: "read", resource: "LogDepartments" },
        { name: "delete log departments", action: "delete", resource: "LogDepartments" },
    ];

    // eslint-disable-next-line drizzle/enforce-delete-with-where
    await db.delete(permissions);

    await db.insert(permissions).values(predefinedPermissions).onConflictDoNothing().execute();

    console.log("Permissions seeded");
}