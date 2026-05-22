import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export const useEditorStore = create(
  immer((set) => ({
    documentId: null,
    title: "",
    saveStatus: "idle",
    wordCount: 0,
    characterCount: 0,

    setDocument: (id, title) => {
      set((state) => {
        state.documentId = id;
        state.title = title;
      });
    },

    setTitle: (title) => {
      set((state) => {
        state.title = title;
      });
    },

    setSaveStatus: (status) => {
      set((state) => {
        state.saveStatus = status;
      });
    },

    updateCounts: (words, chars) => {
      set((state) => {
        state.wordCount = words;
        state.characterCount = chars;
      });
    },
  }))
);
