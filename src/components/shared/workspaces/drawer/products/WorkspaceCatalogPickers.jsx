import React from 'react';
import { FileText, Package, Layers, X, Trash2 } from 'lucide-react';
import QuickClinicalRegimens from '../QuickClinicalRegimens';

/**
 * WorkspaceCatalogPickers
 * Empty state triggers and inline search popovers for Protocols, Catalog Products, and Saved Kits.
 */
export default function WorkspaceCatalogPickers({
  itemsCount = 0,
  isDoctor = false,
  activePicker = null,
  setActivePicker,
  pickerSearch = '',
  setPickerSearch,
  onAddClinicalRegimen,
  protocols = [],
  onLoadProtocol,
  availableProducts = [],
  onAddProduct,
  savedKits = [],
  onLoadKit,
  onDeleteKit,
}) {
  const filteredProtocols = (Array.isArray(protocols) ? protocols : []).filter((p) => {
    if (!pickerSearch.trim()) return true;
    const q = pickerSearch.toLowerCase();
    return (
      (p.name || p.title || '').toLowerCase().includes(q) ||
      (p.primary_goal || p.category || '').toLowerCase().includes(q)
    );
  });

  const filteredProducts = (Array.isArray(availableProducts) ? availableProducts : []).filter((p) => {
    if (!pickerSearch.trim()) return true;
    const q = pickerSearch.toLowerCase();
    return (
      (p.canonicalName || p.name || '').toLowerCase().includes(q) ||
      (p.sku || p.category || '').toLowerCase().includes(q)
    );
  });

  return (
    <>
      {/* Empty State Action Cards when workspace has 0 items */}
      {itemsCount === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Doctor 1-Tap Clinical Regimens */}
          {isDoctor && (
            <QuickClinicalRegimens
              onApplyRegimen={onAddClinicalRegimen}
              isDoctor={isDoctor}
            />
          )}

          {/* Card 1: Load Clinical Protocol */}
          <div
            onClick={() => {
              setActivePicker(activePicker === 'protocols' ? null : 'protocols');
              setPickerSearch('');
            }}
            style={{
              backgroundColor: activePicker === 'protocols' ? '#e0f2fe' : '#ffffff',
              border: `1.5px solid ${activePicker === 'protocols' ? '#0284c7' : '#bfdbfe'}`,
              borderRadius: '12px',
              padding: '1.1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.05)',
              touchAction: 'manipulation',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#003666',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <FileText size={22} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#003666' }}>
                  Load Clinical Protocol
                </h4>
                <p style={{ margin: '3px 0 0', fontSize: '0.76rem', color: '#0284c7', fontWeight: 600 }}>
                  Import multi-compound treatment regimens
                </p>
              </div>
            </div>
            <button
              type="button"
              style={{
                border: 'none',
                backgroundColor: '#003666',
                color: '#ffffff',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              Select →
            </button>
          </div>

          {/* Card 2: Add from Master Catalog */}
          <div
            onClick={() => {
              setActivePicker(activePicker === 'products' ? null : 'products');
              setPickerSearch('');
            }}
            style={{
              backgroundColor: activePicker === 'products' ? '#dcfce7' : '#ffffff',
              border: `1.5px solid ${activePicker === 'products' ? '#16a34a' : '#bbf7d0'}`,
              borderRadius: '12px',
              padding: '1.1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              boxShadow: '0 2px 6px rgba(22, 163, 74, 0.05)',
              touchAction: 'manipulation',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#15803d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Package size={22} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#14532d' }}>
                  Add from Master Catalog
                </h4>
                <p style={{ margin: '3px 0 0', fontSize: '0.76rem', color: '#16a34a', fontWeight: 600 }}>
                  Search individual peptides, vials & dosages
                </p>
              </div>
            </div>
            <button
              type="button"
              style={{
                border: 'none',
                backgroundColor: '#15803d',
                color: '#ffffff',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              Browse →
            </button>
          </div>

          {/* Card 3: Saved Kits (if available) */}
          {(savedKits || []).length > 0 && (
            <div
              onClick={() => {
                setActivePicker(activePicker === 'kits' ? null : 'kits');
                setPickerSearch('');
              }}
              style={{
                backgroundColor: activePicker === 'kits' ? '#fdf4ff' : '#ffffff',
                border: `1.5px solid ${activePicker === 'kits' ? '#a855f7' : '#e9d5ff'}`,
                borderRadius: '12px',
                padding: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                touchAction: 'manipulation',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#faf5ff',
                    border: '1px solid #e9d5ff',
                    color: '#9333ea',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Layers size={20} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: '#581c87' }}>
                    Load Saved Kit Template ({savedKits.length})
                  </h4>
                  <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#9333ea', fontWeight: 600 }}>
                    Quick-load custom composite kits
                  </p>
                </div>
              </div>
              <button
                type="button"
                style={{
                  border: 'none',
                  backgroundColor: '#9333ea',
                  color: '#ffffff',
                  padding: '6px 12px',
                  borderRadius: '7px',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Kits →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Inline Picker Overlay for Protocols */}
      {activePicker === 'protocols' && (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid #0284c7',
            borderRadius: '10px',
            padding: '0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>Select Clinical Protocol</span>
            <button
              type="button"
              onClick={() => setActivePicker(null)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={16} />
            </button>
          </div>
          <input
            type="text"
            placeholder="Search protocols by name or goal..."
            value={pickerSearch}
            onChange={(e) => setPickerSearch(e.target.value)}
            style={{ padding: '7px 10px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '0.78rem', outline: 'none' }}
          />
          <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {filteredProtocols.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  if (onLoadProtocol) onLoadProtocol(p);
                  setActivePicker(null);
                }}
                style={{
                  padding: '8px 10px',
                  borderRadius: '7px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  touchAction: 'manipulation',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#003666' }}>{p.name || p.title}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    {p.primary_goal || 'Clinical Regimen'} • {p.duration_weeks || 8} wks
                  </div>
                </div>
                <span style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 700 }}>+ Select</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inline Picker Overlay for Master Catalog */}
      {activePicker === 'products' && (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid #16a34a',
            borderRadius: '10px',
            padding: '0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>Select Product from Catalog</span>
            <button
              type="button"
              onClick={() => setActivePicker(null)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={16} />
            </button>
          </div>
          <input
            type="text"
            placeholder="Search by peptide name, SKU, or category..."
            value={pickerSearch}
            onChange={(e) => setPickerSearch(e.target.value)}
            style={{ padding: '7px 10px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '0.78rem', outline: 'none' }}
          />
          <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {filteredProducts.slice(0, 30).map((prod) => (
              <div
                key={prod.id}
                onClick={() => {
                  if (onAddProduct) onAddProduct(prod);
                  setActivePicker(null);
                }}
                style={{
                  padding: '8px 10px',
                  borderRadius: '7px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  touchAction: 'manipulation',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#15803d' }}>
                    {prod.canonicalName || prod.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    {prod.dosage || prod.unit || 'Standard'} • {prod.category || 'Peptides'}
                  </div>
                </div>
                <span style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 700 }}>+ Add</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inline Picker Overlay for Saved Kits */}
      {activePicker === 'kits' && (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid #a855f7',
            borderRadius: '10px',
            padding: '0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>Select Reusable Kit</span>
            <button
              type="button"
              onClick={() => setActivePicker(null)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={16} />
            </button>
          </div>
          <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {(savedKits || []).map((kit) => (
              <div
                key={kit.id}
                style={{
                  padding: '8px 10px',
                  borderRadius: '7px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>{kit.name}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{(kit.items || []).length} items</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (onLoadKit) onLoadKit(kit.id);
                      setActivePicker(null);
                    }}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#9333ea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    + Load
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteKit && onDeleteKit(kit.id)}
                    style={{
                      padding: '5px 7px',
                      backgroundColor: '#fff5f5',
                      color: '#dc2626',
                      border: '1px solid #fca5a5',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
