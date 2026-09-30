"use client";

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PeptideMonographHeader from './PeptideMonographHeader';
import PeptideMonographTabs from './PeptideMonographTabs';
import OverviewTab from './OverviewTab';
import ProtocolWorkspaceTab from './ProtocolWorkspaceTab';
import PreparationTab from './PreparationTab';
import QualityBatchTab from './QualityBatchTab';
import ReferencesTab from './ReferencesTab';
import ContextualRightSidebar from './ContextualRightSidebar';
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

  // Active Protocol Context (reactive sync across center workspace & right task panel)
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

      {/* 3. Main Dual-Column Content Grid (Single-column on mobile) */}
      <div className="pds-monograph-main-grid">
        {/* Main Task Area */}
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

        {/* Contextual Right Panel (Adapts full-width on mobile below main task) */}
        <aside className="pds-monograph-sidebar-wrapper">
          <ContextualRightSidebar
            activeTab={activeTab}
            slug={slug}
            effectiveBatch={effectiveBatch}
            protocolContext={protocolContext}
            onOpenCoaModal={() => setIsCoaModalOpen(true)}
          />
        </aside>
      </div>

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
