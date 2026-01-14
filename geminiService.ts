import { GoogleGenAI, Type } from "@google/genai";
import { SelectionState, GeneratedContent } from "./types";

/**
 * Auxiliar para limpar e analisar o JSON da resposta do Gemini.
 * Remove blocos de código markdown, citações de busca [1] e limpa espaços extras.
 */
const parseGeminiJson = (text: string) => {
  try {
    // 1. Remove citações de busca (ex: [1], [2]) que o Gemini insere ao usar ferramentas de busca
    // e que invalidam o JSON.
    let cleanText = text.replace(/\[\d+\]/g, '');
    
    // 2. Remove blocos de código markdown se presentes
    cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '').trim();

    // 3. Tenta encontrar o objeto JSON se houver texto adicional ao redor
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanText = jsonMatch[0];
    }

    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Erro ao analisar JSON do Gemini:", text, e);
    throw new Error("Não foi possível processar a resposta da IA. O formato retornado não é um JSON válido.");
  }
};

/**
 * Extrai o ID do vídeo do YouTube de uma URL de forma robusta via Regex.
 */
const extractYoutubeId = (url: string): string | null => {
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
 * Extrai metadados de um vídeo do YouTube de forma robusta usando Google Search.
 */
export const getVideoMetadata = async (url: string) => {
  // Extração imediata do ID via JS para evitar alucinações da IA
  const videoId = extractYoutubeId(url);
  if (!videoId) throw new Error("URL do YouTube inválida ou não reconhecida.");

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Usamos gemini-pro para tarefas de busca.
  // IMPORTANTE: Não usamos responseMimeType: "application/json" aqui porque as anotações 
  // de busca [1] do Grounding costumam quebrar o parsing estrito. Tratamos o texto manualmente.
  const prompt = `Analise o vídeo do YouTube: ${url}. 
  Obtenha o título oficial e crie um resumo pedagógico rico.
  Retorne EXCLUSIVAMENTE um bloco de código JSON (sem usar citações como [1]) com as seguintes chaves:
  - "title": O título oficial do vídeo.
  - "summary": Um resumo de 2 parágrafos sobre o tema.
  - "snippet": Uma lista curta com os 3 pontos principais.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    
    // Processamento manual para extrair e limpar o JSON do texto da resposta
    const data = parseGeminiJson(response.text);
    
    return {
      title: data.title || "Vídeo do YouTube",
      summary: data.summary || "Sem resumo disponível.",
      snippet: Array.isArray(data.snippet) ? data.snippet.join(". ") : (data.snippet || ""),
      videoId: videoId
    };
  } catch (error) { 
    console.error("Erro no getVideoMetadata:", error);
    throw error; 
  }
};

/**
 * Extrai metadados de uma notícia ou artigo a partir de um link usando Google Search.
 */
export const getNewsMetadata = async (url: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Analise detalhadamente o conteúdo deste artigo ou notícia: ${url}. 
  Utilize a busca para garantir a precisão.
  Retorne EXCLUSIVAMENTE um objeto JSON válido (sem citações como [1]) com:
  - "title": Título original da matéria.
  - "summary": Resumo estruturado em 3 parágrafos.
  - "snippet": Lista de destaques.
  - "category": Classifique estritamente como 'Matéria' ou 'Artigo'.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    
    const data = parseGeminiJson(response.text);
    return {
      title: data.title || "Notícia",
      summary: data.summary || "Resumo indisponível.",
      snippet: Array.isArray(data.snippet) ? data.snippet.join(". ") : (data.snippet || ""),
      category: data.category || 'Matéria'
    };
  } catch (error) { 
    console.error("Erro no getNewsMetadata:", error);
    throw error; 
  }
};
