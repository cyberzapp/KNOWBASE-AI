import { create } from 'zustand';
import { Conversation, ChatMessage, Citation } from '@/types';
import { ragService } from '@/services/firebase/ragService';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: ChatMessage[];
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isGeneratingResponse: boolean;
  streamingContent: string;
  activeCitation: Citation | null;
  error: string | null;

  fetchConversations: (workspaceId: string) => Promise<void>;
  selectConversation: (workspaceId: string, conversationId: string) => Promise<void>;
  startNewConversation: (workspaceId: string, userId: string, initialTitle?: string) => Promise<Conversation>;
  sendMessage: (workspaceId: string, text: string, userId: string, userName: string) => Promise<ChatMessage | null>;
  deleteConversation: (workspaceId: string, conversationId: string) => Promise<void>;
  renameConversation: (workspaceId: string, conversationId: string, newTitle: string) => Promise<void>;
  setActiveCitation: (citation: Citation | null) => void;
  voteHelpful: (workspaceId: string, messageId: string, helpful: boolean) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  isLoadingConversations: false,
  isLoadingMessages: false,
  isGeneratingResponse: false,
  streamingContent: '',
  activeCitation: null,
  error: null,

  fetchConversations: async (workspaceId: string) => {
    set({ isLoadingConversations: true });
    try {
      const convs = await ragService.getConversations(workspaceId);
      set({ 
        conversations: convs, 
        isLoadingConversations: false,
        activeConversationId: convs.length > 0 ? (get().activeConversationId || convs[0].id) : null
      });

      if (convs.length > 0 && !get().messages.length) {
        const targetId = get().activeConversationId || convs[0].id;
        await get().selectConversation(workspaceId, targetId);
      }
    } catch (err: any) {
      set({ error: err.message, isLoadingConversations: false });
    }
  },

  selectConversation: async (workspaceId: string, conversationId: string) => {
    set({ activeConversationId: conversationId, isLoadingMessages: true, activeCitation: null });
    try {
      const msgs = await ragService.getMessages(workspaceId, conversationId);
      set({ messages: msgs, isLoadingMessages: false });
    } catch (err: any) {
      set({ error: err.message, isLoadingMessages: false });
    }
  },

  startNewConversation: async (workspaceId: string, userId: string, initialTitle = 'New Conversation') => {
    try {
      const newConv = await ragService.createConversation(workspaceId, initialTitle, userId);
      set({
        conversations: [newConv, ...get().conversations],
        activeConversationId: newConv.id,
        messages: [],
        activeCitation: null,
      });
      return newConv;
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  sendMessage: async (workspaceId: string, text: string, userId: string, userName: string) => {
    let convId = get().activeConversationId;
    if (!convId) {
      const newConv = await get().startNewConversation(workspaceId, userId, text.substring(0, 30));
      convId = newConv.id;
    }

    // Temporary optimistic user message
    const tempUserMsg: ChatMessage = {
      id: 'temp_' + Date.now(),
      conversationId: convId,
      workspaceId,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    set({
      messages: [...get().messages, tempUserMsg],
      isGeneratingResponse: true,
      streamingContent: '',
      error: null,
    });

    try {
      const assistantMsg = await ragService.askQuestion(
        workspaceId,
        convId,
        text,
        userId,
        userName,
        (streamed) => set({ streamingContent: streamed })
      );

      // Refresh messages list
      const freshMsgs = await ragService.getMessages(workspaceId, convId);
      
      // Update conversations list metadata
      const convs = await ragService.getConversations(workspaceId);

      set({
        messages: freshMsgs,
        conversations: convs,
        isGeneratingResponse: false,
        streamingContent: '',
        // If the assistant message returned citations, auto-select the first citation
        activeCitation: assistantMsg.citations && assistantMsg.citations.length > 0 ? assistantMsg.citations[0] : null,
      });

      return assistantMsg;
    } catch (err: any) {
      set({
        isGeneratingResponse: false,
        streamingContent: '',
        error: err.message || 'Failed to generate response.',
      });
      return null;
    }
  },

  deleteConversation: async (workspaceId: string, conversationId: string) => {
    await ragService.deleteConversation(workspaceId, conversationId);
    const remaining = get().conversations.filter(c => c.id !== conversationId);
    const nextActive = remaining.length > 0 ? remaining[0].id : null;
    set({
      conversations: remaining,
      activeConversationId: nextActive,
      messages: nextActive ? get().messages : [],
      activeCitation: null,
    });
    if (nextActive) {
      await get().selectConversation(workspaceId, nextActive);
    }
  },

  renameConversation: async (workspaceId: string, conversationId: string, newTitle: string) => {
    await ragService.renameConversation(workspaceId, conversationId, newTitle);
    set({
      conversations: get().conversations.map(c => c.id === conversationId ? { ...c, title: newTitle } : c)
    });
  },

  setActiveCitation: (citation) => set({ activeCitation: citation }),

  voteHelpful: async (workspaceId: string, messageId: string, helpful: boolean) => {
    const convId = get().activeConversationId;
    if (!convId) return;
    await ragService.voteMessageHelpfulness(workspaceId, convId, messageId, helpful);
    set({
      messages: get().messages.map(m => m.id === messageId ? { ...m, isHelpful: helpful } : m)
    });
  }
}));

