
import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage, ChatMessagePart } from '../types';
import { AI_MODEL } from '../constants';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generationConfig = {
    temperature: 0.5,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 8192,
};

export const generateContent = async (history: ChatMessage[]): Promise<string> => {
    try {
        const contents = history.map(msg => ({
            role: msg.role,
            parts: msg.parts
        }));

        const response = await ai.models.generateContent({
            model: AI_MODEL,
            contents: contents,
            config: generationConfig
        });
        
        return response.text;
    } catch (error) {
        console.error("Gemini API call failed:", error);
        if (error instanceof Error) {
            return `APIエラーが発生しました: ${error.message}`;
        }
        return "APIから不明なエラーが返されました。";
    }
};

export const getSuggestedActions = async (text: string): Promise<string[]> => {
    const prompt = `以下の文章を分析し、ユーザーが次に行いそうな追加の指示を3つ、簡潔な動詞を含むフレーズで提案してください。例:「箇条書きで要約して」「表形式でまとめて」「もっと簡潔に」。出力は ["提案1", "提案2", "提案3"] というJSON形式の配列のみとしてください。\n\n# 分析対象の文章\n${text}`;
    
    try {
        const response = await ai.models.generateContent({
            model: AI_MODEL,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                 responseMimeType: "application/json",
                 responseSchema: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.STRING,
                    },
                  },
            }
        });

        const responseText = response.text;
        
        // Sometimes the model returns a markdown code block
        const cleanedText = responseText.replace(/^```json\n|```$/g, '').trim();

        const suggestions = JSON.parse(cleanedText);
        if (Array.isArray(suggestions)) {
            return suggestions.slice(0, 3);
        }
        return [];
    } catch (e) {
        console.error("Failed to get suggested actions:", e);
        return [];
    }
};
