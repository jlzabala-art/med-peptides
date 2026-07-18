"use client";

import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import PlusCircle from "lucide-react/dist/esm/icons/plus-circle";
import FileUp from "lucide-react/dist/esm/icons/file-up";
import Settings2 from "lucide-react/dist/esm/icons/settings-2";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAIContext } from '../../context/AIContext';
import { useFinanceData } from '../../hooks/useFinanceData';
import FinanceOverview from './finance/FinanceOverview';
import FinanceBudget from './finance/FinanceBudget';
import FinancePayables from './finance/FinancePayables';
import FinanceApprovals from './finance/FinanceApprovals';
import FinanceEconomics from './finance/FinanceEconomics';
import FinanceReporting from './finance/FinanceReporting';
import UploadInvoiceModal from './finance/UploadInvoiceModal';
import PageHeader from '../ui/PageHeader';
import SkeletonLoader from '../ui/SkeletonLoader';

export default function AdminFinanceTab({ isSubTab = false, activeSubTab }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(activeSubTab || 'budget');
  const { setPageContext, clearPageContext } = useAIContext();
  const { data, loading, forceRefresh, error } = useFinanceData();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('YTD');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // We unpack the cached data or default to empty values to prevent crashes while loading
  const dashboardData = data?.dashboardData || null;
  const totalBalance = data?.totalBalance || 0;
  const activeSubs = data?.activeSubs || 0;

  useEffect(() => {
    if (loading) return;
    const mrr = activeSubs * 299;
    // Inject unpaid invoices context for AI
    const unpaidInvoices = dashboardData?.pendingInvoices || [];
    const topUnpaid = unpaidInvoices.slice(0, 5).map(inv => `${inv.customer_name} (${inv.balance} AED due ${inv.due_date})`);
    let currentPrompts = [];
    if (activeTab === 'reporting') {
      currentPrompts = [
        { label: 'P&L Analysis', prompt: 'Analiza el Profit and Loss del 2026 e identifica tendencias de ingresos y gastos.' },
        { label: 'Comparative Q1 vs Q2', prompt: 'Haz un análisis comparativo entre Q1 y Q2 de 2026, destacando la variación del beneficio neto.' }
      ];
    } else if (activeTab === 'payables' || activeTab === 'overview') {
      currentPrompts = [
        { label: 'Risk Analysis', prompt: 'Which unpaid invoices are at highest risk of default based on history?' },
        { label: 'Draft Reminder', prompt: 'Draft a polite payment reminder email for the top unpaid invoice.' },
        { label: 'Cash Flow Forecast', prompt: 'Based on pending invoices, what is our expected cash flow next week?' }
      ];
    } else {
      currentPrompts = [
        { label: 'Budget Overview', prompt: 'What is our current cash runway and MRR?' },
        { label: 'Cost Optimization', prompt: 'Are there any budget categories where we are overspending?' }
      ];
    }

    setPageContext({
      financial_context: {
        active_tab: activeTab,
        total_cash_balance: totalBalance,
        active_subscriptions: activeSubs,
        mrr: mrr,
        arr: mrr * 12,
        budget_alerts: 'Software category is over budget at 125%',
        cash_runway_months: (totalBalance / 35000).toFixed(1),
        unpaid_invoices_count: unpaidInvoices.length,
        unpaid_invoices_top_5: topUnpaid,
        pnl2026_data: dashboardData?.pnl2026 || null
      },
      ai_suggested_prompts: currentPrompts
    });
    return () => clearPageContext();
  }, [loading, totalBalance, activeSubs, dashboardData, activeTab, setPageContext, clearPageContext]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await forceRefresh();
    setIsRefreshing(false);
  };

  const renderContent = () => {
    if (loading && !data) {
      return (
        <div className="p-8 space-y-4">
          <SkeletonLoader height="40px" />
          <SkeletonLoader height="200px" />
          <SkeletonLoader height="300px" />
        </div>
      );
    }
    if (error && !data) {
      return <div className="p-8 text-center text-red-500 font-medium">Failed to load CFO Dashboard. Please refresh.</div>;
    }

    switch(activeTab) {
      case 'overview': return <FinanceOverview dashboardData={dashboardData} totalBalance={totalBalance} activeSubs={activeSubs} />;
      case 'budget': return <FinanceBudget dashboardData={dashboardData} />;
      case 'payables': return <FinancePayables dashboardData={dashboardData} />;
      case 'approvals': return <FinanceApprovals dashboardData={dashboardData} />;
      case 'economics': return <FinanceEconomics dashboardData={dashboardData} />;
      case 'reporting': return <FinanceReporting dashboardData={dashboardData} totalBalance={totalBalance} activeSubs={activeSubs} />;
      default: return null;
    }
  };

  return (
    <div className="admin-finance-root anim-fade-up" style={{ padding: isSubTab ? '0' : undefined }}>

      {!isSubTab && (
        <PageHeader
          title="CFO Intelligence Hub"
          subtitle="Real-time financial synchronization and predictive modeling."
          icon={TrendingUp}
          actions={
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-raised)', borderRadius: '8px', padding: '0.25rem 0.5rem', border: '1px solid var(--border)' }}>
                <Calendar style={{ width: '16px', height: '16px', color: 'var(--text-muted)', marginRight: '0.5rem' }} />
                <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="admin-premium-select" style={{ border: 'none', background: 'transparent', padding: '0', cursor: 'pointer' }}>
                  <option value="THIS_MONTH">This Month</option>
                  <option value="Q1">Q1 2026</option>
                  <option value="Q2">Q2 2026</option>
                  <option value="YTD">Year to Date (YTD)</option>
                  <option value="LAST_12">Last 12 Months</option>
                </select>
              </div>
              <button onClick={handleRefresh} disabled={loading || isRefreshing} className="admin-quick-btn">
                <RefreshCw style={{ width: '16px', height: '16px' }} className={isRefreshing ? 'spinner-icon' : ''} />
                <span>{isRefreshing ? 'Syncing...' : 'Force Sync'}</span>
              </button>
            </div>
          }
        />
      )}

      {/* Financial Quick Action Bar */}
      <div className="glass-card-premium" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', padding: '1rem', marginBottom: '2rem' }}>
        <button className="gcp-btn-secondary" style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}>
          <PlusCircle style={{ width: '16px', height: '16px' }} />
          Log Manual Payment
        </button>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="gcp-btn-secondary" style={{ color: 'var(--success)', borderColor: 'var(--success)' }}
        >
          <FileUp style={{ width: '16px', height: '16px' }} />
          Upload Invoice
        </button>
        <button className="gcp-btn-secondary" style={{ marginLeft: 'auto' }}>
          <Settings2 style={{ width: '16px', height: '16px' }} />
          Adjust Budget
        </button>
      </div>

      {/* Finance Content Area */}
      <div className="admin-table-container" style={{ padding: '2rem', minHeight: '600px' }}>
        {renderContent()}
      </div>

      {showUploadModal && (
        <UploadInvoiceModal 
          onClose={() => setShowUploadModal(false)} 
          onComplete={() => {
            handleRefresh();
          }} 
        />
      )}
    </div>
  );
}