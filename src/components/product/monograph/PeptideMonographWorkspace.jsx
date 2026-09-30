"use client";

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PeptideMonographHeader from './PeptideMonographHeader';
import PeptideMonographTabs from './PeptideMonographTabs';
import PeptideMonographTopStrip from './PeptideMonographTopStrip';
import MonographTabsNavigatorDrawer from './MonographTabsNavigatorDrawer';
import OverviewTab from './OverviewTab';
import ProtocolWorkspaceTab from './ProtocolWorkspaceTab';
import PreparationTab from './PreparationTab';
import QualityBatchTab from './QualityBatchTab';
import ReferencesTab from './ReferencesTab';
import CoaModal from '../CoaModal';
import MonographPreviewModal from '../MonographPreviewModal';
import { triggerHaptic } from '@/utils/haptics';
import { LayoutTemplate, FlaskConical, Droplet, ShieldCheck, BookOpen, ChevronDown, ChevronUp } from '@/lib/icons';
import './monographWorkspace.css';

/**
 * PeptideMonographWorkspace
 * ─────────────────────────────────────────────────────────────────────────────
 * Complete, Google Cloud Console-standard Clinical Monograph & Protocol Workspace.
 *
 * Implements the 6-phase physician workflow:
 * 1. Understand the peptide (Overview)
 * 2. Select clinical protocol (Protocols)
 * 3. Configure treatment (Treatment Plan)
 * 4. Review calculated requirements (Vials)
 * 5. Prepare / administer (Preparation)
 * 6. Verify product & batch quality (Quality & Batch)
 */
