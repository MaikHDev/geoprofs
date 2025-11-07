"use server"

import { db } from "~/server/db";
import {logs, type LogsDetails} from "~/server/db/schema";
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
  details: LogsDetails;
}) {
  const result = await db.insert(logs).values({
    userId: userId,
    logEvent: logEvent,
    logContext: logContext,
    details: details,
  }).returning();
  console.log("log insert: ", result)
}
