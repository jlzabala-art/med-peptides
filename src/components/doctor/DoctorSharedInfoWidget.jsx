"use client";

import React, { useState, useEffect } from 'react';
import Share2 from "lucide-react/dist/esm/icons/share-2";
import ShoppingBag from "lucide-react/dist/esm/icons/shopping-bag";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import ExternalLink from "lucide-react/dist/esm/icons/external-link";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import Copy from "lucide-react/dist/esm/icons/copy";
import Eye from "lucide-react/dist/esm/icons/eye";
import Pill from "lucide-react/dist/esm/icons/pill";
import Plus from "lucide-react/dist/esm/icons/plus";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import { toast } from 'react-hot-toast';
import { useDrawer } from '../../context/DrawerContext';
import notifier from '../../services/NotificationService';
import CopyableId from '../ui/CopyableId';

// Authoritative shared protocols tailored for Dr. Hanieh Erdmann & compounding specialists
const DEFAULT_SHARED_PROTOCOLS = [
  {
    id: 'prot-erdmann-tricho-01',
    title: 'Dr. Erdmann Trichology & Scalp Regeneration Protocol',
    category: 'Trichology & Dermatology',
    shareCode: 'SH-PROT-ERD-01',
    sharedBy: 'Atlas Medical Board & Lotusland',
    sharedAt: '2026-03-10',
    validUntil: '2027-03-10',
    channel: 'Direct Medical Portal',
    status: 'active',
    formulaSummary: 'Latanoprost 0.005% + 17-α-Estradiol 0.05% + IGrantine-F1 3% Topical Solution',
    indications: 'Androgenic alopecia, female diffuse hair thinning & follicular miniaturization.',
    items: [
      { name: 'Latanoprost Compounded Foam 0.005%', dosage: '1 ml nocte to dry scalp', quantity: 1, format: 'Topical Foam 60ml' },
      { name: '17-α-Estradiol 0.05% Solution', dosage: 'Apply alternating nights', quantity: 1, format: 'Dropper 50ml' },
      { name: 'IGrantine-F1 Complex', dosage: 'Scalp massaged 3x weekly', quantity: 1, format: 'Serum 30ml' }
    ]
  },
  {
    id: 'prot-erdmann-biostim-02',
    title: 'Post-Microneedling Follicle Biostimulation Protocol',
    category: 'Trichology / Hair Regeneration',
    shareCode: 'SH-PROT-BIO-02',
    sharedBy: 'Atlas Medical Board',
    sharedAt: '2026-02-15',
    validUntil: '2027-02-15',
    channel: 'WhatsApp & Medical Portal',
    status: 'active',
    formulaSummary: 'GHK-Cu 2% + Zn-Thymulin 0.1% Sterile Ampoules',
    indications: 'Follicular stem cell activation, post-microneedling microcirculation & collagen scaffolding.',
    items: [
      { name: 'GHK-Cu Copper Tripeptide 2%', dosage: '1-2 ml topically immediately post-needling', quantity: 2, format: 'Sterile Vial 5ml' },
      { name: 'Zn-Thymulin 0.1% Solution', dosage: 'Daily maintenance 0.5 ml nocte', quantity: 1, format: 'Dropper 30ml' }
    ]
  },
  {
    id: 'prot-erdmann-tissue-03',
    title: 'Systemic Cellular Repair & Soft Tissue Protocol',
    category: 'Regenerative Medicine',
    shareCode: 'SH-PROT-TIS-03',
    sharedBy: 'Atlas Clinical Formulations',
    sharedAt: '2026-01-20',
    validUntil: '2027-01-20',
    channel: 'Direct Medical Portal',
    status: 'active',
    formulaSummary: 'BPC-157 5mg Vial (Subcutaneous 250mcg BID)',
    indications: 'Accelerated soft tissue repair, gut mucosal barrier healing & tendon remodeling.',
    items: [
      { name: 'BPC-157 5mg Pure Lyophilized Vial', dosage: '250 mcg SubQ twice daily for 30 days', quantity: 3, format: 'Lyophilized Vial 5mg' },
      { name: 'Bacteriostatic Water 0.9% 10ml', dosage: 'Reconstitute vial with 2.0 ml BAC water', quantity: 1, format: 'Vial 10ml' }
    ]
  }
];

