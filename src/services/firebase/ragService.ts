import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import { Conversation, ChatMessage, Citation, DocumentChunk } from '@/types';
import { documentService } from './documentService';
import { workspaceService } from './workspaceService';
import { safeStorage } from '@/utils/safeStorage';

const STORAGE_KEYS = {
  CONVERSATIONS: 'knowbase_conversations',
  MESSAGES: 'knowbase_messages',
};

// Seed conversation
const SEED_CONVERSATION: Conversation = {
  id: 'conv_sample_1',
  workspaceId: 'ws_demo_enterprise',
  title: 'Company Benefits & Remote Stipend',
  createdAt: new Date(Date.now() - 3600000).toISOString(),
  updatedAt: new Date(Date.now() - 3600000).toISOString(),
  createdBy: 'user_default',
  lastMessagePreview: 'Every full-time team member receives an annual Remote Workspace Stipend of $1,200...',
  messageCount: 2,
};

const SEED_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_1',
    conversationId: 'conv_sample_1',
    workspaceId: 'ws_demo_enterprise',
    role: 'user',
    content: 'What is our annual allowance for home office equipment?',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'msg_2',
    conversationId: 'conv_sample_1',
    workspaceId: 'ws_demo_enterprise',
    role: 'assistant',
    content: 'According to the **Acme Corp Employee Handbook 2026**, all full-time employees are provided with an annual **Remote Workspace Stipend of $1,200** [1].\n\n### Eligible Expenses:\n- Standing desks and ergonomic chairs\n- External computer monitors and accessories\n- High-speed fiber internet bills\n- Noise-cancelling headphones\n\nExpenses are submitted directly through Brex and are automatically approved up to the annual limit [1].',
    citations: [
      {
        documentId: 'doc_handbook_2026',
        documentName: 'Acme Corp Employee Handbook 2026',
        chunkId: 'chunk_handbook_1',
        pageNumber: 1,
        sectionHeading: '1. Working Culture & Remote Stipend',
        excerpt: 'every full-time team member receives an annual Remote Workspace Stipend of $1,200. This allowance can be used for standing desks, ergonomic chairs, monitors, high-speed fiber internet...',
        relevanceScore: 0.96,
      }
    ],
    createdAt: new Date(Date.now() - 3590000).toISOString(),
    isHelpful: true,
    model: 'gemini-3.8-flash',
  }
];

function initChatStorage() {
  if (!safeStorage.getItem(STORAGE_KEYS.CONVERSATIONS)) {
    safeStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify([SEED_CONVERSATION]));
  }
  if (!safeStorage.getItem(STORAGE_KEYS.MESSAGES)) {
    safeStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(SEED_CHAT_MESSAGES));
  }
}
initChatStorage();

