import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

async function createEvent(formData: FormData) {
  "use server";

  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  const name = String(formData.get("name") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const plan = String(formData.get("plan") ?? "event");

  if (!name || !date) {
    redirect("/events/new");
  }

  await prisma.event.create({
    data: {
      userId,
      name,
      date: new Date(date),
      plan,
      status: "Actif",
    },
  });

  revalidatePath("/events");
  revalidatePath("/dashboard");
  redirect("/events");
}

export default async function NewEventPage() {
  await auth();

  return (
    <main className="min-h-screen bg-[#111827] px-4 py-16 text-slate-100">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-white/10 bg-slate-900/60 p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#5B7CFF]">
          Creation
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Nouveau evenement</h1>
        <p className="mt-3 text-sm text-slate-300">
          Formulaire de creation (version UI). Vous pourrez ensuite brancher la persistence.
        </p>

        <form action={createEvent} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-slate-200" htmlFor="event-name">
              Nom de l&apos;evenement
            </label>
            <input
              id="event-name"
              name="name"
              type="text"
              placeholder="Mariage - Sarah & Amir"
              required
              className="w-full rounded-xl border border-white/15 bg-slate-950/60 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-500 focus:border-[#5B7CFF]"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-slate-200" htmlFor="event-date">
                Date
              </label>
              <input
                id="event-date"
                name="date"
                type="date"
                required
                className="w-full rounded-xl border border-white/15 bg-slate-950/60 px-3 py-2.5 text-sm outline-none transition focus:border-[#5B7CFF]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-slate-200" htmlFor="event-plan">
                Plan
              </label>
              <select
                id="event-plan"
                name="plan"
                className="w-full rounded-xl border border-white/15 bg-slate-950/60 px-3 py-2.5 text-sm outline-none transition focus:border-[#5B7CFF]"
                defaultValue="event"
              >
                <option value="event">A la carte</option>
                <option value="studio-pro">Studio Pro</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-xl bg-[#5B7CFF] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#7C4DFF]"
          >
            Creer l&apos;evenement
          </button>
        </form>

        <div className="mt-6">
          <Link
            href="/events"
            className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm font-medium transition hover:border-white/40"
          >
            Retour a mes evenements
          </Link>
        </div>
      </div>
    </main>
  );
}
