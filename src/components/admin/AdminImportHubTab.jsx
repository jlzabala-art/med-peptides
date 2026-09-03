"use strict";
"use client";

import Database from "lucide-react/dist/esm/icons/database";
import FileUp from "lucide-react/dist/esm/icons/file-up";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { db } from '../../firebase';
import { useCatalogStore } from '../../store/useCatalogStore';
import { AtlasImportAgent } from '../../services/AtlasImportAgent';
import toast from 'react-hot-toast';
import {
  updateProduct as repoUpdateProduct,
  batchCreateProducts,
} from '../../repositories/productRepository';

export default function AdminImportHubTab({ isSubTab = false }) {
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [file, setFile] = useState(null);
  
  // Connect to Zustand Cache
  const { products: existingProducts, fetchCatalog } = useCatalogStore();

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
    setStep(2);
    setIsAnalyzing(true);

    try {
      // 1. Parse Excel/CSV File
      const data = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(firstSheet);

      if (rows.length === 0) throw new Error("File is empty.");

      // Real AI Analysis via Gemini
      const analysisResult = await AtlasImportAgent.analyzeImportData(rows, existingProducts);
      setAnalysisResults(analysisResult);
      setIsAnalyzing(false);
      setStep(3);

    } catch (err) {
      toast.error(err.message || "Failed to process file.");
      setIsAnalyzing(false);
      setStep(1);
    }
  };

  const handleApproveAll = async () => {
    toast.loading("Writing to database...", { id: "import" });
    try {
      // Update prices through the repository (validated)
      for (const change of (analysisResults.priceChanges || [])) {
        await repoUpdateProduct(change.id, { price: change.newPrice }, { strict: false });
      }

      // Batch create new products through the repository (schema-validated)
      if (analysisResults.newProducts?.length > 0) {
        const cleanProducts = analysisResults.newProducts.map(prod => ({
          ...prod,
          status: prod.status || 'draft',
        }));
        await batchCreateProducts(cleanProducts, { strict: false });
      }

      toast.success("AI Import complete! Changes synced to Firestore.", { id: "import" });
      
      // Invalidate cache so other tabs reflect changes instantly
      useCatalogStore.getState().invalidateCache();
      
      setStep(4);
    } catch (e) {
      toast.error("Error during import: " + e.message, { id: "import" });
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <Sparkles size={28} color="#8b5cf6" />
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>AI Data Importer</h1>
      </div>

      {/* Wizard Steps */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
        {[1, 2, 3, 4].map(s => (
          <div key={s} style={{ 
            flex: 1, 
            height: '4px', 
            background: step >= s ? '#8b5cf6' : '#e2e8f0', 
            borderRadius: '2px',
            transition: 'background 0.3s ease'
          }} />
        ))}
      </div>

      {step === 1 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
          <FileUp size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Upload Supplier Catalog</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Upload a CSV or Excel file. Atlas AI will automatically map the columns.</p>
          <label style={{ 
            cursor: 'pointer', 
            background: 'var(--primary)', 
            color: 'white', 
            padding: '0.75rem 2rem', 
            borderRadius: '8px', 
            fontWeight: 600,
            display: 'inline-block'
          }}>
            Select File
            <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" style={{ display: 'none' }} onChange={handleFileUpload} />
          </label>
        </div>
      )}

      {step === 2 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div className="animate-spin" style={{ display: 'inline-block', marginBottom: '1rem' }}>
            <Sparkles size={48} color="#8b5cf6" />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Atlas AI is analyzing {file?.name}...</h2>
          <p style={{ color: 'var(--text-muted)' }}>Mapping columns, checking existing products, and detecting price changes.</p>
        </div>
      )}

      {step === 3 && analysisResults && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 color="#10b981" /> Analysis Complete
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px' }}>
              <div style={{ fontWeight: 600, color: '#475569', marginBottom: '1rem' }}>Identified Mappings</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#334155', fontSize: '0.9rem', lineHeight: '1.8' }}>
                <li><strong>Product Name:</strong> Column "{analysisResults.mapping.nameCol}"</li>
                <li><strong>Price:</strong> Column "{analysisResults.mapping.priceCol}"</li>
                <li><strong>SKU:</strong> Column "{analysisResults.mapping.skuCol}"</li>
              </ul>
            </div>
            
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px' }}>
              <div style={{ fontWeight: 600, color: '#475569', marginBottom: '1rem' }}>Summary</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#334155', fontSize: '0.9rem', lineHeight: '1.8' }}>
                <li><strong>Rows Read:</strong> {analysisResults.summary.totalRows}</li>
                <li><strong style={{ color: '#10b981' }}>New Products:</strong> {analysisResults.summary.newProducts}</li>
                <li><strong style={{ color: '#f59e0b' }}>Price Updates:</strong> {analysisResults.summary.priceChanges}</li>
              </ul>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button onClick={() => setStep(1)} style={{ padding: '0.75rem 1.5rem', background: '#e2e8f0', color: '#475569', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleApproveAll} style={{ padding: '0.75rem 1.5rem', background: '#8b5cf6', color: 'white', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Confirm & Import <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '12px' }}>
          <CheckCircle2 size={64} color="#10b981" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Import Successful</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>All products and price updates have been synced to Firestore.</p>
          <button onClick={() => { setStep(1); setFile(null); }} style={{ padding: '0.75rem 2rem', background: 'var(--primary)', color: 'white', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
            Import Another File
          </button>
        </div>
      )}
    </div>
  );
}