"use server";

import { auth } from "./auth";
import { headers } from "next/headers";
import { logAction } from "./log-handle";

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
