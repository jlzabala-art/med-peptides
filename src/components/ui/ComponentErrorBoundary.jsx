'use client';

import React from 'react';
import EmptyState from './EmptyState';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * ComponentErrorBoundary
 * ─────────────────────────────────────────────────────────────────────────────
 * GCP-inspired localized React Error Boundary that prevents uncaught rendering
 * crashes in large data tables, visual cards, and dashboards from crashing the
 * entire application shell.
 *
 * Usage:
 *   <ComponentErrorBoundary title="Unable to render product catalog">
 *     <ProductsTable ... />
 *   </ComponentErrorBoundary>
 */
export default class ComponentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ComponentErrorBoundary] Caught component error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{ padding: '1rem', width: '100%' }}>
          <EmptyState
            icon={AlertTriangle}
            title={this.props.title || 'Component Error'}
            subtitle={
              this.props.subtitle ||
              'A rendering issue occurred in this section. You can try refreshing or contact support.'
            }
            action={{
              label: 'Retry Component',
              icon: RefreshCw,
              onClick: this.handleRetry,
            }}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
