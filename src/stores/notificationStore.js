import { create } from 'zustand';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  
  setNotifications: (notifications, unreadCount) => set({ notifications, unreadCount }),
  
  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
  
  // Note: Firestore logic (markAsRead) should ideally be in a repository/service,
  // but for the sake of the store interface compatibility we expose basic updaters or we can keep the async actions here if preferred.
  // We will let the custom hook or the repository handle the db updates and then sync with the store.
}));
