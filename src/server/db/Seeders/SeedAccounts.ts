import { account, } from "~/server/db/schema";
import { db } from "~/server/db";

interface Account {
  id: string;
  accountId: string;
  providerId: string;
  userId: string;
  access_token?: string;
  refresh_token?: string;
  id_token?: string;
  access_token_expires_at?: Date;
  refresh_token_expires_at?: Date;
  scope?: string;
  password?: string;
  csn?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function seedAccounts() {
  const predefinedAccounts: Account[] = [
    { id: "1", accountId: "1", providerId: "credential", userId: "1", password: "12345678", createdAt: new Date(), updatedAt: new Date() },
    { id: "2", accountId: "2", providerId: "credential", userId: "2", password: "12345678", createdAt: new Date(), updatedAt: new Date() },
    { id: "3", accountId: "3", providerId: "credential", userId: "3", password: "12345678", createdAt: new Date(), updatedAt: new Date() },
  ];

  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(account);

  await db.insert(account).values(predefinedAccounts).onConflictDoNothing().execute();

  console.log("Accounts seeded");
}