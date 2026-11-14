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
import PublicAtlasAIDrawer from '../shared/PublicAtlasAIDrawer';
import PublicInstitutionalInquiryDrawer from '../shared/PublicInstitutionalInquiryDrawer';
import PublicStickyActionBar from '../shared/PublicStickyActionBar';
import ProtocolQrModal from './ProtocolQrModal';
import PublicUnifiedHeader from '../shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '../shared/PublicUnifiedFooter';
import ProtocolsCatalogSidebar from './ProtocolsCatalogSidebar';
import ProtocolCatalogKpiStrip from './ProtocolCatalogKpiStrip';
import ProtocolCatalogSearchToolbar from './ProtocolCatalogSearchToolbar';
import ProtocolListRow from './ProtocolListRow';
import ProtocolCatalogCard from './ProtocolCatalogCard';
import ProtocolCompareDrawer from './ProtocolCompareDrawer';
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

  // Keyboard shortcut: ⌘K / Ctrl+K to focus search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const el = document.getElementById('protocol-global-search');
        if (el) el.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  return (
    <div className="proto-catalog-container">
      {/* ── Fixed Sticky Executive Navigation ── */}
      <PublicUnifiedHeader
        track="protocols"
        lang={lang}
        onLangChange={handleLangChange}
        onOpenSearch={() => {
          const el = document.getElementById('protocol-global-search');
          if (el) el.focus();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onCopyUrl={handleCopyDirectoryUrl}
        copiedUrl={copiedDirectoryUrl}
      />

      {/* ── 1. Compact Executive Hero Section ── */}
      <header className="proto-hero">
        <div className="proto-hero-pill">
          <FlaskConical size={14} />
          <span>{t.catalogHeroPill}</span>
        </div>
        <h1 className="proto-hero-title">{t.catalogHeroTitle}</h1>
        <p className="proto-hero-subtitle">{heroSubtitle}</p>
      </header>

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

      {/* ── 3. Google Cloud Console 2-Column Responsive Layout ── */}
      <div className="proto-content-grid">
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
                      <div className="proto-list-container">
                        {group.protocols.map((proto) => (
                          <ProtocolListRow
                            key={proto.cleanSlug}
                            proto={proto}
                            groupBucketId={group.bucket?.id}
                            selectedGoal={selectedGoal}
                            isExpanded={expandedIds.has(proto.cleanSlug)}
                            onToggleExpand={toggleExpanded}
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

        {/* Persistent Sticky Sidebar */}
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

      {/* Persistent Bottom Action Bar */}
      <PublicStickyActionBar
        title={t.catalogHeroTitle || 'Clinical Protocols & Peptides Directory'}
        subtitle={`${filteredProtocols.length} Clinical Protocols • ${kpiMetrics.goalsCount} Goals • Titration SSOT`}
        badge="Clinical Pathways SSOT"
        badgeType="teal"
        inquireLabel={isEs ? 'Consultar Directorio' : 'Inquire Directory'}
        onInquire={() => setIsInquiryDrawerOpen(true)}
        showClinicalAI={true}
        aiCategory="Protocols Directory"
        aiContextQuery={
          compareProtocols.length >= 2
            ? isEs
              ? `Compara los protocolos seleccionados (${compareProtocols.map((p) => p.cleanName).join(' vs ')}) en cuanto a perfil de paciente, titulación, biomarcadores y contraindicaciones.`
              : `Compare the selected protocols (${compareProtocols.map((p) => p.cleanName).join(' vs ')}) for patient fit, titration schedule, required biomarkers, and contraindications.`
            : ''
        }
        showSections={true}
        sectionsCount={GOAL_BUCKETS.length}
        sectionsLabel={isEs ? 'Objetivos & Filtros' : 'Goals & Filters'}
        onOpenSections={() => setIsMobileDrawerOpen(true)}
        lang={lang}
      />

      <PublicAtlasAIDrawer
        contextType="protocols_directory"
        contextAnchor={{
          type: 'protocols_catalog',
          name: 'Clinical Protocols & Peptides Directory',
          totalProtocols: enrichedProtocols.length,
          filteredCount: filteredProtocols.length,
          activeFilterGoal: selectedGoal,
          activeRouteFilter: routeFilter,
          activeEvidenceFilter: evidenceFilter,
          activeSafetyExclusions: safetyExclusions,
          activeSearchQuery: searchQuery,
          shortlistCount: shortlistSlugs.size,
          comparingProtocols: compareProtocols.map((p) => ({
            name: p.cleanName,
            slug: p.cleanSlug,
            route: p.route,
            evidence: p.evidence_grade,
            duration: `${p.durationWeeks}w`,
            biomarkers: p.biomarkers,
            contraindications: p.contraindications,
          })),
          availableGoals: GOAL_BUCKETS.map((b) => b.label),
          protocols: enrichedProtocols.map((p) => ({
            name: p.cleanName,
            slug: p.cleanSlug,
            goal: p.mappedGoals?.filter((g) => g !== 'all' && g !== 'reference_standards')[0] || 'longevity',
            duration: p.durationWeeks ? `${p.durationWeeks}w` : '8w',
            phases: p.phasesCount,
            route: p.route,
            evidence: p.evidence_grade,
            compounds: p.compounds.map((c) => c.name),
          })),
        }}
        storageKey="protocols_directory"
        hideFloatingTrigger={true}
        lang={lang}
      />

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
