"use client";

import { api } from "~/trpc/react";
import Link from "next/link";

export default function PendingLeaveRequestsPage() {
  const { data } = api.leaveRequest.listPendingRequests.useQuery();

  return (
    <div>
      <ul>
        {data?.map((request) => (
          <li key={request.id}>
            <Link href={`/leaveRequest/${request.id}`}>
              <span>{request.subject}</span>
              <span>{request.reason}</span>
              <span>({request.requesterName})</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

