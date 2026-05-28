import { Component } from 'react';

/**
 * AdminTabErrorBoundary
 *
 * Wraps any lazy-loaded admin / doctor / wholesaler tab content so that
 * a runtime crash in one tab does NOT blank the entire dashboard.
 *
 * Features:
 *  - Shows an inline error card (not full-page) with tab name
 *  - "Retry" button resets the boundary and remounts the tab
 *  - Shows error details in a collapsible section (dev) or hidden (prod)
 *  - Logs to console.error in all environments
 *
 * Usage:
 *   <AdminTabErrorBoundary tabId="users" tabLabel="User Management">
 *     <Suspense fallback={<TabLoader />}>
 *       <LazyAdminTab />
 *     </Suspense>
 *   </AdminTabErrorBoundary>
 */
export default class AdminTabErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetail: false };
    this.handleRetry = this.handleRetry.bind(this);
    this.toggleDetail = this.toggleDetail.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    const { tabId = 'unknown', tabLabel = 'Tab' } = this.props;
    console.error(
      `[AdminTabErrorBoundary] Tab "${tabLabel}" (${tabId}) crashed:`,
      error,
      errorInfo
    );
    this.setState({ errorInfo });

    // Call parent onError if provided (for analytics, Sentry, etc.)
    if (typeof this.props.onError === 'function') {
      this.props.onError(error, errorInfo, tabId);
    }
  }

  handleRetry() {
    this.setState({ hasError: false, error: null, errorInfo: null, showDetail: false });
  }

  toggleDetail() {
    this.setState((s) => ({ showDetail: !s.showDetail }));
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { tabLabel = 'This section', error, errorInfo, showDetail } = this.state;
    const isDev = import.meta.env?.DEV;

    return (
      <div
        style={{
          margin: '2rem auto',
          maxWidth: '560px',
          padding: '2rem',
          background: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-body, system-ui, sans-serif)',
        }}
      >
        {/* Icon + Title */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}
        >
          <span style={{ fontSize: '1.5rem' }}>⚠️</span>
          <div>
            <div
              style={{ fontWeight: 700, color: 'var(--color-error, #ef4444)', fontSize: '1rem' }}
            >
              {tabLabel} failed to load
            </div>
            <div
              style={{
                fontSize: '0.8rem',
                color: 'var(--color-muted, #64748b)',
                marginTop: '0.2rem',
              }}
            >
              An unexpected error occurred in this section.
            </div>
          </div>
        </div>

        {/* Retry button */}
        <button
          onClick={this.handleRetry}
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem 1.25rem',
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-error, #ef4444)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.target.style.background = 'rgba(239,68,68,0.2)')}
          onMouseLeave={(e) => (e.target.style.background = 'rgba(239,68,68,0.12)')}
        >
          ↺ Retry
        </button>

        {/* Dev-only error detail */}
        {isDev && error && (
          <div style={{ marginTop: '1rem' }}>
            <button
              onClick={this.toggleDetail}
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-muted, #94a3b8)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {showDetail ? '▲ Hide' : '▼ Show'} error details
            </button>
            {showDetail && (
              <pre
                style={{
                  marginTop: '0.5rem',
                  padding: '0.75rem',
                  background: 'rgba(0,0,0,0.08)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.72rem',
                  color: 'var(--color-muted, #475569)',
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {error.toString()}
                {errorInfo?.componentStack && '\n\nComponent Stack:' + errorInfo.componentStack}
              </pre>
            )}
          </div>
        )}
      </div>
    );
  }
}
