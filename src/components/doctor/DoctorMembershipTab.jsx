'use client';

import React, { useState, useContext } from 'react';
import { 
  Award, 
  Check, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  FileText, 
  MessageCircle, 
  Stethoscope, 
  Users, 
  ArrowRight,
  HelpCircle,
  Clock,
  Building,
  CheckCircle2
} from '@/lib/icons';
import { toast } from 'react-hot-toast';
import { DoctorContext } from '../../templates/DoctorDashboard';
import notifier from '../../services/NotificationService';

export default function DoctorMembershipTab() {
  const context = useContext(DoctorContext) || {};
  const {
    doctorId = 'dr-hanieh-erdmann',
    doctorMeta = {},
    subscriptionTier = 'basic',
    isProDoctor = false,
    openUpgradeModal
  } = context;

  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);

  const doctorDisplayName = doctorMeta?.doctorName || doctorMeta?.name || 'Dr. Hanieh Erdmann';
  const clinicDisplayName = doctorMeta?.clinicName || doctorMeta?.clinic || 'Bedaya Polyclinic L.L.C.';
  const specialty = doctorMeta?.specialty || 'Especialista en Dermatología & Longevidad';

  const handleRequestUpgrade = async () => {
    setLoading(true);
    const toastId = toast.loading('Registrando solicitud de actualización…');
    try {
      // 1. Send notification to admin
      await notifier.send({
        to: ['admin'],
        type: 'user',
        title: '💎 Solicitud de Upgrade a Plan Pro',
        message: `El ${doctorDisplayName} (ID: ${doctorId}) de ${clinicDisplayName} ha solicitado actualizar al Plan Avanzado Pro desde la Hoja de Membresía.`,
        data: { doctorId, doctorName: doctorDisplayName, clinic: clinicDisplayName, requestedTier: 'advanced' }
      });

      // 2. Direct WhatsApp message to medical conciergerie
      const text = encodeURIComponent(
        `Hola, soy el ${doctorDisplayName} de la clínica ${clinicDisplayName}. He revisado la comparativa de niveles y deseo solicitar el UPGRADE al Plan Avanzado Pro para mi consulta de péptidos en Med-Peptides / Atlas Health.`
      );
      const waUrl = `https://wa.me/34600000000?text=${text}`;

      toast.success('¡Solicitud registrada con éxito! El equipo clínico de administración coordinará la activación de inmediato.', { id: toastId });
      setRequested(true);

      setTimeout(() => {
        window.open(waUrl, '_blank');
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.error('Error al procesar la solicitud: ' + err.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const COMPARISON_ROWS = [
    {
      category: 'Prescripción & Dosificación',
      feature: 'Emisión de Prescripciones Médicas',
      basic: 'Manual producto a producto',
      pro: 'Ilimitada + Protocolos 1-Tap pre-configurados',
      description: 'En el Plan Pro puedes guardar tus propios combos (ej. Protocolo Capilar GHK-Cu o Longevidad Epithalon) y prescribirlos con un solo clic.',
      highlight: true
    },
    {
      category: 'Inteligencia Clínica',
      feature: 'Atlas AI Clinical Scribe & Copilot',
      basic: '5 consultas mensuales básicas',
      pro: 'ILIMITADO • Lectura de analíticas de sangre y genética',
      description: 'El copiloto sintetiza biomarcadores, detecta contraindicaciones y calcula los mililitros y unidades de jeringa U-100 en segundos.',
      highlight: true
    },
    {
      category: 'Identidad de Consulta',
      feature: 'Guía del Paciente (Reconstitución & Jeringa)',
      basic: 'Membrete genérico Med-Peptides',
      pro: '100% White-Label con el logo de tu clínica',
      description: 'Tus pacientes reciben la guía interactiva y el PDF oficial con el logo y contacto de tu clínica (ej. Bedaya Polyclinic), reforzando tu autoridad médica.',
      highlight: true
    },
    {
      category: 'Fidelización & Adherencia',
      feature: 'Alertas Predictivas de Refill por WhatsApp',
      basic: 'Gestión manual por el médico o secretaria',
      pro: 'Automatizadas 5 días antes de agotar el vial',
      description: 'El paciente recibe un mensaje con su enlace de renovación directa, aumentando la continuidad de tratamiento un +40% sin carga de trabajo para tu equipo.',
      highlight: true
    },
    {
      category: 'Gestión de Pacientes',
      feature: 'Directorio de Pacientes Activos',
      basic: 'Hasta 30 pacientes en ficha activa',
      pro: 'Pacientes Ilimitados + Notas SOAP avanzadas',
      description: 'Historial longitudinal completo de terapias, evolución de biomarcadores y notas clínicas estructuradas.',
      highlight: false
    },
    {
      category: 'Vademécum & Formulación',
      feature: 'Vademécum Lotusland Precios Clínicos',
      basic: 'Acceso estándar al catálogo',
      pro: 'Acceso VIP + Comparador de bio-equivalencia',
      description: 'Información farmacocinética detallada y comparador de estabilidad térmica de las preparaciones Lotusland.',
      highlight: false
    },
    {
      category: 'Telemedicina',
      feature: 'Módulo de Teleconsulta y Citas',
      basic: 'No disponible',
      pro: 'Gestión integrada de citas y videoconsulta',
      description: 'Organiza tus revisiones periódicas de pacientes nacionales e internacionales con enlace de teleconsulta seguro.',
      highlight: false
    },
    {
      category: 'Atención & Soporte',
      feature: 'Canal de Soporte Médico y Farmacéutico',
      basic: 'Email y tickets (respuesta en 24-48h)',
      pro: 'Línea VIP Directa por WhatsApp 24/7',
      description: 'Comunicación en tiempo real con el Director Técnico Farmacéutico para dudas complejas de reconstitución o compatibilidad de viales.',
      highlight: true
    }
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* ── TOP HERO HEADER ──────────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #042f2e 0%, #0d9488 45%, #0284c7 100%)',
          borderRadius: '20px',
          padding: '2.5rem 2rem',
          color: '#ffffff',
          boxShadow: '0 12px 32px rgba(13, 148, 136, 0.25)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '2rem'
        }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(8px)', padding: '6px 14px', borderRadius: '30px', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
            <Award size={15} /> Hoja de Membresía Médica Lotusland & Atlas Health
          </div>

          <h1 style={{ margin: '0 0 0.75rem 0', fontSize: '2.1rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#ffffff', lineHeight: 1.2 }}>
            Evoluciona tu Práctica Clínica: Básico vs. Avanzado Pro
          </h1>
          <p style={{ margin: 0, fontSize: '1rem', color: '#ccfbf1', maxWidth: '780px', lineHeight: 1.6 }}>
            Diseñado para médicos especialistas en longevidad, tricología y medicina regenerativa. Conoce las diferencias entre el nivel gratuito básico y las herramientas automatizadas que multiplican la adherencia de tus pacientes en el nivel superior.
          </p>

          {/* Current Doctor Status Strip */}
          <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', background: 'rgba(0, 0, 0, 0.25)', padding: '12px 18px', borderRadius: '12px', width: 'fit-content' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: '#99f6e4' }}>Médico activo:</span>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>{doctorDisplayName}</span>
              <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>({clinicDisplayName})</span>
            </div>
            <div style={{ height: '16px', width: '1px', background: 'rgba(255, 255, 255, 0.3)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.85rem', color: '#99f6e4' }}>Nivel actual:</span>
              <span
                style={{
                  padding: '3px 12px',
                  borderRadius: '12px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  backgroundColor: isProDoctor ? '#f0fdfa' : '#fff7ed',
                  color: isProDoctor ? '#0f766e' : '#c2410c',
                  border: isProDoctor ? '1px solid #99f6e4' : '1px solid #fed7aa'
                }}
              >
                {isProDoctor ? '💎 Plan Avanzado Pro Activo' : '🟢 Plan Básico (Clinical Starter)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CURRENT TIER CONTEXT CARD ────────────────────────────────────── */}
      {!isProDoctor && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #fed7aa',
            borderLeft: '5px solid #f97316',
            borderRadius: '14px',
            padding: '1.25rem 1.75rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            flexWrap: 'wrap',
            boxShadow: '0 2px 8px rgba(249, 115, 22, 0.08)'
          }}
        >
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c2410c', fontWeight: 800, fontSize: '0.95rem' }}>
              <Zap size={18} /> Tu consulta se encuentra actualmente en Nivel Básico
            </div>
            <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
              Tienes acceso completo para prescribir productos individuales del catálogo Lotusland. Sin embargo, tus pacientes no reciben recordatorios automáticos de refill por WhatsApp ni guías personalizadas con el membrete de tu clínica.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRequestUpgrade}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.85rem 1.5rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(13, 148, 136, 0.35)',
              flexShrink: 0
            }}
          >
            <Sparkles size={18} />
            {loading ? 'Procesando…' : 'Evolucionar a Nivel Pro ⚡'}
          </button>
        </div>
      )}

      {/* ── SIDE-BY-SIDE COMPARISON TABLE (HOJA DE DIFERENCIAS) ─────────── */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.05)', marginBottom: '2.5rem' }}>
        <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
              Matriz Comparativa de Capacidades Clínicas
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Diferencias clave entre la versión esencial y la suite médica profesional
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '8px', fontWeight: 600 }}>
            Actualizado Septiembre 2026
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '1.25rem 1.5rem', width: '38%', fontWeight: 800, color: '#334155' }}>
                  Funcionalidad Clínica
                </th>
                <th style={{ padding: '1.25rem 1rem', width: '28%', textAlign: 'center', color: '#475569' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#334155' }}>🟢 Plan Básico</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>
                    Gratuito • Acceso Inicial
                  </div>
                </th>
                <th style={{ padding: '1.25rem 1.25rem', width: '34%', textAlign: 'center', background: 'rgba(13, 148, 136, 0.07)', borderLeft: '2px solid #99f6e4', borderRight: '2px solid #99f6e4' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Sparkles size={18} /> 💎 Avanzado Pro
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#0d9488', fontWeight: 700, marginTop: '2px' }}>
                    Suscripción Médica Mensual
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                  }}
                >
                  <td style={{ padding: '1.1rem 1.5rem', verticalAlign: 'top' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                      {row.feature}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
                      {row.description}
                    </div>
                  </td>

                  <td style={{ padding: '1.1rem 1rem', textAlign: 'center', verticalAlign: 'middle', color: '#64748b', fontSize: '0.84rem' }}>
                    <div style={{ display: 'inline-block', padding: '4px 10px', background: '#f1f5f9', borderRadius: '8px', color: '#475569' }}>
                      {row.basic}
                    </div>
                  </td>

                  <td style={{ padding: '1.1rem 1.25rem', textAlign: 'center', verticalAlign: 'middle', background: 'rgba(13, 148, 136, 0.04)', borderLeft: '2px solid #ccfbf1', borderRight: '2px solid #ccfbf1' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '10px', color: '#0f766e', fontWeight: 700, fontSize: '0.84rem' }}>
                      <Check size={16} color="#0d9488" strokeWidth={3} />
                      <span>{row.pro}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 3 PILARES DE RETORNO CLÍNICO (POR QUÉ EVOLUCIONAR) ───────────── */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', textAlign: 'center' }}>
          ¿Por qué los médicos especialistas evolucionan al Nivel Pro?
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#64748b', textAlign: 'center', maxWidth: '650px', margin: '0 auto 1.5rem' }}>
          El nivel Avanzado Pro transforma la prescripción de péptidos en una línea de negocio recurrente, predecible y automatizada para tu consulta.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.25rem' }}>
          
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0d9488', marginBottom: '1rem' }}>
              <TrendingUp size={24} />
            </div>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              +40% de Adherencia Terapéutica
            </h4>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
              El 60% de los pacientes abandonan terapias regenerativas por olvidar solicitar su vial de refill a tiempo. Con las alertas automáticas de WhatsApp de Pro, tus pacientes completan sus ciclos de 8 a 12 semanas sin interrupción.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8', marginBottom: '1rem' }}>
              <Building size={24} />
            </div>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              Prestigio White-Label para tu Clínica
            </h4>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
              Tus pacientes reciben instrucciones con el membrete y logotipo de tu propia clínica (Bedaya Polyclinic), reforzando tu imagen de marca y justificando honorarios médicos de consulta privada.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7e22ce', marginBottom: '1rem' }}>
              <Sparkles size={24} />
            </div>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              Ahorra hasta 4 horas semanales
            </h4>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
              Atlas AI analiza las analíticas del paciente, traduce volúmenes de reconstitución a unidades de jeringa U-100 y genera la guía clínica en segundos, eliminando cálculos manuales y llamadas de dudas del paciente.
            </p>
          </div>

        </div>
      </div>

      {/* ── PROMINENT UPGRADE CARD / CTA ──────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '20px',
          padding: '2.5rem 2rem',
          color: '#ffffff',
          boxShadow: '0 16px 36px rgba(15, 23, 42, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: '2.5rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', marginBottom: '1.25rem', boxShadow: '0 4px 20px rgba(13, 148, 136, 0.4)' }}>
          <Sparkles size={28} />
        </div>

        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
          Activa el Plan Avanzado Pro para tu Práctica Médica
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#94a3b8', maxWidth: '620px', margin: '0 0 1.75rem 0', lineHeight: 1.6 }}>
          Sin permanencia mínima. Activación guiada e inmediata por nuestro equipo farmacéutico y soporte directo para Dr. Hanieh Erdmann.
        </p>

        {!isProDoctor ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem' }}>
            <button
              type="button"
              onClick={handleRequestUpgrade}
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '1rem 2.5rem',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '1.05rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 25px rgba(13, 148, 136, 0.45)',
                transition: 'transform 0.15s ease',
              }}
            >
              <Zap size={20} />
              {loading ? 'Enviando solicitud…' : '⚡ Solicitar Upgrade a Plan Avanzado Pro'}
            </button>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Al solicitar el upgrade, un asesor clínico activará tu membresía y configurará el membrete de tu clínica.
            </span>
          </div>
        ) : (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.85rem 1.75rem', borderRadius: '12px', background: '#f0fdfa', border: '1px solid #99f6e4', color: '#0f766e', fontWeight: 800, fontSize: '0.95rem' }}>
            <CheckCircle2 size={20} color="#0d9488" />
            ¡Tu consulta ya disfruta de todos los beneficios del Plan Avanzado Pro!
          </div>
        )}
      </div>

      {/* ── FREQUENTLY ASKED QUESTIONS (FAQ) ─────────────────────────────── */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem' }}>
        <h4 style={{ margin: '0 0 1.25rem 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HelpCircle size={20} color="#0d9488" /> Preguntas Frecuentes sobre la Membresía Médica
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>
              ¿Puedo continuar usando el Plan Básico de forma indefinida?
            </div>
            <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
              Sí. El Plan Básico es 100% gratuito y no caduca. Puedes continuar emitiendo prescripciones clínicas estándar para tus pacientes con acceso al catálogo oficial Lotusland.
            </p>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>
              ¿Existe compromiso de permanencia en el Plan Pro?
            </div>
            <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
              No, la suscripción mensual es totalmente flexible. Puedes pausarla o volver al nivel básico en cualquier momento comunicándolo a tu asesor clínico.
            </p>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>
              ¿Cómo se personalizan las guías con el logotipo de mi clínica?
            </div>
            <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
              Una vez activado el Plan Pro, puedes subir el logotipo y membrete de tu clínica en la sección de Ajustes, o enviarlo por WhatsApp a nuestro soporte técnico para que lo dejemos listo en menos de 15 minutos.
            </p>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>
              ¿Cómo funciona el recordatorio de refill por WhatsApp?
            </div>
            <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
              El sistema calcula la duración estimada del vial según la dosis prescrita (ej. 30 días). Cuando faltan 5 días para agotar el preparado, el paciente recibe un mensaje con su dosis actual y la opción de solicitar la renovación directamente a tu consulta.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
