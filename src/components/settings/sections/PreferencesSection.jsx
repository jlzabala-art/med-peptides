import Building2 from "lucide-react/dist/esm/icons/building-2";
import Landmark from "lucide-react/dist/esm/icons/landmark";
import Truck from "lucide-react/dist/esm/icons/truck";
import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useAutoSave } from '../../../hooks/useAutoSave';




export default function PreferencesSection() {
  const { userProfile, updateProfileData, isProfessional } = useAuth();
  const { data, updateField } = useAutoSave({
    institution: userProfile?.institution || '',
    specialty: userProfile?.specialty || '',
    licenseId: userProfile?.licenseId || '',
    shippingStreet: userProfile?.shippingStreet || '',
    shippingCity: userProfile?.shippingCity || '',
    shippingZip: userProfile?.shippingZip || '',
    shippingCountry: userProfile?.shippingCountry || '',
    billingStreet: userProfile?.billingStreet || '',
    billingCity: userProfile?.billingCity || '',
    billingZip: userProfile?.billingZip || '',
    billingCountry: userProfile?.billingCountry || '',
    taxId: userProfile?.taxId || ''
  }, updateProfileData, 1000);

  const copyShippingToBilling = () => {
    updateField('billingStreet', data.shippingStreet);
    updateField('billingCity', data.shippingCity);
    updateField('billingZip', data.shippingZip);
    updateField('billingCountry', data.shippingCountry);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)' }}>Workspace & Preferences</h3>
      <p style={{ margin: '0 0 2rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Manage your institutional identity and logistics.</p>

      {/* Institution Details */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
          <Building2 size={18} color="var(--primary)" /> Institutional Details
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Institution / Clinic Name</label>
            <input type="text" className="gcp-input" value={data.institution} onChange={(e) => updateField('institution', e.target.value)} placeholder="Medical Research Center" />
          </div>
          {isProfessional && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Specialty / Area of Expertise</label>
                <input type="text" className="gcp-input" value={data.specialty} onChange={(e) => updateField('specialty', e.target.value)} placeholder="Endocrinology, Sports Medicine, etc." />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Medical License ID</label>
                <input type="text" className="gcp-input" value={data.licenseId} onChange={(e) => updateField('licenseId', e.target.value)} placeholder="LIC-1234567890" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '2rem 0' }} />

      {/* Shipping Details */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
          <Truck size={18} color="var(--primary)" /> Default Shipping Address
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Street Address</label>
            <input type="text" className="gcp-input" value={data.shippingStreet} onChange={(e) => updateField('shippingStreet', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>City</label>
              <input type="text" className="gcp-input" value={data.shippingCity} onChange={(e) => updateField('shippingCity', e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Postal / Zip Code</label>
              <input type="text" className="gcp-input" value={data.shippingZip} onChange={(e) => updateField('shippingZip', e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Country</label>
              <input type="text" className="gcp-input" value={data.shippingCountry} onChange={(e) => updateField('shippingCountry', e.target.value)} placeholder="e.g. Spain" />
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '2rem 0' }} />

      {/* Billing Details */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
            <Landmark size={18} color="var(--primary)" /> Billing & Tax Data
          </h4>
          <button 
            onClick={copyShippingToBilling}
            style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Copy from shipping
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Billing Street Address</label>
            <input type="text" className="gcp-input" value={data.billingStreet} onChange={(e) => updateField('billingStreet', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>City</label>
              <input type="text" className="gcp-input" value={data.billingCity} onChange={(e) => updateField('billingCity', e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Postal / Zip Code</label>
              <input type="text" className="gcp-input" value={data.billingZip} onChange={(e) => updateField('billingZip', e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Country</label>
              <input type="text" className="gcp-input" value={data.billingCountry} onChange={(e) => updateField('billingCountry', e.target.value)} placeholder="e.g. Spain" />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Tax ID / VAT Number</label>
            <input type="text" className="gcp-input" value={data.taxId} onChange={(e) => updateField('taxId', e.target.value)} placeholder="Optional for institutional invoicing" />
          </div>
        </div>
      </div>
    </div>
  );
}