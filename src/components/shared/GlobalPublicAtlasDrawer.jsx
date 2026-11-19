'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import PublicAtlasAIDrawer from './PublicAtlasAIDrawer';
import { useAtlasContext } from '@/context/AtlasContextProvider';

/**
 * GlobalPublicAtlasDrawer
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides a single, consistent Atlas AI research assistant across all public
 * routes without requiring each page to manually mount <PublicAtlasAIDrawer />.
 *
 * Automatically derives route-aware context from the URL and listens to
 * `set-public-atlas-context` for richer page-specific metadata.
 * Suppresses itself when a page-level PublicAtlasAIDrawer is already mounted.
 */
export default function GlobalPublicAtlasDrawer() {
  const pathname = usePathname() || '/';
  const [hasPageDrawer, setHasPageDrawer] = useState(false);
  const { screenContext } = useAtlasContext();
  const [customContext, setCustomContext] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncMountState = () => {
      setHasPageDrawer(Boolean(window.__publicAtlasPageMounted > 0));
    };
    syncMountState();
    window.addEventListener('public-atlas-mount-change', syncMountState);
    return () => window.removeEventListener('public-atlas-mount-change', syncMountState);
  }, []);

  useEffect(() => {
    setCustomContext(null);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleContext = (e) => {
      if (e?.detail) setCustomContext(e.detail);
    };
    window.addEventListener('set-public-atlas-context', handleContext);
    return () => window.removeEventListener('set-public-atlas-context', handleContext);
  }, []);

  const routeContext = useMemo(() => {
    const activeCtx = screenContext || customContext;
    if (activeCtx) return activeCtx;

    if (pathname.startsWith('/pricing/pellets')) {
      return {
        contextType: 'catalog',
        storageKey: 'pricing-pellets',
        contextAnchor: {
          sectionTitle: 'Pharmapolis Subcutaneous Bioidentical Hormone Pellets & Surgical Trocar Kits',
          keyActives: '17β-Estradiol, Biest, Micronized Testosterone (USP), Progesterone (P4), Testosterone + Anastrozole, Single-Use Surgical Trocars (3.2mm & 4.5mm)',
          mechanisms: 'EU GMP sterile crystalline compressed implants, validated E-Beam SAL 10⁻⁶, zero-order release kinetics over 3.5 to 6 months, 0% hepatic first-pass bypass, wholesale unit and pack-of-10 institutional pricing tiers.',
        },
      };
    }

    if (pathname.startsWith('/pricing/pens') || pathname.startsWith('/pricing/dnlab-pens')) {
      return {
        contextType: 'pens_formulary',
        storageKey: 'pricing-pens-v2',
        lang: 'en',
        contextAnchor: {
          type: 'pens_pricing',
          name: 'Peptide Pen Dosing Guide · 27 Formulas (45 SKUs)',
          badgeLabel: 'U-100 · 2–8°C',
          sectionTitle: 'Atlas Health Pre-filled Multi-Dose Peptide Pens · U-100 Clinical Formulary',
          keyActives: '27 sterile multi-dose peptide pens (45 harmonized strength SKUs across 2 mL, 2.4 mL, and 3 mL cartridges) with mechanical U-100 dial conversion (100 clicks = 1 mL; 1 click = 0.01 mL).',
          mechanisms: 'Precision mechanical U-100 click-dial dosing (100 clicks = 1 mL, 1 click = 0.01 mL). Sterile pre-filled cartridges requiring zero reconstitution or bacteriostatic water mixing. Compatible with 31G/32G × 4 mm pen needles; 2°C–8°C cold-chain stability (30-day BUD once pierced).',
          welcomeIntro: 'Explore U-100 click matrices by clinical specialty, launch 1-click multi-pen protocol presets, or ask about dosing, cartridge yields, and biomarker monitoring.',
        },
      };
    }

    if (pathname.startsWith('/pricing/peptides')) {
      return {
        contextType: 'catalog',
        storageKey: 'pricing-peptides',
        contextAnchor: {
          sectionTitle: 'Atlas Peptides Price Schedule & Clinical Formulations',
          keyActives: 'Research & clinical peptides, bacteriostatic water, sterile compounding supplies',
          mechanisms: 'Pricing tiers, wholesale vs clinic rates, and clinical formulation specifications.',
        },
      };
    }

    if (pathname.startsWith('/pricing/colway')) {
      return {
        contextType: 'catalog',
        storageKey: `pricing-${pathname.split('/').pop() || 'colway'}`,
        contextAnchor: {
          sectionTitle: 'Colway Clinical Cellular & Trichology Portfolio',
          keyActives: 'Bioactive native collagen, tropocollagen, trichology actives',
          mechanisms: 'Wholesale, Clinic, and Retail MSRP schedules, SKU formats, and application protocols.',
        },
      };
    }

    if (pathname.startsWith('/pricing')) {
      return {
        contextType: 'catalog',
        storageKey: 'pricing-directory',
        contextAnchor: {
          sectionTitle: 'Institutional Price Schedules & Commercial Agreements',
          keyActives: 'Multi-brand clinical portfolios, genomics, peptides, and derma-cellular lines',
          mechanisms: 'Commercial pricing structure, currency conversion, and B2B wholesale terms.',
        },
      };
    }

    if (pathname.startsWith('/collection/') || pathname.startsWith('/c/')) {
      const slug = pathname.split('/').pop() || 'collection';
      return {
        contextType: 'catalog',
        storageKey: `collection-${slug}`,
        contextAnchor: {
          sectionTitle: `Collection: ${slug.replace(/-/g, ' ').toUpperCase()}`,
          keyActives: 'Curated clinical formulations and protocol-ready SKUs',
          mechanisms: 'Product comparison, dosing formats, and clinical indications.',
        },
      };
    }

    if (pathname.startsWith('/dr/') || pathname.startsWith('/nutritionist/')) {
      return {
        contextType: 'catalog',
        storageKey: `practitioner-${pathname.split('/').pop() || 'portal'}`,
        contextAnchor: {
          sectionTitle: 'Practitioner Clinical Portal',
          keyActives: 'Authorized physician protocols, diagnostic panels, and patient care pathways',
          mechanisms: 'Clinical guidance, protocol selection, and patient onboarding.',
        },
      };
    }

    return {
      contextType: 'catalog',
      storageKey: `public-${pathname.replace(/[^a-z0-9]/gi, '_').slice(0, 40) || 'home'}`,
      contextAnchor: null,
    };
  }, [pathname, customContext, screenContext]);

  const hasSpecializedCopilot =
    pathname.startsWith('/pricing/peptides') ||
    pathname.startsWith('/b2b/lotusland') ||
    pathname.startsWith('/dr/');

  if (hasPageDrawer || hasSpecializedCopilot) return null;

  return (
    <PublicAtlasAIDrawer
      isGlobalFallback={true}
      hideFloatingTrigger={true}
      contextType={routeContext.contextType || 'catalog'}
      contextAnchor={routeContext.contextAnchor || null}
      catalogInventory={routeContext.catalogInventory || []}
      storageKey={routeContext.storageKey || 'public-global'}
      lang={routeContext.lang || routeContext.contextAnchor?.lang || 'en'}
    />
  );
}
