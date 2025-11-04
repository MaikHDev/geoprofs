import { createAuthClient } from "better-auth/client";
import { nextCookies } from "better-auth/next-js";
import {env} from "~/env";

export const authClient = createAuthClient({
  baseURL: `${env.NEXT_PUBLIC_VERCEL_URL}/api/auth`,
  plugins: [nextCookies()],
});
