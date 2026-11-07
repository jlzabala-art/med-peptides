"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Pill, 
  ArrowLeft, 
  CheckCircle2, 
  Globe, 
  Copy, 
  Check, 
  Sun, 
  Moon, 
  Layers,
  MoreVertical
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
    title: {
      en: 'Metabolic Support & Mitochondrial Coenzymes',
      es: 'Soporte Metabólico & Coenzimas Básicas'
    },
    focus: {
      en: 'Anti-fatigue, NAD+ synthesis, and mitochondrial cofactors',
      es: 'Anti-fatiga, síntesis de NAD+ y cofactoría mitocondrial'
    },
    morning: {
      capsules30: 64.00,
      capsules60: 72.00,
      apis: [
        { name: 'Vitamin D3', dose: '2000 IU' },
        { name: 'Vitamin C', dose: '200 mg' },
        { name: 'Zinc Chelate', dose: '15 mg' },
        { name: 'Nicotinamide (B3)', dose: '50 mg' },
        { name: 'Vitamin B6', dose: '25 mg' }
      ]
    },
    night: {
      capsules30: 95.00,
      capsules60: 139.00,
      apis: [
        { name: 'N-Acetylcysteine (NAC)', dose: '250 mg' },
        { name: 'Valerian Root', dose: '300 mg' },
        { name: 'Vitamin B12', dose: '500 mcg' },
        { name: 'Vitamin E', dose: '100 IU' },
        { name: 'Manganese', dose: '2 mg' }
      ]
    },
    bulgariaBenchmarkEur: {
      capsules30: 16.50,
      capsules60: 24.80
    }
  },
  {
    id: 'rx-2',
    number: 2,
    title: {
      en: 'Hepatic Detox & Cellular Regeneration',
      es: 'Detox Hepático & Regeneración Celular'
    },
    focus: {
      en: 'Hepatocellular protection (Silybin) + methylation pathways and antioxidants',
      es: 'Protección hepatocelular (Silibina) + ruta de metilación y antioxidantes'
    },
    morning: {
      capsules30: 64.00,
      capsules60: 79.00,
      apis: [
        { name: 'Vitamin D3', dose: '2000 IU' },
        { name: 'Vitamin C', dose: '200 mg' },
        { name: 'Zinc Gluconate', dose: '15 mg' },
        { name: 'Methylfolate (B9)', dose: '400 mcg' },
        { name: 'Omega 3', dose: '300 mg' }
      ]
    },
    night: {
      capsules30: 110.00,
      capsules60: 170.00,
      apis: [
        { name: 'N-Acetylcysteine (NAC)', dose: '250 mg' },
        { name: 'Taurine', dose: '250 mg' },
        { name: 'Trans-Resveratrol', dose: '150 mg' },
        { name: 'Silybin (Milk Thistle)', dose: '140 mg' },
        { name: 'Vitamin E', dose: '100 IU' }
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
    title: {
      en: 'Cardio-Longevity, Glutathione & Carotenoids',
      es: 'Cardio-Longevidad, Glutatión & Carotenoides'
    },
    focus: {
      en: 'Intracellular antioxidant triad (Glutathione + Astaxanthin + CoQ10)',
      es: 'Triada antioxidante intracelular (Glutatión + Astaxantina + CoQ10)'
    },
    morning: {
      capsules30: 80.00,
      capsules60: 111.00,
      apis: [
        { name: 'Coenzyme Q10', dose: '100 mg' },
        { name: 'Vitamin K2 (MK-7)', dose: '100 mcg' },
        { name: 'Omega 3', dose: '300 mg' },
        { name: 'Astaxanthin 5%', dose: '8 mg' },
        { name: 'Methylfolate', dose: '400 mcg' }
      ]
    },
    night: {
      capsules30: 171.00,
      capsules60: 294.00,
      apis: [
        { name: 'Curcumin (Cureit®)', dose: '250 mg' },
        { name: 'N-Acetylcysteine (NAC)', dose: '250 mg' },
        { name: 'Reduced Glutathione', dose: '250 mg' },
        { name: 'Taurine', dose: '250 mg' },
        { name: 'Zinc Gluconate', dose: '15 mg' }
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
    title: {
      en: 'Ultra-Longevity Premium (Fagron Brazil Patents)',
      es: 'Ultra-Longevity Premium (Patentes Fagron Brasil)'
    },
    focus: {
      en: 'Maximum concentration of Fagron patented phytotherapy (Mitocondrin, Citrusim, Miodesin)',
      es: 'Máxima concentración de fitoterápicos de patente Fagron (Mitocondrin, Citrusim, Miodesin)'
    },
    morning: {
      capsules30: 668.00,
      capsules60: 1284.00,
      apis: [
        { name: 'Coenzyme Q10', dose: '100 mg' },
        { name: 'Mitocondrin® (Fagron)', dose: '1 cap' },
        { name: 'CitruSiM® (Fagron)', dose: '250 mg' },
        { name: 'Brocophanus® (Fagron)', dose: '250 mg' },
        { name: 'Astaxanthin', dose: '8 mg' }
      ]
    },
    night: {
      capsules30: 309.00,
      capsules60: 569.00,
      apis: [
        { name: 'Curcumin (Cureit®)', dose: '250 mg' },
        { name: 'Trans-Resveratrol', dose: '150 mg' },
        { name: 'Reduced Glutathione', dose: '250 mg' },
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
    title: {
      en: 'Dermal Matrix, Follicles & Connective Tissue',
      es: 'Matriz Dérmica, Folículos & Tejido Conectivo'
    },
    focus: {
      en: 'Collagen synthesis, keratin anchoring and Panax Ginseng adaptogen',
      es: 'Síntesis de colágeno, anclaje de queratina y adaptógeno Panax Ginseng'
    },
    morning: {
      capsules30: 62.00,
      capsules60: 76.00,
      apis: [
        { name: 'Biotin (D-Biotin)', dose: '5000 mcg' },
        { name: 'SiliciuMax®', dose: '10 mg' },
        { name: 'Horsetail Extract', dose: '300 mg' },
        { name: 'Zinc Gluconate', dose: '30 mg' },
        { name: 'Vitamin D3', dose: '4000 IU' }
      ]
    },
    night: {
      capsules30: 108.00,
      capsules60: 172.00,
      apis: [
        { name: 'Omega 3', dose: '300 mg' },
        { name: 'N-Acetylcysteine (NAC)', dose: '250 mg' },
        { name: 'Vitamin C', dose: '200 mg' },
        { name: 'Silybin (Milk Thistle)', dose: '140 mg' },
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
    title: {
      en: 'Digestive Complex, Neuro-Vascular & B5',
      es: 'Complejo Digestivo, Neuro-Vascular & B5'
    },
    focus: {
      en: 'Biliary drainage (Artichoke), GABAergic neurotransmission, and Coenzyme A',
      es: 'Drenaje biliar (Alcachofa), neurotransmisión gabaérgica y coenzima A'
    },
    morning: {
      capsules30: 64.00,
      capsules60: 80.00,
      apis: [
        { name: 'Artichoke Extract', dose: '300 mg' },
        { name: 'Copper Bisglycinate', dose: '2 mg' },
        { name: 'Vitamin B5 (Pantothenate)', dose: '100 mg' },
        { name: 'Vitamin A (Retinol)', dose: '2500 IU' },
        { name: 'Vitamin E', dose: '100 IU' }
      ]
    },
    night: {
      capsules30: 124.00,
      capsules60: 201.00,
      apis: [
        { name: 'Taurine', dose: '250 mg' },
        { name: 'Silybin', dose: '140 mg' },
        { name: 'Valerian Root', dose: '300 mg' },
        { name: 'Vitamin B12', dose: '500 mcg' },
        { name: 'N-Acetylcysteine (NAC)', dose: '250 mg' }
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
    title: {
      en: 'Essential Methylation, Glutathione & Rest',
      es: 'Metilación Esencial, Glutatión & Descanso'
    },
    focus: {
      en: 'Methyl group donation, redox buffer, and neuromuscular relaxation',
      es: 'Donación de grupos metilo, buffer redox y relajación neuromuscular'
    },
    morning: {
      capsules30: 64.00,
      capsules60: 79.00,
      apis: [
        { name: 'Vitamin D3', dose: '2000 IU' },
        { name: 'Vitamin C', dose: '200 mg' },
        { name: 'Zinc Gluconate', dose: '15 mg' },
        { name: 'Methylfolate', dose: '400 mcg' },
        { name: 'Omega 3', dose: '300 mg' }
      ]
    },
    night: {
      capsules30: 89.00,
      capsules60: 131.00,
      apis: [
        { name: 'N-Acetylcysteine (NAC)', dose: '250 mg' },
        { name: 'Taurine', dose: '250 mg' },
        { name: 'Valerian Root', dose: '300 mg' }
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
    title: {
      en: 'Quote 1: All-in-One Multivitamin & Anti-Fatigue',
      es: 'Orçamento 1: All-in-One Multivitamínico & Anti-fatiga'
    },
    apisCount: 10,
    apis: [
      'Vitamin D3 2000IU', 'Vitamin C 200mg', 'Zinc Gluconate 15mg', 'Nicotinamide 50mg',
      'Vitamin B6 25mg', 'N-Acetylcysteine 250mg', 'Valerian Root 300mg', 'Vitamin B12 500mcg',
      'Vitamin E 100IU', 'Manganese 2mg'
    ],
    brazilFinalBrl: { caps30: 84.00, caps60: 119.00 },
    bulgariaBenchmarkEur: { caps30: 24.50, caps60: 38.00 },
    notes: {
      en: 'Brazil saves 43% compared to ordering two separate bottles (R$ 211 vs R$ 119).',
      es: 'Ahorro en Brasil del 43% frente a pedir los dos botes separados (R$ 211 vs R$ 119).'
    }
  },
  {
    id: 'orc-2',
    number: 2,
    title: {
      en: 'Quote 2: All-in-One Hepatic & Antioxidant',
      es: 'Orçamento 2: All-in-One Hepático & Antioxidante'
    },
    apisCount: 10,
    apis: [
      'Vitamin D3 2000IU', 'Vitamin C 200mg', 'Zinc Gluconate 15mg', 'Vitamin B9 (Methylfolate) 400mcg',
      'Omega 3 300mg', 'N-Acetylcysteine 250mg', 'Taurine 250mg', 'Trans-Resveratrol 150mg',
      'Silybin 140mg', 'Vitamin E 100IU'
    ],
    brazilFinalBrl: { caps30: 134.00, caps60: 221.00 },
    bulgariaBenchmarkEur: { caps30: 28.50, caps60: 44.00 },
    notes: {
      en: 'Complete formula with Resveratrol and Silybin. High adherence in a single daily dose.',
      es: 'Fórmula completa con Resveratrol y Silibina. Alta adherencia en 1 sola toma.'
    }
  },
  {
    id: 'orc-3',
    number: 3,
    title: {
      en: 'Quote 3: All-in-One Glutathione, CoQ10 & Astaxanthin',
      es: 'Orçamento 3: All-in-One Glutatión, CoQ10 & Astaxantina'
    },
    apisCount: 10,
    apis: [
      'Coenzyme Q10 100mg', 'Vitamin K2 100mcg', 'Omega 3 300mg', 'Astaxanthin 8mg',
      'Vitamin B9 400mcg', 'Curcumin (Cureit®) 250mg', 'N-Acetylcysteine 250mg',
      'Reduced Glutathione 250mg', 'Taurine 250mg', 'Zinc Gluconate 15mg'
    ],
    brazilFinalBrl: { caps30: 299.00, caps60: 592.00 },
    bulgariaBenchmarkEur: { caps30: 42.00, caps60: 68.00 },
    notes: {
      en: 'High active volume (~1,700 mg/dose). Bulgaria has lower tariffs on premium antioxidant APIs.',
      es: 'Volumen activo elevado (~1.700 mg/dosis). En Bulgaria los APIs tienen aranceles menores.'
    }
  },
  {
    id: 'orc-4',
    number: 4,
    title: {
      en: 'Quote 4: All-in-One Ultra-Longevity (Fagron Patents)',
      es: 'Orçamento 4: All-in-One Ultra-Longevity (Patentes Fagron)'
    },
    apisCount: 10,
    apis: [
      'Coenzyme Q10 100mg', 'Mitocondrin® 1 cap', 'CitruSiM® 250mg', 'Brocophanus® 250mg',
      'Astaxanthin 8mg', 'Curcumin (Cureit®) 250mg', 'Trans-Resveratrol 150mg',
      'Reduced Glutathione 250mg', 'Miodesin® 250mg', 'SiliciuMax® 10mg'
    ],
    brazilFinalBrl: { caps30: 927.00, caps60: 1812.00 },
    bulgariaBenchmarkEur: { caps30: 210.00, caps60: 320.00 },
    notes: {
      en: 'Flagship formula with 4 Fagron patents. Brazil manufactures Mitocondrin and Miodesin domestically.',
      es: 'Fórmula insignia con 4 patentes Fagron. Brasil produce Mitocondrin y Miodesin domésticamente.'
    }
  },
  {
    id: 'orc-5',
    number: 5,
    title: {
      en: 'Quote 5: All-in-One Hair, Skin & Panax Ginseng',
      es: 'Orçamento 5: All-in-One Pelo, Piel & Adaptógeno Ginseng'
    },
    apisCount: 10,
    apis: [
      'Biotin 5000mcg', 'SiliciuMax® 10mg', 'Horsetail 300mg', 'Zinc Gluconate 30mg',
      'Vitamin D3 4000IU', 'Omega 3 300mg', 'N-Acetylcysteine 250mg', 'Vitamin C 200mg',
      'Silybin 140mg', 'Panax Ginseng 200mg'
    ],
    brazilFinalBrl: { caps30: 115.00, caps60: 183.00 },
    bulgariaBenchmarkEur: { caps30: 26.00, caps60: 41.00 },
    notes: {
      en: 'Highly competitive price in Brazil for a 10-ingredient formula (R$ 183 for 60 days).',
      es: 'Precio muy competitivo en Brasil para una fórmula de 10 componentes (R$ 183 para 60 días).'
    }
  },
  {
    id: 'orc-6',
    number: 6,
    title: {
      en: 'Quote 6: All-in-One Hepato-Biliary Drainage & Calm',
      es: 'Orçamento 6: All-in-One Drenaje Hepato-Biliar & Calma'
    },
    apisCount: 10,
    apis: [
      'Artichoke Extract 300mg', 'Copper Bisglycinate 2mg', 'Vitamin B5 100mg', 'Vitamin A 2500IU',
      'Vitamin E 100IU', 'Taurine 250mg', 'Silybin 140mg', 'Valerian Root 300mg',
      'Vitamin B12 500mcg', 'N-Acetylcysteine 250mg'
    ],
    brazilFinalBrl: { caps30: 138.00, caps60: 222.00 },
    bulgariaBenchmarkEur: { caps30: 27.00, caps60: 42.00 },
    notes: {
      en: 'Balanced combination of hepatic support with nighttime neurotransmission.',
      es: 'Combinación balanceada de soporte hepático con neurotransmisión nocturna.'
    }
  },
  {
    id: 'orc-7',
    number: 7,
    title: {
      en: 'Quote 7: All-in-One Methylation & Valerian Sleep',
      es: 'Orçamento 7: All-in-One Metilación Básica & Valeriana'
    },
    apisCount: 7,
    apis: [
      'Vitamin D3 2000IU', 'Vitamin C 200mg', 'Zinc Gluconate 15mg', 'Vitamin B9 (Methylfolate) 400mcg',
      'Omega 3 300mg', 'N-Acetylcysteine 250mg', 'Taurine 250mg', 'Valerian Root 300mg'
    ],
    brazilFinalBrl: { caps30: 90.00, caps60: 135.00 },
    bulgariaBenchmarkEur: { caps30: 19.50, caps60: 31.00 },
    notes: {
      en: 'High-turnover core formula. Excellent margin across both origins.',
      es: 'Fórmula de entrada de gran rotación. Excelente margen en ambos orígenes.'
    }
  },
  {
    id: 'orc-8',
    number: 8,
    title: {
      en: 'Quote 8: All-in-One Gastrointestinal & Biointestil®',
      es: 'Orçamento 8: All-in-One Gastrointestinal & Biointestil®'
    },
    apisCount: 6,
    apis: [
      'Vitamin D3 3000IU', 'Curcumin (Cureit®) 250mg', 'Resveratrol 100mg',
      'Alpha Lipoic Acid 300mg', 'Valerian Root 300mg', 'Biointestil® (Fagron) 300mg'
    ],
    brazilFinalBrl: { caps30: 334.00, caps60: 619.00 },
    bulgariaBenchmarkEur: { caps30: 48.00, caps60: 82.00 },
    notes: {
      en: 'Biointestil® is a patented ginger and palmarosa phytotherapeutic extract from Brazil.',
      es: 'Biointestil® es un derivado fitoterápico de jengibre y palmarosa patentado en Brasil.'
    }
  },
  {
    id: 'orc-9',
    number: 9,
    title: {
      en: 'Quote 9: All-in-One Insulin Sensitivity & Myo-Inositol',
      es: 'Orçamento 9: All-in-One Sensibilidad a la Insulina & Mio-Inositol'
    },
    apisCount: 6,
    apis: [
      'Vitamin B12 1000mcg', 'Vitamin D 2000IU', 'Zinc Gluconate 15mg',
      'Omega 3 250mg', 'Taurine 250mg', 'Myo-Inositol 250mg'
    ],
    brazilFinalBrl: { caps30: 73.00, caps60: 95.00 },
    bulgariaBenchmarkEur: { caps30: 16.00, caps60: 25.00 },
    notes: {
      en: 'Highly cost-effective formula in Brazil: R$ 95 for 60 full days of therapy.',
      es: 'Fórmula muy asequible en Brasil: R$ 95 por 60 días completos de tratamiento.'
    }
  }
];

export default function UltramanCrossBorderStudyPage() {
  const [lang, setLang] = useState('en'); // 'en' | 'es' (Default: English)
  const [currency, setCurrency] = useState('EUR'); // 'EUR' | 'USD' | 'BRL'
  const [viewMode, setViewMode] = useState('all-in-one'); // 'all-in-one' | 'split'
  const [bottleSize, setBottleSize] = useState(60); // 30 | 60
  const [copiedLink, setCopiedLink] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isEs = lang === 'es';

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

  // ── 4 Executive KPIs (Google Cloud Console Standard) ────────────────────────
  const metrics = useMemo(() => {
    const allInOnePricesBrl = BRAZIL_ALL_IN_ONE_DATA.map(d => bottleSize === 30 ? d.brazilFinalBrl.caps30 : d.brazilFinalBrl.caps60);
    const allInOneBulgariaEur = BRAZIL_ALL_IN_ONE_DATA.map(d => bottleSize === 30 ? d.bulgariaBenchmarkEur.caps30 : d.bulgariaBenchmarkEur.caps60);

    const avgBrl = allInOnePricesBrl.reduce((a, b) => a + b, 0) / allInOnePricesBrl.length;
    const avgBulgariaEur = allInOneBulgariaEur.reduce((a, b) => a + b, 0) / allInOneBulgariaEur.length;

    const convertedAvgBrl = convertPrice(avgBrl, 'BRL');
    const convertedAvgBulgaria = convertPrice(avgBulgariaEur, 'EUR');
    const avgDelta = Math.round(((convertedAvgBrl - convertedAvgBulgaria) / convertedAvgBulgaria) * 100);

    return {
      avgBrazil: convertedAvgBrl,
      avgBulgaria: convertedAvgBulgaria,
      avgDelta,
      totalFormulas: BRAZIL_ALL_IN_ONE_DATA.length + BRAZIL_SPLIT_DATA.length
    };
  }, [bottleSize, currency]);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* ── Responsive Mobile Styles (Google Cloud Console UX) ─────────────── */}
      <style>{`
        .ultraman-card-grid {
          display: grid;
          grid-template-columns: minmax(280px, 1fr) auto auto auto;
          align-items: center;
          gap: 20px;
        }
        .ultraman-pricing-group {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        @media (max-width: 768px) {
          .ultraman-card-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
            padding: 16px 14px !important;
          }
          .ultraman-pricing-group {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 12px !important;
            width: 100% !important;
            border-top: 1px solid #e2e8f0;
            padding-top: 12px;
          }
          .ultraman-pricing-col {
            text-align: left !important;
            padding-left: 0 !important;
            border-left: none !important;
          }
          .ultraman-delta-badge {
            grid-column: 1 / -1;
            text-align: left !important;
          }
          .ultraman-hero-section {
            padding: 24px 14px !important;
          }
          .ultraman-main-container {
            padding: 20px 14px 60px 14px !important;
          }
          .ultraman-header-inner {
            height: 48px !important;
            padding: 0 12px !important;
            flex-wrap: nowrap !important;
          }
          .ultraman-desktop-header-controls {
            display: none !important;
          }
          .ultraman-mobile-header-controls {
            display: flex !important;
          }
          .ultraman-brand-badge {
            display: none !important;
          }
          .ultraman-controls-bar {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .ultraman-kpi-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 10px !important;
          }
        }
        @media (max-width: 480px) {
          .ultraman-kpi-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* ── Top Header Navigation (Google Cloud UX: 48px sticky single-row) ── */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 30, height: 48 }}>
        <div className="ultraman-header-inner" style={{ maxWidth: 1200, margin: '0 auto', height: 48, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
            <Link 
              href="/admin/prescriptions"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: '#475569', textDecoration: 'none', padding: '4px 8px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', flexShrink: 0 }}
              title={isEs ? 'Volver al Desk' : 'Back to Desk'}
            >
              <ArrowLeft size={13} />
              <span>{isEs ? 'Desk' : 'Desk'}</span>
            </Link>
            <span style={{ height: 16, width: 1, background: '#cbd5e1', flexShrink: 0 }} />
            <span className="ultraman-brand-badge" style={{ fontSize: '0.66rem', fontWeight: 800, background: '#003666', color: '#ffffff', padding: '2px 6px', borderRadius: 4, flexShrink: 0 }}>
              ATLAS CLINICAL
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 750, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {isEs ? 'Estudio Ultraman™' : 'Ultraman™ Study'}
            </span>
          </div>

          {/* Desktop Controls (≥769px) */}
          <div className="ultraman-desktop-header-controls" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {/* Language toggle */}
            <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: 2, borderRadius: 6, border: '1px solid #cbd5e1' }}>
              {[
                { code: 'en', label: 'EN' },
                { code: 'es', label: 'ES' }
              ].map(({ code, label }) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLang(code)}
                  style={{
                    border: 'none',
                    background: lang === code ? '#003666' : 'transparent',
                    color: lang === code ? '#ffffff' : '#475569',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 4,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Currency selector */}
            <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: 2, borderRadius: 6, border: '1px solid #cbd5e1' }}>
              {['EUR', 'USD', 'BRL'].map((cur) => (
                <button
                  key={cur}
                  type="button"
                  onClick={() => setCurrency(cur)}
                  style={{
                    border: 'none',
                    background: currency === cur ? '#003666' : 'transparent',
                    color: currency === cur ? '#ffffff' : '#475569',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: 4,
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
                gap: 5,
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: '0.74rem',
                fontWeight: 650,
                color: '#334155',
                cursor: 'pointer',
                height: 30
              }}
            >
              {copiedLink ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
              <span>{copiedLink ? (isEs ? 'Copiado' : 'Copied') : (isEs ? 'Compartir' : 'Share')}</span>
            </button>
          </div>

          {/* Mobile Controls (<768px: Currency Pill + More Menu) */}
          <div className="ultraman-mobile-header-controls" style={{ display: 'none', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {/* 1-Tap Currency Switcher */}
            <button
              type="button"
              onClick={() => setCurrency(currency === 'EUR' ? 'USD' : currency === 'USD' ? 'BRL' : 'EUR')}
              style={{
                height: 30,
                padding: '0 8px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                color: '#003666',
                fontSize: '0.74rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3
              }}
              title="Change currency"
            >
              <span>{currency}</span>
              <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>▾</span>
            </button>

            {/* Mobile More Actions Trigger */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(prev => !prev)}
                aria-label="More options"
                style={{
                  width: 30,
                  height: 30,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 6,
                  border: isMobileMenuOpen ? '1px solid #003666' : '1px solid #cbd5e1',
                  background: isMobileMenuOpen ? '#eff6ff' : '#ffffff',
                  color: '#334155',
                  cursor: 'pointer'
                }}
              >
                <MoreVertical size={15} />
              </button>

              {isMobileMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '36px',
                    background: '#ffffff',
                    border: '1px solid #dadce0',
                    borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                    padding: '6px',
                    minWidth: '180px',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3
                  }}
                >
                  {/* Share button */}
                  <button
                    type="button"
                    onClick={() => { setIsMobileMenuOpen(false); handleCopyLink(); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: 'none',
                      background: 'transparent',
                      color: '#1e293b',
                      fontSize: '0.78rem',
                      fontWeight: 650,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <Copy size={13} color="#0284c7" />
                    <span>{isEs ? 'Compartir Estudio' : 'Share Study'}</span>
                  </button>

                  <div style={{ height: 1, background: '#e2e8f0', margin: '3px 0' }} />

                  {/* Language Switch */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 650 }}>{isEs ? 'Idioma' : 'Language'}</span>
                    <div style={{ display: 'flex', gap: 3 }}>
                      <button
                        type="button"
                        onClick={() => { setLang('en'); setIsMobileMenuOpen(false); }}
                        style={{
                          border: 'none',
                          background: lang === 'en' ? '#003666' : '#f1f5f9',
                          color: lang === 'en' ? '#ffffff' : '#475569',
                          padding: '2px 7px',
                          borderRadius: 4,
                          fontSize: '0.70rem',
                          fontWeight: 750,
                          cursor: 'pointer'
                        }}
                      >
                        EN
                      </button>
                      <button
                        type="button"
                        onClick={() => { setLang('es'); setIsMobileMenuOpen(false); }}
                        style={{
                          border: 'none',
                          background: lang === 'es' ? '#003666' : '#f1f5f9',
                          color: lang === 'es' ? '#ffffff' : '#475569',
                          padding: '2px 7px',
                          borderRadius: 4,
                          fontSize: '0.70rem',
                          fontWeight: 750,
                          cursor: 'pointer'
                        }}
                      >
                        ES
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero Banner: Executive Pitch ─────────────────────────────────── */}
      <section className="ultraman-hero-section" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)', borderBottom: '1px solid #e2e8f0', padding: '40px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: 20, fontSize: '0.76rem', fontWeight: 700, marginBottom: 16 }}>
            <Globe size={14} /> {isEs ? 'BENCHMARK DE FORMULACIÓN MAGISTRAL · ARQUITECTURA MULTI-PROVEEDOR' : 'CROSS-BORDER COMPOUNDING BENCHMARK · MULTI-SUPPLIER ARCHITECTURE'}
          </div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#002040', margin: '0 0 12px 0', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Ultraman™ Longevity Line: Brazil vs. Bulgaria (Pharmapolis)
          </h1>
          <p style={{ fontSize: '1.02rem', color: '#475569', maxWidth: 860, lineHeight: 1.6, margin: '0 0 24px 0' }}>
            {isEs ? (
              <>
                Comparativa <em>apples-to-apples</em> entre dos centros de formulación magistral independientes para la misma línea clínica de micronutrición. 
                <strong> Brasil</strong> ofrece cotizaciones con <em>precio final cerrado</em> (materia prima, elaboración galénica y envase incluidos). 
                <strong> Pharmapolis (Bulgaria)</strong> opera bajo el modelo europeo <em>CAT-CAP v1.1</em> con producción cGMP y tarifas por componente.
              </>
            ) : (
              <>
                An <em>apples-to-apples</em> pharmacoeconomic benchmark between two independent compounding formulation hubs for the exact same clinical micronutrition line. 
                <strong> Brazil</strong> provides quotes with <em>closed final pharmacy pricing</em> (APIs, galenic compounding labor, and primary packaging integrated). 
                <strong> Pharmapolis (Bulgaria)</strong> operates under the European <em>CAT-CAP v1.1</em> standard with cGMP manufacturing and itemized component-based fees.
              </>
            )}
          </p>

          {/* Golden Rules Callout */}
          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderLeft: '5px solid #003666', borderRadius: 8, padding: '14px 18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
                {isEs ? 'Independencia de Proveedores' : 'Supplier Independence'}
              </div>
              <div style={{ fontSize: '0.86rem', color: '#0f172a', marginTop: 3 }}>
                {isEs ? (
                  <><strong>Cero interacción</strong>: Los cálculos de Bulgaria y Brasil no se mezclan. Son proveedores independientes para distintas geografías del cliente.</>
                ) : (
                  <><strong>Zero overlap</strong>: Bulgaria and Brazil calculations are completely segregated. They represent independent suppliers tailored to distinct client geographies.</>
                )}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
                {isEs ? 'Modelo de Coste Brasileño' : 'Brazilian Cost Model'}
              </div>
              <div style={{ fontSize: '0.86rem', color: '#0f172a', marginTop: 3 }}>
                {isEs ? (
                  <>Los importes de Brasil corresponden al <strong>precio final de farmacia</strong> con mano de obra y envasado ya integrados.</>
                ) : (
                  <>Brazil figures reflect <strong>final compounding pharmacy quotes</strong> with labor and primary packaging already fully integrated.</>
                )}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
                {isEs ? 'Tipo de Cambio Referencial' : 'Reference Exchange Rates'}
              </div>
              <div style={{ fontSize: '0.86rem', color: '#0f172a', marginTop: 3 }}>
                <strong>1 EUR = 6.10 BRL</strong> · <strong>1 USD = 5.65 BRL</strong> {isEs ? '(Permite comparar en paridad de poder adquisitivo).' : '(Enables purchasing power parity benchmarking).'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Dashboard Content ────────────────────────────────────────── */}
      <main className="ultraman-main-container" style={{ maxWidth: 1200, margin: '0 auto', padding: '30px 20px 80px 20px' }}>
        
        {/* ── 4 Executive KPI Cards (Google Cloud Console Standard) ─────────── */}
        <div className="ultraman-kpi-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
          marginBottom: 24
        }}>
          {/* KPI 1 */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isEs ? 'Coste Medio Brasil (All-in-One)' : 'Brazil Average Cost (All-in-One)'}
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 2px 0' }}>
              {formatMoney(metrics.avgBrazil)}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
              {isEs ? `Ciclo de ${bottleSize} Cápsulas · Mano de obra y envase incluidos` : `Cycle of ${bottleSize} Capsules · Compounding labor & packaging included`}
            </div>
          </div>

          {/* KPI 2 */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isEs ? 'Benchmark Bulgaria (CAT-CAP)' : 'Bulgaria Benchmark (CAT-CAP)'}
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 2px 0' }}>
              {formatMoney(metrics.avgBulgaria)}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
              {isEs ? 'Farmacia Pharmapolis · Modelo cGMP Europeo' : 'Pharmapolis Compounding Pharmacy · European cGMP Standard'}
            </div>
          </div>

          {/* KPI 3 */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isEs ? 'Diferencial All-in-One' : 'All-in-One Differential'}
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: metrics.avgDelta <= 0 ? '#16a34a' : '#d97706', margin: '4px 0 2px 0' }}>
              {metrics.avgDelta <= 0 ? `-${Math.abs(metrics.avgDelta)}%` : `+${metrics.avgDelta}%`}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
              {metrics.avgDelta <= 0 
                ? (isEs ? 'Ventaja galénica en preparados concentrados' : 'Galenic advantage in concentrated formulas') 
                : (isEs ? 'Paridad según volumen activo' : 'Volume-dependent parity')}
            </div>
          </div>

          {/* KPI 4 */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isEs ? 'Formulaciones Auditadas' : 'Formulations Audited'}
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 2px 0' }}>
              {metrics.totalFormulas} {isEs ? 'Fórmulas' : 'Formulas'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
              {isEs ? '9 Lotes All-in-One + 7 Régimen Separado' : '9 All-in-One Batches + 7 Split Regimens'}
            </div>
          </div>
        </div>

        {/* Toggle Controls: View Mode & Bottle Duration */}
        <div className="ultraman-controls-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          
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
              <Pill size={16} /> {isEs ? 'Batch B: All-in-One (Orçamentos 1 a 9)' : 'Batch B: All-in-One (Quotes 1 to 9)'}
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
              <Layers size={16} /> {isEs ? 'Batch A: Split Mañana / Noche (Prescrições 1 a 7)' : 'Batch A: Split Day / Night (Prescriptions 1 to 7)'}
            </button>
          </div>

          {/* Bottle size switch */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
              {isEs ? 'Ciclo de Dispensación:' : 'Dispensing Cycle:'}
            </span>
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
                {isEs ? '30 Dosis (1 Mes)' : '30 Doses (1 Month)'}
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
                {isEs ? '60 Dosis (2 Meses)' : '60 Doses (2 Months)'}
              </button>
            </div>
          </div>
        </div>

        {/* ── View 1: All-in-One Formulations (Batch B) ────────────────────── */}
        {viewMode === 'all-in-one' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '12px 16px', fontSize: '0.82rem', color: '#1e40af' }}>
              💡 <strong>{isEs ? 'Ventaja Galénica All-in-One' : 'All-in-One Galenic Advantage'}</strong>: {isEs 
                ? 'Al concentrar todos los activos en un único preparado diario, la farmacia brasileña reduce hasta un 45% el coste operativo y de envases en comparación con frascos separados.'
                : 'By consolidating all active ingredients into a single daily formulation, the Brazilian pharmacy achieves up to a 45% reduction in operational and packaging costs compared to separate bottles.'}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
              {BRAZIL_ALL_IN_ONE_DATA.map((orc) => {
                const brlVal = bottleSize === 30 ? orc.brazilFinalBrl.caps30 : orc.brazilFinalBrl.caps60;
                const convertedBrl = convertPrice(brlVal, 'BRL');
                const bulgariaEurVal = bottleSize === 30 ? orc.bulgariaBenchmarkEur.caps30 : orc.bulgariaBenchmarkEur.caps60;
                const convertedBulgaria = convertPrice(bulgariaEurVal, 'EUR');
                const deltaPercent = Math.round(((convertedBrl - convertedBulgaria) / convertedBulgaria) * 100);

                const currentTitle = isEs ? (orc.title.es || orc.title) : (orc.title.en || orc.title);
                const currentNote = isEs ? (orc.notes.es || orc.notes) : (orc.notes.en || orc.notes);

                return (
                  <div
                    key={orc.id}
                    className="ultraman-card-grid"
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 10,
                      padding: '18px 20px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: 4 }}>
                          {orc.apisCount} {isEs ? 'PRINCIPIOS ACTIVOS' : 'ACTIVE INGREDIENTS'}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          {isEs ? `Ciclo de ${bottleSize} Cápsulas` : `Cycle of ${bottleSize} Capsules`}
                        </span>
                      </div>
                      <h3 style={{ margin: '0 0 6px 0', fontSize: '1.02rem', fontWeight: 700, color: '#0f172a' }}>
                        {currentTitle}
                      </h3>
                      <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
                        {orc.apis.join(' · ')}
                      </div>
                      {currentNote && (
                        <div style={{ fontSize: '0.72rem', color: '#0369a1', marginTop: 6, fontStyle: 'italic' }}>
                          ℹ️ {currentNote}
                        </div>
                      )}
                    </div>

                    <div className="ultraman-pricing-group">
                      {/* Brazil Final Quote */}
                      <div className="ultraman-pricing-col" style={{ textAlign: 'right', minWidth: 120 }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>
                          🇧🇷 {isEs ? 'Brasil (Final)' : 'Brazil (Final)'}
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                          {formatMoney(convertedBrl)}
                        </div>
                        <div style={{ fontSize: '0.70rem', color: '#64748b' }}>
                          {currency !== 'BRL' && `R$ ${brlVal.toFixed(2)}`}
                        </div>
                      </div>

                      {/* Bulgaria Pharmapolis Benchmark */}
                      <div className="ultraman-pricing-col" style={{ textAlign: 'right', minWidth: 130, borderLeft: '1px solid #e2e8f0', paddingLeft: 16 }}>
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
                      <div className="ultraman-delta-badge" style={{ minWidth: 110, textAlign: 'center' }}>
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
                          {deltaPercent <= 0 
                            ? (isEs ? `Brasil ${Math.abs(deltaPercent)}% más bajo` : `Brazil ${Math.abs(deltaPercent)}% lower`) 
                            : (isEs ? `Bulgaria ${deltaPercent}% más bajo` : `Bulgaria ${deltaPercent}% lower`)}
                        </span>
                      </div>
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
              ⚖️ <strong>{isEs ? 'Régimen Cronobiológico Separado (Mañana & Noche)' : 'Chronobiological Split Regimen (Morning & Night)'}</strong>: {isEs 
                ? 'Requiere 2 botes independientes por ciclo para separar nutrientes energizantes de cofactores de relajación nocturna (Valeriana, Melatonina, NAC).'
                : 'Requires 2 independent bottles per cycle to separate daytime energizing nutrients from nighttime relaxation cofactors (Valerian, Melatonin, NAC).'}
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

                const currentTitle = isEs ? (rx.title.es || rx.title) : (rx.title.en || rx.title);
                const currentFocus = isEs ? (rx.focus.es || rx.focus) : (rx.focus.en || rx.focus);

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
                          {isEs ? `PRESCRIÇÃO ${rx.number}` : `PRESCRIPTION ${rx.number}`}
                        </span>
                        <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#0f172a' }}>
                          {currentTitle}
                        </h3>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                        {currentFocus}
                      </div>
                    </div>

                    {/* Body: 2 Columns (Morning vs Night) */}
                    <div style={{ padding: '16px 18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                      {/* Morning Box */}
                      <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 8, padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.76rem', fontWeight: 700, color: '#b45309' }}>
                            <Sun size={14} /> {isEs ? 'TOMA MAÑANA (MANHÃ)' : 'MORNING DOSE (MANHÃ)'}
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
                            <Moon size={14} /> {isEs ? 'TOMA NOCHE (NOITE)' : 'NIGHT DOSE (NOITE)'}
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
                        {isEs ? `Total Combinado 2 Frascos (${bottleSize} días):` : `Combined 2-Bottle Total (${bottleSize} days):`}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.70rem', color: '#64748b', display: 'block' }}>{isEs ? 'Total Brasil:' : 'Brazil Total:'}</span>
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
            {isEs ? 'Matriz de Decisión Estratégica para Ultraman™' : 'Strategic Sourcing Decision Matrix for Ultraman™'}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16a34a', fontWeight: 800, fontSize: '0.90rem', marginBottom: 8 }}>
                <CheckCircle2 size={18} /> {isEs ? '¿Cuándo Fabricar en Brasil?' : 'When to Manufacture in Brazil?'}
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.82rem', color: '#14532d', lineHeight: 1.6 }}>
                {isEs ? (
                  <>
                    <li><strong>Fórmulas All-in-One</strong>: Brasil ofrece un ahorro de entre 30% y 45% al empaquetar 7 a 10 activos en un solo bote.</li>
                    <li><strong>Pacientes en América Latina</strong>: Cero riesgo aduanero con ANVISA y envíos exprés locales.</li>
                    <li><strong>Patentes exclusivas Fagron Brasil</strong>: Acceso directo a Mitocondrin®, Miodesin®, Biointestil® y CitruSiM® sin recargo de importación transatlántica.</li>
                  </>
                ) : (
                  <>
                    <li><strong>All-in-One Formulations</strong>: Brazil delivers 30% to 45% savings when packaging 7 to 10 active ingredients in a single daily bottle.</li>
                    <li><strong>Latin American Patients</strong>: Zero customs barriers under ANVISA compliance and direct domestic express dispatch.</li>
                    <li><strong>Exclusive Fagron Brazil Patents</strong>: Direct access to Mitocondrin®, Miodesin®, Biointestil®, and CitruSiM® without transatlantic import surcharges.</li>
                  </>
                )}
              </ul>
            </div>

            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0284c7', fontWeight: 800, fontSize: '0.90rem', marginBottom: 8 }}>
                <CheckCircle2 size={18} /> {isEs ? '¿Cuándo Fabricar en Bulgaria (Pharmapolis)?' : 'When to Manufacture in Bulgaria (Pharmapolis)?'}
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.82rem', color: '#0c4a6e', lineHeight: 1.6 }}>
                {isEs ? (
                  <>
                    <li><strong>Pacientes en Emiratos Árabes Unidos (EAU) y Europa</strong>: Tránsito de 48–72h con trazabilidad EU GMP y sin aranceles de importación de ultramar.</li>
                    <li><strong>Antioxidantes de Alta Gama</strong>: Glutatión reducido, Trans-Resveratrol 98%, Astaxantina 5% y CoQ10 Kaneka con arancel cero de la UE.</li>
                    <li><strong>Cumplimiento de Monografías USP / Ph. Eur.</strong>: Certificado analítico de liberación de lote por lote.</li>
                  </>
                ) : (
                  <>
                    <li><strong>UAE & European Patients</strong>: 48–72h transit with EU GMP traceability and zero overseas import tariffs.</li>
                    <li><strong>High-End Antioxidants</strong>: Reduced Glutathione, Trans-Resveratrol 98%, Astaxanthin 5%, and Kaneka CoQ10 with zero EU import tariff penalties.</li>
                    <li><strong>USP / Ph. Eur. Monograph Compliance</strong>: Batch-by-batch certified analytical release (CoA).</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '24px 20px', textAlign: 'center', fontSize: '0.78rem', color: '#64748b' }}>
        {isEs 
          ? 'Atlas Clinical Intelligence Platform · Global Compounding Sourcing Architecture · Generado para Ultraman™ Precision Supplements'
          : 'Atlas Clinical Intelligence Platform · Global Compounding Sourcing Architecture · Generated for Ultraman™ Precision Supplements'}
      </footer>
    </div>
  );
}
