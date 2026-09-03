"use client";

import React from 'react';
import { AlertTriangle, RefreshCw } from '@/lib/icons';

/**
 * WidgetErrorBoundary
 * ─────────────────────────────────────────────────────────────────────────────
 * Defensive UI boundary to prevent localized widget failures from breaking
 * full product and protocol page layouts.
 */
export class WidgetErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[WidgetErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 text-xs my-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />
            <span>{this.props.fallbackMessage || 'This interactive widget encountered a display issue.'}</span>
          </div>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
          >
            <RefreshCw size={12} />
            <span>Retry</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default WidgetErrorBoundary;
