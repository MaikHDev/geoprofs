import Link from "next/link";

interface ReturnViewProps {
    label?: string;
    returnPath?: string;
    returnName?: string;
}

export default function ReturnView({
    label = "No access granted, you do not have the required permissions!",
    returnPath = "/",
    returnName = "Home"
}: ReturnViewProps){
    return(
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white shadow-lg rounded-2xl p-8 text-center max-w-md w-full border border-gray-200">
            <h1 className="text-2xl font-semibold text-red-600 mb-4">Access Denied!</h1>
            <p className="text-gray-700 mb-6">{label}</p>
            <Link
                href={returnPath}
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors"
            >
            Return to {returnName}
            </Link>
        </div>
    </div>
    )
}