/**
 * NotificationContext.jsx — Thin compatibility wrapper over Zustand notificationStore.
 * Todos los imports existentes `useNotifications` siguen funcionando sin cambios.
 * NotificationProvider activa el listener real (onSnapshot) una sola vez en el árbol.
 * La lógica de Firestore vive en src/hooks/useNotificationListener.js.
 */
import { useNotificationStore } from '../stores/notificationStore';
import { useNotificationListener } from '../hooks/useNotificationListener';

export function useNotifications() {
  const { notifications, unreadCount } = useNotificationStore();
  const { markAsRead, markAllAsRead } = useNotificationListener();
  return { notifications, unreadCount, markAsRead, markAllAsRead };
}

// Provider que activa el listener; mantiene compat con árbol existente
export function NotificationProvider({ children }) {
  // Hook activa el onSnapshot subscription y sincroniza con el store
  useNotificationListener();
  return children;
}
