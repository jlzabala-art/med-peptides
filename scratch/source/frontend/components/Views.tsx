
import React, { useState } from 'react';
import { ClinicAITester, PrescriptionTester, ProtocolTester, CatalogTester } from './AgentTesters';
import { AgentType, MockDatabaseCollection } from '../types';
import { Database, Server, ShieldAlert } from 'lucide-react';

export const OrchestrationView: React.FC = () => {
  const [activeAgent, setActiveAgent] = useState<AgentType>(AgentType.CLINIC_AI);

  const agents = [
    { id: AgentType.CLINIC_AI, name: 'AGENT_01: ClinicAI', desc: 'Clinical explanations, no prescribing.' },
    { id: AgentType.PRESCRIPTION, name: 'AGENT_02: Prescription Intake', desc: 'Read Rx, build cart/quote.' },
    { id: AgentType.PROTOCOL, name: 'AGENT_03: Protocol Generator', desc: 'Goals -> Protocol & Shopping List.' },
    { id: AgentType.CATALOG, name: 'AGENT_04: Catalog Intelligence', desc: 'Match protocol to products.' },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Agent Orchestration Layer</h2>
        <p className="text-slate-400">Test and monitor the core AI agents powering the ClinicAI Platform.</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {agents.map(agent => (
          <button
            key={agent.id}
            onClick={() => setActiveAgent(agent.id)}
            className={`p-4 rounded-lg border text-left transition-all ${
              activeAgent === agent.id 
                ? 'bg-brand-900/20 border-brand-500 shadow-[0_0_15px_rgba(20,184,166,0.1)]' 
                : 'bg-dark-900 border-dark-800 hover:border-dark-700'
            }`}
          >
            <div className={`text-sm font-bold mb-1 ${activeAgent === agent.id ? 'text-brand-400' : 'text-slate-300'}`}>
              {agent.name}
            </div>
            <div className="text-xs text-slate-500 leading-relaxed">{agent.desc}</div>
          </button>
        ))}
      </div>

      <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 shadow-xl">
        <div className="mb-6 pb-4 border-b border-dark-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-brand-500" />
            Testing Environment: {agents.find(a => a.id === activeAgent)?.name}
          </h3>
          <span className="px-2 py-1 bg-dark-950 border border-dark-800 rounded text-xs font-mono text-slate-400">
            Model: gemini-2.5-flash
          </span>
        </div>
        
        {activeAgent === AgentType.CLINIC_AI && <ClinicAITester />}
        {activeAgent === AgentType.PRESCRIPTION && <PrescriptionTester />}
        {activeAgent === AgentType.PROTOCOL && <ProtocolTester />}
        {activeAgent === AgentType.CATALOG && <CatalogTester />}
      </div>
    </div>
  );
};

export const DataLayerView: React.FC = () => {
  const collections: MockDatabaseCollection[] = [
    { name: 'users', count: 12450, schema: ['uid', 'role', 'email', 'created_at'] },
    { name: 'patients', count: 8900, schema: ['uid', 'assigned_doctor', 'health_goals'] },
    { name: 'doctors', count: 350, schema: ['uid', 'license_no', 'specialty'] },
    { name: 'prescriptions', count: 45200, schema: ['id', 'patient_id', 'doctor_id', 'items', 'status'] },
    { name: 'protocols', count: 1200, schema: ['id', 'author_id', 'content', 'tags'] },
    { name: 'catalog', count: 850, schema: ['sku', 'name', 'price', 'in_stock', 'type'] },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Data Layer (Firestore)</h2>
        <p className="text-slate-400">Overview of primary database collections and schemas.</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {collections.map(col => (
          <div key={col.name} className="bg-dark-900 border border-dark-800 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-brand-500" />
                <h3 className="font-mono font-bold text-slate-200">{col.name}</h3>
              </div>
              <span className="text-xs bg-dark-950 px-2 py-1 rounded text-slate-400 border border-dark-800">
                {col.count.toLocaleString()} docs
              </span>
            </div>
            <div className="space-y-1">
              {col.schema.map(field => (
                <div key={field} className="text-xs font-mono text-slate-500 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-dark-700"></span>
                  {field}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ApiGatewayView: React.FC = () => {
  const endpoints = [
    { method: 'POST', path: '/chat', desc: 'Streams response from AGENT_01' },
    { method: 'POST', path: '/protocol', desc: 'Triggers AGENT_03 generation' },
    { method: 'POST', path: '/prescription', desc: 'Uploads PDF to AGENT_02' },
    { method: 'POST', path: '/cart', desc: 'Creates cart from catalog items' },
    { method: 'POST', path: '/quote', desc: 'Requests quote for compounded items' },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">API Gateway Contract</h2>
        <p className="text-slate-400">REST endpoints exposed to the Antigravity frontend.</p>
      </div>

      <div className="bg-dark-900 border border-dark-800 rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-dark-950 border-b border-dark-800">
              <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Method</th>
              <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Endpoint</th>
              <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Description</th>
              <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-800">
            {endpoints.map((ep, i) => (
              <tr key={i} className="hover:bg-dark-800/50 transition-colors">
                <td className="p-4">
                  <span className="px-2 py-1 bg-brand-900/30 text-brand-400 text-xs font-mono font-bold rounded border border-brand-900/50">
                    {ep.method}
                  </span>
                </td>
                <td className="p-4 font-mono text-sm text-slate-300">{ep.path}</td>
                <td className="p-4 text-sm text-slate-400">{ep.desc}</td>
                <td className="p-4">
                  <span className="flex items-center gap-1.5 text-xs text-emerald-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-8 p-4 bg-amber-950/20 border border-amber-900/50 rounded-lg flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-amber-500 mb-1">Frontend Contract Enforcement</h4>
          <p className="text-xs text-amber-400/80 leading-relaxed">
            No business logic is permitted in the Antigravity frontend. All intelligence, routing, and data mutation must occur within this backend orchestration layer. Frontend is strictly for rendering state and capturing user intent.
          </p>
        </div>
      </div>
    </div>
  );
};
