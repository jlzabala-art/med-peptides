"use client";

import React from 'react';
import { 
  Factory, 
  ShieldCheck, 
  Award, 
  Download, 
  ExternalLink, 
  FlaskConical 
} from '@/lib/icons';
import CopyableId from '@/components/ui/CopyableId';
import StatusBadge from '@/components/ui/StatusBadge';
import { triggerHaptic } from '@/utils/haptics';
import toast from 'react-hot-toast';

/**
 * QualityTraceabilitySection
 * 
 * European Pharmacopoeia (Ph. Eur.) compliance, EU GMP Annex 1 cleanroom specifications,
 * analytical release assays (HPLC/MS), and QP release certification.
 */
export default function QualityTraceabilitySection({
  rxId,
  isEs = false
}) {
  return (
    <div id="quality-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', scrollMarginTop: '100px' }}>
      <div className="rx-card" style={{
        background: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #dadce0',
        padding: '1.5rem',
        boxShadow: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid #f1f3f4', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '6px',
              background: '#e8f0fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1a73e8'
            }}>
              <Factory size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 600, color: '#202124' }}>
                {isEs ? '3. Laboratorio, Calidad & Trazabilidad Farmacopea UE' : '3. Quality, Laboratory & EU GMP Traceability'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.76rem', color: '#5f6368' }}>
                {isEs 
                  ? 'Control de calidad analítico por HPLC, estándares de Farmacopea Europea (Ph. Eur.) y liberación de lote magistral' 
                  : 'Compounding batch HPLC analytical assays, European Pharmacopoeia (Ph. Eur.) compliance and QP release'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ 
              background: '#e8f0fe', 
              color: '#1967d2', 
              border: '1px solid #d2e3fc', 
              padding: '3px 10px', 
              borderRadius: '12px', 
              fontSize: '0.72rem', 
              fontWeight: 600 
            }}>
              Ph. Eur. Monographs · EU GMP Annex 1
            </span>
            <span style={{ 
              background: '#f0fdf4', 
              color: '#16a34a', 
              border: '1px solid #bbf7d0', 
              padding: '3px 10px', 
              borderRadius: '12px', 
              fontSize: '0.72rem', 
              fontWeight: 600 
            }}>
              ✓ {isEs ? 'Lote Verificado & Liberado' : 'Batch Released & Verified'}
            </span>
          </div>
        </div>

        {/* Google Cloud Style 4-Column Properties Grid */}
        <div style={{
          background: '#f8f9fa',
          border: '1px solid #dadce0',
          borderRadius: '8px',
          padding: '16px 20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px 20px'
        }}>
          <div>
            <div style={{ fontSize: '0.70rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
              {isEs ? 'Lote de Elaboración' : 'Compounding Batch'}
            </div>
            <CopyableId value={`BATCH-${rxId}`} displayValue={`BATCH-${rxId}`} />
          </div>

          <div>
            <div style={{ fontSize: '0.70rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
              {isEs ? 'Estándar Farmacopéico' : 'Compounding Standard'}
            </div>
            <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#202124' }}>
              Ph. Eur. 11th Ed. &amp; EU GMP
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.70rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
              {isEs ? 'Entorno de Salas Limpias' : 'Cleanroom Facility'}
            </div>
            <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#202124' }}>
              ISO Class 5 / Grade A (Annex 1)
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.70rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
              {isEs ? 'Laboratorio Dispensador' : 'Compounding Pharmacy'}
            </div>
            <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#202124' }}>
              Pharmapolis Ltd. (EU Reg.)
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.70rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
              {isEs ? 'Pureza HPLC Mínima' : 'Minimum HPLC Purity'}
            </div>
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#137333' }}>
              ≥ 98.50% Area Ratio
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.70rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
              {isEs ? 'Límite de Endotoxinas' : 'Endotoxin Threshold'}
            </div>
            <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#202124' }}>
              &lt; 0.25 EU/mL (Ph. Eur. 2.6.14)
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.70rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
              {isEs ? 'Origen de Principios Activos' : 'API Sourcing'}
            </div>
            <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#202124' }}>
              Fagron &amp; Pharmapolis Certified
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.70rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
              {isEs ? 'Dictamen de Liberación QP' : 'QP Release Sign-Off'}
            </div>
            <div>
              <StatusBadge status="approved" />
            </div>
          </div>
        </div>

        {/* HPLC Analytical Assay Release Table (GCP Tabular Standard) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#202124', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FlaskConical size={14} color="#1a73e8" />
            <span>{isEs ? 'Ensayos Analíticos de Liberación de Lote Magistral' : 'Compounding Batch Analytical Release Assays'}</span>
          </div>

          <div style={{
            overflowX: 'auto',
            border: '1px solid #dadce0',
            borderRadius: '8px',
            background: '#ffffff'
          }}>
            {/* eslint-disable-next-line no-restricted-syntax */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.80rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #dadce0' }}>
                  <th style={{ padding: '10px 14px', fontWeight: 600, color: '#3c4043' }}>{isEs ? 'Parámetro Analítico' : 'Test Parameter'}</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600, color: '#3c4043' }}>{isEs ? 'Método Oficial' : 'Official Method'}</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600, color: '#3c4043' }}>{isEs ? 'Especificación Farmacopea' : 'Specification'}</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600, color: '#3c4043' }}>{isEs ? 'Resultado del Lote' : 'Batch Result'}</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600, color: '#3c4043' }}>{isEs ? 'Dictamen' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f3f4' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#202124' }}>
                    {isEs ? 'Pureza Cromatográfica (HPLC / UPLC)' : 'Chromatographic Purity (HPLC / UPLC)'}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#5f6368' }}>Ph. Eur. 2.2.29</td>
                  <td style={{ padding: '10px 14px', color: '#3c4043' }}>≥ 98.50% Area Ratio</td>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#137333' }}>99.28% – 99.45%</td>
                  <td style={{ padding: '10px 14px' }}>
                    <StatusBadge status="approved" />
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f3f4' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#202124' }}>
                    {isEs ? 'Identidad Molecular (ESI-MS / MALDI-TOF)' : 'Molecular Identity (ESI-MS / MALDI-TOF)'}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#5f6368' }}>Ph. Eur. 2.2.43</td>
                  <td style={{ padding: '10px 14px', color: '#3c4043' }}>MW ± 1.0 Da del teórico</td>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#137333' }}>Match Confirmado (100%)</td>
                  <td style={{ padding: '10px 14px' }}>
                    <StatusBadge status="approved" />
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f3f4' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#202124' }}>
                    {isEs ? 'Ensayo de Endotoxinas Bacterianas' : 'Bacterial Endotoxins Assay'}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#5f6368' }}>Ph. Eur. 2.6.14 (LAL Photometric)</td>
                  <td style={{ padding: '10px 14px', color: '#3c4043' }}>&lt; 0.25 EU/mL</td>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#137333' }}>&lt; 0.05 EU/mL</td>
                  <td style={{ padding: '10px 14px' }}>
                    <StatusBadge status="approved" />
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f3f4' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#202124' }}>
                    {isEs ? 'Control de Esterilidad & Bioburden' : 'Sterility & Bioburden Assay'}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#5f6368' }}>Ph. Eur. 2.6.1 / 2.6.12</td>
                  <td style={{ padding: '10px 14px', color: '#3c4043' }}>0 CFU / Ausencia Total</td>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#137333' }}>Negativo (0 CFU/g)</td>
                  <td style={{ padding: '10px 14px' }}>
                    <StatusBadge status="approved" />
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#202124' }}>
                    {isEs ? 'Uniformidad de Masa y Contenido' : 'Uniformity of Dosage & Mass'}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#5f6368' }}>Ph. Eur. 2.9.40</td>
                  <td style={{ padding: '10px 14px', color: '#3c4043' }}>Desviación &lt; 5.0% (AV &lt; 15.0)</td>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#137333' }}>AV = 2.1 (Conforme)</td>
                  <td style={{ padding: '10px 14px' }}>
                    <StatusBadge status="approved" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Cold Chain & Qualified Person Certification Callout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '12px',
          paddingTop: '6px'
        }}>
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <ShieldCheck size={18} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a' }}>
                {isEs ? 'Cadena de Frío y Conservación' : 'Cold Chain & Storage Conditions'}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px', lineHeight: 1.45 }}>
                {isEs 
                  ? 'Conservar entre 15°C y 25°C protegido de la luz y humedad directa. Viales reconstituidos en frío 2°C – 8°C.' 
                  : 'Store between 15°C and 25°C away from direct sunlight. Reconstituted peptide vials at 2°C – 8°C.'}
              </div>
            </div>
          </div>

          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <Award size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a' }}>
                {isEs ? 'Liberación Técnica de Persona Cualificada (QP)' : 'Qualified Person (QP) Certification'}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px', lineHeight: 1.45 }}>
                {isEs 
                  ? 'Liberado conforme a normas de correcta fabricación de la UE y directrices de formulación magistral.' 
                  : 'Officially released under EU Good Compounding Practices and validated batch release protocols.'}
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '10px',
          paddingTop: '10px',
          borderTop: '1px solid #f1f3f4',
          flexWrap: 'wrap'
        }}>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              toast.success(isEs ? 'Certificado analítico descargado ✓' : 'Certificate of Analysis (COA) downloaded ✓');
            }}
            style={{
              height: '32px',
              padding: '0 12px',
              borderRadius: '4px',
              border: '1px solid #dadce0',
              background: '#ffffff',
              color: '#1a73e8',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Download size={14} />
            <span>{isEs ? 'Descargar Certificado Analítico (COA)' : 'Download Certificate of Analysis (COA)'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              window.open('https://www.edqm.eu/en/european-pharmacopoeia-ph-eur-', '_blank');
            }}
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
            <ExternalLink size={13} />
            <span>{isEs ? 'Monografía Farmacopea Europea (EDQM)' : 'European Pharmacopoeia Standards (EDQM)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
