import Link from "lucide-react/dist/esm/icons/link";
import Users from "lucide-react/dist/esm/icons/users";
import Share2 from "lucide-react/dist/esm/icons/share-2";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import Copy from "lucide-react/dist/esm/icons/copy";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import React, { useState } from 'react';








export default function ReferralTracking({ ownerId, ownerType }) {
  const [copiedLink, setCopiedLink] = useState(null);

  const stats = [
    { label: 'Total Clicks', value: '1,245', icon: <TrendingUp size={20} color="var(--primary)" />, change: '+12%' },
    { label: 'New Signups', value: '48', icon: <Users size={20} color="var(--primary)" />, change: '+5%' },
    { label: 'Converted Orders', value: '32', icon: <CheckCircle size={20} color="var(--primary)" />, change: '+18%' },
    { label: 'Generated Revenue', value: '$8,450', icon: <DollarSign size={20} color="var(--primary)" />, change: '+22%' }
  ];

  const handleCopy = (link) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '2rem'
      }}>
        <div>
          <h2 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <Share2 size={24} color="var(--primary)" />
            Referral & Affiliate Tracking
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Track your unique affiliate links and monitor conversion performance.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {stats.map((stat, idx) => (
          <div key={idx} style={{
            padding: '1.5rem',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ padding: '0.5rem', backgroundColor: 'var(--primary-light)', borderRadius: '8px' }}>
                {stat.icon}
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-success)', backgroundColor: 'rgba(16,185,129,0.1)', padding: '0.2rem 0.5rem', borderRadius: '12px' }}>
                {stat.change}
              </span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-main)' }}>{stat.value}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Referral Links Section */}
      <div style={{
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', color: 'var(--text-main)' }}>Your Active Links</h3>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {[
            { name: 'Standard Clinic Invite', url: 'https://regenpept.com/join/am-roberto', clicks: 840, conv: '4.2%' },
            { name: 'VIP Research Webinar', url: 'https://regenpept.com/webinar/am-roberto', clicks: 405, conv: '6.5%' }
          ].map((link, idx) => (
            <div key={idx} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              backgroundColor: 'var(--color-bg-subtle, #f8fafc)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>{link.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
                  <Link size={14} />
                  {link.url}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Clicks</div>
                  <div style={{ fontWeight: 600 }}>{link.clicks}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Conv. Rate</div>
                  <div style={{ fontWeight: 600, color: 'var(--color-success)' }}>{link.conv}</div>
                </div>
                <button 
                  onClick={() => handleCopy(link.url)}
                  className="secondary-button"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
                >
                  {copiedLink === link.url ? <CheckCircle size={16} color="var(--color-success)" /> : <Copy size={16} />}
                  {copiedLink === link.url ? 'Copied' : 'Copy Link'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}