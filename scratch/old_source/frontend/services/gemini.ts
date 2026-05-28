import { GoogleGenAI, Chat } from '@google/genai';

// Initialize the Gemini API client
// The API key MUST be provided via the environment variable.
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("CRITICAL: process.env.API_KEY is not set.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '', vertexai: true });

const SYSTEM_INSTRUCTION = `
You are an expert medical AI assistant specializing exclusively in peptides for the 'med-peptides' project.
Your primary function is to provide accurate, scientific, and helpful information regarding peptides, including:
- Mechanisms of action
- Medical applications and research
- Specific peptide profiles (e.g., BPC-157, TB-500, Semaglutide, etc.)
- Synthesis and structural properties

Guidelines:
1. Maintain a professional, objective, and scientific tone.
2. If a user asks a question completely unrelated to peptides, biology, or related medical fields, politely decline to answer and remind them that your expertise is limited to peptides.
3. Structure your answers clearly using markdown (headings, bullet points, bold text) for readability.
4. Do not provide direct medical advice or prescribe treatments; always include a disclaimer that information is for educational purposes if discussing treatments.
`;

class PeptideChatService {
  private chatSession: Chat | null = null;

  private initChat() {
    try {
      this.chatSession = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.2, // Lower temperature for more factual, less creative responses
        },
      });
    } catch (error) {
      console.error("Failed to initialize chat session:", error);
      throw error;
    }
  }

  async *sendMessageStream(message: string): AsyncGenerator<string, void, unknown> {
    if (!this.chatSession) {
      this.initChat();
    }

    if (!this.chatSession) {
      throw new Error("Chat session could not be initialized.");
    }

    try {
      const responseStream = await this.chatSession.sendMessageStream({ message });
      for await (const chunk of responseStream) {
        if (chunk.text) {
          yield chunk.text;
        }
      }
    } catch (error) {
      console.error("Error during message streaming:", error);
      throw error;
    }
  }
  
  // Method to reset chat if needed
  resetChat() {
      this.chatSession = null;
  }
}

export const chatService = new PeptideChatService();
