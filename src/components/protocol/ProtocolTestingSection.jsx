 
import React from 'react';

const ProtocolTestingSection = ({ testingRequirements = [] }) => {
  return (
    <div className="bg-slate-900/50 rounded-xl p-4 mb-6 border border-slate-800 opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0 transition-all cursor-help">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
          <span className="p-1.5 bg-purple-400/10 rounded-lg">🔬</span>
          Clinical Testing Section
        </h3>
        <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-500 rounded uppercase tracking-tighter">Planned Feature</span>
      </div>
      
      {testingRequirements.length > 0 ? (
        <div className="space-y-3">
          {testingRequirements.map((test, idx) => (
            <div key={idx} className="bg-slate-800/20 p-3 rounded-lg border border-slate-700/20">
              <p className="text-slate-200 font-medium text-sm">{test.name}</p>
              <p className="text-xs text-slate-500 mt-1">{test.rationale}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 px-4 bg-slate-800/10 rounded-lg border border-dashed border-slate-700/30">
          <p className="text-slate-500 text-sm">No specific diagnostic tests are currently mandated for this protocol.</p>
          <p className="text-[11px] text-slate-600 mt-2 italic">Future updates will include relevant biomarker tracking recommendations.</p>
        </div>
      )}
    </div>
  );
};

export default ProtocolTestingSection;
