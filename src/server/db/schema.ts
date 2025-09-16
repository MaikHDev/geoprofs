// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import {sql} from "drizzle-orm";
import {index, sqliteTable} from "drizzle-orm/sqlite-core";
import {relations} from "drizzle-orm/relations";
import {primaryKey} from "drizzle-orm/sqlite-core/primary-keys";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const posts = sqliteTable(
    "post",
    (d) => ({
        id: d.integer({mode: "number"}).primaryKey({autoIncrement: true}),
        name: d.text({length: 256}),
        createdAt: d
            .integer({mode: "timestamp"})
            .default(sql`(strftime('%s','now'))`)
            .notNull(),
        updatedAt: d.integer({mode: "timestamp"}).$onUpdate(() => new Date()),
    }),
    (t) => [index("post_name_idx").on(t.name)],
);

export const user = sqliteTable(
    "user",
    (d) => ({
        id: d.text("id").primaryKey(),
        name: d.text("name").notNull(),
        lastName: d.text("last_name").notNull(),
        email: d.text("email").notNull().unique(),
        emailVerified: d
            .integer("email_verified", {mode: "boolean"})
            .default(false)
            .notNull(),
        image: d.text("image"),
        createdAt: d
            .integer("created_at", {mode: "timestamp"})
            .default(sql`(strftime('%s','now'))`)
            .notNull(),
        updatedAt: d
            .integer("updated_at", {mode: "timestamp"})
            .default(sql`(strftime('%s','now'))`)
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
        supervisor: d.text("supervisor"),

    }),
    (t) => [
        index("user_name_idx").on(t.name),
        index("user_email_idx").on(t.email)
    ],
);

export const userRelations = relations(user, ({one, many}) => ({
    user: one(user, {
        fields: [user.supervisor],
        references: [user.id],
        relationName: "userSupervisor",
    }),
    account: one(account, {
        fields: [user.id],
        references: [account.userId],
    }),

    supervisor: many(user, {relationName: "userSupervisor"}),
}));

export const roles = sqliteTable("roles", (d) => ({
    id: d.integer().primaryKey(),
    roleName: d.text().notNull(),
    description: d.text(),
    createdAt: d
        .integer()
        .default(sql`(strftime('%s','now'))`)
        .notNull(),
    updatedAt: d.integer("updated_at", {mode: "timestamp"})
        .default(sql`(strftime('%s','now'))`)
        .$onUpdate(() => /* @__PURE__ */ new Date()),
    isActive: d.integer().default(1), // store 0/1
}));

export const rolesRelations = relations(roles, ({many}) => ({
    userRole: many(userRoles),
    rolePermission: many(rolePermissions),
}));

// UserRoles
export const userRoles = sqliteTable(
    "userRoles",
    (d) => ({
        roleId: d
            .integer()
            .notNull()
            .references(() => roles.id),
        userId: d
            .text()
            .notNull()
            .unique()
            .references(() => user.id),
        assignedAt: d
            .integer()
            .default(sql`(strftime('%s','now'))`)
            .notNull(),
    }),
    (t) => [
        primaryKey({columns: [t.roleId, t.userId]}),
        index("role_id_idx").on(t.roleId),
        index("user_id_idx").on(t.userId),
    ]
);

export const userRolesRelations = relations(userRoles, ({one}) => ({
    role: one(roles, {fields: [userRoles.roleId], references: [roles.id]}),
    user: one(user, {fields: [userRoles.userId], references: [user.id]}),
}));

// Permissions
export const permissions = sqliteTable("permissions", (d) => ({
    id: d.integer().primaryKey(),
    name: d.text().notNull().unique(),
    resource: d.text().notNull(),
    action: d.text().notNull(), // replace Actions enum with TEXT
    description: d.text(),
    createdAt: d
        .integer()
        .default(sql`(strftime('%s','now'))`)
        .notNull(),
}));

export const permissionRelations = relations(permissions, ({many}) => ({
    rolePermission: many(rolePermissions),
}));

// RolePermissions
export const rolePermissions = sqliteTable(
    "rolePermissions",
    (d) => ({
        roleId: d
            .integer()
            .notNull()
            .references(() => roles.id),
        permissionId: d
            .integer()
            .notNull()
            .references(() => permissions.id),
        assignedAt: d
            .integer()
            .default(sql`(strftime('%s','now'))`)
            .notNull(),
    }),
    (t) => [primaryKey({columns: [t.roleId, t.permissionId]})]
);

export const rolePermissionsRelations = relations(rolePermissions, ({one}) => ({
    role: one(roles, {fields: [rolePermissions.roleId], references: [roles.id]}),
    permission: one(permissions, {
        fields: [rolePermissions.permissionId],
        references: [permissions.id],
    }),
}));

export const session = sqliteTable("session", (d) => ({
    id: d.text("id").primaryKey(),
    expiresAt: d.integer("expires_at", {mode: "timestamp"}).notNull(),
    token: d.text("token").notNull().unique(),
    createdAt: d
        .integer("created_at", {mode: "timestamp"})
        .default(sql`(strftime('%s','now'))`)
        .notNull(),
    updatedAt: d
        .integer("updated_at", {mode: "timestamp"})
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
    ipAddress: d.text("ip_address"),
    userAgent: d.text("user_agent"),
    userId: d
        .text("user_id")
        .notNull()
        .references(() => user.id, {onDelete: "cascade"}),
}));

export const account = sqliteTable("account", (d) => ({
    id: d.text("id").primaryKey(),
    accountId: d.text("account_id").notNull(),
    providerId: d.text("provider_id").notNull(),
    userId: d
        .text("user_id")
        .notNull()
        .references(() => user.id, {onDelete: "cascade"}),
    accessToken: d.text("access_token"),
    refreshToken: d.text("refresh_token"),
    idToken: d.text("id_token"),
    accessTokenExpiresAt: d.integer("access_token_expires_at", {
        mode: "timestamp",
    }),
    refreshTokenExpiresAt: d.integer("refresh_token_expires_at", {
        mode: "timestamp",
    }),
    scope: d.text("scope"),
    password: d.text("password"),
    createdAt: d
        .integer("created_at", {mode: "timestamp"})
        .default(sql`(strftime('%s','now'))`)
        .notNull(),
    updatedAt: d
        .integer("updated_at", {mode: "timestamp"})
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
}));
export const accountRelations = relations(account, ({one}) => ({
    user: one(user, {
        fields: [account.userId],
        references: [user.id],
    }),
}));

export const verification = sqliteTable("verification", (d) => ({
    id: d.text("id").primaryKey(),
    identifier: d.text("identifier").notNull(),
    value: d.text("value").notNull(),
    expiresAt: d.integer("expires_at", {mode: "timestamp"}).notNull(),
    createdAt: d
        .integer("created_at", {mode: "timestamp"})
        .default(sql`(strftime('%s','now'))`)
        .notNull(),
    updatedAt: d
        .integer("updated_at", {mode: "timestamp"})
        .default(sql`(strftime('%s','now'))`)
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
}));

export const requestForLeave = sqliteTable("requestForLeave", (d) => ({
    id: d.text().primaryKey(),
    userId: d
        .text()
        .notNull()
        .unique()
        .references(() => user.id),
    subject: d.text().notNull(),
    // reasonOfLeave: d
    createdAt: d
        .integer("created_at", {mode: "timestamp"})
        .default(sql`(strftime('%s','now'))`)
        .notNull(),
    updatedAt: d
        .integer("updated_at", {mode: "timestamp"})
        .default(sql`(strftime('%s','now'))`)
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
}));


