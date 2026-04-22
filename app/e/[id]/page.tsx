"use client";

import { useState, useEffect, use } from "react";
import { SelfieCapture } from "@/components/selfie-capture";
import { Sparkles, Loader2, CheckCircle2, Camera, Download } from "lucide-react";
import Link from "next/link";

interface GuestPageProps {
  params: Promise<{ id: string }>;
}

export default function GuestPage({ params }: GuestPageProps) {
  const { id } = use(params);
  const [event, setEvent] = useState<{ name: string; date: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState<"welcome" | "capture" | "processing" | "success">("welcome");
  const [error, setError] = useState<string | null>(null);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [matchedPhotos, setMatchedPhotos] = useState<any[]>([]);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${id}/public`);
        if (!res.ok) throw new Error("Événement introuvable");
        const data = await res.json();
        setEvent(data);
      } catch (err) {
        setError("Désolé, cet événement n'existe pas ou n'est plus accessible.");
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [id]);

  const handleCapture = async (blob: Blob) => {
    setUploading(true);
    setStep("processing");
    
    const formData = new FormData();
    formData.append("selfie", blob, "selfie.jpg");

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

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#111827] text-white">
        <Loader2 className="h-12 w-12 animate-spin text-[#5B7CFF]" />
        <p className="mt-4 text-slate-400">Chargement de l&apos;événement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#111827] px-6 text-center text-white">
        <div className="mb-6 rounded-full bg-red-500/10 p-4 text-red-500">
          <CheckCircle2 className="h-12 w-12 rotate-45" />
        </div>
        <h1 className="text-2xl font-bold">Oups !</h1>
        <p className="mt-2 text-slate-400">{error}</p>
        <Link href="/" className="mt-8 text-[#5B7CFF] hover:underline">
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#111827] px-6 py-12 text-white">
      <div className="mx-auto max-w-md">
        {/* Event Logo/Header */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5B7CFF] to-[#7C4DFF] shadow-lg shadow-blue-500/20">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{event?.name}</h1>
          <p className="mt-2 text-slate-400">
            {new Date(event?.date || "").toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Dynamic Steps */}
        {step === "welcome" && (
          <div className="text-center">
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 backdrop-blur-xl">
              <h2 className="text-xl font-semibold">Trouvez vos photos</h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                Prenez un selfie rapide pour que notre IA puisse identifier vos photos dans la galerie de l&apos;événement.
              </p>
              <button
                onClick={() => setStep("capture")}
                className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 text-lg font-bold text-slate-950 transition hover:bg-slate-100 active:scale-95"
              >
                <Camera className="h-6 w-6" />
                Commencer
              </button>
            </div>
            <p className="mt-8 text-xs text-slate-500">
              Vos données sont sécurisées et utilisées uniquement pour cette recherche.
            </p>
          </div>
        )}

        {step === "capture" && (
          <SelfieCapture 
            onCapture={handleCapture} 
            onReset={() => setError(null)} 
          />
        )}

        {step === "processing" && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-slate-900/60 p-12 text-center backdrop-blur-xl">
            <div className="relative mb-8 h-24 w-24">
              <div className="absolute inset-0 animate-ping rounded-full bg-[#5B7CFF]/20" />
              <div className="relative flex h-full w-full items-center justify-center rounded-full bg-slate-900 border border-[#5B7CFF]/30">
                <Loader2 className="h-10 w-10 animate-spin text-[#5B7CFF]" />
              </div>
            </div>
            <h2 className="text-xl font-semibold italic text-slate-100">&quot;La magie opère...&quot;</h2>
            <p className="mt-4 text-sm text-slate-400">
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
              <p className="mt-2 text-slate-400">
                Nous avons trouvé {matchedPhotos.length} photo(s) de vous.
              </p>
            </div>
            
            {matchedPhotos.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {matchedPhotos.map((photo) => (
                  <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-xl bg-slate-900 border border-white/5 shadow-lg">
                    <img 
                      src={photo.filePath} 
                      alt="Matched photo" 
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110" 
                    />
                    <a 
                      href={photo.filePath} 
                      download 
                      target="_blank"
                      className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-md transition-all duration-300 hover:bg-[#5B7CFF] group-hover:opacity-100"
                    >
                      <Download className="h-5 w-5" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 text-center backdrop-blur-xl">
                <p className="text-slate-300">Aucune photo trouvée pour le moment.</p>
                <p className="mt-2 text-sm text-slate-500">
                  Peut-être que le photographe n&apos;a pas encore téléchargé toutes les photos, ou votre visage n&apos;était pas assez visible.
                </p>
              </div>
            )}
            
            <div className="mt-12 text-center">
              <button
                onClick={() => { setStep("welcome"); setMatchedPhotos([]); }}
                className="rounded-full border border-white/20 px-8 py-3 text-sm font-semibold transition hover:bg-white/5 active:scale-95"
              >
                Reprendre un selfie
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
