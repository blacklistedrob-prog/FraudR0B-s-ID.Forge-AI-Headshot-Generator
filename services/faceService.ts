// Wrapper service for face-api.js
// This runs entirely in the browser (Client-Side) for offline capability.

declare const faceapi: any;

// Updated to a more reliable community mirror for face-api models
const MODELS_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

let modelsLoaded = false;

export const loadFaceModels = async () => {
  if (modelsLoaded) return;
  try {
    if (typeof faceapi === 'undefined') {
        throw new Error("Face-API.js not loaded.");
    }
    console.log("Loading Face-API models...");
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODELS_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODELS_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODELS_URL),
      faceapi.nets.ageGenderNet.loadFromUri(MODELS_URL)
    ]);
    modelsLoaded = true;
    console.log("Face-API models loaded successfully.");
  } catch (error) {
    console.error("Failed to load Face-API models:", error);
    throw error;
  }
};

export const detectFaceAttributes = async (imageElementOrUrl: string | HTMLImageElement | HTMLVideoElement) => {
  if (!modelsLoaded) await loadFaceModels();

  let input: any = imageElementOrUrl;

  // If string, create an image element to read from
  if (typeof imageElementOrUrl === 'string') {
    const img = new Image();
    img.src = imageElementOrUrl;
    await new Promise((resolve) => { img.onload = resolve; });
    input = img;
  }

  // Use TinyFaceDetector for speed on mobile/web
  const detections = await faceapi.detectAllFaces(input, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceExpressions()
    .withAgeAndGender();

  if (!detections || detections.length === 0) {
    return null;
  }

  // Return primary face (largest)
  const primaryFace = detections[0];
  
  // Get dominant expression
  const expressions = primaryFace.expressions;
  const sortedExpressions = Object.keys(expressions).sort((a, b) => expressions[b] - expressions[a]);
  const dominantExpression = sortedExpressions[0];

  return {
    age: Math.round(primaryFace.age),
    gender: primaryFace.gender,
    genderProbability: primaryFace.genderProbability,
    expression: dominantExpression,
    expressionScore: expressions[dominantExpression],
    box: primaryFace.detection.box
  };
};

export const isLocalScanAvailable = () => modelsLoaded;