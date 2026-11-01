import { create } from 'zustand';
import { DocumentItem, DocumentChunk, DocumentStatus } from '@/types';
import { documentService } from '@/services/firebase/documentService';

interface DocumentState {
  documents: DocumentItem[];
  activeDocument: DocumentItem | null;
  activeChunks: DocumentChunk[];
  isLoading: boolean;
  uploadProgress: number;
  uploadStatus: DocumentStatus | null;
  isUploading: boolean;
  error: string | null;

  fetchDocuments: (workspaceId: string) => Promise<void>;
  fetchDocumentDetails: (workspaceId: string, documentId: string) => Promise<void>;
  uploadDocument: (
    file: File, 
    workspaceId: string, 
    collectionId: string | null, 
    userId: string, 
    userName: string
  ) => Promise<DocumentItem>;
  deleteDocument: (workspaceId: string, documentId: string) => Promise<void>;
  renameDocument: (workspaceId: string, documentId: string, newName: string) => Promise<void>;
  moveDocument: (workspaceId: string, documentId: string, collectionId: string | null) => Promise<void>;
  clearActiveDocument: () => void;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  activeDocument: null,
  activeChunks: [],
  isLoading: false,
  uploadProgress: 0,
  uploadStatus: null,
  isUploading: false,
  error: null,

  fetchDocuments: async (workspaceId: string) => {
    set({ isLoading: true });
    try {
      const docs = await documentService.getDocuments(workspaceId);
      set({ documents: docs, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchDocumentDetails: async (workspaceId: string, documentId: string) => {
    set({ isLoading: true });
    try {
      const docItem = await documentService.getDocumentById(workspaceId, documentId);
      if (docItem) {
        const chunks = await documentService.getChunksForDocument(workspaceId, documentId);
        set({ activeDocument: docItem, activeChunks: chunks, isLoading: false });
      } else {
        set({ activeDocument: null, activeChunks: [], isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  uploadDocument: async (file, workspaceId, collectionId, userId, userName) => {
    set({ isUploading: true, uploadProgress: 10, uploadStatus: 'uploading', error: null });
    try {
      const newDoc = await documentService.uploadDocument(
        file,
        workspaceId,
        collectionId,
        userId,
        userName,
        (progress) => set({ uploadProgress: progress }),
        (status) => set({ uploadStatus: status })
      );

      const docs = [newDoc, ...get().documents.filter(d => d.id !== newDoc.id)];
      set({ 
        documents: docs, 
        isUploading: false, 
        uploadProgress: 100, 
        uploadStatus: 'indexed' 
      });

      return newDoc;
    } catch (err: any) {
      set({ 
        isUploading: false, 
        uploadStatus: 'failed', 
        error: err.message || 'Document processing failed' 
      });
      throw err;
    }
  },

  deleteDocument: async (workspaceId, documentId) => {
    const docToDelete = get().documents.find(d => d.id === documentId);
    await documentService.deleteDocument(workspaceId, documentId, docToDelete?.storagePath);
    set({
      documents: get().documents.filter(d => d.id !== documentId),
      activeDocument: get().activeDocument?.id === documentId ? null : get().activeDocument,
    });
  },

  renameDocument: async (workspaceId, documentId, newName) => {
    await documentService.renameDocument(workspaceId, documentId, newName);
    set({
      documents: get().documents.map(d => d.id === documentId ? { ...d, name: newName } : d),
      activeDocument: get().activeDocument?.id === documentId ? { ...get().activeDocument!, name: newName } : get().activeDocument,
    });
  },

  moveDocument: async (workspaceId, documentId, collectionId) => {
    await documentService.moveDocument(workspaceId, documentId, collectionId);
    set({
      documents: get().documents.map(d => d.id === documentId ? { ...d, collectionId } : d),
      activeDocument: get().activeDocument?.id === documentId ? { ...get().activeDocument!, collectionId } : get().activeDocument,
    });
  },

  clearActiveDocument: () => set({ activeDocument: null, activeChunks: [] }),
}));

