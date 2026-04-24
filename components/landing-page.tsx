"use client";

import { useState } from "react";
import { UserButton, useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
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
  ArrowRight,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Fonctionnalités", href: "#features" },
  { label: "Comment ça marche", href: "#how-it-works" },
  { label: "Tarifs", href: "#pricing" },
];

const steps = [
  {
    icon: CloudUpload,
    title: "1. Le photographe upload",
    description: "Importez vos galeries complètes en un clic depuis votre ordinateur. Notre IA s'occupe du reste.",
    image: "/images/step1_upload.png"
  },
  {
    icon: Camera,
    title: "2. L'invité prend un selfie",
    description: "Via un simple QR code ou lien, l'invité se prend en photo pour s'identifier.",
    image: "/images/step2_selfie.png"
  },
  {
    icon: Sparkles,
    title: "3. La magie opère",
    description: "La reconnaissance faciale isole toutes les photos de l'invité et lui livre sa galerie personnelle.",
    image: "/images/step3_gallery.png"
  },
];

const features = [
  {
    icon: Sparkles,
    title: "Reconnaissance ultra-rapide",
    description: "Distribution instantanée de milliers de photos en quelques secondes grâce à nos modèles IA optimisés.",
  },
  {
    icon: ShieldCheck,
    title: "Galeries privées & sécurisées",
    description: "Données protégées et contrôle d'accès strict (RGPD) pour chaque événement. Vos photos restent privées.",
  },
  {
    icon: Stamp,
    title: "Filigranes automatiques",
    description: "Protégez votre travail. Ajoutez votre signature ou logo en filigrane sur chaque photo livrée.",
  },
  {
    icon: MessageCircle,
    title: "Notification intelligente",
    description: "L'invité reçoit instantanément sa galerie triée sur son smartphone, prête à être partagée.",
  },
];

