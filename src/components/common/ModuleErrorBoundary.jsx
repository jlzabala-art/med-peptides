"use client";

import React from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import notifier from '../../services/NotificationService';

/**
 * ModuleErrorBoundary
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional Error Boundary component to isolate runtime faults and provide
 * quick 1-click self-healing options (Retry, Purge Local Storage Cache).
 */
export class ModuleErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`[ModuleErrorBoundary] Error in module "${this.props.moduleName || 'Unknown'}":`, error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handlePurgeCache = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      notifier.info('Local cache purged. Reloading module...');
      window.location.reload();
    } catch (e) {
      console.error('Failed to purge cache:', e);
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          backgroundColor: '#fff5f5',
          border: '1px solid #fed7d7',
          borderRadius: '12px',
          margin: '1rem 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#dc2626'
          }}>
            <AlertTriangle size={24} />
          </div>

          <div>
            <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem', fontWeight: 800, color: '#991b1b' }}>
              Module Encountered an Issue ({this.props.moduleName || 'Component'})
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#7f1d1d', maxWidth: '480px' }}>
              {this.state.error?.message || 'An unexpected rendering fault occurred while loading this view.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={this.handleRetry}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.5rem 1rem',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} /> Retry Loading
            </button>

            <button
              type="button"
              onClick={this.handlePurgeCache}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.5rem 1rem',
                backgroundColor: '#ffffff',
                color: '#7f1d1d',
                border: '1px solid #fca5a5',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <Trash2 size={14} /> Clear Cache & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ModuleErrorBoundary;
