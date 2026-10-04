"use client";

import React, { useState, useMemo } from 'react';
import { 
  Droplet, 
  Droplets,
  FlaskConical, 
  Thermometer, 
  Snowflake, 
  Archive, 
  FileText, 
  Printer, 
  Check, 
  CheckCircle2,
  Copy, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Download,
  AlertTriangle,
  QrCode,
  Pill,
  Syringe,
  Clock,
  Sparkles
} from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';
import { toast } from 'react-hot-toast';
import PrecisionSyringeVisualizer from './PrecisionSyringeVisualizer';
import { calculateReconstitution, STANDARD_PRESENTATIONS } from './monographCalculationEngine';
import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal';

function parseNumber(val, fallback = 10) {
  if (!val) return fallback;
  const m = String(val).match(/([\d.]+)\s*(mg|mcg|µg|iu)?/i);
  if (!m) return fallback;
  let n = parseFloat(m[1]);
  if (m[2] && (m[2].toLowerCase() === 'mcg' || m[2].toLowerCase() === 'µg')) {
    n = n / 1000;
  }
  return isNaN(n) ? fallback : n;
}

export default function PreparationTab({
  product = {},
  slug = 'pt-141',
  effectiveBatch = 'AS-LOT-PT05-2609',
  activeFormat,
  selectedStrength,
  availableFormats = [],
  sortedStrengths = [],
  presentationMatrixRows = [],
  supplierName
}) {
  // Label preview ("preview first, then print")
  const [labelPreview, setLabelPreview] = useState(null); // { url, downloadUrl, title, subtitle, name }

  // ── 1. Determine Exact Presentation Category ──
  const formatStr = String(
    activeFormat?.id ||
    activeFormat?.name ||
    product?.format ||
    product?.presentation ||
    product?.variants?.[0]?.format ||
    product?.variants?.[0]?.presentation ||
    ''
  ).toLowerCase();

  const isSpray = formatStr.includes('spray') || formatStr.includes('nasal');
  const isPen = formatStr.includes('pen') || formatStr.includes('cartridge');
  const isSublingual = formatStr.includes('sublingual') || formatStr.includes('drop');
  const isOral = formatStr.includes('capsule') || formatStr.includes('tablet') || formatStr.includes('oral');
  const isVial = !isSpray && !isPen && !isSublingual && !isOral;

  // ── 2. Derive Dynamic Available Strengths ──
  const dynamicStrengths = useMemo(() => {
    if (sortedStrengths && sortedStrengths.length > 0) {
      return sortedStrengths.map(s => ({
        id: s.id,
        name: s.name,
        mg: parseNumber(s.name, 10)
      }));
    }
    if (product.variants && product.variants.length > 0) {
      return product.variants.map((v, i) => {
        const name = v.dosage || v.dose || v.strength || (isSpray ? '30 mg' : isPen ? '6 mg' : '10 mg');
        return {
          id: v.id || `st-${i}`,
          name: typeof name === 'string' ? name : `${name} mg`,
          mg: parseNumber(name, 10)
        };
      });
    }
    if (isSpray) return [{ id: '30mg', name: '30 mg (4 mL)', mg: 30 }, { id: '75mg', name: '75 mg (10 mL)', mg: 75 }];
    if (isPen) return [{ id: '6mg', name: '6 mg (3 mL)', mg: 6 }, { id: '10mg', name: '10 mg (3 mL)', mg: 10 }];
    if (isSublingual) return [{ id: '30mg', name: '30 mg (30 mL)', mg: 30 }, { id: '60mg', name: '60 mg (30 mL)', mg: 60 }];
    if (isOral) return [{ id: '250mcg', name: '250 mcg', mg: 0.25 }, { id: '500mcg', name: '500 mcg', mg: 0.5 }, { id: '5mg', name: '5 mg', mg: 5 }];
    return [{ id: '5mg', name: '5 mg', mg: 5 }, { id: '10mg', name: '10 mg', mg: 10 }, { id: '20mg', name: '20 mg', mg: 20 }];
  }, [sortedStrengths, product.variants, isSpray, isPen, isSublingual, isOral]);

  const initialStrengthMg = dynamicStrengths[0]?.mg || (isSpray ? 30 : isPen ? 6 : 10);

  // ── States for Vial Reconstitution ──
  const [selectedVialStrength, setSelectedVialStrength] = useState(initialStrengthMg);
  const [selectedBacVolume, setSelectedBacVolume] = useState(2.0);
  const [targetDoseMg, setTargetDoseMg] = useState(1.25);

  // ── States for Nasal Spray ──
  const [selectedSprayStrength, setSelectedSprayStrength] = useState(initialStrengthMg);
  const [numSprays, setNumSprays] = useState(1);

  // ── States for Pen ──
  const [selectedPenStrength, setSelectedPenStrength] = useState(initialStrengthMg);
  const [penClicks, setPenClicks] = useState(10); // 10 clicks = 0.1 mL

  // ── States for Sublingual ──
  const [selectedSublingualStrength, setSelectedSublingualStrength] = useState(initialStrengthMg);
  const [dropperVolumeMl, setDropperVolumeMl] = useState(0.5);

  // ── States for Oral ──
  const [selectedOralStrength, setSelectedOralStrength] = useState(initialStrengthMg);
  const [capsuleCount, setCapsuleCount] = useState(1);

  // ── Stepper Accordion State ──
  const [expandedSteps, setExpandedSteps] = useState({ 1: true, 2: false, 3: false, 4: false, 5: false, 6: false });
  const [copiedLink, setCopiedLink] = useState(false);

  // Synchronize initial strength selection when product or active strength changes
  React.useEffect(() => {
    if (selectedStrength) {
      const parsed = parseNumber(selectedStrength.name || selectedStrength.id, null);
      if (parsed) {
        setSelectedVialStrength(parsed);
        setSelectedSprayStrength(parsed);
        setSelectedPenStrength(parsed);
        setSelectedSublingualStrength(parsed);
        setSelectedOralStrength(parsed);
      }
    }
  }, [selectedStrength]);

  // Calculations for Vial Reconstitution
  const recon = useMemo(() => {
    return calculateReconstitution({
      vialStrengthMg: selectedVialStrength,
      bacVolumeMl: selectedBacVolume,
      targetDoseMg
    });
  }, [selectedVialStrength, selectedBacVolume, targetDoseMg]);

  // Calculations for Nasal Spray (0.1 mL per spray, bottle 10 mL or 4 mL)
  const sprayCalc = useMemo(() => {
    let bottleVolumeMl = 10.0;
    const volMatch = String(
      selectedStrength?.fill_volume || 
      selectedStrength?.pack_size || 
      selectedStrength?.volume || 
      selectedStrength?.name || 
      selectedStrength?.id || 
      product?.name || 
      ''
    ).match(/(\d+(?:\.\d+)?)\s*m[lL]/i);

    if (volMatch) {
      bottleVolumeMl = parseFloat(volMatch[1]);
    } else if (selectedSprayStrength === 30) {
      bottleVolumeMl = 4.0;
    } else if (selectedSprayStrength === 75) {
      bottleVolumeMl = 10.0;
    }

    const concentration = selectedSprayStrength / bottleVolumeMl;
    const dosePerSprayMg = concentration * 0.1;
    const totalDoseDeliveredMg = dosePerSprayMg * numSprays;
    const totalSpraysPerBottle = Math.round(bottleVolumeMl / 0.1);
    const totalApplications = Math.floor(totalSpraysPerBottle / numSprays);

    return {
      bottleVolumeMl,
      concentrationDisplay: `${concentration.toFixed(2)} mg/mL`,
      dosePerSprayMg: Number(dosePerSprayMg.toFixed(3)),
      dosePerSprayDisplay: dosePerSprayMg < 1 ? `${Math.round(dosePerSprayMg * 1000)} µg` : `${dosePerSprayMg.toFixed(2)} mg`,
      totalDoseDeliveredMg: Number(totalDoseDeliveredMg.toFixed(3)),
      totalDoseDisplay: totalDoseDeliveredMg < 1 ? `${Math.round(totalDoseDeliveredMg * 1000)} µg` : `${totalDoseDeliveredMg.toFixed(2)} mg`,
      totalSpraysPerBottle,
      totalApplications
    };
  }, [selectedSprayStrength, numSprays, product.name, selectedStrength]);

  // Calculations for Pen (3.0 mL standard cartridge)
  const penCalc = useMemo(() => {
    const penVolumeMl = 3.0;
    const concentration = selectedPenStrength / penVolumeMl;
    const injectionVolumeMl = (penClicks * 0.01); // 10 clicks = 0.10 mL
    const deliveredDoseMg = concentration * injectionVolumeMl;
    const totalDoses = Math.floor(penVolumeMl / injectionVolumeMl);

    return {
      penVolumeMl,
      concentrationDisplay: `${concentration.toFixed(2)} mg/mL`,
      injectionVolumeMl: injectionVolumeMl.toFixed(2),
      deliveredDoseMg: Number(deliveredDoseMg.toFixed(3)),
      deliveredDoseDisplay: deliveredDoseMg < 1 ? `${Math.round(deliveredDoseMg * 1000)} µg` : `${deliveredDoseMg.toFixed(2)} mg`,
      totalDoses
    };
  }, [selectedPenStrength, penClicks]);

  // Calculations for Sublingual Dropper (30 mL bottle)
  const sublingualCalc = useMemo(() => {
    const bottleVolumeMl = 30.0;
    const concentration = selectedSublingualStrength / bottleVolumeMl;
    const deliveredDoseMg = concentration * dropperVolumeMl;
    const totalDoses = Math.floor(bottleVolumeMl / dropperVolumeMl);

    return {
      bottleVolumeMl,
      concentrationDisplay: `${concentration.toFixed(2)} mg/mL`,
      deliveredDoseMg: Number(deliveredDoseMg.toFixed(3)),
      deliveredDoseDisplay: deliveredDoseMg < 1 ? `${Math.round(deliveredDoseMg * 1000)} µg` : `${deliveredDoseMg.toFixed(2)} mg`,
      totalDoses
    };
  }, [selectedSublingualStrength, dropperVolumeMl]);

  // ── Universal Copy Protocol Handler ──
  const handleCopyPrepProtocol = () => {
    triggerHaptic('light');
    let text = '';
    const title = product.canonicalName || product.name || 'Peptide Monograph';

    if (isSpray) {
      text = [
        `CLINICAL INTRANASAL ADMINISTRATION PROTOCOL — ${title}`,
        `Device: Metered-Dose Intranasal Spray (0.1 mL/actuation)`,
        `Container Strength: ${selectedSprayStrength} mg in ${sprayCalc.bottleVolumeMl} mL (${sprayCalc.concentrationDisplay})`,
        `Dose Prescribed: ${numSprays} spray(s) (${sprayCalc.totalDoseDisplay})`,
        `Per-Spray Potency: ${sprayCalc.dosePerSprayDisplay} active API per actuation`,
        `Administration Route: Intranasal Mucosal (Needle-Free · Bilateral)`,
        `Doses per Container: ~${sprayCalc.totalApplications} administrations`,
        `Technique: 45° angle towards lateral nasal wall, gentle inhalation`,
        `Storage: Refrigerate at 2°C–8°C upright • Shelf Life: 60 Days Post-Opening`
      ].join('\n');
    } else if (isPen) {
      text = [
        `CLINICAL PRE-FILLED PEN ADMINISTRATION PROTOCOL — ${title}`,
        `Device: Multi-Dose Dial Pen (3.0 mL Cartridge)`,
        `Total Strength: ${selectedPenStrength} mg (${penCalc.concentrationDisplay})`,
        `Selected Dial Setting: ${penClicks} clicks (${penCalc.injectionVolumeMl} mL)`,
        `Delivered Dose: ${penCalc.deliveredDoseDisplay}`,
        `Administration Route: Subcutaneous (90° injection, 6–10s release hold)`,
        `Needle Compatibility: 31G or 32G 4mm/5mm Sterile Pen Needles`,
        `Storage: 2°C–8°C Refrigerated (In-use pen < 25°C up to 28 days)`
      ].join('\n');
    } else if (isSublingual) {
      text = [
        `CLINICAL SUBLINGUAL ADMINISTRATION PROTOCOL — ${title}`,
        `Vehicle: Calibrated Sublingual Solution (${sublingualCalc.bottleVolumeMl} mL)`,
        `Concentration: ${sublingualCalc.concentrationDisplay}`,
        `Prescribed Volume: ${dropperVolumeMl.toFixed(2)} mL Dropper`,
        `Delivered Dose: ${sublingualCalc.deliveredDoseDisplay}`,
        `Administration: Deposit under tongue, hold for 60–90 seconds before swallowing`,
        `Dietary Restriction: No food or liquids for 15 minutes post-dose`,
        `Storage: Cool, dry place (15°C–25°C) protected from direct sunlight`
      ].join('\n');
    } else if (isOral) {
      text = [
        `CLINICAL ORAL ADMINISTRATION PROTOCOL — ${title}`,
        `Formulation: Gastric-Resistant Enteric Solid Units`,
        `Unit Strength: ${selectedOralStrength >= 1 ? `${selectedOralStrength} mg` : `${Math.round(selectedOralStrength * 1000)} µg`} per capsule`,
        `Prescribed Intake: ${capsuleCount} unit(s) (${capsuleCount * selectedOralStrength} mg)`,
        `Administration: Morning on empty stomach with 250 mL room-temperature water`,
        `Fasting: Allow 30–45 minutes prior to breakfast or hot coffee`,
        `Storage: 15°C–25°C in airtight container with desiccant`
      ].join('\n');
    } else {
      text = [
        `RECONSTITUTION & PREPARATION PROTOCOL — ${title}`,
        `Vial Strength: ${selectedVialStrength} mg Lyophilized Powder`,
        `Diluent Added: ${selectedBacVolume.toFixed(1)} mL Bacteriostatic 0.9% Benzyl Alcohol Water`,
        `Resulting Concentration: ${recon.concentrationDisplay}`,
        `Target Dose: ${targetDoseMg} mg`,
        `Calculated Draw: ${recon.injectionVolumeDisplay} (${recon.syringeUnitsDisplay} in U-100 syringe)`,
        `Doses per Vial: ${recon.dosesPerVial}`,
        `Storage: 2°C–8°C Refrigerated • Beyond-Use Date: 28 Days`
      ].join('\n');
    }

    navigator.clipboard?.writeText(text);
    setCopiedLink(true);
    toast.success('Administration protocol copied ✓');
    setTimeout(() => setCopiedLink(false), 2200);
  };

  return (
    <div className="pds-tab-content pds-preparation-tab" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* ── 1. Clinical Volumetrics & Configuration Card ── */}
      <section style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '1.25rem 1.5rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Card Header with Badges and Copy */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '0.65rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <h2 style={{
                margin: 0,
                fontSize: '0.92rem',
                fontWeight: 800,
                color: '#003666',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {isSpray ? 'Intranasal Delivery & Dosing Simulator' :
                 isPen ? 'Multi-Dose Pen Administration & Dial Simulator' :
                 isSublingual ? 'Sublingual Dropper & Absorption Simulator' :
                 isOral ? 'Oral Enteric Delivery & Dosing Simulator' :
                 'Clinical Reconstitution & Dosing Simulator'}
              </h2>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.68rem',
                fontWeight: 800,
                background: isSpray ? '#f0fdf4' : isPen ? '#eff6ff' : isSublingual ? '#faf5ff' : isOral ? '#fff7ed' : '#ecfdf5',
                color: isSpray ? '#166534' : isPen ? '#1e40af' : isSublingual ? '#6b21a8' : isOral ? '#c2410c' : '#047857',
                border: `1px solid ${isSpray ? '#bbf7d0' : isPen ? '#bfdbfe' : isSublingual ? '#e9d5ff' : isOral ? '#fed7aa' : '#a7f3d0'}`
              }}>
                {isSpray ? 'Needle-Free · Intranasal' :
                 isPen ? 'Pre-filled SubQ Pen' :
                 isSublingual ? 'Needle-Free · Sublingual' :
                 isOral ? 'Enteric Oral Capsule' :
                 'Lyophilized Vial Reconstitution'}
              </span>
            </div>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: '#64748b' }}>
              {isSpray ? 'Pre-metered intranasal spray pump. Zero reconstitution required; select potency and number of sprays.' :
               isPen ? 'Calibrated borosilicate pen cartridge. Zero BAC water mixing; select potency and mechanical dial clicks.' :
               isSublingual ? 'Calibrated mucosal liquid vehicle. Zero reconstitution; select potency and dropper volume.' :
               isOral ? 'Acid-resistant solid oral units. Take on empty stomach with room-temperature water.' :
               'Select vial potency and diluent to compute exact concentration and draw volume.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopyPrepProtocol}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#1e293b',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {copiedLink ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
            <span>{copiedLink ? 'Copied ✓' : 'Copy Protocol'}</span>
          </button>
        </div>

        {/* ── A. NASAL SPRAY CONFIGURATION ── */}
        {isSpray && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
              marginBottom: '1.25rem'
            }}>
              {/* Bottle Potency Selector */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
                  1. Bottle Potency Presentation
                </label>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                  {dynamicStrengths.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic('selection');
                        setSelectedSprayStrength(s.mg);
                      }}
                      style={{
                        flex: 1,
                        minWidth: '70px',
                        padding: '8px',
                        borderRadius: '6px',
                        border: selectedSprayStrength === s.mg ? '1.5px solid #003666' : '1px solid #cbd5e1',
                        background: selectedSprayStrength === s.mg ? '#003666' : '#ffffff',
                        color: selectedSprayStrength === s.mg ? '#ffffff' : '#334155',
                        fontSize: '0.82rem',
                        fontWeight: selectedSprayStrength === s.mg ? 800 : 600,
                        cursor: 'pointer'
                      }}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of Sprays Selector */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
                  2. Actuations per Administration
                </label>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                  {[1, 2, 3, 4].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => {
                        triggerHaptic('selection');
                        setNumSprays(n);
                      }}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '6px',
                        border: numSprays === n ? '1.5px solid #16a34a' : '1px solid #cbd5e1',
                        background: numSprays === n ? '#16a34a' : '#ffffff',
                        color: numSprays === n ? '#ffffff' : '#334155',
                        fontSize: '0.82rem',
                        fontWeight: numSprays === n ? 800 : 600,
                        cursor: 'pointer'
                      }}
                    >
                      {n} {n === 1 ? 'Spray' : 'Sprays'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Calculated Nasal Results Banner */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.75rem',
              background: '#f0fdf4',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #bbf7d0',
              marginBottom: '1rem'
            }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>Delivered Active Dose</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#14532d', fontFamily: 'monospace' }}>
                  {sprayCalc.totalDoseDisplay}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#166534', marginTop: '2px' }}>
                  {sprayCalc.dosePerSprayDisplay} / spray actuation
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.68rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>Volume Dispensed</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 850, color: '#003666', fontFamily: 'monospace' }}>
                  {(numSprays * 0.1).toFixed(1)} mL
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                  Metered 0.1 mL per pump
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.68rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>Solution Concentration</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 850, color: '#15803d', fontFamily: 'monospace' }}>
                  {sprayCalc.concentrationDisplay}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                  Total {sprayCalc.bottleVolumeMl} mL reservoir
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.68rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>Applications Available</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 850, color: '#334155', fontFamily: 'monospace' }}>
                  ~{sprayCalc.totalApplications} doses
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                  Total {sprayCalc.totalSpraysPerBottle} actuations
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── B. PRE-FILLED PEN CONFIGURATION ── */}
        {isPen && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
              marginBottom: '1.25rem'
            }}>
              {/* Pen Potency Selector */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
                  1. Pen Cartridge Potency
                </label>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                  {dynamicStrengths.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic('selection');
                        setSelectedPenStrength(s.mg);
                      }}
                      style={{
                        flex: 1,
                        minWidth: '70px',
                        padding: '8px',
                        borderRadius: '6px',
                        border: selectedPenStrength === s.mg ? '1.5px solid #003666' : '1px solid #cbd5e1',
                        background: selectedPenStrength === s.mg ? '#003666' : '#ffffff',
                        color: selectedPenStrength === s.mg ? '#ffffff' : '#334155',
                        fontSize: '0.82rem',
                        fontWeight: selectedPenStrength === s.mg ? 800 : 600,
                        cursor: 'pointer'
                      }}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Click Dial Selector */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
                  2. Dial Selector (Mechanical Clicks)
                </label>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                  {[5, 10, 15, 20, 30].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        triggerHaptic('selection');
                        setPenClicks(c);
                      }}
                      style={{
                        flex: 1,
                        padding: '8px 4px',
                        borderRadius: '6px',
                        border: penClicks === c ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                        background: penClicks === c ? '#0284c7' : '#ffffff',
                        color: penClicks === c ? '#ffffff' : '#334155',
                        fontSize: '0.80rem',
                        fontWeight: penClicks === c ? 800 : 600,
                        cursor: 'pointer'
                      }}
                    >
                      {c} Clicks
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Calculated Pen Results Banner */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.75rem',
              background: '#eff6ff',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #bfdbfe',
              marginBottom: '1rem'
            }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase' }}>Delivered Dose</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e3a8a', fontFamily: 'monospace' }}>
                  {penCalc.deliveredDoseDisplay}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#1e40af', marginTop: '2px' }}>
                  Calibrated dialed injection
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.68rem', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase' }}>Injection Volume</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 850, color: '#0284c7', fontFamily: 'monospace' }}>
                  {penCalc.injectionVolumeMl} mL
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                  {penClicks} dial increments
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.68rem', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase' }}>Cartridge Concentration</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 850, color: '#0369a1', fontFamily: 'monospace' }}>
                  {penCalc.concentrationDisplay}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                  3.0 mL Borosilicate Type I
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.68rem', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase' }}>Doses per Pen</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 850, color: '#334155', fontFamily: 'monospace' }}>
                  ~{penCalc.totalDoses} doses
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                  Replace needle each use
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── C. SUBLINGUAL CONFIGURATION ── */}
        {isSublingual && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
              marginBottom: '1.25rem'
            }}>
              {/* Bottle Potency */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
                  1. Bottle Potency (30 mL Dropper)
                </label>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                  {dynamicStrengths.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic('selection');
                        setSelectedSublingualStrength(s.mg);
                      }}
                      style={{
                        flex: 1,
                        minWidth: '70px',
                        padding: '8px',
                        borderRadius: '6px',
                        border: selectedSublingualStrength === s.mg ? '1.5px solid #6b21a8' : '1px solid #cbd5e1',
                        background: selectedSublingualStrength === s.mg ? '#6b21a8' : '#ffffff',
                        color: selectedSublingualStrength === s.mg ? '#ffffff' : '#334155',
                        fontSize: '0.82rem',
                        fontWeight: selectedSublingualStrength === s.mg ? 800 : 600,
                        cursor: 'pointer'
                      }}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pipette Volume */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
                  2. Calibrated Dropper Draw
                </label>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                  {[0.25, 0.50, 0.75, 1.00].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => {
                        triggerHaptic('selection');
                        setDropperVolumeMl(v);
                      }}
                      style={{
                        flex: 1,
                        padding: '8px 4px',
                        borderRadius: '6px',
                        border: dropperVolumeMl === v ? '1.5px solid #7c3aed' : '1px solid #cbd5e1',
                        background: dropperVolumeMl === v ? '#7c3aed' : '#ffffff',
                        color: dropperVolumeMl === v ? '#ffffff' : '#334155',
                        fontSize: '0.80rem',
                        fontWeight: dropperVolumeMl === v ? 800 : 600,
                        cursor: 'pointer'
                      }}
                    >
                      {v.toFixed(2)} mL
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Calculated Sublingual Results Banner */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.75rem',
              background: '#faf5ff',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #e9d5ff',
              marginBottom: '1rem'
            }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#6b21a8', fontWeight: 700, textTransform: 'uppercase' }}>Sublingual Dose</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#581c87', fontFamily: 'monospace' }}>
                  {sublingualCalc.deliveredDoseDisplay}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#6b21a8', marginTop: '2px' }}>
                  Direct vascular uptake
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.68rem', color: '#6b21a8', fontWeight: 700, textTransform: 'uppercase' }}>Dropper Volume</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 850, color: '#7c3aed', fontFamily: 'monospace' }}>
                  {dropperVolumeMl.toFixed(2)} mL
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                  Calibrated glass pipette
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.68rem', color: '#6b21a8', fontWeight: 700, textTransform: 'uppercase' }}>Retention Time</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 850, color: '#9333ea', fontFamily: 'monospace' }}>
                  60–90 sec
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                  Hold under tongue
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.68rem', color: '#6b21a8', fontWeight: 700, textTransform: 'uppercase' }}>Doses per Bottle</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 850, color: '#334155', fontFamily: 'monospace' }}>
                  ~{sublingualCalc.totalDoses} doses
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                  Total 30 mL volume
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── D. ORAL CAPSULE CONFIGURATION ── */}
        {isOral && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
              marginBottom: '1.25rem'
            }}>
              {/* Unit Potency */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
                  1. Unit Strength per Capsule
                </label>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                  {dynamicStrengths.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic('selection');
                        setSelectedOralStrength(s.mg);
                      }}
                      style={{
                        flex: 1,
                        minWidth: '70px',
                        padding: '8px',
                        borderRadius: '6px',
                        border: selectedOralStrength === s.mg ? '1.5px solid #c2410c' : '1px solid #cbd5e1',
                        background: selectedOralStrength === s.mg ? '#c2410c' : '#ffffff',
                        color: selectedOralStrength === s.mg ? '#ffffff' : '#334155',
                        fontSize: '0.82rem',
                        fontWeight: selectedOralStrength === s.mg ? 800 : 600,
                        cursor: 'pointer'
                      }}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Capsule Quantity */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
                  2. Daily Prescribed Quantity
                </label>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                  {[1, 2, 3].map(q => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => {
                        triggerHaptic('selection');
                        setCapsuleCount(q);
                      }}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '6px',
                        border: capsuleCount === q ? '1.5px solid #ea580c' : '1px solid #cbd5e1',
                        background: capsuleCount === q ? '#ea580c' : '#ffffff',
                        color: capsuleCount === q ? '#ffffff' : '#334155',
                        fontSize: '0.82rem',
                        fontWeight: capsuleCount === q ? 800 : 600,
                        cursor: 'pointer'
                      }}
                    >
                      {q} {q === 1 ? 'Capsule' : 'Capsules'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Calculated Oral Results Banner */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.75rem',
              background: '#fff7ed',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #fed7aa',
              marginBottom: '1rem'
            }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#c2410c', fontWeight: 700, textTransform: 'uppercase' }}>Daily Ingested Dose</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#9a3412', fontFamily: 'monospace' }}>
                  {(capsuleCount * selectedOralStrength) >= 1 ? `${(capsuleCount * selectedOralStrength).toFixed(2)} mg` : `${Math.round(capsuleCount * selectedOralStrength * 1000)} µg`}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#c2410c', marginTop: '2px' }}>
                  {capsuleCount} unit(s) daily
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.68rem', color: '#c2410c', fontWeight: 700, textTransform: 'uppercase' }}>Protective Coating</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 850, color: '#c2410c', fontFamily: 'monospace' }}>
                  Acid-Resistant
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                  Bypasses gastric acid
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.68rem', color: '#c2410c', fontWeight: 700, textTransform: 'uppercase' }}>Water Intake</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 850, color: '#ea580c', fontFamily: 'monospace' }}>
                  250 mL
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                  Room temperature water
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.68rem', color: '#c2410c', fontWeight: 700, textTransform: 'uppercase' }}>Fasting Window</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 850, color: '#334155', fontFamily: 'monospace' }}>
                  30–45 min
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                  Before morning coffee/food
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── E. STANDARD VIAL RECONSTITUTION CONFIGURATION ── */}
        {isVial && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
              marginBottom: '1.25rem'
            }}>
              {/* Vial Strength Selector */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
                  1. Vial Presentation Strength
                </label>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                  {dynamicStrengths.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic('selection');
                        setSelectedVialStrength(s.mg);
                        setSelectedBacVolume(s.mg <= 5 ? 1.0 : s.mg <= 10 ? 2.0 : 4.0);
                      }}
                      style={{
                        flex: 1,
                        minWidth: '65px',
                        padding: '8px',
                        borderRadius: '6px',
                        border: selectedVialStrength === s.mg ? '1.5px solid #003666' : '1px solid #cbd5e1',
                        background: selectedVialStrength === s.mg ? '#003666' : '#ffffff',
                        color: selectedVialStrength === s.mg ? '#ffffff' : '#334155',
                        fontSize: '0.82rem',
                        fontWeight: selectedVialStrength === s.mg ? 800 : 600,
                        cursor: 'pointer'
                      }}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Diluent BAC Volume Selector */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
                  2. Diluent (BAC Water 0.9%)
                </label>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                  {[1.0, 2.0, 4.0].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => {
                        triggerHaptic('selection');
                        setSelectedBacVolume(v);
                      }}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '6px',
                        border: selectedBacVolume === v ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                        background: selectedBacVolume === v ? '#0284c7' : '#ffffff',
                        color: selectedBacVolume === v ? '#ffffff' : '#334155',
                        fontSize: '0.82rem',
                        fontWeight: selectedBacVolume === v ? 800 : 600,
                        cursor: 'pointer'
                      }}
                    >
                      {v.toFixed(1)} mL
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Clinical Dose Selector */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
                  3. Target Clinical Dose
                </label>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                  {[0.5, 1.0, 1.25, 1.5, 2.0].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        triggerHaptic('selection');
                        setTargetDoseMg(d);
                      }}
                      style={{
                        flex: 1,
                        padding: '8px 4px',
                        borderRadius: '6px',
                        border: targetDoseMg === d ? '1.5px solid #16a34a' : '1px solid #cbd5e1',
                        background: targetDoseMg === d ? '#16a34a' : '#ffffff',
                        color: targetDoseMg === d ? '#ffffff' : '#334155',
                        fontSize: '0.78rem',
                        fontWeight: targetDoseMg === d ? 800 : 600,
                        cursor: 'pointer'
                      }}
                    >
                      {d.toFixed(2)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Calculated Results Banner */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.75rem',
              background: '#f8fafc',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              marginBottom: '1rem'
            }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Concentration</span>
                <div style={{ fontSize: '1.05rem', fontWeight: 850, color: '#166534', fontFamily: 'monospace' }}>
                  {recon.concentrationDisplay}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Draw Volume</span>
                <div style={{ fontSize: '1.05rem', fontWeight: 850, color: '#003666', fontFamily: 'monospace' }}>
                  {recon.injectionVolumeDisplay}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>U-100 Syringe Units</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0284c7', fontFamily: 'monospace' }}>
                  {recon.syringeUnitsDisplay}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Doses per Vial</span>
                <div style={{ fontSize: '1.05rem', fontWeight: 850, color: '#334155', fontFamily: 'monospace' }}>
                  {recon.dosesPerVial} administrations
                </div>
              </div>
            </div>

            {/* Subordinate Precision Syringe Visualizer */}
            <PrecisionSyringeVisualizer
              targetDoseMg={targetDoseMg}
              injectionVolumeMl={recon.injectionVolumeMl}
              syringeUnitsU100={recon.syringeUnitsU100}
            />
          </div>
        )}
      </section>

      {/* ── 2. Handling Stepper & Storage Guidelines ── */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Stepwise Handling Protocol */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '1.25rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}>
          <h3 style={{
            margin: '0 0 0.75rem 0',
            fontSize: '0.86rem',
            fontWeight: 800,
            color: '#003666',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            {isSpray ? 'Intranasal Aseptic Administration Protocol' :
             isPen ? 'Multi-Dose Pen Stepwise Procedure' :
             isSublingual ? 'Sublingual Administration Protocol' :
             isOral ? 'Oral Enteric Ingestion Protocol' :
             'Aseptic Reconstitution & Handling Protocol'}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {/* DYNAMIC STEPS BASED ON PRESENTATION */}
            {(isSpray ? [
              { step: 1, title: 'Verify & Remove Cap', summary: `Remove protective dust cap; confirm lot ${effectiveBatch}`, detail: 'Check actuator nozzle for cleanliness. Maintain sterile integrity and ensure the tip is free from debris.' },
              { step: 2, title: 'Prime Pump (First Use)', summary: 'Pump 2 times into air until fine mist appears', detail: 'Hold bottle upright. Priming ensures the calibrated 0.1 mL metering chamber is completely filled. Only prime prior to the very first dose.' },
              { step: 3, title: 'Prepare Nasal Cavity', summary: 'Gently blow nose before administration', detail: 'Clearing excess mucus ensures maximum direct peptide contact with the highly vascularized nasal mucosa.' },
              { step: 4, title: 'Position & Insuflation (45°)', summary: 'Aim tip outward toward lateral eye/ear wall', detail: 'Tilt head slightly forward. Insert nozzle ~1 cm into nostril. Avoid spraying directly against the sensitive central nasal septum.' },
              { step: 5, title: 'Actuate & Inhale Gently', summary: `Depress pump firmly while taking a calm breath`, detail: 'Do not sniff aggressively or tilt head backward. Gentle breathing allows the mist to settle evenly over nasal turbinates.' },
              { step: 6, title: 'Wipe & Store', summary: 'Clean nozzle with sterile tissue; refrigerate (2°C–8°C)', detail: 'Replace cap firmly. Keep container standing upright to avoid pump blockage or micro-leakage.' },
            ] : isPen ? [
              { step: 1, title: 'Inspect Pen & Solution', summary: `Confirm solution clarity; verify lot ${effectiveBatch}`, detail: 'Ensure solution inside the glass cartridge is clear and particle-free. Allow refrigerated pen to reach comfortable room temp before injection.' },
              { step: 2, title: 'Attach Sterile Needle', summary: 'Screw fresh 31G/32G 4mm pen needle firmly onto pen', detail: 'Peel paper tab, screw needle straight onto the pen thread, and remove outer and inner protective shields.' },
              { step: 3, title: 'Air Shot Safety Check', summary: 'Dial 1–2 test clicks and press button upright', detail: 'Tap cartridge lightly so bubbles rise to top. Depress button until a drop appears at needle tip to confirm zero air blockage.' },
              { step: 4, title: 'Dial Prescribed Dose', summary: `Turn click selector to align with ${penClicks} clicks`, detail: 'Align the exact prescribed dose in the display window. If you dial past your dose, turn the dial backwards to correct.' },
              { step: 5, title: 'SubQ Injection (90° Angle)', summary: 'Insert needle at 90° into abdomen or thigh', detail: 'Disinfect skin with 70% IPA. Push button completely down until it clicks to 0, then hold needle in place for 6–10 seconds before withdrawal.' },
              { step: 6, title: 'Discard Needle Safely', summary: 'Unscrew needle into sharps bin; replace pen cap', detail: 'Never leave the needle attached to the pen between doses to prevent air ingress and liquid evaporation.' },
            ] : isSublingual ? [
              { step: 1, title: 'Inspect & Agitate', summary: `Confirm seal integrity; verify lot ${effectiveBatch}`, detail: 'Gently invert bottle 3–5 times. Ensure uniform distribution of active peptide throughout the sublingual suspension vehicle.' },
              { step: 2, title: 'Draw Calibrated Dose', summary: `Draw exactly ${dropperVolumeMl.toFixed(2)} mL using graduated pipette`, detail: 'Squeeze rubber bulb, insert into bottle, and release to draw liquid up to the calibrated volume mark.' },
              { step: 3, title: 'Deposit Under Tongue', summary: 'Place droplets on the floor of the mouth beneath tongue', detail: 'Raise tongue to roof of mouth. Dispense the liquid directly over the sublingual vascular venous plexus.' },
              { step: 4, title: 'Hold for 60–90 Seconds', summary: 'Maintain under tongue without swallowing', detail: 'Crucial for bioavailability: transmucosal venous absorption bypasses first-pass hepatic metabolism. Swallow remaining liquid after 90 seconds.' },
              { step: 5, title: 'Post-Dose Fasting', summary: 'No drinking, eating, or rinsing for 15 minutes', detail: 'Preserves residual mucosal absorption window and prevents premature wash-out.' },
              { step: 6, title: 'Seal & Store', summary: 'Close tightly; store in cool dry place (15°C–25°C)', detail: 'Keep bottle upright away from moisture, heat sources, and direct light.' },
            ] : isOral ? [
              { step: 1, title: 'Inspect Blister/Bottle', summary: `Verify seal and confirmation of lot ${effectiveBatch}`, detail: 'Confirm capsules are intact and dry. Ensure no moisture intrusion in the container.' },
              { step: 2, title: 'Morning Administration', summary: 'Administer upon waking on an empty stomach', detail: 'Gastric-resistant capsules require minimal food/acid competition in the stomach for optimal passage to the duodenum.' },
              { step: 3, title: 'Swallow Whole with Water', summary: 'Drink 200–250 mL of room-temperature water', detail: 'Never crush, chew, or open enteric-coated capsules. The coating is essential to shield peptides from stomach acid.' },
              { step: 4, title: 'Absorption Fasting', summary: 'Wait 30–45 minutes before morning coffee or food', detail: 'Allows the capsule to pass through the stomach and release intact peptide in the alkaline small intestine.' },
              { step: 5, title: 'Storage & Desiccant', summary: 'Store dry at 15°C–25°C; do NOT refrigerate', detail: 'Refrigeration causes condensation inside the bottle which damages enteric capsules. Keep desiccant pack inside.' },
            ] : [
              { step: 1, title: 'Disinfect & Verify', summary: `Clean stopper with 70% IPA; verify lot ${effectiveBatch}`, detail: 'Air-dry for 30s. Maintain sterile technique and confirm lot label.' },
              { step: 2, title: 'Reconstitute', summary: `Add ${selectedBacVolume.toFixed(1)} mL Bacteriostatic Water`, detail: 'Direct stream gently against inside vial wall.' },
              { step: 3, title: 'Dissolve gently', summary: 'Swirl smoothly — never shake', detail: 'Avoid foam or bubble formation.' },
              { step: 4, title: 'Draw dose', summary: `Draw ${recon.syringeUnitsU100} U (${recon.injectionVolumeMl} mL) in U-100 syringe`, detail: 'Invert vial vertically, confirm volume alignment.' },
              { step: 5, title: 'Administer', summary: 'SubQ injection at 45–90°', detail: 'Rotate abdomen/thigh sites.' },
              { step: 6, title: 'Store', summary: 'Refrigerate (2°C–8°C)', detail: 'Discard after 28 days of reconstitution.' },
            ]).map(item => {
              const isExp = expandedSteps[item.step];
              return (
                <div
                  key={item.step}
                  style={{
                    border: '1px solid #f1f5f9',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    background: isExp ? '#f8fafc' : '#ffffff'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedSteps(prev => ({ ...prev, [item.step]: !prev[item.step] }))}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: '#e0f2fe',
                        color: '#0369a1',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {item.step}
                      </span>
                      <strong style={{ fontSize: '0.78rem', color: '#0f172a' }}>{item.title}</strong>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>• {item.summary}</span>
                    </div>
                    {isExp ? <ChevronUp size={13} color="#64748b" /> : <ChevronDown size={13} color="#64748b" />}
                  </button>
                  {isExp && (
                    <div style={{ padding: '2px 12px 8px 38px', fontSize: '0.72rem', color: '#475569', lineHeight: 1.45 }}>
                      {item.detail}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Cold-Chain & Storage Standards tailored to format */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '1.25rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem'
        }}>
          <h3 style={{
            margin: '0',
            fontSize: '0.86rem',
            fontWeight: 800,
            color: '#003666',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            {isOral ? 'Storage & Climate Control Standards' : 'Cold Chain & Beyond-Use Stability'}
          </h3>

          {/* Primary Condition */}
          <div style={{
            background: isOral ? '#fff7ed' : isSublingual ? '#faf5ff' : '#eff6ff',
            border: `1px solid ${isOral ? '#fed7aa' : isSublingual ? '#e9d5ff' : '#bfdbfe'}`,
            borderRadius: '8px',
            padding: '10px 12px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: isOral ? '#c2410c' : isSublingual ? '#6b21a8' : '#1e40af',
              fontWeight: 800,
              fontSize: '0.78rem'
            }}>
              {isOral ? <Archive size={14} color="#ea580c" /> : <Snowflake size={14} color="#2563eb" />}
              <span>
                {isSpray ? 'Nasal Spray Solution (Unopened)' :
                 isPen ? 'Pre-filled Pen Cartridge (Unopened)' :
                 isSublingual ? 'Sublingual Vehicle (Sealed)' :
                 isOral ? 'Oral Capsules in Bottle with Desiccant' :
                 'Lyophilized Dry Powder (Unopened)'}
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.74rem', color: isOral ? '#9a3412' : isSublingual ? '#581c87' : '#1e3a8a', lineHeight: 1.4 }}>
              {isSpray ? 'Store at 2°C–8°C (Refrigerated). Protect from heat and direct sunlight. Transit stable up to 14 days at ambient 20°C–25°C.' :
               isPen ? 'Store refrigerated at 2°C–8°C. Do NOT freeze. Stable in transit in temperature-controlled packaging.' :
               isSublingual ? 'Store in a cool, dry location (15°C–25°C). Avoid freezer storage. Protect from strong light.' :
               isOral ? 'Store at controlled room temperature (15°C–25°C). Keep bottle tightly capped with desiccant. Do not store in bathrooms or refrigerators.' :
               'Store at -20°C (Freezer) for up to 24 months. Stable at room temperature (20°C–25°C) for short-term transit (up to 30 days). Protect from direct light.'}
            </p>
          </div>

          {/* Secondary Condition */}
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '10px 12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontWeight: 800, fontSize: '0.78rem' }}>
              <Thermometer size={14} color="#16a34a" />
              <span>
                {isSpray ? 'In-Use Nasal Spray Stability' :
                 isPen ? 'In-Use Pen Stability (Active Period)' :
                 isSublingual ? 'Opened Dropper Stability' :
                 isOral ? 'Enteric Integrity & Shelf-Life' :
                 'Reconstituted Solution (In Use)'}
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.74rem', color: '#14532d', lineHeight: 1.4 }}>
              {isSpray ? 'Refrigerate at 2°C–8°C after first use. Solution maintains full peptide stability for up to 60 days post-opening. Keep upright.' :
               isPen ? 'Once attached, in-use pen may be kept at room temperature < 25°C or refrigerated for up to 28 days. Remove needle after each injection.' :
               isSublingual ? 'Maintains full chemical potency for up to 60 days after opening at room temperature (15°C–25°C).' :
               isOral ? 'Enteric coating remains 100% gastro-resistant for 24 months from manufacturing date when stored dry and sealed.' :
               'Refrigerate at 2°C–8°C (Do not freeze). When reconstituted with 0.9% Benzyl Alcohol Bacteriostatic Water, the solution maintains chemical potency for up to 28 days.'}
            </p>
          </div>

          {/* Physical Vial Label Links */}
          <div style={{
            borderTop: '1px solid #f1f5f9',
            paddingTop: '0.75rem',
            marginTop: 'auto'
          }}>
            <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
              Physical Label Dispensing
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { key: '38x90', format: '38x90', label: '38×90mm Label', icon: <Printer size={13} />, title: 'Patient Label — 38×90 mm' },
                { key: 'sheet', format: 'sheet_a4', label: 'A4 Sheet (×8)', icon: <FileText size={13} />, title: 'Patient Labels — A4 Sheet (×8)' },
              ].map((opt) => {
                const qs = new URLSearchParams({ format: opt.format, type: 'client' });
                if (activeFormat?.id) { qs.set('presentation', activeFormat.id); }
                const doseLabel = selectedStrength?.name || selectedStrength?.dosage || '';
                if (doseLabel) qs.set('dose', doseLabel);
                if (effectiveBatch) qs.set('batch', effectiveBatch);
                const base = `/api/vial-label/${encodeURIComponent(slug)}?${qs.toString()}`;
                return (
                  <button
                    key={opt.key}
                    id={`prep-label-preview-${opt.key}`}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setLabelPreview({
                        url: base,
                        downloadUrl: `${base}&download=1`,
                        title: opt.title,
                        subtitle: [activeFormat?.name, doseLabel, effectiveBatch].filter(Boolean).join(' · '),
                        name: `label_${slug}_${opt.format}.pdf`,
                      });
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      minHeight: '36px',
                      padding: '5px 12px',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      color: '#1e293b',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                    title="Preview before printing"
                  >
                    {opt.icon} {opt.label}
                  </button>
                );
              })}
            </div>
            <DocumentPreviewModal
              isOpen={!!labelPreview}
              onClose={() => setLabelPreview(null)}
              fileUrl={labelPreview?.url}
              downloadUrl={labelPreview?.downloadUrl}
              downloadName={labelPreview?.name}
              title={labelPreview?.title}
              subtitle={labelPreview?.subtitle}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
