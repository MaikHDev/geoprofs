import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { eq, type InferInsertModel } from "drizzle-orm";

import { account, user } from "~/server/db/schema";
import { logAction } from "../../../../utils/log-handle";
import { db } from "~/server/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { auth } from "utils/auth";
import { TrpcErrorlikeMessages } from "~/trpc/trpc-errorlike-messages";

export const accountSchema = z.object({
  password: z.string(),
  csn: z.string().optional().nullable(),
  name: z.string(),
  lastName: z.string().optional().nullable(),
  email: z.string(),
  image: z.string().optional().nullable(),
  vacationDays: z.number().optional().nullable(),
});

export type AccountType = InferInsertModel<typeof user> & {
  password: string;
  csn?: string | null;
};

export const insertUser = async (input: AccountType) => {
  const [userAcc] = await db
    .insert(user)
    .values({
      name: input.name,
      lastName: input.lastName ?? null,
      email: input.email,
      emailVerified: false,
      image: input.image ?? null,
      vacationDays: input.vacationDays ?? null,
    })
    .returning();

  if (userAcc) {
    await db.insert(account).values({
      accountId: userAcc.id,
      providerId: "credential",
      userId: userAcc.id,
      csn: input.csn,
      password: input.password,
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
  }
};

export const userAccountRouter = createTRPCRouter({
  getUserSession: publicProcedure.query(({ ctx }) => {
    return ctx.session ?? null;
  }),

  createAccount: publicProcedure
    .input(accountSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.hasPermission("UserUseOthers.create")) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: TrpcErrorlikeMessages.permission.message,
        });
      }

      const context = await auth.$context;
      input.password = await context.password.hash(input.password);

      const [existingUser] = await db
        .selectDistinct()
        .from(user)
        .where(eq(user.email, input.email));

      if (existingUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "A user already exists with that email",
        });
      }

      try {
        await insertUser(input);
      } catch (err) {
        if (err && err instanceof TRPCError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: err.message,
          });
        }
      }
    }),
});
