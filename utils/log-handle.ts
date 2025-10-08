import {db} from "~/server/db";
import {logs} from "~/server/db/schema";
import type {InferInsertModel} from "drizzle-orm";

type NewLog = InferInsertModel<typeof logs>;

export async function logAction({
                             logEvent,
                             logContext,
                             userId,
                             details,
                         }: {
    logEvent: NewLog["logEvent"];
    logContext: NewLog["logContext"];
    userId: string;
    details?: never;
}) {
    await db.insert(logs).values({
        userId: userId,
        logEvent: logEvent,
        logContext: logContext,
        details: JSON.stringify(details ?? {})
    });
}