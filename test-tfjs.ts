import sharp from 'sharp';
import * as tf from '@tensorflow/tfjs';
import * as faceapi from '@vladmandic/face-api';
import path from 'path';
import fs from 'fs';

async function test() {
  const modelPath = path.join(process.cwd(), "public", "models");
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);

  // We need an image buffer to test with.
  // We'll read any sample image from public/
  // Let's create a 100x100 white buffer if no image is available.
  const imgBuffer = Buffer.from(
    '<svg width="100" height="100"><rect width="100" height="100" fill="white"/></svg>'
  );

  const { data, info } = await sharp(imgBuffer).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
  // sharp raw() with ensureAlpha returns RGBA
  const numChannels = 3;
  // We only want RGB
  const rgbData = new Uint8Array(info.width * info.height * numChannels);
  for (let i = 0, j = 0; i < data.length; i += 4, j += 3) {
    rgbData[j] = data[i];
    rgbData[j + 1] = data[i + 1];
    rgbData[j + 2] = data[i + 2];
  }

  const tensor = tf.tensor3d(rgbData, [info.height, info.width, numChannels], 'int32');
  
  try {
    const detection = await faceapi.detectSingleFace(tensor as any).withFaceLandmarks().withFaceDescriptor();
    console.log("Detection successful!", detection ? "Face found" : "No face found");
  } catch (err) {
    console.error("Detection error:", err);
  } finally {
    tf.dispose(tensor);
  }
}

test().catch(console.error);
