import * as faceapi from "@vladmandic/face-api";
import * as tf from "@tensorflow/tfjs-node";
import path from "path";
import fs from "fs";

let modelsLoaded = false;

export async function loadModels() {
  if (modelsLoaded) return;

  const modelPath = path.join(process.cwd(), "public", "models");
  
  // Verify models exist
  if (!fs.existsSync(path.join(modelPath, "ssd_mobilenetv1_model-weights_manifest.json"))) {
    throw new Error(`Models not found at ${modelPath}.`);
  }

  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath),
    faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath),
    faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath),
  ]);

  modelsLoaded = true;
  console.log("AI Models loaded successfully");
}

/**
 * Extract face descriptor from an image buffer
 */
export async function extractFaceDescriptor(imageBuffer: Buffer): Promise<Float32Array | null> {
  await loadModels();

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
 * face-api uses Euclidean distance, so we convert it to a score.
 * Distance < 0.6 is usually considered a match.
 */
export function compareDescriptors(desc1: Float32Array, desc2: Float32Array): number {
  const distance = faceapi.euclideanDistance(desc1, desc2);
  // Convert distance to a simplified score for the user
  // 0 distance = 1.0 score
  // 0.6 distance = 0.5 score
  // > 1.0 distance = 0.0 score
  const score = Math.max(0, 1 - distance);
  return score;
}

export const FACE_MATCH_THRESHOLD = 0.6; // Euclidean distance threshold
