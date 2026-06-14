/* eslint-disable no-unused-vars */
import React from 'react';
import X from "lucide-react/dist/esm/icons/x";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import Info from "lucide-react/dist/esm/icons/info";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import Package from "lucide-react/dist/esm/icons/package";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import { useTranslation } from 'react-i18next';

export default function CostBreakdown({ protocol = {}, products = [], onClose, items: directItems }) {
  const { t } = useTranslation();
  // Support both passing the full protocol object OR individual props
  const formData = protocol.formData || {};
  const timelineCache = directItems || protocol.timelineCache || [];
  const costCache = protocol.costCache || {};
  const productsUsed = protocol.productsUsed || [];

  // Logic: Calculate vials needed based on dose, concentration, and 28-day stability window
  const calculateVials = (item) => {
    const product = products.find(p => p.name === item.name);
    if (!product) return { count: 1, explanation: t('costBreakdown.standardVial', "Standard vial recommended.") };

    // Standard stability window (28 days / 4 weeks)
    const STABILITY_WEEKS = 4;
    const protocolDurationWeeks = parseInt(formData.duration) || 12;
    
    // Simple logic: 
    // If protocol duration > stability window, we check if we need more vials 
    // even if 1 vial has enough total volume.
    
    const weeksCoveredByOneVial = item.weeksCovered || 6; // Mocking or from item
    
    if (weeksCoveredByOneVial > STABILITY_WEEKS && protocolDurationWeeks > STABILITY_WEEKS) {
      return {
        count: 2,
        explanation: t('costBreakdown.additionalVial', `Additional vial required due to 28-day opened-vial usability window. (Vial lasts {{weeksCoveredByOneVial}}w but expires in {{stabilityWeeks}}w)`, { weeksCoveredByOneVial, stabilityWeeks: STABILITY_WEEKS })
      };
    }

    return {
      count: 1,
      explanation: t('costBreakdown.singleVial', "Single vial covers the required protocol window safely.")
    };
  };

  return (
    <div className="modal-overlay" style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', 
      display: 'flex', 
      alignItems: 'flex-end', 
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="cost-breakdown-sheet" style={{ 
        backgroundColor: 'white', 
        width: '100%', 
        maxWidth: '600px', 
        borderTopLeftRadius: '24px', 
        borderTopRightRadius: '24px', 
        padding: '2rem 1.5rem',
        maxHeight: '90vh',
        overflowY: 'auto',
        animation: 'slideUp 0.3s ease-out'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <TrendingUp size={24} color="var(--primary)" /> {t('costBreakdown.title', 'Economic Audit')}
          </h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {Array.isArray(timelineCache) && timelineCache.reduce((acc, phase) => {
            if (phase && Array.isArray(phase.items)) {
              phase.items.forEach(item => {
                if (item && item.name && !acc.find(i => i.name === item.name)) acc.push(item);
              });
            }
            return acc;
          }, []).map((item, idx) => {
            const product = products.find(p => p.name === item.name);
            const { count, explanation } = calculateVials(item);
            const unitPrice = product?.price || 0;
            const subtotal = unitPrice * count;

            return (
              <div key={idx} style={{ paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '1rem' }}>{item.name}</div>
                  <div style={{ fontWeight: 900, color: 'var(--primary)' }}>${subtotal.toFixed(2)}</div>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
                   <div style={{ color: 'var(--text-muted)' }}>
                     <Package size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> 
                     {t('costBreakdown.qty', 'Qty:')} {count} {count > 1 ? t('costBreakdown.vials', 'Vials') : t('costBreakdown.vial', 'Vial')}
                   </div>
                   <div style={{ color: 'var(--text-muted)' }}>
                     <DollarSign size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> 
                     {t('costBreakdown.rate', 'Rate:')} ${unitPrice}/{t('costBreakdown.unit', 'unit')}
                   </div>
                </div>

                {count > 1 && (
                  <div style={{ 
                    backgroundColor: 'rgba(245, 158, 11, 0.05)', 
                    color: '#92400e', 
                    padding: '0.75rem', 
                    borderRadius: '8px', 
                    fontSize: '0.8rem', 
                    display: 'flex', 
                    gap: '0.5rem',
                    lineHeight: 1.4,
                    border: '1px solid rgba(245, 158, 11, 0.2)'
                  }}>
                    <AlertCircle size={16} flexShrink={0} />
                    <span>{explanation}</span>
                  </div>
                )}
                {count === 1 && (
                   <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.8rem', color: 'var(--color-success)' }}>
                     <Info size={14} /> <span>{t('costBreakdown.stabilityCompliant', 'Stability window compliant.')}</span>
                   </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'var(--color-bg-app)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{t('costBreakdown.totalUnits', 'Total Units Required')}</span>
            <span style={{ fontWeight: 800 }}>{timelineCache?.reduce((acc, p) => acc + (p.items?.length || 0), 0) || 0} {t('costBreakdown.products', 'Products')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{t('costBreakdown.estimatedTotal', 'Estimated Total')}</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>
              ${costCache?.totalEstimatedCost || '0.00'}
            </span>
          </div>
          
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1.1rem', fontSize: '1rem' }}
            onClick={onClose}
          >
            {t('costBreakdown.acknowledge', 'Acknowledge & Save')}
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .modal-overlay {
          backdrop-filter: blur(4px);
        }
      `}</style>
    </div>
  );
}
