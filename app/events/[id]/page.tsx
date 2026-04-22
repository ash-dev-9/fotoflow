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
    <main className="min-h-screen bg-[#111827] px-4 py-16 text-slate-100">
      <div className="mx-auto w-full max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm font-medium transition hover:border-white/40"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux événements
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            {/* Upload Section */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-md">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Share2 className="h-6 w-6 text-[#5B7CFF]" />
                Télécharger des photos
              </h2>
              <PhotoUploader eventId={id} onUploadComplete={handleUploadComplete} />
            </div>

            {/* Gallery Section */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-md">
              <h2 className="text-2xl font-semibold mb-6">Galerie des photos</h2>
              <PhotoGallery key={refreshGallery.toString()} eventId={id} />
            </div>
          </div>

          {/* Sidebar / Sharing */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#5B7CFF]/30 bg-slate-900/80 p-6 shadow-2xl shadow-blue-500/10 backdrop-blur-xl">
              <h3 className="text-lg font-bold text-white mb-4">Accès Invités</h3>
              <div className="flex flex-col items-center gap-6">
                <div className="rounded-2xl bg-white p-4 shadow-inner">
                  {publicUrl && (
                    <QRCodeSVG 
                      value={publicUrl} 
                      size={180}
                      level="H"
                      includeMargin={false}
                    />
                  )}
                </div>
                
                <div className="w-full space-y-3">
                  <p className="text-xs text-slate-400 text-center uppercase tracking-widest font-bold">Lien de l&apos;événement</p>
                  <div className="flex items-center gap-2 rounded-xl bg-slate-950 p-2 border border-white/10">
                    <input 
                      readOnly 
                      value={publicUrl}
                      className="w-full bg-transparent px-2 text-xs text-slate-300 outline-none"
                    />
                    <button 
                      onClick={copyToClipboard}
                      className="rounded-lg bg-white/5 p-2 transition hover:bg-white/10 text-[#5B7CFF]"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 text-center">
                    Partagez ce QR Code avec vos invités pour qu&apos;ils puissent prendre leur selfie.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
