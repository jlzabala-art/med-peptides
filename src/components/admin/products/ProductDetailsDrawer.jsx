"use client";

import React, { useState, useEffect } from 'react';
import OverviewTab from './tabs/OverviewTab';
import VariantsTab from './tabs/VariantsTab';
import PricingTab from './tabs/PricingTab';
import InventoryTab from './tabs/InventoryTab';
import SuppliersTab from './tabs/SuppliersTab';
import RegulatoryTab from './tabs/RegulatoryTab';
import TimelineTab from './tabs/TimelineTab';
import { motion, AnimatePresence } from 'framer-motion';



































import { Button, StatusChip, Card } from '../../ui';
import { doc, updateDoc, deleteDoc, addDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import * as fb from '../../../firebase';
const db = fb?.db;
import { createProduct, updateProduct, deleteProduct } from '../../../repositories/productRepository';
import { useToast } from '../../../hooks/useToast';
import { useAlgoliaSearch } from '../../../hooks/data/useAlgoliaSearch';
import notifier from '../../../services/NotificationService';
import { logAction } from '../../../services/auditLogger';
import { X, Save, Edit3, Settings, DollarSign, PackageOpen, Box, Building, ImageIcon, Shield, Share2, Trash2, Copy, Archive, Award, FileText, CheckCircle2, AlertTriangle, Sparkles, UploadCloud, Brain, Globe, Plus, Trash, Eye, Activity, Link, History, Check, RefreshCw, TrendingUp, ChevronDown, ChevronUp, ExternalLink, Info, AlertOctagon, HelpCircle, Search } from '@/lib/icons';

import SupplierDetailDrawer from '../suppliers/SupplierDetailDrawer';
import { toast } from 'react-hot-toast';
import AlgoliaCompetitorBadge from '../competitors/AlgoliaCompetitorBadge';
import RelatedProductsCarousel from '../../shared/RelatedProductsCarousel';
import NewProductTypeSelectorDrawer from './NewProductTypeSelectorDrawer';

function buildProductFormData(product, selectedType) {
  if (!product) {
    return {
      name: '',
      sku: '',
      category: 'Peptides',
      product_type: selectedType || 'api_raw_material',
      description: '',
      status: 'draft',
      stock: 0,
    };
  }
  return {
    id: product.id || product.objectID,
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
    supplierLeadTime: product.supplierLeadTime || 14,
    lastPurchasePrice: product.lastPurchasePrice || product.costPrice || 42,
    lastPurchaseDate: product.lastPurchaseDate || '2026-04-12',
    casNumber: product.casNumber || product.cas_number || product.cas || '',
    sequence: product.sequence || product.aminoAcidSequence || product.amino_acid_sequence || '',
    molecularWeight: product.molecularWeight || product.molecular_weight || product.mw || '',
    formula: product.formula || product.molecularFormula || product.molecular_formula || '',
    pubchemCid: product.pubchemCid || product.pubchem_cid || product.pubchem || '',
    primaryGoal: product.primaryGoal || product.primary_goal || '',
    goals: Array.isArray(product.goals) ? product.goals : (product.goals ? [product.goals] : []),
    halfLife: product.halfLife || product.half_life || '',
    purity: product.purity || '',
    mechanismOfAction: product.mechanismOfAction || product.mechanism || product.clinicalDescription || '',
    lifecycleStage: product.lifecycleStage || (product.isActive ? 'Published' : 'Draft'),
    guestVialPrice: product.guestVialPrice || 0,
    proVialPrice: product.proVialPrice || 0,
    wholesalerPrice: product.wholesalerPrice || 0,
    distributorPrice: product.distributorPrice || 0,
    costPrice: product.costPrice || 0,
    moq_1: product.moq_1 || product.guestVialPrice || 0,
    moq_10: product.moq_10 || product.proVialPrice || 0,
    moq_50: product.moq_50 || 0,
    moq_100: product.moq_100 || 0,
    moq_500: product.moq_500 || 0,
    moq_1000: product.moq_1000 || 0,
    stock: product.stock || 0,
    reservedStock: product.reservedStock || 12,
    incomingStock: product.incomingStock || 0,
    warehouse: product.warehouse || 'Poland',
    reorderPoint: product.reorderPoint || 20,
    safetyStock: product.safetyStock || 10,
    avgMonthlySales: product.avgMonthlySales || 45,
    images: product.images || [],
    pdfBrochure: product.pdfBrochure || '',
    coaUrl: product.coaUrl || '',
    sdsUrl: product.sdsUrl || '',
    msdsUrl: product.msdsUrl || '',
    packagingUrl: product.packagingUrl || '',
    marketingMaterialUrl: product.marketingMaterialUrl || '',
    videosUrl: product.videosUrl || '',
    registrationStatus: product.registrationStatus || 'Pending',
    expiryDate: product.expiryDate || '',
    regulatoryNotes: product.regulatoryNotes || '',
    countries: product.countries || ['UAE', 'EU'],
    requiredDocs: product.requiredDocs || ['CoA', 'GMP'],
    docStatus_coa: product.docStatus_coa || 'Approved',
    docStatus_msds: product.docStatus_msds || 'Pending',
    docStatus_gmp: product.docStatus_gmp || 'Approved',
    docStatus_iso: product.docStatus_iso || 'Approved',
    docStatus_stability: product.docStatus_stability || 'Missing',
    docStatus_shelflife: product.docStatus_shelflife || 'Approved',
    reg_uae: product.reg_uae || 'Approved',
    reg_ksa: product.reg_ksa || 'Pending',
    reg_qatar: product.reg_qatar || 'Pending',
    reg_kuwait: product.reg_kuwait || 'Not Registered',
    reg_bahrain: product.reg_bahrain || 'Not Registered',
    reg_oman: product.reg_oman || 'Not Registered',
    reg_eu: product.reg_eu || 'Approved',
    reg_us: product.reg_us || 'Pending',
    zohoId: product.zohoId || 'ZOHO-PROD-984812',
    zohoSyncStatus: product.zohoSyncStatus || 'Synced',
    zohoLastSync: product.zohoLastSync || '2h ago',
    zohoInventorySync: product.zohoInventorySync || 'Enabled',
    zohoPriceSync: product.zohoPriceSync || 'Enabled',
    zohoSupplierSync: product.zohoSupplierSync || 'Enabled',
    compatibleProducts: product.compatibleProducts || ['Rejuvenation Starter Pack', 'BPC-157 Vials'],
    alternativeProducts: product.alternativeProducts || ['Sermorelin Lyophilized Powder'],
    upsellProducts: product.upsellProducts || ['Longevity Premium Package'],
    bundleProducts: product.bundleProducts || ['Bio-Recovery Bundle'],
    successorProduct: product.successorProduct || '',
  };
}

export default function ProductDetailsDrawer({ isOpen, onClose, product, onSave }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedType, setSelectedType] = useState(null);
  const isNew = !product;
  const [isImproving, setIsImproving] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [showAiAdvisor, setShowAiAdvisor] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [linkedSupplier, setLinkedSupplier] = useState(null);
  const [zohoSyncing, setZohoSyncing] = useState(false);
  const [prevProduct, setPrevProduct] = useState(product);
  const [form, setForm] = useState(() => buildProductFormData(product, selectedType));

  // Sync form when product prop changes
  if (product !== prevProduct) {
    setPrevProduct(product);
    setForm(buildProductFormData(product, selectedType));
  }

  const [expandedAccordions, setExpandedAccordions] = useState({
    overview: true,
    variants: false,
    suppliers: false,
    inventory: false,
    regulatory: false,
    pricing: false,
    history: false
  });
  const scrollContainerRef = React.useRef(null);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 1024 : false));

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll to top on opening
  useEffect(() => {
    if (isOpen && product && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [product, isOpen]);

  const toggleAccordion = (section) => {
    setExpandedAccordions(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Fetch timeline events from audit logs
  useEffect(() => {
    const targetId = product?.id || product?.objectID;
    if (!targetId) return;

    let active = true;
    const fetchTimeline = async () => {
      try {
        const q = query(collection(db, 'audit_logs'), where('targetId', '==', targetId));
        const snapshot = await getDocs(q);
        if (!active) return;
        let events = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().timestamp ? new Date(doc.data().timestamp.toDate()).toLocaleString() : 'Just now',
          event: doc.data().action || 'Action',
          user: doc.data().operatorRole || 'System',
          icon: Activity,
          color: '#3b82f6'
        }));
        events.sort((a, b) => {
          const timeA = a.timestamp ? a.timestamp.toDate().getTime() : 0;
          const timeB = b.timestamp ? b.timestamp.toDate().getTime() : 0;
          return timeB - timeA;
        });
        setTimelineEvents(events);
      } catch (error) {
        console.error("Error fetching timeline events:", error);
      }
    };

    fetchTimeline();
    return () => {
      active = false;
      setTimelineEvents([]);
      setAiResult(null);
    };
  }, [product?.id, product?.objectID]);




  if (!isOpen) return null;

  const handleCloneProduct = (hit) => {
    const isApi = hit.type === 'raw_material' || hit.productType === 'api_raw_material' || hit.grade === 'raw_api' || hit.grade === 'api_raw_material';
    const targetType = isApi ? 'api_raw_material' : 'finished_product';
    
    setSelectedType(targetType);
    setForm({
      name: `${hit.canonicalName || hit.name || 'Compound'} (Copy)`,
      canonicalName: hit.canonicalName || hit.name || '',
      sku: hit.sku ? `${hit.sku}-COPY` : '',
      category: hit.category || 'Peptides',
      product_type: targetType,
      grade: hit.grade || (targetType === 'api_raw_material' ? 'raw_api' : 'finished'),
      description: hit.description || hit.short_description || hit.summary || '',
      shortDescription: hit.short_description || hit.summary || '',
      tags: hit.tags ? (Array.isArray(hit.tags) ? hit.tags.join(', ') : hit.tags) : '',
      brand: hit.brand || 'Atlas Health',
      supplier: hit.supplier || hit.supplierName || (Array.isArray(hit.suppliers) ? hit.suppliers[0]?.name : '') || '',
      dosage: hit.dosage || hit.standard_dosage || hit.variants?.[0]?.dosage || '',
      format: hit.format || hit.variants?.[0]?.format || (targetType === 'api_raw_material' ? 'Bulk Powder' : 'Vial'),
      purity: hit.purity || '≥98%',
      casNumber: hit.casNumber || hit.molecular?.casNumber || '',
      formula: hit.molecularFormula || hit.formula || hit.molecular?.molecularFormula || '',
      molecularWeight: hit.molecularWeight || hit.molecular?.molecularWeight || '',
      sequence: hit.sequence || hit.molecular?.sequence || '',
      pubchemCid: hit.pubchemCid || hit.molecular?.pubchemCid || '',
      primaryGoal: hit.primaryGoal || hit.goal || '',
      goals: Array.isArray(hit.goals) ? hit.goals : (hit.goalIds || []),
      guestVialPrice: hit.guestVialPrice || hit.price || hit.variants?.[0]?.price || 0,
      proVialPrice: hit.proVialPrice || 0,
      costPrice: hit.costPrice || hit.supplierCost || hit.variants?.[0]?.supplierCost || 0,
      status: 'draft',
      stock: 0,
      lifecycleStage: 'Draft'
    });
    toast.success(`Cloned data from "${hit.canonicalName || hit.name}". Ready to customize.`);
  };

  if (isNew && !selectedType) {
    return (
      <NewProductTypeSelectorDrawer
        isOpen={isOpen && isNew && !selectedType}
        onClose={onClose}
        isMobile={isMobile}
        onSelectType={setSelectedType}
        onCloneProduct={handleCloneProduct}
      />
    );
  }

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
    if (!form.supplierId && !form.supplier) score -= 15;
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
    { label: 'Supplier', done: !!(form.supplierId || form.supplier) },
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
        action: () => setActiveTab('regulatory')
      });
    }
    if (!form.supplierId && !form.supplier) {
      alerts.push({
        id: 'supplier',
        type: 'warning',
        text: 'No Supplier Assigned',
        actionLabel: 'Assign Supplier',
        action: () => setActiveTab('suppliers')
      });
    }
    if (!form.images || form.images.length === 0) {
      alerts.push({
        id: 'image',
        type: 'warning',
        text: 'No Product Image Uploaded',
        actionLabel: 'Upload Image',
        action: () => setActiveTab('overview')
      });
    }
    return alerts;
  };

  const actionAlerts = getActionCenterAlerts();

  // Save changes
  const handleSave = async () => {
    try {
      const resolvedCat = form.categoryId || form.category || 'peptide';
      const resolvedType = form.type || form.productType || 'finished_product';
      const updates = {
        ...form,
        categoryId: resolvedCat,
        category: resolvedCat,
        type: resolvedType,
        productType: resolvedType,
        updatedAt: new Date().toISOString(),
      };
      
      if (isNew) {
        await createProduct(updates, { strict: false });
        toast.success('Product created successfully!');
      } else {
        if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
          await Promise.all(product.variants.map(v => 
            updateProduct(v.id, updates, { strict: false })
          ));
        } else {
          await updateProduct(product.id, updates, { strict: false });
        }
        
        // Log the audit event
        await logAction('current_user', 'admin', 'PRODUCT_UPDATE', product.id, { 
          name: form.name, 
          sku: form.sku 
        });
        toast.success('Product Workspace changes saved successfully!');
      }

      onSave?.(isNew ? null : { ...product, ...updates });
      if (isNew) onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save product workspace details.');
    }
  };

  // Duplicate product
  const handleDuplicate = async () => {
    try {
      const resolvedCat = form.categoryId || form.category || 'peptide';
      const resolvedType = form.type || form.productType || 'finished_product';
      const newProduct = {
        ...form,
        name: `${form.name} (Copy)`,
        displayName: `${form.name} (Copy)`,
        sku: form.sku ? `${form.sku}-COPY` : '',
        categoryId: resolvedCat,
        category: resolvedCat,
        type: resolvedType,
        productType: resolvedType,
      };
      await createProduct(newProduct, { strict: false });
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
      const updates = { isActive: false, lifecycleStage: 'Archived', updatedAt: new Date().toISOString() };
      if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
        await Promise.all(product.variants.map(v => updateProduct(v.id, updates, { strict: false })));
      } else {
        await updateProduct(product.id, updates, { strict: false });
      }
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
        if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
          await Promise.all(product.variants.map(v => deleteProduct(v.id)));
        } else {
          await deleteProduct(product.id);
        }
        toast.success('Product deleted.');
        onClose();
        onSave?.(null);
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete product.');
      }
    });
  };

  const fetchClinicalData = async () => {
    setIsImproving(true);
    try {
      const response = await fetch('/api/ai-generate-product-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          product_type: form.product_type,
          tags: form.tags
        })
      });
      const data = await response.json();
      if (data.description) {
        setAiResult(data);
        setForm(prev => ({ 
          ...prev, 
          description: data.description,
          // Let's assume there are form fields for these if needed, or we just keep them in aiResult for display
        }));
        toast.success('Atlas Medical AI generated clinical data successfully!');
      } else {
        toast.error('Failed to generate clinical data.');
      }
    } catch (err) {
      toast.error('Error contacting Atlas Medical AI service.');
    } finally {
      setIsImproving(false);
    }
  };

  // AI Product Improver (Header Button)
  const handleImproveProduct = () => {
    fetchClinicalData();
  };

  // Quick Action AI trigger (Sidebar Action Center)
  const triggerAiAction = async (actionType) => {
    if (actionType === 'description') {
      fetchClinicalData();
    }
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
    { id: 'Catalog Ready', label: 'Catalog Ready', color: '#64748b' },
    { id: 'Commercial Ready', label: 'Commercial Ready', color: '#64748b' },
    { id: 'Regulatory Ready', label: 'Regulatory Ready', color: '#64748b' },
    { id: 'Published', label: 'Published', color: '#3b82f6' },
    { id: 'Archived', label: 'Archived', color: '#64748b' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'variants', label: 'Variants', icon: PackageOpen },
    { id: 'suppliers', label: 'Suppliers', icon: Building },
    { id: 'inventory', label: 'Inventory', icon: Box },
    { id: 'regulatory', label: 'Regulatory', icon: Shield },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'market', label: 'Market Intel', icon: TrendingUp },
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
              backgroundColor: 'rgba(15, 23, 42, 0.25)',
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
              backgroundColor: '#ffffff', // Clean white background
              boxShadow: '-8px 0 32px rgba(15, 23, 42, 0.15)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'row',
              overflow: 'hidden',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              color: 'var(--color-text-primary, #1e293b)'
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
              backgroundColor: '#f8fafc' // Subtle gray background for main content area
            }}>
              {/* Sticky Top Header Info Card */}
              <div style={{
                padding: '1.5rem',
                borderBottom: '1px solid #e2e8f0',
                background: '#ffffff',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '12px',
                      backgroundColor: '#e2e8f0',
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
                        <h2 style={{ margin: 0, fontSize: '1.35rem', color: '#0f172a', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {form.name || 'New Product'}
                        </h2>
                        {form.isLocked && (
                          <span title="This master product's data is locked." style={{
                            fontSize: '0.75rem',
                            backgroundColor: '#e2e8f0',
                            color: '#64748b',
                            padding: '2px 8px',
                            borderRadius: '100px',
                            border: `1px solid #334155`,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <Shield size={12} /> Locked
                          </span>
                        )}
                        {form.isPrimaryVariant && (
                          <span style={{
                            fontSize: '0.75rem',
                            backgroundColor: '#3b82f622',
                            color: '#60a5fa',
                            padding: '2px 8px',
                            borderRadius: '100px',
                            border: `1px solid #3b82f644`,
                            fontWeight: 600
                          }}>
                            Master Product
                          </span>
                        )}
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
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px 16px', fontSize: '0.8rem', color: '#64748b' }}>
                        <div>SKU: <strong style={{ color: '#475569' }}>{form.sku || 'N/A'}</strong></div>
                        <div>Category: <strong style={{ color: '#475569' }}>{form.category}</strong></div>
                        <div>Type: <strong style={{ color: '#475569' }}>{form.product_type}</strong></div>
                        <div>Supplier: <strong style={{ color: '#475569' }}>{form.supplier || 'None'}</strong></div>
                        <div>Zoho Sync: <span style={{ color: form.zohoSyncStatus === 'Synced' ? '#10b981' : '#f59e0b', fontWeight: 600 }}>● {form.zohoSyncStatus}</span></div>
                        <div>Health: <span style={{ color: getMarginColor(healthScore), fontWeight: 700 }}>{healthScore}/100</span></div>
                        <div>Updated: <strong style={{ color: '#475569' }}>{form.zohoLastSync || 'Just now'}</strong></div>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 10 }}>
                    {!isMobile && (
                      <>
                        <Button variant="outline" onClick={handleDuplicate} icon={<Copy size={13} />} style={{ borderColor: '#475569', color: '#64748b', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>Duplicate</Button>
                        <Button variant="outline" onClick={handleArchive} icon={<Archive size={13} />} style={{ borderColor: '#475569', color: '#64748b', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>Archive</Button>
                        <Button variant="ghost" onClick={handleDelete} style={{ color: '#ef4444', padding: '0.4rem 0.75rem' }}><Trash2 size={14} /></Button>
                        <div style={{ width: '1px', height: '24px', backgroundColor: '#475569', margin: '0 4px' }} />
                      </>
                    )}
                    <button 
                      onClick={() => setShowAiAdvisor(!showAiAdvisor)}
                      style={{
                        padding: '0.4rem 0.75rem',
                        borderRadius: '6px',
                        border: `1px solid ${showAiAdvisor ? 'var(--color-primary)' : '#475569'}`,
                        backgroundColor: showAiAdvisor ? '#8b5cf622' : 'transparent',
                        color: showAiAdvisor ? 'var(--color-primary)' : '#64748b',
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
                        color: '#64748b',
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
                  backgroundColor: '#f1f5f9',
                  padding: '6px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
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
                          borderRadius: '6px',
                          backgroundColor: isActiveStage ? '#f1f5f9' : 'transparent',
                          color: isActiveStage ? '#0f172a' : '#64748b',
                          fontSize: '0.75rem',
                          fontWeight: isActiveStage ? 700 : 600,
                          cursor: 'pointer',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.2s',
                          border: isActiveStage ? '1px solid #cbd5e1' : '1px solid transparent',
                          boxShadow: isActiveStage ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
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
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>Product Readiness:</span>
                  <div style={{ flex: 1, maxWidth: '280px', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ width: `${completionPercent}%`, height: '100%', backgroundColor: '#3b82f6', transition: 'width 0.3s' }} />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#3b82f6' }}>{completionPercent}%</span>
                </div>
                {/* Readiness checklist inline summary */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {checklistItems.map((item, idx) => (
                    <span key={idx} style={{
                      fontSize: '0.7rem',
                      color: item.done ? '#10b981' : '#64748b',
                      backgroundColor: item.done ? '#10b98115' : '#f1f5f9',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: `1px solid ${item.done ? '#10b98133' : '#e2e8f0'}`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '2px'
                    }}>
                      {item.done ? '✓' : '○'} {item.label}
                    </span>
                  ))}
                </div>
              </div>



              {/* Desktop/Tablet Horizontal Tabs Navigation */}
              {!isMobile && (
                <div style={{
                  display: 'flex',
                  padding: '0 1.5rem',
                  borderBottom: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
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
                        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#0f172a', color: '#0f172a', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}><Eye size={16} /> Overview</span>
                        {expandedAccordions.overview ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {expandedAccordions.overview && <div style={{ padding: '1rem', backgroundColor: '#090d16' }}><OverviewTab form={form} setForm={setForm} triggerAiAction={triggerAiAction} onSupplierClick={(s) => setLinkedSupplier(s)} /></div>}
                    </div>

                    {/* ACCORDION 2: VARIANTS */}
                    <div style={{ border: '1px solid #1e293b', borderRadius: '8px', overflow: 'hidden' }}>
                      <button 
                        onClick={() => toggleAccordion('variants')} 
                        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#0f172a', color: '#0f172a', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}><PackageOpen size={16} /> Variants</span>
                        {expandedAccordions.variants ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {expandedAccordions.variants && <div style={{ padding: '1rem', backgroundColor: '#090d16' }}><VariantsTab product={product} /></div>}
                    </div>

                    {/* ACCORDION 3: SUPPLIERS */}
                    <div style={{ border: '1px solid #1e293b', borderRadius: '8px', overflow: 'hidden' }}>
                      <button 
                        onClick={() => toggleAccordion('suppliers')} 
                        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#0f172a', color: '#0f172a', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}><Building size={16} /> Suppliers</span>
                        {expandedAccordions.suppliers ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {expandedAccordions.suppliers && <div style={{ padding: '1rem', backgroundColor: '#090d16' }}><SuppliersTab form={form} setForm={setForm} product={product} onSupplierClick={(supplier) => setLinkedSupplier(supplier)} /></div>}
                    </div>

                    {/* ACCORDION 4: INVENTORY */}
                    <div style={{ border: '1px solid #1e293b', borderRadius: '8px', overflow: 'hidden' }}>
                      <button 
                        onClick={() => toggleAccordion('inventory')} 
                        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#0f172a', color: '#0f172a', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}><Box size={16} /> Inventory</span>
                        {expandedAccordions.inventory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {expandedAccordions.inventory && <div style={{ padding: '1rem', backgroundColor: '#090d16' }}><InventoryTab form={form} setForm={setForm} /></div>}
                    </div>

                    {/* ACCORDION 5: REGULATORY */}
                    <div style={{ border: '1px solid #1e293b', borderRadius: '8px', overflow: 'hidden' }}>
                      <button 
                        onClick={() => toggleAccordion('regulatory')} 
                        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#0f172a', color: '#0f172a', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}><Shield size={16} /> Regulatory</span>
                        {expandedAccordions.regulatory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {expandedAccordions.regulatory && <div style={{ padding: '1rem', backgroundColor: '#090d16' }}><RegulatoryTab form={form} setForm={setForm} /></div>}
                    </div>

                    {/* ACCORDION 6: PRICING */}
                    <div style={{ border: '1px solid #1e293b', borderRadius: '8px', overflow: 'hidden' }}>
                      <button 
                        onClick={() => toggleAccordion('pricing')} 
                        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#0f172a', color: '#0f172a', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}><DollarSign size={16} /> Pricing</span>
                        {expandedAccordions.pricing ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {expandedAccordions.pricing && <div style={{ padding: '1rem', backgroundColor: '#090d16' }}><PricingTab form={form} setForm={setForm} autoGenMoq={autoGenMoq} /></div>}
                    </div>

                    {/* ACCORDION 7: HISTORY */}
                    <div style={{ border: '1px solid #1e293b', borderRadius: '8px', overflow: 'hidden' }}>
                      <button 
                        onClick={() => toggleAccordion('history')} 
                        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#0f172a', color: '#0f172a', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}><History size={16} /> History</span>
                        {expandedAccordions.history ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {expandedAccordions.history && <div style={{ padding: '1rem', backgroundColor: '#090d16' }}><TimelineTab timelineEvents={timelineEvents} /></div>}
                    </div>

                  </div>
                ) : (
                  /* Desktop Tab Views */
                  <div>
                    {activeTab === 'overview' && <OverviewTab form={form} setForm={setForm} triggerAiAction={triggerAiAction} onSupplierClick={(s) => setLinkedSupplier(s)} />}
                    {activeTab === 'variants' && <VariantsTab product={product} />}
                    {activeTab === 'suppliers' && <SuppliersTab product={product} form={form} setForm={setForm} onSupplierClick={(supplier) => setLinkedSupplier(supplier)} />}
                    {activeTab === 'inventory' && <InventoryTab form={form} setForm={setForm} />}
                    {activeTab === 'regulatory' && <RegulatoryTab form={form} setForm={setForm} />}
                    {activeTab === 'pricing' && <PricingTab form={form} setForm={setForm} autoGenMoq={autoGenMoq} />}
                    {activeTab === 'market' && (
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '0.5rem 0' }}>
                         <div>
                           <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>Benchmark de Precios de Mercado</h4>
                           <AlgoliaCompetitorBadge
                             productName={product?.canonicalName || product?.name || ''}
                             ourPrice={product?.myPPMs?.retail || product?.variants?.[0]?.pricePerMg || 0}
                             dosageMg={product?.variants?.[0]?.dosage || 5}
                           />
                         </div>
                         <div>
                           <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>Péptidos Sinérgicos Recomendados</h4>
                           <RelatedProductsCarousel
                             productObjectID={product?.objectID || product?.id || ''}
                             productName={product?.canonicalName || product?.name || ''}
                             maxItems={6}
                           />
                         </div>
                       </div>
                     )}
                    {activeTab === 'history' && <TimelineTab timelineEvents={timelineEvents} />}
                  </div>
                )}

              </div>

              {/* Bottom Sticky Action Footer */}
              <div style={{
                display: 'flex',
                padding: '1rem 1.5rem',
                borderTop: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
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
                      <Button variant="outline" onClick={handleDuplicate} icon={<Copy size={13} />} style={{ borderColor: '#475569', color: '#64748b', padding: '0.35rem 0.5rem', fontSize: '0.7rem' }}>Dupe</Button>
                      <Button variant="outline" onClick={handleArchive} icon={<Archive size={13} />} style={{ borderColor: '#475569', color: '#64748b', padding: '0.35rem 0.5rem', fontSize: '0.7rem' }}>Archive</Button>
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
                          color: 'var(--color-primary)',
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
                      <Button variant="outline" onClick={onClose} style={{ borderColor: '#475569', color: '#64748b', fontSize: '0.85rem' }}>Cancel</Button>
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
                borderLeft: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflow: 'hidden'
              }}>
                {/* Advisor Header */}
                <div style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid #e2e8f0',
                  backgroundColor: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Brain size={20} color="var(--color-primary)" />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a', fontWeight: 700 }}>Atlas AI Product Advisor</h3>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 600 }}>Active Agent Copilot</span>
                  </div>
                </div>

                {/* Advisor Insights Panel Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Real-time Diagnostics Detection list */}
                  <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    padding: '0.85rem',
                    border: '1px solid #e2e8f0'
                  }}>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase' }}>Anomalies Detected</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {!form.guestVialPrice && (
                        <div style={{ fontSize: '0.75rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          ● Missing retail pricing matrix
                        </div>
                      )}
                      {marginRetail < 30 && (
                        <div style={{ fontSize: '0.75rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          ● Low profit margin toast({marginRetail.toFixed(1)}%)
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
                        <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          ● Missing catalog visual assets
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AI Quick Actions Panel */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Automations</span>
                    <button
                      onClick={() => triggerAiAction('description')}
                      style={{
                        padding: '0.6rem 0.85rem',
                        borderRadius: '6px',
                        border: '1px solid #334155',
                        backgroundColor: '#e2e8f0',
                        color: '#475569',
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
                  </div>

                  {/* AI content Preview box */}
                  {aiResult && (
                    <div style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '1rem',
                      fontSize: '0.8rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)', fontWeight: 700 }}>
                        <Sparkles size={14} />
                        <span>Clinical Monograph Generated</span>
                      </div>
                      
                      <div>
                        <strong style={{ color: '#0f172a', display: 'block', marginBottom: '4px' }}>Description</strong>
                        <p style={{ margin: 0, color: '#475569', lineHeight: 1.4 }}>{aiResult.description}</p>
                      </div>

                      <div>
                        <strong style={{ color: '#0f172a', display: 'block', marginBottom: '4px' }}>Mechanism of Action</strong>
                        <p style={{ margin: 0, color: '#475569', lineHeight: 1.4 }}>{aiResult.mechanism}</p>
                      </div>

                      <div>
                        <strong style={{ color: '#0f172a', display: 'block', marginBottom: '4px' }}>Clinical Summary</strong>
                        <p style={{ margin: 0, color: '#475569', lineHeight: 1.4 }}>{aiResult.clinicalSummary}</p>
                      </div>

                      <div>
                        <strong style={{ color: '#0f172a', display: 'block', marginBottom: '4px' }}>SEO Title</strong>
                        <p style={{ margin: 0, color: '#475569', lineHeight: 1.4 }}>{aiResult.seoTitle}</p>
                      </div>
                      
                      <div>
                        <strong style={{ color: '#0f172a', display: 'block', marginBottom: '4px' }}>Sales Sheet</strong>
                        <div style={{ margin: 0, color: '#475569', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>{aiResult.salesSheet}</div>
                      </div>
                    </div>
                  )}

                  <div style={{
                    marginTop: 'auto',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #e2e8f0',
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
          <SupplierDetailDrawer 
            isOpen={!!linkedSupplier} 
            onClose={() => setLinkedSupplier(null)} 
            supplier={linkedSupplier} 
          />
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
}