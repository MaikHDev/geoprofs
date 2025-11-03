import { db } from "~/server/db";
import { userRoles } from "~/server/db/schema";
import type { InferInsertModel } from "drizzle-orm";

type UserHasRoles = InferInsertModel<typeof userRoles>;

export async function seedUserHasRoles() {
  const predefinedUserHasRoles: UserHasRoles[] = [
    { roleId: 1, userEmail: "email1@email.com", assignedAt: new Date() },
    { roleId: 2, userEmail: "email2@email.com", assignedAt: new Date()  },
  ];

  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(userRoles);

  await db.insert(userRoles).values(predefinedUserHasRoles).onConflictDoNothing().execute();

  console.log("userHasRoles seeded");
}