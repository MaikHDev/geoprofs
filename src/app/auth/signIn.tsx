"use client";
import {useState} from "react";
import {signIn} from "../../../utils/auth-actions";
import {useRouter} from "next/navigation";

export default function SignInPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    async function handleSignIn(e: React.FormEvent) {
        e.preventDefault();

        setError(null);

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setLoading(true);
        try {
            const result = await signIn(email, password);

            if (!result.user) {
                setError("Invalid email or password");
            }

            if (result.redirect && result.url) {
                console.log(result.url)
                router.push(result.url);
                router.refresh();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <form
                onSubmit={handleSignIn}
                className="w-full max-w-sm rounded-xl bg-white p-8 shadow-md"
            >
                <h1 className="mb-6 text-center text-2xl font-bold">Sign In</h1>
                <h2 className="mb-6 text-center text-red-500">{error}</h2>
                <div className="mb-4">
                    <label className="mb-1 block font-medium">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border px-3 py-2 focus:ring focus:ring-blue-300 focus:outline-none"
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="mb-1 block font-medium">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg border px-3 py-2 focus:ring focus:ring-blue-300 focus:outline-none"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-blue-600 py-2 text-white transition hover:bg-blue-700"
                >
                    {loading ? "Signing in..." : "Sign In"}
                </button>
            </form>
        </div>
    );
}