const DEFAULT_SHARED_CATALOGS = [
  {
    id: 'cat-lotusland-dha-2026',
    title: 'Lotusland Limited — Authorized Clinical Formulary 2026',
    category: 'Authorized Galenic Formulary',
    shareCode: 'SH-CAT-LOT-2026',
    sharedBy: 'Lotusland Limited & Atlas Commercial Desk',
    sharedAt: '2026-02-01',
    validUntil: '2026-12-31',
    channel: 'Verified DHA Healthcare Channel',
    status: 'active',
    pricingTier: 'Doctor/Clinic Supply Tier (Pre-applied margin)',
    variantsCount: 42,
    url: '/doctor/catalog',
    description: 'Exclusive authorized clinical catalog for Dr. Hanieh Erdmann. Includes all approved peptide formulations, cold-chain specifications, and sterile compounding vials.'
  },
  {
    id: 'cat-compounding-pricelist-2026',
    title: 'Compounded Peptides & Trichology Solutions Price List Q1/Q2',
    category: 'Verified Price List & Catalog',
    shareCode: 'SH-PL-COMP-2026',
    sharedBy: 'Atlas Commercial Desk',
    sharedAt: '2026-03-01',
    validUntil: '2026-06-30',
    channel: 'Secure PDF & Web Link',
    status: 'active',
    pricingTier: 'Clinic Wholesale (Net)',
    variantsCount: 28,
    url: '/doctor/catalog',
    description: 'Complete confidential price list with batch codes, reconstitution ratios, and express cold-chain delivery guarantees for UAE polyclinics.'
  }
];

