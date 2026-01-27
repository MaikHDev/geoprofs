import { db } from "~/server/db";
import { departments, roles, user, userRoles } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function seedDepartments() {
  const managers = await db
    .select({
      id: user.id,
    })
    .from(userRoles)
    .leftJoin(user, eq(user.email, userRoles.userEmail))
    .leftJoin(roles, eq(roles.id, userRoles.roleId))
    .where(eq(roles.roleName, "Manager"));

  if (!managers || managers.length === 0) {
    return console.log(
      "Can't seed, there are no managers to assign to the departments",
    );
  }

  const predefinedDepartmentNames = [
    "Hoofd afdeling",
    "Zuster afdeling",
    "Losse afdeling",
    "Verkeerde afdeling",
  ];

  const predefinedDepartments: (typeof departments.$inferInsert)[] = [];

  managers.forEach((manager, index) => {
    if (predefinedDepartmentNames[index] && manager.id) {
      predefinedDepartments.push({
        name: predefinedDepartmentNames[index],
        superVisor: manager.id,
      });
    }
  });

  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(departments);

  if (predefinedDepartments.length > 0) {
    await db
      .insert(departments)
      .values(predefinedDepartments)
      .onConflictDoNothing()
      .execute();
    console.log("Departments seeded");
  } else {
    console.log("No valid departments to insert");
  }
}
