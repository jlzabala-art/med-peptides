import React, { useEffect } from 'react';
import { Scale, ChevronRight, AlertCircle, ShieldCheck, Ban, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsOfUse({ onBack }) {
  const navigate = useNavigate();
  const handleBack = onBack ?? (() => navigate(-1));

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);

  const sections = [
    {
      id: 'research',
      icon: <FileText size={24} />,
      title: 'Research Use Only',
      content: `All products listed on RegenPept are intended exclusively for laboratory research purposes. They are not for human or animal consumption, nor are they approved for diagnostic or therapeutic use. By purchasing, you confirm that you are a qualified researcher operating within a controlled environment.`,
    },
    {
      id: 'eligibility',
      icon: <ShieldCheck size={24} />,
      title: 'Eligibility',
      content: `You must be at least 21 years of age and a verified professional researcher to purchase products from this platform. We reserve the right to verify credentials and refuse or cancel any order at our discretion, including due to quantity limitations or inaccurate information.`,
    },
    {
      id: 'prohibited',
      icon: <Ban size={24} />,
      title: 'Prohibited Uses',
      content: `You may not use our platform to: resell products without authorization, misrepresent the intended use of purchased items, violate any applicable local, national, or international laws, or engage in any fraudulent or deceptive activity. Violations may result in immediate account termination.`,
    },
    {
      id: 'disclaimer',
      icon: <AlertCircle size={24} />,
      title: 'Disclaimer of Warranties',
      content: `Products are provided "as is" for research purposes. RegenPept makes no warranties, express or implied, regarding the fitness of products for any particular purpose. We are not liable for any direct, indirect, incidental, or consequential damages arising from the use or misuse of our products.`,
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
          <Scale size={48} />
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', marginBottom: '1rem' }}>Terms of Use</h1>
        <p className="subtitle" style={{ marginBottom: 0 }}>
          Please read these terms carefully before using our platform. Access implies acceptance.
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
