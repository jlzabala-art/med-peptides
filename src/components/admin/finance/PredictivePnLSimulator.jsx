import React, { useState } from 'react';
import { Bot, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Area 
} from 'recharts';

export default function PredictivePnLSimulator({ pnl2026 }) {
  const [query, setQuery] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [projectedData, setProjectedData] = useState(null);
  const [insights, setInsights] = useState(null);

  // Fallback data if no pnl2026 is provided yet
  const safeData = pnl2026 || [
    { month: 'Jan', income: 45000, expenses: 32000, profit: 13000 },
    { month: 'Feb', income: 52000, expenses: 35000, profit: 17000 },
    { month: 'Mar', income: 48000, expenses: 33000, profit: 15000 },
    { month: 'Apr', income: 61000, expenses: 38000, profit: 23000 },
    { month: 'May', income: 59000, expenses: 36000, profit: 23000 },
    { month: 'Jun', income: 65000, expenses: 40000, profit: 25000 }
  ];

  const handleSimulate = () => {
    if (!query.trim()) return;
    setSimulating(true);

    // Simulate Atlas AI processing time
    setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      
      // Basic Natural Language Parser for Simulation
      // Looking for percentages
      const pctMatch = lowerQuery.match(/(\d+)\s*%/);
      let pct = pctMatch ? parseInt(pctMatch[1], 10) / 100 : 0.15; // default 15% if no number found

      // Determine Direction (increase or decrease)
      const isDecrease = /(reduc|baj|cort|menos|disminu|cae|drop|decrease|cut)/i.test(lowerQuery);
      if (isDecrease) pct = -pct;

      // Determine Target (Income or Expenses)
      const targetExpenses = /(gastos|software|marketing|expense|cost)/i.test(lowerQuery);
      const targetIncome = /(ingresos|ventas|sales|income|revenue)/i.test(lowerQuery);

      let impactIncome = 0;
      let impactExpenses = 0;

      if (targetExpenses) {
        impactExpenses = pct;
      } else if (targetIncome) {
        impactIncome = pct;
      } else {
        // Default: modify both to show a generic scenario
        impactIncome = pct;
        impactExpenses = pct * 0.5; // expenses grow half as fast as income
      }

      // Generate Projected Data
      let originalTotalProfit = 0;
      let projectedTotalProfit = 0;

      const newData = safeData.map(item => {
        const simIncome = item.income * (1 + impactIncome);
        const simExpenses = item.expenses * (1 + impactExpenses);
        const simProfit = simIncome - simExpenses;

        originalTotalProfit += item.profit;
        projectedTotalProfit += simProfit;

        return {
          month: item.month,
          baselineProfit: item.profit,
          projectedProfit: simProfit,
          simIncome,
          simExpenses
        };
      });

      const profitDiff = projectedTotalProfit - originalTotalProfit;
      const profitPct = (profitDiff / originalTotalProfit) * 100;

      setProjectedData(newData);
      setInsights({
        message: `Atlas AI ha completado la simulación. El cambio proyectado resultaría en un ${profitPct > 0 ? 'aumento' : 'descenso'} del Beneficio Neto total de ${Math.abs(profitPct).toFixed(1)}%.`,
        diffAmount: profitDiff,
        isPositive: profitDiff > 0
      });

      setSimulating(false);
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSimulate();
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="glass-card-premium" style={{ overflow: 'hidden', marginTop: '2rem' }}>
      <div style={{ padding: '1.5rem', background: 'linear-gradient(90deg, rgba(15,23,42,1) 0%, rgba(30,41,59,1) 100%)', color: 'white', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.75rem', borderRadius: '12px' }}>
          <Sparkles style={{ width: '24px', height: '24px', color: '#fbbf24' }} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>Atlas AI "What-If" Simulator</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Predicciones financieras en tiempo real basadas en tu P&L.</p>
        </div>
      </div>

      <div style={{ padding: '2rem', background: 'var(--surface)' }}>
        
        {/* Input Area */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Bot style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Ej: "¿Qué pasa si reducimos los gastos un 15%?" o "Proyecta un aumento de ventas del 20%"'
              style={{
                width: '100%',
                padding: '1rem 1rem 1rem 3rem',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                background: 'var(--surface-raised)',
                fontSize: '1rem',
                outline: 'none',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
              }}
            />
          </div>
          <button 
            onClick={handleSimulate}
            disabled={simulating || !query.trim()}
            className="hover-lift"
            style={{
              padding: '0 2rem',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 700,
              cursor: simulating || !query.trim() ? 'not-allowed' : 'pointer',
              opacity: simulating || !query.trim() ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {simulating ? <span className="spinner-icon" style={{ width: '20px', height: '20px', borderColor: 'white', borderTopColor: 'transparent' }} /> : <TrendingUp size={20} />}
            {simulating ? 'Simulando...' : 'Simular'}
          </button>
        </div>

        {/* Results Area */}
        {projectedData && !simulating && (
          <div className="anim-fade-up">
            
            {/* Insights Banner */}
            <div style={{ 
              marginBottom: '2rem', 
              padding: '1.5rem', 
              borderRadius: '12px', 
              background: insights.isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${insights.isPositive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem'
            }}>
              {insights.isPositive ? (
                <TrendingUp style={{ color: 'var(--success)', marginTop: '0.25rem' }} size={24} />
              ) : (
                <AlertTriangle style={{ color: 'var(--danger)', marginTop: '0.25rem' }} size={24} />
              )}
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 800, color: insights.isPositive ? 'var(--success)' : 'var(--danger)' }}>
                  Impacto Proyectado: {formatCurrency(insights.diffAmount)}
                </h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{insights.message}</p>
              </div>
            </div>

            {/* Chart */}
            <div style={{ width: '100%', height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={projectedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis 
                    tickFormatter={(val) => `€${val/1000}k`} 
                    tick={{ fill: 'var(--text-muted)' }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <RechartsTooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  
                  <Bar 
                    dataKey="baselineProfit" 
                    name="Beneficio Actual (Real)" 
                    fill="var(--surface-raised)" 
                    stroke="var(--border)"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="projectedProfit" 
                    name="Beneficio Proyectado" 
                    fill="url(#colorProjected)" 
                    stroke={insights.isPositive ? 'var(--success)' : 'var(--danger)'} 
                    strokeWidth={3}
                  />

                  <defs>
                    <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={insights.isPositive ? 'var(--success)' : 'var(--danger)'} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={insights.isPositive ? 'var(--success)' : 'var(--danger)'} stopOpacity={0}/>
                    </linearGradient>
                  </defs>

                </ComposedChart>
              </ResponsiveContainer>
            </div>
            
          </div>
        )}

      </div>
    </div>
  );
}
