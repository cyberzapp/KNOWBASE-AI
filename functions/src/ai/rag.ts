import * as admin from 'firebase-admin';
import { db, ai, cosineSimilarity } from '../config';

interface AskWorkspaceParams {
  workspaceId: string;
  conversationId: string;
  question: string;
  userId: string;
  userName: string;
  collectionId?: string | null;
}

export async function askWorkspaceAIPipeline(params: AskWorkspaceParams) {
  const { workspaceId, conversationId, question, userId, userName, collectionId } = params;

  // Step 1: Embed User Query if Gemini API key is configured
  let queryVector: number[] | null = null;
  if (process.env.GEMINI_API_KEY) {
    try {
      const embedRes: any = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: question,
      });
      if (embedRes.embeddings && embedRes.embeddings[0]?.values) {
        queryVector = embedRes.embeddings[0].values;
      }
    } catch (e) {
      console.warn('Query embedding generation failed, using keyword fallback:', e);
    }
  }

  // Step 2: Retrieve candidate chunks for this workspace
  let chunksQuery = db.collection(`workspaces/${workspaceId}/chunks`);
  const chunkDocs = await chunksQuery.get();

  const candidateChunks: any[] = [];
  chunkDocs.forEach(d => {
    const chunk = d.data();
    candidateChunks.push(chunk);
  });

  if (candidateChunks.length === 0) {
    return {
      answer: "Your workspace does not have any indexed documents yet. Please upload files to enable AI search.",
      citations: [],
    };
  }

  // Step 3: Score candidates
  let scoredChunks: Array<{ chunk: any; score: number }> = [];

  if (queryVector) {
    // Vector Cosine Similarity
    scoredChunks = candidateChunks
      .map(chunk => {
        const sim = chunk.embedding ? cosineSimilarity(queryVector!, chunk.embedding) : 0;
        return { chunk, score: sim };
      })
      .filter(item => item.score > 0.4)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  // If vector search returned few matches or queryVector was null, hybrid fallback
  if (scoredChunks.length === 0) {
    const qTokens = question.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    scoredChunks = candidateChunks
      .map(chunk => {
        const text = (chunk.text + ' ' + (chunk.sectionHeading || '')).toLowerCase();
        let matches = 0;
        for (const token of qTokens) {
          if (text.includes(token)) matches++;
        }
        const score = matches > 0 ? (matches / qTokens.length) * 0.8 : 0;
        return { chunk, score };
      })
      .filter(item => item.score > 0.25)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }

  if (scoredChunks.length === 0) {
    return {
      answer: `I searched across your workspace documents, but could not find information addressing: "${question}". Please check that the relevant document is uploaded.`,
      citations: [],
    };
  }

  // Step 4: Construct Grounded Context
  const contextSections = scoredChunks.map((item, idx) => {
    const c = item.chunk;
    return `[Source ${idx + 1}]
Document: "${c.documentName}"
Section: "${c.sectionHeading || 'Section'}"
Page: ${c.pageNumber || 1}
Content:
"""
${c.text}
"""`;
  }).join('\n\n');

  // Step 5: Grounded Prompt for Gemini 3.8 Flash
  const systemPrompt = `You are Knowbase AI, an enterprise-grade document intelligence assistant.
Your instructions:
1. Answer the user's question using strictly and exclusively the facts provided in the numbered sources below.
2. If the answer cannot be found in the sources, say: "I could not find information regarding this in your uploaded workspace documents."
3. Never hallucinate facts, invent statistics, or assume policies not written in the sources.
4. CITE EVERY CLAIM with the source bracket tag [1], [2], etc., immediately following the statement.
5. Format your answer cleanly with markdown headers, bold highlights, and bullet points.`;

  const fullPrompt = `${systemPrompt}

Retrieved Sources Context:
${contextSections}

User Question:
"${question}"

Provide a clear, grounded answer with source citation tags:`;

  let answerText = '';

  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: fullPrompt,
      });
      answerText = response.text || '';
    } catch (e: any) {
      console.error('Gemini generation error:', e);
      answerText = `Error communicating with Gemini model: ${e.message}`;
    }
  } else {
    // Offline / fallback response formulation
    const topDoc = scoredChunks[0].chunk;
    answerText = `According to **${topDoc.documentName}** [1]:\n\n${topDoc.text} [1]\n\n*(Note: Configure GEMINI_API_KEY in Cloud Functions to enable real-time model synthesis).*`;
  }

  // Build Citations array
  const citations = scoredChunks.map((item, idx) => ({
    documentId: item.chunk.documentId,
    documentName: item.chunk.documentName,
    chunkId: item.chunk.id,
    pageNumber: item.chunk.pageNumber || 1,
    sectionHeading: item.chunk.sectionHeading || `Section ${idx + 1}`,
    excerpt: item.chunk.text.substring(0, 220),
    relevanceScore: Math.round(item.score * 100) / 100,
  }));

  // Step 6: Increment Usage Statistics
  const periodId = new Date().toISOString().substring(0, 7);
  const usageRef = db.doc(`workspaces/${workspaceId}/usage/${periodId}`);
  await usageRef.set({
    questionsAsked: admin.firestore.FieldValue.increment(1),
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  return { answer: answerText, citations };
}
