"use client";

import { useState, useEffect } from "react";
import { Trash2, Download, Calendar } from "lucide-react";
import Image from "next/image";

interface Photo {
  id: string;
  filename: string;
  filePath: string;
  fileSize: number;
  uploadedAt: string;
}

interface PhotoGalleryProps {
  eventId: string;
  onPhotoDeleted?: () => void;
}

export function PhotoGallery({ eventId, onPhotoDeleted }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/events/${eventId}/photos`);

        if (!response.ok) {
          throw new Error("Failed to fetch photos");
        }

        const data = await response.json();
        setPhotos(data.photos || []);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load photos"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [eventId]);

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;

    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete photo");
      }

      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      if (onPhotoDeleted) {
        onPhotoDeleted();
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete photo");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-600 border-t-[#5B7CFF]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
        {error}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-white/15 bg-slate-950/40 py-12 text-center">
        <p className="text-sm text-slate-400">Aucune photo pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Photos ({photos.length})
        </h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="group relative overflow-hidden rounded-lg border border-white/10 bg-slate-950/50 transition hover:border-white/20"
          >
            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-slate-900">
              <Image
                src={photo.filePath}
                alt={photo.filename}
                fill
                className="object-cover transition group-hover:scale-105"
              />
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 opacity-0 transition group-hover:opacity-100">
              <div></div>

              {/* Actions */}
              <div className="flex gap-2">
                <a
                  href={photo.filePath}
                  download={photo.filename}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#5B7CFF] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#7C4DFF]"
                >
                  <Download className="h-3 w-3" />
                  Télécharger
                </a>
                <button
                  onClick={() => handleDeletePhoto(photo.id)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-500/20 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/30"
                >
                  <Trash2 className="h-3 w-3" />
                  Supprimer
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="border-t border-white/10 p-3">
              <p className="truncate text-xs font-medium text-white">
                {photo.filename}
              </p>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                <span>{formatFileSize(photo.fileSize)}</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(photo.uploadedAt).toLocaleDateString("fr-FR")}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
