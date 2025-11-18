"use client";

import { type FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSessionContext } from "~/app/_components/session-provider";
import ReturnView from "~/app/_components/returnView";
import { resetPassword } from "../../../utils/auth-client";
import { toast, ToastContainer } from "react-toastify";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [passwordCon, setPasswordCon] = useState("");
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const session = useSessionContext();

  const router = useRouter();

  if (!session) {
    return (
      <ReturnView
        returnPath="/auth"
        returnName="Login"
        label="You need to be logged in for this action!"
      />
    );
  }

  if (!token) {
    console.log("params: ", token);
    return <div>Invalid token</div>;
  }

  const handlePasswordReset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("HELLO");
    if (!password || !passwordCon) {
      setError("Both passwords need to be set!");
      return;
    }
    if (password.length < 8 || passwordCon.length < 8) {
      setError("Password needs to be 8 characters or more!");
      return;
    }
    if (password !== passwordCon) {
      setError("Passwords don't match!");
      return;
    }

    const result = await resetPassword({
      newPassword: password,
      token,
    });

    if (result?.data?.status) {
      toast.success("Successfully reset password");
      setTimeout(() => {
        router.push("/");
      }, 1000);
    }

    if (result?.error) {
      toast.error(result.error.message);
    }
  };

  return (
    <>
      <ToastContainer />
      <form onSubmit={(e) => handlePasswordReset(e)}>
        <input
          type="text"
          onChange={(e) => setPassword(e.target.value)}
          min="8"
          required={true}
        />
        <input
          type="text"
          onChange={(e) => setPasswordCon(e.target.value)}
          min="8"
          required={true}
        />
        {error && <div className="text-red-500">{error}</div>}
        <button type="submit">
          Reset password
        </button>
      </form>
    </>
  );
}