export default function PeptideMonographWorkspace({
  product = {},
  slug = 'pt-141',
  effectiveBatch = 'AS-LOT-PT05-2609',
  associatedProtocols = [],
  onAddToCart
}) {
  const searchParams = useSearchParams();

  // Tab State with URL query synchronization
  const initialTab = searchParams?.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(
    ['overview', 'protocols', 'preparation', 'quality', 'references'].includes(initialTab)
      ? initialTab
      : 'overview'
  );

  // Modals state
  const [isCoaModalOpen, setIsCoaModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isTabsDrawerOpen, setIsTabsDrawerOpen] = useState(false);

  // Active Protocol Context (reactive sync across top strip & calculations)
  const [protocolContext, setProtocolContext] = useState(null);

  // Sync tab changes with URL query string without full page reload
  const handleTabChange = (tabId) => {
    triggerHaptic('selection');
    setActiveTab(tabId);
    if (typeof window !== 'undefined' && window.history?.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tabId);
      window.history.replaceState(null, '', url.toString());
    }
  };

  // Synchronize bottom floating bar (Tabs 1/5) with active tab
  React.useEffect(() => {
    const tabOrder = ['overview', 'protocols', 'preparation', 'quality', 'references'];
    const activeIndex = tabOrder.indexOf(activeTab);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('datasheet-toc-progress', {
        detail: {
          currentProgress: activeIndex >= 0 ? activeIndex + 1 : 1,
          totalSections: 5,
          hasToc: true
        }
      }));
    }
  }, [activeTab]);

  // Listen to external request from bottom sticky bar to open Tabs Navigator
  React.useEffect(() => {
    const handleOpenTabsNavigator = () => {
      triggerHaptic('light');
      setIsTabsDrawerOpen(true);
    };
    window.addEventListener('open-monograph-tabs-navigator', handleOpenTabsNavigator);
    window.addEventListener('open-datasheet-toc', handleOpenTabsNavigator);
    return () => {
      window.removeEventListener('open-monograph-tabs-navigator', handleOpenTabsNavigator);
      window.removeEventListener('open-datasheet-toc', handleOpenTabsNavigator);
    };
  }, []);

  return (
    <div className="pds-monograph-workspace-root">
      {/* 1. Compact Product Identity Header */}
      <PeptideMonographHeader
        product={product}
        slug={slug}
        effectiveBatch={effectiveBatch}
        onOpenPreviewModal={() => setIsPreviewModalOpen(true)}
        onOpenCoaModal={() => setIsCoaModalOpen(true)}
        onOpenShare={() => {
          if (navigator.share) {
            navigator.share({
              title: `${product.canonicalName || 'PT-141'} — Clinical Monograph`,
              url: window.location.href
            }).catch(() => {});
          } else {
            setIsPreviewModalOpen(true);
          }
        }}
      />

      {/* ── DESKTOP LAYOUT (≥1024px): Standard GCP Top Tabs + Full Main Grid ── */}
      <div className="pds-desktop-tabs-wrapper">
        <PeptideMonographTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          protocolCount={associatedProtocols?.length || 3}
        />

        <PeptideMonographTopStrip
          activeTab={activeTab}
          product={product}
          slug={slug}
          effectiveBatch={effectiveBatch}
          protocolContext={protocolContext}
          onOpenCoaModal={() => setIsCoaModalOpen(true)}
        />

        <div className="pds-monograph-main-grid">
          <div className="pds-monograph-task-area">
            {activeTab === 'overview' && (
              <OverviewTab
                product={product}
                onNavigateToProtocols={() => handleTabChange('protocols')}
              />
            )}

            {activeTab === 'protocols' && (
              <ProtocolWorkspaceTab
                product={product}
                associatedProtocols={associatedProtocols}
                onOpenPreviewModal={() => setIsPreviewModalOpen(true)}
                onAddToCart={onAddToCart}
                onProtocolChange={setProtocolContext}
              />
            )}

            {activeTab === 'preparation' && (
              <PreparationTab
                product={product}
                slug={slug}
                effectiveBatch={effectiveBatch}
              />
            )}

            {activeTab === 'quality' && (
              <QualityBatchTab
                product={product}
                slug={slug}
                effectiveBatch={effectiveBatch}
                onOpenCoaModal={() => setIsCoaModalOpen(true)}
              />
            )}

            {activeTab === 'references' && (
              <ReferencesTab />
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE LAYOUT (<1024px): Master Clinical Accordion (ZERO HORIZONTAL SCROLL) ── */}
      <div className="pds-mobile-accordion-wrapper">
        {/* Context Strip in Mobile */}
        <PeptideMonographTopStrip
          activeTab={activeTab}
          product={product}
          slug={slug}
          effectiveBatch={effectiveBatch}
          protocolContext={protocolContext}
          onOpenCoaModal={() => setIsCoaModalOpen(true)}
        />

        <div className="pds-mobile-accordion-stack">
          {/* Section 1: Overview */}
          <div className={`pds-mobile-accordion-item ${activeTab === 'overview' ? 'is-open' : 'is-closed'}`}>
            <div
              className="pds-mobile-accordion-header"
              onClick={() => {
                triggerHaptic('light');
                handleTabChange(activeTab === 'overview' ? '' : 'overview');
              }}
              role="button"
              tabIndex={0}
              aria-expanded={activeTab === 'overview'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: activeTab === 'overview' ? '#003666' : '#eff6ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.15s ease'
                }}>
                  <LayoutTemplate size={16} color={activeTab === 'overview' ? '#ffffff' : '#003666'} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: '0.64rem', fontWeight: 800, color: activeTab === 'overview' ? '#003666' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Módulo 1
                  </span>
                  <h3 style={{ margin: '1px 0 0 0', fontSize: '0.88rem', fontWeight: 800, color: activeTab === 'overview' ? '#003666' : '#1e293b' }}>
                    Clinical Overview & Identity
                  </h3>
                </div>
              </div>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: activeTab === 'overview' ? '#e0f2fe' : '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: activeTab === 'overview' ? '#003666' : '#64748b',
                flexShrink: 0
              }}>
                {activeTab === 'overview' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>

            {activeTab === 'overview' && (
              <div className="pds-mobile-accordion-body">
                <OverviewTab
                  product={product}
                  onNavigateToProtocols={() => handleTabChange('protocols')}
                />
              </div>
            )}
          </div>

          {/* Section 2: Protocols */}
          <div className={`pds-mobile-accordion-item ${activeTab === 'protocols' ? 'is-open' : 'is-closed'}`}>
            <div
              className="pds-mobile-accordion-header"
              onClick={() => {
                triggerHaptic('light');
                handleTabChange(activeTab === 'protocols' ? '' : 'protocols');
              }}
              role="button"
              tabIndex={0}
              aria-expanded={activeTab === 'protocols'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: activeTab === 'protocols' ? '#003666' : '#eff6ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.15s ease'
                }}>
                  <FlaskConical size={16} color={activeTab === 'protocols' ? '#ffffff' : '#003666'} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.64rem', fontWeight: 800, color: activeTab === 'protocols' ? '#003666' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Módulo 2
                    </span>
                    <span style={{ fontSize: '0.64rem', fontWeight: 800, background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '10px' }}>
                      {associatedProtocols?.length || 3} disponibles
                    </span>
                  </div>
                  <h3 style={{ margin: '1px 0 0 0', fontSize: '0.88rem', fontWeight: 800, color: activeTab === 'protocols' ? '#003666' : '#1e293b' }}>
                    Clinical Protocols & Titration
                  </h3>
                </div>
              </div>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: activeTab === 'protocols' ? '#e0f2fe' : '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: activeTab === 'protocols' ? '#003666' : '#64748b',
                flexShrink: 0
              }}>
                {activeTab === 'protocols' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>

            {activeTab === 'protocols' && (
              <div className="pds-mobile-accordion-body">
                <ProtocolWorkspaceTab
                  product={product}
                  associatedProtocols={associatedProtocols}
                  onOpenPreviewModal={() => setIsPreviewModalOpen(true)}
                  onAddToCart={onAddToCart}
                  onProtocolChange={setProtocolContext}
                />
              </div>
            )}
          </div>

          {/* Section 3: Preparation & Administration */}
          <div className={`pds-mobile-accordion-item ${activeTab === 'preparation' ? 'is-open' : 'is-closed'}`}>
            <div
              className="pds-mobile-accordion-header"
              onClick={() => {
                triggerHaptic('light');
                handleTabChange(activeTab === 'preparation' ? '' : 'preparation');
              }}
              role="button"
              tabIndex={0}
              aria-expanded={activeTab === 'preparation'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: activeTab === 'preparation' ? '#003666' : '#eff6ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.15s ease'
                }}>
                  <Droplet size={16} color={activeTab === 'preparation' ? '#ffffff' : '#003666'} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: '0.64rem', fontWeight: 800, color: activeTab === 'preparation' ? '#003666' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Módulo 3
                  </span>
                  <h3 style={{ margin: '1px 0 0 0', fontSize: '0.88rem', fontWeight: 800, color: activeTab === 'preparation' ? '#003666' : '#1e293b' }}>
                    Preparation & Administration Guide
                  </h3>
                </div>
              </div>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: activeTab === 'preparation' ? '#e0f2fe' : '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: activeTab === 'preparation' ? '#003666' : '#64748b',
                flexShrink: 0
              }}>
                {activeTab === 'preparation' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>

            {activeTab === 'preparation' && (
              <div className="pds-mobile-accordion-body">
                <PreparationTab
                  product={product}
                  slug={slug}
                  effectiveBatch={effectiveBatch}
                />
              </div>
            )}
          </div>

          {/* Section 4: Quality & Batch */}
          <div className={`pds-mobile-accordion-item ${activeTab === 'quality' ? 'is-open' : 'is-closed'}`}>
            <div
              className="pds-mobile-accordion-header"
              onClick={() => {
                triggerHaptic('light');
                handleTabChange(activeTab === 'quality' ? '' : 'quality');
              }}
              role="button"
              tabIndex={0}
              aria-expanded={activeTab === 'quality'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: activeTab === 'quality' ? '#003666' : '#eff6ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.15s ease'
                }}>
                  <ShieldCheck size={16} color={activeTab === 'quality' ? '#ffffff' : '#003666'} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: '0.64rem', fontWeight: 800, color: activeTab === 'quality' ? '#003666' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Módulo 4
                  </span>
                  <h3 style={{ margin: '1px 0 0 0', fontSize: '0.88rem', fontWeight: 800, color: activeTab === 'quality' ? '#003666' : '#1e293b' }}>
                    Quality, HPLC & Verified Batch
                  </h3>
                </div>
              </div>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: activeTab === 'quality' ? '#e0f2fe' : '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: activeTab === 'quality' ? '#003666' : '#64748b',
                flexShrink: 0
              }}>
                {activeTab === 'quality' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>

            {activeTab === 'quality' && (
              <div className="pds-mobile-accordion-body">
                <QualityBatchTab
                  product={product}
                  slug={slug}
                  effectiveBatch={effectiveBatch}
                  onOpenCoaModal={() => setIsCoaModalOpen(true)}
                />
              </div>
            )}
          </div>

          {/* Section 5: References */}
          <div className={`pds-mobile-accordion-item ${activeTab === 'references' ? 'is-open' : 'is-closed'}`}>
            <div
              className="pds-mobile-accordion-header"
              onClick={() => {
                triggerHaptic('light');
                handleTabChange(activeTab === 'references' ? '' : 'references');
              }}
              role="button"
              tabIndex={0}
              aria-expanded={activeTab === 'references'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: activeTab === 'references' ? '#003666' : '#eff6ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.15s ease'
                }}>
                  <BookOpen size={16} color={activeTab === 'references' ? '#ffffff' : '#003666'} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: '0.64rem', fontWeight: 800, color: activeTab === 'references' ? '#003666' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Módulo 5
                  </span>
                  <h3 style={{ margin: '1px 0 0 0', fontSize: '0.88rem', fontWeight: 800, color: activeTab === 'references' ? '#003666' : '#1e293b' }}>
                    References, Evidence & Literature
                  </h3>
                </div>
              </div>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: activeTab === 'references' ? '#e0f2fe' : '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: activeTab === 'references' ? '#003666' : '#64748b',
                flexShrink: 0
              }}>
                {activeTab === 'references' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>

            {activeTab === 'references' && (
              <div className="pds-mobile-accordion-body">
                <ReferencesTab />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabs Quick Navigator Drawer (Triggered from bottom floating bar) ── */}
      <MonographTabsNavigatorDrawer
        isOpen={isTabsDrawerOpen}
        onClose={() => setIsTabsDrawerOpen(false)}
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        protocolCount={associatedProtocols?.length || 3}
      />

      {/* ── Institutional Modals ── */}
      <CoaModal
        product={product}
        isOpen={isCoaModalOpen}
        onClose={() => setIsCoaModalOpen(false)}
      />

      <MonographPreviewModal
        product={product}
        slug={slug}
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
      />
    </div>
  );
}
