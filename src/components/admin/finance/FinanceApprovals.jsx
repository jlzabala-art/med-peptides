import React from 'react';
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
}