"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Share2, Copy, Check } from "lucide-react";
import { PhotoUploader } from "@/components/photo-uploader";
import { PhotoGallery } from "@/components/photo-gallery";
import { QRCodeSVG } from "qrcode.react";

interface EventDetailsProps {
  params: Promise<{ id: string }>;
}

export default function EventDetailsPage({ params }: EventDetailsProps) {
  const { id } = use(params);
  const [refreshGallery, setRefreshGallery] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const [publicUrl, setPublicUrl] = useState("");

  useEffect(() => {
    setPublicUrl(`${window.location.origin}/e/${id}`);
  }, [id]);

  const handleUploadComplete = () => {
    setRefreshGallery((prev) => !prev);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#09090b] px-4 py-16 text-zinc-100 selection:bg-blue-500/30">
      <div className="mx-auto w-full max-w-5xl">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <Link
            href="/events"
            className="group inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-5 py-2.5 text-sm font-medium transition-all hover:bg-zinc-800 hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Retour aux événements
          </Link>
        </div>

        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-10">
            {/* Upload Section */}
            <div className="rounded-3xl border border-zinc-800/60 bg-zinc-900/30 p-8 shadow-2xl backdrop-blur-xl">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                  <Share2 className="h-6 w-6" />
                </div>
                Importer des photos
              </h2>
              <PhotoUploader eventId={id} onUploadComplete={handleUploadComplete} />
            </div>

            {/* Gallery Section */}
            <div className="rounded-3xl border border-zinc-800/60 bg-zinc-900/30 p-8 shadow-2xl backdrop-blur-xl">
              <h2 className="text-2xl font-bold mb-8">Galerie de l'événement</h2>
              <PhotoGallery key={refreshGallery.toString()} eventId={id} />
            </div>
          </div>

          {/* Sidebar / Sharing */}
          <div className="space-y-8">
            <div className="sticky top-24 rounded-3xl border border-blue-500/20 bg-zinc-900/40 p-8 shadow-[0_0_50px_rgba(37,99,235,0.05)] backdrop-blur-xl">
              <div className="mb-6 flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                <h3 className="text-lg font-bold text-white tracking-tight">Accès Invités</h3>
              </div>
              
              <div className="flex flex-col items-center gap-8">
                <div className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-20 group-hover:opacity-30 transition-opacity" />
                  <div className="relative rounded-[1.5rem] bg-white p-5 shadow-2xl transition-transform group-hover:scale-105">
                    {publicUrl && (
                      <QRCodeSVG 
                        value={publicUrl} 
                        size={180}
                        level="H"
                        includeMargin={false}
                      />
                    )}
                  </div>
                </div>
                
                <div className="w-full space-y-4">
                  <p className="text-[10px] text-zinc-500 text-center uppercase tracking-[0.2em] font-black">Lien de partage</p>
                  <div className="flex items-center gap-2 rounded-2xl bg-zinc-950 p-2 border border-zinc-800/60 focus-within:border-blue-500/50 transition-colors">
                    <input 
                      readOnly 
                      value={publicUrl}
                      className="w-full bg-transparent px-3 text-sm text-zinc-400 outline-none"
                    />
                    <button 
                      onClick={copyToClipboard}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-blue-500 transition-all hover:bg-zinc-800 active:scale-90"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="rounded-xl bg-blue-500/5 p-4 text-center border border-blue-500/10">
                    <p className="text-xs leading-relaxed text-zinc-400">
                      Imprimez ce QR Code pour vos invités ou envoyez-leur le lien direct.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
