"use client";

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Droplets, 
  RotateCw, 
  Snowflake, 
  Activity, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  Check,
  X as XIcon,
  AlertTriangle,
  Beaker
} from '@/lib/icons';
import './ClinicalHandlingProtocolStepper.css';

/**
 * Clinical Handling Protocols Data Dictionary
 * Normalized across all commercial and institutional peptide formats.
 */
const PROTOCOL_FORMATS = {
  vial: {
    id: 'vial',
    label: 'Lyophilized Vial (SubQ)',
    badgeLabel: 'Lyophilized Sterile Powder',
    icon: '🧪',
    subtitle: 'Step-by-step reconstitution and aseptic injection protocol with Bacteriostatic Water (BAC).',
    steps: [
      {
        step: 1,
        title: 'Aseptic Antisepsis',
        headline: 'Disinfect Rubber Septum',
        action: 'Swab the rubber stopper thoroughly with a 70% isopropyl alcohol wipe and allow 30 seconds to air-dry completely.',
        doText: 'Air-dry 30 seconds',
        dontText: 'Never touch stopper after swabbing',
        icon: CheckCircle2,
        accent: '#0d9488'
      },
      {
        step: 2,
        title: 'Slow Wall Addition',
        headline: '45° Angle BAC Water Injection',
        action: 'Inject prescribed BAC water slowly down the interior glass wall at a 45° angle to protect peptide structure.',
        doText: 'Flow gently down glass wall',
        dontText: 'Never jet directly onto powder cake',
        icon: Droplets,
        accent: '#0284c7'
      },
      {
        step: 3,
        title: 'Gentle Dissolution',
        headline: 'Roll Between Palms',
        action: 'Swirl or roll the vial gently between palms until solution is 100% transparent and crystal clear.',
        doText: 'Slow palm rolling motion',
        dontText: 'PROHIBITED: Shaking or vortexing',
        icon: RotateCw,
        accent: '#8b5cf6'
      },
      {
        step: 4,
        title: 'Cold-Chain Storage',
        headline: '2°C–8°C Refrigerator Guard',
        action: 'Store reconstituted vial immediately in an upright position at 2°C to 8°C (36°F–46°F), protected from light.',
        doText: 'Upright at 2°C–8°C (28-30 days)',
        dontText: 'Never freeze reconstituted liquid',
        icon: Snowflake,
        accent: '#003666'
      }
    ]
  },
  pen: {
    id: 'pen',
    label: 'Pre-filled Pen (Multi-Dose)',
    badgeLabel: 'SubQ Dial Delivery Device',
    icon: '🖊️',
    subtitle: 'Precision micro-dial subcutaneous injection protocol with sterile disposable needles.',
    steps: [
      {
        step: 1,
        title: 'Needle Mounting',
        headline: 'Attach Sterile 31G/32G Needle',
        action: 'Inspect cartridge clarity through the window, swab septum, and firmly screw on a new sterile pen needle.',
        doText: 'New sterile needle each dose',
        dontText: 'Never reuse or bend needles',
        icon: CheckCircle2,
        accent: '#0d9488'
      },
      {
        step: 2,
        title: 'Safety Priming',
        headline: '1-2 Test Clicks Air-Purge',
        action: 'Dial 1-2 test units, hold pen upright with needle pointing up, and press button until a droplet appears.',
        doText: 'Confirms needle flow & expels air',
        dontText: 'Never inject without priming test',
        icon: Droplets,
        accent: '#0284c7'
      },
      {
        step: 3,
        title: 'Dose Dialing',
        headline: '90° SubQ Hold 6–10 Seconds',
        action: 'Dial prescribed dose into window. Insert needle at 90° into subcutaneous tissue and hold push-button for 6–10s.',
        doText: 'Hold 6–10s before withdrawing',
        dontText: 'Do not massage injection site',
        icon: Activity,
        accent: '#8b5cf6'
      },
      {
        step: 4,
        title: 'Storage & Guard',
        headline: 'Discard Needle & Refrigerate',
        action: 'Unscrew needle into a sharps container immediately. Replace pen cap and store refrigerated at 2°C to 8°C.',
        doText: 'Store refrigerated (2°C–8°C)',
        dontText: 'NEVER store pen with needle on',
        icon: Snowflake,
        accent: '#003666'
      }
    ]
  },
  spray: {
    id: 'spray',
    label: 'Nasal Spray (Intranasal)',
    badgeLabel: 'Intranasal Micronized Solution',
    icon: '👃',
    subtitle: 'Direct mucosal absorption protocol for cognitive and neuroactive peptide formulations.',
    steps: [
      {
        step: 1,
        title: 'Pump Priming',
        headline: 'Test Pump 2 Times',
        action: 'Shake bottle gently and depress pump twice into the air until a uniform, fine aerosol mist is produced.',
        doText: 'Verify fine micro-mist spray',
        dontText: 'Do not spray toward eyes or face',
        icon: Droplets,
        accent: '#0d9488'
      },
      {
        step: 2,
        title: 'Head Alignment',
        headline: 'Keep Head Level / Upright',
        action: 'Gently blow nose to clear passages. Keep head level or tilted slightly forward (do NOT lean backwards).',
        doText: 'Head upright or slight chin-down',
        dontText: 'Never tilt head back (enters throat)',
        icon: Activity,
        accent: '#0284c7'
      },
      {
        step: 3,
        title: 'Gentle Inhalation',
        headline: 'Slow Nasal Breath on Spray',
        action: 'Insert tip into nostril pointing slightly toward outer eye. Depress actuator while breathing in gently.',
        doText: 'Slow, gentle inhalation',
        dontText: 'Do not snort hard or swallow',
        icon: Sparkles,
        accent: '#8b5cf6'
      },
      {
        step: 4,
        title: 'Clean & Store',
        headline: 'Wipe Nozzle & Cap Upright',
        action: 'Wipe applicator nozzle with clean tissue, securely replace protective cap, and store upright.',
        doText: 'Store upright at 2°C–8°C or cool room',
        dontText: 'Never immerse actuator in water',
        icon: ShieldCheck,
        accent: '#003666'
      }
    ]
  },
  capsule: {
    id: 'capsule',
    label: 'Oral Capsules / Troches',
    badgeLabel: 'Gastro-Resistant Oral Form',
    icon: '💊',
    subtitle: 'Systemic oral peptide protocol with specialized gastro-protective enteric delivery.',
    steps: [
      {
        step: 1,
        title: 'Dosing Window',
        headline: 'Empty Stomach with Full Glass',
        action: 'Take 30 minutes before morning meal with a full 250 mL glass of water for optimal bioavailability.',
        doText: 'Full 250 mL glass of plain water',
        dontText: 'Avoid hot acidic coffee or citrus',
        icon: Clock,
        accent: '#0d9488'
      },
      {
        step: 2,
        title: 'Capsule Integrity',
        headline: 'Swallow Intact (No Chewing)',
        action: 'Swallow whole to preserve specialized enteric matrix designed to shield peptides from stomach acid.',
        doText: 'Swallow whole capsule intact',
        dontText: 'Never crush, bite, or open capsule',
        icon: CheckCircle2,
        accent: '#0284c7'
      },
      {
        step: 3,
        title: 'Daily Cadence',
        headline: 'Consistent Daily Timing',
        action: 'Maintain the same daily administration window to achieve consistent steady-state tissue levels.',
        doText: 'Consistent daily administration',
        dontText: 'Do not double dose if forgotten',
        icon: Activity,
        accent: '#8b5cf6'
      },
      {
        step: 4,
        title: 'Dry Storage',
        headline: '15°C–25°C Dry Medicine Cabinet',
        action: 'Keep bottle tightly sealed in a cool, dry area away from direct sunlight and ambient humidity.',
        doText: 'Store tightly sealed at 15°C–25°C',
        dontText: 'Do not store in humid bathrooms',
        icon: ShieldCheck,
        accent: '#003666'
      }
    ]
  },
  diagnostic_test: {
    id: 'diagnostic_test',
    label: 'Diagnostic Test (Capillary DBS)',
    badgeLabel: 'CE-IVDR Specimen Collection',
    icon: '🩸',
    subtitle: 'Validated home capillary dried blood spot collection and transport instructions for certified lab analysis.',
    steps: [
      {
        step: 1,
        title: 'Capillary Flow',
        headline: 'Wash with Warm Water',
        action: 'Wash hands in warm water for 2 minutes to stimulate peripheral capillary blood flow, then disinfect fingertip.',
        doText: 'Warm water increases capillary flow',
        dontText: 'Do not blow on wet alcohol swab',
        icon: CheckCircle2,
        accent: '#0d9488'
      },
      {
        step: 2,
        title: 'Finger Prick',
        headline: 'Lateral Lancet & Wipe 1st Drop',
        action: 'Press lancet against lateral side of ring finger. Wipe away the initial droplet with clean sterile gauze.',
        doText: 'Lateral side (less nerve endings)',
        dontText: 'Wipe 1st drop (contains tissue fluid)',
        icon: Activity,
        accent: '#0284c7'
      },
      {
        step: 3,
        title: 'Card Collection',
        headline: 'Fill 3 Filter Circles',
        action: 'Allow large blood drops to fall freely onto the 3 marked circles on the collection card until fully saturated.',
        doText: 'Fill circles completely front & back',
        dontText: 'Never press skin directly on paper',
        icon: Droplets,
        accent: '#8b5cf6'
      },
      {
        step: 4,
        title: 'Dry & Dispatch',
        headline: 'Air-Dry 30 Min & Seal in Pouch',
        action: 'Let the card air-dry flat for 30 minutes. Seal inside desiccant foil envelope and place into prepaid return mailer.',
        doText: 'Air-dry 30 min before pouching',
        dontText: 'Never seal wet card into foil bag',
        icon: ShieldCheck,
        accent: '#003666'
      }
    ]
  }
};

