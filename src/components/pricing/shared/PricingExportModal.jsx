'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Download, FileText, Printer, X } from 'lucide-react';

export default function PricingExportModal({
  isOpen,
  onClose,
  brandTitle = 'Colway UAE',
  filePrefix = 'Colway_UAE_Price_Schedule',
  products = [],
  currency = 'AED',
  fxRate = 1,
  markupPct = 15,
  canViewMaster = false,
  onPrint,
}) {
  const [exportTier, setExportTier] = useState(canViewMaster ? 'master' : 'clinic');

  if (!isOpen) return null;

  const handleExportCSV = (tier) => {
    onClose();
    const isMaster = tier === 'master' && canViewMaster;

    const headers = isMaster
      ? [
          '#',
          'SKU Code',
          'Product Name',
          'Subtitle',
          'Category',
          'Presentation',
          `Landed Cost CIF Dubai (${currency})`,
          `Wholesale B2B (+${markupPct}%) (${currency})`,
          `Wholesaler Margin (${currency})`,
          'Wholesaler Margin (%)',
          `Recommended Clinic Price (${currency})`,
          `Recommended Retail MSRP (${currency})`,
          'Key Bioactive Compounds',
          'Clinical Indication & Protocol',
          'Stock Status',
        ]
      : [
          '#',
          'SKU Code',
          'Product Name',
          'Subtitle',
          'Category',
          'Presentation',
          `Wholesale B2B Price (${currency})`,
          `Recommended Clinic Price (${currency})`,
          `Recommended Retail MSRP (${currency})`,
          'Key Bioactive Compounds',
          'Clinical Indication & Protocol',
          'Stock Status',
        ];

    const esc = (val) => `"${String(val || '').replace(/"/g, '""')}"`;

    const rows = products.map((p) => {
      const landed = (p.calculatedLanded * fxRate).toFixed(2);
      const wholesale = (p.calculatedWholesale * fxRate).toFixed(2);
      const margin = (p.calculatedMarginAed * fxRate).toFixed(2);
      const clinic = ((p.recommendedClinic ?? p.clinicPriceAed ?? 0) * fxRate).toFixed(2);
      const retail = ((p.recommendedRetail ?? p.retailPriceAed ?? 0) * fxRate).toFixed(2);

      if (isMaster) {
        return [
          p.itemNumber,
          p.sku,
          esc(p.name),
          esc(p.subtitle),
          esc(p.category),
          esc(p.volume),
          landed,
          wholesale,
          margin,
          `${p.calculatedMarginPct}%`,
          clinic,
          retail,
          esc(p.keyActives),
          esc(p.clinicalFocus),
          esc(p.stockStatus || 'In Stock (Dubai)'),
        ];
      }

      return [
        p.itemNumber,
        p.sku,
        esc(p.name),
        esc(p.subtitle),
        esc(p.category),
        esc(p.volume),
        wholesale,
        clinic,
        retail,
        esc(p.keyActives),
        esc(p.clinicalFocus),
        esc(p.stockStatus || 'In Stock (Dubai)'),
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `${filePrefix}_${isMaster ? 'Master_B2B' : 'Clinic_Catalog'}_${currency}_${markupPct}pct_${dateStr}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filename} successfully!`);
  };

  return (
    <div className="export-modal-overlay no-print" onClick={onClose}>
      <div className="export-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="export-modal-header">
          <div>
            <h3 className="export-modal-title">Export {brandTitle} Price Schedule</h3>
            <p className="export-modal-subtitle">
              Select the institutional format tailored to your commercial workflow
            </p>
          </div>
          <button type="button" onClick={onClose} className="export-close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="export-modal-body">
          <div className="export-card">
            <div className="export-card-icon-wrap pdf-icon-wrap">
              <FileText size={24} className="text-rose-600" />
            </div>
            <div className="export-card-content">
              <div className="export-card-tag text-rose-700 bg-rose-50 border border-rose-200">
                Documental / Institutional
              </div>
              <h4 className="export-card-title">Executive PDF & Print Dossier</h4>
              <p className="export-card-desc">
                Official A4 landscape schedule with dual branding, compliance stamps, full product breakdown, and commercial terms.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onPrint?.();
                }}
                className="export-primary-btn pdf-btn"
              >
                <Printer size={16} />
                <span>Print / Save as PDF (A4)</span>
              </button>
            </div>
          </div>

          <div className="export-card">
            <div className="export-card-icon-wrap excel-icon-wrap">
              <Download size={24} className="text-emerald-600" />
            </div>
            <div className="export-card-content">
              <div className="export-card-tag text-emerald-700 bg-emerald-50 border border-emerald-200">
                Operative / ERP & Spreadsheet
              </div>
              <h4 className="export-card-title">Procurement CSV & Excel Data Sheet</h4>
              <p className="export-card-desc">
                UTF-8 BOM computational spreadsheet formatted for Excel, Google Sheets, and Zoho Books.
              </p>

              <div className="export-tier-selector">
                {canViewMaster && (
                  <label className="tier-radio-option">
                    <input
                      type="radio"
                      name="exportTier"
                      value="master"
                      checked={exportTier === 'master'}
                      onChange={() => setExportTier('master')}
                    />
                    <span>
                      <strong>Wholesaler Master:</strong> Includes Landed CIF, Markup % and Net Margins
                    </span>
                  </label>
                )}
                <label className="tier-radio-option">
                  <input
                    type="radio"
                    name="exportTier"
                    value="clinic"
                    checked={exportTier === 'clinic'}
                    onChange={() => setExportTier('clinic')}
                  />
                  <span>
                    <strong>Clinic Catalog:</strong> Wholesale, Clinic & MSRP (Confidential landed costs hidden)
                  </span>
                </label>
              </div>

              <button
                type="button"
                onClick={() => handleExportCSV(exportTier)}
                className="export-primary-btn excel-btn"
              >
                <Download size={16} />
                <span>Download Spreadsheet (.csv)</span>
              </button>
            </div>
          </div>
        </div>

        <div className="export-modal-footer">
          <span className="export-footer-note">
            Active configuration: <strong>{currency}</strong> at <strong>+{markupPct}% markup</strong> ({products.length} items).
          </span>
          <button type="button" onClick={onClose} className="export-dismiss-btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
