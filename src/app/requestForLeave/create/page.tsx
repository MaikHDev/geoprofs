import { usePermission } from "~/hooks/usePermission";
import CreateRequest from "./createRequestForLeave";

export default async function LeaveRequestPage() {

    if(!usePermission('leaveRequest.create')) return {message: "No access granted!"};

    return (
        <>
        {<CreateRequest/>}
        </>
    )
}