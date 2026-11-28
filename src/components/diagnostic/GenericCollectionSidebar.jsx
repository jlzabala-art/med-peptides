'use client';

import React, { useMemo } from 'react';
import { Lock, Mail } from '@/lib/icons';
import GcpFilterRail from '@/components/ui/GcpFilterRail';

export default function GenericCollectionSidebar({
  brandSlug = 'peptides',
  config,
  categories = [],
  selectedCategory = 'all',
  onSelectCategory = () => {},
  totalCount = 0,
  onOpenInquiry = null,
  activePriceTier = 'clinic',
  onSelectPriceTier = null,
  userRole = 'clinic',
  isAuthenticated = false,
  onUnlockRequest = null,
}) {
  const canonicalUrl = `https://www.atlashealth-services.com/collection/${brandSlug}`;
  const isAdmin = userRole === 'admin' || userRole === 'medical_director';
  const isHairTreatments = ['hair-treatments', 'hair-treatment', 'trichology', 'hair', 'trichotest'].includes(brandSlug);

  const sections = useMemo(() => {
    const result = [];
    const displayCategories = categories.filter(
      (c) =>
        c.id !== 'all' &&
        c.id !== 'all-peptides' &&
        c.id !== 'all-formulations' &&
        !c.label?.toLowerCase().includes('all peptides')
    );

    if (displayCategories.length > 0) {
      result.push({
        id: 'collection-categories',
        title: isHairTreatments ? 'Trichology Sections' : 'Categories',
        totalLabel: `${totalCount} Total`,
        defaultOpen: true,
        items: displayCategories.map((cat) => ({
          id: cat.id,
          label: cat.label,
          count: cat.count > 0 ? cat.count : undefined,
          active: selectedCategory === cat.id,
          onClick: () => onSelectCategory(cat.id),
        })),
      });
    }

    if (isAuthenticated && onSelectPriceTier) {
      const tiers = [
        { id: 'wholesaler', label: 'Wholesaler Tier', visible: true },
        { id: 'clinic', label: 'Clinic / Doctor Tier', visible: true },
        { id: 'cost', label: 'Base Cost Price', visible: isAdmin },
      ].filter((t) => t.visible);

      result.push({
        id: 'b2b-pricing-tier',
        title: 'B2B Pricing Profile',
        defaultOpen: true,
        items: tiers.map((tier) => ({
          id: `tier-${tier.id}`,
          label: tier.label,
          active: activePriceTier === tier.id,
          onClick: () => onSelectPriceTier(tier.id),
        })),
      });
    }

    return result;
  }, [
    categories,
    isHairTreatments,
    totalCount,
    selectedCategory,
    onSelectCategory,
    isAuthenticated,
    onSelectPriceTier,
    isAdmin,
    activePriceTier,
  ]);

  const actions = {
    copyUrl: canonicalUrl,
    copyLabel: 'Share Collection Link',
    copiedLabel: 'Copied to Clipboard',
    ...(onOpenInquiry
      ? {
          primaryCta: {
            label: 'Institutional Inquiry / Quote',
            onClick: onOpenInquiry,
            icon: Mail,
          },
        }
      : {}),
  };

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', position: 'sticky', top: '84px' }}>
      <GcpFilterRail
        asRailContainer={false}
        title={config?.title || undefined}
        subtitle={config?.subtitle || undefined}
        sections={sections}
        actions={actions}
      >
        {!isAuthenticated && (
          <div className="gcp-sb-card">
            <div style={{ padding: '0.9rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={14} style={{ color: 'var(--gcp-sb-accent, #1a73e8)' }} />
                <span className="gcp-sb-section-title gcp-sb-section-title--static" style={{ padding: 0 }}>
                  B2B Pricing Locked
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--gcp-sb-text-secondary, #5f6368)', lineHeight: 1.45 }}>
                Wholesale tiers, distributor rates, and compounding costs are reserved for verified medical clinics.
              </p>
              {onUnlockRequest && (
                <button
                  type="button"
                  onClick={onUnlockRequest}
                  className="gcp-btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', color: '#3c4043' }}
                >
                  <span>Sign In to Unlock Tiers</span>
                </button>
              )}
            </div>
          </div>
        )}
      </GcpFilterRail>
    </aside>
  );
}
