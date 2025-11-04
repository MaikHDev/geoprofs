"use client";

import Link from "next/link";
import { usePermission } from "~/hooks/usePermission";
import { usePathname } from "next/navigation";
import { authClient } from "~/../utils/auth-client";
import { useEffect, useState } from "react";

export default function Header() {
  const pathname = usePathname();

  const [session, setSession] = useState(false);

  useEffect(() => {
    const s = authClient.useSession.get();
    if (s.data?.user) setSession(true);
  }, []);

  const hasPerm = usePermission({ enabled: session });

  const urls = {
    home: "/",
    requestForLeave: "/requestForLeave",
    leaveRequests: "/leaveRequests",
    auth: "/auth",
  } as const;

  const navItems = [
    { label: "Home", href: urls.home },
    {
      label: "Make leave request",
      href: urls.requestForLeave,
      show: session && hasPerm("LeaveRequest.create"),
    },
    {
      label: "Leave requests",
      href: urls.leaveRequests,
      show: session && hasPerm("LeaveRequestReviewUseOthers.create"),
    },
    { label: "Login", href: urls.auth, show: !session },
  ];

  return (
    <header className="flex items-center justify-between bg-white px-6 py-4 shadow-md">
      <h1 className="text-2xl font-bold text-gray-800">
        <Link href={urls.home}>Geoprofs</Link>
      </h1>

      <nav className="space-x-6">
        {navItems
          .filter((item) => item.show ?? true)
          .map((item) => (
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
          ))}
      </nav>
    </header>
  );
}
