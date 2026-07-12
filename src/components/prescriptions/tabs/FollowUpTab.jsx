import React, { useState, useEffect } from 'react';
import { Sparkles, FlaskConical } from '@/lib/icons';
// Assuming generateFollowUpProposalAction is available
import { generateFollowUpProposalAction } from '../../../actions/aiActions';

export default function FollowUpTab({ rx }) {
  const [proposalStatus, setProposalStatus] = useState('pending'); // pending, accepted, denied
  const [aiProposal, setAiProposal] = useState(null);
  const [loadingProposal, setLoadingProposal] = useState(false);
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
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setProposalStatus('accepted')}
                  style={{
                    background: '#16a34a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.5rem 1rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Accept Proposal
                </button>
                <button
                  onClick={() => setProposalStatus('denied')}
                  style={{
                    background: 'white',
                    color: '#16a34a',
                    border: '1px solid #16a34a',
                    borderRadius: '6px',
                    padding: '0.5rem 1rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer'
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
          }}
        >
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
          <div style={{ fontSize: '0.9rem', opacity: 0.85 }}>
            {proposalStatus === 'accepted' ? 'Scheduled via AI Proposal' : (followUpDate
              ? `Scheduled for ${followUpDate}`
              : 'Review milestone set.')}
          </div>
        </div>
      )}

      {(!isScheduled && proposalStatus === 'denied') && (
        <div
          style={{
            background: '#f8fafc',
            border: '1px dashed #cbd5e1',
            borderRadius: '14px',
            padding: '1.5rem',
            color: '#64748b',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            Not Scheduled
          </div>
          <div style={{ fontSize: '0.85rem' }}>
            Manual follow-up scheduling required.
          </div>
        </div>
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
