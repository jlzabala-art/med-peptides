import X from "lucide-react/dist/esm/icons/x";
import Mail from "lucide-react/dist/esm/icons/mail";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import Clock from "lucide-react/dist/esm/icons/clock";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Shield from "lucide-react/dist/esm/icons/shield";
import Cpu from "lucide-react/dist/esm/icons/cpu";
import Activity from "lucide-react/dist/esm/icons/activity";
import Send from "lucide-react/dist/esm/icons/send";
import React from 'react';










export default function InvitationPreviewPanel({ invitation, onClose, onResend }) {
  if (!invitation) return null;

  const sentDate = invitation.invitedAt?.toDate ? invitation.invitedAt.toDate() : new Date(invitation.invitedAt);
  const daysSince = Math.floor((new Date() - sentDate) / (1000 * 60 * 60 * 24));

  const isAccepted = invitation.status === 'accepted';
  const isExpired = !isAccepted && daysSince > 7;

  return (
    <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '450px', backgroundColor: 'white', boxShadow: '-5px 0 25px rgba(0,0,0,0.1)', zIndex: 999, display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.3s ease' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: '#f8fafc' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 700 }}>
            {invitation.name ? invitation.name.charAt(0).toUpperCase() : <Mail size={24} />}
          </div>
          <div>
            <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>{invitation.name || 'Unknown User'}</h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{invitation.email}</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Onboarding Pipeline */}
        <div>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={16} /> Onboarding Status
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 12, bottom: 12, left: 11, width: 2, backgroundColor: 'var(--border)', zIndex: 0 }} />
            <div style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
                 <CheckCircle2 size={14} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>Invitation Sent</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sentDate.toLocaleString()}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1, opacity: isAccepted ? 1 : 0.4 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: isAccepted ? '#10b981' : '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
                 {isAccepted ? <CheckCircle2 size={14} color="white" /> : <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'white' }} />}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>Invitation Accepted</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isAccepted ? 'User clicked the link' : 'Pending user action'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1, opacity: isAccepted ? 1 : 0.4 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: isAccepted ? '#10b981' : '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
                 {isAccepted ? <CheckCircle2 size={14} color="white" /> : <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'white' }} />}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>Profile Activated</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isAccepted ? 'Firebase auth generated' : 'Waiting for acceptance'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Access */}
        <div>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={16} /> Access Configurations
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>Roles</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                {(invitation.roles || []).map(r => (
                  <span key={r} style={{ padding: '2px 6px', backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>{r}</span>
                ))}
              </div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>Organization</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{invitation.organization || invitation.company || 'Not Assigned'}</div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>Territories</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{(invitation.territories || []).join(', ') || 'Global'}</div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>AI Access</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                {invitation.aiAccess ? Object.entries(invitation.aiAccess).filter(([k,v]) => v).length : 0} features active
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Actions */}
      <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', backgroundColor: '#f8fafc', display: 'flex', gap: '1rem' }}>
        {!isAccepted && (
          <button onClick={() => onResend(invitation)} className="gcp-btn-primary" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            <Send size={16} /> Resend Email
          </button>
        )}
        <button className="gcp-btn-secondary" style={{ flex: isAccepted ? 1 : 0 }}>
          Copy Link
        </button>
      </div>

    </div>
  );
}