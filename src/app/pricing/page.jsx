import React from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  Dna,
  Package,
  Scissors
} from 'lucide-react';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import Breadcrumb from '@/components/ui/Breadcrumb';
import './colway/ColwayPriceList.css';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';
  return {
    title: 'Official B2B Price Schedules Directory • Mediluxe & Atlas Health',
    description: 'Centralized directory of official wholesale, clinical and institutional price schedules for clinical peptides, 24Genetics genomic panels, and Colway biologically active collagen.',
    openGraph: {
      title: 'Official B2B Price Schedules Directory',
      description: 'Verified clinical and wholesale price lists.',
      url: `${appUrl}/pricing`
    }
  };
}

const SCHEDULES = [
  {
    id: 'peptides',
    title: 'Certified Lyophilized Peptide Vials',
    badge: '127 Formulations · HPLC ≥99%',
    desc: 'Sterile lyophilized bioactive peptides for clinical research and medical practices. Volume tier discounts on 10+ vial boxes.',
    route: '/pricing/peptides',
    badgeColor: '#0284c7',
    badgeBg: '#f0f9ff',
    badgeBorder: '#bae6fd',
    highlights: ['Single Vial & Pack ×10 Tiers', 'USD, EUR & AED live currency switcher', 'Direct Proforma Request Drawer']
  },
  {
    id: '24genetics',
    title: '24Genetics Clinical DNA Panels',
    badge: '10 CE-IVD Kits + AI Connect',
    desc: 'Saliva swab genetic panels covering All-in-One, Pharmacogenetics, Nutrigenetics, Skin, Sport & Microbiome. Directly integrated with our Compounding Studio.',
    route: '/pricing/24genetics',
    badgeColor: '#0d9488',
    badgeBg: '#f0fdfa',
    badgeBorder: '#99f6e4',
    highlights: ['CE-IVD European Certified Lab (Madrid)', '+700,000 SNPs Illumina GSA Array', 'Role-Based Pricing (Retail, Clinic, Wholesale)']
  },
  {
    id: 'colway-hair',
    title: 'Colway Trichology & Hair Line',
    badge: 'Anti-Hair Loss Protocol',
    desc: 'Strengthening Anti-Hair Loss Shampoo & Conditioner formulated with Baicapil™ (2%) + native biologically active fish tropocollagen + micronized diosmin.',
    route: '/pricing/colway-hair',
    badgeColor: '#059669',
    badgeBg: '#ecfdf5',
    badgeBorder: '#a7f3d0',
    highlights: ['Pre & Post-FUE Scalp Preparation', 'Physiologic pH 5.5 Cleanser & pH 4.5 Cuticle Sealing', 'Landed Dubai UAE Distribution']
  },
  {
    id: 'colway',
    title: 'Colway Complete Cellular Derma Portfolio',
    badge: '8 Native Collagen Products',
    desc: 'Master B2B price schedule for intact triple-helix tropocollagen, Colvita marine algae capsules, Blue Diamond cellular rejuvenation and barrier repair.',
    route: '/pricing/colway',
    badgeColor: '#6366f1',
    badgeBg: '#eef2ff',
    badgeBorder: '#c7d2fe',
    highlights: ['Intact Native Tropocollagen (<26°C)', 'Wholesale Net & Recommended Clinic Tiers', 'Official UAE & GCC Distribution']
  }
];

export default function PricingDirectoryPage() {
  return (
    <div className="colway-price-root">
      <header className="screen-nav-bar">
        <div className="nav-container">
          <div className="nav-left">
            <Link href="/" className="nav-brand">
              <Sparkles size={16} className="text-sky-400" />
              <span>MEDILUXE B2B</span>
            </Link>
            <span className="nav-divider">/</span>
            <span className="nav-current">Official Price Schedules Directory</span>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem 4rem 1.5rem' }}>
        <Breadcrumb items={[
          { label: 'B2B Portal', href: '/' },
          { label: 'Price Schedules Directory' }
        ]} />

        <div style={{ marginTop: '1rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 750,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              background: '#0284c7',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: '4px'
            }}>
              Official B2B Price Schedules
            </span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 650,
              color: '#0d9488',
              background: '#f0fdfa',
              border: '1px solid #99f6e4',
              padding: '2px 8px',
              borderRadius: '4px'
            }}>
              Direct Clinical Procurement
            </span>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
            Official Institutional Price Schedules
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '6px', maxWidth: '800px', lineHeight: 1.5 }}>
            Access authorized wholesale price lists, volume tier packaging, and clinical datasheets for medical practices, certified clinics, compounding pharmacies, and distribution partners.
          </p>
        </div>

        {/* 4 Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {SCHEDULES.map(item => (
            <div
              key={item.id}
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '1.5rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1.25rem'
              }}
            >
              <div>
                <span style={{
                  fontSize: '0.70rem',
                  fontWeight: 750,
                  color: item.badgeColor,
                  background: item.badgeBg,
                  border: `1px solid ${item.badgeBorder}`,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  display: 'inline-block',
                  marginBottom: '10px'
                }}>
                  {item.badge}
                </span>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.45, margin: '0 0 14px 0' }}>
                  {item.desc}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                  {item.highlights.map((h, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#475569' }}>
                      <CheckCircle2 size={13} className="text-emerald-500" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href={item.route}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  background: '#0f172a',
                  color: '#ffffff',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                <span>View Official Price Schedule</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </main>

      <PublicUnifiedFooter />
    </div>
  );
}

