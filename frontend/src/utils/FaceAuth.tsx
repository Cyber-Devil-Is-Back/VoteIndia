import * as faceapi from 'face-api.js';

// Load models from a specified path
export async function loadModel(): Promise<void> {
  const MODEL_URL = "/models";

  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(`${MODEL_URL}/ssd_mobilenetv1`),
    faceapi.nets.faceLandmark68Net.loadFromUri(`${MODEL_URL}/face_landmark_68`),
    faceapi.nets.faceRecognitionNet.loadFromUri(`${MODEL_URL}/face_recognition`),
  ]);
}

// Synchronously check if models are loaded
export function areModelsLoaded(): boolean {
  return (
    faceapi.nets.ssdMobilenetv1.isLoaded &&
    faceapi.nets.faceLandmark68Net.isLoaded &&
    faceapi.nets.faceRecognitionNet.isLoaded
  );
}
