import React from 'react';
import { FileText, Download } from 'lucide-react';
import BaseWidget from '../core/BaseWidget';

export default function BillingInvoicesWidget(props) {
  const { role = 'admin' } = props;

  // Mock data for widget preview, in real app would use useFinanceData hook
  const invoices = [
    { id: 'INV-2026-001', amount: 1250, status: 'PAID', date: '2026-05-01' },
    { id: 'INV-2026-002', amount: 3400, status: 'PENDING', date: '2026-06-10' },
    { id: 'INV-2026-003', amount: 890, status: 'OVERDUE', date: '2026-04-15' },
  ];

  return (
    <BaseWidget 
      title={role === 'patient' ? "Mis Facturas" : "Facturación B2B"} 
      icon={FileText} 
      {...props}
    >
      <div className="space-y-3">
        {invoices.map(invoice => (
          <div key={invoice.id} className="p-3 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center hover:bg-white/10 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                invoice.status === 'PAID' ? 'bg-green-500/20 text-green-400' :
                invoice.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">{invoice.id}</p>
                <p className="text-gray-400 text-xs mt-0.5">{invoice.date}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-white font-bold">${invoice.amount}</span>
              <button className="opacity-0 group-hover:opacity-100 p-1.5 bg-white/10 rounded-md text-white hover:bg-white/20 transition-all">
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {role === 'admin' && (
        <button className="w-full mt-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm font-medium transition-colors">
          Ver todas las facturas
        </button>
      )}
    </BaseWidget>
  );
}
