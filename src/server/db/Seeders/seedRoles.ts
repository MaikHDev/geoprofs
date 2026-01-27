import { roles } from "~/server/db/schema";
import { db } from "~/server/db";
import type {InferInsertModel} from "drizzle-orm";

type Role = InferInsertModel<typeof roles>;

export async function seedRoles() {
  const predefinedRoles: Role[] = [
    { roleName: "Admin", description: "Administrator with full access" },
    { roleName: "OfficeManager", description: "Office Manager with elevated access" },
    { roleName: "Manager", description: "Manager with limited access" },
    { roleName: "Employee",  description: "Regular employee with standard access" },
  ];

  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(roles);

  await db.insert(roles).values(predefinedRoles).onConflictDoNothing().execute();

  console.log("Roles seeded");
}