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

      {/* 2. Top-Level GCP Navigation Tabs */}
      <PeptideMonographTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        protocolCount={associatedProtocols?.length || 3}
      />

      {/* 3. Authoritative Top Context & Telemetry Strip (GCP Standard) */}
      <PeptideMonographTopStrip
        activeTab={activeTab}
        product={product}
        slug={slug}
        effectiveBatch={effectiveBatch}
        protocolContext={protocolContext}
        onOpenCoaModal={() => setIsCoaModalOpen(true)}
      />

      {/* 4. Full-Width Main Workspace Area (100% liberated horizontal space) */}
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
