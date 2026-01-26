"use client"

import Link from "next/link";
import { useSessionContext } from "~/app/_components/session-provider";
import { HasPermission } from "../../../utils/hasPermission";

export default function Dashboard() {
  const session = useSessionContext();
  const hasPermission = HasPermission(session?.perms);

  return (
    <div className="px-4 py-8">
      <div className="mx-auto w-full max-w-4xl space-y-6 rounded-[4px] border border-[#CCCCCC] bg-white p-8 shadow-md">
        <h1 className="text-center text-2xl font-semibold text-[#000000]">
          Dashboard
        </h1>

        <div className="border-t border-[#CCCCCC] pt-6">
          <h2 className="mb-4 text-lg font-medium text-[#000000]">
            Quick Actions
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/profile">
              <div className="group cursor-pointer rounded-[4px] border border-[#CCCCCC] bg-white p-6 shadow-sm transition-all hover:border-[#00888F] hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[4px] bg-[#00888F] text-white transition-colors group-hover:bg-[#00767C]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#000000]">My Profile</h3>
                    <p className="text-sm text-gray-600">
                      View and edit your profile
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            {hasPermission("UserUseOthers.create") && (
              <Link href="/user/create">
                <div className="group cursor-pointer rounded-[4px] border border-[#CCCCCC] bg-white p-6 shadow-sm transition-all hover:border-[#00888F] hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[4px] bg-[#00888F] text-white transition-colors group-hover:bg-[#00767C]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-6 w-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#000000]">
                        Create New User
                      </h3>
                      <p className="text-sm text-gray-600">
                        Add a new user account
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
