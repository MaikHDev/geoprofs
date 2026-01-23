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
    <div className="flex flex-col">
      <div className="flex gap-6">
        <div className="flex flex-row gap-2">
          <label className="">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>

        <div className="flex flex-row gap-2">
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
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="border-r border-dotted border-gray-300 px-6 py-3 text-left text-sm font-semibold text-gray-600">Employee</th>
              <th className="border-r border-dotted border-gray-300 px-6 py-3 text-left text-sm font-semibold text-gray-600">Department</th>
              <th className="border-r border-dotted border-gray-300 px-6 py-3 text-left text-sm font-semibold text-gray-600">From</th>
              <th className="border-r border-dotted border-gray-300 px-6 py-3 text-left text-sm font-semibold text-gray-600">To</th>
              <th className="border-r border-dotted border-gray-300 px-6 py-3 text-left text-sm font-semibold text-gray-600">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data.map((request) => (
              <tr key={request.requestId} className="hover:bg-gray-50">
                <td className="border-r border-dotted border-gray-300 px-6 py-4 text-sm text-gray-700">{request.userName}</td>
                <td className="border-r border-dotted border-gray-300 px-6 py-4 text-sm text-gray-700">{request.departmentName}</td>
                <td className="border-r border-dotted border-gray-300 px-6 py-4 text-sm text-gray-700">{request.dateLeaveStart.toLocaleDateString()}</td>
                <td className="border-r border-dotted border-gray-300 px-6 py-4 text-sm text-gray-700">{request.dateLeaveEnd.toLocaleDateString()}</td>
                <td className="border-r border-dotted border-gray-300 px-6 py-4 text-sm text-gray-700">{request.reasonOfLeave}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
