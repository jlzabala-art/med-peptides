import Briefcase from "lucide-react/dist/esm/icons/briefcase";
import Plus from "lucide-react/dist/esm/icons/plus";
import Search from "lucide-react/dist/esm/icons/search";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import FileText from "lucide-react/dist/esm/icons/file-text";
import User from "lucide-react/dist/esm/icons/user";
import Building from "lucide-react/dist/esm/icons/building";
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../../firebase';








import { Card, TextField, Select } from '../ui';
import toast from 'react-hot-toast';
import notifier from '../../services/NotificationService';

export default function AdminAgencyDealsTab() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  // Contacts from Zoho/Firebase
  const [contacts, setContacts] = useState([]);

  const [formData, setFormData] = useState({
    supplierId: '',
    customerId: '',
    supplierName: '',
    customerName: '',
    description: '',
    totalVolume: '',
    commissionType: 'percentage', // percentage or fixed
    commissionValue: '',
  });

  useEffect(() => {
    loadDeals();
    loadContacts(); // Mock for now, ideal: load from Zoho or users
  }, []);

  const loadDeals = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'agency_orders'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setDeals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Error loading agency deals:", err);
    }
    setLoading(false);
  };

  const loadContacts = async () => {
    // In a real scenario, this would fetch from Zoho Books API via Cloud Function
    // For now, we seed with Magenta and LotusLand manually if empty
    setContacts([
      { id: '1183263000031386001', name: 'Magenta Compounding Pharmacy', type: 'Customer' },
      { id: '1183263000031386002', name: 'LotusLand', type: 'Vendor' }
    ]);
  };

  const calculateTotalCommission = () => {
    const vol = parseFloat(formData.totalVolume) || 0;
    const val = parseFloat(formData.commissionValue) || 0;
    if (formData.commissionType === 'percentage') {
      return (vol * val) / 100;
    }
    return val;
  };

  const handleCreateDeal = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const calculatedCommission = calculateTotalCommission();
      const newDeal = {
        supplierId: formData.supplierId || 'unknown_supplier',
        supplierName: formData.supplierName,
        customerId: formData.customerId || 'unknown_customer',
        customerName: formData.customerName,
        description: formData.description,
        totalVolume: parseFloat(formData.totalVolume) || 0,
        commissionType: formData.commissionType,
        commissionRate: parseFloat(formData.commissionValue) || 0,
        commissionTotal: calculatedCommission,
        status: 'DRAFT',
        accountManagerId: 'admin', // or from Auth
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'agency_orders'), newDeal);
      setShowModal(false);
      setFormData({
        supplierId: '', customerId: '', supplierName: '', customerName: '',
        description: '', totalVolume: '', commissionType: 'percentage', commissionValue: ''
      });
      loadDeals();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create deal.');
    }
    setSaving(false);
  };

  const handleInvoiceDeal = async (dealId) => {
    notifier.confirmCritical("This will mark the deal as INVOICED. In a full implementation, this triggers a Zoho Books Sales Invoice generation. Proceed?", async () => {
      try {
        await updateDoc(doc(db, 'agency_orders', dealId), {
          status: 'INVOICED',
          invoicedAt: serverTimestamp()
        });
        loadDeals();
      } catch (err) {
        console.error(err);
        toast.error('Error updating deal status.');
      }
    });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Briefcase size={22} color="var(--color-primary)" />
            Agency Deals
          </h2>
          <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Manage B2B Brokerage Deals and Commissions.
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="gcp-btn gcp-btn--primary"
          style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
        >
          <Plus size={16} /> New Agency Deal
        </button>
      </div>

      <Card style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Loader2 size={24} className="spin" style={{ margin: '0 auto 1rem' }} />
            Loading Deals...
          </div>
        ) : deals.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No Agency Deals found. Create one to get started.
          </div>
        ) : (
          <table className="gcp-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Supplier (Pays Comm.)</th>
                <th>End Customer</th>
                <th>Total Volume</th>
                <th>Commission</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {deals.map(deal => (
                <tr key={deal.id}>
                  <td>{deal.createdAt?.toDate ? deal.createdAt.toDate().toLocaleDateString() : 'N/A'}</td>
                  <td style={{ fontWeight: 600 }}>{deal.supplierName}</td>
                  <td>{deal.customerName}</td>
                  <td>${deal.totalVolume?.toLocaleString()}</td>
                  <td style={{ fontWeight: 600, color: 'var(--color-success)' }}>
                    ${deal.commissionTotal?.toLocaleString()} 
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                      ({deal.commissionType === 'percentage' ? `${deal.commissionRate}%` : 'Fixed'})
                    </span>
                  </td>
                  <td>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: deal.status === 'INVOICED' ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)',
                      color: deal.status === 'INVOICED' ? '#2563eb' : '#d97706'
                    }}>
                      {deal.status}
                    </span>
                  </td>
                  <td>
                    {deal.status === 'DRAFT' && (
                      <button 
                        onClick={() => handleInvoiceDeal(deal.id)}
                        style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
                      >
                        Mark Invoiced
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Modal Overlay */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Card style={{ width: '500px', padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem', fontWeight: 700 }}>New Agency Deal</h3>
            <form onSubmit={handleCreateDeal} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Supplier (Vendor)</label>
                  <TextField 
                    type="text" required
                    placeholder="e.g. LotusLand"
                    value={formData.supplierName}
                    onChange={e => setFormData({...formData, supplierName: e.target.value})}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>End Customer</label>
                  <TextField 
                    type="text" required
                    placeholder="e.g. Magenta"
                    value={formData.customerName}
                    onChange={e => setFormData({...formData, customerName: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Deal Description</label>
                <textarea 
                  required rows={3}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="e.g. B2B Order matching 22 peptide items."
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Total Cargo Volume ($)</label>
                <TextField 
                  type="number" required min="0" step="0.01"
                  value={formData.totalVolume}
                  onChange={e => setFormData({...formData, totalVolume: e.target.value})}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Commission Type</label>
                  <Select 
                    value={formData.commissionType}
                    onChange={e => setFormData({...formData, commissionType: e.target.value})}
                    options={[
                      { label: 'Percentage (%)', value: 'percentage' },
                      { label: 'Flat Fee ($)', value: 'flat' }
                    ]}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    {formData.commissionType === 'percentage' ? 'Commission Rate (%)' : 'Commission Amount ($)'}
                  </label>
                  <TextField 
                    type="number" required min="0" step="0.01"
                    value={formData.commissionValue}
                    onChange={e => setFormData({...formData, commissionValue: e.target.value})}
                  />
                </div>
                <div style={{ gridColumn: 'span 2', textAlign: 'right', fontWeight: 700, color: 'var(--color-success)', marginTop: '0.5rem' }}>
                  Expected Revenue: ${calculateTotalCommission().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  style={{ padding: '0.5rem 1rem', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 600, color: 'var(--text-muted)' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="gcp-btn gcp-btn--primary"
                  style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                >
                  {saving ? <Loader2 size={16} className="spin" /> : <CheckCircle size={16} />}
                  Create Agency Deal
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}