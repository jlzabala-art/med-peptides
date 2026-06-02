import React from 'react';
import AdminApprovalsWidget from '../gadgets/AdminApprovalsWidget';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';

export default function FinanceApprovals({ dashboardData }) {
  const pendingInvoices = dashboardData?.pendingInvoices || [];
  return (
    <div className="space-y-6">
      <div className="finance-grid-2">
        <div className="flex flex-col gap-6">
          <AdminApprovalsWidget />
          <Card>
            <CardHeader><CardTitle>Audit Log</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">All historical approvals and margin overrides will be displayed here for compliance audits.</p>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-orange-600">Unpaid Customer Invoices (Zoho)</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingInvoices.length === 0 ? (
                <p className="text-sm text-gray-500">No pending invoices from Zoho.</p>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {pendingInvoices.map((inv, i) => (
                    <div key={i} className="flex flex-col p-4 bg-orange-50/50 rounded-lg border border-orange-100">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-bold text-gray-900">{inv.customer_name}</div>
                          <div className="text-xs text-gray-500 font-medium">{inv.invoice_number}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-orange-600">${inv.balance.toLocaleString()}</div>
                          <div className="text-xs text-gray-500 uppercase">Due: {inv.due_date}</div>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-orange-100 flex justify-end">
                        <button className="text-xs font-bold text-orange-600 hover:text-orange-800 uppercase tracking-wider">
                          Send Reminder
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}