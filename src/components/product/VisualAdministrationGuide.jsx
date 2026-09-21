/**
 * src/components/product/VisualAdministrationGuide.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Ultra-visual, intuitive step-by-step administration guide for all peptide
 * delivery formats: Pens, Lyophilized Vials, Metered Sprays, and Capsules.
 * Minimal text, rich graphics, micro-animations, and full responsive support.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Droplets,
  RotateCw,
  Crosshair,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import './VisualAdministrationGuide.css';

export default function VisualAdministrationGuide({
  activeFormatId = 'vial',
  lang = 'en'
}) {
  const isEs = lang === 'es';

  // Determine current format mode
  const currentFormat = (() => {
    const id = String(activeFormatId || '').toLowerCase();
    if (id.includes('pen') || id.includes('cartridge')) return 'pen';
    if (id.includes('spray') || id.includes('nasal')) return 'spray';
    if (id.includes('capsule') || id.includes('tablet') || id.includes('oral')) return 'capsule';
    return 'vial';
  })();

  const [activeTab, setActiveTab] = useState(currentFormat);

  // Sync if prop changes
  React.useEffect(() => {
    setActiveTab(currentFormat);
  }, [currentFormat]);

  const guides = {
    pen: {
      title: isEs ? 'Bolígrafo Precargado Multi-Dosis' : 'Prefilled Multi-Dose Dial Pen',
      subtitle: isEs ? 'Guía visual de aplicación subcutánea de alta precisión' : 'High-precision subcutaneous administration protocol',
      badge: isEs ? 'Calibración Precisa' : 'Micro-Click Calibrated',
      steps: [
        {
          num: '01',
          title: isEs ? 'Acople de Aguja' : 'Attach Micro-Needle',
          desc: isEs ? 'Enroscar firmemente aguja estéril 31G (4 mm).' : 'Screw on sterile 31G (4mm) needle straight and tight.',
          detail: isEs ? 'Retirar capuchón exterior e interior sin tocar la aguja.' : 'Remove outer and inner shields; keep outer for disposal.',
          icon: '🔩',
          actionTip: isEs ? 'Aguja nueva en cada inyección' : 'New needle per injection'
        },
        {
          num: '02',
          title: isEs ? 'Purga de Seguridad' : 'Safety Prime',
          desc: isEs ? 'Girar 1 clic, apuntar hacia arriba y pulsar.' : 'Dial 1 click, hold upright, and depress button.',
          detail: isEs ? 'Verificar que asome una micro-gota en la punta.' : 'Confirm a tiny droplet appears at the needle tip.',
          icon: '💧',
          actionTip: isEs ? 'Elimina micro-burbujas' : 'Clears air bubbles'
        },
        {
          num: '03',
          title: isEs ? 'Selección de Dosis' : 'Dial Prescribed Dose',
          desc: isEs ? 'Girar selector hasta el número indicado en la ventana.' : 'Turn dial until exact units align in display window.',
          detail: isEs ? 'Si te pasas de dosis, puedes girar hacia atrás sin perder péptido.' : 'Dial can be dialed backward if you exceed target dose.',
          icon: '🎯',
          actionTip: isEs ? 'Visor de aumento visible' : 'Magnified unit window'
        },
        {
          num: '04',
          title: isEs ? 'Inyección a 90° y 10s' : 'Inject & 10s Hold',
          desc: isEs ? 'Insertar a 90° en abdomen/muslo, pulsar y contar 10s.' : 'Insert 90° in abdomen, push down fully, count to 10.',
          detail: isEs ? 'Esperar 10 segundos antes de retirar para absorción 100% sin reflujo.' : 'Holding 10s prevents droplet leakage and ensures full dose.',
          icon: '⏱️',
          actionTip: isEs ? '10 segundos de retención' : '10-second hold rule'
        }
      ]
    },
    vial: {
      title: isEs ? 'Vial Liofilizado Subcutáneo' : 'Lyophilized SubQ Vial',
      subtitle: isEs ? 'Protocolo de reconstitución aséptica y conservación activa' : 'Aseptic reconstitution & delicate peptide preservation protocol',
      badge: isEs ? 'Cadena Polipeptídica Intacta' : 'Polypeptide Chain Protected',
      steps: [
        {
          num: '01',
          title: isEs ? 'Desinfección Aséptica' : 'Aseptic Swab',
          desc: isEs ? 'Limpiar tapón de goma con toallita de alcohol al 70%.' : 'Clean rubber septums of vial and diluent with 70% alcohol.',
          detail: isEs ? 'Dejar secar 10 segundos al aire antes de perforar.' : 'Allow to air dry for 10 seconds before needle penetration.',
          icon: '🧼',
          actionTip: isEs ? 'Técnica 100% estéril' : 'Sterile barrier intact'
        },
        {
          num: '02',
          title: isEs ? 'Flujo Suave a 45°' : 'Gentle 45° Angle Flow',
          desc: isEs ? 'Inyectar el agua resbalando por la pared de cristal.' : 'Direct diluent stream gently down the inner glass wall.',
          detail: isEs ? 'NUNCA proyectar el chorro directo sobre el polvo de péptido.' : 'NEVER spray diluent directly onto the delicate lyophilized cake.',
          icon: '🌊',
          actionTip: isEs ? 'Flujo por la pared' : 'Wall-guided stream'
        },
        {
          num: '03',
          title: isEs ? 'Rotación Suave (No Agitar)' : 'Gentle Swirl (No Shaking)',
          desc: isEs ? 'Girar el vial suavemente entre los dedos.' : 'Gently roll and swirl vial between fingers until fully clear.',
          detail: isEs ? 'AGITAR con fuerza destruye los enlaces peptídicos.' : 'Vigorous SHAKING breaks fragile amino acid chains.',
          icon: '🔄',
          actionTip: isEs ? 'Solución cristalina' : 'Crystal-clear solution'
        },
        {
          num: '04',
          title: isEs ? 'Cargar Dosis & Nevera' : 'Draw Dose & Refrigerate',
          desc: isEs ? 'Invertir vial y extraer con jeringa U-100.' : 'Invert vial, draw exact units, and store at 2°C–8°C.',
          detail: isEs ? 'Conservar protegido de la luz directa en el refrigerador.' : 'Store upright and light-shielded inside refrigeration.',
          icon: '❄️',
          actionTip: isEs ? '2°C a 8°C constante' : '2°C to 8°C cold chain'
        }
      ]
    },
    spray: {
      title: isEs ? 'Spray Nasal Dosificado' : 'Metered Intranasal Spray',
      subtitle: isEs ? 'Absorción directa vía mucosa nasal y barrera hematoencefálica' : 'Direct mucosal absorption & blood-brain barrier transport pathway',
      badge: isEs ? 'Micro-Niebla Uniforme' : 'Precision Micro-Mist',
      steps: [
        {
          num: '01',
          title: isEs ? 'Limpieza Nasal' : 'Clear Nasal Passages',
          desc: isEs ? 'Sonarse la nariz suavemente antes de aplicar.' : 'Gently blow nose to clear obstruction for mucosal contact.',
          detail: isEs ? 'Asegura que la micro-niebla entre en contacto directo con la mucosa.' : 'Ensures uniform bioavailability without mucus blockage.',
          icon: '👃',
          actionTip: isEs ? 'Vía aérea despejada' : 'Clear airway'
        },
        {
          num: '02',
          title: isEs ? 'Purga Inicial (2 Puffs)' : 'Prime Pump (2 Puffs)',
          desc: isEs ? 'Presionar 2 veces al aire si es el primer uso.' : 'Press pump 2 times into air if first use or unused for >48h.',
          detail: isEs ? 'Verificar que la dispersión sea una nube homogénea y constante.' : 'Ensures a full, metered dose volume is calibrated.',
          icon: '💨',
          actionTip: isEs ? 'Calibración de volumen' : 'Full dose delivery'
        },
        {
          num: '03',
          title: isEs ? 'Inclinación y Ángulo' : 'Forward Tilt & Outer Angle',
          desc: isEs ? 'Inclinar cabeza hacia adelante, apuntar hacia la oreja.' : 'Tilt head slightly forward; aim tip outward toward the ear.',
          detail: isEs ? 'EVITAR apuntar al tabique central para prevenir irritación.' : 'AVOID aiming at the central nasal septum to prevent irritation.',
          icon: '📐',
          actionTip: isEs ? 'Apuntar hacia el lateral' : 'Aim outward, not center'
        },
        {
          num: '04',
          title: isEs ? 'Puff e Inhalación Suave' : 'Actuate & Gentle Inhale',
          desc: isEs ? 'Pulsar a fondo mientras inhalas suavemente por la nariz.' : 'Depress pump fully while gently inhaling through nose.',
          detail: isEs ? 'No esnifar con fuerza (evita que el líquido baje a la garganta).' : 'Do not sniff aggressively; keep peptide inside nasal cavity.',
          icon: '✨',
          actionTip: isEs ? 'Respiración tranquila' : 'Gentle breath'
        }
      ]
    },
    capsule: {
      title: isEs ? 'Cápsula Gastro-Resistente' : 'Gastro-Resistant Oral Capsule',
      subtitle: isEs ? 'Liberación entérica protegida contra los ácidos gástricos' : 'Targeted enteric release shielding peptides from gastric acids',
      badge: isEs ? 'Cubierta Entérica Activa' : 'Acid-Resistant Coating',
      steps: [
        {
          num: '01',
          title: isEs ? 'Estricto Ayuno' : 'Strict Fasting Window',
          desc: isEs ? 'Tomar con el estómago vacío por la mañana.' : 'Administer first thing in the morning on an empty stomach.',
          detail: isEs ? 'Mínimo 30–45 minutos antes del desayuno o cafeína.' : 'Wait 30–45 minutes before food, coffee, or hot beverages.',
          icon: '🌅',
          actionTip: isEs ? 'Máxima biodisponibilidad' : 'Peak absorption'
        },
        {
          num: '02',
          title: isEs ? 'Vaso de Agua Natural' : 'Full Glass of Water',
          desc: isEs ? 'Tragar con 250 mL de agua a temperatura ambiente.' : 'Swallow with 250 mL of room-temperature water.',
          detail: isEs ? 'Facilita el tránsito rápido por el esófago hacia el duodeno.' : 'Accelerates transit into the small intestine.',
          icon: '🥛',
          actionTip: isEs ? 'Agua templada / fresca' : 'Room temp water'
        },
        {
          num: '03',
          title: isEs ? 'Cápsula Entera (No Abrir)' : 'Never Crush or Open',
          desc: isEs ? 'Tragar la cápsula intacta, nunca masticar.' : 'Swallow whole. Never chew, crush, or open powder.',
          detail: isEs ? 'La cápsula resiste el pH ácido estomacal para abrirse en el intestino.' : 'Enteric shell protects fragile peptide from pepsin and stomach acid.',
          icon: '🛡️',
          actionTip: isEs ? 'Integridad entérica' : 'Acid protection'
        },
        {
          num: '04',
          title: isEs ? 'Ventana de Espera (30m)' : '30-Minute Rest Window',
          desc: isEs ? 'Esperar 30 minutos antes de ingerir alimentos o café.' : 'Allow 30 minutes before meal or morning coffee intake.',
          detail: isEs ? 'Permite absorción completa en la mucosa intestinal sin interferencias.' : 'Ensures unhindered peptide uptake via intestinal tight junctions.',
          icon: '☕',
          actionTip: isEs ? '30 minutos de absorción' : 'Optimal uptake'
        }
      ]
    }
  };

  const activeGuide = guides[activeTab] || guides.vial;

  return (
    <div className="vag-root">
      {/* ── Format Switcher Tabs ── */}
      <div className="vag-format-nav">
        <button
          type="button"
          className={`vag-tab-btn ${activeTab === 'vial' ? 'active' : ''}`}
          onClick={() => setActiveTab('vial')}
        >
          <span className="vag-tab-emoji">🧪</span>
          <div className="vag-tab-labels">
            <span className="vag-tab-title">{isEs ? 'Vial SubQ' : 'SubQ Vial'}</span>
            <span className="vag-tab-sub">{isEs ? 'Liofilizado' : 'Lyophilized'}</span>
          </div>
        </button>

        <button
          type="button"
          className={`vag-tab-btn ${activeTab === 'pen' ? 'active' : ''}`}
          onClick={() => setActiveTab('pen')}
        >
          <span className="vag-tab-emoji">🖊️</span>
          <div className="vag-tab-labels">
            <span className="vag-tab-title">{isEs ? 'Pen SubQ' : 'Dial Pen'}</span>
            <span className="vag-tab-sub">{isEs ? 'Precargado' : 'Prefilled'}</span>
          </div>
        </button>

        <button
          type="button"
          className={`vag-tab-btn ${activeTab === 'spray' ? 'active' : ''}`}
          onClick={() => setActiveTab('spray')}
        >
          <span className="vag-tab-emoji">👃</span>
          <div className="vag-tab-labels">
            <span className="vag-tab-title">{isEs ? 'Spray Nasal' : 'Nasal Spray'}</span>
            <span className="vag-tab-sub">{isEs ? 'Dosificado' : 'Metered'}</span>
          </div>
        </button>

        <button
          type="button"
          className={`vag-tab-btn ${activeTab === 'capsule' ? 'active' : ''}`}
          onClick={() => setActiveTab('capsule')}
        >
          <span className="vag-tab-emoji">💊</span>
          <div className="vag-tab-labels">
            <span className="vag-tab-title">{isEs ? 'Cápsulas' : 'Capsules'}</span>
            <span className="vag-tab-sub">{isEs ? 'Gastro-Resistente' : 'Enteric'}</span>
          </div>
        </button>
      </div>

      {/* ── Active Format Header ── */}
      <div className="vag-guide-header">
        <div className="vag-guide-titles">
          <div className="vag-header-badge-row">
            <span className="vag-badge-highlight">{activeGuide.badge}</span>
            <span className="vag-badge-steps">
              <Clock size={12} /> {isEs ? 'Protocolo en 4 Pasos' : '4-Step Clinical Protocol'}
            </span>
          </div>
          <h3 className="vag-guide-title">{activeGuide.title}</h3>
          <p className="vag-guide-subtitle">{activeGuide.subtitle}</p>
        </div>
      </div>

      {/* ── 4 Step Visual Cards Grid ── */}
      <div className="vag-steps-grid">
        {activeGuide.steps.map((st, idx) => (
          <div key={idx} className="vag-step-card">
            <div className="vag-step-top">
              <div className="vag-step-num-badge">{st.num}</div>
              <span className="vag-step-icon">{st.icon}</span>
            </div>

            <h4 className="vag-step-title">{st.title}</h4>
            <p className="vag-step-desc">{st.desc}</p>

            <div className="vag-step-detail-box">
              <span className="vag-step-detail-text">{st.detail}</span>
            </div>

            <div className="vag-step-footer">
              <CheckCircle2 size={13} className="vag-step-check" />
              <span className="vag-step-tip">{st.actionTip}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
