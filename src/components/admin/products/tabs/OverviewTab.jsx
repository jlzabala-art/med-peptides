import React from 'react';
import { Card, StatusChip, SearchableSelect, SupplierSelect } from '../../../ui';
import { Sparkles, Dna, Activity, FileText, Globe, ExternalLink, ShieldCheck } from '@/lib/icons';
import RelatedProtocols from './RelatedProtocols';

const categoriesList = [
  'Peptides',
  'Prefilled Peptide Pens',
  'Consumables',
  'Packaging & Devices',
  'Biomarker Test',
  'DNA Test',
  'Supplements',
  'Pharma',
  'Hormones & Endocrinology',
  'Recovery & Repair',
  'Longevity & Anti-Aging',
  'API Peptide',
  'Nutraceutical / Functional Ingredients',
  'Excipients & Vehicles'
];

export default function OverviewTab({ form = {}, setForm, triggerAiAction, onSupplierClick }) {
  const cost = Number(form.costPrice || form.cost || form.price_cost || 0);
  const retail = Number(form.guestVialPrice || form.pricePatient || form.price_retail || form.price || 0);
  const clinic = Number(form.proVialPrice || form.priceDoctor || form.price_clinic || 0);
  const distributor = Number(form.distributorPrice || form.priceWholesale || form.price_distributor || 0);

  const marginRetail = retail > 0 && cost > 0 ? ((retail - cost) / retail) * 100 : 0;
  const marginClinic = clinic > 0 && cost > 0 ? ((clinic - cost) / clinic) * 100 : 0;
  const marginDistributor = distributor > 0 && cost > 0 ? ((distributor - cost) / distributor) * 100 : 0;

  const availableStock = Math.max(0, Number(form.stock || 0) - Number(form.reservedStock || 0));

  const getMarginColor = (m) => (m >= 40 ? '#10b981' : m >= 20 ? '#f59e0b' : '#ef4444');

  const filledCount = [form.name, form.category, form.product_type, form.description, form.supplier, form.cost, form.pricePatient, form.stock, form.warehouse].filter(Boolean).length;
  const completionPercent = form.completionPercent || form.aiScore || Math.min(100, Math.round((filledCount / 9) * 100));

  const goalsList = Array.isArray(form.goals) ? form.goals : (form.goals ? [form.goals] : []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* General Info integrated into Overview */}
        <Card padding="md" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Product General Info</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Product Name</label>
              <input type="text" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#ffffff', color: '#0f172a' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Category</label>
              <SearchableSelect
                value={form.category || ''}
                onChange={val => setForm({...form, category: val})}
                options={categoriesList.map(cat => ({ value: cat, label: cat }))}
                placeholder="Select category..."
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Primary Supplier</label>
              <SupplierSelect
                value={form.supplierId || ''}
                displayValue={form.supplier || ''}
                onChange={(supplierId, supplierName) =>
                  setForm(prev => ({ ...prev, supplierId, supplier: supplierName }))
                }
                placeholder="Search supplier..."
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Product Type</label>
              <select value={form.product_type || ''} onChange={e => setForm({...form, product_type: e.target.value})} style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#ffffff', color: '#0f172a' }}>
                <option value="Peptide">Peptide</option>
                <option value="Supplement">Supplement</option>
                <option value="Diagnostic Kit">Diagnostic Kit</option>
                <option value="Service">Medical Service</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Description</label>
              <button
                onClick={() => triggerAiAction('description')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: '1px solid #8b5cf6',
                  backgroundColor: '#f3e8ff',
                  color: '#7c3aed',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Sparkles size={10} /> Auto-Generate
              </button>
            </div>
            <textarea rows={3} value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', resize: 'vertical', backgroundColor: '#ffffff', color: '#0f172a' }} />
          </div>
        </Card>

        {/* ── PEPTIDE SCIENTIFIC METADATA & CANONICAL DATA ────────────────── */}
        <Card padding="md" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Dna size={18} color="#0284c7" />
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Peptide Scientific Metadata & Canonical Data</h3>
            </div>
            {form.pubchemCid && (
              <a
                href={`https://pubchem.ncbi.nlm.nih.gov/compound/${form.pubchemCid}`}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '0.75rem', color: '#0284c7', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                PubChem CID: {form.pubchemCid} <ExternalLink size={12} />
              </a>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>CAS Registry Number</label>
              <input
                type="text"
                placeholder="e.g. 910463-68-2"
                value={form.casNumber || ''}
                onChange={e => setForm({...form, casNumber: e.target.value})}
                style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', backgroundColor: '#f8fafc', color: '#0f172a' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Molecular Weight (g/mol)</label>
              <input
                type="text"
                placeholder="e.g. 4731.33"
                value={form.molecularWeight || ''}
                onChange={e => setForm({...form, molecularWeight: e.target.value})}
                style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', backgroundColor: '#f8fafc', color: '#0f172a' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Molecular Formula</label>
              <input
                type="text"
                placeholder="e.g. C225H348N48O68"
                value={form.formula || ''}
                onChange={e => setForm({...form, formula: e.target.value})}
                style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', backgroundColor: '#f8fafc', color: '#0f172a' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Primary Therapeutic Goal</label>
              <input
                type="text"
                placeholder="e.g. Weight Loss / Obesity"
                value={form.primaryGoal || ''}
                onChange={e => setForm({...form, primaryGoal: e.target.value})}
                style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', backgroundColor: '#f8fafc', color: '#0f172a' }}
              />
            </div>
          </div>

          {/* Sequence & Mechanism */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Amino Acid Sequence</label>
              <textarea
                rows={2}
                placeholder="e.g. YXEGTFTSDYSIYLDKQAAXEFVNWLLAGGPSSGAPPPS-NH2"
                value={form.sequence || ''}
                onChange={e => setForm({...form, sequence: e.target.value})}
                style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8rem', fontFamily: 'monospace', backgroundColor: '#f8fafc', color: '#0f172a' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Mechanism of Action</label>
              <textarea
                rows={2}
                placeholder="Clinical mechanism & receptor affinity..."
                value={form.mechanismOfAction || ''}
                onChange={e => setForm({...form, mechanismOfAction: e.target.value})}
                style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', backgroundColor: '#f8fafc', color: '#0f172a' }}
              />
            </div>
          </div>

          {/* Goals Pills */}
          {goalsList.length > 0 && (
            <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Therapeutic Goals:</span>
              {goalsList.map((g, idx) => (
                <span key={idx} style={{ fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bae6fd' }}>
                  🎯 {g}
                </span>
              ))}
            </div>
          )}
        </Card>

        {/* 🧬 ASSOCIATED PROGRAMS & GENOMIC PRIORITIES ────────────────── */}
        {Array.isArray(form.programs) && form.programs.length > 0 && (
          <Card padding="md" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.1rem' }}>🧬</span>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                  Associated Genomic Programs & Test Priorities
                </h3>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '2px 8px', borderRadius: '4px' }}>
                {form.programs.length} {form.programs.length === 1 ? 'Program' : 'Programs'} Linked
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
              {form.programs.map((prog, idx) => {
                const pri = prog.priority || 'A';
                const priColor = pri === 'A' ? '#15803d' : pri === 'B' ? '#b45309' : '#0369a1';
                const priBg = pri === 'A' ? '#f0fdf4' : pri === 'B' ? '#fffbeb' : '#f0f9ff';
                const priBorder = pri === 'A' ? '#bbf7d0' : pri === 'B' ? '#fde68a' : '#bae6fd';
                
                return (
                  <div
                    key={prog.id || prog.slug || idx}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: priBg,
                      border: `1px solid ${priBorder}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>{prog.name || 'Genomic Program'}</strong>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          backgroundColor: priColor,
                          color: '#ffffff',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        Priority {pri}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#475569', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.25rem' }}>
                      <div>Route: <strong>{prog.metadata?.applicationRoute || prog.applicationRoute || 'Oral / Topical'}</strong></div>
                      {prog.metadata?.recommendedDosage && (
                        <div>Dosage: <strong>{prog.metadata.recommendedDosage}</strong></div>
                      )}
                      {prog.metadata?.supplier && (
                        <div>Supplier: <strong>{prog.metadata.supplier}</strong></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
        {(() => {
          const isApi = Boolean(
            form.availableTypes?.includes('raw_material') ||
            form.primaryType === 'raw_material' ||
            form.productType === 'raw_material' ||
            form.productType === 'api_raw_material' ||
            form.product_type === 'api_raw_material' ||
            form.category === 'raw_material' ||
            form.categoryId === 'raw_material' ||
            form.is_raw_material ||
            form.isApi ||
            form.compoundingRules ||
            (Array.isArray(form.programs) && form.programs.length > 0) ||
            (Array.isArray(form.tags) && form.tags.some(t => String(t).startsWith('fagron-genomics-') || t === 'Fagron Genomics'))
          );

          if (isApi) {
            return (
              <>
                <Card padding="md" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      🧪 Active Pharmaceutical Ingredient (API) Specifications
                    </h3>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: '#dcfce7', color: '#15803d', border: '1px solid #86efac' }}>
                      ACTIVE API / RAW MATERIAL
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#15803d', marginBottom: '3px' }}>CAS Registry Number</label>
                      <input
                        type="text"
                        placeholder="e.g. 137525-51-0"
                        value={form.cas || form.casNumber || form.scientificData?.casNumber || ''}
                        onChange={e => setForm({ ...form, cas: e.target.value, casNumber: e.target.value })}
                        style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #86efac', borderRadius: '6px', fontSize: '0.85rem', backgroundColor: '#ffffff', color: '#0f172a' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#15803d', marginBottom: '3px' }}>Molecular Formula</label>
                      <input
                        type="text"
                        placeholder="e.g. C40H52O4"
                        value={form.molecularFormula || form.scientificData?.molecularFormula || form.science?.molecularFormula || ''}
                        onChange={e => setForm({ ...form, molecularFormula: e.target.value })}
                        style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #86efac', borderRadius: '6px', fontSize: '0.85rem', backgroundColor: '#ffffff', color: '#0f172a' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#15803d', marginBottom: '3px' }}>PubChem CID / IUPAC</label>
                      <input
                        type="text"
                        placeholder="e.g. 5281224"
                        value={form.pubchemCid || form.scientificData?.pubchemCid || ''}
                        onChange={e => setForm({ ...form, pubchemCid: e.target.value })}
                        style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #86efac', borderRadius: '6px', fontSize: '0.85rem', backgroundColor: '#ffffff', color: '#0f172a' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#15803d', marginBottom: '3px' }}>HPLC Purity / Grade (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder=">= 99.0%"
                        value={form.purity || form.scientificData?.purity || 99.0}
                        onChange={e => setForm({ ...form, purity: parseFloat(e.target.value) || 99.0 })}
                        style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #86efac', borderRadius: '6px', fontSize: '0.85rem', backgroundColor: '#ffffff', color: '#0f172a' }}
                      />
                    </div>
                  </div>
                </Card>

                {/* Compounding & Master Formulation Rules Card */}
                {form.compoundingRules && (
                  <Card padding="md" style={{ backgroundColor: '#f0fdfa', borderColor: '#99f6e4', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f766e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        ⚗️ Master Compounding & Formulation Guidelines
                      </h3>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: '#ccfbf1', color: '#0f766e', border: '1px solid #5eead4' }}>
                        MAGISTRAL SPECS
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.82rem' }}>
                      <div>
                        <span style={{ color: '#0d9488', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Recommended Dosage / Range:</span>
                        <strong style={{ color: '#134e4a' }}>{form.compoundingRules.recommendedConcentration || form.compoundingRules.dosageRange || form.compoundingRules.recommendedDose || 'Per prescription formula'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#0d9488', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Compatible Vehicles / Bases:</span>
                        <strong style={{ color: '#134e4a' }}>{Array.isArray(form.compoundingRules.compatibleVehicles) ? form.compoundingRules.compatibleVehicles.join(', ') : (form.compoundingRules.vehicleRecommended || 'TrichoSol / SyrSpend SF')}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#0d9488', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Optimal pH Stability:</span>
                        <strong style={{ color: '#134e4a' }}>{form.compoundingRules.optimalPh || '4.5 - 6.5'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#0d9488', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Known Incompatibilities:</span>
                        <strong style={{ color: '#134e4a' }}>{Array.isArray(form.compoundingRules.incompatibilities) ? form.compoundingRules.incompatibilities.join(', ') : (form.compoundingRules.incompatibilities || 'None reported')}</strong>
                      </div>
                    </div>
                  </Card>
                )}
              </>
            );
          }

          return (
            <Card padding="md" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  💊 Commercial Presentation & Formulation Specs
                </h3>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: '#dbeafe', color: '#1d4ed8', border: '1px solid #93c5fd' }}>
                  FINISHED PRODUCT
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#1d4ed8', marginBottom: '3px' }}>Primary Device / Format</label>
                  <input
                    type="text"
                    placeholder="e.g. Multi-dose Pen / Sterile Vial"
                    value={form.format || form.presentation || 'Injectable Vial'}
                    onChange={e => setForm({ ...form, format: e.target.value })}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #93c5fd', borderRadius: '6px', fontSize: '0.85rem', backgroundColor: '#ffffff', color: '#0f172a' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#1d4ed8', marginBottom: '3px' }}>Cold Chain Storage</label>
                  <input
                    type="text"
                    placeholder="e.g. 2°C - 8°C Refrigerated"
                    value={form.storage || '2°C to 8°C (Refrigerated)'}
                    onChange={e => setForm({ ...form, storage: e.target.value })}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #93c5fd', borderRadius: '6px', fontSize: '0.85rem', backgroundColor: '#ffffff', color: '#0f172a' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#1d4ed8', marginBottom: '3px' }}>Administration Route</label>
                  <input
                    type="text"
                    placeholder="e.g. Subcutaneous (SC)"
                    value={form.route || 'Subcutaneous (SC)'}
                    onChange={e => setForm({ ...form, route: e.target.value })}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #93c5fd', borderRadius: '6px', fontSize: '0.85rem', backgroundColor: '#ffffff', color: '#0f172a' }}
                  />
                </div>
              </div>
            </Card>
          );
        })()}

        {/* Associated Clinical Programs & Genomic Tests Section */}
        {Array.isArray(form.programs) && form.programs.length > 0 && (
          <Card padding="md" style={{ backgroundColor: '#faf5ff', borderColor: '#e9d5ff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#6b21a8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🧬 Associated Clinical Programs & Genomic Panels
              </h3>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: '#f3e8ff', color: '#7e22ce', border: '1px solid #d8b4fe' }}>
                GENOMIC TARGET
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {form.programs.map((prog, pIdx) => {
                const pri = prog.priority || 'A';
                const priColor = pri === 'A' ? '#15803d' : pri === 'B' ? '#b45309' : '#0369a1';
                const priBg = pri === 'A' ? '#f0fdf4' : pri === 'B' ? '#fffbeb' : '#f0f9ff';
                const priBorder = pri === 'A' ? '#bbf7d0' : pri === 'B' ? '#fde68a' : '#bae6fd';

                return (
                  <div key={prog.id || pIdx} style={{
                    padding: '0.75rem',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e9d5ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong style={{ fontSize: '0.88rem', color: '#1e293b' }}>{prog.name || 'Genomic Panel'}</strong>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: '4px',
                          background: priBg,
                          color: priColor,
                          border: `1px solid ${priBorder}`
                        }}>
                          Priority {pri}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '3px' }}>
                        Supplier Partner: <strong style={{ color: '#475569' }}>{prog.metadata?.supplierName || 'Fagron Iberia'}</strong>
                        {prog.metadata?.dosage && <span> · Standard Dose: <strong>{prog.metadata.dosage}</strong></span>}
                        {prog.metadata?.route && <span> · Route: <strong>{prog.metadata.route}</strong></span>}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#9333ea', fontWeight: 600 }}>
                      Active Indication
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {/* Summary Card */}
          <Card padding="md" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Supplier & Origins</span>
            <div style={{ fontSize: '0.9rem', color: '#0f172a', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>Primary: <strong>
                {form.supplier ? (
                  <span onClick={() => onSupplierClick?.({ name: form.supplier, companyName: form.supplier })} style={{ cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dashed', textUnderlineOffset: '4px' }}>
                    {form.supplier}
                  </span>
                ) : 'N/A'}
              </strong></div>
              <div>Backup: <strong>
                {form.backupSupplier ? (
                  <span onClick={() => onSupplierClick?.({ name: form.backupSupplier, companyName: form.backupSupplier })} style={{ cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dashed', textUnderlineOffset: '4px' }}>
                    {form.backupSupplier}
                  </span>
                ) : 'N/A'}
              </strong></div>
              <div>Lead Time: <strong>{form.supplierLeadTime || 0} Days</strong></div>
              <div>Warehouse: <strong>{form.warehouse || 'N/A'}</strong></div>
            </div>
          </Card>

          {/* Pricing Summary Card */}
          <Card padding="md" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Cost & Margins</span>
            <div style={{ fontSize: '0.9rem', color: '#0f172a', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>Cost: <strong>${cost}</strong></div>
              <div>Retail (Margin): <strong style={{ color: getMarginColor(marginRetail) }}>${retail} ({marginRetail.toFixed(0)}%)</strong></div>
              <div>Clinic (Margin): <strong style={{ color: getMarginColor(marginClinic) }}>${clinic} ({marginClinic.toFixed(0)}%)</strong></div>
              <div>Distributor: <strong style={{ color: getMarginColor(marginDistributor) }}>${distributor} ({marginDistributor.toFixed(0)}%)</strong></div>
            </div>
          </Card>

          {/* Inventory Summary Card */}
          <Card padding="md" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Stock & Supply</span>
            <div style={{ fontSize: '0.9rem', color: '#0f172a', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>Current Stock: <strong>{form.stock || 0} units</strong></div>
              <div>Available: <strong style={{ color: '#10b981' }}>{availableStock} units</strong></div>
              <div>Reserved: <strong style={{ color: '#f59e0b' }}>{form.reservedStock || 0} units</strong></div>
              <div>Incoming: <strong style={{ color: '#0284c7' }}>{form.incomingStock || 0} units</strong></div>
            </div>
          </Card>
        </div>

        {/* Global Compliance Status & Zoho Sync Logs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          <Card padding="md" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h4 style={{ margin: '0 0 0.75rem 0', color: '#0f172a', fontWeight: 700 }}>Regional Compliance Summary</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', fontSize: '0.75rem', textAlign: 'center' }}>
              {[
                { name: 'UAE', status: form.reg_uae },
                { name: 'KSA', status: form.reg_ksa },
                { name: 'Qatar', status: form.reg_qatar },
                { name: 'EU', status: form.reg_eu }
              ].map(c => (
                <div key={c.name} style={{
                  padding: '6px 4px',
                  borderRadius: '4px',
                  backgroundColor: '#f8fafc',
                  border: `1px solid ${c.status === 'Approved' ? '#10b98133' : '#f59e0b33'}`
                }}>
                  <div style={{ fontWeight: 700, color: '#64748b', marginBottom: '2px' }}>{c.name}</div>
                  <StatusChip status={c.status} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
              <div>COA Compliance: <span style={{ color: form.docStatus_coa === 'Approved' ? '#10b981' : '#ef4444', fontWeight: 600 }}>{form.docStatus_coa || 'N/A'}</span></div>
              <div>MSDS: <span style={{ color: form.docStatus_msds === 'Approved' ? '#10b981' : '#f59e0b', fontWeight: 600 }}>{form.docStatus_msds || 'N/A'}</span></div>
              <div>AI Score: <span style={{ color: '#7c3aed', fontWeight: 700 }}>{completionPercent}/100</span></div>
            </div>
          </Card>

          {/* Zoho Status overview */}
          <Card padding="md" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={{ margin: 0, color: '#0f172a', fontWeight: 700 }}>Zoho Books Connected Status</h4>
              <StatusChip status={form.zohoSyncStatus === 'Synced' ? 'synced' : 'pending'} />
            </div>
            <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Zoho ID:</span>
                <strong>{form.zohoId || 'N/A'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Last Sync Log:</span>
                <strong>{form.zohoLastSync || 'Never'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Inventory Sync:</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>{form.zohoInventorySync || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Price Sync:</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>{form.zohoPriceSync || 'N/A'}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Related Protocols */}
        <RelatedProtocols productId={form.id || form.objectID} />
      </div>
    );
}
