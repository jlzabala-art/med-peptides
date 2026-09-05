"use client";

import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import Plus from "lucide-react/dist/esm/icons/plus";
import Copy from "lucide-react/dist/esm/icons/copy";
import Lock from "lucide-react/dist/esm/icons/lock";
import User from "lucide-react/dist/esm/icons/user";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Briefcase from "lucide-react/dist/esm/icons/briefcase";
import Pill from "lucide-react/dist/esm/icons/pill";
import React, { useState, useEffect } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';

import Card from '../ui/Card';
import Spinner from '../ui/Spinner';
import { getPaginatedProtocols } from '../../services/protocolStorage';
import CustomProtocolBuilder from '../admin/CustomProtocolBuilder';
import { toast } from 'react-hot-toast';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { useDrawer } from '../../context/DrawerContext';
import notifier from '../../services/NotificationService';

export default function DoctorProtocolsTab({ doctorId }) {
  const [activeTab, setActiveTab] = useState('public');
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [cloning, setCloning] = useState(null);

  const { activeWorkspaceId, addItems, setDrawerOpen } = useWorkspaceStore();
  const { openDrawer } = useDrawer();

  const fetchProts = async (type) => {
    setLoading(true);
    try {
      const options = type === 'public' ? { visibility: 'public' } : { authorId: doctorId };
      const res = await getPaginatedProtocols(null, 50, options);
      setProtocols(res.protocols);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProts(activeTab);
  }, [activeTab, doctorId]);

  const handleClone = async (protocol) => {
    setCloning(protocol.id);
    try {
      const clone = {
        ...protocol,
        protocol_name: (protocol.protocol_name || protocol.title) + ' (Copy)',
        visibility: 'private',
        authorId: doctorId,
        created_at: new Date(),
        updated_at: new Date()
      };
      delete clone.id;
      await addDoc(collection(db, 'protocols'), clone);
      if (activeTab === 'private') {
        fetchProts('private');
      } else {
        setActiveTab('private');
      }
      notifier.success('Protocol cloned to your custom protocols!');
    } catch (err) {
      console.error("Clone error", err);
      toast.error('Error cloning protocol');
    } finally {
      setCloning(null);
    }
  };

  const handleStageProtocolToWorkspace = (protocol) => {
    const peptides = protocol.peptides || protocol.medications || [];
    const itemsToAdd = (peptides.length > 0 ? peptides : [{ id: protocol.id, canonicalName: protocol.protocol_name || protocol.title }]).map(pep => ({
      id: pep.id || `pep_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      productId: pep.productId || pep.id,
      canonicalName: pep.name || pep.canonicalName || pep.title || 'Protocol Compound',
      dosage: pep.dosage || pep.dose || 'Standard',
      quantity: 1,
      unitPrice: Number(pep.price || pep.unitPrice || 0),
      supplierCost: Number(pep.costPrice || pep.supplierCost || 0),
      format: pep.format || 'Vial',
    }));

    addItems(itemsToAdd, activeWorkspaceId);
    setDrawerOpen(true);
    notifier.success(`Staged ${itemsToAdd.length} item(s) from "${protocol.protocol_name || protocol.title}" into Workspace!`);
  };

  const handleCreateRxFromProtocol = (protocol) => {
    const peptides = protocol.peptides || protocol.medications || [];
    const initialItems = (peptides.length > 0 ? peptides : [{ id: protocol.id, canonicalName: protocol.protocol_name || protocol.title }]).map(pep => ({
      type: 'product',
      id: pep.id || pep.productId,
      productId: pep.productId || pep.id,
      name: pep.name || pep.canonicalName || pep.title || 'Protocol Compound',
      price: Number(pep.price || pep.unitPrice || 0),
      quantity: 1,
      dosage: pep.dosage || pep.dose || 'Standard',
      format: pep.format || 'Vial'
    }));

    openDrawer('rx-builder', 'new', {
      initialItems,
      sourceModule: 'protocol'
    });
    notifier.info(`Creating Rx Prescription from protocol "${protocol.protocol_name || protocol.title}"`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={() => setActiveTab('public')}
            className="btn"
            style={{ 
              padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.85rem',
              backgroundColor: activeTab === 'public' ? '#003666' : 'white',
              color: activeTab === 'public' ? 'white' : '#475569',
              border: '1px solid #cbd5e1',
              cursor: 'pointer'
            }}
          >
            Atlas Health Protocols
          </button>
          <button 
            onClick={() => setActiveTab('private')}
            className="btn"
            style={{ 
              padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.85rem',
              backgroundColor: activeTab === 'private' ? '#003666' : 'white',
              color: activeTab === 'private' ? 'white' : '#475569',
              border: '1px solid #cbd5e1',
              cursor: 'pointer'
            }}
          >
            My Custom Protocols
          </button>
        </div>

        <button 
          onClick={() => setShowBuilder(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#003666', color: '#ffffff', border: 'none', padding: '0.55rem 1.1rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.84rem', cursor: 'pointer' }}
        >
          <Plus size={18} /> Create Custom Protocol
        </button>
      </div>

      {loading ? (
        <Spinner text="Loading protocols..." />
      ) : protocols.length === 0 ? (
        <Card>
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <FlaskConical size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontWeight: 700, color: '#334155', fontSize: '1.05rem', margin: '0 0 0.5rem' }}>
              No {activeTab === 'public' ? 'public protocols' : 'custom protocols'} found.
            </p>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {protocols.map(p => (
            <Card key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, lineHeight: 1.3 }}>
                  {p.protocol_name || p.title}
                </h3>
                {p.visibility === 'public' ? (
                  <Lock size={16} color="#64748b" title="Read-only Public Protocol" />
                ) : (
                  <User size={16} color="#003666" title="Your Custom Protocol" />
                )}
              </div>

              <div style={{ fontSize: '0.82rem', color: '#0284c7', fontWeight: 700 }}>
                {p.therapeutic_category || p.category || 'Clinical Protocol'}
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.75rem', borderRadius: '8px', fontSize: '0.82rem' }}>
                <div style={{ fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>Phases & Products:</div>
                <ul style={{ margin: 0, paddingLeft: '1.1rem', color: '#475569' }}>
                  {p.phases?.map((phase, idx) => (
                    <li key={idx}>
                      {phase.label || `Phase ${idx + 1}`} ({phase.durationWeeks || phase.duration_weeks || 4} wks)
                      {phase.medications && phase.medications.length > 0 && (
                        <ul style={{ paddingLeft: '0.9rem', marginTop: '0.2rem' }}>
                          {phase.medications.map((m, mIdx) => (
                            <li key={mIdx}>{m.name}</li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Protocol Quick Actions */}
              <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleStageProtocolToWorkspace(p)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    backgroundColor: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                  title="Stage protocol into workspace cart"
                >
                  <Briefcase size={13} />
                  <span>+ Workspace</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCreateRxFromProtocol(p)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    backgroundColor: '#f0fdf4',
                    color: '#15803d',
                    border: '1px solid #bbf7d0',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                  title="Create prescription from protocol"
                >
                  <Pill size={13} />
                  <span>+ Create Rx</span>
                </button>

                {activeTab === 'public' && (
                  <button 
                    onClick={() => handleClone(p)}
                    disabled={cloning === p.id}
                    style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '4px', 
                      fontSize: '0.76rem', padding: '6px 10px', fontWeight: 700,
                      borderRadius: '6px', background: '#f1f5f9', color: '#475569',
                      border: '1px solid #cbd5e1', cursor: cloning === p.id ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {cloning === p.id ? <Spinner size={13} /> : <Copy size={13} />} Duplicate
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {showBuilder && (
        <CustomProtocolBuilder 
          onClose={() => setShowBuilder(false)} 
          onSaved={() => {
            setShowBuilder(false);
            if (activeTab === 'private') fetchProts('private');
            else setActiveTab('private');
          }} 
        />
      )}
    </div>
  );
}