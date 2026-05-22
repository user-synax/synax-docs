import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export const useDocumentStore = create(
  immer((set, get) => ({
    documents: [],
    isLoading: false,
    searchQuery: '',

    setSearchQuery: (query) => {
      set((state) => {
        state.searchQuery = query;
      });
    },

    fetchDocuments: async (filters = {}) => {
      set((state) => {
        state.isLoading = true;
      });
      try {
        const params = new URLSearchParams();
        if (get().searchQuery) params.append('q', get().searchQuery);
        if (filters.starred) params.append('starred', 'true');
        if (filters.trash) params.append('trash', 'true');

        const response = await fetch(`/api/documents?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch documents');
        
        const data = await response.json();
        set((state) => {
          state.documents = data;
          state.isLoading = false;
        });
      } catch (error) {
        console.error('Error fetching documents:', error);
        set((state) => {
          state.isLoading = false;
        });
      }
    },

    createDocument: async () => {
      try {
        const response = await fetch('/api/documents', {
          method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to create document');
        const { id } = await response.json();
        return id;
      } catch (error) {
        console.error('Error creating document:', error);
      }
    },

    deleteDocument: async (id, permanent = false) => {
      // Optimistic update
      const previousDocs = get().documents;
      set((state) => {
        state.documents = state.documents.filter((doc) => doc._id !== id);
      });

      try {
        const response = await fetch(`/api/documents/${id}${permanent ? '?permanent=true' : ''}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete document');
      } catch (error) {
        console.error('Error deleting document:', error);
        // Rollback on error
        set((state) => {
          state.documents = previousDocs;
        });
      }
    },

    starDocument: async (id) => {
      // Optimistic update
      const docIndex = get().documents.findIndex((d) => d._id === id);
      if (docIndex === -1) return;

      const previousStarred = get().documents[docIndex].isStarred;
      set((state) => {
        state.documents[docIndex].isStarred = !previousStarred;
      });

      try {
        const response = await fetch(`/api/documents/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isStarred: !previousStarred }),
        });
        if (!response.ok) throw new Error('Failed to star document');
      } catch (error) {
        console.error('Error starring document:', error);
        // Rollback
        set((state) => {
          state.documents[docIndex].isStarred = previousStarred;
        });
      }
    },

    renameDocument: async (id, title) => {
      set((state) => {
        const doc = state.documents.find((d) => d._id === id);
        if (doc) doc.title = title;
      });

      try {
        const response = await fetch(`/api/documents/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title }),
        });
        if (!response.ok) throw new Error('Failed to rename document');
      } catch (error) {
        console.error('Error renaming document:', error);
      }
    },

    restoreDocument: async (id) => {
      set((state) => {
        state.documents = state.documents.filter((doc) => doc._id !== id);
      });

      try {
        const response = await fetch(`/api/documents/${id}/restore`, {
          method: 'PATCH',
        });
        if (!response.ok) throw new Error('Failed to restore document');
      } catch (error) {
        console.error('Error restoring document:', error);
      }
    },
  }))
);
