import { auth } from "../../../../utils/auth";
import { db } from "~/server/db";
import { account, user, } from "~/server/db/schema";

interface User {
  email: string;
  name: string;
  password: string;
}

export async function seedUsersAndAccounts() {
  const users: User[] = [
    { email: "email1@email.com", name: "User 1", password: "12345678" },
    { email: "email2@email.com", name: "User 2", password: "12345678" },
    { email: "email3@email.com", name: "User 3", password: "12345678" },
  ];

  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(user);
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(account);


  for (const u of users) {
    await auth.api.signUpEmail({
      body: { email: u.email, password: u.password, name: u.name },
    });
  }

  console.log("Users and Accounts seeded");
}
