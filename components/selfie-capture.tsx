"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, RefreshCw, Check, X, Sparkles } from "lucide-react";

import * as faceapi from "@vladmandic/face-api";

interface SelfieCaptureProps {
  onCapture: (blob: Blob, descriptor: number[] | null) => void;
  onReset: () => void;
}

export function SelfieCapture({ onCapture, onReset }: SelfieCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isExtracting, setIsExtracting] = useState(false);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedDescriptor, setCapturedDescriptor] = useState<number[] | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load face-api models on mount
  useEffect(() => {
    let isMounted = true;
    const loadModels = async () => {
      // Force loading to finish after 10 seconds to prevent getting stuck
      const timeoutId = setTimeout(() => {
        if (isMounted) {
          console.warn("Model loading timed out");
          setIsModelLoading(false);
        }
      }, 10000);

      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        if (isMounted) setIsModelLoading(false);
      } catch (err) {
        console.error("Error loading models", err);
        if (isMounted) setIsModelLoading(false);
      } finally {
        clearTimeout(timeoutId);
      }
    };
    loadModels();
    
    return () => {
      isMounted = false;
    };
  }, []);

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

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        // Set canvas size to video size, but capped at 800px to avoid mobile WebGL crash
        const MAX_SIZE = 800;
        let width = video.videoWidth || 640;
        let height = video.videoHeight || 480;

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
        
        // Draw the current frame
        context.drawImage(video, 0, 0, width, height);
        
        // Convert to data URL for preview
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setCapturedImage(dataUrl);
        stopCamera();
        
        // Convert to blob and save
        canvas.toBlob((blob) => {
          if (blob) setCapturedBlob(blob);
        }, "image/jpeg", 0.9);

        if (!isModelLoading) {
          setIsExtracting(true);
          
          // Yield to main thread so the UI can paint the captured photo before heavy AI task
          setTimeout(async () => {
            let isResolved = false;
            const finish = (descriptor: number[] | null) => {
              if (isResolved) return;
              isResolved = true;
              setCapturedDescriptor(descriptor);
              setIsExtracting(false);
              if (!descriptor) {
                setError("Aucun visage détecté. Veuillez réessayer dans un endroit bien éclairé et de face.");
              }
            };

            const timeoutId = setTimeout(() => {
              console.warn("Face extraction timed out");
              finish(null);
            }, 10000);

            try {
              // Create a temp canvas attached to DOM to ensure faceapi can read dimensions properly
              const tempCanvas = document.createElement('canvas');
              tempCanvas.width = canvas.width;
              tempCanvas.height = canvas.height;
              const tempCtx = tempCanvas.getContext('2d');
              if (tempCtx) tempCtx.drawImage(canvas, 0, 0);

              tempCanvas.style.display = 'none';
              document.body.appendChild(tempCanvas);

              const detection = await faceapi.detectSingleFace(tempCanvas).withFaceLandmarks().withFaceDescriptor();
              
              if (document.body.contains(tempCanvas)) {
                document.body.removeChild(tempCanvas);
              }
              clearTimeout(timeoutId);
              finish(detection ? Array.from(detection.descriptor) : null);
            } catch (err) {
              console.error("Extraction error:", err);
              clearTimeout(timeoutId);
              finish(null);
            }
          }, 100);
        }
      }
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setCapturedBlob(null);
    setCapturedDescriptor(null);
    onReset();
  };

  const handleConfirm = () => {
    if (capturedBlob) {
      onCapture(capturedBlob, capturedDescriptor);
    }
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
                  disabled={isModelLoading}
                  className="group relative flex h-20 w-20 items-center justify-center rounded-full bg-white transition hover:scale-110 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
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
                <button
                  onClick={handleConfirm}
                  disabled={isExtracting}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] disabled:opacity-50 disabled:grayscale transition hover:bg-green-400"
                >
                  <Check className="h-6 w-6" />
                </button>
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
          {isModelLoading 
            ? "Chargement de l'IA (patientez...)" 
            : isExtracting 
              ? "Analyse du visage en cours..."
              : capturedImage 
                ? "Nous allons scanner la galerie pour trouver vos photos." 
                : "Cadrez votre visage pour que l'IA puisse vous identifier."}
        </p>
      </div>
    </div>
  );
}
