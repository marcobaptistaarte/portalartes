
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
    throw new Error("A IA retornou um formato inesperado. Por favor, tente novamente ou verifique o link.");
  }
};

const extractYoutubeId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
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

export const getVideoMetadata = async (url: string) => {
  const videoId = extractYoutubeId(url);
  if (!videoId) throw new Error("URL do YouTube inválida.");

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Acesse e analise as informações reais do vídeo do YouTube no link: ${url}.
  Utilize a ferramenta de busca para obter o título e a descrição oficial.
  Com base nisso, retorne EXCLUSIVAMENTE um objeto JSON:
  {
    "title": "Título exato do vídeo",
    "summary": "Um resumo pedagógico detalhado de 2 parágrafos. O texto DEVE terminar obrigatoriamente com a frase: Clique no vídeo abaixo para assistir ao conteúdo completo.",
    "snippet": "Destaques principais"
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
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
    console.error("getVideoMetadata error:", error);
    throw error; 
  }
};

export const getNewsMetadata = async (url: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Analise este artigo/notícia: ${url}. 
  Utilize busca para garantir precisão dos dados.
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
        tools: [{ googleSearch: {} }]
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
    console.error("getNewsMetadata error:", error);
    throw error; 
  }
};
