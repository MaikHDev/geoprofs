import { db } from "~/server/db";
import { userRoles } from "~/server/db/schema";

interface UserHasRoles {
  roleId: number;
  userEmail: string;
  assignedAt?: Date;
  id?: string;
}

export async function seedUserHasRoles() {
  const predefinedUserHasRoles: UserHasRoles[] = [
    { id: "1", roleId: 1, userEmail: "email1@email.com", assignedAt: new Date() },
    { id: "2", roleId: 2, userEmail: "email2@email.com", assignedAt: new Date()  },
  ];

  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(userRoles);

  await db.insert(userRoles).values(predefinedUserHasRoles).onConflictDoNothing().execute();

  console.log("userHasRoles seeded");
}