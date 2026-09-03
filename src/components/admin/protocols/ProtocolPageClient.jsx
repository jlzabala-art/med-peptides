'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Share2, Save, ExternalLink, Sparkles } from '@/lib/icons';
import { motion } from 'framer-motion';
import ProtocolHubDashboard from './ProtocolHubDashboard';
import { updateProtocolFull } from '../../../services/protocolStorage';
import { useToast } from '../../../hooks/useToast';
import { useGlobalStore } from '../../../stores/globalStore';
import { getProtocolDisplayName } from '../../../utils/protocolHelpers';
import { openProtocolAI } from '../../../utils/openModuleAI';
import Breadcrumb from '../../ui/Breadcrumb';

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
      toast.success(`Protocol "${updatedProtocol.name || 'Draft'}" saved successfully.`);
      setTimeout(() => setSaved(false), 2000);
      
      // update localProtocol so next save has the new audit logs & version
      setLocalProtocol(finalProtocol);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save protocol.');
    }
  }, [protocol.id, user.displayName, toast]);

  const handleShare = () => {
    const url = `${window.location.origin}/shared/protocol/${protocol.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Share link copied to clipboard!');
  };

  const handleViewPublic = () => {
    const slug = localProtocol.protocol_slug || localProtocol.id;
    window.open(`/proto/${slug}`, '_blank');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-app)', display: 'flex', flexDirection: 'column' }}>
      {/* Top action bar */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        background: 'var(--color-bg-surface)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0.6rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}>
        <button
          onClick={() => router.push('/admin/protocols')}
          className="gcp-btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.65rem' }}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Breadcrumb
            items={[
              { label: 'Admin', href: '/admin' },
              { label: 'Protocols', href: '/admin/protocols' },
              { label: getProtocolDisplayName(localProtocol) }
            ]}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          <button
            onClick={() => {
              openProtocolAI({
                // ── Identificación ────────────────────────────────────
                name: localProtocol.name,
                protocol_name: localProtocol.name,
                protocol_slug: localProtocol.protocol_slug || localProtocol.id,
                id: localProtocol.id,
                slug: localProtocol.protocol_slug || localProtocol.id,
                status: localProtocol.status,
                // ── Objetivo y audiencia ───────────────────────────────
                primary_goal: localProtocol.primary_goal || localProtocol.goal,
                goal: localProtocol.primary_goal || localProtocol.goal,
                target_audience: localProtocol.target_audience,
                // ── Estructura del protocolo ───────────────────────────
                duration_weeks: localProtocol.duration_weeks,
                phases: (localProtocol.phases || []).map(p => ({
                  name: p.name || p.phase_name,
                  duration_weeks: p.duration_weeks || p.durationWeeks,
                  peptides: p.peptides || p.compounds || [],
                  notes: p.notes || p.description,
                })),
                peptideIds: localProtocol.peptideIds || [],
                peptides: localProtocol.peptides || [],
                // ── Outcomes y referencias ─────────────────────────────
                expected_outcomes: localProtocol.expected_outcomes,
                references: localProtocol.references,
                // ── Métricas de uso ───────────────────────────────────
                prescriptionCount: localProtocol.prescriptionCount,
              }, { autoGenerate: true });
            }}
            className="gcp-btn-secondary"
            title="Analizar protocolo con ClinicalAI"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              borderRadius: '8px',
              padding: '0.4rem 0.8rem',
              fontSize: '0.85rem',
              backgroundColor: 'rgba(124, 58, 237, 0.08)',
              color: '#7c3aed',
              borderColor: 'rgba(124, 58, 237, 0.25)',
              fontWeight: 700
            }}
          >
            <Sparkles size={15} /> AI Analysis
          </button>
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
