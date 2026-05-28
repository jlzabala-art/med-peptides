import React from 'react';
import { FileText, Lock, UploadCloud, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../styles/hero_card.css';

export default function CardPrescription() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleUploadTrigger = (e) => {
    e.stopPropagation();
    // Dispatch event to open Clinical AI assistant and trigger uploader
    window.dispatchEvent(
      new CustomEvent('open-clinical-ai', {
        detail: { query: '', autoSend: false }
      })
    );
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('trigger-prescription-upload'));
    }, 150);
  };

  const handleLoginRedirect = () => {
    navigate('/login?tab=register');
  };

  return (
    <div className="hero-card card-prescription">
      <div className="icon-box"><FileText size={24} /></div>
      <h3 className="card-title">I already have a prescription</h3>
      <p className="card-desc">Match prescriptions with catalog and compounded formulations.</p>

      {!user ? (
        <>
          <button className="card-cta secondary" onClick={handleLoginRedirect}>
            <Lock size={14} style={{ marginRight: '6px' }} /> Login
          </button>
          <small className="card-helper">Professional access required</small>
        </>
      ) : (
        <>
          <button className="card-cta" onClick={handleUploadTrigger}>
            <UploadCloud size={14} style={{ marginRight: '6px' }} /> Upload
          </button>
          <small className="card-helper">Prescription analysis</small>
        </>
      )}
    </div>
  );
}
