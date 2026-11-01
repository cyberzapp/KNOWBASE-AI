import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Settings, 
  Bot, 
  Sliders, 
  ShieldAlert, 
  Trash2, 
  Save, 
  CheckCircle2, 
  Layers,
  Sparkles
} from 'lucide-react';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export const WorkspaceSettingsPage: React.FC = () => {
  const { currentWorkspace, updateWorkspaceSettings } = useWorkspaceStore();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [name, setName] = useState(currentWorkspace?.name || '');
  const [orgType, setOrgType] = useState(currentWorkspace?.organizationType || 'SaaS / Software');
  const [teamSize, setTeamSize] = useState(currentWorkspace?.teamSize || '15-50');
  const [mainPurpose, setMainPurpose] = useState(currentWorkspace?.mainPurpose || 'Internal knowledge & policies');
  
  // AI Settings
  const [aiModel, setAiModel] = useState<'gemini-3.8-flash' | 'gemini-3.5-flash-lite'>(
    currentWorkspace?.settings?.aiModel || 'gemini-3.8-flash'
  );
  const [retrievalLimit, setRetrievalLimit] = useState(currentWorkspace?.settings?.retrievalLimit || 5);
  const [similarityThreshold, setSimilarityThreshold] = useState(currentWorkspace?.settings?.similarityThreshold || 0.65);
  const [autoSummarize, setAutoSummarize] = useState(currentWorkspace?.settings?.autoSummarizeNewDocs ?? true);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await updateWorkspaceSettings({
        name: name.trim(),
        organizationType: orgType,
        teamSize,
        mainPurpose,
        settings: {
          allowPublicSharing: currentWorkspace?.settings?.allowPublicSharing || false,
          aiModel,
          retrievalLimit,
          similarityThreshold,
          autoSummarizeNewDocs: autoSummarize,
        }
      });
      toast.success('Settings Saved', 'Workspace configuration updated successfully.');
    } catch {
      toast.error('Error', 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8 text-left">
      <div>
        <h1 className="text-2xl font-extrabold text-[#171923] dark:text-white tracking-tight">
          Workspace Settings
        </h1>
        <p className="text-sm text-[#777D8A] dark:text-[#9BA1B0] mt-1">
          Configure general preferences, team size, and AI model parameters for <span className="font-semibold text-[#171923] dark:text-white">{currentWorkspace?.name}</span>.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Details Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#161A23] border border-[#E9EAF0] dark:border-[#232838] shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E9EAF0] dark:border-[#232838] pb-3">
            <Settings className="w-4 h-4 text-[#6857E8]" />
            <h2 className="text-sm font-bold text-[#171923] dark:text-white">General Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Workspace Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="URL Slug"
              value={currentWorkspace?.slug || 'acme-tech'}
              disabled
              helperText="Workspace URL identifier cannot be changed."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-[#171923] dark:text-[#E2E8F0]">
                Organization Type
              </label>
              <select
                value={orgType}
                onChange={(e) => setOrgType(e.target.value)}
                className="w-full bg-white dark:bg-[#161A23] text-sm text-[#171923] dark:text-[#F0F2F5] rounded-xl border border-[#E9EAF0] dark:border-[#232838] px-3.5 py-2.5 focus:outline-none focus:border-[#6857E8]"
              >
                <option value="SaaS / Software">SaaS / Software</option>
                <option value="Development Agency">Development Agency</option>
                <option value="Consulting Firm">Consulting Firm</option>
                <option value="HR & Operations">HR & Operations</option>
                <option value="E-commerce & Retail">E-commerce & Retail</option>
              </select>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-[#171923] dark:text-[#E2E8F0]">
                Team Size
              </label>
              <select
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                className="w-full bg-white dark:bg-[#161A23] text-sm text-[#171923] dark:text-[#F0F2F5] rounded-xl border border-[#E9EAF0] dark:border-[#232838] px-3.5 py-2.5 focus:outline-none focus:border-[#6857E8]"
              >
                <option value="1-5">1 - 5 members</option>
                <option value="5-15">5 - 15 members</option>
                <option value="15-50">15 - 50 members</option>
                <option value="50+">50+ members</option>
              </select>
            </div>
          </div>
        </div>

        {/* AI & RAG Configuration Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#161A23] border border-[#E9EAF0] dark:border-[#232838] shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E9EAF0] dark:border-[#232838] pb-3">
            <Sparkles className="w-4 h-4 text-[#6857E8]" />
            <h2 className="text-sm font-bold text-[#171923] dark:text-white">AI Engine & Semantic Retrieval</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-[#171923] dark:text-[#E2E8F0]">
                Primary LLM Model
              </label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value as any)}
                className="w-full bg-white dark:bg-[#161A23] text-sm text-[#171923] dark:text-[#F0F2F5] rounded-xl border border-[#E9EAF0] dark:border-[#232838] px-3.5 py-2.5 focus:outline-none focus:border-[#6857E8]"
              >
                <option value="gemini-3.8-flash">Gemini 3.8 Flash (Recommended: Fast, 1M context, balanced RAG)</option>
                <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash-Lite (High throughput, ultra-low latency)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold text-[#171923] dark:text-[#E2E8F0]">
                  Max Retrieved Chunks per Query: {retrievalLimit}
                </label>
                <input
                  type="range"
                  min="2"
                  max="10"
                  step="1"
                  value={retrievalLimit}
                  onChange={(e) => setRetrievalLimit(parseInt(e.target.value))}
                  className="w-full accent-[#6857E8]"
                />
                <p className="text-[11px] text-[#777D8A]">Higher limits provide more context at slight latency cost.</p>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold text-[#171923] dark:text-[#E2E8F0]">
                  Similarity Score Threshold: {Math.round(similarityThreshold * 100)}%
                </label>
                <input
                  type="range"
                  min="0.4"
                  max="0.85"
                  step="0.05"
                  value={similarityThreshold}
                  onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
                  className="w-full accent-[#6857E8]"
                />
                <p className="text-[11px] text-[#777D8A]">Discards chunk matches below this confidence score.</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-xs font-semibold text-[#171923] dark:text-white">Auto-generate AI summaries on upload</p>
                <p className="text-[11px] text-[#777D8A]">Automatically create summaries and key topics for newly uploaded documents.</p>
              </div>
              <input
                type="checkbox"
                checked={autoSummarize}
                onChange={(e) => setAutoSummarize(e.target.checked)}
                className="w-4 h-4 rounded text-[#6857E8] focus:ring-[#6857E8] accent-[#6857E8]"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
            Save Workspace Settings
          </Button>
        </div>
      </form>
    </div>
  );
};

