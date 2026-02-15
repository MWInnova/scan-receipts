
import { GoogleGenAI, Type } from "@google/genai";
import { ReceiptData } from "../types.ts";

const ai = new GoogleGenAI({ apiKey: (typeof process !== 'undefined' && process.env.API_KEY) || '' });

const receiptSchema = {
  type: Type.OBJECT,
  properties: {
    date: {
      type: Type.STRING,
      description: "The date of the receipt in YYYY-MM-DD format.",
    },
    merchant: {
      type: Type.STRING,
      description: "The name of the merchant or store.",
    },
    total: {
      type: Type.NUMBER,
      description: "The total amount paid as a number.",
    },
    category: {
      type: Type.STRING,
      description: "Suggest a likely category: Food & Dining, Transport, Shopping, Utilities, Entertainment, or Other.",
    },
    paymentSource: {
      type: Type.STRING,
      description: "The payment method used (e.g., Visa 1234, Cash, Apple Pay) if visible.",
    }
  },
  required: ["date", "merchant", "total", "category"]
};

export async function processReceipt(base64Image: string): Promise<Partial<ReceiptData>> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(',')[1] || base64Image
            }
          },
          {
            text: "Analyze this receipt image and extract the key details in JSON format. If information is missing, provide your best guess or an empty string."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: receiptSchema
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      date: result.date || new Date().toISOString().split('T')[0],
      merchant: result.merchant || "Unknown Merchant",
      total: result.total || 0,
      category: result.category || "Other",
      paymentSource: result.paymentSource || "Unknown",
    };
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw error;
  }
}
