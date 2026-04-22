"use client";

import { useState, useRef } from "react";
import { Upload, X, Check, AlertCircle } from "lucide-react";

interface PhotoUploadProps {
  eventId: string;
  onUploadComplete?: (photos: any[]) => void;
}

interface UploadStatus {
  filename: string;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
  progress?: number;
}

export function PhotoUploader({ eventId, onUploadComplete }: PhotoUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      files.map((file) => ({
        filename: file.name,
        status: "pending",
      }))
    );

    const formData = new FormData();
    formData.append("eventId", eventId);

    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("/api/photos/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      // Update status for successful uploads
      setUploadStatus((prev) =>
        prev.map((status) => {
          const uploaded = result.uploaded?.find(
            (p: any) => p.filename === status.filename
          );
          const error = result.errors?.find(
            (e: any) => e.filename === status.filename
          );

          if (uploaded) {
            return { ...status, status: "success" };
          } else if (error) {
            return { ...status, status: "error", error: error.error };
          }
          return status;
        })
      );

      // Clear files after successful upload
      setTimeout(() => {
        setFiles([]);
        if (onUploadComplete) {
          onUploadComplete(result.uploaded || []);
        }
      }, 2000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setUploadStatus((prev) =>
        prev.map((status) => ({
          ...status,
          status: "error",
          error: errorMessage,
        }))
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Upload Area */}
      <div
        className={`rounded-xl border-2 border-dashed p-8 transition ${
          dragActive
            ? "border-[#5B7CFF] bg-[#5B7CFF]/10"
            : "border-white/20 bg-slate-950/50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <Upload className="h-12 w-12 text-[#5B7CFF]" />
          <div className="text-center">
            <p className="font-semibold text-white">
              Déposez vos photos ici ou cliquez pour sélectionner
            </p>
            <p className="text-sm text-slate-400">
              PNG, JPG, GIF, WebP jusqu&apos;à 50MB
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
            className="rounded-lg bg-[#5B7CFF] px-6 py-2 font-medium text-white transition hover:bg-[#7C4DFF]"
          >
            Parcourir les fichiers
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
                className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-950/50 p-3"
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
                className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-950/50 p-3"
              >
                <p className="flex-1 truncate text-sm text-slate-300">
                  {status.filename}
                </p>
                <div className="flex items-center gap-2">
                  {status.status === "pending" && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-[#5B7CFF]" />
                  )}
                  {status.status === "uploading" && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-[#5B7CFF]" />
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
          className="w-full rounded-lg bg-[#5B7CFF] px-4 py-3 font-semibold text-white transition hover:bg-[#7C4DFF] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? "Téléchargement en cours..." : `Télécharger ${files.length} fichier(s)`}
        </button>
      )}
    </div>
  );
}
