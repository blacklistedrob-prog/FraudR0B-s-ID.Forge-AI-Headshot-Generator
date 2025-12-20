export enum AgentMode {
  STANDARD = 'STANDARD', // Image-to-Image (Refinement)
  DISGUISE = 'DISGUISE', // Image-to-Image (Alteration)
  SYNTHETIC = 'SYNTHETIC' // Text-to-Image (Fabrication)
}

export type AspectRatio = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9';
export type ImageResolution = '1K' | '2K' | '4K';
export type TextureLevel = 'natural' | 'smoothed' | 'enhanced';

export interface GenerationRequest {
  image: string | null; // Base64 or null for Synthetic
  prompt?: string; // For Synthetic
  mode: AgentMode;
  config?: {
    aspectRatio: AspectRatio;
    resolution: ImageResolution;
    textureLevel: TextureLevel;
  }
}

export interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed';
}

export interface AgentStats {
  name: string;
  classType: string;
  hp: string | number;
  mp: string | number;
  description: string;
  ability: string;
}

export interface ForensicDetection {
  label: string;
  type: 'COMPLIANCE' | 'AI_TRACE';
  confidence: number;
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] normalized 0-1000
  description: string;
}

export interface ForensicScanResult {
  detections: ForensicDetection[];
  recommendations: string[];
  ai_probability_score: number; // 0-100
}