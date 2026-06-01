import React, { useState } from 'react';
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
            <div className="text-3xl font-bold text-gray-900">${totalBalance.toLocaleString()}</div>
            <p className="text-sm text-emerald-600 mt-1">Acros all synced accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">MRR / ARR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">${mrr.toLocaleString()}</div>
            <p className="text-sm text-blue-600 mt-1">ARR: ${arr.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">Cash Runway</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{runwayMonths} Months</div>
            <p className="text-sm text-gray-500 mt-1">Based on ${monthlyBurn.toLocaleString()}/mo burn</p>
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
            <span className={`text-4xl font-black ${simulatedEbitda > baseEbitda ? 'text-emerald-600' : 'text-orange-500'}`}>
              ${simulatedEbitda.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="text-xs text-gray-400 mt-2">Baseline: ${baseEbitda.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}