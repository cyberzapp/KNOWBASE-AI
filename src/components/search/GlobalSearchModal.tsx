import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, FolderTree, MessageSquare, ArrowRight, CornerDownLeft } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useDocumentStore } from '@/stores/useDocumentStore';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { useChatStore } from '@/stores/useChatStore';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  workspaceId,
}) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { documents, fetchDocuments } = useDocumentStore();
  const { collections } = useWorkspaceStore();
  const { conversations, fetchConversations } = useChatStore();

  useEffect(() => {
    if (isOpen) {
      fetchDocuments(workspaceId);
      fetchConversations(workspaceId);
    }
  }, [isOpen, workspaceId, fetchDocuments, fetchConversations]);

  const filteredResults = useMemo(() => {
    if (!query.trim()) {
      return {
        docs: documents.slice(0, 3),
        cols: collections.slice(0, 2),
        convs: conversations.slice(0, 3),
      };
    }

    const q = query.toLowerCase();
    const docs = documents.filter(d => 
      d.name.toLowerCase().includes(q) || 
      d.summary?.toLowerCase().includes(q) ||
      d.keyTopics?.some(t => t.toLowerCase().includes(q))
    );

    const cols = collections.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.description.toLowerCase().includes(q)
    );

    const convs = conversations.filter(c => 
      c.title.toLowerCase().includes(q) || 
      c.lastMessagePreview?.toLowerCase().includes(q)
    );

    return { docs, cols, convs };
  }, [query, documents, collections, conversations]);

  const handleSelect = (url: string) => {
    navigate(url);
    onClose();
    setQuery('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl" showCloseButton={false}>
      <div className="space-y-4">
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-[#E9EAF0] dark:border-[#232838] pb-3">
          <Search className="w-5 h-5 text-[#777D8A] ml-1 mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents, collections, questions, or topics..."
            className="w-full bg-transparent text-base text-[#171923] dark:text-white placeholder-[#777D8A] focus:outline-none"
            autoFocus
          />
          <kbd className="px-2 py-0.5 rounded bg-[#F0F2F7] dark:bg-[#1E2330] text-[11px] text-[#777D8A] font-mono border border-[#D0D4DF] dark:border-[#2D3345]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto space-y-4 pr-1">
          {/* Documents Section */}
          {filteredResults.docs.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#777D8A] px-2 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Documents</span>
              </p>
              <div className="space-y-1">
                {filteredResults.docs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => handleSelect(`/app/workspaces/${workspaceId}/documents/${doc.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F0EDFF]/60 dark:hover:bg-[#1E2330] text-left transition-colors group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#171923] dark:text-white group-hover:text-[#6857E8] truncate">
                        {doc.name}
                      </p>
                      {doc.summary && (
                        <p className="text-xs text-[#777D8A] dark:text-[#9BA1B0] line-clamp-1 mt-0.5">
                          {doc.summary}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#777D8A] opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Collections Section */}
          {filteredResults.cols.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#777D8A] px-2 mb-1.5 flex items-center gap-1.5">
                <FolderTree className="w-3.5 h-3.5" />
                <span>Collections</span>
              </p>
              <div className="space-y-1">
                {filteredResults.cols.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => handleSelect(`/app/workspaces/${workspaceId}/knowledge`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F0EDFF]/60 dark:hover:bg-[#1E2330] text-left transition-colors group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#171923] dark:text-white group-hover:text-[#6857E8] truncate">
                        {col.name}
                      </p>
                      <p className="text-xs text-[#777D8A] dark:text-[#9BA1B0] line-clamp-1 mt-0.5">
                        {col.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#777D8A] opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conversations Section */}
          {filteredResults.convs.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#777D8A] px-2 mb-1.5 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Conversations</span>
              </p>
              <div className="space-y-1">
                {filteredResults.convs.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelect(`/app/workspaces/${workspaceId}/chat/${conv.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F0EDFF]/60 dark:hover:bg-[#1E2330] text-left transition-colors group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#171923] dark:text-white group-hover:text-[#6857E8] truncate">
                        {conv.title}
                      </p>
                      {conv.lastMessagePreview && (
                        <p className="text-xs text-[#777D8A] dark:text-[#9BA1B0] line-clamp-1 mt-0.5">
                          {conv.lastMessagePreview}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#777D8A] opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredResults.docs.length === 0 && filteredResults.cols.length === 0 && filteredResults.convs.length === 0 && (
            <div className="py-12 text-center text-[#777D8A]">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No results found for "{query}"</p>
              <p className="text-xs mt-1">Try searching for policies, roadmaps, or specific document names.</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-[#E9EAF0] dark:border-[#232838] flex items-center justify-between text-[11px] text-[#777D8A]">
          <div className="flex items-center gap-1.5">
            <CornerDownLeft className="w-3.5 h-3.5" />
            <span>Press Enter to select</span>
          </div>
          <span>Semantic search powered by Knowbase RAG</span>
        </div>
      </div>
    </Modal>
  );
};

