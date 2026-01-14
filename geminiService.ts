
import { GoogleGenAI, Type } from "@google/genai";
import { SelectionState, GeneratedContent } from "./types";

/**
 * Serviço responsável por gerar conteúdos pedagógicos utilizando a API do Gemini.
 */
export const generateEducationalContent = async (selection: SelectionState): Promise<GeneratedContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Como um especialista em educação artística, gere um conteúdo de alta qualidade para o seguinte filtro:
    Nível: ${selection.level}
    Série: ${selection.grade}
    Bimestre: ${selection.bimester}
    Tipo de Recurso: ${selection.resource}

    O conteúdo deve ser pedagógico, inspirador, prático e alinhado com as competências da BNCC. 
    Retorne o resultado estritamente no formato JSON especificado.
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

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Erro ao gerar conteúdo:", error);
    throw error;
  }
};

/**
 * Extrai metadados de um vídeo do YouTube.
 */
export const getVideoMetadata = async (url: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Analise o vídeo: ${url}. Retorne JSON com: title, summary (resumo 2 parágrafos), snippet (pontos principais), videoId (ID de 11 caracteres).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            snippet: { type: Type.STRING },
            videoId: { type: Type.STRING }
          },
          required: ["title", "summary", "snippet", "videoId"]
        }
      }
    });
    return JSON.parse(response.text.trim());
  } catch (error) { throw error; }
};

/**
 * Extrai metadados de uma notícia ou artigo a partir de um link.
 */
export const getNewsMetadata = async (url: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Analise este artigo/notícia: ${url}. Extraia: título, um resumo conciso de 3 parágrafos, um snippet (lista de destaques) e sugira se é 'Notícia' ou 'Artigo'. Retorne JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            snippet: { type: Type.STRING },
            category: { type: Type.STRING, description: "'Notícia' ou 'Artigo'" }
          },
          required: ["title", "summary", "snippet", "category"]
        }
      }
    });
    return JSON.parse(response.text.trim());
  } catch (error) { throw error; }
};
