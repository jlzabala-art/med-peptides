"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Check,
  Clock,
  ShieldCheck,
  Droplets,
  Thermometer,
  CalendarDays,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Info,
  Layers,
  FileText,
  Activity,
  Copy,
  Zap,
  CheckCircle2,
  Heart
} from '@/lib/icons';
import { toast } from 'react-hot-toast';
import PublicSectionCard from '@/components/shared/public/PublicSectionCard';
import PublicSegmentedControl from '@/components/shared/public/PublicSegmentedControl';
import ProductSectionFooterNav from '@/components/product/ProductSectionFooterNav';

/**
 * Detailed real-world application & posology specs per Colway product.
 * Eliminates generic copy-paste facial cream advice for shampoo or oral pills.
 */
const COLWAY_PRODUCT_SPECS = {
  'colway-strengthening-shampoo': {
    formatBadge: { en: '🧴 Active Scalp Shampoo', es: '🧴 Champú Capilar Activo' },
    volume: '250 mL',
    route: { en: 'Topical Scalp Wash', es: 'Vía Tópica / Lavado Capilar' },
    frequency: { en: '3–4× Weekly', es: '3–4 Veces por Semana' },
    target: {
      en: 'Clear sebum DHT buildup, decongest hair follicles, and stimulate scalp microcirculation via Baicapil™ 2% & Zinc PCA.',
      es: 'Eliminar el exceso de DHT en el sebo folicular, descongestionar los ostia y estimular la microcirculación con Baicapil™ 2% y Zinc PCA.'
    },
    howToApply: {
      en: 'Apply a 5–10 mL coin-sized amount onto wet scalp and hair. Massage gently with fingertips in circular motions for 2–3 minutes to activate microvascular perfusion. Rinse thoroughly with cool or lukewarm water (≤30°C). Repeat if hair is heavily soiled. Use 3–4 times weekly.',
      es: 'Dosificar de 5 a 10 mL sobre el cuero cabelludo y cabello húmedos. Masajear suavemente con las yemas de los dedos durante 2–3 minutos para activar la microcirculación y favorecer la fijación del Baicapil. Aclarar con abundante agua fresca o tibia (≤30°C). Usar de 3 a 4 veces por semana.'
    },
    storageTip: {
      en: 'Store below 25°C in a dry place. Keep cap tightly closed.',
      es: 'Conservar por debajo de 25°C en lugar seco. Mantener envase bien cerrado.'
    }
  },
  'colway-strengthening-conditioner': {
    formatBadge: { en: '🧴 Fortifying Hair Conditioner', es: '🧴 Acondicionador Fortificante' },
    volume: '200 mL',
    route: { en: 'Topical Hair Fiber & Scalp', es: 'Vía Tópica / Fibra y Cuero Cabelludo' },
    frequency: { en: 'After Every Shampoo Wash', es: 'Tras Cada Lavado con Champú' },
    target: {
      en: 'Anchor native tropocollagen & micronized keratin into the hair cortex, reducing breakage and reinforcing hair shaft caliber.',
      es: 'Fijar tropocolágeno nativo y queratina micronizada en la cutícula y corteza capilar, reduciendo la rotura y aumentando el grosor del tallo.'
    },
    howToApply: {
      en: 'After rinsing the shampoo, apply from roots to ends onto damp hair. Spread evenly and leave on for 3–5 minutes to allow deep cuticular penetration of native collagen. Rinse thoroughly with cool water to seal the hair cuticle. Use after every shampoo wash.',
      es: 'Tras aclarar el champú, aplicar de raíz a puntas sobre el cabello húmedo. Distribuir de manera uniforme y dejar actuar de 3 a 5 minutos para permitir la penetración del tropocolágeno y la queratina. Aclarar con agua fresca para sellar la cutícula. Usar tras cada lavado.'
    },
    storageTip: {
      en: 'Store below 25°C. Avoid direct sunlight or high shower steam heat.',
      es: 'Conservar por debajo de 25°C. Evitar la exposición directa a vapor excesivo o calor solar.'
    }
  },
  'colway-colvita': {
    formatBadge: { en: '💊 Lyophilized Native Collagen Capsules', es: '💊 Cápsulas Nativas de Colágeno Oral' },
    volume: '60 / 120 Capsules',
    route: { en: 'Oral Nutricosmetic', es: 'Vía Oral / Nutricosmético' },
    frequency: { en: 'Daily with Main Meal', es: 'Diario con una Comida Principal' },
    target: {
      en: 'Provide systemic biologically active oligopeptide pool (Gly-Pro-Hyp) for dermal fibroblast & follicle matrix neo-synthesis.',
      es: 'Aportar el pool sistémico de oligopéptidos bioactivos (Gly-Pro-Hyp) necesarios para la síntesis de colágeno folicular y dérmico.'
    },
    howToApply: {
      en: 'Take 2 capsules daily with a full glass of room temperature mineral water during or immediately after a meal. Do not chew. Dietary vitamin C significantly enhances enteric absorption and hydroxylation of collagen oligopeptides. Continuous daily regimen.',
      es: 'Ingerir 2 cápsulas al día con un vaso lleno de agua mineral templada durante o inmediatamente después de una comida. No masticar. La vitamina C de la dieta potencia de forma sinérgica la absorción entérica de los oligopéptidos. Pauta diaria continua.'
    },
    storageTip: {
      en: 'Store at room temperature (15°C–25°C) in a dry place. Protect from moisture and direct light.',
      es: 'Conservar a temperatura ambiente (15°C–25°C) en lugar seco. Proteger de la humedad y la luz directa.'
    }
  },
  'colway-collagen-wash-gel': {
    formatBadge: { en: '🧴 Cellular Hydrolipid Wash Gel', es: '🧴 Gel Limpiador Celular Hidrolipídico' },
    volume: '250 mL',
    route: { en: 'Facial & Dermal Cleanser', es: 'Vía Tópica / Limpieza Facial' },
    frequency: { en: 'Twice Daily (AM / PM)', es: 'Dos Veces al Día (Mañana y Noche)' },
    target: {
      en: 'Gently cleanse without stripping the epidermal hydrolipidic barrier, preparing stratum corneum for tropocollagen assimilation.',
      es: 'Limpiar con máxima suavidad sin alterar la barrera hidrolipídica, preparando el estrato córneo para la asimilación del colágeno.'
    },
    howToApply: {
      en: 'Dispense 1–2 pumps onto wet palms and emulsify into a light foam. Gently massage onto damp face, neck, and décolleté in upward circular motions. Rinse thoroughly with lukewarm or cool water. Use morning and evening.',
      es: 'Dosificar 1–2 pulsaciones sobre las palmas húmedas y emulsionar. Masajear suavemente sobre rostro, cuello y escote humedecidos con movimientos circulares. Aclarar con agua tibia o fresca. Usar mañana y noche.'
    },
    storageTip: {
      en: 'Store below 25°C. Keep pump dispenser locked when traveling.',
      es: 'Conservar por debajo de 25°C. Mantener el dosificador limpio.'
    }
  },
  'colway-blue-diamond-peeling': {
    formatBadge: { en: '🧴 Enzymatic & Mechanical Peeling', es: '🧴 Peeling Enzimático & Mecánico' },
    volume: '75 mL',
    route: { en: 'Topical Dermal Exfoliation', es: 'Vía Tópica / Exfoliación Suave' },
    frequency: { en: '1–2× Weekly (Evening)', es: '1–2 Veces por Semana (Noche)' },
    target: {
      en: 'Slough dead corneocytes via natural diamond micro-crystals and papain enzymes, accelerating skin cell turnover.',
      es: 'Eliminar corneocitos desvitalizados mediante microcristales de diamante y enzimas de papaína, acelerando la renovación celular.'
    },
    howToApply: {
      en: 'Apply a hazelnut-sized amount to cleansed, damp skin in the evening. Massage very gently for 1–2 minutes without aggressive friction. Leave for 1 minute for enzymatic action, then rinse thoroughly with tepid water. Use 1–2 times weekly.',
      es: 'Aplicar una pequeña cantidad sobre la piel limpia y ligeramente húmeda por la noche. Masajear con extrema suavidad durante 1–2 minutos sin frotar con fuerza. Dejar reposar 1 minuto y aclarar con abundante agua tibia. Usar 1–2 veces por semana.'
    },
    storageTip: {
      en: 'Store below 25°C. Close jar tightly after each use.',
      es: 'Conservar por debajo de 25°C. Cerrar bien el tarro tras cada uso.'
    }
  },
  'colway-blue-diamond-cream': {
    formatBadge: { en: '🧴 Cellular Collagen Regenerative Cream', es: '🧴 Crema Regeneradora Celular' },
    volume: '50 mL',
    route: { en: 'Topical Facial Dermis', es: 'Vía Tópica / Rostro y Cuello' },
    frequency: { en: 'Daily (AM & PM)', es: 'Diario (Mañana y Noche)' },
    target: {
      en: 'Deliver liposomal tropocollagen, diamond powder, and bio-peptides deep into the dermis to restore skin elasticity and turgor.',
      es: 'Aportar tropocolágeno liposomal, polvo de diamante y biopéptidos a la dermis, restaurando elasticidad, firmeza y turgencia.'
    },
    howToApply: {
      en: 'Apply with the spatula onto thoroughly cleansed and damp face, neck, and décolleté every morning and evening. Pat gently with fingertips until fully absorbed. Do not rub vigorously.',
      es: 'Aplicar una pequeña cantidad con la espátula sobre rostro, cuello y escote limpios y ligeramente húmedos cada mañana y noche. Extender con suaves toques hasta su absorción completa.'
    },
    storageTip: {
      en: 'Store below 25°C away from radiators or heat sources.',
      es: 'Conservar por debajo de 25°C alejado de fuentes de calor.'
    }
  },
  'colway-collagen-vege': {
    formatBadge: { en: '🧴 100% Plant Bio-Collagen Airless Gel', es: '🧴 Gel de Colágeno Vegetal Airless' },
    volume: '45 mL',
    route: { en: 'Topical Dermal Hydration', es: 'Vía Tópica / Hidratación Dérmica' },
    frequency: { en: 'Every Evening (Nightly)', es: 'Cada Noche' },
    target: {
      en: 'Plant-derived hydroxyproline & amino acid matrix (Chlorella algae) restoring dermal lipid barrier in vegan/allergic profiles.',
      es: 'Matriz vegetal de hidroxiprolina y aminoácidos de microalgas Chlorella que restaura la barrera dérmica en perfiles veganos o alérgicos.'
    },
    howToApply: {
      en: 'Dispense 1–2 pumps onto freshly cleansed and damp skin every evening. Gently smooth over face, neck, and hands until completely absorbed.',
      es: 'Dosificar 1–2 pulsaciones sobre la piel limpia y ligeramente húmeda cada noche. Extender con suavidad sobre rostro, cuello y manos hasta su completa absorción.'
    },
    storageTip: {
      en: 'Keep in its airless dispenser below 25°C.',
      es: 'Mantener en su envase airless por debajo de 25°C.'
    }
  }
};

