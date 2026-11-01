import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Sparkles, 
  Clock, 
  User, 
  Layers, 
  Hash, 
  Bot, 
  FolderTree, 
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Send
} from 'lucide-react';
import { useDocumentStore } from '@/stores/useDocumentStore';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { useChatStore } from '@/stores/useChatStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatBytes, formatDate } from '@/utils/formatters';

export const DocumentDetailsPage: React.FC = () => {
  const { workspaceId, documentId } = useParams<{ workspaceId: string; documentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { activeDocument, activeChunks, fetchDocumentDetails, isLoading } = useDocumentStore();
  const { collections } = useWorkspaceStore();
  const { startNewConversation, sendMessage } = useChatStore();

  const [docQuestion, setDocQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'chunks'>('text');

  const activeWsId = workspaceId || 'ws_demo_enterprise';

  useEffect(() => {
    if (activeWsId && documentId) {
      fetchDocumentDetails(activeWsId, documentId);
    }
  }, [activeWsId, documentId, fetchDocumentDetails]);

  if (isLoading || !activeDocument) {
    return (
      <div className="p-8 text-center text-[#777D8A]">
        <div className="w-8 h-8 border-2 border-[#6857E8] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Loading document intelligence...</p>
      </div>
    );
  }

  const collection = collections.find(c => c.id === activeDocument.collectionId);

  const handleAskQuestion = async (question: string) => {
    if (!question.trim() || !user) return;
    setIsAsking(true);
    try {
      const conv = await startNewConversation(activeWsId, user.id, question.substring(0, 35));
      navigate(`/app/workspaces/${activeWsId}/chat/${conv.id}`);
      sendMessage(activeWsId, question, user.id, user.displayName);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-left">
      {/* Back button and title */}
      <div>
        <button
          onClick={() => navigate(`/app/workspaces/${activeWsId}/documents`)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#777D8A] hover:text-[#6857E8] transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Documents</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F0EDFF] text-[#6857E8] dark:bg-[#2B2754] flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#171923] dark:text-white tracking-tight">
                {activeDocument.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#777D8A]">
                <span>{activeDocument.originalName}</span>
                <span>&bull;</span>
                <span className="uppercase font-mono">{activeDocument.fileType}</span>
                <span>&bull;</span>
                <span>{formatBytes(activeDocument.fileSize)}</span>
                <span>&bull;</span>
                <Badge status={activeDocument.status} size="sm" />
              </div>
            </div>
          </div>

          <Button
            leftIcon={<Bot className="w-4 h-4" />}
            onClick={() => handleAskQuestion(`Summarize the key information inside ${activeDocument.name}`)}
          >
            Chat with Document
          </Button>
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Document Preview & Chunks */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs bar */}
          <div className="flex items-center gap-2 border-b border-[#E9EAF0] dark:border-[#232838] pb-2">
            <button
              onClick={() => setActiveTab('text')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'text'
                  ? 'bg-[#6857E8] text-white'
                  : 'text-[#777D8A] hover:text-[#171923] dark:hover:text-white'
              }`}
            >
              Extracted Content Preview
            </button>
            <button
              onClick={() => setActiveTab('chunks')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'chunks'
                  ? 'bg-[#6857E8] text-white'
                  : 'text-[#777D8A] hover:text-[#171923] dark:hover:text-white'
              }`}
            >
              <span>Vector Chunks</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10 text-[10px]">
                {activeChunks.length}
              </span>
            </button>
          </div>

          {/* Tab 1: Extracted Content */}
          {activeTab === 'text' && (
            <div className="p-6 rounded-2xl bg-white dark:bg-[#161A23] border border-[#E9EAF0] dark:border-[#232838] shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E9EAF0] dark:border-[#232838] text-xs text-[#777D8A]">
                <span>Document Text Ingestion</span>
                <span>Estimated {activeDocument.tokenCount} tokens</span>
              </div>
              <div className="font-mono text-xs leading-relaxed text-[#171923] dark:text-[#E2E8F0] whitespace-pre-wrap max-h-[500px] overflow-y-auto pr-2 bg-[#F8F9FC] dark:bg-[#11141C] p-4 rounded-xl border border-[#E9EAF0] dark:border-[#232838]">
                {activeDocument.extractedTextPreview || 'No text preview available for this document.'}
              </div>
            </div>
          )}

          {/* Tab 2: Chunks breakdown */}
          {activeTab === 'chunks' && (
            <div className="space-y-3">
              {activeChunks.map((chunk, idx) => (
                <div
                  key={chunk.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#161A23] border border-[#E9EAF0] dark:border-[#232838] shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#6857E8]">Chunk #{idx + 1}</span>
                      <span className="text-[#777D8A]">&bull;</span>
                      <span className="font-semibold text-[#171923] dark:text-white">
                        {chunk.sectionHeading || `Section ${idx + 1}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[#777D8A]">
                      <span>Page {chunk.pageNumber || 1}</span>
                      <span>&bull;</span>
                      <span>{chunk.tokenCount} tokens</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#171923] dark:text-[#E2E8F0] leading-relaxed bg-[#F8F9FC] dark:bg-[#11141C] p-3.5 rounded-xl border border-[#E9EAF0] dark:border-[#232838]">
                    {chunk.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (1 col): AI Intelligence & Insights */}
        <div className="space-y-4">
          {/* AI Summary Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#161A23] border border-[#E9EAF0] dark:border-[#232838] shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-[#6857E8]">
              <Sparkles className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#171923] dark:text-white">
                AI Summary
              </h3>
            </div>
            <p className="text-xs text-[#171923] dark:text-[#E2E8F0] leading-relaxed">
              {activeDocument.summary || 'Summary generated upon document completion.'}
            </p>
          </div>

          {/* Key Topics */}
          {activeDocument.keyTopics && activeDocument.keyTopics.length > 0 && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#161A23] border border-[#E9EAF0] dark:border-[#232838] shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#777D8A] dark:text-[#9BA1B0]">
                Key Topics & Entities
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {activeDocument.keyTopics.map((topic, i) => (
                  <span
                    key={i}
                    onClick={() => handleAskQuestion(`Explain ${topic} in detail based on ${activeDocument.name}`)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-[#F0EDFF] text-[#6857E8] dark:bg-[#2B2754] font-medium cursor-pointer hover:bg-[#E5E0FF] transition-colors"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related Questions */}
          {activeDocument.suggestedQuestions && activeDocument.suggestedQuestions.length > 0 && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#161A23] border border-[#E9EAF0] dark:border-[#232838] shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#777D8A] dark:text-[#9BA1B0]">
                Suggested Questions
              </h3>
              <div className="space-y-2">
                {activeDocument.suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleAskQuestion(q)}
                    className="w-full text-left p-2.5 rounded-xl border border-[#E9EAF0] dark:border-[#232838] hover:border-[#6857E8] hover:text-[#6857E8] text-xs font-medium transition-all group flex items-start justify-between gap-2"
                  >
                    <span>{q}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#777D8A] group-hover:text-[#6857E8] shrink-0 mt-0.5" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ask document AI card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#F0EDFF]/50 to-white dark:from-[#1E1A38] dark:to-[#161A23] border border-[#DDD6FE] dark:border-[#2E2856] shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6857E8]">
              Ask About This Document
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskQuestion(docQuestion);
              }}
              className="space-y-2"
            >
              <textarea
                value={docQuestion}
                onChange={(e) => setDocQuestion(e.target.value)}
                placeholder="Ask specific question regarding clauses, rules, or data in this file..."
                rows={3}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-[#11141C] border border-[#E9EAF0] dark:border-[#232838] text-xs text-[#171923] dark:text-white placeholder-[#777D8A] focus:outline-none focus:border-[#6857E8]"
              />
              <Button
                type="submit"
                size="sm"
                className="w-full"
                isLoading={isAsking}
                rightIcon={<Send className="w-3.5 h-3.5" />}
              >
                Ask Assistant
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

