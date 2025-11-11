"use client"

import {useCallback, useEffect, useState} from "react";
import type {inferRouterOutputs} from "@trpc/server";
import type {AppRouter} from "~/server/api/root";
import {LogContext as LC, type LogEvents as LE} from "~/server/db/schema";
import {api} from "~/trpc/react";

export default function LogsPage() {
    type RouterOutput = inferRouterOutputs<AppRouter>;
    type UsersOutput = RouterOutput['auditTrail']['getLogData'];
    type LogContext = typeof LC.enumValues[number];
    type LogEvents = typeof LE.enumValues[number];

    const [error, setError] = useState('');
    const [logView, setLogView] = useState<'contexts' | 'events' | 'log_data'>('contexts')
    const [context, setContext] = useState<LogContext | null>(null);
    const [events, setEvents] = useState<LogEvents | null>(null);
    const [logData, setLogData] = useState<UsersOutput>(undefined);

    useEffect(() => {
        console.log("ran!")
    }, [context, events]);

    const HandleContext = useCallback((ctx: LogContext) => {
        if (ctx === context) return;
        if (!LC.enumValues.includes(ctx)) return;

        setContext(ctx);
        setLogView('events');
    }, [context])

    const HandleEvents = useCallback((evt: LogEvents) => {
        if (evt === events) return;
        if (!LC.enumValues.includes(evt)) return;

        setEvents(evt);
        setLogView('log_data');
    }, [events])

    useEffect(() => {
        if (logView !== 'log_data') return;

        const {data, isLoading} = api.auditTrail.getLogData.useQuery({
            logContext: context, logEvent: events
        });

        if (!data && !isLoading) {
            setError("There has been a server error trying to fetch the data");
            setLogData(undefined);
        }

        setLogData(data);

    }, [context, events, logView]);

    return (
        <>
            {logView === 'contexts' && LC.enumValues.map((ctx) => {
                return (
                    <button key={ctx} onClick={() => HandleContext(ctx)}></button>
                )
            })}
            {logView === 'events' && LE.enumValues.map((evt) => {
                return (
                    <button key={evt} onClick={() => HandleEvents(evt)}></button>
                )
            })}
            {LogView === 'log_data' && logData?.map((item, i) => {
                return (
                    <div key={i}>
                        <h1>{item.logContext}</h1>
                    </div>
                );
            })}
        </>
    );
}
