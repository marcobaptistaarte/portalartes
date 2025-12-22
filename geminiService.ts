
import { GoogleGenAI, Type } from "@google/genai";
import { SelectionState, GeneratedContent } from "./types";

export const generateEducationalContent = async (selection: SelectionState): Promise<GeneratedContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Como um especialista em educação artística, gere um conteúdo de alta qualidade para o seguinte filtro:
    Nível: ${selection.level}
    Série: ${selection.grade}
    Bimestre: ${selection.bimester}
    Tipo de Recurso: ${selection.resource}

    O conteúdo deve ser pedagógico, inspirador, prático e alinhado com as competências da BNCC (Base Nacional Comum Curricular). 
    Se o tipo for 'Imagens', descreva detalhadamente imagens ou obras de arte que poderiam ser usadas.
    Retorne o resultado no formato JSON especificado.
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

    const result = JSON.parse(response.text);
    return result as GeneratedContent;
  } catch (error) {
    console.error("Erro ao gerar conteúdo:", error);
    throw new Error("Não foi possível gerar o conteúdo pedagógico no momento.");
  }
};
