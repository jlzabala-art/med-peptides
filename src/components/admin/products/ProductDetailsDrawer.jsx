import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Save, Edit3, Settings, DollarSign, PackageOpen, Image as ImageIcon, Shield, Share2, 
  Trash2, Copy, Archive, Award, FileText, CheckCircle2, AlertTriangle, Sparkles, 
  UploadCloud, Brain, Globe, Plus, Trash, Eye
} from 'lucide-react';
import { Button, StatusChip, Card } from '../../ui';
import { doc, updateDoc, deleteDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useToast } from '../../../hooks/useToast';

export default function ProductDetailsDrawer({ isOpen, onClose, product, onSave }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [isImproving, setIsImproving] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  
  // Mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Local form state
  const [form, setForm] = useState({});

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        sku: product.sku || '',
        category: product.category || 'Peptides',
        product_type: product.product_type || 'Peptide',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        tags: product.tags || '',
        brand: product.brand || 'Atlas Health',
        manufacturer: product.manufacturer || '',
        countryOfOrigin: product.countryOfOrigin || '',
        supplier: product.supplier || '',
        
        // Pricing
        guestVialPrice: product.guestVialPrice || 0, // Retail
        proVialPrice: product.proVialPrice || 0, // Clinic
        wholesalerPrice: product.wholesalerPrice || 0,
        distributorPrice: product.distributorPrice || 0,
        costPrice: product.costPrice || 0, // Internal Cost
        
        // MOQ Prices
        moq_1: product.moq_1 || product.guestVialPrice || 0,
        moq_10: product.moq_10 || product.guestKitPrice || 0,
        moq_50: product.moq_50 || 0,
        moq_100: product.moq_100 || 0,
        moq_500: product.moq_500 || 0,
        moq_1000: product.moq_1000 || 0,

        // Inventory
        stock: product.stock || 0,
        reservedStock: product.reservedStock || 0,
        incomingStock: product.incomingStock || 0,
        warehouse: product.warehouse || 'Poland',
        reorderPoint: product.reorderPoint || 20,
        safetyStock: product.safetyStock || 10,
        avgMonthlySales: product.avgMonthlySales || 45,

        // Media
        images: product.images || [],
        pdfBrochure: product.pdfBrochure || '',
        coaUrl: product.coaUrl || '',
        sdsUrl: product.sdsUrl || '',
        msdsUrl: product.msdsUrl || '',

        // Regulatory
        registrationStatus: product.registrationStatus || 'Pending',
        expiryDate: product.expiryDate || '',
        regulatoryNotes: product.regulatoryNotes || '',
        countries: product.countries || ['UAE', 'EU'],
        requiredDocs: product.requiredDocs || ['CoA', 'GMP'],
      });
      setAiResult(null);
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  // Calculate Margin & Health Score
  const cost = Number(form.costPrice) || 0;
  const retail = Number(form.guestVialPrice) || 0;
  const marginPercent = retail > 0 ? ((retail - cost) / retail) * 100 : 0;

  // Health Score Calculation (out of 100)
  const calculateHealthScore = () => {
    let score = 100;
    if (!form.guestVialPrice) score -= 15;
    if (!form.coaUrl && !form.requiredDocs?.includes('CoA')) score -= 15;
    if (!form.supplier) score -= 15;
    if (!form.images || form.images.length === 0) score -= 15;
    if (!form.description) score -= 10;
    if (form.stock <= form.reorderPoint) score -= 15;
    if (!form.sku) score -= 15;
    return Math.max(score, 10);
  };

  const healthScore = calculateHealthScore();

  // Missing Info Alerts list
  const getMissingAlerts = () => {
    const alerts = [];
    if (!form.guestVialPrice) alerts.push("Missing Retail Price");
    if (!form.coaUrl) alerts.push("Missing CoA document");
    if (!form.supplier) alerts.push("No Supplier Assigned");
    if (!form.images || form.images.length === 0) alerts.push("No Product Image uploaded");
    if (form.stock <= form.reorderPoint) alerts.push("Low Stock warning (Reorder point reached)");
    return alerts;
  };

  const missingAlerts = getMissingAlerts();

  // Save changes
  const handleSave = async () => {
    try {
      const productRef = doc(db, 'products', product.id);
      const updates = {
        ...form,
        updatedAt: new Date().toISOString(),
      };
      await updateDoc(productRef, updates);
      toast.success('Product updated successfully!');
      onSave?.({ ...product, ...updates });
    } catch (err) {
      console.error(err);
      toast.error('Failed to save product details.');
    }
  };

  // Duplicate product
  const handleDuplicate = async () => {
    try {
      const newProduct = {
        ...form,
        name: `${form.name} (Copy)`,
        sku: form.sku ? `${form.sku}-COPY` : '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await addDoc(collection(db, 'products'), newProduct);
      toast.success('Product duplicated successfully!');
      onClose();
      onSave?.(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to duplicate product.');
    }
  };

  // Archive product
  const handleArchive = async () => {
    try {
      const productRef = doc(db, 'products', product.id);
      await updateDoc(productRef, { isActive: false, updatedAt: new Date().toISOString() });
      toast.success('Product archived (moved to Draft/Inactive).');
      onClose();
      onSave?.(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to archive product.');
    }
  };

  // Delete product
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to permanently delete "${form.name}"?`)) {
      try {
        await deleteDoc(doc(db, 'products', product.id));
        toast.success('Product deleted.');
        onClose();
        onSave?.(null);
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete product.');
      }
    }
  };

  // AI Product Improver
  const handleImproveProduct = () => {
    setIsImproving(true);
    setTimeout(() => {
      setIsImproving(false);
      setAiResult({
        description: `High-purity therapeutic grade ${form.name} peptide formulated to medical-standards for cellular rejuvenation, anti-aging therapies, and tissue regeneration. Synthesized under strict CGMP protocols with >99.2% purity verified via HPLC and MS analytics.`,
        seoTitle: `${form.name} buy | Premium Peptide Pharmacy & Clinical Supplier`,
        clinicalSummary: `Mechanism: Promotes angiogenesis, cellular motility, and upregulation of collagen synthesis. Indicated for clinical research protocols focusing on systemic recovery, wound repair mechanisms, and biological rejuvenation. Dosage protocols vary by clinical indication.`,
        catalogEntry: `Section: Clinical Peptides. Model: ${form.name}. Purity: >99%. Standard packaging: 5mg lyophilized vial.`,
        salesSheet: `Selling Points:\n1. Medical-Grade Purity (>99%)\n2. Dual-Vial & Kit packaging flexibility\n3. Pre-mapped clinical documentation support.`
      });
      // Update form description with improved AI description
      setForm(prev => ({
        ...prev,
        description: `High-purity therapeutic grade ${form.name} peptide formulated to medical-standards for cellular rejuvenation, anti-aging therapies, and tissue regeneration. Synthesized under strict CGMP protocols with >99.2% purity verified via HPLC and MS analytics.`
      }));
      toast.success('AI Suggestions generated! Tab "General" updated.');
    }, 1500);
  };

  // Categories helper
  const categoriesList = ['Peptides', 'Suplements', 'Genetic Tests', 'Medical Services', 'Recovery & Repair', 'Longevity'];

  const tabs = [
    { id: 'general', label: 'General', icon: Edit3 },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'inventory', label: 'Inventory', icon: PackageOpen },
    { id: 'media', label: 'Media', icon: ImageIcon },
    { id: 'regulatory', label: 'Regulatory', icon: Shield },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(3px)',
              zIndex: 9998,
            }}
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: isMobile ? '100vw' : '850px', // Wider workspace design / fullscreen on mobile
              backgroundColor: 'var(--color-bg-surface, #ffffff)',
              boxShadow: '-8px 0 32px rgba(15, 23, 42, 0.15)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            className="workspace-drawer"
          >
            
            {/* Header section with image and product info */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--color-border, #e2e8f0)',
              backgroundColor: '#f8fafc',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0, flex: 1 }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '10px',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  flexShrink: 0,
                  overflow: 'hidden'
                }}>
                  {form.images?.length > 0 ? (
                    <img src={form.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <ImageIcon size={22} />
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <h2 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: '#0f172a', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {form.name || 'New Product'}
                  </h2>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <StatusChip status={form.stock > 0 ? (product.isActive ? 'Active' : 'Draft') : 'Out of Stock'} />
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>SKU: {form.sku || 'N/A'}</span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>•</span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{form.category}</span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                {!isMobile && (
                  <>
                    <Button variant="outline" onClick={handleDuplicate} icon={<Copy size={14} />} style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>Duplicate</Button>
                    <Button variant="outline" onClick={handleArchive} icon={<Archive size={14} />} style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>Archive</Button>
                    <Button variant="ghost" onClick={handleDelete} style={{ color: '#ef4444', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}><Trash2 size={14} /></Button>
                    <div style={{ width: '1px', height: '24px', backgroundColor: '#cbd5e1', margin: '0 4px' }} />
                  </>
                )}
                <Button variant="outline" onClick={onClose} style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}><X size={16} /></Button>
                {!isMobile && (
                  <Button variant="primary" onClick={handleSave} icon={<Save size={14} />} style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>Save Changes</Button>
                )}
              </div>
            </div>

            {/* AI Insights & Diagnostics bar */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#eff6ff',
              borderBottom: '1px solid #bfdbfe',
              gap: '1rem'
            }}>
              {/* Product Health Score */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={16} color="#2563eb" />
                <span style={{ fontSize: '0.8rem', color: '#1e3a8a', fontWeight: 600 }}>Product Health Score:</span>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: healthScore > 80 ? '#16a34a' : (healthScore > 50 ? '#d97706' : '#dc2626'),
                  backgroundColor: healthScore > 80 ? '#dcfce7' : (healthScore > 50 ? '#fef3c7' : '#fee2e2'),
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>{healthScore} / 100</span>
              </div>

              {/* Alert indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, justifyContent: 'flex-end' }}>
                {missingAlerts.length > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#ea580c', fontSize: '0.75rem', fontWeight: 600 }}>
                    <AlertTriangle size={14} />
                    <span>{missingAlerts.length} Optimization Alerts</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#16a34a', fontSize: '0.75rem', fontWeight: 600 }}>
                    <CheckCircle2 size={14} />
                    <span>Fully Optimized</span>
                  </div>
                )}
                
                {/* AI improver button */}
                <button
                  onClick={handleImproveProduct}
                  disabled={isImproving}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #bfdbfe',
                    backgroundColor: '#ffffff',
                    color: '#2563eb',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(37,99,235,0.05)'
                  }}
                >
                  <Sparkles size={12} className={isImproving ? 'animate-spin' : ''} />
                  {isImproving ? 'Generating AI Suggests...' : 'Improve Product with AI'}
                </button>
              </div>
            </div>

            {/* Quick Alerts Dropdown view if clicked */}
            {missingAlerts.length > 0 && (
              <div style={{
                backgroundColor: '#fff7ed',
                padding: '0.5rem 1.5rem',
                borderBottom: '1px solid #fed7aa',
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap',
                fontSize: '0.75rem',
                color: '#c2410c'
              }}>
                <span style={{ fontWeight: 700 }}>Action Required:</span>
                {missingAlerts.map((alert, idx) => (
                  <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', backgroundColor: '#ffedd5', padding: '1px 6px', borderRadius: '4px' }}>
                    ⚠️ {alert}
                  </span>
                ))}
              </div>
            )}

            {/* Sticky Tabs Navigation */}
            <div style={{
              display: 'flex',
              padding: '0 1.5rem',
              borderBottom: '1px solid var(--color-border, #e2e8f0)',
              backgroundColor: '#ffffff',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              position: 'sticky',
              top: 0,
              zIndex: 5
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
                      padding: '0.85rem 0.5rem',
                      marginRight: '1.5rem',
                      background: 'none',
                      border: 'none',
                      borderBottom: `2px solid ${isActive ? 'var(--color-primary, #1a73e8)' : 'transparent'}`,
                      color: isActive ? 'var(--color-primary, #1a73e8)' : '#64748b',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'color 0.2s, border-color 0.2s',
                    }}
                  >
                    <Icon size={15} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', backgroundColor: '#fafafa' }}>
              
              {/* Tab 1: General Info */}
              {activeTab === 'general' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <Card padding="md">
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>Basic Details</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Product Name</label>
                        <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>SKU Code</label>
                        <input type="text" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Category</label>
                        <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#fff' }}>
                          {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Product Type</label>
                        <select value={form.product_type} onChange={e => setForm({...form, product_type: e.target.value})} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#fff' }}>
                          <option value="Peptide">Peptide</option>
                          <option value="Suplement">Suplement</option>
                          <option value="Diagnostic Kit">Diagnostic Kit</option>
                          <option value="Service">Medical Service</option>
                        </select>
                      </div>
                    </div>
                  </Card>

                  <Card padding="md">
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>Descriptions & Metadata</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Short Summary (For lists / flyers)</label>
                        <input type="text" value={form.shortDescription} onChange={e => setForm({...form, shortDescription: e.target.value})} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem' }} placeholder="Short product pitch..." />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Detailed Clinical Description</label>
                        <textarea rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', resize: 'vertical' }} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Tags (comma-separated)</label>
                          <input type="text" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem' }} placeholder="longevity, rejuvenation, recovery" />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Primary Supplier</label>
                          <input type="text" value={form.supplier} onChange={e => setForm({...form, supplier: e.target.value})} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem' }} />
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* AI suggestion panel display if active */}
                  {aiResult && (
                    <Card padding="md" style={{ border: '1px dashed #2563eb', backgroundColor: '#f0f9ff' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Sparkles size={16} color="#2563eb" />
                        <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#1e3a8a' }}>Atlas AI Content Optimization Ideas</h4>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem', color: '#1e293b' }}>
                        <div><strong>SEO Optimization:</strong> {aiResult.seoTitle}</div>
                        <div><strong>Clinical Guidelines Summary:</strong> {aiResult.clinicalSummary}</div>
                        <div><strong>Catalog Index:</strong> {aiResult.catalogEntry}</div>
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {/* Tab 2: Pricing Strategy */}
              {activeTab === 'pricing' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <Card padding="md">
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>B2B & B2C Pricing Matrix</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Retail Price (B2C)</label>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
                          <span style={{ padding: '0.5rem', backgroundColor: '#f1f5f9', color: '#64748b' }}>$</span>
                          <input type="number" value={form.guestVialPrice} onChange={e => setForm({...form, guestVialPrice: parseFloat(e.target.value) || 0})} style={{ border: 'none', padding: '0.5rem', width: '100%', outline: 'none' }} />
                        </div>
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Clinic Price (B2B)</label>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
                          <span style={{ padding: '0.5rem', backgroundColor: '#f1f5f9', color: '#64748b' }}>$</span>
                          <input type="number" value={form.proVialPrice} onChange={e => setForm({...form, proVialPrice: parseFloat(e.target.value) || 0})} style={{ border: 'none', padding: '0.5rem', width: '100%', outline: 'none' }} />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Wholesaler Price</label>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
                          <span style={{ padding: '0.5rem', backgroundColor: '#f1f5f9', color: '#64748b' }}>$</span>
                          <input type="number" value={form.wholesalerPrice} onChange={e => setForm({...form, wholesalerPrice: parseFloat(e.target.value) || 0})} style={{ border: 'none', padding: '0.5rem', width: '100%', outline: 'none' }} />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Distributor Price</label>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
                          <span style={{ padding: '0.5rem', backgroundColor: '#f1f5f9', color: '#64748b' }}>$</span>
                          <input type="number" value={form.distributorPrice} onChange={e => setForm({...form, distributorPrice: parseFloat(e.target.value) || 0})} style={{ border: 'none', padding: '0.5rem', width: '100%', outline: 'none' }} />
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card padding="md">
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>Unit Cost & Margins</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'center' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Internal Cost Price</label>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
                          <span style={{ padding: '0.5rem', backgroundColor: '#f1f5f9', color: '#64748b' }}>$</span>
                          <input type="number" value={form.costPrice} onChange={e => setForm({...form, costPrice: parseFloat(e.target.value) || 0})} style={{ border: 'none', padding: '0.5rem', width: '100%', outline: 'none' }} />
                        </div>
                      </div>

                      <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Auto-calculated Retail Margin</span>
                        <strong style={{ fontSize: '1.25rem', color: marginPercent > 40 ? '#16a34a' : '#ea580c' }}>
                          {marginPercent.toFixed(1)}%
                        </strong>
                      </div>
                    </div>
                  </Card>

                  <Card padding="md">
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>Minimum Order Quantity (MOQ) Discount Tiers</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                      {[
                        { tier: '1 Unit', key: 'moq_1' },
                        { tier: '10 Units', key: 'moq_10' },
                        { tier: '50 Units', key: 'moq_50' },
                        { tier: '100 Units', key: 'moq_100' },
                        { tier: '500 Units', key: 'moq_500' },
                        { tier: '1000 Units', key: 'moq_1000' },
                      ].map((item) => (
                        <div key={item.key}>
                          <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '3px', fontWeight: 600 }}>{item.tier}</label>
                          <input type="number" value={form[item.key]} onChange={e => setForm({...form, [item.key]: parseFloat(e.target.value) || 0})} style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem' }} />
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* Tab 3: Inventory */}
              {activeTab === 'inventory' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <Card padding="md">
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>Warehouse & Stock Allocation</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Current On-hand Stock</label>
                        <input type="number" value={form.stock} onChange={e => setForm({...form, stock: parseInt(e.target.value) || 0})} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Reserved Stock (Active Orders)</label>
                        <input type="number" value={form.reservedStock} onChange={e => setForm({...form, reservedStock: parseInt(e.target.value) || 0})} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#f1f5f9' }} disabled />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Incoming Supply (PO transit)</label>
                        <input type="number" value={form.incomingStock} onChange={e => setForm({...form, incomingStock: parseInt(e.target.value) || 0})} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Primary Warehouse</label>
                        <select value={form.warehouse} onChange={e => setForm({...form, warehouse: e.target.value})} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#fff' }}>
                          <option value="Poland">Poland Logistics Center</option>
                          <option value="UAE-Dubai">Dubai FreeZone Center</option>
                          <option value="USA-Delaware">USA East Logistics</option>
                        </select>
                      </div>
                    </div>
                  </Card>

                  <Card padding="md">
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>Reorder Limits & Safety Margins</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Reorder Point Threshold</label>
                        <input type="number" value={form.reorderPoint} onChange={e => setForm({...form, reorderPoint: parseInt(e.target.value) || 20})} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Safety Stock Level</label>
                        <input type="number" value={form.safetyStock} onChange={e => setForm({...form, safetyStock: parseInt(e.target.value) || 10})} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem' }} />
                      </div>
                    </div>
                  </Card>

                  {/* Predictive Stock analysis */}
                  <Card padding="md" style={{ border: '1px solid #bfdbfe', backgroundColor: '#f0f9ff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <Brain size={16} color="#2563eb" />
                      <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#1e3a8a' }}>Predictive Stock AI Forecast</h4>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', fontSize: '0.85rem' }}>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Average Monthly Sales</span>
                        <strong style={{ color: '#0f172a' }}>{form.avgMonthlySales} units / month</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Days Remaining (Estimated)</span>
                        <strong style={{ color: form.stock / form.avgMonthlySales * 30 < 15 ? '#ef4444' : '#16a34a' }}>
                          {Math.round((form.stock / (form.avgMonthlySales || 1)) * 30)} Days
                        </strong>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Tab 4: Media & Documents */}
              {activeTab === 'media' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <Card padding="md">
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>Product Image & Gallery</h3>
                    
                    <div style={{
                      border: '2px dashed #cbd5e1',
                      borderRadius: '8px',
                      padding: '2rem',
                      textAlign: 'center',
                      backgroundColor: '#f8fafc',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s',
                      marginBottom: '1rem'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#3b82f6'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                    >
                      <UploadCloud size={32} style={{ color: '#64748b', marginBottom: '0.5rem', display: 'inline-block' }} />
                      <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>Drag & drop images here or select locally</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Supports PNG, JPEG up to 5MB</p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {form.images?.map((img, idx) => (
                        <div key={idx} style={{ width: '80px', height: '80px', borderRadius: '6px', border: '1px solid #cbd5e1', overflow: 'hidden', position: 'relative' }}>
                          <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button style={{ position: 'absolute', top: 2, right: 2, backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', padding: '2px' }}>
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card padding="md">
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>Clinical Brochures & Laboratory Reports</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FileText size={16} color="#64748b" />
                          <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Certificate of Analysis (CoA)</span>
                        </div>
                        <input 
                          type="text" 
                          value={form.coaUrl} 
                          onChange={e => setForm({...form, coaUrl: e.target.value})} 
                          placeholder="Doc URL Link..." 
                          style={{ width: '220px', padding: '3px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.8rem' }} 
                        />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FileText size={16} color="#64748b" />
                          <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Material Safety Data Sheet (MSDS)</span>
                        </div>
                        <input 
                          type="text" 
                          value={form.msdsUrl} 
                          onChange={e => setForm({...form, msdsUrl: e.target.value})} 
                          placeholder="Doc URL Link..." 
                          style={{ width: '220px', padding: '3px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.8rem' }} 
                        />
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Tab 5: Regulatory Details */}
              {activeTab === 'regulatory' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <Card padding="md">
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>Regional Registration Status</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'center' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Registration Status</label>
                        <select value={form.registrationStatus} onChange={e => setForm({...form, registrationStatus: e.target.value})} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#fff' }}>
                          <option value="Registered">Registered & Compliant</option>
                          <option value="Pending">Pending Audit</option>
                          <option value="Not Registered">Not Registered</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Expiry Date</label>
                        <input type="date" value={form.expiryDate} onChange={e => setForm({...form, expiryDate: e.target.value})} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem' }} />
                      </div>
                    </div>
                  </Card>

                  <Card padding="md">
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>Middle East & Global Availability</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                      {['UAE', 'KSA', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'EU', 'US'].map((country) => {
                        const hasCountry = form.countries?.includes(country);
                        return (
                          <button
                            key={country}
                            onClick={() => {
                              const updated = hasCountry
                                ? form.countries.filter(c => c !== country)
                                : [...(form.countries || []), country];
                              setForm({...form, countries: updated});
                            }}
                            style={{
                              padding: '0.4rem 0.8rem',
                              borderRadius: '20px',
                              border: `1px solid ${hasCountry ? '#2563eb' : '#cbd5e1'}`,
                              backgroundColor: hasCountry ? '#eff6ff' : '#ffffff',
                              color: hasCountry ? '#2563eb' : '#475569',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Globe size={12} /> {country}
                          </button>
                        );
                      })}
                    </div>
                  </Card>

                  <Card padding="md">
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>Required Audit Documents Checklist</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                      {['CoA', 'GMP Certificate', 'ISO Standards', 'Stability Study', 'Product Monograph'].map((docName) => {
                        const hasDoc = form.requiredDocs?.includes(docName);
                        return (
                          <label key={docName} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', color: '#1e293b' }}>
                            <input
                              type="checkbox"
                              checked={hasDoc}
                              onChange={() => {
                                const updated = hasDoc
                                  ? form.requiredDocs.filter(d => d !== docName)
                                  : [...(form.requiredDocs || []), docName];
                                setForm({...form, requiredDocs: updated});
                              }}
                            />
                            {docName}
                          </label>
                        );
                      })}
                    </div>
                  </Card>

                  <Card padding="md">
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>Internal Audit Notes</h3>
                    <textarea rows={3} value={form.regulatoryNotes} onChange={e => setForm({...form, regulatoryNotes: e.target.value})} placeholder="Internal auditor reviews, certificates details..." style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', resize: 'vertical' }} />
                  </Card>
                </div>
              )}
            </div>

             {/* Mobile Horizontal Navigation & Sticky Bottom Footer Actions */}
            <div style={{
              display: 'flex',
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--color-border, #e2e8f0)',
              backgroundColor: '#f8fafc',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.5rem',
              position: 'sticky',
              bottom: 0,
              zIndex: 10
            }}>
              {isMobile ? (
                <>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <Button variant="outline" onClick={handleDuplicate} icon={<Copy size={14} />} style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}>Duplicate</Button>
                    <Button variant="outline" onClick={handleArchive} icon={<Archive size={14} />} style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}>Archive</Button>
                  </div>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <Button variant="outline" onClick={onClose} style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave} icon={<Save size={14} />} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Save</Button>
                  </div>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={onClose} style={{ fontSize: '0.85rem' }}>Cancel</Button>
                  <Button variant="primary" onClick={handleSave} icon={<Save size={16} />} style={{ fontSize: '0.85rem' }}>Save Workspace Changes</Button>
                </>
              )}
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
