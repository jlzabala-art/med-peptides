'use client';

import React, { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { FileText, ShoppingBag, Calculator, FlaskConical, Compass } from 'lucide-react';
import FloatingActionDock from './public/FloatingActionDock';
import { useAtlasContext } from '@/context/AtlasContextProvider';
import { usePublicWorkspace } from '@/context/PublicWorkspaceContext';

/**
 * GlobalBottomStickyBar
 * ─────────────────────────────────────────────────────────────────────────────
 * Universal Apple-Glassmorphism bottom sticky bar across all public & catalog
 * screens (Golden Rule #69).
 * - Hosts the SINGLE Atlas AI trigger on the platform (never duplicated in header/FAB).
 * - Automatically personalizes its summary and actions from `AtlasContextProvider`
 *   or route-aware defaults.
 */
export default function GlobalBottomStickyBar() {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const { screenContext, openAtlasAi } = useAtlasContext();
  const { currency, isSpanish, rfqItems, setIsQuoteDrawerOpen } = usePublicWorkspace();

  const resolvedConfig = useMemo(() => {
    // 1. Live page-registered bottomBar takes top priority
    if (screenContext?.bottomBar) {
      return screenContext.bottomBar;
    }

    const quoteAction =
      rfqItems.length > 0
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

    if (pathname.startsWith('/p/') || pathname.startsWith('/raw/')) {
      const title = screenContext?.contextAnchor?.name || screenContext?.contextAnchor?.sectionTitle || 'Clinical Monograph';
      return {
        summaryTitle: title,
        summarySubtitle: isSpanish ? 'Monografía Técnica & Especificaciones' : 'Clinical Monograph & Specifications',
        atlasAiLabel: isSpanish ? 'Consultar Monografía AI' : 'Ask Atlas AI',
        secondaryAction: quoteAction,
        primaryAction: {
          label: isSpanish ? 'Tarifas B2B' : 'Price Schedules',
          icon: <FileText size={14} />,
          onClick: () => router.push('/pricing'),
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
      return {
        summaryTitle: isSpanish ? 'Calculadora de Reconstitución' : 'Reconstitution & Dosing Calculator',
        summarySubtitle: isSpanish ? 'Cálculo de precisión para viales' : 'Precision vial dosing & syringe units',
        atlasAiLabel: isSpanish ? 'Verificar con Atlas AI' : 'Verify with Atlas AI',
        secondaryAction: quoteAction,
        primaryAction: {
          label: isSpanish ? 'Ver Protocolos' : 'Protocols',
          icon: <Compass size={14} />,
          onClick: () => router.push('/proto'),
        },
      };
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
          showAtlasAi={true}
          atlasAiLabel={resolvedConfig.atlasAiLabel || 'Ask Atlas AI'}
          onOpenAtlasAi={() => openAtlasAi()}
          secondaryAction={resolvedConfig.secondaryAction || null}
          primaryAction={resolvedConfig.primaryAction || null}
        />
      </div>
    </div>
  );
}
