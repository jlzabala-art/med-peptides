'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  FileText,
  ExternalLink,
  Copy,
  Check,
  Download,
  Dna,
  Sparkles,
  Share2,
  Lock,
  ShieldCheck,
  Building2,
  Users,
  Eye,
  ArrowRight,
  TrendingUp,
  Tag,
  DollarSign,
  Package,
  Layers,
  Scissors
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '@/components/ui/PageHeader';
import GlobalSearchBar from '@/components/ui/GlobalSearchBar';
import MetricCard from '@/components/ui/MetricCard';
import KpiScopeBar from '@/components/ui/KpiScopeBar';
import AdminAgreementModal from './AdminAgreementModal';

const PRICE_SCHEDULES = [
  {
    id: 'peptides',
    title: 'Clinical Lyophilized Peptides',
    subtitle: 'Certified analytical-grade bioactive peptide vials (≥99.0% HPLC purity)',
    badge: '127 Sterile Vials',
    badgeColor: '#0284c7',
    badgeBg: '#f0f9ff',
    badgeBorder: '#bae6fd',
    route: '/pricing/peptides',
    referralCode: 'CAT-RX-7482',
    partnerName: 'Nikolaos Psathas (NPLAB) · Wholeseller',
    pricingFormula: 'Cost + 15% Mediluxe + 15% Wholeseller (×1.3225)',
    volumeTier: 'Pack ×10 Vials (-15% Volume Discount)',
    currencies: 'USD ($) default · EUR · AED',
    supplierFamily: 'Lyophilized Peptides Laboratory',
    whiteLabelStatus: 'Strict White-Label (No supplier or wholesaler names shown to clients)',
    emailNotifications: 'Instant order alert to jose@mediluxeme.com with referral breakdown',
    category: 'peptides'
  },
  {
    id: '24genetics',
    title: '24Genetics DNA Panels & AI Connect',
    subtitle: 'CE-IVD saliva genomic testing kits and continuous AI re-annotation subscriptions',
    badge: '10 Kits + 2 Subscriptions',
    badgeColor: '#0d9488',
    badgeBg: '#f0fdfa',
    badgeBorder: '#99f6e4',
    route: '/pricing/24genetics',
    aliasRoute: '/pricing/24genomics',
    referralCode: null,
    partnerName: '24Genetics S.L. (Madrid, Spain)',
    pricingFormula: 'Dynamic Role-Based: Guest (Retail MSRP) · Clinic (€201.15) · Wholesale (€178.80)',
    volumeTier: 'Pack ×10 Kits (-15% Volume Discount: €152.00 / kit)',
    currencies: 'EUR (€) default · USD · AED',
    supplierFamily: '24Genetics CE-IVD Laboratory',
    whiteLabelStatus: 'Official 24Genetics Brand & Compounding Studio Synergy',
    emailNotifications: 'Direct B2B Proforma Request notification to jose@mediluxeme.com',
    category: 'genomics'
  },
  {
    id: 'colway-hair',
    title: 'Colway Trichology & Hair Line',
    subtitle: 'Strengthening Anti-Hair Loss Shampoo & Conditioner with Baicapil™ 2% + Tropocollagen',
    badge: 'Trichology Protocol',
    badgeColor: '#059669',
    badgeBg: '#ecfdf5',
    badgeBorder: '#a7f3d0',
    route: '/pricing/colway-hair',
    referralCode: null,
    partnerName: 'Colway Medical & Cellular Derma',
    pricingFormula: 'Role-Based: Retail (180 AED) · Clinic (145 AED) · Wholesale (115 AED) · Landed Dubai Protected',
    volumeTier: 'Complete Trichology Duo (Shampoo + Conditioner + Colvita)',
    currencies: 'AED (Base) · USD · EUR',
    supplierFamily: 'Colway Native Tropocollagen',
    whiteLabelStatus: 'Official Colway Clinical Schedule (Landed Cost hidden from non-admins)',
    emailNotifications: 'Direct B2B Proforma Request notification to jose@mediluxeme.com',
    category: 'hair'
  },
  {
    id: 'colway-full',
    title: 'Colway Complete Cellular Derma Portfolio',
    subtitle: 'Biologically active native fish tropocollagen, Colvita, Blue Diamond & Barrier Care',
    badge: '8 Standalone Formulations',
    badgeColor: '#6366f1',
    badgeBg: '#eef2ff',
    badgeBorder: '#c7d2fe',
    route: '/pricing/colway',
    referralCode: null,
    partnerName: 'Colway Medical & Cellular Derma',
    pricingFormula: 'Wholesale (+15% Net) · Clinic (+25% Margin) · Retail (+30% Margin) · Landed Cost Protected',
    volumeTier: 'Institutional Clinic Master Schedule',
    currencies: 'AED (Base) · USD · EUR',
    supplierFamily: 'Colway Native Tropocollagen',
    whiteLabelStatus: 'Official Colway Master Schedule (Landed Cost restricted to Admin)',
    emailNotifications: 'Direct B2B Proforma Request notification to jose@mediluxeme.com',
    category: 'derma',
    tierSupport: ['wholesale', 'clinic', 'patient']
  },
  {
    id: 'colway-qatar',
    title: 'Colway Hair Care • Qatar Distributor Schedule',
    subtitle: 'Landed-cost commercial architecture for Ryhanh Medical Company (Ryhanh Group)',
    badge: 'Qatar Exclusive · 80 Units',
    badgeColor: '#15803d',
    badgeBg: '#f0fdf4',
    badgeBorder: '#bbf7d0',
    route: '/pricing/colway-qatar',
    referralCode: 'QATAR-COLWAY-RYHANH',
    partnerName: 'Hossam Ahmed · Ryhanh Medical Company (Doha, Qatar)',
    pricingFormula: 'Approved Factory (102 PLN / $26.00) + Air Freight (19.73 PLN / $5.00) = 121.73 PLN ($31.00 USD / 112 QAR) → Retail (187 QAR, +75 QAR / 40.1% Margin)',
    volumeTier: '80 Units Initial Commercial Batch (40 Shampoo + 40 Conditioner)',
    currencies: 'QAR (Primary) · USD · PLN (Origin)',
    supplierFamily: 'Colway European Compounding Lab',
    whiteLabelStatus: 'Exclusive Distributor Schedule (100% advance payment with purchase order)',
    emailNotifications: 'Instant notification to jose@mediluxeme.com on pro-forma requests',
    category: 'distributor',
    tierSupport: ['wholesale'],
    isFirestoreSsot: true,
    agreementSlug: 'colway-qatar'
  },
  {
    id: '24genomics-qatar',
    title: '24Genetics Clinical DNA & Nutrigenomics (Nutrigen)',
    subtitle: 'Exclusive Qatar wholesale testing kits schedule for Ryhanh Medical Company (Ryhanh Group)',
    badge: 'Qatar Exclusive · CE-IVD',
    badgeColor: '#0f766e',
    badgeBg: '#f0fdfa',
    badgeBorder: '#99f6e4',
    route: '/pricing/24genomics-qatar',
    referralCode: 'QATAR-24G-RYHANH',
    partnerName: 'Hossam Ahmed · Ryhanh Medical Company (Doha, Qatar)',
    pricingFormula: 'Lab Pack ×10 (€104.30) → Distributor (475 QAR) → Clinic (750 QAR / 36.7% Margin) → Retail (950 QAR)',
    volumeTier: 'Pack ×10 Kits (-30% Volume Discount)',
    currencies: 'QAR (Primary) · USD · EUR (Lab origin)',
    supplierFamily: '24Genetics CE-IVD European Lab (Madrid)',
    whiteLabelStatus: 'Custom Compounded Nutrigenomic Formulation Integration',
    emailNotifications: 'Instant notification to jose@mediluxeme.com on pro-forma requests',
    category: 'distributor',
    tierSupport: ['wholesale', 'clinic'],
    isFirestoreSsot: true,
    agreementSlug: '24genomics-qatar'
  }
];

