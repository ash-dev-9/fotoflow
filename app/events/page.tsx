export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Calendar, Images } from "lucide-react";

export default async function EventsPage() {
  const { prisma } = await import("@/lib/prisma");
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  const events = await prisma.event.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      photos: {
        select: { id: true },
      },
    },
  });

  return (
    <main className="min-h-screen bg-[#111827] px-4 py-16 text-slate-100">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#5B7CFF]">
              Evenements
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Mes evenements</h1>
          </div>
          <Link
            href="/events/new"
            className="inline-flex rounded-full bg-[#5B7CFF] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#7C4DFF]"
          >
            Nouvel evenement
          </Link>
        </div>

        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 bg-slate-950/40 p-6 text-center">
              <p className="text-sm text-slate-300">Aucun evenement pour le moment.</p>
              <Link
                href="/events/new"
                className="mt-4 inline-flex rounded-full bg-[#5B7CFF] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#7C4DFF]"
              >
                Creer votre premier evenement
              </Link>
            </div>
          ) : (
            events.map((event) => (
              <article
                key={event.id}
                className="rounded-xl border border-white/10 bg-slate-950/50 p-4 transition hover:border-white/20"
              >
                <Link
                  href={`/events/${event.id}`}
                  className="block space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-semibold text-white hover:text-[#5B7CFF]">
                      {event.name}
                    </h2>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                      event.status === "Actif"
                        ? "border border-green-500/30 bg-green-500/10 text-green-400"
                        : "border border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                    }`}>
                      {event.status}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-white/10 bg-slate-900/50 p-3">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Calendar className="h-4 w-4" />
                        Date
                      </div>
                      <p className="mt-1 text-sm text-white">
                        {event.date.toLocaleDateString("fr-FR")}
                      </p>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-slate-900/50 p-3">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Images className="h-4 w-4" />
                        Photos
                      </div>
                      <p className="mt-1 text-sm text-white">
                        {event.photos.length}
                      </p>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-slate-900/50 p-3">
                      <p className="text-xs text-slate-400">Plan</p>
                      <p className="mt-1 text-sm text-white">{event.plan}</p>
                    </div>
                  </div>
                </Link>
              </article>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
