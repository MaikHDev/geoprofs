import { createAuthClient } from "better-auth/react";
import { nextCookies } from "better-auth/next-js";

export const authClient = createAuthClient({
  basePath: '/api/auth',
  plugins: [nextCookies()],
});

export const { useSession, signIn, signOut, signUp } = authClient;
