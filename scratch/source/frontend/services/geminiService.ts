
import { GoogleGenAI, Type } from '@google/genai';

// Initialize the SDK. Assumes process.env.API_KEY is provided by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });

const MODEL_NAME = 'gemini-2.5-flash';

export const agentServices = {
  // AGENT_01: ClinicAI
  runClinicAI: async (input: string) => {
    const startTime = Date.now();
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: input,
        config: {
          systemInstruction: `You are ClinicAI, a clinical assistant for Med-Peptides. 
          Your purpose is to understand questions and provide clinical explanations and protocol recommendations.
          CRITICAL RULE: You must NEVER prescribe medication. Always advise consulting a doctor for prescriptions.
          Output your response in a structured, professional format.`,
          temperature: 0.2,
        }
      });
      return { data: response.text, latency: Date.now() - startTime };
    } catch (error: any) {
      throw new Error(`ClinicAI Error: ${error.message}`);
    }
  },

  // AGENT_02: Prescription Intake
  runPrescriptionIntake: async (base64Image: string, mimeType: string) => {
    const startTime = Date.now();
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: base64Image,
                mimeType: mimeType
              }
            },
            { text: "Extract prescription details and build a cart/quote request." }
          ]
        },
        config: {
          systemInstruction: "You are a Prescription Reader agent. Extract items from the provided prescription image.",
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              catalog_items: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Standard catalog items found in the prescription."
              },
              compounded_items: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Custom compounded items requiring special preparation."
              },
              quotation_requests: {
                type: Type.BOOLEAN,
                description: "True if any items require a custom quote."
              },
              patient_name_redacted: {
                type: Type.BOOLEAN,
                description: "Always true, ensure PII is not stored."
              }
            },
            required: ["catalog_items", "compounded_items", "quotation_requests"]
          }
        }
      });
      return { data: JSON.parse(response.text || '{}'), latency: Date.now() - startTime };
    } catch (error: any) {
      throw new Error(`Prescription Intake Error: ${error.message}`);
    }
  },

  // AGENT_03: Protocol Generator
  runProtocolGenerator: async (goals: string, budget: string, timeHorizon: string) => {
    const startTime = Date.now();
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Generate a protocol based on: Goals: ${goals}, Budget: ${budget}, Time Horizon: ${timeHorizon}`,
        config: {
          systemInstruction: "You are a Protocol Generator agent. Create clinical protocols and shopping lists based on user constraints.",
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              clinical_protocol: {
                type: Type.STRING,
                description: "Detailed clinical protocol explanation."
              },
              shopping_list: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    item_name: { type: Type.STRING },
                    quantity: { type: Type.INTEGER },
                    estimated_cost: { type: Type.NUMBER }
                  }
                }
              },
              total_estimated_cost: { type: Type.NUMBER }
            }
          }
        }
      });
      return { data: JSON.parse(response.text || '{}'), latency: Date.now() - startTime };
    } catch (error: any) {
      throw new Error(`Protocol Generator Error: ${error.message}`);
    }
  },

  // AGENT_04: Catalog Intelligence
  runCatalogIntelligence: async (protocolOrRx: string) => {
    const startTime = Date.now();
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Find matching products for this input: ${protocolOrRx}`,
        config: {
          systemInstruction: "You are a Catalog Intelligence agent. Match clinical protocols or prescriptions to available products, pricing, and availability.",
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              matching_products: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sku: { type: Type.STRING },
                    name: { type: Type.STRING },
                    price: { type: Type.NUMBER },
                    in_stock: { type: Type.BOOLEAN },
                    match_confidence: { type: Type.NUMBER, description: "0.0 to 1.0" }
                  }
                }
              },
              alternatives_suggested: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            }
          }
        }
      });
      return { data: JSON.parse(response.text || '{}'), latency: Date.now() - startTime };
    } catch (error: any) {
      throw new Error(`Catalog Intelligence Error: ${error.message}`);
    }
  }
};
