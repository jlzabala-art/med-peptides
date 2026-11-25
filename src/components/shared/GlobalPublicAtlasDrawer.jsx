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
          sectionTitle: 'EU GMP Subcutaneous Bioidentical Hormone Pellets & Surgical Trocar Kits',
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

    if (pathname.startsWith('/labels')) {
      return {
        contextType: 'catalog',
        storageKey: 'pharmacy-labels-studio',
        contextAnchor: {
          sectionTitle: 'Atlas Pharmacy Labels Studio & Multi-Part Rx Entry',
          keyActives: 'Thermal pharmacy labels, batch/BUD compliance, TrichoTest/AcneTest/TeloTest multi-part formulations, A4 offset printing',
          mechanisms: 'Quick Manual Rx multi-part entry, live PharmapolisLabelSvg preview, A4 batch printing, and worklist queue management.',
        },
      };
    }

    if (pathname.startsWith('/calculator')) {
      return {
        contextType: 'catalog',
        storageKey: 'dosing-calculator',
        contextAnchor: {
          sectionTitle: 'Universal Peptide Reconstitution & Dosing Guide',
          keyActives: 'Lyophilized vials, U-100 syringes (0.3/0.5/1.0 mL), BAC water dilution, pre-filled U-100 pens, nasal sprays',
          mechanisms: 'Exact mg/mcg to U-100 units and pen clicks conversion, vial yield, and 28-day cold-chain stability.',
        },
      };
    }

    if (pathname.startsWith('/proto')) {
      return {
        contextType: 'protocol',
        storageKey: 'clinical-protocols',
        contextAnchor: {
          sectionTitle: 'Atlas Evidence-Based Clinical Protocols',
          keyActives: 'GLP-1/GIP metabolism, BPC-157/TB-500 tissue repair, CJC/Ipamorelin GH axis, NAD+/Epitalon longevity',
          mechanisms: 'Titration schedules, clinical biomarkers, companion Bloodo DBS tests, and full stack B2B quoting.',
        },
      };
    }

    if (pathname.startsWith('/pricing/24genetics') || pathname.startsWith('/pricing/24genomics')) {
      return {
        contextType: 'catalog',
        storageKey: 'pricing-24genetics',
        contextAnchor: {
          sectionTitle: '24Genetics CE-IVD Clinical DNA Panels & Genomics',
          keyActives: 'Nutrigenomics, Pharmacogenetics, Health, Skin, Sport, and Trichology/Telomere DNA panels',
          mechanisms: 'Saliva DNA kit workflows, compounding personalization, and B2B wholesale/clinic tiers.',
        },
      };
    }

    if (pathname.startsWith('/pricing/nplab-hormones')) {
      return {
        contextType: 'catalog',
        storageKey: 'pricing-nplab-hormones',
        contextAnchor: {
          sectionTitle: 'Bioidentical Hormones & Endocrinology Schedule',
          keyActives: 'Micronized testosterone, estradiol, progesterone, DHEA, and endocrine compounding formulations',
          mechanisms: 'BHRT clinical dosing, wholesale pricing tiers, and cross-catalog quote cart.',
        },
      };
    }

    if (pathname.startsWith('/doctor') || pathname.startsWith('/dr/')) {
      return {
        contextType: 'catalog',
        storageKey: 'doctor-portal',
        contextAnchor: {
          sectionTitle: 'Physician Clinical Workstation & Prescriptions',
          keyActives: 'Patient prescriptions, refill alerts, DNA analysis tabs, compounded customizers, and clinical protocols',
          mechanisms: 'Prescribing workflows, patient onboarding, and longitudinal biomarker tracking.',
        },
      };
    }

    if (pathname.startsWith('/patient')) {
      return {
        contextType: 'catalog',
        storageKey: 'patient-portal',
        contextAnchor: {
          sectionTitle: 'Patient Care & Precision Dosing Portal',
          keyActives: 'Active prescriptions, daily administration schedule, DNA report insights, and express refill requests',
          mechanisms: 'Clear step-by-step dosing guidance, cold-chain storage, and physician contact.',
        },
      };
    }

    if (pathname.startsWith('/admin')) {
      return {
        contextType: 'catalog',
        storageKey: 'admin-console',
        contextAnchor: {
          sectionTitle: 'Atlas Admin Operations & Catalog Governance Console',
          keyActives: 'Firestore products, supplier offers, prescriptions, orders, physicians, clinics, and Zoho/Algolia sync',
          mechanisms: 'Canonical pricing governance, SKU auditing, and operational order management.',
        },
      };
    }

    if (pathname.startsWith('/wholesaler') || pathname.startsWith('/clinic')) {
      return {
        contextType: 'catalog',
        storageKey: 'partner-portal',
        contextAnchor: {
          sectionTitle: 'Partner, Clinic & Wholesaler B2B Portal',
          keyActives: 'B2B schedules, clinic allocations, referral tracking, and institutional quotes',
          mechanisms: 'Wholesale tier management, margin calculation, and consolidated RFQ workflows.',
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
    pathname.startsWith('/dr/') ||
    pathname.startsWith('/rx/');

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