/**
 * Determine default format from product attributes
 */
function resolveInitialFormat(product, activeFormatId) {
  if (activeFormatId && PROTOCOL_FORMATS[activeFormatId]) {
    return activeFormatId;
  }
  const s = String(product?.slug || product?.id || '').toLowerCase();
  const f = String(product?.format || product?.presentation || '').toLowerCase();
  const c = String(product?.category || '').toLowerCase();

  if (s.includes('test') || s.includes('blood') || f.includes('blood') || c.includes('diagnostic')) return 'diagnostic_test';
  if (s.includes('spray') || f.includes('spray') || f.includes('nasal')) return 'spray';
  if (s.includes('pen') || f.includes('pen') || f.includes('cartridge')) return 'pen';
  if (s.includes('capsule') || f.includes('capsule') || f.includes('oral') || f.includes('tablet')) return 'capsule';
  return 'vial';
}

export default function ClinicalHandlingProtocolStepper({
  product,
  activeFormatId = 'vial',
  lang = 'en',
  dynamicSolventText = null,
}) {
  const initial = resolveInitialFormat(product, activeFormatId);
  const [selectedFormat, setSelectedFormat] = useState(initial);

  const activeProtocol = PROTOCOL_FORMATS[selectedFormat] || PROTOCOL_FORMATS.vial;

  return (
    <div className="chp-container">
      {/* Header & Format Toggle Bar */}
      <div className="chp-header">
        <div className="chp-header-left">
          <div className="chp-header-icon-badge">
            <Sparkles size={20} color="#003666" />
          </div>
          <div>
            <div className="chp-meta-pill-row">
              <span className="chp-meta-category">
                {lang === 'es' ? 'PROTOCOLO CLÍNICO DE MANIPULACIÓN Y APLICACIÓN' : 'CLINICAL ADMINISTRATION & HANDLING PROTOCOL'}
              </span>
              <span className="chp-active-badge">
                {activeProtocol.badgeLabel}
              </span>
            </div>
            <h3 className="chp-title">
              {lang === 'es' ? 'Guía Visual de Aplicación por Formato' : 'Visual Administration Guide by Format'}
            </h3>
            <p className="chp-subtitle">
              {activeProtocol.subtitle}
            </p>
          </div>
        </div>

        {/* Format Selector Chips */}
        <div className="chp-format-selector" role="tablist" aria-label="Device Format Selection">
          {Object.values(PROTOCOL_FORMATS).map((fmt) => {
            const isSelected = fmt.id === selectedFormat;
            return (
              <button
                key={fmt.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedFormat(fmt.id)}
                className={`chp-format-chip ${isSelected ? 'active' : ''}`}
              >
                <span className="chp-format-chip-icon">{fmt.icon}</span>
                <span className="chp-format-chip-text">{fmt.label.split(' (')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4-Step Visual Grid */}
      <div className="chp-grid">
        {activeProtocol.steps.map((item) => {
          const IconComponent = item.icon;
          const isSolventStep = activeProtocol.id === 'vial' && item.step === 2 && dynamicSolventText;
          const actionText = isSolventStep ? dynamicSolventText : item.action;

          return (
            <div key={item.step} className="chp-card">
              {/* Step Header */}
              <div className="chp-card-top">
                <div className="chp-step-badge" style={{ backgroundColor: item.accent }}>
                  {item.step}
                </div>
                <div className="chp-icon-wrap" style={{ color: item.accent, backgroundColor: `${item.accent}12` }}>
                  <IconComponent size={20} />
                </div>
                <div className="chp-step-phase-tag">
                  STEP {item.step}
                </div>
              </div>

              {/* Step Title & Micro-Action */}
              <div className="chp-card-body">
                <h4 className="chp-step-title">{item.title}</h4>
                <div className="chp-step-headline">{item.headline}</div>
                <p className="chp-step-action">{actionText}</p>
              </div>

              {/* Safety Badges: DO & DON'T */}
              <div className="chp-card-footer">
                <div className="chp-rule-pill do">
                  <Check size={12} className="chp-rule-icon" />
                  <span>{item.doText}</span>
                </div>
                <div className="chp-rule-pill dont">
                  <XIcon size={12} className="chp-rule-icon" />
                  <span>{item.dontText}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
