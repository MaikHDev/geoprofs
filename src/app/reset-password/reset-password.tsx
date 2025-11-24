"use client";

import { type FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "../../../utils/auth-client";
import { toast, ToastContainer } from "react-toastify";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [passwordCon, setPasswordCon] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordCon, setShowPasswordCon] = useState(false);

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const router = useRouter();

  const handlePasswordReset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Invalid request, you don't have a token!");
      return;
    }

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

    setIsSubmitting(true);

    try {
      const result = await resetPassword({
        newPassword: password,
        token,
      });

      if (result?.data?.status) {
        toast.success("Successfully reset password");
        setTimeout(() => {
          router.push("/");
        }, 1500);
      }

      if (result?.error?.message) {
        toast.error(result.error.message);
        setError(result.error.message);
      }
    } catch (err) {
      if (err && err instanceof Error) {
        toast.error(err.message);
        setError(err.message);
      } else {
      }
      toast.error("An unexpected error occurred");
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        <form
          onSubmit={handlePasswordReset}
          className="space-y-6 rounded-[4px] border border-[#CCCCCC] bg-white p-8 shadow-md"
        >
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-[#000000]">
              Reset Your Password
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Enter your new password below
            </p>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium text-[#000000]">
              New Password:
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
                placeholder="Enter new password"
                className="w-full rounded-[4px] border border-[#CCCCCC] px-3 py-2 pr-10 text-[#000000] focus:ring-2 focus:ring-[#00888F] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Must be at least 8 characters
            </p>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium text-[#000000]">
              Confirm Password:
            </label>
            <div className="relative">
              <input
                type={showPasswordCon ? "text" : "password"}
                value={passwordCon}
                onChange={(e) => setPasswordCon(e.target.value)}
                minLength={8}
                required
                placeholder="Confirm new password"
                className="w-full rounded-[4px] border border-[#CCCCCC] px-3 py-2 pr-10 text-[#000000] focus:ring-2 focus:ring-[#00888F] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPasswordCon(!showPasswordCon)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswordCon ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-[4px] border border-red-300 bg-red-50 p-3 text-sm text-red-600">
              <div className="flex items-center">
                <svg
                  className="mr-2 h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full rounded-[4px] py-3 font-semibold text-white transition-colors ${
              isSubmitting
                ? "cursor-not-allowed bg-[#CCCCCC]"
                : "bg-[#00888F] hover:bg-[#00767C]"
            }`}
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push("/auth")}
              className="text-sm text-[#00888F] hover:underline"
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}
