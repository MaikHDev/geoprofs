
import { db } from "~/server/db";
import { user } from "~/server/db/schema";

interface User {
  name: string;
  email: string;
  emailVerified?: boolean;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
  superVisor?: string;
  id?: string;
}

export async function seedUsers() {
  const predefinedUsers: User[] = [
    { id: "1", name: "name", email: "email1@email.nl", emailVerified: true, createdAt: new Date(), updatedAt: new Date(), superVisor: "1", image: "1" },
    { id: "2", name: "name", email: "email2@email.nl", emailVerified: true, createdAt: new Date(), updatedAt: new Date(), superVisor: "1", image: "1" },
    { id: "3", name: "name", email: "email3@email.nl", emailVerified: true, createdAt: new Date(), updatedAt: new Date(), superVisor: "1", image: "1" },
    { id: "4", name: "name", email: "email4@email.nl", emailVerified: true, createdAt: new Date(), updatedAt: new Date(), superVisor: "1", image: "1" },
  ];

  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(user);

  await db.insert(user).values(predefinedUsers).onConflictDoNothing().execute();

  console.log("users seeded");
}