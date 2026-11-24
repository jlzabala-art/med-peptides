"use client";

import React, { useState, useEffect } from 'react';
import {
  Search,
  FlaskConical,
  ShieldCheck,
  GitCompare,
  X,
} from '@/lib/icons';
import { triggerHaptic } from '../../utils/haptics';
import '../../styles/publicProtocolsCatalog.css';
import '../../components/product/PublicDatasheetView.css';
import PublicInstitutionalInquiryDrawer from '../shared/PublicInstitutionalInquiryDrawer';
import { useRegisterAtlasContext } from '@/context/AtlasContextProvider';
import ProtocolQrModal from './ProtocolQrModal';
import PublicUnifiedHeader from '../shared/PublicUnifiedHeader';
import ClinicalFormatSwitcher from '../pricing/shared/ClinicalFormatSwitcher';
import PageHeroCard from '../ui/PageHeroCard';
import PublicUnifiedFooter from '../shared/PublicUnifiedFooter';
import ProtocolsCatalogSidebar from './ProtocolsCatalogSidebar';
import ProtocolCatalogKpiStrip from './ProtocolCatalogKpiStrip';
import ProtocolCatalogSearchToolbar from './ProtocolCatalogSearchToolbar';
import ProtocolListRow from './ProtocolListRow';
import ProtocolCatalogCard from './ProtocolCatalogCard';
import ProtocolCompareDrawer from './ProtocolCompareDrawer';
import DataTable from '../ui/DataTable';
import EmptyState from '../ui/EmptyState';
import Link from 'next/link';
import { Mail, Lock } from 'lucide-react';
import { getProtocolTranslations, GOAL_TRANSLATIONS } from '../../utils/protocolTranslations';
import { GOAL_BUCKETS } from '../../utils/protocolCatalogTaxonomy';
import { useProtocolCatalogFilters } from '../../hooks/useProtocolCatalogFilters';

