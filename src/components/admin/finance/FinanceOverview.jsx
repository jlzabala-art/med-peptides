import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { TrendingUp, Activity, Bot, DollarSign, Clock, ShieldAlert } from 'lucide-react';
import { db, functions } from '../../../firebase';
import { httpsCallable } from 'firebase/functions';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export default function FinanceOverview({ dashboardData, totalBalance, activeSubs }) {
  const [supplierMarkup, setSupplierMarkup] = useState(5);
  const [marketingCut, setMarketingCut] = useState(0);
  
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastResult, setForecastResult] = useState(null);
  
  const mrr = activeSubs * 299;
  const arr = mrr * 12;
  const baseEbitda = arr * 0.45;
  
  const AED_RATE = 3.6725;
  const formatDual = (usdValue) => {
    if (usdValue == null) return "$0 / 0 AED";
    return `$${usdValue.toLocaleString('en-US', {maximumFractionDigits:0})} / ${(usdValue * AED_RATE).toLocaleString('en-US', {maximumFractionDigits:0})} AED`;
  };
  
  const monthlyBurn = 35000;
  const runwayMonths = (totalBalance / monthlyBurn).toFixed(1);

  const generateForecast = async () => {
    setForecastLoading(true);
    try {
      const predictiveCashFlow = httpsCallable(functions, 'predictiveCashFlow');
      const response = await predictiveCashFlow({ currentCash: totalBalance, mrr: mrr });
      setForecastResult(response.data);
    } catch (err) {
      console.error("Error generating forecast:", err);
      alert("Failed to generate forecast.");
    } finally {
      setForecastLoading(false);
    }
  };

  const [simLoading, setSimLoading] = useState(false);
  const [simResults, setSimResults] = useState(null);

  const runMonteCarlo = async () => {
    setSimLoading(true);
    try {
      const mcSim = httpsCallable(functions, 'runMonteCarloSimulations');
      const response = await mcSim({
        supplierMarkup,
        marketingCut,
        baseEbitda,
        mrr,
        cashBalance: dashboardData?.profitAndLoss?.net_profit || totalBalance
      });
      setSimResults(response.data);
    } catch (err) {
      console.error("Error running simulation:", err);
      alert("Failed to run Monte Carlo Simulation.");
    } finally {
      setSimLoading(false);
    }
  };

  const cashTrend = [{v: 120000}, {v: 135000}, {v: 130000}, {v: 150000}, {v: 145000}, {v: totalBalance}];
  const mrrTrend = [{v: 15000}, {v: 15500}, {v: 16200}, {v: 17000}, {v: 17800}, {v: mrr}];
  const runwayTrend = [{v: 4.5}, {v: 4.2}, {v: 4.8}, {v: 5.1}, {v: 5.0}, {v: runwayMonths}];

  const cashFlowData = [
    { month: 'Jan', revenue: 45000, expenses: 32000 },
    { month: 'Feb', revenue: 48000, expenses: 34000 },
    { month: 'Mar', revenue: 51000, expenses: 35000 },
    { month: 'Apr', revenue: 54000, expenses: 33000 },
    { month: 'May', revenue: 58000, expenses: 36000 },
    { month: 'Jun', revenue: 62000, expenses: 35000 },
  ];

  return (
    <div className="anim-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Key Metrics Dashboard */}
      <div className="finance-grid-3">
        <div className="glass-card-premium" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem', minHeight: '160px', borderTop: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '600', margin: 0 }}>Total Cash Balance</h3>
            <DollarSign style={{ width: '20px', height: '20px', color: 'var(--success)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: '1.875rem', fontWeight: '800', color: 'var(--primary)', lineHeight: 1.2 }}>
                {formatDual(dashboardData?.profitAndLoss?.net_profit || totalBalance)}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: '600', margin: '0.5rem 0 0 0' }}>Across all synced accounts</p>
            </div>
            <div style={{ width: '96px', height: '48px', opacity: 0.6 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashTrend}>
                  <Area type="monotone" dataKey="v" stroke="var(--success)" fillOpacity={0.1} fill="var(--success)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="glass-card-premium" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem', minHeight: '160px', borderTop: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '600', margin: 0 }}>MRR / ARR</h3>
            <TrendingUp style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: '1.875rem', fontWeight: '800', color: 'var(--primary)', lineHeight: 1.2 }}>{formatDual(mrr)}</div>
              <p style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: '600', margin: '0.5rem 0 0 0', background: 'rgba(59, 130, 246, 0.1)', display: 'inline-block', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>ARR: {formatDual(arr)}</p>
            </div>
            <div style={{ width: '96px', height: '48px', opacity: 0.6 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mrrTrend}>
                  <Area type="monotone" dataKey="v" stroke="#3b82f6" fillOpacity={0.1} fill="#3b82f6" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="glass-card-premium" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem', minHeight: '160px', borderTop: '4px solid var(--error)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '600', margin: 0 }}>Cash Runway</h3>
            <Clock style={{ width: '20px', height: '20px', color: 'var(--error)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: '1.875rem', fontWeight: '800', color: 'var(--primary)', lineHeight: 1.2 }}>{runwayMonths} Months</div>
              <p style={{ fontSize: '0.75rem', color: 'var(--error)', fontWeight: '600', margin: '0.5rem 0 0 0' }}>Based on ${monthlyBurn.toLocaleString()}/mo burn</p>
            </div>
            <div style={{ width: '96px', height: '48px', opacity: 0.6 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={runwayTrend}>
                  <Area type="monotone" dataKey="v" stroke="var(--error)" fillOpacity={0.1} fill="var(--error)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Cash Flow Chart Section */}
      <div className="glass-card-premium" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1.5rem 0', color: 'var(--primary)' }}>
          <TrendingUp style={{ width: '24px', height: '24px', color: 'var(--success)' }} />
          Cash Flow Trend (Last 6 Months)
        </h3>
        <div style={{ height: '300px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
              <XAxis dataKey="month" tick={{fill: 'var(--text-muted)', fontSize: 12}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill: 'var(--text-muted)', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v/1000}k`} />
              <Tooltip 
                contentStyle={{backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-main)', boxShadow: 'var(--shadow-md)'}}
                itemStyle={{color: 'var(--text-main)'}}
                formatter={(value) => [`$${value.toLocaleString()}`, '']}
              />
              <Legend wrapperStyle={{paddingTop: '20px', fontSize: '12px'}} iconType="circle" />
              <Bar dataKey="revenue" name="Revenue" fill="var(--success)" radius={[4, 4, 0, 0]} barSize={32} />
              <Bar dataKey="expenses" name="Expenses" fill="var(--error)" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monte Carlo AI Sandbox */}
      <div className="glass-card-premium" style={{ padding: '2rem', borderTop: '4px solid var(--warning)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: 'var(--primary)' }}>
                <Activity style={{ width: '24px', height: '24px', color: 'var(--error)' }} />
                Monte Carlo Stress-Test Sandbox
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Adjust extreme market conditions below. The AI will run 1,000 randomized financial quarters to determine the probability of insolvency.
              </p>
            </div>
            <button 
              onClick={runMonteCarlo}
              disabled={simLoading}
              className="gcp-btn-primary"
            >
              {simLoading ? <span className="spinner-icon"></span> : null}
              {simLoading ? 'Running 1,000 Simulations...' : 'Run Stress Test'}
            </button>
          </div>
        </div>
        
        <div className="finance-grid" style={{ gap: '2rem' }}>
          <div className="glass-card-premium" style={{ padding: '1.5rem', background: 'var(--surface-raised)' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-main)' }}>Supplier Cost Shock</label>
                <div style={{ fontSize: '0.875rem', color: 'var(--error)', fontWeight: '700', background: 'rgba(220, 38, 38, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>+{supplierMarkup}%</div>
              </div>
              <input type="range" min="-10" max="30" value={supplierMarkup} onChange={(e) => setSupplierMarkup(Number(e.target.value))} style={{ width: '100%', cursor: 'pointer' }} />
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-main)' }}>Marketing Efficiency Change</label>
                <div style={{ fontSize: '0.875rem', color: 'var(--warning)', fontWeight: '700', background: 'rgba(245, 158, 11, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>{marketingCut > 0 ? '+' : ''}{marketingCut}%</div>
              </div>
              <input type="range" min="-30" max="20" value={marketingCut} onChange={(e) => setMarketingCut(Number(e.target.value))} style={{ width: '100%', cursor: 'pointer' }} />
            </div>
          </div>
          
          <div style={{ height: '100%' }}>
            {simResults ? (
              <div className="glass-card-premium anim-slide-left" style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Risk Analysis</span>
                  <span className="admin-badge" style={{
                    background: simResults.aiAnalysis.risk_level === 'CRITICAL' ? 'var(--error)' : 
                               simResults.aiAnalysis.risk_level === 'HIGH' ? '#f97316' :
                               simResults.aiAnalysis.risk_level === 'MEDIUM' ? 'var(--warning)' : 'var(--success)',
                    color: 'white'
                  }}>
                    {simResults.aiAnalysis.risk_level}
                  </span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ background: 'var(--surface-raised)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', margin: '0 0 0.25rem 0' }}>Mean EBITDA</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, color: simResults.meanEbitda < 0 ? 'var(--error)' : 'var(--success)' }}>
                      ${simResults.meanEbitda.toLocaleString(undefined, {maximumFractionDigits:0})}
                    </p>
                  </div>
                  <div style={{ background: 'var(--surface-raised)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', margin: '0 0 0.25rem 0' }}>Insolvency Prob.</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, color: simResults.failureProbability > 10 ? 'var(--error)' : 'var(--primary)' }}>
                      {simResults.failureProbability.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', background: 'rgba(59, 130, 246, 0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <strong style={{ display: 'block', color: '#1e3a8a', marginBottom: '0.25rem' }}>Summary</strong>
                    {simResults.aiAnalysis.summary}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', background: 'rgba(249, 115, 22, 0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(249, 115, 22, 0.2)' }}>
                    <strong style={{ display: 'block', color: '#9a3412', marginBottom: '0.25rem' }}>Action Plan</strong>
                    {simResults.aiAnalysis.recommendation}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem', border: '2px dashed var(--border)', borderRadius: '16px', background: 'var(--surface-raised)' }}>
                <div style={{ width: '64px', height: '64px', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Activity style={{ width: '32px', height: '32px', color: 'var(--border)' }} />
                </div>
                <h4 style={{ color: 'var(--primary)', fontWeight: '800', margin: '0 0 0.25rem 0' }}>Awaiting Simulation</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>Run a stress test to generate AI Risk Analysis and Monte Carlo distributions</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Cash Flow Forecast */}
      <div className="glass-card-premium" style={{ borderTop: '4px solid #6366f1', padding: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: '#4338ca' }}>
              <Bot style={{ width: '24px', height: '24px', color: '#6366f1' }} />
              AI Cash Flow Forecast
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Predictive 6-month model based on historical burn and MRR.</p>
          </div>
          <button 
            onClick={generateForecast}
            disabled={forecastLoading}
            className="gcp-btn-primary" style={{ background: '#4f46e5', borderColor: '#4338ca' }}
          >
            {forecastLoading ? <span className="spinner-icon"></span> : null}
            {forecastLoading ? 'Generating...' : 'Generate 6-Month Forecast'}
          </button>
        </div>

        {forecastResult && (
          <div className="anim-fade-up">
            <div style={{ background: '#1e1b4b', color: '#eef2ff', padding: '1.5rem', borderRadius: '16px', marginBottom: '1.5rem', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)' }}>
              <h4 style={{ fontWeight: '800', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert style={{ width: '20px', height: '20px', color: '#818cf8' }} />
                Strategic Insights
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.875rem', color: '#c7d2fe', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {forecastResult.recommendations?.map((rec, i) => (
                  <li key={i} style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ color: '#818cf8' }}>•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="finance-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
              {forecastResult.forecast?.map((f, i) => (
                <div key={i} className="glass-card-premium" style={{ padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.month}</div>
                  <div style={{ fontWeight: '800', fontSize: '1.125rem', color: f.ending_cash < 0 ? 'var(--error)' : 'var(--success)' }}>
                    ${f.ending_cash?.toLocaleString(undefined, {maximumFractionDigits:0})}
                  </div>
                </div>
              ))}
            </div>
            
            {forecastResult.runway_months && (
              <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end', fontSize: '0.875rem', fontWeight: '800', color: 'var(--text-main)' }}>
                <span>Projected AI Runway:</span>
                <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.25rem 0.75rem', borderRadius: '6px' }}>
                  {forecastResult.runway_months} months
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}