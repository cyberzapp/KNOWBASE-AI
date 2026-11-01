import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Send, 
  Plus, 
  Trash2, 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  Check, 
  ExternalLink, 
  FileText, 
  Sparkles, 
  MessageSquare, 
  ChevronRight, 
  SidebarClose, 
  SidebarOpen,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { useChatStore } from '@/stores/useChatStore';
import { useDocumentStore } from '@/stores/useDocumentStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/utils/formatters';
import { Citation } from '@/types';

export const ChatPage: React.FC = () => {
  const { user } = useAuthStore();
  const { currentWorkspace } = useWorkspaceStore();
  const { 
    conversations, 
    activeConversationId, 
    messages, 
    isLoadingConversations, 
    isLoadingMessages,
    isGeneratingResponse,
    streamingContent,
    activeCitation,
    fetchConversations, 
    selectConversation, 
    startNewConversation, 
    sendMessage, 
    deleteConversation,
    setActiveCitation,
    voteHelpful
  } = useChatStore();
  const { documents, fetchDocuments } = useDocumentStore();
  const { workspaceId, conversationId } = useParams<{ workspaceId: string; conversationId?: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [inputPrompt, setInputPrompt] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false);
  const [isCitationCollapsed, setIsCitationCollapsed] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeWsId = currentWorkspace?.id || workspaceId || 'ws_demo_enterprise';

  useEffect(() => {
    if (activeWsId) {
      fetchConversations(activeWsId);
      fetchDocuments(activeWsId);
    }
  }, [activeWsId, fetchConversations, fetchDocuments]);

  useEffect(() => {
    if (conversationId && conversationId !== activeConversationId) {
      selectConversation(activeWsId, conversationId);
    }
  }, [conversationId, activeConversationId, activeWsId, selectConversation]);

  // Auto scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim() || isGeneratingResponse || !user) return;

    const query = inputPrompt.trim();
    setInputPrompt('');

    const activeConv = conversations.find(c => c.id === activeConversationId);
    if (!activeConv) {
      const newConv = await startNewConversation(activeWsId, user.id, query.substring(0, 35));
      navigate(`/app/workspaces/${activeWsId}/chat/${newConv.id}`);
    }

    await sendMessage(activeWsId, query, user.id, user.displayName);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(msgId);
    toast.success('Copied', 'Answer copied to clipboard.');
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const samplePrompts = [
    'What is our annual home office allowance?',
    'What are the guaranteed SLAs for Enterprise tier customers?',
    'What is our unconditional refund policy?',
    'What encryption standards are enforced for customer data at rest?'
  ];

  return (
    <div className="h-[calc(100vh-65px)] lg:h-screen flex overflow-hidden text-left bg-[#F8F9FC] dark:bg-[#0E1117]">
      {/* Column 1: Conversation History */}
      <div className={`
        ${isHistoryCollapsed ? 'w-0 hidden' : 'w-72 lg:flex flex-col'}
        bg-white dark:bg-[#13161F] border-r border-[#E9EAF0] dark:border-[#232838] transition-all duration-200 z-10 shrink-0
      `}>
        {/* New Chat Button */}
        <div className="p-3.5 border-b border-[#E9EAF0] dark:border-[#232838]">
          <Button
            className="w-full justify-start"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={async () => {
              if (user) {
                const conv = await startNewConversation(activeWsId, user.id);
                navigate(`/app/workspaces/${activeWsId}/chat/${conv.id}`);
              }
            }}
          >
            New Conversation
          </Button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#777D8A] px-2.5 py-1.5">
            Past Research & Chats
          </p>
          {conversations.map((conv) => {
            const isActive = conv.id === activeConversationId;
            return (
              <div
                key={conv.id}
                onClick={() => {
                  selectConversation(activeWsId, conv.id);
                  navigate(`/app/workspaces/${activeWsId}/chat/${conv.id}`);
                }}
                className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-colors ${
                  isActive
                    ? 'bg-[#F0EDFF] text-[#6857E8] font-semibold dark:bg-[#2B2754]'
                    : 'text-[#171923] dark:text-[#E2E8F0] hover:bg-[#F8F9FC] dark:hover:bg-[#1C202C]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{conv.title || 'Untitled Conversation'}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(activeWsId, conv.id);
                  }}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:text-[#E05252] transition-opacity"
                  title="Delete chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}

          {conversations.length === 0 && (
            <p className="text-xs text-[#777D8A] text-center py-8">
              No conversations yet. Start asking questions above!
            </p>
          )}
        </div>
      </div>

      {/* Column 2: Chat Center Viewport */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8F9FC] dark:bg-[#0E1117]">
        {/* Chat Header Bar */}
        <div className="h-14 px-4 border-b border-[#E9EAF0] dark:border-[#232838] bg-white dark:bg-[#13161F] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => setIsHistoryCollapsed(!isHistoryCollapsed)}
              className="p-1.5 rounded-lg text-[#777D8A] hover:bg-[#F0F2F7] dark:hover:bg-[#1C202C] transition-colors"
              title={isHistoryCollapsed ? 'Show History' : 'Hide History'}
            >
              {isHistoryCollapsed ? <SidebarOpen className="w-4 h-4" /> : <SidebarClose className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#6857E8]" />
              <span className="text-sm font-bold text-[#171923] dark:text-white truncate">
                AI Knowledge Assistant
              </span>
              <Badge variant="purple" size="sm">Grounded RAG</Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCitationCollapsed(!isCitationCollapsed)}
              className="text-xs px-2.5 py-1.5 rounded-lg text-[#6857E8] bg-[#F0EDFF] dark:bg-[#2B2754] font-medium flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isCitationCollapsed ? 'Show Sources' : 'Hide Sources'}</span>
            </button>
          </div>
        </div>

        {/* Message History Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.length === 0 && (
            <div className="max-w-xl mx-auto py-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#F0EDFF] text-[#6857E8] dark:bg-[#2B2754] flex items-center justify-center mx-auto shadow-sm">
                <Sparkles className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-extrabold text-[#171923] dark:text-white tracking-tight">
                Ask anything about your workspace
              </h2>
              <p className="text-xs text-[#777D8A] dark:text-[#9BA1B0] max-w-md mx-auto leading-relaxed">
                Knowbase AI searches across all {documents.length} indexed company documents and returns accurate, grounded answers with verifiable source citations.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left pt-4">
                {samplePrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInputPrompt(prompt);
                    }}
                    className="p-3 rounded-xl bg-white dark:bg-[#161A23] border border-[#E9EAF0] dark:border-[#232838] hover:border-[#6857E8] transition-all text-xs font-medium text-[#171923] dark:text-[#E2E8F0] shadow-2xs group"
                  >
                    <p className="group-hover:text-[#6857E8] transition-colors">{prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Render Messages */}
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser 
                    ? 'bg-[#171923] dark:bg-white text-white dark:text-[#171923] font-bold text-xs' 
                    : 'bg-[#6857E8] text-white'
                }`}>
                  {isUser ? (user?.displayName?.charAt(0) || 'U') : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble Container */}
                <div className={`space-y-2 min-w-0 max-w-2xl ${isUser ? 'text-right' : 'text-left'}`}>
                  <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-[#6857E8] text-white rounded-tr-none'
                      : 'bg-white dark:bg-[#161A23] text-[#171923] dark:text-[#F0F2F5] border border-[#E9EAF0] dark:border-[#232838] rounded-tl-none'
                  }`}>
                    <div className="whitespace-pre-wrap">
                      {msg.content}
                    </div>

                    {/* Citations Pill List inside message */}
                    {!isUser && msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[#E9EAF0] dark:border-[#232838] flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#777D8A]">
                          Sources:
                        </span>
                        {msg.citations.map((cite, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setActiveCitation(cite);
                              setIsCitationCollapsed(false);
                            }}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors ${
                              activeCitation?.chunkId === cite.chunkId
                                ? 'bg-[#6857E8] text-white border-[#6857E8]'
                                : 'bg-[#F0EDFF] text-[#6857E8] border-[#DDD6FE] dark:bg-[#2B2754] dark:border-[#423D70]'
                            }`}
                          >
                            <span>[{i + 1}]</span>
                            <span className="truncate max-w-[140px]">{cite.documentName}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions for Assistant Message */}
                  {!isUser && (
                    <div className="flex items-center gap-2 text-xs text-[#777D8A] px-1">
                      <button
                        onClick={() => copyToClipboard(msg.content, msg.id)}
                        className="p-1 hover:text-[#171923] dark:hover:text-white transition-colors"
                        title="Copy answer"
                      >
                        {copiedMessageId === msg.id ? <Check className="w-3.5 h-3.5 text-[#16A36A]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => voteHelpful(activeWsId, msg.id, true)}
                        className={`p-1 hover:text-[#16A36A] transition-colors ${msg.isHelpful === true ? 'text-[#16A36A]' : ''}`}
                        title="Helpful"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => voteHelpful(activeWsId, msg.id, false)}
                        className={`p-1 hover:text-[#E05252] transition-colors ${msg.isHelpful === false ? 'text-[#E05252]' : ''}`}
                        title="Not helpful"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] ml-auto font-mono text-[#777D8A]">
                        {msg.model || 'gemini-3.8-flash'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Streaming Response Indicator */}
          {isGeneratingResponse && streamingContent && (
            <div className="flex gap-3 max-w-3xl mr-auto">
              <div className="w-8 h-8 rounded-xl bg-[#6857E8] text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-[#161A23] text-[#171923] dark:text-[#F0F2F5] border border-[#E9EAF0] dark:border-[#232838] rounded-tl-none text-xs sm:text-sm leading-relaxed max-w-2xl whitespace-pre-wrap">
                {streamingContent}
                <span className="inline-block w-1.5 h-3.5 bg-[#6857E8] ml-1 animate-pulse" />
              </div>
            </div>
          )}

          {/* Generation Loading Indicator */}
          {isGeneratingResponse && !streamingContent && (
            <div className="flex items-center gap-2 text-xs text-[#777D8A] italic">
              <div className="w-2 h-2 rounded-full bg-[#6857E8] animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-[#6857E8] animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-[#6857E8] animate-bounce [animation-delay:0.4s]" />
              <span>Retrieving relevant chunks & formulating grounded answer...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Composer Input Bar */}
        <div className="p-4 bg-white dark:bg-[#13161F] border-t border-[#E9EAF0] dark:border-[#232838] shrink-0">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-end">
            <textarea
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your workspace... (Press Enter to send, Shift+Enter for new line)"
              rows={2}
              className="w-full pl-4 pr-14 py-3 bg-[#F8F9FC] dark:bg-[#1C202C] rounded-2xl border border-[#E9EAF0] dark:border-[#232838] text-xs sm:text-sm text-[#171923] dark:text-white placeholder-[#777D8A] focus:outline-none focus:border-[#6857E8] resize-none shadow-xs"
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || isGeneratingResponse}
              className="absolute right-3 bottom-3 p-2 rounded-xl bg-[#6857E8] text-white disabled:opacity-40 disabled:pointer-events-none hover:bg-[#5846D4] transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[11px] text-center text-[#777D8A] mt-2">
            Answers are strictly grounded in your verified documents. Citations reflect exact sources.
          </p>
        </div>
      </div>

      {/* Column 3: Source Citation Inspector */}
      <div className={`
        ${isCitationCollapsed ? 'w-0 hidden' : 'w-80 lg:flex flex-col'}
        bg-white dark:bg-[#13161F] border-l border-[#E9EAF0] dark:border-[#232838] transition-all duration-200 shrink-0
      `}>
        <div className="p-3.5 border-b border-[#E9EAF0] dark:border-[#232838] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#6857E8]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#171923] dark:text-white">
              Source Citation Inspector
            </h3>
          </div>
          <button
            onClick={() => setIsCitationCollapsed(true)}
            className="p-1 rounded text-[#777D8A] hover:bg-[#F0F2F7] dark:hover:bg-[#1C202C]"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeCitation ? (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-[#F0EDFF]/50 dark:bg-[#201C3E] border border-[#DDD6FE] dark:border-[#423D70] space-y-2">
                <span className="text-[10px] font-bold text-[#6857E8] uppercase tracking-wider">
                  Relevance Score: {Math.round(activeCitation.relevanceScore * 100)}%
                </span>
                <h4 className="text-sm font-bold text-[#171923] dark:text-white">
                  {activeCitation.documentName}
                </h4>
                <div className="flex items-center gap-2 text-[#777D8A] text-[11px]">
                  <span>{activeCitation.sectionHeading || 'Section'}</span>
                  <span>&bull;</span>
                  <span>Page {activeCitation.pageNumber || 1}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold text-[#777D8A] uppercase tracking-wider">
                  Verified Source Excerpt:
                </p>
                <div className="p-3 rounded-xl bg-[#F8F9FC] dark:bg-[#1C202C] border border-[#E9EAF0] dark:border-[#232838] text-xs leading-relaxed text-[#171923] dark:text-[#E2E8F0] italic">
                  "{activeCitation.excerpt}"
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                onClick={() => navigate(`/app/workspaces/${activeWsId}/documents/${activeCitation.documentId}`)}
              >
                Inspect Document Details
              </Button>
            </div>
          ) : (
            <div className="py-16 text-center text-[#777D8A] space-y-2">
              <ShieldCheck className="w-8 h-8 text-[#6857E8] mx-auto opacity-40" />
              <p className="text-xs font-semibold text-[#171923] dark:text-white">
                No Citation Selected
              </p>
              <p className="text-[11px] leading-relaxed">
                Click any citation pill `[1]`, `[2]` in an AI response to inspect the exact passage and page reference.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

