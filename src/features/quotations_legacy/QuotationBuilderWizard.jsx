import X from "lucide-react/dist/esm/icons/x";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import User from "lucide-react/dist/esm/icons/user";
import Box from "lucide-react/dist/esm/icons/box";
import Tag from "lucide-react/dist/esm/icons/tag";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Send from "lucide-react/dist/esm/icons/send";
import Search from "lucide-react/dist/esm/icons/search";
import Truck from "lucide-react/dist/esm/icons/truck";
import Zap from "lucide-react/dist/esm/icons/zap";
import Percent from "lucide-react/dist/esm/icons/percent";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import React, { useState } from 'react';














export default function QuotationBuilderWizard({ onCancel, isMobile }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [fulfillment, setFulfillment] = useState('Stock');

  const steps = [
    { id: 1, title: 'Customer', icon: User },
    { id: 2, title: 'Products', icon: Box },
    { id: 3, title: 'Pricing', icon: Tag },
    { id: 4, title: 'Review', icon: FileText },
    { id: 5, title: 'Send', icon: Send },
  ];

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'white', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>Create Proposal</h2>
          {isMobile && <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Step {currentStep} of 5</p>}
        </div>
        <button onClick={onCancel} style={{ background: 'var(--bg-subtle)', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36 }}>
          <X size={18} color="var(--color-text-tertiary)" />
        </button>
      </div>

      {/* Progress Stepper (Desktop) */}
      {!isMobile && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: '2rem' }}>
            {steps.map((step, idx) => (
              <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: currentStep >= step.id ? 1 : 0.4 }}>
                <div style={{ 
                  width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: currentStep >= step.id ? 'var(--color-primary)' : 'var(--bg-subtle)',
                  color: currentStep >= step.id ? 'white' : 'var(--color-text-tertiary)',
                }}>
                  <step.icon size={16} />
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: currentStep >= step.id ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' }}>
                  {step.title}
                </span>
                {idx < steps.length - 1 && <div style={{ width: 40, height: 2, background: 'var(--border)', marginLeft: '0.5rem' }}></div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Content Area */}
      <div style={{ flex: 1, padding: isMobile ? '1.5rem' : '3rem', overflowY: 'auto', background: 'var(--bg-main, #f8fafc)', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '800px', background: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: isMobile ? '1.5rem' : '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          {currentStep === 1 && (
            <div>
              <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem' }}>Select Customer</h3>
              <div style={{ position: 'relative', marginBottom: '2rem' }}>
                <Search size={18} color="var(--color-text-tertiary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" placeholder="Search Zoho CRM accounts..." style={{ width: '100%', padding: '1rem 1rem 1rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '1rem', outline: 'none' }} />
              </div>
              <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'var(--bg-subtle)' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '1rem' }}>Wellness Clinic (Dr. Smith)</p>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>London, UK • Lifetime Value: $45,200</p>
                </div>
                <CheckCircle size={20} color="var(--color-primary)" />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Add Products</h3>
                <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}><Zap size={14}/> Templates</button>
              </div>

              <div style={{ position: 'relative', marginBottom: '2rem' }}>
                <Search size={18} color="var(--color-text-tertiary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" placeholder="Autocomplete from Master Catalog..." style={{ width: '100%', padding: '1rem 1rem 1rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '1rem', outline: 'none' }} />
              </div>

              <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Product</th>
                      <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Stock</th>
                      <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Qty</th>
                      <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '1rem' }}>
                        <p style={{ margin: 0, fontWeight: 600 }}>BPC-157 5mg</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Supplier: Atlas Bio</p>
                      </td>
                      <td style={{ padding: '1rem' }}><span style={{ color: '#059669', background: '#dcfce7', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>In Stock (450)</span></td>
                      <td style={{ padding: '1rem' }}><input type="number" defaultValue={50} style={{ width: '60px', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', textAlign: 'center' }} /></td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}><button style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}><X size={16}/></button></td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem' }}>Pricing Intelligence & Logistics</h3>
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Fulfillment Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '1rem' }}>
                  {['Stock', 'Dropshipping', 'Hybrid'].map(type => (
                    <div 
                      key={type}
                      onClick={() => setFulfillment(type)}
                      style={{ border: `2px solid ${fulfillment === type ? 'var(--color-primary)' : 'var(--border)'}`, borderRadius: '8px', padding: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', background: fulfillment === type ? 'rgba(99,102,241,0.05)' : 'white' }}
                    >
                      <input type="radio" checked={fulfillment === type} readOnly />
                      <span style={{ fontWeight: 600 }}>{type}</span>
                    </div>
                  ))}
                </div>
              </div>

              {fulfillment === 'Dropshipping' && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Truck size={24} color="#dc2626" />
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, color: '#991b1b' }}>Dropship Selected</p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#b91c1c' }}>Supplier: Atlas Bio Labs • MOQ: 100 • Lead Time: 5-7 days</p>
                  </div>
                </div>
              )}

              <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem', background: 'var(--bg-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Total Cost</span>
                  <span style={{ fontWeight: 600 }}>$1,250.00</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                  <span style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Percent size={14}/> Target Margin</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }}></div>
                    <span style={{ fontWeight: 800, fontSize: '1.25rem', color: '#059669' }}>45%</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Selling Price</span>
                  <span style={{ fontWeight: 800, fontSize: '1.5rem' }}>$2,272.73</span>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem' }}>Review Proposal</h3>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>Please verify the details before finalizing the quote. A PDF will be generated upon saving.</p>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '2rem' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-tertiary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Customer</h4>
                  <p style={{ margin: 0, fontWeight: 600 }}>Wellness Clinic</p>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Dr. Smith</p>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-tertiary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Logistics</h4>
                  <p style={{ margin: 0, fontWeight: 600 }}>{fulfillment}</p>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-tertiary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Summary</h4>
                  <p style={{ margin: 0, fontWeight: 600 }}>1 Item (50 Units)</p>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Margin: 45%</p>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-tertiary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Total</h4>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: '1.5rem' }}>$2,272.73</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <CheckCircle size={40} />
              </div>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem' }}>Proposal Ready to Send</h3>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', maxWidth: 400, margin: '0 auto 2rem' }}>Quote #QT-10029 has been synced to Zoho Books. You can now email it directly to the customer.</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexDirection: isMobile ? 'column' : 'row' }}>
                <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><FileText size={16}/> Preview PDF</button>
                <button className="btn btn-primary" onClick={onCancel} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><Send size={16}/> Send via Email</button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div style={{ padding: '1.5rem', background: 'white', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 -4px 20px rgba(0,0,0,0.05)' }}>
        <button 
          onClick={handleBack} 
          disabled={currentStep === 1}
          style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border)', background: 'white', borderRadius: '8px', cursor: currentStep === 1 ? 'not-allowed' : 'pointer', opacity: currentStep === 1 ? 0.5 : 1, fontWeight: 600 }}
        >
          <ArrowLeft size={18} /> {isMobile ? '' : 'Back'}
        </button>

        {currentStep < 5 && (
          <button 
            onClick={handleNext}
            style={{ padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', background: 'var(--color-primary)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}
          >
            {currentStep === 4 ? 'Save & Sync to Zoho' : 'Next'} <ArrowRight size={18} />
          </button>
        )}
      </div>

    </div>
  );
}