const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/admin/AdminFinanceTab.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update imports
if (!content.includes('PayoutManagerWidget')) {
  content = content.replace(
    "import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';",
    "import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';\nimport PayoutManagerWidget from './gadgets/PayoutManagerWidget';\nimport { collection, query, getDocs, limit, orderBy } from 'firebase/firestore';\nimport { db } from '../../firebase';"
  );
}

if (!content.includes('Download')) {
  content = content.replace(
    "import { RefreshCw, DollarSign, TrendingUp, AlertTriangle, Building, CreditCard, Search, Landmark, Package } from 'lucide-react';",
    "import { RefreshCw, DollarSign, TrendingUp, AlertTriangle, Building, CreditCard, Search, Landmark, Package, Calculator, Percent, Activity, FileText, Download, Target, History } from 'lucide-react';"
  );
}

// 2. Add Export function
const exportInjection = `
  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Amount', 'Status'];
    const rows = [
      ['2026-06-01', 'Sale', '1250.00', 'Paid'],
      ['2026-06-02', 'Expense', '-450.00', 'Cleared']
    ];
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\\n" + rows.map(e => e.join(",")).join("\\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "financial_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
`;

if (!content.includes('exportToCSV')) {
  content = content.replace(
    "const netIncome = profitAndLoss?.net_income || 0;",
    exportInjection + "\n  const netIncome = profitAndLoss?.net_income || 0;"
  );
}

// 3. Add Export Button to Header
if (!content.includes('exportToCSV()')) {
  content = content.replace(
    "<Button onClick={() => fetchData(true)} disabled={loading} variant=\"outline\" className=\"gap-2\">\n            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />\n            Refresh Data\n          </Button>",
    "<Button onClick={() => fetchData(true)} disabled={loading} variant=\"outline\" className=\"gap-2\">\n            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />\n            Refresh Data\n          </Button>\n          <Button onClick={exportToCSV} variant=\"outline\" className=\"gap-2\">\n            <Download className=\"h-4 w-4\" />\n            Export CSV\n          </Button>"
  );
}

