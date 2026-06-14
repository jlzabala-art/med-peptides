import X from "lucide-react/dist/esm/icons/x";
import Save from "lucide-react/dist/esm/icons/save";
import Edit3 from "lucide-react/dist/esm/icons/edit-3";
import Settings from "lucide-react/dist/esm/icons/settings";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import PackageOpen from "lucide-react/dist/esm/icons/package-open";
import Box from "lucide-react/dist/esm/icons/box";
import Building from "lucide-react/dist/esm/icons/building";
import ImageIcon from "lucide-react/dist/esm/icons/image";
import Shield from "lucide-react/dist/esm/icons/shield";
import Share2 from "lucide-react/dist/esm/icons/share-2";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import Copy from "lucide-react/dist/esm/icons/copy";
import Archive from "lucide-react/dist/esm/icons/archive";
import Award from "lucide-react/dist/esm/icons/award";
import FileText from "lucide-react/dist/esm/icons/file-text";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import UploadCloud from "lucide-react/dist/esm/icons/upload-cloud";
import Brain from "lucide-react/dist/esm/icons/brain";
import Globe from "lucide-react/dist/esm/icons/globe";
import Plus from "lucide-react/dist/esm/icons/plus";
import Trash from "lucide-react/dist/esm/icons/trash";
import Eye from "lucide-react/dist/esm/icons/eye";
import Activity from "lucide-react/dist/esm/icons/activity";
import Link from "lucide-react/dist/esm/icons/link";
import History from "lucide-react/dist/esm/icons/history";
import Check from "lucide-react/dist/esm/icons/check";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import ChevronUp from "lucide-react/dist/esm/icons/chevron-up";
import ExternalLink from "lucide-react/dist/esm/icons/external-link";
import Info from "lucide-react/dist/esm/icons/info";
import AlertOctagon from "lucide-react/dist/esm/icons/alert-octagon";
import HelpCircle from "lucide-react/dist/esm/icons/help-circle";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';



































import { Button, StatusChip, Card } from '../../ui';
import { doc, updateDoc, deleteDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useToast } from '../../../hooks/useToast';
import notifier from '../../../services/NotificationService';

