"use server";

import { auth } from "./auth";
import { headers } from "next/headers";

export async function getUserSession() {
  return await auth.api.getSession({ headers: await headers() });
}

// { FOR NOW ONLY AS TESTING PURPOSE! }

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

export async function signIn(email: string, password: string) {
  return await auth.api.signInEmail({
    body: {
      email: email,
      password: password,
      callbackURL: "/",
    },
  });
}

export async function signOut() {
  return await auth.api.signOut({ headers: await headers() });
}
