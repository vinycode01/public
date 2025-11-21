import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateGiftMessage = async (
  occasion: string,
  relationship: string,
  receiverName: string,
  tone: string
): Promise<string> => {
  try {
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

    return response.text?.trim() ?? `Parabéns, ${receiverName}! Aproveite seu presente.`;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Parabéns, ${receiverName}! Espero que aproveite este presente especial.`;
  }
};

export const suggestStoreCategory = async (query: string): Promise<string | null> => {
  try {
    const prompt = `Eu tenho uma lista de categorias: Gastronomia, Moda, Beleza & Spa, Eletrônicos, Casa & Decoração, Entretenimento.
    
    O usuário buscou por: "${query}".
    
    Qual dessas categorias melhor se encaixa na busca? Retorne APENAS o nome da categoria exato. Se nada se encaixar, retorne "Outros".`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() ?? null;
  } catch (error) {
    return null;
  }
}