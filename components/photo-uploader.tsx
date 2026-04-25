"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, Check, AlertCircle, ArrowRight } from "lucide-react";
import * as faceapi from "@vladmandic/face-api";

interface PhotoUploadProps {
  eventId: string;
  onUploadComplete?: (photos: any[]) => void;
}

interface UploadStatus {
  id: number;
  filename: string;
  status: "pending" | "extracting" | "uploading" | "success" | "error";
  error?: string;
  progress?: number;
}

export function PhotoUploader({ eventId, onUploadComplete }: PhotoUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        setIsModelLoading(false);
      } catch (err) {
        console.error("Error loading models", err);
        setIsModelLoading(false);
      }
    };
    loadModels();
  }, []);

  const extractFaceDescriptor = async (file: File): Promise<number[] | null> => {
    if (isModelLoading) return null;
    return new Promise((resolve) => {
      let isResolved = false;
      const finish = (res: number[] | null) => {
        if (!isResolved) {
          isResolved = true;
          resolve(res);
        }
      };

      // Force resolve after 15 seconds to avoid infinite hangs
      const timeoutId = setTimeout(() => {
        console.warn("Face extraction timed out for", file.name);
        finish(null);
      }, 15000);

      const img = document.createElement('img');
      img.onload = async () => {
        try {
          // Resize image to max 800px width/height to avoid WebGL crash on high-res photos
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            URL.revokeObjectURL(img.src);
            clearTimeout(timeoutId);
            return finish(null);
          }

          ctx.drawImage(img, 0, 0, width, height);
          
          // Append to body temporarily as faceapi sometimes expects elements in DOM
          canvas.style.display = 'none';
          document.body.appendChild(canvas);

          const detection = await faceapi.detectSingleFace(canvas).withFaceLandmarks().withFaceDescriptor();
          
          document.body.removeChild(canvas);
          URL.revokeObjectURL(img.src);
          clearTimeout(timeoutId);
          finish(detection ? Array.from(detection.descriptor) : null);
        } catch (err) {
          console.error("Face extraction error", err);
          URL.revokeObjectURL(img.src);
          clearTimeout(timeoutId);
          finish(null);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        clearTimeout(timeoutId);
        finish(null);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const imageFiles = droppedFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    setFiles((prev) => [...prev, ...imageFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadStatus(
      files.map((file, idx) => ({
        id: idx,
        filename: file.name,
        status: "pending",
      }))
    );

    // Extract descriptors sequentially to avoid memory spikes
    const descriptors: (number[] | null)[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadStatus((prev) =>
        prev.map((s) =>
          s.id === i
            ? { ...s, status: "extracting" }
            : s
        )
      );
      
      const desc = await extractFaceDescriptor(file);
      descriptors.push(desc);
      
      setUploadStatus((prev) =>
        prev.map((s) =>
          s.id === i
            ? { ...s, status: "uploading" }
            : s
        )
      );
    }

    const allUploaded: any[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const descriptor = descriptors[i];

      const formData = new FormData();
      formData.append("eventId", eventId);
      formData.append("faceDescriptors", JSON.stringify([descriptor]));
      formData.append("files", file);

      try {
        const response = await fetch("/api/photos/upload", {
          method: "POST",
          body: formData,
        });

        let result;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          const text = await response.text();
          if (!response.ok) {
             throw new Error(response.status === 413 ? "Fichier trop volumineux (limite Vercel de 4.5MB atteinte)." : `Erreur serveur: ${response.status}`);
          }
          result = { uploaded: [] };
        }

        if (!response.ok) {
          throw new Error(result.error || `Erreur lors de l'envoi (Status ${response.status})`);
        }

        // Update status for successful upload
        setUploadStatus((prev) =>
          prev.map((status) => {
            if (status.id === i) {
              const uploaded = result.uploaded?.length > 0;
              const error = result.errors?.length > 0 ? result.errors[0] : null;

              if (uploaded) {
                return { ...status, status: "success" };
              } else if (error) {
                return { ...status, status: "error", error: error.error };
              }
            }
            return status;
          })
        );
        
        if (result.uploaded && result.uploaded.length > 0) {
          allUploaded.push(...result.uploaded);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setUploadStatus((prev) =>
          prev.map((status) => 
            status.id === i ? { ...status, status: "error", error: errorMessage } : status
          )
        );
      }
    } // End of the for-loop

    // Clear files after successful upload (or partial success)
    setTimeout(() => {
      setFiles([]);
      if (onUploadComplete && allUploaded.length > 0) {
        onUploadComplete(allUploaded);
      }
      setUploading(false);
    }, 2000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Upload Area */}
      <div
        className={`rounded-2xl border-2 border-dashed p-10 transition-all duration-300 ${
          dragActive
            ? "border-blue-500 bg-blue-500/5 shadow-[0_0_30px_rgba(59,130,246,0.1)]"
            : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
            <Upload className="h-8 w-8" />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-white">
              Déposez vos photos ici
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Ou cliquez pour parcourir vos fichiers
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 rounded-full bg-white px-8 py-2.5 text-sm font-semibold text-zinc-950 transition-all hover:scale-105 hover:bg-zinc-100 active:scale-95"
          >
            Sélectionner des photos
          </button>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white">
            Fichiers à télécharger ({files.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={index}
                className="group flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 transition-colors hover:bg-zinc-900/60"
              >
                <div className="flex-1 truncate">
                  <p className="truncate text-sm text-white">{file.name}</p>
                  <p className="text-xs text-slate-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                  className="ml-2 p-1 text-slate-400 hover:text-red-400 disabled:cursor-not-allowed"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Status */}
      {uploadStatus.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white">État du téléchargement</h3>
          <div className="space-y-2">
            {uploadStatus.map((status, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
              >
                <p className="flex-1 truncate text-sm text-slate-300">
                  {status.filename}
                </p>
                <div className="flex items-center gap-2">
                  {status.status === "pending" && (
                    <span className="text-xs text-slate-400">En attente...</span>
                  )}
                  {status.status === "extracting" && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#5B7CFF]">Analyse IA...</span>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-[#5B7CFF]" />
                    </div>
                  )}
                  {status.status === "uploading" && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#5B7CFF]">Envoi...</span>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-[#5B7CFF]" />
                    </div>
                  )}
                  {status.status === "success" && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                  {status.status === "error" && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
          {uploadStatus.some((s) => s.status === "error") && (
            <div className="text-xs text-red-400">
              {uploadStatus
                .filter((s) => s.status === "error")
                .map((s) => s.error)
                .join(", ")}
            </div>
          )}
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading}
          className="group relative w-full overflow-hidden rounded-full bg-white py-4 font-bold text-zinc-950 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {uploading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-zinc-950" />
                Traitement en cours...
              </>
            ) : (
              <>
                Lancer l'importation de {files.length} photo{files.length > 1 ? "s" : ""}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </span>
        </button>
      )}
    </div>
  );
}
