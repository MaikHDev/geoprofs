"use client";

import { api } from "~/trpc/react";

export default function PendingLeaveRequestsPage() {
  const { data } = api.leaveRequest.listPendingRequests.useQuery();

  return (
    <div>
      <ul>
        {data?.map((request) => (
          <li key={request.id}>
            {request.subject} {request.requesterName}
          </li>
        ))}
      </ul>
    </div>
  );
}

