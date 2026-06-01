import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Check, X, ShieldAlert, Clock } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';
import { useAuth } from '../../../context/AuthContext';

export default function AdminApprovalsWidget() {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      // Create index for: status == 'pending' orderBy createdAt desc
      const q = query(
        collection(db, 'financial_approvals'),
        where('status', '==', 'pending')
        // orderBy('createdAt', 'desc') // Requires composite index, removing for now
      );
      const snap = await getDocs(q);
      let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setApprovals(list);
    } catch (err) {
      console.error('Error fetching approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleAction = async (approvalId, type, data, action) => {
    try {
      // 1. Update the approval document status
      const approvalRef = doc(db, 'financial_approvals', approvalId);
      await updateDoc(approvalRef, {
        status: action === 'approve' ? 'approved' : 'rejected',
        resolvedBy: currentUser?.email || 'cfo@atlas.com',
        resolvedAt: new Date().toISOString()
      });

      // 2. If approved, apply the actual change
      if (action === 'approve') {
        if (type === 'cost_update') {
          const productRef = doc(db, 'products', data.productId);
          await updateDoc(productRef, data.updates);
        } else if (type === 'payout_auth') {
          // In a real app we might call a Cloud Function or Stripe API here
          // For now, we update the payout doc if it exists, or just log it
          // Assuming data.payoutId exists
          if (data.payoutId) {
             const payoutRef = doc(db, 'payouts', data.payoutId);
             await updateDoc(payoutRef, { status: 'paid', paidAt: new Date().toISOString() });
          }
        }
      }

      toast.success(`Transaction ${action}d successfully.`);
      setApprovals(prev => prev.filter(a => a.id !== approvalId));
    } catch (err) {
      console.error('Error handling approval action:', err);
      toast.error('Failed to process approval.');
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Checking pending approvals...</div>;
  }

  if (approvals.length === 0) {
    return null; // Don't show anything if queue is empty
  }

  return (
    <Card className="mb-6 border-red-200 shadow-sm bg-red-50/30 dark:bg-red-900/10">
      <CardHeader className="pb-3 border-b border-red-100 dark:border-red-900/30">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-red-600" />
          <div>
            <CardTitle className="text-red-800 dark:text-red-400">Action Required: CFO Approvals</CardTitle>
            <CardDescription className="text-red-600 dark:text-red-300">
              There are {approvals.length} transaction(s) pending your financial authorization.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          {approvals.map(app => (
            <div key={app.id} className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-white dark:bg-slate-900 border rounded-lg shadow-sm gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {app.type === 'cost_update' ? 'Margin Change' : 'High-Value Payout'}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {new Date(app.createdAt).toLocaleString()}
                  </span>
                </div>
                
                {app.type === 'cost_update' && (
                  <p className="text-sm">
                    <strong className="text-blue-600">{app.requestedBy}</strong> requested to change costs for <strong className="text-slate-800 dark:text-slate-200">{app.data.productName}</strong>. 
                    {' '}<span className="text-red-500 line-through">${app.data.oldCost}</span> → <span className="text-emerald-600 font-bold">${app.data.updates.costPrice}</span>
                  </p>
                )}

                {app.type === 'payout_auth' && (
                  <p className="text-sm">
                    <strong className="text-blue-600">{app.requestedBy}</strong> requested a mass payout of <strong className="text-emerald-600 font-bold">${app.data.amount}</strong> to <strong className="text-slate-800 dark:text-slate-200">{app.data.recipientName}</strong>.
                  </p>
                )}
                
                {app.reason && (
                  <p className="text-xs text-gray-500 mt-1 italic">Reason: "{app.reason}"</p>
                )}
              </div>
              
              <div className="flex items-center gap-2 md:w-auto w-full justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  onClick={() => handleAction(app.id, app.type, app.data, 'reject')}
                >
                  <X className="h-4 w-4 mr-1" /> Reject
                </Button>
                <Button 
                  size="sm" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => handleAction(app.id, app.type, app.data, 'approve')}
                >
                  <Check className="h-4 w-4 mr-1" /> Authorize
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
