"use client";

import React from 'react';
import Link from 'next/link';
import { FlaskConical, RotateCw, ArrowUpRight } from 'lucide-react';
import DataTable from '../../ui/DataTable';

/**
 * DoctorLabResultsTab
 * 
 * Diagnostic Laboratory Results (LifeLab1 Accredited / EU IVDR)
 * Displays quantitative capillary DBS biomarker assays,
 * range assessment spectrum bars, interpretations, and protocol synergies.
 */
export default function DoctorLabResultsTab({
  allLabResults,
  labResultsColumns,
  slug,
  handleRefresh,
  isSwitchingDoctor
}) {
  return (
    <section
      id="lab_results"
      style={{
        background: '#ffffff',
        border: '1px solid #dadce0',
        borderRadius: '8px',
        boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #dadce0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          background: '#ffffff'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FlaskConical size={18} style={{ color: '#059669' }} />
              <span>Diagnostic Laboratory Results (LifeLab1 Accredited)</span>
            </h2>
            <span style={{ fontSize: '0.70rem', color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1px 8px', borderRadius: '12px', fontWeight: 700 }}>
              ISO 15189 / EU IVDR
            </span>
          </div>
          <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
            Quantitative capillary dried blood spot (DBS) biomarker assays and cellular metabolism diagnostics.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={handleRefresh}
            title="Refresh lab results"
            style={{
              height: '32px',
              padding: '0 12px',
              borderRadius: '4px',
              border: '1px solid #dadce0',
              background: '#ffffff',
              color: '#3c4043',
              fontSize: '0.78rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RotateCw size={13} className={isSwitchingDoctor ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      <DataTable
        columns={labResultsColumns}
        data={allLabResults}
        keyField="id"
        tableId={`doctor-lab-results-${slug}`}
        pagination={true}
        initialRowsPerPage={10}
        alwaysShowPagination={false}
        emptyTitle="No Diagnostic Lab Results Found"
        emptyDescription="No laboratory blood or metabolic biomarker reports registered for this physician yet."
        expandableRender={(row) => {
          const val = Number(row.value) || 14.1;
          const unit = row.unit || 'µmol/L';
          const percentagePos = Math.min(Math.max(((val - 0) / 40) * 100, 2), 98);
          return (
            <div style={{ background: '#f8fafc', padding: '18px 22px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase' }}>
                    Quantitative Biomarker Range Assessment
                  </span>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
                    {row.testName} · {val} {unit}
                  </div>
                </div>
                <Link
                  href={`/lab/${row.code || row.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    color: '#003666',
                    background: '#e0f2fe',
                    border: '1px solid #bae6fd',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>Open Dedicated Patient Dossier</span>
                  <ArrowUpRight size={12} />
                </Link>
              </div>

              {/* Spectrum Bar in Expandable */}
              <div style={{ position: 'relative', width: '100%', height: '22px', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: '22%', background: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.62rem', fontWeight: 700 }}>&lt; 8.8 (Deficient)</div>
                <div style={{ width: '21.5%', background: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#78350f', fontSize: '0.62rem', fontWeight: 700 }}>8.8–17.4 (Suboptimal)</div>
                <div style={{ width: '10.75%', background: '#a3e635', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#365314', fontSize: '0.60rem', fontWeight: 700 }}>17.4–21.7</div>
                <div style={{ width: '30%', background: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#064e3b', fontSize: '0.62rem', fontWeight: 700 }}>21.7–33.7 (Optimal Longevity)</div>
                <div style={{ width: '15.75%', background: '#93c5fd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e3a8a', fontSize: '0.62rem', fontWeight: 700 }}>&gt; 33.7</div>
                <div style={{ position: 'absolute', left: `${percentagePos}%`, top: 0, bottom: 0, width: '3px', background: '#0f172a', transform: 'translateX(-50%)' }} />
              </div>

              {row.interpretation && (
                <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.5, background: '#ffffff', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <strong style={{ color: '#0f172a' }}>Clinical Interpretation: </strong>
                  {row.interpretation}
                </div>
              )}

              {Array.isArray(row.synergies) && row.synergies.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                    Recommended Protocol Synergies
                  </span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {row.synergies.map((syn, sIdx) => (
                      <div key={sIdx} style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 12px', fontSize: '0.75rem' }}>
                        <span style={{ fontWeight: 700, color: '#003666' }}>{syn.name}</span>
                        {syn.slug && (
                          <Link href={`/proto/${syn.slug}`} style={{ marginLeft: '6px', color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>
                            View Protocol →
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        }}
      />
    </section>
  );
}
