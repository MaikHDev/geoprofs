import { db } from "~/server/db";
import { user, userRoles } from "~/server/db/schema";
import { eq } from "drizzle-orm";

interface UserHasRoles {
  roleId: number;
  userEmail: string;
  assignedAt?: Date;
  id?: string;
}

export async function seedUserHasRoles() {
  // Get user IDs by email
  const adminUser = await db
    .select()
    .from(user)
    .where(eq(user.email, "admin@email.com"));
  const officeManagerUser = await db
    .select()
    .from(user)
    .where(eq(user.email, "office-manager@email.com"));
  const managerUser = await db
    .select()
    .from(user)
    .where(eq(user.email, "manager@email.com"));
  const employee1User = await db
    .select()
    .from(user)
    .where(eq(user.email, "employee1@email.com"));
  const employee2User = await db
    .select()
    .from(user)
    .where(eq(user.email, "employee2@email.com"));

  const predefinedUserHasRoles: UserHasRoles[] = [];

  // Assign roles to users
  if (adminUser[0]) {
    predefinedUserHasRoles.push({ roleId: 1, userEmail: adminUser[0].email });
  }

  if (officeManagerUser[0]) {
    predefinedUserHasRoles.push({
      roleId: 2,
      userEmail: officeManagerUser[0].email,
    });
  }

  if (managerUser[0]) {
    predefinedUserHasRoles.push({ roleId: 3, userEmail: managerUser[0].email });
  }

  if (employee1User[0]) {
    predefinedUserHasRoles.push({
      roleId: 4,
      userEmail: employee1User[0].email,
    });
  }

  if (employee2User[0]) {
    predefinedUserHasRoles.push({
      roleId: 4,
      userEmail: employee2User[0].email,
    });
  }

  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(userRoles);

  if (predefinedUserHasRoles.length > 0) {
    await db
      .insert(userRoles)
      .values(predefinedUserHasRoles)
      .onConflictDoNothing()
      .execute();
  }

  console.log(
    `User Roles seeded: ${predefinedUserHasRoles.length} assignments created`,
  );
}
