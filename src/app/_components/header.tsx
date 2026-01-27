"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { api } from "~/trpc/react";
import { toast, ToastContainer } from "react-toastify";
import { useSessionContext } from "~/app/_components/session-provider";
import { HasPermission } from "../../../utils/hasPermission";

type NavItem = {
  label: string;
  show?: boolean;
} & ({ href: string; onClick?: never } | { onClick: () => void; href?: never });

export default function Header() {
  const pathname = usePathname();

  const session = useSessionContext();
  const isAuthenticated = !!session?.user;

  const hasPermission = HasPermission(session?.perms);

  const [showConfirmation, setShowConfirmation] = useState(false);

  const createRequest = api.requestForLeave.create.useMutation({
    onSuccess: () => {
      toast.success("Successfully called in sick today");
    },
    onError: () => {
      toast.error("You have already called in sick for today!");
    },
  });

  const urls = {
    home: "/",
    leaveRequests: "/requestForLeave/view",
    requestForLeave: "/requestForLeave/create",
    reviewLeaveRequests: "/leaveRequests",
    auth: "/auth",
    dashboard: "/dashboard",
    leavePlanning: "/leavePlanning",
  } as const;

  const handleCallInSick = () => {
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    createRequest.mutate({
      reasonOfLeave: "medical",
      dateLeaveStart: new Date(),
      dateLeaveEnd: new Date(),
      reasoning: "Sick",
    });

    setShowConfirmation(false);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  const navItems: NavItem[] = [
    { label: "Home", href: urls.home },
    {
      label: "Leave requests",
      href: urls.leaveRequests,
      show: isAuthenticated && hasPermission("LeaveRequest.read"),
    },
    {
      label: "Make leave request",
      href: urls.requestForLeave,
      show: isAuthenticated && hasPermission("LeaveRequest.create"),
    },
    {
      label: "Call in sick",
      onClick: handleCallInSick,
      show: isAuthenticated && hasPermission("LeaveRequest.create"),
    },
    {
      label: "Leave Planning",
      href: urls.leavePlanning,
      show: isAuthenticated && hasPermission("LeaveRequestUseOthers.read"),
    },
    {
      label: "Review Leave requests",
      href: urls.reviewLeaveRequests,
      show:
        isAuthenticated && hasPermission("LeaveRequestReviewUseOthers.create"),
    },
    { label: "Login", href: urls.auth, show: !isAuthenticated },
    { label: "Dashboard", href: urls.dashboard, show: isAuthenticated },
  ];

  return (
    <>
      <ToastContainer />
      <header className="flex items-center justify-between bg-white px-6 py-4 shadow-md">
        <h1 className="text-2xl font-bold text-gray-800">
          <Link href={urls.home}>Geoprofs</Link>
        </h1>
        <nav className="space-x-6">
          {navItems
            .filter((item) => item.show ?? true)
            .map((item, index) => {
              if (item.onClick) {
                return (
                  <button
                    key={index}
                    onClick={item.onClick}
                    className="font-inherit cursor-pointer border-none bg-transparent p-0 text-gray-700 transition hover:text-blue-600"
                  >
                    {item.label}
                  </button>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    pathname === item.href
                      ? "text-blue-600"
                      : "text-gray-700 transition hover:text-blue-600"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
        </nav>

        {showConfirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="bg-opacity-50 absolute inset-0 bg-black"
              onClick={handleCancel}
            />

            <div className="relative mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              <h2 className="mb-4 text-xl font-semibold text-gray-800">
                Confirm Action
              </h2>
              <p className="mb-6 text-gray-600">
                Are you sure you want to call in sick today?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancel}
                  className="rounded bg-gray-200 px-4 py-2 text-gray-700 transition hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
