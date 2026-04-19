import React, { useEffect } from 'react';
import { Shield, Lock, Truck, AlertCircle, Scale, ChevronRight } from 'lucide-react';

export default function LegalConditions({ onBack }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const sections = [
    {
      id: 'terms',
      title: 'Terms & Conditions',
      icon: <Scale className="text-primary" size={24} />,
      content: `
        By accessing and using med-peptides.com, you agree to comply with and be bound by the following terms and conditions. These terms constitute a legally binding agreement between you and Med-Peptides.
        
        1. RESEARCH USE ONLY: All products listed on this website are intended for laboratory research purposes only. They are not for human or animal consumption, nor are they intended for diagnostic or therapeutic use.
        2. AGE RESTRICTION: You must be at least 21 years of age to purchase products from this site.
        3. ORDER ACCEPTANCE: We reserve the right to refuse or cancel any order for any reason, including limitations on quantities available for purchase or inaccuracies in product or pricing information.
        4. INTELLECTUAL PROPERTY: All content on this site, including text, graphics, and logos, is the property of Med-Peptides and is protected by international copyright laws.
      `
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: <Lock className="text-secondary" size={24} />,
      content: `
        Your privacy is paramount to us. This policy outlines how we collect, use, and protect your personal information.
        
        1. INFORMATION COLLECTION: We collect information you provide when creating an account, placing an order, or contacting us (e.g., name, email, shipping address).
        2. DATA USAGE: We use your data to process orders, improve our services, and send relevant updates if you've opted in.
        3. DATA SECURITY: We implement robust physical and electronic security measures to protect your information from unauthorized access.
        4. THIRD PARTIES: We do not sell or lease your personal data. Information is shared only with essential partners (e.g., shipping carriers) to fulfill your requests.
      `
    },
    {
      id: 'shipping',
      title: 'Shipping & Delivery',
      icon: <Truck className="text-primary-light" size={24} />,
      content: `
        We strive for efficient and secure delivery of your research materials.
        
        1. PROCESSING TIME: Orders are typically processed within 24-48 hours.
        2. DELIVERY ESTIMATES: Local UAE delivery is usually next-day. International shipping varies by destination.
        3. CUSTOMS: It is the researcher's responsibility to ensure compliance with local import regulations. Med-Peptides is not responsible for seizures or delays at customs.
        4. TRACKING: A tracking number will be provided via email once your order has shipped.
      `
    },
    {
      id: 'disclaimer',
      title: 'Medical Disclaimer',
      icon: <AlertCircle className="text-error" style={{ color: '#ef4444' }} size={24} />,
      content: `
        IMPORTANT: The products sold by Med-Peptides are NOT medicines, drugs, or supplements.
        
        - They have not been approved by the FDA or any other regulatory body for the treatment of any medical condition.
        - Med-Peptides makes no claims regarding the therapeutic efficacy of its products.
        - Handling of these substances should only be performed by qualified professionals in a controlled laboratory environment.
      `
    }
  ];

  return (
    <div className="view-container with-header-padding" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="btn btn-secondary"
        style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem' }}
      >
        <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} /> Back to Shop
      </button>

      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <div style={{ 
          display: 'inline-flex', 
          padding: '1rem', 
          backgroundColor: 'rgba(0, 54, 102, 0.05)', 
          borderRadius: '20px',
          marginBottom: '1.5rem'
        }}>
          <Shield size={48} className="text-primary" />
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '1rem' }}>Legal Conditions</h1>
        <p className="subtitle" style={{ marginBottom: 0 }}>
          Transparency and compliance are the foundation of our research partnership. 
          Please review our governing policies below.
        </p>
      </div>

      {/* Detailed Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {sections.map((section) => (
          <div key={section.id} className="card" style={{ padding: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              {section.icon}
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{section.title}</h2>
            </div>
            <div style={{ 
              color: 'var(--text-muted)', 
              lineHeight: 1.8, 
              fontSize: '1.05rem',
              whiteSpace: 'pre-line' 
            }}>
              {section.content}
            </div>
          </div>
        ))}
      </div>

      {/* Contact Footer */}
      <div className="card" style={{ 
        marginTop: '3rem', 
        textAlign: 'center', 
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
        color: 'white'
      }}>
        <h3 style={{ color: 'white', marginBottom: '1rem' }}>Have questions?</h3>
        <p style={{ opacity: 0.9, marginBottom: '2rem' }}>
          Our legal and compliance team is here to help clarify any of our policies.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <a href="mailto:info@med-peptides.com" className="btn btn-primary" style={{ backgroundColor: 'white', color: 'var(--primary)' }}>
            Email Compliance
          </a>
        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </div>
    </div>
  );
}
