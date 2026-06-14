import React from 'react';
import { CreditCard, Landmark, FileText, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PaymentSection = ({ formData, set, isProfessional }) => {
  const PayCard = ({ method, icon: Icon, label, description, badge }) => (
    <div className={`co-pay-card${formData.paymentMethod === method ? ' selected' : ''}`}
      role="button" onClick={() => set({ paymentMethod: method })}
      style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
      
      {badge && (
        <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--primary)', color: 'white', fontSize: '0.6rem', padding: '0.2rem 0.5rem', borderRadius: '12px', fontWeight: 800 }}>
          {badge}
        </span>
      )}
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Icon size={22} color={formData.paymentMethod === method ? 'var(--primary)' : 'var(--color-text-tertiary)'} strokeWidth={1.5} />
        <span className="co-pay-card-label" style={{ margin: 0 }}>{label}</span>
      </div>
      
      {description && (
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.3 }}>
          {description}
        </span>
      )}
      
      {formData.paymentMethod === method && (
        <div style={{ position: 'absolute', bottom: '0.75rem', right: '0.75rem', background: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>
          ✓ Activo
        </div>
      )}
    </div>
  );

  return (
    <div>
      <label className="co-label">Método de Pago *</label>
      <p style={{ fontSize:'0.85rem', color:'var(--color-text-secondary)', margin:'0.25rem 0 1rem' }}>
        {isProfessional 
          ? "Como cuenta verificada, tienes acceso a opciones de financiación B2B." 
          : "Selecciona cómo deseas completar tu pago seguro."}
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <PayCard 
          method="credit_card" 
          icon={CreditCard} 
          label="Tarjeta de Crédito" 
          description="Pago instantáneo seguro vía Stripe." 
        />
        
        {isProfessional && (
          <>
            <PayCard 
              method="net_30" 
              icon={Briefcase} 
              label="Net-30 Términos" 
              description="Paga en 30 días sin intereses. Sujeto a límite corporativo."
              badge="B2B EXCLUSIVE"
            />
            <PayCard 
              method="invoice" 
              icon={FileText} 
              label="Facturación / Invoicing" 
              description="Emitiremos una factura proforma para pago contable." 
            />
          </>
        )}
        
        <PayCard 
          method="bank_transfer" 
          icon={Landmark} 
          label="Transferencia Bancaria" 
          description="Aprobación manual en 24-48h." 
        />
      </div>

      <AnimatePresence>
        {formData.paymentMethod === 'net_30' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.8rem', color: '#475569' }}
          >
            <strong>Aviso de Crédito:</strong> Esta orden utilizará parte de tu límite de crédito pre-aprobado. El balance vencerá exactamente 30 días después del envío.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentSection;
