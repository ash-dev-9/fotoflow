 "use client";

import { useState } from "react";
import { UserButton, useAuth } from "@clerk/nextjs";
import {
  Camera,
  Check,
  CloudUpload,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  Stamp,
  MessageCircle,
} from "lucide-react";

const navItems = [
  { label: "Fonctionnalites", href: "#features" },
  { label: "Comment ca marche", href: "#how-it-works" },
  { label: "Tarifs", href: "#pricing" },
];

const steps = [
  {
    icon: CloudUpload,
    title: "1. Le photographe upload",
    description: "Importez vos galeries en un clic depuis votre ordinateur.",
  },
  {
    icon: Camera,
    title: "2. L'invite prend un selfie",
    description: "Via un simple QR code, l'invite se prend en photo.",
  },
  {
    icon: Sparkles,
    title: "3. La magie opere",
    description: "L'IA scanne la galerie et livre les photos par magie.",
  },
];

const features = [
  {
    icon: Sparkles,
    title: "Reconnaissance faciale ultra-rapide",
    description:
      "Distribution instantanee de milliers de photos en quelques secondes.",
  },
  {
    icon: ShieldCheck,
    title: "Galeries privees & securisees (RGPD)",
    description:
      "Donnees protegees et controle d'acces strict pour chaque evenement.",
  },
  {
    icon: Stamp,
    title: "Filigranes (Watermarks) automatiques",
    description: "Ajoutez votre signature de marque sur chaque photo livree.",
  },
  {
    icon: MessageCircle,
    title: "Integration WhatsApp",
    description:
      "Envoi direct des photos sur le canal prefere de vos invites.",
  },
];

