import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import React from 'react';




/**
 * ProtocolErrorBoundary — FASE 3.3
 *
 * Catches render-phase errors from any descendant (Firestore, Firebase auth,
 * async data resolution issues surfaced via throw in effects, etc.).
 *
 * Props:
 *   onRetry   — optional callback to reset parent state and re-try the data fetch
 *   children  — wrapped subtree
 */
export default class ProtocolErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.handleRetry = this.handleRetry.bind(this);
  }

  // ── Lifecycle: catch render errors
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Production: replace with your error-reporting service (Sentry, etc.)
    console.error('[ProtocolErrorBoundary] Caught render error:', error, info);
  }

  handleRetry() {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const isPermissionError = this.state.error?.code === 'permission-denied';
    const isNetworkError    = this.state.error?.code === 'unavailable';

    const title = isPermissionError
      ? 'Access denied'
      : isNetworkError
      ? 'Network unavailable'
      : 'Something went wrong';

    const desc = isPermissionError
      ? 'You do not have permission to access protocol data. Please sign in and try again.'
      : isNetworkError
      ? 'Could not reach the server. Check your connection, then retry.'
      : 'An unexpected error occurred while loading your protocols. Retrying usually fixes it.';

    return (
      <div className="ph-error-boundary" role="alert" aria-live="assertive">
        <div className="ph-error-boundary__icon-wrap" aria-hidden="true">
          <AlertTriangle size={36} />
        </div>

        <h2 className="ph-error-boundary__title">{title}</h2>
        <p className="ph-error-boundary__desc">{desc}</p>

        {/* Dev hint: show error code in non-production */}
        {import.meta.env.DEV && this.state.error?.message && (
          <pre className="ph-error-boundary__code">
            {this.state.error.message}
          </pre>
        )}

        <div className="ph-error-boundary__actions">
          <button
            className="btn btn-primary ph-error-boundary__retry-btn"
            onClick={this.handleRetry}
          >
            <RefreshCw size={15} aria-hidden="true" />
            Try again
          </button>

          <a href="/" className="ph-error-boundary__back-link">
            <ArrowLeft size={14} aria-hidden="true" />
            Back to home
          </a>
        </div>
      </div>
    );
  }
}