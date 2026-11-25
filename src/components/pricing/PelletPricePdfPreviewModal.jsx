'use client';

import React from 'react';
import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal';
import { buildPelletsPriceSchedulePdfBlob } from '@/lib/pdf/pelletsPriceSchedulePdf';

export default function PelletPricePdfPreviewModal({
  isOpen,
  onClose,
  products = [],
  currency = 'EUR',
  currencySymbol = '€',
  formatPrice,
  lang = 'en',
}) {
  const isEs = lang === 'es';
  const downloadName = isEs
    ? `Atlas_European_Pharmacy_Tarifa_Pellets_${currency}.pdf`
    : `Atlas_European_Pharmacy_Pellets_Schedule_${currency}.pdf`;

  return (
    <DocumentPreviewModal
      isOpen={isOpen}
      onClose={onClose}
      printable={false}
      getPdfBlob={() =>
        buildPelletsPriceSchedulePdfBlob({
          products,
          currency,
          currencySymbol,
          formatPrice,
          isEs,
          documentRef: 'ATLAS-PELLETS-B2B-2026',
        })
      }
      downloadName={downloadName}
      title={isEs ? 'Pellets Hormonales EU GMP — Tarifa Oficial PDF' : 'EU GMP Hormone Pellets — Official Price Schedule PDF'}
      subtitle={`${products.length} SKUs · ${currency}`}
    />
  );
}
