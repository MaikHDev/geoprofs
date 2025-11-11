import { auth } from "../../../../utils/auth";
import { db } from "~/server/db";
import { account, user } from "~/server/db/schema";
import {
  type AccountType,
  createAccount,
} from "../../../../utils/auth-actions";

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

export async function seedUsersAndAccounts() {


  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(user);
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(account);

  for (const u of users) {
    await createAccount(u);
  }

  console.log("Users and Accounts seeded");
}
