'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FileCheck2,
  Globe,
  MapPin,
  Phone,
  Share2,
  ShieldCheck,
  Sparkles,
  Users,
  Warehouse,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import PageHeroCard from '@/components/ui/PageHeroCard';
import CopyableId from '@/components/ui/CopyableId';
import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal';
import { buildSchedulePdfBlob } from '@/lib/pdf/schedulePdfBuilder';
import { usePublicWorkspace } from '@/context/PublicWorkspaceContext';

const ATLAS_PLATFORM_MODULES = [
  {
    titleEn: 'Hormone Pellets (EU GMP)',
    titleEs: 'Pellets Hormonales (EU GMP)',
    descEn: '41+ fused crystalline testosterone & estradiol SKUs with trocar kits and 3.5–6 mo release profiles.',
    descEs: 'Más de 41 referencias de testosterona y estradiol con kits de trócar y liberación de 3,5–6 meses.',
    href: '/pricing/pellets',
  },
  {
    titleEn: 'Sterile Lyophilized Peptides',
    titleEs: 'Péptidos Liofilizados Estériles',
    descEn: '10R clinical peptide vials (≥99.0% HPLC) + multi-dose 3 mL click-dial peptide pens.',
    descEs: 'Viales clínicos 10R (≥99.0% HPLC) y plumas multidosis precargadas de 3 mL.',
    href: '/pricing/peptides',
  },
  {
    titleEn: 'Capillary DBS & Precision Genomics',
    titleEs: 'Diagnóstico Capilar y Genómica',
    descEn: 'Bloodo™ CE-IVDR LC-MS/MS dried blood spot kits & 24Genetics WGS/WES clinical panels.',
    descEs: 'Kits Bloodo™ CE-IVDR LC-MS/MS en sangre capilar y paneles genómicos 24Genetics.',
    href: '/pricing/bloodo',
  },
  {
    titleEn: 'Atlas AI & Clinical Protocols',
    titleEs: 'Atlas AI y Protocolos Clínicos',
    descEn: 'Integrated AI formulary assistant, digital Rx workflows, and EUR / USD / AED live schedules.',
    descEs: 'Asistente clínico Atlas AI, flujos digitales de prescripción y tarifas en EUR / USD / AED.',
    href: '/proto',
  },
];

