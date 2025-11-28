import CreateRequest from "./createRequestForLeave";
import { getUserSession } from "utils/auth-actions";

export default async function LeaveRequestPage() {

    const session = await getUserSession();

    return (
        <>
        {session && (<CreateRequest/>)}
        </>
    )
}