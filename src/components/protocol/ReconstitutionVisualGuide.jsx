/* eslint-disable react-hooks/set-state-in-effect */
/**
 * ReconstitutionVisualGuide — State-of-the-Art Interactive Edition
 * -------------------------------------------------------------
 * Provides a highly dynamic laboratory calculator and real-time SVG syringe visualizer
 * tailored specifically to the compounds, strengths, and target doses of the active protocol.
 *
 * Designed to wow the user with premium styling, micro-animations, glassmorphic dark-mode visuals,
 * and high-fidelity mathematical calculations.
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
  FlaskConical,
  Droplet,
  Activity,
  Sparkles,
  Info,
  ChevronRight,
  ShieldCheck,
  Sliders,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Syringe
} from 'lucide-react';
import SyringeVisualizer from '../SyringeVisualizer';

// Helper parsers for robust handling of standard databases strings
const parseMg = (val) => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const match = val.toString().replace(/,/g, '').match(/([0-9.]+)\s*(mg|mcg|ug)?/i);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const unit = (match[2] || '').toLowerCase();
  if (unit === 'mcg' || unit === 'ug') return num / 1000;
  return num;
};

const parseMcg = (val) => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const match = val.toString().replace(/,/g, '').match(/([0-9.]+)\s*(mg|mcg|ug)?/i);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const unit = (match[2] || '').toLowerCase();
  if (unit === 'mg') return num * 1000;
  return num;
};

export default function ReconstitutionVisualGuide({ compounds = [] }) {
  // If no compounds with valid data, return null
  const validCompounds = useMemo(() => {
    return compounds.filter(c => c.compound && (c.strength || c.water));
  }, [compounds]);

  if (validCompounds.length === 0) return null;

  // Active compound tab index
  const [activeIdx, setActiveIdx] = useState(0);
  const activeCompound = validCompounds[activeIdx];

  // Configurator mode: 'beginner' (Patient Guided) vs 'expert' (Clinical Custom)
  const [mode, setMode] = useState('beginner');

  // Configurator state variables
  const [vialStrength, setVialStrength] = useState(5); // mg
  const [waterVol, setWaterVol] = useState(2);        // mL
  const [targetDose, setTargetDose] = useState(250);   // mcg

  // Sync state variables whenever active compound changes
  useEffect(() => {
    if (!activeCompound) return;
    const parsedMg = parseMg(activeCompound.strength) || 5;
    const parsedWater = parseFloat(activeCompound.water) || 2;
    const parsedDose = parseMcg(activeCompound.targetDose) || 250;

    setVialStrength(parsedMg);
    setWaterVol(parsedWater);
    setTargetDose(parsedDose);
  }, [activeCompound]);

  // If in beginner mode, lock to the protocol default values to avoid dangerous errors
  const currentStrength = useMemo(() => {
    if (mode === 'beginner' && activeCompound) {
      return parseMg(activeCompound.strength) || 5;
    }
    return vialStrength;
  }, [mode, activeCompound, vialStrength]);

  const currentWater = useMemo(() => {
    if (mode === 'beginner' && activeCompound) {
      return parseFloat(activeCompound.water) || 2;
    }
    return waterVol;
  }, [mode, activeCompound, waterVol]);

  const currentDose = useMemo(() => {
    if (mode === 'beginner' && activeCompound) {
      return parseMcg(activeCompound.targetDose) || 250;
    }
    return targetDose;
  }, [mode, activeCompound, targetDose]);

  // Live calculations
  const concentrationMcgPerMl = useMemo(() => {
    if (currentWater <= 0) return 0;
    return (currentStrength * 1000) / currentWater;
  }, [currentStrength, currentWater]);

  const computedUnits = useMemo(() => {
    if (concentrationMcgPerMl <= 0) return 0;
    // units = (targetDose / concentration) * 100
    const rawUnits = (currentDose / concentrationMcgPerMl) * 100;
    return parseFloat(rawUnits.toFixed(1));
  }, [currentDose, concentrationMcgPerMl]);

  const computedMl = useMemo(() => {
    return parseFloat((computedUnits / 100).toFixed(3));
  }, [computedUnits]);

  // Quick preset handlers
  const strengthPresets = [2, 5, 10, 15, 20];
  const waterPresets = [1, 2, 3, 5];
  
  // Custom smart presets for target dose based on current compound/strength
  const dosePresets = useMemo(() => {
    if (currentStrength >= 10) {
      return [250, 500, 1000, 1500, 2000];
    }
    return [100, 250, 300, 500, 750];
  }, [currentStrength]);

  return (
    <div style={styles.container}>
      {/* ── Tabs & Mode Switcher Header ── */}
      <div style={styles.headerRow}>
        {validCompounds.length > 1 ? (
          <div style={styles.tabContainer}>
            {validCompounds.map((c, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                style={{
                  ...styles.tabButton,
                  ...(activeIdx === i ? styles.tabButtonActive : {}),
                }}
              >
                <FlaskConical size={14} style={{ marginRight: '6px' }} />
                {c.compound}
              </button>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FlaskConical size={16} color="#7c3aed" />
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              {activeCompound.compound}
            </span>
          </div>
        )}

        {/* Mode Switcher toggle */}
        <div style={styles.modeToggleContainer}>
          <button
            onClick={() => setMode('beginner')}
            style={{
              ...styles.modeToggleBtn,
              ...(mode === 'beginner' ? styles.modeToggleBtnActive : {}),
            }}
          >
            <BookOpen size={13} style={{ marginRight: '5px' }} />
            Guía Patient
          </button>
          <button
            onClick={() => setMode('expert')}
            style={{
              ...styles.modeToggleBtn,
              ...(mode === 'expert' ? styles.modeToggleBtnActive : {}),
            }}
          >
            <Sliders size={13} style={{ marginRight: '5px' }} />
            Clínico Experto
          </button>
        </div>
      </div>

      {/* ── Main Dashboard Layout ── */}
      <div style={styles.dashboardGrid}>
        
        {/* ── Left Column: Configurator Panel ── */}
        <div style={styles.panelLeft}>
          <div style={styles.panelHeader}>
            <Sparkles size={16} color="#7c3aed" />
            <h4 style={styles.panelTitle}>
              {mode === 'beginner' ? 'Parámetros del Protocolo (Bloqueados)' : 'Configuración de Laboratorio'}
            </h4>
          </div>

          <p style={styles.panelSubtitle}>
            {mode === 'beginner' 
              ? 'Los valores de reconstitución están fijados científicamente de acuerdo a la prescripción médica de este protocolo para garantizar la seguridad.'
              : 'Unidades de control de laboratorio. Puedes modificar libremente los volúmenes para calcular diluciones personalizadas.'
            }
          </p>

          {mode === 'beginner' ? (
            /* Beginner Mode: Clean Locked Visual Cards */
            <div className="recon-panel-transition" style={styles.lockedPillWrapper}>
              <div style={styles.lockedCard}>
                <span style={styles.lockedLabel}>1. Masa en el Vial</span>
                <span style={styles.lockedVal}>{currentStrength} mg</span>
                <span style={styles.lockedSub}>Contenido del péptido liofilizado</span>
              </div>
              <div style={styles.lockedCard}>
                <span style={styles.lockedLabel}>2. Diluyente Recomendado</span>
                <span style={styles.lockedVal}>{currentWater} mL</span>
                <span style={styles.lockedSub}>Agua Bacteriostática</span>
              </div>
              <div style={styles.lockedCardActive}>
                <span style={styles.lockedLabelActive}>3. Dosis por Aplicación</span>
                <span style={styles.lockedValActive}>{currentDose} mcg</span>
                <span style={styles.lockedSubActive}>Dosis clínica objetivo</span>
              </div>
              <div style={styles.beginnerAlert}>
                <Info size={14} color="#6d28d9" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.76rem', color: '#6d28d9', lineHeight: 1.45 }}>
                  Para realizar cambios personalizados en los diluyentes, cambia al <strong>Modo Clínico Experto</strong> arriba.
                </span>
              </div>
            </div>
          ) : (
            /* Expert Mode: Fully Unlocked Sliders */
            <div className="recon-panel-transition" style={styles.inputsWrapper}>
              {/* Input: Vial Strength */}
              <div style={styles.inputGroup}>
                <div style={styles.inputLabelRow}>
                  <label style={styles.inputLabel}>1. Masa del Péptido en Vial (mg)</label>
                  <span style={styles.inputBadge}>{vialStrength} mg</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={vialStrength}
                  onChange={(e) => setVialStrength(parseInt(e.target.value) || 1)}
                  style={styles.slider}
                />
                <div style={styles.presetRow}>
                  {strengthPresets.map((p) => (
                    <button
                      key={p}
                      onClick={() => setVialStrength(p)}
                      style={{
                        ...styles.presetBtn,
                        ...(vialStrength === p ? styles.presetBtnActive : {}),
                      }}
                    >
                      {p}mg
                    </button>
                  ))}
                </div>
              </div>

              {/* Input: Water Volume */}
              <div style={styles.inputGroup}>
                <div style={styles.inputLabelRow}>
                  <label style={styles.inputLabel}>2. Agua Bacteriostática Añadida (mL)</label>
                  <span style={styles.inputBadge}>{waterVol.toFixed(1)} mL</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="6"
                  step="0.1"
                  value={waterVol}
                  onChange={(e) => setWaterVol(parseFloat(e.target.value) || 1)}
                  style={styles.slider}
                />
                <div style={styles.presetRow}>
                  {waterPresets.map((p) => (
                    <button
                      key={p}
                      onClick={() => setWaterVol(p)}
                      style={{
                        ...styles.presetBtn,
                        ...(waterVol === p ? styles.presetBtnActive : {}),
                      }}
                    >
                      {p}mL
                    </button>
                  ))}
                </div>
              </div>

              {/* Input: Target Dose */}
              <div style={styles.inputGroup}>
                <div style={styles.inputLabelRow}>
                  <label style={styles.inputLabel}>3. Dosis de Administración Objetivo (mcg)</label>
                  <span style={styles.inputBadgeActive}>{targetDose} mcg</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max={vialStrength >= 10 ? 3000 : 1500}
                  step="50"
                  value={targetDose}
                  onChange={(e) => setTargetDose(parseInt(e.target.value) || 50)}
                  style={styles.sliderActive}
                />
                <div style={styles.presetRow}>
                  {dosePresets.map((p) => (
                    <button
                      key={p}
                      onClick={() => setTargetDose(p)}
                      style={{
                        ...styles.presetBtnActiveDose,
                        ...(targetDose === p ? styles.presetBtnActiveDoseSelected : {}),
                      }}
                    >
                      {p}mcg
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* ── Right Column: Syringe & Readout ── */}
        <div style={styles.panelRight}>
          {/* Scientific Readout Header */}
          <div style={styles.readoutCard}>
            <div style={styles.readoutHeader}>
              <span style={styles.readoutTitle}>Extracción Calculada de la Jeringa</span>
            </div>
            
            <div style={styles.digitsRow}>
              <div style={styles.digitBlock}>
                <span style={styles.digitVal}>{computedUnits.toFixed(1)}</span>
                <span style={styles.digitLbl}>Unidades (U-100)</span>
              </div>
              <div style={styles.digitSeparator} />
              <div style={styles.digitBlock}>
                <span style={styles.digitValSecondary}>{computedMl.toFixed(3)}</span>
                <span style={styles.digitLblSecondary}>Volumen en mL</span>
              </div>
            </div>

            <div style={styles.concentrationPill}>
              <Activity size={12} color="var(--color-success)" style={{ marginRight: '6px' }} />
              Concentración: <span style={styles.concentrationVal}>{concentrationMcgPerMl.toLocaleString()} mcg/mL</span>
            </div>
          </div>

          {/* Interactive Syringe Visualizer container */}
          <div style={styles.syringeBox}>
            <div style={styles.syringeBoxOverlay} />
            <div style={styles.syringeWrapper}>
              <SyringeVisualizer units={computedUnits} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Reconstitution Instructions Footer Card ── */}
      <div style={styles.instructionCard}>
        <div style={styles.instructionIcon}>
          <ShieldCheck size={20} color="#7c3aed" />
        </div>
        <div style={styles.instructionTextContent}>
          <h5 style={styles.instructionTitle}>Protocolo Clínico de Preparación</h5>
          <p style={styles.instructionText}>
            Añade exactamente <strong style={styles.highlightText}>{currentWater.toFixed(1)} mL</strong> de agua bacteriostática a tu vial de <strong style={styles.highlightText}>{currentStrength} mg</strong> de <strong style={styles.highlightText}>{activeCompound.compound}</strong>. Esto creará una concentración de <strong>{concentrationMcgPerMl.toLocaleString()} mcg/mL</strong>.
          </p>
          <div style={styles.instructionFlowRow}>
            <span style={styles.flowStep}>Vial de {currentStrength}mg</span>
            <ChevronRight size={12} color="var(--color-text-tertiary)" />
            <span style={styles.flowStep}>+{currentWater}mL Agua</span>
            <ChevronRight size={12} color="var(--color-text-tertiary)" />
            <span style={styles.flowStepActive}>Extraer {computedUnits} Unidades para {currentDose}mcg</span>
          </div>
          {activeCompound.notes && (
            <div style={styles.notesRow}>
              <Info size={12} color="var(--color-text-secondary)" style={{ marginRight: '6px', flexShrink: 0, marginTop: '1px' }} />
              <span style={styles.notesText}>{activeCompound.notes}</span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .recon-panel-transition {
          animation: reconFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes reconFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .step-card-premium {
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.25s ease !important;
        }
        .step-card-premium:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.05) !important;
          border-color: rgba(124, 58, 237, 0.25) !important;
        }
        .step-card-premium-active {
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.25s ease !important;
        }
        .step-card-premium-active:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 36px rgba(124, 58, 237, 0.08) !important;
          border-color: rgba(124, 58, 237, 0.4) !important;
        }
      `}</style>

      {/* ── 5-Step Visual Step-by-Step Laboratory Guide ── */}
      <div style={styles.visualGuideContainer}>
        <div style={styles.visualGuideHeader}>
          <Syringe size={16} color="#7c3aed" />
          <h4 style={styles.visualGuideTitle}>Instrucciones Visuales Paso a Paso</h4>
        </div>
        
        <div style={styles.stepsGrid}>
          {/* Step 1 */}
          <div className="step-card-premium" style={styles.stepCard}>
            <div style={styles.stepHeader}>
              <div style={styles.stepNumber}>1</div>
              <span style={styles.stepCardTitle}>Sanitización</span>
            </div>
            
            {/* SVG Illustration */}
            <div style={styles.stepIllustrationContainer}>
              <svg width="100%" height="90" viewBox="0 0 160 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Vial */}
                <rect x="65" y="32" width="30" height="42" rx="4" fill="var(--color-bg-app)" stroke="var(--color-text-tertiary)" strokeWidth="2" />
                <rect x="68" y="24" width="24" height="8" rx="2" fill="#7c3aed" />
                <line x1="68" y1="32" x2="92" y2="32" stroke="var(--color-text-secondary)" strokeWidth="2" />
                <rect x="73" y="21" width="14" height="3" rx="1" fill="var(--color-text-secondary)" />
                
                {/* Alcohol Swab */}
                <rect x="35" y="12" width="22" height="22" rx="4" fill="#38bdf8" fillOpacity="0.2" stroke="#0284c7" strokeWidth="1.5" transform="rotate(-15 35 12)" />
                <path d="M 39,18 L 49,28 M 44,16 L 54,26" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" />
                
                {/* Swipe Line & Sparkles */}
                <path d="M 38,22 C 58,16 75,16 85,20" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" strokeLinecap="round" />
                {/* Sparkles */}
                <path d="M 85,9 L 87,13 L 91,14 L 87,15 L 85,19 L 83,15 L 79,14 L 83,13 Z" fill="#eab308" />
                <path d="M 100,21 L 101,24 L 104,25 L 101,26 L 100,29 L 99,26 L 96,25 L 99,24 Z" fill="#eab308" />
              </svg>
            </div>

            <p style={styles.stepDesc}>
              Lava tus manos con agua y jabón. Limpia el tapón de goma del vial de <strong>{activeCompound.compound}</strong> y de la ampolla de agua bacteriostática con una toallita de alcohol isopropílico al 70%. Deja secar por 10 segundos.
            </p>
          </div>

          {/* Step 2 */}
          <div className="step-card-premium" style={styles.stepCard}>
            <div style={styles.stepHeader}>
              <div style={styles.stepNumber}>2</div>
              <span style={styles.stepCardTitle}>Extraer Agua</span>
            </div>

            {/* SVG Illustration */}
            <div style={styles.stepIllustrationContainer}>
              <svg width="100%" height="90" viewBox="0 0 160 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Water Ampoule/Vial */}
                <rect x="35" y="38" width="24" height="42" rx="4" fill="#bae6fd" fillOpacity="0.3" stroke="#0ea5e9" strokeWidth="1.5" />
                <rect x="38" y="30" width="18" height="8" fill="#38bdf8" />
                <rect x="41" y="26" width="12" height="4" fill="#0ea5e9" />
                <rect x="37" y="55" width="20" height="23" rx="2" fill="#0ea5e9" fillOpacity="0.25" />
                
                {/* Syringe pulling water */}
                <g transform="translate(68, 5) rotate(25)">
                  <line x1="10" y1="62" x2="10" y2="40" stroke="var(--color-text-tertiary)" strokeWidth="1.2" />
                  <rect x="5" y="10" width="10" height="30" rx="1" fill="var(--color-bg-app)" stroke="var(--color-text-secondary)" strokeWidth="1.5" />
                  <line x1="10" y1="10" x2="10" y2="-5" stroke="var(--color-text-tertiary)" strokeWidth="2" />
                  <rect x="6" y="-7" width="8" height="2" fill="var(--color-text-secondary)" />
                  <rect x="6" y="20" width="8" height="4" fill="var(--color-text-secondary)" />
                  <rect x="6" y="24" width="8" height="15" fill="#38bdf8" fillOpacity="0.4" />
                </g>
                
                {/* Upward Arrows */}
                <path d="M 115,22 L 115,10 M 115,10 L 112,13 M 115,10 L 118,13" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <p style={styles.stepDesc}>
              Toma una jeringa de reconstitución estéril. Extrae exactamente <strong>{currentWater.toFixed(1)} mL</strong> de agua bacteriostática de la ampolla. Empuja lentamente cualquier burbuja de aire residual hacia afuera.
            </p>
          </div>

          {/* Step 3 */}
          <div className="step-card-premium" style={styles.stepCard}>
            <div style={styles.stepHeader}>
              <div style={styles.stepNumber}>3</div>
              <span style={styles.stepCardTitle}>Dilución Lenta</span>
            </div>

            {/* SVG Illustration */}
            <div style={styles.stepIllustrationContainer}>
              <svg width="100%" height="90" viewBox="0 0 160 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Peptide Vial */}
                <rect x="65" y="32" width="30" height="45" rx="5" fill="var(--color-bg-app)" stroke="var(--color-text-tertiary)" strokeWidth="2" />
                <rect x="68" y="24" width="24" height="8" rx="2" fill="#7c3aed" />
                <line x1="68" y1="32" x2="92" y2="32" stroke="var(--color-text-secondary)" strokeWidth="2" />
                {/* Powder at bottom */}
                <path d="M 67,68 C 70,66 75,65 80,67 C 85,69 90,68 93,69 L 93,75 L 67,75 Z" fill="var(--color-border)" />
                
                {/* Syringe needle inserting at angle */}
                <g transform="translate(58, 0) rotate(-22)">
                  <line x1="15" y1="42" x2="15" y2="28" stroke="var(--color-text-tertiary)" strokeWidth="1" />
                  <rect x="12" y="8" width="6" height="20" fill="var(--color-bg-app)" stroke="var(--color-text-secondary)" strokeWidth="1.2" />
                </g>
                
                {/* Water stream sliding down glass wall */}
                <path d="M 68,34 C 68,34 70,40 70,48 C 70,56 68,62 69,67" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />
                
                {/* Swirling Arrow */}
                <path d="M 45,72 C 45,78 115,78 115,72" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 111,75 L 115,72 L 112,69" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <p style={styles.stepDesc}>
              Inserta la aguja del agua en el vial del péptido liofilizado. Apunta el flujo de agua <strong>hacia la pared de vidrio</strong> del vial, NO directamente al péptido. Permite que escurra lentamente. Gira suavemente el vial; <strong>nunca agites</strong> el vial con fuerza.
            </p>
          </div>

          {/* Step 4 */}
          <div className="step-card-premium" style={styles.stepCard}>
            <div style={styles.stepHeader}>
              <div style={styles.stepNumber}>4</div>
              <span style={styles.stepCardTitle}>Carga de Dosis</span>
            </div>

            {/* SVG Illustration */}
            <div style={styles.stepIllustrationContainer}>
              <svg width="100%" height="90" viewBox="0 0 160 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Inverted Vial */}
                <g transform="translate(80, 40) rotate(180) translate(-15, -22.5)">
                  <rect x="0" y="0" width="30" height="42" rx="4" fill="var(--color-bg-app)" stroke="var(--color-text-tertiary)" strokeWidth="2" />
                  <rect x="3" y="-8" width="24" height="8" rx="2" fill="#7c3aed" />
                  <line x1="3" y1="0" x2="27" y2="0" stroke="var(--color-text-secondary)" strokeWidth="2" />
                  <rect x="2" y="8" width="26" height="32" rx="3" fill="#a78bfa" fillOpacity="0.25" />
                </g>
                
                {/* Syringe inserted from below */}
                <g transform="translate(75, 40)">
                  <line x1="5" y1="0" x2="5" y2="-18" stroke="var(--color-text-tertiary)" strokeWidth="1.2" />
                  <rect x="1" y="0" width="8" height="35" rx="1" fill="var(--color-bg-app)" fillOpacity="0.8" stroke="#7c3aed" strokeWidth="1.5" />
                  <line x1="5" y1="12" x2="5" y2="40" stroke="var(--color-text-tertiary)" strokeWidth="1.5" />
                  <rect x="2" y="12" width="6" height="3" fill="var(--color-text-secondary)" />
                  <rect x="2" y="40" width="6" height="2" fill="var(--color-text-secondary)" />
                  <rect x="2" y="0" width="6" height="12" fill="#a78bfa" fillOpacity="0.6" />
                </g>
                
                {/* Target marker bubble */}
                <circle cx="95" cy="45" r="3.5" fill="var(--color-success)" />
                <line x1="83" y1="45" x2="92" y2="45" stroke="var(--color-success)" strokeWidth="1" strokeDasharray="2 2" />
                <text x="102" y="48" fill="var(--color-success)" fontSize="8" fontWeight="bold">Dosis</text>
              </svg>
            </div>

            <p style={styles.stepDesc}>
              Inserta la jeringa de insulina de 1 mL (U-100). Voltea el vial reconstituido boca abajo. Extrae exactamente la dosis de <strong>{currentDose} mcg</strong>, la cual corresponde a la marca de <strong>{computedUnits} unidades</strong> en tu jeringa.
            </p>
          </div>

          {/* Step 5 */}
          <div className="step-card-premium-active" style={styles.stepCardActiveBorder}>
            <div style={styles.stepHeader}>
              <div style={styles.stepNumberActive}>5</div>
              <span style={styles.stepCardTitleActive}>Aplicación</span>
            </div>

            {/* SVG Illustration */}
            <div style={styles.stepIllustrationContainerActive}>
              <svg width="100%" height="90" viewBox="0 0 160 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Skin Layers */}
                <rect x="10" y="55" width="140" height="6" fill="#fecdd3" stroke="#fda4af" strokeWidth="0.5" />
                <rect x="10" y="61" width="140" height="20" fill="#fef08a" fillOpacity="0.65" />
                <circle cx="25" cy="67" r="1.5" fill="#fde047" />
                <circle cx="45" cy="71" r="1.5" fill="#fde047" />
                <circle cx="65" cy="66" r="1.5" fill="#fde047" />
                <circle cx="85" cy="70" r="1.5" fill="#fde047" />
                <circle cx="105" cy="68" r="1.5" fill="#fde047" />
                <circle cx="125" cy="71" r="1.5" fill="#fde047" />
                <rect x="10" y="81" width="140" height="8" fill="#fca5a5" />

                {/* Syringe inserted at 45 degree angle */}
                <g transform="translate(68, 55) rotate(-45) translate(-5, -45)">
                  <line x1="5" y1="42" x2="5" y2="28" stroke="var(--color-text-tertiary)" strokeWidth="1.2" />
                  <rect x="1" y="0" width="8" height="28" rx="1" fill="var(--color-bg-app)" stroke="#7c3aed" strokeWidth="1.5" />
                  <line x1="5" y1="12" x2="5" y2="32" stroke="var(--color-text-tertiary)" strokeWidth="1.5" />
                  <rect x="2" y="12" width="6" height="3" fill="var(--color-text-secondary)" />
                </g>
                
                {/* Dotted angle arc */}
                <path d="M 68,55 C 68,36 53,41 45,44" stroke="#7c3aed" strokeWidth="1" strokeDasharray="2 2" strokeLinecap="round" />
                <text x="35" y="32" fill="#7c3aed" fontSize="8" fontWeight="bold">45° - 90°</text>
                
                {/* Subcutaneous text block */}
                <rect x="95" y="10" width="55" height="15" rx="3.5" fill="#7c3aed" fillOpacity="0.1" />
                <text x="122" y="20" fill="#7c3aed" fontSize="7" fontWeight="bold" textAnchor="middle">SUBCUTÁNEO</text>
              </svg>
            </div>

            <p style={styles.stepDescActive}>
              Limpia la zona de inyección (grasa abdominal o muslo). Pellizca la piel para aislar el tejido adiposo subcutáneo. Inserta la aguja en un ángulo de <strong>45° a 90°</strong> e inyecta la solución de forma lenta y constante.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Premium Styles System ──
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    width: '100%',
  },
  
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.75rem',
    width: '100%',
  },

  // Tabs for switching between compound guides
  tabContainer: {
    display: 'flex',
    gap: '0.5rem',
    background: 'rgba(0, 0, 0, 0.04)',
    padding: '0.25rem',
    borderRadius: '12px',
    border: '1px solid rgba(0,0,0,0.05)',
  },
  tabButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.5rem 1rem',
    fontSize: '0.8rem',
    fontWeight: 700,
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  tabButtonActive: {
    background: '#7c3aed',
    color: 'var(--color-bg-surface)',
    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
  },

  // Mode Switcher toggle
  modeToggleContainer: {
    display: 'flex',
    background: '#f1f5f9',
    border: '1px solid #e2e8f0',
    padding: '0.2rem',
    borderRadius: '10px',
    alignItems: 'center',
  },
  modeToggleBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.35rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: 700,
    borderRadius: '7px',
    border: 'none',
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  modeToggleBtnActive: {
    background: 'var(--color-bg-surface)',
    color: '#0f172a',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
  },

  // Main columns
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.25rem',
    alignItems: 'stretch',
  },

  // Left Config Panel
  panelLeft: {
    borderRadius: '16px',
    background: 'var(--color-bg-surface)',
    border: '1px solid #e2e8f0',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 18px rgba(0,0,0,0.02)',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '0.5rem',
  },
  panelTitle: {
    fontSize: '1rem',
    fontWeight: 800,
    color: '#0f172a',
    margin: 0,
  },
  panelSubtitle: {
    fontSize: '0.78rem',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.5,
    margin: '0 0 1.25rem 0',
  },

  // Locked Card styles for Beginner Mode
  lockedPillWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
  },
  lockedCard: {
    display: 'flex',
    flexDirection: 'column',
    padding: '0.85rem 1rem',
    background: '#fafbff',
    border: '1px solid #f1f5f9',
    borderRadius: '12px',
    position: 'relative',
  },
  lockedLabel: {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  lockedVal: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: 'var(--color-text-primary)',
    margin: '4px 0',
  },
  lockedSub: {
    fontSize: '0.7rem',
    color: 'var(--color-text-tertiary)',
  },
  lockedCardActive: {
    display: 'flex',
    flexDirection: 'column',
    padding: '0.85rem 1rem',
    background: 'rgba(124,58,237,0.02)',
    border: '1px solid rgba(124,58,237,0.15)',
    borderLeft: '4px solid #7c3aed',
    borderRadius: '12px',
  },
  lockedLabelActive: {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: '#7c3aed',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  lockedValActive: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: '#6d28d9',
    margin: '4px 0',
  },
  lockedSubActive: {
    fontSize: '0.7rem',
    color: '#7c3aed',
    fontWeight: 500,
  },
  beginnerAlert: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    background: 'rgba(124,58,237,0.05)',
    borderRadius: '8px',
    padding: '0.75rem',
    marginTop: '0.25rem',
  },

  // Inputs list for Expert Mode
  inputsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  inputLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: '0.78rem',
    fontWeight: 700,
    color: 'var(--color-text-primary)',
  },
  inputBadge: {
    fontSize: '0.78rem',
    fontWeight: 800,
    color: '#0369a1',
    background: 'rgba(3,105,161,0.07)',
    padding: '0.2rem 0.6rem',
    borderRadius: '6px',
    fontFamily: 'monospace',
  },
  inputBadgeActive: {
    fontSize: '0.78rem',
    fontWeight: 800,
    color: '#7c3aed',
    background: 'rgba(124,58,237,0.07)',
    padding: '0.2rem 0.6rem',
    borderRadius: '6px',
    fontFamily: 'monospace',
  },
  slider: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    outline: 'none',
    cursor: 'pointer',
    WebkitAppearance: 'none',
    background: 'var(--color-border)',
  },
  sliderActive: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    outline: 'none',
    cursor: 'pointer',
    WebkitAppearance: 'none',
    background: '#d8b4fe',
  },

  // Preset Row / Pill Buttons
  presetRow: {
    display: 'flex',
    gap: '4px',
    flexWrap: 'wrap',
    marginTop: '0.25rem',
  },
  presetBtn: {
    fontSize: '0.68rem',
    fontWeight: 700,
    color: 'var(--color-text-secondary)',
    background: '#f1f5f9',
    border: '1px solid #e2e8f0',
    padding: '0.25rem 0.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  presetBtnActive: {
    background: '#0369a1',
    color: 'var(--color-bg-surface)',
    borderColor: '#0369a1',
  },
  presetBtnActiveDose: {
    fontSize: '0.68rem',
    fontWeight: 700,
    color: 'var(--color-text-secondary)',
    background: '#f1f5f9',
    border: '1px solid #e2e8f0',
    padding: '0.25rem 0.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  presetBtnActiveDoseSelected: {
    background: '#7c3aed',
    color: 'var(--color-bg-surface)',
    borderColor: '#7c3aed',
  },

  // Right Column: Output Syringe Panel
  panelRight: {
    borderRadius: '16px',
    background: '#080d18', // Sleek dark lab background to make the glowing liquid pop!
    border: '1px solid #1e293b',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
    justifyContent: 'space-between',
  },

  // Glowing Readout Card
  readoutCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.07)',
    borderRadius: '12px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  readoutTitle: {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
  },
  digitsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    margin: '0.25rem 0',
  },
  digitBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
  },
  digitSeparator: {
    width: '1px',
    height: '24px',
    background: 'rgba(255,255,255,0.1)',
  },
  digitVal: {
    fontSize: '2rem',
    fontWeight: 800,
    color: '#34d399', // Glowing turquoise
    fontFamily: "'JetBrains Mono', monospace",
    lineHeight: 1,
    textShadow: '0 0 16px rgba(52,211,153,0.3)',
  },
  digitLbl: {
    fontSize: '0.65rem',
    fontWeight: 700,
    color: 'rgba(255,255,255,0.5)',
    marginTop: '4px',
  },
  digitValSecondary: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: '#38bdf8', // Sleek blue
    fontFamily: "'JetBrains Mono', monospace",
    lineHeight: 1,
  },
  digitLblSecondary: {
    fontSize: '0.65rem',
    fontWeight: 700,
    color: 'rgba(255,255,255,0.5)',
    marginTop: '4px',
  },
  concentrationPill: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '0.72rem',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.7)',
    background: 'rgba(255,255,255,0.05)',
    padding: '0.3rem 0.75rem',
    borderRadius: '99px',
    border: '1px solid rgba(255,255,255,0.07)',
  },
  concentrationVal: {
    color: 'var(--color-success)',
    fontWeight: 800,
    marginLeft: '4px',
  },

  // Syringe Display Box
  syringeBox: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    padding: '1.5rem 1rem',
    position: 'relative',
    overflow: 'hidden',
    flex: 1,
    minHeight: '220px',
  },
  syringeBoxOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(circle at center, rgba(124,58,237,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  syringeWrapper: {
    transform: 'scale(1.15)',
    transformOrigin: 'center',
  },

  // Reconstitution Instructions Footer Card
  instructionCard: {
    display: 'flex',
    gap: '1rem',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
    border: '1px solid #e9d5ff',
    padding: '1.25rem',
    boxShadow: '0 4px 20px rgba(124, 58, 237, 0.03)',
  },
  instructionIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'var(--color-bg-surface)',
    boxShadow: '0 2px 8px rgba(124,58,237,0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  instructionTextContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  instructionTitle: {
    fontSize: '0.88rem',
    fontWeight: 800,
    color: '#581c87',
    margin: 0,
  },
  instructionText: {
    fontSize: '0.8rem',
    color: '#5b21b6',
    lineHeight: 1.6,
    margin: 0,
  },
  highlightText: {
    color: '#7e22ce',
    fontWeight: 800,
  },
  instructionFlowRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    marginTop: '0.4rem',
  },
  flowStep: {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: 'var(--color-text-secondary)',
    background: 'var(--color-bg-surface)',
    border: '1px solid #e2e8f0',
    padding: '0.2rem 0.5rem',
    borderRadius: '6px',
  },
  flowStepActive: {
    fontSize: '0.72rem',
    fontWeight: 800,
    color: '#7e22ce',
    background: '#f3e8ff',
    border: '1px solid #d8b4fe',
    padding: '0.2rem 0.6rem',
    borderRadius: '6px',
    boxShadow: '0 2px 6px rgba(124,58,237,0.08)',
  },
  notesRow: {
    display: 'flex',
    alignItems: 'flex-start',
    marginTop: '0.5rem',
    paddingTop: '0.5rem',
    borderTop: '1px solid rgba(124, 58, 237, 0.1)',
  },
  notesText: {
    fontSize: '0.72rem',
    color: '#6b21a8',
    fontStyle: 'italic',
    lineHeight: 1.45,
  },

  // 5-Step Visual Step-by-Step Laboratory Guide
  visualGuideContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
    marginTop: '0.5rem',
    background: 'rgba(255, 255, 255, 0.4)',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    borderRadius: '20px',
    padding: '1.5rem',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.01)',
  },
  visualGuideHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '0.75rem',
  },
  visualGuideTitle: {
    fontSize: '0.94rem',
    fontWeight: 800,
    color: '#0f172a',
    margin: 0,
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
    marginTop: '0.5rem',
  },
  stepCard: {
    display: 'flex',
    flexDirection: 'column',
    padding: '1.25rem',
    background: 'var(--color-bg-surface)',
    border: '1px solid #f1f5f9',
    borderRadius: '16px',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.01)',
  },
  stepCardActiveBorder: {
    display: 'flex',
    flexDirection: 'column',
    padding: '1.25rem',
    background: 'var(--color-bg-surface)',
    border: '1px solid rgba(124, 58, 237, 0.15)',
    borderTop: '4px solid #7c3aed',
    borderRadius: '16px',
    boxShadow: '0 4px 16px rgba(124, 58, 237, 0.03)',
  },
  stepHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '0.75rem',
  },
  stepNumber: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    background: '#f1f5f9',
    color: 'var(--color-text-secondary)',
    fontSize: '0.8rem',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberActive: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    background: '#7c3aed',
    color: 'var(--color-bg-surface)',
    fontSize: '0.8rem',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
  },
  stepCardTitle: {
    fontSize: '0.85rem',
    fontWeight: 800,
    color: 'var(--color-text-primary)',
  },
  stepCardTitleActive: {
    fontSize: '0.85rem',
    fontWeight: 800,
    color: '#7c3aed',
  },
  stepDesc: {
    fontSize: '0.78rem',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.5,
    margin: 0,
  },
  stepDescActive: {
    fontSize: '0.78rem',
    color: '#5b21b6',
    lineHeight: 1.5,
    margin: 0,
  },
  stepIllustrationContainer: {
    height: '110px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    borderRadius: '12px',
    marginBottom: '0.85rem',
    border: '1px solid rgba(226, 232, 240, 0.6)',
    overflow: 'hidden',
    position: 'relative',
  },
  stepIllustrationContainerActive: {
    height: '110px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
    borderRadius: '12px',
    marginBottom: '0.85rem',
    border: '1px solid rgba(124, 58, 237, 0.15)',
    overflow: 'hidden',
    position: 'relative',
  },
};
