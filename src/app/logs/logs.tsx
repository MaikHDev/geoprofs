"use client";

import React, { useCallback, useEffect, useState } from "react";
import { LogContext as LC, LogEvents as LE } from "~/server/db/schema";
import { api } from "~/trpc/react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";
import ReturnView from "~/app/_components/returnView";
import { TrpcErrorlikeMessages } from "~/trpc/trpc-errorlike-messages";
import ErrorHandler from "~/app/_components/errorHandler";
import { useSessionContext } from "~/app/_components/session-provider";

export default function LogsPage() {
  const session = useSessionContext();
  const hasPermission = session?.hasPermission;

  type RouterOutput = NonNullable<inferRouterOutputs<AppRouter>>;
  type LogItems = RouterOutput["auditTrail"]["getLogData"];
  type LogItem = NonNullable<LogItems> extends (infer T)[] ? T : never;

  type LogContext = (typeof LC.enumValues)[number];
  type LogEvents = (typeof LE.enumValues)[number];
  type ViewTypes = ["contexts", "events", "logs", "single"];

  const [logView, setLogView] = useState<ViewTypes[number]>("contexts");
  const [context, setContext] = useState<LogContext | null>(null);
  const [events, setEvents] = useState<LogEvents | null>(null);
  const [selectedLog, setSelectedLog] = useState<LogItem | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const {
    data: logData,
    isLoading,
    refetch,
    error,
  } = api.auditTrail.getLogData.useQuery(
    { logContext: context!, logEvent: events! },
    {
      retry: (failureCount, error) => {
        if (error?.data?.code === "UNAUTHORIZED") return false;

        return failureCount < 3;
      },
      enabled: !!context && !!events,
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => {
    if (logView === "logs" && context && events) {
      void refetch();
    }
  }, [logView, context, events, refetch]);

  const handleContext = useCallback(
    (ctx: LogContext) => {
      if (ctx === context) return;
      setContext(ctx);
      setLogView("events");
    },
    [context],
  );

  const handleEvent = useCallback(
    (evt: LogEvents) => {
      if (evt === events) return;
      setEvents(evt);
      setLogView("logs");
    },
    [events],
  );

  const handleView = useCallback((view: ViewTypes[number]) => {
    switch (view) {
      case "contexts":
        setContext(null);
        setEvents(null);
        setSelectedLog(null);
        break;
      case "events":
        setEvents(null);
        setSelectedLog(null);
        break;
      case "logs":
        setSelectedLog(null);
        break;
    }
    setLogView(view);
  }, []);

  if (!session) {
    return (
      <ReturnView
        label={TrpcErrorlikeMessages.session.message}
        returnName="Login"
        returnPath="/auth"
      />
    );
  }
  if (isLoading) {
    return <div className="text-gray-400">Loading...</div>;
  }
  if (!hasPermission?.["Log.read"]) {
    return <ReturnView returnName="Dashboard" returnPath="/dashboard" />;
  }

  const filteredLogs =
    logData
      ?.filter((log) => {
        const logTime = new Date(log.createdAt).getTime();
        const start = startDate ? new Date(startDate).getTime() : -Infinity;
        const end = endDate
          ? new Date(endDate).setHours(23, 59, 59, 999)
          : Infinity;
        const userMatch = selectedUser
          ? `${log.user?.name ?? ""} ${log.user?.lastName ?? ""} ${log.user?.email ?? ""}`
              .toLowerCase()
              .includes(selectedUser.toLowerCase())
          : true;
        return logTime >= start && logTime <= end && userMatch;
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
      }) ?? [];

  const LogDetails = ({ item }: { item: LogItem }) => {
    if (!item.details) return <div className="text-gray-400">No details</div>;

    const before = item.details.before ?? {};
    const after = item.details.after ?? {};
    const allKeys = Array.from(
      new Set([...Object.keys(before), ...Object.keys(after)]),
    );

    if (!allKeys.length) return <div className="text-gray-400">No changes</div>;

    function FormatValue(value: unknown) {
      if (value === null) return "not set";
      if (value === undefined) return "-";
      if (value instanceof Date) return value.toLocaleDateString();
      if (typeof value === "boolean") return value ? "true" : "false";
      if (typeof value === "object") return JSON.stringify(value, null, 2);
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      return String(value);
    }

    return (
      <div className="space-y-2 rounded-md border bg-gray-50 p-4">
        <h3 className="font-semibold">Changes</h3>
        <div className="grid grid-cols-3 gap-4 border-b pb-1 font-medium">
          <div>Field</div>
          <div className="text-red-600">Before</div>
          <div className="text-green-600">After</div>
        </div>
        {allKeys.map((key) => {
          const bV = before[key as keyof typeof before];
          const aV = after[key as keyof typeof after];
          const changed = bV !== undefined && aV !== undefined && bV !== aV;

          const beforeVal = FormatValue(bV);
          const afterVal = FormatValue(aV);

          return (
            <div key={key} className="grid grid-cols-3 gap-4 py-1">
              <div className="font-medium text-gray-700">{key}</div>
              <div className={changed ? "text-red-600" : "text-gray-400"}>
                {beforeVal}
              </div>
              <div className={changed ? "text-green-600" : "text-gray-400"}>
                {afterVal}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const CardButton = ({
    title,
    subtitle,
    color = "bg-white hover:bg-gray-50",
    onClick,
    date,
  }: {
    title: string;
    subtitle?: string;
    color?: string;
    date?: Date;
    onClick: () => void;
  }) => {
    const formattedDate = date
      ? `${date.toLocaleDateString()} ${date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}`
      : null;

    return (
      <button
        onClick={onClick}
        className={`flex w-full items-center justify-between rounded-md p-4 shadow-md transition-transform hover:scale-[1.01] ${color}`}
      >
        <div>
          <div className="font-medium">{title}</div>
          {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
        </div>
        <div>{formattedDate ?? ""}</div>
      </button>
    );
  };

  const BreadcrumbPill = ({
    label,
    onClick,
    active = false,
  }: {
    label: string;
    onClick?: () => void;
    active?: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={active || !onClick}
      className={`rounded-md px-4 py-2 text-base font-semibold shadow transition ${
        active
          ? "bg-[#00888F] text-white"
          : "bg-[#CCCCCC] text-black hover:bg-[#9d9d9d]"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6 p-6">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <BreadcrumbPill
          label="Contexts"
          onClick={() => handleView("contexts")}
          active={logView === "contexts"}
        />
        {context && (
          <>
            <span className="font-bold text-gray-400">→</span>
            <BreadcrumbPill
              label={context}
              onClick={() => handleView("events")}
              active={logView === "events"}
            />
          </>
        )}
        {events && (
          <>
            <span className="font-bold text-gray-400">→</span>
            <BreadcrumbPill
              label={events}
              onClick={() => handleView("logs")}
              active={logView === "logs"}
            />
          </>
        )}
        {selectedLog && (
          <>
            <span className="font-bold text-gray-400">→</span>
            <BreadcrumbPill label={`Log #${selectedLog.id}`} active />
          </>
        )}
      </div>

      {logView === "contexts" && (
        <div className="grid gap-3">
          {LC.enumValues.map((ctx) => (
            <CardButton
              key={ctx}
              title={ctx}
              onClick={() => handleContext(ctx)}
            />
          ))}
        </div>
      )}

      {logView === "events" && (
        <div className="grid gap-3">
          {LE.enumValues.map((evt) => {
            if (
              (evt !== "logged_in" && context !== "users") ||
              context === "users"
            ) {
              return (
                <CardButton
                  key={evt}
                  title={evt}
                  onClick={() => handleEvent(evt)}
                />
              );
            }
          })}
        </div>
      )}

      {logView === "logs" && (
        <div className="space-y-4">
          <div className="mb-4 grid grid-cols-4 gap-4">
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded border p-2"
              placeholder="Start Date"
            />
            <input
              type="datetime-local"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded border p-2"
              placeholder="End Date"
            />
            <input
              type="text"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="rounded border p-2"
              placeholder="User"
            />
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="rounded border bg-white p-2 font-medium shadow transition hover:bg-gray-50"
            >
              Sort: {sortOrder === "asc" ? "Oldest First ↑" : "Newest First ↓"}
            </button>
          </div>
          {(startDate || endDate || selectedUser) && (
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setSelectedUser("");
              }}
              className="mb-2 text-sm text-blue-600 hover:underline"
            >
              Clear filters
            </button>
          )}
          {isLoading && (
            <div className="text-center text-gray-500">Loading...</div>
          )}
          {!isLoading && !filteredLogs.length && !error?.data && (
            <div className="text-center text-gray-400">No logs found</div>
          )}

          {!isLoading &&
            filteredLogs.map((log) => (
              <CardButton
                key={log.id}
                title={`${log.user?.name ?? "-"} ${log.user?.lastName ?? "-"}`}
                subtitle={log.user?.email}
                date={log.createdAt}
                onClick={() => {
                  setSelectedLog(log);
                  setLogView("single");
                }}
              />
            ))}
        </div>
      )}

      {logView === "single" && selectedLog && (
        <div className="space-y-4">
          <div className="space-y-2 rounded-md border bg-gray-50 p-4">
            <div>
              <span className="font-semibold">Name: </span>
              {selectedLog.user?.name} {selectedLog.user?.lastName}
            </div>
            <div>
              <span className="font-semibold">Email: </span>
              {selectedLog.user?.email}
            </div>
            <div>
              <span className="font-semibold">Role: </span>
              {selectedLog.user?.role ?? "-"}
            </div>
            <div>
              <span className="font-semibold">Date: </span>
              {new Date(selectedLog.createdAt).toLocaleString()}
            </div>
            <div>
              <span className="font-semibold">Event: </span>
              {selectedLog.logEvent}
            </div>
            <div>
              <span className="font-semibold">Context: </span>
              {selectedLog.logContext}
            </div>
          </div>
          <LogDetails item={selectedLog} />
        </div>
      )}

      {error?.data && (
        <ErrorHandler code={error.data.code} message={error.message} />
      )}
    </div>
  );
}
