import React, { useState, useEffect } from 'react';
import { Sparkles, FlaskConical } from '@/lib/icons';
// Assuming generateFollowUpProposalAction is available
import { generateFollowUpProposalAction } from '../../../actions/aiActions';
import { toast } from 'react-hot-toast';

function parseIntervalToDate(interval, startDate) {
  const match = interval.match(/(\d+)\s*(day|week|month|year)s?/i);
  if (!match) return null;
  const num = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const d = new Date(startDate.getTime());
  if (unit === 'day') d.setDate(d.getDate() + num);
  if (unit === 'week') d.setDate(d.getDate() + num * 7);
  if (unit === 'month') d.setMonth(d.getMonth() + num);
  if (unit === 'year') d.setFullYear(d.getFullYear() + num);
  return d.toISOString().split('T')[0];
}

export default function FollowUpTab({ rx, onUpdateRx }) {
  const [proposalStatus, setProposalStatus] = useState('pending'); // pending, accepted, denied
  const [aiProposal, setAiProposal] = useState(null);
  const [loadingProposal, setLoadingProposal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [baseDateChoice, setBaseDateChoice] = useState('today'); // 'today' or 'prescription'
  const items = rx.items || rx.products || [];

  const reviewInterval = rx.followUpInterval || rx.reviewInterval || null;
  const followUpDate = rx.followUpDate || null;
  const isScheduled = !!followUpDate || !!reviewInterval;

  useEffect(() => {
    if (!isScheduled && proposalStatus === 'pending') {
      let isMounted = true;
      setLoadingProposal(true);
      generateFollowUpProposalAction(items)
        .then(res => {
          if (isMounted) {
            setAiProposal(res);
            setLoadingProposal(false);
          }
        })
        .catch(err => {
          console.error(err);
          if (isMounted) setLoadingProposal(false);
        });
      
      return () => { isMounted = false; };
    }
  }, [isScheduled, proposalStatus, items]);

  const handleAcceptProposal = async () => {
    if (!aiProposal) return;
    setIsSaving(true);
    try {
      const baseDate = baseDateChoice === 'prescription' && rx.createdAt ? new Date(rx.createdAt) : new Date();
      const calcDate = parseIntervalToDate(aiProposal.interval, baseDate);
      const { updatePrescription } = await import('../../../services/prescriptionsService');
      const updates = {
        reviewInterval: aiProposal.interval,
        requiredTests: aiProposal.tests,
        ...(calcDate ? { followUpDate: calcDate } : {})
      };
      await updatePrescription(rx.id, updates);
      
      // Create calendar appointment
      if (calcDate) {
        const { createAppointment } = await import('../../../repositories/appointmentRepository');
        const appointmentData = {
          title: `Follow-Up: ${rx.patient?.name || rx.patientName || 'Patient'}`,
          date: calcDate,
          type: 'follow_up',
          status: 'scheduled',
          patientId: rx.patientId || rx.patient?.id || null,
          patientName: rx.patient?.name || rx.patientName || null,
          doctorId: rx.doctorId || rx.doctor?.id || null,
          doctorName: rx.doctor?.name || rx.doctorName || null,
          accountManager: rx.accountManager || null,
          prescriptionId: rx.id,
          requiredTests: aiProposal.tests
        };
        await createAppointment(appointmentData);
      }
      
      setProposalStatus('accepted');
      if (onUpdateRx) {
        onUpdateRx({ ...rx, ...updates });
      }
    } catch (error) {
      console.error("Error saving follow-up proposal:", error);
      toast.error("Failed to save the follow-up plan.");
    } finally {
      setIsSaving(false);
    }
  };

  const requiredTests = rx.requiredTests || rx.labTests || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* AI Proposal Card */}
      {!isScheduled && proposalStatus === 'pending' && (
        <div
          style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '1px solid #bbf7d0',
            borderRadius: '14px',
            padding: '1.5rem',
            color: '#166534',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Sparkles size={14} /> AI Suggested Follow-Up
          </div>
          
          {loadingProposal ? (
            <div style={{ fontSize: '0.9rem', color: '#15803d', fontStyle: 'italic', padding: '1rem 0' }}>
              Generating recommendation via AI Server Action...
            </div>
          ) : aiProposal ? (
            <>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                In {aiProposal.interval}
              </div>
              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                {aiProposal.reasoning}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem', color: '#15803d' }}>
                Required Tests: {aiProposal.tests.join(', ')}
              </div>
              
              <div style={{ marginBottom: '1.25rem', background: '#dcfce7', padding: '0.75rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Calculate Date From:
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#15803d', cursor: 'pointer' }}>
                    <input type="radio" name="baseDate" value="today" checked={baseDateChoice === 'today'} onChange={(e) => setBaseDateChoice(e.target.value)} style={{ accentColor: '#16a34a' }} />
                    Today ({new Date().toLocaleDateString()})
                  </label>
                  {rx.createdAt && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#15803d', cursor: 'pointer' }}>
                      <input type="radio" name="baseDate" value="prescription" checked={baseDateChoice === 'prescription'} onChange={(e) => setBaseDateChoice(e.target.value)} style={{ accentColor: '#16a34a' }} />
                      Prescription Date ({new Date(rx.createdAt).toLocaleDateString()})
                    </label>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleAcceptProposal}
                  disabled={isSaving}
                  style={{
                    background: '#16a34a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.5rem 1rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: isSaving ? 'wait' : 'pointer',
                    opacity: isSaving ? 0.7 : 1
                  }}
                >
                  {isSaving ? 'Saving...' : 'Accept Proposal'}
                </button>
                <button
                  onClick={() => setProposalStatus('denied')}
                  disabled={isSaving}
                  style={{
                    background: 'white',
                    color: '#16a34a',
                    border: '1px solid #16a34a',
                    borderRadius: '6px',
                    padding: '0.5rem 1rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: isSaving ? 'wait' : 'pointer'
                  }}
                >
                  Modify
                </button>
              </div>
            </>
          ) : (
            <div style={{ fontSize: '0.9rem', color: '#15803d' }}>
              Unable to generate proposal at this time.
            </div>
          )}
        </div>
      )}

      {/* Timeline Visual */}
      {(isScheduled || proposalStatus === 'accepted') && (
        <div
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            borderRadius: '14px',
            padding: '1.5rem',
            color: 'white',
            position: 'relative'
          }}
        >
          <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
            <select
              value={rx.followUpStatus || 'scheduled'}
              onChange={async (e) => {
                const newStatus = e.target.value;
                const { updatePrescription } = await import('../../../services/prescriptionsService');
                await updatePrescription(rx.id, { followUpStatus: newStatus });
                if (onUpdateRx) onUpdateRx({ ...rx, followUpStatus: newStatus });
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '20px',
                padding: '0.25rem 0.75rem',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
                appearance: 'none'
              }}
            >
              <option value="scheduled" style={{ color: 'black' }}>📅 Scheduled</option>
              <option value="pending_labs" style={{ color: 'black' }}>🧪 Pending Labs</option>
              <option value="labs_received" style={{ color: 'black' }}>✅ Labs Received</option>
              <option value="completed" style={{ color: 'black' }}>🏁 Completed</option>
            </select>
          </div>

          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              opacity: 0.8,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              marginBottom: '0.5rem',
            }}
          >
            Next Clinical Milestone
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            {proposalStatus === 'accepted' && aiProposal ? `In ${aiProposal.interval}` : (reviewInterval ||
              (followUpDate
                ? new Date(followUpDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Scheduled'))}
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.85, marginBottom: '0.5rem' }}>
            {proposalStatus === 'accepted' ? 'Scheduled via AI Proposal' : (followUpDate
              ? `Scheduled for ${followUpDate}`
              : 'Review milestone set.')}
          </div>
          {rx.isCustomFollowUp && (
            <div style={{ 
              display: 'inline-block',
              background: '#fef2f2', 
              color: '#991b1b', 
              padding: '0.35rem 0.75rem', 
              borderRadius: '20px', 
              fontSize: '0.75rem', 
              fontWeight: 700, 
              border: '1px solid #fecaca',
              marginTop: '0.5rem'
            }}>
              ⚠️ Protocol Deviation: Custom Override
            </div>
          )}
        </div>
      )}

      {(!isScheduled && proposalStatus === 'denied') && (
        <ManualFollowUpEditor rx={rx} onUpdateRx={onUpdateRx} setProposalStatus={setProposalStatus} />
      )}

      {/* Required Tests */}
      <div
        style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1.25rem',
        }}
      >
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <FlaskConical size={14} /> Required Tests
        </div>
        {proposalStatus === 'accepted' && aiProposal ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {aiProposal.tests.map((test, i) => (
              <span
                key={i}
                style={{
                  padding: '0.35rem 0.75rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  color: '#334155',
                  fontWeight: 500,
                }}
              >
                {test}
              </span>
            ))}
          </div>
        ) : (requiredTests && requiredTests.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {requiredTests.map((test, i) => (
              <span
                key={i}
                style={{
                  padding: '0.35rem 0.75rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  color: '#334155',
                  fontWeight: 500,
                }}
              >
                {test}
              </span>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
            No required tests specified for this prescription.
          </div>
        ))}
      </div>
    </div>
  );
}

