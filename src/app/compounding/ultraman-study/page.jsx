"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Pill, 
  ArrowLeft, 
  CheckCircle2, 
  ExternalLink, 
  Sparkles, 
  Globe, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  Layers, 
  Copy, 
  Check, 
  Sun, 
  Moon, 
  Factory,
  ChevronRight,
  Calculator
} from 'lucide-react';

const FX_RATES = {
  BRL_PER_EUR: 6.10,
  BRL_PER_USD: 5.65,
  EUR_PER_USD: 0.92
};

// ── Raw Data: Brazilian Compounding Pharmacy Finished Quotes ────────────────
const BRAZIL_SPLIT_DATA = [
  {
    id: 'rx-1',
    number: 1,
    title: 'Soporte Metabólico & Coenzimas Básicas',
    focus: 'Anti-fatiga, síntesis de NAD+ y cofactoría mitocondrial',
    morning: {
      capsules30: 64.00,
      capsules60: 72.00,
      apis: [
        { name: 'Vitamina D3', dose: '2000 UI' },
        { name: 'Vitamina C', dose: '200 mg' },
        { name: 'Zinco Quelato', dose: '15 mg' },
        { name: 'Nicotinamida (B3)', dose: '50 mg' },
        { name: 'Vitamina B6', dose: '25 mg' }
      ]
    },
    night: {
      capsules30: 95.00,
      capsules60: 139.00,
      apis: [
        { name: 'N-Acetilcisteína (NAC)', dose: '250 mg' },
        { name: 'Valeriana', dose: '300 mg' },
        { name: 'Vitamina B12', dose: '500 mcg' },
        { name: 'Vitamina E', dose: '100 UI' },
        { name: 'Manganeso', dose: '2 mg' }
      ]
    },
    // Bulgaria Pharmapolis benchmark (unaltered standalone model)
    bulgariaBenchmarkEur: {
      capsules30: 16.50,
      capsules60: 24.80
    }
  },
  {
    id: 'rx-2',
    number: 2,
    title: 'Detox Hepático & Regeneración Celular',
    focus: 'Protección hepatocelular (Silibina) + ruta de metilación y antioxidantes',
    morning: {
      capsules30: 64.00,
      capsules60: 79.00,
      apis: [
        { name: 'Vitamina D3', dose: '2000 UI' },
        { name: 'Vitamina C', dose: '200 mg' },
        { name: 'Zinco Gluconato', dose: '15 mg' },
        { name: 'Metilfolato (B9)', dose: '400 mcg' },
        { name: 'Omega 3', dose: '300 mg' }
      ]
    },
    night: {
      capsules30: 110.00,
      capsules60: 170.00,
      apis: [
        { name: 'N-Acetilcisteína (NAC)', dose: '250 mg' },
        { name: 'Taurina', dose: '250 mg' },
        { name: 'Trans-Resveratrol', dose: '150 mg' },
        { name: 'Silibina (Milk Thistle)', dose: '140 mg' },
        { name: 'Vitamina E', dose: '100 UI' }
      ]
    },
    bulgariaBenchmarkEur: {
      capsules30: 22.00,
      capsules60: 32.50
    }
  },
  {
    id: 'rx-3',
    number: 3,
    title: 'Cardio-Longevidad, Glutatión & Carotenoides',
    focus: 'Triada antioxidante intracelular (Glutatión + Astaxantina + CoQ10)',
    morning: {
      capsules30: 80.00,
      capsules60: 111.00,
      apis: [
        { name: 'Coenzima Q10', dose: '100 mg' },
        { name: 'Vitamina K2 (MK-7)', dose: '100 mcg' },
        { name: 'Omega 3', dose: '300 mg' },
        { name: 'Astaxantina 5%', dose: '8 mg' },
        { name: 'Metilfolato', dose: '400 mcg' }
      ]
    },
    night: {
      capsules30: 171.00,
      capsules60: 294.00,
      apis: [
        { name: 'Curcumina (Cureit®)', dose: '250 mg' },
        { name: 'N-Acetilcisteína (NAC)', dose: '250 mg' },
        { name: 'Glutatión Reducido', dose: '250 mg' },
        { name: 'Taurina', dose: '250 mg' },
        { name: 'Zinco Gluconato', dose: '15 mg' }
      ]
    },
    bulgariaBenchmarkEur: {
      capsules30: 36.00,
      capsules60: 52.00
    }
  },
  {
    id: 'rx-4',
    number: 4,
    title: 'Ultra-Longevity Premium (Patentes Fagron Brasil)',
    focus: 'Máxima concentración de fitoterápicos de patente Fagron (Mitocondrin, Citrusim, Miodesin)',
    morning: {
      capsules30: 668.00,
      capsules60: 1284.00,
      apis: [
        { name: 'Coenzima Q10', dose: '100 mg' },
        { name: 'Mitocondrin® (Fagron)', dose: '1 cap' },
        { name: 'CitruSiM® (Fagron)', dose: '250 mg' },
        { name: 'Brocophanus® (Fagron)', dose: '250 mg' },
        { name: 'Astaxantina', dose: '8 mg' }
      ]
    },
    night: {
      capsules30: 309.00,
      capsules60: 569.00,
      apis: [
        { name: 'Curcumina (Cureit®)', dose: '250 mg' },
        { name: 'Trans-Resveratrol', dose: '150 mg' },
        { name: 'Glutatión Reducido', dose: '250 mg' },
        { name: 'Miodesin® (Fagron)', dose: '250 mg' },
        { name: 'SiliciuMax® (Fagron)', dose: '10 mg' }
      ]
    },
    bulgariaBenchmarkEur: {
      capsules30: 185.00,
      capsules60: 285.00
    }
  },
  {
    id: 'rx-5',
    number: 5,
    title: 'Matriz Dérmica, Folículos & Tejido Conectivo',
    focus: 'Síntesis de colágeno, anclaje de queratina y adaptógeno Panax Ginseng',
    morning: {
      capsules30: 62.00,
      capsules60: 76.00,
      apis: [
        { name: 'Biotina (D-Biotin)', dose: '5000 mcg' },
        { name: 'SiliciuMax®', dose: '10 mg' },
        { name: 'Horsetail Extract (Cola de Caballo)', dose: '300 mg' },
        { name: 'Zinco Gluconato', dose: '30 mg' },
        { name: 'Vitamina D3', dose: '4000 UI' }
      ]
    },
    night: {
      capsules30: 108.00,
      capsules60: 172.00,
      apis: [
        { name: 'Omega 3', dose: '300 mg' },
        { name: 'N-Acetilcisteína (NAC)', dose: '250 mg' },
        { name: 'Vitamina C', dose: '200 mg' },
        { name: 'Silibina (Milk Thistle)', dose: '140 mg' },
        { name: 'Panax Ginseng', dose: '200 mg' }
      ]
    },
    bulgariaBenchmarkEur: {
      capsules30: 21.00,
      capsules60: 31.00
    }
  },
  {
    id: 'rx-6',
    number: 6,
    title: 'Complejo Digestivo, Neuro-Vascular & B5',
    focus: 'Drenaje biliar (Alcachofa), neurotransmisión gabaérgica y coenzima A',
    morning: {
      capsules30: 64.00,
      capsules60: 80.00,
      apis: [
        { name: 'Artichoke Extract (Alcachofa)', dose: '300 mg' },
        { name: 'Cobre Bisglicinato', dose: '2 mg' },
        { name: 'Vitamina B5 (Pantotenato)', dose: '100 mg' },
        { name: 'Vitamina A (Retinol)', dose: '2500 UI' },
        { name: 'Vitamina E', dose: '100 UI' }
      ]
    },
    night: {
      capsules30: 124.00,
      capsules60: 201.00,
      apis: [
        { name: 'Taurina', dose: '250 mg' },
        { name: 'Silibina', dose: '140 mg' },
        { name: 'Valeriana', dose: '300 mg' },
        { name: 'Vitamina B12', dose: '500 mcg' },
        { name: 'N-Acetilcisteína (NAC)', dose: '250 mg' }
      ]
    },
    bulgariaBenchmarkEur: {
      capsules30: 23.50,
      capsules60: 34.00
    }
  },
  {
    id: 'rx-7',
    number: 7,
    title: 'Metilación Esencial, Glutatión & Descanso',
    focus: 'Donación de grupos metilo, buffer redox y relajación neuromuscular',
    morning: {
      capsules30: 64.00,
      capsules60: 79.00,
      apis: [
        { name: 'Vitamina D3', dose: '2000 UI' },
        { name: 'Vitamina C', dose: '200 mg' },
        { name: 'Zinco Gluconato', dose: '15 mg' },
        { name: 'Metilfolato', dose: '400 mcg' },
        { name: 'Omega 3', dose: '300 mg' }
      ]
    },
    night: {
      capsules30: 89.00,
      capsules60: 131.00,
      apis: [
        { name: 'N-Acetilcisteína (NAC)', dose: '250 mg' },
        { name: 'Taurina', dose: '250 mg' },
        { name: 'Valeriana', dose: '300 mg' }
      ]
    },
    bulgariaBenchmarkEur: {
      capsules30: 17.50,
      capsules60: 26.00
    }
  }
];

