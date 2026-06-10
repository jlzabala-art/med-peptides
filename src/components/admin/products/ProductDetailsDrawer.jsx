import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Edit3, Settings, DollarSign, PackageOpen, Image as ImageIcon, Shield, Share2 } from 'lucide-react';
import { Button, StatusChip } from '../../ui';

const ProductDetailsDrawer = ({ isOpen, onClose, product, onSave }) => {
  const [activeTab, setActiveTab] = useState('general');

  if (!isOpen || !product) return null;

  const tabs = [
    { id: 'general', label: 'General', icon: Edit3 },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'inventory', label: 'Inventory', icon: PackageOpen },
    { id: 'media', label: 'Media', icon: ImageIcon },
    { id: 'regulatory', label: 'Regulatory', icon: Shield },
    { id: 'publishing', label: 'Publishing', icon: Share2 },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(2px)',
              zIndex: 9998,
            }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: '600px',
              backgroundColor: '#fff',
              boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.1)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.5rem',
              borderBottom: '1px solid #dadce0',
              backgroundColor: '#f8f9fa',
            }}>
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', color: '#202124', fontWeight: 600 }}>
                  {product.name}
                </h2>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <StatusChip status={product.stock > 0 ? (product.isActive ? 'Active' : 'Draft') : 'Out of Stock'} />
                  <span style={{ fontSize: '0.85rem', color: '#5f6368' }}>SKU: {product.sku || 'N/A'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="outline" onClick={onClose} icon={<X size={16} />}>Close</Button>
                <Button variant="primary" onClick={() => onSave?.(product)} icon={<Save size={16} />}>Save</Button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{
              display: 'flex',
              padding: '0 1.5rem',
              borderBottom: '1px solid #dadce0',
              overflowX: 'auto',
              scrollbarWidth: 'none',
            }}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '1rem 0.5rem',
                      marginRight: '1.5rem',
                      background: 'none',
                      border: 'none',
                      borderBottom: `2px solid ${isActive ? '#1a73e8' : 'transparent'}`,
                      color: isActive ? '#1a73e8' : '#5f6368',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'color 0.2s, border-color 0.2s',
                    }}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', backgroundColor: '#fff' }}>
              {activeTab === 'general' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#3c4043', marginBottom: '4px' }}>Product Name</label>
                      <input type="text" defaultValue={product.name} style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #dadce0', borderRadius: '6px', fontSize: '0.95rem' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#3c4043', marginBottom: '4px' }}>Category</label>
                        <select defaultValue={product.category} style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #dadce0', borderRadius: '6px', fontSize: '0.95rem', backgroundColor: '#fff' }}>
                          <option>{product.category}</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#3c4043', marginBottom: '4px' }}>Type</label>
                        <select defaultValue={product.product_type} style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #dadce0', borderRadius: '6px', fontSize: '0.95rem', backgroundColor: '#fff' }}>
                          <option>{product.product_type || 'Peptide'}</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#3c4043', marginBottom: '4px' }}>Description</label>
                      <textarea rows={4} defaultValue={product.description || ''} style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #dadce0', borderRadius: '6px', fontSize: '0.95rem', resize: 'vertical' }} />
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'pricing' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                   <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '8px', border: '1px solid #e8eaed' }}>
                      <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: '#202124' }}>Tiered Pricing Strategy</h4>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '1rem', borderBottom: '1px solid #dadce0', paddingBottom: '0.5rem' }}>
                        <strong style={{ color: '#5f6368' }}>Customer Tier</strong>
                        <strong style={{ textAlign: 'right', color: '#5f6368' }}>Single Unit</strong>
                        <strong style={{ textAlign: 'right', color: '#5f6368' }}>Set of 10</strong>

                        <span style={{ color: '#202124', fontWeight: 500, display: 'flex', alignItems: 'center' }}>Retail</span>
                        <div style={{ textAlign: 'right' }}><input type="number" defaultValue={product.guestVialPrice} style={{ width: '80px', padding: '4px 8px', textAlign: 'right', border: '1px solid #dadce0', borderRadius: '4px' }} /></div>
                        <div style={{ textAlign: 'right' }}><input type="number" defaultValue={product.guestKitPrice} style={{ width: '80px', padding: '4px 8px', textAlign: 'right', border: '1px solid #dadce0', borderRadius: '4px' }} /></div>

                        <span style={{ color: '#202124', fontWeight: 500, display: 'flex', alignItems: 'center' }}>Clinic / Doctor</span>
                        <div style={{ textAlign: 'right' }}><input type="number" defaultValue={product.proVialPrice} style={{ width: '80px', padding: '4px 8px', textAlign: 'right', border: '1px solid #dadce0', borderRadius: '4px' }} /></div>
                        <div style={{ textAlign: 'right' }}><input type="number" defaultValue={product.proKitPrice} style={{ width: '80px', padding: '4px 8px', textAlign: 'right', border: '1px solid #dadce0', borderRadius: '4px' }} /></div>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'inventory' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#3c4043', marginBottom: '4px' }}>Available Stock</label>
                      <input type="number" defaultValue={product.stock} style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #dadce0', borderRadius: '6px', fontSize: '0.95rem' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#3c4043', marginBottom: '4px' }}>Low Stock Alert Threshold</label>
                      <input type="number" defaultValue={20} style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #dadce0', borderRadius: '6px', fontSize: '0.95rem' }} />
                    </div>
                  </div>
                </div>
              )}

              {['media', 'regulatory', 'publishing'].includes(activeTab) && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px dashed #dadce0' }}>
                  <Settings size={32} color="#9aa0a6" style={{ marginBottom: '1rem' }} />
                  <p style={{ margin: 0, color: '#5f6368', fontWeight: 500 }}>{tab.label} settings coming soon</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductDetailsDrawer;
