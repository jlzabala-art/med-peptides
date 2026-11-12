'use client';

import React from 'react';
import DataTable from '@/components/ui/DataTable';
import { Pill, Sun, Moon, Clock, Lock, Sparkles, AlertCircle } from 'lucide-react';

const compoundingColumns = [
  {
    key: 'apiEn',
    label: 'Active Ingredient (Generic API)',
    width: '28%',
    render: (val) => <span style={{ fontWeight: 750, color: '#0f172a' }}>{val}</span>
  },
  {
    key: 'chemicalSpec',
    label: 'Chemical Specification / Grade',
    width: '24%',
    render: (val) => <span style={{ color: '#475569' }}>{val}</span>
  },
  {
    key: 'dose',
    label: 'Dose / Cap',
    width: '14%',
    render: (val) => <span style={{ fontWeight: 800, color: '#0d9488' }}>{val}</span>
  },
  {
    key: 'batchQty',
    label: 'Batch Qty (60 Caps)',
    width: '16%',
    render: (val) => <span style={{ fontWeight: 800, color: '#003666' }}>{val}</span>
  },
  {
    key: 'purposeEn',
    label: 'Pharmaceutical Role',
    width: '18%',
    render: (val) => <span style={{ color: '#334155' }}>{val}</span>
  }
];

