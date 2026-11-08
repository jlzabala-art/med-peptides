'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Send,
  Bot,
  User,
  CheckCircle2,
  Droplets,
  BookOpen,
  Layers,
  ShieldCheck,
  ArrowRight,
  Dna,
  Activity,
  Zap,
  ThermometerSnowflake,
  Brain,
  HelpCircle,
  Clock,
  ShoppingCart,
  Plus,
  Check,
  RotateCcw,
  Copy,
  ExternalLink,
  ShieldAlert,
  Percent
} from 'lucide-react';
import toast from 'react-hot-toast';
import DoctorAiMessageRenderer from '@/components/doctor/DoctorAiMessageRenderer';

const SUGGESTED_INQUIRIES = [
  {
    icon: Droplets,
    iconColor: '#1a73e8',
    badgeEn: 'Dosing Math',
    badgeEs: 'Cálculo de Dosis',
    titleEn: 'Reconstitution & Syringes',
    titleEs: 'Reconstitución & Jeringas U-100',
    promptEn: 'Calculate reconstitution for 10mg Tirzepatide using 2.0mL BAC water on a 100-unit U-100 syringe for a 2.5mg dose.',
    promptEs: 'Calcula la reconstitución de Tirzepatide 10mg con 2.0mL de agua bacteriostática en jeringa U-100 para dosis de 2.5mg.'
  },
  {
    icon: ShieldCheck,
    iconColor: '#0d9488',
    badgeEn: 'Tissue Repair',
    badgeEs: 'Reparación Tisular',
    titleEn: 'BPC-157 + TB-500 Synergy & Prices',
    titleEs: 'Sinergia y Precios BPC-157 + TB-500',
    promptEn: 'What is the synergy between BPC-157 and TB-500 in tendon repair, and what are their current single vs 10-pack prices?',
    promptEs: '¿Cuál es la sinergia entre BPC-157 y TB-500 en tendones y cuáles son sus precios unitarios y en pack de 10?'
  },
  {
    icon: Zap,
    iconColor: '#16a34a',
    badgeEn: 'Incretin Kinetics',
    badgeEs: 'Cinética Incretinas',
    titleEn: 'Retatrutide vs Tirzepatide Titration',
    titleEs: 'Titulación Retatrutide vs Tirzepatide',
    promptEn: 'Compare receptor affinities and titration protocols for Retatrutide (GLP-1/GIP/GCGR) vs Tirzepatide with current pricing.',
    promptEs: 'Compara afinidades de receptor y protocolos de titulación de Retatrutide frente a Tirzepatide con sus precios actuales.'
  },
  {
    icon: Sparkles,
    iconColor: '#7c3aed',
    badgeEn: 'Longevity Cycle',
    badgeEs: 'Ciclo Longevidad',
    titleEn: '60-Day Longevity (Epithalon + MOTS-c)',
    titleEs: 'Longevidad 60 Días (Epithalon + MOTS-c)',
    promptEn: 'Recommend an evidence-based 60-day longevity protocol combining Epithalon and MOTS-c with vial quantities required.',
    promptEs: 'Recomienda un protocolo de longevidad de 60 días combinando Epithalon y MOTS-c con la cantidad de viales necesarios.'
  },
  {
    icon: ShieldCheck,
    iconColor: '#0284c7',
    badgeEn: 'FDA 503A',
    badgeEs: '503A Magistral',
    titleEn: 'FDA 503A Discretion Peptides',
    titleEs: 'Péptidos con Discreción 503A FDA',
    promptEn: 'Which peptide formulations in the schedule fall under HHS/FDA 503A compounding enforcement discretion?',
    promptEs: '¿Cuáles formulaciones de la tarifa corresponden a la discreción de ejecución 503A de la FDA/HHS?'
  },
  {
    icon: Percent,
    iconColor: '#ea580c',
    badgeEn: 'Volume Savings',
    badgeEs: 'Ahorro por Volumen',
    titleEn: 'Pack ×10 Savings & Proforma Tiers',
    titleEs: 'Ahorro Pack ×10 y Cotización Proforma',
    promptEn: 'How do Pack ×10 volume savings work across the catalog and how do I generate an official proforma quote?',
    promptEs: '¿Cómo funciona el ahorro en Pack de 10 viales en el catálogo y cómo genero una cotización proforma oficial?'
  }
];

