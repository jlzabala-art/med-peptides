import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useNavigationStore = create(
  persist(
    (set, get) => ({
      favorites: [],
      recents: [],
      expandedGroups: ['dashboard'],
      mobileOpen: false,

      toggleFavorite: (itemId) => set((state) => {
        const isFav = state.favorites.includes(itemId);
        if (isFav) {
          return { favorites: state.favorites.filter(id => id !== itemId) };
        } else {
          return { favorites: [...state.favorites, itemId] };
        }
      }),

      addRecent: (itemId) => set((state) => {
        const filtered = state.recents.filter(id => id !== itemId);
        return { recents: [itemId, ...filtered].slice(0, 5) }; // Keep last 5
      }),

      toggleGroup: (groupId) => set((state) => {
        const isExpanded = state.expandedGroups.includes(groupId);
        if (isExpanded) {
          return { expandedGroups: state.expandedGroups.filter(id => id !== groupId) };
        } else {
          return { expandedGroups: [...state.expandedGroups, groupId] };
        }
      }),
      
      setExpandedGroups: (groups) => set({ expandedGroups: groups }),
      
      toggleMobileOpen: () => set((state) => ({ mobileOpen: !state.mobileOpen })),
      setMobileOpen: (isOpen) => set({ mobileOpen: isOpen }),
    }),
    {
      name: 'atlas-navigation-storage',
    }
  )
);
