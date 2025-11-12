"use client"

import {useCallback, useEffect, useState} from "react";
import {LogContext as LC, LogEvents as LE} from "~/server/db/schema";
import {api} from "~/trpc/react";
import type {inferRouterOutputs} from "@trpc/server";
import type {AppRouter} from "~/server/api/root";

export default function LogsPage() {
    type RouterOutput = NonNullable<inferRouterOutputs<AppRouter>>;
    type LogItems = RouterOutput['auditTrail']['getLogData'];
    type LogItem = NonNullable<LogItems> extends (infer T)[] ? T : never;

    type LogContext = typeof LC.enumValues[number];
    type LogEvents = typeof LE.enumValues[number];
    type ViewTypes = ['contexts', 'events', 'log_data'];

    const [logView, setLogView] = useState<ViewTypes[number]>('contexts')
    const [context, setContext] = useState<LogContext | null>(null);
    const [events, setEvents] = useState<LogEvents | null>(null);

    const {data: logData, isLoading, refetch} = api.auditTrail.getLogData.useQuery(
        {logContext: context!, logEvent: events!},
        {
            enabled: !!context && !!events,
            refetchOnWindowFocus: false,
        }
    );
    useEffect(() => {
        console.log("ran!");
        console.log("logview: ", logView)
        console.log("logdata: ", logData)
    }, [context, events, logView, logData]);

    const HandleContext = useCallback((ctx: LogContext) => {
        if (ctx === context) return;
        if (!LC.enumValues.includes(ctx)) return;

        setContext(ctx);
        setLogView('events');
    }, [context])

    const HandleEvents = useCallback((evt: LogEvents) => {
        if (evt === events) return;
        if (!LE.enumValues.includes(evt)) return;

        setEvents(evt);
        setLogView('log_data');
    }, [events])

    const HandleView = useCallback((view: ViewTypes[number]) => {
        if (view === logView) return;

        switch (view) {
            case 'contexts':
                setContext(null);
            case 'events':
                setEvents(null);
        }

        setLogView(view);
    }, [logView])

    useEffect(() => {
        if (logView !== 'log_data') return;
        if (!context || !events) return;
        void refetch();

    }, [context, events, logView, refetch]);

    const LogItem = ({item}: { item: LogItem }) => {
        function FormatValue(value: unknown) {
            if (value === null) return 'null';
            if (value === undefined) return 'undefined';
            if (value instanceof Date) return value.toLocaleDateString();
            if (typeof value === 'boolean') return value ? 'true' : 'false';
            if (typeof value === 'object') return JSON.stringify(value, null, 2);
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            return String(value);
        }

        const before = item.details.before ?? {};
        const after = item.details.after ?? {};

        // const changedValues = Object.entries(before)

        const changedValues = Object.keys(before).filter((key) => {
            const b = before[key as keyof typeof before];
            const a = after[key as keyof typeof after];
            return JSON.stringify(b) !== JSON.stringify(a);
        });

        return (
            <div className="flex gap-[30px]">
                <div>
                    {Object.entries(before).map(([key, value]) => {
                        const itemValue = FormatValue(value);
                        const isChanged = changedValues.includes(key);
                        return (
                            <div
                                key={key}
                                className={isChanged ? "text-red-500" : ""}
                            >
                                Before: {key} : {itemValue}
                            </div>
                        );
                    })}
                </div>
                <div>
                    {Object.entries(after).map(([key, value]) => {
                        const itemValue = FormatValue(value);
                        const isChanged = changedValues.includes(key);
                        return (
                            <div
                                key={key}
                                className={isChanged ? "text-green-500" : ""}
                            >
                                After: {key} : {itemValue}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <>
            <button className="hover:cursor-pointer" onClick={() => HandleView('contexts')}>Go back</button>
            <br/>
            <br/>
            <div className="flex gap-[10px]">
                {(logView === 'events' || logView === 'log_data') && context && (
                    <button className="hover:cursor-pointer font-bold"
                            onClick={() => HandleView('contexts')}>{context}</button>
                )}
                {logView === 'log_data' && events && (
                    <div>{'->'}</div>
                )}
                {logView === 'log_data' && events && (
                    <button className="hover:cursor-pointer font-bold"
                            onClick={() => HandleView('events')}>{events}</button>
                )}
                <br/>
            </div>
            <br/>
            <div className="flex gap-[10px]">
                {logView === 'contexts' && LC.enumValues.map((ctx) => {
                    return (
                        <div key={ctx}>
                            <button className="hover:cursor-pointer" onClick={() => HandleContext(ctx)}>{ctx}</button>
                            <br/>
                        </div>
                    )
                })}
                {logView === 'events' && LE.enumValues.map((evt) => {
                    return (
                        <div key={evt}>
                            <button className="hover:cursor-pointer" onClick={() => HandleEvents(evt)}>{evt}</button>
                            <br/>
                        </div>
                    )
                })}
            </div>
            {logView === 'log_data' && <div>Hello</div>}
            {logView === 'log_data' && logData?.map((item) => {
                return <LogItem key={item.id} item={item}/>
            })}
        </>
    );
}
