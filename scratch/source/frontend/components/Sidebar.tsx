
import React from 'react';
import { Activity, Database, Network, Shield, Settings, TerminalSquare } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'orchestration', label: 'Agent Orchestration', icon: Network },
    { id: 'api', label: 'API Gateway', icon: TerminalSquare },
    { id: 'data', label: 'Data Layer (Firestore)', icon: Database },
    { id: 'auth', label: 'Auth & Roles', icon: Shield },
    { id: 'monitoring', label: 'System Monitoring', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-dark-900 border-r border-dark-800 h-screen flex flex-col">
      <div className="p-6 border-b border-dark-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <Network className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">ClinicAI</h1>
            <p className="text-xs text-brand-500 font-mono">Platform Backend</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
                    isActive 
                      ? 'bg-brand-900/30 text-brand-500 border border-brand-900/50' 
                      : 'text-slate-400 hover:bg-dark-800 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-500' : 'text-slate-500'}`} />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-dark-800">
        <div className="bg-dark-950 rounded p-3 border border-dark-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-mono">Status</span>
            <span className="flex items-center gap-1 text-xs text-emerald-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Operational
            </span>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Region: us-central1<br/>
            Env: Production
          </div>
        </div>
      </div>
    </div>
  );
};
