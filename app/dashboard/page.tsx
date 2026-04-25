export const dynamic = "force-dynamic";

import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { Plus, Image as ImageIcon, ArrowLeft, Activity, Users, Camera, Palette } from "lucide-react";

export default async function DashboardPage() {
  const { prisma } = await import("@/lib/prisma");
  const { userId } = await auth();
  const user = await currentUser();
  let eventCount = 0;
  let dbError = null;

  try {
    if (userId) {
      eventCount = await prisma.event.count({
        where: { userId },
      });
    }
  } catch (error: any) {
    dbError = error.message || String(error);
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-blue-500/30">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 border-b border-zinc-800/80 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-sm">
              <span className="text-xs font-bold text-white">F</span>
            </div>
            <span className="text-sm font-medium tracking-tight text-white">
              Studio<span className="text-blue-500">.ai</span>
            </span>
          </div>
          <Link
            href="/"
            className="group flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Retour au site
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Vue d'ensemble</h1>
          <p className="mt-2 text-lg text-zinc-400">
            Bienvenue dans votre espace, <span className="text-white">{user?.firstName ?? user?.primaryEmailAddress?.emailAddress ?? "photographe"}</span>.
          </p>
        </div>

        {dbError && (
          <div className="mb-8 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-sm font-medium text-red-400">Erreur de connexion à la base de données</p>
            <pre className="mt-2 whitespace-pre-wrap text-xs font-mono text-red-300">{dbError}</pre>
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Stat Card 1 */}
          <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-400">Événements Actifs</p>
              <Activity className="h-4 w-4 text-blue-500" />
            </div>
            <p className="mt-4 text-3xl font-semibold text-white">{eventCount}</p>
          </div>

          {/* Stat Card 2 */}
          <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-400">Photos Livrées</p>
              <ImageIcon className="h-4 w-4 text-purple-500" />
            </div>
            <p className="mt-4 text-3xl font-semibold text-white">0</p>
          </div>

          {/* Stat Card 3 */}
          <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-400">Invités Reconnus</p>
              <Users className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-4 text-3xl font-semibold text-white">0</p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col gap-3">
            <Link
              href="/events/new"
              className="group flex h-full flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-4 text-sm font-semibold text-zinc-950 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="h-5 w-5" />
              Nouvel événement
            </Link>
            <Link
              href="/events"
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/50 px-4 py-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              <Camera className="h-4 w-4" />
              Voir mes galeries
            </Link>
            <Link
              href="/studio"
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/50 px-4 py-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              <Palette className="h-4 w-4" />
              Paramètres du Studio
            </Link>
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-zinc-800/60 bg-zinc-900/20 p-6">
          <h2 className="text-lg font-semibold text-white">Activité récente</h2>
          <div className="mt-6 flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800/50">
              <ImageIcon className="h-6 w-6 text-zinc-500" />
            </div>
            <p className="mt-4 text-sm font-medium text-zinc-300">Aucune activité récente</p>
            <p className="mt-1 text-sm text-zinc-500">Créez votre premier événement pour commencer.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
