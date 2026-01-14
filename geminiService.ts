import { GoogleGenAI, Type } from "@google/genai";
import { SelectionState, GeneratedContent } from "./types";

/**
 * Auxiliar para limpar e analisar o JSON da resposta do Gemini de forma ultra-resiliente.
 */
const parseGeminiJson = (text: string) => {
  try {
    // 1. Limpeza agressiva: remove citações [1], blocos de código markdown e espaços em branco
    let cleanText = text
      .replace(/\[\d+\]/g, '') // Remove [1], [2], etc
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    
    // 2. Tenta localizar o primeiro '{' e o último '}' para isolar o objeto
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    }

    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Erro crítico ao analisar JSON do Gemini. Resposta bruta:", text);
    throw new Error("A IA retornou um formato inesperado. Por favor, tente novamente.");
  }
};

/**
 * Extrai o ID do vídeo do YouTube de uma URL de forma robusta via Regex.
 */
const extractYoutubeId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
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
 * Extrai metadados de um vídeo do YouTube.
 * Removido o 'googleSearch' para este caso específico pois o modelo já possui 
 * conhecimento vasto de URLs públicas e o grounding injeta tokens que quebram o JSON.
 */
export const getVideoMetadata = async (url: string) => {
  const videoId = extractYoutubeId(url);
  if (!videoId) throw new Error("URL do YouTube inválida.");

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Usamos Flash para extração de dados estruturados por ser mais rápido e preciso no formato
  const prompt = `Analise as informações públicas do vídeo do YouTube: ${url}.
  Retorne EXCLUSIVAMENTE um objeto JSON com as seguintes chaves e nada mais:
  {
    "title": "Título claro e oficial do vídeo",
    "summary": "Um resumo pedagógico de 2 parágrafos explicando o valor educacional deste vídeo para aulas de artes",
    "snippet": "Uma string contendo os 3 pontos principais separados por ponto final"
  }
  Não inclua explicações, apenas o JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    const data = parseGeminiJson(response.text);
    
    return {
      title: data.title || "Vídeo Educativo",
      summary: data.summary || "Resumo em processamento.",
      snippet: data.snippet || "",
      videoId: videoId
    };
  } catch (error) { 
    console.error("Erro detalhado no getVideoMetadata:", error);
    throw error; 
  }
};

/**
 * Extrai metadados de uma notícia ou artigo a partir de um link.
 */
export const getNewsMetadata = async (url: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Analise este artigo/notícia: ${url}. 
  Retorne EXCLUSIVAMENTE um objeto JSON com:
  - "title": Título da matéria.
  - "summary": Resumo de 3 parágrafos.
  - "snippet": Destaques principais.
  - "category": 'Matéria' ou 'Artigo'.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    const data = parseGeminiJson(response.text);
    return {
      title: data.title || "Notícia",
      summary: data.summary || "Resumo indisponível.",
      snippet: data.snippet || "",
      category: data.category || 'Matéria'
    };
  } catch (error) { 
    console.error("Erro no getNewsMetadata:", error);
    throw error; 
  }
};
