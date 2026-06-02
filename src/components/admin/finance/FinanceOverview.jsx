import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/Card';
import { TrendingUp, DollarSign, Activity, Bot } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';

export default function FinanceOverview({ dashboardData, totalBalance, activeSubs }) {
  const [supplierMarkup, setSupplierMarkup] = useState(5); // +5%
  const [marketingCut, setMarketingCut] = useState(0); // 0%
  
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastResult, setForecastResult] = useState(null);
  
  const mrr = activeSubs * 299;
  const arr = mrr * 12;
  const baseEbitda = arr * 0.45; // 45% margin assumption
  
  const AED_RATE = 3.6725;
  const formatDual = (usdValue) => {
    if (usdValue == null) return "$0 / 0 AED";
    return `$${usdValue.toLocaleString('en-US', {maximumFractionDigits:0})} / ${(usdValue * AED_RATE).toLocaleString('en-US', {maximumFractionDigits:0})} AED`;
  };
  
  // What-If Simulation
  const simulatedEbitda = baseEbitda - (baseEbitda * (supplierMarkup / 100)) + (arr * (marketingCut / 100));
  
  // Runway Simulation (assumes $35k burn rate)
  const monthlyBurn = 35000;
  const runwayMonths = (totalBalance / monthlyBurn).toFixed(1);

  const generateForecast = async () => {
    setForecastLoading(true);
    try {
      const functions = getFunctions();
      const predictiveCashFlow = httpsCallable(functions, 'predictiveCashFlow');
      const response = await predictiveCashFlow({ currentCash: totalBalance, mrr: mrr });
      setForecastResult(response.data);
    } catch (err) {
      console.error("Error generating forecast:", err);
      alert("Failed to generate forecast. Make sure you have admin privileges and the cloud function is deployed.");
    } finally {
      setForecastLoading(false);
    }
  };

  const [simLoading, setSimLoading] = useState(false);
  const [simResults, setSimResults] = useState(null);

  const runMonteCarlo = async () => {
    setSimLoading(true);
    try {
      const functions = getFunctions();
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">Total Cash Balance (or Net Profit)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {formatDual(dashboardData?.profitAndLoss?.net_profit || totalBalance)}
            </div>
            <p className="text-sm text-emerald-600 mt-1">Across all synced accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">MRR / ARR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{formatDual(mrr)}</div>
            <p className="text-sm text-blue-600 mt-1">ARR: {formatDual(arr)}</p>
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

      <div className="mt-8 flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Activity className="w-6 h-6 text-red-500" />
          Monte Carlo Stress-Test Sandbox (AI)
        </h3>
        <button 
          onClick={runMonteCarlo}
          disabled={simLoading}
          className="bg-gray-900 text-white px-4 py-2 rounded font-bold text-sm shadow hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {simLoading ? 'Running 1,000 Simulations...' : 'Run Stress Test'}
        </button>
      </div>
      
      <Card className="border-red-100 shadow-sm">
        <CardContent className="pt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <p className="text-sm text-gray-500 mb-6">
              Adjust extreme market conditions below. The AI will run 1,000 randomized financial quarters to determine the probability of insolvency.
            </p>
            <label className="block text-sm font-bold mb-2 text-gray-800">Target Supplier Cost Shock (%)</label>
            <input type="range" min="-10" max="30" value={supplierMarkup} onChange={(e) => setSupplierMarkup(Number(e.target.value))} className="w-full accent-red-500" />
            <div className="text-right text-sm text-red-600 font-bold">+{supplierMarkup}%</div>
            
            <label className="block text-sm font-bold mb-2 mt-4 text-gray-800">Target Marketing Efficiency Change (%)</label>
            <input type="range" min="-30" max="20" value={marketingCut} onChange={(e) => setMarketingCut(Number(e.target.value))} className="w-full accent-orange-500" />
            <div className="text-right text-sm text-orange-600 font-bold">{marketingCut > 0 ? '+' : ''}{marketingCut}%</div>
          </div>
          
          <div className="flex flex-col bg-slate-50 rounded-xl p-6 border border-slate-200">
            {simResults ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold text-gray-500 uppercase">AI Risk Level</span>
                  <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${
                    simResults.aiAnalysis.risk_level === 'CRITICAL' ? 'bg-red-100 text-red-700' : 
                    simResults.aiAnalysis.risk_level === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                    simResults.aiAnalysis.risk_level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {simResults.aiAnalysis.risk_level}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white p-3 rounded shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium">Mean EBITDA</p>
                    <p className={`text-xl font-black ${simResults.meanEbitda < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      ${simResults.meanEbitda.toLocaleString(undefined, {maximumFractionDigits:0})}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium">Insolvency Prob.</p>
                    <p className={`text-xl font-black ${simResults.failureProbability > 10 ? 'text-red-600' : 'text-gray-900'}`}>
                      {simResults.failureProbability.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="text-sm text-gray-800 mb-3 bg-white p-3 rounded border-l-4 border-l-indigo-500 shadow-sm">
                  <strong>Summary:</strong> {simResults.aiAnalysis.summary}
                </div>
                
                <div className="text-sm text-gray-800 bg-orange-50 p-3 rounded border-l-4 border-l-orange-500 shadow-sm">
                  <strong>Action Plan:</strong> {simResults.aiAnalysis.recommendation}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                <Activity className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-500">Run a simulation to generate AI Risk Analysis</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Bot className="w-6 h-6 text-[var(--color-primary)]" />
          AI Cash Flow Forecast
        </h3>
        <button 
          onClick={generateForecast}
          disabled={forecastLoading}
          className="bg-[var(--color-primary)] text-white px-4 py-2 rounded font-medium hover:opacity-90 disabled:opacity-50"
        >
          {forecastLoading ? 'Generating...' : 'Generate 6-Month Forecast'}
        </button>
      </div>

      {forecastResult && (
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="pt-6">
            <h4 className="font-bold mb-2">AI Insights:</h4>
            <ul className="list-disc pl-5 mb-6 space-y-1 text-sm text-gray-700">
              {forecastResult.recommendations?.map((rec, i) => <li key={i}>{rec}</li>)}
            </ul>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {forecastResult.forecast?.map((f, i) => (
                <div key={i} className="bg-white p-3 rounded shadow-sm text-center">
                  <div className="text-xs font-bold text-gray-500 mb-1">{f.month}</div>
                  <div className={`font-bold ${f.ending_cash < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    ${f.ending_cash?.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            {forecastResult.runway_months && (
              <div className="mt-4 text-sm font-medium text-gray-600">
                Projected AI Runway: {forecastResult.runway_months} months
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}