export default function DnaCompoundingPrescription({
  threeCapsuleProtocol,
  treatmentCycle,
  onSwitchToOptionA
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* ── Prescription Header Card (Option B Compounding) ── */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1.5px solid #003666', padding: '1.75rem', boxShadow: '0 4px 14px rgba(0, 54, 102, 0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: '#003666', color: '#ffffff', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                PART 4 · OPTION B · 3-CAPSULE CUSTOM PHARMACY ORDER
              </span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>
                Single Daily Delivery · Non-Commercial Galenic Formula
              </span>
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 850, color: '#003666', margin: '2px 0 4px 0' }}>
              Magistral Compounded Formulation Order (Fórmula Magistral)
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
              Consolidates all 14 targeted active ingredients into exactly 3 color-coded daily capsules formulated with compatible vehicles.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={onSwitchToOptionA}
              style={{
                padding: '6px 12px',
                fontSize: '0.76rem',
                fontWeight: 700,
                color: '#0d9488',
                backgroundColor: '#f0fdfa',
                border: '1px solid #99f6e4',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              ← Switch to Option A (Local Pharmacy)
            </button>
          </div>
        </div>

        {/* Prescription Metadata Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.78rem' }}>
          <div>
            <span style={{ color: '#64748b', fontWeight: 650 }}>Protocol Type:</span>
            <div style={{ fontWeight: 800, color: '#0f172a' }}>{threeCapsuleProtocol?.protocolTitle || 'Precision Nutrigenomic Triad'}</div>
          </div>
          <div>
            <span style={{ color: '#64748b', fontWeight: 650 }}>Duration &amp; Batch:</span>
            <div style={{ fontWeight: 800, color: '#0f172a' }}>{treatmentCycle?.durationDays || 60} Days · 60 Capsules per formula</div>
          </div>
          <div>
            <span style={{ color: '#64748b', fontWeight: 650 }}>Galenic Vehicle:</span>
            <div style={{ fontWeight: 800, color: '#0f172a' }}>Hypromellose (HPMC) Acid-Resistant DRcaps</div>
          </div>
          <div>
            <span style={{ color: '#64748b', fontWeight: 650 }}>Dispensing Rule:</span>
            <div style={{ fontWeight: 800, color: '#003666' }}>Official Medical Prescription Required</div>
          </div>
        </div>
      </div>

      {/* ── 3 Color-Coded Formulation Blocks ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {threeCapsuleProtocol?.capsules?.map((capsule, cIdx) => {
          const tableRows = capsule.ingredients.map((ing, idx) => {
            const batchQty =
              cIdx === 0 && idx === 0 ? '900 B. CFU' :
              cIdx === 0 && idx === 1 ? '30.00 g' :
              cIdx === 0 && idx === 2 ? '540,000 ALU' :
              cIdx === 1 && idx === 0 ? '9.00 g' :
              cIdx === 1 && idx === 1 ? '6.00 mg' :
              cIdx === 1 && idx === 2 ? '30.00 mg' :
              cIdx === 1 && idx === 3 ? '30.00 mg' :
              cIdx === 1 && idx === 4 ? '300,000 IU' :
              cIdx === 1 && idx === 5 ? '6.00 mg' :
              cIdx === 2 && idx === 0 ? '6.00 g' :
              cIdx === 2 && idx === 1 ? '6.00 mg' :
              cIdx === 2 && idx === 2 ? '30 mg each' :
              cIdx === 2 && idx === 3 ? '12.00 g' :
              cIdx === 2 && idx === 4 ? '6.00 g' : '—';

            return {
              id: `${capsule.capsuleNumber || cIdx + 1}-${idx}`,
              apiEn: ing.apiEn,
              chemicalSpec: ing.chemicalSpec,
              dose: ing.dose,
              batchQty,
              purposeEn: ing.purposeEn
            };
          });

          return (
            <div
              key={cIdx}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: `1.5px solid ${capsule.color}`,
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}
            >
              {/* Capsule Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ backgroundColor: `${capsule.color}15`, color: capsule.color, padding: '8px', borderRadius: '8px' }}>
                    {cIdx === 0 ? <Sun size={20} /> : cIdx === 1 ? <Clock size={20} /> : <Moon size={20} />}
                  </div>
                  <div>
                    <span style={{ fontSize: '0.70rem', fontWeight: 800, color: capsule.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Capsule {capsule.capsuleNumber} · {capsule.timingEn}
                    </span>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 850, color: '#0f172a', margin: '1px 0 0 0' }}>
                      {capsule.nameEn}
                    </h4>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '4px' }}>
                    {capsule.ingredients.length} Active APIs
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: `${capsule.color}15`, color: capsule.color, padding: '3px 8px', borderRadius: '4px' }}>
                    1 Cap Daily
                  </span>
                </div>
              </div>

              {/* Galenic Vehicle & Rationale */}
              <div style={{ backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '6px', fontSize: '0.78rem', color: '#334155', marginBottom: '1rem', border: '1px solid #e2e8f0', lineHeight: 1.5 }}>
                <div><strong>Galenic Delivery Vehicle:</strong> {capsule.galenicVehicleEn}</div>
                <div style={{ marginTop: '3px' }}><strong>Compounding Rationale:</strong> {capsule.rationaleEn}</div>
              </div>

              {/* Formulation Table (Golden Rule #3: Unified DataTable Component) */}
              <DataTable
                columns={compoundingColumns}
                data={tableRows}
                keyField="id"
                pagination={false}
                hidePagination={true}
                mobileView="scroll"
                emptyTitle="No ingredients defined"
              />
            </div>
          );
        })}
      </div>

      {/* Prescribing Physician Authorization & Official Medical Signature */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1.5px solid #cbd5e1', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              MEDICAL PRESCRIPTION AUTHORIZATION · EXCLUSIVE FOR PRESCRIBING PHYSICIAN
            </span>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 850, color: '#0f172a', margin: '2px 0 0 0' }}>
              Prescribing Physician Sign-Off &amp; Official Validation (Firma Médica)
            </h4>
          </div>
          <span style={{ fontSize: '0.70rem', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '4px' }}>
            Single-Patient Non-Transferable Rx · Valid for 60 Days
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.5rem', alignItems: 'flex-start' }}>
          {/* Doctor's Identification Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.80rem', color: '#334155' }}>
            <div>
              <span style={{ display: 'block', fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                Prescribing Physician (Full Name / Nombre y Apellidos del Médico):
              </span>
              <div style={{ borderBottom: '1.5px solid #94a3b8', height: '22px', width: '100%' }}></div>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                Medical License / Collegiate Reg. No. (Nº Colegiado / Licencia Médica):
              </span>
              <div style={{ borderBottom: '1.5px solid #94a3b8', height: '22px', width: '100%' }}></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Clinic / Healthcare Institution:
                </span>
                <div style={{ borderBottom: '1.5px solid #94a3b8', height: '22px', width: '100%' }}></div>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Date (Fecha):
                </span>
                <div style={{ borderBottom: '1.5px solid #94a3b8', height: '22px', width: '100%' }}></div>
              </div>
            </div>
          </div>

          {/* Signature & Professional Stamp Box */}
          <div style={{ backgroundColor: '#f8fafc', border: '1.5px dashed #94a3b8', borderRadius: '8px', padding: '1rem', minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase' }}>
                Physician&apos;s Signature &amp; Professional Stamp (Firma y Sello Oficial):
              </span>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.72rem', color: '#64748b' }}>
                I hereby certify that the magistral compounded formula prescribed above is clinically necessary and tailored to the patient&apos;s genomic profile.
              </p>
            </div>
            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', fontStyle: 'italic', padding: '16px 0 4px 0' }}>
              [ Affix Signature and Professional Stamp Here ]
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
