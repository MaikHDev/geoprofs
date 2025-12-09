"use client";

import { api } from "~/trpc/react";
import Link from "next/link";

export default function PendingLeaveRequestsPage() {
  const { data: requests, isLoading } = api.leaveRequest.listPendingRequests.useQuery();

  if (isLoading) return <p className="text-center py-12">Loading...</p>;
  if (!requests?.length)
    return <p className="text-center py-12 text-gray-500">No pending leave requests</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Pending Leave Requests</h1>

      {requests.map((request) => (
        <Link
          key={request.id}
          href={`/leaveRequest/${request.id}`}
          className="block border rounded-lg p-5 hover:bg-gray-50 transition"
        >
          <div className="flex justify-between items-start mb-2">
            <strong className="text-lg">{request.subject}</strong>
            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
              Pending
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-2">
            {request.requesterName || "User 4"} • {request.requesterEmail}
          </p>

          <p className="text-sm font-medium">
            {new Date(request.start).toLocaleDateString()} →{" "}
            {new Date(request.end).toLocaleDateString()}
          </p>

          {request.reason && (
            <p className="text-sm italic text-gray-600 mt-2">{request.reason}</p>
          )}

          <p className="text-xs text-gray-500 mt-3">
            Submitted {new Date(request.createdAt).toLocaleString()}
          </p>
        </Link>
      ))}
    </div>
  );
}