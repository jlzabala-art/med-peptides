import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div style={{ 
          padding: '24px', 
          background: '#fef2f2', 
          border: '1px solid #fecaca', 
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          color: '#b91c1c',
          textAlign: 'center',
          margin: '1rem'
        }}>
          <AlertTriangle size={32} />
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Something went wrong</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#991b1b', maxWidth: '400px' }}>
            We've encountered an unexpected issue rendering this component. Our team has been notified.
          </p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ 
              marginTop: '8px',
              padding: '6px 16px',
              background: '#b91c1c',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
