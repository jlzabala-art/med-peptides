import X from "lucide-react/dist/esm/icons/x";
import Save from "lucide-react/dist/esm/icons/save";
import Share2 from "lucide-react/dist/esm/icons/share-2";
import Users from "lucide-react/dist/esm/icons/users";
import SlidersHorizontal from "lucide-react/dist/esm/icons/sliders-horizontal";





import RightWorkspacePanel from './RightWorkspacePanel';
import toast from 'react-hot-toast';

const CATEGORY_TREE = [
  {
    id: 'peptides',
    label: 'Peptides',
    children: [
      { id: 'api_peptides', label: 'API Peptides' },
      { id: 'finished_peptides', label: 'Finished Peptides' },
      { id: 'research_peptides', label: 'Research Peptides' }
    ]
  },
  {
    id: 'longevity',
    label: 'Longevity',
    children: [
      { id: 'anti_aging', label: 'Anti-Aging' },
      { id: 'biomarkers', label: 'Biomarkers' },
      { id: 'genomics', label: 'Genomics' }
    ]
  },
  { id: 'hormonal_optimization', label: 'Hormonal Optimization', children: [] },
  { id: 'metabolic_weight', label: 'Metabolic & Weight', children: [] },
  { id: 'cognitive_mood', label: 'Cognitive & Mood', children: [] },
  { id: 'immune_support', label: 'Immune Support', children: [] },
  { id: 'testing', label: 'Testing', children: [] },
  { id: 'raw_materials', label: 'Raw Materials', children: [] },
  { id: 'medical_devices', label: 'Medical Devices', children: [] },
  { id: 'services', label: 'Services', children: [] }
];

