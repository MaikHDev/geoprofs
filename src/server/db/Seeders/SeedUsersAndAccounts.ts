import { db } from "~/server/db";
import { account, user } from "~/server/db/schema";
import { type AccountType, insertUser } from "~/server/api/routers/userAccount";
import { auth } from "../../../../utils/auth";
import { eq } from "drizzle-orm";

export const users: AccountType[] = [
  {
    email: "admin@email.com",
    name: "Admin",
    lastName: "Account",
    password: "12345678",
    csn: "1236547582341",
    emailVerified: true,
  },
  {
    email: "officemanager@email.com",
    name: "Office Manager",
    lastName: "Account",
    password: "12345678",
    csn: "1236547582341",
    emailVerified: true,
  },
  {
    vacationDays: 30,
    email: "manager@email.com",
    name: "Manager",
    lastName: "Account",
    password: "12345678",
    csn: "1236547582341",
    emailVerified: true,
  },
  {
    vacationDays: 30,
    email: "employee@email.com",
    name: "Employee",
    lastName: "Account",
    password: "12345678",
    csn: "1236547582341",
    emailVerified: true,
  },
  {
    email: "admin2@email.com",
    name: "Admin 2",
    lastName: "Account",
    password: "12345678",
    csn: "1236547582341",
    emailVerified: true,
  },
  {
    email: "officemanager2@email.com",
    name: "Office Manager 2",
    lastName: "Account",
    password: "12345678",
    csn: "1236547582341",
    emailVerified: true,
  },
  {
    vacationDays: 30,
    email: "manager2@email.com",
    name: "Manager 2",
    lastName: "Account",
    password: "12345678",
    csn: "1236547582341",
    emailVerified: true,
  },
  {
    vacationDays: 30,
    email: "employee2@email.com",
    name: "Employee 2",
    lastName: "Account",
    password: "12345678",
    csn: "1236547582341",
    emailVerified: true,
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
  await insertUser({ creator: u.id!, input: u });
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
