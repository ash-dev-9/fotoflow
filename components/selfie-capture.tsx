"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, RefreshCw, Check, X, Sparkles } from "lucide-react";

interface SelfieCaptureProps {
  onCapture: (blob: Blob) => void;
  onReset: () => void;
}

export function SelfieCapture({ onCapture, onReset }: SelfieCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!capturedImage) {
      startCamera();
    }
    return () => stopCamera();
  }, [capturedImage]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Impossible d'accéder à la caméra. Veuillez vérifier les permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        // Set canvas size to video size
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the current frame
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to data URL for preview
        const dataUrl = canvas.toDataURL("image/jpeg");
        setCapturedImage(dataUrl);
        
        // Convert to blob for upload
        canvas.toBlob((blob) => {
          if (blob) {
            onCapture(blob);
          }
        }, "image/jpeg", 0.95);
        
        stopCamera();
      }
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    onReset();
  };

  return (
    <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">
      {error ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-4 rounded-full bg-red-500/10 p-4 text-red-500">
            <X className="h-8 w-8" />
          </div>
          <p className="text-sm text-slate-300">{error}</p>
          <button
            onClick={startCamera}
            className="mt-6 rounded-full bg-[#5B7CFF] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#7C4DFF]"
          >
            Réessayer
          </button>
        </div>
      ) : (
        <div className="relative aspect-[3/4] w-full bg-slate-900">
          {!capturedImage ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="h-full w-full object-cover grayscale-[0.2]"
              />
              <div className="absolute inset-0 border-[20px] border-slate-950/40 pointer-events-none">
                <div className="h-full w-full border-2 border-dashed border-white/30 rounded-2xl" />
              </div>
              
              {/* Capture controls */}
              <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                <button
                  onClick={capturePhoto}
                  className="group relative flex h-20 w-20 items-center justify-center rounded-full bg-white transition hover:scale-110 active:scale-95"
                >
                  <div className="h-16 w-16 rounded-full border-4 border-slate-950 bg-white" />
                  <div className="absolute -inset-2 animate-pulse rounded-full border-2 border-white/20 group-hover:border-white/40" />
                </button>
              </div>
            </>
          ) : (
            <>
              <img
                src={capturedImage}
                alt="Selfie capturé"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              
              {/* Post-capture controls */}
              <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-6">
                <button
                  onClick={resetCapture}
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-slate-900/60 text-white transition hover:bg-slate-800 hover:text-red-400"
                >
                  <RefreshCw className="h-6 w-6" />
                </button>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                  <Check className="h-6 w-6" />
                </div>
              </div>
            </>
          )}
          
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Overlay info */}
          <div className="absolute left-6 top-6 flex items-center gap-2 rounded-full bg-slate-950/40 px-3 py-1.5 backdrop-blur-md">
            <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">Live Camera</span>
          </div>
        </div>
      )}
      
      <div className="p-6 text-center">
        <h3 className="text-lg font-semibold text-white">
          {capturedImage ? "Photo prise !" : "Prenez un selfie"}
        </h3>
        <p className="mt-2 text-sm text-slate-400">
          {capturedImage 
            ? "Nous allons scanner la galerie pour trouver vos photos." 
            : "Cadrez votre visage pour que l'IA puisse vous identifier."}
        </p>
      </div>
    </div>
  );
}
