import Link from "next/link";
import { Mail, MessageCircle, MapPin } from "lucide-react";

export const metadata = {
  title: "Contact - FotoFlow.ai",
  description: "Get in touch with the FotoFlow.ai team.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#111827] px-4 py-16 text-slate-100">
      <div className="mx-auto w-full max-w-3xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#5B7CFF]">
            Nous contacter
          </p>
          <h1 className="mt-2 text-4xl font-bold">Contactez-nous</h1>
          <p className="mt-4 text-lg text-slate-300">
            Une question ? Nous sommes ici pour vous aider.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="mb-12 grid gap-6 md:grid-cols-3">
          {/* Email */}
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#5B7CFF]/20">
              <Mail className="h-6 w-6 text-[#5B7CFF]" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Email</h3>
            <p className="mt-2 text-sm text-slate-300">support@fotoflow.ai</p>
            <p className="mt-1 text-xs text-slate-400">Réponse sous 24h</p>
          </div>

          {/* WhatsApp */}
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#25D366]/20">
              <MessageCircle className="h-6 w-6 text-[#25D366]" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">WhatsApp</h3>
            <p className="mt-2 text-sm text-slate-300">+33 (0)1 23 45 67 89</p>
            <p className="mt-1 text-xs text-slate-400">Chat en direct</p>
          </div>

          {/* Location */}
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#7C4DFF]/20">
              <MapPin className="h-6 w-6 text-[#7C4DFF]" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Bureau</h3>
            <p className="mt-2 text-sm text-slate-300">Paris, France</p>
            <p className="mt-1 text-xs text-slate-400">Rendez-vous sur demande</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-8">
          <h2 className="text-2xl font-semibold">Envoyez-nous un message</h2>
          <form className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="text"
                placeholder="Votre nom"
                className="rounded-lg border border-white/10 bg-slate-950/50 px-4 py-3 text-sm placeholder-slate-500 transition focus:border-[#5B7CFF] focus:outline-none"
              />
              <input
                type="email"
                placeholder="Votre email"
                className="rounded-lg border border-white/10 bg-slate-950/50 px-4 py-3 text-sm placeholder-slate-500 transition focus:border-[#5B7CFF] focus:outline-none"
              />
            </div>
            <input
              type="text"
              placeholder="Sujet"
              className="w-full rounded-lg border border-white/10 bg-slate-950/50 px-4 py-3 text-sm placeholder-slate-500 transition focus:border-[#5B7CFF] focus:outline-none"
            />
            <textarea
              placeholder="Votre message..."
              rows={5}
              className="w-full rounded-lg border border-white/10 bg-slate-950/50 px-4 py-3 text-sm placeholder-slate-500 transition focus:border-[#5B7CFF] focus:outline-none"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-[#5B7CFF] px-4 py-3 font-semibold text-white transition hover:bg-[#7C4DFF]"
            >
              Envoyer le message
            </button>
          </form>
        </div>

        {/* Back Button */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm font-medium transition hover:border-white/40"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
