"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Printer, FileText, Check, Loader2, Sparkles, Building2, Tag } from '@/lib/icons';
import {
  generatePharmapolisStickersPDF,
  generatePharmapolisA4SheetPNG,
  generatePharmapolisStickerPNG,
  extractLabelData,
  PHARMAPOLIS_SUPPLIER_INFO
} from '../../../services/pharmapolisLabelService';
import notifier from '../../../services/NotificationService';
import styles from './PatientLabelSheetModal.module.css';

export default function PatientLabelSheetModal({ isOpen, onClose, patient, prescriptions = [] }) {
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingPng, setLoadingPng] = useState(false);
  const [previewPngUrl, setPreviewPngUrl] = useState(null);
  const [activePrescriptions, setActivePrescriptions] = useState([]);
  const [bottleCounts, setBottleCounts] = useState({});

  useEffect(() => {
    if (isOpen && prescriptions.length > 0) {
      setActivePrescriptions(prescriptions);
      const initialCounts = {};
      prescriptions.forEach(rx => {
        // default bottle count if multiple bottles or 90-cap bottles
        const count = rx.bottles || rx.quantityBottles || (rx.volume === '270 capsules' ? 3 : 1);
        initialCounts[rx.id] = count;
      });
      setBottleCounts(initialCounts);
    }
  }, [isOpen, prescriptions]);

  // Generate real-time visual preview
  useEffect(() => {
    if (!isOpen || !patient || activePrescriptions.length === 0) return;

    let isMounted = true;
    const enrichedRxs = activePrescriptions.map(rx => ({
      ...rx,
      quantityBottles: bottleCounts[rx.id] || 1,
    }));

    generatePharmapolisA4SheetPNG(patient, enrichedRxs)
      .then(url => {
        if (isMounted) setPreviewPngUrl(url);
      })
      .catch(err => console.warn('Preview PNG generation failed:', err));

    return () => { isMounted = false; };
  }, [isOpen, patient, activePrescriptions, bottleCounts]);

  if (!isOpen) return null;

  const handleBottleCountChange = (rxId, count) => {
    setBottleCounts(prev => ({
      ...prev,
      [rxId]: Math.max(1, parseInt(count) || 1),
    }));
  };

  const handleDownloadPDF = async () => {
    setLoadingPdf(true);
    try {
      const enrichedRxs = activePrescriptions.map(rx => ({
        ...rx,
        quantityBottles: bottleCounts[rx.id] || 1,
      }));
      await generatePharmapolisStickersPDF(patient, enrichedRxs);
      notifier.success('Pharmapolis A4 Sticker Sheet PDF generated!');
    } catch (err) {
      console.error('PDF generation error:', err);
      notifier.error('Failed to generate PDF: ' + err.message);
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleDownloadPNG = async () => {
    setLoadingPng(true);
    try {
      const enrichedRxs = activePrescriptions.map(rx => ({
        ...rx,
        quantityBottles: bottleCounts[rx.id] || 1,
      }));
      const pngUrl = await generatePharmapolisA4SheetPNG(patient, enrichedRxs);
      
      const link = document.createElement('a');
      link.href = pngUrl;
      const patientSlug = (patient?.name || 'patient').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      link.download = `pharmapolis_stickers_${patientSlug}_a4.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      notifier.success('A4 Sticker Sheet PNG downloaded!');
    } catch (err) {
      console.error('PNG download error:', err);
      notifier.error('Failed to generate PNG: ' + err.message);
    } finally {
      setLoadingPng(false);
    }
  };

  const handlePrint = () => {
    if (!previewPngUrl) return;
    const printWin = window.open('', '_blank');
    printWin.document.write(`
      <html>
        <head>
          <title>Print Pharmapolis Stickers - ${patient?.name || 'Patient'}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              background-color: white;
            }
            img {
              width: 210mm;
              height: 297mm;
              object-fit: contain;
              display: block;
            }
          </style>
        </head>
        <body>
          <img src="${previewPngUrl}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWin.document.close();
  };

  const labels = extractLabelData(
    patient,
    activePrescriptions.map(rx => ({ ...rx, quantityBottles: bottleCounts[rx.id] || 1 }))
  );

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleGroup}>
            <div className={styles.iconBadge}>
              <Tag size={20} color="#0d9488" />
            </div>
            <div>
              <h2 className={styles.modalTitle}>
                Pharmapolis Prescription Stickers (7.5 × 4.5 cm)
              </h2>
              <p className={styles.modalSubtitle}>
                Standard A4 Sheet (210 × 297 mm) • Grouped for <strong>{patient?.name || 'Patient'}</strong> ({labels.length} sticker{labels.length === 1 ? '' : 's'})
              </p>
            </div>
          </div>

          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className={styles.modalBody}>
          {/* Left Column: Prescriptions & Settings */}
          <div className={styles.settingsColumn}>
            {/* Supplier Card */}
            <div className={styles.supplierCard}>
              <div className={styles.supplierIcon}>
                <Building2 size={16} color="#0284c7" />
              </div>
              <div className={styles.supplierInfo}>
                <span className={styles.supplierTitle}>{PHARMAPOLIS_SUPPLIER_INFO.name}</span>
                <span className={styles.supplierAddress}>{PHARMAPOLIS_SUPPLIER_INFO.address}</span>
                <span className={styles.supplierBadge}>Authorized Compounding Supplier</span>
              </div>
            </div>

            {/* Prescriptions List with Bottle Multiplier */}
            <div className={styles.rxSection}>
              <h3 className={styles.sectionHeading}>Included Prescriptions & Quantities</h3>
              {activePrescriptions.length === 0 ? (
                <p className={styles.emptyText}>No prescriptions found for this patient.</p>
              ) : (
                <div className={styles.rxList}>
                  {activePrescriptions.map((rx, idx) => {
                    const count = bottleCounts[rx.id] || 1;
                    return (
                      <div key={rx.id || idx} className={styles.rxCard}>
                        <div className={styles.rxCardHeader}>
                          <span className={styles.rxName}>{rx.name || rx.title || 'Compounded Formula'}</span>
                          <span className={styles.rxId}>{rx.id?.slice(0, 10)}</span>
                        </div>
                        <p className={styles.rxDirections}>{rx.instructions || rx.directions || 'As directed'}</p>
                        <div className={styles.rxFooter}>
                          <span className={styles.rxVolume}>{rx.volume || rx.quantity || 'Standard'}</span>
                          <div className={styles.quantityPicker}>
                            <label>Stickers / Vials:</label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={count}
                              onChange={e => handleBottleCountChange(rx.id, e.target.value)}
                              className={styles.countInput}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Technical Specs Notice */}
            <div className={styles.specsNotice}>
              <strong>Layout Standard:</strong>
              <ul>
                <li>Individual Sticker: <strong>75 mm × 45 mm (7.5 × 4.5 cm)</strong></li>
                <li>Page Size: <strong>A4 Portrait (210 × 297 mm)</strong></li>
                <li>Grid: <strong>2 Columns × 5 Rows (Up to 10 stickers/page)</strong></li>
                <li>Resolution: <strong>300 DPI (PDF Vector / PNG Raster)</strong></li>
              </ul>
            </div>
          </div>

          {/* Right Column: Sheet Live Preview */}
          <div className={styles.previewColumn}>
            <div className={styles.previewHeader}>
              <span>A4 Sheet Live Preview</span>
              <span className={styles.previewBadge}>210 × 297 mm</span>
            </div>

            <div className={styles.sheetContainer}>
              {previewPngUrl ? (
                <img
                  src={previewPngUrl}
                  alt="A4 Sticker Sheet Preview"
                  className={styles.sheetImage}
                />
              ) : (
                <div className={styles.previewSkeleton}>
                  <Loader2 size={32} className={styles.spinner} />
                  <span>Rendering A4 Sheet Preview…</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={styles.modalFooter}>
          <div className={styles.footerLeft}>
            <span className={styles.countSummary}>
              Total Stickers on Sheet: <strong>{labels.length} / 10</strong>
            </span>
          </div>

          <div className={styles.footerActions}>
            <button
              onClick={handlePrint}
              disabled={!previewPngUrl}
              className="gcp-btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Printer size={15} /> Print Sheet
            </button>

            <button
              onClick={handleDownloadPNG}
              disabled={loadingPng || !previewPngUrl}
              className="gcp-btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              {loadingPng ? <Loader2 size={15} className={styles.spinner} /> : <Download size={15} />}
              Download PNG
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={loadingPdf}
              className="gcp-btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#0d9488', borderColor: '#0d9488' }}
            >
              {loadingPdf ? <Loader2 size={15} className={styles.spinner} /> : <FileText size={15} />}
              Download A4 PDF (Vector)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
