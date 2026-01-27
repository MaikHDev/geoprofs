import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  requirePermission,
} from "~/server/api/trpc";
import { eq, type InferInsertModel } from "drizzle-orm";

import {
  account,
  departments,
  roles,
  user,
  userDepartments,
  userRoles,
} from "~/server/db/schema";
import { logAction } from "../../../../utils/log-handle";
import { db } from "~/server/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { auth } from "utils/auth";
import { sendVerificationEmail } from "../../../../utils/auth-client";

export const accountSchema = z.object({
  password: z.string(),
  csn: z.string().optional().nullable(),
  name: z.string(),
  lastName: z.string().optional().nullable(),
  email: z.string(),
  image: z.string().optional().nullable(),
  vacationDays: z.number().optional().nullable(),
  department: z.string(),
  role: z.string(),
});

export type AccountType = InferInsertModel<typeof user> & {
  password: string;
  csn?: string | null;
  department?: string;
};

export const insertUser = async ({
  creator,
  input,
  roleId,
}: {
  creator: string;
  input: AccountType;
  roleId?: number;
}) => {
  const [userAcc] = await db
    .insert(user)
    .values({
      name: input.name,
      lastName: input.lastName ?? null,
      email: input.email,
      emailVerified: input.emailVerified ?? false,
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

    if (roleId) {
      await db.insert(userRoles).values({
        roleId,
        userEmail: userAcc.email,
      });
    }

    if (input.department) {
      await db.insert(userDepartments).values({
        departmentName: input.department,
        userId: userAcc.id,
      });
    }

    await logAction({
      logContext: "users",
      logEvent: "created",
      userId: creator ?? userAcc.id,
      details: {
        context: "users",
        after: userAcc,
      },
    });

    return userAcc.email;
  }
};

export const userAccountRouter = createTRPCRouter({
  getUserSession: publicProcedure.query(({ ctx }) => {
    return ctx.session ? { ...ctx.session, perms: ctx.perms } : null;
  }),

  createAccount: protectedProcedure
    .input(accountSchema)
    .use(requirePermission("UserUseOthers.create"))
    .mutation(async ({ ctx, input }) => {
      console.log("intput:: ,", input);
      if (!ctx.user) return;

      const context = await auth.$context;

      input.password = input.password.trim();
      if (input.password.length < 8) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Password needs to be atleast 8 characters long!",
        });
      }
      input.password = await context.password.hash(input.password);

      const [existingUser] = await ctx.db
        .selectDistinct()
        .from(user)
        .where(eq(user.email, input.email));

      const [existingRole] = await ctx.db
        .selectDistinct()
        .from(roles)
        .where(eq(roles.roleName, input.role));

      const [existingDepartment] = await ctx.db
        .selectDistinct()
        .from(departments)
        .where(eq(departments.name, input.department));

      if (existingUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "A user already exists with that email!",
        });
      }
      if (!existingRole) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "A role with that name doesn't exist!",
        });
      }
      if (!existingDepartment) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "A department with that name doesn't exist!",
        });
      }

      try {
        const email = await insertUser({
          creator: ctx.user?.id,
          input,
          roleId: existingRole.id,
        });
        if (!email) {
          throw new Error("Couldn't get users email");
        }

        const result = await sendVerificationEmail({
          email,
          callbackURL: "/verify-email",
        });

        if (result.error) {
          throw new Error(result.error.message);
        }
      } catch (err) {
        if (err && err instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: err.message,
          });
        }
      }
    }),
});