const fadeIn: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-blue-500/30">
      {/* Dynamic Background Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none flex justify-center overflow-hidden">
        <div className="absolute top-0 w-full max-w-7xl h-[600px] bg-blue-500/5 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute -top-[200px] right-[10%] w-[500px] h-[500px] bg-purple-500/5 blur-[100px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.05] bg-[#09090b]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[#09090b]/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="group relative flex items-center gap-2.5 transition-transform hover:scale-105 duration-300">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
              <span className="text-sm font-bold text-white">F</span>
              <div className="absolute inset-0 rounded-xl border border-white/20" />
            </div>
            <span className="text-base font-semibold tracking-tight text-white">
              FotoFlow<span className="text-blue-500">.ai</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-zinc-400 md:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="transition-colors hover:text-white">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            {!isSignedIn ? (
              <>
                <Link href="/login" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">
                  Connexion
                </Link>
                <Link
                  href="/signup"
                  className="group relative inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-950 transition-transform hover:scale-105 active:scale-95"
                >
                  <span className="relative z-10">Commencer</span>
                  <div className="absolute inset-0 rounded-full bg-white/20 blur-md transition-opacity group-hover:opacity-100 opacity-0" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/50 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
                >
                  Dashboard
                </Link>
                <UserButton appearance={{ elements: { avatarBox: "h-9 w-9 border border-zinc-800" } }} />
              </>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white md:hidden"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-zinc-800 bg-[#09090b] md:hidden overflow-hidden"
            >
              <div className="flex flex-col p-4 space-y-4">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="text-base font-medium text-zinc-300 hover:text-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
                <hr className="border-zinc-800" />
                {!isSignedIn ? (
                  <div className="flex flex-col gap-3">
                    <Link href="/login" className="flex justify-center rounded-lg bg-zinc-900 py-3 text-sm font-medium text-white border border-zinc-800">
                      Connexion
                    </Link>
                    <Link href="/signup" className="flex justify-center rounded-lg bg-white py-3 text-sm font-semibold text-zinc-950">
                      Commencer gratuitement
                    </Link>
                  </div>
                ) : (
                  <Link href="/dashboard" className="flex justify-center rounded-lg bg-white py-3 text-sm font-semibold text-zinc-950">
                    Ouvrir le dashboard
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="relative z-10 pt-24">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 pt-20 pb-24 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col items-center text-center"
          >
            <motion.div variants={fadeIn} className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-400 backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              <span>IA pour photographes professionnels</span>
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="max-w-4xl text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[5rem] lg:leading-[1.1]">
              Livrez vos photos d'événements{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                en un instant.
              </span>
            </motion.h1>
            
            <motion.p variants={fadeIn} className="mt-8 max-w-2xl text-lg text-zinc-400 sm:text-xl">
              Fini le tri manuel interminable. Vos invités prennent un selfie, notre IA trouve et distribue leurs photos privées en quelques secondes.
            </motion.p>
            
            <motion.div variants={fadeIn} className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              {!isSignedIn ? (
                <Link
                  href="/signup"
                  className="group flex h-12 items-center justify-center gap-2 rounded-full bg-white px-8 text-sm font-semibold text-zinc-950 transition-all hover:scale-105 hover:bg-zinc-100"
                >
                  Créer un événement
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="group flex h-12 items-center justify-center gap-2 rounded-full bg-white px-8 text-sm font-semibold text-zinc-950 transition-all hover:scale-105 hover:bg-zinc-100"
                >
                  Ouvrir le dashboard
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              )}
              <a
                href="#how-it-works"
                className="flex h-12 items-center justify-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-8 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              >
                Découvrir
              </a>
            </motion.div>
          </motion.div>

          {/* Hero Image Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" as any }}
            className="mx-auto mt-20 max-w-5xl"
          >
            <div className="relative aspect-video rounded-2xl border border-zinc-800/50 bg-zinc-900/30 p-2 shadow-2xl backdrop-blur-sm sm:rounded-3xl sm:p-4 lg:p-6">
              <div className="absolute inset-0 rounded-3xl ring-1 ring-white/10 ring-inset" />
              <div className="relative h-full w-full overflow-hidden rounded-xl border border-zinc-800 bg-[#09090b] shadow-inner sm:rounded-2xl">
                {/* Mockup Content */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 mix-blend-luminosity" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-transparent" />
                
                <div className="absolute bottom-0 left-0 w-full p-8 flex justify-between items-end">
                  <div className="space-y-4">
                    <div className="flex -space-x-3">
                      {[1,2,3,4].map((i) => (
                        <div key={i} className="h-10 w-10 rounded-full border-2 border-[#09090b] bg-zinc-800" />
                      ))}
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#09090b] bg-blue-500 text-xs font-bold text-white">+12</div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-white">Soirée Gala 2026</h3>
                      <p className="text-zinc-400">142 invités reconnus • 840 photos livrées</p>
                    </div>
                  </div>
                  
                  <div className="hidden sm:flex flex-col gap-3">
                    <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-sm font-medium text-white">IA Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="relative py-24 sm:py-32 overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Simple comme un flash
              </h2>
              <p className="mt-4 text-lg text-zinc-400">
                Oubliez les galeries interminables où les invités se cherchent pendant des heures.
              </p>
            </div>
            
            <div className="space-y-24">
              {steps.map((step, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <div key={idx} className={`flex flex-col gap-12 lg:items-center ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                    {/* Text Content */}
                    <motion.div 
                      initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.6, ease: "easeOut" as any }}
                      className="flex-1 space-y-6"
                    >
                      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400 shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]">
                        <step.icon className="h-8 w-8" />
                      </div>
                      <h3 className="text-3xl font-bold text-white">{step.title}</h3>
                      <p className="text-lg text-zinc-400 leading-relaxed max-w-lg">{step.description}</p>
                    </motion.div>

                    {/* Visual Content */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" as any }}
                      className="flex-1 w-full"
                    >
                      <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[4/3] xl:aspect-[16/10] rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900/50 shadow-2xl p-2 sm:p-4 group">
                        <div className="absolute inset-0 rounded-3xl ring-1 ring-white/10 ring-inset z-10 pointer-events-none" />
                        <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden bg-zinc-950">
                          <img 
                            src={step.image} 
                            alt={step.title}
                            className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                          />
                          {/* Overlay Gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent pointer-events-none" />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="relative border-t border-zinc-800/50 bg-zinc-900/20 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Taillé pour les pros
              </h2>
              <p className="mt-4 max-w-2xl text-lg text-zinc-400">
                Des outils avancés pour valoriser votre travail et ravir vos clients.
              </p>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, idx) => (
                <div key={idx} className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-6 backdrop-blur-sm">
                  <feature.icon className="h-8 w-8 text-blue-400 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Des tarifs transparents
              </h2>
              <p className="mt-4 text-lg text-zinc-400">
                Commencez gratuitement, évoluez selon vos besoins.
              </p>
            </div>

            <div className="grid gap-8 max-w-4xl mx-auto md:grid-cols-2">
              {/* Plan 1 */}
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8">
                <h3 className="text-lg font-semibold text-zinc-300">Starter</h3>
                <div className="mt-4 flex items-baseline text-5xl font-extrabold text-white">
                  Gratuit
                </div>
                <p className="mt-4 text-sm text-zinc-400">Parfait pour tester sur vos premiers shootings.</p>
                <ul className="mt-8 space-y-4 text-sm text-zinc-300">
                  <li className="flex gap-3"><Check className="h-5 w-5 text-blue-500" /> Jusqu'à 3 événements</li>
                  <li className="flex gap-3"><Check className="h-5 w-5 text-blue-500" /> 100 photos / événement</li>
                  <li className="flex gap-3"><Check className="h-5 w-5 text-blue-500" /> IA Standard</li>
                </ul>
                <Link href="/signup" className="mt-8 block w-full rounded-full border border-zinc-700 bg-zinc-800 py-3 text-center text-sm font-semibold text-white hover:bg-zinc-700">
                  Démarrer
                </Link>
              </div>

              {/* Plan 2 */}
              <div className="relative rounded-3xl border border-blue-500/50 bg-gradient-to-b from-blue-500/10 to-zinc-900/40 p-8 shadow-[0_0_30px_rgba(37,99,235,0.1)]">
                <div className="absolute -top-4 right-8 rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white">
                  Le plus populaire
                </div>
                <h3 className="text-lg font-semibold text-blue-400">Pro Studio</h3>
                <div className="mt-4 flex items-baseline text-5xl font-extrabold text-white">
                  39€<span className="text-xl font-medium text-zinc-400">/mois</span>
                </div>
                <p className="mt-4 text-sm text-zinc-400">Pour les agences et photographes réguliers.</p>
                <ul className="mt-8 space-y-4 text-sm text-white">
                  <li className="flex gap-3"><Check className="h-5 w-5 text-blue-400" /> Événements illimités</li>
                  <li className="flex gap-3"><Check className="h-5 w-5 text-blue-400" /> Stockage illimité</li>
                  <li className="flex gap-3"><Check className="h-5 w-5 text-blue-400" /> Marque Blanche Complète</li>
                  <li className="flex gap-3"><Check className="h-5 w-5 text-blue-400" /> Support prioritaire</li>
                </ul>
                <Link href="/signup?plan=pro" className="mt-8 block w-full rounded-full bg-white py-3 text-center text-sm font-semibold text-zinc-950 hover:bg-zinc-100">
                  Passer en Pro
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 bg-[#09090b]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">FotoFlow.ai</span>
              <span className="text-sm text-zinc-500">© 2026 Tous droits réservés.</span>
            </div>
            <div className="flex gap-6 text-sm text-zinc-400">
              <a href="#" className="hover:text-white">Mentions Légales</a>
              <a href="#" className="hover:text-white">Confidentialité</a>
              <a href="#" className="hover:text-white">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