export default function AdminPriceSchedulesTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [editingAgreementSlug, setEditingAgreementSlug] = useState(null);

  const handleCopyLink = (schedule, tier = null) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.atlashealth-services.com';
    const params = new URLSearchParams();
    if (schedule.referralCode) params.set('ref', schedule.referralCode);
    if (tier && tier !== 'default') params.set('tier', tier);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const fullUrl = `${origin}${schedule.route}${queryString}`;
    navigator.clipboard.writeText(fullUrl);
    const copyKey = `${schedule.id}-${tier || 'default'}`;
    setCopiedId(copyKey);
    const tierLabel = tier ? ` (${tier.toUpperCase()} TIER)` : '';
    toast.success(`Copied shareable link${tierLabel} for ${schedule.title} ✓`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredSchedules = useMemo(() => {
    return PRICE_SCHEDULES.filter(s => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        s.title.toLowerCase().includes(q) ||
        s.subtitle.toLowerCase().includes(q) ||
        s.partnerName.toLowerCase().includes(q) ||
        s.route.toLowerCase().includes(q);

      let matchesFilter = true;
      if (selectedFilter === 'all') matchesFilter = true;
      else if (selectedFilter === 'wholesalers') matchesFilter = s.tierSupport?.includes('wholesale') || s.category === 'distributor' || s.pricingFormula.includes('Wholesale') || s.pricingFormula.includes('Wholeseller');
      else if (selectedFilter === 'clinics') matchesFilter = s.tierSupport?.includes('clinic') || s.pricingFormula.includes('Clinic');
      else if (selectedFilter === 'patients') matchesFilter = s.tierSupport?.includes('patient') || s.pricingFormula.includes('Retail') || s.pricingFormula.includes('Guest');
      else if (selectedFilter === 'distributor') matchesFilter = s.category === 'distributor';
      else matchesFilter = s.category === selectedFilter;

      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, selectedFilter]);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '3rem' }}>
      <PageHeader
        title="Official B2B Price Schedules Directory"
        subtitle="Centralized management hub for official wholesale price schedules, partner referral links, and role-based pricing rules."
        icon={FileSpreadsheet}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link
              href="/pricing"
              target="_blank"
              className="btn btn-outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
              title="Open the Public Price Schedules Directory"
            >
              <ExternalLink size={15} /> Open Public Hub
            </Link>
          </div>
        }
      />

      {/* 4 KPIs at top (Golden Rule #22) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        <MetricCard
          title="Active Schedules"
          value={PRICE_SCHEDULES.length}
          icon={FileSpreadsheet}
          trend="Certified B2B Price Lists"
          trendDirection="neutral"
        />
        <MetricCard
          title="Total B2B References"
          value="147 SKUs"
          icon={Package}
          trend="Vials, DNA Kits & Derma"
          trendDirection="up"
        />
        <MetricCard
          title="Partner Attribution"
          value="Nikolas / CAT-RX-7482"
          icon={Share2}
          trend="Silent attribution active"
          trendDirection="up"
        />
        <MetricCard
          title="Currencies Engine"
          value="USD · EUR · AED"
          icon={DollarSign}
          trend="Auto FX synchronizer"
          trendDirection="neutral"
        />
      </div>

      {/* Search & Category Filter */}
      <div style={{ marginBottom: '1.5rem' }}>
        <GlobalSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search price schedules by name, route, formula or partner..."
          size="lg"
          resultCount={filteredSchedules.length}
          filters={
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'All Schedules' },
                { id: 'wholesalers', label: 'Wholesalers & Distributors' },
                { id: 'clinics', label: 'Clinics & Doctors' },
                { id: 'patients', label: 'Patients & Retail' },
                { id: 'distributor', label: 'Qatar Exclusive (Hossam)' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedFilter(tab.id)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 650,
                    border: '1px solid',
                    cursor: 'pointer',
                    background: selectedFilter === tab.id ? '#0f172a' : '#ffffff',
                    color: selectedFilter === tab.id ? '#ffffff' : '#475569',
                    borderColor: selectedFilter === tab.id ? '#0f172a' : '#cbd5e1'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          }
        />
      </div>

      {/* Grid of Price Schedules Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.25rem' }}>
        {filteredSchedules.map(schedule => {
          const isCopied = copiedId === schedule.id;
          return (
            <div
              key={schedule.id}
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '1.5rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div>
                {/* Header & Badges */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 750,
                    color: schedule.badgeColor,
                    background: schedule.badgeBg,
                    border: `1px solid ${schedule.badgeBorder}`,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>
                    {schedule.badge}
                  </span>
                  <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#64748b', background: '#f8fafc', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                    {schedule.route}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.20rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                  {schedule.title}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4, margin: '0 0 12px 0' }}>
                  {schedule.subtitle}
                </p>

                {/* Specification Matrix */}
                <div style={{
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #f1f5f9',
                  padding: '10px 12px',
                  fontSize: '0.78rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Pricing Rule: </span>
                    <strong style={{ color: '#0f172a' }}>{schedule.pricingFormula}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Volume Tier: </span>
                    <span style={{ color: '#047857', fontWeight: 700 }}>{schedule.volumeTier}</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Partner / Supplier: </span>
                    <span style={{ color: '#334155' }}>{schedule.partnerName}</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Currencies: </span>
                    <span style={{ color: '#0284c7', fontWeight: 600 }}>{schedule.currencies}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '4px', marginTop: '2px' }}>
                    🛡️ {schedule.whiteLabelStatus}
                  </div>
                </div>
              </div>

              {/* Action Buttons & Multi-Tier Share Links */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                paddingTop: '0.75rem',
                borderTop: '1px solid #f1f5f9',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleCopyLink(schedule)}
                    style={{
                      padding: '5px 10px',
                      fontSize: '0.74rem',
                      fontWeight: 650,
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      color: copiedId === `${schedule.id}-default` ? '#059669' : '#334155',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title={schedule.referralCode ? `Copy partner link with ?ref=${schedule.referralCode}` : 'Copy direct link'}
                  >
                    {copiedId === `${schedule.id}-default` ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    <span>{copiedId === `${schedule.id}-default` ? 'Copied' : (schedule.referralCode ? 'Partner Link' : 'Copy Link')}</span>
                  </button>

                  {/* Multi-Tier Direct Links */}
                  <button
                    onClick={() => handleCopyLink(schedule, 'wholesale')}
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.70rem',
                      fontWeight: 650,
                      background: '#fff7ed',
                      border: '1px solid #fed7aa',
                      borderRadius: '4px',
                      color: copiedId === `${schedule.id}-wholesale` ? '#15803d' : '#c2410c',
                      cursor: 'pointer'
                    }}
                    title="Copy Wholesale B2B Link (?tier=wholesale)"
                  >
                    {copiedId === `${schedule.id}-wholesale` ? '✓ Wholesale' : '+ Wholesale Link'}
                  </button>

                  <button
                    onClick={() => handleCopyLink(schedule, 'clinic')}
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.70rem',
                      fontWeight: 650,
                      background: '#f0fdfa',
                      border: '1px solid #99f6e4',
                      borderRadius: '4px',
                      color: copiedId === `${schedule.id}-clinic` ? '#15803d' : '#0d9488',
                      cursor: 'pointer'
                    }}
                    title="Copy Clinic / Practitioner Link (?tier=clinic)"
                  >
                    {copiedId === `${schedule.id}-clinic` ? '✓ Clinic' : '+ Clinic Link'}
                  </button>

                  <button
                    onClick={() => handleCopyLink(schedule, 'patient')}
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.70rem',
                      fontWeight: 650,
                      background: '#faf5ff',
                      border: '1px solid #e9d5ff',
                      borderRadius: '4px',
                      color: copiedId === `${schedule.id}-patient` ? '#15803d' : '#7c3aed',
                      cursor: 'pointer'
                    }}
                    title="Copy Patient / Retail MSRP Link (?tier=patient)"
                  >
                    {copiedId === `${schedule.id}-patient` ? '✓ Patient' : '+ Patient Link'}
                  </button>

                  {schedule.referralCode && (
                    <span style={{
                      fontSize: '0.66rem',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: '#0284c7',
                      background: '#f0f9ff',
                      border: '1px solid #bae6fd',
                      padding: '2px 5px',
                      borderRadius: '4px'
                    }}>
                      ?ref={schedule.referralCode}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {schedule.isFirestoreSsot && (
                    <button
                      type="button"
                      onClick={() => setEditingAgreementSlug(schedule.agreementSlug)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        background: '#f0fdf4',
                        color: '#15803d',
                        border: '1px solid #86efac',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                      title="Edit commercial agreement terms & pricing directly in Firestore SSOT"
                    >
                      <Sparkles size={13} className="text-emerald-600" />
                      <span>Edit SSOT</span>
                    </button>
                  )}

                  <Link
                    href={schedule.referralCode ? `${schedule.route}?ref=${schedule.referralCode}` : schedule.route}
                    target="_blank"
                    style={{
                      padding: '6px 14px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      background: '#0284c7',
                      color: '#ffffff',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>Open Price List</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Firestore SSOT Agreement Modal */}
      {editingAgreementSlug && (
        <AdminAgreementModal
          slug={editingAgreementSlug}
          isOpen={Boolean(editingAgreementSlug)}
          onClose={() => setEditingAgreementSlug(null)}
        />
      )}
    </div>
  );
}

