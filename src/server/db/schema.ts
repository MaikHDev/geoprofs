// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import { index, sqliteTable } from "drizzle-orm/sqlite-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const posts = sqliteTable(
  "post",
  (d) => ({
    id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    name: d.text({ length: 256 }),
    createdAt: d
      .integer({ mode: "timestamp" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
  }),
  (t) => [index("post_name_idx").on(t.name)],
);

export const user = sqliteTable(
  "user",
  (d) => ({
    id: d.text("id").primaryKey(),
    name: d.text("name").notNull(),
    email: d.text("email").notNull().unique(),
    emailVerified: d
      .integer("email_verified", { mode: "boolean" })
      .default(false)
      .notNull(),
    image: d.text("image"),
    createdAt: d
      .integer("created_at", { mode: "timestamp" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d
      .integer("updated_at", { mode: "timestamp" })
      .default(sql`CURRENT_TIMESTAMP`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  }),
  (t) => [index("user_name_idx").on(t.name), index("user_email_idx").on(t.email)],
);

export const session = sqliteTable("session", (d) => ({
  id: d.text("id").primaryKey(),
  expiresAt: d.integer("expires_at", { mode: "timestamp" }).notNull(),
  token: d.text("token").notNull().unique(),
  createdAt: d
    .integer("created_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: d
    .integer("updated_at", { mode: "timestamp" })
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: d.text("ip_address"),
  userAgent: d.text("user_agent"),
  userId: d
    .text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
}));

export const account = sqliteTable("account", (d) => ({
  id: d.text("id").primaryKey(),
  accountId: d.text("account_id").notNull(),
  providerId: d.text("provider_id").notNull(),
  userId: d
    .text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
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
    .integer("created_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: d
    .integer("updated_at", { mode: "timestamp" })
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
}));

export const verification = sqliteTable("verification", (d) => ({
  id: d.text("id").primaryKey(),
  identifier: d.text("identifier").notNull(),
  value: d.text("value").notNull(),
  expiresAt: d.integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: d
    .integer("created_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: d
    .integer("updated_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
}));
