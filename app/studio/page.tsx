"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  Palette,
  Save,
  Check,
  AlertCircle,
  Loader2,
  ImageIcon,
  X,
  Eye,
} from "lucide-react";
import Link from "next/link";

const PRESET_COLORS = [
  { name: "Bleu", value: "#3B82F6" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Violet", value: "#8B5CF6" },
  { name: "Rose", value: "#EC4899" },
  { name: "Rouge", value: "#EF4444" },
  { name: "Orange", value: "#F97316" },
  { name: "Ambre", value: "#F59E0B" },
  { name: "Émeraude", value: "#10B981" },
  { name: "Cyan", value: "#06B6D4" },
  { name: "Zinc", value: "#71717A" },
];

interface StudioData {
  name: string | null;
  logoUrl: string | null;
  primaryColor: string;
}

export default function StudioSettingsPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [studioName, setStudioName] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#3B82F6");
  const [customColor, setCustomColor] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/login");
    }
  }, [isLoaded, isSignedIn, router]);

  // Fetch existing studio settings
  useEffect(() => {
    const fetchStudio = async () => {
      try {
        const res = await fetch("/api/studio");
        if (res.ok) {
          const data: StudioData = await res.json();
          setStudioName(data.name || "");
          setLogoUrl(data.logoUrl);
          setPrimaryColor(data.primaryColor || "#3B82F6");
        }
      } catch (err) {
        console.error("Failed to load studio settings:", err);
      } finally {
        setLoading(false);
      }
    };
    if (isSignedIn) fetchStudio();
  }, [isSignedIn]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("logo", file);

      const res = await fetch("/api/studio/logo", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await res.json();
      setLogoUrl(data.logoUrl);
    } catch (err: any) {
      setError(err.message || "Échec du téléchargement du logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: studioName || null,
          logoUrl,
          primaryColor,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Échec de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Header */}
      <header className="border-b border-zinc-800/60 bg-[#09090b]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <div className="h-5 w-px bg-zinc-800" />
            <h1 className="text-lg font-semibold">Paramètres du Studio</h1>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: primaryColor }}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saveSuccess ? (
              <Check className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Enregistrement..." : saveSuccess ? "Sauvegardé !" : "Enregistrer"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 space-y-8">
        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Left: Settings */}
          <div className="lg:col-span-3 space-y-8">
            {/* Studio Name */}
            <section className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Nom du Studio</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Le nom qui sera affiché aux invités lorsqu'ils accèdent à votre événement.
                </p>
              </div>
              <input
                type="text"
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                placeholder="Ex: Studio Lumière, Ash Photography..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-white placeholder-zinc-500 transition-colors focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
              />
            </section>

            {/* Logo Upload */}
            <section className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Logo</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Votre logo sera visible par les invités sur la page de l'événement. PNG, JPG, WebP ou SVG (max 5MB).
                </p>
              </div>

              {logoUrl ? (
                <div className="flex items-start gap-4">
                  <div className="relative group">
                    <div className="h-24 w-24 rounded-2xl border border-zinc-700 bg-zinc-950 overflow-hidden flex items-center justify-center p-2">
                      <img
                        src={logoUrl}
                        alt="Studio logo"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <button
                      onClick={handleRemoveLogo}
                      className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-zinc-300">Logo actuel</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingLogo}
                      className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                    >
                      {uploadingLogo ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      Remplacer
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-950/30 p-8 transition-all hover:border-zinc-500 hover:bg-zinc-950/50"
                >
                  {uploadingLogo ? (
                    <Loader2 className="h-10 w-10 animate-spin text-zinc-500" />
                  ) : (
                    <ImageIcon className="h-10 w-10 text-zinc-500" />
                  )}
                  <span className="text-sm text-zinc-400">
                    {uploadingLogo ? "Téléchargement en cours..." : "Cliquez pour télécharger votre logo"}
                  </span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </section>

            {/* Color Picker */}
            <section className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-6 space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-white">Couleur principale</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Cette couleur sera appliquée aux boutons et accents sur la page de vos invités.
                </p>
              </div>

              {/* Preset Colors */}
              <div className="flex flex-wrap gap-3">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setPrimaryColor(color.value)}
                    className="group relative flex flex-col items-center gap-1.5"
                    title={color.name}
                  >
                    <div
                      className="h-10 w-10 rounded-xl border-2 transition-all hover:scale-110"
                      style={{
                        backgroundColor: color.value,
                        borderColor:
                          primaryColor === color.value ? "white" : "transparent",
                        boxShadow:
                          primaryColor === color.value
                            ? `0 0 20px ${color.value}40`
                            : "none",
                      }}
                    >
                      {primaryColor === color.value && (
                        <div className="flex h-full items-center justify-center">
                          <Check className="h-4 w-4 text-white drop-shadow-lg" />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-500 group-hover:text-zinc-300 transition-colors">{color.name}</span>
                  </button>
                ))}
              </div>

              {/* Custom Color */}
              <div className="flex items-center gap-3">
                <label className="text-sm text-zinc-400">Couleur personnalisée :</label>
                <div className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-950/50 px-3 py-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                        setPrimaryColor(val);
                      }
                    }}
                    className="w-20 bg-transparent text-sm text-white font-mono focus:outline-none"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Right: Live Preview */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-4">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Eye className="h-4 w-4" />
                Aperçu en direct
              </div>

              {/* Phone Mockup */}
              <div className="mx-auto w-full max-w-[280px]">
                <div className="rounded-[2rem] border-2 border-zinc-700 bg-zinc-950 p-3 shadow-2xl">
                  {/* Phone Notch */}
                  <div className="mx-auto mb-3 h-5 w-20 rounded-full bg-zinc-800" />

                  {/* Screen Content */}
                  <div className="rounded-2xl bg-zinc-900 overflow-hidden">
                    {/* Event Header */}
                    <div
                      className="px-5 py-6 text-center"
                      style={{
                        background: `linear-gradient(135deg, ${primaryColor}15, ${primaryColor}05)`,
                      }}
                    >
                      {logoUrl ? (
                        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-700/50 bg-zinc-950/80 p-2">
                          <img
                            src={logoUrl}
                            alt="Logo preview"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div
                          className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl"
                          style={{ backgroundColor: `${primaryColor}20` }}
                        >
                          <span
                            className="text-xl font-bold"
                            style={{ color: primaryColor }}
                          >
                            {studioName ? studioName[0]?.toUpperCase() : "F"}
                          </span>
                        </div>
                      )}
                      <h3 className="text-sm font-semibold text-white">
                        {studioName || "FotoFlow Studio"}
                      </h3>
                      <p className="mt-1 text-[10px] text-zinc-400">
                        Soirée Gala 2026
                      </p>
                    </div>

                    {/* Selfie Area Mockup */}
                    <div className="px-4 py-5 space-y-4">
                      <div className="mx-auto h-28 w-28 rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center">
                        <span className="text-[10px] text-zinc-500 text-center px-2">
                          Zone selfie
                        </span>
                      </div>

                      <button
                        className="w-full rounded-xl py-3 text-xs font-semibold text-white transition-all"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Prendre un selfie
                      </button>

                      <p className="text-center text-[9px] text-zinc-500">
                        Propulsé par {studioName || "FotoFlow"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
