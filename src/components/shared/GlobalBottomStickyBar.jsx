'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { FileText, ShoppingBag, Calculator, FlaskConical, Compass, Syringe } from 'lucide-react';
import FloatingActionDock from './public/FloatingActionDock';
import { useAtlasContext } from '@/context/AtlasContextProvider';
import { usePublicWorkspace } from '@/context/PublicWorkspaceContext';

/**
 * GlobalBottomStickyBar
 * ─────────────────────────────────────────────────────────────────────────────
 * Universal Apple-Glassmorphism bottom sticky bar across all public & catalog
 * screens (Golden Rule #69).
 * - Hosts the SINGLE Atlas AI trigger and Sections outline trigger (desktop & mobile).
 * - Automatically personalizes its summary and actions from `AtlasContextProvider`
 *   or route-aware defaults.
 */
export default function GlobalBottomStickyBar() {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const { screenContext, openAtlasAi } = useAtlasContext();
  const { currency, isSpanish, rfqItems, setIsQuoteDrawerOpen } = usePublicWorkspace();
  const [tocProgress, setTocProgress] = useState({
    currentProgress: 1,
    totalSections: 0,
    hasToc: false,
  });

  // Reset TOC progress on route change
  useEffect(() => {
    setTocProgress({ currentProgress: 1, totalSections: 0, hasToc: false });
  }, [pathname]);

  // Listen to live TOC section progress dispatched by sidebars / outlines
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handleTocUpdate = (e) => {
      if (e?.detail) {
        setTocProgress({
          currentProgress: e.detail.currentProgress || 1,
          totalSections: e.detail.totalSections || 0,
          hasToc: true,
        });
      }
    };
    window.addEventListener('datasheet-toc-progress', handleTocUpdate);
    return () => window.removeEventListener('datasheet-toc-progress', handleTocUpdate);
  }, []);

  const resolvedConfig = useMemo(() => {
    // 1. Live page-registered bottomBar takes top priority
    if (screenContext?.bottomBar) {
      return screenContext.bottomBar;
    }

    const isClinicalNonQuoteRoute = pathname.startsWith('/rx') || pathname.startsWith('/verify');
    const quoteAction =
      !isClinicalNonQuoteRoute && rfqItems.length > 0
        ? {
            label: isSpanish ? `Cotización (${rfqItems.length})` : `Quote (${rfqItems.length})`,
            icon: <ShoppingBag size={14} />,
            onClick: () => setIsQuoteDrawerOpen(true),
          }
        : null;

    if (pathname.startsWith('/pricing/peptides')) {
      return {
        summaryTitle: isSpanish ? 'Tarifa Oficial de Péptidos' : 'Official Peptides Schedule',
        summarySubtitle: `${currency} · Atlas Health Services`,
        atlasAiLabel: isSpanish ? 'Consultar a Atlas AI' : 'Ask Atlas AI',
        secondaryAction: quoteAction,
        primaryAction: {
          label: isSpanish ? 'Calculadora' : 'Dosing Calculator',
          icon: <Calculator size={14} />,
          onClick: () => router.push('/calculator'),
        },
      };
    }

    if (pathname.startsWith('/pricing/24genetics') || pathname.startsWith('/pricing/24genomics')) {
      return {
        summaryTitle: '24Genetics Clinical DNA Panels',
        summarySubtitle: `${currency} · CE-IVD Genomics`,
        atlasAiLabel: isSpanish ? 'Consultar Paneles AI' : 'Ask Atlas AI',
        secondaryAction: quoteAction,
        primaryAction: {
          label: isSpanish ? 'Explorar Protocolos' : 'Clinical Protocols',
          icon: <FlaskConical size={14} />,
          onClick: () => router.push('/proto'),
        },
      };
    }

    if (pathname.startsWith('/pricing/pellets')) {
      return {
        summaryTitle: isSpanish ? 'Pellets Hormonales Subcutáneos' : 'Pharmapolis Hormone Pellets',
        summarySubtitle: isSpanish ? 'Terapia EU GMP · Trócares Quirúrgicos' : 'EU GMP Subcutaneous Therapy · Surgical Trocars',
        atlasAiLabel: isSpanish ? 'Consultar a Atlas AI' : 'Ask Atlas AI',
        secondaryAction: quoteAction,
        primaryAction: {
          label: isSpanish ? 'Guía de Trócar' : 'Trocar Guide',
          icon: <Syringe size={14} />,
          onClick: () => router.push('/guides/hormone-pellets-implantation'),
        },
      };
    }

    if (pathname.startsWith('/pricing')) {
      return {
        summaryTitle: isSpanish ? 'Directorio de Tarifas B2B' : 'Institutional Price Schedules',
        summarySubtitle: `${currency} · Atlas Verified Network`,
        atlasAiLabel: isSpanish ? 'Consultar a Atlas AI' : 'Ask Atlas AI',
        secondaryAction: quoteAction,
        primaryAction: {
          label: isSpanish ? 'Ver Viales' : 'Peptide Vials',
          icon: <FlaskConical size={14} />,
          onClick: () => router.push('/vials'),
        },
      };
    }

    if (pathname.startsWith('/vials')) {
      return {
        summaryTitle: isSpanish ? 'Portafolio de Péptidos en Vial' : 'Lyophilized Peptide Vials',
        summarySubtitle: isSpanish ? 'Pureza HPLC ≥99% · Catálogo Clínico' : 'HPLC ≥99% Purity · Clinical Portfolio',
        atlasAiLabel: isSpanish ? 'Consultar a Atlas AI' : 'Ask Atlas AI',
        secondaryAction: quoteAction,
        primaryAction: {
          label: isSpanish ? 'Calculadora' : 'Dosing Calculator',
          icon: <Calculator size={14} />,
          onClick: () => router.push('/calculator'),
        },
      };
    }

    if (pathname.startsWith('/p/') || pathname.startsWith('/raw/')) {
      const isCosmeceutical =
        pathname.toLowerCase().includes('colway') ||
        screenContext?.contextAnchor?.type === 'cosmeceutical';
      const title =
        screenContext?.contextAnchor?.name ||
        screenContext?.contextAnchor?.sectionTitle ||
        (isCosmeceutical ? (isSpanish ? 'Ficha Cosmecéutica' : 'Cosmeceutical Dossier') : 'Clinical Monograph');
      return {
        summaryTitle: title,
        summarySubtitle: isCosmeceutical
          ? (isSpanish ? 'Línea Celular & Dermatológica' : 'Cellular & Dermatological Line')
          : (isSpanish ? 'Monografía Técnica & Especificaciones' : 'Clinical Monograph & Specifications'),
        atlasAiLabel: isSpanish ? 'Consultar a Atlas AI' : 'Ask Atlas AI',
        secondaryAction: quoteAction,
        primaryAction: {
          label: isSpanish ? 'Tarifas B2B' : 'Price Schedules',
          icon: <FileText size={14} />,
          onClick: () => router.push(isCosmeceutical ? '/pricing/colway' : '/pricing'),
        },
      };
    }

    if (pathname.startsWith('/proto')) {
      return {
        summaryTitle: screenContext?.contextAnchor?.sectionTitle || (isSpanish ? 'Protocolos Clínicos' : 'Clinical Protocols'),
        summarySubtitle: isSpanish ? 'Vías Terapéuticas y Dosificación' : 'Therapeutic Pathways & Dosing',
        atlasAiLabel: isSpanish ? 'Consultar Protocolo AI' : 'Ask Atlas AI',
        secondaryAction: quoteAction,
        primaryAction: {
          label: isSpanish ? 'Calculadora' : 'Calculator',
          icon: <Calculator size={14} />,
          onClick: () => router.push('/calculator'),
        },
      };
    }

    if (pathname.startsWith('/calculator')) {
      return { hidden: true };
    }

    return {
      summaryTitle: 'Atlas Health Services',
      summarySubtitle: isSpanish ? 'Medicina de Precisión y Regenerativa' : 'Precision & Regenerative Medicine',
      atlasAiLabel: isSpanish ? 'Preguntar a Atlas AI' : 'Ask Atlas AI',
      secondaryAction: quoteAction,
      primaryAction: {
        label: isSpanish ? 'Explorar Tarifas' : 'Price Schedules',
        icon: <FileText size={14} />,
        onClick: () => router.push('/pricing'),
      },
    };
  }, [screenContext, pathname, currency, isSpanish, rfqItems.length, setIsQuoteDrawerOpen, router]);

  if (resolvedConfig?.hidden) {
    return null;
  }

  const hasSectionsOutline = Boolean(
    resolvedConfig?.showSections || resolvedConfig?.onOpenSections || tocProgress.hasToc
  );
  const totalSections = resolvedConfig?.sectionsCount ?? tocProgress.totalSections;
  const activeSection = resolvedConfig?.activeSectionIndex ?? tocProgress.currentProgress;

  const sectionsAction = hasSectionsOutline
    ? {
        label: resolvedConfig?.sectionsLabel || (isSpanish ? 'Secciones' : 'Sections'),
        countLabel: totalSections > 0 ? `${activeSection || 1}/${totalSections}` : null,
        onClick: () => {
          if (resolvedConfig?.onOpenSections) {
            resolvedConfig.onOpenSections();
          } else if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('open-datasheet-toc'));
          }
        },
      }
    : null;

  const handleOpenAi = () => {
    if (resolvedConfig?.onOpenAtlasAi) {
      resolvedConfig.onOpenAtlasAi();
    } else {
      openAtlasAi();
    }
  };

  if (pathname?.startsWith('/labels')) {
    return null;
  }

  return (
    <div
      className="no-print"
      style={{
        position: 'sticky',
        bottom: '0.75rem',
        zIndex: 42,
        padding: '0 0.75rem',
        pointerEvents: 'none',
      }}
    >
      <div style={{ pointerEvents: 'auto' }}>
        <FloatingActionDock
          summaryTitle={resolvedConfig.summaryTitle}
          summarySubtitle={resolvedConfig.summarySubtitle}
          badge={resolvedConfig.badge || null}
          showAtlasAi={resolvedConfig.showAtlasAi !== false}
          atlasAiLabel={resolvedConfig.atlasAiLabel || 'Ask Atlas AI'}
          onOpenAtlasAi={handleOpenAi}
          showQr={resolvedConfig.showQr !== false}
          qrLabel={resolvedConfig.qrLabel || (isSpanish ? 'Código QR' : 'QR Code')}
          sectionsAction={sectionsAction}
          secondaryAction={resolvedConfig.secondaryAction || null}
          primaryAction={resolvedConfig.primaryAction || null}
        />
      </div>
    </div>
  );
}
