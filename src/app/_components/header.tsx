"use client";

import Link from "next/link";
import {usePermission} from "~/hooks/usePermission";
import {usePathname} from "next/navigation";
import {useSession} from "~/../utils/auth-client";

export default function Header() {
    const pathname = usePathname();

    const session = useSession();
    const isAuthenticated = !!session?.data?.user;


    const {hasPermission} = usePermission({enabled: isAuthenticated});

    const urls = {
        home: "/",
        requestForLeave: "/requestForLeave",
        leaveRequests: "/leaveRequests",
        auth: "/auth",
    } as const;

    const navItems = [
        {label: "Home", href: urls.home},
        {
            label: "Make leave request",
            href: urls.requestForLeave,
            show: isAuthenticated && hasPermission("LeaveRequest.create"),
        },
        {
            label: "Leave requests",
            href: urls.leaveRequests,
            show: isAuthenticated && hasPermission("LeaveRequestReviewUseOthers.create"),
        },
        {label: "Login", href: urls.auth, show: !isAuthenticated},
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