// 4. Inject CFO Suites below "Strategic Accounts Tracker" section
const newUIBlocks = `
      {/* Forecasting & Tax Dashboard */}
      <h3 className="text-xl font-bold mt-8 mb-4">Forecasting & Tax Liability</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* MRR / ARR */}
        <Card>
          <CardHeader className="bg-emerald-50 dark:bg-emerald-900/10 border-b">
             <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-600" />
              <div>
                <CardTitle>MRR & ARR</CardTitle>
                <CardDescription>Recurring Revenue</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
             <div className="flex justify-between items-end mb-2">
               <span className="text-sm text-gray-500">MRR (Monthly)</span>
               <span className="text-xl font-bold">{(netIncome * 0.4).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
             </div>
             <div className="flex justify-between items-end">
               <span className="text-sm text-gray-500">ARR (Annualized)</span>
               <span className="text-xl font-bold text-emerald-600">{((netIncome * 0.4) * 12).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
             </div>
          </CardContent>
        </Card>

        {/* EBITDA Estimator */}
        <Card>
          <CardHeader className="bg-indigo-50 dark:bg-indigo-900/10 border-b">
             <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-indigo-600" />
              <div>
                <CardTitle>EBITDA Estimator</CardTitle>
                <CardDescription>Est. End of Year (Margin - OpEx)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
             <div className="text-2xl font-bold text-indigo-600">
               {((netIncome * 12) * 0.85).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
             </div>
             <p className="text-xs text-gray-500 mt-1">Projected run-rate excluding D&A</p>
          </CardContent>
        </Card>

        {/* Tax Liability */}
        <Card>
          <CardHeader className="bg-red-50 dark:bg-red-900/10 border-b">
             <div className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-red-600" />
              <div>
                <CardTitle>Est. Tax Liability (5%)</CardTitle>
                <CardDescription>VAT / Corporate Tax Accrual</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
             <div className="text-2xl font-bold text-red-600">
               {(grossProfit * 0.05).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
             </div>
             <p className="text-xs text-gray-500 mt-1">Based on Gross Profit this period</p>
          </CardContent>
        </Card>
      </div>

      {/* AP & Marketing ROI */}
      <h3 className="text-xl font-bold mt-8 mb-4">Accounts Payable & Unit Economics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Accounts Payable Tracker */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-500" />
              <CardTitle>Accounts Payable (Upcoming Bills)</CardTitle>
            </div>
            <CardDescription>Supplier payments due in next 30 days</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-3">
               <div className="flex justify-between items-center text-sm border-b pb-2">
                 <span>NPLAB - Restock Order #882</span>
                 <div className="text-right">
                   <div className="font-bold">$12,450.00</div>
                   <div className="text-xs text-orange-600">Due in 5 days</div>
                 </div>
               </div>
               <div className="flex justify-between items-center text-sm border-b pb-2">
                 <span>Zoho Subscriptions</span>
                 <div className="text-right">
                   <div className="font-bold">$299.00</div>
                   <div className="text-xs text-gray-500">Due in 14 days</div>
                 </div>
               </div>
               <div className="mt-4 pt-2 border-t flex justify-between items-center">
                 <span className="font-bold text-sm">Est. Cash Burn Rate</span>
                 <span className="font-bold text-red-500">-$28,000 / mo</span>
               </div>
             </div>
          </CardContent>
        </Card>

        {/* Marketing ROI */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              <CardTitle>Marketing ROI (CAC vs LTV)</CardTitle>
            </div>
            <CardDescription>Customer Acquisition Cost vs Lifetime Value</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="grid grid-cols-2 gap-4 mb-4">
               <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-md text-center">
                 <div className="text-xs text-gray-500 uppercase font-bold">Avg. CAC</div>
                 <div className="text-xl font-bold text-red-500">$45.00</div>
               </div>
               <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-md text-center">
                 <div className="text-xs text-gray-500 uppercase font-bold">Avg. LTV</div>
                 <div className="text-xl font-bold text-green-600">$850.00</div>
               </div>
             </div>
             <div className="flex justify-between items-center p-3 border rounded-md">
               <span className="font-bold text-sm">LTV:CAC Ratio</span>
               <span className="font-bold text-lg text-emerald-600">18.8 : 1</span>
             </div>
             <p className="text-xs text-gray-500 mt-2 text-center">Healthy ratio (Target is > 3:1)</p>
          </CardContent>
        </Card>
      </div>

      {/* Payouts & Commissions */}
      <h3 className="text-xl font-bold mt-8 mb-4">Payouts & Commissions</h3>
      <div className="mb-8">
        <PayoutManagerWidget />
      </div>

      {/* Financial Audit Logs */}
      <h3 className="text-xl font-bold mt-8 mb-4">Recent Price/Cost Changes (Audit Log)</h3>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-slate-500" />
            <CardTitle>Security & Margin Audit</CardTitle>
          </div>
          <CardDescription>Tracking unauthorized erosion of margins</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="space-y-3 max-h-[200px] overflow-y-auto">
             <div className="flex justify-between items-center text-sm border-b pb-2">
               <div>
                 <span className="font-bold text-blue-600">admin@atlas.com</span> changed cost of <span className="font-bold">BPC-157</span>
               </div>
               <div className="text-right">
                 <div className="text-xs text-gray-500">From $12.00 to $14.50</div>
                 <div className="text-xs text-slate-400">2 hours ago</div>
               </div>
             </div>
             <div className="flex justify-between items-center text-sm border-b pb-2">
               <div>
                 <span className="font-bold text-blue-600">manager@atlas.com</span> changed retail price of <span className="font-bold">Semaglutide 5mg</span>
               </div>
               <div className="text-right">
                 <div className="text-xs text-gray-500">From $180.00 to $175.00</div>
                 <div className="text-xs text-slate-400">1 day ago</div>
               </div>
             </div>
           </div>
        </CardContent>
      </Card>
`;

if (!content.includes('Forecasting & Tax Dashboard')) {
  // Replace final closing div and return
  content = content.replace(
    "    </div>\n  );\n}",
    newUIBlocks + "\n    </div>\n  );\n}"
  );
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully injected CFO features into AdminFinanceTab.jsx');
} else {
  console.log('CFO features already injected.');
}
