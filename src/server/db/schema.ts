import {pgTable, text, timestamp, index, primaryKey, pgEnum} from "drizzle-orm/pg-core";
import {sql} from "drizzle-orm";
import {relations} from "drizzle-orm/relations";

export const Actions = pgEnum("Actions", [
    "create",
    "read",
    "update",
    "delete",
]);

export const ReasonsForLeave = pgEnum("ReasonsForLeave", [
    "vacation",
    "personal",
    "medical",
    "extra",
]);

export const Statuses = pgEnum("Statuses", [
    "pending",
    "approved",
    "renewal",
    "denied",
]);

export const posts = pgTable(
    "post",
    (d) => ({
        id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
        name: d.varchar({length: 255}),
        createdAt: d
            .timestamp({withTimezone: true})
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: d
            .timestamp({withTimezone: true})
            .$onUpdate(() => new Date())
            .notNull(),
    }),
);

export const user = pgTable("user", (d) => ({
    id: d.text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: d.varchar({length: 100}).notNull(),
    email: d.varchar({length: 255}).notNull().unique(),
    emailVerified: d.boolean().default(false).notNull(),
    image: d.text(),
    createdAt: d.timestamp().defaultNow().notNull(),
    updatedAt: d.timestamp()
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
    supervisor: d.text(),
}));

export const userRelations = relations(user, ({many, one}) => ({
    userRoles: many(userRoles),
    sessions: many(session),
    supervisors: many(user, {relationName: "usersSupervisor"}),

    userSupervisor: one(user, {
        fields: [user.supervisor],
        references: [user.id],
        relationName: "usersSupervisor"
    }),

    account: one(account, {fields: [user.id], references: [account.userId]}),
}))

export const roles = pgTable("roles", (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    roleName: d.varchar({length: 50}).notNull(),
    description: d.text(),
    createdAt: d
        .timestamp({withTimezone: true})
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: d.timestamp({withTimezone: true}).$onUpdate(() => new Date()),
    isActive: d.boolean(),
}));
export const rolesRelations = relations(roles, ({many}) => ({
    userRole: many(userRoles),
    rolePermission: many(rolePermissions),
}));

export const userRoles = pgTable(
    "userRoles",
    (d) => ({
        roleId: d
            .integer()
            .notNull()
            .references(() => roles.id),
        userId: d
            .varchar({length: 255})
            .notNull()
            .unique()
            .references(() => user.id),
        assignedAt: d
            .timestamp({withTimezone: true})
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
    }),
    (t) => [
        primaryKey({columns: [t.roleId, t.userId]}),
        index().on(t.roleId),
        index().on(t.userId),
    ],
);
export const userRolesRelations = relations(userRoles, ({one}) => ({
    role: one(roles, {fields: [userRoles.roleId], references: [roles.id]}),
    user: one(user, {fields: [userRoles.userId], references: [user.id]}),
}));

export const permissions = pgTable("permissions", (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({length: 30}).notNull().unique(),
    resource: d.varchar({length: 30}).notNull(),
    action: Actions("action").notNull(),
    description: d.text(),
    createdAt: d
        .timestamp({withTimezone: true})
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
}));
export const permissionRelations = relations(permissions, ({many}) => ({
    rolePermission: many(rolePermissions),
}));

export const rolePermissions = pgTable(
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
            .timestamp({withTimezone: true})
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
    }),
    (t) => [
        primaryKey({columns: [t.roleId, t.permissionId]}),
        t.roleId,
        t.permissionId,
    ],
);
export const rolePermissionsRelations = relations(
    rolePermissions,
    ({one}) => ({
        role: one(roles, {
            fields: [rolePermissions.roleId],
            references: [roles.id],
        }),
        permission: one(permissions, {
            fields: [rolePermissions.permissionId],
            references: [permissions.id],
        }),
    }),
);

export const session = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, {onDelete: "cascade"}),
});

export const account = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, {onDelete: "cascade"}),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    csn: text("csn"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
});

export const verification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
});

export const requestForLeave = pgTable("requestForLeave", (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    userId: text().notNull().references(() => user.id),
    subject: d.varchar({length: 100}).notNull(),
    reasonOfLeave: ReasonsForLeave().notNull(),
    status: Statuses().notNull().default('pending'),
    dateLeaveStart: d.timestamp().notNull(),
    dateLeaveEnd: d.timestamp().notNull(),
    reasoning: d.text().notNull(),
    feedback: d.text(),
    reviewer: d.text().notNull().references(() => user.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
}));

export const usersTimeOff = pgTable("usersTimeOff",
    (d) => ({
        userId: d.text().notNull().references(() => user.id).primaryKey(),
        vacationDays: d.integer().notNull().default(0),
        vacationDaysLeft: d.integer().notNull().default(0),
        sickDaysOff: d.integer().notNull().default(0),
        personalDaysOff: d.integer().notNull().default(0),
        updatedAt: timestamp()
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    }),
    (t) => [
        index().on(t.vacationDays),
        index().on(t.vacationDaysLeft),
        index().on(t.sickDaysOff),
        index().on(t.personalDaysOff),
    ]
);

export const departments = pgTable("departments",
    (d) => ({
        name: d.varchar({length: 50}).primaryKey(),
        startupDate: d.timestamp()
            .defaultNow()
            .notNull(),
    })
);

export const departmentsRelations = relations(departments, ({many}) => ({
    userDepartments: many(userDepartments),
}));

export const userDepartments = pgTable("userDepartments", (d) => ({
        userId: d.text().references(() => user.id),
        departmentName: d.varchar({length: 50}).references(() => departments.name),
        joinedAt: d.timestamp()
            .defaultNow()
            .notNull(),
    }),
    (t) => [
        primaryKey({columns: [t.userId, t.departmentName]})
    ]
);

export const userDepartmentsRelations = relations(userDepartments, ({one}) => ({
    user: one(user, {
        fields: [userDepartments.userId],
        references: [user.id]
    }),
    department: one(departments, {
        fields: [userDepartments.departmentName],
        references: [departments.name]
    }),
}));