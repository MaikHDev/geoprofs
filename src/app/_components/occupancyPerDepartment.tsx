"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useSessionContext } from "~/app/_components/session-provider";
import { HasPermission } from "../../../utils/hasPermission";

export default function DepartmentOccupancyOverview() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const session = useSessionContext();
  const hasPermission = HasPermission(session?.perms);

  const isEnabled = Boolean(from && to);

  const { data, isLoading, error } =
    api.leavePlanning.getDepartmentStaffingOverview.useQuery(
      {
        from: new Date(from),
        to: new Date(to),
      },
      {
        enabled: isEnabled,
      },
    );

  if (!isLoading && !hasPermission("LeaveRequestUseOthers.read")) {
    return null;
  }

  return (
    <div className="flex flex-col p-8">
      <h2 className="mb-6 text-3xl font-semibold">
        Department Staffing Overview
      </h2>

      <div className="mb-4 flex flex-row items-center gap-4">
        <div className="flex flex-row items-center gap-2">
          <label className="text-sm font-medium text-gray-700">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm"
          />
        </div>

        <div className="flex flex-row items-center gap-2">
          <label className="text-sm font-medium text-gray-700">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm"
          />
        </div>
      </div>

      {isLoading && <p>Loading…</p>}
      {error && <p className="text-red-500">{error.message}</p>}

      {data &&
        (data.length === 0 ? (
          <div className="text-md rounded-lg p-6 text-center text-gray-600 shadow-sm">
            No staffing data available for this period.
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border-r border-dotted border-gray-300 px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Department
                  </th>
                  <th className="border-r border-dotted border-gray-300 px-6 py-3 text-right text-sm font-semibold text-gray-600">
                    Total
                  </th>
                  <th className="border-r border-dotted border-gray-300 px-6 py-3 text-right text-sm font-semibold text-gray-600">
                    On leave
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">
                    Available
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {data.map((dept) => (
                  <tr key={dept.departmentName} className="hover:bg-gray-50">
                    <td className="border-r border-dotted border-gray-300 px-6 py-4 text-sm text-gray-700">
                      {dept.departmentName}
                    </td>
                    <td className="border-r border-dotted border-gray-300 px-6 py-4 text-right text-sm text-gray-700">
                      {dept.totalEmployees}
                    </td>
                    <td className="border-r border-dotted border-gray-300 px-6 py-4 text-right text-sm text-gray-700">
                      {dept.onLeave}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      {dept.available}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
    </div>
  );
}