export default function ImportPartnerClient({ partner, initialLang = 'en' }) {
  const workspace = usePublicWorkspace?.() || {};
  const [localLang, setLocalLang] = useState(initialLang);
  const [isPdfOpen, setIsPdfOpen] = useState(false);

  const lang = workspace?.lang || localLang;
  const isEs = lang === 'es';

  const handleShareUrl = async () => {
    const shareUrl = `${window.location.origin}/import-partner${isEs ? '?lang=es' : ''}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(isEs ? 'Enlace de partner copiado al portapapeles' : 'Partner dossier URL copied to clipboard');
    } catch {
      toast.error(shareUrl);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '72px' }}>
      <PublicUnifiedHeader
        track="products"
        lang={lang}
        onLangChange={(next) => {
          setLocalLang(next);
          workspace?.setLang?.(next);
        }}
        brandHref="/"
        loginRedirect="/import-partner"
        breadcrumb={[
          { label: 'Atlas Health Services', href: '/' },
          { label: isEs ? 'Partner de Importación EAU' : 'UAE Import Partner' },
        ]}
      />

      <main className="atlas-page-shell" style={{ display: 'flex', flexDirection: 'column', gap: '18px', paddingTop: '18px' }}>
        <PageHeroCard
          badge={
            isEs
              ? 'Dossier Oficial para Proveedores y Fabricantes · EAU / GCC'
              : 'Official Supplier & Manufacturer Dossier · UAE / GCC'
          }
          title={
            isEs
              ? 'Atlas Health Services × Partner Habitual de Importación en EAU'
              : 'Atlas Health Services × Designated UAE Import & Warehouse Partner'
          }
          subtitle={
            isEs
              ? 'Presentación institucional de nuestra infraestructura clínica digital y nuestro almacén médico autorizado en Emiratos Árabes Unidos (Advanced Medical Equipment LLC) para operaciones de importación y distribución.'
              : 'Institutional verification of our digital B2B healthcare platform and our designated UAE licensed medical warehouse & import partner (Advanced Medical Equipment LLC) for medicine and medical device importation.'
          }
          actions={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button type="button" className="gcp-btn-secondary" onClick={() => setIsPdfOpen(true)}>
                <Download size={14} />
                <span>{isEs ? 'Dossier PDF' : 'Download PDF Dossier'}</span>
              </button>
              <button type="button" className="gcp-btn-primary" onClick={handleShareUrl}>
                <Share2 size={14} />
                <span>{isEs ? 'Compartir con Proveedor' : 'Share with Supplier'}</span>
              </button>
            </div>
          }
        />

        {/* ── 4 Executive KPI Cards ── */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '12px',
          }}
        >
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px' }}>
            <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              {isEs ? 'Licencia EDE / MOHAP' : 'EDE / MOHAP License'}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#003666', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>#{partner.edeLicense.licenseNumber}</span>
              <CopyableId value={partner.edeLicense.licenseNumber} />
            </div>
            <div style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 600, marginTop: '2px' }}>
              {isEs ? `Válida hasta ${partner.edeLicense.expiryDateDisplay}` : `Valid through ${partner.edeLicense.expiryDateDisplay}`}
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px' }}>
            <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              {isEs ? 'Licencia Comercial RAK DED' : 'RAK DED Commercial License'}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>#{partner.commercialLicense.licenseNumber}</span>
              <CopyableId value={partner.commercialLicense.licenseNumber} />
            </div>
            <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '2px' }}>
              {isEs ? `Activa · Expira ${partner.commercialLicense.expiryDate}` : `Active · Expiry ${partner.commercialLicense.expiryDate}`}
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px' }}>
            <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              {isEs ? 'Clasificación Regulatoria' : 'Regulatory Classification'}
            </div>
            <div style={{ fontSize: '1.10rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
              {partner.edeLicense.classification}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '2px' }}>
              Ref #{partner.edeLicense.establishmentRefNo} · Private
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px' }}>
            <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              {isEs ? 'Verificación Oficial MOHAP' : 'Official MOHAP Verification'}
            </div>
            <div style={{ marginTop: '6px' }}>
              <a
                href={partner.edeLicense.verificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="gcp-btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', textDecoration: 'none' }}
              >
                <ShieldCheck size={14} color="#0d9488" />
                <span>Doc #{partner.edeLicense.documentNumber}</span>
                <ExternalLink size={12} />
              </a>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
              smartservice.mohap.gov.ae
            </div>
          </div>
        </section>

        {/* ── Designated UAE Import Partner Details ── */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '16px',
          }}
        >
          {/* Legal & Commercial License Card */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={18} color="#003666" />
                <h2 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: '#0f172a' }}>
                  {partner.name}
                </h2>
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 9px', borderRadius: '999px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}>
                {isEs ? 'PROVEEDOR / IMPORTADOR HABITUAL' : 'DESIGNATED IMPORT PARTNER'}
              </span>
            </div>

            <div style={{ fontSize: '0.84rem', color: '#475569', fontWeight: 600 }}>
              {partner.arabicName} · {partner.legalForm}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.78rem', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div><strong>Local Registry No:</strong> <CopyableId value={partner.commercialLicense.localRegistryNo} /></div>
              <div><strong>COC Membership:</strong> <CopyableId value={partner.commercialLicense.cocMembershipNo} /></div>
              <div><strong>CBLS No:</strong> <CopyableId value={partner.commercialLicense.cblsNo} /></div>
              <div><strong>Est. Date:</strong> {partner.commercialLicense.estDate}</div>
              <div><strong>Renewal Date:</strong> {partner.commercialLicense.renewalDate}</div>
              <div><strong>Expiry Date:</strong> {partner.commercialLicense.expiryDate}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.80rem', color: '#334155' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <MapPin size={15} color="#003666" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{partner.address.fullAddress}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={15} color="#003666" style={{ flexShrink: 0 }} />
                <span>{partner.phone}</span>
              </div>
            </div>
          </div>

          {/* EDE / MOHAP Warehouse & Regulatory GDP Statement */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Warehouse size={18} color="#0d9488" />
              <h2 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'Licencia Sanitaria EDE / MOHAP & Actividades' : 'EDE / MOHAP Medical Warehouse & Scope'}
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.78rem', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div><strong>EDE License #:</strong> <CopyableId value={partner.edeLicense.licenseNumber} /></div>
              <div><strong>Establishment Ref #:</strong> <CopyableId value={partner.edeLicense.establishmentRefNo} /></div>
              <div><strong>Issue Date:</strong> {partner.edeLicense.issueDateDisplay}</div>
              <div><strong>Expiry Date:</strong> {partner.edeLicense.expiryDateDisplay}</div>
              <div style={{ gridColumn: '1 / -1' }}><strong>Authorized Scope:</strong> {partner.edeLicense.activity}</div>
              <div style={{ gridColumn: '1 / -1' }}>
                <strong>DED Activities:</strong>{' '}
                {partner.commercialLicense.activities.map((a) => `${a.name} (${a.code})`).join(' · ')}
              </div>
            </div>

            {/* Verbatim GDP Note requested by user */}
            <div
              style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '8px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
              }}
            >
              <FileCheck2 size={18} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.80rem', color: '#78350f', lineHeight: 1.45 }}>
                <div style={{ fontWeight: 800, marginBottom: '2px' }}>
                  {isEs ? 'Declaración Regulatoria GDP (MOH / EDE)' : 'Regulatory GDP Statement (MOH / EDE)'}
                </div>
                <div>“{partner.regulatoryNotes.gdpCertificationStatus}”</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Ownership & Responsible Directors ── */}
        <section style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Users size={18} color="#003666" />
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              {isEs ? 'Socios y Directores Responsables (Registro Comercial RAK DED)' : 'Partners & Responsible Directors (RAK DED Registry)'}
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
            {partner.partners.map((p) => (
              <div key={p.no} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px', background: '#f8fafc' }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>{p.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '4px' }}>
                  {p.nationality} · No. {p.no}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.74rem' }}>
                  <span style={{ fontWeight: 700, color: '#003666' }}>{p.roles.join(' & ')}</span>
                  <span style={{ fontWeight: 800, color: '#0f172a' }}>{p.sharePercent.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Why Partner with Atlas Health Services (Platform Showcase) ── */}
        <section style={{ background: 'linear-gradient(135deg, #002b54 0%, #003d75 100%)', color: '#fff', borderRadius: '14px', padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#7dd3fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={13} />
                <span>{isEs ? 'INFRAESTRUCTURA DIGITAL ATLAS HEALTH' : 'ATLAS HEALTH DIGITAL INFRASTRUCTURE'}</span>
              </div>
              <h2 style={{ margin: '4px 0 0', fontSize: '1.18rem', fontWeight: 800 }}>
                {isEs ? 'Plataforma B2B de Medicina de Longevidad y Suministro Clínico' : 'Enterprise Clinical Longevity & B2B Supply Platform'}
              </h2>
            </div>
            <Link
              href="/pricing/pellets"
              style={{
                background: '#fff',
                color: '#003666',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.80rem',
                fontWeight: 750,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Globe size={14} />
              <span>{isEs ? 'Explorar Catálogos B2B' : 'Explore Live B2B Catalogs'}</span>
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {ATLAS_PLATFORM_MODULES.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  borderRadius: '10px',
                  padding: '14px',
                  color: '#fff',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ fontSize: '0.86rem', fontWeight: 750, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{isEs ? m.titleEs : m.titleEn}</span>
                  <CheckCircle2 size={14} color="#5eead4" />
                </div>
                <div style={{ fontSize: '0.75rem', color: '#dbeafe', lineHeight: 1.45 }}>
                  {isEs ? m.descEs : m.descEn}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <PublicUnifiedFooter />

      <DocumentPreviewModal
        isOpen={isPdfOpen}
        onClose={() => setIsPdfOpen(false)}
        printable={false}
        getPdfBlob={() =>
          buildSchedulePdfBlob({
            title: 'ATLAS HEALTH SERVICES × UAE IMPORT PARTNER DOSSIER',
            subtitle: `${partner.name} · EDE #${partner.edeLicense.licenseNumber} · RAK DED #${partner.commercialLicense.licenseNumber}`,
            metaLine: `Emirate: Ras Al Khaimah, UAE | Valid EDE Expiry: ${partner.edeLicense.expiryDateDisplay} | Doc #${partner.edeLicense.documentNumber}`,
            documentRef: 'ATLAS-UAE-IMPORT-PARTNER-2026',
            currency: 'AED',
            tierLabel: 'Official Supplier Onboarding Dossier',
            isGuest: true,
            head: ['Credential / Field', 'Official Record'],
            body: [
              ['Legal Entity', `${partner.name} (${partner.arabicName})`],
              ['Legal Form', partner.legalForm],
              ['RAK DED Commercial License', `#${partner.commercialLicense.licenseNumber} (${partner.commercialLicense.status}) · Expiry ${partner.commercialLicense.expiryDate}`],
              ['Registry & Chamber IDs', `Local Reg: ${partner.commercialLicense.localRegistryNo} · CBLS: ${partner.commercialLicense.cblsNo} · COC: ${partner.commercialLicense.cocMembershipNo}`],
              ['EDE / MOHAP Warehouse License', `#${partner.edeLicense.licenseNumber} · Ref #${partner.edeLicense.establishmentRefNo} · Classification: ${partner.edeLicense.classification}`],
              ['EDE Issue / Expiry / Verify Doc', `${partner.edeLicense.issueDateDisplay} – ${partner.edeLicense.expiryDateDisplay} · MOHAP Doc #${partner.edeLicense.documentNumber}`],
              ['Authorized Scope', partner.edeLicense.activity],
              ['Facility Address & Contact', `${partner.address.fullAddress} · Tel: ${partner.phone}`],
              ['Partners & Directors', partner.partners.map((p) => `${p.name} (${p.nationality}, ${p.sharePercent}%, ${p.roles.join('/')})`).join(' | ')],
              ['GDP Regulatory Statement', partner.regulatoryNotes.gdpCertificationStatus],
            ],
          })
        }
        downloadName="Atlas_Health_UAE_Import_Partner_Dossier.pdf"
        title={isEs ? 'Dossier Partner de Importación EAU — PDF Oficial' : 'UAE Import Partner Dossier — Official PDF'}
        subtitle={`${partner.name} · EDE #${partner.edeLicense.licenseNumber}`}
      />
    </div>
  );
}