// ── Raw Data: Brazilian Compounding Pharmacy All-in-One Quotes (Orçamentos 1-9) ──
const BRAZIL_ALL_IN_ONE_DATA = [
  {
    id: 'orc-1',
    number: 1,
    title: 'Orçamento 1: All-in-One Multivitamínico & Anti-fatiga',
    apisCount: 10,
    apis: [
      'Vitamina D3 2000UI', 'Vitamina C 200mg', 'Zinco Gluconato 15mg', 'Nicotinamida 50mg',
      'Vitamina B6 25mg', 'N-Acetilcisteína 250mg', 'Valeriana 300mg', 'Vitamina B12 500mcg',
      'Vitamina E 100UI', 'Manganeso 2mg'
    ],
    brazilFinalBrl: { caps30: 84.00, caps60: 119.00 },
    bulgariaBenchmarkEur: { caps30: 24.50, caps60: 38.00 },
    notes: 'Ahorro en Brasil del 43% frente a pedir los dos botes separados (R$ 211 vs R$ 119).'
  },
  {
    id: 'orc-2',
    number: 2,
    title: 'Orçamento 2: All-in-One Hepático & Antioxidante',
    apisCount: 10,
    apis: [
      'Vitamina D3 2000UI', 'Vitamina C 200mg', 'Zinco Gluconato 15mg', 'Vitamina B9 (Metilfolato) 400mcg',
      'Omega 3 300mg', 'N-Acetilcisteína 250mg', 'Taurina 250mg', 'Trans-Resveratrol 150mg',
      'Silibina 140mg', 'Vitamina E 100UI'
    ],
    brazilFinalBrl: { caps30: 134.00, caps60: 221.00 },
    bulgariaBenchmarkEur: { caps30: 28.50, caps60: 44.00 },
    notes: 'Fórmula completa con Resveratrol y Silibina. Alta adherencia en 1 sola toma.'
  },
  {
    id: 'orc-3',
    number: 3,
    title: 'Orçamento 3: All-in-One Glutatión, CoQ10 & Astaxantina',
    apisCount: 10,
    apis: [
      'Coenzima Q10 100mg', 'Vitamina K2 100mcg', 'Omega 3 300mg', 'Astaxantina 8mg',
      'Vitamina B9 400mcg', 'Curcumina (Cureit®) 250mg', 'N-Acetilcisteína 250mg',
      'Glutatión Reducido 250mg', 'Taurina 250mg', 'Zinco Gluconato 15mg'
    ],
    brazilFinalBrl: { caps30: 299.00, caps60: 592.00 },
    bulgariaBenchmarkEur: { caps30: 42.00, caps60: 68.00 },
    notes: 'Volumen activo elevado (~1.700 mg/dosis). En Bulgaria los APIs tienen aranceles menores.'
  },
  {
    id: 'orc-4',
    number: 4,
    title: 'Orçamento 4: All-in-One Ultra-Longevity (Patentes Fagron)',
    apisCount: 10,
    apis: [
      'Coenzima Q10 100mg', 'Mitocondrin® 1 cap', 'CitruSiM® 250mg', 'Brocophanus® 250mg',
      'Astaxantina 8mg', 'Curcumina (Cureit®) 250mg', 'Trans-Resveratrol 150mg',
      'Glutatión Reducido 250mg', 'Miodesin® 250mg', 'SiliciuMax® 10mg'
    ],
    brazilFinalBrl: { caps30: 927.00, caps60: 1812.00 },
    bulgariaBenchmarkEur: { caps30: 210.00, caps60: 320.00 },
    notes: 'Fórmula insignia con 4 patentes Fagron. Brasil produce Mitocondrin y Miodesin domésticamente.'
  },
  {
    id: 'orc-5',
    number: 5,
    title: 'Orçamento 5: All-in-One Pelo, Piel & Adaptógeno Ginseng',
    apisCount: 10,
    apis: [
      'Biotina 5000mcg', 'SiliciuMax® 10mg', 'Horsetail (Cola de Caballo) 300mg', 'Zinco Gluconato 30mg',
      'Vitamina D3 4000UI', 'Omega 3 300mg', 'N-Acetilcisteína 250mg', 'Vitamina C 200mg',
      'Silibina 140mg', 'Panax Ginseng 200mg'
    ],
    brazilFinalBrl: { caps30: 115.00, caps60: 183.00 },
    bulgariaBenchmarkEur: { caps30: 26.00, caps60: 41.00 },
    notes: 'Precio muy competitivo en Brasil para una fórmula de 10 componentes (R$ 183 para 60 días).'
  },
  {
    id: 'orc-6',
    number: 6,
    title: 'Orçamento 6: All-in-One Drenaje Hepato-Biliar & Calma',
    apisCount: 10,
    apis: [
      'Artichoke Extract 300mg', 'Cobre Bisglicinato 2mg', 'Vitamina B5 100mg', 'Vitamina A 2500UI',
      'Vitamina E 100UI', 'Taurina 250mg', 'Silibina 140mg', 'Valeriana 300mg',
      'Vitamina B12 500mcg', 'N-Acetilcisteína 250mg'
    ],
    brazilFinalBrl: { caps30: 138.00, caps60: 222.00 },
    bulgariaBenchmarkEur: { caps30: 27.00, caps60: 42.00 },
    notes: 'Combinación balanceada de soporte hepático con neurotransmisión nocturna.'
  },
  {
    id: 'orc-7',
    number: 7,
    title: 'Orçamento 7: All-in-One Metilación Básica & Valeriana',
    apisCount: 7,
    apis: [
      'Vitamina D3 2000UI', 'Vitamina C 200mg', 'Zinco Gluconato 15mg', 'Vitamina B9 (Metilfolato) 400mcg',
      'Omega 3 300mg', 'N-Acetilcisteína 250mg', 'Taurina 250mg', 'Valeriana 300mg'
    ],
    brazilFinalBrl: { caps30: 90.00, caps60: 135.00 },
    bulgariaBenchmarkEur: { caps30: 19.50, caps60: 31.00 },
    notes: 'Fórmula de entrada de gran rotación. Excelente margen en ambos orígenes.'
  },
  {
    id: 'orc-8',
    number: 8,
    title: 'Orçamento 8: All-in-One Gastrointestinal & Biointestil®',
    apisCount: 6,
    apis: [
      'Vitamina D3 3000UI', 'Curcumina (Cureit®) 250mg', 'Resveratrol 100mg',
      'Ácido Alfa Lipoico 300mg', 'Valeriana 300mg', 'Biointestil® (Fagron) 300mg'
    ],
    brazilFinalBrl: { caps30: 334.00, caps60: 619.00 },
    bulgariaBenchmarkEur: { caps30: 48.00, caps60: 82.00 },
    notes: 'Biointestil® es un derivado fitoterápico de jengibre y palmarosa patentado en Brasil.'
  },
  {
    id: 'orc-9',
    number: 9,
    title: 'Orçamento 9: All-in-One Sensibilidad a la Insulina & Mio-Inositol',
    apisCount: 6,
    apis: [
      'Vitamina B12 1000mcg', 'Vitamina D 2000UI', 'Zinco Gluconato 15mg',
      'Omega 3 250mg', 'Taurina 250mg', 'Mio-Inositol 250mg'
    ],
    brazilFinalBrl: { caps30: 73.00, caps60: 95.00 },
    bulgariaBenchmarkEur: { caps30: 16.00, caps60: 25.00 },
    notes: 'Fórmula muy asequible en Brasil: R$ 95 por 60 días completos de tratamiento.'
  }
];