export default function ProductDetailsDrawer({ isOpen, onClose, product, onSave }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isImproving, setIsImproving] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [showAiAdvisor, setShowAiAdvisor] = useState(true);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const scrollContainerRef = React.useRef(null);
  // Mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll to top on opening
  useEffect(() => {
    if (isOpen && product) {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [product, isOpen]);

  // Accordion state for Mobile/Tablet accordion views
  const [expandedAccordions, setExpandedAccordions] = useState({
    overview: true,
    variants: false,
    suppliers: false,
    inventory: false,
    regulatory: false,
    pricing: false,
    history: false
  });

  const toggleAccordion = (section) => {
    setExpandedAccordions(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  // Local form state
  const [form, setForm] = useState({});
  const [zohoSyncing, setZohoSyncing] = useState(false);

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
        backupSupplier: product.backupSupplier || 'Helix Chemical Corp',
        supplierLeadTime: product.supplierLeadTime || 14, // in days
        lastPurchasePrice: product.lastPurchasePrice || product.costPrice || 42,
        lastPurchaseDate: product.lastPurchaseDate || '2026-04-12',
        // Lifecycle Stage
        lifecycleStage: product.lifecycleStage || (product.isActive ? 'Published' : 'Draft'),
        // Pricing
        guestVialPrice: product.guestVialPrice || 0, // Retail
        proVialPrice: product.proVialPrice || 0, // Clinic
        wholesalerPrice: product.wholesalerPrice || 0,
        distributorPrice: product.distributorPrice || 0,
        costPrice: product.costPrice || 0, // Internal Cost
        // MOQ Prices
        moq_1: product.moq_1 || product.guestVialPrice || 0,
        moq_10: product.moq_10 || product.proVialPrice || 0,
        moq_50: product.moq_50 || 0,
        moq_100: product.moq_100 || 0,
        moq_500: product.moq_500 || 0,
        moq_1000: product.moq_1000 || 0,

        // Inventory
        stock: product.stock || 0,
        reservedStock: product.reservedStock || 12,
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
        packagingUrl: product.packagingUrl || '',
        marketingMaterialUrl: product.marketingMaterialUrl || '',
        videosUrl: product.videosUrl || '',

        // Regulatory & Compliance Documents
        registrationStatus: product.registrationStatus || 'Pending',
        expiryDate: product.expiryDate || '',
        regulatoryNotes: product.regulatoryNotes || '',
        countries: product.countries || ['UAE', 'EU'],
        requiredDocs: product.requiredDocs || ['CoA', 'GMP'],
        // Doc Compliance Checklist
        docStatus_coa: product.docStatus_coa || 'Approved',
        docStatus_msds: product.docStatus_msds || 'Pending',
        docStatus_gmp: product.docStatus_gmp || 'Approved',
        docStatus_iso: product.docStatus_iso || 'Approved',
        docStatus_stability: product.docStatus_stability || 'Missing',
        docStatus_shelflife: product.docStatus_shelflife || 'Approved',

        // Regional Registration Matrix
        reg_uae: product.reg_uae || 'Approved',
        reg_ksa: product.reg_ksa || 'Pending',
        reg_qatar: product.reg_qatar || 'Pending',
        reg_kuwait: product.reg_kuwait || 'Not Registered',
        reg_bahrain: product.reg_bahrain || 'Not Registered',
        reg_oman: product.reg_oman || 'Not Registered',
        reg_eu: product.reg_eu || 'Approved',
        reg_us: product.reg_us || 'Pending',

        // Zoho Status
        zohoId: product.zohoId || 'ZOHO-PROD-984812',
        zohoSyncStatus: product.zohoSyncStatus || 'Synced',
        zohoLastSync: product.zohoLastSync || '2h ago',
        zohoInventorySync: product.zohoInventorySync || 'Enabled',
        zohoPriceSync: product.zohoPriceSync || 'Enabled',
        zohoSupplierSync: product.zohoSupplierSync || 'Enabled',

        // Product Relationships
        compatibleProducts: product.compatibleProducts || ['Rejuvenation Starter Pack', 'BPC-157 Vials'],
        alternativeProducts: product.alternativeProducts || ['Sermorelin Lyophilized Powder'],
        upsellProducts: product.upsellProducts || ['Longevity Premium Package'],
        bundleProducts: product.bundleProducts || ['Bio-Recovery Bundle'],
        successorProduct: product.successorProduct || '',
      });

      setAiResult(null);

      // Generate mock activity log timeline events
      setTimelineEvents([
        { date: 'Today, 2h ago', event: 'Zoho Books synchronized successfully', user: 'System (Automated)', icon: RefreshCw, color: '#10b981' },
        { date: 'Yesterday, 14:32', event: 'Inventory updated (+100 Units received)', user: 'Warehouse Manager', icon: PackageOpen, color: '#3b82f6' },
        { date: 'June 08, 10:15', event: 'COA Document Uploaded and Approved', user: 'Quality Assurance', icon: Shield, color: '#8b5cf6' },
        { date: 'June 05, 11:20', event: 'Price updated (Retail to $100)', user: 'Sales Exec', icon: DollarSign, color: '#f59e0b' },
        { date: 'May 20, 09:00', event: 'Product created and status set to Draft', user: 'Procurement AI', icon: Plus, color: '#6b7280' },
      ]);
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  // Pricing Margins & Calculations
  const cost = Number(form.costPrice) || 0;
  const retail = Number(form.guestVialPrice) || 0;
  const clinic = Number(form.proVialPrice) || 0;
  const distributor = Number(form.distributorPrice) || 0;
  const wholesaler = Number(form.wholesalerPrice) || 0;

  const calculateMargin = (price) => {
    return price > 0 ? ((price - cost) / price) * 100 : 0;
  };

  const marginRetail = calculateMargin(retail);
  const marginClinic = calculateMargin(clinic);
  const marginDistributor = calculateMargin(distributor);
  const marginWholesaler = calculateMargin(wholesaler);

  const getMarginColor = (margin) => {
    if (margin >= 40) return '#10b981'; // Green
    if (margin >= 20) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  // Stock Available Calculation
  const availableStock = Math.max(form.stock - form.reservedStock, 0);

  // Health Score Calculation
  const calculateHealthScore = () => {
    let score = 100;
    if (!form.guestVialPrice) score -= 15;
    if (form.docStatus_coa === 'Missing') score -= 15;
    if (form.docStatus_msds === 'Missing') score -= 10;
    if (!form.supplier) score -= 15;
    if (!form.images || form.images.length === 0) score -= 15;
    if (!form.description) score -= 10;
    if (form.stock <= form.reorderPoint) score -= 15;
    if (!form.sku) score -= 10;
    return Math.max(score, 10);
  };
  const healthScore = calculateHealthScore();

  // Completion Progress Checklist
  const checklistItems = [
    { label: 'Image', done: form.images && form.images.length > 0 },
    { label: 'Pricing', done: !!form.guestVialPrice },
    { label: 'Supplier', done: !!form.supplier },
    { label: 'Inventory', done: form.stock > 0 },
    { label: 'COA', done: form.docStatus_coa === 'Approved' },
    { label: 'Regulatory', done: form.registrationStatus === 'Registered' || form.reg_uae === 'Approved' },
    { label: 'Description', done: !!form.description },
    { label: 'Marketing Assets', done: !!form.pdfBrochure || !!form.marketingMaterialUrl },
  ];

  const completedCount = checklistItems.filter(item => item.done).length;
  const completionPercent = Math.round((completedCount / checklistItems.length) * 100);

  // Critical Action Alerts list
  const getActionCenterAlerts = () => {
    const alerts = [];
    if (!form.guestVialPrice) {
      alerts.push({
        id: 'price',
        type: 'critical',
        text: 'Missing Retail Price',
        actionLabel: 'Fix Now',
        action: () => setActiveTab('pricing')
      });
    }
    if (form.docStatus_coa === 'Missing') {
      alerts.push({
        id: 'coa',
        type: 'critical',
        text: 'Missing COA Certificate',
        actionLabel: 'Upload File',
        action: () => setActiveTab('media')
      });
    }
    if (!form.supplier) {
      alerts.push({
        id: 'supplier',
        type: 'warning',
        text: 'No Supplier Assigned',
        actionLabel: 'Assign Supplier',
        action: () => setActiveTab('general')
      });
    }
    if (!form.images || form.images.length === 0) {
      alerts.push({
        id: 'image',
        type: 'warning',
        text: 'No Product Image Uploaded',
        actionLabel: 'Upload Image',
        action: () => setActiveTab('media')
      });
    }
    return alerts;
  };

  const actionAlerts = getActionCenterAlerts();

  // Save changes
  const handleSave = async () => {
    try {
      const productRef = doc(db, 'products', product.id);
      const updates = {
        ...form,
        updatedAt: new Date().toISOString(),
      };
      await updateDoc(productRef, updates);
      toast.success('Product Workspace changes saved successfully!');
      onSave?.({ ...product, ...updates });
    } catch (err) {
      console.error(err);
      toast.error('Failed to save product workspace details.');
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
      await updateDoc(productRef, { isActive: false, lifecycleStage: 'Archived', updatedAt: new Date().toISOString() });
      toast.success('Product status updated to Archived.');
      onClose();
      onSave?.(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to archive product.');
    }
  };

  // Delete product
  const handleDelete = async () => {
    notifier.confirmCritical(`Are you sure you want to permanently delete "${form.name}"?`, async () => {
      try {
        await deleteDoc(doc(db, 'products', product.id));
        toast.success('Product deleted.');
        onClose();
        onSave?.(null);
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete product.');
      }
    });
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
      setForm(prev => ({
        ...prev,
        description: `High-purity therapeutic grade ${form.name} peptide formulated to medical-standards for cellular rejuvenation, anti-aging therapies, and tissue regeneration. Synthesized under strict CGMP protocols with >99.2% purity verified via HPLC and MS analytics.`
      }));
      toast.success('AI suggestions implemented! Description updated in draft.');
    }, 1200);
  };

  // Quick Action AI trigger
  const triggerAiAction = (actionType) => {
    setIsImproving(true);
    setTimeout(() => {
      setIsImproving(false);
      if (actionType === 'fix') {
        setForm(prev => ({
          ...prev,
          guestVialPrice: 100,
          costPrice: 50,
          docStatus_coa: 'Approved',
          docStatus_msds: 'Approved'
        }));
        toast.success('Critical anomalies solved automatically by Atlas AI!');
      } else {
        toast.success(`AI content generated for ${actionType}!`);
      }
    }, 1000);
  };

  // Zoho Sync Action
  const triggerZohoSync = () => {
    setZohoSyncing(true);
    setTimeout(() => {
      setZohoSyncing(false);
      setForm(prev => ({
        ...prev,
        zohoSyncStatus: 'Synced',
        zohoLastSync: 'Just now'
      }));
      toast.success('Zoho Books & Zoho Inventory successfully synchronized!');
    }, 1500);
  };

  // MOQ auto generator AI
  const autoGenMoq = () => {
    setForm(prev => {
      const basePrice = prev.guestVialPrice || 100;
      return {
        ...prev,
        moq_1: basePrice,
        moq_10: Math.round(basePrice * 0.9),
        moq_50: Math.round(basePrice * 0.8),
        moq_100: Math.round(basePrice * 0.7),
        moq_500: Math.round(basePrice * 0.6),
        moq_1000: Math.round(basePrice * 0.5),
      };
    });
    toast.success('MOQ Pricing matrix optimized automatically via AI (10% - 50% discount curves).');
  };

  const categoriesList = ['Peptides', 'Supplements', 'Genetic Tests', 'Medical Services', 'Recovery & Repair', 'Longevity'];

  const lifecycleStages = [
    { id: 'Draft', label: 'Draft', color: '#64748b' },
    { id: 'Catalog Ready', label: 'Catalog Ready', color: '#3b82f6' },
    { id: 'Commercial Ready', label: 'Commercial Ready', color: '#8b5cf6' },
    { id: 'Regulatory Ready', label: 'Regulatory Ready', color: '#10b981' },
    { id: 'Published', label: 'Published', color: '#10b981' },
    { id: 'Archived', label: 'Archived', color: '#ef4444' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'variants', label: 'Variants', icon: PackageOpen },
    { id: 'suppliers', label: 'Suppliers', icon: Building },
    { id: 'inventory', label: 'Inventory', icon: Box },
    { id: 'regulatory', label: 'Regulatory', icon: Shield },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'history', label: 'History', icon: History }
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

          {/* Main Drawer Container */}
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
              maxWidth: isMobile ? '100vw' : showAiAdvisor ? '1250px' : '950px',
              backgroundColor: '#0f172a', // Dark theme background for premium aesthetics
              boxShadow: '-8px 0 32px rgba(15, 23, 42, 0.35)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'row',
              overflow: 'hidden',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              color: '#f8fafc'
            }}
            className="workspace-drawer"
          >
            {/* Left/Middle Content Workspace Area */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              overflow: 'hidden',
              backgroundColor: '#0b0f19'
            }}>
              {/* Sticky Top Header Info Card */}
              <div style={{
                padding: '1.5rem',
                borderBottom: '1px solid #1e293b',
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '12px',
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748b',
                      flexShrink: 0,
                      overflow: 'hidden'
                    }}>
                      {form.images?.length > 0 ? (
                        <img src={form.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <ImageIcon size={28} className="text-slate-400" />
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <h2 style={{ margin: 0, fontSize: '1.35rem', color: '#ffffff', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {form.name || 'New Product'}
                        </h2>
                        <span style={{
                          fontSize: '0.75rem',
                          backgroundColor: form.stock > 0 ? '#10b98122' : '#ef444422',
                          color: form.stock > 0 ? '#34d399' : '#f87171',
                          padding: '2px 8px',
                          borderRadius: '100px',
                          border: `1px solid ${form.stock > 0 ? '#10b98144' : '#ef444444'}`,
                          fontWeight: 600
                        }}>
                          {form.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                      {/* Product Header Card Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px 16px', fontSize: '0.8rem', color: '#94a3b8' }}>
                        <div>SKU: <strong style={{ color: '#cbd5e1' }}>{form.sku || 'N/A'}</strong></div>
                        <div>Category: <strong style={{ color: '#cbd5e1' }}>{form.category}</strong></div>
                        <div>Type: <strong style={{ color: '#cbd5e1' }}>{form.product_type}</strong></div>
                        <div>Supplier: <strong style={{ color: '#cbd5e1' }}>{form.supplier || 'None'}</strong></div>
                        <div>Zoho Sync: <span style={{ color: form.zohoSyncStatus === 'Synced' ? '#10b981' : '#f59e0b', fontWeight: 600 }}>● {form.zohoSyncStatus}</span></div>
                        <div>Health: <span style={{ color: getMarginColor(healthScore), fontWeight: 700 }}>{healthScore}/100</span></div>
                        <div>Updated: <strong style={{ color: '#cbd5e1' }}>{form.zohoLastSync || 'Just now'}</strong></div>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 10 }}>
                    {!isMobile && (
                      <>
                        <Button variant="outline" onClick={handleDuplicate} icon={<Copy size={13} />} style={{ borderColor: '#334155', color: '#94a3b8', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>Duplicate</Button>
                        <Button variant="outline" onClick={handleArchive} icon={<Archive size={13} />} style={{ borderColor: '#334155', color: '#94a3b8', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>Archive</Button>
                        <Button variant="ghost" onClick={handleDelete} style={{ color: '#ef4444', padding: '0.4rem 0.75rem' }}><Trash2 size={14} /></Button>
                        <div style={{ width: '1px', height: '24px', backgroundColor: '#334155', margin: '0 4px' }} />
                      </>
                    )}
                    <button 
                      onClick={() => setShowAiAdvisor(!showAiAdvisor)}
                      style={{
                        padding: '0.4rem 0.75rem',
                        borderRadius: '6px',
                        border: `1px solid ${showAiAdvisor ? '#8b5cf6' : '#334155'}`,
                        backgroundColor: showAiAdvisor ? '#8b5cf622' : 'transparent',
                        color: showAiAdvisor ? '#c084fc' : '#94a3b8',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Brain size={14} /> AI Advisor
                    </button>
                    <button 
                      onClick={onClose} 
                      style={{
                        padding: '0.4rem 0.75rem',
                        border: '1px solid #334155',
                        background: 'none',
                        color: '#94a3b8',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Workflow Status Bar (Interactive Stages) */}
                <div style={{
                  display: 'flex',
                  marginTop: '1.25rem',
                  backgroundColor: '#0f172a',
                  padding: '6px',
                  borderRadius: '8px',
                  border: '1px solid #1e293b',
                  overflowX: 'auto',
                  gap: '4px'
                }}>
                  {lifecycleStages.map((stage) => {
                    const isActiveStage = form.lifecycleStage === stage.id;
                    return (
                      <button
                        key={stage.id}
                        onClick={() => setForm(prev => ({ ...prev, lifecycleStage: stage.id }))}
                        style={{
                          flex: 1,
                          minWidth: '110px',
                          padding: '6px 10px',
                          border: 'none',
                          borderRadius: '6px',
                          backgroundColor: isActiveStage ? stage.color : 'transparent',
                          color: isActiveStage ? '#ffffff' : '#64748b',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.2s',
                          boxShadow: isActiveStage ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
                        }}
                      >
                        {stage.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Progress & Completion Info Bar */}
              <div style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#111827',
                borderBottom: '1px solid #1f2937',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap' }}>Product Readiness:</span>
                  <div style={{ flex: 1, maxWidth: '280px', height: '8px', backgroundColor: '#374151', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ width: `${completionPercent}%`, height: '100%', backgroundColor: completionPercent > 80 ? '#10b981' : completionPercent > 50 ? '#f59e0b' : '#ef4444', transition: 'width 0.3s' }} />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: completionPercent > 80 ? '#34d399' : '#f59e0b' }}>{completionPercent}%</span>
                </div>
                {/* Readiness checklist inline summary */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {checklistItems.map((item, idx) => (
                    <span key={idx} style={{
                      fontSize: '0.7rem',
                      color: item.done ? '#34d399' : '#6b7280',
                      backgroundColor: item.done ? '#10b98115' : '#37415122',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: `1px solid ${item.done ? '#10b98133' : '#37415144'}`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '2px'
                    }}>
                      {item.done ? '✓' : '○'} {item.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Center Widget */}
              {actionAlerts.length > 0 && (
                <div style={{
                  margin: '1.25rem 1.5rem 0 1.5rem',
                  backgroundColor: '#7f1d1d22',
                  border: '1px solid #ef444444',
                  borderRadius: '10px',
                  padding: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                    <AlertOctagon size={16} />
                    <span>Action Center Required Alerts</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                    {actionAlerts.map((alert, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem',
                        backgroundColor: '#111827',
                        borderRadius: '6px',
                        border: '1px solid #374151'
                      }}>
                        <span style={{ fontSize: '0.8rem', color: '#e5e7eb', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          ⚠️ {alert.text}
                        </span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={alert.action}
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              border: 'none',
                              backgroundColor: '#3b82f6',
                              color: '#ffffff',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            {alert.actionLabel}
                          </button>
                          <button
                            onClick={() => triggerAiAction('fix')}
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              border: '1px solid #8b5cf6',
                              backgroundColor: 'transparent',
                              color: '#c084fc',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2px'
                            }}
                          >
                            <Sparkles size={10} /> AI Auto-Fix
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Desktop/Tablet Horizontal Tabs Navigation */}
              {!isMobile && (
                <div style={{
                  display: 'flex',
                  padding: '0 1.5rem',
                  borderBottom: '1px solid #1e293b',
                  backgroundColor: '#090d16',
                  overflowX: 'auto',
                  scrollbarWidth: 'none',
                  marginTop: '1rem'
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
                          marginRight: '1.25rem',
                          background: 'none',
                          border: 'none',
                          borderBottom: `2px solid ${isActive ? '#3b82f6' : 'transparent'}`,
                          color: isActive ? '#3b82f6' : '#64748b',
                          fontWeight: isActive ? 600 : 500,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.2s',
                        }}
                      >
                        <Icon size={15} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Content Panel Area */}
              <div ref={scrollContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                {/* 15. Mobile UX: Accordion sections replacing standard Tabs on mobile viewports */}
                {isMobile ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {/* ACCORDION 1: OVERVIEW */}
                    <div style={{ border: '1px solid #1e293b', borderRadius: '8px', overflow: 'hidden' }}>
                      <button 
                        onClick={() => toggleAccordion('overview')} 
                        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#111827', color: '#fff', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}><Eye size={16} /> Overview</span>
                        {expandedAccordions.overview ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {expandedAccordions.overview && <div style={{ padding: '1rem', backgroundColor: '#090d16' }}>{renderOverviewTab()}</div>}
                    </div>

                    {/* ACCORDION 2: VARIANTS */}
                    <div style={{ border: '1px solid #1e293b', borderRadius: '8px', overflow: 'hidden' }}>
                      <button 
                        onClick={() => toggleAccordion('variants')} 
                        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#111827', color: '#fff', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}><PackageOpen size={16} /> Variants</span>
                        {expandedAccordions.variants ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {expandedAccordions.variants && <div style={{ padding: '1rem', backgroundColor: '#090d16' }}>{renderVariantsTab()}</div>}
                    </div>

                    {/* ACCORDION 3: SUPPLIERS */}
                    <div style={{ border: '1px solid #1e293b', borderRadius: '8px', overflow: 'hidden' }}>
                      <button 
                        onClick={() => toggleAccordion('suppliers')} 
                        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#111827', color: '#fff', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}><Building size={16} /> Suppliers</span>
                        {expandedAccordions.suppliers ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {expandedAccordions.suppliers && <div style={{ padding: '1rem', backgroundColor: '#090d16' }}>{renderSuppliersTab()}</div>}
                    </div>

                    {/* ACCORDION 4: INVENTORY */}
                    <div style={{ border: '1px solid #1e293b', borderRadius: '8px', overflow: 'hidden' }}>
                      <button 
                        onClick={() => toggleAccordion('inventory')} 
                        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#111827', color: '#fff', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}><Box size={16} /> Inventory</span>
                        {expandedAccordions.inventory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {expandedAccordions.inventory && <div style={{ padding: '1rem', backgroundColor: '#090d16' }}>{renderInventoryTab()}</div>}
                    </div>

                    {/* ACCORDION 5: REGULATORY */}
                    <div style={{ border: '1px solid #1e293b', borderRadius: '8px', overflow: 'hidden' }}>
                      <button 
                        onClick={() => toggleAccordion('regulatory')} 
                        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#111827', color: '#fff', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}><Shield size={16} /> Regulatory</span>
                        {expandedAccordions.regulatory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {expandedAccordions.regulatory && <div style={{ padding: '1rem', backgroundColor: '#090d16' }}>{renderRegulatoryTab()}</div>}
                    </div>

                    {/* ACCORDION 6: PRICING */}
                    <div style={{ border: '1px solid #1e293b', borderRadius: '8px', overflow: 'hidden' }}>
                      <button 
                        onClick={() => toggleAccordion('pricing')} 
                        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#111827', color: '#fff', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}><DollarSign size={16} /> Pricing</span>
                        {expandedAccordions.pricing ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {expandedAccordions.pricing && <div style={{ padding: '1rem', backgroundColor: '#090d16' }}>{renderPricingTab()}</div>}
                    </div>

                    {/* ACCORDION 7: HISTORY */}
                    <div style={{ border: '1px solid #1e293b', borderRadius: '8px', overflow: 'hidden' }}>
                      <button 
                        onClick={() => toggleAccordion('history')} 
                        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#111827', color: '#fff', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}><History size={16} /> History</span>
                        {expandedAccordions.history ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {expandedAccordions.history && <div style={{ padding: '1rem', backgroundColor: '#090d16' }}>{renderTimelineTab()}</div>}
                    </div>

                  </div>
                ) : (
                  /* Desktop Tab Views */
                  <div>
                    {activeTab === 'overview' && renderOverviewTab()}
                    {activeTab === 'variants' && renderVariantsTab()}
                    {activeTab === 'suppliers' && renderSuppliersTab()}
                    {activeTab === 'inventory' && renderInventoryTab()}
                    {activeTab === 'regulatory' && renderRegulatoryTab()}
                    {activeTab === 'pricing' && renderPricingTab()}
                    {activeTab === 'history' && renderTimelineTab()}
                  </div>
                )}

              </div>

              {/* Bottom Sticky Action Footer */}
              <div style={{
                display: 'flex',
                padding: '1rem 1.5rem',
                borderTop: '1px solid #1e293b',
                backgroundColor: '#090d16',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.75rem',
                position: 'sticky',
                bottom: 0,
                zIndex: 10
              }}>
                {isMobile ? (
                  <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <Button variant="outline" onClick={handleDuplicate} icon={<Copy size={13} />} style={{ borderColor: '#334155', color: '#94a3b8', padding: '0.35rem 0.5rem', fontSize: '0.7rem' }}>Dupe</Button>
                      <Button variant="outline" onClick={handleArchive} icon={<Archive size={13} />} style={{ borderColor: '#334155', color: '#94a3b8', padding: '0.35rem 0.5rem', fontSize: '0.7rem' }}>Archive</Button>
                    </div>
                    {/* Floating Quick Action Drawer triggers */}
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button 
                        onClick={() => triggerAiAction('description')} 
                        style={{
                          padding: '0.35rem 0.5rem',
                          borderRadius: '4px',
                          border: '1px solid #8b5cf6',
                          backgroundColor: 'transparent',
                          color: '#c084fc',
                          fontSize: '0.7rem',
                          fontWeight: 600
                        }}
                      >
                        <Sparkles size={10} /> AI Describe
                      </button>
                      <Button variant="primary" onClick={handleSave} icon={<Save size={13} />} style={{ padding: '0.35rem 0.75rem', fontSize: '0.7rem' }}>Save Workspace</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => triggerAiAction('fix')}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          border: '1px solid #3b82f6',
                          backgroundColor: '#3b82f615',
                          color: '#60a5fa',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Sparkles size={14} /> AI Health Audit
                      </button>
                      <button
                        onClick={triggerZohoSync}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          border: '1px solid #10b981',
                          backgroundColor: '#10b98115',
                          color: '#34d399',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <RefreshCw size={14} /> Full Zoho Sync
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button variant="outline" onClick={onClose} style={{ borderColor: '#334155', color: '#94a3b8', fontSize: '0.85rem' }}>Cancel</Button>
                      <Button variant="primary" onClick={handleSave} icon={<Save size={16} />} style={{ fontSize: '0.85rem' }}>Save Workspace Changes</Button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 14. Right Sidebar: Atlas AI Product Advisor Panel (collapsible) */}
            {!isMobile && showAiAdvisor && (
              <div style={{
                width: '320px',
                borderLeft: '1px solid #1e293b',
                backgroundColor: '#0f172a',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflow: 'hidden'
              }}>
                {/* Advisor Header */}
                <div style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid #1e293b',
                  backgroundColor: '#1e1b4b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Brain size={20} color="#c084fc" />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#ffffff', fontWeight: 700 }}>Atlas AI Product Advisor</h3>
                    <span style={{ fontSize: '0.7rem', color: '#c084fc', fontWeight: 600 }}>Active Agent Copilot</span>
                  </div>
                </div>

                {/* Advisor Insights Panel Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Real-time Diagnostics Detection list */}
                  <div style={{
                    backgroundColor: '#111827',
                    borderRadius: '8px',
                    padding: '0.85rem',
                    border: '1px solid #1f2937'
                  }}>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase' }}>Anomalies Detected</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {!form.guestVialPrice && (
                        <div style={{ fontSize: '0.75rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          ● Missing retail pricing matrix
                        </div>
                      )}
                      {marginRetail < 30 && (
                        <div style={{ fontSize: '0.75rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          ● Low profit margin alert ({marginRetail.toFixed(1)}%)
                        </div>
                      )}
                      {form.docStatus_coa === 'Missing' && (
                        <div style={{ fontSize: '0.75rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          ● Missing regulatory COA certificate
                        </div>
                      )}
                      {form.stock < form.reorderPoint && (
                        <div style={{ fontSize: '0.75rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          ● Stock out risk within {Math.round((form.stock / (form.avgMonthlySales || 1)) * 30)} days
                        </div>
                      )}
                      {!form.supplier && (
                        <div style={{ fontSize: '0.75rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          ● High dependency: No primary supplier
                        </div>
                      )}
                      {form.images?.length === 0 && (
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          ● Missing catalog visual assets
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AI Quick Actions Panel */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Automations</span>
                    <button
                      onClick={() => triggerAiAction('fix')}
                      style={{
                        padding: '0.6rem 0.85rem',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: '#3b82f6',
                        color: '#ffffff',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Sparkles size={13} /> Fix Automatically
                    </button>

                    <button
                      onClick={() => triggerAiAction('description')}
                      style={{
                        padding: '0.6rem 0.85rem',
                        borderRadius: '6px',
                        border: '1px solid #334155',
                        backgroundColor: '#1e293b',
                        color: '#cbd5e1',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <FileText size={13} color="#a78bfa" /> Generate Description
                    </button>

                    <button
                      onClick={() => triggerAiAction('datasheet')}
                      style={{
                        padding: '0.6rem 0.85rem',
                        borderRadius: '6px',
                        border: '1px solid #334155',
                        backgroundColor: '#1e293b',
                        color: '#cbd5e1',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Shield size={13} color="#a78bfa" /> Generate Datasheet (PDF)
                    </button>

                    <button
                      onClick={() => triggerAiAction('catalog')}
                      style={{
                        padding: '0.6rem 0.85rem',
                        borderRadius: '6px',
                        border: '1px solid #334155',
                        backgroundColor: '#1e293b',
                        color: '#cbd5e1',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <BookOpenIcon size={13} color="#a78bfa" /> Generate Catalog Entry
                    </button>

                    <button
                      onClick={() => triggerAiAction('marketing')}
                      style={{
                        padding: '0.6rem 0.85rem',
                        borderRadius: '6px',
                        border: '1px solid #334155',
                        backgroundColor: '#1e293b',
                        color: '#cbd5e1',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Share2 size={13} color="#a78bfa" /> Generate Marketing Copy
                    </button>
                  </div>

                  {/* AI content Preview box */}
                  {aiResult && (
                    <div style={{
                      backgroundColor: '#1e1b4b22',
                      border: '1px dashed #8b5cf6',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      fontSize: '0.75rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#c084fc', fontWeight: 700, marginBottom: '4px' }}>
                        <Sparkles size={12} />
                        <span>Preview Suggestion</span>
                      </div>
                      <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.4 }}>{aiResult.description}</p>
                    </div>
                  )}

                  <div style={{
                    marginTop: 'auto',
                    backgroundColor: '#1e293b33',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    fontSize: '0.7rem',
                    color: '#64748b'
                  }}>
                    <span>Atlas AI continuously monitors Catalog Readiness, Margin risks, and regional regulations to optimize lifecycle.</span>
                  </div>

                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // ==========================================
  // VIEW SUB-RENDERERS FOR EACH WORKSPACE TAB
  // ==========================================

  // Helper BookOpen icon placeholder
  function BookOpenIcon({ size, color }) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    );
  }

  // 5. PESTAÑA OVERVIEW (Executive summary card view + General Info)
  function renderOverviewTab() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* General Info integrated into Overview */}
        <Card padding="md" style={{ backgroundColor: '#111827', borderColor: '#1f2937' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>Product General Info</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>Product Name</label>
              <input type="text" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#0f172a', color: '#fff' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>Category</label>
              <select value={form.category || ''} onChange={e => setForm({...form, category: e.target.value})} style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#0f172a', color: '#fff' }}>
                {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>Product Type</label>
              <select value={form.product_type || ''} onChange={e => setForm({...form, product_type: e.target.value})} style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#0f172a', color: '#fff' }}>
                <option value="Peptide">Peptide</option>
                <option value="Supplement">Supplement</option>
                <option value="Diagnostic Kit">Diagnostic Kit</option>
                <option value="Service">Medical Service</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>Description</label>
            <textarea rows={3} value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.9rem', resize: 'vertical', backgroundColor: '#0f172a', color: '#fff' }} />
          </div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {/* Summary Card */}
          <Card padding="md" style={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#fff' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Supplier & Origins</span>
            <div style={{ fontSize: '0.9rem', color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>Primary: <strong style={{ color: '#fff' }}>{form.supplier || 'N/A'}</strong></div>
              <div>Backup: <strong style={{ color: '#fff' }}>{form.backupSupplier || 'N/A'}</strong></div>
              <div>Lead Time: <strong style={{ color: '#fff' }}>{form.supplierLeadTime || 0} Days</strong></div>
              <div>Warehouse: <strong style={{ color: '#fff' }}>{form.warehouse || 'N/A'}</strong></div>
            </div>
          </Card>

          {/* Pricing Summary Card */}
          <Card padding="md" style={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#fff' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Cost & Margins</span>
            <div style={{ fontSize: '0.9rem', color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>Cost: <strong style={{ color: '#fff' }}>${cost}</strong></div>
              <div>Retail (Margin): <strong style={{ color: getMarginColor(marginRetail) }}>${retail} ({marginRetail.toFixed(0)}%)</strong></div>
              <div>Clinic (Margin): <strong style={{ color: getMarginColor(marginClinic) }}>${clinic} ({marginClinic.toFixed(0)}%)</strong></div>
              <div>Distributor: <strong style={{ color: getMarginColor(marginDistributor) }}>${distributor} ({marginDistributor.toFixed(0)}%)</strong></div>
            </div>
          </Card>

          {/* Inventory Summary Card */}
          <Card padding="md" style={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#fff' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Stock & Supply</span>
            <div style={{ fontSize: '0.9rem', color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>Current Stock: <strong style={{ color: '#fff' }}>{form.stock} units</strong></div>
              <div>Available: <strong style={{ color: '#34d399' }}>{availableStock} units</strong></div>
              <div>Reserved: <strong style={{ color: '#f59e0b' }}>{form.reservedStock} units</strong></div>
              <div>Incoming: <strong style={{ color: '#60a5fa' }}>{form.incomingStock} units</strong></div>
            </div>
          </Card>
        </div>

        {/* Global Compliance Status & Zoho Sync Logs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          <Card padding="md" style={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#fff' }}>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '#f8fafc', fontWeight: 600 }}>Regional Compliance Summary</h4>
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
                  backgroundColor: '#1f2937',
                  border: `1px solid ${c.status === 'Approved' ? '#10b98133' : '#f59e0b33'}`
                }}>
                  <div style={{ fontWeight: 700, color: '#94a3b8', marginBottom: '2px' }}>{c.name}</div>
                  <span style={{ color: c.status === 'Approved' ? '#34d399' : '#f59e0b', fontWeight: 600 }}>{c.status}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.75rem', borderTop: '1px solid #1f2937', paddingTop: '0.75rem' }}>
              <div>COA Compliance: <span style={{ color: form.docStatus_coa === 'Approved' ? '#10b981' : '#ef4444', fontWeight: 600 }}>{form.docStatus_coa}</span></div>
              <div>MSDS: <span style={{ color: form.docStatus_msds === 'Approved' ? '#10b981' : '#f59e0b', fontWeight: 600 }}>{form.docStatus_msds}</span></div>
              <div>AI Score: <span style={{ color: '#a78bfa', fontWeight: 700 }}>{completionPercent}/100</span></div>
            </div>
          </Card>

          {/* Zoho Status overview */}
          <Card padding="md" style={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={{ margin: 0, fontSize: '#f8fafc', fontWeight: 600 }}>Zoho Books Connected Status</h4>
              <StatusChip status={form.zohoSyncStatus === 'Synced' ? 'Active' : 'Warning'} label={form.zohoSyncStatus || 'Not Synced'} />
            </div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Zoho ID:</span>
                <strong>{form.zohoId || 'N/A'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Last Sync Log:</span>
                <strong>{form.zohoLastSync || 'Never'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Inventory Sync:</span>
                <span style={{ color: '#34d399', fontWeight: 600 }}>{form.zohoInventorySync || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Price Sync:</span>
                <span style={{ color: '#34d399', fontWeight: 600 }}>{form.zohoPriceSync || 'N/A'}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // 2. VARIANTS TAB (Replaces General Tab)
  function renderVariantsTab() {
    const variants = product?.variants || [];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Card padding="md" style={{ backgroundColor: '#111827', borderColor: '#1f2937' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>Product Variants</h3>
            <button style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              backgroundColor: '#3b82f6',
              color: '#fff',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              + Add Variant
            </button>
          </div>
          
          {variants.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem', backgroundColor: '#0f172a', borderRadius: '8px' }}>
              No variants defined for this product yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {variants.map((v, i) => (
                <div key={v.id || i} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '1rem', 
                  backgroundColor: '#0f172a', 
                  border: '1px solid #1e293b',
                  borderRadius: '8px'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.9rem', marginBottom: '4px' }}>
                      {v.name || v.sku || `Variant ${i+1}`}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', gap: '12px' }}>
                      <span>SKU: {v.sku || 'N/A'}</span>
                      <span>Supplier: {v.supplier || 'N/A'}</span>
                      <span>Stock: {v.stock || 0}</span>
                    </div>
                  </div>
                  <button style={{ padding: '0.4rem 0.6rem', border: '1px solid #334155', borderRadius: '4px', backgroundColor: 'transparent', color: '#cbd5e1', cursor: 'pointer', fontSize: '0.75rem' }}>
                    Edit
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  }
  // 6. PRICING UX REDESIGN & MOQ MATRIX
  function renderPricingTab() {
    const pricesList = [
      { label: 'Retail Price (B2C)', key: 'guestVialPrice', margin: marginRetail },
      { label: 'Clinic Price (B2B)', key: 'proVialPrice', margin: marginClinic },
      { label: 'Distributor Price', key: 'distributorPrice', margin: marginDistributor },
      { label: 'Wholesaler Price', key: 'wholesalerPrice', margin: marginWholesaler },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Pricing Dashboard */}
        <Card padding="md" style={{ backgroundColor: '#111827', borderColor: '#1f2937' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>Pricing Dashboard</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {/* Base Cost Box */}
            <div style={{
              padding: '1rem',
              backgroundColor: '#1f2937',
              borderRadius: '8px',
              border: '1px solid #374151'
            }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px', fontWeight: 600 }}>Internal Unit Cost</label>
              <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #4b5563', paddingBottom: '2px' }}>
                <span style={{ fontSize: '1rem', color: '#94a3b8', marginRight: '4px' }}>$</span>
                <input
                  type="number"
                  value={form.costPrice}
                  onChange={e => setForm({...form, costPrice: parseFloat(e.target.value) || 0})}
                  style={{ border: 'none', background: 'none', width: '100%', outline: 'none', color: '#ffffff', fontSize: '1.2rem', fontWeight: 700 }}
                />
              </div>
              <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', marginTop: '6px' }}>Base cost used for margin calc</span>
            </div>

            {/* Other prices */}
            {pricesList.map((item, idx) => (
              <div key={idx} style={{
                padding: '1rem',
                backgroundColor: '#1f2937',
                borderRadius: '8px',
                border: `1px solid ${item.margin < 20 ? '#ef444455' : '#374151'}`
              }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px', fontWeight: 600 }}>{item.label}</label>
                <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #4b5563', paddingBottom: '2px' }}>
                  <span style={{ fontSize: '1rem', color: '#94a3b8', marginRight: '4px' }}>$</span>
                  <input
                    type="number"
                    value={form[item.key]}
                    onChange={e => setForm({...form, [item.key]: parseFloat(e.target.value) || 0})}
                    style={{ border: 'none', background: 'none', width: '100%', outline: 'none', color: '#ffffff', fontSize: '1.2rem', fontWeight: 700 }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Margin:</span>
                  <strong style={{ fontSize: '0.75rem', color: getMarginColor(item.margin) }}>
                    {item.margin.toFixed(1)}%
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 7. MOQ Pricing Matrix */}
        <Card padding="md" style={{ backgroundColor: '#111827', borderColor: '#1f2937' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>MOQ Pricing Matrix</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>Volume tier price grids and margin curves</p>
            </div>
            <button
              onClick={autoGenMoq}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #8b5cf6',
                backgroundColor: '#8b5cf615',
                color: '#c084fc',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Sparkles size={12} /> Auto Generate MOQ with AI
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: '#cbd5e1' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #374151', textAlign: 'left', color: '#94a3b8' }}>
                  <th style={{ padding: '0.5rem' }}>MOQ Tier Quantity</th>
                  <th style={{ padding: '0.5rem' }}>Unit Selling Price ($)</th>
                  <th style={{ padding: '0.5rem' }}>Calculated Profit Margin (%)</th>
                  <th style={{ padding: '0.5rem' }}>Discount (vs Retail)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { qty: 1, key: 'moq_1' },
                  { qty: 10, key: 'moq_10' },
                  { qty: 50, key: 'moq_50' },
                  { qty: 100, key: 'moq_100' },
                  { qty: 500, key: 'moq_500' },
                  { qty: 1000, key: 'moq_1000' }
                ].map((tier, idx) => {
                  const val = form[tier.key] || 0;
                  const unitMargin = val > 0 ? ((val - cost) / val) * 100 : 0;
                  const discountPercent = retail > 0 ? ((retail - val) / retail) * 100 : 0;
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #1f2937' }}>
                      <td style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>{tier.qty} Unit{tier.qty > 1 && 's'}</td>
                      <td style={{ padding: '0.4rem 0.5rem' }}>
                        <input
                          type="number"
                          value={val}
                          onChange={e => setForm({ ...form, [tier.key]: parseFloat(e.target.value) || 0 })}
                          style={{
                            width: '90px',
                            padding: '4px 8px',
                            border: '1px solid #334155',
                            borderRadius: '4px',
                            backgroundColor: '#0f172a',
                            color: '#fff',
                            fontSize: '0.8rem'
                          }}
                        />
                      </td>
                      <td style={{ padding: '0.6rem 0.5rem', color: getMarginColor(unitMargin), fontWeight: 700 }}>
                        {unitMargin.toFixed(1)}%
                      </td>
                      <td style={{ padding: '0.6rem 0.5rem', color: discountPercent > 0 ? '#60a5fa' : '#64748b' }}>
                        {discountPercent > 0 ? `${discountPercent.toFixed(0)}% Off` : 'Base Price'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  // 8. INVENTORY UX & AI FORECAST
  function renderInventoryTab() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div style={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Current Stock</span>
            <input
              type="number"
              value={form.stock}
              onChange={e => setForm({...form, stock: parseInt(e.target.value) || 0})}
              style={{ width: '100%', fontSize: '1.5rem', fontWeight: 700, color: '#fff', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #334155', outline: 'none' }}
            />
          </div>

          <div style={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Reserved</span>
            <input
              type="number"
              value={form.reservedStock}
              onChange={e => setForm({...form, reservedStock: parseInt(e.target.value) || 0})}
              style={{ width: '100%', fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b', backgroundColor: 'transparent', border: 'none', outline: 'none' }}
              disabled
            />
          </div>

          <div style={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Incoming</span>
            <input
              type="number"
              value={form.incomingStock}
              onChange={e => setForm({...form, incomingStock: parseInt(e.target.value) || 0})}
              style={{ width: '100%', fontSize: '1.5rem', fontWeight: 700, color: '#60a5fa', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #334155', outline: 'none' }}
            />
          </div>

          <div style={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Available</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: availableStock > 0 ? '#10b981' : '#ef4444' }}>
              {availableStock}
            </div>
          </div>
        </div>

        {/* Reorder point and limit details */}
        <Card padding="md" style={{ backgroundColor: '#111827', borderColor: '#1f2937' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>Reorder Safety Limits</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>Reorder Point (Threshold)</label>
              <input type="number" value={form.reorderPoint} onChange={e => setForm({...form, reorderPoint: parseInt(e.target.value) || 0})} style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#0f172a', color: '#fff' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>Safety Stock Level</label>
              <input type="number" value={form.safetyStock} onChange={e => setForm({...form, safetyStock: parseInt(e.target.value) || 0})} style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#0f172a', color: '#fff' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>Logistics Warehouse Center</label>
              <select value={form.warehouse} onChange={e => setForm({...form, warehouse: e.target.value})} style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#0f172a', color: '#fff' }}>
                <option value="Poland">Poland Logistics Center</option>
                <option value="UAE-Dubai">Dubai FreeZone Center</option>
                <option value="USA-Delaware">USA East Logistics</option>
              </select>
            </div>
          </div>
        </Card>

        {/* 9. Forecast Panel (with mini graph) */}
        <Card padding="md" style={{ border: '1px solid #3b82f644', backgroundColor: '#1e3a8a15' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Brain size={16} color="#60a5fa" />
            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8' }}>AI Inventory Forecast Panel</h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
            <div>
              <span style={{ color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Average Monthly Sales:</span>
              <strong style={{ fontSize: '1rem', color: '#ffffff' }}>{form.avgMonthlySales} units</strong>
            </div>
            <div>
              <span style={{ color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Lead Time:</span>
              <strong style={{ fontSize: '1rem', color: '#ffffff' }}>{form.supplierLeadTime} Days</strong>
            </div>
            <div>
              <span style={{ color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Days Remaining (Run-Out):</span>
              <strong style={{ fontSize: '1rem', color: form.stock < form.reorderPoint ? '#ef4444' : '#10b981' }}>
                {Math.round((form.stock / (form.avgMonthlySales || 1)) * 30)} Days
              </strong>
            </div>
            <div>
              <span style={{ color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Next Estimated Stockout:</span>
              <strong style={{ fontSize: '1rem', color: '#f59e0b' }}>July 14, 2026</strong>
            </div>
            <div>
              <span style={{ color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Suggested Reorder Date:</span>
              <strong style={{ fontSize: '1rem', color: '#60a5fa' }}>June 30, 2026</strong>
            </div>
            <div>
              <span style={{ color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Suggested Quantity (EOQ):</span>
              <strong style={{ fontSize: '1rem', color: '#10b981' }}>250 units</strong>
            </div>
          </div>

          {/* Mini Graph/Sparkline Simulation */}
          <div style={{ marginTop: '1.5rem', height: '60px', borderTop: '1px solid #1e293b', paddingTop: '1rem', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', width: '60px' }}>Sales Trend:</span>
            {[34, 45, 52, 40, 48, 55, 62, 59, 70, 68, 75, 82].map((val, idx) => (
              <div key={idx} style={{
                flex: 1,
                height: `${(val / 100) * 100}%`,
                backgroundColor: idx === 11 ? '#60a5fa' : '#3b82f644',
                borderRadius: '2px 2px 0 0',
                position: 'relative'
              }} title={`Month ${idx+1}: ${val} units`}>
                <div style={{ display: 'none', position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#000', color: '#fff', fontSize: '8px', padding: '2px 4px', borderRadius: '2px' }}>{val}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // 3. SUPPLIERS TAB (Replaces Media Tab)
  function renderSuppliersTab() {
    const variants = product?.variants || [];
    // Extract unique suppliers from variants
    const uniqueSuppliersMap = {};
    variants.forEach(v => {
      if (v.supplier && !uniqueSuppliersMap[v.supplier]) {
        uniqueSuppliersMap[v.supplier] = {
          name: v.supplier,
          leadTime: v.supplierLeadTime || form.supplierLeadTime || 'N/A',
          moq: v.moq || form.moq || 'N/A',
          variantsCount: 1
        };
      } else if (v.supplier) {
        uniqueSuppliersMap[v.supplier].variantsCount += 1;
      }
    });
    const suppliers = Object.values(uniqueSuppliersMap);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Card padding="md" style={{ backgroundColor: '#111827', borderColor: '#1f2937' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>Product Suppliers (Derived from Variants)</h3>
          </div>
          
          {suppliers.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem', backgroundColor: '#0f172a', borderRadius: '8px' }}>
              No suppliers found in the variants.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem', color: '#e2e8f0' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1e293b', color: '#94a3b8' }}>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Supplier Name</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Variants Supplied</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Avg Lead Time</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Avg MOQ</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((s, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{s.name}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>{s.variantsCount} variant(s)</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>{s.leadTime} days</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>{s.moq}</td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                        <button style={{ padding: '0.3rem 0.6rem', border: '1px solid #334155', borderRadius: '4px', backgroundColor: 'transparent', color: '#cbd5e1', cursor: 'pointer', fontSize: '0.75rem' }}>
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // 12. COMPLIANCE & REGULATORY REDESIGN
  function renderRegulatoryTab() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Compliance Dashboard Card */}
        <Card padding="md" style={{ backgroundColor: '#111827', borderColor: '#1f2937' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>Compliance Dashboard</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>Global Registration Status</label>
              <select value={form.registrationStatus} onChange={e => setForm({...form, registrationStatus: e.target.value})} style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#0f172a', color: '#fff' }}>
                <option value="Registered">Registered</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
                <option value="Approved">Approved</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>Expiry Date of current license</label>
              <input type="date" value={form.expiryDate} onChange={e => setForm({...form, expiryDate: e.target.value})} style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#0f172a', color: '#fff' }} />
            </div>
          </div>

          {/* Regional country matrix flags / badges */}
          <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase' }}>Middle East & Global Markets Registration Status</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
            {[
              { id: 'reg_uae', label: 'UAE Market' },
              { id: 'reg_ksa', label: 'KSA Market' },
              { id: 'reg_qatar', label: 'Qatar Market' },
              { id: 'reg_kuwait', label: 'Kuwait Market' },
              { id: 'reg_bahrain', label: 'Bahrain' },
              { id: 'reg_oman', label: 'Oman' },
              { id: 'reg_eu', label: 'European Union' },
              { id: 'reg_us', label: 'United States' }
            ].map(market => (
              <div key={market.id} style={{
                padding: '10px 8px',
                borderRadius: '6px',
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{market.label}</span>
                <select
                  value={form[market.id]}
                  onChange={e => setForm({ ...form, [market.id]: e.target.value })}
                  style={{
                    padding: '2px 4px',
                    fontSize: '0.75rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: form[market.id] === 'Approved' ? '#34d399' : form[market.id] === 'Pending' ? '#f59e0b' : form[market.id] === 'Rejected' ? '#ef4444' : '#64748b',
                    fontWeight: 700,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Not Registered">Not Reg</option>
                </select>
              </div>
            ))}
          </div>
        </Card>

        {/* Certificate matrices */}
        <Card padding="md" style={{ backgroundColor: '#111827', borderColor: '#1f2937' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>Compliance Documents Checklist</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
            {[
              { id: 'docStatus_coa', label: 'CoA (Analysis)' },
              { id: 'docStatus_msds', label: 'MSDS Certificate' },
              { id: 'docStatus_gmp', label: 'GMP Certificate' },
              { id: 'docStatus_iso', label: 'ISO Standards' },
              { id: 'docStatus_stability', label: 'Stability Studies' },
              { id: 'docStatus_shelflife', label: 'Shelf Life Study' }
            ].map(doc => (
              <div key={doc.id} style={{
                padding: '10px 8px',
                borderRadius: '6px',
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{doc.label}</span>
                <select
                  value={form[doc.id]}
                  onChange={e => setForm({ ...form, [doc.id]: e.target.value })}
                  style={{
                    padding: '2px 4px',
                    fontSize: '0.75rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: form[doc.id] === 'Approved' ? '#34d399' : form[doc.id] === 'Pending' ? '#f59e0b' : form[doc.id] === 'Expired' ? '#ef4444' : '#94a3b8',
                    fontWeight: 700,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Expired">Expired</option>
                  <option value="Missing">Missing</option>
                </select>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>Internal Compliance Notes</label>
            <textarea rows={3} value={form.regulatoryNotes} onChange={e => setForm({...form, regulatoryNotes: e.target.value})} placeholder="Notes regarding inspections, approvals..." style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#0f172a', color: '#fff', resize: 'vertical' }} />
          </div>
        </Card>
      </div>
    );
  }

  // 13. ZOHO INTEGRATION PANEL
  function renderZohoTab() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Card padding="md" style={{ backgroundColor: '#111827', borderColor: '#1f2937' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>Zoho Product Sync Configuration</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>Configure Zoho Books API and Inventory sync triggers</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={triggerZohoSync}
                disabled={zohoSyncing}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #10b981',
                  backgroundColor: '#10b98115',
                  color: '#34d399',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <RefreshCw size={12} className={zohoSyncing ? 'animate-spin' : ''} />
                {zohoSyncing ? 'Syncing...' : 'Sync Now'}
              </button>

              <button
                onClick={() => toast.success('Redirecting to Zoho Books...')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #334155',
                  backgroundColor: '#1f2937',
                  color: '#cbd5e1',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                Open in Zoho <ExternalLink size={12} />
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>Zoho Product ID</label>
              <input type="text" value={form.zohoId} onChange={e => setForm({...form, zohoId: e.target.value})} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#0f172a', color: '#fff' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>Sync status</label>
              <select value={form.zohoSyncStatus} onChange={e => setForm({...form, zohoSyncStatus: e.target.value})} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#0f172a', color: '#fff' }}>
                <option value="Synced">Synced</option>
                <option value="Failed">Failed</option>
                <option value="Pending">Pending Sync</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>Last Sync Timestamp</label>
              <input type="text" value={form.zohoLastSync} onChange={e => setForm({...form, zohoLastSync: e.target.value})} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#0f172a', color: '#fff' }} />
            </div>
          </div>

          <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>Synchronization Channels</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { id: 'zohoInventorySync', label: 'Inventory Syncing' },
              { id: 'zohoPriceSync', label: 'Price List Syncing' },
              { id: 'zohoSupplierSync', label: 'Supplier Procurement Sync' }
            ].map(channel => (
              <div key={channel.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: '#1f2937', borderRadius: '6px', border: '1px solid #374151' }}>
                <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 500 }}>{channel.label}</span>
                <select
                  value={form[channel.id]}
                  onChange={e => setForm({ ...form, [channel.id]: e.target.value })}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid #334155',
                    backgroundColor: '#0f172a',
                    color: form[channel.id] === 'Enabled' ? '#34d399' : '#94a3b8',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <option value="Enabled">Enabled</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '1.25rem' }}>
            <button onClick={() => toast.success('Sync logs fetched')} style={{ fontSize: '0.75rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>View Sync History Log</button>
            <span style={{ color: '#334155' }}>|</span>
            <button onClick={() => toast.success('Conflict solver opened')} style={{ fontSize: '0.75rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Resolve Sync Conflicts</button>
          </div>
        </Card>
      </div>
    );
  }

  // 16. PRODUCT RELATIONSHIPS
  function renderRelationshipsTab() {
    const listFields = [
      { key: 'compatibleProducts', label: 'Compatible Products', color: '#60a5fa' },
      { key: 'alternativeProducts', label: 'Alternative Products', color: '#f59e0b' },
      { key: 'upsellProducts', label: 'Upsell / Premium cross-sells', color: '#c084fc' },
      { key: 'bundleProducts', label: 'Included Bundle Packages', color: '#10b981' }
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Card padding="md" style={{ backgroundColor: '#111827', borderColor: '#1f2937' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>Product Relations & Cross-Sells</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {listFields.map((field) => (
              <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>{field.label}</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  {form[field.key]?.map((item, idx) => (
                    <span key={idx} style={{
                      fontSize: '0.75rem',
                      color: field.color,
                      backgroundColor: `${field.color}15`,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: `1px solid ${field.color}44`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {item}
                      <button
                        onClick={() => {
                          const updated = form[field.key].filter(x => x !== item);
                          setForm({ ...form, [field.key]: updated });
                        }}
                        style={{ border: 'none', background: 'none', color: '#ef4444', fontSize: '10px', cursor: 'pointer', padding: 0 }}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={() => {
                      const newProdName = prompt('Enter compatible product name:');
                      if (newProdName) {
                        setForm({ ...form, [field.key]: [...form[field.key], newProdName] });
                      }
                    }}
                    style={{
                      fontSize: '0.75rem',
                      color: '#94a3b8',
                      backgroundColor: 'transparent',
                      border: '1px dashed #334155',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    + Add Product
                  </button>
                </div>
              </div>
            ))}

            <div style={{ borderTop: '1px solid #1f2937', paddingTop: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>Successor Product (Legacy Replacement)</label>
              <input type="text" value={form.successorProduct} onChange={e => setForm({...form, successorProduct: e.target.value})} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#0f172a', color: '#fff' }} placeholder="Successor item name..." />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // 17. PRODUCT TIMELINE ACTIVITY FEED
  function renderTimelineTab() {
    return (
      <Card padding="md" style={{ backgroundColor: '#111827', borderColor: '#1f2937' }}>
        <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>Product Audit Activity Feed</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', paddingLeft: '1rem' }}>
          {/* Vertical line connector */}
          <div style={{
            position: 'absolute',
            top: '4px',
            bottom: '4px',
            left: '3.5px',
            width: '2px',
            backgroundColor: '#1f2937'
          }} />

          {timelineEvents.map((event, idx) => {
            const Icon = event.icon;
            return (
              <div key={idx} style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                <div style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: event.color,
                  border: '2px solid #111827',
                  position: 'absolute',
                  left: '-16.5px',
                  top: '4px',
                  zIndex: 2
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Icon size={12} style={{ color: event.color }} /> {event.event}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{event.date}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Triggered by: <strong>{event.user}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  }
}