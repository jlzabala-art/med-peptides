import React, { useState, useEffect } from 'react';
import { Download, AlertTriangle, Bug, HardDrive, LayoutList, BookOpen, AlertCircle } from 'lucide-react';
import { relationshipAuditService } from '../services/relationshipAuditService';
import { exportService } from '../services/exportService';
import { useAuth } from '../context/AuthContext';

export default function DataToolsPage() {
  const { isAdmin } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [auditReport, setAuditReport] = useState(null);
  
  const [exportModes, setExportModes] = useState({
    products: 'raw',
    protocols: 'raw',
    faqs: 'raw'
  });

  useEffect(() => {
    async function loadAudit() {
      if (!isAdmin) return;
      try {
        const report = await relationshipAuditService.generateAuditReport();
        setAuditReport(report);
      } catch (err) {
        console.error("Audit load failed:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAudit();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="p-12 text-center text-[var(--color-primary)]">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <h2 className="text-xl font-bold tracking-tight">Access Restricted</h2>
        <p className="opacity-70 mt-2">Administrator privileges required.</p>
      </div>
    );
  }

  const handleExport = async (entity) => {
    setExporting(true);
    try {
      const mode = exportModes[entity];
      let data = [];
      let filename = `export_${entity}_${mode}_${new Date().toISOString().split('T')[0]}.json`;

      switch (entity) {
        case 'products':
          data = await exportService.exportProducts(mode);
          break;
        case 'protocols':
          data = await exportService.exportProtocols(mode);
          break;
        case 'faqs':
          data = await exportService.exportFaqs(mode);
          break;
      }

      // Create downloadable JSON blob
      const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(jsonBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Export failed for ${entity}:`, err);
      alert(`Export failed: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  const updateMode = (entity, mode) => {
    setExportModes(prev => ({ ...prev, [entity]: mode }));
  };

  if (loading) {
    return (
      <div className="p-12 flex justify-center items-center h-[50vh]">
        <div className="w-8 h-8 rounded-full border-t-2 border-[var(--color-accent)] animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 border-b border-[var(--color-border)] pb-6 flex items-center gap-4">
        <HardDrive className="w-8 h-8 text-[var(--color-accent)]" />
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-primary)] tracking-tight">Data Tools & Export</h1>
          <p className="text-[var(--color-primary)] opacity-70 mt-1">Structural audit and deep JSON export capabilities.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Export Modules */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard 
            icon={<Bug className="w-5 h-5" />} 
            title="Products Catalog" 
            count={auditReport?.summary?.totalProducts || 0}
            mode={exportModes.products}
            setMode={(m) => updateMode('products', m)}
            onExport={() => handleExport('products')}
            exporting={exporting}
            warningCount={auditReport?.warnings?.filter(w => w.type.includes('PRODUCT'))?.length || 0}
          />

          <SectionCard 
            icon={<LayoutList className="w-5 h-5" />} 
            title="Clinical Protocols" 
            count={auditReport?.summary?.totalProtocols || 0}
            mode={exportModes.protocols}
            setMode={(m) => updateMode('protocols', m)}
            onExport={() => handleExport('protocols')}
            exporting={exporting}
            warningCount={auditReport?.issues?.filter(i => i.type.includes('PROTOCOL'))?.length || 0}
          />

          <SectionCard 
            icon={<BookOpen className="w-5 h-5" />} 
            title="FAQ & Knowledge" 
            count={auditReport?.summary?.totalFaqs || 0}
            mode={exportModes.faqs}
            setMode={(m) => updateMode('faqs', m)}
            onExport={() => handleExport('faqs')}
            exporting={exporting}
            warningCount={auditReport?.issues?.filter(i => i.type.includes('FAQ'))?.length || 0}
          />
        </div>

        {/* Right Col: Audit Summary */}
        <div className="lg:col-span-1 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] p-6 self-start shadow-sm">
          <h2 className="text-xl font-bold text-[var(--color-primary)] mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[var(--color-accent)]" />
            Relationship Audit
          </h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)] border-opacity-50">
              <span className="text-sm opacity-70">Total Products</span>
              <span className="font-mono text-sm">{auditReport?.summary?.totalProducts || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)] border-opacity-50">
              <span className="text-sm opacity-70">Total Protocols</span>
              <span className="font-mono text-sm">{auditReport?.summary?.totalProtocols || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)] border-opacity-50">
              <span className="text-sm opacity-70">Total FAQs</span>
              <span className="font-mono text-sm">{auditReport?.summary?.totalFaqs || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)] border-opacity-50">
              <span className="text-sm opacity-70">FAQ Mapping Links</span>
              <span className="font-mono text-sm">{auditReport?.summary?.totalFaqMappings || 0}</span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-red-400 mb-2 uppercase tracking-wide flex items-center justify-between">
              Critical Issues 
              <span className="bg-red-400/20 text-red-400 px-2 py-0.5 rounded-full text-xs">
                {auditReport?.issues?.length || 0}
              </span>
            </h3>
            {auditReport?.issues?.length === 0 ? (
              <p className="text-sm opacity-60 italic text-[var(--color-primary)]">No severe breaks detected.</p>
            ) : (
              <div className="max-h-64 overflow-y-auto pr-2 space-y-2">
                {auditReport?.issues?.map((issue, idx) => (
                  <div key={idx} className="p-2 border border-red-500/20 bg-red-500/5 rounded text-xs text-red-300">
                    <span className="font-bold">{issue.type.replace(/_/g, ' ')}</span>
                    <div className="mt-1 opacity-80 break-all">{issue.invalidReference || issue.refId}</div>
                  </div>
                ))}
              </div>
            )}
            
            <h3 className="text-sm font-semibold text-orange-400 mt-6 mb-2 uppercase tracking-wide flex items-center justify-between">
              Warnings
              <span className="bg-orange-400/20 text-orange-400 px-2 py-0.5 rounded-full text-xs">
                {auditReport?.warnings?.length || 0}
              </span>
            </h3>
            {auditReport?.warnings?.length === 0 ? (
              <p className="text-sm opacity-60 italic text-[var(--color-primary)]">Healthy data structures.</p>
            ) : (
               <div className="max-h-48 overflow-y-auto pr-2 space-y-2">
                {auditReport?.warnings?.map((warn, idx) => (
                  <div key={idx} className="p-2 border border-orange-500/30 bg-orange-500/5 rounded text-xs text-orange-300">
                    <span className="font-bold">{warn.type.replace(/_/g, ' ')}</span>
                    <div className="mt-1 opacity-80 break-all">{warn.name || warn.title || warn.refId}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function SectionCard({ icon, title, count, mode, setMode, onExport, exporting, warningCount }) {
  return (
    <div className="border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
      
      <div className="flex gap-4 items-start sm:items-center">
        <div className="p-3 bg-[var(--color-surface-hover)] rounded-lg text-[var(--color-accent)]">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-bold text-[var(--color-primary)]">{title}</h3>
          <div className="flex items-center gap-3 mt-1 text-sm text-[var(--color-primary)] opacity-70">
            <span>{count} records</span>
            {warningCount > 0 && (
              <span className="text-orange-400 flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {warningCount} issues
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 sm:ml-auto">
        <div className="bg-[var(--color-background)] rounded-lg p-1 border border-[var(--color-border)] flex self-stretch sm:self-auto">
          <button 
            onClick={() => setMode('raw')}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-sm rounded-md transition-colors ${mode === 'raw' ? 'bg-[var(--color-surface-hover)] text-[var(--color-primary)] font-medium shadow-sm' : 'text-[var(--color-primary)] opacity-60 hover:opacity-100'}`}
          >
            Raw
          </button>
          <button 
            onClick={() => setMode('expanded')}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-sm rounded-md transition-colors ${mode === 'expanded' ? 'bg-[var(--color-surface-hover)] text-[var(--color-primary)] font-medium shadow-sm' : 'text-[var(--color-primary)] opacity-60 hover:opacity-100'}`}
          >
            Expanded
          </button>
        </div>

        <button 
          onClick={onExport}
          disabled={exporting}
          className="w-full sm:w-auto px-5 py-2.5 bg-[var(--color-accent)] text-white font-medium rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          Export JSON
        </button>
      </div>
    </div>
  );
}
