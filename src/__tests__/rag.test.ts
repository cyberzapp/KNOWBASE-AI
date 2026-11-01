import { describe, it, expect } from 'vitest';
import { documentService } from '@/services/firebase/documentService';
import { ragService } from '@/services/firebase/ragService';
import { DocumentChunk } from '@/types';

// Pure math helper matching Cloud Functions
function cosineSimilarity(vecA: number[], vecB: number[]): number {
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

describe('RAG Pipeline & Semantic Retrieval', () => {
  it('should split raw text into overlapping semantic chunks with metadata', () => {
    const rawText = `ACME CORP EMPLOYEE HANDBOOK (2026 EDITION)

Section 1: Working Culture & Remote Stipend
All full-time employees are provided with an annual Remote Workspace Stipend of $1,200. This allowance can be used for standing desks, ergonomic chairs, monitors, and fiber internet.

Section 2: Flexible Time Off (PTO)
We believe rested minds produce the best craft. Acme has an Unlimited Flexible Paid Time Off policy with a recommended minimum of 20 days off per calendar year.`;

    const chunks = documentService.createChunks('doc_test_1', 'Test Handbook', 'ws_test', rawText);

    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].documentId).toBe('doc_test_1');
    expect(chunks[0].workspaceId).toBe('ws_test');
    expect(chunks[0].tokenCount).toBeGreaterThan(0);
    expect(chunks[0].text).toContain('Remote Workspace Stipend');
  });

  it('should compute exact cosine similarity between vector embeddings', () => {
    const vecA = [1, 0, 0];
    const vecB = [1, 0, 0];
    const vecC = [0, 1, 0];

    // Orthogonal vectors should have similarity 0
    expect(cosineSimilarity(vecA, vecC)).toBe(0);

    // Identical vectors should have similarity 1
    expect(cosineSimilarity(vecA, vecB)).toBe(1);

    // Partial overlap
    const vecD = [1, 1, 0];
    const sim = cosineSimilarity(vecA, vecD);
    expect(sim).toBeCloseTo(0.707, 2);
  });

  it('should guarantee cross-workspace data isolation', async () => {
    const ws1 = 'ws_alpha';
    const ws2 = 'ws_beta';

    const chunksWs1 = await documentService.getAllChunksForWorkspace(ws1);
    const chunksWs2 = await documentService.getAllChunksForWorkspace(ws2);

    // Chunks from workspace 1 must not contain chunks belonging to workspace 2
    chunksWs1.forEach(c => {
      expect(c.workspaceId).toBe(ws1);
      expect(c.workspaceId).not.toBe(ws2);
    });
  });

  it('should format citations with complete document references', async () => {
    const results = await ragService.searchRelevantChunks('ws_demo_enterprise', 'remote workspace stipend', 3);
    
    expect(results.length).toBeGreaterThan(0);
    const topResult = results[0];
    expect(topResult.chunk.documentName).toBeDefined();
    expect(topResult.chunk.pageNumber).toBeGreaterThanOrEqual(1);
    expect(topResult.score).toBeGreaterThan(0.35);
  });
});

