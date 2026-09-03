import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, X, ChevronRight, FileText, CheckSquare, Save } from '@/lib/icons';
import { StatusChip } from '../../ui';
import toast from 'react-hot-toast';

import { normalizer } from '../../../lib/supplierImport/normalizer';
import { createProduct, createVariant, getActiveProducts } from '../../../repositories/productRepository';
import { doc, setDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';

export default function SupplierImportWorkflow({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState(null);

  // States for matching
  const [importPreview, setImportPreview] = useState(null);
  const fileInputRef = useRef(null);
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/json') {
      setFile(selectedFile);
    } else {
      toast.error('Please upload a valid JSON file');
    }
  };

  const processFile = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const json = JSON.parse(e.target.result);
          setParsedData(json);
          await generatePreview(json);
          setStep(2);
        } catch (error) {
          toast.error('Failed to parse JSON file');
          console.error(error);
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      toast.error('Error reading file');
      setIsProcessing(false);
    }
  };

  /**
   * Match imported items against the canonical `products` collection.
   * Uses name similarity to identify existing products.
   */
  const generatePreview = async (json) => {
    // Fetch existing products from the canonical collection for matching
    const existingProducts = await getActiveProducts({ forceRefresh: true });
    
    // Build a lookup map by normalized name
    const productNameMap = new Map();
    existingProducts.forEach(p => {
      const key = (p.name || '').toLowerCase().trim();
      if (key) productNameMap.set(key, p);
      // Also index by aliases
      (p.aliases || []).forEach(alias => {
        const aliasKey = (alias || '').toLowerCase().trim();
        if (aliasKey) productNameMap.set(aliasKey, p);
      });
    });

    // Determine JSON structure
    const isNewFormat = !!json.supplier_imports;
    let items = [];
    let suppliersData = [];

    if (isNewFormat) {
      suppliersData = json.suppliers || [];
      json.supplier_imports.forEach(job => {
        items = items.concat(job.items || []);
      });
    } else {
      items = Array.isArray(json) ? json : (json.items || []);
    }
    
    let toCreate = [];
    let toUpdate = [];
    let ambiguous = [];

    items.forEach(item => {
      const rawName = item.canonicalName || item.name || '';
      const normalized = normalizer.canonicalize(rawName);
      const key = normalized.toLowerCase().trim();
      
      const exactMatch = productNameMap.get(key);
      
      if (exactMatch) {
        item._matchedProduct = exactMatch;
        item._matchConfidence = 1.0;
        toUpdate.push(item);
      } else {
        // Try partial matching against product names
        let bestMatch = null;
        let bestScore = 0;
        
        for (const [pKey, product] of productNameMap) {
          if (key.includes(pKey) || pKey.includes(key)) {
            const score = Math.min(key.length, pKey.length) / Math.max(key.length, pKey.length);
            if (score > bestScore && score >= 0.6) {
              bestScore = score;
              bestMatch = product;
            }
          }
        }
        
        if (bestMatch && bestScore >= 0.9) {
          item._matchedProduct = bestMatch;
          item._matchConfidence = bestScore;
          toUpdate.push(item);
        } else if (bestMatch && bestScore >= 0.6) {
          item._matchedProduct = bestMatch;
          item._matchConfidence = bestScore;
          ambiguous.push(item);
        } else {
          toCreate.push(item);
        }
      }
    });

    setImportPreview({
      total: items.length,
      toCreate,
      toUpdate,
      ambiguous,
      rawItems: items,
      rawSuppliers: suppliersData
    });
  };

  const handleCommit = async () => {
    setIsProcessing(true);
    try {
      toast.success('Import started... (Writing to Firestore)');
      
      const allItems = [...(importPreview?.toCreate || []), ...(importPreview?.toUpdate || [])];
      const suppliersToProcess = importPreview?.rawSuppliers || [];
      let written = 0;

      // 1. Write supplier records to `suppliers` collection
      for (const sup of suppliersToProcess) {
        const supplierId = sup.supplier_id || sup.id;
        if (!supplierId) continue;
        
        await setDoc(doc(db, 'suppliers', supplierId), {
          ...sup,
          id: supplierId,
          name: sup.name || sup.companyName || supplierId,
          updatedAt: serverTimestamp(),
        }, { merge: true });
        written++;
      }

      // 2. Process product items
      for (const item of allItems) {
        const supplierId = item.supplierId || item.supplier_id;
        const productName = normalizer.canonicalize(item.canonicalName || item.name || '');
        
        if (item._matchedProduct) {
          // Product exists — add variant if it doesn't exist yet
          const productId = item._matchedProduct.id;
          const presType = item.presentationType || item.presentation_type || 'vial';
          const dosForm = item.dosageForm || item.dosage_form || 'lyophilized';
          
          try {
            await createVariant(productId, {
              supplierId: supplierId,
              presentationType: presType,
              dosageForm: dosForm,
              fillVolume: item.fillVolume || item.fill_volume || null,
              route: item.route || 'subcutaneous',
              packSize: item.packSize || item.pack_size || null,
              components: item.components || [],
              pricing: item.pricing || buildPricingFromOffers(item),
              isActive: true,
              sourceImportId: 'manual_ui_import',
            }, { strict: false });
            written++;
          } catch (e) {
            console.warn(`[Import] Variant creation failed for ${productName}:`, e.message);
          }
        } else {
          // New product — create product + variant
          try {
            const rawCat = (item.categoryId || item.category || 'peptide').toLowerCase().trim();
            const resolvedCat = rawCat === 'peptides' ? 'peptide' : rawCat;
            const resolvedType = item.type || item.productType || 'finished_product';

            const newProduct = await createProduct({
              name: productName,
              displayName: productName,
              aliases: item.aliases || [],
              categoryId: resolvedCat,
              category: resolvedCat,
              type: resolvedType,
              productType: resolvedType,
              supplierId: supplierId,
              supplierIds: supplierId ? [supplierId] : [],
              components: item.components || [],
              isActive: true,
              status: 'draft',
              sourceImportId: 'manual_ui_import',
            }, { strict: false });

            written++;

            // Create initial variant under the new product
            if (newProduct?.id) {
              const presType = item.presentationType || item.presentation_type || 'vial';
              const dosForm = item.dosageForm || item.dosage_form || 'lyophilized';
              
              await createVariant(newProduct.id, {
                supplierId: supplierId,
                presentationType: presType,
                dosageForm: dosForm,
                fillVolume: item.fillVolume || item.fill_volume || null,
                route: item.route || 'subcutaneous',
                components: item.components || [],
                pricing: item.pricing || buildPricingFromOffers(item),
                isActive: true,
                sourceImportId: 'manual_ui_import',
              }, { strict: false });
              written++;
            }
          } catch (e) {
            console.warn(`[Import] Product creation failed for ${productName}:`, e.message);
          }
        }
      }

      toast.success(`Import completed! ${written} records written to Firestore.`);
      setIsProcessing(false);
      onClose();
    } catch (err) {
      console.error('Import failed:', err);
      toast.error('Failed to commit import');
      setIsProcessing(false);
    }
  };

  /** Build a pricing object from legacy offer data if present */
  function buildPricingFromOffers(item) {
    if (!item.offers && !item.prices) return {};
    
    const offers = item.offers || [];
    const firstOffer = offers[0] || {};
    const prices = firstOffer.prices || item.prices || {};
    
    return {
      masterPrice: { base: prices.unitPrice || prices.unit_price || 0 },
      retailPrice: { base: prices.retailPrice || prices.retail_price || 0 },
      clinicPrice: { base: prices.clinicPrice || prices.clinic_price || 0 },
      currency: firstOffer.currency || item.currency || 'EUR',
    };
  }

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '800px',
      backgroundColor: 'var(--surface-alt)', zIndex: 1000, boxShadow: '-5px 0 25px rgba(0,0,0,0.1)',
      display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--border)',
      transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: 'var(--text-main)' }}>Import Supplier Catalog</h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Multi-Supplier Data Ingestion Workflow</p>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <X size={24} />
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
        
        {/* Progress Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: step >= 1 ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600 }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: step >= 1 ? 'var(--primary)' : 'var(--border)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>1</div>
            Upload File
          </div>
          <div style={{ flex: 1, height: '2px', backgroundColor: step >= 2 ? 'var(--primary)' : 'var(--border)', margin: '0 1rem' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: step >= 2 ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600 }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: step >= 2 ? 'var(--primary)' : 'var(--border)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>2</div>
            Preview & Match
          </div>
          <div style={{ flex: 1, height: '2px', backgroundColor: step >= 3 ? 'var(--primary)' : 'var(--border)', margin: '0 1rem' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: step >= 3 ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600 }}>
             <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: step >= 3 ? 'var(--primary)' : 'var(--border)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>3</div>
            Confirm
          </div>
        </div>

        {/* Step 1: Upload */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', border: '2px dashed var(--border)', borderRadius: '12px', backgroundColor: 'var(--surface)' }}>
             <UploadCloud size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
             <h3 style={{ margin: '0 0 0.5rem 0' }}>Upload Supplier JSON</h3>
             <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center' }}>
               Select the JSON file containing the multi-supplier catalog data.<br/>
               Products will be written to the canonical <code>products</code> collection.
             </p>
             
             <input 
               type="file" 
               accept=".json"
               ref={fileInputRef}
               style={{ display: 'none' }}
               onChange={handleFileChange}
             />
             
             <button 
               className="btn btn-primary"
               onClick={() => fileInputRef.current.click()}
               disabled={isProcessing}
               style={{ marginBottom: '1rem' }}
             >
               Choose File
             </button>
             
             {file && (
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                 <FileText size={16} color="var(--primary)" />
                 {file.name} ({(file.size / 1024).toFixed(1)} KB)
                 <button onClick={processFile} className="btn btn-secondary" style={{ marginLeft: '1rem', padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} disabled={isProcessing}>
                   {isProcessing ? 'Processing...' : 'Process'}
                 </button>
               </div>
             )}
          </div>
        )}

        {/* Step 2: Preview */}
        {step === 2 && importPreview && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', gap: '2rem', justifyContent: 'space-between' }}>
               <div style={{ textAlign: 'center' }}>
                 <h4 style={{ fontSize: '2rem', margin: 0, color: 'var(--primary)', fontWeight: 800 }}>{importPreview.total}</h4>
                 <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Records</span>
               </div>
               <div style={{ textAlign: 'center' }}>
                 <h4 style={{ fontSize: '2rem', margin: 0, color: '#10b981', fontWeight: 800 }}>{importPreview.toUpdate.length}</h4>
                 <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Auto-Matched</span>
               </div>
               <div style={{ textAlign: 'center' }}>
                 <h4 style={{ fontSize: '2rem', margin: 0, color: '#f59e0b', fontWeight: 800 }}>{importPreview.ambiguous.length}</h4>
                 <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ambiguous</span>
               </div>
               <div style={{ textAlign: 'center' }}>
                 <h4 style={{ fontSize: '2rem', margin: 0, color: '#3b82f6', fontWeight: 800 }}>{importPreview.toCreate.length}</h4>
                 <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>New Products</span>
               </div>
            </div>

            {importPreview.ambiguous.length > 0 && (
              <div style={{ border: '1px solid #f59e0b', borderRadius: '8px', overflow: 'hidden' }}>
                 <div style={{ backgroundColor: '#fffbeb', padding: '1rem', borderBottom: '1px solid #f59e0b' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: '#b45309', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertCircle size={18} /> Needs Review ({importPreview.ambiguous.length})
                    </h3>
                 </div>
                 <div style={{ padding: '1rem', backgroundColor: '#fff' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      There are some items with a medium confidence match. You will need to resolve these before committing.
                    </p>
                 </div>
              </div>
            )}
            
             <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
               <button className="gcp-btn-secondary" onClick={() => setStep(1)}>Back</button>
               <button className="btn btn-primary" onClick={() => setStep(3)}>Proceed to Confirm</button>
             </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center' }}>
             <CheckSquare size={48} color="#10b981" style={{ marginBottom: '1rem' }} />
             <h3 style={{ margin: '0 0 0.5rem 0' }}>Ready to Import</h3>
             <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '400px' }}>
               You are about to write {importPreview?.total || 0} records to the canonical <strong>products</strong> collection. 
               Existing products will receive new variants. New products will be created in <code>draft</code> status.
             </p>
             
             <button 
               className="btn btn-primary" 
               onClick={handleCommit}
               disabled={isProcessing}
               style={{ padding: '0.75rem 2rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
             >
               {isProcessing ? 'Processing...' : <><Save size={18} /> Commit Import</>}
             </button>
             
             <button 
               className="btn-ghost mt-4" 
               onClick={() => setStep(2)}
               disabled={isProcessing}
             >
               Back to Preview
             </button>
          </div>
        )}

      </div>
    </div>
  );
}
