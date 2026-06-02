import PayoutManagerWidget from '../gadgets/PayoutManagerWidget';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { db } from '../../../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { ShieldAlert, FileWarning, CheckCircle } from 'lucide-react';
import { usePreferences } from '../../../context/PreferencesContext';
import SkeletonLoader from '../../ui/SkeletonLoader';
import AnimatedNumber from '../../ui/AnimatedNumber';

export default function FinancePayables({ dashboardData }) {
  const { formatCurrency, density } = usePreferences();
  const bills = dashboardData?.nplabData?.bills || [];
  const totalPaid = dashboardData?.nplabData?.totalPaid || 0;
  const [billNotes, setBillNotes] = useState({});

  const handleNoteChange = (billId, val) => {
    setBillNotes(prev => ({...prev, [billId]: val}));
  };

  // Removed local AED_RATE and formatDual

  const [complianceAlerts, setComplianceAlerts] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, 'financial_approvals'),
      where('type', '==', 'compliance_audit'),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const alerts = [];
      snapshot.forEach((docSnap) => {
        alerts.push({ id: docSnap.id, ...docSnap.data() });
      });
      setComplianceAlerts(alerts);
    });

    return () => unsubscribe();
  }, []);

  const handleOverrideBlock = async (alertId, payoutId) => {
    try {
      // 1. Resolve the alert
      const alertRef = doc(db, 'financial_approvals', alertId);
      await updateDoc(alertRef, {
        status: 'approved',
        resolved_at: new Date().toISOString()
      });

      // 2. Unblock the payout
      const payoutRef = doc(db, 'payouts', payoutId);
      await updateDoc(payoutRef, {
        status: 'pending', // Revert back to pending so it can be processed
        compliance_override_at: new Date().toISOString()
      });
    } catch (err) {
      console.error("Error overriding compliance block:", err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Compliance Audit Section */}
      <div className="mb-8">
        <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-gray-900">
          <ShieldAlert className="w-5 h-5 text-red-500" />
          Automated Tax & Compliance Auditing
        </h3>
        
        {complianceAlerts.length === 0 ? (
          <div className="p-6 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center gap-3">
             <CheckCircle className="w-6 h-6 text-emerald-500" />
             <p className="text-emerald-800 font-medium text-sm">All payouts have matched invoices. Full compliance verified.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {complianceAlerts.map(alert => (
              <div key={alert.id} className="bg-red-50/50 border border-red-200 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <FileWarning className="w-5 h-5 text-red-500 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900">Missing Invoice: {alert.payee_name}</h4>
                    <p className="text-sm text-gray-700">{alert.reason}</p>
                    <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-wider">Payout Blocked</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="text-xl font-black text-gray-900">{formatCurrency(alert.amount)}</div>
                   <button 
                     onClick={() => handleOverrideBlock(alert.id, alert.payout_id)}
                     className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded text-sm font-medium transition-colors"
                   >
                     CFO Override
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div>
          <PayoutManagerWidget />
        </div>
        
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Bills (NPLAB)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-medium text-gray-500">Total Billed This Period</span>
                <span className="text-2xl font-bold">{!dashboardData ? <SkeletonLoader width="120px" height="32px" /> : <AnimatedNumber value={totalPaid} isCurrency={true} />}</span>
              </div>
              
              {!dashboardData ? (
                <div className="space-y-4">
                  <SkeletonLoader height="60px" />
                  <SkeletonLoader height="60px" />
                  <SkeletonLoader height="60px" />
                </div>
              ) : bills.length === 0 ? (
                <p className="text-sm text-gray-500">No recent bills found for NPLAB.</p>
              ) : (
                <div className="overflow-x-auto max-h-[400px] border border-gray-200 rounded-lg shadow-sm">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className={`font-semibold text-gray-700 ${density === 'compact' ? 'px-3 py-2' : 'px-4 py-3'}`}>Bill #</th>
                        <th className={`font-semibold text-gray-700 ${density === 'compact' ? 'px-3 py-2' : 'px-4 py-3'}`}>Date</th>
                        <th className={`font-semibold text-gray-700 text-right ${density === 'compact' ? 'px-3 py-2' : 'px-4 py-3'}`}>Total</th>
                        <th className={`font-semibold text-gray-700 text-center ${density === 'compact' ? 'px-3 py-2' : 'px-4 py-3'}`}>Status</th>
                        <th className={`font-semibold text-gray-700 ${density === 'compact' ? 'px-3 py-2' : 'px-4 py-3'}`}>Notes (Inline Edit)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {bills.map((bill, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors group">
                          <td className={`font-medium ${density === 'compact' ? 'px-3 py-1.5' : 'px-4 py-3'}`}>{bill.bill_number}</td>
                          <td className={`text-gray-500 ${density === 'compact' ? 'px-3 py-1.5' : 'px-4 py-3'}`}>{bill.date}</td>
                          <td className={`font-bold text-right ${density === 'compact' ? 'px-3 py-1.5' : 'px-4 py-3'}`}>{formatCurrency(bill.total)}</td>
                          <td className={`text-center font-bold ${density === 'compact' ? 'px-3 py-1.5' : 'px-4 py-3'} ${bill.status === 'paid' ? 'text-emerald-600' : 'text-orange-500'}`}>
                            {bill.status.toUpperCase()}
                          </td>
                          <td className={`${density === 'compact' ? 'px-3 py-1' : 'px-4 py-2'}`}>
                            <input 
                              type="text" 
                              value={billNotes[bill.bill_number] || ''}
                              onChange={(e) => handleNoteChange(bill.bill_number, e.target.value)}
                              placeholder="Add note..."
                              className="w-full text-sm border-transparent bg-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 transition-all outline-none"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}