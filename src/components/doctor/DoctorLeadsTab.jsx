"use client";
import React, { useState, useEffect } from 'react';
import { getDoctorLeads, claimDoctorLead } from '@/repositories/doctorLeadsRepository';
import { Stethoscope, Mail, Phone, MapPin, CheckCircle, Clock, ArrowRight, User } from '@/lib/icons';
import DataTable from '../ui/DataTable';
import StatusBadge from '../ui/StatusBadge';
import CopyableId from '../ui/CopyableId';
import notifier from '../../services/NotificationService';
import { useRouter } from 'next/navigation';

export default function DoctorLeadsTab({ doctorId }) {
  const router = useRouter();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const list = await getDoctorLeads(50);
      setLeads(list);
    } catch (err) {
      console.error('[DoctorLeadsTab] Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [doctorId]);

  const handleClaimLead = async (lead) => {
    try {
      await claimDoctorLead(lead.id, doctorId || 'current_physician');
      notifier.success(`Lead for ${lead.fullName} marked as Contacted.`);
      fetchLeads();
    } catch (err) {
      notifier.error('Could not update lead status.');
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'Lead ID',
      width: '120px',
      render: (val, row) => <CopyableId value={row.id} />
    },
    {
      key: 'fullName',
      label: 'Patient Name',
      width: '200px',
      render: (val, row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{row.fullName}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.cityCountry || 'Location not specified'}</span>
        </div>
      )
    },
    {
      key: 'contact',
      label: 'Contact',
      width: '200px',
      render: (val, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.8rem' }}>
          {row.email && (
            <a href={`mailto:${row.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary)', textDecoration: 'none' }}>
              <Mail size={12} /> {row.email}
            </a>
          )}
          {row.phone && (
            <a href={`tel:${row.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#16a34a', textDecoration: 'none' }}>
              <Phone size={12} /> {row.phone}
            </a>
          )}
        </div>
      )
    },
    {
      key: 'sourceItemName',
      label: 'Requested Protocol / Peptide',
      width: '220px',
      render: (val, row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem' }}>
            {row.sourceItemName || 'General Inquiry'}
          </span>
          {row.notes && (
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontStyle: 'italic', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              "{row.notes}"
            </span>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      width: '120px',
      render: (val, row) => <StatusBadge status={row.status || 'pending'} />
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '180px',
      render: (val, row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => handleClaimLead(row)}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              background: 'rgba(13, 148, 136, 0.1)',
              border: '1px solid rgba(13, 148, 136, 0.25)',
              color: '#0d9488',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Mark Contacted
          </button>
          <button
            onClick={() => router.push(`/doctor/new-prescription?patientName=${encodeURIComponent(row.fullName)}&compound=${encodeURIComponent(row.sourceItemName || '')}`)}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              background: 'var(--primary, #003666)',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Create Rx →
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '1rem', background: 'var(--background)' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.25rem' }}>
          Inbound Patient Leads
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
          Patients and researchers who requested clinical supervision from product and protocol pages.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={leads}
        loading={loading}
        globalSearch={true}
        searchPlaceholder="Search leads by name, email, or protocol..."
        emptyMessage="No patient leads received yet."
      />
    </div>
  );
}
