const fs = require('fs');
const path = require('path');

const tabPath = path.join(__dirname, 'src/components/admin/AdminFinanceTab.jsx');

const newTabContent = `import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import FinanceOverview from './finance/FinanceOverview';
import FinanceBudget from './finance/FinanceBudget';
import FinancePayables from './finance/FinancePayables';
import FinanceApprovals from './finance/FinanceApprovals';
import FinanceEconomics from './finance/FinanceEconomics';
import { LayoutDashboard, PieChart, CreditCard, ShieldAlert, TrendingUp } from 'lucide-react';

export default function AdminFinanceTab() {
  const [activeTab, setActiveTab] = useState('overview');
  const [totalBalance, setTotalBalance] = useState(0);
  const [activeSubs, setActiveSubs] = useState(150); // Mock
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFinancials() {
      setLoading(true);
      try {
        // Mocking Zoho bank fetch for now since we don't have the Cloud Function logic fully active
        setTotalBalance(245600.50);
      } catch(err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchFinancials();
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview & Projections', icon: LayoutDashboard },
    { id: 'budget', label: 'Budgets & Variances', icon: PieChart },
    { id: 'payables', label: 'Payables & Payouts', icon: CreditCard },
    { id: 'approvals', label: 'Control & Approvals', icon: ShieldAlert },
    { id: 'economics', label: 'Unit Economics', icon: TrendingUp }
  ];

  if (loading) return <div className="p-8 text-center text-gray-500">Loading CFO Dashboard...</div>;

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Finance Navigation Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0 space-y-1">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-3">Finance Suite</h2>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={\`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors \${activeTab === t.id ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800'}\`}
          >
            <t.icon className={\`h-5 w-5 \${activeTab === t.id ? 'text-indigo-600' : 'text-gray-400'}\`} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Finance Content Area */}
      <div className="flex-1 bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm min-h-[600px]">
        {activeTab === 'overview' && <FinanceOverview totalBalance={totalBalance} activeSubs={activeSubs} />}
        {activeTab === 'budget' && <FinanceBudget />}
        {activeTab === 'payables' && <FinancePayables />}
        {activeTab === 'approvals' && <FinanceApprovals />}
        {activeTab === 'economics' && <FinanceEconomics />}
      </div>
    </div>
  );
}`;

fs.writeFileSync(tabPath, newTabContent, 'utf8');
console.log('Successfully refactored AdminFinanceTab.jsx to use sub-navigation layout.');
