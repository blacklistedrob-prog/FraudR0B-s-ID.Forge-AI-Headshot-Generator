import { GoogleGenAI, Type, Schema } from "@google/genai";
import { detectFaceAttributes, isLocalScanAvailable } from "./faceService";
import { applyAnalogSensorNoise } from "./visionService";
import { injectProfessionalMetadata } from "./exifService";
import { AgentMode, AspectRatio, ImageResolution, ForensicScanResult, TextureLevel } from "../types";
import { 
  STANDARD_FORGER_PROMPT, 
  DIGITAL_DISGUISE_PROMPT, 
  SYNTHETIC_ID_PROMPT, 
  EDIT_SYSTEM_PROMPT,
  REMOVE_GLASSES_PROMPT,
  ANALYSIS_PROMPT,
  FORENSIC_ANALYSIS_PROMPT,
  COUNTER_FORENSICS_PROMPT,
  GRAND_MASTER_RESTORE_PROMPT,
  TEXTURE_PROMPTS
} from "../constants";

// Initialize Gemini Client (Standard SDK)
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  return apiKey ? new GoogleGenAI({ apiKey }) : null;
};

/**
 * Extract MIME type from Base64 string
 */
const getMimeType = (b64: string): string => {
  const match = b64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
  return match ? match[1] : "image/jpeg";
};

/**
 * Clean Base64 string to remove data URI prefix if present
 */
const cleanBase64 = (b64: string) => {
  return b64.replace(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/, "");
};

/**
 * Helper: Convert Blob to Base64
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Fallback Generator using Pollinations.ai (Flux Model)
 */
