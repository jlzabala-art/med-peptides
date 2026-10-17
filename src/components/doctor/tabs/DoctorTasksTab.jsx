"use client";

import React from 'react';
import Link from 'next/link';
import { Clock, ArrowUpRight, MessageCircle, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../../ui/DataTable';
import CopyableId from '../../ui/CopyableId';

/**
 * DoctorTasksTab
 * 
 * Pending Clinical Tasks & To-Do Actions (Google Cloud Rule #4 Master-Detail)
 * Provides a to-do queue with quick filter pills (All, Titrations, Refills, Sign-offs)
 * and expandable rows revealing full action details.
 */
export default function DoctorTasksTab({
  taskFilter,
  setTaskFilter,
  filteredTasks,
  slug,
  taskColumns,
  handleRowClickTask
}) {
  return (
    <section
      id="tasks"
      style={{
        background: '#ffffff',
        border: '1px solid #dadce0',
        borderRadius: '8px',
        marginBottom: '32px',
        boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #dadce0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          background: '#ffffff'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} style={{ color: '#1a73e8' }} />
            <span>Patient Care To-Do List & Pending Clinical Actions</span>
          </h2>
          <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
            Automated clinical vigilance based on treatment schedules, phase titrations, and intake submissions.
          </p>
        </div>

        {/* Quick Task Filter Pills */}
        <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: '6px', padding: '3px', gap: '2px' }}>
          {[
            { id: 'all', label: 'All' },
            { id: 'proposal_followup', label: 'Follow-ups' },
            { id: 'titration', label: 'Titrations' },
            { id: 'refill', label: 'Refills' },
            { id: 'approval', label: 'Sign-offs' }
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setTaskFilter(f.id)}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                border: 'none',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: taskFilter === f.id ? '#ffffff' : 'transparent',
                color: taskFilter === f.id ? '#0f172a' : '#64748b',
                boxShadow: taskFilter === f.id ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.12s'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={taskColumns}
        data={filteredTasks}
        keyField="id"
        tableId={`doctor-tasks-${slug}`}
        pagination={true}
        initialRowsPerPage={10}
        alwaysShowPagination={true}
        onRowClick={handleRowClickTask}
        emptyTitle="All Patient Care Tasks Up to Date"
        emptyDescription="There are no pending protocol titrations, phase adjustments, or refill authorizations requiring physician action."
        expandableRender={(task) => (
          <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.80rem', fontWeight: 700, color: '#1a73e8' }}>
                  Clinical Action Details
                </span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1px solid #bfdbfe'
                }}>
                  <Clock size={11} />
                  Timeline: {task.dueDate || 'Immediate'}
                </span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: task.isSigned || task.status === 'approved' ? '#f0fdf4' : '#fffbeb',
                  color: task.isSigned || task.status === 'approved' ? '#16a34a' : '#b45309',
                  border: `1px solid ${task.isSigned || task.status === 'approved' ? '#bbf7d0' : '#fde68a'}`
                }}>
                  {task.type === 'proposal_followup' ? (task.daysAgo ? `Offer Unaccepted (${task.daysAgo}d)` : 'Offer Unaccepted') : (task.isSigned || task.status === 'approved' ? 'Signed & Authorized' : 'Pending Authorization')}
                </span>
              </div>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                Trigger: {task.type === 'proposal_followup' ? 'Patient Conversion & Re-engagement Monitor' : 'Automated Chronobiological Protocol Monitor'}
              </span>
            </div>
            <p style={{ margin: '0 0 12px 0', fontSize: '0.82rem', color: '#334155', lineHeight: 1.45 }}>
              {task.description}
            </p>

            {task.type === 'proposal_followup' && (
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 14px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Recommended Patient Re-engagement Message (WhatsApp)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        const cleanMsg = (task.whatsappMessage || '').replace(/Dr\.\s+Dr\.\s+/gi, 'Dr. ');
                        navigator.clipboard.writeText(cleanMsg);
                        toast.success('Clinical reminder copied to clipboard');
                      }
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.70rem',
                      fontWeight: 600,
                      color: '#1a73e8',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <Copy size={11} />
                    <span>Copy Template</span>
                  </button>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#1e293b', fontStyle: 'italic', background: '#f8fafc', padding: '8px 10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                  &ldquo;{(task.whatsappMessage || '').replace(/Dr\.\s+Dr\.\s+/gi, 'Dr. ')}&rdquo;
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {task.type === 'proposal_followup' ? (
                <>
                  <a
                    href={task.patientPhone ? `https://wa.me/${task.patientPhone.replace(/[^0-9+]/g, '')}?text=${encodeURIComponent((task.whatsappMessage || '').replace(/Dr\.\s+Dr\.\s+/gi, 'Dr. '))}` : `https://wa.me/?text=${encodeURIComponent((task.whatsappMessage || '').replace(/Dr\.\s+Dr\.\s+/gi, 'Dr. '))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '4px',
                      background: '#16a34a',
                      color: '#ffffff',
                      fontSize: '0.78rem',
                      fontWeight: 650,
                      textDecoration: 'none',
                      boxShadow: '0 1px 2px rgba(22,163,74,0.25)'
                    }}
                  >
                    <MessageCircle size={13} style={{ color: '#ffffff' }} />
                    <span>Send WhatsApp Reminder</span>
                  </a>
                  <Link
                    href={task.actionUrl}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '4px',
                      background: '#ffffff',
                      border: '1px solid #dadce0',
                      color: '#1a73e8',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                  >
                    <span>View Proposal Dossier</span>
                    <ArrowUpRight size={13} />
                  </Link>
                </>
              ) : (
                <Link
                  href={task.actionUrl}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '4px',
                    background: '#1a73e8',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    boxShadow: '0 1px 2px rgba(60,64,67,0.3)'
                  }}
                >
                  <span>Execute {task.actionLabel}</span>
                  <ArrowUpRight size={13} />
                </Link>
              )}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Reference Prescription:</span>
                <CopyableId value={task.code} iconOnly={false} />
              </div>
            </div>
          </div>
        )}
      />
    </section>
  );
}
