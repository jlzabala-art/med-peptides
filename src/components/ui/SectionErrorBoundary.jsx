'use client';
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class SectionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`[SectionErrorBoundary:${this.props.sectionName || 'Widget'}]`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          background: 'var(--bg-subtle, #fef2f2)',
          border: '1px solid var(--border-danger, #fecaca)',
          borderRadius: 10,
          padding: '14px 18px',
          margin: '8px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              background: '#fee2e2',
              color: '#dc2626',
              padding: 6,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#991b1b' }}>
                {this.props.title || `Unable to display ${this.props.sectionName || 'this section'}`}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#b91c1c', marginTop: 1 }}>
                {this.state.error?.message || 'An unexpected rendering error occurred in this module.'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={this.handleRetry}
            style={{
              padding: '6px 14px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: 7,
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
