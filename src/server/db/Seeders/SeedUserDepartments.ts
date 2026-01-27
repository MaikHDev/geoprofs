import { db } from "~/server/db";
import { user, userDepartments } from "~/server/db/schema";
import { desc } from "drizzle-orm";

export async function seedUserDepartments() {
  const users = await db
    .select({
      id: user.id,
    })
    .from(user).orderBy(desc(user.name))

  const predefinedDepartmentNames = ["Hoofd afdeling", "Zuster afdeling"];

  const predefinedDepartments: (typeof userDepartments.$inferInsert)[] = [];

  users.forEach((user, index) => {
    const idx = index % predefinedDepartmentNames.length;
    if (predefinedDepartmentNames[idx] && user.id) {
      predefinedDepartments.push({
        departmentName: predefinedDepartmentNames[idx],
        userId: user.id,
      });
    }
  });

  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(userDepartments);

  if (predefinedDepartments.length > 0) {
    await db
      .insert(userDepartments)
      .values(predefinedDepartments)
      .onConflictDoNothing()
      .execute();
    console.log("UserDepartments seeded");
  } else {
    console.log("No valid departments to insert");
  }
}
