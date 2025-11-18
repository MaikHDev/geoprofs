"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ReturnView from "~/app/_components/returnView";
import { verifyEmail } from "../../../utils/auth-client";
import { toast, ToastContainer } from "react-toastify";
import { useSessionContext } from "~/app/_components/session-provider";

export default function VerifyEmail() {
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const session = useSessionContext();

  const router = useRouter();

  useEffect(() => {
    if (!token) {
      setError("Invalid request, you don't have a token!");
      return;
    }

    const verify = async () => {
      const result = await verifyEmail({
        query: {
          token,
        },
      });

      if (result?.data?.status) {
        toast.success("Successfully verified email!");
      }

      if (result?.error) {
        toast.error(result.error.message);
      }

      setTimeout(() => {
        router.push("/");
      }, 1000);
    };

    void verify();
  }, [router, token]);

  if (!session) {
    return (
      <ReturnView
        returnPath="/auth"
        returnName="Login"
        label="You need to be logged in for this action!"
      />
    );
  }

  return <>{error && <div className="text-xl text-red-500">{error}</div>}</>;
}
