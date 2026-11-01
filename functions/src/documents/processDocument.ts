import { db, storage, ai } from '../config';
import pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';

interface ProcessDocumentParams {
  workspaceId: string;
  documentId: string;
  storagePath: string;
  fileType: string;
  documentName: string;
}

export async function processDocumentPipeline(params: ProcessDocumentParams): Promise<{ chunkCount: number; tokenCount: number }> {
  const { workspaceId, documentId, storagePath, fileType, documentName } = params;
  const docRef = db.doc(`workspaces/${workspaceId}/documents/${documentId}`);

  try {
    // Step 1: Update status to 'extracting'
    await docRef.update({
      status: 'extracting',
      updatedAt: new Date().toISOString(),
    });

    // Download file from Storage
    const bucket = storage.bucket();
    const file = bucket.file(storagePath);
    const [fileBuffer] = await file.download();

    // Step 2: Extract text based on file format
    let extractedText = '';
    let pagesData: { pageNumber: number; text: string }[] = [];

    if (fileType === 'pdf') {
      const pdfData = await pdfParse(fileBuffer);
      extractedText = pdfData.text || '';
      // Approximate pages
      const rawPages = extractedText.split(/\f|\n{4,}/);
      pagesData = rawPages.map((text, idx) => ({ pageNumber: idx + 1, text: text.trim() }));
    } else if (fileType === 'docx') {
      const docxData = await mammoth.extractRawText({ buffer: fileBuffer });
      extractedText = docxData.value || '';
      pagesData = [{ pageNumber: 1, text: extractedText }];
    } else {
      // txt, md, csv
      extractedText = fileBuffer.toString('utf-8');
      pagesData = [{ pageNumber: 1, text: extractedText }];
    }

    if (!extractedText.trim()) {
      throw new Error('Extracted document text was empty.');
    }

    // Step 3: Update status to 'chunking'
    await docRef.update({
      status: 'chunking',
      updatedAt: new Date().toISOString(),
    });

    // Create semantic chunks with sliding overlap
    const chunks: Array<{
      id: string;
      documentId: string;
      documentName: string;
      workspaceId: string;
      chunkIndex: number;
      text: string;
      pageNumber: number;
      sectionHeading: string;
      tokenCount: number;
      embedding?: number[];
      createdAt: string;
    }> = [];

    let chunkIndex = 0;
    for (const page of pagesData) {
      const paragraphs = page.text.split(/\n\s*\n/).filter(p => p.trim().length > 20);
      let currentChunkText = '';

      for (const para of paragraphs) {
        if ((currentChunkText + para).length > 1200 && currentChunkText.length > 0) {
          chunks.push({
            id: `chunk_${documentId}_${chunkIndex}`,
            documentId,
            documentName,
            workspaceId,
            chunkIndex,
            text: currentChunkText.trim(),
            pageNumber: page.pageNumber,
            sectionHeading: `Section ${chunkIndex + 1}`,
            tokenCount: Math.ceil(currentChunkText.length / 4),
            createdAt: new Date().toISOString(),
          });
          chunkIndex++;
          // Overlap: keep last paragraph
          currentChunkText = para;
        } else {
          currentChunkText += (currentChunkText ? '\n\n' : '') + para;
        }
      }

      if (currentChunkText.trim().length > 0) {
        chunks.push({
          id: `chunk_${documentId}_${chunkIndex}`,
          documentId,
          documentName,
          workspaceId,
          chunkIndex,
          text: currentChunkText.trim(),
          pageNumber: page.pageNumber,
          sectionHeading: `Section ${chunkIndex + 1}`,
          tokenCount: Math.ceil(currentChunkText.length / 4),
          createdAt: new Date().toISOString(),
        });
        chunkIndex++;
      }
    }

    // Step 4: Update status to 'embedding'
    await docRef.update({
      status: 'embedding',
      updatedAt: new Date().toISOString(),
    });

    // Generate embeddings with Google Gemini if API key is present
    if (process.env.GEMINI_API_KEY) {
      for (const chunk of chunks) {
        try {
          const embedRes: any = await ai.models.embedContent({
            model: 'gemini-embedding-001',
            contents: chunk.text,
          });
          if (embedRes.embeddings && embedRes.embeddings[0]?.values) {
            chunk.embedding = embedRes.embeddings[0].values;
          }
        } catch (embedErr) {
          console.warn(`Embedding failed for chunk ${chunk.id}:`, embedErr);
        }
      }
    }

    // Step 5: Save chunks in Firestore
    const batch = db.batch();
    for (const chunk of chunks) {
      const chunkRef = db.doc(`workspaces/${workspaceId}/chunks/${chunk.id}`);
      batch.set(chunkRef, chunk);
    }
    await batch.commit();

    // Step 6: Generate Summary & Insights with Gemini 3.8 Flash
    let summary = `Operational documentation covering ${documentName}.`;
    let keyTopics = ['Overview', 'Operating Procedures', 'Key Specifications'];
    let suggestedQuestions = [
      `What are the core guidelines outlined in ${documentName}?`,
      `What actions are required based on this document?`,
      `How does this impact team operations?`
    ];

    if (process.env.GEMINI_API_KEY) {
      try {
        const sampleText = extractedText.substring(0, 3000);
        const prompt = `You are an AI document analysis engine. Analyze this document excerpt:
Title: "${documentName}"
Content:
"""
${sampleText}
"""

Return JSON in this exact structure:
{
  "summary": "2 to 3 sentence concise executive summary",
  "keyTopics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
  "suggestedQuestions": ["Specific question 1?", "Specific question 2?", "Specific question 3?"]
}`;

        const genRes = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        const textOutput = genRes.text || '';
        const jsonMatch = textOutput.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.summary) summary = parsed.summary;
          if (parsed.keyTopics) keyTopics = parsed.keyTopics;
          if (parsed.suggestedQuestions) suggestedQuestions = parsed.suggestedQuestions;
        }
      } catch (genErr) {
        console.warn('AI summary generation error:', genErr);
      }
    }

    const totalTokens = chunks.reduce((acc, c) => acc + c.tokenCount, 0);

    // Step 7: Mark Document as Indexed
    await docRef.update({
      status: 'indexed',
      chunkCount: chunks.length,
      tokenCount: totalTokens,
      summary,
      keyTopics,
      suggestedQuestions,
      extractedTextPreview: extractedText.substring(0, 1500),
      updatedAt: new Date().toISOString(),
    });

    // Step 8: Log Activity
    const actId = 'act_' + Math.random().toString(36).substring(2, 9);
    await db.doc(`workspaces/${workspaceId}/activity/${actId}`).set({
      id: actId,
      workspaceId,
      userId: 'system',
      userName: 'Knowbase AI Engine',
      action: 'document_indexed',
      details: `Indexed "${documentName}" into vector database (${chunks.length} chunks, ${totalTokens} tokens)`,
      targetId: documentId,
      targetType: 'document',
      createdAt: new Date().toISOString(),
    });

    return { chunkCount: chunks.length, tokenCount: totalTokens };
  } catch (err: any) {
    console.error('Error in document processing pipeline:', err);
    await docRef.update({
      status: 'failed',
      errorMessage: err.message || 'Processing pipeline error',
      updatedAt: new Date().toISOString(),
    });
    throw err;
  }
}

