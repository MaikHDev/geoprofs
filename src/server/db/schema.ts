import {
  pgTable,
  text,
  timestamp,
  index,
  primaryKey,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";
import { type InferSelectModel, sql } from "drizzle-orm";

export const Actions = pgEnum("Actions", [
  "create",
  "read",
  "update",
  "delete",
]);

export const ReasonsForLeave = pgEnum("ReasonsForLeave", [
  "leave",
  "personal",
  "medical",
  "extra",
]);

export const Statuses = pgEnum("Statuses", [
  "pending",
  "opened",
  "approved",
  "renewal",
  "denied",
]);

export const LogEvents = pgEnum("LogEvents", [
  "created",
  "changed",
  "assigned",
  "deleted",
  "logged_in",
]);

export const LogContext = pgEnum("LogContext", [
  "permissions",
  "users",
  "roles",
  "leave_requests",
  "departments",
]);

export const user = pgTable("user", (d) => ({
  id: d
    .text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 100 }).notNull(),
  lastName: d.varchar({ length: 100 }),
  email: d.varchar({ length: 255 }).notNull().unique(),
  emailVerified: d.boolean().default(false).notNull(),
  image: d.text(),
  createdAt: d.timestamp().defaultNow().notNull(),
  updatedAt: d
    .timestamp()
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  vacationDays: d.integer(),
}));

export const userRelations = relations(user, ({ many, one }) => ({
  userRoles: many(userRoles),
  sessions: many(session),

  account: one(account, { fields: [user.id], references: [account.userId] }),
  departmentSupervisor: one(departments, {
    fields: [user.id],
    references: [departments.superVisor],
  }),
}));

export const roles = pgTable("roles", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  roleName: d.varchar({ length: 50 }).notNull(),
  description: d.text(),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));
export const rolesRelations = relations(roles, ({ many }) => ({
  userRole: many(userRoles),
  rolePermission: many(rolePermissions),
}));

export const userRoles = pgTable(
  "userRoles",
  (d) => ({
    roleId: d
      .integer()
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    userEmail: d
      .varchar({ length: 255 })
      .notNull()
      .unique()
      .references(() => user.email, { onDelete: "cascade" }),
    assignedAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [
    primaryKey({ columns: [t.roleId, t.userEmail] }),
    index().on(t.roleId),
    index().on(t.userEmail),
  ],
);
export const userRolesRelations = relations(userRoles, ({ one }) => ({
  role: one(roles, { fields: [userRoles.roleId], references: [roles.id] }),
  user: one(user, { fields: [userRoles.userEmail], references: [user.email] }),
}));

export const permissions = pgTable(
  "permissions",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    resource: d.varchar({ length: 30 }).notNull(),
    action: Actions("action").notNull(),
    description: d.text(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [unique().on(t.resource, t.action)],
);
export const permissionRelations = relations(permissions, ({ many }) => ({
  rolePermission: many(rolePermissions),
}));

export const rolePermissions = pgTable(
  "rolePermissions",
  (d) => ({
    roleId: d
      .integer()
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: d
      .integer()
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
    assignedAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [
    primaryKey({ columns: [t.roleId, t.permissionId] }),
    t.roleId,
    t.permissionId,
  ],
);
export const rolePermissionsRelations = relations(
  rolePermissions,
  ({ one }) => ({
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
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
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
  id: d.integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: d
    .text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  reasonOfLeave: ReasonsForLeave().notNull(),
  status: Statuses().notNull().default("pending"),
  dateLeaveStart: d.timestamp().notNull(),
  dateLeaveEnd: d.timestamp().notNull(),
  reasoning: d.text().notNull(),
  feedback: d.text(),
  reviewer: d.text().references(() => user.id, { onDelete: "set null" }),
  createdAt: d.timestamp("created_at").defaultNow().notNull(),
  updatedAt: d
    .timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
}));

export const requestForLeaveRelations = relations(
  requestForLeave,
  ({ one }) => ({
    user: one(user, {
      fields: [requestForLeave.userId],
      references: [user.id],
    }),
    reviewer: one(user, {
      fields: [requestForLeave.userId],
      references: [user.id],
    }),
  }),
);

export const departments = pgTable("departments", (d) => ({
  name: d.varchar({ length: 50 }).primaryKey(),
  startupDate: d.timestamp().defaultNow().notNull(),
  superVisor: d
    .text()
    .notNull()
    .references(() => user.id),
}));

export const departmentsRelations = relations(departments, ({ many, one }) => ({
  userDepartments: many(userDepartments),
  superVisor: one(user, {
    fields: [departments.superVisor],
    references: [user.id],
  }),
}));

export const userDepartments = pgTable(
  "userDepartments",
  (d) => ({
    userId: d.text().references(() => user.id, { onDelete: "cascade" }),
    departmentName: d
      .varchar({ length: 50 })
      .references(() => departments.name, { onDelete: "cascade" }),
    joinedAt: d.timestamp().defaultNow().notNull(),
  }),
  (t) => [primaryKey({ columns: [t.userId, t.departmentName] })],
);

export const userDepartmentsRelations = relations(
  userDepartments,
  ({ one }) => ({
    user: one(user, {
      fields: [userDepartments.userId],
      references: [user.id],
    }),
    department: one(departments, {
      fields: [userDepartments.departmentName],
      references: [departments.name],
    }),
  }),
);

type logContext = {
  users: InferSelectModel<typeof user>;
  roles: InferSelectModel<typeof roles>;
  permissions: InferSelectModel<typeof permissions>;
  leave_requests: InferSelectModel<typeof requestForLeave>;
  departments: InferSelectModel<typeof departments>;
};

export type LogsDetails =
    | { context: "users"; before?: Partial<logContext["users"]>; after?: Partial<logContext["users"]>; }
    | { context: "roles"; before?: Partial<logContext["roles"]>; after?: Partial<logContext["roles"]>; }
    | { context: "permissions"; before?: Partial<logContext["permissions"]>; after?: Partial<logContext["permissions"]>; }
    | { context: "leave_requests"; before?: Partial<logContext["leave_requests"]>; after?: Partial<logContext["leave_requests"]>; }
    | { context: "departments"; before?: Partial<logContext["departments"]>; after?: Partial<logContext["departments"]>; };

export const logs = pgTable("logs", (d) => ({
  id: d.bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  userId: d
    .text("userId")
    .notNull()
    .references(() => user.id),
  logEvent: LogEvents().notNull(),
  logContext: LogContext().notNull(),
  createdAt: d.timestamp("created_at").defaultNow().notNull(),
  details: d.jsonb("details").$type<LogsDetails>(),
}));

export const logsRelations = relations(logs, ({ one }) => ({
  user: one(user, { fields: [logs.userId], references: [user.id] }),
}));
