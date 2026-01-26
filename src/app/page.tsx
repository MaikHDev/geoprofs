  "use client";

  import { api } from "~/trpc/react";
  import { useRouter } from "next/navigation";
  import { usePermission } from "~/hooks/usePermission";

  type LeaveStatus =
    | "pending"
    | "approved"
    | "denied"
    | "renewal"
    | "opened";

  const statusColorMap: Record<LeaveStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    denied: "bg-red-100 text-red-800",
    renewal: "bg-orange-100 text-orange-800",
    opened: "bg-blue-100 text-blue-800",
  };

  export default function LeaveReminder() {
    const router = useRouter();
    const { hasPermission, isLoading: isPermissionLoading } = usePermission();

    const canRead = hasPermission("leaveRequest.read");

    const { data, isLoading } = api.home.reminderView.useQuery(
       undefined,
       {
         enabled: canRead,
       }
    );

    return (
      <>
        {!isPermissionLoading && canRead && (
          <>
            {isLoading ? (
              <div className="w-64 rounded-lg border p-4 text-sm text-gray-500">
                Loading reminders…
              </div>
            ) : !data || data.length === 0 ? (
              <div className="w-64 rounded-lg border p-4 text-sm text-gray-500">
                No pending requests
              </div>
            ) : (
              <div className="w-64 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  Pending Leave Requests
                </h3>

                {data.map((req) => {
                  const statusClass =
                    statusColorMap[req.status as LeaveStatus] ??
                    "bg-gray-100 text-gray-800";

                  return (
                    <div
                      key={req.id}
                      onClick={() => router.push(`/leaveRequest/${req.id}`)}
                      className="cursor-pointer rounded-lg border bg-white p-3 shadow-sm transition hover:bg-gray-50"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {req.reasonOfLeave}
                      </p>

                      <span
                        className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-semibold ${statusClass}`}
                      >
                        {req.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </>
    );
  }
