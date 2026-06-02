import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { db } from '../../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, User, FileText, Settings } from 'lucide-react';
import './OnboardingWizard.css';

export default function OnboardingWizard({ onClose }) {
  const { t } = useTranslation();
  const { user, userProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const completeOnboarding = async () => {
    setLoading(true);
    try {
      if (user?.uid) {
        await updateDoc(doc(db, 'users', user.uid), {
          onboardingCompleted: true,
          onboardingDate: new Date().toISOString()
        });
        onClose();
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
    setLoading(false);
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal">
        <div className="onboarding-header">
          <h2>{t('onboarding.title')}</h2>
          <p>{t('onboarding.subtitle')}</p>
        </div>

        <div className="onboarding-stepper">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <User size={20} />
            <span>{t('onboarding.step1')}</span>
          </div>
          <div className="step-line" />
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <FileText size={20} />
            <span>{t('onboarding.step2')}</span>
          </div>
          <div className="step-line" />
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <Settings size={20} />
            <span>{t('onboarding.step3')}</span>
          </div>
        </div>

        <div className="onboarding-content">
          {step === 1 && (
            <div className="step-content">
              <h3>Verify your Profile Details</h3>
              <p>Please ensure your name and contact information are correct.</p>
            </div>
          )}
          {step === 2 && (
            <div className="step-content">
              <h3>Upload Necessary Documents</h3>
              <p>For medical professionals, we require a valid medical license.</p>
            </div>
          )}
          {step === 3 && (
            <div className="step-content">
              <h3>Notification Preferences</h3>
              <p>Select how you want to be notified about lab results and orders.</p>
            </div>
          )}
        </div>

        <div className="onboarding-footer">
          {step > 1 && (
            <button className="btn-secondary" onClick={() => setStep(s => s - 1)}>
              {t('onboarding.back')}
            </button>
          )}
          {step < 3 ? (
            <button className="btn-primary" onClick={() => setStep(s => s + 1)} style={{ marginLeft: 'auto' }}>
              {t('onboarding.next')}
            </button>
          ) : (
            <button className="btn-primary" onClick={completeOnboarding} disabled={loading} style={{ marginLeft: 'auto' }}>
              <CheckCircle2 size={16} />
              {t('onboarding.complete')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
