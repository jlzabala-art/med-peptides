import { create } from 'zustand';

/**
 * Global UI Event Bus
 * This store manages global UI state (like opening the cart, showing toasts, etc.)
 * WITHOUT holding any React components in memory.
 * Any app (e.g., DoctorApp, PublicApp) can trigger these actions safely without 
 * importing the actual UI components, preserving Code-Splitting.
 */
export const useGlobalUIStore = create((set) => ({
  // Cart state
  isCartOpen: false,
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

  // Toast / Notifications state
  toastMessage: null,
  toastType: 'info', // 'info', 'success', 'error', 'warning'
  showToast: (message, type = 'info') => set({ toastMessage: message, toastType: type }),
  hideToast: () => set({ toastMessage: null }),

  // Mobile navigation state
  isMobileNavOpen: false,
  toggleMobileNav: () => set((state) => ({ isMobileNavOpen: !state.isMobileNavOpen })),
  closeMobileNav: () => set({ isMobileNavOpen: false }),
}));
