import React, { useState } from 'react';
import { X, Link2, Mail, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../firebase';
import Spinner from '../../ui/Spinner';
import Card from '../../ui/Card';
import { useQueryClient } from '@tanstack/react-query';

export default function PaymentLinkDialog({ order, onClose }) {
  const queryClient = useQueryClient();
  const [currency, setCurrency] = useState('usd');
  const [sendEmail, setSendEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successLink, setSuccessLink] = useState(order?.paymentLink || null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const generatePaymentLink = httpsCallable(functions, 'generatePaymentLink');
      const result = await generatePaymentLink({
        orderId: order.id,
        currency,
        sendEmail
      });
      
      setSuccessLink(result.data.url);
      
      // Invalidate the orders query so the list updates
      queryClient.invalidateQueries({ queryKey: ['managerOrders'] });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to generate link. Check permissions and total amount.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(successLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <Card style={{ width: '100%', maxWidth: '450px', padding: '1.5rem', position: 'relative' }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
        >
          <X size={20} />
        </button>

        <h3 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-primary)' }}>
          <Link2 size={20} color="var(--color-primary)" />
          {successLink ? 'Payment Link Ready' : 'Generate Payment Link'}
        </h3>
        
        {/* Test Mode Warning */}
        <div style={{ backgroundColor: 'var(--color-warning-bg)', border: '1px solid #fef3c7', borderRadius: '8px', padding: '0.75rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', color: 'var(--color-warning)', fontSize: '0.85rem' }}>
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <span><strong>Stripe Test Mode</strong>: Links generated are for testing only. Do not use real credit cards. To use production, the admin must set STRIPE_SECRET_KEY in Firebase Secrets.</span>
        </div>

        {successLink ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ backgroundColor: 'var(--color-success-bg)', color: '#166534', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', wordBreak: 'break-all', fontSize: '0.9rem' }}>
              {successLink}
            </div>
            <button 
              onClick={handleCopy}
              style={{
                width: '100%', padding: '0.75rem', backgroundColor: copied ? 'var(--color-success)' : 'var(--color-primary)',
                color: 'white', border: 'none', borderRadius: '6px', fontWeight: 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s'
              }}
            >
              {copied ? <CheckCircle2 size={18} /> : <Link2 size={18} />}
              {copied ? 'Copied to Clipboard!' : 'Copy Payment Link'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ backgroundColor: 'var(--color-bg-app)', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Order ID:</span>
                <span style={{ fontWeight: 600 }}>{order.id.slice(-6).toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Total Amount:</span>
                <span style={{ fontWeight: 600 }}>${typeof order.total === 'number' ? order.total.toFixed(2) : order.total}</span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Currency</label>
              <select 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}
              >
                <option value="usd">USD ($)</option>
                <option value="eur">EUR (€)</option>
                <option value="mxn">MXN ($)</option>
              </select>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer', padding: '0.5rem', backgroundColor: 'var(--color-bg-app)', borderRadius: '6px' }}>
              <input 
                type="checkbox" 
                checked={sendEmail} 
                onChange={(e) => setSendEmail(e.target.checked)} 
              />
              <Mail size={16} color="var(--color-text-secondary)" />
              Send automated email notification to patient
            </label>

            {error && (
              <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem', backgroundColor: 'var(--color-danger-bg)', padding: '0.5rem', borderRadius: '4px' }}>
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              style={{
                width: '100%', padding: '0.75rem', backgroundColor: 'var(--color-primary)', color: 'white', 
                border: 'none', borderRadius: '6px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem'
              }}
            >
              {loading ? <Spinner size={18} color="white" /> : 'Generate Secure Link'}
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
