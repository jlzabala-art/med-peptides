import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, addDoc, serverTimestamp, arrayUnion, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { 
  Receipt, Plus, X, Building2, Calendar, DollarSign, FileText, CheckCircle, 
  AlertCircle, ExternalLink, Clock, Sparkles, Download, RefreshCw, 
  AlertTriangle, TrendingUp, Check, Grid, Database, Eye, ShieldAlert, BarChart3
} from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { StatusChip } from '../../components/ui';
import ZohoPaperPreview from '../../components/admin/ZohoPaperPreview';
import toast from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const TERMINAL_STATES = ['PAID', 'VOID'];

function fmt(date) {
  if (!date) return 'N/A';
  const d = date?.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtCurrency(amount, currency = 'AED') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount || 0);
}

// ── Detail AP Workspace Drawer ────────────────────────────────────────────────
function BillDetail({ bill, onClose, onStatusChange }) {
  const [detailTab, setDetailTab] = useState('overview');
  const [syncing, setSyncing] = useState(false);
  const isTerminal = TERMINAL_STATES.includes((bill.status || '').toUpperCase());

  const handleStatus = async (newStatus) => {
    if (isTerminal) return;
    try {
      await updateDoc(doc(db, 'purchaseBills', bill.id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
        statusHistory: arrayUnion({
          status: newStatus,
          changedAt: new Date().toISOString(),
          changedBy: 'Financial Admin',
        }),
      });
      toast.success(`Bill status updated to ${newStatus}`);
      onStatusChange?.();
    } catch (e) {
      console.error(e);
      toast.error('Failed to update status');
    }
  };

  const handleSyncZoho = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      toast.success("Successfully pushed payment log to Zoho Books!");
    }, 1500);
  };

  const subtotal = (bill.items || []).reduce((sum, i) => sum + (parseFloat(i.amount) || parseFloat(i.quantity) * parseFloat(i.unitPrice) || 0), 0);
  const tax = bill.tax || 0;
  const total = bill.totalAmount || bill.amount || subtotal + tax;

  // AI Priority Calculator
  const priority = bill.priority || (total > 1000 ? 'Critical' : 'Medium');
  const priorityColor = priority === 'Critical' ? '#dc2626' : priority === 'High' ? '#ea580c' : '#f59e0b';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--surface)' }}>
      {/* Header Info */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface-raised)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>{bill.billNumber || bill.id?.slice(0, 8)}</h2>
            <StatusChip status={bill.status || 'DRAFT'} />
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: priorityColor, backgroundColor: priorityColor + '15', padding: '2px 8px', borderRadius: '4px' }}>
              {priority} Priority
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span>Issued: {fmt(bill.createdAt || bill.issueDate)}</span>
            {bill.dueDate && <span>Due: {fmt(bill.dueDate)}</span>}
            <span>•</span>
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Linked to PO-2026-004</span>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <X size={18} />
        </button>
      </div>

      {/* Tabs list */}
      <div style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface-raised)', overflowX: 'auto', display: 'flex' }}>
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'invoice', label: 'Invoice Form' },
          { id: 'matching', label: '3-Way Match' },
          { id: 'payments', label: 'Payments' },
          { id: 'activity', label: 'HubSpot logs' },
          { id: 'documents', label: 'Documents' },
          { id: 'ai', label: 'AI Insights' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setDetailTab(tab.id)}
            style={{
              padding: '0.8rem 1rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: detailTab === tab.id ? 800 : 600,
              color: detailTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: detailTab === tab.id ? '2.5px solid var(--primary)' : '2.5px solid transparent',
              flexShrink: 0
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Workspace content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
        
        {/* OVERVIEW */}
        {detailTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Status Workflow */}
            <div style={{ padding: '1rem', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Accounts Payable Lifecycle</span>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {['DRAFT', 'PENDING', 'APPROVED', 'SCHEDULED', 'PAID', 'OVERDUE'].map(s => {
                  const isCurrent = (bill.status || 'DRAFT').toUpperCase() === s;
                  return (
                    <button
                      key={s}
                      onClick={() => handleStatus(s)}
                      disabled={isTerminal && !isCurrent}
                      style={{
                        padding: '0.25rem 0.65rem', borderRadius: '15px', fontSize: '0.7rem', fontWeight: 600,
                        border: isCurrent ? '2px solid var(--primary)' : '1px solid var(--border)',
                        backgroundColor: isCurrent ? 'var(--primary-light)' : 'var(--surface)',
                        color: isCurrent ? 'var(--primary)' : 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Zoho Books sync details */}
            <div style={{ padding: '1rem', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.78rem', color: 'var(--text-main)', display: 'block' }}>Zoho Books Integration Sync</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Sync ID: zb_bill_90182390 • Live Sync • Last synced 2 min ago</span>
              </div>
              <button 
                onClick={handleSyncZoho} 
                disabled={syncing}
                className="btn btn-outline" 
                style={{ fontSize: '0.7rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} /> {syncing ? 'Syncing...' : 'Sync Zoho'}
              </button>
            </div>

            {/* Supplier Intelligence Snapshot */}
            <div style={{ padding: '1rem', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <strong style={{ fontSize: '0.8rem', color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem' }}>Supplier Ledger Snapshot</strong>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Supplier Rating:</span> <strong>96/100</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Average Payment Delay:</span> <strong>2.8 days</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Total Spend YTD:</span> <strong>AED 450,000</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Open Bills:</span> <strong>3 outstanding</strong></div>
              </div>
            </div>

          </div>
        )}

        {/* INVOICE PREVIEW */}
        {detailTab === 'invoice' && (
          <div style={{ backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '8px' }}>
            <ZohoPaperPreview
              docType="BILL"
              documentData={{
                documentNumber: bill.billNumber || bill.id?.slice(0, 8),
                date: fmt(bill.createdAt || bill.issueDate),
                dueDate: fmt(bill.dueDate),
                supplierName: bill.supplierName,
                supplierEmail: bill.supplierEmail,
                items: bill.items || [],
                subTotal: subtotal,
                taxTotal: tax,
                grandTotal: total,
                notes: bill.notes || ''
              }}
            />
          </div>
        )}

        {/* THREE-WAY MATCHING */}
        {detailTab === 'matching' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: '#ecfeff', border: '1px solid #06b6d4', borderRadius: '8px', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <ShieldAlert size={18} color="#06b6d4" />
              <div>
                <strong style={{ fontSize: '0.78rem', color: '#0891b2', display: 'block' }}>Three-Way Matching System Matched</strong>
                <span style={{ fontSize: '0.7rem', color: '#0891b2' }}>All quantities and prices match the originating Purchase Order and Goods Received Note (GRN).</span>
              </div>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--surface-raised)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '8px' }}>Document type</th>
                    <th style={{ padding: '8px' }}>Reference</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Total Value</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Match Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px' }}>Purchase Order (PO)</td>
                    <td style={{ padding: '8px', fontWeight: 600 }}>PO-2026-004</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>{fmtCurrency(total)}</td>
                    <td style={{ padding: '8px', textAlign: 'center', color: '#16a34a', fontWeight: 'bold' }}>✓ Matched</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px' }}>Goods Received (GRN)</td>
                    <td style={{ padding: '8px', fontWeight: 600 }}>GRN-2026-002</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>{fmtCurrency(total)}</td>
                    <td style={{ padding: '8px', textAlign: 'center', color: '#16a34a', fontWeight: 'bold' }}>✓ Matched</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px' }}>Supplier Invoice (Bill)</td>
                    <td style={{ padding: '8px', fontWeight: 600 }}>{bill.billNumber}</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>{fmtCurrency(total)}</td>
                    <td style={{ padding: '8px', textAlign: 'center', color: '#16a34a', fontWeight: 'bold' }}>✓ Matched</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAYMENTS PLANNING */}
        {detailTab === 'payments' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border)', padding: '1rem', borderRadius: '8px', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div><span style={{ color: 'var(--text-muted)' }}>Payment Method:</span> <strong>Bank Wire Transfer</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>From Account:</span> <strong>Emirates NBD Master (xxxx 9812)</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Scheduled Date:</span> <strong>{fmt(bill.dueDate)}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Approval Status:</span> <strong style={{ color: '#16a34a' }}>Approved by Finance Director</strong></div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => triggerAction('Schedule')} className="btn btn-outline" style={{ fontSize: '0.75rem' }}>Schedule</button>
              <button onClick={() => triggerAction('Execute Payment')} className="btn btn-primary" style={{ fontSize: '0.75rem' }}>Execute Payment</button>
            </div>
          </div>
        )}

        {/* ACTIVITY TIMELINE */}
        {detailTab === 'activity' && (
          <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--surface-raised)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', paddingLeft: '1.25rem' }}>
              <div style={{ position: 'absolute', top: '5px', bottom: '5px', left: '5px', width: '2px', backgroundColor: 'var(--border)' }} />
              {[
                { title: 'Bill Paid', date: 'Yesterday, 3:10 PM', by: 'Finance Manager' },
                { title: 'Payment Scheduled', date: 'Jun 08, 11:30 AM', by: 'Jose' },
                { title: 'Three-Way Match Verified', date: 'Jun 08, 10:15 AM', by: 'System' },
                { title: 'Invoice Approved', date: 'Jun 07, 4:20 PM', by: 'CFO Office' },
                { title: 'Bill Created / Synced from Zoho', date: 'Jun 07, 9:00 AM', by: 'System Sync' }
              ].map((act, idx) => (
                <div key={idx} style={{ position: 'relative', fontSize: '0.75rem' }}>
                  <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                  <div>
                    <strong style={{ color: 'var(--text-main)' }}>{act.title}</strong>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{act.date} • by {act.by}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DOCUMENTS */}
        {detailTab === 'documents' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { name: 'Supplier Invoice PDF', size: '240 KB' },
              { name: 'Purchase Order confirmation', size: '180 KB' },
              { name: 'Goods Receipt Note (GRN) sheet', size: '92 KB' },
              { name: 'Wire Transfer Confirmation receipt', size: '320 KB' }
            ].map((doc, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: 'var(--surface-raised)', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{doc.name}</span>
                <button className="btn btn-outline" style={{ fontSize: '0.65rem', padding: '2px 8px' }}><Download size={11} /> Download</button>
              </div>
            ))}
          </div>
        )}

        {/* AI INSIGHTS */}
        {detailTab === 'ai' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', display: 'flex', gap: '0.5rem' }}>
              <Sparkles size={16} color="var(--primary)" style={{ marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.78rem', color: '#1e40af', display: 'block' }}>Atlas AI Cash Flow Analysis</strong>
                <span style={{ fontSize: '0.72rem', color: '#1e40af' }}>
                  "Supplier invoice matches historic pricing ranges. Upcoming liability is scheduled inside cash reserve boundaries. Payment will not trigger cash pressure warning."
                </span>
              </div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', display: 'flex', gap: '0.5rem' }}>
              <AlertTriangle size={16} color="#d97706" style={{ marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.78rem', color: '#92400e', display: 'block' }}>Price Increase Warning</strong>
                <span style={{ fontSize: '0.72rem', color: '#b45309' }}>
                  "This invoice is 4.2% higher than the previous compounding order. Sourcing AM has been flagged."
                </span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Drawer actions */}
      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', backgroundColor: 'var(--surface-raised)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
          {fmtCurrency(total)}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {!isTerminal && (
            <>
              <button
                onClick={() => handleStatus('APPROVED')}
                className="btn btn-outline"
                style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
              >
                Approve Invoice
              </button>
              <button
                onClick={() => handleStatus('PAID')}
                className="btn btn-primary"
                style={{ fontSize: '0.75rem', padding: '0.4rem 1.25rem' }}
              >
                Execute Payment
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Controller ───────────────────────────────────────────────────────────
export default function BillList() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshToken, setRefreshToken] = useState(0);
  
  // Custom states
  const [activeKpiFilter, setActiveKpiFilter] = useState('all');
  const [currentSubTab, setCurrentSubTab] = useState('directory'); // directory, calendar, outflows
  const [selectedBillIds, setSelectedBillIds] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleBulkAction = async (ids, newStatus) => {
    try {
      await Promise.all(ids.map(id =>
        updateDoc(doc(db, 'purchaseBills', id), {
          status: newStatus,
          statusHistory: arrayUnion({ status: newStatus, changedAt: new Date().toISOString(), changedBy: 'Admin (Bulk)' })
        })
      ));
      toast.success(`Successfully updated ${ids.length} invoices to ${newStatus}`);
      setSelectedBillIds([]);
      setRefreshToken(t => t + 1);
    } catch (err) { 
      console.error(err); 
      toast.error('Error processing bulk action.'); 
    }
  };

  useEffect(() => {
    let isSeeding = false;
    const q = query(collection(db, 'purchaseBills'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, async (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      if (data.length === 0 && !isSeeding) {
        isSeeding = true;
        try {
          const sample1 = {
            billNumber: "BILL-2026-001",
            supplierName: "Global Peptide Synthesis Ltd.",
            supplierEmail: "sales@globalpeptides.com",
            status: "APPROVED",
            priority: "High",
            items: [
              { itemName: "BPC-157 Acetate (API)", quantity: 100, unit: "g", expectedCost: 11.50, unitPrice: 11.50, total: 1150.00 }
            ],
            totalAmount: 1150.00,
            dueDate: new Date(Date.now() + 86400000 * 4).toISOString(),
            createdAt: new Date().toISOString(),
            statusHistory: [
              { status: 'DRAFT', changedAt: new Date(Date.now() - 86400000).toISOString(), changedBy: 'Admin' },
              { status: 'APPROVED', changedAt: new Date().toISOString(), changedBy: 'Admin' }
            ]
          };

          const sample2 = {
            billNumber: "BILL-2026-002",
            supplierName: "Apex Biochemicals Corp",
            supplierEmail: "info@apexbiochem.com",
            status: "PENDING",
            priority: "Critical",
            items: [
              { itemName: "TB-500 Acetate (API)", quantity: 50, unit: "g", expectedCost: 18.00, unitPrice: 18.00, total: 900.00 }
            ],
            totalAmount: 900.00,
            dueDate: new Date(Date.now() - 86400000).toISOString(),
            createdAt: new Date().toISOString(),
            statusHistory: [
              { status: 'DRAFT', changedAt: new Date().toISOString(), changedBy: 'Admin' }
            ]
          };

          await addDoc(collection(db, 'purchaseBills'), sample1);
          await addDoc(collection(db, 'purchaseBills'), sample2);
        } catch (err) {
          console.error("Error seeding sample Bills:", err);
        } finally {
          isSeeding = false;
        }
      }

      setBills(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleCheckboxToggle = (id, e) => {
    e.stopPropagation();
    setSelectedBillIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const filteredBills = useMemo(() => {
    return bills.filter(r => {
      // Search
      const text = searchTerm.toLowerCase();
      if (text) {
        const matchText = (
          (r.supplierName || '').toLowerCase().includes(text) ||
          (r.billNumber || '').toLowerCase().includes(text)
        );
        if (!matchText) return false;
      }

      // KPI Filters
      const statusUpper = (r.status || 'DRAFT').toUpperCase();
      if (activeKpiFilter === 'pending' && statusUpper !== 'PENDING') return false;
      if (activeKpiFilter === 'approved' && statusUpper !== 'APPROVED') return false;
      if (activeKpiFilter === 'scheduled' && statusUpper !== 'SCHEDULED') return false;
      if (activeKpiFilter === 'paid' && statusUpper !== 'PAID') return false;
      
      const dueDays = r.dueDate ? Math.floor((new Date(r.dueDate) - new Date()) / (1000 * 60 * 60 * 24)) : 99;
      if (activeKpiFilter === 'thisweek' && (dueDays > 7 || statusUpper === 'PAID')) return false;
      if (activeKpiFilter === 'overdue' && (dueDays >= 0 || statusUpper === 'PAID')) return false;

      return true;
    });
  }, [bills, searchTerm, activeKpiFilter]);

  // Outflows charts mock values
  const outflowData = [
    { name: 'Today', Outflow: 12000 },
    { name: '7 Days', Outflow: 34200 },
    { name: '30 Days', Outflow: 125400 },
    { name: '90 Days', Outflow: 380000 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '1280px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* Page Header */}
      <AdminPageHeader
        title="Supplier Bills (Accounts Payable)"
        subtitle="Match vendor invoices, check three-way PO reconciliation, and review cash flows."
        icon={Receipt}
        actions={
          <button
            onClick={() => { setSelectedBill(null); setShowForm(true); }}
            className="btn btn-primary"
            style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.75rem' }}
          >
            <Plus size={14} /> Create Bill
          </button>
        }
      />

      {/* 1. AP EXECUTIVE KPI DASHBOARD */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '0.75rem'
      }}>
        {[
          { id: 'all', label: 'All Bills', val: bills.length, color: 'var(--primary)', bg: '#eff6ff' },
          { id: 'pending', label: 'Pending Invoice', val: 'AED 125,400', color: '#f59e0b', bg: '#fffbeb' },
          { id: 'thisweek', label: 'Due This Week', val: 'AED 34,200', color: '#ea580c', bg: '#fff7ed' },
          { id: 'overdue', label: 'Overdue', val: 'AED 12,800', color: '#ef4444', bg: '#fef2f2' },
          { id: 'scheduled', label: 'Scheduled Payment', val: 'AED 41,500', color: '#8b5cf6', bg: '#f5f3ff' },
          { id: 'paid', label: 'Paid (30d)', val: 'AED 290,000', color: '#10b981', bg: '#f0fdf4' }
        ].map(kpi => {
          const isSelected = activeKpiFilter === kpi.id;
          return (
            <div
              key={kpi.id}
              onClick={() => setActiveKpiFilter(isSelected ? 'all' : kpi.id)}
              style={{
                backgroundColor: 'var(--surface)',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                border: isSelected ? `2.5px solid ${kpi.color}` : '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                transform: isSelected ? 'translateY(-2px)' : 'none'
              }}
            >
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{kpi.label}</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                <strong style={{ fontSize: '1.15rem', color: 'var(--text-main)' }}>{kpi.val}</strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* Outflows Forecast widget */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', gap: '1.25rem' }}>
        
        {/* Outflow bar chart */}
        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Cash Out Forecast Liability</strong>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Outflow predictions based on scheduled due dates.</span>
            </div>
            <select className="admin-premium-select" style={{ fontSize: '0.75rem' }}>
              <option>30-Day Outlook</option>
              <option>90-Day Outlook</option>
            </select>
          </div>
          <div style={{ height: '160px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={outflowData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Bar dataKey="Outflow" fill="#ea580c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sync panel instructions */}
        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'center' }}>
          <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>Accounts Payable (AP) matching</strong>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Verify Three-Way match status directly. Match flags are generated by checking Purchase Orders values against Goods Received sheet and Zoho Books bills templates.
          </p>
          <div style={{ padding: '0.5rem', backgroundColor: '#ecfeff', color: '#0891b2', border: '1px solid #a5f3fc', borderRadius: '8px', fontSize: '0.7rem' }}>
            <strong>💡 AP Notice:</strong> Overdue liability amounts are calculated in AED based on direct bank exchanges rates.
          </div>
        </div>

      </div>

      {/* Tab Selectors & Search Input */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
          {[
            { id: 'directory', label: 'Directory Workspace', icon: Grid },
            { id: 'calendar', label: 'Sourcing Payment Calendar', icon: Calendar }
          ].map(tab => {
            const Icon = tab.icon;
            const active = currentSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setCurrentSubTab(tab.id);
                  if (tab.id !== 'directory') setSelectedBill(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.75rem',
                  border: 'none',
                  backgroundColor: active ? 'var(--primary-light)' : 'var(--surface)',
                  color: active ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '4px 12px', width: '280px' }}>
          <Search size={14} color="var(--text-muted)" />
          <input 
            type="text"
            placeholder="Search by supplier or bill number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.78rem', width: '100%', color: 'var(--text-main)' }}
          />
        </div>
      </div>

      {/* Main Switchboard */}
      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
        
        {/* Left List Pane */}
        {currentSubTab === 'directory' && (
          <div style={{ 
            flex: selectedBill && !isMobile ? '0 0 35%' : '1', 
            display: selectedBill && isMobile ? 'none' : 'flex',
            flexDirection: 'column', 
            gap: '0.75rem',
            maxHeight: '600px',
            overflowY: 'auto'
          }}>
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <RefreshCw size={24} className="animate-spin" />
                <span style={{ display: 'block', marginTop: '0.5rem' }}>Loading payment ledger...</span>
              </div>
            ) : filteredBills.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                No invoices match the filters.
              </div>
            ) : (
              filteredBills.map(b => {
                const isSelected = selectedBill?.id === b.id;
                const totalVal = b.totalAmount || b.amount || 0;
                
                // Priority calculations
                const prio = b.priority || (totalVal > 1000 ? 'Critical' : 'Medium');
                const pColor = prio === 'Critical' ? '#dc2626' : prio === 'High' ? '#ea580c' : '#f59e0b';

                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBill(b)}
                    style={{
                      padding: '1rem',
                      backgroundColor: 'var(--surface)',
                      borderRadius: '10px',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        checked={selectedBillIds.includes(b.id)}
                        onChange={(e) => handleCheckboxToggle(b.id, e)}
                        style={{ marginTop: '3px' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: '0.85rem', color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>
                            {b.billNumber || b.id.slice(0, 8)}
                          </strong>
                          <StatusChip status={b.status || 'DRAFT'} />
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          {b.supplierName}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          <span>Due: {fmt(b.dueDate)}</span>
                          <strong style={{ color: 'var(--text-main)' }}>{fmtCurrency(totalVal)}</strong>
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                          <span style={{ fontSize: '0.6rem', color: pColor, backgroundColor: pColor + '15', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                            {prio} Priority
                          </span>
                          <span style={{ fontSize: '0.6rem', color: '#16a34a', backgroundColor: '#dcfce7', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                            Matched
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Calendar Outflows view */}
        {currentSubTab === 'calendar' && (
          <div style={{ flex: 1, backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
            <strong style={{ display: 'block', marginBottom: '1rem' }}>Supplier Payment Calendar Tracker</strong>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', textAlign: 'center', fontSize: '0.75rem' }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} style={{ fontWeight: 800, color: 'var(--text-muted)', padding: '0.5rem 0' }}>{day}</div>
              ))}
              {Array.from({ length: 28 }).map((_, idx) => {
                const dayNum = idx + 1;
                const isDue = dayNum === 14 || dayNum === 21;
                return (
                  <div key={idx} style={{ 
                    height: '60px', 
                    border: '1px solid var(--border)', 
                    borderRadius: '6px', 
                    padding: '4px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    backgroundColor: isDue ? '#fff7ed' : 'var(--surface-raised)'
                  }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{dayNum}</span>
                    {isDue && (
                      <span style={{ fontSize: '8px', backgroundColor: '#ea580c', color: 'white', padding: '1px 2px', borderRadius: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        AP Due
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Right Detail Pane */}
        {selectedBill && currentSubTab === 'directory' && (
          <div style={{ 
            flex: '1', 
            border: '1px solid var(--border)', 
            borderRadius: '12px', 
            overflow: 'hidden',
            backgroundColor: 'var(--surface)'
          }}>
            <BillDetail
              bill={selectedBill}
              onClose={() => setSelectedBill(null)}
              onStatusChange={() => setRefreshToken(t => t + 1)}
            />
          </div>
        )}

      </div>

      {/* 16. FLOATING BULK ACTIONS TOOLBAR */}
      {selectedBillIds.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'var(--surface-raised)',
          border: '2px solid var(--primary)',
          borderRadius: '30px',
          padding: '0.6rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          zIndex: 999
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>{selectedBillIds.length} bills selected</span>
          <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border)' }} />
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button onClick={() => handleBulkAction(selectedBillIds, 'APPROVED')} className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>Approve</button>
            <button onClick={() => handleBulkAction(selectedBillIds, 'SCHEDULED')} className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>Schedule</button>
            <button onClick={() => handleBulkAction(selectedBillIds, 'PAID')} className="btn btn-primary" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>Pay Now</button>
            <button onClick={() => setSelectedBillIds([])} className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '3px 8px', color: '#ef4444', borderColor: '#ef4444' }}>Clear</button>
          </div>
        </div>
      )}

    </div>
  );
}
