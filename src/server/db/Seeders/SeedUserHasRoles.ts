
import { db } from "~/server/db";
import { userRoles } from "~/server/db/schema";

interface UserHasRoles {
  roleId: number;
  userId: string;
  assignedAt?: Date;
  id?: string;
}

export async function seedUserHasRoles() {
  const predefinedUserHasRoles: UserHasRoles[] = [
    { id: "1", roleId: 1, userId: "1", assignedAt: new Date() },
    { id: "2", roleId: 2, userId: "2", assignedAt: new Date()  },
  ];

  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(userRoles);

  await db.insert(userRoles).values(predefinedUserHasRoles).onConflictDoNothing().execute();

  console.log("userHasRoles seeded");
}