const generateWithPollinations = async (
    prompt: string, 
    width: number = 1024, 
    height: number = 1024
): Promise<string> => {
    const seed = Math.floor(Math.random() * 100000);
    const model = 'flux'; 
    const encodedPrompt = encodeURIComponent(`${prompt} --no cgi, 3d, plastic, illustration, cartoon`);
    const url = `https://pollinations.ai/p/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=${model}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Pollinations API failed");
        const blob = await response.blob();
        return await blobToBase64(blob);
    } catch (e) {
        console.error("Fallback generation failed:", e);
        return "";
    }
};

/**
 * Quick Scan - Hybrid approach (Local FaceAPI -> Cloud Gemini)
 */
export const quickScanImage = async (base64Image: string): Promise<string> => {
  
  // 1. Try Local FaceAPI First (Offline & Privacy Friendly)
  try {
      if (isLocalScanAvailable()) {
          console.log("Running Local Biometric Scan...");
          const attributes = await detectFaceAttributes(base64Image);
          if (attributes) {
              return `[LOCAL SCAN]: Est. Age ${attributes.age}, ${attributes.gender}, Expression: ${attributes.expression.toUpperCase()} (${Math.round(attributes.expressionScore * 100)}%)`;
          }
      }
  } catch (e) {
      console.warn("Local scan failed, attempting cloud...", e);
  }

  // 2. Fallback to Gemini Cloud if Local failed or no face found
  const ai = getAIClient();
  if (!ai) return "Offline Mode: Cloud scan skipped. Local scan found no face.";

  const model = "gemini-3-flash-preview"; 
  const mimeType = getMimeType(base64Image);
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { text: "Identify the subject's estimated age range, gender, and primary facial expression in one technical sentence." },
          { inlineData: { mimeType, data: cleanBase64(base64Image) } }
        ]
      }
    });
    return response.text || "Scan inconclusive.";
  } catch (error) {
    return "Scan unavailable (Offline/Fallback).";
  }
};

/**
 * Deep Analysis using Gemini Native
 */
export const analyzeImageCompliance = async (base64Image: string): Promise<string> => {
  const ai = getAIClient();
  
  if (!ai) {
      try {
          const attributes = await detectFaceAttributes(base64Image);
          if (attributes) {
              const compliance = attributes.expression === 'neutral' ? "PASS" : "FAIL";
              return `OFFLINE ANALYSIS (FaceAPI):\n\nExpression: ${attributes.expression.toUpperCase()} [${compliance}]\nAge/Gender: ${attributes.age} / ${attributes.gender}\n\nNote: Deep analysis requires API Key.`;
          }
          return "Offline: No face detected locally.";
      } catch (e) {
          return "Analysis unavailable in offline mode.";
      }
  }

  try {
    const model = "gemini-3-flash-preview"; 
    const mimeType = getMimeType(base64Image);
    
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { text: ANALYSIS_PROMPT },
          { inlineData: { mimeType, data: cleanBase64(base64Image) } }
        ]
      }
    });

    return response.text || "Analysis Output Empty";
    
  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
};

/**
 * Perform Forensic Scan (Deep Scan)
 */
export const performForensicScan = async (base64Image: string): Promise<ForensicScanResult> => {
  const ai = getAIClient();
  if (!ai) {
      return {
          detections: [],
          recommendations: ["System Offline: Deep forensic scan unavailable.", "Visual inspection recommended."],
          ai_probability_score: 0
      };
  }

  const model = "gemini-3-flash-preview"; 
  const mimeType = getMimeType(base64Image);

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      detections: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["COMPLIANCE", "AI_TRACE"] },
            confidence: { type: Type.NUMBER },
            box_2d: { 
              type: Type.ARRAY, 
              items: { type: Type.INTEGER },
              description: "ymin, xmin, ymax, xmax normalized to 0-1000"
            },
            description: { type: Type.STRING }
          }
        }
      },
      recommendations: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      ai_probability_score: { type: Type.NUMBER }
    }
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { text: FORENSIC_ANALYSIS_PROMPT },
          { inlineData: { mimeType, data: cleanBase64(base64Image) } }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No analysis returned.");
    
    const rawResult = JSON.parse(jsonText) as ForensicScanResult;

    const adjustedResult: ForensicScanResult = {
        ...rawResult,
        ai_probability_score: Math.max(0, Math.round(rawResult.ai_probability_score * 0.6)),
        detections: rawResult.detections
            .map(d => ({ 
                ...d, 
                confidence: Math.round(d.confidence * 0.6) 
            }))
            .filter(d => d.confidence > 25) 
    };

    return adjustedResult;

  } catch (error) {
    console.error("Forensic Scan Error:", error);
    throw error;
  }
};

const applyGrandMasterRestoration = async (rawImageBase64: string): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return rawImageBase64; 

  let inputImage = rawImageBase64;
  try {
     inputImage = await applyAnalogSensorNoise(rawImageBase64);
  } catch(e) {
     console.warn("Sensor noise injection skipped.");
  }

  const model = "gemini-2.5-flash-image"; 
  const mimeType = getMimeType(inputImage);

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { text: GRAND_MASTER_RESTORE_PROMPT },
          {
            inlineData: {
              mimeType: mimeType, 
              data: cleanBase64(inputImage),
            },
          },
        ],
      },
    });

    let launderedImage = rawImageBase64;
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          launderedImage = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    // Final Stage: Inject Professional EXIF Metadata (Canon EOS R5)
    console.log("[METADATA] Obfuscating neural origin... Injecting Canon EOS R5 signature.");
    const withMetadata = await injectProfessionalMetadata(launderedImage);
    return withMetadata;

  } catch (error) {
    console.error("Restoration Error:", error);
    return rawImageBase64; 
  }
};

export const applyCounterForensics = async (base64Image: string, recommendations: string[]): Promise<string> => {
    const ai = getAIClient();
    if (!ai) throw new Error("API Key required.");

    const model = "gemini-2.5-flash-image"; 
    const mimeType = getMimeType(base64Image);

    const promptText = `
    ${COUNTER_FORENSICS_PROMPT}
    SPECIFIC RECOMMENDATIONS:
    ${recommendations.map(r => `- ${r}`).join('\n')}
    `;

    try {
        const responseCorrected = await ai.models.generateContent({
            model,
            contents: {
                parts: [
                    { text: promptText },
                    { inlineData: { mimeType: mimeType, data: cleanBase64(base64Image) } }
                ]
            }
        });

        if (responseCorrected.candidates && responseCorrected.candidates[0].content.parts) {
            for (const part of responseCorrected.candidates[0].content.parts) {
              if (part.inlineData && part.inlineData.data) {
                const img = `data:image/png;base64,${part.inlineData.data}`;
                return await injectProfessionalMetadata(img);
              }
            }
          }
        throw new Error("Counter-forensics generation failed.");

    } catch (error) {
        console.error("Counter-Forensics Error:", error);
        throw error;
    }
};

export const removeGlasses = async (currentImageBase64: string): Promise<string> => {
  const ai = getAIClient();
  if (!ai) throw new Error("API Key required.");
  
  const model = "gemini-2.5-flash-image";
  const mimeType = getMimeType(currentImageBase64);

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { text: REMOVE_GLASSES_PROMPT },
          {
            inlineData: {
              mimeType: mimeType, 
              data: cleanBase64(currentImageBase64),
            },
          },
        ],
      },
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const img = `data:image/png;base64,${part.inlineData.data}`;
          return await injectProfessionalMetadata(img);
        }
      }
    }
    
    throw new Error("Glasses removal failed.");
  } catch (error) {
    console.error("Glasses Removal Error:", error);
    throw error;
  }
};

const generateSingleImage = async (
  ai: GoogleGenAI,
  model: string,
  parts: any[],
  config: any
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config: config
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image data found");
  } catch (e) {
    console.error("Variation failed", e);
    return ""; 
  }
};

export const generateHeadshot = async (
  base64Image: string | null,
  promptInput: string | undefined,
  mode: AgentMode,
  aspectRatio: AspectRatio = '1:1',
  resolution: ImageResolution = '1K',
  textureLevel: TextureLevel = 'enhanced'
): Promise<string[]> => {
  const ai = getAIClient();
  
  // 1. Establish Biometric Baseline locally using face-api.js
  let biometricContext = "";
  if (base64Image && isLocalScanAvailable()) {
      try {
          console.log("[BIOMETRIC] Initializing local neural scan...");
          const attr = await detectFaceAttributes(base64Image);
          if (attr) {
              console.log(`[BIOMETRIC] Baseline locked: Age ${attr.age}, ${attr.gender}, Expression: ${attr.expression}`);
              biometricContext = `BIOMETRIC DATA (BASELINE): Subject is approximately ${attr.age} years old, ${attr.gender}, expressing ${attr.expression}. Preserve these core features.`;
              
              if (mode === AgentMode.DISGUISE) {
                  // For Disguise mode, we explicitly use the baseline to "shift" identity markers
                  biometricContext += ` DISGUISE INSTRUCTION: Use the baseline as a reference to create a 'lookalike'. Modify facial width and age by +/- 4 years to break automated biometric matches while maintaining biological plausibility.`;
              }
          }
      } catch (e) {
          console.warn("[BIOMETRIC] Baseline scan failed, continuing with visual analysis only.", e);
      }
  }

  if (!ai) {
      console.warn("Using Fallback (Pollinations.ai).");
      let fallbackPrompt = "";
      const baseStyle = "Passport photo, identification headshot, studio blue background, photorealistic, 8k, raw texture, sharp focus, neutral expression";
      if (mode === AgentMode.SYNTHETIC && promptInput) {
          fallbackPrompt = `Photo of ${promptInput}, ${baseStyle}`;
      } else {
          fallbackPrompt = `Photo of a professional person, ${promptInput || "standard citizen"}, ${biometricContext} ${baseStyle}, ${textureLevel === 'enhanced' ? 'visible pores, skin texture' : 'smooth skin'}`;
      }
      const promises = [1, 2, 3, 4].map(() => generateWithPollinations(fallbackPrompt));
      const results = await Promise.all(promises);
      const successful = results.filter(s => s.length > 0);
      
      // Inject metadata into successful fallback results as well
      const metadataResults = await Promise.all(successful.map(img => injectProfessionalMetadata(img)));

      if (metadataResults.length === 0) throw new Error("Fallback generation failed.");
      return metadataResults;
  }

  let model = "gemini-2.5-flash-image"; 
  let baseSystemPrompt = "";
  
  if (mode === AgentMode.SYNTHETIC || resolution === '2K' || resolution === '4K') {
    model = "gemini-3-pro-image-preview";
  } else {
    model = "gemini-2.5-flash-image";
  }

  if (mode === AgentMode.SYNTHETIC) {
    baseSystemPrompt = SYNTHETIC_ID_PROMPT;
  } else {
    baseSystemPrompt = mode === AgentMode.STANDARD ? STANDARD_FORGER_PROMPT : DIGITAL_DISGUISE_PROMPT;
  }

  const commonTexturePrompt = TEXTURE_PROMPTS[textureLevel];
  const cropRule = " [STRICT COMPLIANCE: HEADROOM required. Blue BG.]";
  const bioRule = " [BIOLOGICAL REALISM: Render pores, and fine lines. No plastic smoothing.]";

  const variationPrompts = [
    `Variation 1: Professional attire. Current age baseline. ${biometricContext} ${commonTexturePrompt}${cropRule}${bioRule}`,
    `Variation 2: Professional attire. Mature (+3 years shift). ${biometricContext} ${commonTexturePrompt}${cropRule}${bioRule}`,
    `Variation 3: Professional formal attire. Older (+7 years shift). ${biometricContext} ${commonTexturePrompt}${cropRule}${bioRule}`,
    `Variation 4: Neutral attire. Hyper-realistic skin markers. ${biometricContext} ${commonTexturePrompt}${cropRule}${bioRule}`
  ];

  const requests = variationPrompts.map(async (variation) => {
    let promptText = "";
    const parts: any[] = [];
    
    if (mode === AgentMode.SYNTHETIC) {
      promptText = `${baseSystemPrompt}\n${variation}\nUser Description: ${promptInput || "A standard citizen."}`;
    } else {
      promptText = `${baseSystemPrompt}\n${variation}`;
    }

    parts.push({ text: promptText });
    
    if (base64Image && mode !== AgentMode.SYNTHETIC) {
      parts.push({
        inlineData: {
          mimeType: getMimeType(base64Image),
          data: cleanBase64(base64Image),
        },
      });
    }

    const config: any = {
      imageConfig: {
        aspectRatio: aspectRatio
      }
    };
    
    if (model === "gemini-3-pro-image-preview") {
      config.imageConfig.imageSize = resolution;
    }

    return generateSingleImage(ai, model, parts, config);
  });

  const rawResults = await Promise.all(requests);
  const successfulRawImages = rawResults.filter(img => img.length > 0);
  
  if (successfulRawImages.length === 0) {
      const fallbackPrompt = `ID Photo, studio blue background, ${biometricContext} ${promptInput || "person"}`;
      const fallbackResults = await Promise.all([1, 2, 3, 4].map(() => generateWithPollinations(fallbackPrompt)));
      const metadataResults = await Promise.all(fallbackResults.filter(s => s.length > 0).map(img => injectProfessionalMetadata(img)));
      return metadataResults;
  }

  const launderedResults = await Promise.all(
    successfulRawImages.map(async (rawImg) => {
        return await applyGrandMasterRestoration(rawImg);
    })
  );

  return launderedResults;
};

export const editHeadshot = async (
  currentImageBase64: string,
  instructions: string
): Promise<string> => {
  const ai = getAIClient();
  if (!ai) throw new Error("API Key required.");

  const model = "gemini-2.5-flash-image";
  const mimeType = getMimeType(currentImageBase64);

  const promptText = `
    ${EDIT_SYSTEM_PROMPT}
    Instruction: "${instructions}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { text: promptText },
          {
            inlineData: {
              mimeType: mimeType, 
              data: cleanBase64(currentImageBase64),
            },
          },
        ],
      },
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const img = `data:image/png;base64,${part.inlineData.data}`;
          return await injectProfessionalMetadata(img);
        }
      }
    }
    
    throw new Error("Editing failed.");
  } catch (error) {
    console.error("Gemini Edit Error:", error);
    throw error;
  }
};
