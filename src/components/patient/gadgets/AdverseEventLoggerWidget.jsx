import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import ShieldAlert from "lucide-react/dist/esm/icons/shield-alert";
import React, { useState } from 'react';
import { db } from '../../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from 'react-i18next';




export default function AdverseEventLoggerWidget() {
  const { user, userProfile } = useAuth();
  const { t } = useTranslation();
  const [severity, setSeverity] = useState('leve');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'adverse_events'), {
        patientId: user.uid,
        patientName: userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName || ''}` : user.displayName || 'Patient',
        severity,
        symptoms: symptoms.trim(),
        status: 'new', // new, reviewed, resolved
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSeverity('leve');
        setSymptoms('');
      }, 3500);
    } catch (err) {
      console.error("Failed to log adverse event", err);
      alert(t('patient.bloodwork.error_uploading') || "Hubo un error al reportar el evento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: '1.5rem', background: '#fff0f0', borderRadius: '24px', border: '1px solid #fca5a5', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', color: '#b91c1c', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ShieldAlert size={20} /> {t('patient.adverse_events.title')}
      </h3>

      {success ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#b91c1c', gap: '0.5rem', textAlign: 'center' }}>
          <CheckCircle2 size={40} />
          <h4 style={{ margin: 0, fontWeight: 800 }}>{t('patient.adverse_events.success_title')}</h4>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>{t('patient.adverse_events.success_desc')}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#991b1b', fontWeight: 600 }}>
            {t('patient.adverse_events.disclaimer')}
          </p>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#7f1d1d', marginBottom: '0.4rem', textTransform: 'uppercase' }}>{t('patient.adverse_events.severity')}</label>
            <select 
              value={severity} 
              onChange={e => setSeverity(e.target.value)} 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #fca5a5', outline: 'none', background: 'white' }}
            >
              <option value="leve">{t('patient.adverse_events.severity_mild')}</option>
              <option value="moderada">{t('patient.adverse_events.severity_moderate')}</option>
              <option value="severa">{t('patient.adverse_events.severity_severe')}</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#7f1d1d', marginBottom: '0.4rem', textTransform: 'uppercase' }}>{t('patient.adverse_events.symptoms_label')}</label>
            <textarea 
              value={symptoms} 
              onChange={e => setSymptoms(e.target.value)} 
              placeholder={t('patient.adverse_events.symptoms_placeholder')} 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #fca5a5', outline: 'none', background: 'white', minHeight: '80px', resize: 'vertical' }}
            />
          </div>

          <button 
            type="submit"
            disabled={loading || !symptoms.trim()}
            style={{ 
              marginTop: 'auto', padding: '0.85rem', width: '100%',
              background: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: '12px',
              fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              cursor: (loading || !symptoms.trim()) ? 'not-allowed' : 'pointer', opacity: (loading || !symptoms.trim()) ? 0.7 : 1
            }}
          >
            {loading ? t('patient.adverse_events.submit_loading') : <><AlertTriangle size={18} /> {t('patient.adverse_events.submit_btn')}</>}
          </button>
        </form>
      )}
    </div>
  );
}