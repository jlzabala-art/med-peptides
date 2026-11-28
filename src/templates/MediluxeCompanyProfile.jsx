'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowRight,
  Award,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  Cpu,
  Dna,
  Download,
  ExternalLink,
  FileText,
  FlaskConical,
  Globe,
  Layers,
  Mail,
  MapPin,
  Phone,
  Printer,
  Share2,
  ShieldCheck,
  ThermometerSnowflake,
} from '@/lib/icons';
import Breadcrumb from '@/components/ui/Breadcrumb';
import StatusBadge from '@/components/ui/StatusBadge';
import MetricCard from '@/components/ui/MetricCard';
import CopyableId from '@/components/ui/CopyableId';
import DataTable from '@/components/ui/DataTable';
import AtlasLeftRailLayout from '@/components/shared/layouts/AtlasLeftRailLayout';
import GccRealisticVectorMap from '../components/corporate/GccRealisticVectorMap';
import '../styles/mediluxe-gcp.css';

const PROFILE_URL = 'https://www.atlashealth-services.com/mediluxe';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Layers },
  { id: 'portfolio', label: 'Clinical Portfolio', icon: Dna },
  { id: 'network', label: 'GCC Network', icon: Globe },
  { id: 'compliance', label: 'Compliance & Vault', icon: ShieldCheck },
  { id: 'contact', label: 'Executive Contact', icon: Phone },
];

const PIPELINE_STEPS = [
  {
    code: '01 · COLLECTION',
    title: 'DNA & Specimen Intake',
    detail: 'Non-invasive buccal DNA swab or dry blood spot micro-sampling.',
  },
  {
    code: '02 · DIAGNOSTICS',
    title: 'European Genomics Lab',
    detail: 'Certified European genomics partner analysis under ISO / CE-IVD workflows.',
  },
  {
    code: '03 · ANALYTICS',
    title: 'Clinical Biomarker Mapping',
    detail: '30+ metabolic, telomere, hormonal, and pharmacogenomic markers.',
  },
  {
    code: '04 · COMPOUNDING',
    title: 'GMP Sterile Compounding',
    detail: 'Custom-tailored sterile vials, subcutaneous pellets, and topicals.',
  },
];

const HEALTH_PILLARS = [
  {
    step: '1. Biological Data Ingestion',
    detail: 'Genetic panels, 30+ blood biomarkers, biometric vitals, and lifestyle inputs.',
  },
  {
    step: '2. Clinical Analytics Engine',
    detail: 'Biological age quantification, metabolic risk modeling, and longitudinal trends.',
  },
  {
    step: '3. Connected Digital Consoles',
    detail: 'Wearable telemetry, preventative alerts, home kits, and clinician dashboards.',
  },
];