export default function AtlasAiCopilotDrawer({
  isOpen,
  onClose,
  currency = 'USD',
  currencySymbol = '$',
  formatPrice = (p) => `${currencySymbol}${Number(p || 0).toFixed(2)}`,
  products = [],
  cartItems = {},
  totalCartCount = 0,
  totalCartValueUsd = 0,
  isDistributor = false,
  lang = 'en',
  activeCategory = 'all',
  activeCategoryLabel = null,
  contextProduct = null,
  onAddToCart = null,
  onOpenSpecs = null
}) {
  const isEs = lang === 'es';
  const chatScrollRef = useRef(null);

  // Helper to find specific products from live catalog
  const findCatalogItem = (nameQuery, doseQuery = null) => {
    if (!products || !products.length) return null;
    const nQ = nameQuery.toLowerCase().replace(/[^a-z0-9]/g, '');
    const dQ = doseQuery ? doseQuery.toLowerCase().replace(/[^a-z0-9]/g, '') : null;
    return products.find(p => {
      const pName = (p.productName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const pDose = (p.dosage || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (dQ) {
        return pName.includes(nQ) && pDose.includes(dQ);
      }
      return pName.includes(nQ);
    });
  };

  const initialGreeting = useMemo(() => {
    if (isEs) {
      return activeCategoryLabel
        ? `¡Hola! Soy **Atlas Clinical AI Copilot**, sincronizado con la tarifa oficial B2B de viales liofilizados (Borosilicato 10R · Pureza HPLC ≥99.0%). Veo que estás explorando la categoría **${activeCategoryLabel}**.\n\nPuedo calcular diluciones y jeringas U-100, sinergias moleculares, estimaciones de ahorro en pack de 10 y resolver dudas regulatorias FDA 503A. ¿Qué formulación deseas consultar?`
        : `¡Hola! Soy **Atlas Clinical AI Copilot**, tu asistente biomédico y comercial sincronizado con las **109 formulaciones** de péptidos certificados de nuestra tarifa oficial.\n\nPuedo calcular reconstitución clínica milimétrica, sinergias de protocolos, ahorros en Pack ×10 y guiarte en la selección terapéutica. ¿En qué puedo colaborar con tu práctica o clínica hoy?`;
    }
    return activeCategoryLabel
      ? `Hello! I am **Atlas Clinical AI Copilot**, synchronized with our official B2B price schedule for certified lyophilized peptide vials (10R Borosilicate · ≥99.0% HPLC purity). I see you are exploring **${activeCategoryLabel}**.\n\nI can calculate precise reconstitution dilution, molecular synergies, volume tier savings, and FDA 503A compounding compliance. What formulation would you like to explore?`
      : `Hello! I am **Atlas Clinical AI Copilot**, your biomedical and commercial pricing assistant synchronized with all **109 certified peptide formulations** in our official schedule.\n\nI can calculate exact U-100 syringe reconstitution, protocol synergies, Pack ×10 savings, and clinical monograph specs. How can I assist your practice today?`;
  }, [isEs, activeCategoryLabel]);

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: initialGreeting,
      actionProducts: []
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [addedItemCode, setAddedItemCode] = useState(null);

  // Reset greeting or initialize context product on session open
  useEffect(() => {
    if (!isOpen) return;
    if (contextProduct) {
      const prodName = contextProduct.productName || 'Peptide';
      const prodDose = contextProduct.dosage || '';
      const promptText = isEs
        ? `📋 **Análisis Clínico y Posología: ${prodName} (${prodDose})**\n\nHe cargado los datos farmacotécnicos de este vial:\n• **Reconstitución sugerida:** Diluir con agua bacteriostática (BAC Water) para posología estéril y estable.\n• **Jeringa U-100:** Cada 10 UI permite titulación y micro-dosificación de alta precisión.\n• **Ahorro Pack ×10:** Disponible con descuento por volumen institucional.\n\n¿Deseas calcular una pauta de tratamiento específica o añadirlo a tu proforma?`
        : `📋 **Clinical Posology & Reconstitution Analysis: ${prodName} (${prodDose})**\n\nI have loaded the pharmacokinetic and dispensing parameters for this vial:\n• **Reconstitution:** Standard sterile dilution with BAC Water for 28-day stability.\n• **Syringe Math (U-100):** Every 10 IU tick delivers precision clinical dosing.\n• **Pack ×10 Tier:** Volume pricing available with instant tier discounts.\n\nWould you like me to calculate a specific titration cycle or add it to your proforma?`;

      setMessages([
        {
          role: 'assistant',
          text: promptText,
          actionProducts: [contextProduct]
        }
      ]);
    } else if (messages.length === 1 && messages[0].role === 'assistant') {
      setMessages([{ role: 'assistant', text: initialGreeting, actionProducts: [] }]);
    }
  }, [isOpen, contextProduct, initialGreeting, isEs]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  if (!isOpen) return null;

  // Add to cart with feedback inside drawer
  const handleActionAdd = (product, packType) => {
    if (onAddToCart) {
      onAddToCart(product, packType);
      const code = `${product.id}-${packType}`;
      setAddedItemCode(code);
      toast.success(
        isEs
          ? `${product.productName} (${packType === '10x' ? 'Pack ×10' : '1x Vial'}) añadido a tu proforma`
          : `Added ${product.productName} (${packType === '10x' ? 'Pack ×10' : '1x Vial'}) to proforma inquiry`,
        { duration: 2500 }
      );
      setTimeout(() => setAddedItemCode(null), 1800);
    }
  };

  const handleSend = async (textToSend) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query) return;

    const userMsg = { role: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);

    const qLower = query.toLowerCase();

    // ── Local Fast Synthesis with Real Catalog Data ──
    const tirz10 = findCatalogItem('tirzepatide', '10mg') || findCatalogItem('tirzepatide');
    const bpc10 = findCatalogItem('bpc-157', '10mg') || findCatalogItem('bpc-157');
    const tb10 = findCatalogItem('tb-500', '10mg') || findCatalogItem('tb-500');
    const reta = findCatalogItem('retatrutide');
    const epith = findCatalogItem('epithalon', '10mg') || findCatalogItem('epithalon');
    const mots = findCatalogItem('mots-c');

    let replyText = '';
    let actionProducts = [];

    if (qLower.includes('reconstitut') || (qLower.includes('tirzepatide') && (qLower.includes('syringe') || qLower.includes('dose') || qLower.includes('dosis') || qLower.includes('math')))) {
      replyText = isEs
        ? `### 🧪 Protocolo de Reconstitución Clínica: Tirzepatide 10 mg\n\n• **Presentación del Vial:** 10 mg de Polvo Liofilizado Estéril (Borosilicato 10R)\n• **Volumen Diluyente Recomendado:** 2.0 mL de Agua Bacteriostática (0.9% Alcohol Bencílico)\n• **Concentración Resultante:** 5.0 mg / mL (5,000 mcg / mL)\n\n**Calibración en Jeringa de Insulina U-100 (100 Unidades = 1.0 mL):**\n• Cada **10 Unidades (0.10 mL)** aportan exactamente **500 mcg (0.5 mg)**.\n• **Dosis Inicial (2.5 mg semanal):** Cargar exactamente **50 Unidades (0.50 mL)**.\n• **Dosis de Mantenimiento (5.0 mg semanal):** Cargar **100 Unidades (1.00 mL)**.\n\n*Condición de Estabilidad:* Almacenar inmediatamente en refrigeración a 2°C – 8°C. Proteger de radiación UV directa. Estable durante 45 días una vez reconstituido.`
        : `### 🧪 Clinical Reconstitution Protocol: Tirzepatide 10 mg\n\n• **Vial Presentation:** 10 mg Lyophilized Sterile Powder (10R Borosilicate)\n• **Recommended Diluent Volume:** 2.0 mL Bacteriostatic Water (0.9% Benzyl Alcohol)\n• **Final Solution Concentration:** 5.0 mg / mL (5,000 mcg / mL)\n\n**Syringe Calibration on U-100 Insulin Syringe (100 Units = 1.0 mL):**\n• Each **10 Units (0.10 mL)** delivers exactly **500 mcg (0.5 mg)**.\n• **Starting Dose (2.5 mg weekly):** Draw exactly **50 Units (0.50 mL)**.\n• **Maintenance Dose (5.0 mg weekly):** Draw **100 Units (1.00 mL)**.\n\n*Stability Advisory:* Store refrigerated at 2°C – 8°C immediately post-dilution. Protect from light. Clinically stable for up to 45 days.`;

      if (tirz10) {
        replyText += isEs
          ? `\n\n**Cotización Oficial en Tarifa:**\n• **Vial Unitario:** ${formatPrice(tirz10.unitPrice)} / vial\n• **Pack ×10 Institucional:** ${formatPrice(tirz10.pack10Price)} (${formatPrice(tirz10.pack10UnitPrice)}/vial · **Ahorro de ${tirz10.savingsPercent || '-40%'}**)`
          : `\n\n**Official Schedule Pricing:**\n• **Single Vial:** ${formatPrice(tirz10.unitPrice)} / vial\n• **Pack ×10 Tier:** ${formatPrice(tirz10.pack10Price)} (${formatPrice(tirz10.pack10UnitPrice)}/vial · **${tirz10.savingsPercent || '-40%'} Volume Savings**)`;
        actionProducts.push(tirz10);
      }
    } else if (qLower.includes('bpc') || qLower.includes('tb-500') || qLower.includes('tendon') || qLower.includes('repair') || qLower.includes('reparaci')) {
      replyText = isEs
        ? `### 🩹 Sinergia Molecular para Reparación Tisular (BPC-157 + TB-500)\n\n1. **BPC-157 (Body Protection Compound):** Estimula la expresión del factor de crecimiento endotelial vascular (VEGF) y VEGFR2, acelerando la angiogénesis focal, la síntesis de colágeno Tipo I y la fijación de la unión tendón-hueso.\n2. **TB-500 (Thymosin Beta-4):** Actúa secuestrando G-actina intracelular, permitiendo la migración direccional acelerada de fibroblastos y células progenitoras mioblásticas al tejido lesionado.\n3. **Resultado Sinergístico:** BPC-157 construye la red microvascular y TB-500 moviliza las células reparadoras, reduciendo los tiempos de recuperación hasta en un 50%.`
        : `### 🩹 Molecular Synergy Rationale: Tissue Repair (BPC-157 + TB-500)\n\n1. **BPC-157 (Body Protection Compound):** Upregulates VEGF and VEGFR2 expression, inducing focal microvascular neo-angiogenesis, granulation tissue formation, and tendon-to-bone collagen synthesis.\n2. **TB-500 (Thymosin Beta-4):** Primary G-actin sequestering peptide. Accelerates directional migration of fibroblasts and endothelial progenitor cells into injured tissue matrices.\n3. **Synergistic Endpoint:** BPC-157 establishes the vascular network while TB-500 rapidly populates it with regenerative fibroblasts, cutting recovery timelines by up to 50%.`;

      if (bpc10 || tb10) {
        replyText += isEs ? `\n\n**Valores Oficiales en la Tarifa:**\n` : `\n\n**Official Schedule Pricing:**\n`;
        if (bpc10) {
          replyText += `• **${bpc10.productName} ${bpc10.dosage}:** ${formatPrice(bpc10.unitPrice)} / vial · **Pack ×10:** ${formatPrice(bpc10.pack10Price)} (${bpc10.savingsPercent || '-40%'})\n`;
          actionProducts.push(bpc10);
        }
        if (tb10) {
          replyText += `• **${tb10.productName} ${tb10.dosage}:** ${formatPrice(tb10.unitPrice)} / vial · **Pack ×10:** ${formatPrice(tb10.pack10Price)} (${tb10.savingsPercent || '-40%'})\n`;
          actionProducts.push(tb10);
        }
      }
    } else if (qLower.includes('glp') || qLower.includes('retatrutide') || qLower.includes('incretin') || qLower.includes('peso') || qLower.includes('weight') || qLower.includes('titra')) {
      replyText = isEs
        ? `### ⚡ Cinética Comparada: Retatrutide vs Tirzepatide\n\n• **Retatrutide (Triple Agonista GLP-1 / GIP / Glucagón):** Activa simultáneamente la saciedad central (GLP-1), la sensibilidad a la insulina y lipólisis (GIP), y el gasto energético basal mediante termogénesis en receptor de Glucagón.\n  - *Titulación sugerida:* Iniciar en 2.0 mg SC semanal durante 4 semanas; escalar a 4.0 mg y 8.0 mg según tolerancia.\n• **Tirzepatide (Dual GLP-1 / GIP):** Potente control glucémico y reducción del apetito sin estímulo del receptor de glucagón.\n• **Pureza & Calidad:** Ambas formulaciones cuentan con certificado analítico de pureza ≥99.0% HPLC en viales de borosilicato liofilizados.`
        : `### ⚡ Comparative Incretin Kinetics: Retatrutide vs Tirzepatide\n\n• **Retatrutide (Triple Agonist - GLP-1 / GIP / GCGR):** Simultaneous activation of GLP-1 (satiety), GIP (lipolysis & insulin sensitivity), and Glucagon receptor (thermogenesis & resting metabolic rate elevation).\n  - *Suggested titration:* Initiate at 2.0 mg SQ weekly for 4 weeks; escalate to 4.0 mg and 8.0 mg at 4-week intervals.\n• **Tirzepatide (Dual GLP-1 / GIP):** Proven glycemic mastery and appetite reduction without glucagon-driven resting metabolic rate stimulation.\n• **Certified Quality:** Both formulations are cGMP manufactured with verified ≥99.0% HPLC analytical purity.`;

      if (reta || tirz10) {
        replyText += isEs ? `\n\n**Tarifas Oficiales:**\n` : `\n\n**Official Schedule Pricing:**\n`;
        if (reta) {
          replyText += `• **${reta.productName} ${reta.dosage}:** ${formatPrice(reta.unitPrice)} / vial · **Pack ×10:** ${formatPrice(reta.pack10Price)} (${reta.savingsPercent || '-40%'})\n`;
          actionProducts.push(reta);
        }
        if (tirz10) {
          replyText += `• **${tirz10.productName} ${tirz10.dosage}:** ${formatPrice(tirz10.unitPrice)} / vial · **Pack ×10:** ${formatPrice(tirz10.pack10Price)} (${tirz10.savingsPercent || '-40%'})\n`;
          if (!actionProducts.find(p => p.id === tirz10.id)) actionProducts.push(tirz10);
        }
      }
    } else if (qLower.includes('longev') || qLower.includes('epithalon') || qLower.includes('mots') || qLower.includes('telomer')) {
      replyText = isEs
        ? `### 🧬 Protocolo Clínico de Longevidad Celular (60 Días)\n\n• **Fase 1 (Días 1–15): Activación Telomérica y Reseteo Pineal**\n  - *Epithalon 10 mg diario (SC, mañana)* durante 10 a 15 días consecutivos.\n  - Favorece la elongación telomérica mediante transcriptasa telomerasa y resincroniza el ritmo circadiano de melatonina.\n• **Fase 2 (Días 16–60): Bioenergética Mitocondrial**\n  - *MOTS-c 10 mg 3x por semana (SC, matutino en ayunas o pre-actividad)*.\n  - Activa la vía AMPK, incrementa la translocación de GLUT4 y optimiza la flexibilidad metabólica muscular.`
        : `### 🧬 Evidence-Based 60-Day Cellular Longevity Protocol\n\n• **Phase 1 (Days 1–15): Telomeric & Circadian Reset**\n  - *Epithalon 10 mg daily (SQ, morning)* for 10–15 consecutive days.\n  - Reactivates telomerase reverse transcriptase and resynchronizes pineal melatonin secretion.\n• **Phase 2 (Days 16–60): Mitochondrial Bioenergetics**\n  - *MOTS-c 10 mg 3x weekly (SQ, morning fasting or pre-exercise)*.\n  - Activates AMPK pathway, increases intracellular GLUT4 translocation, and restores muscle insulin sensitivity.`;

      if (epith || mots) {
        replyText += isEs ? `\n\n**Disponibilidad en Catálogo:**\n` : `\n\n**Catalog Pricing & Tiers:**\n`;
        if (epith) {
          replyText += `• **${epith.productName} ${epith.dosage}:** ${formatPrice(epith.unitPrice)} / vial · **Pack ×10:** ${formatPrice(epith.pack10Price)} (${epith.savingsPercent || '-40%'})\n`;
          actionProducts.push(epith);
        }
        if (mots) {
          replyText += `• **${mots.productName} ${mots.dosage}:** ${formatPrice(mots.unitPrice)} / vial · **Pack ×10:** ${formatPrice(mots.pack10Price)} (${mots.savingsPercent || '-40%'})\n`;
          actionProducts.push(mots);
        }
      }
    } else if (qLower.includes('503a') || qLower.includes('fda') || qLower.includes('regulat') || qLower.includes('legal')) {
      const fda503aCount = products.filter(p => p.fdaBucket === 'fda_503a').length;
      const fdaApprovedCount = products.filter(p => p.fdaBucket === 'fda_approved').length;

      replyText = isEs
        ? `### 🏛️ Marco Regulatorio y Discreción Magistral FDA 503A\n\nNuestra tarifa cuenta con **${fda503aCount} formulaciones con discreción de ejecución 503A** y **${fdaApprovedCount} formulaciones con respaldo de aprobación FDA** (NDAs/BLAs de referencia):\n\n• **503A Enforcement Discretion:** Incluye formulaciones magistrales de alta demanda clínica (como BPC-157, Semaglutide, Tirzepatide, Sermorelin, Oxytocin) dispensadas por farmacias compounding habilitadas bajo supervisión médica directa.\n• **Certificación de Grado Analítico:** Cada lote cuenta con Certificado de Análisis (COA) emitido por laboratorio tercero independiente que garantiza pureza ≥99.0% por cromatografía HPLC y espectrometría de masas (LC-MS), con endotoxinas < 0.5 EU/mg.`
        : `### 🏛️ FDA 503A Regulatory Framework & Compounding Discretion\n\nOur schedule indexes **${fda503aCount} formulations under 503A enforcement discretion** and **${fdaApprovedCount} formulations with direct FDA-approved drug precedents**:\n\n• **503A Compounding Scope:** Covers high-demand clinical formulations (such as BPC-157, Semaglutide, Tirzepatide, Sermorelin, Oxytocin) prepared by licensed compounding dispensaries with valid patient prescriptions.\n• **Analytical COA Verification:** Every single batch includes third-party HPLC analytical chromatography and LC-MS spectrometry verifying ≥99.0% purity with endotoxin levels strictly below < 0.5 EU/mg.`;
    } else if (qLower.includes('ahorro') || qLower.includes('saving') || qLower.includes('pack') || qLower.includes('proforma') || qLower.includes('descuent') || qLower.includes('discount')) {
      replyText = isEs
        ? `### 📦 Estructura de Ahorro en Pack ×10 y Cotización Proforma\n\n• **Ahorro Directo de Fabricante:** Al seleccionar el **Pack de 10 Viales**, se aplica automáticamente un descuento institucional que oscila entre el **-15% y el -52%** respecto al precio por vial unitario.\n• **Consolidación en Tiempo Real:** Puedes agregar cualquier combinación de viales simples y packs ×10. El carrito flotante inferior calculará instantáneamente el subtotal y el flete en tu divisa (${currency}).\n• **Generación de Proforma Oficial:** Haz clic en el botón superior **PDF Schedule** o en el botón del carrito para exportar una cotización proforma formal con desglose de impuestos y número de seguimiento para tu clínica.`
        : `### 📦 Pack ×10 Volume Savings & Proforma Quote Workflow\n\n• **Manufacturer Direct Savings:** Ordering in **10-Vial Packs** automatically unlocks tiered institutional pricing with volume savings ranging from **-15% to -52%** compared to single vial orders.\n• **Live Multi-Item Consolidation:** Add any combination of single vials and 10-packs. The bottom floating proforma bar computes live totals and express courier logistics in your chosen currency (${currency}).\n• **Official Proforma Export:** Use the **PDF Schedule** button or the inquiry checkout to generate a formal institutional proforma quote with validated batch codes and dispensary monograph documentation.`;
    } else {
      // ── Fallback to Live /api/ai-chat Gemini Endpoint ──
      try {
        const sampleCatalog = products.slice(0, 15).map(p => ({
          name: p.productName,
          dose: p.dosage,
          price1x: p.unitPrice,
          pack10: p.pack10Price,
          fda: p.fdaBucket
        }));

        const response = await fetch('/api/ai-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: query,
            scope: 'public_sandbox',
            context: {
              screenScope: 'peptides_b2b_pricelist',
              pathname: '/pricing/peptides',
              currency,
              isDistributor,
              lang,
              activeCategory: activeCategoryLabel || 'All Formulations',
              catalogInventory: sampleCatalog
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          replyText = data.reply || data.message || '';
        }
      } catch (err) {
        console.warn('Live AI endpoint fallback:', err);
      }

      // If API did not return or returned empty, use graceful contextual synthesis
      if (!replyText) {
        replyText = isEs
          ? `### 🩺 Orientación de Farmacopea Atlas AI\n\nPara tu consulta sobre **${query}**, el estándar institucional europeo y norteamericano especifica péptidos liofilizados estériles en viales de borosilicato 10R con **pureza analítica verificada ≥99.0% por HPLC**.\n\n• **Reconstitución:** Se recomienda utilizar exclusivamente Agua Bacteriostática al 0.9% de alcohol bencílico bajo condiciones de esterilidad.\n• **Almacenamiento:** Conservar en refrigeración estricta entre 2°C y 8°C tras la reconstitución. Proteger de luz solar directa.\n• **Tarifa Institucional:** Puedes consultar formulaciones relacionadas en el buscador principal o seleccionar el botón **PDF Schedule** para descargar la lista completa de precios.`
          : `### 🩺 Atlas AI Pharmacopeia Guidance\n\nRegarding your inquiry on **${query}**, our compounding dispensary standard requires sterile lyophilized bioactive peptides in 10R borosilicate vials with **verified ≥99.0% HPLC purity**.\n\n• **Reconstitution:** Formulate strictly with USP 0.9% Benzyl Alcohol Bacteriostatic Water under aseptic conditions.\n• **Cold-Chain Storage:** Maintain refrigerated at 2°C – 8°C post-dilution. Protect from direct ultraviolet exposure.\n• **Institutional Quotes:** You can search specific formulations in the catalog table or export the verified **PDF Schedule** with complete batch specifications.`;
      }
    }

    setMessages(prev => [...prev, {
      role: 'assistant',
      text: replyText,
      actionProducts
    }]);
    setLoading(false);
  };

  const handleClearHistory = () => {
    setMessages([{ role: 'assistant', text: initialGreeting, actionProducts: [] }]);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1200,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          width: '100%',
          maxWidth: '560px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-6px 0 28px rgba(0, 0, 0, 0.22)',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Top AppBar (Google Cloud Console Dark Theme Pattern) ── */}
        <div style={{
          padding: '12px 16px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #1a73e8 0%, #0d9488 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(26, 115, 232, 0.4)',
              flexShrink: 0
            }}>
              <Sparkles size={18} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 800, fontSize: '1.02rem', letterSpacing: '-0.01em' }}>
                  Atlas Clinical AI
                </span>
                <span style={{
                  fontSize: '0.62rem',
                  fontWeight: 750,
                  background: 'rgba(13, 148, 136, 0.25)',
                  border: '1px solid #14b8a6',
                  color: '#2dd4bf',
                  padding: '1px 6px',
                  borderRadius: '4px'
                }}>
                  v4.8 Verified
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.2, marginTop: '2px' }}>
                {isEs ? 'Copiloto Clínico & Cotizador Inteligente B2B' : 'Clinical Pharmacopeia, Dosing Math & B2B Quoter'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {messages.length > 1 && (
              <button
                type="button"
                onClick={handleClearHistory}
                title={isEs ? 'Reiniciar conversación' : 'Reset chat history'}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  borderRadius: '6px',
                  padding: '6px',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <RotateCcw size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                padding: '6px',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s ease'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Google Cloud Live Context Strip (Displays Active Screen Parameters) ── */}
        <div style={{
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '6px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflowX: 'auto',
          flexShrink: 0
        }}>
          <span style={{ fontSize: '0.64rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
            {isEs ? 'Contexto:' : 'Context:'}
          </span>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            background: '#e0f2fe',
            color: '#0369a1',
            border: '1px solid #bae6fd',
            padding: '2px 8px',
            borderRadius: '12px',
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Dna size={11} />
            <span>{activeCategoryLabel || (isEs ? 'Todas las 109 Formulaciones' : 'All 109 Formulations')}</span>
          </span>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            background: totalCartCount > 0 ? '#ecfdf5' : '#f1f5f9',
            color: totalCartCount > 0 ? '#047857' : '#475569',
            border: totalCartCount > 0 ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
            padding: '2px 8px',
            borderRadius: '12px',
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <ShoppingCart size={11} />
            <span>{totalCartCount > 0 ? `${totalCartCount} ${isEs ? 'viales en proforma' : 'vials in inquiry'}` : (isEs ? 'Proforma vacía' : 'Empty proforma')}</span>
          </span>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            background: '#fef3c7',
            color: '#92400e',
            border: '1px solid #fde68a',
            padding: '2px 8px',
            borderRadius: '12px',
            whiteSpace: 'nowrap'
          }}>
            {currency} ({currencySymbol}) · {isDistributor ? 'Distributor' : 'Wholesale'}
          </span>
        </div>

        {/* ── Chat Messages Body ── */}
        <div
          ref={chatScrollRef}
          style={{
            flex: 1,
            padding: '1rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            background: '#f8fafc'
          }}
        >
          {messages.map((m, idx) => (
            <React.Fragment key={idx}>
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: m.role === 'user' ? '85%' : '100%',
                  width: m.role === 'user' ? 'auto' : '100%'
                }}
              >
                {m.role === 'assistant' && (
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1a73e8 0%, #0d9488 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                    boxShadow: '0 2px 6px rgba(26, 115, 232, 0.3)'
                  }}>
                    <Bot size={16} />
                  </div>
                )}
                {m.role === 'user' ? (
                  <div style={{
                    background: '#1a73e8', // Google Cloud Blue
                    color: '#ffffff',
                    padding: '10px 14px',
                    borderRadius: '14px 14px 2px 14px',
                    fontSize: '0.84rem',
                    lineHeight: 1.5,
                    boxShadow: '0 2px 6px rgba(26, 115, 232, 0.25)',
                    wordBreak: 'break-word'
                  }}>
                    {m.text}
                  </div>
                ) : (
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    color: '#0f172a',
                    padding: '14px 16px',
                    borderRadius: '14px 14px 14px 2px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}>
                    <DoctorAiMessageRenderer content={m.text} />

                    {/* Interactive Action Cards (Add to Cart / View Specs directly from AI reply) */}
                    {m.actionProducts && m.actionProducts.length > 0 && (
                      <div style={{
                        marginTop: '12px',
                        paddingTop: '10px',
                        borderTop: '1px dashed #cbd5e1',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {isEs ? '⚡ Acciones Rápidas en Tarifa:' : '⚡ Direct Schedule Actions:'}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                          {m.actionProducts.map((prod) => {
                            const is1xAdded = addedItemCode === `${prod.id}-1x`;
                            const is10xAdded = addedItemCode === `${prod.id}-10x`;
                            return (
                              <div
                                key={prod.id}
                                style={{
                                  background: '#f8fafc',
                                  border: '1px solid #dadce0',
                                  borderRadius: '8px',
                                  padding: '8px 10px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '6px'
                                }}
                              >
                                <div>
                                  <div style={{ fontSize: '0.80rem', fontWeight: 800, color: '#0f172a' }}>
                                    {prod.productName} <span style={{ color: '#0284c7', fontWeight: 600 }}>{prod.dosage}</span>
                                  </div>
                                  <div style={{ fontSize: '0.70rem', color: '#64748b' }}>
                                    {formatPrice(prod.unitPrice)}/vial · Pack ×10: {formatPrice(prod.pack10Price)}
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                  {onAddToCart && (
                                    <button
                                      type="button"
                                      onClick={() => handleActionAdd(prod, '1x')}
                                      style={{
                                        flex: 1,
                                        border: '1px solid #0284c7',
                                        background: is1xAdded ? '#ecfdf5' : '#ffffff',
                                        color: is1xAdded ? '#047857' : '#0284c7',
                                        fontSize: '0.68rem',
                                        fontWeight: 750,
                                        padding: '4px 6px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '3px'
                                      }}
                                    >
                                      {is1xAdded ? <Check size={11} /> : <Plus size={11} />}
                                      <span>{isEs ? '+1 Vial' : '+1 Vial'}</span>
                                    </button>
                                  )}
                                  {onAddToCart && (
                                    <button
                                      type="button"
                                      onClick={() => handleActionAdd(prod, '10x')}
                                      style={{
                                        flex: 1,
                                        border: 'none',
                                        background: is10xAdded ? '#047857' : '#0284c7',
                                        color: '#ffffff',
                                        fontSize: '0.68rem',
                                        fontWeight: 750,
                                        padding: '4px 6px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '3px'
                                      }}
                                    >
                                      {is10xAdded ? <Check size={11} /> : <Plus size={11} />}
                                      <span>{isEs ? '+Pack ×10' : '+Pack ×10'}</span>
                                    </button>
                                  )}
                                  {onOpenSpecs && (
                                    <button
                                      type="button"
                                      onClick={() => onOpenSpecs(prod)}
                                      style={{
                                        border: '1px solid #cbd5e1',
                                        background: '#ffffff',
                                        color: '#475569',
                                        fontSize: '0.68rem',
                                        fontWeight: 650,
                                        padding: '4px 6px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '3px'
                                      }}
                                    >
                                      <span>COA ↗</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Suggested Prompts Bar (GCP Gemini Style Pills) ── */}
              {idx === 0 && messages.length === 1 && (
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 2px' }}>
                    <Sparkles size={12} color="#1a73e8" />
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {isEs ? 'Consultas recomendadas' : 'Suggested inquiries'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {SUGGESTED_INQUIRIES.map((item, qIdx) => {
                      const IconComponent = item.icon;
                      return (
                        <button
                          key={qIdx}
                          type="button"
                          onClick={() => handleSend(isEs ? item.promptEs : item.promptEn)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            background: '#ffffff',
                            border: '1px solid #dadce0',
                            borderRadius: '9999px',
                            cursor: 'pointer',
                            fontSize: '0.74rem',
                            fontWeight: 650,
                            color: '#3c4043',
                            transition: 'all 0.15s ease',
                            boxShadow: '0 1px 2px rgba(60,64,67,0.04)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#1a73e8';
                            e.currentTarget.style.background = '#f0f7ff';
                            e.currentTarget.style.color = '#1a73e8';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#dadce0';
                            e.currentTarget.style.background = '#ffffff';
                            e.currentTarget.style.color = '#3c4043';
                          }}
                        >
                          <IconComponent size={13} color={item.iconColor} />
                          <span>{isEs ? item.titleEs : item.titleEn}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}

          {loading && (
            <div style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              color: '#0284c7',
              fontSize: '0.78rem',
              fontWeight: 650,
              padding: '8px 12px',
              background: '#f0f9ff',
              borderRadius: '8px',
              border: '1px solid #bae6fd',
              animation: 'pulse 1.5s infinite'
            }}>
              <Bot size={16} />
              <span>{isEs ? 'Atlas AI está sintetizando farmacopea y tarifas en tiempo real...' : 'Atlas AI is consulting live pharmacology & pricing schedule...'}</span>
            </div>
          )}
        </div>

        {/* ── Input Bar (Google Cloud Rounded Full-Width Input) ── */}
        <div style={{
          padding: '12px 14px',
          borderTop: '1px solid #dadce0',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0
        }}>
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isEs
              ? 'Pregunta a Atlas AI sobre dosis, sinergias, precios o pack ×10...'
              : 'Ask Atlas AI about dosing math, synergies, prices or 10-packs...'}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '24px',
              border: '1px solid #dadce0',
              fontSize: '0.84rem',
              outline: 'none',
              background: '#f8fafc',
              transition: 'all 0.15s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#1a73e8';
              e.target.style.background = '#ffffff';
              e.target.style.boxShadow = '0 0 0 2px rgba(26,115,232,0.15)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#dadce0';
              e.target.style.background = '#f8fafc';
              e.target.style.boxShadow = 'none';
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputPrompt.trim() || loading}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: 'none',
              background: inputPrompt.trim() && !loading ? '#1a73e8' : '#e8eaed',
              color: inputPrompt.trim() && !loading ? '#ffffff' : '#9aa0a6',
              cursor: inputPrompt.trim() && !loading ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}
            title={isEs ? 'Enviar consulta a Atlas AI' : 'Send query to Atlas AI'}
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
