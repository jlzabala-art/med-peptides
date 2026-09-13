"use client";

import React, { useState } from 'react';
import { Download, FileText, Check, AlertCircle, FlaskConical } from '@/lib/icons';
import { generateProductDatasheetPdf } from '@/services/datasheetExportService';
import { generatePriceListPdf, generatePriceListCsv } from '@/services/priceListExportService';
import { generateProtocolGuidePdf, generateProtocolCompendiumPdf } from '@/services/protocolGuideExportService';
import { productRepository } from '@/repositories/productRepository';
import { getAllProtocols, getProtocolTemplate } from '@/repositories/protocolRepository';
import notifier from '@/services/NotificationService';

export default function CatalogActionCard({
  type,
  actionData = {},
  contextMode = 'admin',
  pageContext = null
}) {
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingCsv, setLoadingCsv] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const isDoctorRole = ['doctor', 'medical_director'].includes(contextMode);
  const isWholesaler = ['wholesaler', 'distributor'].includes(contextMode);
  const accentColor = isDoctorRole ? '#0d9488' : (isWholesaler ? '#c2410c' : '#003666');

  // ── Handle Datasheet PDF Download ─────────────────────────────────────────
  const handleDownloadDatasheet = async () => {
    try {
      setLoadingPdf(true);
      let targetProduct = pageContext?.product;

      // If pageContext doesn't match the requested compound, fetch it
      const targetSlug = actionData.slug || actionData.productName || pageContext?.productName;
      if (!targetProduct || (targetSlug && !targetProduct.name?.toLowerCase().includes(targetSlug.toLowerCase()) && !targetProduct.canonicalName?.toLowerCase().includes(targetSlug.toLowerCase()))) {
        const prods = await productRepository.getAllProducts();
        targetProduct = prods.find(p => 
          (p.slug && p.slug.toLowerCase() === targetSlug?.toLowerCase()) ||
          (p.canonicalName && p.canonicalName.toLowerCase().includes(targetSlug?.toLowerCase())) ||
          (p.name && p.name.toLowerCase().includes(targetSlug?.toLowerCase()))
        ) || pageContext?.product;
      }

      if (!targetProduct) {
        notifier.error('No se encontró el producto en el catálogo para generar el datasheet.');
        return;
      }

      await generateProductDatasheetPdf(targetProduct, { role: contextMode });
      setDownloaded(true);
      notifier.success(`Datasheet de ${targetProduct.canonicalName || targetProduct.name} descargado.`);
      setTimeout(() => setDownloaded(false), 3500);
    } catch (err) {
      console.error('[CatalogActionCard] Datasheet error:', err);
      notifier.error(`Error al generar datasheet: ${err.message}`);
    } finally {
      setLoadingPdf(false);
    }
  };

  // ── Handle Price List PDF Download ────────────────────────────────────────
  const handleDownloadPriceListPdf = async () => {
    try {
      setLoadingPdf(true);
      let prods = pageContext?.products || [];
      if (!prods.length) {
        prods = await productRepository.getAllProducts();
      }

      const catFilter = actionData.category;
      if (catFilter && catFilter !== 'all' && catFilter !== 'All Categories') {
        prods = prods.filter(p => p.category?.toLowerCase() === catFilter.toLowerCase());
      }

      await generatePriceListPdf(prods, {
        role: contextMode,
        category: catFilter || 'All Categories'
      });
      setDownloaded(true);
      notifier.success('Catálogo de precios PDF generado y descargado.');
      setTimeout(() => setDownloaded(false), 3500);
    } catch (err) {
      console.error('[CatalogActionCard] Price list PDF error:', err);
      notifier.error(`Error al generar catálogo de precios: ${err.message}`);
    } finally {
      setLoadingPdf(false);
    }
  };

  // ── Handle Price List CSV Export ──────────────────────────────────────────
  const handleDownloadPriceListCsv = async () => {
    try {
      setLoadingCsv(true);
      let prods = pageContext?.products || [];
      if (!prods.length) {
        prods = await productRepository.getAllProducts();
      }

      const catFilter = actionData.category;
      if (catFilter && catFilter !== 'all' && catFilter !== 'All Categories') {
        prods = prods.filter(p => p.category?.toLowerCase() === catFilter.toLowerCase());
      }

      generatePriceListCsv(prods, {
        role: contextMode,
        category: catFilter || 'All Categories'
      });
      notifier.success('Catálogo de precios exportado en CSV.');
    } catch (err) {
      console.error('[CatalogActionCard] Price list CSV error:', err);
      notifier.error(`Error al exportar CSV: ${err.message}`);
    } finally {
      setLoadingCsv(false);
    }
  };

  // ── Handle Clinical Protocol Sheet PDF Download ───────────────────────────
  const handleDownloadProtocolSheet = async () => {
    try {
      setLoadingPdf(true);
      let targetProtocol = pageContext?.protocol;

      const targetId = actionData.protocolId || actionData.protocolName;
      if (!targetProtocol || (targetId && targetProtocol.id !== targetId && targetProtocol.name?.toLowerCase() !== targetId.toLowerCase())) {
        try {
          if (targetId) {
            targetProtocol = await getProtocolTemplate(targetId);
          }
        } catch {}
        if (!targetProtocol) {
          const allProtocols = await getAllProtocols();
          targetProtocol = allProtocols.find(p => 
            p.id === targetId ||
            p.slug?.toLowerCase() === targetId?.toLowerCase() ||
            p.name?.toLowerCase().includes(targetId?.toLowerCase())
          ) || pageContext?.protocol;
        }
      }

      if (!targetProtocol) {
        notifier.error('No se encontró el protocolo para generar la guía clínica.');
        return;
      }

      await generateProtocolGuidePdf(targetProtocol, { role: contextMode });
      setDownloaded(true);
      notifier.success(`Guía clínica de "${targetProtocol.name}" descargada con éxito.`);
      setTimeout(() => setDownloaded(false), 3500);
    } catch (err) {
      console.error('[CatalogActionCard] Protocol sheet error:', err);
      notifier.error(`Error al generar guía de protocolo: ${err.message}`);
    } finally {
      setLoadingPdf(false);
    }
  };

  // ── Handle Protocol Compendium PDF Export ──────────────────────────────────
  const handleDownloadProtocolCompendium = async () => {
    try {
      setLoadingPdf(true);
      let protocols = pageContext?.protocols || [];
      if (!protocols.length) {
        protocols = await getAllProtocols();
      }

      const goalFilter = actionData.category || actionData.goal;
      if (goalFilter && goalFilter !== 'all') {
        protocols = protocols.filter(p => 
          (p.primary_goal && p.primary_goal.toLowerCase().includes(goalFilter.toLowerCase())) ||
          (p.category && p.category.toLowerCase().includes(goalFilter.toLowerCase()))
        );
      }

      await generateProtocolCompendiumPdf(protocols, {
        role: contextMode
      });
      setDownloaded(true);
      notifier.success('Compendio de protocolos PDF generado y descargado.');
      setTimeout(() => setDownloaded(false), 3500);
    } catch (err) {
      console.error('[CatalogActionCard] Protocol compendium error:', err);
      notifier.error(`Error al generar compendio de protocolos: ${err.message}`);
    } finally {
      setLoadingPdf(false);
    }
  };

  if (type === 'datasheet') {
    const compoundName = actionData.productName || pageContext?.productName || 'Compound';
    return (
      <div style={{
        marginTop: '0.85rem',
        padding: '0.9rem 1.15rem',
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        border: '1px solid rgba(0, 54, 102, 0.12)',
        boxShadow: '0 4px 16px rgba(0, 54, 102, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: `${accentColor}15`,
              color: accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={17} />
            </div>
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 750, color: '#0f172a' }}>
                Official Technical Datasheet
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Analytical purity, CAS, pharmacology & stability guidelines
              </div>
            </div>
          </div>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '6px',
            backgroundColor: `${accentColor}15`,
            color: accentColor,
            textTransform: 'uppercase'
          }}>
            {compoundName}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
          <button
            onClick={handleDownloadDatasheet}
            disabled={loadingPdf}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              backgroundColor: downloaded ? '#059669' : accentColor,
              color: '#ffffff',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: loadingPdf ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
            }}
          >
            {downloaded ? <Check size={14} /> : <Download size={14} />}
            <span>{loadingPdf ? 'Generando PDF…' : downloaded ? 'Datasheet Descargado ✓' : 'Descargar Datasheet PDF'}</span>
          </button>
        </div>
      </div>
    );
  }

  if (type === 'pricelist') {
    const catLabel = actionData.category || 'Catálogo Completo';
    return (
      <div style={{
        marginTop: '0.85rem',
        padding: '0.9rem 1.15rem',
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        border: '1px solid rgba(0, 54, 102, 0.12)',
        boxShadow: '0 4px 16px rgba(0, 54, 102, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: `${accentColor}15`,
              color: accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={17} />
            </div>
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 750, color: '#0f172a' }}>
                Catálogo de Precios Oficial
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Matriz de precios por formato, kit y tiers (Audiencia: {contextMode.toUpperCase()})
              </div>
            </div>
          </div>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '6px',
            backgroundColor: `${accentColor}15`,
            color: accentColor
          }}>
            {catLabel}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
          <button
            onClick={handleDownloadPriceListPdf}
            disabled={loadingPdf}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              backgroundColor: downloaded ? '#059669' : accentColor,
              color: '#ffffff',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: loadingPdf ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
            }}
          >
            {downloaded ? <Check size={14} /> : <Download size={14} />}
            <span>{loadingPdf ? 'Generando PDF…' : downloaded ? 'PDF Descargado ✓' : 'Descargar Catálogo PDF'}</span>
          </button>

          <button
            onClick={handleDownloadPriceListCsv}
            disabled={loadingCsv}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              padding: '0.55rem 0.95rem',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              color: '#334155',
              border: '1px solid #cbd5e1',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: loadingCsv ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
          >
            <Download size={14} />
            <span>{loadingCsv ? 'Exportando…' : 'CSV'}</span>
          </button>
        </div>
      </div>
    );
  }

  if (type === 'protocol_sheet') {
    const protocolName = actionData.protocolName || pageContext?.protocol?.name || 'Clinical Protocol';
    const totalWeeks = pageContext?.protocol?.duration_weeks || 12;

    return (
      <div style={{
        marginTop: '0.85rem',
        padding: '0.9rem 1.15rem',
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        border: '1px solid rgba(13, 148, 136, 0.2)',
        boxShadow: '0 4px 16px rgba(13, 148, 136, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#0d948815',
              color: '#0d9488',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FlaskConical size={17} />
            </div>
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 750, color: '#0f172a' }}>
                Clinical Protocol Guide (PDF)
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Phased matrix, titration schedule, biomarkers & precautions
              </div>
            </div>
          </div>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '6px',
            backgroundColor: '#0d948815',
            color: '#0d9488'
          }}>
            {totalWeeks} WEEKS
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
          <button
            onClick={handleDownloadProtocolSheet}
            disabled={loadingPdf}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              backgroundColor: downloaded ? '#059669' : '#0d9488',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: loadingPdf ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
            }}
          >
            {downloaded ? <Check size={14} /> : <Download size={14} />}
            <span>{loadingPdf ? 'Generando Guía PDF…' : downloaded ? 'Guía Clínica Descargada ✓' : `Descargar Guía de "${protocolName}"`}</span>
          </button>
        </div>
      </div>
    );
  }

  if (type === 'protocol_compendium') {
    return (
      <div style={{
        marginTop: '0.85rem',
        padding: '0.9rem 1.15rem',
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        border: '1px solid rgba(0, 54, 102, 0.12)',
        boxShadow: '0 4px 16px rgba(0, 54, 102, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: `${accentColor}15`,
              color: accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={17} />
            </div>
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 750, color: '#0f172a' }}>
                Atlas Protocols Compendium (PDF)
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Treatment directory with all active clinical pathways & goals
              </div>
            </div>
          </div>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '6px',
            backgroundColor: `${accentColor}15`,
            color: accentColor
          }}>
            DIRECTORY
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
          <button
            onClick={handleDownloadProtocolCompendium}
            disabled={loadingPdf}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              backgroundColor: downloaded ? '#059669' : accentColor,
              color: '#ffffff',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: loadingPdf ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
            }}
          >
            {downloaded ? <Check size={14} /> : <Download size={14} />}
            <span>{loadingPdf ? 'Generando Compendio…' : downloaded ? 'Compendio Descargado ✓' : 'Descargar Compendio de Protocolos PDF'}</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
}
