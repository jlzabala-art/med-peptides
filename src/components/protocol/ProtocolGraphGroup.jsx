/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import ProtocolHeaderCharts from './ProtocolHeaderCharts';

const ProtocolGraphGroup = ({ protocol, phaseBlocks, compounds, dominantUnit, isIntensityMode }) => {
  const [activeTab, setActiveTab] = useState('peptides');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Split compounds into peptides and supplements
  const peptideCompounds = compounds.filter(c => {
    const cleanId = c.name.toLowerCase().replace('prd_', '').replace(/[^a-z0-9]/g, '');
    // Simple heuristic: if it's in the registry as a supplement, or doesn't have stability info
    // In a real app, we'd have a 'type' field in the registry.
    return !['vitamin-d3', 'magnesium-threonate', 'berberine', 'omega-3', 'nac', 'coq10'].includes(cleanId);
  });

  const supplementCompounds = compounds.filter(c => !peptideCompounds.includes(c));

  const renderPeptides = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-sm font-bold text-cyan-400/80 uppercase tracking-widest">Peptide Kinetics</h4>
        <span className="text-[10px] text-slate-500 font-mono">Dose Escalation / Clearance</span>
      </div>
      <ProtocolHeaderCharts 
        protocol={protocol}
        overrideCompounds={peptideCompounds}
        compact={true}
      />
    </div>
  );

  const renderSupplements = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-sm font-bold text-emerald-400/80 uppercase tracking-widest">Supplement Support</h4>
        <span className="text-[10px] text-slate-500 font-mono">Daily Foundation</span>
      </div>
      {supplementCompounds.length > 0 ? (
        <ProtocolHeaderCharts 
          protocol={protocol}
          overrideCompounds={supplementCompounds}
          compact={true}
        />
      ) : (
        <div className="bg-slate-900/50 rounded-xl p-8 border border-dashed border-slate-800 text-center">
          <p className="text-slate-500 text-sm italic">No supplementary compounds defined for this protocol.</p>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div className="space-y-6">
        <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-4">
          <details open className="group">
            <summary className="list-none cursor-pointer flex items-center justify-between text-slate-200 font-bold py-2">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]"></span>
                Peptides
              </span>
              <span className="text-slate-500 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-4 pt-4 border-t border-slate-800/50">
              {renderPeptides()}
            </div>
          </details>
        </div>

        <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-4">
          <details className="group">
            <summary className="list-none cursor-pointer flex items-center justify-between text-slate-200 font-bold py-2">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span>
                Supplements
              </span>
              <span className="text-slate-500 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-4 pt-4 border-t border-slate-800/50">
              {renderSupplements()}
            </div>
          </details>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 rounded-3xl border border-slate-800 p-6 backdrop-blur-xl shadow-2xl">
      <div className="flex gap-2 p-1 bg-slate-950/50 rounded-2xl border border-slate-800 mb-8 w-fit mx-auto">
        <button
          onClick={() => setActiveTab('peptides')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'peptides'
              ? 'bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.3)]'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
          }`}
        >
          Peptides
        </button>
        <button
          onClick={() => setActiveTab('supplements')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'supplements'
              ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(52,211,153,0.3)]'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
          }`}
        >
          Supplements
        </button>
      </div>

      <div className="min-h-[300px] transition-all duration-300">
        {activeTab === 'peptides' ? renderPeptides() : renderSupplements()}
      </div>
    </div>
  );
};

export default ProtocolGraphGroup;
