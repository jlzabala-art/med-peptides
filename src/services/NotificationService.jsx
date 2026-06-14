import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import Info from "lucide-react/dist/esm/icons/info";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import React from 'react';
import { toast } from 'react-hot-toast';
import { createRoot } from 'react-dom/client';






/**
 * Reusable Notification Service for Atlas Health.
 * Provides consistent, non-blocking feedback to the user.
 */
class NotificationService {
  /**
   * Standard toast for success messages or simple non-blocking info.
   */
  toast(message, type = 'info') {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      default:
        toast(message, { icon: 'ℹ️' });
        break;
    }
  }

  success(message) {
    this.toast(message, 'success');
  }

  error(message) {
    this.toast(message, 'error');
  }

  info(message) {
    this.toast(message, 'info');
  }

  /**
   * Renders an inline notification element in a specific DOM node, or returns JSX
   * for React components to use directly.
   */
  Inline({ type = 'info', message, actions = [] }) {
    const bgColors = {
      info: '#eff6ff',
      warning: '#fefce8',
      error: '#fef2f2',
      success: '#f0fdf4'
    };
    const textColors = {
      info: '#1d4ed8',
      warning: '#854d0e',
      error: '#b91c1c',
      success: '#15803d'
    };

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        backgroundColor: bgColors[type],
        borderRadius: '8px',
        border: `1px solid ${textColors[type]}33`,
        gap: '1rem',
        marginTop: '0.5rem',
        marginBottom: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: textColors[type] }}>
          {type === 'info' && <Info size={18} />}
          {type === 'warning' && <AlertTriangle size={18} />}
          {type === 'error' && <XCircle size={18} />}
          {type === 'success' && <CheckCircle size={18} />}
          <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{message}</span>
        </div>
        {actions && actions.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {actions.map((act, i) => (
              <button
                key={i}
                onClick={act.onClick}
                style={{
                  background: 'none',
                  border: 'none',
                  color: textColors[type],
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {act.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  /**
   * For page-level issues. Returns JSX to be placed at the top of a page.
   */
  Banner({ message, type = 'warning' }) {
    return (
      <div style={{
        width: '100%',
        padding: '1rem',
        backgroundColor: type === 'warning' ? '#fefce8' : '#eff6ff',
        color: type === 'warning' ? '#854d0e' : '#1d4ed8',
        borderBottom: `1px solid ${type === 'warning' ? '#fef08a' : '#bfdbfe'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        fontWeight: 500,
        fontSize: '0.9rem'
      }}>
        {type === 'warning' ? <AlertTriangle size={18} /> : <Info size={18} />}
        {message}
      </div>
    );
  }

  /**
   * Strictly for critical, destructive actions (e.g. Delete, Data Loss).
   * Replaces window.confirm().
   */
  confirmCritical(message, onConfirm, onCancel = () => {}) {
    toast(
      (t) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '250px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b91c1c' }}>
            <AlertCircle size={20} />
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>Critical Action</span>
          </div>
          <span style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-main)' }}>{message}</span>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button 
              onClick={() => {
                toast.dismiss(t.id);
                if (onCancel) onCancel();
              }} 
              style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontWeight: 600 }}
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                toast.dismiss(t.id);
                onConfirm();
              }} 
              style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: 'none', background: '#dc2626', color: 'white', cursor: 'pointer', fontWeight: 600 }}
            >
              Confirm
            </button>
          </div>
        </div>
      ),
      { duration: Infinity, position: 'top-center' }
    );
  }
}

export const notifier = new NotificationService();
export default notifier;