"use client"

import { api } from "~/trpc/react";

export default function LogsPage() {
  const { data } = api.auditTrail.getAllLogs.useQuery();

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
