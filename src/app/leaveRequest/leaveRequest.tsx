"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "~/trpc/react";

export default function LeaveRequestDetailsPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = api.leaveRequest.getById.useQuery({ id: Number(id) });
  const utils = api.useUtils();

  const updateStatusMutation = api.leaveRequest.updateStatus.useMutation({
    onSuccess: async () => {
      await utils.leaveRequest.invalidate();
      router.push("/leaveRequests");
    },
  });

  const [selectedStatus, setSelectedStatus] = useState<"approved" | "denied" | null>(null);

  useEffect(() => {
    if (data?.status === "approved" || data?.status === "denied") {
      setSelectedStatus(data.status);
    }
  }, [data?.status]);

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>Request not found.</div>;

  const isLocked = data.status === "approved" || data.status === "denied";

  const handleSave = () => {
    if (!selectedStatus || isLocked) return;
    updateStatusMutation.mutate({ id: Number(id), status: selectedStatus });
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">{data.subject}</h1>
      <p><strong>Requester:</strong> {data.requesterName} ({data.requesterEmail})</p>
      <p><strong>Reason:</strong> {data.reason}</p>
      <p><strong>Status:</strong> {data.status}</p>
      <p><strong>From:</strong> {new Date(data.start).toLocaleDateString()}</p>
      <p><strong>To:</strong> {new Date(data.end).toLocaleDateString()}</p>
      <p><strong>Reasoning:</strong> {data.reasoning}</p>

      {isLocked ? (
        <div className="mt-6 text-gray-800 italic">
          This request has already been {data.status} and can no longer be modified.
        </div>
      ) : (
        <>
          <div className="flex gap-4 mt-6">
            <button
              className={`px-4 py-2 rounded text-white ${
                selectedStatus === "approved" ? "bg-green-600" : "bg-green-500/50"
              }`}
              onClick={() => setSelectedStatus("approved")}
              disabled={isLocked}>
              Approve
            </button>
            <button
              className={`px-4 py-2 rounded text-white ${
                selectedStatus === "denied" ? "bg-red-600" : "bg-red-500/50"
              }`}
              onClick={() => setSelectedStatus("denied")}
              disabled={isLocked}>
              Deny
            </button>
          </div>

          <div className="mt-6">
            <button
              disabled={!selectedStatus || updateStatusMutation.isPending || isLocked}
              onClick={handleSave}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {updateStatusMutation.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
