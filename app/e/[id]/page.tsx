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
  const [uploading, setUploading] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
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
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);

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
    if (phone) {
      formData.append("phone", phone);
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

  const subscribeToPush = async (gId: string) => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push notifications not supported');
        return;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') return;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });

      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId: gId, subscription })
      });

      alert('Alertes activées ! Vous recevrez une notification dès qu\'une photo est trouvée.');
    } catch (err) {
      console.error('Failed to subscribe to push:', err);
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
              
              <div className="mt-8 space-y-4">
                <input
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-6 py-4 text-white placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                />

                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-medium">
                    WhatsApp (optionnel)
                  </div>
                  <input
                    type="tel"
                    placeholder="+33 6 00 00 00 00"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 pl-40 pr-6 py-4 text-white placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                
                <button
                  onClick={() => setStep("capture")}
                  disabled={!email || !email.includes("@")}
                  className="group relative mt-2 flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl px-6 py-4 text-lg font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
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
          <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-12 text-center shadow-[0_0_50px_rgba(59,130,246,0.15)]">
            {/* Animated Scanning Line */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-scan" />
            
            <div className="relative mb-10 flex justify-center">
              <div className="relative h-32 w-32">
                {/* Outer rotating rings */}
                <div className="absolute inset-0 animate-[spin_4s_linear_infinite] rounded-full border-2 border-dashed border-blue-500/20" />
                <div className="absolute inset-2 animate-[spin_3s_linear_infinite_reverse] rounded-full border border-blue-500/30" />
                
                {/* Center Core */}
                <div className="absolute inset-6 flex items-center justify-center rounded-full bg-zinc-900 border border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                  <div className="relative flex flex-col items-center">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-400" />
                    <div className="absolute -bottom-1 flex gap-1">
                      <span className="h-1 w-1 animate-bounce rounded-full bg-blue-500" style={{ animationDelay: '0s' }} />
                      <span className="h-1 w-1 animate-bounce rounded-full bg-blue-500" style={{ animationDelay: '0.2s' }} />
                      <span className="h-1 w-1 animate-bounce rounded-full bg-blue-500" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-white">Analyse faciale en cours...</h2>
              <div className="flex flex-col gap-2">
                <p className="text-sm text-zinc-400">
                  Identification des descripteurs biométriques unique
                </p>
                <div className="mx-auto h-1 w-48 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-blue-500 animate-progress" />
                </div>
              </div>
              <p className="text-xs text-zinc-500 italic mt-6">
                &quot;Recherche parmi {matchedPhotos.length > 0 ? 'les photos de' : 'la galerie de'} l&apos;événement...&quot;
              </p>
            </div>
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

              {/* Notification Banner */}
              <div className="mt-8 overflow-hidden rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6 backdrop-blur-xl transition-all hover:bg-blue-500/10">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between sm:text-left">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Être alerté en direct ?</h3>
                      <p className="text-xs text-zinc-400">Recevez une notification dès que de nouvelles photos de vous sont ajoutées.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => guestId && subscribeToPush(guestId)}
                    className="w-full sm:w-auto rounded-xl bg-white px-6 py-3 text-sm font-bold text-zinc-950 transition-all hover:scale-105 active:scale-95 shadow-lg"
                  >
                    Activer les alertes
                  </button>
                </div>
              </div>
            </div>
            
            {matchedPhotos.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
                {matchedPhotos.map((photo, i) => (
                  <div 
                    key={photo.id} 
                    onClick={() => setSelectedPhoto(photo)}
                    className="group relative aspect-[3/4] cursor-zoom-in overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800/60 shadow-xl transition-all hover:border-blue-500/30"
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
                    <div className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-2xl backdrop-blur-xl transition-all duration-300 group-hover:scale-110 active:scale-95" style={{ backgroundColor: `${accent}DD` }}>
                      <Sparkles className="h-5 w-5" />
                    </div>
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

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-300"
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="relative max-w-4xl w-full h-full flex flex-col items-center justify-center gap-6"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-0 right-0 p-4 text-white/50 hover:text-white transition-colors"
            >
              Fermer
            </button>
            
            <div className="relative group w-full max-h-[80vh] flex justify-center">
              <img 
                src={selectedPhoto.filePath} 
                alt="Enlarged view" 
                className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
              />
            </div>

            <div className="flex items-center gap-4">
              <a 
                href={selectedPhoto.filePath} 
                download 
                className="flex items-center gap-3 rounded-2xl px-8 py-4 text-lg font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-xl"
                style={{ backgroundColor: accent }}
              >
                <Download className="h-6 w-6" />
                Télécharger la photo
              </a>
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: event?.name,
                      text: 'Regarde ma photo de l\'événement !',
                      url: selectedPhoto.filePath
                    });
                  }
                }}
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800 text-white transition-all hover:bg-zinc-700 active:scale-95"
              >
                <Mail className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
