import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();
  const eventCount = userId
    ? await prisma.event.count({
        where: { userId },
      })
    : 0;

  return (
    <main className="min-h-screen bg-[#111827] px-4 py-16 text-slate-100">
      <div className="mx-auto w-full max-w-5xl rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-[0_0_40px_rgba(91,124,255,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#5B7CFF]">
              Espace Studio
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Dashboard</h1>
            <p className="mt-3 text-sm text-slate-300">
              Bienvenue {user?.firstName ?? user?.primaryEmailAddress?.emailAddress ?? "photographe"}.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm font-medium transition hover:border-white/40"
          >
            Retour a l&apos;accueil
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
            <p className="text-xs text-slate-400">ID utilisateur</p>
            <p className="mt-1 truncate text-sm">{userId}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
            <p className="text-xs text-slate-400">Evenements actifs</p>
            <p className="mt-1 text-sm">{eventCount}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
            <p className="text-xs text-slate-400">Photos distribuees</p>
            <p className="mt-1 text-sm">0 (placeholder)</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/events/new"
            className="inline-flex items-center justify-center rounded-xl bg-[#5B7CFF] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#7C4DFF]"
          >
            Creer un evenement
          </Link>
          <Link
            href="/events"
            className="inline-flex items-center justify-center rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/40"
          >
            Importer des photos
          </Link>
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-slate-950/50 p-4">
          <p className="text-xs text-slate-400">Endpoint protege</p>
          <p className="mt-1 text-sm text-slate-200">GET /api/me</p>
          <p className="mt-2 text-xs text-slate-400">
            Utilisez cet endpoint pour recuperer l&apos;identite connectee depuis votre frontend.
          </p>
        </div>
      </div>
    </main>
  );
}
