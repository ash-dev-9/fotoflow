import path from "path";
import fs from "fs";

// Dynamic imports for native dependencies that may not be available on serverless
let faceapi: any = null;
let canvasLib: any = null;
let modelsLoaded = false;
let aiAvailable = false;

async function initAI() {
  if (faceapi !== null) return aiAvailable;
  
  try {
    faceapi = await import("@vladmandic/face-api");
    canvasLib = await import("canvas");
    // @ts-ignore
    faceapi.env.monkeyPatch({
      Canvas: canvasLib.Canvas,
      Image: canvasLib.Image,
      ImageData: canvasLib.ImageData,
    });
    aiAvailable = true;
    console.log("AI dependencies loaded successfully");
  } catch (error) {
    console.warn("AI dependencies not available (expected on serverless):", (error as Error).message);
    aiAvailable = false;
  }
  return aiAvailable;
}

export async function loadModels() {
  if (modelsLoaded) return;
  if (!(await initAI())) return;

  const modelPath = path.join(process.cwd(), "public", "models");
  
  if (!fs.existsSync(path.join(modelPath, "ssd_mobilenetv1_model-weights_manifest.json"))) {
    console.warn(`AI models not found at ${modelPath}. Face recognition disabled.`);
    aiAvailable = false;
    return;
  }

  try {
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath),
      faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath),
      faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath),
    ]);
    modelsLoaded = true;
    console.log("AI Models loaded successfully");
  } catch (error) {
    console.warn("Failed to load AI models:", error);
    aiAvailable = false;
  }
}

/**
 * Extract face descriptor from an image file.
 * Returns null gracefully if AI is not available.
 */
export async function extractFaceDescriptor(imagePath: string): Promise<Float32Array | null> {
  await loadModels();
  if (!aiAvailable || !faceapi || !canvasLib) return null;

  try {
    const fullPath = path.join(process.cwd(), "public", imagePath);
    const img = await canvasLib.loadImage(fullPath);
    
    const detection = await faceapi
      .detectSingleFace(img as any)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      console.warn(`No face detected in ${imagePath}`);
      return null;
    }

    return detection.descriptor;
  } catch (error) {
    console.error(`Error extracting face descriptor from ${imagePath}:`, error);
    return null;
  }
}

/**
 * Compare two descriptors and return a match score (0 to 1, where 1 is perfect match).
 * Returns 0 if AI is not available.
 */
export function compareDescriptors(desc1: Float32Array, desc2: Float32Array): number {
  if (!faceapi) return 0;
  const distance = faceapi.euclideanDistance(desc1, desc2);
  const score = Math.max(0, 1 - distance);
  return score;
}

export const FACE_MATCH_THRESHOLD = 0.6;