const PORTFOLIO_RECORDS = [
  {
    id: 'test-bio-age',
    type: 'Genomic Test',
    department: 'Genomics',
    title: 'Biological Age Test',
    focus: 'Telomere length analysis for precise cellular aging quantification.',
    highlights: [
      'Precise cellular aging measurement',
      'Cellular longevity protocol design',
      'Targeted systemic rejuvenation compounding',
    ],
    sampleType: 'Buccal DNA Swab',
    status: 'active',
    actionHref: '/catalog',
    actionLabel: 'Open Catalog',
  },
  {
    id: 'test-weight',
    type: 'Genomic Test',
    department: 'Genomics',
    title: 'Weight Management Test',
    focus: 'Precision nutrition and metabolic optimization grounded in genetic polymorphisms.',
    highlights: [
      'Metabolic efficiency & absorption analysis',
      'Polymorphism-guided dietary strategies',
      'Custom weight management formulations',
    ],
    sampleType: 'Buccal DNA Swab',
    status: 'active',
    actionHref: '/catalog',
    actionLabel: 'Open Catalog',
  },
  {
    id: 'test-acne',
    type: 'Genomic Test',
    department: 'Aesthetics',
    title: 'Acne Treatment Test',
    focus: 'Identification of genetic and inflammatory triggers impairing dermal barrier function.',
    highlights: [
      'Inflammatory cascade predisposition',
      'Sebaceous regulation & sebum profiling',
      'Customized topical compounding formulations',
    ],
    sampleType: 'Buccal DNA Swab',
    status: 'active',
    actionHref: '/catalog',
    actionLabel: 'Open Catalog',
  },
  {
    id: 'test-hair',
    type: 'Genomic Test',
    department: 'Aesthetics',
    title: 'Hair Loss Treatment Test',
    focus: 'Advanced trichology genomics for preventative and targeted clinical management.',
    highlights: [
      'Androgenetic alopecia risk evaluation',
      'Follicular androgen sensitivity profiling',
      'Targeted TrichoFoam hair restoration formulas',
    ],
    sampleType: 'Buccal DNA Swab',
    status: 'active',
    actionHref: '/catalog',
    actionLabel: 'Open Catalog',
  },
  {
    id: 'test-sports',
    type: 'Genomic Test',
    department: 'Regenerative',
    title: 'Sports Performance Test',
    focus: 'Genetic insights for athletic output, injury recovery, and tendon resilience.',
    highlights: [
      'Muscle fiber composition & power profile',
      'Joint and tendon vulnerability screening',
      'Accelerated neuromuscular recovery protocols',
    ],
    sampleType: 'Buccal DNA Swab',
    status: 'active',
    actionHref: '/catalog',
    actionLabel: 'Open Catalog',
  },
  {
    id: 'test-ancestry',
    type: 'Genomic Test',
    department: 'Genomics',
    title: 'Ancestry & Health Test',
    focus: 'Comprehensive genetic profiling for biological heritage and hereditary risk.',
    highlights: [
      'Geographic ancestry & lineage mapping',
      'Hereditary health risk vulnerability detection',
      'Preventative longevity lifestyle mapping',
    ],
    sampleType: 'Buccal DNA Swab',
    status: 'active',
    actionHref: '/catalog',
    actionLabel: 'Open Catalog',
  },
  {
    id: 'dept-peptides',
    type: 'Clinical Department',
    department: 'Peptides',
    title: '1. Peptide Therapeutics',
    focus: 'Mitochondrial health, cellular repair, tissue regeneration & longevity signaling.',
    highlights: [
      'Lyophilized sterile vials & multi-dose pens',
      'Evidence-tiered clinical dosing protocols',
      'Synergistic metabolic & repair regimens',
    ],
    sampleType: '100+ Protocols',
    status: 'active',
    actionHref: '/proto',
    actionLabel: 'View Protocols',
  },
  {
    id: 'dept-regen',
    type: 'Clinical Department',
    department: 'Regenerative',
    title: '2. Regenerative Medicine',
    focus: 'Musculoskeletal recovery, joint protection, and orthopedic cellular biomatrices.',
    highlights: [
      'Targeted tendon & cartilage repair support',
      'Post-surgical recovery peptide stacks',
      'Clinician CME dosing guides',
    ],
    sampleType: 'Clinical Regimens',
    status: 'active',
    actionHref: '/proto',
    actionLabel: 'View Protocols',
  },
  {
    id: 'dept-bhrt',
    type: 'Clinical Department',
    department: 'BHRT',
    title: '3. Bioidentical Endocrinology (BHRT)',
    focus: 'Subcutaneous pellets, transdermal liposomal creams & precision hormone modulation.',
    highlights: [
      'Individualized bioidentical pellets',
      'Liposomal transdermal formulations',
      'Baseline & follow-up endocrine monitoring',
    ],
    sampleType: 'Pellets & Creams',
    status: 'active',
    actionHref: '/pricing/bhrt',
    actionLabel: 'BHRT Schedule',
  },
  {
    id: 'dept-aesthetics',
    type: 'Clinical Department',
    department: 'Aesthetics',
    title: '4. Aesthetic Cosmeceuticals & Trichology',
    focus: 'Sterile mesotherapy, follicular formulas & dermal barrier repair serums.',
    highlights: [
      'Genomic-guided dermatology & trichology',
      'Private-label medical skincare programs',
      'International cosmetic safety compliance',
    ],
    sampleType: 'Sterile & Topical',
    status: 'active',
    actionHref: '/catalog',
    actionLabel: 'Open Catalog',
  },
  {
    id: 'dept-genomics',
    type: 'Clinical Department',
    department: 'Genomics',
    title: '5. Genomic & Laboratory Diagnostics',
    focus: 'CE-IVD DNA swabs, dry blood spot kits, telomere length & metabolomics.',
    highlights: [
      'Certified European Genomics Partners',
      'Home & clinic kit fulfillment across GCC',
      'Physician report interpretation support',
    ],
    sampleType: 'Diagnostic Kits',
    status: 'active',
    actionHref: '/catalog',
    actionLabel: 'View Diagnostics',
  },
  {
    id: 'dept-compounding',
    type: 'Clinical Department',
    department: 'Compounding',
    title: '6. Precision Compounding & Custom APIs',
    focus: 'Magistral capsules, rectal micro-enemas, oral sublingual troches & GMP sterile vials.',
    highlights: [
      'Pharmaceutical-grade GMP active ingredients',
      'ISO cleanroom sterile manufacturing',
      'Custom private formulations for hospitals',
    ],
    sampleType: '580+ References',
    status: 'active',
    actionHref: '/pricing',
    actionLabel: 'B2B Schedules',
  },
];

const DEPARTMENT_FILTERS = ['All', 'Genomics', 'Peptides', 'Regenerative', 'BHRT', 'Aesthetics', 'Compounding'];

