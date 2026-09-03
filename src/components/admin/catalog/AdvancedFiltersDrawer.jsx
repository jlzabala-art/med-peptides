import React from 'react';
import RightWorkspacePanel from './RightWorkspacePanel';
import { X, SlidersHorizontal, ChevronDown } from '@/lib/icons';

const GOALS = [
  { id: 'weight_loss_glp1', label: 'Weight Loss / GLP-1' },
  { id: 'metabolic_health', label: 'Metabolic Health' },
  { id: 'anti_aging_longevity', label: 'Anti-Aging & Longevity' },
  { id: 'recovery_healing', label: 'Recovery & Healing' },
  { id: 'cognitive_mood', label: 'Cognitive & Mood' },
  { id: 'hormonal_optimization', label: 'Hormonal Optimization' },
  { id: 'fertility', label: 'Fertility' },
  { id: 'immune_support', label: 'Immune Support' },
  { id: 'skin_hair_aesthetics', label: 'Skin / Hair / Aesthetics' },
  { id: 'performance_muscle', label: 'Performance / Muscle' },
  { id: 'biomarkers', label: 'Biomarkers' },
  { id: 'genomics', label: 'Genomics' },
  { id: 'general_wellness', label: 'General Wellness' }
];

const CANONICAL_CATEGORIES = [
  { id: 'peptide', label: '🧬 Peptides' },
  { id: 'supplement', label: '🌿 Supplements' },
  { id: 'hormone', label: '⚡ Hormones' },
  { id: 'diagnostic_test', label: '🧪 Diagnostic Tests' },
  { id: 'raw_material', label: '⚖️ Bulk API Raw Materials' },
  { id: 'consumable', label: '💉 Consumables & Supplies' },
  { id: 'skincare', label: '✨ Skincare & Cosmeceuticals' },
  { id: 'bundle', label: '📦 Bundles & Kits' },
  { id: 'service', label: '📋 Clinical Services' },
  { id: 'equipment', label: '🔬 Lab Equipment' },
];

const PRODUCT_TYPES = [
  { id: 'multi_type', label: '🔄 Multi-Type / Hybrid (2+ Formats)' },
  { id: 'finished_product', label: '💊 Finished Products (Patient-Ready)' },
  { id: 'raw_material', label: '🧪 Bulk API Raw Materials' },
  { id: 'clinical_supplies', label: '💉 Clinical Supplies & Diluents' },
  { id: 'diagnostic', label: '🔬 Diagnostics & Testing Kits' },
  { id: 'service', label: '📋 Clinical Services' },
];

const COMMERCIAL_STATUSES = [
  { id: 'inStock', label: 'In Stock' },
  { id: 'outOfStock', label: 'Out of Stock' },
  { id: 'priceMissing', label: 'Price Missing' },
  { id: 'supplierMissing', label: 'Supplier Missing' },
  { id: 'singleSourceRisk', label: 'Single Source Risk' }
];

const REGULATORY_STATUSES = [
  { id: 'registered', label: 'Registered' },
  { id: 'coaAvailable', label: 'COA Available' },
  { id: 'missingCOA', label: 'Missing COA' },
  { id: 'regulatoryRisk', label: 'Regulatory Risk' },
  { id: 'researchUseOnly', label: 'Research Use Only' }
];

const GENOMIC_PROGRAMS = [
  { id: 'fagron-genomics-telotest', label: '🧬 Fagron Genomics | TeloTest' },
  { id: 'fagron-genomics-trichotest', label: '🧬 Fagron Genomics | TrichoTest' },
  { id: 'fagron-genomics-nutrigen', label: '🧬 Fagron Genomics | NutriGen' },
];

