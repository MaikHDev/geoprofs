"use server";

import { db } from "~/server/db";
import { logs } from "~/server/db/schema";
import type { InferInsertModel } from "drizzle-orm";

export type NewLog = InferInsertModel<typeof logs>;

export async function logAction({
  logEvent,
  logContext,
  userId,
  details,
}: {
  logEvent: NewLog["logEvent"];
  logContext: NewLog["logContext"];
  userId: NewLog["userId"];
  details: NewLog["details"];
}) {
  if (!userId || userId.length < 1) {
    throw new Error("User id is not valid, can't create a log");
  }

  await db.insert(logs).values({
    userId: userId,
    logEvent: logEvent,
    logContext: logContext,
    details: details,
  });
}
