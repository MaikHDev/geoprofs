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
    type ViewTypes = ['contexts', 'events', 'logs'];

    const [logView, setLogView] = useState<ViewTypes[number]>('contexts')
    const [context, setContext] = useState<LogContext | null>(null);
    const [events, setEvents] = useState<LogEvents | null>(null);
    const [selectedLog, setSelectedLog] = useState<number | null>(null);

    const {data: logData, isLoading, refetch} = api.auditTrail.getLogData.useQuery(
        {logContext: context!, logEvent: events!},
        {
            enabled: !!context && !!events,
            refetchOnWindowFocus: false,
        }
    );

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
        setLogView('logs');
    }, [events])

    const HandleView = useCallback((view: ViewTypes[number]) => {
        if (view === logView) return;

        switch (view) {
            case 'contexts':
                setContext(null);
                setEvents(null);
                break;
            case 'events':
                setEvents(null);
                break;
        }

        setLogView(view);
    }, [logView])

    useEffect(() => {
        if (logView !== 'logs') return;
        if (!context || !events) return;
        void refetch();

    }, [context, events, logView, refetch]);

    const LogItem = ({item}: { item: LogItem }) => {
        if (!item.details) return <div className="text-gray-400 text-sm">No details</div>;

        const before = item.details.before ?? {};
        const after = item.details.after ?? {};
        const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);


        if (allKeys.size === 0) {
            return <div className="text-gray-400 text-sm">No changes</div>;
        }

        if (item.id === selectedLog) {
            return (
                <div className="space-y-2">
                    {Array.from(allKeys).map((key) => {
                        const beforeVal = before[key as keyof typeof before];
                        const afterVal = after[key as keyof typeof after];
                        const hasChanged = beforeVal !== undefined && afterVal !== undefined && beforeVal !== afterVal;

                        return (
                            <div key={key} className="flex gap-4 text-sm py-1">
                                <div className="w-32 text-gray-600 font-medium">
                                    {key}:
                                </div>
                                <div className={`flex-1 ${hasChanged ? "text-red-600" : "text-gray-500"}`}>
                                    {beforeVal ? String(beforeVal) : '-'}
                                </div>
                                <div className={`flex-1 ${hasChanged ? "text-green-600" : "text-gray-500"}`}>
                                    {afterVal ? String(afterVal) : '-'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            );
        } else{

        }
        // return (
        //     <div className="flex gap-[30px]">
        //         <div>
        //             {Object.entries(before).map(([key, value]) => {
        //                 const itemValue = FormatValue(value);
        //                 const isChanged = changedValues.includes(key);
        //                 return (
        //                     <div
        //                         key={key}
        //                         className={isChanged ? "text-red-500" : ""}
        //                     >
        //                         Before: {key} : {itemValue}
        //                     </div>
        //                 );
        //             })}
        //         </div>
        //         <div>
        //             {Object.entries(after).map(([key, value]) => {
        //                 const itemValue = FormatValue(value);
        //                 const isChanged = changedValues.includes(key);
        //                 return (
        //                     <div
        //                         key={key}
        //                         className={isChanged ? "text-green-500" : ""}
        //                     >
        //                         After: {key} : {itemValue}
        //                     </div>
        //                 );
        //             })}
        //         </div>
        //     </div>
        // );
    }

    return (
        <>
            <button className="hover:cursor-pointer" onClick={() => HandleView('contexts')}>Go back</button>
            <br/>
            <br/>
            <div className="flex gap-[10px]">
                { context && (
                    <button className="hover:cursor-pointer font-bold"
                            onClick={() => HandleView('contexts')}>{context}</button>
                )}
                {events && (
                    <div>{'->'}</div>
                )}
                {events && (
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
            {logView === 'logs' && logData?.map((item) => {
                return <LogItem key={item.id} item={item}/>
            })}
        </>
    );
}
