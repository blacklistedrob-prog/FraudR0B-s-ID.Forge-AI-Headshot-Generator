import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AgentMode, AspectRatio, ImageResolution, ForensicScanResult, TextureLevel } from "../types";
import { 
  STANDARD_FORGER_PROMPT, 
  DIGITAL_DISGUISE_PROMPT, 
  SYNTHETIC_ID_PROMPT, 
  EDIT_SYSTEM_PROMPT,
  ANALYSIS_PROMPT,
  FORENSIC_ANALYSIS_PROMPT,
  COUNTER_FORENSICS_PROMPT,
  TEXTURE_PROMPTS
} from "../constants";

// Initialize Gemini Client
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Clean Base64 string to remove data URI prefix if present
 */
const cleanBase64 = (b64: string) => {
  return b64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
};

/**
 * Quick Scan using Flash Lite for low-latency initial check
 */
export const quickScanImage = async (base64Image: string): Promise<string> => {
  const ai = getAIClient();
  const model = "gemini-2.5-flash-lite-latest"; 
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { text: "Identify the subject's estimated age range, gender, and primary facial expression in one technical sentence." },
          { inlineData: { mimeType: "image/jpeg", data: cleanBase64(base64Image) } }
        ]
      }
    });
    return response.text || "Scan inconclusive.";
  } catch (error) {
    console.error("Quick Scan Error:", error);
    return "Scan failed.";
  }
};

/**
 * Deep Analysis using Gemini 3 Pro with Thinking
 */
export const analyzeImageCompliance = async (base64Image: string): Promise<string> => {
  const ai = getAIClient();
  const model = "gemini-3-pro-preview"; 

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { text: ANALYSIS_PROMPT },
          { inlineData: { mimeType: "image/jpeg", data: cleanBase64(base64Image) } }
        ]
      },
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    return response.text || "Analysis failed to generate text.";
  } catch (error) {
    console.error("Deep Analysis Error:", error);
    throw error;
  }
};

/**
 * Perform Forensic Scan (Deep Scan)
 * Scans for AAMVA compliance AND AI artifacts. Returns bounding boxes.
 */
export const performForensicScan = async (base64Image: string): Promise<ForensicScanResult> => {
  const ai = getAIClient();
  // Using 3-flash for schema capabilities + vision, or 2.5-flash. 
  // 3-flash-preview is good for structured output.
  const model = "gemini-2.5-flash"; 

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
          { inlineData: { mimeType: "image/jpeg", data: cleanBase64(base64Image) } }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No analysis returned.");
    return JSON.parse(jsonText) as ForensicScanResult;

  } catch (error) {
    console.error("Forensic Scan Error:", error);
    throw error;
  }
};

/**
 * Apply Counter-Forensics
 * "Humanizes" the image to defeat detection.
 */
