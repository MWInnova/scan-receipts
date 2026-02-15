
import { GoogleGenAI, Type } from "@google/genai";
import { ReceiptData } from "../types";

// Initialize the Gemini AI client with the provided environment API key.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Define a JSON schema to force Gemini to return structured data.
 * This ensures the extraction follows our ReceiptData model strictly.
 */
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

/**
 * Sends a base64 encoded image to the Gemini model for content analysis.
 * Uses a system-level prompt and responseSchema to get reliable JSON back.
 */
export async function processReceipt(base64Image: string): Promise<Partial<ReceiptData>> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            // The actual visual data from the receipt
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(',')[1] || base64Image
            }
          },
          {
            // Instructions for the AI
            text: "Analyze this receipt image and extract the key details in JSON format. If information is missing, provide your best guess or an empty string."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: receiptSchema
      }
    });

    // Parse the structured text output from the AI
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
