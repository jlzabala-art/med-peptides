import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import FinanceOverview from './finance/FinanceOverview';
import FinanceBudget from './finance/FinanceBudget';
import FinancePayables from './finance/FinancePayables';
import FinanceApprovals from './finance/FinanceApprovals';
import FinanceEconomics from './finance/FinanceEconomics';
import FinanceReporting from './finance/FinanceReporting';
import { LayoutDashboard, PieChart, CreditCard, ShieldAlert, TrendingUp, FileText } from 'lucide-react';

export default function AdminFinanceTab({ activeSubTab }) {
  const activeTab = activeSubTab || 'overview';
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

  useEffect(() => {
    if (loading) return;
    const mrr = activeSubs * 299;
    const payload = {
      financial_context: {
        total_cash_balance: totalBalance,
        active_subscriptions: activeSubs,
        mrr: mrr,
        arr: mrr * 12,
        budget_alerts: 'Software category is over budget at 125%',
        cash_runway_months: (totalBalance / 35000).toFixed(1)
      }
    };
    window.dispatchEvent(new CustomEvent('UPDATE_GLOBAL_CONTEXT', { detail: payload }));
    return () => window.dispatchEvent(new CustomEvent('UPDATE_GLOBAL_CONTEXT', { detail: null }));
  }, [loading, totalBalance, activeSubs]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading CFO Dashboard...</div>;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Finance Content Area (Full Width) */}
      <div className="w-full bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm min-h-[600px]">
        {activeTab === 'overview' && <FinanceOverview totalBalance={totalBalance} activeSubs={activeSubs} />}
        {activeTab === 'budget' && <FinanceBudget />}
        {activeTab === 'payables' && <FinancePayables />}
        {activeTab === 'approvals' && <FinanceApprovals />}
        { activeTab === 'economics' && <FinanceEconomics /> }
        { activeTab === 'reporting' && <FinanceReporting totalBalance={totalBalance} activeSubs={activeSubs} /> }
      </div>
    </div>
  );
}