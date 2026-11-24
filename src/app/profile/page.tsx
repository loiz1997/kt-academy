import Link from "next/link";

export default function Soon() {
  return (
    <main className="mx-auto max-w-xl p-8">
      <p className="border border-dashed border-slate-300 p-4 text-slate-600">The profile page comes in Step 2.6.</p>
      <Link href="/dashboard" className="mt-4 inline-block font-semibold text-indigo-600 underline">
        ← Back to the dashboard
      </Link>
    </main>
  );
}
