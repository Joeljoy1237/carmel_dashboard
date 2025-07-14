import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Link href="/dashboard">Dashboard</Link>
    </div>
  );
}