function ManualFollowUpEditor({ rx, onUpdateRx, setProposalStatus }) {
  const [date, setDate] = useState('');
  const [type, setType] = useState('telehealth');
  const [customTests, setCustomTests] = useState([]);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const predefinedTests = ['CBC', 'CMP', 'IGF-1', 'Lipid Panel', 'Testosterone', 'Estradiol', 'HbA1c', 'Thyroid Panel'];

  const toggleTest = (test) => {
    if (customTests.includes(test)) {
      setCustomTests(customTests.filter(t => t !== test));
    } else {
      setCustomTests([...customTests, test]);
    }
  };

  const handleSave = async () => {
    if (!date) {
      toast("Please select a date");
      return;
    }
    setIsSaving(true);
    try {
      const calcDate = date; // date input returns YYYY-MM-DD
      const { updatePrescription } = await import('../../../services/prescriptionsService');
      const updates = {
        followUpDate: calcDate,
        followUpType: type,
        requiredTests: customTests,
        followUpNotes: notes,
        isCustomFollowUp: true // indicates deviation
      };
      await updatePrescription(rx.id, updates);
      
      const { createAppointment } = await import('../../../repositories/appointmentRepository');
      const appointmentData = {
        title: `Custom Follow-Up: ${rx.patient?.name || rx.patientName || 'Patient'}`,
        date: calcDate,
        type: type,
        status: 'scheduled',
        patientId: rx.patientId || rx.patient?.id || null,
        patientName: rx.patient?.name || rx.patientName || null,
        doctorId: rx.doctorId || rx.doctor?.id || null,
        doctorName: rx.doctor?.name || rx.doctorName || null,
        accountManager: rx.accountManager || null,
        prescriptionId: rx.id,
        requiredTests: customTests,
        notes: notes,
        isCustomOverride: true
      };
      await createAppointment(appointmentData);

      setProposalStatus('accepted');
      if (onUpdateRx) onUpdateRx({ ...rx, ...updates });
    } catch (err) {
      console.error(err);
      toast.error("Error saving manual follow-up");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155' }}>Manual Follow-Up Editor</div>
        {rx.protocolId && (
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b91c1c', background: '#fef2f2', padding: '0.25rem 0.6rem', border: '1px solid #fca5a5', borderRadius: '4px', display: 'inline-block' }}>
            DEVIATES FROM PROTOCOL
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>Exact Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>Type</label>
          <select value={type} onChange={e => setType(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white' }}>
            <option value="telehealth">Telehealth / Video Call</option>
            <option value="in_person">In-Person Visit</option>
            <option value="lab_review_only">Lab Review Only</option>
          </select>
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>Required Lab Tests</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {predefinedTests.map(test => {
            const isSelected = customTests.includes(test);
            return (
              <button 
                key={test}
                onClick={() => toggleTest(test)}
                style={{
                  background: isSelected ? '#3b82f6' : 'white',
                  color: isSelected ? 'white' : '#475569',
                  border: `1px solid ${isSelected ? '#3b82f6' : '#cbd5e1'}`,
                  borderRadius: '20px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                {isSelected ? '✓ ' : '+ '}{test}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>Clinical Notes for Follow-up</label>
        <textarea 
          value={notes} 
          onChange={e => setNotes(e.target.value)} 
          placeholder="e.g. Check for water retention, review mood changes..."
          style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button onClick={() => setProposalStatus('pending')} style={{ padding: '0.5rem 1rem', background: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
        <button onClick={handleSave} disabled={isSaving || !date} style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: (isSaving || !date) ? 'not-allowed' : 'pointer', opacity: (isSaving || !date) ? 0.6 : 1 }}>
          {isSaving ? 'Saving...' : 'Save Manual Override'}
        </button>
      </div>
    </div>
  );
}