export function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isSignedIn } = useAuth();

  return (
    <div className="bg-grid min-h-screen bg-[#111827] text-slate-100 antialiased">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#111827]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <a href="#" className="inline-flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#5B7CFF] to-[#7C4DFF] text-sm font-bold text-white shadow-[0_0_30px_rgba(91,124,255,0.35)]">
              F
            </span>
            <span className="text-sm font-semibold tracking-wide sm:text-base">
              FotoFlow.ai
            </span>
          </a>

          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="transition hover:text-white">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {!isSignedIn && (
              <>
              <a href="/login" className="text-sm text-slate-300 transition hover:text-white">
                Connexion
              </a>
              <a
                href="/signup"
                className="rounded-full bg-[#5B7CFF] px-4 py-2 text-sm font-medium text-white shadow-[0_0_30px_rgba(91,124,255,0.35)] transition hover:scale-[1.02] hover:bg-[#7C4DFF]"
              >
                Commencer gratuitement
              </a>
              </>
            )}
            {isSignedIn && (
              <>
              <a
                href="/dashboard"
                className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-white/40"
              >
                Dashboard
              </a>
              <UserButton />
              </>
            )}
          </div>

          <button
            type="button"
            aria-label="Ouvrir le menu"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="inline-flex rounded-lg border border-white/15 p-2 text-slate-200 transition hover:border-white/30 hover:text-white md:hidden"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-white/10 bg-[#0f172a]/95 md:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col px-4 py-4 sm:px-6">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-2 py-2 text-sm text-slate-200 transition hover:bg-white/5 hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              {!isSignedIn && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <a
                    href="/login"
                    className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/40 hover:text-white"
                  >
                    Connexion
                  </a>
                  <a
                    href="/signup"
                    className="inline-flex items-center justify-center rounded-full bg-[#5B7CFF] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#7C4DFF]"
                  >
                    Essayer gratuit
                  </a>
                </div>
              )}
              {isSignedIn && (
                <a
                  href="/dashboard"
                  className="mt-3 inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-white/40"
                >
                  Ouvrir le dashboard
                </a>
              )}
            </nav>
          </div>
        )}
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pt-24">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-[#5B7CFF]/40 bg-[#5B7CFF]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#5B7CFF]">
              IA pour photographes d'evenements
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              Livrez vos photos d'evenements en un instant grace a l'IA.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Ne perdez plus de temps a trier. Vos invites prennent un selfie,
              notre reconnaissance faciale trouve et leur envoie leurs photos
              instantanement sur leur telephone.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {!isSignedIn && (
                <a
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-full bg-[#5B7CFF] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(91,124,255,0.35)] transition hover:scale-[1.02] hover:bg-[#7C4DFF]"
                >
                  Creer mon premier evenement
                </a>
              )}
              {isSignedIn && (
                <a
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-full bg-[#5B7CFF] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(91,124,255,0.35)] transition hover:scale-[1.02] hover:bg-[#7C4DFF]"
                >
                  Ouvrir mon dashboard
                </a>
              )}
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/40 hover:text-white"
              >
                Voir le fonctionnement
              </a>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-2xl">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#5B7CFF]/30 blur-3xl" />
            <div className="absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-[#7C4DFF]/30 blur-3xl" />
            <div className="relative grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <p className="mb-3 text-xs font-medium text-slate-400">Selfie invite</p>
                <div className="aspect-[9/16] rounded-xl bg-slate-800 p-3">
                  <div className="h-2 w-20 rounded bg-slate-700" />
                  <div className="mt-4 h-[78%] rounded-lg border border-dashed border-slate-600" />
                  <div className="mt-3 h-2 w-24 rounded bg-slate-700" />
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="h-1 w-10 rounded-full bg-[#5B7CFF] shadow-[0_0_30px_rgba(91,124,255,0.35)] sm:h-10 sm:w-1" />
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <p className="mb-3 text-xs font-medium text-slate-400">Galerie pro</p>
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="aspect-video rounded-lg bg-slate-700" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              Comment ca marche ?
            </h2>
            <p className="mt-3 text-slate-300">
              3 etapes simples pour automatiser votre livraison.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 transition hover:-translate-y-0.5 hover:border-[#5B7CFF]/40"
              >
                <div className="mb-4 inline-flex rounded-xl bg-[#5B7CFF]/15 p-3 text-[#5B7CFF]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              Fonctionnalites premium
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 transition hover:-translate-y-0.5 hover:border-[#5B7CFF]/40"
              >
                <div className="mb-4 inline-flex rounded-xl bg-[#5B7CFF]/15 p-3 text-[#5B7CFF]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-slate-300">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              Tarifs simples et evolutifs
            </h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 transition hover:border-[#5B7CFF]/40">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold uppercase tracking-wide text-[#5B7CFF]">
                  A la carte
                </p>
                <span className="rounded-full border border-white/20 px-2.5 py-1 text-[11px] font-medium text-slate-300">
                  Flex
                </span>
              </div>
              <h3 className="mt-2 text-2xl font-semibold">Payez par evenement</h3>
              <p className="mt-3 text-sm text-slate-300">
                Ideal pour tester la plateforme sans engagement.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-slate-200">
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-[#5B7CFF]" />
                  Facturation a l'evenement
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-[#5B7CFF]" />
                  Acces a toutes les fonctions IA
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-[#5B7CFF]" />
                  Support standard
                </li>
              </ul>
              <a
                href="/signup?plan=event"
                className="mt-8 inline-flex rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold transition hover:border-white/40"
              >
                Choisir ce plan
              </a>
            </article>

            <article className="rounded-2xl border border-[#5B7CFF]/50 bg-gradient-to-b from-[#5B7CFF]/20 to-slate-900/60 p-6 shadow-[0_0_30px_rgba(91,124,255,0.35)] transition hover:-translate-y-0.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold uppercase tracking-wide text-[#5B7CFF]">
                  Studio Pro
                </p>
                <span className="rounded-full bg-[#5B7CFF]/20 px-2.5 py-1 text-[11px] font-semibold text-[#A9BCFF]">
                  Populaire
                </span>
              </div>
              <h3 className="mt-2 text-2xl font-semibold">Abonnement mensuel</h3>
              <p className="mt-3 text-sm text-slate-200">
                Evenements illimites et options de marque blanche pour les
                studios exigeants.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-slate-100">
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-[#A9BCFF]" />
                  Evenements illimites
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-[#A9BCFF]" />
                  Marque blanche complete
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-[#A9BCFF]" />
                  Support prioritaire
                </li>
              </ul>
              <a
                href="/signup?plan=studio-pro"
                className="mt-8 inline-flex rounded-full bg-[#5B7CFF] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#7C4DFF]"
              >
                Passer en Studio Pro
              </a>
            </article>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-400 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-[#5B7CFF] to-[#7C4DFF] text-xs font-bold text-white">
              F
            </span>
            <span>FotoFlow.ai</span>
            <span className="text-slate-500">- © 2026 Tous droits reserves</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <a href="/legal" className="transition hover:text-slate-200">
              Mentions Legales
            </a>
            <a href="/privacy" className="transition hover:text-slate-200">
              Politique de confidentialite
            </a>
            <a href="/contact" className="transition hover:text-slate-200">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