export default function AdvancedFiltersDrawer({ isOpen, onClose, advancedFilters, setAdvancedFilters, suppliers = [], filteredCount = 0, totalCount = 0 }) {
  if (!isOpen) return null;

  const countActiveFilters = () => {
    let count = 0;
    count += (advancedFilters?.goals || []).length;
    count += (advancedFilters?.productTypes || []).length;
    count += (advancedFilters?.suppliers || []).length;
    count += Object.values(advancedFilters?.commercialStatus || {}).filter(Boolean).length;
    count += Object.values(advancedFilters?.regulatoryStatus || {}).filter(Boolean).length;
    return count;
  };

  const activeCount = countActiveFilters();

  const handleClearAll = () => {
    setAdvancedFilters({
      goals: [],
      productTypes: [],
      suppliers: [],
      commercialStatus: {
        inStock: false,
        outOfStock: false,
        priceMissing: false,
        supplierMissing: false,
        singleSourceRisk: false
      },
      regulatoryStatus: {
        registered: false,
        coaAvailable: false,
        missingCOA: false,
        regulatoryRisk: false,
        researchUseOnly: false
      }
    });
  };

  const toggleArrayFilter = (category, id) => {
    setAdvancedFilters(prev => {
      const arr = prev[category] || [];
      const newArr = arr.includes(id) ? arr.filter(i => i !== id) : [...arr, id];
      return { ...prev, [category]: newArr };
    });
  };

  const toggleObjectFilter = (category, id) => {
    setAdvancedFilters(prev => {
      const obj = prev[category] || {};
      return {
        ...prev,
        [category]: { ...obj, [id]: !obj[id] }
      };
    });
  };

  // Safe defaults if advancedFilters is not yet initialized with new schema
  const safeGoals = advancedFilters?.goals || [];
  const safeTypes = advancedFilters?.productTypes || [];
  const safeSuppliers = advancedFilters?.suppliers || [];
  const safeComm = advancedFilters?.commercialStatus || {};
  const safeReg = advancedFilters?.regulatoryStatus || {};

  return (
    <RightWorkspacePanel
      isOpen={isOpen}
      onClose={onClose}
      title="Filters"
      badge={activeCount > 0 ? activeCount.toString() : null}
      icon={<SlidersHorizontal size={22} color="var(--text-main, #1e293b)" />}
      headerActions={
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={handleClearAll} style={{ 
            padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', 
            background: 'rgba(255,255,255,0.5)', color: '#111', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem'
          }}>Clear All</button>
          <button onClick={onClose} style={{ 
            padding: '0.4rem 0.8rem', borderRadius: '8px', border: 'none', 
            background: 'var(--color-primary, #2563eb)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem',
            boxShadow: '0 2px 8px rgba(37,99,235,0.2)'
          }}>
            Show {filteredCount} Results
          </button>
        </div>
      }
      footer={null}
    >
      <style>{`
        .glass-checkbox {
          appearance: none; width: 20px; height: 20px; border: 1.5px solid rgba(0,0,0,0.2); border-radius: 6px;
          background: rgba(255,255,255,0.6); cursor: pointer; position: relative; transition: all 0.2s ease;
        }
        .glass-checkbox:checked { background: #111; border-color: #111; }
        .glass-checkbox:checked::after {
          content: ''; position: absolute; left: 6px; top: 2px; width: 5px; height: 10px;
          border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg);
        }
        details > summary { list-style: none; }
        details > summary::-webkit-details-marker { display: none; }
        details[open] summary .accordion-icon { transform: rotate(180deg); }
        .accordion-icon { transition: transform 0.3s ease; }
      `}</style>
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Tags & Genomics Programs */}
        <div style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px', backdropFilter: 'blur(12px)', overflow: 'hidden' }}>
          <details style={{ width: '100%' }}>
            <summary style={{ padding: '1.25rem', fontWeight: 600, fontSize: '1rem', color: '#1e293b', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                🧬 Tags & Genomics Programs
                {(advancedFilters?.tags || []).length > 0 && <span style={{ background: '#2563eb', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>{(advancedFilters?.tags || []).length}</span>}
              </div>
              <ChevronDown size={20} className="accordion-icon" />
            </summary>
            <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {GENOMIC_PROGRAMS.map(prog => (
                <label key={prog.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', cursor: 'pointer', color: '#333' }}>
                  <input type="checkbox" className="glass-checkbox" checked={(advancedFilters?.tags || []).includes(prog.id)} onChange={() => toggleArrayFilter('tags', prog.id)} /> 
                  {prog.label}
                </label>
              ))}
            </div>
          </details>
        </div>

        {/* Goal / Use Case */}
        <div style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px', backdropFilter: 'blur(12px)', overflow: 'hidden' }}>
          <details style={{ width: '100%' }}>
            <summary style={{ padding: '1.25rem', fontWeight: 600, fontSize: '1rem', color: '#1e293b', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Goal / Use Case
                {safeGoals.length > 0 && <span style={{ background: '#2563eb', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>{safeGoals.length}</span>}
              </div>
              <ChevronDown size={20} className="accordion-icon" />
            </summary>
            <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {GOALS.map(goal => (
                <label key={goal.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', cursor: 'pointer', color: '#333' }}>
                  <input type="checkbox" className="glass-checkbox" checked={safeGoals.includes(goal.id)} onChange={() => toggleArrayFilter('goals', goal.id)} /> 
                  {goal.label}
                </label>
              ))}
            </div>
          </details>
        </div>

        {/* Canonical Category */}
        <div style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px', backdropFilter: 'blur(12px)', overflow: 'hidden' }}>
          <details style={{ width: '100%' }}>
            <summary style={{ padding: '1.25rem', fontWeight: 600, fontSize: '1rem', color: '#1e293b', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Category
                {(advancedFilters?.categories || []).length > 0 && <span style={{ background: '#2563eb', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>{(advancedFilters?.categories || []).length}</span>}
              </div>
              <ChevronDown size={20} className="accordion-icon" />
            </summary>
            <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {CANONICAL_CATEGORIES.map(cat => (
                <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', cursor: 'pointer', color: '#333' }}>
                  <input type="checkbox" className="glass-checkbox" checked={(advancedFilters?.categories || []).includes(cat.id)} onChange={() => toggleArrayFilter('categories', cat.id)} /> 
                  {cat.label}
                </label>
              ))}
            </div>
          </details>
        </div>

        {/* Product Type */}
        <div style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px', backdropFilter: 'blur(12px)', overflow: 'hidden' }}>
          <details style={{ width: '100%' }}>
            <summary style={{ padding: '1.25rem', fontWeight: 600, fontSize: '1rem', color: '#1e293b', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Product Type
                {safeTypes.length > 0 && <span style={{ background: '#2563eb', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>{safeTypes.length}</span>}
              </div>
              <ChevronDown size={20} className="accordion-icon" />
            </summary>
            <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {PRODUCT_TYPES.map(type => (
                <label key={type.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', cursor: 'pointer', color: '#333' }}>
                  <input type="checkbox" className="glass-checkbox" checked={safeTypes.includes(type.id)} onChange={() => toggleArrayFilter('productTypes', type.id)} /> 
                  {type.label}
                </label>
              ))}
            </div>
          </details>
        </div>

        {/* Suppliers */}
        {suppliers.length > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px', backdropFilter: 'blur(12px)', overflow: 'hidden' }}>
            <details style={{ width: '100%' }}>
              <summary style={{ padding: '1.25rem', fontWeight: 600, fontSize: '1rem', color: '#1e293b', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Suppliers
                  {safeSuppliers.length > 0 && <span style={{ background: '#2563eb', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>{safeSuppliers.length}</span>}
                </div>
                <ChevronDown size={20} className="accordion-icon" />
              </summary>
              <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {suppliers.map(supplier => {
                  // Support both legacy string format and new {id, label} object format
                  const supplierId    = supplier?.id    ?? supplier;
                  const supplierLabel = supplier?.label ?? supplier?.companyName ?? supplier?.name ?? supplier;
                  return (
                    <label key={supplierId} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', cursor: 'pointer', color: '#333' }}>
                      <input type="checkbox" className="glass-checkbox" checked={safeSuppliers.includes(supplierId)} onChange={() => toggleArrayFilter('suppliers', supplierId)} />
                      {supplierLabel}
                    </label>
                  );
                })}
              </div>
            </details>
          </div>
        )}

        {/* Commercial Status */}
        <div style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px', backdropFilter: 'blur(12px)', overflow: 'hidden' }}>
          <details style={{ width: '100%' }}>
            <summary style={{ padding: '1.25rem', fontWeight: 600, fontSize: '1rem', color: '#1e293b', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Commercial Status
                {Object.values(safeComm).filter(Boolean).length > 0 && <span style={{ background: '#2563eb', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>{Object.values(safeComm).filter(Boolean).length}</span>}
              </div>
              <ChevronDown size={20} className="accordion-icon" />
            </summary>
            <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {COMMERCIAL_STATUSES.map(status => (
                <label key={status.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', cursor: 'pointer', color: '#333' }}>
                  <input type="checkbox" className="glass-checkbox" checked={!!safeComm[status.id]} onChange={() => toggleObjectFilter('commercialStatus', status.id)} /> 
                  {status.label}
                </label>
              ))}
            </div>
          </details>
        </div>

        {/* Regulatory Status */}
        <div style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px', backdropFilter: 'blur(12px)', overflow: 'hidden' }}>
          <details style={{ width: '100%' }}>
            <summary style={{ padding: '1.25rem', fontWeight: 600, fontSize: '1rem', color: '#1e293b', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Regulatory Status
                {Object.values(safeReg).filter(Boolean).length > 0 && <span style={{ background: '#2563eb', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>{Object.values(safeReg).filter(Boolean).length}</span>}
              </div>
              <ChevronDown size={20} className="accordion-icon" />
            </summary>
            <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {REGULATORY_STATUSES.map(status => (
                <label key={status.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', cursor: 'pointer', color: '#333' }}>
                  <input type="checkbox" className="glass-checkbox" checked={!!safeReg[status.id]} onChange={() => toggleObjectFilter('regulatoryStatus', status.id)} /> 
                  {status.label}
                </label>
              ))}
            </div>
          </details>
        </div>

      </div>
    </RightWorkspacePanel>
  );
}