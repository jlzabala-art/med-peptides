import React from 'react';
import { Activity, CheckCircle2, Sparkles, Check, FileSearch, Zap } from '@/lib/icons';
import { usePrescriptionAI } from '../../hooks/shared/usePrescriptionAI';

const PrescriptionUploadSection = ({
  prescriptionName,
  setPrescriptionName,
  prescriptionSpecs,
  setPrescriptionSpecs,
  prescriptionSelectedVariants,
  setPrescriptionSelectedVariants,
  enrichedCartItems,
  products,
  region,
  updateCart
}) => {
  const { processPrescription, isProcessing, error } = usePrescriptionAI();

  const handlePrescriptionUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setPrescriptionName(file.name);
    try {
      const aiResult = await processPrescription(file, 'anonymous');
      setPrescriptionSpecs({
        dosage: aiResult.dosage,
        frequency: aiResult.frequency,
        match: aiResult.match,
        matchedProducts: aiResult.matchedProducts
      });
    } catch (err) {
      console.error("AI Prescription processing failed", err);
      // fallback or show error
    }
  };

  return (
    <div style={{
      border: '1px solid #e2e8f0',
      borderRadius: '20px',
      padding: '1.5rem',
      backgroundColor: 'white',
      boxShadow: '0 10px 30px rgba(0,0,0,0.01)',
      marginBottom: '1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
        <Activity size={18} color="var(--primary)" />
        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
          Clinical Prescription Verification (Optional)
        </span>
      </div>
      <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', margin: '0 0 1rem 0', lineHeight: '1.4' }}>
        Upload your official research prescription to fast-track approval. Supported formats: Images (.png, .jpg) or PDFs.
      </p>

      <div style={{
        border: prescriptionName ? '1px solid #cbd5e1' : '2px dashed #cbd5e1',
        borderRadius: '12px',
        padding: '1.25rem',
        textAlign: 'center',
        backgroundColor: 'var(--color-bg-app)',
        cursor: prescriptionName ? 'default' : 'pointer',
        position: 'relative',
        transition: 'all 0.2s',
        boxShadow: prescriptionName ? '0 4px 20px rgba(0,0,0,0.02)' : 'none'
      }}
      onClick={() => {
        if (!prescriptionName) {
          document.getElementById('checkout-prescription-input').click();
        }
      }}
      >
        <input 
          type="file" 
          id="checkout-prescription-input"
          accept=".pdf,image/*"
          onChange={handlePrescriptionUpload}
          style={{ display: 'none' }}
        />
        {isProcessing ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '1rem 0' }}>
            <div style={{
              width: '24px', height: '24px',
              border: '2.5px solid rgba(0, 75, 135, 0.15)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
              Extracting text & matching compounds...
            </span>
          </div>
        ) : prescriptionName ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', textAlign: 'left' }}>
            {/* File Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="var(--color-success)" />
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-primary)', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>
                  {prescriptionName}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById('checkout-prescription-input').click();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  transition: 'all 0.2s',
                  textDecoration: 'underline'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0, 75, 135, 0.05)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Change File
              </button>
            </div>

            {prescriptionSpecs && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {/* Metadata Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span style={{ fontSize: '0.62rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.03em' }}>Dose Detected</span>
                    <strong style={{ color: '#0f172a', fontSize: '0.78rem' }}>{prescriptionSpecs.dosage}</strong>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span style={{ fontSize: '0.62rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.03em' }}>Freq Detected</span>
                    <strong style={{ color: '#0f172a', fontSize: '0.78rem', textTransform: 'capitalize' }}>{prescriptionSpecs.frequency}</strong>
                  </div>
                </div>

                {/* Section Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.2rem' }}>
                  <Sparkles size={14} color="var(--primary)" />
                  <span style={{ fontSize: '0.76rem', color: 'var(--color-text-primary)', fontWeight: 800 }}>
                    Detected Compounds & Products
                  </span>
                </div>

                {/* Matches List */}
                {prescriptionSpecs.matchedProducts && prescriptionSpecs.matchedProducts.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {prescriptionSpecs.matchedProducts.map(prod => {
                      const isAlreadyInCart = enrichedCartItems.some(item => 
                        item.namePart.toLowerCase() === prod.name.toLowerCase()
                      );

                      const variants = prod.variants || [];
                      const selectedVariantId = prescriptionSelectedVariants[prod.id || prod.name];
                      const activeVar = variants.find(v => (v.variantId || v.id) === selectedVariantId) || variants[0] || prod;

                      return (
                        <div 
                          key={prod.id || prod.name}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            padding: '10px 12px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.01)',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '0.78rem', fontWeight: 850, color: '#0f172a' }}>
                                {prod.name}
                              </span>
                              {prod.category && (
                                <span style={{ fontSize: '0.62rem', color: 'var(--color-text-secondary)', marginTop: '2px', fontWeight: 600 }}>
                                  {prod.category}
                                </span>
                              )}
                            </div>

                            {isAlreadyInCart ? (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                color: 'var(--color-success)',
                                backgroundColor: '#ecfdf5',
                                border: '1px solid #a7f3d0',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '0.68rem',
                                fontWeight: 800
                              }}>
                                <Check size={12} strokeWidth={3} />
                                <span>In Order</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const addDose = activeVar.dosage || activeVar.strength || activeVar.size;
                                  updateCart({
                                    name: prod.name,
                                    dosage: addDose
                                  }, 1);
                                }}
                                style={{
                                  backgroundColor: 'var(--primary)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '5px 12px',
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  boxShadow: '0 2px 6px rgba(0, 75, 135, 0.15)'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.backgroundColor = '#003a6a';
                                  e.target.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.backgroundColor = 'var(--primary)';
                                  e.target.style.transform = 'none';
                                }}
                              >
                                + Add to Order
                              </button>
                            )}
                          </div>

                          {!isAlreadyInCart && variants.length > 0 && (
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '8px', 
                              borderTop: '1px solid #f1f5f9', 
                              paddingTop: '8px', 
                              marginTop: '2px' 
                            }}>
                              <span style={{ fontSize: '0.66rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Select Dosage:</span>
                              <select
                                value={selectedVariantId || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setPrescriptionSelectedVariants(prev => ({
                                    ...prev,
                                    [prod.id || prod.name]: val
                                  }));
                                }}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  fontSize: '0.68rem',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  backgroundColor: 'white',
                                  color: 'var(--color-text-primary)',
                                  fontWeight: 600,
                                  outline: 'none',
                                  flex: 1,
                                  cursor: 'pointer'
                                }}
                              >
                                {variants.map(v => (
                                  <option key={v.variantId || v.id} value={v.variantId || v.id}>
                                    {v.dosage || v.strength || v.size || 'Default'} — {v.price} {region === 'EU' ? '€' : '$'}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Add All Missing Button */}
                    {prescriptionSpecs.matchedProducts.some(prod => 
                      !enrichedCartItems.some(item => item.namePart.toLowerCase() === prod.name.toLowerCase())
                    ) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          prescriptionSpecs.matchedProducts.forEach(prod => {
                            const isAlreadyInCart = enrichedCartItems.some(item => 
                              item.namePart.toLowerCase() === prod.name.toLowerCase()
                            );
                            if (!isAlreadyInCart) {
                              const variants = prod.variants || [];
                              const selectedVariantId = prescriptionSelectedVariants[prod.id || prod.name];
                              const activeVar = variants.find(v => (v.variantId || v.id) === selectedVariantId) || variants[0] || prod;
                              const addDose = activeVar.dosage || activeVar.strength || activeVar.size;
                              updateCart({
                                name: prod.name,
                                dosage: addDose
                              }, 1);
                            }
                          });
                        }}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '9px',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          marginTop: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 14px rgba(14, 165, 233, 0.2)',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = '0 6px 18px rgba(14, 165, 233, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'none';
                          e.target.style.boxShadow = '0 4px 14px rgba(14, 165, 233, 0.2)';
                        }}
                      >
                        <Zap size={14} fill="white" color="white" />
                        Add All Detected Compounds to Order
                      </button>
                    )}

                    {/* Recommended Reconstitution Supplies */}
                    {(() => {
                      const accessories = (products || []).filter(p => p && p.name && (
                        p.name.toLowerCase().includes('water') || 
                        p.name.toLowerCase().includes('bacteriostatic') || 
                        p.name.toLowerCase().includes('syringe') || 
                        p.name.toLowerCase().includes('insulin')
                      )).slice(0, 2);

                      if (accessories.length === 0) return null;

                      return (
                        <div style={{
                          borderTop: '1px dashed #cbd5e1',
                          paddingTop: '0.85rem',
                          marginTop: '0.65rem'
                        }}>
                          <span style={{ 
                            fontSize: '0.66rem', 
                            color: 'var(--color-text-secondary)', 
                            fontWeight: 800, 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.03em',
                            display: 'block',
                            marginBottom: '6px'
                          }}>
                            📦 Reconstitution & Injection Supplies
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {accessories.map(acc => {
                              const isAlreadyInCart = enrichedCartItems.some(item => 
                                item.namePart.toLowerCase() === acc.name.toLowerCase()
                              );

                              return (
                                <div 
                                  key={acc.id || acc.name}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '6px 10px',
                                    backgroundColor: 'rgba(0, 75, 135, 0.02)',
                                    border: '1px solid rgba(0, 75, 135, 0.05)',
                                    borderRadius: '8px',
                                    fontSize: '0.7rem'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span>{acc.name.toLowerCase().includes('water') ? '💧' : '💉'}</span>
                                    <span style={{ color: 'var(--color-text-secondary)', fontWeight: 700 }}>
                                      {acc.name}
                                    </span>
                                  </div>

                                  {isAlreadyInCart ? (
                                    <span style={{
                                      fontSize: '0.64rem',
                                      color: 'var(--color-success)',
                                      fontWeight: 800,
                                      padding: '2px 6px',
                                      backgroundColor: '#ecfdf5',
                                      borderRadius: '4px'
                                    }}>
                                      ✓ Bundled
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateCart({
                                          name: acc.name,
                                          dosage: acc.variants?.[0]?.dosage || acc.variants?.[0]?.size || null
                                        }, 1);
                                      }}
                                      style={{
                                        backgroundColor: 'white',
                                        color: 'var(--primary)',
                                        border: '1px solid var(--primary)',
                                        borderRadius: '6px',
                                        padding: '2px 8px',
                                        fontSize: '0.64rem',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = 'var(--primary)';
                                        e.target.style.color = 'white';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'white';
                                        e.target.style.color = 'var(--primary)';
                                      }}
                                    >
                                      + Bundle
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div style={{ 
                    fontSize: '0.7rem', 
                    color: 'var(--color-text-secondary)', 
                    fontStyle: 'italic', 
                    textAlign: 'center', 
                    padding: '12px', 
                    backgroundColor: '#f1f5f9', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0',
                    fontWeight: 600
                  }}>
                    No matching catalog products detected in the document text.
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '0.5rem 0' }}>
            <FileSearch size={24} color="var(--color-text-secondary)" />
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
              Click to select or drag document here
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--color-text-tertiary)' }}>
              PDF, PNG, JPG up to 10MB
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriptionUploadSection;
