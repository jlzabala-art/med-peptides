const fs = require('fs');
const path = require('path');

const financeDir = path.join(__dirname, 'src/components/admin/finance');
if (!fs.existsSync(financeDir)) {
  fs.mkdirSync(financeDir, { recursive: true });
}

// 1. FinanceOverview.jsx
const overviewContent = `import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/Card';
import { TrendingUp, DollarSign, Activity } from 'lucide-react';

export default function FinanceOverview({ totalBalance, activeSubs }) {
  const [supplierMarkup, setSupplierMarkup] = useState(5); // +5%
  const [marketingCut, setMarketingCut] = useState(0); // 0%
  
  const mrr = activeSubs * 299;
  const arr = mrr * 12;
  const baseEbitda = arr * 0.45; // 45% margin assumption
  
  // What-If Simulation
  const simulatedEbitda = baseEbitda - (baseEbitda * (supplierMarkup / 100)) + (arr * (marketingCut / 100));
  
  // Runway Simulation (assumes $35k burn rate)
  const monthlyBurn = 35000;
  const runwayMonths = (totalBalance / monthlyBurn).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">Total Cash Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">\${totalBalance.toLocaleString()}</div>
            <p className="text-sm text-emerald-600 mt-1">Acros all synced accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">MRR / ARR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">\${mrr.toLocaleString()}</div>
            <p className="text-sm text-blue-600 mt-1">ARR: \${arr.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">Cash Runway</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{runwayMonths} Months</div>
            <p className="text-sm text-gray-500 mt-1">Based on \${monthlyBurn.toLocaleString()}/mo burn</p>
          </CardContent>
        </Card>
      </div>

      <h3 className="text-xl font-bold mt-8 mb-4">Interactive What-If Simulator (EBITDA)</h3>
      <Card>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium mb-2">Supplier Cost Increase (%)</label>
            <input type="range" min="-10" max="20" value={supplierMarkup} onChange={(e) => setSupplierMarkup(Number(e.target.value))} className="w-full" />
            <div className="text-right text-sm text-gray-500">{supplierMarkup}%</div>
            
            <label className="block text-sm font-medium mb-2 mt-4">Marketing Efficiency Gain (%)</label>
            <input type="range" min="-10" max="20" value={marketingCut} onChange={(e) => setMarketingCut(Number(e.target.value))} className="w-full" />
            <div className="text-right text-sm text-gray-500">{marketingCut}%</div>
          </div>
          <div className="flex flex-col justify-center items-center bg-slate-50 rounded-lg p-6">
            <span className="text-gray-500 uppercase tracking-widest text-xs font-bold mb-2">Projected EOY EBITDA</span>
            <span className={\`text-4xl font-black \${simulatedEbitda > baseEbitda ? 'text-emerald-600' : 'text-orange-500'}\`}>
              \${simulatedEbitda.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="text-xs text-gray-400 mt-2">Baseline: \${baseEbitda.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}`;
fs.writeFileSync(path.join(financeDir, 'FinanceOverview.jsx'), overviewContent);

// 2. FinanceBudget.jsx
const budgetContent = `import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function FinanceBudget() {
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
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Marketing & Sales</span>
                  <span>$15,400 / $25,000 (61%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '61%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">R&D / Lab Testing</span>
                  <span>$8,200 / $10,000 (82%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Software & Logistics</span>
                  <span className="text-red-500 font-bold">$12,500 / $10,000 (125%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
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
                    data={[
                      { name: 'Marketing', value: 15400, color: '#2563eb' },
                      { name: 'R&D', value: 8200, color: '#f97316' },
                      { name: 'Software/Ops', value: 12500, color: '#ef4444' },
                      { name: 'Remaining', value: 8900, color: '#e5e7eb' },
                    ]}
                    cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value"
                  >
                    <Cell fill="#2563eb" />
                    <Cell fill="#f97316" />
                    <Cell fill="#ef4444" />
                    <Cell fill="#e5e7eb" />
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
}`;
fs.writeFileSync(path.join(financeDir, 'FinanceBudget.jsx'), budgetContent);

// 3. FinancePayables.jsx
const payablesContent = `import React from 'react';
import PayoutManagerWidget from '../gadgets/PayoutManagerWidget';

export default function FinancePayables() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <PayoutManagerWidget />
      </div>
    </div>
  );
}`;
fs.writeFileSync(path.join(financeDir, 'FinancePayables.jsx'), payablesContent);

// 4. FinanceApprovals.jsx
const approvalsContent = `import React from 'react';
import AdminApprovalsWidget from '../gadgets/AdminApprovalsWidget';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';

export default function FinanceApprovals() {
  return (
    <div className="space-y-6">
      <AdminApprovalsWidget />
      <Card>
        <CardHeader><CardTitle>Audit Log</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">All historical approvals and margin overrides will be displayed here for compliance audits.</p>
        </CardContent>
      </Card>
    </div>
  );
}`;
fs.writeFileSync(path.join(financeDir, 'FinanceApprovals.jsx'), approvalsContent);

// 5. FinanceEconomics.jsx
const economicsContent = `import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';

export default function FinanceEconomics() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Unit Economics (LTV:CAC)</CardTitle></CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div><p className="text-sm text-gray-500">Customer LTV</p><p className="text-2xl font-bold">$1,250</p></div>
              <div className="text-right"><p className="text-sm text-gray-500">Blended CAC</p><p className="text-2xl font-bold text-orange-500">$380</p></div>
            </div>
            <div className="bg-slate-100 p-4 rounded-lg flex justify-between items-center">
              <span className="font-medium">Ratio</span>
              <span className="text-lg font-bold text-emerald-600">3.2 : 1</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Estimated Tax Liability (5%)</CardTitle></CardHeader>
          <CardContent>
             <p className="text-3xl font-bold text-red-600">$12,450.00</p>
             <p className="text-sm text-gray-500 mt-2">Accrued VAT/Corporate tax holdback for current quarter.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}`;
fs.writeFileSync(path.join(financeDir, 'FinanceEconomics.jsx'), economicsContent);

console.log('Finance sub-components created successfully.');
