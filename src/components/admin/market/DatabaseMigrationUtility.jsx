import React, { useState } from 'react';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Loader2, DatabaseZap } from 'lucide-react';

export default function DatabaseMigrationUtility() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => setLogs(prev => [...prev, msg]);

  const normalizeDosage = (dosageStr, sku) => {
    if (!dosageStr) dosageStr = '';
    
    // Check if it's API (RAW)
    if ((sku || '').toUpperCase().includes('RAW') || (sku || '').toUpperCase().includes('API')) {
      return { format: 'API Peptide', dosage: 'Bulk', type: 'api_peptide', unit: 'gram' };
    }

    // Try to extract mg or mcg
    const combined = `${dosageStr} ${sku}`.toUpperCase();
    let mgMatch = combined.match(/(\d+(?:\.\d+)?)\s*MG/);
    let mcgMatch = combined.match(/(\d+(?:\.\d+)?)\s*MCG/);
    let iuMatch = combined.match(/(\d+(?:\.\d+)?)\s*IU/);

    let cleanDosage = null;
    if (mgMatch) cleanDosage = `${mgMatch[1]}mg`;
    else if (mcgMatch) cleanDosage = `${mcgMatch[1]}mcg`;
    else if (iuMatch) cleanDosage = `${iuMatch[1]}IU`;

    if (combined.includes('CAP') || combined.includes('TAB')) {
      return { format: 'Capsule / Tablet', dosage: cleanDosage || 'Capsule', type: 'capsule', unit: 'capsule' };
    }

    if (combined.includes('NASAL')) {
      return { format: 'Nasal Spray', dosage: cleanDosage || 'Spray', type: 'nasal', unit: 'bottle' };
    }

    // Default to Lyophilized if no other matches but it has mg/mcg
    if (cleanDosage) {
      return { format: 'Lyophilized Peptide', dosage: cleanDosage, type: 'lyophilized_peptide', unit: 'vial' };
    }

    return { format: 'Unknown', dosage: dosageStr || '-', type: 'unknown', unit: 'unit' };
  };

  const runMigration = async () => {
    setLoading(true);
    setLogs([]);
    addLog("Starting migration scan...");

    try {
      const productsRef = collection(db, 'products');
      const productsSnap = await getDocs(productsRef);
      addLog(`Found ${productsSnap.size} products.`);

      let batch = writeBatch(db);
      let batchCount = 0;
      let updateCount = 0;

      for (const pDoc of productsSnap.docs) {
        const variantsRef = collection(db, 'products', pDoc.id, 'variants');
        const variantsSnap = await getDocs(variantsRef);

        variantsSnap.forEach(vDoc => {
          const vData = vDoc.data();
          const sku = vData.sku || '';
          const currentDosage = vData.dosage || (vData.strength && vData.strength.dosageLabel) || '';

          const normalized = normalizeDosage(currentDosage, sku);

          const updates = {};
          let needsUpdate = false;

          // Update format/type
          if (vData.productType !== normalized.type) {
            updates.productType = normalized.type;
            updates.formatLabel = normalized.format;
            needsUpdate = true;
          }

          // Update dosage
          if (!vData.strength || vData.strength.dosageLabel !== normalized.dosage || vData.dosage !== normalized.dosage) {
            updates.dosage = normalized.dosage;
            updates['strength.dosageLabel'] = normalized.dosage;
            needsUpdate = true;
          }

          // Update kit unit
          if (!vData.kit || vData.kit.unit !== normalized.unit) {
            updates['kit.unit'] = normalized.unit;
            needsUpdate = true;
          }

          if (needsUpdate) {
            batch.update(vDoc.ref, updates);
            batchCount++;
            updateCount++;
            addLog(`Updating [${sku}]: ${currentDosage} -> Format: ${normalized.format}, Dosage: ${normalized.dosage}`);
          }

          if (batchCount >= 400) {
            batch.commit();
            batch = writeBatch(db);
            batchCount = 0;
            addLog("Committed batch of 400.");
          }
        });
      }

      if (batchCount > 0) {
        await batch.commit();
      }

      addLog(`Migration complete! Successfully updated ${updateCount} variants.`);
    } catch (e) {
      addLog(`Error: ${e.message}`);
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DatabaseZap className="w-5 h-5 text-indigo-500" />
            Database Normalization Utility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            This utility scans all product variants in Firestore and normalizes their formats (e.g., Lyophilized vs API) and dosages (e.g., 5mg/vial 5mg -&gt; 5mg) based on SKU strings and existing data.
          </p>

          <Button onClick={runMigration} disabled={loading} className="w-full sm:w-auto">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Execute Migration
          </Button>

          <div className="mt-6 bg-slate-950 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm text-green-400">
            {logs.length === 0 ? (
              <span className="text-gray-500">Awaiting execution...</span>
            ) : (
              logs.map((log, i) => <div key={i}>{log}</div>)
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
