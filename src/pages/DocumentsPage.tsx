import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Upload, 
  FileText, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  FolderInput, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  FolderTree,
  MoreVertical,
  Plus
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { useDocumentStore } from '@/stores/useDocumentStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { formatBytes, formatDate } from '@/utils/formatters';
import { DocumentItem } from '@/types';

export const DocumentsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { currentWorkspace, collections } = useWorkspaceStore();
  const { 
    documents, 
    fetchDocuments, 
    uploadDocument, 
    deleteDocument, 
    renameDocument, 
    moveDocument,
    isUploading,
    uploadProgress,
    uploadStatus
  } = useDocumentStore();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [isDragOver, setIsDragOver] = useState(false);

  // Modals state
  const [docToRename, setDocToRename] = useState<DocumentItem | null>(null);
  const [newName, setNewName] = useState('');
  const [docToMove, setDocToMove] = useState<DocumentItem | null>(null);
  const [targetCollectionId, setTargetCollectionId] = useState<string>('');
  const [docToDelete, setDocToDelete] = useState<DocumentItem | null>(null);

  const activeWsId = currentWorkspace?.id || workspaceId || 'ws_demo_enterprise';

  useEffect(() => {
    if (activeWsId) {
      fetchDocuments(activeWsId);
    }
  }, [activeWsId, fetchDocuments]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || !user) return;
    const file = files[0];

    // File validation: PDF, DOCX, TXT, MD, CSV, PPTX
    const validExts = ['pdf', 'docx', 'txt', 'md', 'csv', 'pptx'];
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (!ext || !validExts.includes(ext)) {
      toast.error('Unsupported File Type', 'Please upload a PDF, DOCX, TXT, MD, CSV, or PPTX document.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File Too Large', 'Maximum file size allowed is 50 MB.');
      return;
    }

    try {
      toast.info('Uploading Document', `Processing "${file.name}"...`);
      const created = await uploadDocument(
        file,
        activeWsId,
        selectedCollection !== 'all' ? selectedCollection : null,
        user.id,
        user.displayName || 'Member'
      );
      toast.success('Document Indexed', `"${created.name}" is now ready for semantic AI search.`);
    } catch {
      toast.error('Processing Failed', 'Could not process document.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docToRename || !newName.trim()) return;
    await renameDocument(activeWsId, docToRename.id, newName.trim());
    toast.success('Document Renamed', `Updated to "${newName.trim()}".`);
    setDocToRename(null);
  };

  const handleMoveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docToMove) return;
    await moveDocument(activeWsId, docToMove.id, targetCollectionId || null);
    toast.success('Document Moved', 'Collection updated successfully.');
    setDocToMove(null);
  };

  const handleDeleteConfirm = async () => {
    if (!docToDelete) return;
    await deleteDocument(activeWsId, docToDelete.id);
    toast.success('Document Removed', `"${docToDelete.name}" and all associated vectors have been deleted.`);
    setDocToDelete(null);
  };

  // Filter documents
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.originalName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCollection = selectedCollection === 'all' || doc.collectionId === selectedCollection;
    return matchesSearch && matchesCollection;
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#171923] dark:text-white tracking-tight">
            Document Management
          </h1>
          <p className="text-sm text-[#777D8A] dark:text-[#9BA1B0] mt-1">
            Upload, inspect, and organize company documentation for your AI workspace.
          </p>
        </div>

        <Button
          leftIcon={<Upload className="w-4 h-4" />}
          onClick={() => fileInputRef.current?.click()}
        >
          Upload Document
        </Button>
      </div>

      {/* Upload Drag & Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-150 ${
          isDragOver
            ? 'border-[#6857E8] bg-[#F0EDFF]/50 dark:bg-[#201C3E]'
            : 'border-[#E9EAF0] dark:border-[#232838] bg-white dark:bg-[#161A23] hover:border-[#6857E8]/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt,.md,.csv,.pptx"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="w-12 h-12 rounded-2xl bg-[#F0EDFF] text-[#6857E8] dark:bg-[#2B2754] flex items-center justify-center mx-auto mb-3">
          <Upload className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-[#171923] dark:text-white">
          Click to upload or drag and drop files here
        </p>
        <p className="text-xs text-[#777D8A] dark:text-[#9BA1B0] mt-1">
          Supports PDF, DOCX, TXT, Markdown, CSV, PPTX up to 50 MB
        </p>

        {/* Uploading Status Progress Bar */}
        {isUploading && (
          <div className="max-w-md mx-auto mt-5 p-3 rounded-xl bg-[#F8F9FC] dark:bg-[#1C202C] border border-[#E9EAF0] dark:border-[#232838] text-left">
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <span className="flex items-center gap-2 text-[#6857E8]">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing Pipeline: {uploadStatus}...</span>
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#E9EAF0] dark:bg-[#2A3144] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#6857E8] transition-all duration-300 rounded-full" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-1 items-center gap-3 w-full">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-[#777D8A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search documents by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-[#161A23] rounded-xl border border-[#E9EAF0] dark:border-[#232838] text-[#171923] dark:text-white placeholder-[#777D8A] focus:outline-none focus:border-[#6857E8]"
            />
          </div>

          {/* Collection Filter */}
          <select
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-white dark:bg-[#161A23] rounded-xl border border-[#E9EAF0] dark:border-[#232838] text-[#171923] dark:text-white focus:outline-none focus:border-[#6857E8]"
          >
            <option value="all">All Collections ({documents.length})</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-[#777D8A]">
          Showing {filteredDocs.length} of {documents.length} document{documents.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Documents Table */}
      <div className="bg-white dark:bg-[#161A23] rounded-2xl border border-[#E9EAF0] dark:border-[#232838] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8F9FC] dark:bg-[#1C202C] border-b border-[#E9EAF0] dark:border-[#232838] text-[#777D8A]">
                <th className="py-3 px-4 font-semibold">Document Name</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Collection</th>
                <th className="py-3 px-4 font-semibold">Uploaded By</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Size</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EAF0] dark:divide-[#232838]">
              {filteredDocs.map((doc) => {
                const col = collections.find(c => c.id === doc.collectionId);
                return (
                  <tr key={doc.id} className="hover:bg-[#F8F9FC] dark:hover:bg-[#1A1F2C] transition-colors">
                    <td className="py-3.5 px-4">
                      <div 
                        className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
                        onClick={() => navigate(`/app/workspaces/${activeWsId}/documents/${doc.id}`)}
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#F0EDFF] text-[#6857E8] dark:bg-[#2B2754] flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-[#171923] dark:text-white group-hover:text-[#6857E8] transition-colors truncate max-w-xs">
                            {doc.name}
                          </p>
                          <p className="text-[11px] text-[#777D8A] truncate">
                            {doc.originalName} &bull; {doc.chunkCount} vector chunks
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono uppercase text-[#777D8A]">
                      {doc.fileType}
                    </td>

                    <td className="py-3.5 px-4">
                      {col ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#F0EDFF] text-[#6857E8] dark:bg-[#2B2754] font-medium text-[11px]">
                          <FolderTree className="w-3 h-3" />
                          <span>{col.name}</span>
                        </span>
                      ) : (
                        <span className="text-[#777D8A] italic">Unassigned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-[#171923] dark:text-[#E2E8F0]">
                      {doc.uploadedByName || 'Member'}
                    </td>

                    <td className="py-3.5 px-4 text-[#777D8A]">
                      {formatDate(doc.createdAt)}
                    </td>

                    <td className="py-3.5 px-4 text-[#777D8A]">
                      {formatBytes(doc.fileSize)}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge status={doc.status} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/app/workspaces/${activeWsId}/documents/${doc.id}`)}
                          title="Inspect Details"
                        >
                          View
                        </Button>
                        <button
                          onClick={() => {
                            setDocToRename(doc);
                            setNewName(doc.name);
                          }}
                          className="p-1.5 rounded-lg text-[#777D8A] hover:text-[#171923] dark:hover:text-white hover:bg-[#F0F2F7] dark:hover:bg-[#1E2330]"
                          title="Rename"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setDocToMove(doc);
                            setTargetCollectionId(doc.collectionId || '');
                          }}
                          className="p-1.5 rounded-lg text-[#777D8A] hover:text-[#171923] dark:hover:text-white hover:bg-[#F0F2F7] dark:hover:bg-[#1E2330]"
                          title="Move to Collection"
                        >
                          <FolderInput className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDocToDelete(doc)}
                          className="p-1.5 rounded-lg text-[#777D8A] hover:text-[#E05252] hover:bg-[#F0F2F7] dark:hover:bg-[#1E2330]"
                          title="Delete Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredDocs.length === 0 && (
            <div className="py-16 text-center text-[#777D8A]">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#6857E8]" />
              <p className="text-sm font-semibold text-[#171923] dark:text-white">No documents found</p>
              <p className="text-xs mt-1">Upload your first document or adjust your search filter above.</p>
            </div>
          )}
        </div>
      </div>

      {/* Rename Modal */}
      <Modal
        isOpen={Boolean(docToRename)}
        onClose={() => setDocToRename(null)}
        title="Rename Document"
      >
        <form onSubmit={handleRenameSubmit} className="space-y-4">
          <Input
            label="Document Title"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
            autoFocus
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setDocToRename(null)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Title
            </Button>
          </div>
        </form>
      </Modal>

      {/* Move to Collection Modal */}
      <Modal
        isOpen={Boolean(docToMove)}
        onClose={() => setDocToMove(null)}
        title="Move Document to Collection"
      >
        <form onSubmit={handleMoveSubmit} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-[#171923] dark:text-[#E2E8F0]">
              Select Collection
            </label>
            <select
              value={targetCollectionId}
              onChange={(e) => setTargetCollectionId(e.target.value)}
              className="w-full bg-white dark:bg-[#161A23] text-sm text-[#171923] dark:text-[#F0F2F5] rounded-xl border border-[#E9EAF0] dark:border-[#232838] px-3.5 py-2.5 focus:outline-none focus:border-[#6857E8]"
            >
              <option value="">(None - Unassigned)</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setDocToMove(null)}>
              Cancel
            </Button>
            <Button type="submit">
              Update Collection
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(docToDelete)}
        onClose={() => setDocToDelete(null)}
        title="Delete Document"
        description="Are you sure you want to permanently delete this document?"
      >
        <div className="space-y-4">
          <div className="p-3 bg-[#FEF2F2] dark:bg-[#7F1D1D]/20 border border-[#FECACA] dark:border-[#991B1B] rounded-xl text-xs text-[#E05252]">
            <p className="font-semibold">Warning: This action cannot be undone.</p>
            <p className="mt-1">
              Deleting "{docToDelete?.name}" will permanently erase its storage asset, all {docToDelete?.chunkCount} vector embeddings, and remove it from AI citation context.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDocToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Permanently Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

