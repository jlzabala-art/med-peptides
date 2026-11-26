'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import MobileConnectedStepper from '@/components/ui/MobileConnectedStepper';
import { usePublicWorkspace } from '@/context/PublicWorkspaceContext';
import toast from 'react-hot-toast';
import {
  Building2,
  Globe,
  ShieldCheck,
  TrendingUp,
  Package,
  Layers,
  CheckCircle2,
  Printer,
  Share2,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  FileCheck,
  Lock,
  Activity,
  Calculator,
  Clock,
  MessageCircle,
  ExternalLink,
} from '@/lib/icons';

const ONBOARDING_STEPS = [
  {
    id: 'day1',
    dayEn: 'Day 1',
    dayEs: 'Día 1',
    titleEn: 'Catalog & CoA Ingestion',
    titleEs: 'Ingesta de Tarifa y CoA',
    descEn: 'Send your Excel/PDF Ex-Works schedule and batch CoAs. Atlas structures SKUs, strengths, MOQs, and cold-chain metadata automatically.',
    descEs: 'Envías tu tarifa Ex-Works en Excel/PDF y CoAs. Atlas estructura SKUs, concentraciones, MOQs y requisitos de cadena de frío automáticamente.',
  },
  {
    id: 'day2',
    dayEn: 'Day 2',
    dayEs: 'Día 2',
    titleEn: 'Clinical & Multi-Currency Setup',
    titleEs: 'Configuración Clínica y Divisas',
    descEn: 'We publish bilingual EN/ES technical dossiers, configure EUR/USD/AED tiers, Pack ×10 volume rules, and role-based price visibility.',
    descEs: 'Publicamos fichas técnicas bilingües EN/ES, configuramos tarifas en EUR/USD/AED, reglas Pack ×10 y visibilidad protegida por rol.',
  },
  {
    id: 'day3',
    dayEn: 'Day 3',
    dayEs: 'Día 3',
    titleEn: 'Clinic Network Activation',
    titleEs: 'Activación en Red Clínica',
    descEn: 'Your portfolio goes live in the Unified Price Hub and is routed to matching specialty clinics across Europe, UAE, and GCC.',
    descEs: 'Tu catálogo entra en el Unified Price Hub y se distribuye de forma dirigida a clínicas por especialidad en Europa, EAU y GCC.',
  },
  {
    id: 'ongoing',
    dayEn: 'Ongoing',
    dayEs: 'Continuo',
    titleEn: 'Consolidated POs & Refill Loop',
    titleEs: 'POs Consolidadas y Recompra',
    descEn: 'Receive consolidated purchase orders instead of fragmented micro-orders, backed by patient QR refill reminders that sustain repeat demand.',
    descEs: 'Recibes órdenes de compra consolidadas en lugar de micro-pedidos dispersos, impulsadas por recordatorios QR de reposición al paciente.',
  },
];

const CURRENCY_FX = {
  EUR: { symbol: '€', rate: 1 },
  USD: { symbol: '$', rate: 1.09 },
  AED: { symbol: 'AED ', rate: 4.0 },
};

