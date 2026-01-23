"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import ReturnView from "~/app/_components/returnView";
import { useSessionContext } from "~/app/_components/session-provider";
import { HasPermission } from "../../../utils/hasPermission";

export default function LeaveRequestDetailsPage() {
  const session = useSessionContext();
  const hasPermission = HasPermission(session?.perms);
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = api.leaveRequest.getById.useQuery({
    id: Number(id),
  });
  const utils = api.useUtils();

  const updateStatusMutation = api.leaveRequest.updateStatus.useMutation({
    onSuccess: async () => {
      await utils.leaveRequest.invalidate();
      router.push("/leaveRequests");
    },
  });

  const [selectedStatus, setSelectedStatus] = useState<
    "approved" | "denied" | null
  >(null);

  useEffect(() => {
    if (data?.status === "approved" || data?.status === "denied") {
      setSelectedStatus(data.status);
    }
  }, [data?.status]);

  if (isLoading)
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  if (!data)
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        Request not found.
      </div>
    );

  const isLocked = data.status === "approved" || data.status === "denied";

  const handleSave = () => {
    if (!selectedStatus || isLocked) return;
    updateStatusMutation.mutate({ id: Number(id), status: selectedStatus });
  };

  if (!session) {
    return (
      <ReturnView
        returnPath="/auth"
        returnName="Login"
        label="You need to be logged in for this action!"
      />
    );
  }

  if (
    !hasPermission("LeaveRequestUseOthers.read") &&
    !hasPermission("LeaveRequestReviewUseOthers.create")
  ) {
    return <ReturnView />;
  }

  return (
    <div className="flex justify-center px-4 py-10">
      <div className="w-full max-w-2xl rounded-xl border border-gray-100 bg-white p-8 shadow-md">
        <div className="space-y-3 text-gray-700">
          <p>
            <strong className="font-medium text-gray-900">Requester:</strong>{" "}
            {data.requesterName} ({data.requesterEmail})
          </p>
          <p>
            <strong className="font-medium text-gray-900">Reason:</strong>{" "}
            {data.reason}
          </p>
          <p>
            <strong className="font-medium text-gray-900">Status:</strong>{" "}
            <span
              className={`rounded px-2 py-1 text-sm ${
                data.status === "approved"
                  ? "bg-green-100 text-green-800"
                  : data.status === "denied"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-700"
              }`}
            >
              {data.status}
            </span>
          </p>
          <p>
            <strong className="font-medium text-gray-900">From:</strong>{" "}
            {new Date(data.start).toLocaleDateString()}
          </p>
          <p>
            <strong className="font-medium text-gray-900">To:</strong>{" "}
            {new Date(data.end).toLocaleDateString()}
          </p>
          {data.reasoning && (
            <p>
              <strong className="font-medium text-gray-900">Reasoning:</strong>{" "}
              {data.reasoning}
            </p>
          )}
        </div>

        {isLocked ? (
          <div className="mt-8 border-t border-gray-100 pt-6 text-gray-600 italic">
            This request has already been <strong>{data.status}</strong> and can
            no longer be modified.
          </div>
        ) : (
          <>
            <div className="mt-8 flex gap-4">
              <button
                className={`flex-1 rounded-lg px-4 py-3 font-medium text-white transition ${
                  selectedStatus === "approved"
                    ? "bg-[#007379]"
                    : "cursor-pointer bg-[#00888F] hover:bg-[#007379]"
                }`}
                onClick={() => setSelectedStatus("approved")}
                disabled={isLocked}
              >
                Approve
              </button>
              <button
                className={`flex-1 rounded-lg px-4 py-3 font-medium text-white transition ${
                  selectedStatus === "denied"
                    ? "bg-red-600"
                    : "cursor-pointer bg-red-500 hover:bg-red-600"
                }`}
                onClick={() => setSelectedStatus("denied")}
                disabled={isLocked}
              >
                Deny
              </button>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                disabled={
                  !selectedStatus || updateStatusMutation.isPending || isLocked
                }
                onClick={handleSave}
                className={`rounded-lg px-6 py-3 font-semibold text-white transition ${
                  !selectedStatus || isLocked
                    ? "cursor-not-allowed bg-[#CCCCCC]"
                    : "cursor-pointer bg-[#00888F] hover:bg-[#007379]"
                } ${updateStatusMutation.isPending ? "opacity-70" : ""} `}
              >
                {updateStatusMutation.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
