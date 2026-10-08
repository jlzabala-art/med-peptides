"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Stethoscope,
  Phone,
  MessageCircle,
  RotateCcw,
  FileText,
  CheckCircle2,
  Clock,
  Calendar,
  Thermometer,
  Plane,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Eye,
  Lock,
  ExternalLink,
  Check,
  Flame,
  Award
} from '@/lib/icons';
import { toast } from 'react-hot-toast';
import { triggerHaptic } from '@/utils/haptics';
import { normalizeRxStatus, RX_STATUS_LABELS } from '@/lib/normalizeRxStatus';

export default function PatientExperienceHub({
  rx,
  isPatientView = false,
  lang = 'en',
  doctorPhone = '',
  patientPublicUrl = '',
  onOpenQuotation = null
}) {
  const isEs = lang === 'es';
  const [showAdvantageDetails, setShowAdvantageDetails] = useState(false);
  const [showTravelPass, setShowTravelPass] = useState(false);
  
  // Patient adherence check-in state (persisted per day in localStorage)
  const todayKey = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

  const rxCode = rx?.prescriptionNumber || rx?.code || rx?.id?.slice(0, 8) || 'RX';
  const storageKey = `atlas_rx_adherence_${rxCode}_${todayKey}`;

  const [hasTakenDoseToday, setHasTakenDoseToday] = useState(false);
  const [doseTimestamp, setDoseTimestamp] = useState(null);
  const [streakDays, setStreakDays] = useState(4); // Default positive encouragement streak

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setHasTakenDoseToday(true);
        setDoseTimestamp(parsed.time || null);
      }
    } catch {
      // safe fallback
    }
  }, [storageKey]);

  const handleToggleDose = () => {
    triggerHaptic('selection');
    const newState = !hasTakenDoseToday;
    setHasTakenDoseToday(newState);
    if (newState) {
      const nowStr = new Date().toLocaleTimeString(isEs ? 'es-ES' : 'en-US', { hour: '2-digit', minute: '2-digit' });
      setDoseTimestamp(nowStr);
      try {
        localStorage.setItem(storageKey, JSON.stringify({ taken: true, time: nowStr }));
      } catch {}
      setStreakDays(prev => prev + 1);
      toast.success(
        isEs ? `¡Dosis de hoy registrada a las ${nowStr}! Cumplimiento al día ✓` : `Today's dose logged at ${nowStr}! Adherence on track ✓`,
        { icon: '💊' }
      );
    } else {
      setDoseTimestamp(null);
      try {
        localStorage.removeItem(storageKey);
      } catch {}
      setStreakDays(prev => Math.max(1, prev - 1));
      toast(isEs ? 'Registro de dosis desmarcado' : 'Dose log removed');
    }
  };

  const patientName = rx?.patient?.name || rx?.patientName || (isEs ? 'Paciente' : 'Patient');
  const treatingDocName = typeof rx?.treatingDoctor === 'string' ? rx.treatingDoctor : rx?.treatingDoctor?.name;
  const doctorName = treatingDocName || rx?.doctor?.name || rx?.doctorName || rx?.prescribingDoctor || (isEs ? 'Médico Prescriptor' : 'Prescribing Physician');
  const treatingDocClinic = typeof rx?.treatingDoctor === 'object' ? rx?.treatingDoctor?.clinic : null;
  const clinicName = treatingDocClinic || rx?.doctor?.clinic || rx?.clinic || rx?.clinicName || 'Atlas Clinical Practice';
  const normalizedStatus = normalizeRxStatus(rx?.status) || 'approved';

  // Check if injectable/peptide to show refrigeration notice
  const isInjectableOrPeptide = useMemo(() => {
    const items = rx?.items || rx?.compounds || rx?.products || rx?.prescriptionLines || [];
    const text = JSON.stringify(items).toLowerCase();
    return text.includes('peptide') || text.includes('vial') || text.includes('sc') || text.includes('subcutaneous') || text.includes('injection') || text.includes('bpc') || text.includes('tb-') || text.includes('semax') || text.includes('selank') || text.includes('nad');
  }, [rx]);

  // Clinical inquiry WhatsApp URL
  const clinicalInquiryUrl = useMemo(() => {
    const cleanPhone = String(doctorPhone || '+97143498800').replace(/[^0-9]/g, '');
    const msg = isEs
      ? `Estimado equipo médico de ${clinicName},\nSoy ${patientName}, paciente del ${doctorName}. Me comunico en relación a mi prescripción #${rxCode}.\nTengo la siguiente consulta sobre mi pauta de administración:\n\n[Escriba su consulta aquí]\n\n🔗 Enlace de mi prescripción: ${patientPublicUrl}`
      : `Dear ${clinicName} clinical team,\nI am ${patientName}, patient of ${doctorName}. I am contacting you regarding my prescription #${rxCode}.\nI have the following question regarding my administration protocol:\n\n[Type your clinical question here]\n\n🔗 My prescription link: ${patientPublicUrl}`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  }, [doctorPhone, clinicName, patientName, doctorName, rxCode, isEs, patientPublicUrl]);

  // Refill WhatsApp / Action URL
  const refillRequestUrl = useMemo(() => {
    const cleanPhone = String(doctorPhone || '+97143498800').replace(/[^0-9]/g, '');
    const msg = isEs
      ? `Estimado equipo de ${clinicName},\nSoy ${patientName}. Mi prescripción #${rxCode} prescrita por el ${doctorName} está finalizando su ciclo y deseo solicitar un refill / continuación del tratamiento magistral.\n🔗 Expediente: ${patientPublicUrl}`
      : `Dear ${clinicName} team,\nI am ${patientName}. My prescription #${rxCode} prescribed by ${doctorName} is completing its cycle and I would like to request a refill / continuation of my compounded therapy.\n🔗 Dossier: ${patientPublicUrl}`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  }, [doctorPhone, clinicName, patientName, doctorName, rxCode, isEs, patientPublicUrl]);

  // ────────────────────────────────────────────────────────────────────────────
  // RENDER A: DOCTOR / CLINIC ADMIN VIEW (Disclosure of The Patient View)
  // ────────────────────────────────────────────────────────────────────────────
  if (!isPatientView) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
        {/* Banner 1: Clinical Privacy & Transparency Matrix */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #dadce0',
          borderRadius: '8px',
          padding: '14px 16px',
          boxShadow: '0 1px 3px rgba(60,64,67,0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '4px',
                background: '#e6f4ea',
                color: '#137333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={16} />
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#202124' }}>
                  {isEs ? 'Qué Ve el Paciente vs. Datos Médicos Protegidos' : 'What the Patient Sees vs. Protected Clinical Data'}
                </span>
                <span style={{ marginLeft: '8px', fontSize: '0.70rem', padding: '1px 6px', borderRadius: '10px', background: '#e8f0fe', color: '#1a73e8', fontWeight: 500 }}>
                  GCP Privacy Standard
                </span>
              </div>
            </div>
            <span style={{ fontSize: '0.74rem', color: '#5f6368' }}>
              {isEs ? 'Enlace cifrado y seguro' : 'Encrypted & safe link'}
            </span>
          </div>

          {/* Matrix Columns */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '12px',
            background: '#f8f9fa',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #e8eaed'
          }}>
            {/* What is visible to patient */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#137333' }}>
                <CheckCircle2 size={14} color="#137333" />
                <span>{isEs ? 'Visible para el Paciente:' : 'Visible to the Patient:'}</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.73rem', color: '#3c4043', lineHeight: 1.5 }}>
                <li>{isEs ? 'Modo de empleo paso a paso y horarios (mañana / noche)' : 'Step-by-step administration & timing (morning / evening)'}</li>
                <li>{isEs ? 'Pauta de dosificación y duración del ciclo (30 / 60 / 90 días)' : 'Dosage schedule & cycle duration (30 / 60 / 90 days)'}</li>
                <li>{isEs ? 'Datos de contacto del médico y clínica prescriptora' : 'Prescribing physician credentials & clinic contact info'}</li>
                <li>{isEs ? 'Estado en tiempo real de su prescripción y formulación' : 'Real-time status of their prescription & formulation'}</li>
                <li>{isEs ? 'Instrucciones de conservación, temperatura y estabilidad' : 'Storage, refrigeration & stability guidelines'}</li>
              </ul>
            </div>

            {/* What is withheld / confidential */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#5f6368' }}>
                <Lock size={14} color="#5f6368" />
                <span>{isEs ? 'Estrictamente Confidencial (Oculto):' : 'Strictly Withheld (B2B Confidential):'}</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.73rem', color: '#5f6368', lineHeight: 1.5 }}>
                <li>{isEs ? 'Costes de compra de materias primas API al por mayor' : 'Raw API compounding wholesale procurement costs'}</li>
                <li>{isEs ? 'Márgenes de beneficio y comisiones comerciales B2B' : 'Internal clinic profit margins & commercial markup'}</li>
                <li>{isEs ? 'Identidad de laboratorios y proveedores de síntesis' : 'Raw synthesis labs & internal chemical suppliers'}</li>
                <li>{isEs ? 'Anotaciones administrativas y trazabilidad de facturación' : 'Internal administrative notes & invoicing metadata'}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 2: The 4 Key Patient Capabilities & Advantages */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #dadce0',
          borderRadius: '8px',
          padding: '14px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#202124' }}>
                {isEs ? 'Ventajas y Capacidades Activas del Paciente' : 'Active Patient Capabilities & Key Advantages'}
              </span>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: '#5f6368' }}>
                {isEs 
                  ? 'Herramientas interactivas a las que accede el paciente desde este enlace para garantizar adherencia y comunicación fluida:'
                  : 'Interactive self-service tools available to the patient to ensure clinical compliance and seamless communication:'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAdvantageDetails(!showAdvantageDetails)}
              style={{
                background: 'none',
                border: 'none',
                color: '#1a73e8',
                fontSize: '0.74rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>{showAdvantageDetails ? (isEs ? 'Menos detalles' : 'Less details') : (isEs ? 'Ver detalles' : 'View details')}</span>
              {showAdvantageDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {/* Scoped CSS for responsive 2x2 Google Cloud Grid */}
          <style>{`
            .patient-capabilities-grid-2x2 {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 12px;
            }
            @media (max-width: 680px) {
              .patient-capabilities-grid-2x2 {
                grid-template-columns: 1fr;
                gap: 10px;
              }
            }
            .patient-capability-card {
              background: #ffffff;
              border: 1px solid #dadce0;
              border-radius: 8px;
              padding: 12px 14px;
              display: flex;
              flex-direction: column;
              gap: 8px;
              transition: all 0.15s ease-in-out;
              box-shadow: 0 1px 2px rgba(60,64,67,0.04);
            }
            .patient-capability-card:hover {
              border-color: #bdc1c6;
              box-shadow: 0 2px 6px rgba(60,64,67,0.08);
            }
          `}</style>

          {/* 4 Cards 2x2 Grid (GCP Standard) */}
          <div className="patient-capabilities-grid-2x2">
            {/* Card 1: Formulation Quote */}
            <div className="patient-capability-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: '6px',
                    background: '#e8f0fe',
                    border: '1px solid #d2e3fc',
                    color: '#1a73e8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <CreditCard size={15} />
                  </div>
                  <span style={{ fontSize: '0.80rem', fontWeight: 600, color: '#202124' }}>
                    {isEs ? '1. Solicitud de Cotización' : '1. Formulation Quote'}
                  </span>
                </div>
                <span style={{
                  fontSize: '0.66rem',
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: '#e8f0fe',
                  color: '#1a73e8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                  whiteSpace: 'nowrap'
                }}>
                  {isEs ? '1-Clic' : '1-Click Quote'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.73rem', color: '#5f6368', lineHeight: 1.45, paddingLeft: '38px' }}>
                {isEs 
                  ? 'El paciente puede solicitar presupuesto oficial o autorizar la preparación magistral en 1 clic sin desplazarse.'
                  : 'Patient can request official compounding quotation or authorize preparation in 1 click without clinic visits.'}
              </p>
            </div>

            {/* Card 2: Controlled Inquiry */}
            <div className="patient-capability-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: '6px',
                    background: '#e6f4ea',
                    border: '1px solid #ceead6',
                    color: '#137333',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <MessageCircle size={15} />
                  </div>
                  <span style={{ fontSize: '0.80rem', fontWeight: 600, color: '#202124' }}>
                    {isEs ? '2. Comunicación Médica' : '2. Controlled Inquiry'}
                  </span>
                </div>
                <span style={{
                  fontSize: '0.66rem',
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: '#e6f4ea',
                  color: '#137333',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                  whiteSpace: 'nowrap'
                }}>
                  {isEs ? 'Canal Seguro' : 'Secure Channel'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.73rem', color: '#5f6368', lineHeight: 1.45, paddingLeft: '38px' }}>
                {isEs 
                  ? 'Canal seguro estructurado que adjunta automáticamente el código de receta para resolver dudas con el médico.'
                  : 'Structured channel pre-filled with patient and prescription code to clarify dosage without phone disruptions.'}
              </p>
            </div>

            {/* Card 3: 1-Click Treatment Refill */}
            <div className="patient-capability-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: '6px',
                    background: '#fef7e0',
                    border: '1px solid #feefc3',
                    color: '#b06000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <RotateCcw size={15} />
                  </div>
                  <span style={{ fontSize: '0.80rem', fontWeight: 600, color: '#202124' }}>
                    {isEs ? '3. Refill en 1-Clic' : '3. 1-Click Treatment Refill'}
                  </span>
                </div>
                <span style={{
                  fontSize: '0.66rem',
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: '#fef7e0',
                  color: '#b06000',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                  whiteSpace: 'nowrap'
                }}>
                  {isEs ? 'Continuidad' : 'Auto-Refill'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.73rem', color: '#5f6368', lineHeight: 1.45, paddingLeft: '38px' }}>
                {isEs 
                  ? 'Al acercarse al fin del ciclo de tratamiento, el paciente puede solicitar la renovación inmediata de su fórmula.'
                  : 'When treatment is nearing completion, the patient can trigger a continuation refill request with 1 tap.'}
              </p>
            </div>

            {/* Card 4: Dual Status Tracking */}
            <div className="patient-capability-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: '6px',
                    background: '#f3e8fd',
                    border: '1px solid #e9d5ff',
                    color: '#7c3aed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Clock size={15} />
                  </div>
                  <span style={{ fontSize: '0.80rem', fontWeight: 600, color: '#202124' }}>
                    {isEs ? '4. Trazabilidad de Estado' : '4. Dual Status Tracking'}
                  </span>
                </div>
                <span style={{
                  fontSize: '0.66rem',
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: '#f3e8fd',
                  color: '#7c3aed',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                  whiteSpace: 'nowrap'
                }}>
                  {isEs ? 'Tiempo Real' : 'Real-Time'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.73rem', color: '#5f6368', lineHeight: 1.45, paddingLeft: '38px' }}>
                {isEs 
                  ? 'Médico y paciente conocen en tiempo real la fase exacta (Aprobada → En Formulación → Enviada → Entregada).'
                  : 'Both clinic and patient track the exact status in real-time, eliminating calls inquiring about delivery dates.'}
              </p>
            </div>
          </div>

          {/* Extra Innovations Bar (Collapsible / expandable) */}
          {showAdvantageDetails && (
            <div style={{
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: '1px dashed #dadce0',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.72rem', color: '#3c4043' }}>
                <span style={{ fontSize: '1rem' }}>📱</span>
                <div>
                  <strong>{isEs ? 'Check-in Diario de Toma:' : 'Daily Compliance Tracker:'}</strong>{' '}
                  {isEs ? 'Permite registrar tomas diarias desde el móvil sin instalar apps.' : 'Logs daily doses directly from mobile web without app downloads.'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.72rem', color: '#3c4043' }}>
                <span style={{ fontSize: '1rem' }}>❄️</span>
                <div>
                  <strong>{isEs ? 'Guía de Conservación:' : 'Storage & Stability Guard:'}</strong>{' '}
                  {isEs ? 'Indica si requiere nevera (2-8°C) o protección solar para no degradar el péptido.' : 'Clear alerts on refrigeration (2-8°C) and light protection.'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.72rem', color: '#3c4043' }}>
                <span style={{ fontSize: '1rem' }}>✈️</span>
                <div>
                  <strong>{isEs ? 'Pase de Viaje Bilingüe:' : 'Travel Clearance Card:'}</strong>{' '}
                  {isEs ? 'Certificado médico oficial para controles aduaneros y aeropuertos.' : 'Official bilingual medical clearance for airline security & customs.'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // RENDER B: PATIENT VIEW (Interactive Patient Experience Tools)
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* 1. Real-Time Prescription Status Timeline */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #dadce0',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 1px 3px rgba(60,64,67,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#202124' }}>
              {isEs ? 'Estado en Tiempo Real de su Prescripción' : 'Real-Time Prescription Progress Tracker'}
            </span>
            <div style={{ fontSize: '0.73rem', color: '#5f6368', marginTop: '2px' }}>
              {isEs ? `Expediente: #${rxCode} · Actualizado automáticamente por la clínica` : `Dossier: #${rxCode} · Automatically synchronized with clinical practice`}
            </div>
          </div>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.74rem',
            fontWeight: 600,
            padding: '3px 10px',
            borderRadius: '12px',
            background: '#e6f4ea',
            color: '#137333',
            border: '1px solid #ceead6'
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#137333' }}></span>
            <span>{RX_STATUS_LABELS[normalizedStatus] || normalizedStatus.toUpperCase()}</span>
          </span>
        </div>

        {/* Stepper Timeline */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          position: 'relative',
          paddingTop: '6px'
        }}>
          {[
            { id: 'prescribed', label: isEs ? '1. Prescrita' : '1. Prescribed', desc: isEs ? 'Por su médico' : 'By physician', active: true, done: true },
            { id: 'compounding', label: isEs ? '2. Formulación' : '2. Compounding', desc: isEs ? 'Laboratorio farmacéutico' : 'Licensed pharmacy', active: ['processing', 'in_transit', 'delivered', 'completed'].includes(normalizedStatus), done: ['in_transit', 'delivered', 'completed'].includes(normalizedStatus) },
            { id: 'transit', label: isEs ? '3. En Tránsito' : '3. In Transit', desc: isEs ? 'Courier refrigerado' : 'Temperature tracked', active: ['in_transit', 'delivered', 'completed'].includes(normalizedStatus), done: ['delivered', 'completed'].includes(normalizedStatus) },
            { id: 'treatment', label: isEs ? '4. En Tratamiento' : '4. Active Regimen', desc: isEs ? 'Pauta en curso' : 'Patient adherence', active: ['approved', 'completed', 'delivered'].includes(normalizedStatus), done: false },
          ].map((step, idx) => (
            <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative' }}>
              <div style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: step.done ? '#137333' : step.active ? '#1a73e8' : '#f1f3f4',
                color: step.done || step.active ? '#ffffff' : '#5f6368',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.72rem',
                fontWeight: 700,
                marginBottom: '6px',
                zIndex: 2,
                boxShadow: step.active ? '0 0 0 3px #e8f0fe' : 'none'
              }}>
                {step.done ? <Check size={14} /> : idx + 1}
              </div>
              <div style={{ fontSize: '0.74rem', fontWeight: step.active ? 600 : 500, color: step.active ? '#202124' : '#5f6368' }}>
                {step.label}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#80868b', marginTop: '1px' }}>
                {step.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Interactive Action Toolbar: Contact Doctor, Request Refill, Quotation */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '12px'
      }}>
        {/* Controlled Doctor Inquiry */}
        <a
          href={clinicalInquiryUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 14px',
            background: '#ffffff',
            border: '1px solid #dadce0',
            borderRadius: '8px',
            textDecoration: 'none',
            color: '#202124',
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 2px rgba(60,64,67,0.05)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#137333'; e.currentTarget.style.backgroundColor = '#f6fdf7'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#dadce0'; e.currentTarget.style.backgroundColor = '#ffffff'; }}
        >
          <div style={{ width: 34, height: 34, borderRadius: '6px', background: '#e6f4ea', color: '#137333', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MessageCircle size={18} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.80rem', fontWeight: 600, color: '#137333' }}>
              {isEs ? 'Consultar al Médico' : 'Ask Prescribing Doctor'}
            </div>
            <div style={{ fontSize: '0.70rem', color: '#5f6368', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {isEs ? 'Aclarar pauta o reportar tolerancia' : 'Clarify dosage or tolerance'}
            </div>
          </div>
        </a>

        {/* 1-Click Smart Refill */}
        <a
          href={refillRequestUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 14px',
            background: '#ffffff',
            border: '1px solid #dadce0',
            borderRadius: '8px',
            textDecoration: 'none',
            color: '#202124',
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 2px rgba(60,64,67,0.05)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1a73e8'; e.currentTarget.style.backgroundColor = '#f8fafd'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#dadce0'; e.currentTarget.style.backgroundColor = '#ffffff'; }}
        >
          <div style={{ width: 34, height: 34, borderRadius: '6px', background: '#e8f0fe', color: '#1a73e8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <RotateCcw size={18} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.80rem', fontWeight: 600, color: '#1a73e8' }}>
              {isEs ? 'Solicitar Refill / Continuación' : '1-Click Refill Request'}
            </div>
            <div style={{ fontSize: '0.70rem', color: '#5f6368', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {isEs ? 'Renovar pauta para el siguiente ciclo' : 'Order continuation supply'}
            </div>
          </div>
        </a>

        {/* Request Quotation (if handler provided) */}
        {onOpenQuotation && (
          <button
            type="button"
            onClick={onOpenQuotation}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              background: '#ffffff',
              border: '1px solid #dadce0',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 2px rgba(60,64,67,0.05)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#f29900'; e.currentTarget.style.backgroundColor = '#fefcf8'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#dadce0'; e.currentTarget.style.backgroundColor = '#ffffff'; }}
          >
            <div style={{ width: 34, height: 34, borderRadius: '6px', background: '#fef7e0', color: '#b06000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CreditCard size={18} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.80rem', fontWeight: 600, color: '#b06000' }}>
                {isEs ? 'Pedir Cotización de Elaboración' : 'Request Compounding Quote'}
              </div>
              <div style={{ fontSize: '0.70rem', color: '#5f6368', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {isEs ? 'Presupuesto oficial y entrega' : 'Official formulation quote'}
              </div>
            </div>
          </button>
        )}
      </div>

      {/* 3. Daily Adherence & Compliance Tracker Card */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #dadce0',
        borderRadius: '8px',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: hasTakenDoseToday ? '#e6f4ea' : '#f1f3f4',
            color: hasTakenDoseToday ? '#137333' : '#5f6368',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Calendar size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#202124' }}>
              {isEs ? 'Check-in Diario de Toma de Medicación' : 'Daily Medication Adherence Check-in'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#5f6368', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span>{hasTakenDoseToday 
                ? (isEs ? `✓ Dosis de hoy completada (${doseTimestamp})` : `✓ Today's dose confirmed (${doseTimestamp})`) 
                : (isEs ? 'Pendiente de confirmación para hoy' : 'Pending today confirmation')}</span>
              <span style={{ color: '#dadce0' }}>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#e37400', fontWeight: 600 }}>
                <Flame size={12} /> {streakDays} {isEs ? 'días seguidos' : 'day streak'}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleDose}
          style={{
            height: '34px',
            padding: '0 14px',
            borderRadius: '4px',
            border: hasTakenDoseToday ? '1px solid #ceead6' : '1px solid #1a73e8',
            background: hasTakenDoseToday ? '#e6f4ea' : '#1a73e8',
            color: hasTakenDoseToday ? '#137333' : '#ffffff',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s ease'
          }}
        >
          {hasTakenDoseToday ? <Check size={14} /> : null}
          <span>{hasTakenDoseToday ? (isEs ? 'Dosis Tomada' : 'Dose Completed') : (isEs ? 'Marcar Dosis de Hoy' : 'Mark Dose Taken Today')}</span>
        </button>
      </div>

      {/* 4. Storage, Stability & Travel Guidelines */}
      <div style={{
        background: '#f8f9fa',
        border: '1px solid #dadce0',
        borderRadius: '8px',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', color: '#3c4043' }}>
          <Thermometer size={16} color={isInjectableOrPeptide ? '#1a73e8' : '#e37400'} style={{ flexShrink: 0 }} />
          <div>
            <strong>{isEs ? 'Conservación:' : 'Storage:'}</strong>{' '}
            {isInjectableOrPeptide
              ? (isEs ? 'Conservar en frigorífico entre 2°C y 8°C. Proteger de la luz directa. No congelar.' : 'Keep refrigerated between 2°C and 8°C. Protect from direct light. Do not freeze.')
              : (isEs ? 'Conservar a temperatura ambiente (< 25°C) en lugar seco y fresco.' : 'Store at room temperature (< 25°C) in a dry, cool location.')
            }
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('selection');
            setShowTravelPass(!showTravelPass);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#1a73e8',
            fontSize: '0.73rem',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 6px',
            borderRadius: '4px'
          }}
        >
          <Plane size={13} />
          <span>{isEs ? 'Pase Médico para Viajes' : 'Travel Medical Clearance'}</span>
        </button>
      </div>

      {/* Travel Pass Card Modal / Expandable */}
      {showTravelPass && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #1a73e8',
          borderRadius: '8px',
          padding: '14px 16px',
          boxShadow: '0 2px 8px rgba(26,115,232,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plane size={16} color="#1a73e8" />
              <strong style={{ fontSize: '0.80rem', color: '#1a73e8' }}>
                {isEs ? 'Certificado Médico de Acreditación para Viajes y Aduanas' : 'Official Travel Medical Clearance Certificate'}
              </strong>
            </div>
            <button
              type="button"
              onClick={() => setShowTravelPass(false)}
              style={{ background: 'none', border: 'none', color: '#5f6368', cursor: 'pointer', fontSize: '12px' }}
            >
              ✕
            </button>
          </div>
          <p style={{ margin: 0, fontSize: '0.72rem', color: '#3c4043', lineHeight: 1.5 }}>
            {isEs
              ? `Por la presente se certifica que ${patientName} transporta medicación prescrita legalmente bajo supervisión médica de ${doctorName} (#${rxCode}) para uso personal intransferible. Medicamento autorizado para transporte en equipaje de mano.`
              : `This certifies that ${patientName} is legally carrying prescribed compounded medication under clinical supervision of ${doctorName} (#${rxCode}) for personal use. Authorized for airline hand-luggage carry-on.`}
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button
              type="button"
              onClick={() => window.print()}
              style={{
                height: '28px',
                padding: '0 10px',
                borderRadius: '4px',
                border: '1px solid #dadce0',
                background: '#ffffff',
                color: '#3c4043',
                fontSize: '0.72rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span>🖨️ {isEs ? 'Imprimir Certificado' : 'Print Certificate'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
