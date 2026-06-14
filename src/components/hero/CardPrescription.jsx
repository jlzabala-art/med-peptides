import FileText from "lucide-react/dist/esm/icons/file-text";
import Lock from "lucide-react/dist/esm/icons/lock";
import UploadCloud from "lucide-react/dist/esm/icons/upload-cloud";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import React from 'react';




import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../styles/hero_card.css';

export default function CardPrescription() {
  const { t } = useTranslation();
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
      <h3 className="card-title">{t('hero.prescription.title', 'I already have a prescription')}</h3>
      <p className="card-desc">{t('hero.prescription.desc', 'Match prescriptions with catalog and compounded formulations.')}</p>

      {!user ? (
        <>
          <button className="card-cta secondary" onClick={handleLoginRedirect}>
            <Lock size={14} style={{ marginRight: '6px' }} /> {t('hero.prescription.loginBtn', 'Login')}
          </button>
          <small className="card-helper">{t('hero.prescription.loginHelper', 'Professional access required')}</small>
        </>
      ) : (
        <>
          <button className="card-cta" onClick={handleUploadTrigger}>
            <UploadCloud size={14} style={{ marginRight: '6px' }} /> {t('hero.prescription.uploadBtn', 'Upload')}
          </button>
          <small className="card-helper">{t('hero.prescription.uploadHelper', 'Prescription analysis')}</small>
        </>
      )}
    </div>
  );
}