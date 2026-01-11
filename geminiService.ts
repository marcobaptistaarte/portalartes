
import { GoogleGenAI, Type } from "@google/genai";
import { SelectionState, GeneratedContent } from "./types";

/**
 * Serviço responsável por gerar conteúdos pedagógicos utilizando a API do Gemini.
 * Utiliza o modelo gemini-3-flash-preview para respostas rápidas e estruturadas.
 */
export const generateEducationalContent = async (selection: SelectionState): Promise<GeneratedContent> => {
  // A API Key é obtida automaticamente do ambiente configurado no Vercel/Vite
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

    // A propriedade .text do SDK retorna a string JSON diretamente
    const jsonStr = response.text;
    if (!jsonStr) throw new Error("Resposta vazia da IA");
    
    return JSON.parse(jsonStr.trim()) as GeneratedContent;
  } catch (error) {
    console.error("Erro ao gerar conteúdo via Gemini:", error);
    throw new Error("Não foi possível gerar o conteúdo pedagógico no momento. Tente novamente em alguns instantes.");
  }
};
