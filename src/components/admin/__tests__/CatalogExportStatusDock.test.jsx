import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CatalogExportStatusDock from '../catalog/CatalogExportStatusDock';

describe('CatalogExportStatusDock', () => {
  it('returns null when status is null', () => {
    const { container } = render(<CatalogExportStatusDock status={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders loading state with title, variants count, and progress bar', () => {
    const status = {
      id: 'lotusland-pdf',
      type: 'pdf',
      title: 'Lotusland / RegenPept Catalog (PDF)',
      variantCount: 104,
      markupPercent: 20,
      state: 'loading',
      stepMessage: 'Compiling 104 variants & generating high-resolution PDF pages…',
      resultUrl: null,
      errorMessage: null,
    };

    render(<CatalogExportStatusDock status={status} onDismiss={vi.fn()} />);

    expect(screen.getByText('Lotusland / RegenPept Catalog (PDF)')).toBeDefined();
    expect(screen.getByText('104 variants')).toBeDefined();
    expect(screen.getByText('EXW +20%')).toBeDefined();
    expect(screen.getByText('Compiling 104 variants & generating high-resolution PDF pages…')).toBeDefined();
  });

  it('renders success state for PDF with Open PDF button', () => {
    const onDismiss = vi.fn();
    const status = {
      id: 'lotusland-pdf',
      type: 'pdf',
      title: 'Lotusland / RegenPept Catalog (PDF)',
      variantCount: 104,
      markupPercent: 20,
      state: 'success',
      stepMessage: 'PDF document generated and ready to download.',
      resultUrl: 'https://storage.googleapis.com/test-bucket/lotusland.pdf',
      errorMessage: null,
    };

    render(<CatalogExportStatusDock status={status} onDismiss={onDismiss} />);

    expect(screen.getByText('Open PDF Catalog')).toBeDefined();
    expect(screen.getByText('Done')).toBeDefined();

    fireEvent.click(screen.getByText('Done'));
    expect(onDismiss).toHaveBeenCalled();
  });

  it('renders success state for Web Share with Open Shared Portfolio and Copy Link buttons', () => {
    const status = {
      id: 'lotusland-web',
      type: 'web',
      title: 'Lotusland / RegenPept Web Share',
      variantCount: 104,
      markupPercent: 20,
      state: 'success',
      stepMessage: 'Interactive Web Share link is active.',
      resultUrl: 'https://med-peptides.com/shared/catalog/test-token',
      errorMessage: null,
    };

    render(<CatalogExportStatusDock status={status} onDismiss={vi.fn()} />);

    expect(screen.getByText('Open Shared Portfolio')).toBeDefined();
    expect(screen.getByText('Copy Link')).toBeDefined();
  });

  it('renders error state with error message', () => {
    const status = {
      id: 'lotusland-pdf',
      type: 'pdf',
      title: 'Lotusland / RegenPept Catalog (PDF)',
      variantCount: 104,
      markupPercent: 20,
      state: 'error',
      resultUrl: null,
      errorMessage: 'PDF generation timed out. Please try again.',
    };

    render(<CatalogExportStatusDock status={status} onDismiss={vi.fn()} />);

    expect(screen.getByText('PDF generation timed out. Please try again.')).toBeDefined();
  });
});
