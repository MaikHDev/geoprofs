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
    userId: NewLog["userId"];
    details?: NewLog["details"];
}) {
    await db.insert(logs).values({
        userId: userId,
        logEvent: logEvent,
        logContext: logContext,
        details: details
    });
}