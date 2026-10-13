'use client';

import React from 'react';
import EmptyState from '@/components/ui/EmptyState';
import { AlertCircle } from '@/lib/icons';

export default class LabelsErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('LabelsErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const isEs = this.props.isEs;
      return (
        <div style={{ padding: '40px 20px', maxWidth: 600, margin: '0 auto' }}>
          <EmptyState
            icon={AlertCircle}
            title={isEs ? 'Error al renderizar la etiqueta' : 'Label rendering failed'}
            subtitle={
              isEs
                ? 'Los datos de la prescripción o formulación pueden estar incompletos. Intenta recargar o seleccionar otro paciente.'
                : 'The prescription or formulation data may be incomplete or corrupted. Try reloading or picking another patient.'
            }
            action={{
              label: isEs ? 'Reintentar renderizado' : 'Retry rendering',
              onClick: this.resetError
            }}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
