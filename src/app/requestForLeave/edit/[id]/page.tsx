import EditRequestForLeave from "../editRequestForLeave";
import { getUserSession } from "utils/auth-actions";

export default async function EditLeaveRequestPage() {

  const session = await getUserSession();

  return(
    <>
   { session && (<EditRequestForLeave/>)}
    </>
  ) 
}
