import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { emailCampaignRepository } from '../repositories/emailCampaignRepository';
import { catalogRepository } from '../repositories/catalogRepository';

export default function CatalogEmailTracker() {
  const { eventId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Tracking referral click...');

  useEffect(() => {
    async function trackAndRedirect() {
      if (!eventId) {
        navigate('/');
        return;
      }

      try {
        // If eventId contains a real campaignId (passed in trackingUrl template)
        const campaign = await emailCampaignRepository.getCampaignById(eventId);
        if (campaign) {
          // Log click event in Firestore
          await emailCampaignRepository.logEvent(campaign.campaignId, 'click', {
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          });

          // Fetch catalog slug
          const catalog = await catalogRepository.getCatalogById(campaign.catalogId);
          if (catalog) {
            const recipientParam = encodeURIComponent(campaign.recipient.name || '');
            const clinicParam = encodeURIComponent(campaign.recipient.clinic || '');
            navigate(`/catalog/${catalog.slug}?recipient=${recipientParam}&clinic=${clinicParam}&utm_source=email_campaign`);
            return;
          }
        }
      } catch (e) {
        console.error('Error in email tracker redirection:', e);
      }
      
      // Fallback
      setStatus('Redirecting to Atlas Health catalog...');
      setTimeout(() => navigate('/'), 1500);
    }

    trackAndRedirect();
  }, [eventId, navigate]);

  return (
    <div style={trackerContainerStyle}>
      <div style={spinnerStyle} />
      <p style={statusTextStyle}>{status}</p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────
const trackerContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  backgroundColor: 'var(--color-bg-app)',
  fontFamily: "'Inter', sans-serif"
};

const spinnerStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  border: '3px solid rgba(26,115,232,0.1)',
  borderTopColor: '#1a73e8',
  animation: 'spin 1s linear infinite',
  marginBottom: '1rem'
};

const statusTextStyle = {
  fontSize: '0.88rem',
  color: '#5f6368',
  fontWeight: 500
};
