import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FileText, 
  CheckCircle2, 
  HardDrive, 
  MessageSquare, 
  ArrowRight, 
  Sparkles, 
  Plus, 
  Upload, 
  Clock, 
  FolderTree, 
  Bot, 
  TrendingUp,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { useDocumentStore } from '@/stores/useDocumentStore';
import { useChatStore } from '@/stores/useChatStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatBytes, formatDate } from '@/utils/formatters';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { currentWorkspace, collections, usage, activities, fetchUsage, fetchActivities } = useWorkspaceStore();
  const { documents, fetchDocuments } = useDocumentStore();
  const { startNewConversation, sendMessage } = useChatStore();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();

  const [quickQuestion, setQuickQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  const activeWsId = currentWorkspace?.id || workspaceId || 'ws_demo_enterprise';

  useEffect(() => {
    if (activeWsId) {
      fetchDocuments(activeWsId);
      fetchUsage();
      fetchActivities();
    }
  }, [activeWsId, fetchDocuments, fetchUsage, fetchActivities]);

  const firstName = user?.displayName ? user.displayName.split(' ')[0] : 'there';

  // Metrics from real data
  const totalDocs = documents.length;
  const indexedDocs = documents.filter(d => d.status === 'indexed').length;
  const totalStorage = documents.reduce((acc, d) => acc + (d.fileSize || 0), 0);
  const questionsAsked = usage?.questionsAsked || 0;

  const handleQuickAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuestion.trim() || !user) return;
    setIsAsking(true);
    try {
      const conv = await startNewConversation(activeWsId, user.id, quickQuestion.trim().substring(0, 35));
      navigate(`/app/workspaces/${activeWsId}/chat/${conv.id}`);
      // Asynchronously trigger response in background
      sendMessage(activeWsId, quickQuestion.trim(), user.id, user.displayName);
    } finally {
      setIsAsking(false);
    }
  };

  const sampleSuggestions = [
    'What is our annual allowance for home office equipment?',
    'What are the guaranteed SLAs for Enterprise customers?',
    'What encryption standards are enforced for data at rest?',
    'What is our Q3 target ARR milestone?'
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 text-left">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#171923] dark:text-white tracking-tight">
            Good day, {firstName}
          </h1>
          <p className="text-sm text-[#777D8A] dark:text-[#9BA1B0] mt-1">
            Here's what's happening across <span className="font-semibold text-[#171923] dark:text-[#E2E8F0]">{currentWorkspace?.name || 'your workspace'}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            leftIcon={<Upload className="w-4 h-4" />}
            onClick={() => navigate(`/app/workspaces/${activeWsId}/documents`)}
          >
            Upload Document
          </Button>
          <Button
            leftIcon={<Bot className="w-4 h-4" />}
            onClick={() => navigate(`/app/workspaces/${activeWsId}/chat`)}
          >
            Open AI Assistant
          </Button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#161A23] border border-[#E9EAF0] dark:border-[#232838] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#777D8A] dark:text-[#9BA1B0] uppercase tracking-wider">Total Documents</span>
            <div className="p-2 rounded-xl bg-[#F0EDFF] text-[#6857E8] dark:bg-[#2B2754]">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#171923] dark:text-white mt-3">{totalDocs}</p>
          <p className="text-xs text-[#777D8A] dark:text-[#9BA1B0] mt-1">Across all workspace collections</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#161A23] border border-[#E9EAF0] dark:border-[#232838] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#777D8A] dark:text-[#9BA1B0] uppercase tracking-wider">Indexed Documents</span>
            <div className="p-2 rounded-xl bg-[#ECFDF5] text-[#16A36A] dark:bg-[#064E3B]/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#171923] dark:text-white mt-3">{indexedDocs}</p>
          <p className="text-xs text-[#16A36A] font-medium mt-1">100% available for vector search</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#161A23] border border-[#E9EAF0] dark:border-[#232838] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#777D8A] dark:text-[#9BA1B0] uppercase tracking-wider">Storage Consumed</span>
            <div className="p-2 rounded-xl bg-[#FFFBEB] text-[#E9A23B] dark:bg-[#78350F]/30">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#171923] dark:text-white mt-3">{formatBytes(totalStorage)}</p>
          <p className="text-xs text-[#777D8A] dark:text-[#9BA1B0] mt-1">
            of {formatBytes(usage?.storageLimitBytes || 10485760000)} limit
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#161A23] border border-[#E9EAF0] dark:border-[#232838] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#777D8A] dark:text-[#9BA1B0] uppercase tracking-wider">AI Questions Asked</span>
            <div className="p-2 rounded-xl bg-[#EFF6FF] text-[#2563EB] dark:bg-[#1E3A8A]/30">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#171923] dark:text-white mt-3">{questionsAsked}</p>
          <p className="text-xs text-[#777D8A] dark:text-[#9BA1B0] mt-1">
            {usage?.questionsLimit ? `${usage.questionsLimit - questionsAsked} queries remaining this month` : 'Flexible quota'}
          </p>
        </div>
      </div>

      {/* AI Quick Ask Section */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-white to-[#F0EDFF]/30 dark:from-[#161A23] dark:to-[#1C1838] border border-[#DDD6FE] dark:border-[#2E2856] shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-[#6857E8]" />
          <h2 className="text-base font-bold text-[#171923] dark:text-white">AI Quick Ask</h2>
        </div>
        <p className="text-xs text-[#777D8A] dark:text-[#9BA1B0] mb-4">
          Ask any question across your uploaded company knowledge base and receive grounded answers with exact citations.
        </p>

        <form onSubmit={handleQuickAsk} className="flex gap-2">
          <input
            type="text"
            value={quickQuestion}
            onChange={(e) => setQuickQuestion(e.target.value)}
            placeholder="Ask anything about your documents... e.g. What is our refund policy?"
            className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-[#12151D] border border-[#E9EAF0] dark:border-[#232838] text-sm text-[#171923] dark:text-white placeholder-[#777D8A] focus:outline-none focus:border-[#6857E8] focus:ring-2 focus:ring-[#6857E8]/20 transition-all shadow-xs"
          />
          <Button type="submit" isLoading={isAsking} leftIcon={<Sparkles className="w-4 h-4" />}>
            Ask AI
          </Button>
        </form>

        {/* Suggested Prompts */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-[#E9EAF0]/60 dark:border-[#232838]">
          <span className="text-[11px] font-semibold text-[#777D8A]">Suggestions:</span>
          {sampleSuggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setQuickQuestion(s)}
              className="text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-[#1E2330] border border-[#E9EAF0] dark:border-[#2D3345] text-[#171923] dark:text-[#E2E8F0] hover:border-[#6857E8] hover:text-[#6857E8] transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Recent Documents & Knowledge Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Documents Table (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-[#161A23] border border-[#E9EAF0] dark:border-[#232838] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#171923] dark:text-white">Recent Documents</h3>
              <p className="text-xs text-[#777D8A] dark:text-[#9BA1B0]">Latest uploaded and indexed company resources</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => navigate(`/app/workspaces/${activeWsId}/documents`)}
            >
              View All
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E9EAF0] dark:border-[#232838] text-[#777D8A]">
                  <th className="py-2.5 px-3 font-semibold">Document Name</th>
                  <th className="py-2.5 px-3 font-semibold">Type</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold">Size</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9EAF0] dark:divide-[#232838]">
                {documents.slice(0, 5).map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#F8F9FC] dark:hover:bg-[#1A1F2C] transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-4 h-4 text-[#6857E8] shrink-0" />
                        <span className="font-semibold text-[#171923] dark:text-white truncate max-w-[200px] sm:max-w-xs">
                          {doc.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 uppercase text-[11px] font-mono text-[#777D8A]">
                      {doc.fileType}
                    </td>
                    <td className="py-3 px-3">
                      <Badge status={doc.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-[#777D8A]">
                      {formatBytes(doc.fileSize)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/app/workspaces/${activeWsId}/documents/${doc.id}`)}
                      >
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Knowledge Activity Feed (1 col) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#161A23] border border-[#E9EAF0] dark:border-[#232838] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#171923] dark:text-white">Workspace Activity</h3>
            <span className="text-xs text-[#777D8A]">Live</span>
          </div>

          <div className="space-y-4">
            {activities.slice(0, 5).map((act) => (
              <div key={act.id} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#6857E8] mt-1.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[#171923] dark:text-[#E2E8F0] leading-relaxed">
                    <span className="font-semibold">{act.userName}</span>: {act.details}
                  </p>
                  <p className="text-[10px] text-[#777D8A] mt-0.5">{formatDate(act.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Knowledge Collections Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#171923] dark:text-white">Knowledge Collections</h3>
            <p className="text-xs text-[#777D8A] dark:text-[#9BA1B0]">Organized workspaces for departmental repositories</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => navigate(`/app/workspaces/${activeWsId}/knowledge`)}
          >
            Manage Collections
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {collections.map((col) => (
            <div
              key={col.id}
              onClick={() => navigate(`/app/workspaces/${activeWsId}/knowledge`)}
              className="p-5 rounded-2xl bg-white dark:bg-[#161A23] border border-[#E9EAF0] dark:border-[#232838] card-hover-shadow cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-[#F0EDFF] text-[#6857E8]">
                <FolderTree className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#171923] dark:text-white group-hover:text-[#6857E8] transition-colors truncate">
                {col.name}
              </h4>
              <p className="text-xs text-[#777D8A] dark:text-[#9BA1B0] mt-1 line-clamp-2 leading-relaxed">
                {col.description}
              </p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#E9EAF0] dark:border-[#232838] text-[11px] text-[#777D8A]">
                <span>{col.documentCount || 1} Document{(col.documentCount || 1) !== 1 ? 's' : ''}</span>
                <span className="text-[#6857E8] font-semibold group-hover:translate-x-0.5 transition-transform">Explore &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

