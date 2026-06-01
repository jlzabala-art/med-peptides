import React from 'react';
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
}