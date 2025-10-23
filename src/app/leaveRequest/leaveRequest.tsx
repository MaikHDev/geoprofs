"use client";

import { useParams } from "next/navigation";
import { api } from "~/trpc/react";

export default function LeaveRequestDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = api.leaveRequest.getById.useQuery({ id: Number(id) });
  const utils = api.useUtils();
  const approveMutation = api.leaveRequest.approve.useMutation({
    onSuccess: () => utils.leaveRequest.getById.invalidate({ id: Number(id) })
  });
  const denyMutation = api.leaveRequest.deny.useMutation({
    onSuccess: () => utils.leaveRequest.getById.invalidate({ id: Number(id) })
  });

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>Request not found.</div>;

  return (
    <div>
      <h1 className="text-xl font-semibold">{data.subject}</h1>
      <p><strong>Requester:</strong> {data.requesterName} ({data.requesterEmail})</p>
      <p><strong>Reason:</strong> {data.reason}</p>
      <p><strong>Status:</strong> {data.status}</p>
      <p><strong>From:</strong> {new Date(data.start).toLocaleDateString()}</p>
      <p><strong>To:</strong> {new Date(data.end).toLocaleDateString()}</p>
      <p><strong>Reasoning:</strong> {data.reasoning}</p>

      <div className="flex gap-4 mt-6">
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={() => approveMutation.mutate({ id: Number(id) })}>
          Approve
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={() => denyMutation.mutate({ id: Number(id) })}>
          Deny
        </button>
      </div>
    </div>
  );
}