export default function AdvancedFiltersDrawer({ isOpen, onClose, activeWorkspace = 'products', advancedFilters, setAdvancedFilters, activeCategories = [], onCategoryChange }) {
  if (!isOpen) return null;

  const handleAction = (actionName) => {
    toast.success(`${actionName} action triggered`, { icon: '✨' });
  };

  const toggleCategory = (label) => {
    if (activeCategories.includes(label)) {
      onCategoryChange(activeCategories.filter(c => c !== label));
    } else {
      onCategoryChange([...activeCategories, label]);
    }
  };

  const updateFilter = (workspace, key, value, subKey = null) => {
    setAdvancedFilters(prev => {
      const newState = { ...prev };
      if (subKey) {
        newState[workspace] = {
          ...newState[workspace],
          [key]: {
            ...newState[workspace][key],
            [subKey]: value
          }
        };
      } else {
        newState[workspace] = {
          ...newState[workspace],
          [key]: value
        };
      }
      return newState;
    });
  };

  return (
    <RightWorkspacePanel
      isOpen={isOpen}
      onClose={onClose}
      title="Filters"
      badge="4"
      icon={<SlidersHorizontal size={22} color="var(--text-main, #1e293b)" />}
      headerActions={null}
      footer={
        <>
          <button onClick={onClose} style={{ 
            flex: 1, 
            padding: '0.875rem', 
            borderRadius: '12px', 
            border: '1px solid rgba(0,0,0,0.1)', 
            background: 'rgba(255,255,255,0.5)',
            color: '#111',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.5)'}
          >Clear All</button>
          <button onClick={onClose} style={{ 
            flex: 2, 
            padding: '0.875rem', 
            borderRadius: '12px', 
            border: 'none', 
            background: '#111',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
            transition: 'all 0.2s'
          }}
          onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.25)' }}
          onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.2)' }}
          >Show Results</button>
        </>
      }
    >
      <style>{`
        .glass-btn {
          background: rgba(255,255,255,0.7);
          border: 1px solid rgba(0,0,0,0.06);
          color: #333;
          border-radius: 10px;
          padding: 8px 12px;
          font-weight: 500;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
        }
        .glass-btn:hover {
          background: rgba(255,255,255,0.95);
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
          transform: translateY(-1px);
        }

        .glass-checkbox {
          appearance: none;
          width: 20px;
          height: 20px;
          border: 1.5px solid rgba(0,0,0,0.2);
          border-radius: 6px;
          background: rgba(255,255,255,0.6);
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
        }
        .glass-checkbox:checked {
          background: #111;
          border-color: #111;
        }
        .glass-checkbox:checked::after {
          content: '';
          position: absolute;
          left: 6px;
          top: 2px;
          width: 5px;
          height: 10px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
        .glass-range {
          -webkit-appearance: none;
          width: 100%;
          height: 6px;
          background: rgba(0,0,0,0.08);
          border-radius: 6px;
          outline: none;
        }
        .glass-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #111;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          transition: transform 0.1s;
        }
        .glass-range::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        .glass-select {
          width: 100%;
          padding: 0.875rem 1rem;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.1);
          outline: none;
          background: rgba(255,255,255,0.7);
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
          font-size: 0.95rem;
          color: #333;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23333333%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem top 50%;
          background-size: 0.65rem auto;
        }
      `}</style>
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2.25rem' }}>

        {activeWorkspace === 'products' && (
          <>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.85rem', fontSize: '0.95rem', color: '#1a1a1a' }}>Categories</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', padding: '0.85rem', background: 'rgba(255,255,255,0.7)' }}>
                {CATEGORY_TREE.map(node => (
                  <div key={node.id}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', cursor: 'pointer', color: '#333', marginBottom: '0.5rem' }}>
                      <input 
                        type="checkbox" 
                        className="glass-checkbox" 
                        checked={activeCategories.includes(node.label)} 
                        onChange={() => toggleCategory(node.label)} 
                      /> 
                      {node.label}
                    </label>
                    {node.children && node.children.length > 0 && (
                      <div style={{ paddingLeft: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        {node.children.map(child => (
                          <label key={child.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', cursor: 'pointer', color: '#555' }}>
                            <input 
                              type="checkbox" 
                              className="glass-checkbox" 
                              checked={activeCategories.includes(child.label)} 
                              onChange={() => toggleCategory(child.label)} 
                            /> 
                            {child.label}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.85rem', fontSize: '0.95rem', color: '#1a1a1a' }}>Supplier</label>
              <select className="glass-select" value={advancedFilters.products.supplier} onChange={(e) => updateFilter('products', 'supplier', e.target.value)}>
                <option>All Suppliers</option>
                <option>Atlas Bio Labs</option>
                <option>Medipharm</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.85rem', fontSize: '0.95rem', color: '#1a1a1a' }}>Health Score Range (Min)</label>
              <input type="range" className="glass-range" min="0" max="100" value={advancedFilters.products.minHealth} onChange={(e) => updateFilter('products', 'minHealth', parseInt(e.target.value))} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#666', marginTop: '0.75rem', fontWeight: 500 }}>
                <span>0</span>
                <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{advancedFilters.products.minHealth}</span>
                <span>100</span>
              </div>
            </div>
          </>
        )}

        {activeWorkspace === 'inventory' && (
          <>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.85rem', fontSize: '0.95rem', color: '#1a1a1a' }}>Stock Status</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', cursor: 'pointer', color: '#333' }}>
                  <input type="checkbox" className="glass-checkbox" checked={advancedFilters.inventory.stockStatus.inStock} onChange={(e) => updateFilter('inventory', 'stockStatus', e.target.checked, 'inStock')} /> In Stock
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', cursor: 'pointer', color: '#333' }}>
                  <input type="checkbox" className="glass-checkbox" checked={advancedFilters.inventory.stockStatus.lowStock} onChange={(e) => updateFilter('inventory', 'stockStatus', e.target.checked, 'lowStock')} /> Low Stock
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', cursor: 'pointer', color: '#333' }}>
                  <input type="checkbox" className="glass-checkbox" checked={advancedFilters.inventory.stockStatus.outOfStock} onChange={(e) => updateFilter('inventory', 'stockStatus', e.target.checked, 'outOfStock')} /> Out of Stock
                </label>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.85rem', fontSize: '0.95rem', color: '#1a1a1a' }}>Reorder Level (Max)</label>
              <input type="range" className="glass-range" min="0" max="500" value={advancedFilters.inventory.maxReorder} onChange={(e) => updateFilter('inventory', 'maxReorder', parseInt(e.target.value))} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#666', marginTop: '0.75rem', fontWeight: 500 }}>
                <span>0</span>
                <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{advancedFilters.inventory.maxReorder}</span>
                <span>500</span>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.85rem', fontSize: '0.95rem', color: '#1a1a1a' }}>Performance</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', cursor: 'pointer', color: '#333' }}>
                  <input type="checkbox" className="glass-checkbox" checked={advancedFilters.inventory.performance.fastMovers} onChange={(e) => updateFilter('inventory', 'performance', e.target.checked, 'fastMovers')} /> Fast Movers
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', cursor: 'pointer', color: '#333' }}>
                  <input type="checkbox" className="glass-checkbox" checked={advancedFilters.inventory.performance.deadStock} onChange={(e) => updateFilter('inventory', 'performance', e.target.checked, 'deadStock')} /> Dead Stock
                </label>
              </div>
            </div>
          </>
        )}

        {activeWorkspace === 'suppliers' && (
          <>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.85rem', fontSize: '0.95rem', color: '#1a1a1a' }}>Supplier</label>
              <select className="glass-select" value={advancedFilters.suppliers.supplier} onChange={(e) => updateFilter('suppliers', 'supplier', e.target.value)}>
                <option>All Suppliers</option>
                <option>Atlas Bio Labs</option>
                <option>Medipharm</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.85rem', fontSize: '0.95rem', color: '#1a1a1a' }}>Country</label>
              <select className="glass-select" value={advancedFilters.suppliers.country} onChange={(e) => updateFilter('suppliers', 'country', e.target.value)}>
                <option>All Countries</option>
                <option>USA</option>
                <option>China</option>
                <option>India</option>
                <option>Europe</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.85rem', fontSize: '0.95rem', color: '#1a1a1a' }}>Performance Score (Min)</label>
              <input type="range" className="glass-range" min="0" max="100" value={advancedFilters.suppliers.minPerformance} onChange={(e) => updateFilter('suppliers', 'minPerformance', parseInt(e.target.value))} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#666', marginTop: '0.75rem', fontWeight: 500 }}>
                <span>0</span>
                <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{advancedFilters.suppliers.minPerformance}</span>
                <span>100</span>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.85rem', fontSize: '0.95rem', color: '#1a1a1a' }}>Risk Score (Max)</label>
              <input type="range" className="glass-range" min="0" max="100" value={advancedFilters.suppliers.maxRisk} onChange={(e) => updateFilter('suppliers', 'maxRisk', parseInt(e.target.value))} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#666', marginTop: '0.75rem', fontWeight: 500 }}>
                <span>0</span>
                <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{advancedFilters.suppliers.maxRisk}</span>
                <span>100</span>
              </div>
            </div>
          </>
        )}

        {activeWorkspace === 'regulatory' && (
          <>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.85rem', fontSize: '0.95rem', color: '#1a1a1a' }}>Registration Status</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', cursor: 'pointer', color: '#333' }}>
                  <input type="checkbox" className="glass-checkbox" checked={advancedFilters.regulatory.status.registered} onChange={(e) => updateFilter('regulatory', 'status', e.target.checked, 'registered')} /> Registered
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', cursor: 'pointer', color: '#333' }}>
                  <input type="checkbox" className="glass-checkbox" checked={advancedFilters.regulatory.status.pending} onChange={(e) => updateFilter('regulatory', 'status', e.target.checked, 'pending')} /> Pending Registration
                </label>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.85rem', fontSize: '0.95rem', color: '#1a1a1a' }}>Document Issues</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', cursor: 'pointer', color: '#333' }}>
                  <input type="checkbox" className="glass-checkbox" checked={advancedFilters.regulatory.documents.missingCOA} onChange={(e) => updateFilter('regulatory', 'documents', e.target.checked, 'missingCOA')} /> Missing COA
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', cursor: 'pointer', color: '#333' }}>
                  <input type="checkbox" className="glass-checkbox" checked={advancedFilters.regulatory.documents.missingSDS} onChange={(e) => updateFilter('regulatory', 'documents', e.target.checked, 'missingSDS')} /> Missing SDS
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', cursor: 'pointer', color: '#333' }}>
                  <input type="checkbox" className="glass-checkbox" checked={advancedFilters.regulatory.documents.missingDocs} onChange={(e) => updateFilter('regulatory', 'documents', e.target.checked, 'missingDocs')} /> Missing Documents
                </label>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.85rem', fontSize: '0.95rem', color: '#1a1a1a' }}>Country Registration</label>
              <select className="glass-select" value={advancedFilters.regulatory.country} onChange={(e) => updateFilter('regulatory', 'country', e.target.value)}>
                <option>All Countries</option>
                <option>USA (FDA)</option>
                <option>Europe (EMA)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.85rem', fontSize: '0.95rem', color: '#1a1a1a' }}>Compliance Risk (Max)</label>
              <input type="range" className="glass-range" min="0" max="100" value={advancedFilters.regulatory.maxRisk} onChange={(e) => updateFilter('regulatory', 'maxRisk', parseInt(e.target.value))} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#666', marginTop: '0.75rem', fontWeight: 500 }}>
                <span>0</span>
                <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{advancedFilters.regulatory.maxRisk}</span>
                <span>100</span>
              </div>
            </div>
          </>
        )}
      </div>
    </RightWorkspacePanel>
  );
}