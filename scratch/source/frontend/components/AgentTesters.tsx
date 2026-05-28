
import React, { useState, useRef } from 'react';
import { Upload, Play, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { agentServices } from '../services/geminiService';
import { AgentResponse } from '../types';

const ResultView: React.FC<{ response: AgentResponse }> = ({ response }) => {
  if (response.status === 'idle') return null;
  
  return (
    <div className="mt-6 border border-dark-800 rounded-lg bg-dark-950 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-dark-800 bg-dark-900">
        <span className="text-xs font-mono text-slate-400">Execution Result</span>
        {response.status === 'loading' && <Loader2 className="w-4 h-4 text-brand-500 animate-spin" />}
        {response.status === 'success' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500">{response.latency}ms</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
        )}
        {response.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
      </div>
      <div className="p-4">
        {response.status === 'loading' && <div className="text-sm text-slate-500 font-mono">Processing request via Vertex AI...</div>}
        {response.status === 'error' && <div className="text-sm text-red-400 font-mono">{response.error}</div>}
        {response.status === 'success' && (
          <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap overflow-x-auto">
            {typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

export const ClinicAITester: React.FC = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState<AgentResponse>({ status: 'idle' });

  const handleRun = async () => {
    if (!input) return;
    setResponse({ status: 'loading' });
    try {
      const res = await agentServices.runClinicAI(input);
      setResponse({ status: 'success', data: res.data, latency: res.latency });
    } catch (e: any) {
      setResponse({ status: 'error', error: e.message });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Input Query (Voice/Text/Search Simulation)</label>
        <textarea 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full h-32 bg-dark-950 border border-dark-800 rounded-md p-3 text-slate-200 font-mono text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
          placeholder="e.g., What are the clinical benefits of BPC-157?"
        />
      </div>
      <button 
        onClick={handleRun}
        disabled={response.status === 'loading' || !input}
        className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
      >
        <Play className="w-4 h-4" /> Execute AGENT_01
      </button>
      <ResultView response={response} />
    </div>
  );
};

export const PrescriptionTester: React.FC = () => {
  const [response, setResponse] = useState<AgentResponse>({ status: 'idle' });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      
      // Extract base64 data without prefix
      const base64Data = base64String.split(',')[1];
      
      setResponse({ status: 'loading' });
      try {
        const res = await agentServices.runPrescriptionIntake(base64Data, file.type);
        setResponse({ status: 'success', data: res.data, latency: res.latency });
      } catch (err: any) {
        setResponse({ status: 'error', error: err.message });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-dark-800 rounded-lg p-8 text-center hover:border-brand-500/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />
        <Upload className="w-8 h-8 text-slate-500 mx-auto mb-3" />
        <p className="text-sm text-slate-400 font-medium">Upload Prescription (PDF/Image)</p>
        <p className="text-xs text-slate-500 mt-1">Simulates intake pipeline</p>
      </div>
      
      {imagePreview && (
        <div className="w-32 h-32 rounded border border-dark-800 overflow-hidden">
          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover opacity-50" />
        </div>
      )}

      <ResultView response={response} />
    </div>
  );
};

export const ProtocolTester: React.FC = () => {
  const [goals, setGoals] = useState('Muscle recovery and joint health');
  const [budget, setBudget] = useState('$500/month');
  const [timeHorizon, setTimeHorizon] = useState('3 months');
  const [response, setResponse] = useState<AgentResponse>({ status: 'idle' });

  const handleRun = async () => {
    setResponse({ status: 'loading' });
    try {
      const res = await agentServices.runProtocolGenerator(goals, budget, timeHorizon);
      setResponse({ status: 'success', data: res.data, latency: res.latency });
    } catch (e: any) {
      setResponse({ status: 'error', error: e.message });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Health Goals</label>
          <input value={goals} onChange={e => setGoals(e.target.value)} className="w-full bg-dark-950 border border-dark-800 rounded p-2 text-slate-200 text-sm outline-none focus:border-brand-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Budget</label>
          <input value={budget} onChange={e => setBudget(e.target.value)} className="w-full bg-dark-950 border border-dark-800 rounded p-2 text-slate-200 text-sm outline-none focus:border-brand-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Time Horizon</label>
          <input value={timeHorizon} onChange={e => setTimeHorizon(e.target.value)} className="w-full bg-dark-950 border border-dark-800 rounded p-2 text-slate-200 text-sm outline-none focus:border-brand-500" />
        </div>
      </div>
      <button onClick={handleRun} disabled={response.status === 'loading'} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50">
        <Play className="w-4 h-4" /> Execute AGENT_03
      </button>
      <ResultView response={response} />
    </div>
  );
};

export const CatalogTester: React.FC = () => {
  const [input, setInput] = useState('Protocol requires BPC-157 5mg vials and bacteriostatic water.');
  const [response, setResponse] = useState<AgentResponse>({ status: 'idle' });

  const handleRun = async () => {
    setResponse({ status: 'loading' });
    try {
      const res = await agentServices.runCatalogIntelligence(input);
      setResponse({ status: 'success', data: res.data, latency: res.latency });
    } catch (e: any) {
      setResponse({ status: 'error', error: e.message });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Input (Protocol or Prescription Data)</label>
        <textarea 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full h-24 bg-dark-950 border border-dark-800 rounded-md p-3 text-slate-200 font-mono text-sm focus:border-brand-500 outline-none"
        />
      </div>
      <button onClick={handleRun} disabled={response.status === 'loading'} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50">
        <Play className="w-4 h-4" /> Execute AGENT_04
      </button>
      <ResultView response={response} />
    </div>
  );
};
