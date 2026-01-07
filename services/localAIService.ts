import { pipeline } from '@xenova/transformers';

let classifier: any = null;

// Initialize the Vision Transformer
export const initLocalAI = async () => {
    if (!classifier) {
        console.log("Loading Local Vision Transformer...");
        // Using a smaller quantization for browser speed
        classifier = await pipeline('image-classification', 'Xenova/vit-base-patch16-224', {
            quantized: true 
        });
        console.log("Local Vision Transformer Loaded.");
    }
};

export const classifyImageLocal = async (base64Image: string): Promise<string> => {
    try {
        await initLocalAI();
        if (!classifier) return "Local AI initialization failed.";

        const results = await classifier(base64Image);
        
        // Results are array of { label: string, score: number }
        if (results && results.length > 0) {
            const top = results[0];
            return `[LOCAL NEURAL NET]: Identified '${top.label}' (${(top.score * 100).toFixed(1)}% confidence).`;
        }
        return "Local classification inconclusive.";
    } catch (e) {
        console.error("Local AI Error:", e);
        return "Local AI Error.";
    }
};