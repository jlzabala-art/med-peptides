'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Package,
  ShieldCheck,
  ThermometerSnowflake,
  Printer,
  Download,
  Share2,
  ExternalLink,
  Sliders,
  CheckCircle2,
  Info,
  Clock,
  ChevronRight,
  FileText,
  Activity,
  X
} from '@/lib/icons';
import toast from 'react-hot-toast';
import DataTable from '@/components/ui/DataTable';
import GlobalSearchBar from '@/components/ui/GlobalSearchBar';
import CopyableId from '@/components/ui/CopyableId';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import PublicInstitutionalInquiryDrawer from '@/components/shared/PublicInstitutionalInquiryDrawer';
import './dnlab-pens.css';

export default function DnLabPensClient({
  initialProducts = [],
  initialCurrency = 'USD',
  initialLang = 'en'
}) {
  const [lang, setLang] = useState(initialLang);
  const isEs = lang === 'es';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedItemForInquiry, setSelectedItemForInquiry] = useState(null);
  const [isInquiryDrawerOpen, setIsInquiryDrawerOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Per-row interactive dial slider state (item.id -> units)
  const [dialSettings, setDialSettings] = useState({});

  const categories = useMemo(() => {
    const set = new Set();
    initialProducts.forEach(p => { if (p.category) set.add(p.category); });
    return ['ALL', ...Array.from(set)];
  }, [initialProducts]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    let list = initialProducts;
    if (selectedCategory !== 'ALL') {
      list = list.filter(p => p.category === selectedCategory);
    }
    if (searchQuery && searchQuery.trim().length >= 2) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.timing || '').toLowerCase().includes(q) ||
        (p.variants || []).some(v =>
          (v.concentration || '').toLowerCase().includes(q) ||
          (v.doseBreakdown || '').toLowerCase().includes(q)
        )
      );
    }
    return list;
  }, [initialProducts, selectedCategory, searchQuery]);

  // KPIs
  const totalVariantsCount = useMemo(() => {
    return initialProducts.reduce((acc, p) => acc + (p.variants?.length || 1), 0);
  }, [initialProducts]);

  const handleDialChange = (itemId, units) => {
    setDialSettings(prev => ({ ...prev, [itemId]: Number(units) }));
  };

  const handleShare = useCallback(() => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success(isEs ? 'Enlace copiado al portapapeles' : 'Link copied to clipboard');
    }
  }, [isEs]);

  // Table Columns (DataTable Rule #3)
  const columns = useMemo(() => [
    {
      key: 'itemNumber',
      header: '#',
      width: '55px',
      render: (val, row) => (
        <span style={{ fontWeight: 800, color: '#64748b', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
          #{row.itemNumber}
        </span>
      )
    },
    {
      key: 'name',
      header: isEs ? 'Péptido & Formulación' : 'Peptide & Formulation',
      render: (val, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 750, color: '#0f172a', fontSize: '0.92rem' }}>
              {row.name}
            </span>
            <CopyableId value={row.sku} displayValue="SKU" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '12px',
              backgroundColor: row.categoryBg || '#f1f5f9',
              color: row.categoryColor || '#1e293b',
              border: `1px solid ${row.categoryBorder || '#e2e8f0'}`
            }}>
              {row.category}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              {row.variants?.length > 1 ? `${row.variants.length} ${isEs ? 'variantes' : 'variants'}` : 'Cartridge 3 mL'}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'variants',
      header: isEs ? 'Concentraciones / Opciones' : 'Available Strengths / Volume',
      render: (val, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {(row.variants || []).map((v) => (
            <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                fontFamily: 'monospace',
                fontWeight: 700,
                fontSize: '0.8rem',
                color: '#1e3a8a',
                background: '#eff6ff',
                padding: '2px 6px',
                borderRadius: '4px',
                border: '1px solid #bfdbfe'
              }}>
                {v.concentration}
              </span>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                ({v.volume})
              </span>
            </div>
          ))}
        </div>
      )
    },
    {
      key: 'protocol',
      header: isEs ? 'Protocolo & Dosis Recomendada' : 'Clinical Protocol & Dial Dosing',
      render: (val, row) => {
        const v = row.variants?.[0];
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontWeight: 650, color: '#0f172a', fontSize: '0.82rem' }}>
              {v ? `${v.clicksPerDose} Clicks (${v.doseBreakdown})` : 'See clinical breakdown'}
            </span>
            <span style={{ fontSize: '0.73rem', color: '#64748b' }}>
              {v?.frequency || row.timing}
            </span>
          </div>
        );
      }
    },
    {
      key: 'duration',
      header: isEs ? 'Suministro' : 'Supply Duration',
      width: '120px',
      render: (val, row) => {
        const v = row.variants?.[0];
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.74rem',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '6px',
            background: '#ecfdf5',
            color: '#065f46',
            border: '1px solid #a7f3d0'
          }}>
            <Clock size={11} color="#059669" />
            {v?.daysSupply ? `${v.daysSupply} ${isEs ? 'días' : 'days'}` : '30 days'}
          </span>
        );
      }
    },
    {
      key: 'actions',
      header: '',
      width: '130px',
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="dnlab-btn dnlab-btn-primary"
            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedItemForInquiry(row);
              setIsInquiryDrawerOpen(true);
            }}
          >
            {isEs ? 'Prescribir' : 'Prescribe'}
          </button>
        </div>
      )
    }
  ], [isEs]);

  // Master-Detail Expandable View (Rule #4)
  const renderDetailPanel = useCallback((row) => {
    const currentUnits = dialSettings[row.id] ?? row.variants?.[0]?.recommendedDoseUnits ?? 10;
    const currentVariant = row.variants?.[0] || {};
    const totalUnitsInCartridge = currentVariant.totalUnits || 300;
    const daysAtThisDose = Math.max(1, Math.floor(totalUnitsInCartridge / (currentUnits || 1)));

    return (
      <div className="dnlab-detail-panel">
        {/* Left: Mechanism & Specifications */}
        <div className="dnlab-detail-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="#2563eb" />
            <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: '#0f172a' }}>
              {isEs ? 'Mecanismo & Beneficios Clínicos' : 'Mechanism & Clinical Benefits'}
            </h4>
          </div>
          <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569', lineHeight: 1.55 }}>
            {row.description}
          </p>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#475569' }}>
              <ThermometerSnowflake size={14} color="#0284c7" />
              <span><b>{isEs ? 'Conservación:' : 'Cold-Chain:'}</b> {row.storage}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#475569' }}>
              <ShieldCheck size={14} color="#059669" />
              <span><b>{isEs ? 'Pureza HPLC:' : 'Purity:'}</b> {row.purity}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#475569' }}>
              <Info size={14} color="#6366f1" />
              <span><b>{isEs ? 'Aguja Sugerida:' : 'Needle Gauge:'}</b> {row.needle}</span>
            </div>
          </div>
        </div>

        {/* Right: Interactive Dial & Dosage Calculator */}
        <div className="dnlab-detail-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={18} color="#2563eb" />
              <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: '#0f172a' }}>
                {isEs ? 'Calculador de Clics del Dial' : 'Interactive Dial & Clicks Calculator'}
              </h4>
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
              Cartridge: {currentVariant.volume || '3 mL'} (300 IU)
            </span>
          </div>

          <div className="dnlab-dial-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                {isEs ? 'Ajuste del Dial (Clics / Unidades):' : 'Dial Setting (Clicks / Units):'}
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1d4ed8', fontFamily: 'monospace' }}>
                {currentUnits} Clicks
              </span>
            </div>

            <input
              type="range"
              min="2"
              max="50"
              step="1"
              value={currentUnits}
              onChange={(e) => handleDialChange(row.id, e.target.value)}
              className="dnlab-slider"
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#94a3b8', marginTop: '4px' }}>
              <span>2 clicks (Micro-dose)</span>
              <span>10 clicks (Standard)</span>
              <span>20 clicks (High)</span>
              <span>50 clicks</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                {isEs ? 'Dosis por Inyección' : 'Dose per Injection'}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                {currentVariant.doseBreakdown || `${currentUnits} units active`}
              </div>
            </div>

            <div style={{ background: '#ecfdf5', padding: '8px 12px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
              <div style={{ fontSize: '0.7rem', color: '#047857', textTransform: 'uppercase', fontWeight: 700 }}>
                {isEs ? 'Duración del Pen' : 'Pen Treatment Supply'}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#065f46', marginTop: '2px' }}>
                ~ {daysAtThisDose} {isEs ? 'días de tratamiento' : 'days of supply'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <Link
              href={`/labels?search=${encodeURIComponent(row.name)}`}
              className="dnlab-btn dnlab-btn-primary"
              style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem' }}
            >
              {isEs ? 'Abrir en Labels Studio' : 'Open in Labels Studio'}
            </Link>
            <button
              type="button"
              className="dnlab-btn"
              style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', fontSize: '0.8rem' }}
              onClick={() => {
                setSelectedItemForInquiry(row);
                setIsInquiryDrawerOpen(true);
              }}
            >
              {isEs ? 'Pedir Lote para Clínica' : 'Order Clinic Batch'}
            </button>
          </div>
        </div>
      </div>
    );
  }, [dialSettings, isEs]);

  return (
    <div className="dnlab-page-root">
      <PublicUnifiedHeader />

      <main className="dnlab-container">
        {/* Hero Section */}
        <section className="dnlab-hero">
          <div className="dnlab-hero-badge">
            <ShieldCheck size={13} />
            <span>Official B2B Portfolio · UAE Peptides (DN LAB)</span>
          </div>

          <h1 className="dnlab-hero-title">
            {isEs
              ? 'Catálogo Clínico de Plumas Precargadas (DN LAB Pens)'
              : 'DN LAB Pre-filled Multi-Dose Peptide Pens Schedule'}
          </h1>

          <p className="dnlab-hero-subtitle">
            {isEs
              ? 'Portfolio oficial de plumas precargadas de 3 mL con dial dosificador en clics mecánicos. Dosificación precisa, cadena de frío 2°C – 8°C y pureza analítica HPLC certificada.'
              : 'Authoritative multi-dose 3 mL pre-filled peptide pens featuring mechanical click-dial precision. Rigorous cold-chain protocol (2°C – 8°C), HPLC certified purity (≥ 99%), and direct clinical dosing guidance.'}
          </p>

          <div className="dnlab-hero-actions">
            <button
              type="button"
              className="dnlab-btn dnlab-btn-primary"
              onClick={() => setIsPrintModalOpen(true)}
            >
              <Printer size={15} />
              <span>{isEs ? 'Imprimir / Exportar Dossier PDF' : 'Print / Export Clinical PDF'}</span>
            </button>
            <button
              type="button"
              className="dnlab-btn dnlab-btn-secondary"
              onClick={handleShare}
            >
              <Share2 size={15} />
              <span>{isEs ? 'Compartir Catálogo' : 'Share Schedule'}</span>
            </button>
            <Link
              href="/pricing"
              className="dnlab-btn dnlab-btn-secondary"
            >
              <ChevronRight size={15} />
              <span>{isEs ? 'Ver Todos los Proveedores' : 'All Suppliers Hub'}</span>
            </Link>
          </div>
        </section>

        {/* 4 KPIs (Golden Rule #22) */}
        <section className="dnlab-kpi-grid">
          <div className="dnlab-kpi-card">
            <div className="dnlab-kpi-icon" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
              <Package size={22} />
            </div>
            <div>
              <div className="dnlab-kpi-val">{initialProducts.length}</div>
              <div className="dnlab-kpi-label">{isEs ? 'Plumas Formuladas' : 'Formulated Pens'}</div>
            </div>
          </div>

          <div className="dnlab-kpi-card">
            <div className="dnlab-kpi-icon" style={{ background: '#faf5ff', color: '#7c3aed' }}>
              <Activity size={22} />
            </div>
            <div>
              <div className="dnlab-kpi-val">{totalVariantsCount}</div>
              <div className="dnlab-kpi-label">{isEs ? 'Variantes de Dosis' : 'Strength SKUs'}</div>
            </div>
          </div>

          <div className="dnlab-kpi-card">
            <div className="dnlab-kpi-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="dnlab-kpi-val">≥ 99.2%</div>
              <div className="dnlab-kpi-label">{isEs ? 'Pureza HPLC Certificada' : 'HPLC Certified Purity'}</div>
            </div>
          </div>

          <div className="dnlab-kpi-card">
            <div className="dnlab-kpi-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
              <ThermometerSnowflake size={22} />
            </div>
            <div>
              <div className="dnlab-kpi-val">2°C – 8°C</div>
              <div className="dnlab-kpi-label">{isEs ? 'Cadena de Frío EAU' : 'Cold-Chain Protocol'}</div>
            </div>
          </div>
        </section>

        {/* Priority Search Bar (Golden Rule #7) */}
        <div style={{ marginBottom: '1rem' }}>
          <GlobalSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            searchScope="local"
            namespace="dnlab-pens"
            size="lg"
            resultCount={filteredProducts.length}
            lang={lang}
          />
        </div>

        {/* Category Filter Pills (Rule #8 & #29) */}
        <div className="dnlab-filters-row">
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginRight: '4px' }}>
            {isEs ? 'Área Terapéutica:' : 'Therapeutic Area:'}
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`dnlab-filter-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'ALL' ? (isEs ? 'Todos los Pens' : 'All Pens') : cat}
            </button>
          ))}
        </div>

        {/* Main Tabular View (Golden Rule #3 & #4) */}
        <DataTable
          columns={columns}
          data={filteredProducts}
          keyField="id"
          expandableRender={renderDetailPanel}
          initialRowsPerPage={25}
          itemNoun={isEs ? 'plumas' : 'pens'}
          statusText={isEs ? 'DN LAB Portfolio actualizado' : 'DN LAB Portfolio up to date'}
        />
      </main>

      {/* Institutional Inquiry Drawer */}
      <PublicInstitutionalInquiryDrawer
        isOpen={isInquiryDrawerOpen}
        onClose={() => setIsInquiryDrawerOpen(false)}
        product={selectedItemForInquiry}
        lang={lang}
      />

      {/* PDF Printable Modal */}
      {isPrintModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '1050px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }}>
            {/* Modal Bar */}
            <div style={{
              padding: '1rem 1.5rem',
              background: '#0f172a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="#60a5fa" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  {isEs ? 'Dossier Imprimible / PDF • DN LAB Pre-filled Pens' : 'Printable Clinical Dossier • DN LAB Pre-filled Pens'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className="dnlab-btn dnlab-btn-primary"
                  onClick={() => window.print()}
                  style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                >
                  <Printer size={14} />
                  <span>{isEs ? 'Imprimir / Guardar como PDF' : 'Print / Save as PDF'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Content View */}
            <div style={{ padding: '2rem', overflowY: 'auto' }} className="printable-dossier-root">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <h2 style={{ margin: '0 0 4px', fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                    ATLAS HEALTH SERVICES · CLINICAL DOSSIER
                  </h2>
                  <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                    Official Schedule: UAE Peptides (DN LAB) Pre-filled Multi-Dose Pens (Cartridge 3 mL)
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748b' }}>
                  <div><b>Cold-Chain:</b> 2°C – 8°C constant</div>
                  <div><b>HPLC Purity:</b> ≥ 99.2% Certified</div>
                  <div><b>Needle Standard:</b> 31G / 32G 4mm</div>
                </div>
              </div>

              <table className="dnlab-table-print" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>#</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Peptide / Formulation</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Strengths</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Clinical Indications</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Dial Dosing & Protocol</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Supply</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p, idx) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px', fontWeight: 700, color: '#64748b' }}>#{p.itemNumber}</td>
                      <td style={{ padding: '8px', fontWeight: 750, color: '#0f172a' }}>
                        <div>{p.name}</div>
                        <div style={{ fontSize: '0.68rem', color: p.categoryColor, fontWeight: 700 }}>{p.category}</div>
                      </td>
                      <td style={{ padding: '8px', fontFamily: 'monospace' }}>
                        {p.variants.map(v => v.concentration).join(' / ')}
                      </td>
                      <td style={{ padding: '8px', color: '#334155', maxWidth: '280px', lineHeight: 1.35 }}>
                        {p.description}
                      </td>
                      <td style={{ padding: '8px', color: '#0f172a', fontWeight: 600 }}>
                        <div>{p.variants[0]?.clicksPerDose} Clicks ({p.variants[0]?.doseBreakdown})</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 400 }}>{p.variants[0]?.frequency}</div>
                      </td>
                      <td style={{ padding: '8px', textAlign: 'center', fontWeight: 700, color: '#059669' }}>
                        {p.variants[0]?.daysSupply}d
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: '1.5rem', borderTop: '1px solid #cbd5e1', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8' }}>
                <span>Atlas Health Services LLC • UAE / GCC Region Compounded Protocols</span>
                <span>For Healthcare Professionals & Clinics Only</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <PublicUnifiedFooter />
    </div>
  );
}
