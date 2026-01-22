import { db } from "~/server/db";
import { sql } from "drizzle-orm";

export async function seedDelete() {
  await db.execute(sql`
    TRUNCATE TABLE
      "rolePermissions",
      "userRoles",
      "userDepartments",
      "requestForLeave",
      "session",
      "account",
      "user",
      "permissions",
      "roles",
      "departments",
      "verification",
      "logs"
    RESTART IDENTITY CASCADE;
  `);

  console.log("Delete ran");
}