export default function PublicProtocolsCatalogView({ initialProtocols = [] }) {
  const {
    lang,
    handleLangChange,
    searchQuery,
    setSearchQuery,
    selectedGoal,
    setSelectedGoal,
    durationFilter,
    setDurationFilter,
    phasesFilter,
    setPhasesFilter,
    routeFilter,
    setRouteFilter,
    evidenceFilter,
    setEvidenceFilter,
    wadaSafeOnly,
    setWadaSafeOnly,
    safetyExclusions,
    toggleSafetyExclusion,
    onlyShortlisted,
    setOnlyShortlisted,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    kpiScope,
    setKpiScope,
    shortlistSlugs,
    toggleShortlist,
    compareSlugs,
    compareProtocols,
    toggleCompare,
    clearCompare,
    enrichedProtocols,
    goalCounts,
    filteredProtocols,
    groupedProtocols,
    hasActiveFilters,
    kpiMetrics,
    handleResetFilters,
  } = useProtocolCatalogFilters(initialProtocols);

  const [copiedId, setCopiedId] = useState(null);
  const [isInquiryDrawerOpen, setIsInquiryDrawerOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const [qrModalProtocol, setQrModalProtocol] = useState(null);
  const [copiedQrUrl, setCopiedQrUrl] = useState(false);
  const [copiedDirectoryUrl, setCopiedDirectoryUrl] = useState(false);

  const t = getProtocolTranslations(lang);
  const isEs = lang === 'es';

  // Active Atlas AI Bridge: allows Atlas AI to apply protocol filters or open comparison directly
  useEffect(() => {
    const handleAtlasFilter = (e) => {
      const detail = e?.detail || {};
      if (detail.goal !== undefined) setSelectedGoal(detail.goal);
      if (detail.route !== undefined) setRouteFilter(detail.route);
      if (detail.duration !== undefined) setDurationFilter(detail.duration);
      if (detail.evidence !== undefined) setEvidenceFilter(detail.evidence);
      if (detail.query !== undefined) setSearchQuery(detail.query);
      if (detail.openCompare) setIsCompareOpen(true);
      if (detail.reset) handleResetFilters();
    };
    window.addEventListener('atlas-apply-protocol-filters', handleAtlasFilter);
    return () => window.removeEventListener('atlas-apply-protocol-filters', handleAtlasFilter);
  }, [setSelectedGoal, setRouteFilter, setDurationFilter, setEvidenceFilter, setSearchQuery, handleResetFilters]);

  const toggleExpanded = (slug) => {
    triggerHaptic('light');
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const handleOpenQr = (proto, e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    triggerHaptic('light');
    setQrModalProtocol(proto);
    setCopiedQrUrl(false);
  };

  const handleCopyQrUrl = () => {
    if (!qrModalProtocol) return;
    const url = `https://www.atlashealth-services.com/proto/${qrModalProtocol.cleanSlug}`;
    navigator.clipboard?.writeText(url);
    setCopiedQrUrl(true);
    triggerHaptic('copy');
    setTimeout(() => setCopiedQrUrl(false), 2000);
  };

  const handleCopyCode = (code, e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    navigator.clipboard?.writeText(code);
    triggerHaptic('light');
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyDirectoryUrl = async () => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        triggerHaptic('copy');
        setCopiedDirectoryUrl(true);
        setTimeout(() => setCopiedDirectoryUrl(false), 2000);
      }
    } catch (_) {
      /* clipboard write rejected */
    }
  };

  const heroSubtitle = (t.catalogHeroSubtitle || '').replace('{count}', String(enrichedProtocols.length));

  useRegisterAtlasContext(
    {
      contextAnchor: {
        type: 'protocols_catalog',
        name: t.catalogHeroTitle || 'Clinical Protocols & Peptides Directory',
        totalProtocols: enrichedProtocols.length,
        filteredCount: filteredProtocols.length,
        activeFilters: {
          goal: selectedGoal,
          route: routeFilter,
          duration: durationFilter,
          evidence: evidenceFilter,
          safetyExclusions,
          searchQuery,
        },
        topMatchingProtocols: filteredProtocols.slice(0, 6).map((p) => ({
          slug: p.cleanSlug,
          name: p.cleanName,
          route: p.route,
          durationWeeks: p.durationWeeks,
          evidence: p.evidence_grade,
        })),
        suggestedPrompts: isEs
          ? [
              'Compara los 2 mejores protocolos de regeneración articular',
              '¿Qué protocolos SubQ de 8–12 semanas no tienen riesgo oncológico?',
              '¿Qué analíticas requieren los protocolos metabólicos GLP-1?',
            ]
          : [
              'Compare the top 2 tissue regeneration protocols',
              'Which 8-12 week SubQ protocols exclude oncology/angiogenic risk?',
              'What baseline labs are required for GLP-1 metabolic protocols?',
            ],
      },
      bottomBar: {
        summaryTitle: t.catalogHeroTitle || 'Clinical Protocols & Peptides Directory',
        summarySubtitle: `${filteredProtocols.length} Clinical Protocols • ${kpiMetrics.goalsCount} Goals • Titration SSOT`,
        badge: 'Clinical Pathways SSOT',
        atlasAiLabel: 'Ask Atlas AI',
        showSections: true,
        sectionsLabel: isEs ? 'Objetivos & Filtros' : 'Goals & Filters',
        sectionsCount: GOAL_BUCKETS.length,
        onOpenSections: () => setIsMobileDrawerOpen(true),
        primaryAction: {
          label: isEs ? 'Consultar Directorio' : 'Inquire Directory',
          onClick: () => setIsInquiryDrawerOpen(true),
        },
      },
    },
    [t.catalogHeroTitle, enrichedProtocols.length, filteredProtocols.length, selectedGoal, kpiMetrics.goalsCount, isEs]
  );

  return (
    <div className="proto-catalog-container atlas-page-bg">
      {/* ── Fixed Sticky Executive Navigation ── */}
      <PublicUnifiedHeader
        track="protocols"
        lang={lang}
        onLangChange={handleLangChange}
        breadcrumb={[
          { label: lang === 'es' ? 'Suite Clínica' : 'Clinical Suite', href: '/pricing' },
          { label: lang === 'es' ? 'Protocolos Clínicos' : 'Clinical Protocols' },
        ]}
        onOpenSearch={() => {
          const el = document.getElementById('protocol-global-search');
          if (el) el.focus();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onCopyUrl={handleCopyDirectoryUrl}
        copiedUrl={copiedDirectoryUrl}
      />

      <ClinicalFormatSwitcher activeFormat="protocols" lang={lang} />

      <main className="atlas-page-shell">
        {/* ── 1. Compact Executive Hero Section ── */}
        <PageHeroCard
          brandLeft="ATLAS HEALTH"
          brandRight="CLINICAL PROTOCOLS"
          badges={[t.catalogHeroPill]}
          title={t.catalogHeroTitle}
          subtitle={heroSubtitle}
          metaItems={[
            { label: 'DIRECTORY:', value: `${enrichedProtocols.length} PROTOCOLS`, mono: true },
            { label: 'STANDARD:', value: 'EVIDENCE-BASED', mono: true },
          ]}
        />

      {/* ── 2. Dynamic KPI Strip with Scope Switcher (Rule #22, Mobile 2x2) ── */}
      <ProtocolCatalogKpiStrip
        kpiMetrics={kpiMetrics}
        kpiScope={kpiScope}
        onChangeScope={setKpiScope}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={() => {
          triggerHaptic('tap');
          handleResetFilters();
        }}
        lang={lang}
      />

      {/* ── 3. Google Cloud Console Full-Width Table Layout (Filters inline in Toolbar/Drawer) ── */}
      <div className="proto-content-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
        <div className="proto-main-column">
          {/* Prioritized Search Bar + Mobile Quick Pills + Physician Triage Bar */}
          <ProtocolCatalogSearchToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedGoal={selectedGoal}
            onSelectGoal={setSelectedGoal}
            goalBuckets={GOAL_BUCKETS}
            goalCounts={goalCounts}
            durationFilter={durationFilter}
            onSelectDuration={setDurationFilter}
            phasesFilter={phasesFilter}
            onSelectPhases={setPhasesFilter}
            routeFilter={routeFilter}
            onSelectRoute={setRouteFilter}
            evidenceFilter={evidenceFilter}
            onSelectEvidence={setEvidenceFilter}
            safetyExclusions={safetyExclusions}
            onToggleSafetyExclusion={toggleSafetyExclusion}
            onlyShortlisted={onlyShortlisted}
            onToggleOnlyShortlisted={() => setOnlyShortlisted((prev) => !prev)}
            wadaSafeOnly={wadaSafeOnly}
            onToggleWadaSafeOnly={() => setWadaSafeOnly((prev) => !prev)}
            shortlistCount={shortlistSlugs.size}
            viewMode={viewMode}
            onChangeViewMode={setViewMode}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={() => {
              triggerHaptic('tap');
              handleResetFilters();
            }}
            onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
            filteredCount={filteredProtocols.length}
            totalCount={enrichedProtocols.length}
            lang={lang}
            t={t}
          />

          {/* ── 4. Protocol Groups by Therapeutic Goals ── */}
          {groupedProtocols.length > 0 ? (
            <div className="proto-goal-groups-container">
              {groupedProtocols.map((group) => {
                const bucket = group.bucket;
                const BucketIcon = bucket.icon || FlaskConical;
                const groupTitle = GOAL_TRANSLATIONS[bucket.id]?.[lang] || bucket.label;

                return (
                  <section key={bucket.id} className="proto-goal-section">
                    <div className={`proto-goal-section-header ${bucket.isReferenceGroup ? 'is-reference-header' : ''}`}>
                      <div className="proto-goal-section-left">
                        <div className="proto-goal-section-icon" style={{ background: bucket.bg, color: bucket.color }}>
                          <BucketIcon size={18} />
                        </div>
                        <div>
                          <div className="proto-goal-section-title-row">
                            <h2 className="proto-goal-section-title">{groupTitle}</h2>
                            {bucket.isReferenceGroup && (
                              <span className="proto-ref-section-badge">
                                {isEs ? 'Telemetría Completa' : 'Full Clinical Telemetry'}
                              </span>
                            )}
                          </div>
                          <div className="proto-goal-section-sub">
                            {bucket.sublabel ||
                              `${group.protocols.length} ${isEs ? 'protocolos clínicos disponibles' : 'clinical protocols available'}`}
                          </div>
                        </div>
                      </div>
                      <span
                        className="proto-goal-section-count"
                        style={{ background: bucket.bg, color: bucket.color, border: `1px solid ${bucket.color}30` }}
                      >
                        {group.protocols.length}
                      </span>
                    </div>

                    {viewMode === 'list' ? (
                      <DataTable
                        data={group.protocols}
                        keyField="cleanSlug"
                        globalSearch={false}
                        hidePagination={true}
                        columns={[
                          {
                            key: 'cleanName',
                            label: isEs ? 'Protocolo / Objetivo' : 'Protocol / Goal',
                            align: 'left',
                            width: '46%',
                            render: (_val, proto) => (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                  <Link
                                    href={`/proto/${proto.cleanSlug}?lang=${lang}`}
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a73e8', textDecoration: 'none', overflowWrap: 'anywhere' }}
                                  >
                                    {proto.cleanName}
                                  </Link>
                                  {proto.is_reference_standard && (
                                    <span style={{ fontSize: '0.62rem', fontWeight: 750, padding: '1px 6px', borderRadius: '4px', background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}>
                                      Reference
                                    </span>
                                  )}
                                </div>
                                <span style={{ fontSize: '0.72rem', color: '#64748b', overflowWrap: 'anywhere' }}>
                                  {proto.compounds?.map((c) => c.name).filter(Boolean).slice(0, 3).join(' · ') || proto.cleanCode}
                                </span>
                              </div>
                            ),
                          },
                          {
                            key: 'route',
                            label: isEs ? 'Vía y Duración' : 'Route & Cycle',
                            align: 'left',
                            width: '18%',
                            render: (_val, proto) => (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.76rem', color: '#334155', minWidth: 0 }}>
                                <span style={{ fontWeight: 650 }}>{proto.route || 'SubQ'}</span>
                                <span style={{ fontSize: '0.70rem', color: '#64748b' }}>
                                  {proto.durationWeeks ? `${proto.durationWeeks}w` : '—'} · {proto.phasesCount || 1} {isEs ? 'fases' : 'ph'}
                                </span>
                              </div>
                            ),
                          },
                          {
                            key: 'evidence_grade',
                            label: isEs ? 'Evidencia' : 'Evidence',
                            align: 'left',
                            width: '18%',
                            render: (_val, proto) => {
                              const ev = String(proto.evidence_grade || 'Emerging');
                              const evLow = ev.toLowerCase();
                              const isHigh = evLow.includes('high') || evLow.includes('tier 1') || evLow.includes('established');
                              const isMod = evLow.includes('moderate') || evLow.includes('tier 2') || evLow.includes('cohort');
                              return (
                                <span style={{
                                  display: 'inline-block',
                                  maxWidth: '100%',
                                  fontSize: '0.69rem',
                                  fontWeight: 700,
                                  padding: '2px 8px',
                                  borderRadius: '999px',
                                  background: isHigh ? '#dcfce7' : isMod ? '#e0f2fe' : '#fef3c7',
                                  color: isHigh ? '#166534' : isMod ? '#0369a1' : '#92400e',
                                  whiteSpace: 'normal',
                                  lineHeight: 1.25,
                                }}>
                                  {ev}
                                </span>
                              );
                            },
                          },
                          {
                            key: 'actions',
                            label: '',
                            align: 'right',
                            width: '18%',
                            render: (_val, proto) => (
                              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '6px', maxWidth: '100%' }} onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => toggleCompare(proto.cleanSlug)}
                                  title={isEs ? 'Comparar protocolo' : 'Compare protocol'}
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    border: compareSlugs.includes(proto.cleanSlug) ? '1px solid #1a73e8' : '1px solid #dadce0',
                                    background: compareSlugs.includes(proto.cleanSlug) ? '#e8f0fe' : '#ffffff',
                                    color: compareSlugs.includes(proto.cleanSlug) ? '#1a73e8' : '#5f6368',
                                    fontSize: '0.70rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {compareSlugs.includes(proto.cleanSlug) ? '✓ Compare' : '+ Compare'}
                                </button>
                                <Link
                                  href={`/rx/intake?proto=${encodeURIComponent(proto.cleanSlug)}&lang=${lang}`}
                                  className="gcp-btn-secondary"
                                  style={{
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    border: '1px solid #dadce0',
                                    background: '#ffffff',
                                    color: '#3c4043',
                                    fontSize: '0.71rem',
                                    fontWeight: 650,
                                    textDecoration: 'none',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {isEs ? 'Prescribir' : 'Prescribe'}
                                </Link>
                              </div>
                            ),
                          },
                        ]}
                        expandableRender={(proto) => (
                          <div style={{ padding: '14px 18px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                            <div>
                              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '5px' }}>
                                {isEs ? 'Resumen Clínico' : 'Clinical Summary'}
                              </div>
                              <p style={{ margin: 0, fontSize: '0.77rem', color: '#334155', lineHeight: 1.55 }}>
                                {proto.summary || (isEs ? 'Protocolo clínico estandarizado.' : 'Standardized clinical protocol.')}
                              </p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '1px solid #e2e8f0', paddingLeft: '14px' }}>
                              {Array.isArray(proto.biomarkers) && proto.biomarkers.length > 0 && (
                                <div style={{ fontSize: '0.74rem', color: '#0f172a' }}>
                                  <span style={{ color: '#64748b', fontWeight: 700, marginRight: '6px' }}>{isEs ? 'Analíticas:' : 'Labs:'}</span>
                                  <span>{proto.biomarkers.join(', ')}</span>
                                </div>
                              )}
                              {Array.isArray(proto.coInterventions) && proto.coInterventions.length > 0 && (
                                <div style={{ fontSize: '0.73rem', color: '#334155', borderLeft: '2px solid #10b981', paddingLeft: '8px' }}>
                                  <strong style={{ color: '#065f46' }}>{isEs ? 'Co-intervención:' : 'Co-Intervention:'}</strong> {proto.coInterventions.join(' · ')}
                                </div>
                              )}
                              {Array.isArray(proto.sequencingPhases) && proto.sequencingPhases.length > 0 && (
                                <div style={{ fontSize: '0.73rem', color: '#334155', borderLeft: '2px solid #3b82f6', paddingLeft: '8px' }}>
                                  <strong style={{ color: '#1e40af' }}>{isEs ? 'Secuencia:' : 'Sequencing:'}</strong> {proto.sequencingPhases.join(' · ')}
                                </div>
                              )}
                              {Array.isArray(proto.contraindications) && proto.contraindications.length > 0 && (
                                <div style={{ fontSize: '0.73rem', color: '#334155', borderLeft: '2px solid #ef4444', paddingLeft: '8px' }}>
                                  <strong style={{ color: '#b91c1c' }}>{isEs ? 'Contraindicaciones:' : 'Contraindications:'}</strong> {proto.contraindications.join(' · ')}
                                </div>
                              )}
                              {Array.isArray(proto.stoppingRules) && proto.stoppingRules.length > 0 && (
                                <div style={{ fontSize: '0.73rem', color: '#334155', borderLeft: '2px solid #f59e0b', paddingLeft: '8px' }}>
                                  <strong style={{ color: '#92400e' }}>{isEs ? 'Criterios de parada:' : 'Stopping Rules:'}</strong> {proto.stoppingRules[0]}
                                </div>
                              )}
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', fontSize: '0.68rem', color: '#475569', paddingTop: '2px' }}>
                                {proto.regulatoryPosture?.status && (
                                  <span style={{ padding: '2px 7px', borderRadius: '999px', background: '#f1f5f9', border: '1px solid #cbd5e1', fontWeight: 700 }}>
                                    {proto.regulatoryPosture.status}
                                  </span>
                                )}
                                {proto.regulatoryPosture?.wadaProhibited && (
                                  <span style={{ padding: '2px 7px', borderRadius: '999px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontWeight: 800 }}>
                                    WADA Prohibited
                                  </span>
                                )}
                                <Link
                                  href={`/proto/${proto.cleanSlug}?lang=${lang}`}
                                  style={{
                                    padding: '2px 8px',
                                    borderRadius: '999px',
                                    background: '#ffffff',
                                    border: '1px solid #cbd5e1',
                                    color: '#0f172a',
                                    fontWeight: 700,
                                    textDecoration: 'none',
                                  }}
                                >
                                  {isEs ? 'Ver Blueprint →' : 'Open Blueprint →'}
                                </Link>
                                <Link
                                  href={`/calculator?peptide=${encodeURIComponent(proto.compounds?.[0]?.name || proto.cleanName)}&lang=${lang}`}
                                  style={{
                                    padding: '2px 8px',
                                    borderRadius: '999px',
                                    background: '#eff6ff',
                                    border: '1px solid #bfdbfe',
                                    color: '#1d4ed8',
                                    fontWeight: 750,
                                    textDecoration: 'none',
                                  }}
                                >
                                  {isEs ? 'Abrir en Calculadora →' : 'Open in Calculator →'}
                                </Link>
                              </div>
                            </div>
                          </div>
                        )}
                      />
                    ) : (
                      <div className="proto-cards-grid">
                        {group.protocols.map((proto) => (
                          <ProtocolCatalogCard
                            key={proto.id || proto.cleanSlug}
                            proto={proto}
                            groupBucketId={group.bucket?.id}
                            selectedGoal={selectedGoal}
                            isCompared={compareSlugs.includes(proto.cleanSlug)}
                            onToggleCompare={toggleCompare}
                            isShortlisted={shortlistSlugs.has(proto.cleanSlug)}
                            onToggleShortlist={toggleShortlist}
                            onOpenQr={handleOpenQr}
                            onCopyLink={handleCopyCode}
                            copiedId={copiedId}
                            lang={lang}
                            t={t}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          ) : (
            <div className="proto-empty-state">
              <div className="proto-empty-icon">
                <Search size={28} />
              </div>
              <h3 className="proto-empty-title">{t.noResultsTitle}</h3>
              <p className="proto-empty-subtitle">{t.noResultsSubtitle}</p>
              <button
                type="button"
                className="proto-empty-btn"
                onClick={() => {
                  triggerHaptic('tap');
                  handleResetFilters();
                }}
              >
                {t.resetFilters}
              </button>
            </div>
          )}

          {/* Institutional Prudence & Medical Notice */}
          <div className="proto-notice-banner">
            <div className="proto-notice-icon">
              <ShieldCheck size={22} />
            </div>
            <div className="proto-notice-body">
              <div className="proto-notice-title">{t.medicalSupervisionTitle}</div>
              <div className="proto-notice-desc">{t.medicalSupervisionDesc}</div>
            </div>
          </div>

          <div className="public-regulatory-footer">
            <p className="public-regulatory-text">
              <Lock size={12} /> {t.regulatoryNotice}
            </p>
            <div className="public-regulatory-links">
              <button
                type="button"
                className="public-regulatory-link"
                onClick={() => setIsInquiryDrawerOpen(true)}
              >
                <Mail size={12} /> {t.inquireMedical}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile-only Filter Drawer (table uses 100% width on desktop) */}
        {isMobileDrawerOpen && (
          <ProtocolsCatalogSidebar
            selectedGoal={selectedGoal}
            onSelectGoal={setSelectedGoal}
            goalBuckets={GOAL_BUCKETS}
            goalCounts={goalCounts}
            durationFilter={durationFilter}
            onSelectDuration={setDurationFilter}
            phasesFilter={phasesFilter}
            onSelectPhases={setPhasesFilter}
            sortBy={sortBy}
            onSelectSort={setSortBy}
            onResetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
            lang={lang}
            t={t}
            publicUrl={typeof window !== 'undefined' ? `${window.location.origin}/proto` : 'https://www.atlashealth-services.com/proto'}
            onOpenInquiry={() => setIsInquiryDrawerOpen(true)}
            isMobileDrawerOpen={isMobileDrawerOpen}
            onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
          />
        )}
      </div>

      {/* Floating Side-by-Side Compare Pill */}
      {compareProtocols.length > 0 && (
        <div className="proto-compare-floating-bar">
          <button
            type="button"
            className="proto-compare-launch-btn"
            onClick={() => setIsCompareOpen(true)}
          >
            <GitCompare size={15} />
            <span>
              {isEs
                ? `Comparar (${compareProtocols.length}/3)`
                : `Compare (${compareProtocols.length}/3)`}
            </span>
          </button>
          <button
            type="button"
            className="proto-compare-dismiss-btn"
            onClick={clearCompare}
            aria-label="Clear comparison"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Side-by-Side Comparison Drawer */}
      <ProtocolCompareDrawer
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        protocols={compareProtocols}
        onRemove={toggleCompare}
        onClear={() => {
          clearCompare();
          setIsCompareOpen(false);
        }}
        lang={lang}
      />
      </main>

      {/* Protocol QR Modal */}
      {qrModalProtocol && (
        <ProtocolQrModal
          isOpen={Boolean(qrModalProtocol)}
          onClose={() => setQrModalProtocol(null)}
          publicUrl={`https://www.atlashealth-services.com/proto/${qrModalProtocol.cleanSlug}`}
          displayName={qrModalProtocol.cleanName}
          protocolCode={qrModalProtocol.code || qrModalProtocol.cleanSlug}
          t={t}
          copied={copiedQrUrl}
          onCopyUrl={handleCopyQrUrl}
        />
      )}

      <PublicInstitutionalInquiryDrawer
        isOpen={isInquiryDrawerOpen}
        onClose={() => setIsInquiryDrawerOpen(false)}
        contextType="protocols_directory"
        lang={lang}
      />

      <PublicUnifiedFooter
        track="protocols"
        lang={lang}
        onLangChange={handleLangChange}
        onOpenInquiry={() => setIsInquiryDrawerOpen(true)}
      />
    </div>
  );
}
