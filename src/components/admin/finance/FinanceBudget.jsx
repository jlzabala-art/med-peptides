import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { usePreferences } from '../../../context/PreferencesContext';
import SkeletonLoader from '../../ui/SkeletonLoader';
import AnimatedNumber from '../../ui/AnimatedNumber';
import { Target, AlertTriangle, TrendingDown, Download } from 'lucide-react';
import { exportToCSV } from '../../../utils/exportUtils';

export default function FinanceBudget({ dashboardData }) {
  const { formatCurrency, density } = usePreferences();
  
  const budgetMap = useMemo(() => {
    if (dashboardData && dashboardData.profitAndLoss) {
      const expenses = dashboardData.profitAndLoss.expenses || {};
      const mktg = expenses['Marketing'] || 15400;
      const rnd = expenses['Research and Development'] || 8200;
      const ops = expenses['Software'] || 12500;
      
      return {
        'Marketing': { actual: mktg, limit: 25000, color: '#3b82f6', icon: '📈' },
        'R&D': { actual: rnd, limit: 10000, color: '#f59e0b', icon: '🔬' },
        'Software & Ops': { actual: ops, limit: 10000, color: '#ef4444', icon: '💻' }
      };
    }
    // Default fallback
    return {
      'Marketing': { actual: 15400, limit: 25000, color: '#3b82f6', icon: '📈' },
      'R&D': { actual: 8200, limit: 10000, color: '#f59e0b', icon: '🔬' },
      'Software & Ops': { actual: 12500, limit: 10000, color: '#ef4444', icon: '💻' }
    };
  }, [dashboardData]);

  const pieData = Object.entries(budgetMap).map(([name, data]) => ({
    name,
    value: data.actual,
    color: data.color
  }));

  const totalSpent = pieData.reduce((acc, curr) => acc + curr.value, 0);
  const totalBudget = Object.values(budgetMap).reduce((acc, curr) => acc + curr.limit, 0);
  const totalPct = Math.round((totalSpent / totalBudget) * 100);

  return (
    <div className="anim-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Top Banner */}
      <div className="glass-card-premium" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '1.5rem', background: 'var(--surface-raised)' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: 'var(--primary)' }}>
            <Target style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
            Quarterly Operating Budget
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.25rem 0 0.75rem 0' }}>Tracked against approved Q3 limits with real-time Zoho sync</p>
          <button 
            onClick={() => exportToCSV(pieData, 'quarterly_budget', [
              { header: 'Department', accessor: 'name' },
              { header: 'Actual Spent (USD)', accessor: 'value' },
              { header: 'Budget Limit (USD)', accessor: (row) => budgetMap[row.name].limit },
              { header: 'Variance', accessor: (row) => budgetMap[row.name].limit - row.value }
            ])}
            className="gcp-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            title="Export Budget to CSV"
          >
            <Download style={{ width: '16px', height: '16px' }} />
            Export
          </button>
        </div>
        
        <div style={{ background: 'var(--surface)', padding: '0.75rem 1.5rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Total Spent</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)' }}>
              <AnimatedNumber value={totalSpent} isCurrency={true} />
            </div>
          </div>
          <div style={{ width: '1px', height: '40px', background: 'var(--border)' }} />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Total Budget</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-muted)' }}>
              {formatCurrency(totalBudget)}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        
        {/* Progress Bars */}
        <div style={{ flex: '2', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {!dashboardData ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <SkeletonLoader height="80px" />
              <SkeletonLoader height="80px" />
              <SkeletonLoader height="80px" />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {Object.entries(budgetMap).map(([name, data]) => {
                const pct = Math.min(Math.round((data.actual / data.limit) * 100), 100);
                const isOver = data.actual > data.limit;
                const isWarning = data.actual > (data.limit * 0.75) && !isOver;
                
                return (
                  <div key={name} className="glass-card-premium" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', border: '1px solid var(--border)' }}>
                          {data.icon}
                        </div>
                        <div>
                          <h4 style={{ fontWeight: '800', margin: 0, color: 'var(--primary)' }}>{name}</h4>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', margin: 0 }}>Limit: {formatCurrency(data.limit)}</p>
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.125rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end', color: isOver ? 'var(--error)' : isWarning ? 'var(--warning)' : 'var(--primary)' }}>
                          {isOver && <AlertTriangle style={{ width: '16px', height: '16px' }} />}
                          <AnimatedNumber value={data.actual} isCurrency={true} />
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800' }}>{pct}% Consumed</div>
                      </div>
                    </div>
                    
                    <div className="finance-progress-bg" style={{ background: 'var(--surface-raised)' }}>
                      <div 
                        className="finance-progress-bar"
                        style={{ 
                          width: `${pct}%`, 
                          backgroundColor: isOver ? 'var(--error)' : isWarning ? 'var(--warning)' : data.color 
                        }}
                      >
                      </div>
                    </div>
                    
                    {isOver && (
                      <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--error)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(220, 38, 38, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                        <TrendingDown style={{ width: '16px', height: '16px' }} />
                        Budget exceeded by {formatCurrency(data.actual - data.limit)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Breakdown Chart */}
        <div className="glass-card-premium" style={{ background: 'var(--primary)', color: 'white', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
          <div>
            <h4 style={{ fontWeight: '800', fontSize: '1.125rem', margin: '0 0 0.25rem 0', color: 'white' }}>Cost Breakdown</h4>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>Distribution of actual spend</p>
          </div>
          
          <div style={{ height: '260px', width: '100%', margin: '1rem 0', position: 'relative', zIndex: 10 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%" 
                  innerRadius={70} 
                  outerRadius={100} 
                  paddingAngle={5}
                  dataKey="value"
                  stroke="rgba(0,0,0,0)"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(v) => formatCurrency(v)}
                  contentStyle={{ backgroundColor: 'var(--primary)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', color: '#fff', boxShadow: 'var(--shadow-lg)' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <span style={{ fontSize: '1.875rem', fontWeight: '800' }}>{totalPct}%</span>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '800', textTransform: 'uppercase' }}>Utilized</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative', zIndex: 10 }}>
            {pieData.map(item => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color }} />
                  <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>{item.name}</span>
                </div>
                <span style={{ fontWeight: '800' }}>{Math.round((item.value / totalSpent) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}