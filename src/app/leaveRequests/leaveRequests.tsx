"use client";

import { api } from "~/trpc/react";
import Link from "next/link";
import { useState } from "react";

export default function PendingLeaveRequestsPage() {
  const utils = api.useUtils();
  const { data } = api.leaveRequest.listPendingRequests.useQuery();
  const updateStatus = api.leaveRequest.updateMultipleStatus.useMutation({
    onSuccess: async () => {
      await utils.leaveRequest.listPendingRequests.invalidate();
      setCheckedLeaveRequests([]);
    },
  });

  const [checkedLeaveRequests, setCheckedLeaveRequests] = useState<number[]>(
    [],
  );

  const handleOnChange = (id: number) => {
    setCheckedLeaveRequests((prev) => {
      if (prev.includes(id)) {
        return prev.filter((checkedLeaveRequest) => checkedLeaveRequest !== id);
      } else {
        return [...prev, id];
      }
    });
  };

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
            <input
              type="checkbox"
              value={request.id}
              checked={checkedLeaveRequests.includes(request.id)}
              onChange={() => handleOnChange(request.id)}
            />
          </li>
        ))}
      </ul>

      <button
        onClick={() =>
          updateStatus.mutate({ ids: checkedLeaveRequests, status: "approved" })
        }
      >
        Approve Selected
      </button>

      <button
        onClick={() =>
          updateStatus.mutate({ ids: checkedLeaveRequests, status: "denied" })
        }
      >
        Deny Selected
      </button>
    </div>
  );
}
