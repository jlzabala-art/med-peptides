'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Share2, Save, ExternalLink } from '@/lib/icons';
import { motion } from 'framer-motion';
import ProtocolHubDashboard from './ProtocolHubDashboard';
import { updateProtocolFull } from '../../../services/protocolStorage';
import { useToast } from '../../../hooks/useToast';
import { useGlobalStore } from '../../../stores/globalStore';

export default function ProtocolPageClient({ protocol }) {
  const router = useRouter();
  const { toast } = useToast();
  const [saved, setSaved] = useState(false);
  const [localProtocol, setLocalProtocol] = useState(protocol);
  const user = useGlobalStore(state => state.user) || { displayName: 'Admin' };

  const handleSave = useCallback(async (updatedProtocol) => {
    try {
      // Calculate version and audit log here
      const oldAuditLog = updatedProtocol.audit_log || [];
      const newAudit = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        action: "Protocol Updated",
        user: user.displayName || "Admin",
        details: "Protocol information was updated via admin dashboard."
      };
      
      const newAuditLog = [newAudit, ...oldAuditLog];
      let newVersion = updatedProtocol.version_number || updatedProtocol.protocol_version || '1.0';
      
      // Bump version logic (every 10 changes bumps major version)
      const minorVersion = newAuditLog.length % 10;
      let [major, minor] = newVersion.split('.').map(Number);
      if (isNaN(major)) major = 1;
      
      if (minorVersion === 0 && newAuditLog.length > 0) {
        newVersion = `${major + 1}.0`;
      } else {
        newVersion = `${major}.${minorVersion}`;
      }

      const finalProtocol = {
        ...updatedProtocol,
        audit_log: newAuditLog,
        version_number: newVersion,
        protocol_version: newVersion, 
      };

      await updateProtocolFull(protocol.id, finalProtocol);
      setSaved(true);
      toast.success('Protocol saved successfully');
      setTimeout(() => setSaved(false), 2000);
      
      // update localProtocol so next save has the new audit logs & version
      setLocalProtocol(finalProtocol);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save protocol');
    }
  }, [protocol.id, toast, user.displayName]);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copied to clipboard!');
    });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--bg-main)',
      color: 'var(--text-main)',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '0.75rem 1.5rem',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}>
        <button
          onClick={() => router.push('/admin/protocols')}
          className="gcp-btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={15} /> Protocols
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Admin / Protocols
          </div>
          <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {localProtocol.protocol_name || localProtocol.title || 'Untitled Protocol'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          <button
            onClick={handleShare}
            className="gcp-btn-secondary"
            title="Copy shareable link"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
          >
            <Share2 size={15} /> Share
          </button>
          <motion.button
            className={saved ? 'gcp-btn-primary' : 'gcp-btn-secondary'}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSave(localProtocol)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
          >
            <Save size={15} /> {saved ? 'Saved ✓' : 'Save'}
          </motion.button>
        </div>
      </div>

      {/* Hub Dashboard fills the rest */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <ProtocolHubDashboard
          protocol={localProtocol}
          onSave={handleSave}
          onChange={setLocalProtocol}
          onClose={() => router.push('/admin/protocols')}
          hideHeader={true}
        />
      </div>
    </div>
  );
}
