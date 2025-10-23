// app/requests/edit/[id]/page.tsx

import EditRequestForLeave from "../editRequestForLeave";

export default function EditLeaveRequestPage({
  params,
}: {
  params: { id: string };
}) {
  const requestId = Number(params.id);

  if (isNaN(requestId)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-600">Invalid request ID</p>
      </div>
    );
  }

  return <EditRequestForLeave requestId={requestId} />;
}
