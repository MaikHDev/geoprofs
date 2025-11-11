"use server";

import { auth } from "./auth";
import { headers } from "next/headers";
import { logAction } from "./log-handle";
import { eq, type InferInsertModel } from "drizzle-orm";
import { account, user } from "~/server/db/schema";
import { db } from "~/server/db";
import { loadUserPermissionSet } from "~/server/auth/permission";
import type { PermissionKey } from "~/shared/permissions";
import { users } from "~/server/db/Seeders/SeedUsersAndAccounts";

export async function getUserSession() {
  return await auth.api.getSession({ headers: await headers() });
}

export async function signUp(name: string, email: string, password: string) {
  return await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
      callbackURL: "/signup",
    },
  });
}

export type AccountType = Omit<
  InferInsertModel<typeof user>,
  "createdAt" | "updatedAt" | "id"
> & {
  password: string;
  csn: string;
};

export async function createAccount(acc: AccountType) {
  const context = await auth.$context;
  acc.password = await context.password.hash(acc.password);

  const existingUsers = await db.selectDistinctOn([user.email]).from(user);

  // I know this is terrible, but you need a user to create one in theory. So this is for bypassing the seeder, to create new users.
  if (existingUsers.length > users.length) {
    const s = await getUserSession();
    if (!s?.user) {
      return {
        error: "You may not create a new user",
      };
    }

    const perms = await loadUserPermissionSet(acc.email);
    const hasPerms = (key: PermissionKey) => perms.has(key);

    if (!hasPerms("UserUseOthers.create")) {
      return {
        error:
          "You do not have the required permissions for creating new users",
      };
    }
  }

  const [existingUser] = await db
    .selectDistinct()
    .from(user)
    .where(eq(user.email, acc.email));

  if (!!existingUser) {
    return {
      error: "A user already exists with that email",
    };
  }
  try {
    const [userAcc] = await db
      .insert(user)
      .values({
        name: acc.name,
        lastName: acc.lastName ?? null,
        email: acc.email,
        emailVerified: false,
        image: acc.image ?? null,
        vacationDays: acc.vacationDays,
      })
      .returning();

    if (userAcc) {
      await db.insert(account).values({
        accountId: userAcc.id,
        providerId: "credential",
        userId: userAcc.id,
        csn: acc.csn,
        password: acc.password,
      });

      await logAction({
        logContext: "users",
        logEvent: "created",
        userId: userAcc.id,
        details: {
          context: "users",
          after: userAcc,
        },
      });
    } else {
      return {
        error: "There has been a error trying to create your account.",
      };
    }
  } catch (err) {
    if (err && err instanceof Error) {
      return {
        error: err.message,
      };
    }
  }
}

export async function signIn(email: string, password: string) {
  const data = await auth.api.signInEmail({
    body: {
      email: email,
      password: password,
      callbackURL: "/",
    },
  });

  if (data.user) {
    await logAction({
      logContext: "users",
      logEvent: "logged_in",
      userId: data.user.id,
      details: {
        context: "users",
        after: data.user,
      },
    });
  }

  return data;
}

export async function signOut() {
  return await auth.api.signOut({ headers: await headers() });
}
