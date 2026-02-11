import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Link className="text-primary underline" href="/dashboard">
        Open RFID Dashboard
      </Link>
    </main>
  );
}
