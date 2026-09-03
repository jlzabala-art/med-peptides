'use client';
import React, { useState } from 'react';
import { GROUP_OPTIONS, SORT_OPTIONS, WATERMARK_OPTIONS, PRODUCT_TYPE_FILTER_OPTIONS } from '@/hooks/admin/useDocumentGeneratorState';
import { ChevronDown, ChevronRight, Layout, Globe, Shield, BookOpen } from 'lucide-react';

export default function PresentationOptionsSection({
  groupBy,
  setGroupBy,
  sortBy,
  setSortBy,
  pdfLanguage,
  setPdfLanguage,
  watermark,
  setWatermark,
  coverPage,
  setCoverPage,
  onlyInStock,
  setOnlyInStock,
  includeBibliography,
  setIncludeBibliography,
  supplierMasking,
  setSupplierMasking,
  showPricePerMg,
  setShowPricePerMg,
  showWarehouse,
  setShowWarehouse,
  productTypeFilter,
  setProductTypeFilter,
  managers,
  accountManagerId,
  selectAccountManager,
  accountManagerName,
  setAccountManagerName,
  accountManagerEmail,
  setAccountManagerEmail,
  wholesellers,
  clinics,
  doctors,
  clients,
  recipientType,
  setRecipientType,
  recipientId,
  selectRecipient,
  recipientName,
  setRecipientName,
  recipientEmail,
  setRecipientEmail,
  followUpNotes,
  setFollowUpNotes,
  isMobile,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const groupLabel = GROUP_OPTIONS.find(g => g.value === groupBy)?.label || 'By Category';
  const langLabel = pdfLanguage === 'es' ? 'Spanish' : 'English';
  const watermarkLabel = watermark === 'none' ? 'No watermark' : watermark.toUpperCase();

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: 12,
      marginBottom: '1.25rem',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    }}>
      {/* Clickable Accordion Header */}
      <div
        onClick={() => setIsOpen(prev => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '12px 14px' : '14px 18px',
          background: isOpen ? '#f8fafc' : '#ffffff',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🎨 Presentation & Document Layout</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: 2, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            <span>{groupLabel}</span>
            <span>·</span>
            <span>{langLabel}</span>
            {recipientName && (
              <>
                <span>·</span>
                <span style={{ color: '#003666', fontWeight: 600 }}>To: {recipientName}</span>
              </>
            )}
            {accountManagerName && (
              <>
                <span>·</span>
                <span style={{ color: '#0d9488', fontWeight: 600 }}>Mgr: {accountManagerName}</span>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#003666' }}>
            {isOpen ? 'Close options' : 'Customize layout'}
          </span>
          {isOpen ? <ChevronDown size={16} color="#64748b" /> : <ChevronRight size={16} color="#64748b" />}
        </div>
      </div>

      {/* Expanded Accordion Body */}
      {isOpen && (
        <div style={{
          padding: isMobile ? '14px' : '16px 18px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          background: '#ffffff',
        }}>
          {/* Row 0: Product Type Scope Filter — Hybrid Catalog Feature */}
          <div style={{ marginBottom: 4 }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
              📦 Product Type Scope
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {PRODUCT_TYPE_FILTER_OPTIONS.map(opt => {
                const isActive = (productTypeFilter || 'all') === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setProductTypeFilter && setProductTypeFilter(opt.value)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 20,
                      border: isActive ? '1.5px solid #003666' : '1.5px solid #e2e8f0',
                      background: isActive ? '#003666' : '#f8fafc',
                      color: isActive ? '#ffffff' : '#64748b',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 4 }}>
              Only variants matching the selected type will appear in the generated document.
            </div>
          </div>

          {/* Row 1: Group By & Sort By */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                Group Products By
              </label>
              <select
                value={groupBy}
                onChange={e => setGroupBy(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.84rem', background: '#fff' }}
              >
                {GROUP_OPTIONS.map(g => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                Sort Rows By
              </label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.84rem', background: '#fff' }}
              >
                {SORT_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: PDF Language & Watermark */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                PDF Output Language
              </label>
              <select
                value={pdfLanguage}
                onChange={e => setPdfLanguage(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.84rem', background: '#fff' }}
              >
                <option value="en">English (US/UK Standards)</option>
                <option value="es">Español (América Latina / España)</option>
              </select>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>
                Translates table headers, confidentiality & notes in the generated PDF.
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                Supplier Naming / Masking
              </label>
              <select
                value={supplierMasking}
                onChange={e => setSupplierMasking(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.84rem', background: '#fff' }}
              >
                <option value="real">Real Names (e.g. Lotusland, NP LABS)</option>
                <option value="anonymous">Anonymous (Supplier 1, Supplier 2...)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                Document Watermark
              </label>
              <select
                value={watermark}
                onChange={e => setWatermark(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.84rem', background: '#fff' }}
              >
                {WATERMARK_OPTIONS.map(w => (
                  <option key={w.value} value={w.value}>{w.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Additional layout checkboxes */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', paddingTop: 6, borderTop: '1px solid #f1f5f9' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#334155', cursor: 'pointer' }}>
              <input type="checkbox" checked={showPricePerMg} onChange={e => setShowPricePerMg(e.target.checked)} style={{ accentColor: '#003666' }} />
              <span>💰 Include Rate ($/mg) calculated column</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#334155', cursor: 'pointer' }}>
              <input type="checkbox" checked={showWarehouse} onChange={e => setShowWarehouse(e.target.checked)} style={{ accentColor: '#003666' }} />
              <span>📍 Show Warehouse / Dispatch origin location</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#334155', cursor: 'pointer' }}>
              <input type="checkbox" checked={coverPage} onChange={e => setCoverPage(e.target.checked)} style={{ accentColor: '#003666' }} />
              <span>Include formal ATLAS SOLUTIONS Cover Page</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#334155', cursor: 'pointer' }}>
              <input type="checkbox" checked={onlyInStock} onChange={e => setOnlyInStock(e.target.checked)} style={{ accentColor: '#003666' }} />
              <span>Filter: In-stock confirmed variants only</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#003666', fontWeight: 600, cursor: 'pointer' }}>
              <input type="checkbox" checked={includeBibliography} onChange={e => setIncludeBibliography(e.target.checked)} style={{ accentColor: '#003666' }} />
              <span>📚 Include PubMed Bibliography & Clinical Citations</span>
            </label>
          </div>

          {/* Account Manager Assignment for Orders & Inquiries */}
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#003666' }}>
                👤 Assigned Account Manager (Orders & Inquiries Contact)
              </label>
              {managers && managers.length > 0 && (
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  {managers.length} active staff profiles
                </span>
              )}
            </div>

            {/* Quick Profile Dropdown */}
            <div style={{ marginBottom: 10 }}>
              <select
                value={accountManagerId || 'desk'}
                onChange={e => selectAccountManager ? selectAccountManager(e.target.value) : null}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  background: '#f8fafc',
                  color: '#0f172a',
                }}
              >
                {managers && managers.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.email ? `(${m.email})` : ''} {m.role ? `· [${m.role.toUpperCase()}]` : ''}
                  </option>
                ))}
                <option value="custom">✍️ Custom Account Manager...</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: '#64748b', marginBottom: 3 }}>
                  Manager / Desk Display Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Carlos Mendez or Commercial Desk"
                  value={accountManagerName || ''}
                  onChange={e => setAccountManagerName(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.84rem', background: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: '#64748b', marginBottom: 3 }}>
                  Direct Orders Email
                </label>
                <input
                  type="email"
                  placeholder="e.g. orders@atlas-solutions.com"
                  value={accountManagerEmail || ''}
                  onChange={e => setAccountManagerEmail(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.84rem', background: '#fff' }}
                />
              </div>
            </div>
          </div>

          {/* Target Recipient & Commercial Tracking */}
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#003666', marginBottom: 6 }}>
              🎯 Target Recipient & CRM Tracking (Wholesaler / Clinic / Prospect)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', gap: 10, marginBottom: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: '#64748b', marginBottom: 3 }}>
                  Recipient Type
                </label>
                <select
                  value={recipientType || 'custom'}
                  onChange={e => setRecipientType ? setRecipientType(e.target.value) : null}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.84rem', background: '#fff' }}
                >
                  <option value="custom">Generic / Direct Prospect</option>
                  <option value="clinic">🏥 Clinic / Medical Center</option>
                  <option value="wholeseller">🏢 Wholesaler / Distributor</option>
                  <option value="doctor">👨‍⚕️ Doctor / Physician</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: '#64748b', marginBottom: 3 }}>
                  Select from Database
                </label>
                <select
                  value={recipientId || ''}
                  onChange={e => selectRecipient ? selectRecipient(e.target.value, recipientType) : null}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.84rem', background: '#fff' }}
                >
                  <option value="">-- Choose registered account or write below --</option>
                  {recipientType === 'clinic' && clinics && clinics.map(c => (
                    <option key={c.id} value={c.id}>🏥 {c.name} {c.country ? `(${c.country})` : ''}</option>
                  ))}
                  {recipientType === 'wholeseller' && wholesellers && wholesellers.map(w => (
                    <option key={w.id} value={w.id}>🏢 {w.name} {w.country ? `(${w.country})` : ''}</option>
                  ))}
                  {recipientType === 'doctor' && doctors && doctors.map(d => (
                    <option key={d.id} value={d.id}>👨‍⚕️ {d.name} ({d.email})</option>
                  ))}
                  {recipientType === 'custom' && clients && clients.map(cl => (
                    <option key={cl.id} value={cl.id}>{cl.name} ({cl.type})</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: '#64748b', marginBottom: 3 }}>
                  Recipient Organization / Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hortman Clinics or York Diagnostics"
                  value={recipientName || ''}
                  onChange={e => setRecipientName ? setRecipientName(e.target.value) : null}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.84rem', background: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: '#64748b', marginBottom: 3 }}>
                  Recipient Contact Email
                </label>
                <input
                  type="email"
                  placeholder="e.g. purchasing@client.com"
                  value={recipientEmail || ''}
                  onChange={e => setRecipientEmail ? setRecipientEmail(e.target.value) : null}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.84rem', background: '#fff' }}
                />
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              <label style={{ display: 'block', fontSize: '0.74rem', color: '#64748b', marginBottom: 3 }}>
                Internal CRM Follow-up Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Requested special 60mg vial bulk pricing for Q3..."
                value={followUpNotes || ''}
                onChange={e => setFollowUpNotes ? setFollowUpNotes(e.target.value) : null}
                style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.8rem', background: '#f8fafc' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
