import path from "path";
import fs from "fs";

let faceapi: any = null;
let tf: any = null;
let modelsLoaded = false;
let aiAvailable = true;

export async function loadModels() {
  if (modelsLoaded) return;
  if (!aiAvailable) return;

  try {
    // Dynamically import heavy libraries - tfjs-node may not be available on Vercel
    if (!faceapi) faceapi = await import("@vladmandic/face-api");
    if (!tf) {
      try {
        // @ts-ignore - tfjs-node is an optional dependency, not available on Vercel
        tf = await import("@tensorflow/tfjs-node");
      } catch {
        console.warn("AI: @tensorflow/tfjs-node not available (expected on Vercel). Face recognition disabled.");
        aiAvailable = false;
        return;
      }
    }

    const modelPath = path.join(process.cwd(), "public", "models");
    
    // Verify models exist
    if (!fs.existsSync(path.join(modelPath, "ssd_mobilenetv1_model-weights_manifest.json"))) {
      console.warn(`AI: Models not found at ${modelPath}. Face recognition disabled.`);
      aiAvailable = false;
      return;
    }

    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath),
      faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath),
      faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath),
    ]);

    modelsLoaded = true;
    console.log("AI Models loaded successfully");
  } catch (error) {
    console.warn("AI: Failed to load models. Face recognition disabled.", error);
    aiAvailable = false;
  }
}

/**
 * Extract face descriptor from an image buffer.
 * Returns null if AI is not available (e.g. on Vercel serverless).
 */
export async function extractFaceDescriptor(imageBuffer: Buffer): Promise<Float32Array | null> {
  if (!aiAvailable) return null;

  await loadModels();
  if (!aiAvailable) return null;

  try {
    // Decode image into a tensor using tfjs-node
    const tensor = tf.node.decodeImage(imageBuffer, 3);
    
    // Detect single face and compute descriptor
    const detection = await faceapi
      .detectSingleFace(tensor as any)
      .withFaceLandmarks()
      .withFaceDescriptor();

    // Clean up tensor memory
    tf.dispose(tensor);

    if (!detection) {
      return null;
    }

    return detection.descriptor;
  } catch (error) {
    console.error("Error extracting face descriptor:", error);
    return null;
  }
}

/**
 * Compare two descriptors and return a match score (0 to 1, where 1 is perfect match)
 * Distance < 0.6 is usually considered a match.
 */
export function compareDescriptors(desc1: Float32Array, desc2: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < desc1.length; i++) {
    sum += Math.pow(desc1[i] - desc2[i], 2);
  }
  const distance = Math.sqrt(sum);
  const score = Math.max(0, 1 - distance);
  return score;
}

export const FACE_MATCH_THRESHOLD = 0.6;

