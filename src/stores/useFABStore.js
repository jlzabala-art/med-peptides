import { create } from 'zustand';

export const useFABStore = create((set) => ({
  actions: [],
  theme: '#0f172a',
  icon: null,
  label: 'New Action',
  setFabConfig: (config) =>
    set({
      actions: config?.actions || [],
      theme: config?.theme || '#0f172a',
      icon: config?.icon || null,
      label: config?.label || 'New Action',
    }),
  clearFabConfig: () =>
    set({
      actions: [],
      theme: '#0f172a',
      icon: null,
      label: 'New Action',
    }),
}));
