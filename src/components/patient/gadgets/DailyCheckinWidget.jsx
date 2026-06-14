import Activity from "lucide-react/dist/esm/icons/activity";
import Smile from "lucide-react/dist/esm/icons/smile";
import Frown from "lucide-react/dist/esm/icons/frown";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from 'react-i18next';





export default function DailyCheckinWidget() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [mood, setMood] = useState(3); // 1 to 5
  const [sleepQuality, setSleepQuality] = useState(3);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [checkLoading, setCheckLoading] = useState(true);

  useEffect(() => {
    async function checkToday() {
      if (!user?.uid) return;
      try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const q = query(
          collection(db, 'daily_checkins'), 
          where('patientId', '==', user.uid),
          where('createdAt', '>=', startOfDay)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          setHasCheckedIn(true);
        }
      } catch (err) {
        console.error("Error checking today's checkin", err);
      } finally {
        setCheckLoading(false);
      }
    }
    checkToday();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'daily_checkins'), {
        patientId: user.uid,
        mood,
        sleepQuality,
        energyLevel,
        notes: notes.trim(),
        createdAt: serverTimestamp()
      });
      setHasCheckedIn(true);
    } catch (err) {
      console.error("Failed to log check-in", err);
      alert(t('patient.daily_checkin.error_saving') || "Hubo un error al guardar el check-in.");
    } finally {
      setLoading(false);
    }
  };

  if (checkLoading) {
    return <div className="card" style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>{t('patient.daily_checkin.loading')}</div>;
  }

  if (hasCheckedIn) {
    return (
      <div className="card" style={{ padding: '2rem', background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <CheckCircle2 size={48} color="var(--success)" style={{ marginBottom: '1rem' }} />
        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)', fontWeight: 800 }}>{t('patient.daily_checkin.success_title')}</h3>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('patient.daily_checkin.success_desc')}</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '1.5rem', background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Activity size={20} color="var(--primary)" /> {t('patient.daily_checkin.title')}
      </h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
        <div>
          <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            <span>{t('patient.daily_checkin.energy_label')}</span>
            <span>{energyLevel}/5</span>
          </label>
          <input type="range" min="1" max="5" value={energyLevel} onChange={e => setEnergyLevel(Number(e.target.value))} style={{ width: '100%' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-text-tertiary)', marginTop: '0.2rem' }}>
            <span>{t('patient.daily_checkin.energy_low')}</span>
            <span>{t('patient.daily_checkin.energy_high')}</span>
          </div>
        </div>

        <div>
          <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            <span>{t('patient.daily_checkin.sleep_label')}</span>
            <span>{sleepQuality}/5</span>
          </label>
          <input type="range" min="1" max="5" value={sleepQuality} onChange={e => setSleepQuality(Number(e.target.value))} style={{ width: '100%' }} />
        </div>

        <div>
          <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            <span>{t('patient.daily_checkin.mood_label')}</span>
          </label>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
            {[1, 2, 3, 4, 5].map(val => (
              <div 
                key={val}
                onClick={() => setMood(val)}
                style={{
                  flex: 1, padding: '0.5rem', textAlign: 'center', borderRadius: '12px', cursor: 'pointer',
                  background: mood === val ? 'var(--primary)' : '#f1f5f9',
                  color: mood === val ? 'white' : 'var(--color-text-secondary)',
                  border: `1px solid ${mood === val ? 'var(--primary)' : 'var(--color-border)'}`,
                  transition: 'all 0.2s'
                }}
              >
                {val === 1 ? <Frown size={20} /> : val === 5 ? <Smile size={20} /> : val}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>{t('patient.daily_checkin.notes_label')}</label>
          <textarea 
            value={notes} 
            onChange={e => setNotes(e.target.value)} 
            placeholder={t('patient.daily_checkin.notes_placeholder')} 
            style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', background: 'var(--color-bg-app)', minHeight: '60px', resize: 'vertical' }}
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          style={{ 
            marginTop: 'auto', padding: '0.85rem', width: '100%',
            background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px',
            fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? t('patient.daily_checkin.submit_loading') : t('patient.daily_checkin.submit_btn')}
        </button>
      </form>
    </div>
  );
}