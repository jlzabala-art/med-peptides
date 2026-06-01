import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../ui/Card';
import { Button } from '../ui/Button';
import { Alert, AlertDescription } from '../ui/Alert';
import { RefreshCw, DollarSign, TrendingUp, AlertTriangle, Building, CreditCard, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AdminFinanceTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Date range state
  const currentDate = new Date();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];

  const [fromDate, setFromDate] = useState(firstDay);
  const [toDate, setToDate] = useState(lastDay);

  const fetchData = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      // In a real app we'd use Firebase functions SDK or auth headers, assuming public/cors for now or needs auth
      // Usually we'd do: const functions = getFunctions(); const fetchDash = httpsCallable(functions, 'fetchFinanceDashboard');
      // For this implementation, using fetch to the cloud function URL directly if configured for CORS
      const res = await fetch('https://europe-west1-med-peptides-app.cloudfunctions.net/fetchFinanceDashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceRefresh, fromDate, toDate })
      });
      const json = await res.json();
      if (res.ok) {
        setData(json);
      } else {
        throw new Error(json.error || 'Failed to fetch finance data');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(false);
  }, []);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Loading financial data from Zoho Books...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Error: {error}</AlertDescription>
        </Alert>
        <Button onClick={() => fetchData(true)} className="mt-4" variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" /> Try Again
        </Button>
      </div>
    );
  }

  if (!data) return null;

  const { profitAndLoss, pendingInvoices, lotuslandData, nplabData, monthRange, cached } = data;

  // KPIs
  const netIncome = profitAndLoss?.net_income || 0;
  const grossProfit = profitAndLoss?.gross_profit || 0;
  const totalIncome = profitAndLoss?.total_income || 0;
  
  const totalUnpaid = pendingInvoices.reduce((sum, inv) => sum + inv.balance, 0);
  const unpaidCount = pendingInvoices.length;

  // Chart data: Income vs COGS vs Expenses
  const chartData = [
    {
      name: 'Current Month',
      Income: profitAndLoss?.total_income || 0,
      COGS: profitAndLoss?.cost_of_goods_sold || 0,
      Expenses: profitAndLoss?.operating_expenses || 0,
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Financial Overview</h2>
          <p className="text-sm text-gray-500">
            {monthRange.from} to {monthRange.to} {cached && "(Cached Data)"}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border text-sm">
            <span>From:</span>
            <input 
              type="date" 
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border-none outline-none bg-transparent"
            />
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border text-sm">
            <span>To:</span>
            <input 
              type="date" 
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border-none outline-none bg-transparent"
            />
          </div>
          <Button onClick={() => fetchData(true)} disabled={loading} variant="default" className="gap-2">
            <Search className="h-4 w-4" />
            Apply Dates
          </Button>
          <Button onClick={() => fetchData(true)} disabled={loading} variant="outline" className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIncome.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
            <p className="text-xs text-gray-500 mt-1">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{grossProfit.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
            <p className="text-xs text-gray-500 mt-1">Net of COGS</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{netIncome.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
            <p className="text-xs text-gray-500 mt-1">After OpEx</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unpaid / Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnpaid.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
            <p className="text-xs text-gray-500 mt-1">{unpaidCount} pending invoices</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* P&L Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Profit & Loss Breakdown</CardTitle>
            <CardDescription>Income vs COGS vs Operating Expenses</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip formatter={(value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)} />
                <Legend />
                <Bar dataKey="Income" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="COGS" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Unpaid Invoices List */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Pending Accounts Receivable</CardTitle>
            <CardDescription>Invoices marked as unpaid or overdue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {pendingInvoices.length === 0 ? (
                <p className="text-sm text-gray-500">No pending invoices.</p>
              ) : (
                pendingInvoices.map((inv) => (
                  <div key={inv.invoice_id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{inv.customer_name}</p>
                      <p className="text-xs text-gray-500">{inv.invoice_number} • {inv.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{inv.balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${inv.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategic Accounts */}
      <h3 className="text-xl font-bold mt-8 mb-4">Strategic Accounts Tracker</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lotusland */}
        <Card>
          <CardHeader className="bg-blue-50/50 dark:bg-blue-900/10 border-b">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              <div>
                <CardTitle>Lotusland (Sales)</CardTitle>
                <CardDescription>Total Billed: {lotuslandData?.totalBilled?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 max-h-[250px] overflow-y-auto">
            {lotuslandData?.invoices?.length === 0 ? (
              <p className="text-sm text-gray-500">No invoices found for Lotusland.</p>
            ) : (
              <div className="space-y-3">
                {lotuslandData?.invoices?.map(inv => (
                  <div key={inv.invoice_id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                    <span className="text-gray-600 dark:text-gray-400">{inv.invoice_number} ({inv.date})</span>
                    <span className="font-medium">{inv.total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* NPLAB */}
        <Card>
          <CardHeader className="bg-purple-50/50 dark:bg-purple-900/10 border-b">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-purple-600" />
              <div>
                <CardTitle>NPLAB (Purchases)</CardTitle>
                <CardDescription>Total Purchased: {nplabData?.totalPaid?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 max-h-[250px] overflow-y-auto">
             {nplabData?.bills?.length === 0 ? (
              <p className="text-sm text-gray-500">No bills found for NPLAB.</p>
            ) : (
              <div className="space-y-3">
                {nplabData?.bills?.map(bill => (
                  <div key={bill.bill_id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                    <span className="text-gray-600 dark:text-gray-400">{bill.bill_number} ({bill.date})</span>
                    <span className="font-medium">{bill.total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
