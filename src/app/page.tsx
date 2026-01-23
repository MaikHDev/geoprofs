import { HydrateClient } from "~/trpc/server";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

export default async function Home() {
  const router = useRouter();
  const {
    data,
    isLoading: isDataLoading,
  } = api.home.reminderView.useQuery();

  return (
    <HydrateClient>
      <></>
    </HydrateClient>
  );
}
