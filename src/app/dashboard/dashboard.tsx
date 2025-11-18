import Link from "next/link";

export default function Dashboard() {
  return (
    <>
      <Link href="/profile">
        <div className="flex h-8 w-20 bg-gray-400 p-2 m-4 items-center justify-center">profile</div>
      </Link>
    </>
  );
}
