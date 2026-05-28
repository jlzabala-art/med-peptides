 
import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

/* ─── Icon map per variant ─── */
const ICONS = {
  success: CheckCircle2,
  error:   XCircle,
  warning: AlertTriangle,
  info:    Info,
};

/**
 * Toast — FASE 4
 * Single toast pill. Rendered by ToastContainer.
 */
function Toast({ id, message, variant = 'info', exiting, onDismiss }) {
  const Icon = ICONS[variant] ?? Info;

  return (
    <div
      className={`toast toast--${variant}${exiting ? ' toast--exit' : ''}`}
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
    >
      <Icon size={16} className="toast__icon" aria-hidden="true" />
      <span className="toast__message">{message}</span>
      <button
        className="toast__close"
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}

/**
 * ToastContainer — FASE 4
 * Fixed overlay that stacks toasts bottom-right (desktop) / bottom-center (mobile).
 * Drop this once inside ProtocolHistory's JSX tree.
 */
export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="toast-container" aria-label="Notifications" role="region">
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

export default Toast;
