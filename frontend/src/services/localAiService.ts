//Already Updated
// @ts-ignore
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface LocalDetection {
  original_text: string;
  translated_text: string;
  box_2d: [number, number, number, number];
}

export const localAiService = {
  // 1. Vision Intelligence Route Gateway
  async analyzeVision(base64Image: string) {
    if (!base64Image) {
      throw new Error("SERVICE_ERROR: No base64 data provided");
    }

    const response = await fetch(`${API_BASE_URL}/vision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_base64: base64Image }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.details || 'VISION_ENDPOINT_ERROR');
    }
    return response.json();
  },

  // 2. Sentiment Narrative Analyzer Route Gateway
  async analyzeSentiment(text: string) {
    const response = await fetch(`${API_BASE_URL}/sentiment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) throw new Error('SENTIMENT_ENDPOINT_ERROR');
    return response.json();
  },

  // 3. AR Live Translation OCR Route Gateway (Updated for High-Availability Object Shape)
  async translateAR(base64Image: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/translate-ar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_base64: base64Image }),
    });
    if (!response.ok) throw new Error('TRANSLATE_AR_ENDPOINT_ERROR');
    
    const data = await response.json();
    
    // Extracted and normalized internal matrix coordinates mapping smoothly
    const normalizedDetections = (data.detections || []).map((det: any) => ({
      original_text: det.original_text || det.original || '',
      translated_text: det.translated_text || det.translation || det.original_text || '',
      box_2d: det.box_2d,
    }));

    // Returning the entire object shape containing telemetry data intact
    return {
      ...data,
      detections: normalizedDetections
    };
  },
};