import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "~/server/db";
import { nextCookies } from "better-auth/next-js";
import { Resend } from "resend";
import { env } from "~/env";
import { requestPasswordReset } from "./auth-client";

const resend = new Resend(env.RESEND_API_KEY);

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    requireEmailVerification: true,
    enabled: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      const { error } = await resend.emails.send({
        from: env.RESEND_EMAIL_FROM,
        to: user.email,
        subject: "Reset your password",
        html: `Click the link to reset your password: ${url}`,
      });

      if (error) {
        throw new Error(error.message);
      }
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      const { error } = await resend.emails.send({
        from: env.RESEND_EMAIL_FROM,
        to: user.email,
        subject: "Reset your password",
        html: `Click the link to verify your email ${url}
        
        On Verification you'll receive a new email to setup your password
        `,
      });

      if (error) {
        throw new Error(error.message);
      }
    },
    onEmailVerification: async (user) => {
      await requestPasswordReset({
        email: user.email,
        redirectTo: "/reset-password",
      });
    },
  },
  plugins: [nextCookies()],
});
