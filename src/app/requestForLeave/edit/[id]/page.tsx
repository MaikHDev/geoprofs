"use client"

import { useParams } from "next/navigation";
import EditRequestForLeave from "../editRequestForLeave";

export default function EditLeaveRequestPage() {
  const params = useParams();
  const requestId = Number(params.id);

  return <EditRequestForLeave requestId={requestId}/>;
}
