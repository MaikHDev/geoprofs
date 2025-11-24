"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import ErrorHandler from "~/app/_components/errorHandler";

export default function VerifyEmail() {
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const err = searchParams.get("error");

  const router = useRouter();

  useEffect(() => {
    if (err) {
      setError(err);
      return;
    }

    toast.success("Please check your email for further instructions!");

    setTimeout(() => {
      router.push("/");
    }, 1000);
  }, [err, error, router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <ErrorHandler message={error} />
      </div>
    );
  }
}
