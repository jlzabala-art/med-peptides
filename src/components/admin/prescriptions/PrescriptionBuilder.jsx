import React, { useState, useEffect } from 'react';
import { Search, Info, Plus, Trash2, Package, Layers, Activity, FileText, CheckCircle2, ChevronRight, User } from '@/lib/icons';
import { useAlgoliaSearch } from '../../../hooks/data/useAlgoliaSearch';
import ProtocolExecutiveSummary from '../protocols/ProtocolExecutiveSummary';
import { db } from '../../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

import styles from './PrescriptionBuilder.module.css';

export default function PrescriptionBuilder({ patient, onClose, onComplete }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  
  const [previewProtocol, setPreviewProtocol] = useState(null);
  const [previewProduct, setPreviewProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Algolia Searches
  const { hits: productsHits, isAlgoliaActive: productsActive, loading: productsLoading } = useAlgoliaSearch('products', searchTerm, { hitsPerPage: 10 });
  const { hits: protocolsHits, isAlgoliaActive: protocolsActive, loading: protocolsLoading } = useAlgoliaSearch('protocols', searchTerm, { hitsPerPage: 5 });

  const handleAddProduct = (product) => {
    setCart(prev => [...prev, {
      id: crypto.randomUUID(),
      type: 'product',
      productName: product.name || product.title,
      productId: product.objectID || product.id,
      dosage: product.suggestedDosage || 'As directed',
      quantity: 1,
      price: product.price || 0,
      protocolSource: null
    }]);
    toast.success('Added to prescription');
  };

  const handleAddProtocol = (protocol) => {
    // Flatten protocol phases and add their items
    const newItems = [];
    (protocol.phases || []).forEach(phase => {
      (phase.items || []).forEach(item => {
        newItems.push({
          id: crypto.randomUUID(),
          type: 'product',
          productName: item.name || item.productName || 'Unknown Item',
          productId: item.productId || null,
          dosage: item.dosage || 'As directed',
          quantity: item.quantity || 1,
          price: item.price || 0,
          protocolSource: protocol.protocol_name || protocol.name || 'Protocol'
        });
      });
    });

    if (newItems.length === 0) {
      toast.error('This protocol has no items.');
      return;
    }

    setCart(prev => [...prev, ...newItems]);
    toast.success(`Added ${newItems.length} items from protocol`);
  };

  const handleRemoveItem = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateItem = (id, field, value) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async () => {
    if (cart.length === 0) {
      toast.error('Add items to the prescription first.');
      return;
    }

    try {
      setIsSubmitting(true);
      const rxData = {
        patientId: patient?.id || null,
        patientName: patient?.name || 'Unknown Patient',
        items: cart,
        status: 'Pending Review',
        createdAt: serverTimestamp(),
        source: 'Manual Builder'
      };

      await addDoc(collection(db, 'prescriptions'), rxData);
      toast.success('Prescription created successfully');
      if (onComplete) onComplete();
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create prescription');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: '#f8fafc', zIndex: 9999,
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        background: 'white', padding: '1rem 2rem', borderBottom: '1px solid #e2e8f0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#0f172a' }}>Prescription Builder</h2>
          <div style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={14} /> {patient?.name ? `Patient: ${patient.name}` : 'No patient selected'}
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className="gcp-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="gcp-btn-primary" onClick={handleSubmit} disabled={isSubmitting || cart.length === 0}>
            {isSubmitting ? 'Saving...' : 'Submit Prescription'}
          </button>
        </div>
      </header>

      <div className={styles.builderContainer}>
        
        {/* Left Side: Omnibox & Search Results */}
        <div className={styles.searchSidebar}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '10px' }} />
              <input 
                type="text" 
                placeholder="Search protocols or individual peptides..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem',
                  borderRadius: '8px', border: '1px solid #cbd5e1',
                  fontSize: '0.9rem', outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
            {searchTerm.length > 0 ? (
              <>
                {/* Protocols Section */}
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '0.75rem', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Layers size={14} /> Suggested Protocols
                  </h3>
                  {protocolsLoading ? (
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Loading...</div>
                  ) : protocolsHits.length === 0 ? (
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>No protocols found</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {protocolsHits.map(proto => (
                        <div key={proto.objectID} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{proto.protocol_name || proto.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{proto.category || 'General'}</div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button title="View Protocol Details" onClick={() => { setPreviewProtocol(proto); setPreviewProduct(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', padding: '4px' }}><Info size={18} /></button>
                            <button title="Add to Prescription" onClick={() => handleAddProtocol(proto)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981', padding: '4px' }}><Plus size={18} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Products Section */}
                <div>
                  <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '0.75rem', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Package size={14} /> Individual Items
                  </h3>
                  {productsLoading ? (
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Loading...</div>
                  ) : productsHits.length === 0 ? (
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>No products found</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {productsHits.map(prod => (
                        <div key={prod.objectID} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prod.name || prod.title}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{prod.supplier || 'Generic'}</div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button title="View Item Details" onClick={() => { setPreviewProduct(prod); setPreviewProtocol(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', padding: '4px' }}><Info size={18} /></button>
                            <button title="Add to Prescription" onClick={() => handleAddProduct(prod)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981', padding: '4px' }}><Plus size={18} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                <Search size={32} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                <div style={{ fontSize: '0.9rem' }}>Type to search the clinical library</div>
              </div>
            )}
          </div>
        </div>

        {/* Center/Right: Cart & Previews */}
        <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
          
          {/* Cart Area */}
          <div className={styles.cartArea}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={20} /> Prescription Details
              </h3>

              {cart.length === 0 ? (
                <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '4rem 2rem', textAlign: 'center', color: '#64748b' }}>
                  <div>Start by searching and adding items from the left panel.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {cart.map((item, index) => (
                  <div key={item.id} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '1rem' }}>{item.productName}</div>
                        {item.protocolSource && (
                          <div style={{ fontSize: '0.75rem', color: '#3b82f6', background: '#eff6ff', padding: '2px 8px', borderRadius: '12px', display: 'inline-flex', marginTop: '4px' }}>
                            From Protocol: {item.protocolSource}
                          </div>
                        )}
                      </div>
                      <button onClick={() => handleRemoveItem(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Dosage Instructions</label>
                        <input 
                          type="text" 
                          value={item.dosage}
                          onChange={(e) => handleUpdateItem(item.id, 'dosage', e.target.value)}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Quantity</label>
                        <input 
                          type="number" 
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(item.id, 'quantity', e.target.value)}
                          min="1"
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick View Drawer */}
          {(previewProtocol || previewProduct) && (
            <div style={{ 
              width: '450px', borderLeft: '1px solid #e2e8f0', background: 'white', 
              boxShadow: '-4px 0 15px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column',
              animation: 'slideInRight 0.3s ease'
            }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>
                  {previewProtocol ? 'Protocol Info' : 'Product Info'}
                </h4>
                <button onClick={() => { setPreviewProtocol(null); setPreviewProduct(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '1.25rem' }}>&times;</button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
                {previewProtocol && (
                  <div style={{ transform: 'scale(0.9)', transformOrigin: 'top center' }}>
                    <ProtocolExecutiveSummary protocol={previewProtocol} />
                  </div>
                )}
                {previewProduct && (
                  <div style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', margin: '0 0 1rem 0' }}>{previewProduct.name || previewProduct.title}</h2>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{previewProduct.description || 'No description available.'}</p>
                    {/* Basic details */}
                    <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Supplier</span>
                        <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>{previewProduct.supplier || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Category</span>
                        <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>{previewProduct.category || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div style={{ padding: '1rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <button 
                  className="gcp-btn-primary" 
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                  onClick={() => {
                    if (previewProtocol) handleAddProtocol(previewProtocol);
                    if (previewProduct) handleAddProduct(previewProduct);
                  }}
                >
                  <Plus size={16} /> Add to Prescription
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}} />
    </div>
  );
}
