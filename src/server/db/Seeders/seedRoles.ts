import { roles } from "~/server/db/schema";
import { db } from "~/server/db";
import type {InferInsertModel} from "drizzle-orm";

type Role = InferInsertModel<typeof roles>;


export async function seedRoles() {
  const predefinedRoles: Role[] = [
    { roleName: "Admin", description: "test" },
    { roleName: "Werkgever", description: "test" },
    { roleName: "Werknemer", description: "test" },
  ];

  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(roles);

  await db.insert(roles).values(predefinedRoles).onConflictDoNothing().execute();

  console.log("Roles seeded");
}
