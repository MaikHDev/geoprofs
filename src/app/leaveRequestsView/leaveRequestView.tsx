"use client";

import { api } from "~/trpc/react";

export default function LeaveRequestView() {
  const { data } = api.leaveRequest.viewStatus.useQuery();

  if (!data) return;

  return (
    <>
      <div>
        {data.map((req) => (
          <li key={req.id}>
            <div>
              <div>
                <p>Start date: {req.dateLeaveStart.toLocaleDateString()}</p>
                <p>End date: {req.dateLeaveEnd.toLocaleDateString()}</p>
              </div>
            </div>
            <p>
              <strong>Reason:</strong> {req.reasonOfLeave}
            </p>
            <span>{req.status}</span>
          </li>
        ))}
      </div>
    </>
  );
}
