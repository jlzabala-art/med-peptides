import React from 'react';
import { AlertTriangle, RefreshCw } from '@/lib/icons';

class ProtocolErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ProtocolErrorBoundary] Caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '1rem 1.25rem',
          margin: '0.5rem 0',
          backgroundColor: '#fff1f2',
          border: '1px solid #fecdd3',
          borderRadius: '8px',
          color: '#be123c',
          fontSize: '0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
            <AlertTriangle size={16} color="#e11d48" />
            <span>Unable to display protocol clinical architecture</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#9f1239' }}>
            {this.state.error?.message || 'An unexpected rendering error occurred in this protocol module.'}
          </p>
          <div>
            <button 
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '0.3rem 0.65rem',
                backgroundColor: '#e11d48',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            >
              <RefreshCw size={12} />
              <span>Retry Render</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ProtocolErrorBoundary;
