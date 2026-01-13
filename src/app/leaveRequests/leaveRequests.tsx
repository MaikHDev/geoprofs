"use client";

import { api } from "~/trpc/react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReturnView from "~/app/_components/returnView";
import {usePermission} from "~/hooks/usePermission";

export default function PendingLeaveRequestsPage() {
  const { hasPermission } = usePermission();
  const utils = api.useUtils();
  const { data, isLoading } = api.leaveRequest.listPendingRequests.useQuery();
  const router = useRouter();

  const approveMutation = api.leaveRequest.updateMultipleStatus.useMutation({
    onSuccess: async () => {
      await utils.leaveRequest.listPendingRequests.invalidate();
      setCheckedLeaveRequests([]);
    },
  });

  const denyMutation = api.leaveRequest.updateMultipleStatus.useMutation({
    onSuccess: async () => {
      await utils.leaveRequest.listPendingRequests.invalidate();
      setCheckedLeaveRequests([]);
    },
  });

  const [checkedLeaveRequests, setCheckedLeaveRequests] = useState<number[]>(
    [],
  );
  const [isAllChecked, setIsAllChecked] = useState(false);

  const handleOnChange = (id: number) => {
    setCheckedLeaveRequests((prev) => {
      if (prev.includes(id)) {
        return prev.filter((checkedLeaveRequest) => checkedLeaveRequest !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  useEffect(() => {
    if (!data) return;
    if (checkedLeaveRequests.length === data.length && data.length > 0) {
      setIsAllChecked(true);
    } else {
      setIsAllChecked(false);
    }
  }, [checkedLeaveRequests, data]);

  const handleSelectAll = () => {
    if (!data) return;
    if (isAllChecked) {
      setCheckedLeaveRequests([]);
    } else {
      setCheckedLeaveRequests(data.map((req) => req.id));
    }
    setIsAllChecked(!isAllChecked);
  };

    if (!isLoading && !hasPermission("LeaveRequestUseOthers.read")) {
        return <ReturnView />;
    }

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

  return (
    <div className="p-8">
      <h2 className="mb-6 text-3xl font-semibold">Leave requests</h2>

      <div className="rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={isAllChecked}
                  onChange={handleSelectAll}
                  className="text-bg-[#00888F] h-4 w-4 cursor-pointer rounded border-gray-300"
                  ref={(el) => {
                    if (el) {
                      el.indeterminate =
                        checkedLeaveRequests.length > 0 &&
                        checkedLeaveRequests.length < (data?.length ?? 0);
                    }
                  }}
                />
              </th>
              <th className="border-r border-dotted border-gray-300 px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Name
              </th>
              <th className="border-r border-dotted border-gray-300 px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Reason
              </th>
              <th className="border-r border-dotted border-gray-300 px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Start date
              </th>
              <th className="border-r border-dotted border-gray-300 px-6 py-3 text-left text-sm font-semibold text-gray-600">
                End date
              </th>
              <th className="border-r border-dotted border-gray-300 px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Reasoning
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data?.map((request) => (
              <tr
                key={request.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => router.push(`/leaveRequest/${request.id}`)}
              >
                <td className="px-4 py-4">
                  <input
                    onClick={(e) => e.stopPropagation()}
                    type="checkbox"
                    value={request.id}
                    checked={checkedLeaveRequests.includes(request.id)}
                    onChange={() => handleOnChange(request.id)}
                    className="text-bg-[#00888F] h-4 w-4 cursor-pointer rounded border-gray-300"
                  />
                </td>
                <td className="border-r border-dotted border-gray-300 px-6 py-4 text-sm text-gray-700">
                  {request.requesterName}
                </td>
                <td className="border-r border-dotted border-gray-300 px-6 py-4 text-sm text-gray-700">
                  {request.reason}
                </td>
                <td className="border-r border-dotted border-gray-300 px-6 py-4 text-sm text-gray-700">
                  {new Date(request.start).toLocaleDateString()}
                </td>
                <td className="border-r border-dotted border-gray-300 px-6 py-4 text-sm text-gray-700">
                  {new Date(request.end).toLocaleDateString()}
                </td>
                <td className="max-w-xs truncate border-r border-dotted border-gray-300 px-6 py-4 text-sm text-gray-700">
                  {request.reasoning}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={() =>
            approveMutation.mutate({
              ids: checkedLeaveRequests,
              status: "approved",
            })
          }
          className="cursor-pointer rounded-md bg-[#00888F] px-6 py-2 text-white transition hover:bg-[#007379]"
        >
          {approveMutation.isPending ? "Saving..." : "Approve selected"}
        </button>

        <button
          onClick={() =>
            denyMutation.mutate({ ids: checkedLeaveRequests, status: "denied" })
          }
          className="cursor-pointer rounded-md border border-gray-300 px-6 py-2 text-gray-700 transition hover:bg-gray-50"
        >
          {denyMutation.isPending ? "Saving..." : "Deny selected"}
        </button>
      </div>
    </div>
  );
}