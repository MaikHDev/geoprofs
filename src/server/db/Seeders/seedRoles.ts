import { roles } from "~/server/db/schema";
import { db } from "~/server/db";

interface Role {
  id: number;
  roleName: string;
  description: string;
}

export async function seedRoles() {
  const predefinedRoles: Role[] = [
    { id: 1, roleName: "Admin", description: "test" },
    { id: 2, roleName: "Office-Manager", description: "test" },
    { id: 3, roleName: "Manager", description: "test" },
    { id: 4, roleName: "Employee", description: "test" },
  ];

  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(roles);

  await db
    .insert(roles)
    .values(predefinedRoles)
    .onConflictDoNothing()
    .execute();

  console.log("Roles seeded");
}