export default function UltramanCrossBorderStudyPage() {
  const [currency, setCurrency] = useState('EUR'); // 'EUR' | 'USD' | 'BRL'
  const [viewMode, setViewMode] = useState('all-in-one'); // 'all-in-one' | 'split'
  const [bottleSize, setBottleSize] = useState(60); // 30 | 60
  const [copiedLink, setCopiedLink] = useState(false);

  // Conversion helper
  const convertPrice = (amount, fromCurrency) => {
    if (fromCurrency === currency) return amount;
    let inBrl = amount;
    if (fromCurrency === 'EUR') inBrl = amount * FX_RATES.BRL_PER_EUR;
    if (fromCurrency === 'USD') inBrl = amount * FX_RATES.BRL_PER_USD;

    if (currency === 'BRL') return inBrl;
    if (currency === 'EUR') return inBrl / FX_RATES.BRL_PER_EUR;
    if (currency === 'USD') return inBrl / FX_RATES.BRL_PER_USD;
    return amount;
  };

  const formatMoney = (amount, cur = currency) => {
    const symbol = cur === 'BRL' ? 'R$ ' : cur === 'EUR' ? '€' : '$';
    return `${symbol}${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* ── Top Header Navigation ────────────────────────────────────────── */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link 
              href="/admin/prescriptions"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#64748b', textDecoration: 'none', padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0' }}
            >
              <ArrowLeft size={14} /> Volver al Desk
            </Link>
            <span style={{ height: 16, width: 1, background: '#cbd5e1' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#003666', color: '#ffffff', padding: '2px 8px', borderRadius: 4 }}>
                ATLAS CLINICAL INTELLIGENCE
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                Estudio Farmacoeconómico Ultraman
              </span>
            </div>
          </div>

          {/* Controls: Currency + Share */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Currency selector */}
            <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: 3, borderRadius: 8, border: '1px solid #cbd5e1' }}>
              {['EUR', 'USD', 'BRL'].map((cur) => (
                <button
                  key={cur}
                  type="button"
                  onClick={() => setCurrency(cur)}
                  style={{
                    border: 'none',
                    background: currency === cur ? '#003666' : 'transparent',
                    color: currency === cur ? '#ffffff' : '#475569',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cur}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                padding: '5px 12px',
                borderRadius: 6,
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              {copiedLink ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
              {copiedLink ? 'Copiado' : 'Compartir con Cliente'}
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero Banner: Executive Pitch ─────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)', borderBottom: '1px solid #e2e8f0', padding: '40px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: 20, fontSize: '0.76rem', fontWeight: 700, marginBottom: 16 }}>
            <Globe size={14} /> CROSS-BORDER COMPOUNDING BENCHMARK · MULTI-SUPPLIER ARCHITECTURE
          </div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#002040', margin: '0 0 12px 0', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Ultraman™ Longevity Line: Brasil vs. Bulgaria (Pharmapolis)
          </h1>
          <p style={{ fontSize: '1.02rem', color: '#475569', maxWidth: 860, lineHeight: 1.6, margin: '0 0 24px 0' }}>
            Comparativa <em>apples-to-apples</em> entre dos centros de formulación magistral independientes para la misma línea clínica de micronutrición. 
            <strong> Brasil</strong> ofrece cotizaciones con <em>precio final cerrado</em> (materia prima, elaboración galénica y envase incluidos). 
            <strong> Pharmapolis (Bulgaria)</strong> opera bajo el modelo europeo <em>CAT-CAP v1.1</em> con producción cGMP y tarifas por componente.
          </p>

          {/* Golden Rules Callout */}
          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderLeft: '5px solid #003666', borderRadius: 8, padding: '14px 18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Independencia de Proveedores</div>
              <div style={{ fontSize: '0.86rem', color: '#0f172a', marginTop: 3 }}>
                <strong>Cero interacción</strong>: Los cálculos de Bulgaria y Brasil no se mezclan. Son proveedores independientes para distintas geografías del cliente.
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Modelo de Coste Brasileño</div>
              <div style={{ fontSize: '0.86rem', color: '#0f172a', marginTop: 3 }}>
                Los importes de Brasil corresponden al <strong>precio final de farmacia</strong> con mano de obra y envasado ya integrados.
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Tipo de Cambio Referencial</div>
              <div style={{ fontSize: '0.86rem', color: '#0f172a', marginTop: 3 }}>
                <strong>1 EUR = 6.10 BRL</strong> · <strong>1 USD = 5.65 BRL</strong> (Permite comparar en paridad de poder adquisitivo).
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Dashboard Content ────────────────────────────────────────── */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '30px 20px 80px 20px' }}>
        
        {/* Toggle Controls: View Mode & Bottle Duration */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          
          {/* View mode toggle */}
          <div style={{ display: 'inline-flex', background: '#e2e8f0', padding: 4, borderRadius: 10 }}>
            <button
              type="button"
              onClick={() => setViewMode('all-in-one')}
              style={{
                border: 'none',
                background: viewMode === 'all-in-one' ? '#ffffff' : 'transparent',
                color: viewMode === 'all-in-one' ? '#003666' : '#64748b',
                fontWeight: 700,
                fontSize: '0.84rem',
                padding: '8px 16px',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: viewMode === 'all-in-one' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <Pill size={16} /> Batch B: All-in-One (Orçamentos 1 a 9)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('split')}
              style={{
                border: 'none',
                background: viewMode === 'split' ? '#ffffff' : 'transparent',
                color: viewMode === 'split' ? '#003666' : '#64748b',
                fontWeight: 700,
                fontSize: '0.84rem',
                padding: '8px 16px',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: viewMode === 'split' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <Layers size={16} /> Batch A: Split Mañana / Noche (Prescrições 1 a 7)
            </button>
          </div>

          {/* Bottle size switch */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Ciclo de Dispensación:</span>
            <div style={{ display: 'inline-flex', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 8, padding: 3 }}>
              <button
                type="button"
                onClick={() => setBottleSize(30)}
                style={{
                  border: 'none',
                  background: bottleSize === 30 ? '#003666' : 'transparent',
                  color: bottleSize === 30 ? '#ffffff' : '#475569',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '5px 12px',
                  borderRadius: 6,
                  cursor: 'pointer'
                }}
              >
                30 Dosis (1 Mes)
              </button>
              <button
                type="button"
                onClick={() => setBottleSize(60)}
                style={{
                  border: 'none',
                  background: bottleSize === 60 ? '#003666' : 'transparent',
                  color: bottleSize === 60 ? '#ffffff' : '#475569',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '5px 12px',
                  borderRadius: 6,
                  cursor: 'pointer'
                }}
              >
                60 Dosis (2 Meses)
              </button>
            </div>
          </div>
        </div>

        {/* ── View 1: All-in-One Formulations (Batch B) ────────────────────── */}
        {viewMode === 'all-in-one' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '12px 16px', fontSize: '0.82rem', color: '#1e40af' }}>
              💡 <strong>Ventaja Galénica All-in-One</strong>: Al concentrar todos los activos en un único preparado diario, la farmacia brasileña reduce hasta un <strong>45%</strong> el coste operativo y de envases en comparación con frascos separados.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
              {BRAZIL_ALL_IN_ONE_DATA.map((orc) => {
                const brlVal = bottleSize === 30 ? orc.brazilFinalBrl.caps30 : orc.brazilFinalBrl.caps60;
                const convertedBrl = convertPrice(brlVal, 'BRL');
                const bulgariaEurVal = bottleSize === 30 ? orc.bulgariaBenchmarkEur.caps30 : orc.bulgariaBenchmarkEur.caps60;
                const convertedBulgaria = convertPrice(bulgariaEurVal, 'EUR');
                const deltaPercent = Math.round(((convertedBrl - convertedBulgaria) / convertedBulgaria) * 100);

                return (
                  <div
                    key={orc.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 10,
                      padding: '18px 20px',
                      display: 'grid',
                      gridTemplateColumns: 'minmax(280px, 1fr) auto auto auto',
                      alignItems: 'center',
                      gap: 20
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: 4 }}>
                          {orc.apisCount} PRINCIPIOS ACTIVOS
                        </span>
                        <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          Ciclo de {bottleSize} Cápsulas
                        </span>
                      </div>
                      <h3 style={{ margin: '0 0 6px 0', fontSize: '1.02rem', fontWeight: 700, color: '#0f172a' }}>
                        {orc.title}
                      </h3>
                      <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
                        {orc.apis.join(' · ')}
                      </div>
                      {orc.notes && (
                        <div style={{ fontSize: '0.72rem', color: '#0369a1', marginTop: 6, fontStyle: 'italic' }}>
                          ℹ️ {orc.notes}
                        </div>
                      )}
                    </div>

                    {/* Brazil Final Quote */}
                    <div style={{ textAlign: 'right', minWidth: 130 }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>
                        🇧🇷 Brasil (Final)
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                        {formatMoney(convertedBrl)}
                      </div>
                      <div style={{ fontSize: '0.70rem', color: '#64748b' }}>
                        {currency !== 'BRL' && `R$ ${brlVal.toFixed(2)}`}
                      </div>
                    </div>

                    {/* Bulgaria Pharmapolis Benchmark */}
                    <div style={{ textAlign: 'right', minWidth: 140, borderLeft: '1px solid #e2e8f0', paddingLeft: 16 }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>
                        🇧🇬 Bulgaria (CAT-CAP)
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                        {formatMoney(convertedBulgaria)}
                      </div>
                      <div style={{ fontSize: '0.70rem', color: '#64748b' }}>
                        {currency !== 'EUR' && `€${bulgariaEurVal.toFixed(2)}`}
                      </div>
                    </div>

                    {/* Variance Delta Badge */}
                    <div style={{ minWidth: 110, textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: 20,
                          background: deltaPercent <= 0 ? '#dcfce7' : '#fef3c7',
                          color: deltaPercent <= 0 ? '#15803d' : '#b45309',
                          border: `1px solid ${deltaPercent <= 0 ? '#86efac' : '#fde68a'}`
                        }}
                      >
                        {deltaPercent <= 0 ? `Brasil ${Math.abs(deltaPercent)}% más bajo` : `Bulgaria ${deltaPercent}% más bajo`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── View 2: Split Day/Night Regimens (Batch A) ───────────────────── */}
        {viewMode === 'split' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 8, padding: '12px 16px', fontSize: '0.82rem', color: '#334155' }}>
              ⚖️ <strong>Régimen Cronobiológico Separado (Mañana & Noche)</strong>: Requiere 2 botes independientes por ciclo para separar nutrientes energizantes de cofactores de relajación nocturna (Valeriana, Melatonina, NAC).
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
              {BRAZIL_SPLIT_DATA.map((rx) => {
                const mornVal = bottleSize === 30 ? rx.morning.capsules30 : rx.morning.capsules60;
                const nightVal = bottleSize === 30 ? rx.night.capsules30 : rx.night.capsules60;
                const totalBrl = mornVal + nightVal;
                const convertedBrl = convertPrice(totalBrl, 'BRL');
                const bulgariaEurVal = bottleSize === 30 
                  ? (rx.bulgariaBenchmarkEur.capsules30 ?? rx.bulgariaBenchmarkEur.caps30) 
                  : (rx.bulgariaBenchmarkEur.capsules60 ?? rx.bulgariaBenchmarkEur.caps60);
                const convertedBulgaria = convertPrice(bulgariaEurVal, 'EUR');

                return (
                  <div
                    key={rx.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 10,
                      overflow: 'hidden',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                    }}
                  >
                    {/* Header */}
                    <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#003666', color: '#ffffff', padding: '2px 8px', borderRadius: 4 }}>
                          PRESCRIÇÃO {rx.number}
                        </span>
                        <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#0f172a' }}>
                          {rx.title}
                        </h3>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                        {rx.focus}
                      </div>
                    </div>

                    {/* Body: 2 Columns (Morning vs Night) */}
                    <div style={{ padding: '16px 18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                      {/* Morning Box */}
                      <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 8, padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.76rem', fontWeight: 700, color: '#b45309' }}>
                            <Sun size={14} /> TOMA MAÑANA (MANHÃ)
                          </span>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                            {formatMoney(convertPrice(mornVal, 'BRL'))}
                          </span>
                        </div>
                        <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.78rem', color: '#451a03', lineHeight: 1.5 }}>
                          {rx.morning.apis.map((a, i) => (
                            <li key={i}>{a.name} <strong>{a.dose}</strong></li>
                          ))}
                        </ul>
                      </div>

                      {/* Night Box */}
                      <div style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.76rem', fontWeight: 700, color: '#334155' }}>
                            <Moon size={14} /> TOMA NOCHE (NOITE)
                          </span>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                            {formatMoney(convertPrice(nightVal, 'BRL'))}
                          </span>
                        </div>
                        <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.78rem', color: '#1e293b', lineHeight: 1.5 }}>
                          {rx.night.apis.map((a, i) => (
                            <li key={i}>{a.name} <strong>{a.dose}</strong></li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Summary Footer */}
                    <div style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                      <div style={{ fontSize: '0.80rem', color: '#64748b' }}>
                        Total Combinado 2 Frascos ({bottleSize} días):
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.70rem', color: '#64748b', display: 'block' }}>Total Brasil:</span>
                          <strong style={{ fontSize: '1.05rem', color: '#16a34a' }}>{formatMoney(convertedBrl)}</strong>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.70rem', color: '#64748b', display: 'block' }}>Bulgaria CAT-CAP:</span>
                          <strong style={{ fontSize: '1.05rem', color: '#0284c7' }}>{formatMoney(convertedBulgaria)}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Strategic Sourcing Decision Matrix ───────────────────────────── */}
        <section style={{ marginTop: 40, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '26px 24px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#002040', margin: '0 0 16px 0' }}>
            Matriz de Decisión Estratégica para Ultraman™
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16a34a', fontWeight: 800, fontSize: '0.90rem', marginBottom: 8 }}>
                <CheckCircle2 size={18} /> ¿Cuándo Fabricar en Brasil?
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.82rem', color: '#14532d', lineHeight: 1.6 }}>
                <li><strong>Fórmulas All-in-One</strong>: Brasil ofrece un ahorro de entre 30% y 45% al empaquetar 7 a 10 activos en un solo bote.</li>
                <li><strong>Pacientes en América Latina</strong>: Cero riesgo aduanero con ANVISA y envíos exprés locales.</li>
                <li><strong>Patentes exclusivas Fagron Brasil</strong>: Acceso directo a Mitocondrin®, Miodesin®, Biointestil® y CitruSiM® sin recargo de importación transatlántica.</li>
              </ul>
            </div>

            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0284c7', fontWeight: 800, fontSize: '0.90rem', marginBottom: 8 }}>
                <CheckCircle2 size={18} /> ¿Cuándo Fabricar en Bulgaria (Pharmapolis)?
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.82rem', color: '#0c4a6e', lineHeight: 1.6 }}>
                <li><strong>Pacientes en Emiratos Árabes Unidos (EAU) y Europa</strong>: Tránsito de 48–72h con trazabilidad EU GMP y sin aranceles de importación de ultramar.</li>
                <li><strong>Antioxidantes de Alta Gama</strong>: Glutatión reducido, Trans-Resveratrol 98%, Astaxantina 5% y CoQ10 Kaneka con arancel cero de la UE.</li>
                <li><strong>Cumplimiento de Monografías USP / Ph. Eur.</strong>: Certificado analítico de liberación de lote por lote.</li>
              </ul>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '24px 20px', textAlign: 'center', fontSize: '0.78rem', color: '#64748b' }}>
        Atlas Clinical Intelligence Platform · Global Compounding Sourcing Architecture · Generado para Ultraman™ Precision Supplements
      </footer>
    </div>
  );
}

