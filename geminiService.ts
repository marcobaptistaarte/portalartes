import { GoogleGenAI, Type } from "@google/genai";
import { SelectionState, GeneratedContent } from "./types";

/**
 * Auxiliar para limpar e analisar o JSON da resposta do Gemini.
 * Remove blocos de código markdown se presentes e limpa espaços extras.
 */
const parseGeminiJson = (text: string) => {
  try {
    // Remove possíveis blocos de código markdown que a IA possa incluir por engano
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Erro ao analisar JSON do Gemini:", text, e);
    throw new Error("Não foi possível processar a resposta da IA. Verifique se o link está correto e tente novamente.");
  }
};

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
    console.error("Erro ao gerar conteúdo:", error);
    throw error;
  }
};

/**
 * Extrai metadados de um vídeo do YouTube de forma robusta.
 */
export const getVideoMetadata = async (url: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Usando gemini-3-pro-preview para tarefas complexas de extração de metadados com busca
  const prompt = `Analise detalhadamente o vídeo do YouTube no link: ${url}. 
  Utilize a ferramenta de busca do Google para obter o título oficial e o resumo do vídeo.
  Extraia e retorne EXCLUSIVAMENTE um objeto JSON com as propriedades:
  - title: O título completo do vídeo.
  - summary: Um resumo de 2 parágrafos sobre o tema do vídeo.
  - snippet: Uma lista de 3 destaques ou pontos principais.
  - videoId: O ID alfanumérico de 11 caracteres do vídeo extraído da URL.
  
  IMPORTANTE: Sua resposta deve conter apenas o JSON puro, sem citações [1] ou explicações adicionais que invalidem o formato.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
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
    return parseGeminiJson(response.text);
  } catch (error) { 
    console.error("Erro no getVideoMetadata:", error);
    throw error; 
  }
};

/**
 * Extrai metadados de uma notícia ou artigo a partir de um link.
 */
export const getNewsMetadata = async (url: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Analise detalhadamente o conteúdo deste artigo ou notícia: ${url}. 
  Utilize a busca do Google para garantir a precisão das informações extraídas.
  Retorne EXCLUSIVAMENTE um objeto JSON com:
  - title: Título original da matéria.
  - summary: Resumo estruturado em 3 parágrafos.
  - snippet: Lista de destaques ou tópicos principais.
  - category: Classifique estritamente como 'Matéria' ou 'Artigo'.
  
  IMPORTANTE: Retorne apenas o JSON. Não inclua citações ou textos explicativos.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
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
            category: { type: Type.STRING }
          },
          required: ["title", "summary", "snippet", "category"]
        }
      }
    });
    return parseGeminiJson(response.text);
  } catch (error) { 
    console.error("Erro no getNewsMetadata:", error);
    throw error; 
  }
};
