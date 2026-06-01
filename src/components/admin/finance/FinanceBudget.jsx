import React from 'react';
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
}