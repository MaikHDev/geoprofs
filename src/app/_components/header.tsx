import Link from "next/link";

export default function Header(){
    return (
        <header className="flex items-center justify-between px-6 py-4 bg-white shadow-md">
            <h1 className="text-2xl font-bold text-gray-800">
                <Link href="/">Geoprofs</Link>
            </h1>

            <nav className="space-x-6">
                <Link href="/" className="text-gray-700 hover:text-blue-600 transition">
                    Home
                </Link>
                <Link href="/requestForLeave" className="text-gray-700 hover:text-blue-600 transition">
                    Make leave request
                </Link>
                <Link href="/auth" className="text-gray-700 hover:text-blue-600 transition">
                    Login
                </Link>
            </nav>
        </header>
    )
}