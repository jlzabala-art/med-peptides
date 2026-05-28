import { Component } from 'react';

/**
 * AppErrorBoundary
 *
 * Top-level catch-all boundary. Prevents a complete white screen by showing
 * a branded recovery page when an uncaught error bubbles to the app root.
 *
 * Place this as the outermost wrapper in AppWrapper (index / main entry).
 * More granular boundaries (AdminTabErrorBoundary, etc.) handle section-level errors;
 * this one is the last line of defence.
 */
export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.handleReload = this.handleReload.bind(this);
    this.handleGoHome = this.handleGoHome.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[AppErrorBoundary] Unhandled render error:', error, info);
  }

  handleReload() {
    window.location.reload();
  }

  handleGoHome() {
    window.location.href = '/';
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#020e1c',
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '2rem',
        textAlign: 'center',
      }}>
        {/* Logo */}
        <div style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
          Med-<span style={{ color: 'var(--color-primary)' }}>Peptides</span>
        </div>

        {/* Icon */}
        <div style={{ fontSize: '3rem', margin: '1.5rem 0 1rem' }}>⚠️</div>

        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f1f5f9' }}>
          Something went wrong
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-tertiary)', margin: '0 0 2rem', maxWidth: '400px' }}>
          An unexpected error occurred. Your session and data are safe.
          Try reloading the page or returning to the home screen.
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={this.handleReload}
            style={{
              padding: '0.7rem 1.5rem',
              background: 'var(--color-primary)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            ↺ Reload page
          </button>
          <button
            onClick={this.handleGoHome}
            style={{
              padding: '0.7rem 1.5rem',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '10px',
              color: 'var(--color-border)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            ← Go to home
          </button>
        </div>

        {/* Dev detail */}
        {import.meta.env?.DEV && this.state.error && (
          <details style={{ marginTop: '2rem', maxWidth: '600px', textAlign: 'left' }}>
            <summary style={{ cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
              Error details (dev only)
            </summary>
            <pre style={{
              marginTop: '0.5rem',
              padding: '1rem',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '8px',
              fontSize: '0.72rem',
              color: 'var(--color-text-tertiary)',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {this.state.error.toString()}
            </pre>
          </details>
        )}
      </div>
    );
  }
}
