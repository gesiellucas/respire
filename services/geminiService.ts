
import { GoogleGenAI } from "@google/genai";

const getSystemPrompt = (type: 'intention' | 'reflection'): string => {
  if (type === 'intention') {
    return "You are a mindfulness assistant. Generate a short (1-2 sentences), positive, and inspiring intention for a breathing session. Respond in Brazilian Portuguese.";
  }
  return "You are a mindfulness assistant. Generate a short (2-3 sentences) reflection on completing a breathing exercise, focusing on peace and self-awareness. Respond in Brazilian Portuguese.";
};

const getUserQuery = (type: 'intention' | 'reflection'): string => {
  if (type === 'intention') {
    return "Generate a mindfulness intention for my breathing practice.";
  }
  return "Generate a reflection for after my breathing practice.";
};

export const generateFocusText = async (apiKey: string, type: 'intention' | 'reflection'): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is required.");
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: "user", parts: [{ text: getUserQuery(type) }] }],
      config: {
        systemInstruction: getSystemPrompt(type),
        temperature: 0.9,
      },
    });

    const text = response.text;
    if (text) {
      return text;
    } else {
      throw new Error("Invalid response from API.");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    if (error instanceof Error) {
        if (error.message.includes('API_KEY_INVALID')) {
            throw new Error('API Key is invalid. Please check it and try again.');
        }
    }
    throw new Error("Failed to connect to the assistant. Please check your API key.");
  }
};
