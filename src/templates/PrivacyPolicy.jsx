import React, { useEffect } from 'react';
import { Lock, ChevronRight, Eye, Database, Share2, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy({ onBack }) {
  const navigate = useNavigate();
  const handleBack = onBack ?? (() => navigate(-1));

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);

  const sections = [
    {
      id: 'collection',
      icon: <Eye size={24} />,
      title: 'Information We Collect',
      content: `We collect information you provide directly, including name, email address, shipping address, and payment details when you create an account or place an order. We also collect usage data such as pages visited, time spent, and device information to improve our platform.`,
    },
    {
      id: 'usage',
      icon: <Database size={24} />,
      title: 'How We Use Your Data',
      content: `Your data is used exclusively to process orders, provide customer support, improve our services, and send relevant communications if you have opted in. We do not use your data for automated decision-making or profiling beyond what is necessary to operate our platform.`,
    },
    {
      id: 'sharing',
      icon: <Share2 size={24} />,
      title: 'Data Sharing',
      content: `We do not sell, rent, or lease your personal data to third parties. Information is shared only with essential service partners (e.g., payment processors, shipping carriers) strictly to fulfill your requests. All partners are contractually bound to data protection standards.`,
    },
    {
      id: 'rights',
      icon: <ShieldCheck size={24} />,
      title: 'Your Rights',
      content: `You have the right to access, correct, or delete your personal data at any time. You may also request data portability or restrict processing. To exercise any of these rights, contact us at privacy@regenpept.com. We will respond within 30 days.`,
    },
  ];

  return (
    <div className="view-container with-header-padding" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <button
        onClick={handleBack}
        className="btn btn-secondary"
        style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem' }}
      >
        <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} /> Back
      </button>

      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <div style={{ display: 'inline-flex', padding: '1rem', backgroundColor: 'rgba(0,54,102,0.06)', borderRadius: '20px', marginBottom: '1.5rem' }}>
          <Lock size={48} />
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', marginBottom: '1rem' }}>Privacy Policy</h1>
        <p className="subtitle" style={{ marginBottom: 0 }}>
          Your privacy matters. Here's how we collect, use, and protect your information.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {sections.map(s => (
          <div key={s.id} className="card" style={{ padding: '2rem 2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              {s.icon}
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{s.title}</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, margin: 0 }}>{s.content}</p>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </div>
    </div>
  );
}
