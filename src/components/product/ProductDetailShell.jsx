'use client';

import React, { useState } from 'react';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import AtlasLeftRailLayout from '@/components/shared/layouts/AtlasLeftRailLayout';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { useRegisterAtlasContext } from '@/context/AtlasContextProvider';
import PublicInstitutionalInquiryDrawer from '@/components/shared/PublicInstitutionalInquiryDrawer';
import ShareProductMonographDrawer from '@/components/admin/catalog/drawers/ShareProductMonographDrawer';

/**
 * ProductDetailShell — Canonical Pillar 1 Product Monograph Shell
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared outer GCP Console shell for `/p/[slug]` product domains:
 *  - PublicUnifiedHeader + Breadcrumb
 *  - Always-Left 4-zone AtlasLeftRailLayout (with 64px laptop Mini-Rail & mobile drawer)
 *  - Unified Atlas AI context registration
 *  - Shared Inquiry & Monograph Share Drawers
 */
export default function ProductDetailShell({
  product = {},
  slug = '',
  baseUrl = 'https://www.atlashealth-services.com',
  currentBrand = '',
  breadcrumbItems = [],
  railTitle = '',
  railStatus = 'published',
  railStatusLabel = '',
  railEntityId = '',
  railNavTitle = 'Sections',
  railNavItems = [],
  activeNavId = '',
  onSelectNav = null,
  railPropertiesTitle = 'Specifications',
  railProperties = [],
  railLinks = [],
  railPrimaryAction = null,
  railSecondaryActions = [],
  extraRailContent = null,
  storageKey = 'atlas_product_left_rail_v1',
  mobileTriggerLabel = 'Sections & Specs',
  atlasContextConfig = null,
  inquiryInitialNotes = '',
  containerClassName = 'atlas-page-bg',
  children,
}) {
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  useRegisterAtlasContext(
    atlasContextConfig
      ? {
          ...atlasContextConfig,
          onRequestQuote: atlasContextConfig.onRequestQuote || (() => setIsInquiryOpen(true)),
        }
      : null
  );

  const mergedPrimaryAction = railPrimaryAction
    ? {
        ...railPrimaryAction,
        onClick: railPrimaryAction.onClick || (() => setIsInquiryOpen(true)),
      }
    : null;

  const mergedSecondaryActions = railSecondaryActions.map((act) => ({
    ...act,
    onClick:
      act.kind === 'share'
        ? () => setIsShareOpen(true)
        : act.kind === 'inquiry'
          ? () => setIsInquiryOpen(true)
          : act.onClick,
  }));

  return (
    <div className={containerClassName} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <PublicUnifiedHeader
        currentBrand={currentBrand || product.brand || ''}
        breadcrumb={breadcrumbItems}
      />

      <main style={{ width: '100%', maxWidth: '1320px', margin: '0 auto', padding: '1rem 1.25rem 3.5rem', flex: 1 }}>
        {breadcrumbItems.length > 0 && (
          <div style={{ marginBottom: '0.25rem' }}>
            <Breadcrumb items={breadcrumbItems} />
          </div>
        )}

        <AtlasLeftRailLayout
          title={railTitle || product.name || slug}
          status={railStatus}
          statusLabel={railStatusLabel}
          entityId={railEntityId || product.sku || product.id || slug}
          navTitle={railNavTitle}
          navItems={railNavItems}
          activeNavId={activeNavId}
          onSelectNav={onSelectNav}
          propertiesTitle={railPropertiesTitle}
          properties={railProperties}
          links={railLinks}
          primaryAction={mergedPrimaryAction}
          secondaryActions={mergedSecondaryActions}
          extraRailContent={extraRailContent}
          storageKey={storageKey}
          mobileTriggerLabel={mobileTriggerLabel}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
            {children({
              openInquiry: () => setIsInquiryOpen(true),
              openShare: () => setIsShareOpen(true),
            })}
          </div>
        </AtlasLeftRailLayout>
      </main>

      <PublicUnifiedFooter />

      <PublicInstitutionalInquiryDrawer
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        product={{
          id: product.id || slug,
          name: product.name || slug,
          slug,
          brand: product.brand || currentBrand,
          category: product.category || 'equipment',
          initialNotes: inquiryInitialNotes,
        }}
      />

      <ShareProductMonographDrawer
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        product={{
          id: product.id || slug,
          name: product.name || slug,
          slug,
          brand: product.brand || currentBrand,
          shortDescription: product.shortDesc || product.description || '',
          canonicalUrl: `${baseUrl}/p/${slug}`,
        }}
      />
    </div>
  );
}
