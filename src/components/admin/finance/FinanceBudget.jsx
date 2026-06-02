import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { usePreferences } from '../../../context/PreferencesContext';
import SkeletonLoader from '../../ui/SkeletonLoader';
import AnimatedNumber from '../../ui/AnimatedNumber';

export default function FinanceBudget({ dashboardData }) {
  const { formatCurrency, density } = usePreferences();
  // Use Zoho P&L data if available, otherwise mock
  const [budgetMap, setBudgetMap] = React.useState({
    'Marketing': { actual: 15400, limit: 25000, color: '#2563eb' },
    'R&D': { actual: 8200, limit: 10000, color: '#f97316' },
    'Software/Ops': { actual: 12500, limit: 10000, color: '#ef4444' }
  });

  React.useEffect(() => {
    if (dashboardData && dashboardData.profitAndLoss) {
      const expenses = dashboardData.profitAndLoss.expenses || {};
      // This is an example of mapping Zoho categories. 
      // Replace with your actual Zoho expense account names later.
      const mktg = expenses['Marketing'] || 15400;
      const rnd = expenses['Research and Development'] || 8200;
      const ops = expenses['Software'] || 12500;
      
      setBudgetMap({
        'Marketing': { actual: mktg, limit: 25000, color: '#2563eb' },
        'R&D': { actual: rnd, limit: 10000, color: '#f97316' },
        'Software/Ops': { actual: ops, limit: 10000, color: '#ef4444' }
      });
    }
  }, [dashboardData]);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold mb-4">Budget vs Actual (Zoho Books Sync)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Q3 Operating Budget</CardTitle>
            <CardDescription>Tracked against approved quarterly limits</CardDescription>
          </CardHeader>
          <CardContent>
            {!dashboardData ? (
              <div className="space-y-4">
                <SkeletonLoader height="40px" />
                <SkeletonLoader height="40px" />
                <SkeletonLoader height="40px" />
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(budgetMap).map(([name, data]) => {
                  const pct = Math.min(Math.round((data.actual / data.limit) * 100), 100);
                  const isOver = data.actual > data.limit;
                  const isNearLimit = data.actual > (data.limit * 0.50); // Lowered alarm limit (50%)
                  
                  let textColor = '';
                  if (isOver) textColor = 'text-red-500 font-bold';
                  else if (isNearLimit) textColor = 'text-amber-500 font-bold';

                  return (
                    <div key={name} className={density === 'compact' ? 'mb-2' : 'mb-4'}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{name}</span>
                        <span className={textColor}>
                          <AnimatedNumber value={data.actual} isCurrency={true} /> / Limit: {formatCurrency(data.limit)} ({Math.round((data.actual / data.limit) * 100)}%)
                        </span>
                      </div>
                      <div className={`w-full bg-gray-200 rounded-full ${density === 'compact' ? 'h-1.5' : 'h-2.5'}`}>
                        <div className={`h-full rounded-full ${isOver ? 'bg-red-500' : ''}`} style={{ width: `${pct}%`, backgroundColor: !isOver ? data.color : undefined }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Variance Summary</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(budgetMap).map(([name, data]) => ({ name, value: data.actual, color: data.color }))}
                    cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value"
                  >
                    {Object.values(budgetMap).map((data, idx) => (
                      <Cell key={idx} fill={data.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => '$'+v.toLocaleString()} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}