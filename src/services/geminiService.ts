import { GoogleGenAI, Type } from "@google/genai";
import { AIModel, ModelAnalysis, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const GeminiService = {
  async analyzeModel(model: AIModel): Promise<ModelAnalysis> {
    const prompt = `
      Analyze the following AI model for regulatory compliance (GDPR, EU AI Act, Internal Policy).
      Model Name: ${model.name}
      Type: ${model.type}
      Features: ${model.features.join(", ")}
      
      Provide a detailed analysis in JSON format including:
      1. riskLevel: "Low", "Medium", or "High"
      2. summary: A concise compliance summary.
      3. explanation: A detailed explanation of the risk classification.
      4. featureImportance: An array of { feature: string, importance: number } for the top features.
      5. checklist: An array of compliance checks with category, requirement, status ("Pass", "Fail", "Warning"), and recommendation.
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
              riskLevel: { type: Type.STRING },
              summary: { type: Type.STRING },
              explanation: { type: Type.STRING },
              featureImportance: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    feature: { type: Type.STRING },
                    importance: { type: Type.NUMBER }
                  }
                }
              },
              checklist: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    requirement: { type: Type.STRING },
                    status: { type: Type.STRING },
                    recommendation: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      return {
        modelId: model.id,
        ...result
      };
    } catch (error) {
      console.error("Error analyzing model:", error);
      throw error;
    }
  },

  async chat(messages: ChatMessage[], context: ModelAnalysis | null): Promise<string> {
    const systemInstruction = `
      You are Compliance Copilot, an expert AI governance assistant.
      Your goal is to help users understand model risks, regulatory requirements, and decision logic.
      ${context ? `Current Context: Analyzing model ${context.modelId}. Risk Level: ${context.riskLevel}.` : ""}
      Always provide citations for regulatory requirements where applicable.
      Be professional, precise, and helpful.
    `;

    const chatHistory = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: chatHistory,
        config: {
          systemInstruction
        }
      });

      return response.text || "I'm sorry, I couldn't generate a response.";
    } catch (error) {
      console.error("Error in chat:", error);
      return "An error occurred while communicating with the AI.";
    }
  }
};
