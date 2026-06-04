import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Card } from '../ui';
import { Loader2, Send, ShieldCheck, CheckCircle, Truck, FileCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function PublicSupplierQuote() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [rfq, setRfq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  
  // Shipping State
  const [shippingData, setShippingData] = useState({ carrier: '', awb: '', eta: '' });
  const [shippingSubmitted, setShippingSubmitted] = useState(false);

  useEffect(() => {
    const fetchRFQ = async () => {
      try {
        const docRef = doc(db, 'purchase_rfqs', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.status === 'APPROVED_BY_CLIENT' || data.status === 'AWAITING_INVOICE') {
             setError(t('supplierQuote.noLongerAccepting', "This quote is no longer accepting pricing updates."));
          } else if (data.status === 'SHIPPED' || data.status === 'DELIVERED') {
             setRfq({ id: docSnap.id, ...data });
             setItems(data.items || []);
             setShippingData(data.shippingData || {});
          } else {
             setRfq({ id: docSnap.id, ...data });
             setItems(data.items || []);
             // Mark as viewed
             if (!data.sharedWithSupplier && data.status === 'PRICING_REQUESTED') {
               await updateDoc(docRef, { sharedWithSupplier: true });
             }
          }
        } else {
          setError(t('quote.notFound', "Quote not found or invalid link."));
        }
      } catch (err) {
        console.error(err);
        setError(t('quote.errorLoading', "Error loading quote."));
      }
      setLoading(false);
    };
    fetchRFQ();
  }, [id, t]);

  const handleCostChange = (index, cost) => {
    const updated = [...items];
    updated[index].supplierUnitCost = cost;
    setItems(updated);
  };

  const handleDiscountChange = (index, discount) => {
    const updated = [...items];
    updated[index].itemDiscount = discount;
    setItems(updated);
  };

  const [globalDiscount, setGlobalDiscount] = useState(0);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Re-calculate client price based on new supplier costs and AM's margin settings
      const marginType = rfq.marginType;
      const globalMargin = rfq.globalMargin || 20;

      const finalItems = items.map(item => {
        const m = marginType === 'global' ? globalMargin : (item.marginPercent || 20);
        const cost = parseFloat(item.supplierUnitCost) || 0;
        const price = cost * (1 + (m / 100));
        return {
          ...item,
          clientUnitPrice: price
        };
      });

      await updateDoc(doc(db, 'purchase_rfqs', id), {
        items: finalItems,
        globalDiscount: parseFloat(globalDiscount) || 0,
        status: 'PRICING_SUBMITTED' // Alert AM
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert(t('supplierQuote.errorSubmitting', "Error submitting prices."));
    }
    setLoading(false);
  };

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="spin" /></div>;
  
  if (error) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <Card style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px' }}>
        <h2 style={{ color: '#b91c1c' }}>{t('quote.accessDenied', "Access Denied")}</h2>
        <p>{error}</p>
      </Card>
    </div>
  );

  if (submitted) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <Card style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px' }}>
        <CheckCircle size={48} color="#16a34a" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ color: '#166534', margin: '0 0 1rem' }}>{t('supplierQuote.pricingSubmitted', "Pricing Submitted!")}</h2>
        <p style={{ color: 'var(--text-muted)' }}>{t('supplierQuote.thankYou', "Thank you. The Account Manager has been notified and will review your unit costs.")}</p>
      </Card>
    </div>
  );

  if (shippingSubmitted || rfq?.status === 'SHIPPED' || rfq?.status === 'DELIVERED') return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <Card style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px' }}>
        <Truck size={48} color="#3b82f6" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ color: '#1d4ed8', margin: '0 0 1rem' }}>{t('supplierQuote.shipmentLogged', "Shipment Logged!")}</h2>
        <p style={{ color: 'var(--text-muted)' }}>{t('supplierQuote.shipmentLoggedDesc', "Thank you for providing the shipping details. The client has been notified.")}</p>
        <div style={{ marginTop: '1.5rem', background: '#eff6ff', padding: '1rem', borderRadius: '8px', textAlign: 'left', fontSize: '0.9rem', color: '#1e3a8a' }}>
          <strong>{t('quote.carrier', "Carrier")}:</strong> {shippingData.carrier || rfq?.shippingData?.carrier}<br/>
          <strong>{t('supplierQuote.awb', "AWB")}:</strong> {shippingData.awb || rfq?.shippingData?.awb}<br/>
          <strong>{t('supplierQuote.eta', "ETA")}:</strong> {shippingData.eta || rfq?.shippingData?.eta}
        </div>
      </Card>
    </div>
  );

  const handleShippingSubmit = async () => {
    if (!shippingData.carrier || !shippingData.awb) {
      alert(t('supplierQuote.provideCarrierAwb', "Please provide Carrier and AWB Tracking Number."));
      return;
    }
    setLoading(true);
    try {
      await updateDoc(doc(db, 'purchase_rfqs', id), {
        status: 'SHIPPED',
        shippingData
      });
      setShippingSubmitted(true);
    } catch (err) {
      console.error(err);
      alert(t('supplierQuote.errorSavingShipment', "Error saving shipment."));
    }
    setLoading(false);
  };

  if (rfq?.status === 'RECONCILED') {
    return (
      <div style={{ minHeight: '100vh', background: '#f1f5f9', padding: '3rem 1rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', justifyContent: 'center', color: '#64748b' }}>
            <Truck size={20} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>{t('supplierQuote.shippingPortal', "Supplier Shipping Portal")}</span>
          </div>

          <Card style={{ padding: '0', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '2rem', background: 'white', borderBottom: '1px solid #e2e8f0' }}>
              <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', color: '#0f172a' }}>{t('supplierQuote.logisticsOrder', "Logistics for Order #{{id}}", { id: id.slice(0,6).toUpperCase() })}</h1>
              <p style={{ margin: 0, color: '#64748b' }}>{t('supplierQuote.provideTracking', "Please provide the tracking information for this shipment. Uploading COAs for each product is required.")}</p>
            </div>

            <div style={{ padding: '2rem', background: '#fafafa' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>{t('quote.carrier', "Carrier")}</label>
                  <input type="text" value={shippingData.carrier} onChange={e => setShippingData({...shippingData, carrier: e.target.value})} placeholder="e.g. DHL, FedEx" style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>{t('supplierQuote.trackingAwb', "Tracking AWB")}</label>
                  <input type="text" value={shippingData.awb} onChange={e => setShippingData({...shippingData, awb: e.target.value})} placeholder="AWB Number" style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>{t('quote.estDelivery', "Est. Delivery")}</label>
                  <input type="date" value={shippingData.eta} onChange={e => setShippingData({...shippingData, eta: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                </div>
              </div>

              <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '1rem' }}>{t('supplierQuote.productCoas', "Product COAs")}</h3>
              <table className="gcp-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '1rem', background: '#f8fafc' }}>{t('supplierQuote.product', "Product")}</th>
                    <th style={{ textAlign: 'right', padding: '1rem', background: '#f8fafc' }}>{t('supplierQuote.action', "Action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: 'white' }}>
                      <td style={{ padding: '1rem' }}>
                        <strong style={{ color: '#334155' }}>{item.itemName || item.peptide_name}</strong>
                      </td>
                      <td style={{ textAlign: 'right', padding: '1rem' }}>
                        <button style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', border: '1px solid #3b82f6', borderRadius: '4px', background: '#eff6ff', color: '#1d4ed8', cursor: 'pointer' }}>
                          {t('supplierQuote.uploadCoa', "Upload COA (PDF)")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ padding: '1.5rem 2rem', background: 'white', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0' }}>
              <button 
                onClick={handleShippingSubmit}
                className="gcp-btn gcp-btn--primary" 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', fontSize: '1rem', background: '#3b82f6' }}
              >
                <Send size={18} /> {t('supplierQuote.confirmShipment', "Confirm Shipment")}
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', padding: '3rem 1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', justifyContent: 'center', color: '#64748b' }}>
          <ShieldCheck size={20} />
          <span style={{ fontSize: '0.9rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>{t('supplierQuote.securePortal', "Secure Supplier Portal")}</span>
        </div>

        <Card style={{ padding: '0', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '2rem', background: 'white', borderBottom: '1px solid #e2e8f0' }}>
            <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', color: '#0f172a' }}>{t('supplierQuote.requestForQuote', "Request For Quote #{{id}}", { id: id.slice(0,6).toUpperCase() })}</h1>
            <p style={{ margin: 0, color: '#64748b' }}>{t('supplierQuote.provideBestCost', "Please provide your best unit cost for the items requested below. The client's identity is protected by your broker.")}</p>
          </div>

          <div style={{ padding: '2rem', background: '#fafafa' }}>
            <table className="gcp-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '1rem', background: '#f8fafc' }}>{t('supplierQuote.productDesc', "Product Description")}</th>
                  <th style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc' }}>{t('supplierQuote.reqQty', "Required Qty")}</th>
                  <th style={{ textAlign: 'right', padding: '1rem', background: '#f8fafc' }}>{t('supplierQuote.unitCost', "Your Unit Cost (USD)")}</th>
                  <th style={{ textAlign: 'right', padding: '1rem', background: '#f8fafc' }}>{t('supplierQuote.itemDiscount', "Item Discount (USD)")}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const cost = parseFloat(item.supplierUnitCost) || 0;
                  const discount = parseFloat(item.itemDiscount) || 0;
                  const netCost = cost - discount;
                  return (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: 'white' }}>
                    <td style={{ padding: '1rem' }}>
                      <strong style={{ color: '#334155' }}>{item.itemName || item.peptide_name}</strong>
                      {item.dosage && <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>{item.dosage}</div>}
                    </td>
                    <td style={{ textAlign: 'center', padding: '1rem', fontWeight: 600 }}>{item.quantity} {item.unit || ''}</td>
                    <td style={{ textAlign: 'right', padding: '1rem' }}>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>$</span>
                        <input 
                          type="number" min="0" step="0.01"
                          value={item.supplierUnitCost || ''}
                          onChange={(e) => handleCostChange(idx, e.target.value)}
                          placeholder="0.00"
                          style={{ width: '120px', padding: '0.5rem 0.5rem 0.5rem 1.5rem', textAlign: 'right', border: '2px solid #cbd5e1', borderRadius: '6px', fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}
                        />
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', padding: '1rem' }}>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>-$</span>
                        <input 
                          type="number" min="0" step="0.01"
                          value={item.itemDiscount || ''}
                          onChange={(e) => handleDiscountChange(idx, e.target.value)}
                          placeholder="0.00"
                          style={{ width: '100px', padding: '0.5rem 0.5rem 0.5rem 1.8rem', textAlign: 'right', border: '2px dashed #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', color: '#0f172a' }}
                        />
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '1.5rem 2rem', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.2rem' }}>{t('supplierQuote.globalDiscount', "Total Order Discount (USD)")}</label>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#16a34a', fontWeight: 700 }}>-$</span>
                <input 
                  type="number" min="0" step="0.01"
                  value={globalDiscount || ''}
                  onChange={(e) => setGlobalDiscount(e.target.value)}
                  placeholder="0.00"
                  style={{ width: '120px', padding: '0.5rem 0.5rem 0.5rem 1.8rem', textAlign: 'right', border: '2px solid #22c55e', borderRadius: '6px', fontSize: '1rem', fontWeight: 600, color: '#15803d', backgroundColor: '#f0fdf4' }}
                />
              </div>
            </div>
            
            <button 
              onClick={handleSubmit}
              className="gcp-btn gcp-btn--primary" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', fontSize: '1rem' }}
            >
              <Send size={18} /> {t('supplierQuote.submitPricing', "Submit Pricing")}
            </button>
          </div>
        </Card>

      </div>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
