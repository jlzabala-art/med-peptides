"use client";

import React, { useState, useMemo } from 'react';
import {
  Pill,
  Droplets,
  FlaskConical,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  Thermometer,
  RotateCcw,
  MessageCircle,
  Phone,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink,
  Flame,
  Check,
  Tag,
  Dna
} from '@/lib/icons';
import ReconstitutionGuideCard from './ReconstitutionGuideCard';
import CalendarSyncModal from './CalendarSyncModal';
import PatientPhysicianGreetingHero from './PatientPhysicianGreetingHero';
import { triggerHaptic } from '@/utils/haptics';
import toast from 'react-hot-toast';

/**
 * PatientPrescriptionGuide
 * ─────────────────────────────────────────────────────────────────────────────
 * Patient-First friendly treatment viewer for public prescriptions.
 * Segregates oral supplements, injectable peptides (with reconstitution guidance),
 * topical solutions and transdermal formulations in clear, human language.
 */
export default function PatientPrescriptionGuide({
  compoundedFormulations = [],
  isEs = false,
  doctorName = '',
  doctorClinic = '',
  doctorPhone = '',
  patientName = '',
  rxId = '',
  patientPublicUrl = '',
  rx = {},
  onOpenDoctorContact = null,
  onOpenQuotation = null
}) {
  // Adherence tracking in local storage
  const todayKey = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);
  const storageKey = `atlas_rx_adherence_${rxId}_${todayKey}`;

  const [hasTakenDoseToday, setHasTakenDoseToday] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return Boolean(localStorage.getItem(storageKey));
    } catch {
      return false;
    }
  });
  const [streakDays, setStreakDays] = useState(4);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  const handleToggleDose = () => {
    triggerHaptic('selection');
    const newState = !hasTakenDoseToday;
    setHasTakenDoseToday(newState);
    if (newState) {
      try {
        localStorage.setItem(storageKey, JSON.stringify({ taken: true, time: new Date().toLocaleTimeString() }));
      } catch {
        /* ignore */
      }
      setStreakDays(prev => prev + 1);
      toast.success(
        isEs ? '¡Dosis de hoy registrada! Cumplimiento al día ✓' : 'Today’s dose logged! Adherence on track ✓',
        { icon: '💊' }
      );
    } else {
      try {
        localStorage.removeItem(storageKey);
      } catch {
        /* ignore */
      }
      setStreakDays(prev => Math.max(1, prev - 1));
      toast(isEs ? 'Registro de dosis cancelado' : 'Dose log removed');
    }
  };

  // WhatsApp clinical inquiry URL
  // Classification & Categorization helper for each formulation
  const categorizedItems = useMemo(() => {
    return (compoundedFormulations || []).map((formulation, idx) => {
      const titleLower = String(formulation.title || '').toLowerCase();
      const routeLower = String(formulation.route || '').toLowerCase();
      const vehicleLower = String(formulation.vehicle?.name || '').toLowerCase();
      const apis = formulation.apis || [];

      // Check if it's a peptide/injectable
      const isPeptide = Boolean(
        formulation.isInjectable ||
        titleLower.includes('vial') ||
        titleLower.includes('lyophilized') ||
        titleLower.includes('liofilizado') ||
        titleLower.includes('subq') ||
        titleLower.includes('subcutan') ||
        titleLower.includes('pept') ||
        routeLower.includes('subq') ||
        routeLower.includes('inyect') ||
        routeLower.includes('inject') ||
        apis.some(a => {
          const n = String(a.name || a.productName || '').toLowerCase();
          return n.includes('bpc') || n.includes('tb-') || n.includes('semax') || n.includes('selank') ||
                 n.includes('semaglutide') || n.includes('tirzepatide') || n.includes('ghk') ||
                 n.includes('nad') || n.includes('cjc') || n.includes('ipamorelin') || n.includes('sermorelin');
        })
      );

      // Check if it's an oral supplement / capsule
      const isSupplement = !isPeptide && Boolean(
        formulation.isOral ||
        routeLower.includes('oral') ||
        titleLower.includes('cápsula') ||
        titleLower.includes('capsule') ||
        titleLower.includes('oral') ||
        titleLower.includes('tablet') ||
        titleLower.includes('nutra') ||
        vehicleLower.includes('capsule') ||
        vehicleLower.includes('cápsula')
      );

      // Check if it's topical (hair, scalp, skin)
      const isTopical = !isPeptide && !isSupplement && Boolean(
        formulation.isTrichoOil ||
        routeLower.includes('tópic') ||
        routeLower.includes('topical') ||
        routeLower.includes('cuero cabelludo') ||
        routeLower.includes('scalp') ||
        titleLower.includes('trichosol') ||
        titleLower.includes('trichofoam') ||
        titleLower.includes('trichooil') ||
        titleLower.includes('lotion') ||
        titleLower.includes('loción') ||
        titleLower.includes('solución') ||
        titleLower.includes('foam') ||
        titleLower.includes('espuma')
      );

      // Check if it's transdermal cream / BHRT
      const isTransdermal = !isPeptide && !isSupplement && !isTopical && Boolean(
        formulation.isBHRT ||
        routeLower.includes('transdermal') ||
        titleLower.includes('bhrt') ||
        titleLower.includes('hormon') ||
        titleLower.includes('cream') ||
        titleLower.includes('crema') ||
        vehicleLower.includes('lipoderm') ||
        vehicleLower.includes('pentravan')
      );

      // Derive patient-friendly category details
      let category = {
        type: 'compounding',
        badge: isEs ? 'FÓRMULA MAGISTRAL' : 'COMPOUNDED FORMULA',
        icon: '🧪',
        color: '#1a73e8',
        bg: '#f8fafc',
        border: '#dadce0',
        storageNote: isEs ? 'Conservar a temperatura ambiente protegida de la luz' : 'Store at room temperature protected from light'
      };

      if (isPeptide) {
        category = {
          type: 'peptide',
          badge: isEs ? 'PÉPTIDO INYECTABLE (SUBQ)' : 'INJECTABLE PEPTIDE (SUBQ)',
          icon: '💉',
          color: '#1a73e8',
          bg: '#f8fafc',
          border: '#dadce0',
          storageNote: isEs ? '❄️ Requiere Nevera (2°C – 8°C). ¡No congelar!' : '❄️ Mandatory Refrigeration (2°C – 8°C). Do Not Freeze!',
          requiresReconstitution: true
        };
      } else if (isSupplement) {
        category = {
          type: 'supplement',
          badge: isEs ? 'SUPLEMENTO / NUTRACÉUTICO ORAL' : 'ORAL SUPPLEMENT / NUTRACEUTICAL',
          icon: '💊',
          color: '#334155',
          bg: '#f8fafc',
          border: '#dadce0',
          storageNote: isEs ? 'Conservar en despensa fresca y seca' : 'Store in a cool dry pantry (no refrigeration needed)',
          requiresReconstitution: false
        };
      } else if (isTopical) {
        category = {
          type: 'topical',
          badge: isEs ? 'LOCIÓN CAPILAR / TÓPICA' : 'TOPICAL SCALP / DERMAL LOTION',
          icon: '🧴',
          color: '#0d9488',
          bg: '#f8fafc',
          border: '#dadce0',
          storageNote: isEs ? 'Conservar a temperatura ambiente. Agitar suavemente' : 'Store at room temperature. Shake gently before use',
          requiresReconstitution: false
        };
      } else if (isTransdermal) {
        category = {
          type: 'transdermal',
          badge: isEs ? 'CREMA TRANSDÉRMICA (BHRT)' : 'TRANSDERMAL CREAM (BHRT)',
          icon: '⚡',
          color: '#334155',
          bg: '#f8fafc',
          border: '#dadce0',
          storageNote: isEs ? 'Conservar protegido del calor y la luz directa' : 'Store protected from heat and direct sunlight',
          requiresReconstitution: false
        };
      }

      // Extract main clinical goal in plain language
      const goalList = [];
      apis.forEach(a => {
        if (a.indication) goalList.push(a.indication);
        else if (a.role) goalList.push(a.role);
        else if (a.cellularTarget) goalList.push(a.cellularTarget);
      });
      const plainClinicalGoal = goalList.length > 0 
        ? goalList.slice(0, 3).join(' · ')
        : (isEs ? 'Optimización metabólica y soporte regenerativo celular' : 'Cellular regenerative support and metabolic optimization');

      // Check for vial size in mg and dose in mcg for reconstitution
      let estimatedVialMg = 5;
      let estimatedDoseMcg = 250;
      const volStr = String(formulation.volume || '');
      const mgMatch = volStr.match(/(\d+(\.\d+)?)\s*mg/i);
      if (mgMatch) estimatedVialMg = parseFloat(mgMatch[1]);

      const posologyStr = String(formulation.posology?.regimen || '');
      const mcgMatch = posologyStr.match(/(\d+(\.\d+)?)\s*mcg/i);
      if (mcgMatch) estimatedDoseMcg = parseFloat(mcgMatch[1]);

      return {
        ...formulation,
        itemIndex: idx + 1,
        category,
        plainClinicalGoal,
        estimatedVialMg,
        estimatedDoseMcg
      };
    });
  }, [compoundedFormulations, isEs]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', marginBottom: '2rem' }}>
      
      {/* ── Patient & Physician Unified Greeting Hero (Trust-First Architecture) ── */}
      <PatientPhysicianGreetingHero
        patientName={patientName || (isEs ? 'Paciente' : 'Patient')}
        patientRef={rxId}
        doctorName={doctorName || (isEs ? 'Dra. Marina Cordeiro Fernandes' : 'Dr. Marina Cordeiro Fernandes')}
        doctorSpecialty="Longevity & Integrative Medicine"
        doctorClinic={doctorClinic || 'Atlas Health Services'}
        doctorNote={rx?.patientInstructions || rx?.doctorNotes || rx?.instructions || ''}
        formulationsCount={categorizedItems.length}
        onSyncCalendar={() => setShowCalendarModal(true)}
        onOpenDoctorContact={() => {
          if (onOpenDoctorContact) {
            onOpenDoctorContact('posology');
          }
        }}
        isEs={isEs}
      />

      {/* ── Item-by-Item Presentation with Differentiated Posology ──────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {categorizedItems.map((item) => {
          return (
            <div
              key={item.id}
              id={`patient-${item.id}`}
              style={{
                background: '#ffffff',
                border: '1px solid #dadce0',
                borderRadius: '10px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(60, 64, 67, 0.08)'
              }}
            >
              {/* Header Bar: Category Badge + Product Name */}
              <div
                style={{
                  background: '#f8fafc',
                  borderBottom: '1px solid #dadce0',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 280px' }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '8px',
                      background: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      color: '#1e293b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.15rem',
                      flexShrink: 0
                    }}
                  >
                    {item.category.icon}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '2px' }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          color: '#334155',
                          background: '#ffffff',
                          border: '1px solid #dadce0',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        {item.category.badge}
                      </span>
                      <span
                        style={{
                          fontSize: '0.70rem',
                          fontWeight: 600,
                          color: '#5f6368',
                          background: '#ffffff',
                          border: '1px solid #dadce0',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        📦 {item.volume}
                      </span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 700, color: '#202124' }}>
                      {item.title}
                    </h3>
                  </div>
                </div>

                {/* Storage Pill */}
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #dadce0',
                    color: '#5f6368',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>{item.category.storageNote}</span>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {/* 1. ¿Para qué me lo han recetado? (Objetivo Terapéutico en Lenguaje Humano) */}
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #dadce0',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}
                >
                  <ShieldCheck size={18} style={{ color: '#1a73e8', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.70rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#5f6368' }}>
                      {isEs ? 'Objetivo Terapéutico' : 'Clinical Objective'}
                    </div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#202124', marginTop: '2px', lineHeight: 1.45 }}>
                      {item.plainClinicalGoal}
                    </div>
                    {item.apis && item.apis.length > 0 && (
                      <div style={{ marginTop: '6px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {item.apis.map((a, aIdx) => (
                          <span
                            key={aIdx}
                            style={{
                              fontSize: '0.70rem',
                              fontWeight: 600,
                              color: '#3c4043',
                              background: '#f8fafc',
                              border: '1px solid #dadce0',
                              padding: '2px 7px',
                              borderRadius: '4px'
                            }}
                          >
                            ✓ {a.name || a.productName} ({a.dosage})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Posología Ultra Clara y Específica */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #dadce0',
                    borderRadius: '8px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '6px',
                          background: '#e8f0fe',
                          color: '#1a73e8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Clock size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#1a73e8' }}>
                          {isEs ? 'PAUTA Y POSOLOGÍA RECOMENDADA' : 'DOSING & SCHEDULE'}
                        </div>
                        <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 700, color: '#202124' }}>
                          {item.posology?.title || (isEs ? 'Pauta de Administración' : 'Dosing Protocol')}
                        </h4>
                      </div>
                    </div>

                    {/* Regimen badge */}
                    <div
                      style={{
                        background: '#ffffff',
                        border: '1px solid #dadce0',
                        color: '#202124',
                        padding: '4px 12px',
                        borderRadius: '16px',
                        fontSize: '0.80rem',
                        fontWeight: 700
                      }}
                    >
                      {String(item.posology?.regimen || (isEs ? 'Consultar pauta' : 'Follow prescription'))}
                    </div>
                  </div>

                  {/* Contextual Posology Advice: Supplement vs Peptide vs Topical */}
                  {item.category.type === 'peptide' ? (
                    /* PEPTIDE DOSING BOX */
                    <div
                      style={{
                        background: '#ffffff',
                        border: '1px solid #dadce0',
                        borderRadius: '6px',
                        padding: '12px 14px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.70rem', color: '#5f6368', fontWeight: 700, textTransform: 'uppercase' }}>
                          {isEs ? '💉 Dosis por Inyección:' : '💉 Dose per Injection:'}
                        </div>
                        <div style={{ fontSize: '1.02rem', fontWeight: 700, color: '#1a73e8' }}>
                          {item.estimatedDoseMcg} mcg{' '}
                          <span style={{ fontSize: '0.76rem', color: '#5f6368', fontWeight: 500 }}>
                            (aprox. 10 unidades en U-100)
                          </span>
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.70rem', color: '#5f6368', fontWeight: 700, textTransform: 'uppercase' }}>
                          {isEs ? '🕒 Momento / Frecuencia:' : '🕒 Timing & Schedule:'}
                        </div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#202124' }}>
                          {item.posology?.timing || (isEs ? 'Por la noche, rotando sitios en abdomen' : 'At bedtime, rotating abdominal sites')}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.70rem', color: '#5f6368', fontWeight: 700, textTransform: 'uppercase' }}>
                          {isEs ? '📍 Zona de Aplicación:' : '📍 Injection Site:'}
                        </div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#202124' }}>
                          {isEs ? 'Tejido graso subcutáneo del abdomen' : 'Subcutaneous abdominal fat'}
                        </div>
                      </div>
                    </div>
                  ) : item.category.type === 'supplement' ? (
                    /* ORAL SUPPLEMENT DOSING BOX */
                    <div
                      style={{
                        background: '#ffffff',
                        border: '1px solid #dadce0',
                        borderRadius: '6px',
                        padding: '12px 14px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.70rem', color: '#5f6368', fontWeight: 700, textTransform: 'uppercase' }}>
                          {isEs ? '💊 Toma Diaria:' : '💊 Daily Intake:'}
                        </div>
                        <div style={{ fontSize: '1.02rem', fontWeight: 700, color: '#202124' }}>
                          {item.posology?.regimen || (isEs ? '1–2 cápsulas con agua' : '1–2 capsules with water')}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.70rem', color: '#5f6368', fontWeight: 700, textTransform: 'uppercase' }}>
                          {isEs ? '🕒 Momento del Día:' : '🕒 Best Time:'}
                        </div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#202124' }}>
                          {item.posology?.timing || (isEs ? 'Con el desayuno o cena' : 'With breakfast or dinner')}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.70rem', color: '#5f6368', fontWeight: 700, textTransform: 'uppercase' }}>
                          {isEs ? '💡 Recomendación:' : '💡 Tip:'}
                        </div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#202124' }}>
                          {isEs ? 'Acompañar siempre de un vaso completo de agua' : 'Always take with a full glass of water'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* TOPICAL / TRANSDERMAL DOSING BOX */
                    <div
                      style={{
                        background: '#ffffff',
                        border: '1px solid #dadce0',
                        borderRadius: '6px',
                        padding: '12px 14px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.70rem', color: '#5f6368', fontWeight: 700, textTransform: 'uppercase' }}>
                          {isEs ? '🧴 Cantidad por Aplicación:' : '🧴 Dose Volume:'}
                        </div>
                        <div style={{ fontSize: '1.02rem', fontWeight: 700, color: '#202124' }}>
                          {item.posology?.regimen || '1.0 mL'}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.70rem', color: '#5f6368', fontWeight: 700, textTransform: 'uppercase' }}>
                          {isEs ? '🕒 Momento y Frecuencia:' : '🕒 Timing & Application:'}
                        </div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#202124' }}>
                          {item.posology?.timing || (isEs ? 'Por la noche sobre piel limpia y seca' : 'Nightly on clean and dry skin')}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.70rem', color: '#5f6368', fontWeight: 700, textTransform: 'uppercase' }}>
                          {isEs ? '💆 Modo de Empleo:' : '💆 Application Method:'}
                        </div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#202124' }}>
                          {isEs ? 'Masajear suavemente con la yema de los dedos hasta absorción' : 'Gently massage with fingertips until absorbed'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Specific Doctor Clinical Directions if any */}
                  {item.posology?.dosageInstructions && (
                    <div
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        fontSize: '0.78rem',
                        color: '#1e293b',
                        lineHeight: 1.45,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px'
                      }}
                    >
                      <Info size={15} style={{ flexShrink: 0, marginTop: '2px', color: '#2563eb' }} />
                      <div>
                        <strong>{isEs ? 'Instrucciones adicionales de tu médico:' : 'Physician notes:'}</strong>{' '}
                        <span>{item.posology.dosageInstructions}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. GUÍA DE RECONSTITUCIÓN (Si es Péptido o Vial Liofilizado) */}
                {item.category.requiresReconstitution && (
                  <div style={{ marginTop: '4px' }}>
                    <ReconstitutionGuideCard
                      productName={item.title}
                      vialDoseMg={item.estimatedVialMg || 5}
                      diluentVolumeMl={2.0}
                      prescribedDoseMcg={item.estimatedDoseMcg || 250}
                      lang={isEs ? 'es' : 'en'}
                      initiallyExpanded={true}
                    />
                  </div>
                )}

              </div>
            </div>
          );
        })}
      </div>

      {/* ── Daily Adherence Check-In Widget ─────────────────────────────────── */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #dadce0',
          borderRadius: '10px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 1px 3px rgba(60,64,67,0.06)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: hasTakenDoseToday ? '#e6f4ea' : '#f1f3f4',
              color: hasTakenDoseToday ? '#137333' : '#5f6368',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Calendar size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#202124' }}>
              {isEs ? '¿Has tomado tu medicación de hoy?' : 'Did you take today’s medication?'}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#5f6368', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <span>
                {hasTakenDoseToday
                  ? (isEs ? '✓ Dosis de hoy completada' : '✓ Today’s dose logged')
                  : (isEs ? 'Pendiente de registrar para hoy' : 'Pending today log')}
              </span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#e37400', fontWeight: 700 }}>
                <Flame size={13} /> {streakDays} {isEs ? 'días consecutivos de adherencia' : 'day streak'}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleDose}
          style={{
            height: '36px',
            padding: '0 16px',
            borderRadius: '6px',
            border: hasTakenDoseToday ? '1px solid #ceead6' : '1px solid #1a73e8',
            background: hasTakenDoseToday ? '#e6f4ea' : '#1a73e8',
            color: hasTakenDoseToday ? '#137333' : '#ffffff',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s ease'
          }}
        >
          {hasTakenDoseToday ? (
            <>
              <Check size={16} />
              <span>{isEs ? 'Dosis Completada ✓' : 'Dose Complete ✓'}</span>
            </>
          ) : (
            <span>{isEs ? 'Marcar Dosis como Tomada' : 'Mark Dose as Taken'}</span>
          )}
        </button>
      </div>

      {/* ── Direct Clinical Channels (WhatsApp, Refill, Phone) ───────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '12px'
        }}
      >
        {/* Direct Physician Clinical Desk */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('selection');
            if (onOpenDoctorContact) {
              onOpenDoctorContact('posology');
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            color: '#202124',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 3px rgba(60,64,67,0.05)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#137333'; e.currentTarget.style.backgroundColor = '#f0fdf4'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.backgroundColor = '#ffffff'; }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              background: '#e6f4ea',
              color: '#137333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <MessageCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#137333' }}>
              {isEs ? 'Mesa Clínica del Médico' : 'Direct Doctor Clinical Desk'}
            </div>
            <div style={{ fontSize: '0.70rem', color: '#5f6368' }}>
              {isEs ? 'Aclarar pauta, horarios o tolerancia' : 'Clarify dosage, schedule or tolerance'}
            </div>
          </div>
        </button>

        {/* In-App Direct Prescription Cycle Refill */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('selection');
            if (onOpenDoctorContact) {
              onOpenDoctorContact('refill');
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            color: '#202124',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 3px rgba(60,64,67,0.05)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1a73e8'; e.currentTarget.style.backgroundColor = '#f8fafd'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.backgroundColor = '#ffffff'; }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              background: '#e8f0fe',
              color: '#1a73e8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <RotateCcw size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1a73e8' }}>
              {isEs ? 'Solicitar Refill / Continuación' : 'Clinical Refill Request'}
            </div>
            <div style={{ fontSize: '0.70rem', color: '#5f6368' }}>
              {isEs ? 'Renovar pauta para el siguiente ciclo' : 'Order continuation supply'}
            </div>
          </div>
        </button>

        {/* Doctor Phone Direct Call */}
        {doctorPhone && (
          <a
            href={`tel:${doctorPhone}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              textDecoration: 'none',
              color: '#202124',
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 3px rgba(60,64,67,0.05)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0284c7'; e.currentTarget.style.backgroundColor = '#f0f9ff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.backgroundColor = '#ffffff'; }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                background: '#f0f9ff',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Phone size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0369a1' }}>
                {isEs ? 'Llamar a la Consulta' : 'Call Practice'}
              </div>
              <div style={{ fontSize: '0.70rem', color: '#5f6368' }}>
                {doctorPhone}
              </div>
            </div>
          </a>
        )}
      </div>

      {/* ── Official Compounding & Direct Delivery Section (Trust-First Position) ── */}
      <div
        className="rx-card patient-compounding-fulfillment-card"
        style={{
          background: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #dadce0',
          borderLeft: '4px solid #1a73e8',
          padding: '1.25rem 1.5rem',
          boxShadow: '0 1px 3px rgba(60, 64, 67, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginTop: '0.5rem',
          marginBottom: '0.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: '#e8f0fe',
                  color: '#1a73e8',
                  border: '1px solid #d2e3fc',
                }}
              >
                {isEs ? 'Preparación en Laboratorio Homologado' : 'Authorized Pharmaceutical Compounding'}
              </span>
              <span style={{ fontSize: '0.70rem', color: '#5f6368', fontFamily: 'monospace' }}>
                Ref: #{rxId}
              </span>
            </div>
            <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.05rem', fontWeight: 700, color: '#202124' }}>
              {isEs ? '¿Deseas recibir tu medicación personalizada en casa?' : 'Receive Your Physician-Prescribed Formulations'}
            </h3>
            <p style={{ margin: 0, fontSize: '0.80rem', color: '#5f6368', lineHeight: 1.5, maxWidth: '640px' }}>
              {isEs
                ? 'Tu médico ha autorizado la preparación de esta pauta en laboratorio especializado bajo normativa EU GMP cleanroom. Puedes solicitar la dispensación oficial y el envío con control térmico a tu domicilio o clínica.'
                : 'Your physician has authorized official compounding for this custom formula under certified EU GMP cleanroom standards. Request pharmaceutical preparation with direct cold-chain delivery.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', alignSelf: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                if (onOpenQuotation) onOpenQuotation();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '6px',
                background: '#1a73e8',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(26, 115, 232, 0.3)',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{isEs ? 'Solicitar Preparación en Farmacia' : 'Request Official Compounding'}</span>
              <span>→</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                if (onOpenDoctorContact) {
                  onOpenDoctorContact('posology');
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 14px',
                borderRadius: '6px',
                background: '#ffffff',
                color: '#3c4043',
                border: '1px solid #dadce0',
                fontSize: '0.80rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <span>{isEs ? 'Preguntar a la Clínica' : 'Ask Clinic a Question'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Compartir con el Médico & Código QR (Orientado a la Consulta) ── */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #dadce0',
          borderRadius: '10px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          marginTop: '6px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '8px',
              background: '#e8f0fe',
              color: '#1a73e8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#202124' }}>
              {isEs ? 'Compartir Prescripción con tu Médico o Consulta' : 'Share Prescription with Your Doctor or Clinic'}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#5f6368', marginTop: '2px' }}>
              {isEs
                ? 'Muestra esta página en tu consulta médica o comparte el enlace directo para que tu doctor revise tu pauta y adherencia.'
                : 'Show this page during your medical consultation or share the direct link for your physician to review adherence.'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              if (navigator?.clipboard && patientPublicUrl) {
                navigator.clipboard.writeText(patientPublicUrl);
                toast.success(isEs ? 'Enlace copiado al portapapeles ✓' : 'Link copied to clipboard ✓');
              }
            }}
            style={{
              height: '34px',
              padding: '0 14px',
              borderRadius: '6px',
              border: '1px solid #dadce0',
              background: '#ffffff',
              color: '#1a73e8',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🔗 {isEs ? 'Copiar Enlace' : 'Copy Link'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              if (onOpenDoctorContact) {
                onOpenDoctorContact('general');
              }
            }}
            style={{
              height: '34px',
              padding: '0 14px',
              borderRadius: '6px',
              border: 'none',
              background: '#1a73e8',
              color: '#ffffff',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🩺 {isEs ? 'Mesa Clínica Digital' : 'Atlas Clinical Desk'}</span>
          </button>
        </div>
      </div>

      {/* ── Google Cloud UX Adherence Calendar Sync Modal ── */}
      <CalendarSyncModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        rxId={rxId}
        patientName={patientName}
        doctorName={doctorName}
        compoundedFormulations={compoundedFormulations}
        patientPublicUrl={patientPublicUrl}
        isEs={isEs}
      />
    </div>
  );
}
