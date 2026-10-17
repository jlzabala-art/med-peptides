'use client';

import React, { useState } from 'react';
import {
  Stethoscope,
  Building2,
  FlaskConical,
  Truck,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Layers,
  FileText,
  Tag,
  Clock,
  Zap,
  Award,
  Users,
  Check
} from 'lucide-react';

const COLLECTIVES = [
  {
    id: 'doctor',
    title: 'Physicians & Clinics',
    shortLabel: 'Physicians',
    badge: 'Prescriber Hub',
    icon: Stethoscope,
    color: '#0d9488',
    bgColor: '#f0fdfa',
    borderColor: '#99f6e4',
    headline: 'Advanced magistral compounding & cohort management without bureaucratic friction.',
    subheadline: 'Prescribe customized peptide therapies, bioidentical hormones, and multi-part posologies. Atlas automatically calculates pharmacopeial compounding vehicles and provides real-time invoice traceability.',
    kpis: [
      { label: 'Formulary Access', value: '4,000+', sub: 'EU GMP APIs & Peptides' },
      { label: 'Posology Time', value: '< 60s', sub: 'Multi-part auto calculation' },
      { label: 'Traceability', value: '100%', sub: 'Sold vs Proposal status' },
      { label: 'Regulatory Adherence', value: 'EU GMP', sub: 'Standardized Vehicles' }
    ],
    features: [
      {
        title: 'Zero-Friction Multi-Part Formulations',
        desc: 'Combine topical solutions, enteric DRcaps®, and intranasal sprays in a single prescription. Pharmacopeial bases (TrichoSol™, Pentravan®, bacteriostatic water) are auto-resolved.',
        icon: Layers
      },
      {
        title: 'Clear Commercial & Order Traceability',
        desc: 'Distinguish immediately between invoiced purchases (✓ # INV references) and open proposals awaiting patient checkout, enabling timely clinical follow-ups.',
        icon: CheckCircle2
      },
      {
        title: 'Automated Patient Handouts & QR Verification',
        desc: 'Patients receive printable posology sheets and secure web links (/rx) with detailed administration guides and batch verification codes.',
        icon: FileText
      },
      {
        title: 'Bloodo™ CE-IVDR Diagnostic Linkage',
        desc: 'Directly correlate capillary blood biomarker results (cortisol, testosterone, NAD+) with precision titration protocols.',
        icon: FlaskConical
      }
    ],
    modules: [
      'Multi-Part Posology Engine',
      'Patient Cohort Dossier',
      'Action Queue & Titrations',
      'Printable Posology Handouts',
      'Verified Pharmacy Bottle Labels'
    ],
    ctaText: 'Explore Physician Clinical Directory',
    whatsappSubject: 'Physician & Clinical Practice Onboarding'
  },
  {
    id: 'supplier',
    title: 'Raw Material & API Suppliers',
    shortLabel: 'API Suppliers',
    badge: 'Manufacturers & Labs',
    icon: FlaskConical,
    color: '#0284c7',
    bgColor: '#f0f9ff',
    borderColor: '#bae6fd',
    headline: 'Direct medical demand channel for high-purity APIs with zero opaque intermediaries.',
    subheadline: 'Connect certified peptide laboratories and raw material manufacturers directly to prescribing clinicians and EU GMP compounding facilities.',
    kpis: [
      { label: 'API Purity Standard', value: '≥ 99%', sub: 'HPLC & MS Verified' },
      { label: 'Demand Channel', value: 'Direct B2B', sub: 'Prescription-driven orders' },
      { label: 'PO Synchronization', value: 'Instant', sub: 'Zoho Books / ERP linked' },
      { label: 'Compliance Level', value: 'Pharmacopeia', sub: 'CAS & Batch COA vault' }
    ],
    features: [
      {
        title: 'Direct Clinical Demand Channel',
        desc: 'Your active ingredients (Lotusland peptide APIs, cosmetic raw materials) are embedded directly into clinical protocols prescribed by verified physicians.',
        icon: Zap
      },
      {
        title: 'Standardized Digital Technical Dossiers',
        desc: 'Publish CAS numbers, molecular weight, HPLC purity sheets, and certificates of analysis (COAs) accessible to formulating pharmacies in 1 click.',
        icon: ShieldCheck
      },
      {
        title: 'Predictable Purchase Orders (POs)',
        desc: 'Automated RFQ and purchase order generation synced with ERP (Zoho Books), driven by real-time patient consumption and prescription refills.',
        icon: Clock
      },
      {
        title: 'Brand Protection & Quality Control',
        desc: 'Guarantee that your pure substances are handled exclusively by licensed compounding laboratories adhering to EU GMP standards.',
        icon: Award
      }
    ],
    modules: [
      'Digital COA & HPLC Vault',
      'Automated PO & RFQ Stream',
      'Cold-Chain Logistics Protocol',
      'CAS & Substance Master Registry',
      'Physician Formulary Inclusion'
    ],
    ctaText: 'Register as Certified API Supplier',
    whatsappSubject: 'API Supplier & Manufacturer Partnership'
  },
  {
    id: 'pharmacy',
    title: 'Compounding Pharmacies',
    shortLabel: 'Compounding Pharmacies',
    badge: 'Licensed Formulators',
    icon: Building2,
    color: '#7c3aed',
    bgColor: '#faf5ff',
    borderColor: '#e9d5ff',
    headline: 'Pre-calculated galenic recipes, zero transcription errors, and 1-click legal bottle labels.',
    subheadline: 'Eliminate manual posology calculations and illegible scripts. Receive structured e-prescriptions with verified active concentrations and pharmacopeial vehicle matrices.',
    kpis: [
      { label: 'Label Generation', value: '1-Click', sub: 'QR + Batch + Expiry' },
      { label: 'Transcription Errors', value: '0%', sub: 'Structured electronic data' },
      { label: 'Galenic Calculation', value: 'Automated', sub: 'Vehicle & excipients' },
      { label: 'Preparation SLA', value: '24-48h', sub: 'Accelerated compounding' }
    ],
    features: [
      {
        title: 'Structured Multi-Part E-Prescriptions',
        desc: 'Receive clear, segmented formulations (scalp lotion, capsules, nasal drops) with pre-calculated excipients (TrichoSol™, Pentravan®, enteric shells).',
        icon: Layers
      },
      {
        title: 'Instant Official Bottle Labels',
        desc: 'Print regulatory labels compliant with pharmacy boards including prescription number, physician details, patient name, posology, lot number, and QR code.',
        icon: Tag
      },
      {
        title: 'Pre-Validated Physicochemical Safety',
        desc: 'Atlas AI pre-checks active ingredient solubility, compatible carriers, and standard concentration ranges before formulation begins.',
        icon: ShieldCheck
      },
      {
        title: 'Direct API Procurement Integration',
        desc: 'Quickly match prescribed active substances with in-stock suppliers (Lotusland, Fagron) with instant access to analytical certificates.',
        icon: CheckCircle2
      }
    ],
    modules: [
      'Official Bottle Label Generator',
      'Multi-Part Galenic Recipe Card',
      'Substance Compatibility Verification',
      'Batch & Expiry QR Encoder',
      'EU GMP Master Protocols'
    ],
    ctaText: 'Partner as Formulating Pharmacy',
    whatsappSubject: 'Compounding Pharmacy Network Partnership'
  },
  {
    id: 'wholesaler',
    title: 'B2B Wholesalers & Distributors',
    shortLabel: 'Wholesalers & Distributors',
    badge: 'Commercial Partners',
    icon: Truck,
    color: '#c2410c',
    bgColor: '#fff7ed',
    borderColor: '#fed7aa',
    headline: 'Volume procurement, tiered margins, and multi-clinic fulfillment from a single console.',
    subheadline: 'Equip hospital groups, polyclinic networks, and medical distributors with wholesale pricing on peptide APIs, Colway collagen, Eterna marine plasma, and diagnostic kits.',
    kpis: [
      { label: 'Procurement Scale', value: 'Tiered', sub: 'Volume-based pricing' },
      { label: 'Clinic Management', value: 'Multi-Tenant', sub: 'Consolidated ordering' },
      { label: 'Cold-Chain Shipping', value: '+2°C to +8°C', sub: 'Monitored temperature' },
      { label: 'Product Lines', value: '3 Pillars', sub: 'Peptides, Diagnostics, Topicals' }
    ],
    features: [
      {
        title: 'Volume Purchasing & Commercial Margins',
        desc: 'Access institutional wholesale pricing tiers across peptide raw materials, Bloodo diagnostic panels, and advanced cosmeceutical lines.',
        icon: Award
      },
      {
        title: 'Multi-Clinic Centralized Distribution',
        desc: 'Manage logistics, supply orders, and invoice reconciliation for multiple affiliate clinics and doctors under a single corporate account.',
        icon: Users
      },
      {
        title: 'Guaranteed Cold-Chain Logistics',
        desc: 'End-to-end temperature-monitored refrigerated transport for lyophilized peptides, bio-regulatory peptides, and sensitive biological specimens.',
        icon: Truck
      },
      {
        title: 'Demand Forecasting & Inventory Analytics',
        desc: 'Consolidated reporting on regional prescription trends, therapeutic category uptake, and high-velocity reorder cycles.',
        icon: Clock
      }
    ],
    modules: [
      'B2B Wholesale Portal',
      'Multi-Clinic Supply Console',
      'Cold-Chain Transport Trazability',
      'Automated Invoicing & Credit Terms',
      'Regional Demand Analytics'
    ],
    ctaText: 'Apply for Wholesaler Distribution Account',
    whatsappSubject: 'B2B Wholesaler & Distribution Account Inquiry'
  }
];

