'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const DocumentPreviewModal = dynamic(
  () => import('@/components/ui/DocumentPreviewModal'),
  { ssr: false }
);

const PdfPreviewContext = createContext({
  openPdfPreview: () => {},
  closePdfPreview: () => {},
});

export function PdfPreviewProvider({ children }) {
  const [state, setState] = useState({
    isOpen: false,
    title: 'Document Preview',
    subtitle: '',
    downloadName: 'atlas-document.pdf',
    fileUrl: null,
    pdfBlob: null,
    getPdfBlob: null,
    printable: true,
  });

  const openPdfPreview = useCallback((options = {}) => {
    setState({
      isOpen: true,
      title: options.title || 'Document Preview',
      subtitle: options.subtitle || '',
      downloadName: options.downloadName || 'atlas-document.pdf',
      fileUrl: options.fileUrl || null,
      pdfBlob: options.pdfBlob || null,
      getPdfBlob: options.getPdfBlob || null,
      printable: options.printable !== false,
    });
  }, []);

  const closePdfPreview = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOpen: false,
      pdfBlob: null,
      getPdfBlob: null,
      fileUrl: null,
    }));
  }, []);

  // Global event bridge so non-React PDF utilities can always trigger preview-first
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    window.__atlasPdfPreviewAvailable = true;
    const handleEvent = (e) => {
      if (e?.detail) {
        openPdfPreview(e.detail);
      }
    };
    window.addEventListener('atlas-open-pdf-preview', handleEvent);
    return () => {
      window.__atlasPdfPreviewAvailable = false;
      window.removeEventListener('atlas-open-pdf-preview', handleEvent);
    };
  }, [openPdfPreview]);

  return (
    <PdfPreviewContext.Provider value={{ openPdfPreview, closePdfPreview }}>
      {children}
      <DocumentPreviewModal
        isOpen={state.isOpen}
        onClose={closePdfPreview}
        title={state.title}
        subtitle={state.subtitle}
        downloadName={state.downloadName}
        fileUrl={state.fileUrl}
        pdfBlob={state.pdfBlob}
        getPdfBlob={state.getPdfBlob}
        printable={state.printable}
      />
    </PdfPreviewContext.Provider>
  );
}

export function usePdfPreview() {
  return useContext(PdfPreviewContext);
}
