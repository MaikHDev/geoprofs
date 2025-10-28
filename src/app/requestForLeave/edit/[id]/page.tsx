"use client"

import { useParams } from "next/navigation";
import EditRequestForLeave from "../editRequestForLeave";
import { usePermission } from "~/hooks/usePermission";

export default function EditLeaveRequestPage() {
  const params = useParams();
  const requestId = Number(params.id);

  if(!usePermission('leaveRequest.edit')) return {message: "No access granted!"}

  return <EditRequestForLeave requestId={requestId}/>;
}
