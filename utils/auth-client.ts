import { createAuthClient } from "better-auth/client";
import { nextCookies } from "better-auth/next-js";

export const authClient = createAuthClient({
  baseURL: "/api/auth",
  plugins: [nextCookies()],
});
