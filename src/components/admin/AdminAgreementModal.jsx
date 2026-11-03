'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Truck,
  Package,
  Percent,
  ShieldCheck,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getCommercialAgreement,
  saveCommercialAgreement,
  FALLBACK_AGREEMENTS
} from '@/repositories/commercialAgreementsRepository';

export default function AdminAgreementModal({ slug = 'colway-qatar', isOpen, onClose, onSaved }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);

    getCommercialAgreement(slug, { forceRefresh: true })
      .then(data => {
        const agreementData = data || FALLBACK_AGREEMENTS[slug];
        setFormData(JSON.parse(JSON.stringify(agreementData)));
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [slug, isOpen]);

  if (!isOpen) return null;

  const handlePricingChange = (field, value) => {
    const num = parseFloat(value) || 0;
    setFormData(prev => {
      const nextPricing = { ...prev.pricing, [field]: num };

      // Recalculate derived landed PLN if product or shipping changes
      if (field === 'unitProductPricePln' || field === 'unitShippingPln') {
        const p = field === 'unitProductPricePln' ? num : (nextPricing.unitProductPricePln || 0);
        const s = field === 'unitShippingPln' ? num : (nextPricing.unitShippingPln || 0);
        nextPricing.unitTotalPln = parseFloat((p + s).toFixed(2));
      }

      // Recalculate margins if retail or distributor QAR changes
      const retail = nextPricing.unitRecommendedRetailQar || 187;
      const dist = nextPricing.unitDistributorPriceQar || 112;
      const grossMargin = parseFloat((retail - dist).toFixed(2));
      const marginPct = retail > 0 ? parseFloat(((grossMargin / retail) * 100).toFixed(1)) : 0;
      nextPricing.distributorGrossMarginPerUnit = grossMargin;
      nextPricing.distributorGrossMarginPct = marginPct;

      return {
        ...prev,
        pricing: nextPricing
      };
    });
  };

  const handleConditionChange = (index, field, value) => {
    setFormData(prev => {
      const nextConditions = [...prev.keyConditions];
      nextConditions[index] = { ...nextConditions[index], [field]: value };
      return { ...prev, keyConditions: nextConditions };
    });
  };

  const handleAddCondition = () => {
    setFormData(prev => ({
      ...prev,
      keyConditions: [
        ...prev.keyConditions,
        { title: 'New Condition', text: 'Specify contractual condition details.' }
      ]
    }));
  };

  const handleRemoveCondition = (index) => {
    setFormData(prev => ({
      ...prev,
      keyConditions: prev.keyConditions.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await saveCommercialAgreement(formData);
      toast.success(`Agreement ${formData.slug} saved and synced to Firestore SSOT ✓`);
      if (onSaved) onSaved(formData);
      onClose();
    } catch (err) {
      console.error('Error saving agreement:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        width: '100%',
        maxWidth: '820px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #e2e8f0'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#003666', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} className="text-cyan-300" />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Firestore SSOT Agreement Editor
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0' }}>
                {formData?.title || `Edit Agreement: ${slug}`}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer', padding: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px auto' }} />
            <div>Loading agreement parameters from Firestore...</div>
          </div>
        ) : (
          <form onSubmit={handleSave} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {error && (
              <div style={{ padding: '0.85rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* General Meta */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Partner Contact</label>
                <input
                  type="text"
                  value={formData?.partnerName || ''}
                  onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Consignee Organization</label>
                <input
                  type="text"
                  value={formData?.organization || ''}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Territory</label>
                <input
                  type="text"
                  value={formData?.territory || ''}
                  onChange={(e) => setFormData({ ...formData, territory: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}
                  required
                />
              </div>
            </div>

            {/* Pricing Parameters Section */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', backgroundColor: '#f8fafc' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#003666', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={16} />
                <span>Unit Economics & Currency Calibration</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>Product Price (PLN)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData?.pricing?.unitProductPricePln ?? 102.00}
                    onChange={(e) => handlePricingChange('unitProductPricePln', e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.88rem', fontWeight: 700 }}
                  />
                  <span style={{ fontSize: '0.70rem', color: '#0284c7' }}>Approved factory discount</span>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>Air Freight & Customs (PLN)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData?.pricing?.unitShippingPln ?? 19.73}
                    onChange={(e) => handlePricingChange('unitShippingPln', e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.88rem', fontWeight: 700 }}
                  />
                  <span style={{ fontSize: '0.70rem', color: '#0284c7' }}>Freight tariff allocation</span>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>Total Landed (PLN)</label>
                  <input
                    type="number"
                    step="0.01"
                    readOnly
                    value={formData?.pricing?.unitTotalPln ?? 121.73}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.88rem', fontWeight: 800, backgroundColor: '#f1f5f9', color: '#0f172a' }}
                  />
                  <span style={{ fontSize: '0.70rem', color: '#16a34a' }}>Calculated total landed</span>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>Distributor Landed (QAR)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData?.pricing?.unitDistributorPriceQar ?? 112.00}
                    onChange={(e) => handlePricingChange('unitDistributorPriceQar', e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.88rem', fontWeight: 700, color: '#0284c7' }}
                  />
                  <span style={{ fontSize: '0.70rem', color: '#0284c7' }}>Price invoiced to Ryhanh</span>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>Target Retail (QAR)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData?.pricing?.unitRecommendedRetailQar ?? 187.00}
                    onChange={(e) => handlePricingChange('unitRecommendedRetailQar', e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.88rem', fontWeight: 700, color: '#15803d' }}
                  />
                  <span style={{ fontSize: '0.70rem', color: '#15803d' }}>Qatar clinic MSRP</span>
                </div>
              </div>

              {/* Margin Live Calculation Summary */}
              <div style={{ marginTop: '1rem', padding: '0.85rem', backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.82rem', color: '#166534', fontWeight: 600 }}>
                  Live Distributor Margin: <strong>+{formData?.pricing?.distributorGrossMarginPerUnit || 75.00} QAR</strong> ({formData?.pricing?.distributorGrossMarginPct || 40.1}%)
                </div>
                <div style={{ fontSize: '0.82rem', color: '#15803d', fontWeight: 800 }}>
                  Batch Profit (80 Units): +{((formData?.pricing?.distributorGrossMarginPerUnit || 75.00) * (formData?.orderQuantity || 80)).toLocaleString()} QAR
                </div>
              </div>
            </div>

            {/* Key Contractual Conditions */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#003666', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} />
                  <span>Key Contractual Conditions ({formData?.keyConditions?.length || 0})</span>
                </span>
                <button
                  type="button"
                  onClick={handleAddCondition}
                  style={{ fontSize: '0.72rem', padding: '4px 10px', borderRadius: '4px', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                >
                  + Add Condition
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {formData?.keyConditions?.map((cond, idx) => (
                  <div key={idx} style={{ padding: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <input
                        type="text"
                        value={cond.title}
                        onChange={(e) => handleConditionChange(idx, 'title', e.target.value)}
                        placeholder="Condition Title"
                        style={{ flex: 1, padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.82rem', fontWeight: 700 }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveCondition(idx)}
                        style={{ border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer', fontSize: '0.74rem', fontWeight: 700 }}
                      >
                        Remove
                      </button>
                    </div>
                    <textarea
                      value={cond.text}
                      onChange={(e) => handleConditionChange(idx, 'text', e.target.value)}
                      rows={2}
                      placeholder="Condition Description"
                      style={{ width: '100%', padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.80rem' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '9px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #003666 0%, #0284c7 100%)',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 750,
                  cursor: saving ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(0, 54, 102, 0.25)'
                }}
              >
                <Save size={15} />
                <span>{saving ? 'Validating & Saving...' : 'Save & Sync to Firestore SSOT'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

