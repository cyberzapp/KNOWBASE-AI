import * as admin from 'firebase-admin';
import { GoogleGenAI } from '@google/genai';
import Razorpay from 'razorpay';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

export const db = admin.firestore();
export const storage = admin.storage();
export const auth = admin.auth();

// Initialize Google Gemini AI SDK
const geminiApiKey = process.env.GEMINI_API_KEY || '';
export const ai = new GoogleGenAI({ apiKey: geminiApiKey });

// Initialize Razorpay
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder',
});

// Cosine similarity helper
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

