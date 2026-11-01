import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FolderTree, 
  Plus, 
  Trash2, 
  FileText, 
  ArrowRight, 
  Layers, 
  Briefcase, 
  ShieldCheck, 
  Headphones, 
  BookOpen,
  Search
} from 'lucide-react';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { useDocumentStore } from '@/stores/useDocumentStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { Collection } from '@/types';

export const KnowledgePage: React.FC = () => {
  const { user } = useAuthStore();
  const { currentWorkspace, collections, fetchCollections, createCollection, deleteCollection } = useWorkspaceStore();
  const { documents, fetchDocuments } = useDocumentStore();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [colName, setColName] = useState('');
  const [colDesc, setColDesc] = useState('');
  const [colColor, setColColor] = useState('#6857E8');
  const [search, setSearch] = useState('');

  const activeWsId = currentWorkspace?.id || workspaceId || 'ws_demo_enterprise';

  useEffect(() => {
    if (activeWsId) {
      fetchCollections();
      fetchDocuments(activeWsId);
    }
  }, [activeWsId, fetchCollections, fetchDocuments]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colName.trim() || !user) return;

    try {
      await createCollection(colName.trim(), colDesc.trim(), 'Folder', colColor, user.id);
      toast.success('Collection Created', `"${colName}" has been added to your knowledge base.`);
      setIsCreateOpen(false);
      setColName('');
      setColDesc('');
    } catch {
      toast.error('Error', 'Failed to create collection.');
    }
  };

  const handleDelete = async (col: Collection) => {
    if (confirm(`Are you sure you want to delete collection "${col.name}"? Documents in this collection will become uncategorized.`)) {
      await deleteCollection(col.id);
      toast.success('Collection Deleted', `"${col.name}" has been removed.`);
    }
  };

  const filteredCols = collections.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#171923] dark:text-white tracking-tight">
            Knowledge Base & Collections
          </h1>
          <p className="text-sm text-[#777D8A] dark:text-[#9BA1B0] mt-1">
            Group related company knowledge into structured collections for department-specific AI discovery.
          </p>
        </div>

        <Button
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateOpen(true)}
        >
          New Collection
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Filter collections..."
          leftIcon={<Search className="w-4 h-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCols.map((col) => {
          const docsInCol = documents.filter(d => d.collectionId === col.id);

          return (
            <div
              key={col.id}
              className="p-6 rounded-2xl bg-white dark:bg-[#161A23] border border-[#E9EAF0] dark:border-[#232838] shadow-xs flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs"
                    style={{ backgroundColor: col.color || '#6857E8' }}
                  >
                    <FolderTree className="w-5 h-5" />
                  </div>
                  <button
                    onClick={() => handleDelete(col)}
                    className="p-1.5 rounded-lg text-[#777D8A] hover:text-[#E05252] hover:bg-[#F0F2F7] dark:hover:bg-[#1E2330] opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete collection"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-[#171923] dark:text-white group-hover:text-[#6857E8] transition-colors">
                  {col.name}
                </h3>
                <p className="text-xs text-[#777D8A] dark:text-[#9BA1B0] mt-1.5 line-clamp-2 leading-relaxed">
                  {col.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#E9EAF0] dark:border-[#232838] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#777D8A]">
                  {docsInCol.length} Document{docsInCol.length !== 1 ? 's' : ''}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  onClick={() => navigate(`/app/workspaces/${activeWsId}/documents`)}
                >
                  View Files
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCols.length === 0 && (
        <div className="py-16 text-center text-[#777D8A]">
          <FolderTree className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#6857E8]" />
          <p className="text-sm font-semibold text-[#171923] dark:text-white">No collections found</p>
          <p className="text-xs mt-1">Create a collection to organize your workspace documents.</p>
        </div>
      )}

      {/* Create Collection Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Knowledge Collection"
        description="Organize your company knowledge by topic, team, or department."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Collection Name"
            placeholder="e.g. Engineering Architecture, Sales Enablement"
            value={colName}
            onChange={(e) => setColName(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Description"
            placeholder="Brief explanation of documents stored in this collection"
            value={colDesc}
            onChange={(e) => setColDesc(e.target.value)}
          />

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-[#171923] dark:text-[#E2E8F0]">
              Brand Color
            </label>
            <div className="flex items-center gap-2">
              {['#6857E8', '#16A36A', '#E9A23B', '#E05252', '#2563EB', '#0D9488'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColColor(c)}
                  className={`w-7 h-7 rounded-lg transition-transform ${colColor === c ? 'scale-110 ring-2 ring-offset-2 ring-[#6857E8]' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Collection
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

