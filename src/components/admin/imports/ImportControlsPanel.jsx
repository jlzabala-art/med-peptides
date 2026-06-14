import UploadCloud from "lucide-react/dist/esm/icons/upload-cloud";
import Settings from "lucide-react/dist/esm/icons/settings";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Database from "lucide-react/dist/esm/icons/database";
import React, { useRef } from 'react';





const IMPORT_SOURCES = [
  'Supplier Catalog', 'Price List', 'Inventory Report', 
  'COA Package', 'Regulatory Package', 'Protocol Template', 
  'Zoho Export', 'Manual Product Sheet'
];

const IMPORT_PROFILES = [
  'Peptide Supplier', 'API Manufacturer', 'Supplement Vendor', 
  'Compounding Pharmacy', 'Wholesaler', 'Clinic Inventory', 'Custom Profile'
];

export default function ImportControlsPanel({ 
  onFileUpload, 
  isAnalyzing,
  rules,
  setRules,
  source,
  setSource,
  profile,
  setProfile
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
      // Reset input so the same file can be selected again if needed
      e.target.value = null;
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Upload Area */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UploadCloud size={18} color="var(--primary)" /> Upload Catalog
        </h3>
        <div 
          onDragOver={e => e.preventDefault()} 
          onDrop={handleDrop}
          onClick={() => !isAnalyzing && fileInputRef.current?.click()}
          style={{ 
            border: '2px dashed var(--border)', borderRadius: '8px', padding: '2rem 1rem', 
            textAlign: 'center', cursor: isAnalyzing ? 'not-allowed' : 'pointer',
            backgroundColor: isAnalyzing ? '#f8fafc' : 'white', transition: 'all 0.2s'
          }}
          className={!isAnalyzing ? "hover-card-subtle" : ""}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          />
          <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'var(--color-bg-hover)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            <FileText size={24} />
          </div>
          <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            {isAnalyzing ? 'Processing File...' : 'Click or drag file to upload'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Supports CSV, Excel (.xlsx, .xls)
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings size={18} color="var(--primary)" /> Import Configuration
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="gcp-label">Import Source</label>
            <select className="gcp-input" value={source} onChange={e => setSource(e.target.value)} disabled={isAnalyzing}>
              {IMPORT_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="gcp-label">Target Profile</label>
            <select className="gcp-input" value={profile} onChange={e => setProfile(e.target.value)} disabled={isAnalyzing}>
              {IMPORT_PROFILES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* AI Rules */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database size={18} color="var(--primary)" /> Atlas AI Rule Presets
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { id: 'match', label: 'Match Existing Products' },
            { id: 'create', label: 'Create Missing Products' },
            { id: 'updatePrice', label: 'Update Supplier Pricing' },
            { id: 'updateStock', label: 'Update Inventory' },
            { id: 'extractCoa', label: 'Extract COAs' },
            { id: 'generateImages', label: 'Generate Product Images' },
            { id: 'syncZoho', label: 'Sync With Zoho' },
          ].map(rule => (
            <label key={rule.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-main)', cursor: isAnalyzing ? 'not-allowed' : 'pointer' }}>
              <input 
                type="checkbox" 
                checked={rules[rule.id]} 
                onChange={(e) => setRules(prev => ({ ...prev, [rule.id]: e.target.checked }))}
                disabled={isAnalyzing}
                style={{ width: '16px', height: '16px', cursor: isAnalyzing ? 'not-allowed' : 'pointer' }}
              />
              {rule.label}
            </label>
          ))}
        </div>
      </div>

    </div>
  );
}