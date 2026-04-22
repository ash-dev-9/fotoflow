/**
 * Compare two descriptors and return a match score (0 to 1, where 1 is perfect match)
 * Distance < 0.6 is usually considered a match.
 */
export function compareDescriptors(desc1: Float32Array | number[], desc2: Float32Array | number[]): number {
  let sum = 0;
  for (let i = 0; i < desc1.length; i++) {
    sum += Math.pow(desc1[i] - desc2[i], 2);
  }
  const distance = Math.sqrt(sum);
  const score = Math.max(0, 1 - distance);
  return score;
}

export const FACE_MATCH_THRESHOLD = 0.6;

