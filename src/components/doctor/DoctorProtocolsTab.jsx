import React, { useState, useEffect } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';
import { FlaskConical, Plus, Copy, Lock, User, CheckCircle, ArrowRight } from 'lucide-react';
import { getPaginatedProtocols } from '../../services/protocolStorage';
import CustomProtocolBuilder from '../admin/CustomProtocolBuilder';

export default function DoctorProtocolsTab({ doctorId }) {
  const [activeTab, setActiveTab] = useState('public');
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [cloning, setCloning] = useState(null);

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
        protocol_name: protocol.protocol_name + ' (Copy)',
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
    } catch (err) {
      console.error("Clone error", err);
      alert('Error cloning protocol');
    } finally {
      setCloning(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem 0' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => setActiveTab('public')}
            className="btn"
            style={{ 
              padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600,
              backgroundColor: activeTab === 'public' ? 'var(--primary)' : 'white',
              color: activeTab === 'public' ? 'white' : 'var(--text-secondary)',
              border: '1px solid var(--border)'
            }}
          >
            Atlas Health Protocols
          </button>
          <button 
            onClick={() => setActiveTab('private')}
            className="btn"
            style={{ 
              padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600,
              backgroundColor: activeTab === 'private' ? 'var(--primary)' : 'white',
              color: activeTab === 'private' ? 'white' : 'var(--text-secondary)',
              border: '1px solid var(--border)'
            }}
          >
            My Custom Protocols
          </button>
        </div>

        <button 
          onClick={() => setShowBuilder(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={18} /> Create Custom Kit
        </button>
      </div>

      {loading ? (
        <Spinner text="Loading protocols..." />
      ) : protocols.length === 0 ? (
        <Card>
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <FlaskConical size={48} color="var(--border)" style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.1rem', margin: '0 0 0.5rem' }}>
              No {activeTab === 'public' ? 'public protocols' : 'custom protocols'} found.
            </p>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {protocols.map(p => (
            <Card key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                  {p.protocol_name || p.title}
                </h3>
                {p.visibility === 'public' ? (
                  <Lock size={16} color="var(--text-muted)" title="Read-only Public Protocol" />
                ) : (
                  <User size={16} color="var(--primary)" title="Your Custom Protocol" />
                )}
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {p.therapeutic_category || p.category || 'Uncategorized'}
              </div>

              <div style={{ background: 'var(--surface-raised)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Phases & Products:</div>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)' }}>
                  {p.phases?.map((phase, idx) => (
                    <li key={idx}>
                      {phase.label || `Phase ${idx + 1}`} ({phase.durationWeeks || phase.duration_weeks || 4} wks)
                      {phase.medications && phase.medications.length > 0 && (
                        <ul style={{ paddingLeft: '1rem', marginTop: '0.25rem' }}>
                          {phase.medications.map((m, mIdx) => (
                            <li key={mIdx}>{m.name}</li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {p.phases?.length || 0} Phase(s)
                </span>
                
                {activeTab === 'public' && (
                  <button 
                    onClick={() => handleClone(p)}
                    disabled={cloning === p.id}
                    className="btn"
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.5rem', 
                      fontSize: '0.8rem', padding: '0.4rem 0.75rem', 
                      borderRadius: '6px', background: '#e0e7ff', color: 'var(--primary)',
                      border: 'none', cursor: cloning === p.id ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {cloning === p.id ? <Spinner size={14} /> : <Copy size={14} />} Duplicate
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
