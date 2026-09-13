"use client";

import { useEffect, useCallback, useRef } from 'react';

/**
 * useProtocolsContextBridge
 * 
 * Manages the 3-level context hierarchy for Clinical Protocols & Pathways:
 * - Level 1 (Macro): Protocol Hub / Pathways directory (KPIs, active pathways, clinical goals)
 * - Level 2 (Micro): Individual Protocol focus (Drawer, row selection, phases, peptides, clinical rationale)
 * - Level 3 (Nano): Specific Phase or Compound focus (Dosages, titration, cross-links to catalog products)
 * 
 * Dispatches 'admin-context-update' events listened by PortalLayout -> ClinicalAssistant.
 */
export function useProtocolsContextBridge({
  protocols = [],
  globalMetrics = null,
  activeFilters = {},
  selectedProtocol = null,
  selectedPhase = null,
  selectedPeptide = null,
  activeDrawer = null,
  role = 'admin'
} = {}) {
  const lastDispatchedRef = useRef(null);

  const dispatchContext = useCallback((levelOverride = null, extra = {}) => {
    if (typeof window === 'undefined') return;

    let level = 1;
    let payload = {};

    const activeProt = extra.protocol || selectedProtocol;
    const activePh = extra.phase || selectedPhase;
    const activePep = extra.peptide || selectedPeptide;

    if (activeProt && (activePh || activePep)) {
      // ── Level 3: Nano / Phase or Compound Focus ────────────────────────────
      level = 3;
      const phaseName = activePh?.name || activePh?.phase_name || (typeof activePh === 'string' ? activePh : 'Phase Focus');
      const phaseDuration = activePh?.duration_weeks || activePh?.durationWeeks || 4;
      const compounds = activePh?.peptides || activePh?.compounds || (activePep ? [activePep] : []);
      const compoundNames = compounds.map(c => c.name || c.canonicalName || c.peptideName || (typeof c === 'string' ? c : '')).filter(Boolean);

      payload = {
        level: 3,
        page: 'protocols',
        isCatalogContext: false,
        isProtocolContext: true,
        isPhaseContext: true,
        entityName: `${activeProt.name || 'Protocol'} — ${phaseName}`,
        protocolName: activeProt.name || 'Protocol',
        protocolId: activeProt.id,
        protocol: activeProt,
        phase: activePh,
        peptide: activePep,
        phaseName,
        phaseDuration,
        compounds: compoundNames,
        summary: `Phase Focus: "${phaseName}" (${phaseDuration} weeks) within protocol "${activeProt.name}". Compounds involved: ${compoundNames.join(', ') || 'Custom regimen'}.`,
        quickActions: [
          { label: '🧪 Titulación & Posología', prompt: `Detalla el esquema de titulación semanal y posología recomendada para la fase "${phaseName}" del protocolo ${activeProt.name}` },
          { label: '📦 Stock en Catálogo', prompt: `¿Están disponibles en stock en nuestro catálogo de productos los compuestos (${compoundNames.join(', ')}) para esta fase?` },
          { label: '💰 Estimar Coste Ciclo', prompt: `Calcula el coste clínico y precio recomendado de los péptidos necesarios para completar la fase "${phaseName}" de ${phaseDuration} semanas` }
        ]
      };
    } else if (activeProt) {
      // ── Level 2: Micro / Protocol Focus ────────────────────────────────────
      level = 2;
      const totalWeeks = activeProt.duration_weeks ||
        (activeProt.phases || []).reduce((sum, p) => sum + (p.duration_weeks || p.durationWeeks || 0), 0) ||
        12;

      const peptideList = (activeProt.peptides || []).map(p => p.name || p.canonicalName || p).filter(Boolean);
      if (!peptideList.length && activeProt.peptideIds?.length) peptideList.push(...activeProt.peptideIds);

      const phases = activeProt.phases || [];
      const protName = activeProt.name || activeProt.displayName || 'Clinical Protocol';
      const goal = activeProt.primary_goal || activeProt.goal || activeProt.category || 'Clinical Optimization';

      payload = {
        level: 2,
        page: 'protocols',
        isCatalogContext: false,
        isProtocolContext: true,
        isPhaseContext: false,
        entityName: protName,
        protocolName: protName,
        protocolId: activeProt.id,
        protocol: activeProt,
        durationWeeks: totalWeeks,
        goal,
        status: activeProt.status || 'active',
        phaseCount: phases.length,
        peptides: peptideList,
        phases: phases.map((ph, idx) => ({
          name: ph.name || `Phase ${idx + 1}`,
          weeks: ph.duration_weeks || ph.durationWeeks || 4,
          compounds: (ph.peptides || ph.compounds || []).map(c => c.name || c.canonicalName || c)
        })),
        summary: `Protocol Focus: "${protName}" (${totalWeeks} weeks, ${phases.length || 1} phases). Clinical Area: ${goal}. Key Peptides: ${peptideList.join(', ') || 'Custom compounds'}. Status: ${activeProt.status || 'Active'}.`,
        quickActions: [
          { label: '📄 Descargar Guía Clínica PDF', prompt: `Genera la guía clínica y ficha técnica oficial en PDF para el protocolo ${protName}` },
          { label: '🔬 Mecanismos & Sinergias', prompt: `Analiza detalladamente los mecanismos de acción farmacológicos y sinergias entre los péptidos de ${protName}` },
          { label: '⚠️ Seguridad & Biomarcadores', prompt: `¿Qué analíticas de laboratorio previas y controles durante el ciclo se recomiendan para ${protName}?` },
          { label: '💊 Prescripción Clínica', prompt: `Guía para crear una prescripción individualizada a partir del protocolo ${protName}` }
        ]
      };
    } else {
      // ── Level 1: Macro / Protocols Catalog View ────────────────────────────
      level = 1;
      const totalCount = globalMetrics?.totalProtocols || protocols.length;
      const activeCount = globalMetrics?.activeProtocols || protocols.filter(p => p.status === 'active').length;
      const draftCount = protocols.filter(p => p.status === 'draft').length;
      const categories = [...new Set(protocols.map(p => p.primary_goal || p.goal || p.category).filter(Boolean))];

      payload = {
        level: 1,
        page: 'protocols',
        isCatalogContext: false,
        isProtocolContext: true,
        isPhaseContext: false,
        label: 'Clinical Protocols Directory',
        totalProtocols: totalCount,
        activeCount,
        draftCount,
        activeFilters,
        categories: categories.slice(0, 8),
        summary: `Protocols Hub: ${totalCount} clinical pathways (${activeCount} active, ${draftCount} draft). Focus areas: ${categories.slice(0, 5).join(', ') || 'Metabolism, Longevity, Repair'}.`,
        quickActions: [
          { label: '📋 Compendio Protocolos PDF', prompt: 'Genera un compendio clínico en PDF con todos los protocolos activos de la plataforma' },
          { label: '🔥 Protocolos de Pérdida de Peso', prompt: 'Compara y lista todos los protocolos de pérdida de peso y metabolismo disponibles (Semaglutide, Tirzepatide, Retatrutide)' },
          { label: '🧬 Protocolos de Longevidad', prompt: '¿Cuáles son los protocolos clínicos más recomendados para longevidad, senolíticos y biohacking celular?' },
          { label: '📊 Auditoría de Completitud', prompt: '¿Cuáles protocolos en la base de datos están incompletos o necesitan revisión clínica de fases y dosis?' }
        ]
      };
    }

    // Deduplicate rapid identical dispatches
    const signature = `${payload.level}:${payload.protocolName || 'directory'}:${payload.phaseName || 'none'}:${activeDrawer || 'none'}`;
    if (lastDispatchedRef.current === signature) return;
    lastDispatchedRef.current = signature;

    window.dispatchEvent(
      new CustomEvent('admin-context-update', {
        detail: payload
      })
    );
  }, [selectedProtocol, selectedPhase, selectedPeptide, protocols, globalMetrics, activeFilters, activeDrawer]);

  useEffect(() => {
    dispatchContext();
  }, [dispatchContext]);

  return {
    dispatchContext,
    setLevel2: (protocol) => dispatchContext(2, { protocol, phase: null, peptide: null }),
    setLevel3: (phase, protocol, peptide = null) => dispatchContext(3, { phase, protocol, peptide }),
    resetToLevel1: () => dispatchContext(1, { protocol: null, phase: null, peptide: null })
  };
}
