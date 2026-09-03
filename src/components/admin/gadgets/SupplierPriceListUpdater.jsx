"use client";

import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { doc, writeBatch } from 'firebase/firestore';
import { db, functions } from '../../../firebase';


import * as XLSX from 'xlsx';





import { Card } from '../../ui';
import { Upload, Loader2, Sparkles, CheckCircle, AlertTriangle } from '@/lib/icons';
import DataTable from '../../ui/DataTable';
import { toast } from 'react-hot-toast';

export default function SupplierPriceListUpdater() {
  const [isParsing, setIsParsing] = useState(false);
  const [parsedItems, setParsedItems] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsParsing(true);
    setParsedItems(null);
    setSuccessMsg('');
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const csvContent = XLSX.utils.sheet_to_csv(worksheet);

      const parsePriceListDocument = httpsCallable(functions, 'parsePriceListDocument');
      const response = await parsePriceListDocument({ priceListText: csvContent });

      if (response.data.success) {
        setParsedItems(response.data.items);
      } else {
        toast.error("Failed to parse Price List: " + response.data.error);
      }
    } catch (err) {
      console.error("Parse Error:", err);
      toast.error("Error parsing document.");
    }
    setIsParsing(false);
  };

  const handleCommitChanges = async () => {
    if (!parsedItems) return;
    setIsSaving(true);
    try {
      const batch = writeBatch(db);
      let updatesCount = 0;

      for (const item of parsedItems) {
        if (item.productId && !item.requires_creation && item.new_cost !== undefined) {
          const productRef = doc(db, 'products', item.productId);
          batch.update(productRef, {
            costPrice: parseFloat(item.new_cost),
            updatedAt: new Date()
          });
          updatesCount++;
        }
      }

      if (updatesCount > 0) {
        await batch.commit();
        setSuccessMsg(`Successfully updated base costs for ${updatesCount} products.`);
        setParsedItems(null);
      } else {
        toast("No matched products to update.");
      }
    } catch (err) {
      console.error("Update Error:", err);
      toast.error("Error updating products.");
    }
    setIsSaving(false);
  };

  return (
    <Card style={{ padding: '1.5rem', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)', marginTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Sparkles style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-primary)' }} />
            Supplier Price List AI Parser
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: '0.25rem 0 0' }}>Upload a supplier's raw catalog to automatically update baseline costs in the system.</p>
        </div>
      </div>

      {!parsedItems ? (
        <div style={{ border: '2px dashed var(--color-border)', borderRadius: '0.75rem', padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          {isParsing ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <Loader2 style={{ width: '2.5rem', height: '2.5rem', color: 'var(--color-primary)', animation: 'spin 1s linear infinite' }} />
              <p style={{ color: 'var(--color-text-secondary)', fontWeight: '500', margin: 0 }}>Gemini 2.5 Flash is extracting prices...</p>
            </div>
          ) : (
            <>
              <Upload style={{ width: '3rem', height: '3rem', color: 'var(--color-text-tertiary)', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: '0.5rem', marginTop: 0 }}>Upload Price List (Excel/CSV)</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', maxWidth: '24rem' }}>The AI will extract items, dosages, and unit costs, then match them to your catalog.</p>
              <label style={{ backgroundColor: 'var(--color-text-primary)', color: 'var(--color-surface)', padding: '0.625rem 1.5rem', borderRadius: '0.5rem', fontWeight: '500', cursor: 'pointer', transition: 'background-color 0.2s', display: 'inline-block' }}>
                Select File
                <input type="file" accept=".xlsx, .xls, .csv" style={{ display: 'none' }} onChange={handleFileUpload} />
              </label>
            </>
          )}
          {successMsg && <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success, #4ade80)' }}><CheckCircle style={{ width: '1.25rem', height: '1.25rem' }}/> {successMsg}</div>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="gcp-table-container">
            <DataTable
              columns={[
                {
                  key: 'original_text',
                  header: 'Original Text',
                  render: (val) => <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{val}</span>
                },
                {
                  key: 'extracted',
                  header: 'Extracted Name',
                  render: (val, item) => <span style={{ fontWeight: '500' }}>{item.peptide_name} {item.dosage}</span>
                },
                {
                  key: 'productId',
                  header: 'Matched Catalog ID',
                  render: (val) => val ? (
                    <span style={{ color: 'var(--color-success, #4ade80)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle style={{ width: '0.75rem', height: '0.75rem' }}/> {val}</span>
                  ) : (
                    <span style={{ color: 'var(--color-warning, #facc15)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><AlertTriangle style={{ width: '0.75rem', height: '0.75rem' }}/> Requires Creation</span>
                  )
                },
                {
                  key: 'new_cost',
                  header: 'New Base Cost',
                  render: (val) => <span style={{ fontWeight: '500', color: 'var(--color-primary)' }}>${Number(val).toFixed(2)}</span>
                }
              ]}
              data={parsedItems}
              keyField={(row, idx) => idx.toString()}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'flex-end' }}>
            <button 
              onClick={() => setParsedItems(null)}
              style={{ padding: '0.5rem 1rem', color: 'var(--color-text-secondary)', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button 
              onClick={handleCommitChanges}
              disabled={isSaving}
              style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', cursor: 'pointer', opacity: isSaving ? 0.5 : 1 }}
            >
              {isSaving ? <Loader2 style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} /> : <Sparkles style={{ width: '1rem', height: '1rem' }} />}
              {isSaving ? 'Updating Catalog...' : 'Confirm & Update Base Costs'}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}