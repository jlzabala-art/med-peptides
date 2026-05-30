import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import {
  ClipboardList, Plus, User, Building, XCircle, Clock, CheckCircle2,
  Activity, Truck, FileText, Copy
} from 'lucide-react';
import { RX_STATUS_META, RX_TYPE, DELIVERY_METHOD, RX_STATUS, rxEvent } from '../../config/prescriptionConfig';
import DoctorPrescriptionBuilder from './DoctorPrescriptionBuilder';
import Card from '../ui/Card';
import DataTable from '../ui/DataTable';
import Spinner from '../ui/Spinner';
import StatusChip from '../ui/StatusChip';

// ── Kit logistics status tracker milestones ──────────────────────────────────
const KIT_STEPS = [
  { key: 'kit_dispatched', label: 'Kit Enviado', icon: '📦' },
  { key: 'sample_ready', label: 'Muestra Lista', icon: '🧪' },
  { key: 'collection_label_sent', label: 'Etiqueta Generada', icon: '🏷️' },
  { key: 'in_transit', label: 'En Tránsito', icon: '🚚' },
  { key: 'processing', label: 'Analizando', icon: '🔬' },
  { key: 'results_available', label: 'Resultados Listos', icon: '📋' }
];

export default function DoctorPrescriptionsTab({ doctorId, doctorMeta, patients = [], initialBuilderOpen = false, hideHistory = false, onSavedRedirect }) {
  const queryClient = useQueryClient();
  const [builderData, setBuilderData] = useState(initialBuilderOpen ? {} : null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');

  const { data: prescriptions = [], isLoading, refetch } = useQuery({
    queryKey: ['prescriptions', doctorId],
    queryFn: async () => {
      if (!doctorId) return [];
      const q = query(collection(db, 'prescriptions'), where('doctorId', '==', doctorId));
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => {
        const tA = a.createdAt?.seconds ? a.createdAt.seconds : (a.createdAt?.toDate ? a.createdAt.toDate().getTime() / 1000 : 0);
        const tB = b.createdAt?.seconds ? b.createdAt.seconds : (b.createdAt?.toDate ? b.createdAt.toDate().getTime() / 1000 : 0);
        return tB - tA;
      });
      return docs;
    },
    enabled: !!doctorId,
  });

  const updateRxMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      await updateDoc(doc(db, 'prescriptions', id), updates);
    },
    onSuccess: () => queryClient.invalidateQueries(['prescriptions', doctorId])
  });

  const doCancel = (rx) => {
    if (!window.confirm('¿Cancelar esta prescripción?')) return;
    updateRxMutation.mutate({
      id: rx.id,
      updates: {
        status: RX_STATUS.CANCELLED,
        updatedAt: serverTimestamp(),
        timeline: [...(rx.timeline || []), { ...rxEvent('cancelled', doctorId, 'doctor'), timestamp: new Date().toISOString() }],
      }
    });
  };

  const markSampleReady = (rx) => {
    updateRxMutation.mutate({
      id: rx.id,
      updates: {
        kitStatus: 'sample_ready',
        updatedAt: serverTimestamp(),
        timeline: [
          ...(rx.timeline || []),
          { event: 'kit_sample_ready', note: 'Muestra lista para recogida.', timestamp: new Date().toISOString() }
        ]
      }
    });
  };

  const filtered = prescriptions.filter(rx => {
    if (filterStatus !== 'all' && rx.status !== filterStatus) return false;
    if (filterType !== 'all' && rx.type !== filterType) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (rx.patient?.name || '').toLowerCase().includes(q) ||
        (rx.patient?.email || '').toLowerCase().includes(q) ||
        (rx.diagnosis || '').toLowerCase().includes(q) ||
        (rx.items || []).some(i => i.name?.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const stats = {
    total: prescriptions.length,
    draft: prescriptions.filter(r => r.status === 'draft').length,
    active: prescriptions.filter(r => ['sent', 'viewed_by_patient', 'assigned_to_wholesaler', 'added_to_bulk'].includes(r.status)).length,
    done: prescriptions.filter(r => r.status === 'fulfilled').length,
  };

  if (hideHistory) {
    return (
      <Card>
        <DoctorPrescriptionBuilder doctorId={doctorId} doctorMeta={doctorMeta} patients={patients} prefilledData={builderData || {}} onSaved={(isDraft) => { if (onSavedRedirect) onSavedRedirect(); else if (isDraft) setBuilderData(null); queryClient.invalidateQueries(['prescriptions', doctorId]); }} />
      </Card>
    );
  }

  const columns = [
    {
      header: 'Paciente / Destinatario',
      key: 'patient',
      render: (rx) => {
        const isCorp = rx.type === RX_TYPE.CLINIC_SUPPLY;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: isCorp ? '#e0f2fe' : '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isCorp ? <Building size={14} color="#0284c7" /> : <User size={14} color="var(--color-success)" />}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {isCorp ? 'Suministro Clínica' : (rx.patient?.name || 'Paciente sin nombre')}
              </div>
              {!isCorp && rx.patient?.email && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{rx.patient.email}</div>}
            </div>
          </div>
        );
      }
    },
    {
      header: 'Tipo',
      key: 'type',
      render: (rx) => (
        <span style={{ padding: '4px 8px', background: rx.type === RX_TYPE.CLINIC_SUPPLY ? '#f1f5f9' : '#dcfce7', color: rx.type === RX_TYPE.CLINIC_SUPPLY ? 'var(--color-text-secondary)' : 'var(--color-success)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
          {rx.type === RX_TYPE.CLINIC_SUPPLY ? 'Clínica' : 'Paciente'}
        </span>
      )
    },
    {
      header: 'Fecha',
      key: 'createdAt',
      render: (rx) => rx.createdAt?.toDate ? rx.createdAt.toDate().toLocaleDateString() : '—'
    },
    {
      header: 'Items',
      key: 'items',
      render: (rx) => {
        const itemsSummary = (rx.items || []).map(i => `${i.name} (${i.quantity} ${i.unit || 'uds'})`).join(', ');
        return <div style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>{itemsSummary || 'Sin ítems'}</div>;
      }
    },
    {
      header: 'Estado',
      key: 'status',
      render: (rx) => {
        const m = RX_STATUS_META[rx.status] || { label: rx.status };
        return <StatusChip status={rx.status} customLabel={`${m.emoji || ''} ${m.label}`} />;
      }
    },
    {
      header: 'Acciones',
      key: 'actions',
      align: 'right',
      render: (rx) => {
        const isFinal = ['fulfilled', 'cancelled', 'expired'].includes(rx.status);
        const isDraft = rx.status === RX_STATUS.DRAFT;
        return (
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button
              title="Copiar Prescripción"
              onClick={(e) => { e.stopPropagation(); setBuilderData({ items: rx.items || [], patient: rx.patient || null, type: rx.type || 'patient', diagnosis: rx.diagnosis || '', clinicalNotes: rx.clinicalNotes || '', delivery: rx.delivery || { method: 'direct_patient' } }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="btn"
              style={{ padding: '6px', background: '#e0e7ff', color: 'var(--primary)', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <Copy size={14} />
            </button>
            {!isFinal && !isDraft && (
              <button
                title="Cancelar"
                onClick={(e) => { e.stopPropagation(); doCancel(rx); }}
                disabled={updateRxMutation.isPending}
                className="btn"
                style={{ padding: '6px', background: '#fee2e2', color: 'var(--color-danger)', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <XCircle size={14} />
              </button>
            )}
          </div>
        );
      }
    }
  ];

  const renderExpandable = (rx) => {
    const hasTestingItems = rx.items?.some(i => i.productType === 'testing' || i.type === 'testing' || i.category === 'testing' || (i.name && i.name.toLowerCase().includes('test')));

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {hasTestingItems && (
          <div style={{ background: 'var(--color-bg-surface)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                <Activity size={18} color="#f59e0b" /> Seguimiento de Kit Diagnóstico
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {(rx.kitStatus === 'kit_dispatched' || !rx.kitStatus || rx.kitStatus === 'none') && (
                  <button onClick={() => markSampleReady(rx)} disabled={updateRxMutation.isPending} className="btn" style={{ padding: '6px 12px', borderRadius: '6px', background: '#e0e7ff', color: 'var(--primary)', border: 'none', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                    🧪 Marcar Kit Listo
                  </button>
                )}
                {rx.collectionLabelUrl && (
                  <button onClick={() => window.open(rx.collectionLabelUrl, '_blank')} className="btn" style={{ padding: '6px 12px', borderRadius: '6px', background: '#dcfce7', color: 'var(--color-success)', border: 'none', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                    🏷️ Descargar Etiqueta
                  </button>
                )}
                {rx.labResultsUrl && (
                  <button onClick={() => window.open(rx.labResultsUrl, '_blank')} className="btn" style={{ padding: '6px 12px', borderRadius: '6px', background: '#fee2e2', color: '#b91c1c', border: 'none', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                    📋 Ver Resultados
                  </button>
                )}
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflowX: 'auto', paddingBottom: '1rem' }}>
              <div style={{ position: 'absolute', top: '16px', left: '30px', right: '30px', height: '2px', background: 'var(--color-border)', zIndex: 1 }} />
              {(() => {
                const currentKitStatus = rx.kitStatus && rx.kitStatus !== 'none' ? rx.kitStatus : 'kit_dispatched';
                const activeStepIndex = KIT_STEPS.findIndex(s => s.key === currentKitStatus);
                return (
                  <>
                    <div style={{ position: 'absolute', top: '16px', left: '30px', width: `${activeStepIndex >= 0 ? (activeStepIndex / (KIT_STEPS.length - 1)) * 90 : 0}%`, height: '2px', background: 'var(--primary)', zIndex: 1, transition: 'width 0.3s' }} />
                    {KIT_STEPS.map((step, idx) => {
                      const isCompleted = idx <= activeStepIndex && activeStepIndex >= 0;
                      return (
                        <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, minWidth: '80px', flex: 1 }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: isCompleted ? 'var(--primary)' : 'white', border: `2px solid ${isCompleted ? 'var(--primary)' : 'var(--color-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isCompleted ? 'white' : 'var(--color-text-secondary)' }}>
                            {step.icon}
                          </div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: isCompleted ? 'var(--primary)' : 'var(--color-text-secondary)', marginTop: '0.5rem' }}>{step.label}</span>
                        </div>
                      );
                    })}
                  </>
                );
              })()}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div style={{ background: 'var(--color-bg-surface)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '1rem' }}><FileText size={16} color="var(--primary)" /> Diagnóstico y Notas</div>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600, marginBottom: '0.25rem' }}>Diagnóstico</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>{rx.diagnosis || <span style={{ color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>No especificado</span>}</div>
            </div>
            {rx.clinicalNotes && (
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600, marginBottom: '0.25rem' }}>Notas</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', whiteSpace: 'pre-wrap' }}>{rx.clinicalNotes}</div>
              </div>
            )}
          </div>

          <div style={{ background: 'var(--color-bg-surface)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '1rem' }}><Activity size={16} color="var(--color-success)" /> Ítems Prescritos</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {rx.items?.map((item, idx) => (
                <div key={idx} style={{ padding: '0.75rem', background: 'var(--color-bg-app)', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.9rem' }}>{item.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                    Cantidad: <strong style={{ color: 'var(--color-text-primary)' }}>{item.quantity} {item.unit || 'uds'}</strong>
                    {item.dosage && ` | Dosis: ${item.dosage}`}
                  </div>
                </div>
              ))}
              {(!rx.items || rx.items.length === 0) && <div style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>Sin items</div>}
            </div>
          </div>

          <div style={{ background: 'var(--color-bg-surface)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '1rem' }}><Clock size={16} color="#ea580c" /> Historial</div>
            <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(rx.timeline || []).slice().reverse().map((t, idx) => (
                <div key={idx} style={{ fontSize: '0.8rem', display: 'flex', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>{t.timestamp ? new Date(t.timestamp).toLocaleDateString() : ''}</span>
                  <div>
                    <strong style={{ color: 'var(--color-text-primary)' }}>{t.event.replace(/_/g, ' ')}</strong>
                    {t.note && <div style={{ color: 'var(--color-text-secondary)' }}>{t.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ClipboardList size={24} color="var(--primary)" /> Historial de Prescripciones
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem', margin: 0 }}>
            {stats.total} registradas · {stats.draft} borradores · {stats.active} en proceso
          </p>
        </div>
        <button onClick={() => setBuilderData(builderData ? null : {})} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={16} /> {builderData !== null ? 'Ocultar Formulario' : 'Nueva Prescripción'}
        </button>
      </div>

      {builderData !== null && (
        <Card>
          <DoctorPrescriptionBuilder doctorId={doctorId} doctorMeta={doctorMeta} patients={patients} prefilledData={builderData} onSaved={(isDraft) => { if (onSavedRedirect) { onSavedRedirect(); } else if (isDraft) { setBuilderData(null); } queryClient.invalidateQueries(['prescriptions', doctorId]); }} />
        </Card>
      )}

      <Card noPadding>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: 'var(--color-bg-app)' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[ { key: 'all', label: `Todas (${stats.total})` }, { key: 'draft', label: 'Borrador' }, { key: 'sent', label: 'Enviadas' }, { key: 'fulfilled', label: 'Entregadas' } ].map(f => (
              <button key={f.key} onClick={() => setFilterStatus(f.key)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: filterStatus === f.key ? '#e0e7ff' : 'transparent', color: filterStatus === f.key ? 'var(--primary)' : 'var(--color-text-secondary)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                {f.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}>
              <option value="all">Todos los tipos</option>
              <option value="patient">Para paciente</option>
              <option value="clinic_supply">Suministro clínica</option>
            </select>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filtrar prescripciones..." style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', width: '200px' }} />
          </div>
        </div>

        {isLoading ? (
          <Spinner text="Cargando prescripciones..." />
        ) : filtered.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <ClipboardList size={48} color="var(--color-border)" style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '1.1rem', margin: '0 0 0.5rem' }}>No se encontraron prescripciones.</p>
          </div>
        ) : (
          <DataTable columns={columns} data={filtered} expandableRender={renderExpandable} />
        )}
      </Card>
    </div>
  );
}
