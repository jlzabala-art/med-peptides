'use client';

import React, { useState, useMemo } from 'react';
import StandardDrawer from '@/components/ui/StandardDrawer';
import { EXPORT_CATALOGUES } from '@/config/exportCatalogues';
import { exportCatalogToXlsx } from '@/utils/exportCatalogToXlsx';
import { exportCatalogToCsv } from '@/utils/exportCatalogToExcel';
import { FileText, Globe, FileSpreadsheet, Loader, Check, ExternalLink, ShieldCheck, Warehouse, Sparkles } from '@/lib/icons';

export default function UnifiedExportDrawer({
  isOpen,
  onClose,
  initialCatalogueId = 'regenpept',
  onGeneratePDF,
  onGenerateWebShare,
  actionLoading,
  toast,
}) {
  const [selectedCatId, setSelectedCatId] = useState(initialCatalogueId);
  const [markupPercent, setMarkupPercent] = useState(0);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [recipientName, setRecipientName] = useState('');
  const [lastGeneratedShareUrl, setLastGeneratedShareUrl] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const activeCatalogue = useMemo(() => {
    return EXPORT_CATALOGUES.find(c => c.id === selectedCatId) || EXPORT_CATALOGUES[0];
  }, [selectedCatId]);

  // Adjust currency when catalogue changes
  const handleSelectCatalogue = (cat) => {
    setSelectedCatId(cat.id);
    setSelectedCurrency(cat.defaultCurrency || 'USD');
    setLastGeneratedShareUrl(null);
  };

  // PDF Action
  const handleExportPDF = () => {
    if (onGeneratePDF) {
      onGeneratePDF(activeCatalogue.supplierId, activeCatalogue.brandName, `${activeCatalogue.id}-pdf`, {
        catalogueFilter: activeCatalogue.catalogueFilter,
        currency: selectedCurrency,
        priceMarkupPercent: markupPercent,
        recipientName: recipientName.trim() || undefined
      });
    }
  };

  // Web Share Action
  const handleExportWeb = async () => {
    if (onGenerateWebShare) {
      try {
        const res = await onGenerateWebShare(activeCatalogue.supplierId, activeCatalogue.brandName, `${activeCatalogue.id}-web`, {
          catalogueFilter: activeCatalogue.catalogueFilter,
          currency: selectedCurrency,
          priceMarkupPercent: markupPercent,
          recipientName: recipientName.trim() || undefined
        });
        if (res && res.shareableUrl) {
          setLastGeneratedShareUrl(res.shareableUrl);
        }
      } catch (err) {
        // Handled in parent toast
      }
    }
  };

  // Excel (.xlsx) Action
  const handleExportExcel = async () => {
    try {
      setIsExportingExcel(true);
      toast?.info?.('📊 Generating structured Excel workbook…');

      // Fetch items for this catalogue
      const res = await fetch('/api/catalog/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: activeCatalogue.supplierId,
          catalogueFilter: activeCatalogue.catalogueFilter,
          currency: selectedCurrency,
          markupPercent
        })
      });

      let items = [];
      if (res.ok) {
        const data = await res.json();
        items = data.items || [];
      }

      // Fallback: if export API doesn't exist, trigger CSV export
      if (!items || items.length === 0) {
        toast?.error?.('Could not fetch items for Excel export. Downloading CSV as fallback.');
        exportCatalogToCsv({
          items: [],
          currency: selectedCurrency,
          filename: `${activeCatalogue.id}_catalog_${selectedCurrency}.csv`
        });
        return;
      }

      exportCatalogToXlsx({
        items,
        catalogueTitle: `${activeCatalogue.brandName} Catalogue`,
        brandName: activeCatalogue.brandName,
        supplierName: activeCatalogue.brandName,
        warehouse: activeCatalogue.warehouse,
        currency: selectedCurrency,
        incoterm: 'EXW',
        markupPercent,
        recipientName: recipientName.trim() || 'Valued Partner / Clinic',
        filename: `${activeCatalogue.id}_catalogue_${selectedCurrency}_${Date.now().toString(36)}.xlsx`
      });

      toast?.success?.('✅ Excel (.xlsx) catalogue exported successfully!');
    } catch (err) {
      console.error('[handleExportExcel]', err);
      toast?.error?.(`❌ Excel export failed: ${err.message}`);
    } finally {
      setIsExportingExcel(false);
    }
  };

  const copyToClipboard = () => {
    if (!lastGeneratedShareUrl) return;
    navigator.clipboard.writeText(lastGeneratedShareUrl);
    setCopiedLink(true);
    toast?.success?.('📋 Web Share link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <StandardDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Commercial Catalogue Exporter"
      subtitle="Export professional branded price lists, Excel workbooks, or interactive client links"
      width="560px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>
        
        {/* 1. Catalogue Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            1. Select Portfolio / Brand
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem' }}>
            {EXPORT_CATALOGUES.map(cat => {
              const isSelected = cat.id === selectedCatId;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCatalogue(cat)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                    padding: '0.75rem', borderRadius: '10px',
                    border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                    backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>{cat.flag}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isSelected ? '#0369a1' : '#1e293b' }}>
                    {cat.brandName}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem', lineHeight: '1.2' }}>
                    {cat.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Margin / Pricing Tier */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              2. Margin on Cost ({markupPercent === 0 ? '0% Master Cost' : `+${markupPercent}%`})
            </label>
            <span style={{ fontSize: '0.75rem', color: markupPercent === 0 ? '#16a34a' : '#0284c7', fontWeight: 600 }}>
              {markupPercent === 0 ? '✓ Internal / Transfer Cost (No markup)' : `Commercial Price List (+${markupPercent}%)`}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {[0, 15, 20, 25, 30, 40].map(pct => {
              const isSel = markupPercent === pct;
              return (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setMarkupPercent(pct)}
                  style={{
                    padding: '0.45rem 0.85rem',
                    minHeight: '44px',
                    minWidth: '54px',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    border: isSel ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                    backgroundColor: isSel ? '#0284c7' : '#f8fafc',
                    color: isSel ? '#ffffff' : '#334155',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {pct === 0 ? '0% Cost' : `+${pct}%`}
                </button>
              );
            })}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }}>
              <input
                type="number"
                min="0"
                max="100"
                value={markupPercent}
                onChange={e => setMarkupPercent(Math.max(0, parseInt(e.target.value, 10) || 0))}
                style={{
                  width: '60px', padding: '0.35rem 0.5rem', borderRadius: '6px',
                  border: '1px solid #cbd5e1', fontSize: '0.82rem', textAlign: 'center'
                }}
              />
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>%</span>
            </div>
          </div>
        </div>

        {/* 3. Currency & Recipient */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Currency
            </label>
            <select
              value={selectedCurrency}
              onChange={e => setSelectedCurrency(e.target.value)}
              style={{
                width: '100%', padding: '0.45rem 0.6rem', borderRadius: '6px',
                border: '1px solid #cbd5e1', fontSize: '0.85rem', backgroundColor: '#ffffff', color: '#1e293b'
              }}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="AED">AED (AED)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Prepared For (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Dr. Carlos Méndez / Swiss Longevity"
              value={recipientName}
              onChange={e => setRecipientName(e.target.value)}
              style={{
                width: '100%', padding: '0.45rem 0.75rem', borderRadius: '6px',
                border: '1px solid #cbd5e1', fontSize: '0.85rem'
              }}
            />
          </div>
        </div>

        {/* 4. Live Metadata Summary Card */}
        <div style={{
          backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0',
          padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#1e293b', fontWeight: 600 }}>
            <Warehouse size={15} color="#0284c7" />
            <span>Dispatch Origin: <strong>{activeCatalogue.warehouse}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#1e293b', fontWeight: 600 }}>
            <ShieldCheck size={15} color="#16a34a" />
            <span>Commercial Terms: <strong>Ex-Works (EXW) · Full Temperature Traceability</strong></span>
          </div>
        </div>

        {/* 5. Action Buttons (PDF, WebShare, Excel) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={Boolean(actionLoading)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              width: '100%', padding: '0.7rem', borderRadius: '8px',
              backgroundColor: '#0284c7', color: '#ffffff', border: 'none',
              fontSize: '0.9rem', fontWeight: 700, cursor: actionLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)'
            }}
          >
            {actionLoading?.includes('pdf') ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <FileText size={16} />}
            <span>Download Formatted PDF Price List</span>
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            <button
              type="button"
              onClick={handleExportWeb}
              disabled={Boolean(actionLoading)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem',
                padding: '0.65rem', borderRadius: '8px',
                backgroundColor: '#ffffff', color: '#0369a1', border: '1.5px solid #0284c7',
                fontSize: '0.84rem', fontWeight: 700, cursor: actionLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {actionLoading?.includes('web') ? <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Globe size={15} />}
              <span>Generate Web Share</span>
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              disabled={isExportingExcel}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem',
                padding: '0.65rem', borderRadius: '8px',
                backgroundColor: '#ffffff', color: '#15803d', border: '1.5px solid #16a34a',
                fontSize: '0.84rem', fontWeight: 700, cursor: isExportingExcel ? 'not-allowed' : 'pointer'
              }}
            >
              {isExportingExcel ? <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <FileSpreadsheet size={15} />}
              <span>Export to Excel (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* 6. Active Share Link Card (if generated) */}
        {lastGeneratedShareUrl && (
          <div style={{
            backgroundColor: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '10px',
            padding: '1rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                ✓ Interactive Client Link Ready
              </span>
              <a
                href={lastGeneratedShareUrl}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '0.78rem', color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none', fontWeight: 600 }}
              >
                <span>Open in Tab</span>
                <ExternalLink size={12} />
              </a>
            </div>

            <div style={{
              display: 'flex', gap: '0.4rem', alignItems: 'center',
              backgroundColor: '#ffffff', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #bbf7d0'
            }}>
              <input
                type="text"
                readOnly
                value={lastGeneratedShareUrl}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.78rem', color: '#334155' }}
              />
              <button
                type="button"
                onClick={copyToClipboard}
                style={{
                  padding: '0.3rem 0.6rem', borderRadius: '4px', border: 'none',
                  backgroundColor: copiedLink ? '#16a34a' : '#0284c7', color: '#ffffff',
                  fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem'
                }}
              >
                {copiedLink ? <Check size={13} /> : null}
                <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </StandardDrawer>
  );
}
