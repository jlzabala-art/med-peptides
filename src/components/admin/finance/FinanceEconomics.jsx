import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { db } from '../../../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { AlertTriangle, TrendingUp, DollarSign, CheckCircle } from 'lucide-react';

export default function FinanceEconomics({ dashboardData }) {
  const lotusBilled = dashboardData?.lotuslandData?.totalBilled || 0;
  const [marginAlerts, setMarginAlerts] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, 'financial_approvals'),
      where('type', '==', 'margin_risk'),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const alerts = [];
      snapshot.forEach((docSnap) => {
        alerts.push({ id: docSnap.id, ...docSnap.data() });
      });
      setMarginAlerts(alerts);
    });

    return () => unsubscribe();
  }, []);

  const handleApprovePriceIncrease = async (alertId) => {
    try {
      const alertRef = doc(db, 'financial_approvals', alertId);
      await updateDoc(alertRef, {
        status: 'approved',
        resolved_at: new Date().toISOString()
      });
      // In a real system, you'd also trigger a Cloud Function here to actually update the Product's retail price
    } catch (err) {
      console.error("Error approving price increase:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <CardHeader><CardTitle>B2B Revenue Concentration</CardTitle></CardHeader>
          <CardContent>
             <p className="text-sm text-gray-500 font-medium">Lotusland Total Billed</p>
             <p className="text-3xl font-bold text-blue-600">${lotusBilled.toLocaleString()}</p>
             <div className="mt-4 p-3 bg-blue-50 rounded text-xs text-blue-800">
               <span className="font-bold uppercase tracking-wider">Note:</span> B2B wholesale performance indicator directly from Zoho Books.
             </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle>Estimated Tax Liability</CardTitle></CardHeader>
          <CardContent>
             <p className="text-sm text-gray-500 font-medium">Accrued VAT/Corporate (5%)</p>
             <p className="text-3xl font-bold text-red-600">$12,450.00</p>
             <div className="w-full bg-gray-200 rounded-full h-1.5 mt-4">
                <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-gray-900">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          AI Margin Protection Alerts
        </h3>
        
        {marginAlerts.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
             <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
             <p className="text-gray-500 font-medium">All product margins are healthy.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {marginAlerts.map(alert => (
              <Card key={alert.id} className="border-orange-200 bg-orange-50/30">
                <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded uppercase">Margin Risk</span>
                      <h4 className="font-bold text-gray-900">{alert.product_name}</h4>
                    </div>
                    <p className="text-sm text-gray-700">{alert.reason}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500 font-medium">
                      <span>Old COGS: ${alert.old_cogs}</span>
                      <span>New COGS: ${alert.new_cogs}</span>
                      <span>Current Margin: <span className="text-red-600">{alert.current_margin_percent}%</span></span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-white p-3 rounded shadow-sm border border-orange-100">
                    <div className="text-center">
                      <div className="text-[10px] uppercase text-gray-500 font-bold">Suggested Price</div>
                      <div className="text-xl font-black text-emerald-600">${alert.recommended_price}</div>
                    </div>
                    <button 
                      onClick={() => handleApprovePriceIncrease(alert.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded font-medium text-sm transition-colors"
                    >
                      Approve Sync
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}