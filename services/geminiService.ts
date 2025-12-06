
import { GoogleGenAI, Type } from "@google/genai";
import { ParticleConfig } from "../types";

// Helper to ensure we have a valid key before making requests
const getClient = (): GoogleGenAI => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateConfigFromPrompt = async (prompt: string): Promise<Partial<ParticleConfig>> => {
  const ai = getClient();
  
  const systemInstruction = `
    You are a creative coder and graphics expert. 
    Your goal is to translate a natural language description into a set of numerical parameters for a 3D particle system.
    
    The available shapes are:
    - Basic: 'sphere', 'cube', 'torus', 'spiral', 'grid', 'diamond'
    - Nature: 'ocean', 'tree', 'bear', 'comet', 'solar_system', 'galaxy'
    - Objects: 'car', 'heart', 'dna'
    - Symbols/Text: 'dollar', 'euro', 'bitcoin', 'yen', 'text'
    
    If the user specifically asks for a word or name to be displayed (e.g. "Show the name JOHN"), set shape to 'text' and the 'text' property to "JOHN".
    
    Return a JSON object matching the schema provided. 
    - color: Hex color string.
    - particleCount: Integer between 1000 and 15000.
    - speed: Float between 0.1 (static) and 3.0 (chaotic).
    - noiseStrength: Float between 0.0 (clean shape) and 2.0 (noisy/organic).
    - size: Float between 0.02 and 0.15.
    - shape: One of the allowed shapes.
    - text: String (only if shape is 'text').
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            particleCount: { type: Type.INTEGER },
            color: { type: Type.STRING },
            shape: { type: Type.STRING, enum: [
                'sphere', 'cube', 'torus', 'spiral', 'grid',
                'galaxy', 'heart', 'dna', 'car', 'bear',
                'solar_system', 'comet', 'ocean', 'tree', 
                'diamond', 'dollar', 'euro', 'bitcoin', 'yen', 'text'
            ] },
            speed: { type: Type.NUMBER },
            noiseStrength: { type: Type.NUMBER },
            size: { type: Type.NUMBER },
            text: { type: Type.STRING }
          },
          required: ['particleCount', 'color', 'shape', 'speed', 'noiseStrength', 'size'],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as Partial<ParticleConfig>;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
