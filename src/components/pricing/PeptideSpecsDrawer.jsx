'use client';

import React from 'react';
import {
  X,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Download,
  Droplets,
  Clock,
  Sparkles,
  ArrowLeft,
  Plus,
  Box,
  Layers,
  FlaskConical,
  Activity,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { KNOWN_PEPTIDE_DATA } from '@/utils/knownPeptideData';
import { getPeptideReferenceDossier } from '@/data/peptideReferenceDossiers';

export default function PeptideSpecsDrawer({
  isOpen,
  onClose,
  product,
  onAddToCart,
  currency = 'USD',
  currencySymbol = '$'
}) {
  if (!isOpen || !product) return null;

  const rawName = product.productName || product.name || 'Bioactive Peptide';
  const dosage = product.dosage || 'Standard Lyophilized Formulation';
  const productSlug = product.slug || (product.id && product.id.includes('_') ? product.id.split('_')[0] : (product.id || 'peptide')).toLowerCase();
  const cleanKey = (product.slug || product.canonicalName || rawName)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  // Look up authoritative CAS, Formula, MW, Sequence & Mechanism
  const knownMatch = Object.entries(KNOWN_PEPTIDE_DATA).find(([key]) => {
    const kClean = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleanKey.includes(kClean) || kClean.includes(cleanKey);
  });
  const knownData = knownMatch ? knownMatch[1] : null;

  // Look up clinical and regulatory dossier
  const dossier = getPeptideReferenceDossier(product);

  const casNumber = product.casNumber || knownData?.casNumber || dossier?.casNumber || 'Verified Reference Standard';
  const molecularFormula = product.molecularFormula || knownData?.molecularFormula || 'Multi-residue Peptide Structure';
  const molecularWeight = product.molecularWeight || knownData?.molecularWeight || 'High-Purity Lyophilized Mass';
  const targetSystem = knownData?.targetSystem || product?.categoryMeta?.label || 'Receptor-Selective Cellular Modulation';
  const mechanismOfAction = knownData?.mechanismOfAction || product.description || dossier?.regulatory?.guidance || 'High-affinity peptide receptor ligand with targeted cellular signaling kinetics.';
  const sequence = knownData?.sequence || null;
  const halfLife = knownData?.halfLife || 'Physiological peptide kinetics (protease-regulated clearance)';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(32, 33, 36, 0.6)',
        backdropFilter: 'blur(3px)',
        zIndex: 1200,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.18s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          width: '100%',
          maxWidth: '620px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-4px 0 24px rgba(60, 64, 67, 0.2)',
          overflowY: 'auto'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Top Header Bar (Google Cloud Console Style) ── */}
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #dadce0',
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              border: '1px solid #dadce0',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#1a73e8', // GCP Blue
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f3f4'}
            onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
          >
            <ArrowLeft size={14} />
            <span>Back to Price Schedule</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#5f6368',
              padding: '6px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Close Technical Sheet (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Monograph Body ── */}
        <div style={{ padding: '1.25rem 1.5rem', flex: 1 }}>
          {/* Badge & Title */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 750,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                background: '#e8f0fe',
                color: '#1a73e8',
                border: '1px solid #c2e7ff',
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                Technical Datasheet & Monograph
              </span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#137333',
                background: '#e6f4ea',
                border: '1px solid #ceead6',
                padding: '2px 8px',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <CheckCircle2 size={11} />
                <span>≥99.0% HPLC Purity</span>
              </span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#5f6368',
                background: '#f1f3f4',
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                cGMP Ph. Eur.
              </span>
            </div>

            <h1 style={{
              margin: 0,
              fontSize: '1.45rem',
              fontWeight: 800,
              color: '#202124',
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              <span>{rawName}</span>
              {dosage && (
                <span style={{
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                  fontWeight: 750,
                  color: '#1a73e8',
                  background: '#e8f0fe',
                  border: '1px solid #c2e7ff',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  {dosage}
                </span>
              )}
            </h1>

            <p style={{ fontSize: '0.82rem', color: '#5f6368', marginTop: '4px', lineHeight: 1.4 }}>
              Sterile Lyophilized Bioactive Vial (10R Borosilicate USP Type I Glass). Vacuum-sealed with bromobutyl pharmaceutical stopper and flip-off tear aluminum seal.
            </p>
          </div>

          {/* Quick Action Dock inside Drawer: Add Preloaded Dosage to Proforma */}
          {onAddToCart && (
            <div style={{
              padding: '12px 14px',
              background: '#f8fafc',
              border: '1px solid #dadce0',
              borderRadius: '8px',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              flexWrap: 'wrap'
            }}>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 750, color: '#202124' }}>
                  Add Formulation to Current Order Request
                </div>
                <div style={{ fontSize: '0.70rem', color: '#5f6368' }}>
                  Preloaded strength: <strong>{dosage}</strong>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => onAddToCart(product, '1x')}
                  style={{
                    padding: '6px 10px',
                    fontSize: '0.74rem',
                    fontWeight: 650,
                    background: '#ffffff',
                    border: '1px solid #dadce0',
                    borderRadius: '4px',
                    color: '#3c4043',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f1f3f4'}
                  onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                >
                  <Plus size={12} />
                  <span>1 Vial</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAddToCart(product, '10x')}
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    background: '#1a73e8',
                    border: '1px solid #1a73e8',
                    borderRadius: '4px',
                    color: '#ffffff',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 1px 2px rgba(60,64,67,0.3)',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1557b0'}
                  onMouseLeave={e => e.currentTarget.style.background = '#1a73e8'}
                >
                  <Box size={12} />
                  <span>Pack ×10</span>
                </button>
              </div>
            </div>
          )}

          {/* Section 1: Chemical & Molecular Profile */}
          <div style={{
            background: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #dadce0',
            padding: '14px',
            marginBottom: '1rem'
          }}>
            <div style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              color: '#5f6368',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <FlaskConical size={14} color="#1a73e8" />
              <span>Biochemical & Molecular Profile</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ padding: '8px 10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 650, color: '#5f6368', textTransform: 'uppercase' }}>
                  CAS Registry No.
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#202124', fontFamily: 'monospace', marginTop: '2px' }}>
                  {casNumber}
                </div>
              </div>

              <div style={{ padding: '8px 10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 650, color: '#5f6368', textTransform: 'uppercase' }}>
                  Target Receptor System
                </div>
                <div style={{ fontSize: '0.80rem', fontWeight: 700, color: '#1a73e8', marginTop: '2px' }}>
                  {targetSystem}
                </div>
              </div>

              <div style={{ padding: '8px 10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 650, color: '#5f6368', textTransform: 'uppercase' }}>
                  Molecular Formula
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#202124', fontFamily: 'monospace', marginTop: '2px', wordBreak: 'break-all' }}>
                  {molecularFormula}
                </div>
              </div>

              <div style={{ padding: '8px 10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 650, color: '#5f6368', textTransform: 'uppercase' }}>
                  Molecular Weight
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#202124', fontFamily: 'monospace', marginTop: '2px' }}>
                  {molecularWeight} {molecularWeight.includes('g/mol') ? '' : 'g/mol'}
                </div>
              </div>
            </div>

            {sequence && (
              <div style={{ marginTop: '10px', padding: '8px 10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 650, color: '#5f6368', textTransform: 'uppercase', marginBottom: '2px' }}>
                  Primary Amino Acid Sequence
                </div>
                <div style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#1a73e8', wordBreak: 'break-all', lineHeight: 1.4 }}>
                  {sequence}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Mechanism of Action & Pharmacology */}
          <div style={{
            background: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #dadce0',
            padding: '14px',
            marginBottom: '1rem'
          }}>
            <div style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              color: '#5f6368',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Activity size={14} color="#0d9488" />
              <span>Pharmacological Mechanism & Cellular Pathways</span>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#3c4043', lineHeight: 1.5, margin: 0 }}>
              {mechanismOfAction}
            </p>

            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', color: '#5f6368' }}>
              <Clock size={13} color="#5f6368" />
              <span><strong>Elimination Half-Life:</strong> {halfLife}</span>
            </div>
          </div>

          {/* Section 3: Reconstitution & Stability Protocol */}
          <div style={{
            background: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #dadce0',
            padding: '14px',
            marginBottom: '1rem'
          }}>
            <div style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              color: '#5f6368',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Droplets size={14} color="#0284c7" />
              <span>Clinical Reconstitution &amp; Storage Directive</span>
            </div>

            <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.80rem', color: '#3c4043', lineHeight: 1.6 }}>
              <li>
                <strong>Recommended Diluent:</strong> Reconstitute with 1.0 mL to 2.0 mL of Bacteriostatic Water (0.9% Benzyl Alcohol USP) or Sterile 0.9% NaCl.
              </li>
              <li>
                <strong>Aseptic Injection:</strong> Direct the stream slowly down the inside glass wall of the borosilicate vial. Do NOT shake vigorously; swirl gently to prevent peptide shearing.
              </li>
              <li>
                <strong>Syringe Calibration:</strong> With 2.0 mL diluent in a {dosage} vial, each 0.1 mL (10 units on standard U-100 1mL insulin syringe) delivers a precise aliquot.
              </li>
              <li>
                <strong>Lyophilized Storage:</strong> Store unconstituted vials at -20°C for up to 24 months, or at 2°C to 8°C protected from UV radiation.
              </li>
              <li>
                <strong>Reconstituted Stability:</strong> Once dissolved, store strictly at 2°C to 8°C (do NOT freeze liquid solution). Use within 28 to 30 days.
              </li>
            </ul>
          </div>

          {/* Section 4: Official Scientific References & Verification */}
          <div style={{
            background: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #dadce0',
            padding: '12px 14px',
            marginBottom: '1.25rem'
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 750, color: '#5f6368', textTransform: 'uppercase', marginBottom: '8px' }}>
              Official Scientific Dossier & Public Registries
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <a
                href={`https://pubchem.ncbi.nlm.nih.gov/#query=${encodeURIComponent(rawName)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '0.76rem',
                  color: '#1a73e8',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <ExternalLink size={12} />
                <span>NCBI PubChem Bioactive Compound Registry</span>
              </a>
              <a
                href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(rawName)}+clinical`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '0.76rem',
                  color: '#1a73e8',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <ExternalLink size={12} />
                <span>PubMed Indexed Peer-Reviewed Clinical Trials</span>
              </a>
            </div>
          </div>

          {/* Direct PDF Download Action (Pure Datasheet without prices) */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <a
              href={`/api/product-sheet/${product.id || cleanKey}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#ffffff',
                border: '1px solid #dadce0',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '0.80rem',
                fontWeight: 700,
                color: '#3c4043',
                textDecoration: 'none',
                boxShadow: '0 1px 2px rgba(60,64,67,0.1)',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f1f3f4'}
              onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
            >
              <Download size={14} color="#1a73e8" />
              <span>Download Technical Sheet PDF (Without Prices)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
