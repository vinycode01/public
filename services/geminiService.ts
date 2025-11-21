import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  // NOTE: In a real app, keys are environment variables. 
  // We check if key exists to avoid runtime crash if env not set, though prompt implies it handles it.
  const apiKey = process.env.API_KEY || ''; 
  return new GoogleGenAI({ apiKey });
};

export const generateGiftMessage = async (
  occasion: string,
  relationship: string,
  receiverName: string,
  tone: string
): Promise<string> => {
  try {
    const ai = getAiClient();
    const prompt = `Escreva uma mensagem curta, emocionante e personalizada para um cartão de presente (Gift Card).
    
    Detalhes:
    - Destinatário: ${receiverName}
    - Ocasião: ${occasion}
    - Relacionamento com quem presenteia: ${relationship}
    - Tom da mensagem: ${tone}
    
    A mensagem deve ter no máximo 30 palavras. Retorne apenas o texto da mensagem, sem aspas.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Parabéns, ${receiverName}! Espero que aproveite este presente especial.`;
  }
};

export const suggestStoreCategory = async (query: string): Promise<string | null> => {
  try {
    const ai = getAiClient();
    const prompt = `Eu tenho uma lista de categorias: Gastronomia, Moda, Beleza & Spa, Eletrônicos, Casa & Decoração, Entretenimento.
    
    O usuário buscou por: "${query}".
    
    Qual dessas categorias melhor se encaixa na busca? Retorne APENAS o nome da categoria exato. Se nada se encaixar, retorne "Outros".`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    return null;
  }
}
