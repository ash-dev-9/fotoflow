"use client";

import { useState, useEffect, use } from "react";
import { SelfieCapture } from "@/components/selfie-capture";
import { Sparkles, Loader2, CheckCircle2, Camera, Download, Mail, ArrowRight } from "lucide-react";

import Link from "next/link";

interface GuestPageProps {
  params: Promise<{ id: string }>;
}

interface StudioBranding {
  name: string | null;
  logoUrl: string | null;
  primaryColor: string;
}

export default function GuestPage({ params }: GuestPageProps) {
  const { id } = use(params);
  const [event, setEvent] = useState<{ name: string; date: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"welcome" | "email" | "capture" | "processing" | "success">("welcome");

  const [error, setError] = useState<string | null>(null);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [matchedPhotos, setMatchedPhotos] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [branding, setBranding] = useState<StudioBranding>({
    name: null,
    logoUrl: null,
    primaryColor: "#3B82F6",
  });

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${id}/public`);
        if (!res.ok) throw new Error("Événement introuvable");
        const data = await res.json();
        setEvent(data);
        // If the API returns studio branding, use it
        if (data.studio) {
          setBranding({
            name: data.studio.name,
            logoUrl: data.studio.logoUrl,
            primaryColor: data.studio.primaryColor || "#3B82F6",
          });
        }
      } catch (err) {
        setError("Désolé, cet événement n'existe pas ou n'est plus accessible.");
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [id]);

  // Periodic polling for new photos every 30 seconds
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "success" && guestId) {
      interval = setInterval(() => {
        handleRefresh(true); // silent refresh
      }, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, guestId]);

  const handleRefresh = async (silent = false) => {
    if (!guestId || refreshing) return;
    
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch(`/api/guests/${guestId}/matches`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setMatchedPhotos(data.photos || []);
      }
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      if (!silent) setRefreshing(false);
    }
  };

  const handleCapture = async (blob: Blob, descriptor: number[] | null) => {
    setUploading(true);
    setStep("processing");
    
    const formData = new FormData();
    formData.append("selfie", blob, "selfie.jpg");
    if (descriptor) {
      formData.append("faceDescriptor", JSON.stringify(descriptor));
    }
    if (email) {
      formData.append("email", email);
    }


    try {
      const res = await fetch(`/api/events/${id}/join`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Échec du téléchargement");
      const data = await res.json();
      setGuestId(data.guestId);
      
      // Simulate IA processing for a better UX while fetching actual matches
      setTimeout(async () => {
        try {
          const matchRes = await fetch(`/api/guests/${data.guestId}/matches`);
          if (matchRes.ok) {
            const matchData = await matchRes.json();
            setMatchedPhotos(matchData.photos || []);
          }
        } catch (fetchErr) {
          console.error("Failed to fetch matches:", fetchErr);
        }
        setStep("success");
        setUploading(false);
      }, 3000);

    } catch (err) {
      setError("Une erreur est survenue lors de l'envoi du selfie.");
      setUploading(false);
      setStep("capture");
    }
  };

  const accent = branding.primaryColor;
  const studioLabel = branding.name || "FotoFlow";

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] text-white">
        <Loader2 className="h-12 w-12 animate-spin" style={{ color: accent }} />
        <p className="mt-4 text-zinc-500">Chargement de l&apos;événement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] px-6 text-center text-white">
        <div className="mb-6 rounded-full bg-red-500/10 p-4 text-red-500">
          <CheckCircle2 className="h-12 w-12 rotate-45" />
        </div>
        <h1 className="text-2xl font-bold">Oups !</h1>
        <p className="mt-2 text-zinc-400">{error}</p>
        <Link href="/" className="mt-8 hover:underline" style={{ color: accent }}>
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#09090b] px-6 py-12 text-zinc-100 selection:bg-blue-500/30 overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 mx-auto max-w-md">
        {/* Event Logo/Header with Studio Branding */}
        <div className="mb-12 text-center">
          {branding.logoUrl ? (
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3 shadow-lg backdrop-blur-sm" style={{ boxShadow: `0 0 40px ${accent}15` }}>
              <img
                src={branding.logoUrl}
                alt={studioLabel}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : (
            <div
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${accent}, ${accent}CC)`,
                boxShadow: `0 8px 30px ${accent}40`,
              }}
            >
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          )}
          <h1 className="text-3xl font-bold tracking-tight">{event?.name}</h1>
          <p className="mt-2 text-zinc-400">
            {new Date(event?.date || "").toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          {branding.name && (
            <p className="mt-1 text-xs text-zinc-500">
              par <span style={{ color: accent }}>{branding.name}</span>
            </p>
          )}
        </div>

        {/* Dynamic Steps */}
        {step === "welcome" && (
          <div className="text-center">
            <div className="relative group rounded-3xl border border-zinc-800 bg-zinc-900/40 p-10 shadow-2xl backdrop-blur-xl transition-all hover:bg-zinc-900/60">
              <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <h2 className="relative text-2xl font-bold tracking-tight">Trouvez vos photos</h2>
              <p className="relative mt-4 text-sm leading-relaxed text-zinc-400">
                L'IA va scanner l'album de l'événement pour isoler uniquement vos photos. Prenez un selfie pour commencer l'identification.
              </p>
              <button
                onClick={() => setStep("email")}
                className="group relative mt-10 flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl px-6 py-5 text-lg font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: accent }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Camera className="h-6 w-6" />
                Démarrer le scan
              </button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              Scan sécurisé & Privé
            </div>
          </div>
        )}

        {step === "email" && (
          <div className="text-center">
            <div className="relative group rounded-3xl border border-zinc-800 bg-zinc-900/40 p-10 shadow-2xl backdrop-blur-xl transition-all">
              <div className="mb-6 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800/50">
                <Mail className="h-8 w-8" style={{ color: accent }} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Où envoyer vos photos ?</h2>
              <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                Saisissez votre email pour recevoir une notification dès que de nouvelles photos de vous sont disponibles.
              </p>
              
              <div className="mt-8">
                <input
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-6 py-4 text-white placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                />
                
                <button
                  onClick={() => setStep("capture")}
                  disabled={!email || !email.includes("@")}
                  className="group relative mt-6 flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl px-6 py-4 text-lg font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                  style={{ backgroundColor: accent }}
                >
                  Suivant
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
              
              <button 
                onClick={() => setStep("welcome")}
                className="mt-6 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Retour
              </button>
            </div>
          </div>
        )}


        {step === "capture" && (
          <SelfieCapture 
            onCapture={handleCapture} 
            onReset={() => setError(null)} 
          />
        )}

        {step === "processing" && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-900/60 p-12 text-center backdrop-blur-xl">
            <div className="relative mb-8 h-24 w-24">
              <div className="absolute inset-0 animate-ping rounded-full" style={{ backgroundColor: `${accent}20` }} />
              <div className="relative flex h-full w-full items-center justify-center rounded-full bg-zinc-900 border" style={{ borderColor: `${accent}40` }}>
                <Loader2 className="h-10 w-10 animate-spin" style={{ color: accent }} />
              </div>
            </div>
            <h2 className="text-xl font-semibold italic text-zinc-100">&quot;La magie opère...&quot;</h2>
            <p className="mt-4 text-sm text-zinc-400">
              Notre IA scanne la galerie pour retrouver vos plus beaux moments.
            </p>
          </div>
        )}

        {step === "success" && (
          <div className="w-full">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-500">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold">Vos photos sont prêtes !</h2>
              <p className="mt-2 text-zinc-400">
                Nous avons trouvé {matchedPhotos.length} photo(s) de vous.
              </p>
              
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => handleRefresh()}
                  disabled={refreshing}
                  className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/10 disabled:opacity-50"
                >
                  {refreshing ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" style={{ color: accent }} />
                  )}
                  Actualiser la recherche
                </button>
              </div>
            </div>
            
            {matchedPhotos.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
                {matchedPhotos.map((photo, i) => (
                  <div 
                    key={photo.id} 
                    className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800/60 shadow-xl transition-all hover:border-blue-500/30"
                    style={{ 
                      animation: `fadeInUp 0.6s ease-out forwards ${i * 0.1}s`,
                      opacity: 0,
                      transform: 'translateY(20px)'
                    }}
                  >
                    <img 
                      src={photo.filePath} 
                      alt="Matched photo" 
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <a 
                      href={photo.filePath} 
                      download 
                      target="_blank"
                      className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-110 active:scale-95"
                      style={{ backgroundColor: `${accent}DD` }}
                    >
                      <Download className="h-6 w-6" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8 text-center backdrop-blur-xl">
                <p className="text-zinc-300">Aucune photo trouvée pour le moment.</p>
                <p className="mt-2 text-sm text-zinc-500">
                  Peut-être que le photographe n&apos;a pas encore téléchargé toutes les photos, ou votre visage n&apos;était pas assez visible.
                </p>
              </div>
            )}
            
            <div className="mt-12 text-center">
              <button
                onClick={() => { setStep("welcome"); setMatchedPhotos([]); }}
                className="rounded-full border border-zinc-700 px-8 py-3 text-sm font-semibold transition hover:bg-white/5 active:scale-95"
              >
                Reprendre un selfie
              </button>
            </div>

            {/* Studio Footer */}
            <div className="mt-10 text-center">
              <p className="text-xs text-zinc-600">
                Propulsé par{" "}
                <span className="font-medium" style={{ color: accent }}>
                  {studioLabel}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