const GCC_HUBS = [
  {
    id: 'uae',
    iso: 'UAE',
    country: 'United Arab Emirates',
    hub: 'Abu Dhabi (HQ · Est. 2011) & Dubai Branch (2024)',
    authority: 'MOH / DOH / DHA',
    scope: 'Central cold-chain vault, direct supply to clinics and hospital networks.',
    coldChain: '2-8C & -20C Cryo',
    status: 'active',
  },
  {
    id: 'qat',
    iso: 'QAT',
    country: 'Qatar',
    hub: 'Doha Authorized Distribution',
    authority: 'MOPH Qatar',
    scope: 'Genomic diagnostics & compounding coverage via authorized medical partners.',
    coldChain: '2-8C Validated',
    status: 'active',
  },
  {
    id: 'kwt',
    iso: 'KWT',
    country: 'Kuwait',
    hub: 'Kuwait City Clinical Network',
    authority: 'MOH Kuwait',
    scope: 'Strategic alliances with longevity, dermatology, and aesthetic centers.',
    coldChain: '2-8C Validated',
    status: 'active',
  },
  {
    id: 'ksa',
    iso: 'KSA',
    country: 'Saudi Arabia',
    hub: 'Riyadh & Eastern Province',
    authority: 'SFDA Compliant',
    scope: 'Expanding institutional footprint aligned with SFDA healthcare pathways.',
    coldChain: '2-8C Validated',
    status: 'active',
  },
];

const COMPLIANCE_RECORDS = [
  {
    id: 'comp-moh-doh',
    title: 'Abu Dhabi HQ & UAE Ministry Licensing',
    issuer: 'Ministry of Health (MOH) & DOH Abu Dhabi',
    detail: 'Licensed medical supplier since 2011 serving private hospitals and clinical institutes.',
    badge: 'active',
    badgeText: 'Verified · Est. 2011',
  },
  {
    id: 'comp-dubai',
    title: 'Dubai Healthcare Expansion Hub',
    issuer: 'Dubai Healthcare Regulatory Ecosystem (2024)',
    detail: 'Dedicated commercial, clinical education, and rapid-dispatch operational hub.',
    badge: 'active',
    badgeText: 'Operational · 2024',
  },
  {
    id: 'comp-gmp',
    title: 'Certified GMP Actives & ISO Cleanrooms',
    issuer: 'European GMP Pharmaceutical Standards',
    detail: 'High-purity APIs compounded under sterile ISO cleanroom protocols with COA batch traceability.',
    badge: 'active',
    badgeText: 'GMP / ISO Compliant',
  },
  {
    id: 'comp-coldchain',
    title: 'GCC Cold-Chain & Customs Clearance',
    issuer: '2-8°C & -20°C Thermal Validation',
    detail: 'End-to-end temperature-monitored biological logistics across UAE, Qatar, Kuwait, and KSA.',
    badge: 'active',
    badgeText: 'Cold-Chain Active',
  },
  {
    id: 'comp-privacy',
    title: 'Clinical Privacy & Data Protection',
    issuer: 'HIPAA & GDPR Healthcare Safeguards',
    detail: 'Enterprise encryption for genomic biomarker ingestion and practitioner portals.',
    badge: 'active',
    badgeText: 'HIPAA / GDPR',
  },
  {
    id: 'comp-cme',
    title: 'Physician Education & Product Registration',
    issuer: 'Medical Affairs & Regulatory Dossiers',
    detail: 'CME training modules, clinical monographs, and customs product registration support.',
    badge: 'active',
    badgeText: 'Active Program',
  },
];

