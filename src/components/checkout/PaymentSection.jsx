import React from 'react';
import { CreditCard, Landmark } from 'lucide-react';

const PaymentSection = ({ formData, set }) => {
  const PayCard = ({ method, icon: Icon, label }) => (
    <div className={`co-pay-card${formData.paymentMethod === method ? ' selected' : ''}`}
      role="button" onClick={() => set({ paymentMethod: method })}>
      <Icon size={26} color={formData.paymentMethod === method ? 'var(--primary)' : 'var(--color-text-tertiary)'} strokeWidth={1.5} />
      <span className="co-pay-card-label">{label}</span>
      {formData.paymentMethod === method && <span className="co-pay-badge">✓ Selected</span>}
    </div>
  );

  return (
    <div>
      <label className="co-label">Payment Method *</label>
      <p style={{ fontSize:'0.85rem', color:'var(--color-text-secondary)', margin:'0.25rem 0 1rem' }}>
        Select how you prefer to complete the transaction once approved.
      </p>
      <div className="co-pay-grid">
        <PayCard method="credit_card" icon={CreditCard} label="Credit Card" />
        <PayCard method="bank_transfer" icon={Landmark} label="Bank Transfer" />
      </div>
    </div>
  );
};

export default PaymentSection;
