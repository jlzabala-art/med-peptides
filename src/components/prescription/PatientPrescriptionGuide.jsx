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
  patientPublicUrl = ''
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
  const clinicalInquiryUrl = useMemo(() => {
    const cleanPhone = String(doctorPhone || '+97143498800').replace(/[^0-9]/g, '');
    const msg = isEs
      ? `Estimado equipo médico de ${doctorClinic || 'la clínica'},\nSoy ${patientName || 'Paciente'}. Me comunico en relación a mi prescripción #${rxId}.\nTengo una consulta sobre la posología o forma de administración:\n\n[Escriba su consulta aquí]\n\n🔗 Enlace de mi receta: ${patientPublicUrl}`
      : `Dear ${doctorClinic || 'clinical'} team,\nI am ${patientName || 'Patient'}. I am contacting you regarding my prescription #${rxId}.\nI have a question about my dosage or administration protocol:\n\n[Type your question here]\n\n🔗 My prescription: ${patientPublicUrl}`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  }, [doctorPhone, doctorClinic, patientName, rxId, isEs, patientPublicUrl]);

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
        color: '#003666',
        bg: '#eff6ff',
        border: '#bfdbfe',
        storageNote: isEs ? 'Conservar a temperatura ambiente protegida de la luz' : 'Store at room temperature protected from light'
      };

      if (isPeptide) {
        category = {
          type: 'peptide',
          badge: isEs ? 'PÉPTIDO INYECTABLE (SUBQ)' : 'INJECTABLE PEPTIDE (SUBQ)',
          icon: '💉',
          color: '#2563eb',
          bg: '#eff6ff',
          border: '#bfdbfe',
          storageNote: isEs ? '❄️ Requiere Nevera Obligatoria (2°C – 8°C). ¡No congelar!' : '❄️ Mandatory Refrigeration (2°C – 8°C). Do Not Freeze!',
          requiresReconstitution: true
        };
      } else if (isSupplement) {
        category = {
          type: 'supplement',
          badge: isEs ? 'SUPLEMENTO / NUTRACÉUTICO ORAL' : 'ORAL SUPPLEMENT / NUTRACEUTICAL',
          icon: '💊',
          color: '#ea580c',
          bg: '#fff7ed',
          border: '#fed7aa',
          storageNote: isEs ? 'Conservar en despensa fresca y seca (sin refrigeración)' : 'Store in a cool dry pantry (no refrigeration needed)',
          requiresReconstitution: false
        };
      } else if (isTopical) {
        category = {
          type: 'topical',
          badge: isEs ? 'LOCIÓN CAPILAR / TÓPICA' : 'TOPICAL SCALP / DERMAL LOTION',
          icon: '🧴',
          color: '#0d9488',
          bg: '#f0fdfa',
          border: '#99f6e4',
          storageNote: isEs ? 'Conservar a temperatura ambiente. Agitar suavemente antes de usar' : 'Store at room temperature. Shake gently before use',
          requiresReconstitution: false
        };
      } else if (isTransdermal) {
        category = {
          type: 'transdermal',
          badge: isEs ? 'CREMA TRANSDÉRMICA (BHRT)' : 'TRANSDERMAL CREAM (BHRT)',
          icon: '⚡',
          color: '#7c3aed',
          bg: '#f5f3ff',
          border: '#ddd6fe',
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
      
      {/* ── Patient Welcome & Quick Orientation Card ─────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)',
          border: '1px solid #bbf7d0',
          borderRadius: '12px',
          padding: '16px 20px',
          boxShadow: '0 2px 8px rgba(22, 163, 74, 0.06)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: '#16a34a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)'
              }}
            >
              ✓
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#15803d' }}>
                {isEs ? 'GUÍA CLARA PARA EL PACIENTE' : 'PATIENT-FRIENDLY MEDICATION GUIDE'}
              </div>
              <h2 style={{ margin: '2px 0 0 0', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? `Hola, ${patientName || 'Paciente'}` : `Welcome, ${patientName || 'Patient'}`}
              </h2>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#475569' }}>
                {isEs
                  ? `Tu médico ha prescrito ${categorizedItems.length} ${categorizedItems.length === 1 ? 'producto personalizado' : 'productos personalizados'}. A continuación encontrarás qué es cada uno, cómo tomarlo con exactitud y su guía de preparación.`
                  : `Your physician has prescribed ${categorizedItems.length} custom ${categorizedItems.length === 1 ? 'formulation' : 'formulations'}. Below you will find what each is for, exact administration schedules, and preparation guides.`}
              </p>
            </div>
          </div>

          {/* Actions & Doctor Cluster */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                setShowCalendarModal(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                background: '#ffffff',
                border: '1px solid #bfdbfe',
                color: '#1d4ed8',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(29, 78, 216, 0.08)',
                transition: 'all 0.15s ease'
              }}
              title={isEs ? 'Sincronizar recordatorios de toma con tu calendario' : 'Sync dosing reminders with your calendar'}
            >
              <Calendar size={14} color="#1d4ed8" />
              <span>{isEs ? 'Añadir a mi Calendario' : 'Sync to Calendar'}</span>
            </button>

            {/* Quick Doctor Badge */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>👨‍⚕️</span>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{isEs ? 'Médico Prescriptor' : 'Prescribing Doctor'}</div>
                <div style={{ fontSize: '0.80rem', fontWeight: 700, color: '#0f172a' }}>{doctorName || 'Médico Verificado'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Item-by-Item Presentation with Differentiated Posology ──────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {categorizedItems.map((item) => {
          return (
            <div
              key={item.id}
              id={`patient-${item.id}`}
              style={{
                background: '#ffffff',
                border: `1px solid ${item.category.border || '#cbd5e1'}`,
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)'
              }}
            >
              {/* Header Bar: Category Badge + Product Name */}
              <div
                style={{
                  background: item.category.bg || '#f8fafc',
                  borderBottom: `1px solid ${item.category.border || '#e2e8f0'}`,
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 300px' }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '10px',
                      background: item.category.color,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      flexShrink: 0,
                      boxShadow: `0 2px 8px ${item.category.color}40`
                    }}
                  >
                    {item.category.icon}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          color: '#ffffff',
                          background: item.category.color,
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        {item.category.badge}
                      </span>
                      <span
                        style={{
                          fontSize: '0.70rem',
                          fontWeight: 700,
                          color: '#334155',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          padding: '1px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        📦 {item.volume}
                      </span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 800, color: '#0f172a' }}>
                      {item.title}
                    </h3>
                  </div>
                </div>

                {/* Storage Pill */}
                <div
                  style={{
                    background: item.category.type === 'peptide' ? '#ecfdf5' : '#f8fafc',
                    border: `1px solid ${item.category.type === 'peptide' ? '#a7f3d0' : '#cbd5e1'}`,
                    color: item.category.type === 'peptide' ? '#047857' : '#475569',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>{item.category.storageNote}</span>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* 1. ¿Para qué me lo han recetado? (Objetivo Terapéutico en Lenguaje Humano) */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}
                >
                  <span style={{ fontSize: '1.2rem', marginTop: '1px' }}>🎯</span>
                  <div>
                    <div style={{ fontSize: '0.70rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#475569' }}>
                      {isEs ? '¿Para qué sirve este tratamiento?' : 'What is this treatment prescribed for?'}
                    </div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', marginTop: '2px', lineHeight: 1.45 }}>
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
                              color: '#1e293b',
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
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
                    background: item.category.type === 'peptide' ? '#eff6ff' : (item.category.type === 'supplement' ? '#fff7ed' : '#f0fdfa'),
                    border: `1px solid ${item.category.border}`,
                    borderRadius: '10px',
                    padding: '16px',
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
                          borderRadius: '8px',
                          background: item.category.color,
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Clock size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: item.category.color }}>
                          {isEs ? 'PAUTA Y POSOLOGÍA CLARA' : 'EXACT DOSING INSTRUCTIONS'}
                        </div>
                        <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                          {item.posology?.title || (isEs ? 'Pauta de Administración' : 'Dosing Protocol')}
                        </h4>
                      </div>
                    </div>

                    {/* Regimen badge */}
                    <div
                      style={{
                        background: '#ffffff',
                        border: `1px solid ${item.category.color}`,
                        color: item.category.color,
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.82rem',
                        fontWeight: 800
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
                        border: '1px solid #bfdbfe',
                        borderRadius: '8px',
                        padding: '12px 14px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                          {isEs ? '💉 Dosis por Inyección:' : '💉 Dose per Injection:'}
                        </div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1d4ed8' }}>
                          {item.estimatedDoseMcg} mcg{' '}
                          <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
                            (aprox. 10 unidades en jeringa U-100)
                          </span>
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                          {isEs ? '🕒 Momento / Frecuencia:' : '🕒 Timing & Schedule:'}
                        </div>
                        <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
                          {item.posology?.timing || (isEs ? 'Por la noche, rotando sitios en abdomen' : 'At bedtime, rotating abdominal sites')}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                          {isEs ? '📍 Zona de Aplicación:' : '📍 Injection Site:'}
                        </div>
                        <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
                          {isEs ? 'Tejido graso subcutáneo del abdomen (pellizco a 5 cm del ombligo)' : 'Subcutaneous abdominal fat (5 cm away from navel)'}
                        </div>
                      </div>
                    </div>
                  ) : item.category.type === 'supplement' ? (
                    /* ORAL SUPPLEMENT DOSING BOX */
                    <div
                      style={{
                        background: '#ffffff',
                        border: '1px solid #fed7aa',
                        borderRadius: '8px',
                        padding: '12px 14px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                          {isEs ? '💊 Toma Diaria:' : '💊 Daily Intake:'}
                        </div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ea580c' }}>
                          {item.posology?.regimen || (isEs ? '1–2 cápsulas con agua' : '1–2 capsules with water')}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                          {isEs ? '🕒 Momento del Día:' : '🕒 Best Time:'}
                        </div>
                        <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
                          {item.posology?.timing || (isEs ? 'Con el desayuno o cena' : 'With breakfast or dinner')}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                          {isEs ? '💡 Recomendación:' : '💡 Tip:'}
                        </div>
                        <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
                          {isEs ? 'Acompañar siempre de un vaso completo de agua' : 'Always take with a full glass of water'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* TOPICAL / TRANSDERMAL DOSING BOX */
                    <div
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        padding: '12px 14px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                          {isEs ? '🧴 Cantidad por Aplicación:' : '🧴 Dose Volume:'}
                        </div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0d9488' }}>
                          {item.posology?.regimen || '1.0 mL'}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                          {isEs ? '🕒 Momento y Frecuencia:' : '🕒 Timing & Application:'}
                        </div>
                        <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
                          {item.posology?.timing || (isEs ? 'Por la noche sobre piel limpia y seca' : 'Nightly on clean and dry skin')}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                          {isEs ? '💆‍♂️ Modo de Empleo:' : '💆‍♂️ Application Method:'}
                        </div>
                        <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
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
        {/* WhatsApp Clinical Inquiry */}
        <a
          href={clinicalInquiryUrl}
          target="_blank"
          rel="noopener noreferrer"
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
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#25D366'; e.currentTarget.style.backgroundColor = '#f0fdf4'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.backgroundColor = '#ffffff'; }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              background: '#25D366',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <MessageCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#166534' }}>
              {isEs ? 'Consultar Duda al Médico' : 'Ask Doctor via WhatsApp'}
            </div>
            <div style={{ fontSize: '0.70rem', color: '#5f6368' }}>
              {isEs ? 'Aclarar pauta o reportar tolerancia' : 'Clarify dosage or tolerance'}
            </div>
          </div>
        </a>

        {/* Request Refill */}
        <a
          href={`https://wa.me/${String(doctorPhone || '+97143498800').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
            isEs
              ? `Estimado equipo de ${doctorClinic || 'la clínica'},\nSoy ${patientName}. Mi prescripción #${rxId} está por terminar y deseo solicitar la renovación / refill de mi tratamiento.`
              : `Dear ${doctorClinic || 'clinical'} team,\nI am ${patientName}. My prescription #${rxId} is completing its cycle and I would like to request a refill.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
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
            <RotateCcw size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1a73e8' }}>
              {isEs ? 'Solicitar Refill / Renovación' : 'Request Refill / Renewal'}
            </div>
            <div style={{ fontSize: '0.70rem', color: '#5f6368' }}>
              {isEs ? 'Pedir nuevo ciclo de tratamiento' : 'Order next treatment supply'}
            </div>
          </div>
        </a>

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

      {/* ── Compartir con el Médico & Código QR (Orientado a la Consulta) ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
          border: '1px solid #bfdbfe',
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
              background: '#1e3a8a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
              {isEs ? 'Compartir Prescripción con tu Médico o Consulta' : 'Share Prescription with Your Doctor or Clinic'}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '2px' }}>
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
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#003666',
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

          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              isEs
                ? `Hola Doctor, le comparto mi prescripción médica #${rxId}: ${patientPublicUrl}`
                : `Hello Doctor, here is my medical prescription #${rxId}: ${patientPublicUrl}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              height: '34px',
              padding: '0 14px',
              borderRadius: '6px',
              border: 'none',
              background: '#25D366',
              color: '#ffffff',
              fontSize: '0.76rem',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>💬 {isEs ? 'Compartir por WhatsApp' : 'Share via WhatsApp'}</span>
          </a>
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
