import React from 'react';

class CatalogErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Catalog Table/Row Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '1rem',
          margin: '0.5rem 0',
          backgroundColor: '#fef2f2',
          border: '1px solid #fca5a5',
          borderRadius: '8px',
          color: '#ef4444',
          fontSize: '0.85rem'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 600 }}>Something went wrong loading this item</h4>
          <p style={{ margin: 0 }}>{this.state.error?.message || 'Unknown render error'}</p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: '0.5rem',
              padding: '0.25rem 0.5rem',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.75rem'
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

export default CatalogErrorBoundary;