export default function SupplierShowcaseClient({
  initialLang = 'en',
  initialPartner = '',
  initialCurrency = 'EUR',
}) {
  const workspace = usePublicWorkspace();
  const [localLang, setLocalLang] = useState(initialLang === 'es' ? 'es' : 'en');
  const lang = workspace?.hydrated ? (workspace?.lang || localLang) : localLang;
  const isEs = lang === 'es';

  const [currency, setCurrency] = useState(
    ['EUR', 'USD', 'AED'].includes(initialCurrency) ? initialCurrency : 'EUR'
  );
  const [partnerName, setPartnerName] = useState(initialPartner);
  const [customPartnerDraft, setCustomPartnerDraft] = useState(initialPartner);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [activeOnboardingStep, setActiveOnboardingStep] = useState(0);

  // Interactive Volume & PO Consolidation Simulator
  const [clinicsCount, setClinicsCount] = useState(25);
  const [unitsPerClinic, setUnitsPerClinic] = useState(40);
  const [unitPriceEur, setUnitPriceEur] = useState(18);

  const fx = CURRENCY_FX[currency] || CURRENCY_FX.EUR;

  const sim = useMemo(() => {
    const monthlyUnits = clinicsCount * unitsPerClinic;
    const quarterlyUnits = monthlyUnits * 3;
    const monthlyValue = monthlyUnits * unitPriceEur * fx.rate;
    const quarterlyValue = quarterlyUnits * unitPriceEur * fx.rate;
    const fragmentedInvoicesAvoided = Math.max(0, clinicsCount * 3 - 3);
    return {
      monthlyUnits,
      quarterlyUnits,
      monthlyValue,
      quarterlyValue,
      fragmentedInvoicesAvoided,
    };
  }, [clinicsCount, unitsPerClinic, unitPriceEur, fx.rate]);

  const formatMoney = (val) => {
    const rounded = Math.round(val).toLocaleString(isEs ? 'es-ES' : 'en-US');
    return currency === 'AED' ? `AED ${rounded}` : `${fx.symbol}${rounded}`;
  };

  const buildShareUrl = (targetPartner = partnerName) => {
    const base = 'https://www.atlashealth-services.com/partners/suppliers';
    const params = new URLSearchParams();
    params.set('lang', isEs ? 'es' : 'en');
    params.set('cur', currency);
    if (targetPartner.trim()) {
      params.set('partner', targetPartner.trim());
    }
    return `${base}?${params.toString()}`;
  };

  const handleCopyShareLink = async (targetPartner = partnerName) => {
    const url = buildShareUrl(targetPartner);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      toast.success(isEs ? 'Enlace personalizado copiado ✓' : 'Personalized link copied ✓');
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch {
      toast.error(isEs ? 'No se pudo copiar el enlace' : 'Could not copy link');
    }
  };

  const handleLangSwitch = (nextLang) => {
    setLocalLang(nextLang);
    if (workspace?.setLang) workspace.setLang(nextLang);
  };

  const whatsappHref = useMemo(() => {
    const msg = isEs
      ? `Hola equipo de Atlas Health Services, hemos revisado la presentación para suppliers${partnerName ? ` (${partnerName})` : ''} y nos gustaría explorar un acuerdo de distribución B2B.`
      : `Hello Atlas Health Services team, we reviewed the supplier partner showcase${partnerName ? ` (${partnerName})` : ''} and would like to discuss B2B distribution onboarding.`;
    return `https://wa.me/971553561058?text=${encodeURIComponent(msg)}`;
  }, [isEs, partnerName]);

  const mobileStepperItems = ONBOARDING_STEPS.map((s) => ({
    id: s.id,
    kicker: isEs ? s.dayEs : s.dayEn,
    label: isEs ? s.titleEs : s.titleEn,
  }));

  return (
    <div className="atlas-page-bg" style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <style>{`
        .sup-shell {
          max-width: 1180px;
          margin: 0 auto;
          padding: 1.25rem 1.5rem 5rem;
          box-sizing: border-box;
        }
        .sup-hero {
          background: linear-gradient(135deg, #061428 0%, #003666 60%, #0b4a7d 100%);
          color: #ffffff;
          border-radius: 14px;
          padding: 2rem 2.25rem;
          margin-bottom: 1.25rem;
          box-shadow: 0 4px 18px rgba(0, 54, 102, 0.14);
        }
        .sup-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 1.5rem;
        }
        .sup-card {
          background: #ffffff;
          border: 1px solid #dadce0;
          border-radius: 12px;
          padding: 1.25rem 1.4rem;
          box-shadow: 0 1px 3px rgba(60, 64, 67, 0.06);
        }
        .sup-two-col {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 1.5rem;
        }
        .sup-three-col {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }
        .sup-four-col {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }
        .sup-onboarding-mobile-detail {
          display: none;
        }
        .sup-flow-row {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }
        .sup-slider {
          width: 100%;
          accent-color: #003666;
          cursor: pointer;
        }
        @media (max-width: 900px) {
          .sup-kpi-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .sup-two-col,
          .sup-three-col,
          .sup-flow-row {
            grid-template-columns: minmax(0, 1fr);
          }
        }
        @media (max-width: 768px) {
          .sup-shell {
            padding: 0.9rem 0.85rem 5.5rem;
            overflow-x: hidden;
          }
          .sup-hero {
            padding: 1.35rem 1.15rem;
          }
          .sup-four-col {
            display: none;
          }
          .sup-onboarding-mobile-detail {
            display: block;
          }
        }
        @media print {
          .no-print { display: none !important; }
          .sup-shell { padding: 0 !important; max-width: 100% !important; }
          .sup-hero { break-inside: avoid; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .sup-card { break-inside: avoid; box-shadow: none !important; }
          .sup-four-col { display: grid !important; grid-template-columns: repeat(4, 1fr) !important; }
          .sup-onboarding-mobile-detail { display: none !important; }
        }
      `}</style>

      <div className="no-print">
        <PublicUnifiedHeader
          brandHref="/"
          loginRedirect="/partners/suppliers"
          hideCurrencySelector={true}
          hideAccountManager={true}
          breadcrumb={[
            { label: 'Atlas B2B', href: '/' },
            { label: isEs ? 'Portal para Suppliers' : 'Supplier Partner Hub' },
          ]}
        />
      </div>

      <main className="sup-shell">
        {/* ── TOP ACTION BAR (Monochrome GCP Standard, Rules #40/#57) ── */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleLangSwitch('es')}
              className="gcp-btn-secondary"
              style={{
                padding: '6px 12px',
                fontSize: '0.76rem',
                fontWeight: 700,
                borderColor: isEs ? '#1a73e8' : '#dadce0',
                color: isEs ? '#1a73e8' : '#5f6368',
                background: isEs ? '#e8f0fe' : '#ffffff',
              }}
            >
              ES
            </button>
            <button
              type="button"
              onClick={() => handleLangSwitch('en')}
              className="gcp-btn-secondary"
              style={{
                padding: '6px 12px',
                fontSize: '0.76rem',
                fontWeight: 700,
                borderColor: !isEs ? '#1a73e8' : '#dadce0',
                color: !isEs ? '#1a73e8' : '#5f6368',
                background: !isEs ? '#e8f0fe' : '#ffffff',
              }}
            >
              EN
            </button>

            <span style={{ width: '1px', height: '20px', background: '#dadce0', margin: '0 4px' }} />

            {['EUR', 'USD', 'AED'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className="gcp-btn-secondary"
                style={{
                  padding: '6px 10px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  borderColor: currency === c ? '#003666' : '#dadce0',
                  color: currency === c ? '#003666' : '#5f6368',
                  background: currency === c ? '#eff6ff' : '#ffffff',
                }}
              >
                {c}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => window.print()}
              className="gcp-btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 12px', fontSize: '0.78rem', fontWeight: 600 }}
            >
              <Printer size={14} />
              <span>{isEs ? 'Descargar Deck PDF' : 'Download Deck PDF'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleCopyShareLink()}
              className="gcp-btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 12px', fontSize: '0.78rem', fontWeight: 600 }}
            >
              {copiedUrl ? <Check size={14} color="#16a34a" /> : <Share2 size={14} />}
              <span>{copiedUrl ? (isEs ? 'Copiado' : 'Copied') : (isEs ? 'Copiar Enlace' : 'Copy Link')}</span>
            </button>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="gcp-btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}
            >
              <MessageCircle size={14} />
              <span>{isEs ? 'Hablar con Dirección B2B' : 'Talk to B2B Team'}</span>
            </a>
          </div>
        </div>

        {/* ── HERO: PERSONALIZABLE POR PROVEEDOR (?partner=...) ── */}
        <section className="sup-hero">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 12px', borderRadius: '999px', background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.25)', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '14px' }}>
            <Building2 size={13} />
            <span>
              {partnerName
                ? `ATLAS HEALTH SERVICES × ${partnerName.toUpperCase()}`
                : (isEs ? 'ATLAS HEALTH SERVICES · PARTNER HUB PARA FABRICANTES' : 'ATLAS HEALTH SERVICES · MANUFACTURER & SUPPLIER PARTNER HUB')}
            </span>
          </div>

          <h1 style={{ margin: '0 0 10px', fontSize: 'clamp(1.45rem, 3vw, 2.15rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em', color: '#ffffff' }}>
            {partnerName
              ? (isEs
                  ? `Escala ${partnerName} en Europa y Oriente Medio con una sola infraestructura B2B`
                  : `Scale ${partnerName} across Europe & GCC through one structured B2B engine`)
              : (isEs
                  ? 'Tu motor de distribución clínica B2B en Europa y Oriente Medio'
                  : 'Your Structured B2B Clinical Distribution Engine in Europe & GCC')}
          </h1>

          <p style={{ margin: '0 0 18px', fontSize: '0.95rem', lineHeight: 1.55, color: 'rgba(241, 245, 249, 0.92)', maxWidth: '780px' }}>
            {isEs
              ? 'Conectamos fabricantes EU GMP, laboratorios magistrales y marcas clínicas con una red activa de médicos y clínicas privadas — consolidando órdenes de compra (POs), gestionando trazabilidad documental (CoA / MOH) y generando demanda recurrente mediante guías clínicas interactivas y recordatorios QR al paciente.'
              : 'We connect EU GMP manufacturers, compounding pharmacies, and clinical brands with an active network of specialty clinics — consolidating purchase orders, enforcing batch/CoA/MOH traceability, and driving repeat demand through interactive clinical guides and patient QR refill loops.'}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {(isEs
              ? ['POs Consolidadas (Sin micro-pedidos)', 'Precios protegidos por rol', 'Cobertura UE · EAU · GCC', 'Onboarding en 72 horas']
              : ['Consolidated B2B POs', 'Role-Gated Channel Protection', 'EU · UAE · GCC Corridors', '72-Hour Onboarding']
            ).map((tag) => (
              <span
                key={tag}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 11px',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                <CheckCircle2 size={13} color="#38bdf8" />
                {tag}
              </span>
            ))}
          </div>
        </section>

        {/* ── 4 GCP KPI METRIC CARDS (Rule #22) ── */}
        <section className="sup-kpi-grid" aria-label={isEs ? 'Métricas clave de tracción' : 'Key Traction Metrics'}>
          <div className="sup-card" style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isEs ? 'Tracción Activa' : 'Active Volume Growth'}
              </span>
              <TrendingUp size={15} color="#16a34a" />
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#003666' }}>+200%</div>
            <div style={{ fontSize: '0.73rem', color: '#5f6368', marginTop: '2px' }}>
              {isEs ? 'Escalado 500 → 1.500 uds/PO en líneas activas' : '500 → 1,500 units/PO scaling on active lines'}
            </div>
          </div>

          <div className="sup-card" style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isEs ? 'Portafolio Clínico' : 'Active Price Schedules'}
              </span>
              <Layers size={15} color="#1a73e8" />
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#003666' }}>16+</div>
            <div style={{ fontSize: '0.73rem', color: '#5f6368', marginTop: '2px' }}>
              {isEs ? 'BHRT, Pellets, Péptidos, Fillers, Genómica' : 'BHRT, Pellets, Peptides, Fillers, Genomics'}
            </div>
          </div>

          <div className="sup-card" style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isEs ? 'Corredores y Divisas' : 'Corridors & Currencies'}
              </span>
              <Globe size={15} color="#0284c7" />
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#003666' }}>EU · GCC</div>
            <div style={{ fontSize: '0.73rem', color: '#5f6368', marginTop: '2px' }}>
              {isEs ? 'Tarifas en vivo EUR · USD · AED (EN/ES)' : 'Live EUR · USD · AED pricing (EN/ES)'}
            </div>
          </div>

          <div className="sup-card" style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isEs ? 'Trazabilidad & Canal' : 'Traceability & Channel'}
              </span>
              <ShieldCheck size={15} color="#0d9488" />
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#003666' }}>100%</div>
            <div style={{ fontSize: '0.73rem', color: '#5f6368', marginTop: '2px' }}>
              {isEs ? 'Lote, CoA, Import Control y 0 fugas de precio' : 'Batch, CoA, Import Control & zero price leaks'}
            </div>
          </div>
        </section>

        {/* ── INTERACTIVE VOLUME & PO CONSOLIDATION SIMULATOR + CHANNEL INTEGRITY ── */}
        <section className="sup-two-col">
          {/* Left: Simulator */}
          <div className="sup-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Calculator size={18} color="#003666" />
              <h2 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'Simulador de Volumen y Consolidación de POs' : 'Volume & PO Consolidation Simulator'}
              </h2>
            </div>
            <p style={{ margin: '0 0 16px', fontSize: '0.80rem', color: '#475569', lineHeight: 1.45 }}>
              {isEs
                ? 'Ajusta el alcance estimado en nuestra red clínica para proyectar pedidos consolidados trimestrales y ahorro administrativo.'
                : 'Adjust target reach across our clinic network to model quarterly consolidated PO volume and operational savings.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
                  <span>{isEs ? 'Clínicas activas adoptando la línea' : 'Active clinics adopting your line'}</span>
                  <span style={{ color: '#003666' }}>{clinicsCount} {isEs ? 'clínicas' : 'clinics'}</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={5}
                  value={clinicsCount}
                  onChange={(e) => setClinicsCount(Number(e.target.value))}
                  className="sup-slider"
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
                  <span>{isEs ? 'Unidades / mes por clínica' : 'Units / month per clinic'}</span>
                  <span style={{ color: '#003666' }}>{unitsPerClinic} {isEs ? 'uds/mes' : 'units/mo'}</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={150}
                  step={5}
                  value={unitsPerClinic}
                  onChange={(e) => setUnitsPerClinic(Number(e.target.value))}
                  className="sup-slider"
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
                  <span>{isEs ? 'Precio medio Ex-Works / unidad' : 'Average Ex-Works unit price'}</span>
                  <span style={{ color: '#003666' }}>{formatMoney(unitPriceEur * fx.rate)}</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={120}
                  step={1}
                  value={unitPriceEur}
                  onChange={(e) => setUnitPriceEur(Number(e.target.value))}
                  className="sup-slider"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
              <div>
                <div style={{ fontSize: '0.67rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  {isEs ? 'Volumen / Mes' : 'Monthly Units'}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#003666', marginTop: '2px' }}>
                  {sim.monthlyUnits.toLocaleString(isEs ? 'es-ES' : 'en-US')}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.67rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  {isEs ? 'PO Trimestral' : 'Quarterly PO'}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>
                  {formatMoney(sim.quarterlyValue)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.67rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  {isEs ? 'Facturas Ahorradas' : 'Invoices Avoided'}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>
                  -{sim.fragmentedInvoicesAvoided}/Q
                </div>
              </div>
            </div>
          </div>

          {/* Right: Channel Integrity & Brand Protection */}
          <div className="sup-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Lock size={18} color="#0d9488" />
                <h2 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: '#0f172a' }}>
                  {isEs ? 'Garantía de Protección de Canal y Marca' : 'Channel Integrity & Brand Protection'}
                </h2>
              </div>
              <p style={{ margin: '0 0 14px', fontSize: '0.80rem', color: '#475569', lineHeight: 1.45 }}>
                {isEs
                  ? 'Diseñado para laboratorios farmacéuticos y marcas médicas que exigen control estricto de precios, posicionamiento clínico y trazabilidad.'
                  : 'Built for pharmaceutical manufacturers and medical brands requiring strict pricing governance, clinical positioning, and batch control.'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  {
                    icon: ShieldCheck,
                    color: '#0d9488',
                    titleEn: 'Role-Gated Pricing Tiers',
                    titleEs: 'Tarifas Segmentadas por Rol',
                    descEn: 'Separate visibility for Public, Clinic, Wholesaler, and Distributor tiers — your Ex-Works cost is never exposed.',
                    descEs: 'Visibilidad separada para Público, Clínica, Mayorista y Distribuidor — tu coste Ex-Works nunca queda expuesto.',
                  },
                  {
                    icon: FileCheck,
                    color: '#1a73e8',
                    titleEn: 'Zero Price Leak to Patients',
                    titleEs: 'Cero Fugas de Precio al Paciente',
                    descEn: 'Patient QR dosing guides strip all commercial pricing and supplier identifiers by architecture.',
                    descEs: 'Las guías QR para pacientes eliminan por arquitectura cualquier precio comercial o dato de proveedor.',
                  },
                  {
                    icon: Package,
                    color: '#7c3aed',
                    titleEn: 'Batch, CoA & Regulatory Compliance',
                    titleEs: 'Trazabilidad de Lote, CoA y Permisos',
                    descEn: 'Every shipment links PO, Proforma, Packing List, CoA, and MOH/EU GMP import clearance in one audit trail.',
                    descEs: 'Cada importación vincula PO, Proforma, Packing List, CoA y permisos MOH/EU GMP en un único historial auditable.',
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.titleEn}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <Icon size={17} color={item.color} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                          {isEs ? item.titleEs : item.titleEn}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.4, marginTop: '2px' }}>
                          {isEs ? item.descEs : item.descEn}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── END-TO-END FLOW: EX-WORKS TO PATIENT REFILL LOOP ── */}
        <section className="sup-card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'Cómo Atlas multiplica la rotación de tu catálogo' : 'How Atlas Drives Repeat Rotation for Your Portfolio'}
              </h2>
              <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#475569' }}>
                {isEs
                  ? 'No somos un simple distribuidor pasivo: combinamos suministro consolidado con educación médica y fidelización del paciente.'
                  : 'Beyond passive distribution: we combine consolidated procurement with clinical education and automated patient refill retention.'}
              </p>
            </div>
          </div>

          <div className="sup-flow-row">
            {[
              {
                step: '01',
                titleEn: 'Consolidated PO',
                titleEs: 'PO Consolidada',
                descEn: 'Single institutional order from Atlas meeting your MOQs (EU GMP / Ex-Works).',
                descEs: 'Pedido institucional unificado desde Atlas cumpliendo tus MOQs (EU GMP / Ex-Works).',
              },
              {
                step: '02',
                titleEn: 'Regulatory & Logistics',
                titleEs: 'Aduana y Trazabilidad',
                descEn: 'Cold-chain transport, CoA verification, and MOH / DHA import permits handled end-to-end.',
                descEs: 'Cadena de frío, verificación de CoA y permisos de importación MOH / DHA gestionados.',
              },
              {
                step: '03',
                titleEn: 'Physician Enablement',
                titleEs: 'Formación al Médico',
                descEn: 'Interactive clinical guides, dosing calculators & Atlas AI increase physician prescribing confidence.',
                descEs: 'Guías clínicas visuales, calculadoras de dosis y Atlas AI aumentan la prescripción médica.',
              },
              {
                step: '04',
                titleEn: 'Patient QR Refill Loop',
                titleEs: 'Recompra vía QR',
                descEn: 'Patients scan their Rx QR, receive BUD expiry reminders, and trigger recurring clinic reorders.',
                descEs: 'El paciente escanea su QR, recibe aviso de caducidad (BUD) y genera reposición recurrente.',
              },
            ].map((f) => (
              <div key={f.step} style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#1a73e8', marginBottom: '4px' }}>
                  {isEs ? `FASE ${f.step}` : `STAGE ${f.step}`}
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#003666', marginBottom: '4px' }}>
                  {isEs ? f.titleEs : f.titleEn}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.42 }}>
                  {isEs ? f.descEs : f.descEn}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── LIVE INTERACTIVE SANDBOX (EXPLORE ATLAS WITHOUT LOGIN) ── */}
        <section className="sup-card no-print" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Sparkles size={17} color="#003666" />
            <h2 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: '#0f172a' }}>
              {isEs ? 'Explora la plataforma en vivo (sin registro)' : 'Explore the Live Platform (No Login Required)'}
            </h2>
          </div>
          <p style={{ margin: '0 0 14px', fontSize: '0.78rem', color: '#475569' }}>
            {isEs
              ? 'Comprueba directamente cómo presentamos tarifas, guías clínicas y protocolos a nuestra red de médicos.'
              : 'See firsthand how we present schedules, clinical guides, and protocols to our network of prescribing physicians.'}
          </p>

          <div className="sup-three-col">
            {[
              {
                href: `/pricing?lang=${isEs ? 'es' : 'en'}`,
                badgeEn: 'UNIFIED PRICE HUB',
                badgeEs: 'HUB DE TARIFAS B2B',
                titleEn: 'Multi-Currency B2B Schedules',
                titleEs: 'Tarifas Multi-Divisa en Vivo',
                descEn: '16+ clinical schedules with instant EUR/USD/AED switching, Pack ×10 volume tiers, and live PDF export.',
                descEs: '16+ tarifas clínicas con cambio instantáneo EUR/USD/AED, ahorro Pack ×10 y exportación PDF.',
              },
              {
                href: `/guides/hormone-pellets-implantation?lang=${isEs ? 'es' : 'en'}`,
                badgeEn: 'PHYSICIAN EDUCATION',
                badgeEs: 'EDUCACIÓN MÉDICA',
                titleEn: 'Interactive Clinical Procedure Guide',
                titleEs: 'Guía Clínica Interactiva (6 Pasos)',
                descEn: 'Visual surgical protocol, titration calculator, and PubMed references that accelerate clinical adoption.',
                descEs: 'Protocolo visual, calculadora de titulación y bibliografía PubMed que aceleran la adopción médica.',
              },
              {
                href: `/pricing/pellets?lang=${isEs ? 'es' : 'en'}&cur=${currency}`,
                badgeEn: 'LIVE CATALOG EXAMPLE',
                badgeEs: 'EJEMPLO DE CATÁLOGO',
                titleEn: 'EU GMP Subcutaneous Pellets',
                titleEs: 'Pellets Hormonales EU GMP',
                descEn: 'See how a specialized therapeutic line is structured with clinical filters, SKUs, and direct RFQ ordering.',
                descEs: 'Observa cómo estructuramos una línea terapéutica con filtros clínicos, SKUs y solicitud directa.',
              },
            ].map((demo) => (
              <Link
                key={demo.href}
                href={demo.href}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '10px',
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid #dadce0',
                  background: '#ffffff',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div>
                  <span style={{ display: 'inline-block', fontSize: '0.66rem', fontWeight: 800, color: '#1a73e8', background: '#e8f0fe', padding: '2px 8px', borderRadius: '999px', marginBottom: '8px' }}>
                    {isEs ? demo.badgeEs : demo.badgeEn}
                  </span>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                    {isEs ? demo.titleEs : demo.titleEn}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#475569', lineHeight: 1.45 }}>
                    {isEs ? demo.descEs : demo.descEn}
                  </div>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.76rem', fontWeight: 700, color: '#003666' }}>
                  <span>{isEs ? 'Abrir demo en vivo' : 'Open live demo'}</span>
                  <ExternalLink size={12} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── 72-HOUR ONBOARDING TIMELINE (Desktop Cards + MobileConnectedStepper) ── */}
        <section className="sup-card" style={{ marginBottom: '1.5rem', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.15rem 1.4rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={17} color="#003666" />
              <h2 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'Onboarding de Proveedor en 72 Horas' : '72-Hour Supplier Onboarding'}
              </h2>
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#166534', background: '#dcfce7', padding: '3px 10px', borderRadius: '999px' }}>
              {isEs ? 'Cero carga de IT para tu equipo' : 'Zero IT effort for your team'}
            </span>
          </div>

          {/* Mobile GCP Connected Stepper */}
          <MobileConnectedStepper
            steps={mobileStepperItems}
            activeIndex={activeOnboardingStep}
            onSelect={setActiveOnboardingStep}
            isEs={isEs}
            ariaLabel={isEs ? 'Fases de onboarding en 72 horas' : '72-hour onboarding stages'}
          />

          {/* Mobile Active Step Detail */}
          <div className="sup-onboarding-mobile-detail" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: '0.90rem', fontWeight: 800, color: '#003666', marginBottom: '6px' }}>
              {isEs ? ONBOARDING_STEPS[activeOnboardingStep].titleEs : ONBOARDING_STEPS[activeOnboardingStep].titleEn}
            </div>
            <p style={{ margin: 0, fontSize: '0.80rem', color: '#334155', lineHeight: 1.5 }}>
              {isEs ? ONBOARDING_STEPS[activeOnboardingStep].descEs : ONBOARDING_STEPS[activeOnboardingStep].descEn}
            </p>
          </div>

          {/* Desktop 4-Step Grid */}
          <div className="sup-four-col" style={{ padding: '1.25rem 1.4rem' }}>
            {ONBOARDING_STEPS.map((s, idx) => (
              <div key={s.id} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#1a73e8', textTransform: 'uppercase' }}>
                    {isEs ? s.dayEs : s.dayEn}
                  </span>
                  <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#003666', color: '#fff', fontSize: '0.70rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    {idx + 1}
                  </span>
                </div>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  {isEs ? s.titleEs : s.titleEn}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.45 }}>
                  {isEs ? s.descEs : s.descEn}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PERSONALIZE & SHARE LINK BUILDER (Account-Based Pitch) ── */}
        <section className="sup-card no-print" style={{ marginBottom: '1.5rem', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ flex: '1 1 280px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>
                {isEs ? 'Personalizar enlace para un laboratorio concreto' : 'Personalize link for a specific manufacturer'}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#5f6368' }}>
                {isEs
                  ? 'Escribe el nombre del proveedor para generar su URL a medida con portada personalizada.'
                  : 'Enter a supplier name to generate a tailored URL with a co-branded header.'}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flex: '1 1 320px' }}>
              <input
                type="text"
                value={customPartnerDraft}
                onChange={(e) => setCustomPartnerDraft(e.target.value)}
                placeholder={isEs ? 'Ej. European Pharma Lab...' : 'e.g. European Pharma Lab...'}
                style={{
                  flex: '1 1 180px',
                  minHeight: '38px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.82rem',
                  color: '#0f172a',
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setPartnerName(customPartnerDraft.trim());
                  handleCopyShareLink(customPartnerDraft.trim());
                }}
                className="gcp-btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', minHeight: '38px', padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700 }}
              >
                <Copy size={13} />
                <span>{isEs ? 'Aplicar y Copiar URL' : 'Apply & Copy URL'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA FOOTER ── */}
        <section
          className="sup-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            borderLeft: '4px solid #003666',
          }}
        >
          <div>
            <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#003666' }}>
              {isEs ? '¿Listo para evaluar una alianza de distribución con Atlas?' : 'Ready to explore a distribution partnership with Atlas?'}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '3px' }}>
              {isEs
                ? 'Envíanos tu tarifa Ex-Works y preparamos una vista previa privada de tu catálogo en 48–72 horas.'
                : 'Share your Ex-Works schedule and we will prepare a private interactive preview of your line within 48–72 hours.'}
            </div>
          </div>

          <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <a
              href="mailto:info@atlashealth-services.com?subject=Supplier%20Partnership%20%E2%80%94%20Atlas%20Health%20Services"
              className="gcp-btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 14px', fontSize: '0.80rem', fontWeight: 700, textDecoration: 'none' }}
            >
              <span>info@atlashealth-services.com</span>
            </a>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="gcp-btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', fontSize: '0.80rem', fontWeight: 700, textDecoration: 'none' }}
            >
              <span>{isEs ? 'Iniciar Onboarding' : 'Start Onboarding'}</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </section>
      </main>

      <div className="no-print">
        <PublicUnifiedFooter />
      </div>
    </div>
  );
}
