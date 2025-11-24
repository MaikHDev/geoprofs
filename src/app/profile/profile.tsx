"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";
import { requestPasswordReset, signOut } from "../../../utils/auth-client";
import { useRouter } from "next/navigation";
import ReturnView from "~/app/_components/returnView";
import { useSessionContext } from "~/app/_components/session-provider";
import { api } from "~/trpc/react";
import { HasPermission } from "../../../utils/hasPermission";
import { allowedTypes } from "../../../utils/allowedFileTypes";

export default function Profile() {
  const session = useSessionContext();
  const user = session?.user;
  const hasPermission = HasPermission(session?.perms);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const router = useRouter();

  const {
    data: profileData,
    isLoading,
    error,
  } = api.profile.getAccountInfo.useQuery(undefined, {
    retry: (failureCount, error) => {
      if (error?.data?.code === "UNAUTHORIZED") return false;

      return failureCount < 3;
    },
    enabled: hasPermission("UserProfile.read"),
    refetchOnWindowFocus: false,
  });

  if (!session) {
    return (
      <ReturnView
        returnPath="/auth"
        returnName="Login"
        label="You need to be logged in for this action!"
      />
    );
  }
  if (!hasPermission("UserProfile.read")) {
    return <ReturnView returnName="Dashboard" returnPath="/dashboard" />;
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
          toast.success("Successfully signed out!");
          router.push("/");
        },
      },
    });
  };

  const handleUploadChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const form = new FormData();
    form.append("file", file);
    form.append("userId", session.user.id);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      toast.success("Image uploaded!");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        toast.error("Upload timed out!");
      } else {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      }
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  let percent = 0;

  if (profileData?.vacationDays && profileData?.totalVacationDays) {
    percent = profileData?.vacationDays / profileData?.totalVacationDays;
  }

  const r = Math.round(255 * percent);
  const g = Math.round(255 * (1 - percent));
  const color = `rgb(${r}, ${g}, 0)`;

  return (
    <div className="px-4 py-8">
      <div className="mx-auto w-full max-w-4xl space-y-6 rounded-[4px] border border-[#CCCCCC] bg-white p-8 shadow-md">
        <div className="flex items-center justify-center gap-4">
          <h1 className="text-center text-2xl font-semibold text-[#000000]">
            My Profile
          </h1>
          {profileData?.image && (
            <img
              className="rounded-full"
              width={75}
              height={75}
              src={`/avatar/${profileData?.image}`}
              alt={"Profile image"}
            />
          )}
        </div>

        {isLoading && (
          <div className="font-semibold text-blue-500">Loading all data...</div>
        )}

        {error && (
          <div className="font-semibold text-red-500">{error.message}</div>
        )}

        <div className="space-y-4">
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-[#000000]">
              First Name:
            </label>
            <input
              type="text"
              value={user?.name ?? "-"}
              disabled
              className="cursor-not-allowed rounded-[4px] border border-[#CCCCCC] bg-gray-50 px-3 py-2 text-[#000000]"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium text-[#000000]">
              Last Name:
            </label>
            <input
              type="text"
              value={user?.lastName ?? "-"}
              disabled
              className="cursor-not-allowed rounded-[4px] border border-[#CCCCCC] bg-gray-50 px-3 py-2 text-[#000000]"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium text-[#000000]">Email:</label>
            <input
              type="email"
              value={user?.email ?? "-"}
              disabled
              className="cursor-not-allowed rounded-[4px] border border-[#CCCCCC] bg-gray-50 px-3 py-2 text-[#000000]"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium text-[#000000]">Role:</label>
            <input
              type="text"
              value={user?.role ?? "-"}
              disabled
              className="cursor-not-allowed rounded-[4px] border border-[#CCCCCC] bg-gray-50 px-3 py-2 text-[#000000]"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium text-[#000000]">
              Total Vacation Days:
            </label>
            <span className="text-xl">
              {profileData?.totalVacationDays ?? "-"}
            </span>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium">Vacation Days Left:</label>
            <span className={`text-[${color}] text-xl`}>
              {profileData?.vacationDaysUsed
                ? profileData?.totalVacationDays - profileData?.vacationDaysUsed
                : "-"}
            </span>
          </div>
        </div>

        <div className="border-t border-[#CCCCCC] pt-4">
          <p className="mb-2 font-medium text-[#000000]">
            Account Information:
          </p>
          <div className="space-y-2 text-sm text-[#000000]">
            <div>
              Member since:{" "}
              {profileData?.userCreatedAt?.toLocaleString() ?? "-"}
            </div>
            <div>
              Last login: {profileData?.lastLogin?.toLocaleString() ?? "-"}
            </div>
            <div>CSN: {profileData?.csn ?? "-"}</div>
          </div>
        </div>

        <div className="border-t border-[#CCCCCC] pt-4">
          <p className="mb-2 font-medium text-[#000000]">Change Image:</p>

          <label
            htmlFor="file-upload"
            className="inline-block cursor-pointer rounded-[4px] bg-[#00888F] px-6 py-2 font-semibold text-white transition-colors hover:bg-[#00767C]"
          >
            {isUploading ? "Uploading..." : "Choose File"}
          </label>
          <input
            id="file-upload"
            type="file"
            accept={allowedTypes.join(",")}
            className="hidden"
            onChange={handleUploadChange}
          />
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

        <div className="flex justify-end border-t border-[#CCCCCC] pt-4">
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
