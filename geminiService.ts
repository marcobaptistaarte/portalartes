import { GoogleGenAI, Type } from "@google/genai";
import { SelectionState, GeneratedContent } from "./types";

const parseGeminiJson = (text: string) => {
  try {
    let cleanText = text
      .replace(/\[\d+\]/g, '')
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    }
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Critical error parsing JSON from Gemini:", text);
    throw new Error("A IA retornou um formato inesperado. Verifique os dados e tente novamente.");
  }
};

export const generateEducationalContent = async (selection: SelectionState): Promise<GeneratedContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Como um especialista em educação artística, gere um conteúdo de alta qualidade para o seguinte filtro:
    Nível: ${selection.level}
    Série: ${selection.grade}
    Bimestre: ${selection.bimester}
    Tipo de Recurso: ${selection.resource}

    O conteúdo deve ser pedagógico, inspirador, prático e alinhado com as competências da BNCC. 
    Retorne o resultado estritamente no formato JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "content", "tags"]
        }
      }
    });

    return parseGeminiJson(response.text);
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
};
