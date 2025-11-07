import { HydrateClient } from "~/trpc/server";
import LogsPage from "~/app/logs/logs";
import { logAction } from "../../../utils/log-handle";

export default async function Page() {

    const details = {
      context: "leave_requests" as const,
      after: {
        reasonOfLeave: "leave" as const,
        status: "approved" as const,
        dateLeaveStart: new Date(),
        dateLeaveEnd: new Date(),
        reasoning: "BLA BLA BLA"
      },
    };
      // await logAction({logContext: "leave_requests", logEvent: "created", details: details, userId: "8TbfUkizCKn7NS6qsy1txAy8NhTojQ85"})


  return (
    <HydrateClient>
      <LogsPage />
    </HydrateClient>
  );
}