/**
 * Weekly schedules tailored specifically to Colway protocols (no peptides, no SubQ, no fake rest days)
 */
function getColwayWeeklyCalendar(slug, isEs) {
  const isHair = slug.includes('hair');
  const isDermo = slug.includes('dermo');
  const isNutri = slug.includes('nutri');

  if (isHair) {
    return [
      {
        day: isEs ? 'Lunes' : 'Monday',
        isWashDay: true,
        routine: isEs ? '🚿 Día de Lavado & Cuidado Folicular Completo' : '🚿 Scalp Cleansing & Follicular Fortification',
        steps: [
          isEs ? 'Champú Fortificante: masajear 2–3 min sobre cuero cabelludo húmedo y aclarar con agua fresca (≤30°C).' : 'Strengthening Shampoo: massage 2–3 min on wet scalp, rinse with cool water (≤30°C).',
          isEs ? 'Acondicionador Fortificante: aplicar de medios a puntas, dejar 3–5 min de reposo y aclarar.' : 'Strengthening Conditioner: apply roots to ends, leave 3–5 min, rinse thoroughly.',
          isEs ? 'Colvita: tomar 2 cápsulas con agua mineral durante la comida principal.' : 'Colvita: take 2 capsules with water during main meal.'
        ]
      },
      {
        day: isEs ? 'Martes' : 'Tuesday',
        isWashDay: false,
        routine: isEs ? '🌿 Nutricosmética & Descanso del Lavado' : '🌿 Nutricosmetic & Scalp Rest',
        steps: [
          isEs ? 'Colvita: tomar 2 cápsulas con agua mineral durante la comida principal.' : 'Colvita: take 2 capsules with water during main meal.',
          isEs ? 'Masaje Capilar en Seco: 1–2 minutos de suave masaje circular con las yemas para estimular el flujo sanguíneo.' : 'Dry Scalp Massage: 1–2 minutes of gentle circular massage to stimulate blood flow.'
        ]
      },
      {
        day: isEs ? 'Miércoles' : 'Wednesday',
        isWashDay: true,
        routine: isEs ? '🚿 Día de Lavado & Cuidado Folicular Completo' : '🚿 Scalp Cleansing & Follicular Fortification',
        steps: [
          isEs ? 'Champú Fortificante: masajear 2–3 min y aclarar con agua fresca (≤30°C).' : 'Strengthening Shampoo: massage 2–3 min, rinse with cool water (≤30°C).',
          isEs ? 'Acondicionador Fortificante: aplicar 3–5 min para fijar queratina y tropocolágeno y aclarar.' : 'Strengthening Conditioner: leave 3–5 min to lock keratin and tropocollagen, rinse.',
          isEs ? 'Colvita: tomar 2 cápsulas con la comida principal.' : 'Colvita: take 2 capsules with main meal.'
        ]
      },
      {
        day: isEs ? 'Jueves' : 'Thursday',
        isWashDay: false,
        routine: isEs ? '🌿 Nutricosmética & Descanso del Lavado' : '🌿 Nutricosmetic & Scalp Rest',
        steps: [
          isEs ? 'Colvita: tomar 2 cápsulas con la comida principal.' : 'Colvita: take 2 capsules with main meal.',
          isEs ? 'Mantenimiento del cabello sin lavado para permitir la acción del microbioma capilar.' : 'Hair maintenance without washing to support natural scalp barrier balance.'
        ]
      },
      {
        day: isEs ? 'Viernes' : 'Friday',
        isWashDay: true,
        routine: isEs ? '🚿 Día de Lavado & Cuidado Folicular Completo' : '🚿 Scalp Cleansing & Follicular Fortification',
        steps: [
          isEs ? 'Champú Fortificante: masajear 2–3 min y aclarar con agua fresca (≤30°C).' : 'Strengthening Shampoo: massage 2–3 min, rinse with cool water (≤30°C).',
          isEs ? 'Acondicionador Fortificante: aplicar de raíz a puntas durante 3–5 min y aclarar.' : 'Strengthening Conditioner: apply for 3–5 min from root to tip, rinse thoroughly.',
          isEs ? 'Colvita: tomar 2 cápsulas con la comida principal.' : 'Colvita: take 2 capsules with main meal.'
        ]
      },
      {
        day: isEs ? 'Sábado' : 'Saturday',
        isWashDay: false,
        routine: isEs ? '🌿 Nutricosmética & Masaje Estimulante' : '🌿 Nutricosmetic & Gentle Massage',
        steps: [
          isEs ? 'Colvita: tomar 2 cápsulas con agua mineral durante la comida principal.' : 'Colvita: take 2 capsules with water during main meal.',
          isEs ? 'Cepillado suave con cerdas naturales para distribuir los aceites protectores del cuero cabelludo.' : 'Gentle hair brushing with natural bristles to evenly distribute protective scalp oils.'
        ]
      },
      {
        day: isEs ? 'Domingo' : 'Sunday',
        isWashDay: true,
        routine: isEs ? '🚿 Lavado de Cierre Semanal & Nutrición Profunda' : '🚿 Weekly Deep Cleanse & Follicle Nutrition',
        steps: [
          isEs ? 'Champú Fortificante: lavado profundo con doble aclarado fresco.' : 'Strengthening Shampoo: thorough cleanse with cool water rinse.',
          isEs ? 'Acondicionador Fortificante: dejar actuar 5 minutos para máxima nutrición de corteza.' : 'Strengthening Conditioner: leave on for 5 min for deep cuticle fortification.',
          isEs ? 'Colvita: tomar 2 cápsulas con la comida principal.' : 'Colvita: take 2 capsules with main meal.'
        ]
      }
    ];
  }

  if (isDermo) {
    return [
      {
        day: isEs ? 'Lunes, Martes, Jueves, Viernes, Sábado' : 'Mon, Tue, Thu, Fri, Sat',
        isWashDay: false,
        routine: isEs ? '✨ Rutina Facial Regeneradora Diaria (AM & PM)' : '✨ Daily Dermo-Regenerative Routine (AM & PM)',
        steps: [
          isEs ? 'Mañana: Limpieza con Gel Hidrolipídico Celular + Aplicar Crema Blue Diamond con ligeros toques.' : 'Morning: Cleanse with Hydrolipid Wash Gel + apply Blue Diamond Cream with light tapping.',
          isEs ? 'Noche: Limpieza con Gel Hidrolipídico Celular + Aplicar Crema Blue Diamond sobre piel ligeramente húmeda.' : 'Evening: Cleanse with Hydrolipid Wash Gel + apply Blue Diamond Cream on slightly damp skin.'
        ]
      },
      {
        day: isEs ? 'Miércoles & Domingo' : 'Wednesday & Sunday',
        isWashDay: true,
        routine: isEs ? '💎 Noche de Renovación Enzimática con Peeling' : '💎 Deep Enzymatic Peeling Night',
        steps: [
          isEs ? 'Limpieza previa con Gel Hidrolipídico Celular.' : 'Preliminary cleanse with Hydrolipid Wash Gel.',
          isEs ? 'Peeling Blue Diamond: masajear con suavidad 1–2 min sobre rostro húmedo, dejar actuar 1 min y aclarar.' : 'Blue Diamond Peeling: massage gently for 1–2 min on damp face, leave 1 min, rinse well.',
          isEs ? 'Crema Blue Diamond: aplicar inmediatamente tras secar con suaves toques para sellar la regeneración.' : 'Blue Diamond Cream: apply immediately on clean skin to seal moisture and collagen peptides.'
        ]
      }
    ];
  }

  // Fallback / Nutricosmetic
  return [
    {
      day: isEs ? 'Lunes a Domingo (Rutina Diaria)' : 'Monday through Sunday (Daily)',
      isWashDay: true,
      routine: isEs ? '🌿 Sinergia Celular Nutracéutica & Tópica' : '🌿 Cellular Nutricosmetic & Topical Synergy',
      steps: [
        isEs ? 'Mañana (Desayuno): Tomar 2 cápsulas de Colvita con un vaso de agua mineral.' : 'Morning (Breakfast): Take 2 Colvita capsules with a full glass of water.',
        isEs ? 'Noche (Antes de dormir): Aplicar Collagen Vege sobre rostro y cuello limpios y húmedos.' : 'Evening (Bedtime): Apply Collagen Vege airless gel over freshly cleansed, damp skin.'
      ]
    }
  ];
}

