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
import { detectPrescriptionType } from '@/utils/prescriptionTypeDetection';
import { triggerHaptic } from '@/utils/haptics';
import toast from 'react-hot-toast';

function localizePatientText(raw, isEs) {
  if (!raw || !isEs) return raw;
  let t = String(raw);
  const rules = [
    [/\bInject\b/gi, 'Aplicar'],
    [/\bclicks\b/gi, 'clics'],
    [/\bsubcutaneously\b/gi, 'por vía subcutánea'],
    [/\bevery morning\b/gi, 'cada mañana'],
    [/\bevery evening\b/gi, 'cada tarde/noche'],
    [/\bonce daily\b/gi, '1 vez al día'],
    [/\btwice daily\b/gi, '2 veces al día'],
    [/\bonce weekly\b/gi, '1 vez por semana'],
    [/\b(\d+)-month plan\b/gi, 'plan de $1 meses'],
    [/\bpens total\b/gi, 'plumas en total'],
    [/\bfor (\d+) months?\b/gi, 'durante $1 mes(es)'],
    [/\bfor (\d+) weeks?\b/gi, 'durante $1 semana(s)'],
    [/\bApply one \(1\) spray in each nostril as directed by physician\.?/gi, 'Aplicar 1 pulverización en cada fosa nasal según pauta indicada.'],
    [/\bas directed by physician\b/gi, 'según pauta indicada'],
    [/\bRefrigerate at\b/gi, 'Conservar en nevera a'],
    [/\bKeep refrigerated\b/gi, 'Conservar en nevera'],
    [/\bProtect from light\b/gi, 'Proteger de la luz'],
    [/\bOpen one pen at a time\b/gi, 'Abrir una pluma cada vez'],
    [/\bDo not freeze\b/gi, 'No congelar'],
    [/\bStore at room temperature\b/gi, 'Conservar a temperatura ambiente'],
  ];
  for (const [re, rep] of rules) {
    t = t.replace(re, rep);
  }
  return t;
}

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
  urlLot = '',
  urlBud = '',
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

  // 7-day interactive adherence log (last 6 days + today) persisted per YYYY-MM-DD
  const last7Days = useMemo(() => {
    const out = [];
    for (let offset = 6; offset >= 0; offset--) {
      const d = new Date();
      d.setDate(d.getDate() - offset);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const label = d.toLocaleDateString(isEs ? 'es-ES' : 'en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      out.push({ key, label, dayNum, isToday: offset === 0 });
    }
    return out;
  }, [isEs]);

  const [loggedDaysMap, setLoggedDaysMap] = useState(() => {
    const map = {};
    if (typeof window === 'undefined') return map;
    try {
      for (let offset = 6; offset >= 0; offset--) {
        const d = new Date();
        d.setDate(d.getDate() - offset);
        const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        map[k] = Boolean(localStorage.getItem(`atlas_rx_adherence_${rxId}_${k}`));
      }
    } catch {
      /* ignore */
    }
    return map;
  });

  const [loggedCountToastShown, setLoggedCountToastShown] = useState(false);
  const [notifPermission, setNotifPermission] = useState(() => {
    if (typeof window === 'undefined' || typeof Notification === 'undefined') return 'unsupported';
    return Notification.permission || 'default';
  });
  const [showNotifPromptCard, setShowNotifPromptCard] = useState(false);
  const [notifDismissed, setNotifDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(`atlas_rx_notif_dismissed_${rxId}`) === '1';
    } catch {
      return false;
    }
  });
  const [isIosNonStandalone] = useState(() => {
    if (typeof window === 'undefined') return false;
    const ua = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(ua);
    const isStandalone = window.navigator.standalone === true || window.matchMedia?.('(display-mode: standalone)')?.matches;
    return isIos && !isStandalone;
  });
  const [refillAlertOptIn, setRefillAlertOptIn] = useState(false);
  const [refillAlertContact, setRefillAlertContact] = useState('');
  const [refillAlertSaved, setRefillAlertSaved] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return Boolean(localStorage.getItem(`atlas_rx_refill_alert_${rxId}`));
    } catch {
      return false;
    }
  });

  const maybePromptNotifications = () => {
    if (notifDismissed || notifPermission === 'granted') return;
    setShowNotifPromptCard(true);
  };

  const handleRequestNotifications = async () => {
    triggerHaptic('selection');
    if (typeof window === 'undefined' || typeof Notification === 'undefined') {
      toast(isEs ? 'Usa "Añadir al Calendario" para recibir recordatorios en este dispositivo.' : 'Use "Add to Calendar" to get reminders on this device.');
      return;
    }
    try {
      const result = await Notification.requestPermission();
      setNotifPermission(result);
      if (result === 'granted') {
        toast.success(
          isEs
            ? 'Notificaciones activadas ✓ Te avisaremos para tus tomas y tu próximo refill.'
            : 'Notifications enabled ✓ We will remind you for doses and refills.'
        );
        try {
          new Notification(isEs ? 'Recordatorios activados' : 'Reminders enabled', {
            body: isEs
              ? `Pauta: ${posologySchedule.timeHint || 'Según etiqueta'}`
              : `Schedule: ${posologySchedule.timeHint || 'As labeled'}`,
          });
        } catch {
          /* ignore browsers requiring SW for new Notification() */
        }
      } else if (result === 'denied') {
        toast.error(
          isEs
            ? 'Permiso denegado en el navegador. Puedes usar "Añadir al Calendario".'
            : 'Browser permission blocked. You can still use "Add to Calendar".'
        );
      }
    } catch {
      toast(isEs ? 'Usa "Añadir al Calendario" para configurar recordatorios.' : 'Use "Add to Calendar" to set up reminders.');
    }
  };

  const handleSaveRefillAlert = async (e) => {
    e.preventDefault();
    const val = refillAlertContact.trim();
    if (!val || val.length < 5) {
      toast.error(isEs ? 'Introduce tu WhatsApp o email.' : 'Please enter your WhatsApp or email.');
      return;
    }
    triggerHaptic('selection');
    try {
      localStorage.setItem(`atlas_rx_refill_alert_${rxId}`, val);
      await fetch('/api/portal/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'patient_refill_reminder_optin',
          rxId,
          patientName,
          contact: val,
          message: `Patient opted in to 7-day pre-refill reminder for #${rxId} (${posologySchedule.timeHint || 'treatment'}).`,
        }),
      }).catch(() => {});
      setRefillAlertSaved(true);
      toast.success(isEs ? 'Aviso de refill guardado ✓' : 'Refill reminder saved ✓');
    } catch {
      toast.error(isEs ? 'No se pudo guardar.' : 'Could not save.');
    }
  };

  const handleToggleDay = (dayKey, isToday) => {
    triggerHaptic('selection');
    const nextVal = !loggedDaysMap[dayKey];
    setLoggedDaysMap((prev) => ({ ...prev, [dayKey]: nextVal }));
    if (isToday) setHasTakenDoseToday(nextVal);
    try {
      const fullKey = `atlas_rx_adherence_${rxId}_${dayKey}`;
      if (nextVal) {
        localStorage.setItem(fullKey, JSON.stringify({ taken: true, time: new Date().toLocaleTimeString() }));
        toast.success(isEs ? 'Dosis registrada ✓' : 'Dose logged ✓', { icon: '💊' });
        maybePromptNotifications();
      } else {
        localStorage.removeItem(fullKey);
      }
    } catch {
      /* ignore */
    }
  };

  const loggedCount7d = Object.values(loggedDaysMap).filter(Boolean).length;

  // Posology-aware schedule classifier (strictly scoped to this prescription, never mixing types)
  const posologySchedule = useMemo(() => {
    const rawPos = [
      rx?.posology,
      rx?.frequency,
      rx?.items?.[0]?.instructions,
      compoundedFormulations?.[0]?.posology?.regimen,
      compoundedFormulations?.[0]?.posology?.timing,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const formStr = `${rx?.dispensingForm || ''} ${rx?.treatmentTitle || ''} ${rx?.title || ''}`.toLowerCase();

    if (/\b(pellet|implant)\b/i.test(`${formStr} ${rawPos}`)) {
      return { mode: 'in_clinic', targetPerWeek: 0, timeHint: null };
    }
    if (/\b(twice\s*daily|bid|2x\s*\/?\s*day|2\s*times?\s*(?:a|per)\s*day|every\s*12\s*h|cada\s*12\s*h|dos\s*veces\s*al\s*d[ií]a|morning\s*(?:and|&)\s*(?:evening|night)|ma[nñ]ana\s*y\s*(?:tarde|noche))\b/i.test(rawPos)) {
      return { mode: 'twice_daily', targetPerWeek: 14, timeHint: isEs ? 'Mañana y tarde/noche' : 'Morning & Evening' };
    }
    const multiWeekMatch = rawPos.match(/\b([2-6])\s*(?:x\s*\/?\s*week|times?\s*(?:a|per)\s*week|veces\s*(?:a\s*la|por)\s*semana|days?\s*(?:a|per)\s*week|d[ií]as\s*(?:a\s*la|por)\s*semana|days?\s*on)\b/i);
    if (multiWeekMatch) {
      const n = parseInt(multiWeekMatch[1], 10);
      return { mode: 'custom_weekly', targetPerWeek: n, timeHint: isEs ? `${n} días por semana` : `${n} days per week` };
    }
    if (/\b(weekly|once\s*(?:a|per)\s*week|1x\s*\/?\s*week|every\s*week|cada\s*semana|semanal|1\s*vez\s*(?:a\s*la|por)\s*semana)\b/i.test(rawPos)) {
      return { mode: 'weekly', targetPerWeek: 1, timeHint: isEs ? '1 vez por semana' : 'Once a week' };
    }
    const isMorning = /\b(morning|am|breakfast|ma[nñ]ana|desayuno)\b/i.test(rawPos);
    const isEvening = /\b(evening|night|bedtime|pm|tarde|noche|antes\s*de\s*dormir)\b/i.test(rawPos);
    return {
      mode: 'daily',
      targetPerWeek: 7,
      timeHint: isMorning
        ? (isEs ? 'Cada mañana' : 'Every morning')
        : isEvening
        ? (isEs ? 'Cada tarde / noche' : 'Every evening / night')
        : (isEs ? '1 vez al día' : 'Once daily'),
    };
  }, [rx, compoundedFormulations, isEs]);

  // Twice-daily AM/PM state for today + Weekly 4-week state
  const [amPmToday, setAmPmToday] = useState(() => {
    if (typeof window === 'undefined') return { am: false, pm: false };
    try {
      return {
        am: Boolean(localStorage.getItem(`atlas_rx_adherence_${rxId}_${todayKey}_am`)),
        pm: Boolean(localStorage.getItem(`atlas_rx_adherence_${rxId}_${todayKey}_pm`)),
      };
    } catch {
      return { am: false, pm: false };
    }
  });

  const handleToggleAmPm = (slot) => {
    triggerHaptic('selection');
    const nextVal = !amPmToday[slot];
    const updated = { ...amPmToday, [slot]: nextVal };
    setAmPmToday(updated);
    try {
      const k = `atlas_rx_adherence_${rxId}_${todayKey}_${slot}`;
      if (nextVal) {
        localStorage.setItem(k, JSON.stringify({ taken: true, slot, time: new Date().toLocaleTimeString() }));
        toast.success(
          slot === 'am'
            ? (isEs ? 'Toma de la mañana registrada ✓' : 'Morning dose logged ✓')
            : (isEs ? 'Toma de la tarde/noche registrada ✓' : 'Evening dose logged ✓'),
          { icon: slot === 'am' ? '☀️' : '🌙' }
        );
        maybePromptNotifications();
      } else {
        localStorage.removeItem(k);
      }
      const dayFullKey = `atlas_rx_adherence_${rxId}_${todayKey}`;
      if (updated.am || updated.pm) {
        localStorage.setItem(dayFullKey, JSON.stringify({ taken: true, am: updated.am, pm: updated.pm }));
        setLoggedDaysMap((prev) => ({ ...prev, [todayKey]: true }));
        setHasTakenDoseToday(true);
      } else {
        localStorage.removeItem(dayFullKey);
        setLoggedDaysMap((prev) => ({ ...prev, [todayKey]: false }));
        setHasTakenDoseToday(false);
      }
    } catch {
      /* ignore */
    }
  };

  const last4Weeks = useMemo(() => {
    const weeks = [];
    const now = new Date();
    for (let w = 3; w >= 0; w--) {
      const d = new Date(now);
      d.setDate(d.getDate() - w * 7);
      // ISO week key approximation (Monday-based year-week)
      const jan1 = new Date(d.getFullYear(), 0, 1);
      const weekNum = Math.ceil((((d - jan1) / 86400000) + jan1.getDay() + 1) / 7);
      const key = `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
      weeks.push({
        key,
        isCurrent: w === 0,
        label: w === 0
          ? (isEs ? 'Esta semana' : 'This week')
          : w === 1
          ? (isEs ? 'Semana pasada' : 'Last week')
          : (isEs ? `Hace ${w} sem.` : `${w} wks ago`),
      });
    }
    return weeks;
  }, [isEs]);

  const [loggedWeeksMap, setLoggedWeeksMap] = useState(() => {
    const map = {};
    if (typeof window === 'undefined') return map;
    try {
      last4Weeks.forEach((wk) => {
        map[wk.key] = Boolean(localStorage.getItem(`atlas_rx_adherence_${rxId}_${wk.key}`));
      });
    } catch {
      /* ignore */
    }
    return map;
  });

  const handleToggleWeek = (weekKey, isCurrent) => {
    triggerHaptic('selection');
    const nextVal = !loggedWeeksMap[weekKey];
    setLoggedWeeksMap((prev) => ({ ...prev, [weekKey]: nextVal }));
    if (isCurrent) setHasTakenDoseToday(nextVal);
    try {
      const k = `atlas_rx_adherence_${rxId}_${weekKey}`;
      if (nextVal) {
        localStorage.setItem(k, JSON.stringify({ taken: true, time: new Date().toLocaleDateString() }));
        toast.success(isEs ? 'Dosis semanal registrada ✓' : 'Weekly dose logged ✓', { icon: '💊' });
        maybePromptNotifications();
      } else {
        localStorage.removeItem(k);
      }
    } catch {
      /* ignore */
    }
  };

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

      // Universal classification via central detection engine
      const detected = detectPrescriptionType(rx, [formulation]);
      const isPrefilledPen = detected.isPen;
      const isPeptide = detected.isInjectable || isPrefilledPen;
      const isSupplement = detected.isOral;
      const isTopical = detected.isTopical;
      const isTransdermal = detected.isTransdermal;

      // Derive patient-friendly category details
      let category = {
        type: 'compounding',
        badge: isEs ? 'FÓRMULA MAGISTRAL' : 'COMPOUNDED FORMULA',
        icon: '🧪',
        color: '#1a73e8',
        bg: '#f8fafc',
        border: '#dadce0',
        storageNote: localizePatientText(rx?.storage || formulation.storage, isEs) || (isEs ? 'Conservar a temperatura ambiente protegida de la luz' : 'Store at room temperature protected from light')
      };

      if (isPrefilledPen) {
        category = {
          type: 'prefilled_pen',
          badge: isEs ? 'PLUMA PRECARGADA DE PÉPTIDOS (SUBQ PEN)' : 'PRE-FILLED PEPTIDE PEN (SUBQ PEN)',
          icon: '🖊️',
          color: '#7c3aed',
          bg: '#f5f3ff',
          border: '#ddd6fe',
          storageNote: isEs
            ? '❄️ Requiere Nevera (2°C – 8°C). Lista para Inyección · No Congelar'
            : '❄️ Mandatory Refrigeration (2°C – 8°C). Ready-to-Use Pen · Do Not Freeze',
          requiresReconstitution: false
        };
      } else if (isPeptide) {
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
      
      {/* ── Posology-Adapted Dose Tracker (Daily / Morning+Evening / Weekly / N×Week; hidden for Pellets) ── */}
      {posologySchedule.mode !== 'in_clinic' && (
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #dadce0',
          borderRadius: '10px',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          boxShadow: '0 1px 2px rgba(60, 64, 67, 0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1a73e8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {posologySchedule.mode === 'weekly'
                ? (isEs ? 'Registro Semanal de Tomas (Últimas 4 Semanas)' : 'Weekly Dose Log (Last 4 Weeks)')
                : posologySchedule.mode === 'twice_daily'
                ? (isEs ? 'Registro de Tomas: Mañana y Tarde' : 'Dose Log: Morning & Evening')
                : (isEs ? 'Registro Rápido de Tomas (Últimos 7 Días)' : 'Quick Dose Log (Last 7 Days)')}
            </div>
            <div style={{ fontSize: '0.76rem', color: '#5f6368', marginTop: '2px' }}>
              {posologySchedule.mode === 'weekly'
                ? (isEs
                    ? `${posologySchedule.timeHint} · Toca la semana en la que aplicaste tu dosis`
                    : `${posologySchedule.timeHint} · Tap the week you took your dose`)
                : posologySchedule.mode === 'twice_daily'
                ? (isEs
                    ? `${posologySchedule.timeHint} · Marca mañana y tarde/noche hoy`
                    : `${posologySchedule.timeHint} · Mark morning and evening today`)
                : posologySchedule.mode === 'custom_weekly'
                ? (isEs
                    ? `${posologySchedule.timeHint} · ${loggedCount7d}/${posologySchedule.targetPerWeek} esta semana`
                    : `${posologySchedule.timeHint} · ${loggedCount7d}/${posologySchedule.targetPerWeek} this week`)
                : (isEs
                    ? `${posologySchedule.timeHint} · ${loggedCount7d}/7 días`
                    : `${posologySchedule.timeHint} · ${loggedCount7d}/7 days logged`)}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setShowCalendarModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 10px',
                minHeight: '36px',
                borderRadius: '6px',
                border: '1px solid #dadce0',
                background: '#ffffff',
                color: '#3c4043',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <Calendar size={13} color="#5f6368" />
              <span>{isEs ? 'Recordatorios' : 'Reminders'}</span>
            </button>
          </div>
        </div>

        {posologySchedule.mode === 'twice_daily' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleToggleAmPm('am')}
              aria-pressed={amPmToday.am}
              style={{
                minHeight: '48px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: amPmToday.am ? '1.5px solid #16a34a' : '1.5px solid #1a73e8',
                background: amPmToday.am ? '#f0fdf4' : '#eff6ff',
                color: amPmToday.am ? '#15803d' : '#1e40af',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <span>☀️</span>
              <span>{isEs ? (amPmToday.am ? 'Mañana ✓' : 'Marcar Mañana') : (amPmToday.am ? 'Morning ✓' : 'Log Morning')}</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleAmPm('pm')}
              aria-pressed={amPmToday.pm}
              style={{
                minHeight: '48px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: amPmToday.pm ? '1.5px solid #16a34a' : '1.5px solid #6366f1',
                background: amPmToday.pm ? '#f0fdf4' : '#eef2ff',
                color: amPmToday.pm ? '#15803d' : '#3730a3',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <span>🌙</span>
              <span>{isEs ? (amPmToday.pm ? 'Tarde / Noche ✓' : 'Marcar Tarde') : (amPmToday.pm ? 'Evening ✓' : 'Log Evening')}</span>
            </button>
          </div>
        )}

        {posologySchedule.mode === 'weekly' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '6px' }}>
            {last4Weeks.map((wk) => {
              const checked = Boolean(loggedWeeksMap[wk.key]);
              return (
                <button
                  key={wk.key}
                  type="button"
                  onClick={() => handleToggleWeek(wk.key, wk.isCurrent)}
                  aria-pressed={checked}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '3px',
                    minHeight: '52px',
                    padding: '6px 4px',
                    borderRadius: '8px',
                    border: checked ? '1.5px solid #16a34a' : (wk.isCurrent ? '1.5px solid #1a73e8' : '1px solid #e2e8f0'),
                    background: checked ? '#f0fdf4' : (wk.isCurrent ? '#eff6ff' : '#f8fafc'),
                    color: checked ? '#15803d' : '#334155',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    minWidth: 0,
                  }}
                >
                  <span style={{ fontSize: '0.64rem', fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>
                    {wk.label}
                  </span>
                  <span style={{ fontSize: '0.84rem', fontWeight: 800 }}>
                    {checked ? '✓' : '○'}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '4px' }}>
          {last7Days.map((day) => {
            const checked = Boolean(loggedDaysMap[day.key]);
            return (
              <button
                key={day.key}
                type="button"
                onClick={() => handleToggleDay(day.key, day.isToday)}
                aria-pressed={checked}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  minHeight: '48px',
                  padding: '6px 2px',
                  borderRadius: '8px',
                  border: checked ? '1.5px solid #16a34a' : (day.isToday ? '1.5px solid #1a73e8' : '1px solid #e2e8f0'),
                  background: checked ? '#f0fdf4' : (day.isToday ? '#eff6ff' : '#f8fafc'),
                  color: checked ? '#15803d' : '#334155',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  minWidth: 0,
                }}
              >
                <span style={{ fontSize: '0.60rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.85 }}>
                  {day.isToday ? (isEs ? 'Hoy' : 'Today') : day.label}
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 800 }}>
                  {checked ? '✓' : day.dayNum}
                </span>
              </button>
            );
          })}
        </div>
        )}
      </div>
      )}

      {/* ── Post-Dose Notification Permission & Reminders Card (iOS, Android, Desktop + Refill Alert) ── */}
      {showNotifPromptCard && (
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #bfdbfe',
            borderRadius: '10px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1d4ed8' }}>
                {isEs ? '🔔 ¿Quieres recordatorios para tus tomas y tu refill?' : '🔔 Want reminders for your doses & refill?'}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#475569', marginTop: '2px', lineHeight: 1.4 }}>
                {isEs
                  ? 'Activa avisos para no olvidar tu pauta y saber cuándo pedir tu reposición antes de que se acabe.'
                  : 'Enable gentle alerts so you never miss a dose and know when to request a refill before you run out.'}
              </div>
            </div>
            <button
              type="button"
              aria-label={isEs ? 'Cerrar' : 'Dismiss'}
              onClick={() => {
                setShowNotifPromptCard(false);
                setNotifDismissed(true);
                try {
                  localStorage.setItem(`atlas_rx_notif_dismissed_${rxId}`, '1');
                } catch { /* ignore */ }
              }}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem', padding: '4px 6px' }}
            >
              ✕
            </button>
          </div>

          {isIosNonStandalone && notifPermission !== 'granted' && (
            <div style={{ fontSize: '0.74rem', color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', padding: '7px 10px' }}>
              {isEs
                ? '📱 En iPhone: pulsa primero "Añadir a Inicio" arriba para activar notificaciones push, o usa "Añadir al Calendario".'
                : '📱 On iPhone: tap "Add to Home Screen" at the top first for push alerts, or use "Add to Calendar" below.'}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {notifPermission !== 'granted' ? (
              <button
                type="button"
                onClick={handleRequestNotifications}
                style={{
                  minHeight: '40px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#1a73e8',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {isEs ? 'Activar Notificaciones' : 'Enable Notifications'}
              </button>
            ) : (
              <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '6px 10px' }}>
                {isEs ? '✓ Notificaciones activadas' : '✓ Notifications enabled'}
              </span>
            )}

            <button
              type="button"
              onClick={() => setShowCalendarModal(true)}
              style={{
                minHeight: '40px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#1e293b',
                fontSize: '0.78rem',
                fontWeight: 650,
                cursor: 'pointer'
              }}
            >
              {isEs ? '📅 Añadir al Calendario' : '📅 Add to Calendar'}
            </button>
          </div>

          {/* Optional 7-day pre-refill WhatsApp/Email opt-in */}
          {!refillAlertSaved ? (
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: '#334155', fontWeight: 600, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={refillAlertOptIn}
                  onChange={(e) => setRefillAlertOptIn(e.target.checked)}
                />
                <span>
                  {isEs
                    ? 'Avísame 7 días antes de que se acabe mi tratamiento para hacer el refill'
                    : 'Remind me 7 days before I run out so I can request a refill'}
                </span>
              </label>
              {refillAlertOptIn && (
                <form onSubmit={handleSaveRefillAlert} style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    value={refillAlertContact}
                    onChange={(e) => setRefillAlertContact(e.target.value)}
                    placeholder={isEs ? 'Tu WhatsApp o email...' : 'Your WhatsApp or email...'}
                    style={{
                      flex: '1 1 180px',
                      minHeight: '38px',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.78rem'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      minHeight: '38px',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#0f172a',
                      color: '#ffffff',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {isEs ? 'Guardar aviso' : 'Save reminder'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 600 }}>
              {isEs ? '✓ Aviso de refill activado para antes de terminar tu tratamiento.' : '✓ Pre-refill reminder saved.'}
            </div>
          )}
        </div>
      )}

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
                    {item.plainClinicalGoal && !/Targeted Clinical Optimization/i.test(item.plainClinicalGoal) && (
                      <>
                        <div style={{ fontSize: '0.70rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#5f6368' }}>
                          {isEs ? 'Objetivo Terapéutico' : 'Clinical Objective'}
                        </div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#202124', marginTop: '2px', marginBottom: '6px', lineHeight: 1.45 }}>
                          {item.plainClinicalGoal}
                        </div>
                      </>
                    )}
                    {item.apis && item.apis.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
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
                  </div>

                  {/* Contextual Posology Advice: Pre-filled Pen vs Peptide vs Supplement vs Topical */}
                  {item.category.type === 'prefilled_pen' ? (
                    /* PRE-FILLED PEN DOSING BOX */
                    <div
                      style={{
                        background: '#faf5ff',
                        border: '1px solid #ddd6fe',
                        borderRadius: '6px',
                        padding: '12px 14px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.70rem', color: '#7c3aed', fontWeight: 700, textTransform: 'uppercase' }}>
                          {/\b(daily|every\s*morning|every\s*evening|once\s*daily|cada\s*mañana|al\s*día)\b/i.test(item.posology?.regimen || '')
                            ? (isEs ? '🖊️ Dosis Diaria (Pluma):' : '🖊️ Daily Dose (Pen):')
                            : (isEs ? '🖊️ Dosis Semanal (Pluma):' : '🖊️ Weekly Dose (Pen):')}
                        </div>
                        <div style={{ fontSize: '1.02rem', fontWeight: 700, color: '#5b21b6' }}>
                          {localizePatientText(item.posology?.regimen, isEs) || (isEs ? '1 inyección subcutánea semanal' : '1 subcutaneous injection weekly')}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.70rem', color: '#7c3aed', fontWeight: 700, textTransform: 'uppercase' }}>
                          {isEs ? '📍 Zona de Inyección:' : '📍 Injection Site:'}
                        </div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#1e293b' }}>
                          {(item.posology?.timing && item.posology.timing.trim() !== (item.posology?.regimen || '').trim())
                            ? item.posology.timing
                            : (isEs ? 'Rotación: abdomen o muslos (SubQ)' : 'Rotation: abdomen or front of thigh (SubQ)')}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.70rem', color: '#7c3aed', fontWeight: 700, textTransform: 'uppercase' }}>
                          {isEs ? '❄️ Conservación:' : '❄️ Storage:'}
                        </div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#1e293b' }}>
                          {localizePatientText(rx?.storage || item.storage, isEs) || (isEs ? 'Nevera 2°C–8°C · Lista para usar · No congelar' : 'Refrigerator 2°C–8°C · Ready-to-use · Do not freeze')}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.70rem', color: '#7c3aed', fontWeight: 700, textTransform: 'uppercase' }}>
                          {isEs ? '🎯 Dial y Agujas Estériles:' : '🎯 Pen Dial & Sterile Needles:'}
                        </div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>
                          {isEs
                            ? 'Usa una aguja estéril nueva en cada aplicación · Mantén pulsado 5–10 s tras inyectar'
                            : 'Attach a fresh sterile pen needle per dose · Hold 5–10s after dialing'}
                        </div>
                        {(urlLot || rx?.lotNumber || rx?.lote || rx?.batchCode || urlBud || rx?.expDate || rx?.bud) && (
                          <div style={{ marginTop: '4px', fontSize: '0.72rem', fontFamily: 'monospace', color: '#5b21b6', fontWeight: 700 }}>
                            {(urlLot || rx?.lotNumber || rx?.lote || rx?.batchCode) ? `${isEs ? 'Lote' : 'Lot'}: ${urlLot || rx?.lotNumber || rx?.lote || rx?.batchCode}` : ''}
                            {(urlLot || rx?.lotNumber || rx?.lote || rx?.batchCode) && (urlBud || rx?.expDate || rx?.bud) ? ' · ' : ''}
                            {(urlBud || rx?.expDate || rx?.bud) ? `${isEs ? 'Usar antes del' : 'Use before'}: ${urlBud || rx?.expDate || rx?.bud}` : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : item.category.type === 'peptide' ? (
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
                          {(() => {
                            const rawDose = String(item.posology?.regimen || '1.0 mL');
                            const isPump = item.category?.isTransdermal || /\b(transdermal|pentravan|cream|crema|topiclick|pump)\b/i.test(`${item.title || ''} ${item.vehicle?.name || ''} ${rawDose}`);
                            return isPump && !/\bpumps?\b/i.test(rawDose)
                              ? rawDose.replace(/\b(\d+(?:[.,]\d+)?)\s*m[lL]\b/gi, (m, n) => {
                                  const v = parseFloat(String(n).replace(',', '.'));
                                  return Number.isFinite(v) && v > 0 ? (v === 1 ? '1 pump' : `${v} pumps`) : m;
                                })
                              : rawDose;
                          })()}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.70rem', color: '#5f6368', fontWeight: 700, textTransform: 'uppercase' }}>
                          {isEs ? '🕒 Momento y Frecuencia:' : '🕒 Timing & Application:'}
                        </div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#202124' }}>
                          {(item.posology?.timing && !/refrigerat|2°c|8°c|room temp/i.test(item.posology.timing))
                            ? item.posology.timing
                            : (posologySchedule.timeHint || (isEs ? 'Según pauta diaria' : 'As directed'))}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.70rem', color: '#5f6368', fontWeight: 700, textTransform: 'uppercase' }}>
                          {isEs ? '💆 Modo de Empleo:' : '💆 Application Method:'}
                        </div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#202124' }}>
                          {(String(rx?.dispensingForm || item.title || '').toLowerCase().includes('nasal') ||
                            String(rx?.treatmentTitle || '').toLowerCase().includes('nasal'))
                            ? (isEs ? 'Pulverización intranasal · Limpiar boquilla tras usar' : 'Intranasal spray · Wipe nozzle after use')
                            : (isEs ? 'Masajear suavemente con la yema de los dedos hasta absorción' : 'Gently massage with fingertips until absorbed')}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Collapsible 3-Step Visual Device Guide (strictly isolated by prescription type) */}
                  {(() => {
                    const isNasal = String(rx?.dispensingForm || item.title || '').toLowerCase().includes('nasal') ||
                      String(rx?.treatmentTitle || '').toLowerCase().includes('nasal');
                    const isPenDevice = item.category?.type === 'peptide_pen';
                    const isHormonalTransdermal = !isNasal && !isPenDevice && (item.category?.isTransdermal || /\b(topiclick|pentravan|hormon|estradiol|progesterone|testosterone|dhea)\b/i.test(`${item.title || ''} ${item.vehicle?.name || ''}`));
                    const isHairTopical = !isNasal && !isPenDevice && !isHormonalTransdermal && (item.category?.type === 'topical' || /\b(trichosol|scalp|hair|capilar|minoxidil|finasteride|dutasteride|latanoprost)\b/i.test(`${item.title || ''} ${item.vehicle?.name || ''}`));
                    if (!isNasal && !isPenDevice && !isHormonalTransdermal && !isHairTopical) return null;
                    const stepsList = isNasal
                      ? (isEs
                          ? ['1. Limpia suavemente la nariz antes de aplicar.', '2. Aplica 1 pulsación en cada fosa nasal respirando suave.', '3. Limpia la boquilla y guarda en nevera (2°C–8°C).']
                          : ['1. Gently clear your nose before using.', '2. Apply 1 spray into each nostril while breathing in gently.', '3. Wipe the nozzle and return to the fridge (2°C–8°C).'])
                      : isPenDevice
                      ? (isEs
                          ? ['1. Coloca una aguja estéril nueva en la pluma.', '2. Gira el dial hasta los clics indicados en tu pauta.', '3. Aplica en abdomen o muslo y mantén 5–10 segundos.']
                          : ['1. Attach a fresh sterile needle to your pen.', '2. Turn the dial to your prescribed number of clicks.', '3. Press on abdomen or thigh and hold for 5–10 seconds.'])
                      : isHormonalTransdermal
                      ? (isEs
                          ? ['1. Limpia y seca la piel (antebrazo interno o muslo).', '2. Aplica los clics/pumps indicados y masajea hasta absorber.', '3. Lávate las manos después y evita contacto piel con piel 1–2 h.']
                          : ['1. Clean and dry the skin (inner forearm or thigh).', '2. Apply your prescribed clicks/pumps and rub in until absorbed.', '3. Wash hands afterward and avoid skin-to-skin contact for 1–2 hours.'])
                      : (isEs
                          ? ['1. Con el cuero cabelludo seco, abre raya en las zonas a tratar.', '2. Aplica la cantidad exacta y masajea suave 30 segundos.', '3. Deja actuar al menos 4 horas antes de lavar el cabello.']
                          : ['1. On a dry scalp, part your hair over the target areas.', '2. Apply the exact dose and massage gently for 30 seconds.', '3. Leave on for at least 4 hours before washing your hair.']);
                    return (
                      <details
                        style={{
                          marginTop: '10px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '10px 12px'
                        }}
                      >
                        <summary style={{
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          color: '#0f172a',
                          cursor: 'pointer',
                          listStyle: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <span>{isEs ? 'Cómo usarlo (3 pasos sencillos)' : 'How to use it (3 simple steps)'}</span>
                          <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600 }}>
                            {isEs ? 'Ver pasos ▾' : 'Show steps ▾'}
                          </span>
                        </summary>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                          {stepsList.map((st, idx) => (
                            <div key={idx} style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.4, fontWeight: 500 }}>
                              {st}
                            </div>
                          ))}
                        </div>
                      </details>
                    );
                  })()}

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
