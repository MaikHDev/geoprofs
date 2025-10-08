import {
  account,
  permissions,
  rolePermissions,
  roles,
  user,
  userRoles,
} from "~/server/db/schema";
import { db } from "~/server/db";

export async function seedDelete() {


  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(rolePermissions);
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(userRoles);
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(permissions);
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(roles);
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(user);
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(account);


  console.log("Delete ran");
}