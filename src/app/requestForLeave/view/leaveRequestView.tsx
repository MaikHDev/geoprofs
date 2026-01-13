"use client";

import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LeaveRequestView() {
  const router = useRouter();
  const { data } = api.leaveRequest.viewStatus.useQuery();

  const [statusFilter, setStatusFilter] = useState("all");
  const [reasonFilter, setReasonFilter] = useState("all");

  if (!data) return null;

  const statusColorMap: Record<
    "pending" | "renewal" | "denied" | "approved",
    string
  > = {
    pending: "bg-yellow-100 text-yellow-800",
    renewal: "bg-orange-100 text-orange-800",
    denied: "bg-red-100 text-red-800",
    approved: "bg-green-100 text-green-800",
  };

  const uniqueReasons = Array.from(
    new Set(data.map((req) => req.reasonOfLeave))
  );

  const filteredData = data.filter((req) => {
    const statusMatch =
      statusFilter === "all" || req.status === statusFilter;

    const reasonMatch =
      reasonFilter === "all" || req.reasonOfLeave === reasonFilter;

    return statusMatch && reasonMatch;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end gap-3">
        <select
          value={reasonFilter}
          onChange={(e) => setReasonFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="all">All Reasons</option>
          {uniqueReasons.map((reason) => (
            <option key={reason} value={reason}>
              {reason}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="renewal">Renewal</option>
          <option value="denied">Denied</option>
        </select>
      </div>

      <div className="flex justify-center">
        <table className="w-full border-separate border-spacing-y-2 shadow-none">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 text-left">Reason</th>
              <th className="border px-4 text-left">Start Date</th>
              <th className="border px-4 text-left">End Date</th>
              <th className="border px-4 text-left">Description</th>
              <th className="border px-4 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="border px-4 py-6 text-center text-gray-500"
                >
                  No requests are found
                </td>
              </tr>
            ) : (
              filteredData.map((req) => (
                <tr
                  key={req.id}
                  onClick={() => {
                    if (req.status === "pending") {
                      router.push(`/requestForLeave/edit/${req.id}`);
                    }
                  }}
                  className={`${
                    req.status === "pending"
                      ? "cursor-pointer hover:bg-gray-50"
                      : ""
                  } bg-white transition`}
                >
                  <td className="border px-4 py-3">
                    {req.reasonOfLeave}
                  </td>
                  <td className="border px-4 py-3">
                    {req.dateLeaveStart.toLocaleDateString()}
                  </td>
                  <td className="border px-4 py-3">
                    {req.dateLeaveEnd.toLocaleDateString()}
                  </td>
                  <td className="border px-4 py-3">
                    {req.reasoning}
                  </td>
                  <td
                    className={`border px-4 py-3 font-semibold ${statusColorMap[req.status]}`}
                  >
                    {req.status}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