export default function AtlasEcosystemHubTab({ doctor = {} }) {
  const [selectedCollectiveId, setSelectedCollectiveId] = useState('doctor');

  const currentCollective = COLLECTIVES.find(c => c.id === selectedCollectiveId) || COLLECTIVES[0];
  const IconComponent = currentCollective.icon;

  const handleOpenWhatsApp = (subject) => {
    const doctorName = doctor.name || 'Healthcare Partner';
    const clinicName = doctor.clinic || 'Practice';
    const message = encodeURIComponent(
      `Hello Atlas Health Services Team, I am viewing the Atlas Partner Ecosystem Hub regarding: "${subject}". Doctor/Partner: ${doctorName} (${clinicName}). I would like to learn more about partner onboarding and integration.`
    );
    window.open(`https://wa.me/971553561058?text=${message}`, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ── Google Cloud Page Header ── */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #dadce0',
          borderRadius: '8px',
          padding: '20px 24px',
          boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: '1px solid #bfdbfe'
                }}
              >
                Atlas Health Operating System
              </span>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>•</span>
              <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 650, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={12} /> EU GMP & ISO 9001 Compliant Network
              </span>
            </div>
            <h2 style={{ fontSize: '1.24rem', fontWeight: 700, color: '#202124', margin: '4px 0 0 0' }}>
              Atlas Partner Ecosystem & Collective Value Engine
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#5f6368', margin: '6px 0 0 0', maxWidth: '850px', lineHeight: 1.45 }}>
              A synchronized clinical platform uniting prescribing physicians, certified API manufacturers, formulating compounding pharmacies, and B2B wholesale distributors.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleOpenWhatsApp('General Ecosystem Inquiry')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '6px',
              background: '#003666',
              color: '#ffffff',
              fontSize: '0.78rem',
              fontWeight: 650,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
            }}
          >
            <MessageSquare size={14} />
            <span>Atlas Concierge Contact</span>
          </button>
        </div>

        {/* ── 4 Collective Selector Chips (Google Cloud UX Pills) ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e8eaed' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Select Stakeholder Profile:
          </span>
          {COLLECTIVES.map((col) => {
            const Icon = col.icon;
            const isSelected = selectedCollectiveId === col.id;
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => setSelectedCollectiveId(col.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 14px',
                  borderRadius: '9999px',
                  border: isSelected ? `2px solid ${col.color}` : '1px solid #dadce0',
                  background: isSelected ? col.bgColor : '#ffffff',
                  color: isSelected ? col.color : '#3c4043',
                  fontSize: '0.78rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                <Icon size={14} style={{ color: col.color }} />
                <span>{col.shortLabel}</span>
                {isSelected && (
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: col.color
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Dynamic Collective Details Card ── */}
      <div
        style={{
          background: '#ffffff',
          border: `1px solid ${currentCollective.borderColor}`,
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 2px 6px rgba(60,64,67,0.08)'
        }}
      >
        {/* Collective Header Banner */}
        <div
          style={{
            background: currentCollective.bgColor,
            border: `1px solid ${currentCollective.borderColor}`,
            borderRadius: '8px',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                background: '#ffffff',
                border: `1px solid ${currentCollective.borderColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <IconComponent size={22} style={{ color: currentCollective.color }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: currentCollective.color
                  }}
                >
                  {currentCollective.badge}
                </span>
              </div>
              <h3 style={{ fontSize: '1.14rem', fontWeight: 700, color: '#0f172a', margin: '2px 0 0 0' }}>
                What {currentCollective.title} Achieve with Atlas
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleOpenWhatsApp(currentCollective.whatsappSubject)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: '6px',
              background: currentCollective.color,
              color: '#ffffff',
              fontSize: '0.76rem',
              fontWeight: 650,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <span>{currentCollective.ctaText}</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Headline Description */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ fontSize: '1.02rem', fontWeight: 650, color: '#1e293b', marginBottom: '6px', lineHeight: 1.4 }}>
            {currentCollective.headline}
          </div>
          <div style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.5 }}>
            {currentCollective.subheadline}
          </div>
        </div>

        {/* 4 Key Performance Indicators (Rule #22) */}
        <div className="gcp-kpi-grid" style={{ marginBottom: '24px' }}>
          {currentCollective.kpis.map((kpi, idx) => (
            <div
              key={idx}
              className="gcp-kpi-card"
              style={{
                background: '#ffffff',
                border: '1px solid #e8eaed',
                borderRadius: '8px',
                padding: '14px 16px'
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                {kpi.label}
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 700, color: currentCollective.color, lineHeight: 1.15, marginTop: '4px' }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#70757a', marginTop: '4px' }}>
                {kpi.sub}
              </div>
            </div>
          ))}
        </div>

        {/* 4 Feature Architecture Cards */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '14px' }}>
            Core Operational Capabilities
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '14px'
            }}
          >
            {currentCollective.features.map((feat, fIdx) => {
              const FIcon = feat.icon;
              return (
                <div
                  key={fIdx}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '16px',
                    background: '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <FIcon size={15} style={{ color: currentCollective.color }} />
                    </div>
                    <span style={{ fontSize: '0.86rem', fontWeight: 650, color: '#0f172a' }}>
                      {feat.title}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.45, margin: 0 }}>
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Atlas Platform Modules */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Activated Atlas Platform Modules:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
              {currentCollective.modules.map((mod, mIdx) => (
                <span
                  key={mIdx}
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '3px 9px',
                    borderRadius: '4px',
                    background: currentCollective.bgColor,
                    color: currentCollective.color,
                    border: `1px solid ${currentCollective.borderColor}`
                  }}
                >
                  ✓ {mod}
                </span>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleOpenWhatsApp(currentCollective.whatsappSubject)}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontSize: '0.74rem',
              fontWeight: 650,
              cursor: 'pointer'
            }}
          >
            Apply to Network →
          </button>
        </div>
      </div>

      {/* ── Visual Interconnection Map (Google Cloud Network Topology) ── */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #dadce0',
          borderRadius: '8px',
          padding: '20px 24px',
          boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
        }}
      >
        <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#202124', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
          Ecosystem Interconnection Flow (Continuous Value Loop)
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px'
          }}
        >
          <div style={{ border: '1px solid #99f6e4', background: '#f0fdfa', borderRadius: '6px', padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0d9488', fontWeight: 700, fontSize: '0.78rem' }}>
              <Stethoscope size={14} /> 1. Physician
            </div>
            <div style={{ fontSize: '0.74rem', color: '#334155', marginTop: '4px', lineHeight: 1.35 }}>
              Issues personalized multi-part prescription & monitors patient outcomes.
            </div>
          </div>

          <div style={{ border: '1px solid #e9d5ff', background: '#faf5ff', borderRadius: '6px', padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#7c3aed', fontWeight: 700, fontSize: '0.78rem' }}>
              <Building2 size={14} /> 2. Compounding Pharmacy
            </div>
            <div style={{ fontSize: '0.74rem', color: '#334155', marginTop: '4px', lineHeight: 1.35 }}>
              Compounds prescription under EU GMP guidelines & prints official QR bottle labels.
            </div>
          </div>

          <div style={{ border: '1px solid #bae6fd', background: '#f0f9ff', borderRadius: '6px', padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0284c7', fontWeight: 700, fontSize: '0.78rem' }}>
              <FlaskConical size={14} /> 3. Certified API Supplier
            </div>
            <div style={{ fontSize: '0.74rem', color: '#334155', marginTop: '4px', lineHeight: 1.35 }}>
              Fulfills raw materials with HPLC ≥99% analytical certificates.
            </div>
          </div>

          <div style={{ border: '1px solid #fed7aa', background: '#fff7ed', borderRadius: '6px', padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#c2410c', fontWeight: 700, fontSize: '0.78rem' }}>
              <Truck size={14} /> 4. B2B Wholesaler
            </div>
            <div style={{ fontSize: '0.74rem', color: '#334155', marginTop: '4px', lineHeight: 1.35 }}>
              Maintains cold-chain logistics and coordinates multi-clinic replenishment.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
