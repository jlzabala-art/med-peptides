const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/admin/AdminFinanceTab.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Ensure PieChart imports are added for Budget visualization
if (!content.includes('PieChart')) {
  content = content.replace(
    "import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';",
    "import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';"
  );
}
if (!content.includes('PieChartIcon')) {
  content = content.replace(
    "import { RefreshCw, DollarSign, TrendingUp, AlertTriangle, Building, CreditCard, Search, Landmark, Package, Calculator, Percent, Activity, FileText, Download, Target, History } from 'lucide-react';",
    "import { RefreshCw, DollarSign, TrendingUp, AlertTriangle, Building, CreditCard, Search, Landmark, Package, Calculator, Percent, Activity, FileText, Download, Target, History, PieChart as PieChartIcon } from 'lucide-react';"
  );
}

// 2. Add Budget UI Block
const budgetUIBlock = `
      {/* Budget & Expense Tracking */}
      <h3 className="text-xl font-bold mt-8 mb-4">Budget vs Actual (Zoho Books Sync)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-indigo-500" />
              <CardTitle>Q3 Operating Budget</CardTitle>
            </div>
            <CardDescription>Tracked against approved quarterly budget limits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Marketing Budget */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Marketing & Sales</span>
                  <span>$15,400 / $25,000 (61%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '61%' }}></div>
                </div>
              </div>

              {/* R&D and Lab */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">R&D / Lab Testing</span>
                  <span>$8,200 / $10,000 (82%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>

              {/* Operations & Software */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Software & Logistics</span>
                  <span className="text-red-500 font-bold">$12,500 / $10,000 (125%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Variance Summary</CardTitle>
            <CardDescription>Actual expenditures vs target by category</CardDescription>
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
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#2563eb" />
                    <Cell fill="#f97316" />
                    <Cell fill="#ef4444" />
                    <Cell fill="#e5e7eb" />
                  </Pie>
                  <Tooltip formatter={(value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
`;

if (!content.includes('Budget vs Actual')) {
  content = content.replace(
    "{/* AP & Marketing ROI */}",
    budgetUIBlock + "\n\n      {/* AP & Marketing ROI */}"
  );
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully injected Budget features into AdminFinanceTab.jsx');
} else {
  console.log('Budget features already injected.');
}
