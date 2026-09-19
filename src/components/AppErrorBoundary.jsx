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
    this.state = { hasError: false, error: null, isProfessional: false, role: null };
    this.handleReload = this.handleReload.bind(this);
    this.handleGoHome = this.handleGoHome.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidMount() {
    this.checkProfessionalAuth();
  }

  checkProfessionalAuth() {
    if (typeof window !== 'undefined') {
      try {
        const authRaw = localStorage.getItem('auth_user') || localStorage.getItem('atlas_auth_user');
        const user = authRaw ? JSON.parse(authRaw) : null;
        const role = user?.role || '';
        const isProfessional = ['doctor', 'admin', 'clinic', 'wholesaler', 'wholeseller', 'supplier', 'pharmacy'].includes(role);
        this.setState({ isProfessional, role });
      } catch {
        this.setState({ isProfessional: false, role: null });
      }
    }
  }

  componentDidCatch(error, info) {
    if (typeof window !== 'undefined') {
      window.__LAST_ERROR__ = {
        message: error?.message,
        stack: error?.stack,
        componentStack: info?.componentStack
      };

      // Auto-recover from deployment ChunkLoadError (when a new build replaces chunks)
      if (
        error?.name === 'ChunkLoadError' ||
        error?.message?.includes('Loading chunk') ||
        error?.message?.includes('Failed to fetch dynamically imported module')
      ) {
        const lastReload = sessionStorage.getItem('chunk_reload_ts');
        const now = Date.now();
        if (!lastReload || now - Number(lastReload) > 10000) {
          sessionStorage.setItem('chunk_reload_ts', String(now));
          window.location.reload();
          return;
        }
      }
    }
    console.error('[AppErrorBoundary] Unhandled render error:', error, info);
  }

  handleReload() {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }

  handleGoHome() {
    if (typeof window !== 'undefined') {
      try {
        const authRaw = localStorage.getItem('auth_user') || localStorage.getItem('atlas_auth_user');
        const user = authRaw ? JSON.parse(authRaw) : null;
        const role = user?.role || '';
        const isProfessional = ['doctor', 'admin', 'clinic', 'wholesaler', 'wholeseller', 'supplier', 'pharmacy'].includes(role);
        
        if (isProfessional) {
          window.location.href = role === 'admin' ? '/admin' : `/${role}`;
        } else {
          // Public visitor: strictly prevent navigation to root storefront. Direct to professional login.
          window.location.href = '/auth/login';
        }
      } catch {
        window.location.href = '/auth/login';
      }
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const { isProfessional, role } = this.state;

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
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-tertiary)', margin: '0 0 2rem', maxWidth: '440px', lineHeight: 1.5 }}>
          An unexpected error occurred while loading this view.
          {isProfessional 
            ? ' You can reload the page or return to your professional workspace.' 
            : ' Please reload the page or authenticate via the professional portal.'}
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
            {isProfessional ? `← Go to ${role === 'admin' ? 'Admin' : 'Dashboard'}` : '🔐 Professional Access'}
          </button>
        </div>

        {/* Dev detail */}
        {process.env.NODE_ENV !== 'production' && this.state.error && (
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
