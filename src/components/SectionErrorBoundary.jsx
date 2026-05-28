 
import { Component } from 'react';

/**
 * SectionErrorBoundary
 * Wraps individual home sections so that a runtime error in one section
 * doesn't cascade and blank the entire page.
 */
export default class SectionErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error(`[SectionErrorBoundary] Section "${this.props.sectionId}" crashed:`, error, info);
  }

  render() {
    if (this.state.hasError) {
      // Render nothing visible — the section simply disappears gracefully
      return null;
    }
    return this.props.children;
  }
}