export default function MediluxeCompanyProfile() {
  const [activeTab, setActiveTab] = useState('overview');
  const [deptFilter, setDeptFilter] = useState('All');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let active = true;
    const rawTab = new URLSearchParams(window.location.search).get('tab')?.toLowerCase();
    const validTab = TABS.find((t) => t.id === rawTab)?.id;
    if (validTab) {
      Promise.resolve().then(() => {
        if (active) setActiveTab(validTab);
      });
    }
    return () => {
      active = false;
    };
  }, []);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (tabId === 'overview') url.searchParams.delete('tab');
      else url.searchParams.set('tab', tabId);
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  const handleCopy = useCallback((text, label) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => toast.success(`${label} copied to clipboard`))
        .catch(() => toast.error('Could not copy to clipboard'));
    }
  }, []);

  const handleShareWhatsApp = useCallback(() => {
    const text = encodeURIComponent(
      `MediLuxe Medical Supplies L.L.C. — Institutional Profile & Personalized Medicine Portfolio (Est. 2011, Abu Dhabi & Dubai):\n${PROFILE_URL}`
    );
    if (typeof window !== 'undefined') {
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
    }
  }, []);

  const handlePrint = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }, []);

  const downloadVCard = useCallback(() => {
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'N:Zabala;Jose;;;',
      'FN:Jose Zabala - MediLuxe',
      'ORG:Mediluxe Medical Supplies L.L.C.',
      'TITLE:Executive Director',
      'TEL;TYPE=WORK,VOICE:+971564179256',
      'EMAIL;TYPE=PREF,INTERNET:jose@mediluxegulf.com',
      `URL:${PROFILE_URL}`,
      'ADR;TYPE=WORK:;;Abu Dhabi & Dubai;UAE;;;',
      'NOTE:Personalized Medicine & Advanced Compounding Pharmacy Solutions across GCC',
      'END:VCARD',
    ].join('\n');

    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Jose_Zabala_MediLuxe.vcf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Official vCard downloaded');
  }, []);

  const filteredPortfolio = useMemo(() => {
    if (deptFilter === 'All') return PORTFOLIO_RECORDS;
    return PORTFOLIO_RECORDS.filter((r) => r.department === deptFilter);
  }, [deptFilter]);

  const portfolioColumns = useMemo(
    () => [
      {
        key: 'title',
        header: 'Program / Test',
        render: (val, row) => {
          const item = row || val;
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontWeight: 600, color: '#202124' }}>{item.title}</span>
              <span style={{ fontSize: '0.75rem', color: '#5f6368' }}>{item.focus}</span>
            </div>
          );
        },
      },
      {
        key: 'department',
        header: 'Department',
        render: (val, row) => {
          const item = row || val;
          return (
            <span className="ml-gcp-iso-badge" style={{ minWidth: 'auto', padding: '2px 8px' }}>
              {item.department}
            </span>
          );
        },
      },
      {
        key: 'sampleType',
        header: 'Format / Scope',
        render: (val, row) => {
          const item = row || val;
          return <span style={{ fontSize: '0.8rem', color: '#3c4043' }}>{item.sampleType}</span>;
        },
      },
      {
        key: 'status',
        header: 'Availability',
        render: (val, row) => {
          const item = row || val;
          return <StatusBadge status={item.status} customLabel="Available" />;
        },
      },
      {
        key: '_link',
        header: 'Reference',
        render: (val, row) => {
          const item = row || val;
          return (
            <Link
              href={item.actionHref}
              className="gcp-btn-secondary ml-gcp-btn-neutral"
              style={{ textDecoration: 'none', padding: '4px 10px', fontSize: '0.75rem' }}
            >
              <span>{item.actionLabel}</span>
              <ArrowRight size={13} />
            </Link>
          );
        },
      },
    ],
    []
  );

  const networkColumns = useMemo(
    () => [
      {
        key: 'iso',
        header: 'ISO',
        render: (val, row) => {
          const item = row || val;
          return <span className="ml-gcp-iso-badge">{item.iso}</span>;
        },
      },
      {
        key: 'country',
        header: 'Market & Operating Hub',
        render: (val, row) => {
          const item = row || val;
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontWeight: 600, color: '#202124' }}>{item.country}</span>
              <span style={{ fontSize: '0.75rem', color: '#5f6368' }}>{item.hub}</span>
            </div>
          );
        },
      },
      {
        key: 'authority',
        header: 'Regulatory Authority',
        render: (val, row) => {
          const item = row || val;
          return (
            <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#3c4043', fontWeight: 600 }}>
              {item.authority}
            </span>
          );
        },
      },
      {
        key: 'coldChain',
        header: 'Logistics Standard',
        render: (val, row) => {
          const item = row || val;
          return <span style={{ fontSize: '0.78rem', color: '#5f6368' }}>{item.coldChain}</span>;
        },
      },
      {
        key: 'status',
        header: 'Status',
        render: (val, row) => {
          const item = row || val;
          return <StatusBadge status={item.status} customLabel="Operational" />;
        },
      },
    ],
    []
  );

  const entityProperties = useMemo(
    () => [
      { label: 'Legal Entity', value: 'Mediluxe Medical Supplies L.L.C.', copyable: true, maxLength: 22 },
      { label: 'Established', value: '2011 (14+ Years)' },
      { label: 'Headquarters', value: 'Abu Dhabi, UAE' },
      { label: '2024 Expansion', value: 'Dubai Healthcare Hub' },
      { label: 'Quality Standard', value: 'GMP & ISO Cleanroom' },
      { label: 'Cold-Chain', status: 'active', statusLabel: '2-8°C Validated' },
      { label: 'Data Privacy', status: 'info', statusLabel: 'HIPAA / GDPR' },
    ],
    []
  );

  const connectedLinks = useMemo(
    () => [
      { label: 'Public Formulation Catalog', href: '/catalog' },
      { label: 'Clinical Protocol Library', href: '/proto' },
      { label: 'B2B Price Schedules', href: '/pricing' },
      { label: 'Regulatory & Quality Docs', href: '/regulatory' },
    ],
    []
  );

  return (
    <div className="ml-gcp-page">
      {/* ── Flat GCP Resource Header (using <section>, zero ad-hoc <header>) ── */}
      <section className="ml-gcp-header" aria-label="MediLuxe Institutional Resource Header">
        <div className="ml-gcp-container">
          <Breadcrumb
            items={[
              { label: 'Atlas Health', href: '/' },
              { label: 'Corporate Profile', href: '/atlas' },
              { label: 'MediLuxe Medical Supplies L.L.C.' },
            ]}
          />

          <div className="ml-gcp-header-top">
            <div style={{ minWidth: 0, flex: '1 1 360px' }}>
              <div className="ml-gcp-title-row">
                <div className="ml-gcp-logo-badge" aria-hidden="true">M</div>
                <h1 className="ml-gcp-title">MediLuxe Medical Supplies L.L.C.</h1>
                <StatusBadge status="active" customLabel="MOH & DOH Authorized · Est. 2011" />
              </div>
              <p className="ml-gcp-subtitle">
                Caring for Health — Personalized medicine, European certified DNA diagnostics, and GMP
                compounding pharmacy solutions across UAE, Qatar, Kuwait, and Saudi Arabia.
              </p>
            </div>

            {/* Single solid Primary CTA + Monochrome Secondary Actions (Rules #40 & #57) */}
            <div className="ml-gcp-toolbar no-print">
              <button
                type="button"
                onClick={downloadVCard}
                className="gcp-btn-primary"
                title="Download executive digital contact card (.vcf)"
              >
                <Download size={15} />
                <span>Download vCard (.vcf)</span>
              </button>
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="gcp-btn-secondary ml-gcp-btn-neutral ml-gcp-btn-wa"
                title="Share official dossier on WhatsApp"
              >
                <Share2 size={15} />
                <span>WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => handleCopy(PROFILE_URL, 'Profile URL')}
                className="gcp-btn-secondary ml-gcp-btn-neutral"
                title="Copy canonical profile link"
              >
                <Copy size={15} />
                <span>Copy URL</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="gcp-btn-secondary ml-gcp-btn-neutral"
                title="Print executive one-pager or save PDF"
              >
                <Printer size={15} />
                <span>Print / PDF</span>
              </button>
            </div>
          </div>

          {/* ── GCP Resource Tab Navigation ── */}
          <nav className="ml-gcp-tabs no-print" aria-label="MediLuxe Resource Sections">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleTabChange(tab.id)}
                  className={`ml-gcp-tab ${isActive ? 'is-active' : ''}`}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </section>

      {/* ── Main Resource Body ── */}
      <div className="ml-gcp-container">
        {/* 4 Unified MetricCards (Golden Rules #22 & #41) */}
        <div className="ml-gcp-kpi-grid">
          <MetricCard
            title="Active Formulations"
            value="580+"
            subtitle="GMP & Compounding SKUs"
            icon={FlaskConical}
            color="#1a73e8"
          />
          <MetricCard
            title="Clinical Protocols"
            value="100+"
            subtitle="Evidence-Based Regimens"
            icon={Award}
            color="#0d9488"
          />
          <MetricCard
            title="Clinical Departments"
            value="6"
            subtitle="Specialized Portfolios"
            icon={Layers}
            color="#003666"
          />
          <MetricCard
            title="GCC Operating Hubs"
            value="4"
            subtitle="UAE · QAT · KWT · KSA"
            icon={Globe}
            color="#1e8e3e"
          />
        </div>

        {/* Canonical Always-Left 4-Zone Contextual Shell (Desktop 268px / Laptop 64px / Mobile Left Drawer) */}
        <AtlasLeftRailLayout
          title="MediLuxe L.L.C."
          status="active"
          statusLabel="Abu Dhabi HQ"
          entityId="Est. 2011"
          navTitle="Dossier Sections"
          navItems={TABS}
          activeNavId={activeTab}
          onSelectNav={handleTabChange}
          propertiesTitle="Entity Properties"
          properties={entityProperties}
          links={connectedLinks}
          mobileTriggerLabel="Sections & Entity Info"
          storageKey="atlas_mediluxe_left_rail"
          primaryAction={{
            label: 'Download vCard (.vcf)',
            icon: Download,
            onClick: downloadVCard,
          }}
          secondaryActions={[
            {
              label: 'Copy URL',
              icon: Copy,
              onClick: () => handleCopy(PROFILE_URL, 'Profile URL'),
            },
            {
              label: 'Print / PDF',
              icon: Printer,
              onClick: handlePrint,
            },
          ]}
          extraRailContent={
            <div style={{ padding: '0.65rem 0.875rem', borderTop: '1px solid var(--gcp-sb-divider, #e8eaed)', background: '#f8f9fa' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', fontWeight: 600, color: '#202124', marginBottom: '0.25rem' }}>
                <ThermometerSnowflake size={14} style={{ color: '#1a73e8' }} />
                <span>GCC Cold-Chain Dispatch</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.73rem', color: '#5f6368', lineHeight: 1.45 }}>
                Abu Dhabi vault &amp; Dubai 2024 expansion supporting 2–8°C biologicals across UAE, Qatar, Kuwait, and KSA.
              </p>
            </div>
          }
        >
          <main className="ml-gcp-main">
            {/* ═══ TAB 1: OVERVIEW ═══ */}
            {activeTab === 'overview' && (
              <>
                <section className="ml-gcp-section">
                  <div className="ml-gcp-section-header">
                    <div>
                      <h2 className="ml-gcp-section-title">
                        <Building2 size={17} />
                        <span>Institutional Overview &amp; Precision Workflow</span>
                      </h2>
                      <p className="ml-gcp-section-desc">
                        Founded in 2011 in Abu Dhabi, MediLuxe serves hospitals, private clinics, and
                        longevity institutes across the Middle East with European biotechnology,
                        certified DNA diagnostics, and GMP sterile compounding.
                      </p>
                    </div>
                    <StatusBadge status="info" customLabel="End-to-End Methodology" />
                  </div>

                  <div className="ml-gcp-flow-grid">
                    {PIPELINE_STEPS.map((step) => (
                      <div key={step.code} className="ml-gcp-flow-step">
                        <div className="ml-gcp-flow-code">{step.code}</div>
                        <div className="ml-gcp-flow-title">{step.title}</div>
                        <div className="ml-gcp-flow-sub">{step.detail}</div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="ml-gcp-section">
                  <div className="ml-gcp-section-header">
                    <div>
                      <h2 className="ml-gcp-section-title">
                        <Cpu size={17} />
                        <span>Integrated Health Platforms</span>
                      </h2>
                      <p className="ml-gcp-section-desc">
                        Unifying genomic markers, blood panels, and wearable telemetry into
                        practitioner-ready clinical workflows under HIPAA and GDPR safeguards.
                      </p>
                    </div>
                  </div>
                  <div className="ml-gcp-three-col">
                    {HEALTH_PILLARS.map((pillar) => (
                      <div key={pillar.step} className="ml-gcp-subpanel">
                        <div style={{ fontWeight: 600, fontSize: '0.84rem', color: '#202124', marginBottom: '0.35rem' }}>
                          {pillar.step}
                        </div>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#5f6368', lineHeight: 1.5 }}>
                          {pillar.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="ml-gcp-section">
                  <div className="ml-gcp-section-header">
                    <div>
                      <h2 className="ml-gcp-section-title">
                        <ShieldCheck size={17} />
                        <span>Mission, Vision &amp; Multidisciplinary Leadership</span>
                      </h2>
                      <p className="ml-gcp-section-desc">
                        Empowering physicians and chief pharmacists across the GCC with proactive,
                        root-cause personalized medicine.
                      </p>
                    </div>
                  </div>

                  <div className="ml-gcp-two-col" style={{ marginBottom: '1rem' }}>
                    <div className="ml-gcp-subpanel">
                      <h3 style={{ margin: '0 0 0.6rem', fontSize: '0.9rem', fontWeight: 600, color: '#202124' }}>
                        Our Mission
                      </h3>
                      <ul className="ml-gcp-bullet-list">
                        <li className="ml-gcp-bullet-item">
                          <Check size={14} style={{ color: '#1e8e3e', flexShrink: 0, marginTop: '2px' }} />
                          <span>Bridge advanced genomic diagnostics with customized therapeutic solutions.</span>
                        </li>
                        <li className="ml-gcp-bullet-item">
                          <Check size={14} style={{ color: '#1e8e3e', flexShrink: 0, marginTop: '2px' }} />
                          <span>Integrate European GMP biotechnology into everyday clinical workflows.</span>
                        </li>
                        <li className="ml-gcp-bullet-item">
                          <Check size={14} style={{ color: '#1e8e3e', flexShrink: 0, marginTop: '2px' }} />
                          <span>Prioritize preventative, root-cause medicine over reactive symptom treatment.</span>
                        </li>
                      </ul>
                    </div>

                    <div className="ml-gcp-subpanel">
                      <h3 style={{ margin: '0 0 0.6rem', fontSize: '0.9rem', fontWeight: 600, color: '#202124' }}>
                        Our Vision
                      </h3>
                      <ul className="ml-gcp-bullet-list">
                        <li className="ml-gcp-bullet-item">
                          <Check size={14} style={{ color: '#1a73e8', flexShrink: 0, marginTop: '2px' }} />
                          <span>Empower healthcare clinics to lead modern personalized longevity care.</span>
                        </li>
                        <li className="ml-gcp-bullet-item">
                          <Check size={14} style={{ color: '#1a73e8', flexShrink: 0, marginTop: '2px' }} />
                          <span>Drive systemic transition toward proactive, biomarker-guided interventions.</span>
                        </li>
                        <li className="ml-gcp-bullet-item">
                          <Check size={14} style={{ color: '#1a73e8', flexShrink: 0, marginTop: '2px' }} />
                          <span>Expand compliant access to compounded therapeutics across the Middle East.</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="ml-gcp-three-col">
                    <div className="ml-gcp-subpanel" style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#202124' }}>15+</div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase' }}>
                        Years Leadership Experience
                      </div>
                    </div>
                    <div className="ml-gcp-subpanel" style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#202124' }}>6</div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase' }}>
                        Nationalities Represented
                      </div>
                    </div>
                    <div className="ml-gcp-subpanel" style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#202124' }}>4</div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase' }}>
                        Core Clinical Disciplines
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* ═══ TAB 2: CLINICAL PORTFOLIO ═══ */}
            {activeTab === 'portfolio' && (
              <section className="ml-gcp-section">
                <div className="ml-gcp-section-header">
                  <div>
                    <h2 className="ml-gcp-section-title">
                      <Dna size={17} />
                      <span>Molecular Diagnostics &amp; Clinical Departments</span>
                    </h2>
                    <p className="ml-gcp-section-desc">
                      Filter by department or expand any row to inspect biomarkers, therapeutic applications,
                      and direct monograph routes.
                    </p>
                  </div>
                  <Link
                    href="/catalog"
                    className="gcp-btn-secondary ml-gcp-btn-neutral"
                    style={{ textDecoration: 'none' }}
                  >
                    <span>Browse Full Catalog</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="gcp-chip-group" style={{ marginBottom: '1rem' }}>
                  {DEPARTMENT_FILTERS.map((dept) => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => setDeptFilter(dept)}
                      className={`gcp-chip-btn ${deptFilter === dept ? 'is-active' : ''}`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>

                <DataTable
                  columns={portfolioColumns}
                  data={filteredPortfolio}
                  keyField="id"
                  pagination={false}
                  enableAskAtlas={false}
                  expandableRender={(row) => (
                    <div style={{ padding: '0.85rem 1rem', background: '#f8f9fa', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#202124', marginBottom: '0.45rem' }}>
                        Clinical Scope &amp; Deliverables — {row.title}
                      </div>
                      <ul className="ml-gcp-bullet-list">
                        {(row.highlights || []).map((h) => (
                          <li key={h} className="ml-gcp-bullet-item">
                            <CheckCircle2 size={14} style={{ color: '#1e8e3e', flexShrink: 0, marginTop: '2px' }} />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                />
              </section>
            )}

            {/* ═══ TAB 3: GCC NETWORK ═══ */}
            {activeTab === 'network' && (
              <>
                <section className="ml-gcp-section">
                  <div className="ml-gcp-section-header">
                    <div>
                      <h2 className="ml-gcp-section-title">
                        <MapPin size={17} />
                        <span>GCC Cold-Chain &amp; Regional Distribution Network</span>
                      </h2>
                      <p className="ml-gcp-section-desc">
                        Cross-border logistics infrastructure ensuring regulated customs clearance and
                        2–8°C / -20°C cold-chain integrity across Gulf medical markets.
                      </p>
                    </div>
                    <StatusBadge status="active" customLabel="4 Active Markets" />
                  </div>

                  <div className="gcp-card" style={{ marginBottom: '1rem' }}>
                    <GccRealisticVectorMap />
                  </div>

                  <DataTable
                    columns={networkColumns}
                    data={GCC_HUBS}
                    keyField="id"
                    pagination={false}
                    enableAskAtlas={false}
                    expandableRender={(row) => (
                      <div style={{ padding: '0.65rem 0.85rem', fontSize: '0.8rem', color: '#3c4043' }}>
                        <strong>Operational Scope:</strong> {row.scope}
                      </div>
                    )}
                  />
                </section>
              </>
            )}

            {/* ═══ TAB 4: COMPLIANCE & VAULT ═══ */}
            {activeTab === 'compliance' && (
              <section className="ml-gcp-section">
                <div className="ml-gcp-section-header">
                  <div>
                    <h2 className="ml-gcp-section-title">
                      <ShieldCheck size={17} />
                      <span>Regulatory Accreditations &amp; Quality Vault</span>
                    </h2>
                    <p className="ml-gcp-section-desc">
                      Verified institutional credentials, cleanroom compounding standards, and data-privacy
                      safeguards for hospital procurement &amp; medical directors.
                    </p>
                  </div>
                  <a
                    href="mailto:jose@mediluxegulf.com?subject=MediLuxe%20Compliance%20Pack%20Request"
                    className="gcp-btn-secondary ml-gcp-btn-neutral"
                    style={{ textDecoration: 'none' }}
                  >
                    <FileText size={14} />
                    <span>Request Compliance Pack</span>
                  </a>
                </div>

                <div className="ml-gcp-vault-grid">
                  {COMPLIANCE_RECORDS.map((rec) => (
                    <div key={rec.id} className="ml-gcp-vault-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#202124' }}>
                            {rec.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#5f6368', marginTop: '2px' }}>
                            {rec.issuer}
                          </div>
                        </div>
                        <StatusBadge status={rec.badge} customLabel={rec.badgeText} />
                      </div>
                      <p style={{ margin: 0, fontSize: '0.79rem', color: '#3c4043', lineHeight: 1.5 }}>
                        {rec.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ═══ TAB 5: EXECUTIVE CONTACT ═══ */}
            {activeTab === 'contact' && (
              <section className="ml-gcp-section">
                <div className="ml-gcp-section-header">
                  <div>
                    <h2 className="ml-gcp-section-title">
                      <Phone size={17} />
                      <span>Executive Directory &amp; Digital Verification</span>
                    </h2>
                    <p className="ml-gcp-section-desc">
                      Direct channel for hospital procurement officers, medical directors, and
                      regional distribution partners.
                    </p>
                  </div>
                </div>

                <div className="ml-gcp-contact-grid">
                  <div className="ml-gcp-subpanel" style={{ background: '#ffffff' }}>
                    <div className="ml-gcp-kv-list">
                      <div className="ml-gcp-kv-row">
                        <span className="ml-gcp-kv-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <Mail size={14} /> Official Email
                        </span>
                        <CopyableId value="jose@mediluxegulf.com" maxLength={32} />
                      </div>
                      <div className="ml-gcp-kv-row">
                        <span className="ml-gcp-kv-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={14} /> Direct / WhatsApp
                        </span>
                        <CopyableId value="+971 56 4179256" maxLength={24} />
                      </div>
                      <div className="ml-gcp-kv-row">
                        <span className="ml-gcp-kv-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <Globe size={14} /> Canonical URL
                        </span>
                        <CopyableId value={PROFILE_URL} maxLength={34} truncate />
                      </div>
                      <div className="ml-gcp-kv-row">
                        <span className="ml-gcp-kv-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <ExternalLink size={14} /> Corporate Domain
                        </span>
                        <a
                          href="https://www.mediluxegulf.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#1a73e8', fontWeight: 600, textDecoration: 'none' }}
                        >
                          www.mediluxegulf.com
                        </a>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid #f1f3f4' }}>
                      <button
                        type="button"
                        onClick={downloadVCard}
                        className="gcp-btn-primary"
                      >
                        <Download size={14} />
                        <span>Save Executive vCard (.vcf)</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleShareWhatsApp}
                        className="gcp-btn-secondary ml-gcp-btn-neutral ml-gcp-btn-wa"
                      >
                        <Share2 size={14} />
                        <span>Send via WhatsApp</span>
                      </button>
                    </div>
                  </div>

                  <div className="ml-gcp-qr-box">
                    <div className="ml-gcp-qr-frame">
                      <QRCodeSVG
                        value={PROFILE_URL}
                        size={140}
                        level="M"
                        fgColor="#202124"
                        bgColor="#ffffff"
                      />
                    </div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#202124' }}>
                      Verified Profile QR Code
                    </div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#5f6368', lineHeight: 1.45 }}>
                      Scan to open the live MediLuxe institutional profile on any mobile device.
                    </p>
                  </div>
                </div>
              </section>
            )}
          </main>
        </AtlasLeftRailLayout>

        {/* Print-Only Complete Corporate One-Pager Summary */}
        <section className="ml-gcp-print-summary ml-gcp-section" aria-hidden="true">
          <h2 className="ml-gcp-section-title" style={{ marginBottom: '0.5rem' }}>
            Executive One-Pager — GCC Coverage &amp; Contact Verification
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#3c4043', marginBottom: '0.75rem' }}>
            Operating Hubs: UAE (Abu Dhabi HQ &amp; Dubai 2024), Qatar (MOPH), Kuwait (MOH), Saudi Arabia (SFDA).
            Accredited European GMP APIs &amp; Certified European Genomics Partners.
          </p>
          <p style={{ fontSize: '0.8rem', color: '#202124', margin: 0 }}>
            <strong>Executive Contact:</strong> Jose Zabala · jose@mediluxegulf.com · +971 56 4179256 · {PROFILE_URL}
          </p>
        </section>
      </div>
    </div>
  );
}
