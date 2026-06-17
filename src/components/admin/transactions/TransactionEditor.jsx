import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../../../firebase';
import TransactionItemTable from './TransactionItemTable';
import { ChevronLeft, Save, Send } from 'lucide-react';

export default function TransactionEditor() {
  const { type } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customer, setCustomer] = useState('');
  
  const [headerData, setHeaderData] = useState({
    location: 'Organization Address',
    transactionNo: `${type.toUpperCase()}-2026-001`,
    reference: '',
    date: new Date().toISOString().split('T')[0],
    expiryDate: '',
    salesperson: 'Jose Zabala',
  });

  // Map transaction type to readable title
  const typeTitles = {
    quote: 'New Quote',
    'sales-order': 'New Sales Order',
    invoice: 'New Invoice',
    'purchase-order': 'New Purchase Order',
    bill: 'New Bill'
  };

  const title = typeTitles[type] || 'New Transaction';

  useEffect(() => {
    // 1. Preload items from location state if provided
    if (location.state?.prefilledItems) {
      const prefilled = location.state.prefilledItems.map(item => ({
        ...item,
        quantity: 1,
        rate: item.msrp || item.price || item.cost || 0,
        amount: item.msrp || item.price || item.cost || 0
      }));
      setItems(prefilled);
    }

    // 2. Load real customers/vendors from db 
    // In a real scenario you might differentiate customers vs vendors based on type
    const fetchEntities = async () => {
      try {
        // Querying 'clinics' or 'users' as a mockup of real db call for customers
        const q = query(collection(db, 'clinics'));
        const snap = await getDocs(q);
        const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (fetched.length > 0) {
          setCustomers(fetched);
        } else {
          // Fallback mockup if clinics collection is empty
          setCustomers([
            { id: '1', name: 'Mediluxe Health' },
            { id: '2', name: 'Apex Longevity Clinic' }
          ]);
        }
      } catch(e) {
        console.error("Error fetching customers:", e);
      }
    };
    
    fetchEntities();
  }, [location.state, type]);

  const handleHeaderChange = (field, value) => {
    setHeaderData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', minHeight: '100vh', backgroundColor: '#fff' }}>
      {/* Top Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}
          >
            <ChevronLeft size={16} /> Back
          </button>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Box size={24} color="#2563eb" /> {title}
          </h1>
        </div>
      </div>

      {/* Header Form */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ width: '120px', color: '#ef4444', fontWeight: 500, fontSize: '0.9rem' }}>Customer Name*</label>
            <select 
              value={customer} 
              onChange={(e) => setCustomer(e.target.value)}
              style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.9rem', backgroundColor: '#fff' }}
            >
              <option value="">Select or add a customer</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ width: '120px', color: '#0f172a', fontWeight: 500, fontSize: '0.9rem' }}>Location</label>
            <select 
              value={headerData.location} 
              onChange={(e) => handleHeaderChange('location', e.target.value)}
              style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.9rem', backgroundColor: '#fff' }}
            >
              <option value="Organization Address">Organization Address</option>
              <option value="Billing Address">Billing Address</option>
            </select>
          </div>
          
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ width: '120px', color: '#ef4444', fontWeight: 500, fontSize: '0.9rem' }}>{type.split('-')[0].toUpperCase()}#*</label>
            <input 
              type="text" 
              value={headerData.transactionNo}
              onChange={(e) => handleHeaderChange('transactionNo', e.target.value)}
              style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.9rem' }}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ width: '120px', color: '#0f172a', fontWeight: 500, fontSize: '0.9rem' }}>Reference#</label>
            <input 
              type="text" 
              value={headerData.reference}
              onChange={(e) => handleHeaderChange('reference', e.target.value)}
              style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.9rem' }}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label style={{ width: '120px', color: '#ef4444', fontWeight: 500, fontSize: '0.9rem' }}>Date*</label>
              <input 
                type="date" 
                value={headerData.date}
                onChange={(e) => handleHeaderChange('date', e.target.value)}
                style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.9rem' }}
              />
            </div>
            {type === 'quote' && (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label style={{ width: '80px', color: '#0f172a', fontWeight: 500, fontSize: '0.9rem' }}>Expiry</label>
                <input 
                  type="date" 
                  value={headerData.expiryDate}
                  onChange={(e) => handleHeaderChange('expiryDate', e.target.value)}
                  style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.9rem' }}
                />
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ width: '120px', color: '#0f172a', fontWeight: 500, fontSize: '0.9rem' }}>Salesperson</label>
            <select 
              value={headerData.salesperson} 
              onChange={(e) => handleHeaderChange('salesperson', e.target.value)}
              style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.9rem', backgroundColor: '#fff' }}
            >
              <option value="Jose Zabala">Jose Zabala</option>
              <option value="Admin User">Admin User</option>
            </select>
          </div>
          
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>+</span> Select Price List ⌄
        </button>
      </div>

      {/* Item Table component replacing the hardcoded table */}
      <TransactionItemTable 
        items={items} 
        onItemsChange={setItems} 
        transactionType={type}
      />

      {/* Action Buttons */}
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button 
          style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Send size={16} /> Save and Send
        </button>
        <button 
          style={{ padding: '10px 20px', backgroundColor: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Save size={16} /> Save as Draft
        </button>
        <button 
          onClick={() => navigate(-1)}
          style={{ padding: '10px 20px', backgroundColor: 'transparent', color: '#64748b', border: 'none', fontWeight: 500, cursor: 'pointer' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