/**
 * Dedicated, streamlined view for Colway Dermocosmetic & Nutricosmetic Protocols.
 * Completely eliminates peptide jargon, duplicate product lists, and fake injection schedules.
 */
export default function ColwayProtocolStreamlinedView({
  protocol,
  items = [],
  lang = 'en',
  slug = '',
  activeSection = null,
  onSelectSection = null,
  tocSections = []
}) {
  const isEs = lang === 'es';
  const cleanSlug = String(slug || protocol?.slug || protocol?.id || '').toLowerCase();
  const weeklyCalendar = getColwayWeeklyCalendar(cleanSlug, isEs);
  const currentSection = activeSection || 'colway-regimen';
  const showAll = currentSection === 'all';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* ── SECTION 1: INCLUDED PRODUCTS & EXACT APPLICATION REGIMEN ── */}
      {(showAll || currentSection === 'colway-regimen') && (
      <PublicSectionCard
        id="colway-regimen"
        icon={Sparkles}
        category={isEs ? 'PRODUCTOS DEL PROTOCOLO & MODO DE USO' : 'INCLUDED PRODUCTS & APPLICATION REGIMEN'}
        badge={`${items.length || 3} ${isEs ? 'Productos CPNP' : 'CPNP Products'}`}
        badgeVariant="cyan"
        title={isEs ? 'Régimen Dermocosmético & Pautas de Aplicación' : 'Dermocosmetic Regimen & Precise Application Guidelines'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Header context alert */}
          <div style={{
            background: '#f0fdfa',
            border: '1px solid #99f6e4',
            borderRadius: '10px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={20} color="#0d9488" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.82rem', color: '#134e4a', lineHeight: 1.45 }}>
                <strong style={{ color: '#0f766e' }}>
                  {isEs ? 'Protocolo No Invasivo Estandarizado:' : 'Standardized Non-Invasive Protocol:'}
                </strong>{' '}
                {isEs
                  ? 'Fórmulas cosmecéuticas y nutricosméticas registradas bajo normativa europea CPNP / ISO 22716. Sin agujas, sin viales liofilizados y sin efectos secundarios hormonales.'
                  : 'Cosmeceutical and nutricosmetic formulations compliant with European CPNP / ISO 22716 standards. No needles, no lyophilized vials, and zero hormonal side effects.'}
              </div>
            </div>
            <div style={{
              fontSize: '0.70rem',
              fontWeight: 700,
              color: '#0f766e',
              background: '#ffffff',
              border: '1px solid #99f6e4',
              padding: '3px 8px',
              borderRadius: '4px'
            }}>
              CPNP / ISO 22716
            </div>
          </div>

          {/* Cards for each item */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {items.map((item, idx) => {
              const itemSlug = (item.slug || item.productSlug || item.id || '').toLowerCase();
              const spec = COLWAY_PRODUCT_SPECS[itemSlug] || {
                formatBadge: { en: '🧴 Cosmeceutical Regimen', es: '🧴 Fórmula Cosmecéutica' },
                volume: item.volume || 'Standard Pack',
                route: { en: item.route || 'Topical', es: item.route || 'Tópica' },
                frequency: { en: item.frequency || 'Daily', es: item.frequency || 'Diario' },
                target: {
                  en: item.target || 'Nutricosmetic cellular support and dermal matrix revitalization.',
                  es: item.target || 'Soporte nutricosmético celular y revitalización de la matriz dérmica.'
                },
                howToApply: {
                  en: item.dosage || 'Apply as directed on product packaging.',
                  es: item.dosage || 'Aplicar según instrucciones del envase.'
                },
                storageTip: {
                  en: 'Store below 25°C in a cool, dry location.',
                  es: 'Conservar por debajo de 25°C en lugar fresco y seco.'
                }
              };

              const name = item.name || item.title || item.product_name;
              const monographUrl = itemSlug ? `/p/${itemSlug}` : null;

              return (
                <div
                  key={idx}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderLeft: '4px solid #0d9488',
                    borderRadius: '12px',
                    padding: '1.25rem 1.5rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  {/* Top: Product Name, Badge & Monograph Link */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '0.70rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: '#f0fdfa',
                        color: '#0f766e',
                        border: '1px solid #99f6e4'
                      }}>
                        {isEs ? spec.formatBadge.es : spec.formatBadge.en}
                      </span>
                      <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                        {spec.volume}
                      </span>
                      <span style={{ fontSize: '0.72rem', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                        {isEs ? spec.frequency.es : spec.frequency.en}
                      </span>
                    </div>

                    {monographUrl && (
                      <Link
                        href={monographUrl}
                        target="_blank"
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          color: '#003666',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          padding: '4px 10px',
                          borderRadius: '6px'
                        }}
                      >
                        <FileText size={13} />
                        <span>{isEs ? 'Ver Ficha de Producto' : 'View Monograph'}</span>
                        <ArrowRight size={11} />
                      </Link>
                    )}
                  </div>

                  {/* Title & Biological Objective */}
                  <div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '1.08rem', fontWeight: 800, color: '#0f172a' }}>
                      {name}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.45 }}>
                      <strong style={{ color: '#0f766e' }}>{isEs ? 'Objetivo Biológico:' : 'Biological Action:'}</strong>{' '}
                      {isEs ? spec.target.es : spec.target.en}
                    </p>
                  </div>

                  {/* How to Apply Box (Clear, single source of truth) */}
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={14} color="#16a34a" />
                      <span>{isEs ? 'Modo de Empleo & Aplicación Correcta:' : 'How to Apply & Administration Guidelines:'}</span>
                    </div>
                    <div style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.55 }}>
                      {isEs ? spec.howToApply.es : spec.howToApply.en}
                    </div>
                  </div>

                  {/* Storage / Temperature Reminder */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', color: '#64748b' }}>
                    <Thermometer size={13} color="#0d9488" />
                    <span>
                      <strong style={{ color: '#475569' }}>{isEs ? 'Conservación:' : 'Storage:'}</strong>{' '}
                      {isEs ? spec.storageTip.es : spec.storageTip.en}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </PublicSectionCard>
      )}

      {/* ── SECTION 2: CLEAN WEEKLY ROUTINE & CARE CALENDAR ── */}
      {(showAll || currentSection === 'colway-weekly-schedule') && (
      <PublicSectionCard
        id="colway-weekly-schedule"
        icon={CalendarDays}
        category={isEs ? 'RUTINA SEMANAL DE CUIDADOS' : 'WEEKLY ROUTINE & APPLICATION CALENDAR'}
        badge={isEs ? 'Pauta Semanal 7 Días' : '7-Day Weekly Cadence'}
        badgeVariant="green"
        title={isEs ? 'Calendario de Uso y Rutina Semanal' : 'Weekly Application Calendar & Care Routine'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
            {isEs
              ? 'Organización secuencial del tratamiento para optimizar la adherencia y respetar los tiempos fisiológicos del cuero cabelludo y la piel.'
              : 'Sequential treatment scheduling designed to maximize patient compliance while respecting physiological barrier balance.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {weeklyCalendar.map((row, idx) => (
              <div
                key={idx}
                style={{
                  background: row.isWashDay ? '#f0fdf4' : '#f8fafc',
                  border: `1px solid ${row.isWashDay ? '#bbf7d0' : '#e2e8f0'}`,
                  borderRadius: '10px',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '0.86rem',
                      fontWeight: 800,
                      color: row.isWashDay ? '#166534' : '#0f172a'
                    }}>
                      {row.day}
                    </span>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: row.isWashDay ? '#15803d' : '#64748b',
                      background: row.isWashDay ? '#dcfce7' : '#ffffff',
                      border: `1px solid ${row.isWashDay ? '#86efac' : '#cbd5e1'}`,
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      {row.routine}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '4px' }}>
                  {row.steps.map((st, sIdx) => (
                    <div key={sIdx} style={{ fontSize: '0.80rem', color: '#334155', display: 'flex', alignItems: 'flex-start', gap: '6px', lineHeight: 1.45 }}>
                      <span style={{ color: row.isWashDay ? '#16a34a' : '#0d9488', fontWeight: 800 }}>•</span>
                      <span>{st}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </PublicSectionCard>
      )}

      {/* ── SECTION 3: ESSENTIAL TIPS & PRESERVATION (CONSEJOS CLAVE ÚNICOS) ── */}
      {(showAll || currentSection === 'colway-tips') && (
      <PublicSectionCard
        id="colway-tips"
        icon={Thermometer}
        category={isEs ? 'CONSEJOS CLAVE & CONSERVACIÓN' : 'ESSENTIAL GUIDELINES & PRESERVATION'}
        badge={isEs ? 'Reglas de Oro Colway' : 'Golden Rules of Collagen'}
        badgeVariant="yellow"
        title={isEs ? 'Recomendaciones Prácticas y Conservación' : 'Key Biological Advice & Product Preservation'}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {/* Tip 1: Water Temperature */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Droplets size={16} />
              </div>
              <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>
                {isEs ? '1. Temperatura del Agua (≤30°C)' : '1. Water Temperature (≤30°C)'}
              </strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
              {isEs
                ? 'El tropocolágeno nativo de pez mantiene su conformación espacial activa por debajo de 26°C–30°C. Lavar y aclarar siempre con agua fresca o tibia; nunca con agua muy caliente (>38°C), ya que el calor degrada la triple hélice activa.'
                : 'Native fish tropocollagen preserves its active triple-helix conformation below 26°C–30°C. Always wash and rinse with cool or lukewarm water; avoid scalding hot water (>38°C) to prevent thermal degradation into broken gelatin.'}
            </p>
          </div>

          {/* Tip 2: Damp Skin / Scalp */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#f0fdfa', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={16} />
              </div>
              <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>
                {isEs ? '2. Aplicación en Húmedo' : '2. Apply on Damp Skin / Scalp'}
              </strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
              {isEs
                ? 'El colágeno nativo es altamente hidrofílico. Aplicar sobre el cuero cabelludo o la piel ligeramente humedecida multiplica su capacidad de penetración cutánea.'
                : 'Native tropocollagen is hydrophilic. Applying onto clean, damp skin or scalp significantly boosts transepidermal peptide absorption.'}
            </p>
          </div>

          {/* Tip 3: Consistency over time */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#faf5ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={16} />
              </div>
              <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>
                {isEs ? '3. Constancia en el Ciclo (8–16 Semanas)' : '3. Consistency Across Cycle (8–16 Weeks)'}
              </strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
              {isEs
                ? 'El anclaje folicular del cabello y la síntesis de colágeno dérmico requieren completar el ciclo biológico celular. Los resultados óptimos se consolidan a partir de la semana 8 a 16.'
                : 'Follicular anchoring and dermal collagen synthesis require completing full biological cellular cycles. Maximum density improvements manifest from week 8 to 16.'}
            </p>
          </div>

          {/* Tip 4: Storage */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Thermometer size={16} />
              </div>
              <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>
                {isEs ? '4. Conservación sin Calor (<25°C)' : '4. Cool Storage (<25°C)'}
              </strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
              {isEs
                ? 'Mantener los envases herméticamente cerrados en lugar seco y fresco, alejados de radiadores o luz solar directa. No es necesario refrigerar si la temperatura ambiente no supera 25°C.'
                : 'Store dispensers tightly closed in a cool, dry area away from direct sunlight and radiators. Refrigeration is not required unless ambient room temperature exceeds 25°C.'}
            </p>
          </div>
        </div>
      </PublicSectionCard>
      )}

      {/* ── SECTION 4: SAFETY, TOLERABILITY & GXP ASSURANCE ── */}
      {(showAll || currentSection === 'colway-safety') && (
      <PublicSectionCard
        id="colway-safety"
        icon={ShieldCheck}
        category={isEs ? 'SEGURIDAD & TOLERABILIDAD' : 'SAFETY & QUALITY ASSURANCE'}
        badge={isEs ? '100% Libre de Efectos Hormonales' : 'Zero Hormonal Side Effects'}
        badgeVariant="green"
        title={isEs ? 'Perfil de Seguridad, Contraindicaciones y Tolerancia' : 'Safety Profile, Exclusions & Dermatological Tolerability'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '10px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="#16a34a" />
              <span>{isEs ? 'Excelente Tolerabilidad y Seguridad Dermatológica' : 'Excellent Tolerability & Dermatological Safety'}</span>
            </div>
            <div style={{ fontSize: '0.80rem', color: '#15803d', lineHeight: 1.5 }}>
              {isEs
                ? 'A diferencia de los tratamientos farmacológicos tradicionales para la caída del cabello (como finasterida o minoxidil), el protocolo Colway actúa por vías no endocrinas y botánicas, siendo 100% libre de efectos secundarios sobre la tensión arterial, la libido o el sistema cardiovascular.'
                : 'Unlike conventional pharmacological hair loss treatments (such as finasteride or minoxidil), the Colway protocol operates through non-endocrine, botanical, and native collagen pathways, remaining 100% free of cardiovascular or hormonal side effects.'}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {/* Marine allergy gate */}
            <div style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '8px',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#92400e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={14} color="#d97706" />
                <span>{isEs ? 'Alérgenos: Proteínas de Pescado' : 'Allergens: Marine Fish Protein'}</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#78350f', lineHeight: 1.4 }}>
                {isEs
                  ? 'Contiene tropocolágeno nativo extraído de pieles de pez de agua dulce (Hypophthalmichthys). En pacientes con alergia confirmada al pescado, se recomienda la alternativa vegetal (Collagen Vege).'
                  : 'Contains native tropocollagen extracted from freshwater fish skins. For patients with documented severe marine fish allergies, plant-derived Collagen Vege is recommended.'}
              </div>
            </div>

            {/* Scalp wounds / Post-transplant */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} color="#0d9488" />
                <span>{isEs ? 'Injerto Capilar & Cuero Cabelludo' : 'Hair Transplant Compatibility'}</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#475569', lineHeight: 1.4 }}>
                {isEs
                  ? 'Totalmente seguro en pacientes post-injerto capilar (FUE/FUT) a partir del día 14, una vez completada la reepitelización de las zonas receptoras.'
                  : 'Fully safe and beneficial for post-FUE/FUT hair transplant patients starting on Day 14 once recipient sites have re-epithelialized.'}
              </div>
            </div>
          </div>
        </div>
      </PublicSectionCard>
      )}

      {/* Single Section Footer Navigation Strip */}
      {onSelectSection && tocSections.length > 0 && !showAll && (
        <ProductSectionFooterNav
          activeSection={currentSection}
          sections={tocSections}
          onSelectSection={onSelectSection}
          lang={lang}
        />
      )}
    </div>
  );
}