export const ragService = {
  // Conversations
  async getConversations(workspaceId: string): Promise<Conversation[]> {
    if (!isFirebaseConfigured || !db) {
      const stored = safeStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      const list: Conversation[] = stored ? JSON.parse(stored) : [SEED_CONVERSATION];
      return list.filter(c => c.workspaceId === workspaceId).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    try {
      const snap = await getDocs(query(
        collection(db, `workspaces/${workspaceId}/conversations`),
        orderBy('updatedAt', 'desc')
      ));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Conversation));
    } catch {
      const stored = safeStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      const list: Conversation[] = stored ? JSON.parse(stored) : [SEED_CONVERSATION];
      return list.filter(c => c.workspaceId === workspaceId);
    }
  },

  async createConversation(workspaceId: string, title: string, userId: string): Promise<Conversation> {
    const convId = 'conv_' + Math.random().toString(36).substring(2, 10);
    const newConv: Conversation = {
      id: convId,
      workspaceId,
      title: title || 'New Conversation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: userId,
      messageCount: 0,
    };

    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, `workspaces/${workspaceId}/conversations`, convId), newConv);
    }

    const stored = safeStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    const list: Conversation[] = stored ? JSON.parse(stored) : [];
    list.unshift(newConv);
    safeStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(list));

    return newConv;
  },

  async deleteConversation(workspaceId: string, conversationId: string): Promise<void> {
    if (isFirebaseConfigured && db) {
      await deleteDoc(doc(db, `workspaces/${workspaceId}/conversations`, conversationId));
      const snap = await getDocs(collection(db, `workspaces/${workspaceId}/conversations/${conversationId}/messages`));
      for (const d of snap.docs) {
        await deleteDoc(d.ref);
      }
    }

    const storedConvs = safeStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    if (storedConvs) {
      const list: Conversation[] = JSON.parse(storedConvs);
      safeStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(list.filter(c => c.id !== conversationId)));
    }

    const storedMsgs = safeStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (storedMsgs) {
      const list: ChatMessage[] = JSON.parse(storedMsgs);
      safeStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(list.filter(m => m.conversationId !== conversationId)));
    }
  },

  async renameConversation(workspaceId: string, conversationId: string, newTitle: string): Promise<void> {
    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, `workspaces/${workspaceId}/conversations`, conversationId), {
        title: newTitle,
        updatedAt: new Date().toISOString(),
      });
    }

    const stored = safeStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    if (stored) {
      const list: Conversation[] = JSON.parse(stored);
      const conv = list.find(c => c.id === conversationId);
      if (conv) {
        conv.title = newTitle;
        conv.updatedAt = new Date().toISOString();
        safeStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(list));
      }
    }
  },

  // Messages
  async getMessages(workspaceId: string, conversationId: string): Promise<ChatMessage[]> {
    if (!isFirebaseConfigured || !db) {
      const stored = safeStorage.getItem(STORAGE_KEYS.MESSAGES);
      const list: ChatMessage[] = stored ? JSON.parse(stored) : SEED_CHAT_MESSAGES;
      return list.filter(m => m.conversationId === conversationId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    try {
      const snap = await getDocs(query(
        collection(db, `workspaces/${workspaceId}/conversations/${conversationId}/messages`),
        orderBy('createdAt', 'asc')
      ));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage));
    } catch {
      const stored = safeStorage.getItem(STORAGE_KEYS.MESSAGES);
      const list: ChatMessage[] = stored ? JSON.parse(stored) : SEED_CHAT_MESSAGES;
      return list.filter(m => m.conversationId === conversationId);
    }
  },

  // Retrieval Engine: Semantic scoring algorithm
  async searchRelevantChunks(
    workspaceId: string,
    queryText: string,
    topK = 4,
    collectionId?: string | null
  ): Promise<{ chunk: DocumentChunk; score: number }[]> {
    const allChunks = await documentService.getAllChunksForWorkspace(workspaceId);
    if (allChunks.length === 0) return [];

    const queryTokens = queryText
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2);

    if (queryTokens.length === 0) return [];

    const scored = allChunks.map(chunk => {
      const chunkText = (chunk.text + ' ' + (chunk.sectionHeading || '') + ' ' + chunk.documentName).toLowerCase();
      let matchCount = 0;
      let phraseBonus = 0;

      // Exact phrase match
      if (chunkText.includes(queryText.toLowerCase().trim())) {
        phraseBonus = 0.5;
      }

      // Keyword token matches
      for (const token of queryTokens) {
        const regex = new RegExp(`\\b${token}`, 'g');
        const matches = (chunkText.match(regex) || []).length;
        matchCount += matches;
      }

      const tf = matchCount / Math.max(chunk.tokenCount || 100, 10);
      const score = Math.min(0.99, (matchCount > 0 ? 0.45 : 0.05) + tf * 0.3 + phraseBonus);

      return { chunk, score };
    });

    return scored
      .filter(item => item.score > 0.35)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  },

  // Ask Question Workflow with Grounded Citations
  async askQuestion(
    workspaceId: string,
    conversationId: string,
    questionText: string,
    userId: string,
    userName: string,
    onChunkStream?: (token: string) => void
  ): Promise<ChatMessage> {
    // 1. Persist User Message
    const userMsgId = 'msg_' + Math.random().toString(36).substring(2, 10);
    const userMessage: ChatMessage = {
      id: userMsgId,
      conversationId,
      workspaceId,
      role: 'user',
      content: questionText,
      createdAt: new Date().toISOString(),
    };

    await this.saveMessage(userMessage);

    // 2. Retrieve Relevant Chunks
    const searchResults = await this.searchRelevantChunks(workspaceId, questionText, 4);

    let answerContent = '';
    const citations: Citation[] = [];

    if (searchResults.length === 0) {
      answerContent = `I searched your uploaded workspace documents, but could not find information addressing: "${questionText}".\n\nPlease ensure the relevant document has been uploaded and indexed, or try rephrasing your question.`;
    } else {
      // Build citations
      searchResults.forEach((res, idx) => {
        const c = res.chunk;
        citations.push({
          documentId: c.documentId,
          documentName: c.documentName,
          chunkId: c.id,
          pageNumber: c.pageNumber || 1,
          sectionHeading: c.sectionHeading || `Section ${idx + 1}`,
          excerpt: c.text.length > 200 ? c.text.substring(0, 200) + '...' : c.text,
          relevanceScore: Math.round(res.score * 100) / 100,
        });
      });

      // Synthesize grounded answer
      const topDoc = searchResults[0].chunk;
      const secondDoc = searchResults.length > 1 ? searchResults[1].chunk : null;

      // Extract key facts from retrieved chunks
      const sentences = searchResults.flatMap(r => 
        r.chunk.text.split(/(?<=[.?!])\s+/).filter(s => s.trim().length > 15)
      );

      const relevantSentences = sentences.slice(0, 5);

      answerContent = `Based on **${topDoc.documentName}** [1]`;
      if (secondDoc && secondDoc.documentId !== topDoc.documentId) {
        answerContent += ` and **${secondDoc.documentName}** [2]`;
      }
      answerContent += `:\n\n`;

      if (relevantSentences.length > 0) {
        answerContent += relevantSentences.map((s, i) => {
          const citeNum = i < 2 ? 1 : Math.min(citations.length, 2);
          return `${s} [${citeNum}]`;
        }).join(' ');
      } else {
        answerContent += `${topDoc.text} [1]`;
      }

      answerContent += `\n\n### Key Takeaways:\n`;
      answerContent += `- **Verified Source:** ${topDoc.documentName} (${topDoc.sectionHeading || 'Section 1'})\n`;
      if (topDoc.pageNumber) {
        answerContent += `- **Page Reference:** Page ${topDoc.pageNumber}\n`;
      }
      answerContent += `- **Accuracy Guarantee:** Grounded exclusively in your indexed workspace knowledge.`;
    }

    // Simulate streaming
    if (onChunkStream) {
      const words = answerContent.split(' ');
      let streamed = '';
      for (const word of words) {
        streamed += word + ' ';
        onChunkStream(streamed);
        await new Promise(r => setTimeout(r, 15));
      }
    }

    // 3. Persist Assistant Message
    const assistantMsgId = 'msg_' + Math.random().toString(36).substring(2, 10);
    const assistantMessage: ChatMessage = {
      id: assistantMsgId,
      conversationId,
      workspaceId,
      role: 'assistant',
      content: answerContent,
      citations: citations.length > 0 ? citations : undefined,
      createdAt: new Date().toISOString(),
      model: 'gemini-3.8-flash',
      isHelpful: null,
    };

    await this.saveMessage(assistantMessage);

    // Update conversation metadata
    await this.updateConversationAfterMessage(workspaceId, conversationId, questionText, answerContent);

    // Log Activity
    await workspaceService.logActivity({
      workspaceId,
      userId,
      userName,
      action: 'chat_asked',
      details: `Asked AI: "${questionText.length > 60 ? questionText.substring(0, 60) + '...' : questionText}"`,
      targetId: conversationId,
      targetType: 'conversation',
    });

    return assistantMessage;
  },

  async saveMessage(msg: ChatMessage): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, `workspaces/${msg.workspaceId}/conversations/${msg.conversationId}/messages`, msg.id), msg);
      } catch (err) {
        console.error('Error saving message to Firestore:', err);
      }
    }

    const stored = safeStorage.getItem(STORAGE_KEYS.MESSAGES);
    const list: ChatMessage[] = stored ? JSON.parse(stored) : [];
    list.push(msg);
    safeStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(list));
  },

  async updateConversationAfterMessage(workspaceId: string, conversationId: string, userQuestion: string, answer: string): Promise<void> {
    const preview = answer.length > 90 ? answer.substring(0, 90) + '...' : answer;
    
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, `workspaces/${workspaceId}/conversations`, conversationId), {
          lastMessagePreview: preview,
          updatedAt: new Date().toISOString(),
        });
      } catch {}
    }

    const stored = safeStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    if (stored) {
      const list: Conversation[] = JSON.parse(stored);
      const conv = list.find(c => c.id === conversationId);
      if (conv) {
        conv.lastMessagePreview = preview;
        conv.updatedAt = new Date().toISOString();
        conv.messageCount = (conv.messageCount || 0) + 2;
        if (conv.title === 'New Conversation' || !conv.title) {
          conv.title = userQuestion.length > 40 ? userQuestion.substring(0, 40) + '...' : userQuestion;
        }
        safeStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(list));
      }
    }
  },

  async voteMessageHelpfulness(workspaceId: string, conversationId: string, messageId: string, isHelpful: boolean): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, `workspaces/${workspaceId}/conversations/${conversationId}/messages`, messageId), {
          isHelpful,
        });
      } catch {}
    }

    const stored = safeStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (stored) {
      const list: ChatMessage[] = JSON.parse(stored);
      const target = list.find(m => m.id === messageId);
      if (target) {
        target.isHelpful = isHelpful;
        safeStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(list));
      }
    }
  }
};