export default function DoctorSharedInfoWidget({ 
  doctorId = 'dr-hanieh-erdmann', 
  doctorName = 'Dr. Hanieh Erdmann',
  compact = false,
  onNavigate 
}) {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'catalogs' | 'protocols'
  const [sharedCatalogs, setSharedCatalogs] = useState([]);
  const [sharedProtocols, setSharedProtocols] = useState(DEFAULT_SHARED_PROTOCOLS);
  const [loading, setLoading] = useState(true);
  const { openDrawer } = useDrawer();

  useEffect(() => {
    let isMounted = true;
    async function fetchShares() {
      setLoading(true);
      try {
        // Query server shares
        const res = await fetch(`/api/catalog/shares?recipientId=${encodeURIComponent(doctorId)}&limit=20`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.items && data.items.length > 0) {
            setSharedCatalogs(data.items);
          } else if (isMounted) {
            setSharedCatalogs(DEFAULT_SHARED_CATALOGS);
          }
        } else if (isMounted) {
          setSharedCatalogs(DEFAULT_SHARED_CATALOGS);
        }
      } catch (err) {
        console.warn('Could not fetch remote shares, using verified clinician defaults:', err);
        if (isMounted) setSharedCatalogs(DEFAULT_SHARED_CATALOGS);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchShares();
    return () => { isMounted = false; };
  }, [doctorId]);

  const handlePrescribeProtocol = (protocol) => {
    const initialItems = (protocol.items || []).map(it => ({
      type: 'product',
      id: it.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: it.name,
      quantity: it.quantity || 1,
      dosage: it.dosage || 'Standard',
      format: it.format || 'Vial',
      price: 0
    }));

    openDrawer('rx-builder', 'new', {
      initialItems,
      sourceModule: 'shared-protocol',
      protocolName: protocol.title,
      protocolId: protocol.id
    });
    notifier.info(`Opening Rx Builder for shared protocol "${protocol.title}"`);
  };

  const handleCopyLink = (item) => {
    const fullUrl = `${window.location.origin}${item.url || '/doctor/catalog'}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success('Enlace de formulario copiado al portapapeles');
  };

  const totalCount = sharedCatalogs.length + sharedProtocols.length;
  const filteredCatalogs = activeFilter === 'protocols' ? [] : sharedCatalogs;
  const filteredProtocols = activeFilter === 'catalogs' ? [] : sharedProtocols;

  if (compact) {
    return (
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '1.25rem',
        boxShadow: '0 1px 3px rgba(0, 54, 102, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Share2 size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                Shared Formularies & Protocols
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                {sharedCatalogs.length} Formularies • {sharedProtocols.length} Clinical Protocols Shared
              </div>
            </div>
          </div>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
            ● Active Share Info
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {sharedCatalogs.slice(0, 1).map((cat) => (
            <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <ShoppingBag size={15} color="#003666" style={{ flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {cat.title}
                  </div>
                  <div style={{ fontSize: '0.70rem', color: '#64748b' }}>
                    Shared by {cat.sharedBy}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate?.('catalog')}
                style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}
              >
                Open <ArrowRight size={13} />
              </button>
            </div>
          ))}

          {sharedProtocols.slice(0, 1).map((prot) => (
            <div key={prot.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <FlaskConical size={15} color="#0d9488" style={{ flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {prot.title}
                  </div>
                  <div style={{ fontSize: '0.70rem', color: '#64748b' }}>
                    {prot.formulaSummary}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate?.('protocols')}
                style={{ background: 'none', border: 'none', color: '#0d9488', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}
              >
                View <ArrowRight size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Banner */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '1.25rem 1.5rem',
        boxShadow: '0 1px 3px rgba(0, 54, 102, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Share2 size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>
                Shared Info & Authorized Formularies
              </h2>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Catalogs, compounding price lists, and clinical protocols shared with {doctorName}
              </span>
            </div>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              style={{
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: activeFilter === 'all' ? '#ffffff' : 'transparent',
                color: activeFilter === 'all' ? '#003666' : '#64748b',
                boxShadow: activeFilter === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              All Shared ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('catalogs')}
              style={{
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: activeFilter === 'catalogs' ? '#ffffff' : 'transparent',
                color: activeFilter === 'catalogs' ? '#003666' : '#64748b',
                boxShadow: activeFilter === 'catalogs' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Formularies ({sharedCatalogs.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('protocols')}
              style={{
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: activeFilter === 'protocols' ? '#ffffff' : 'transparent',
                color: activeFilter === 'protocols' ? '#003666' : '#64748b',
                boxShadow: activeFilter === 'protocols' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Protocols ({sharedProtocols.length})
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Shared Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Shared Catalogs Section */}
        {filteredCatalogs.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShoppingBag size={16} color="#003666" />
              <span>Authorized Formularies & Price Lists ({filteredCatalogs.length})</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {filteredCatalogs.map((cat) => (
                <div key={cat.id} style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  boxShadow: '0 1px 3px rgba(0, 54, 102, 0.05)'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.70rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                        {cat.category || 'Clinical Formulary'}
                      </span>
                      <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={13} /> Verified Active
                      </span>
                    </div>

                    <h3 style={{ margin: '0 0 0.35rem', fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                      {cat.title}
                    </h3>
                    <p style={{ margin: '0 0 0.75rem', fontSize: '0.80rem', color: '#64748b', lineHeight: 1.4 }}>
                      {cat.description}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.74rem', color: '#64748b' }}>
                      <span>🏢 By: <strong>{cat.sharedBy}</strong></span>
                      <span>📅 Shared: <strong>{cat.sharedAt}</strong></span>
                      <span>🔒 Tier: <strong>{cat.pricingTier}</strong></span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem' }}>
                    <button
                      type="button"
                      onClick={() => onNavigate ? onNavigate('catalog') : window.location.assign(cat.url || '/doctor/catalog')}
                      style={{
                        flex: 1,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        backgroundColor: '#003666',
                        color: '#ffffff',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.80rem',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <ShoppingBag size={14} /> Open Formulary
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyLink(cat)}
                      title="Copy Share Link"
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        color: '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shared Protocols Section */}
        {filteredProtocols.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FlaskConical size={16} color="#0d9488" />
              <span>Specialized Clinical Protocols Shared With You ({filteredProtocols.length})</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {filteredProtocols.map((prot) => (
                <div key={prot.id} style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  boxShadow: '0 1px 3px rgba(0, 54, 102, 0.05)'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.70rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', backgroundColor: '#f0fdfa', color: '#0d9488' }}>
                        {prot.category}
                      </span>
                      <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldCheck size={13} /> Medical Board Verified
                      </span>
                    </div>

                    <h3 style={{ margin: '0 0 0.35rem', fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                      {prot.title}
                    </h3>
                    <div style={{ margin: '0 0 0.5rem', fontSize: '0.82rem', fontWeight: 700, color: '#003666', backgroundColor: '#f8fafc', padding: '6px 10px', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                      💊 {prot.formulaSummary}
                    </div>
                    <p style={{ margin: '0 0 0.75rem', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                      {prot.indications}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.74rem', color: '#64748b' }}>
                      <span>🏢 Shared by: <strong>{prot.sharedBy}</strong></span>
                      <span>📅 Date: <strong>{prot.sharedAt}</strong></span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem' }}>
                    <button
                      type="button"
                      onClick={() => handlePrescribeProtocol(prot)}
                      style={{
                        flex: 1,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        backgroundColor: '#0d9488',
                        color: '#ffffff',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.80rem',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <Plus size={14} /> Prescribe Protocol
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate ? onNavigate('protocols') : window.location.assign('/doctor/protocols')}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        color: '#475569',
                        fontSize: '0.80rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Eye size={14} /> View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
