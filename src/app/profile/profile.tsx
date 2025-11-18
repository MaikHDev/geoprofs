"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";
import { requestPasswordReset, signOut } from "../../../utils/auth-client";
import { useRouter } from "next/navigation";
import ReturnView from "~/app/_components/returnView";
import { useSessionContext } from "~/app/_components/session-provider";

export default function Profile() {
  const session = useSessionContext();
  const user = session?.user;

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const date = new Date().toLocaleDateString();

  if (!session) {
    return (
      <ReturnView
        returnPath="/auth"
        returnName="Login"
        label="You need to be logged in for this action!"
      />
    );
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user) return;
      const { data } = await requestPasswordReset({
        email: user.email,
        redirectTo: "/reset-password",
      });

      if (data) {
        toast.success("Password reset email sent!");
      }
      setShowPasswordModal(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send reset email",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Successfully signed out!")
          router.push("/");
        },
      },
    });
  };

  return (
    <div className="px-4 py-8">
      <div className="mx-auto w-full max-w-4xl space-y-6 rounded-[4px] border border-[#CCCCCC] bg-white p-8 shadow-md">
        <h1 className="text-center text-2xl font-semibold text-[#000000]">
          My Profile
        </h1>

        <div className="space-y-4">
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-[#000000]">Name:</label>
            <input
              type="text"
              value={user?.name ?? ""}
              disabled
              className="cursor-not-allowed rounded-[4px] border border-[#CCCCCC] bg-gray-50 px-3 py-2 text-[#000000]"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium text-[#000000]">Email:</label>
            <input
              type="email"
              value={user?.email ?? ""}
              disabled
              className="cursor-not-allowed rounded-[4px] border border-[#CCCCCC] bg-gray-50 px-3 py-2 text-[#000000]"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium text-[#000000]">Role:</label>
            <input
              type="text"
              value={user?.role ?? ""}
              disabled
              className="cursor-not-allowed rounded-[4px] border border-[#CCCCCC] bg-gray-50 px-3 py-2 text-[#000000]"
            />
          </div>
        </div>

        <div className="border-t border-[#CCCCCC] pt-4">
          <p className="mb-2 font-medium text-[#000000]">Password:</p>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="rounded-[4px] bg-[#00888F] px-6 py-2 font-semibold text-white transition-colors hover:bg-[#00767C]"
          >
            Change Password
          </button>
        </div>

        <div className="border-t border-[#CCCCCC] pt-4">
          <p className="mb-2 font-medium text-[#000000]">
            Account Information:
          </p>
          <div className="space-y-2 text-sm text-[#000000]">
            <div>Member since: {date}</div>
            <div>Last login: {date}</div>
          </div>
        </div>
        <div className="border-t border-[#CCCCCC] pt-4">
          <button
            onClick={() => handleLogout()}
            className="rounded-[4px] bg-red-400 px-6 py-2 font-semibold text-white transition-colors hover:bg-red-500"
          >
            Logout
          </button>
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="bg-opacity-50 absolute inset-0 bg-black"
            onClick={() => {
              setShowPasswordModal(false);
            }}
          />

          <div className="relative mx-4 w-full max-w-md rounded-[4px] border border-[#CCCCCC] bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold text-[#000000]">
              Reset Password
            </h2>
            <p className="mb-4 text-sm text-[#000000]">
              {
                "Enter your email address and we'll send you a link to reset your password"
              }
              .
            </p>

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                  }}
                  className="flex-1 rounded-[4px] border border-[#CCCCCC] py-2 font-semibold text-[#000000] transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 rounded-[4px] py-2 font-semibold text-white transition-colors ${
                    isSubmitting
                      ? "cursor-not-allowed bg-[#CCCCCC]"
                      : "bg-[#00888F] hover:bg-[#00767C]"
                  }`}
                >
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
