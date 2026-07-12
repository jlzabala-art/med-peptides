import { create } from 'zustand';

export const useHeaderStore = create((set) => ({
  headerContent: null,
  setHeader: (content) => set({ headerContent: content }),
  clearHeader: () => set({ headerContent: null }),
}));
