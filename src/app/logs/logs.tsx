"use client"

import { api } from "~/trpc/react";
import { useEffect } from "react";
import { logAction } from "../../../utils/log-handle";

export default function LogsPage() {
  const { data } = api.auditTrail.getAllLogs.useQuery();

  useEffect(() => {
    const details = {
      context: "users" as const,
      before: {
        name: "klaas",
      },
      after: {
        name: "pieter",
      },
    };
    const doLogAction = async () => {
      void logAction({logContext: "users", logEvent: "changed", details: details, userId: "8TbfUkizCKn7NS6qsy1txAy8NhTojQ85"})
      console.log("has ran")
    }
    // void doLogAction()
  }, []);

  return (
    <>
      {data?.map((item, i) => {
        return (
          <div key={i}>
            <h1>{item.logContext}</h1>
          </div>
        );
      })}
    </>
  );
}
