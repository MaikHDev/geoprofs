"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export default function LeavePlanningPage() {
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  const isEnabled = Boolean(from && to);

  const { data, isLoading, error } =
    api.leavePlanning.getDepartmentOverview.useQuery(
      {
        from: new Date(from),
        to: new Date(to),
      },
      {
        enabled: isEnabled,
      },
    );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-4">
        <div>
          <label className="">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>

        <div>
          <label className="">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
      </div>

      {isLoading && <p>Loading…</p>}
      {error && <p className="text-red-500">{error.message}</p>}

      {data && (
        <table className="w-full">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>From</th>
              <th>To</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {data.map((request) => (
              <tr key={request.requestId}>
                <td>{request.userName}</td>
                <td>{request.departmentName}</td>
                <td>{request.dateLeaveStart.toLocaleDateString()}</td>
                <td>{request.dateLeaveEnd.toLocaleDateString()}</td>
                <td>{request.reasonOfLeave}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