export const applyCounterForensics = async (base64Image: string, recommendations: string[]): Promise<string> => {
    const ai = getAIClient();
    const model = "gemini-2.5-flash-image"; // Good for editing

    const promptText = `
    ${COUNTER_FORENSICS_PROMPT}
    SPECIFIC RECOMMENDATIONS TO IMPLEMENT:
    ${recommendations.map(r => `- ${r}`).join('\n')}
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: {
                parts: [
                    { text: promptText },
                    { inlineData: { mimeType: "image/png", data: cleanBase64(base64Image) } }
                ]
            }
        });

        if (response.candidates && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
              if (part.inlineData && part.inlineData.data) {
                return `data:image/png;base64,${part.inlineData.data}`;
              }
            }
          }
        throw new Error("Counter-forensics generation failed.");

    } catch (error) {
        console.error("Counter-Forensics Error:", error);
        throw error;
    }
};

/**
 * Helper to generate a single image variation
 */
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
    throw new Error("No image data found in response");
  } catch (e) {
    console.error("Generation failed for one variation", e);
    return ""; // Return empty to filter out later
  }
};

/**
 * Main generation function handling Standard, Disguise, and Synthetic modes.
 * Generates 4 variations in parallel.
 */
export const generateHeadshot = async (
  base64Image: string | null,
  promptInput: string | undefined,
  mode: AgentMode,
  aspectRatio: AspectRatio = '1:1',
  resolution: ImageResolution = '1K',
  textureLevel: TextureLevel = 'enhanced'
): Promise<string[]> => {
  const ai = getAIClient();
  let model = "gemini-2.5-flash-image"; 
  let baseSystemPrompt = "";
  
  // 1. Determine Model & Base Prompt
  // Upgrade to Gemini 3 Pro if resolution > 1K or if in Synthetic mode
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

  // 2. Define Variations (Age, Clothing, Grooming)
  // Select the appropriate texture instruction
  const commonTexturePrompt = TEXTURE_PROMPTS[textureLevel];
  
  // Append reinforcement of crop rules to every variation
  const cropRule = " [STRICT COMPLIANCE: HEADROOM required above hair. FULL SHOULDERS visible. Blue BG.]";

  const variationPrompts = [
    `Variation 1: Standard compliant. Professional Navy Blue Suit. Current age. Natural skin texture. ${commonTexturePrompt}${cropRule}`,
    `Variation 2: Professional Charcoal Grey attire. Subject looks slightly more mature (+3 years). Visible skin texture. ${commonTexturePrompt}${cropRule}`,
    `Variation 3: Professional Black formal attire. Subject looks older (+7 years). Distinct facial lines, nasolabial folds. ${commonTexturePrompt}${cropRule}`,
    `Variation 4: Professional Light Grey/Neutral attire. Mature look. Hyper-realistic mature skin. Deep pores. ${commonTexturePrompt}${cropRule}`
  ];

  // 3. Prepare Parallel Requests
  const requests = variationPrompts.map(async (variation) => {
    let promptText = "";
    const parts: any[] = [];
    
    // Construct Prompt
    if (mode === AgentMode.SYNTHETIC) {
      promptText = `${baseSystemPrompt}\n${variation}\nUser Description: ${promptInput || "A standard citizen."}\nIMPORTANT: Return ONLY the image.`;
    } else {
      promptText = `${baseSystemPrompt}\n${variation}\nIMPORTANT: Return ONLY the image.`;
    }

    parts.push({ text: promptText });
    
    if (base64Image && mode !== AgentMode.SYNTHETIC) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: cleanBase64(base64Image),
        },
      });
    }

    // Config
    const config: any = {
      imageConfig: {
        aspectRatio: aspectRatio
      }
    };
    
    // Only set imageSize if using the Pro model, otherwise it might fail on Flash Image
    if (model === "gemini-3-pro-image-preview") {
      config.imageConfig.imageSize = resolution;
    }

    return generateSingleImage(ai, model, parts, config);
  });

  // 4. Execute Parallel
  const results = await Promise.all(requests);
  
  // Filter out failures
  const successfulImages = results.filter(img => img.length > 0);
  
  if (successfulImages.length === 0) {
    throw new Error("All image generation attempts failed.");
  }

  return successfulImages;
};

/**
 * Edit function for post-production changes.
 */
export const editHeadshot = async (
  currentImageBase64: string,
  instructions: string
): Promise<string> => {
  const ai = getAIClient();
  const model = "gemini-2.5-flash-image";

  const promptText = `
    ${EDIT_SYSTEM_PROMPT}
    User Instruction: "${instructions}"
    IMPORTANT: Ensure the edit results in a photorealistic image with natural skin texture. Do not smooth away details. Keep it looking like a raw photo.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { text: promptText },
          {
            inlineData: {
              mimeType: "image/png", 
              data: cleanBase64(currentImageBase64),
            },
          },
        ],
      },
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("Editing failed to produce an image.");
  } catch (error) {
    console.error("Gemini Edit Error:", error);
    throw error;
  }
};