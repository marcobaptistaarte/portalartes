
import { GoogleGenAI, Type } from "@google/genai";
import { SelectionState, GeneratedContent } from "./types";

/**
 * Serviço responsável por gerar conteúdos pedagógicos utilizando a API do Gemini.
 * Utiliza o modelo gemini-3-flash-preview para respostas rápidas e estruturadas.
 */
export const generateEducationalContent = async (selection: SelectionState): Promise<GeneratedContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Como um especialista em educação artística, gere um conteúdo de alta qualidade para o seguinte filtro:
    Nível: ${selection.level}
    Série: ${selection.grade}
    Bimestre: ${selection.bimester}
    Tipo de Recurso: ${selection.resource}

    O conteúdo deve ser pedagógico, inspirador, prático e alinhado com as competências da BNCC (Base Nacional Comum Curricular). 
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
            title: { type: Type.STRING, description: "Título do recurso" },
            content: { type: Type.STRING, description: "Conteúdo detalhado em Markdown" },
            tags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Palavras-chave relacionadas"
            }
          },
          required: ["title", "content", "tags"]
        }
      }
    });

    const jsonStr = response.text;
    if (!jsonStr) throw new Error("Resposta vazia da IA");
    
    return JSON.parse(jsonStr.trim()) as GeneratedContent;
  } catch (error) {
    console.error("Erro ao gerar conteúdo via Gemini:", error);
    throw new Error("Não foi possível gerar o conteúdo pedagógico no momento.");
  }
};

/**
 * Extrai metadados de um vídeo do YouTube usando IA e Google Search.
 */
export const getVideoMetadata = async (url: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analise o vídeo deste link: ${url}.
    Extraia as seguintes informações em português:
    1. Título exato do vídeo.
    2. Um resumo de 2 parágrafos sobre o assunto do vídeo.
    3. Um snippet (lista de pontos principais).
    4. O ID do vídeo (os 11 caracteres após v= ou no final da URL).

    Retorne APENAS um JSON válido.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Use pro for better search results
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
  } catch (error) {
    console.error("Erro ao buscar metadados do vídeo:", error);
    throw error;
  }
};
