import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { doc, writeBatch } from 'firebase/firestore';
import { db, functions } from '../../../firebase';
import * as XLSX from 'xlsx';
import { Upload, Loader2, Sparkles, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card } from '../../ui';

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
        alert("Failed to parse Price List: " + response.data.error);
      }
    } catch (err) {
      console.error("Parse Error:", err);
      alert("Error parsing document.");
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
        alert("No matched products to update.");
      }
    } catch (err) {
      console.error("Update Error:", err);
      alert("Error updating products.");
    }
    setIsSaving(false);
  };

  return (
    <Card className="p-6 border border-gray-800 bg-gray-900 text-white mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-fuchsia-400" />
            Supplier Price List AI Parser
          </h2>
          <p className="text-sm text-gray-400">Upload a supplier's raw catalog to automatically update baseline costs in the system.</p>
        </div>
      </div>

      {!parsedItems ? (
        <div className="border-2 border-dashed border-gray-700 rounded-xl p-10 flex flex-col items-center justify-center text-center">
          {isParsing ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-fuchsia-400 animate-spin" />
              <p className="text-gray-300 font-medium">Gemini 2.5 Flash is extracting prices...</p>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-200 mb-2">Upload Price List (Excel/CSV)</h3>
              <p className="text-sm text-gray-400 mb-6 max-w-sm">The AI will extract items, dosages, and unit costs, then match them to your catalog.</p>
              <label className="bg-white text-black px-6 py-2.5 rounded-lg font-medium cursor-pointer hover:bg-gray-200 transition-colors">
                Select File
                <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleFileUpload} />
              </label>
            </>
          )}
          {successMsg && <div className="mt-6 flex items-center gap-2 text-green-400"><CheckCircle className="w-5 h-5"/> {successMsg}</div>}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-400 uppercase bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4">Original Text</th>
                  <th className="px-6 py-4">Extracted Name</th>
                  <th className="px-6 py-4">Matched Catalog ID</th>
                  <th className="px-6 py-4">New Base Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {parsedItems.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-750">
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">{item.original_text}</td>
                    <td className="px-6 py-4 font-medium">{item.peptide_name} {item.dosage}</td>
                    <td className="px-6 py-4">
                      {item.productId ? (
                        <span className="text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> {item.productId}</span>
                      ) : (
                        <span className="text-yellow-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Requires Creation</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-fuchsia-400">
                      ${Number(item.new_cost).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-4 justify-end">
            <button 
              onClick={() => setParsedItems(null)}
              className="px-4 py-2 text-gray-300 hover:text-white font-medium
            >
              Cancel
            </button>
            <button 
              onClick={handleCommitChanges}
              disabled={isSaving}
              className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isSaving ? 'Updating Catalog...' : 'Confirm & Update Base Costs'}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

