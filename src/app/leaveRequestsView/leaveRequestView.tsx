import { api } from "~/trpc/react";

export default function LeaveRequestView() {
    
    const { data } = api.leaveRequest.viewStatus.useQuery();

    if(!data) return;

    return(
        <>
            {data.map((req) => (
                <li
                    key={req.id}
                >
                   <div>
                        <p>
                            <div>start date: {req.dateLeaveStart.toLocaleDateString()}</div> 
                            <div>end date: {req.dateLeaveEnd.toLocaleDateString()}</div> 
                        </p>
                        </div>
                        <p><strong>Reason:</strong> {req.reasonOfLeave}</p>
                        <span>
                            {req.status}
                        </span>
                </li>
            ))}
        </>
    )
}