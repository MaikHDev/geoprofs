import { db } from "~/server/db";
import { account, user } from "~/server/db/schema";
import { type AccountType, insertUser } from "~/server/api/routers/userAccount";
import { auth } from "../../../../utils/auth";
import { eq } from "drizzle-orm";

export const users: AccountType[] = [
  {
    vacationDays: 30,
    email: "john@email.com",
    name: "John",
    lastName: "Doe",
    password: "12345678",
    csn: "1236547582341",
  },
  {
    vacationDays: 30,
    email: "klaas@email.com",
    name: "Klaas",
    lastName: "Klaassen",
    password: "12345678",
    csn: "1236547582341",
  },
  {
    vacationDays: 30,
    email: "piet@email.com",
    name: "John",
    lastName: "pieters",
    password: "12345678",
    csn: "1236547582341",
  },
];

async function createUser(u: AccountType) {
  const context = await auth.$context;
  u.password = await context.password.hash(u.password);

  const [existingUser] = await db
    .selectDistinct()
    .from(user)
    .where(eq(user.email, u.email));

  if (existingUser) {
    console.log("A user already exists with that email");
    return;
  }
  await insertUser(u);
}

export async function seedUsersAndAccounts() {
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(user);
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(account);

  for (const u of users) {
    await createUser(u);
  }

  console.log("Users and Accounts seeded");
}
