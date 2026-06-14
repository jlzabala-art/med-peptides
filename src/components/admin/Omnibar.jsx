import Search from "lucide-react/dist/esm/icons/search";
import X from "lucide-react/dist/esm/icons/x";
import User from "lucide-react/dist/esm/icons/user";
import Building2 from "lucide-react/dist/esm/icons/building-2";
import Stethoscope from "lucide-react/dist/esm/icons/stethoscope";
import Package from "lucide-react/dist/esm/icons/package";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Activity from "lucide-react/dist/esm/icons/activity";
import EyeOff from "lucide-react/dist/esm/icons/eye-off";
import Tag from "lucide-react/dist/esm/icons/tag";
import React, { useState, useEffect, useRef } from 'react';











import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { useNavigate } from 'react-router-dom';

// Initialize Algolia client (using placeholders or env variables)
const searchClient = algoliasearch(
  import.meta.env.VITE_ALGOLIA_APP_ID || 'LATCOP1VMD',
  import.meta.env.VITE_ALGOLIA_SEARCH_KEY || 'test_key'
);

export default function Omnibar({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ patients: [], clinics: [], physicians: [], products: [] });
  const [loading, setLoading] = useState(false);
  const [activePreview, setActivePreview] = useState(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults({ patients: [], clinics: [], physicians: [], products: [] });
      setActivePreview(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults({ patients: [], clinics: [], physicians: [], products: [] });
      setActivePreview(null);
      return;
    }

    let isMounted = true;
    setLoading(true);

    const performSearch = async () => {
      try {
        // Multi-index search using Algolia
        const responses = await searchClient.search([
          { indexName: 'atlas_patients', query, params: { hitsPerPage: 3 } },
          { indexName: 'atlas_clinics', query, params: { hitsPerPage: 3 } },
          { indexName: 'atlas_physicians', query, params: { hitsPerPage: 3 } },
          { indexName: 'atlas_products', query, params: { hitsPerPage: 5 } }
        ]);

        if (isMounted) {
          const newResults = {
            patients: responses.results[0]?.hits || [],
            clinics: responses.results[1]?.hits || [],
            physicians: responses.results[2]?.hits || [],
            products: responses.results[3]?.hits || []
          };
          setResults(newResults);
          // Auto-select first product if available
          if (newResults.products.length > 0) {
            setActivePreview({ type: 'product', data: newResults.products[0] });
          } else {
            setActivePreview(null);
          }
        }
      } catch (err) {
        console.error("Algolia search error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const debounce = setTimeout(performSearch, 300);
    return () => {
      isMounted = false;
      clearTimeout(debounce);
    };
  }, [query]);

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '10vh' }} onClick={onClose}>
      <div style={{ width: '100%', maxWidth: '850px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', overflow: 'hidden', animation: 'smSlideDown 0.2s ease-out', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        {/* Input Area */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <Search size={20} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Search products, patients, clinics, physicians..." 
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1.1rem', padding: '0 1rem', color: 'var(--text-main)', background: 'transparent' }}
          />
          {loading ? <Loader2 size={18} className="spin" color="var(--primary)" /> : <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>ESC</div>}
        </div>

        <div style={{ display: 'flex', maxHeight: '60vh', minHeight: '400px' }}>
          {/* Results Area (Left) */}
          <div style={{ flex: 1, overflowY: 'auto', borderRight: '1px solid #e2e8f0', padding: '0.5rem 0' }}>
            {/* Products (Prioritized) */}
            {results.products.length > 0 && (
              <div style={{ padding: '0.5rem 0' }}>
                <div style={{ padding: '0.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Products</div>
                {results.products.map(p => (
                  <div 
                    key={p.objectID} 
                    className="hover-bg" 
                    onMouseEnter={() => setActivePreview({ type: 'product', data: p })}
                    onClick={() => handleNavigate(`/admin/products?search=${p.name}`)}
                    style={{ 
                      padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer',
                      background: activePreview?.data?.objectID === p.objectID ? '#f1f5f9' : 'transparent'
                    }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: '6px', backgroundColor: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={16} /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{p.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SKU: {p.sku || 'N/A'}</div>
                    </div>
                    <ArrowRight size={16} color="#94a3b8" />
                  </div>
                ))}
              </div>
            )}

            {results.patients.length > 0 && (
              <div style={{ padding: '0.5rem 0' }}>
                <div style={{ padding: '0.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Patients</div>
                {results.patients.map(p => (
                  <div key={p.objectID} className="hover-bg" onClick={() => handleNavigate(`/admin/patients`)} style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#f0fdf4', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={16} /></div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{p.name || 'Unknown Patient'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {results.physicians.length > 0 && (
              <div style={{ padding: '0.5rem 0' }}>
                <div style={{ padding: '0.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Physicians</div>
                {results.physicians.map(p => (
                  <div key={p.objectID} className="hover-bg" onClick={() => handleNavigate(`/admin/doctors`)} style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#fef08a', color: '#854d0e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Stethoscope size={16} /></div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Dr. {p.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.specialty || 'General'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && query.length >= 2 && Object.values(results).every(arr => arr.length === 0) && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No results found for "{query}"
              </div>
            )}
            {!loading && query.length < 2 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Start typing to search across the catalog...
              </div>
            )}

          </div>

          {/* Rich Preview Area (Right) */}
          <div style={{ width: '380px', background: '#f8fafc', padding: '24px', overflowY: 'auto' }}>
            {activePreview?.type === 'product' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: 48, height: 48, background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package size={24} color="#0071bd" />
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#0f172a' }}>{activePreview.data.name}</h3>
                    <span style={{ fontSize: '13px', color: '#64748b', background: '#e2e8f0', padding: '2px 8px', borderRadius: '12px' }}>SKU: {activePreview.data.sku || 'N/A'}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Activity size={12} /> Global Stock
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#10b981' }}>{activePreview.data.stock || 'In Stock'}</div>
                  </div>
                  <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Tag size={12} /> Base Price
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>{activePreview.data.basePrice ? `$${activePreview.data.basePrice}` : 'Variable'}</div>
                  </div>
                </div>

                <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <EyeOff size={16} color="#64748b" /> Visibility Status
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span color="#64748b">UAE</span>
                      <span style={{ color: '#10b981', fontWeight: 500 }}>Approved</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span color="#64748b">European Union</span>
                      <span style={{ color: '#ef4444', fontWeight: 500 }}>Blocked (No CoA)</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <button onClick={() => handleNavigate('/admin/pricing-visibility')} style={{ flex: 1, padding: '8px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, color: '#0f172a' }}>Manage Access</button>
                  <button onClick={() => handleNavigate(`/admin/products?search=${activePreview.data.name}`)} style={{ flex: 1, padding: '8px', background: '#0071bd', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>Edit Item</button>
                </div>

              </div>
            ) : (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                <Search size={32} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <span style={{ fontSize: '14px' }}>Hover over an item for a quick preview</span>
              </div>
            )}
          </div>
        </div>

      </div>
      <style>{`
        @keyframes smSlideDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .hover-bg { transition: background 0.1s; }
        .hover-bg:hover { background-color: #f8fafc; }
      `}</style>
    </div>
  );
}