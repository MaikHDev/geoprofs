import { HydrateClient } from "~/trpc/server";
import LogsPage from "~/app/logs/logs";

export default async function Page() {
  return (
    <HydrateClient>
      <LogsPage />
    </HydrateClient>
  );
}
