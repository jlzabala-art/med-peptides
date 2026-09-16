'use client';

import React, { useState } from 'react';
import { Pill, Activity, FlaskConical, Dna, Info, Calendar, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Default fallback API items parser if the prescription object only has raw clinicalNotes or unstructured items.
 */
export function normalizeApiItems(rx) {
  if (rx.apiItems && Array.isArray(rx.apiItems) && rx.apiItems.length > 0) {
    return rx.apiItems;
  }

  // If rx.items exists and has compounds
  if (rx.items && Array.isArray(rx.items) && rx.items.length > 0) {
    return rx.items.map(item => {
      const name = item.name || item.compound || item.productName || 'Active Substance';
      const isLatanoprost = /latanoprost/i.test(name);
      const isEstradiol = /estradiol/i.test(name);
      const isIgrantine = /igrantine/i.test(name);
      const isVehicle = /trichosol|vehicle/i.test(name);

      if (isLatanoprost) {
        return {
          apiId: 'API-LAT-005',
          name: 'Latanoprost Fagron',
          genericName: 'Latanoprost',
          casNumber: '130209-82-4',
          category: 'active_pharmaceutical_ingredient',
          role: 'Prostaglandin F2α Analogue (Anagen Phase Induction)',
          concentration: '0.005%',
          unitMassMg: 5,
          dailyConsumptionMg: 0.05,
          totalCourseConsumptionMg: 15,
          supplier: 'Fagron',
          qualityGrade: 'Ph.Eur / USP Micronized'
        };
      }
      if (isEstradiol) {
        return {
          apiId: 'API-EST-050',
          name: '17-α-Estradiol',
          genericName: 'Alfatradiol',
          casNumber: '57-91-0',
          category: 'active_pharmaceutical_ingredient',
          role: 'Estrogen Receptor Modulator (Aromatase Activator & 5AR Inhibition)',
          concentration: '0.05%',
          unitMassMg: 50,
          dailyConsumptionMg: 0.5,
          totalCourseConsumptionMg: 150,
          supplier: 'Fagron',
          qualityGrade: 'Ph.Eur Micronized'
        };
      }
      if (isIgrantine) {
        return {
          apiId: 'API-PEP-F1',
          name: 'IGrantine-F1 TM',
          genericName: 'Bioactive Decapeptide Complex',
          casNumber: 'Biomimetic Peptide',
          category: 'biostimulant_peptide',
          role: 'Wnt/β-Catenin Signaling & Dermal Papilla Proliferation',
          concentration: '0.50%',
          unitMassMg: 500,
          dailyConsumptionMg: 5.0,
          totalCourseConsumptionMg: 1500,
          supplier: 'Fagron Genomics',
          qualityGrade: 'Biotech Synthetic >98%'
        };
      }
      if (isVehicle) {
        return {
          apiId: 'VEH-TRI-100',
          name: 'TrichoSol',
          genericName: 'TrichoSol Compounding Solution',
          category: 'vehicle_base',
          role: 'Patented Phyto-Lipidic Scalp Vehicle (Ethanol-free & Propylene Glycol-free)',
          concentration: 'q.s. 100ml',
          unitMassMl: 100,
          dailyConsumptionMl: 1.0,
          totalCourseConsumptionMl: 300,
          supplier: 'Fagron',
          qualityGrade: 'Fagron TrichoTech Standard'
        };
      }

      return {
        apiId: item.productId || 'API-GEN',
        name,
        genericName: name,
        category: item.itemType || 'active_pharmaceutical_ingredient',
        role: item.role || 'Clinical Formulation Active Ingredient',
        concentration: item.concentration || item.dosage || 'Standard',
        unitMassMg: item.unitMassMg || 10,
        totalCourseConsumptionMg: (item.unitMassMg || 10) * (rx.packQuantity || 3),
        supplier: item.supplier || 'Compounding Standard',
        qualityGrade: 'Pharma Grade'
      };
    });
  }

  // Fallback default for Fagron Magistral standard
  return [
    {
      apiId: 'API-LAT-005',
      name: 'Latanoprost Fagron',
      genericName: 'Latanoprost',
      casNumber: '130209-82-4',
      category: 'active_pharmaceutical_ingredient',
      role: 'Prostaglandin F2α Analogue (Anagen Phase Induction)',
      concentration: '0.005%',
      unitMassMg: 5,
      dailyConsumptionMg: 0.05,
      totalCourseConsumptionMg: 15,
      supplier: 'Fagron',
      qualityGrade: 'Ph.Eur / USP Micronized'
    },
    {
      apiId: 'API-EST-050',
      name: '17-α-Estradiol',
      genericName: 'Alfatradiol',
      casNumber: '57-91-0',
      category: 'active_pharmaceutical_ingredient',
      role: 'Estrogen Receptor Modulator (Aromatase Activator & 5AR Inhibition)',
      concentration: '0.05%',
      unitMassMg: 50,
      dailyConsumptionMg: 0.5,
      totalCourseConsumptionMg: 150,
      supplier: 'Fagron',
      qualityGrade: 'Ph.Eur Micronized'
    },
    {
      apiId: 'API-PEP-F1',
      name: 'IGrantine-F1 TM',
      genericName: 'Bioactive Decapeptide Complex',
      casNumber: 'Biomimetic Peptide',
      category: 'biostimulant_peptide',
      role: 'Wnt/β-Catenin Signaling & Dermal Papilla Proliferation',
      concentration: '0.50%',
      unitMassMg: 500,
      dailyConsumptionMg: 5.0,
      totalCourseConsumptionMg: 1500,
      supplier: 'Fagron Genomics',
      qualityGrade: 'Biotech Synthetic >98%'
    },
    {
      apiId: 'VEH-TRI-100',
      name: 'TrichoSol',
      genericName: 'TrichoSol Compounding Solution',
      category: 'vehicle_base',
      role: 'Patented Phyto-Lipidic Scalp Vehicle (Ethanol-free & Propylene Glycol-free)',
      concentration: 'q.s. 100ml',
      unitMassMl: 100,
      dailyConsumptionMl: 1.0,
      totalCourseConsumptionMl: 300,
      supplier: 'Fagron',
      qualityGrade: 'Fagron TrichoTech Standard'
    }
  ];
}

/**
 * Category badge metadata & styling
 */
function getCategoryBadge(category) {
  switch (category) {
    case 'biostimulant_peptide':
      return {
        label: 'Peptide Active',
        icon: Dna,
        bg: '#faf5ff',
        color: '#7e22ce',
        border: '#d8b4fe'
      };
    case 'vehicle_base':
      return {
        label: 'Compounding Vehicle',
        icon: FlaskConical,
        bg: '#ecfdf5',
        color: '#047857',
        border: '#a7f3d0'
      };
    default:
      return {
        label: 'Active Ingredient (API)',
        icon: Pill,
        bg: '#eff6ff',
        color: '#1d4ed8',
        border: '#bfdbfe'
      };
  }
}

/**
 * StructuredApiCompositionView
 * ──────────────────────────────
 * Renders clinical formulations as structured APIs with concentration, unit dosage,
 * cumulative consumption calculations, pharmacological mechanisms, and query triggers.
 */
export default function StructuredApiCompositionView({
  rx,
  onQueryApi,
  compact = false,
  showConsumptionCard = true
}) {
  const [expanded, setExpanded] = useState(!compact);
  const apis = normalizeApiItems(rx);
  const consumption = rx.consumptionProfile || {
    posology: 'Topical 1.0 ml once daily applied to dry scalp areas at bedtime',
    dailyDoseMl: 1.0,
    containerVolumeMl: 100,
    totalContainers: rx.packQuantity || 3,
    totalVolumeMl: (rx.packQuantity || 3) * 100,
    courseDurationDays: rx.durationMonths ? rx.durationMonths * 30 : 90,
    treatmentStarted: rx.date || '2026-09-15',
    projectedRefillDate: rx.nextRefillDue || '2026-11-28',
    adherenceRatePercent: 96,
    batchCompoundingRef: 'CMP-BEDAYA-260915'
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0, 54, 102, 0.04)',
      marginTop: '6px'
    }}>
      {/* Module Header */}
      <div
        style={{
          padding: '10px 14px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FlaskConical size={16} color="#003666" />
          <span style={{ fontWeight: 800, fontSize: '0.82rem', color: '#003666', letterSpacing: '0.02em' }}>
            STRUCTURED FORMULATION • ACTIVE PHARMACEUTICAL INGREDIENTS ({apis.length} APIs)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '0.70rem',
            backgroundColor: '#eff6ff',
            color: '#1e40af',
            padding: '2px 8px',
            borderRadius: '6px',
            fontWeight: 700,
            border: '1px solid #bfdbfe'
          }}>
            N3 Course • 3x 100ml ({consumption.courseDurationDays || 90} Days)
          </span>
          {compact && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                fontSize: '0.72rem',
                fontWeight: 600
              }}
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              <span>{expanded ? 'Collapse' : 'Inspect APIs'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Body: Structured Table of APIs */}
      {expanded && (
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* APIs Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: 0,
              fontSize: '0.78rem',
              textAlign: 'left'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                  <th style={{ padding: '7px 10px', borderRadius: '6px 0 0 6px', fontWeight: 700, fontSize: '0.70rem', textTransform: 'uppercase' }}>
                    Active Substance (API)
                  </th>
                  <th style={{ padding: '7px 10px', fontWeight: 700, fontSize: '0.70rem', textTransform: 'uppercase' }}>
                    Pharmacological Role / Target
                  </th>
                  <th style={{ padding: '7px 10px', fontWeight: 700, fontSize: '0.70rem', textTransform: 'uppercase', textAlign: 'center' }}>
                    Potency (%)
                  </th>
                  <th style={{ padding: '7px 10px', fontWeight: 700, fontSize: '0.70rem', textTransform: 'uppercase', textAlign: 'right' }}>
                    Dose / Bottle
                  </th>
                  <th style={{ padding: '7px 10px', borderRadius: '0 6px 6px 0', fontWeight: 700, fontSize: '0.70rem', textTransform: 'uppercase', textAlign: 'right', color: '#003666' }}>
                    Course Total Consumed
                  </th>
                </tr>
              </thead>
              <tbody>
                {apis.map((api, idx) => {
                  const badge = getCategoryBadge(api.category);
                  const Icon = badge.icon;
                  const isClickable = Boolean(onQueryApi);

                  return (
                    <tr
                      key={api.apiId || idx}
                      style={{
                        borderBottom: idx === apis.length - 1 ? 'none' : '1px solid #f1f5f9',
                        transition: 'background-color 0.15s'
                      }}
                    >
                      {/* Column 1: API Name, Identifier & Category */}
                      <td style={{ padding: '9px 10px', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span
                            onClick={() => onQueryApi && onQueryApi(api.genericName || api.name)}
                            title={isClickable ? `Click to query all prescriptions with ${api.name}` : undefined}
                            style={{
                              fontWeight: 800,
                              color: '#0f172a',
                              cursor: isClickable ? 'pointer' : 'default',
                              textDecoration: isClickable ? 'underline dotted' : 'none'
                            }}
                          >
                            {api.name}
                          </span>
                          {api.casNumber && (
                            <code style={{ fontSize: '0.66rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '1px 5px', borderRadius: '4px' }}>
                              CAS: {api.casNumber}
                            </code>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            backgroundColor: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`,
                            padding: '1px 6px',
                            borderRadius: '99px',
                            fontSize: '0.64rem',
                            fontWeight: 700
                          }}>
                            <Icon size={10} />
                            <span>{badge.label}</span>
                          </span>
                          {api.supplier && (
                            <span style={{ fontSize: '0.66rem', color: '#64748b' }}>
                              • {api.supplier} ({api.qualityGrade || 'Ph.Eur'})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column 2: Pharmacological Role */}
                      <td style={{ padding: '9px 10px', verticalAlign: 'middle', color: '#475569', fontSize: '0.74rem' }}>
                        {api.role}
                      </td>

                      {/* Column 3: Concentration */}
                      <td style={{ padding: '9px 10px', verticalAlign: 'middle', textAlign: 'center' }}>
                        <span style={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          color: '#003666',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.74rem'
                        }}>
                          {api.concentration}
                        </span>
                      </td>

                      {/* Column 4: Dose per unit */}
                      <td style={{ padding: '9px 10px', verticalAlign: 'middle', textAlign: 'right', color: '#334155', fontWeight: 600 }}>
                        {api.unitMassMg ? `${api.unitMassMg} mg` : api.unitMassMl ? `${api.unitMassMl} ml` : '—'}
                      </td>

                      {/* Column 5: Total Course Consumption */}
                      <td style={{ padding: '9px 10px', verticalAlign: 'middle', textAlign: 'right' }}>
                        <span style={{
                          fontWeight: 800,
                          color: '#003666',
                          backgroundColor: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.74rem'
                        }}>
                          {api.totalCourseConsumptionMg
                            ? `${api.totalCourseConsumptionMg} mg total`
                            : api.totalCourseConsumptionMl
                            ? `${api.totalCourseConsumptionMl} ml total`
                            : 'Standard N3'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Consumption & Posology Summary Card */}
          {showConsumptionCard && (
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '10px 14px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '10px',
              fontSize: '0.74rem'
            }}>
              <div>
                <span style={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, fontSize: '0.66rem', display: 'block' }}>
                  Posology & Daily Dosage Rate
                </span>
                <span style={{ fontWeight: 700, color: '#0f172a', marginTop: '2px', display: 'block' }}>
                  ⏱️ {consumption.posology || '1.0 ml topical daily at bedtime'}
                </span>
              </div>

              <div>
                <span style={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, fontSize: '0.66rem', display: 'block' }}>
                  Total Prescribed Course Volume
                </span>
                <span style={{ fontWeight: 700, color: '#0369a1', marginTop: '2px', display: 'block' }}>
                  📦 {consumption.totalVolumeMl || 300} ml ({consumption.totalContainers || 3}x 100ml amber dropper bottles)
                </span>
              </div>

              <div>
                <span style={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, fontSize: '0.66rem', display: 'block' }}>
                  Course Adherence & Refill Projection
                </span>
                <span style={{ fontWeight: 700, color: '#16a34a', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={13} />
                  <span>Refill target: {consumption.projectedRefillDate || '2026-11-28'} (90-day cycle)</span>
                </span>
              </div>

              <div>
                <span style={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, fontSize: '0.66rem', display: 'block' }}>
                  Quality Control Batch Ref
                </span>
                <span style={{ fontWeight: 700, color: '#6b21a8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={13} />
                  <code>{consumption.batchCompoundingRef || 'CMP-BEDAYA-260915'}</code>
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
