import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';

import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { Bot, Mail, CheckCircle, XCircle, ArrowRight, ArrowLeft, Activity, AlertTriangle, FileText } from '@/lib/icons';
import toast from 'react-hot-toast';
import AIContextBadge from '@/components/ui/AIContextBadge';

export default function AIInboxTab() {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'inbound_emails'), orderBy('receivedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEmails(docs);
      if (docs.length > 0 && !selectedEmail && typeof window !== 'undefined' && window.innerWidth > 768) {
        setSelectedEmail(docs[0]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [selectedEmail]);

  const handleApprove = async (emailId) => {
    try {
      // 1. Update email status
      await updateDoc(doc(db, 'inbound_emails', emailId), { 
        status: 'approved',
        needsHumanReview: false
      });
      
      // 2. Generate Workflow Document based on intent
      const intent = selectedEmail.aiInterpretation?.intent;
      const data = selectedEmail.aiInterpretation?.extractedData || {};
      
      let collectionName = 'miscellaneous_inbound';
      let payload = {
        sourceEmailId: emailId,
        sourceEmailFrom: selectedEmail.from,
        entityName: data.supplierOrCustomer || selectedEmail.from,
        products: data.enrichedProducts || [],
        urgency: data.urgency || 'Normal',
        status: 'Draft',
        createdAt: new Date()
      };

      if (intent === 'RFQ' || intent === 'SUPPLIER_QUOTE') {
        collectionName = 'rfqs';
      } else if (intent === 'PRESCRIPTION') {
        collectionName = 'prescriptions';
      } else if (intent === 'PURCHASE_ORDER') {
        collectionName = 'purchase_orders';
      } else if (intent === 'LOGISTICS') {
        collectionName = 'logistics_events';
      }

      await addDoc(collection(db, collectionName), payload);

      toast.success(`${intent} Workflow generated successfully!`);
      setSelectedEmail(null);
    } catch (e) {
      console.error(e);
      toast.error('Failed to approve workflow');
    }
  };

  const handleReject = async (emailId) => {
    try {
      await deleteDoc(doc(db, 'inbound_emails', emailId));
      toast.success('Email discarded.');
      setSelectedEmail(null);
    } catch (e) {
      toast.error('Failed to discard email');
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading AI Inbox...</div>;
  }

  if (emails.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2rem', color: 'var(--text-muted)' }}>
        <Bot size={48} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>AI Inbox is Empty</h3>
        <p>Forward supplier emails to your Magic Inbound Address to see them appear here.</p>
      </div>
    );
  }

  return (
    <div className="ai-inbox-container">
      {/* LEFT LIST */}
      <div className={`ai-inbox-list ${selectedEmail ? 'ai-inbox-list--hidden-mobile' : ''}`}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bot size={18} color="var(--primary)" /> AI Ingestion Queue
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>{emails.filter(e => e.needsHumanReview).length} pending human review</p>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {emails.map(email => (
            <div 
              key={email.id}
              onClick={() => setSelectedEmail(email)}
              style={{
                padding: '16px',
                borderBottom: '1px solid var(--border)',
                cursor: 'pointer',
                backgroundColor: selectedEmail?.id === email.id ? 'var(--primary-light, #eff6ff)' : 'transparent',
                borderLeft: selectedEmail?.id === email.id ? '3px solid var(--primary, #2563eb)' : '3px solid transparent',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>{email.from}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  {email.receivedAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Just now'}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px' }}>
                {email.subject}
              </div>
              {email.status === 'ai_processed' && email.aiInterpretation && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--primary)', color: 'white' }}>
                    {email.aiInterpretation?.intent || 'ANALYZING'}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <Activity size={10} /> {email.aiInterpretation?.confidenceScore || 0}% Conf.
                  </span>
                </div>
              )}
              {email.status === 'pending_ai' && (
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>AI Processing...</span>
              )}
              {email.status === 'ai_failed' && (
                <span style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 600 }}>AI Error</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PREVIEW & VALIDATION */}
      <div className={`ai-inbox-detail ${!selectedEmail ? 'ai-inbox-detail--hidden-mobile' : ''}`}>
        {selectedEmail ? (
          <div style={{ padding: 'clamp(1rem, 2.5vw, 2rem)', maxWidth: '850px', margin: '0 auto', width: '100%' }}>
            
            {/* Mobile Back Button */}
            <div className="ai-inbox-mobile-back">
              <button
                type="button"
                onClick={() => setSelectedEmail(null)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '8px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  minHeight: '40px',
                  marginBottom: '1rem'
                }}
              >
                <ArrowLeft size={16} /> Volver a la Bandeja (Queue)
              </button>
            </div>

            {/* Header Action Bar with AIContextBadge */}
            <div style={{ marginBottom: '1.5rem', backgroundColor: 'var(--surface)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <AIContextBadge
                title="Inbound Email Intelligence"
                subtitle="Intent Detection & Automated Workflow Formulation"
                contextPill={`From: ${selectedEmail.from} • Subject: ${selectedEmail.subject?.slice(0, 35)}...`}
                accentColor="var(--primary, #003666)"
                model="Gemini 2.5 Flash"
                actions={
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleReject(selectedEmail.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        color: '#ef4444',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        padding: '0.5rem 0.85rem',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        minHeight: '40px'
                      }}
                    >
                      <XCircle size={16} /> Discard
                    </button>
                    <button
                      onClick={() => handleApprove(selectedEmail.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        background: 'var(--primary, #003666)',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        minHeight: '40px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                      }}
                    >
                      <CheckCircle size={16} /> Approve Workflow
                    </button>
                  </div>
                }
              />
            </div>

            <div className="ai-inbox-grid">
              
              {/* Original Email */}
              <div style={{ backgroundColor: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface-raised)' }}>
                  <h4 style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Mail size={14} /> Original Email
                  </h4>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>From</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{selectedEmail.from}</div>
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Subject</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>{selectedEmail.subject}</div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', whiteSpace: 'pre-wrap', lineHeight: 1.5, backgroundColor: 'var(--surface-raised)', padding: '1rem', borderRadius: '8px' }}>
                    {selectedEmail.textBody}
                  </div>
                </div>
              </div>

              {/* AI Extraction & Proposal */}
              <div style={{ backgroundColor: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--primary-light)' }}>
                  <h4 style={{ margin: 0, fontSize: '0.8rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                    <Bot size={14} /> AI Extraction & Proposal
                  </h4>
                </div>
                
                {selectedEmail.status === 'pending_ai' ? (
                  <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Activity size={24} className="spin" style={{ marginBottom: '1rem' }} />
                    <p>AI is processing this email...</p>
                  </div>
                ) : selectedEmail.status === 'ai_failed' ? (
                  <div style={{ padding: '3rem', textAlign: 'center', color: '#ef4444' }}>
                    <AlertTriangle size={32} style={{ marginBottom: '1rem', color: '#ef4444' }} />
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#ef4444' }}>AI Processing Failed</h3>
                    <p style={{ margin: 0, color: '#991b1b' }}>The AI was unable to process this email.</p>
                    <div style={{ fontSize: '0.85rem', marginTop: '1rem', padding: '1rem', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', textAlign: 'left', wordBreak: 'break-word' }}>
                      <strong>Error Details:</strong> {selectedEmail.aiErrorMessage || 'Unknown Error'}
                    </div>
                  </div>
                ) : selectedEmail.aiInterpretation ? (
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    
                    {/* Intent */}
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Detected Intent</label>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>
                        {selectedEmail.aiInterpretation.intent}
                      </div>
                    </div>

                    {/* Extracted Data */}
                    {selectedEmail.aiInterpretation.extractedData && (
                      <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Sender Context</label>
                            <input 
                              type="text" 
                              defaultValue={selectedEmail.aiInterpretation.extractedData.supplierOrCustomer}
                              style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.85rem' }} 
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Urgency</label>
                            <input 
                              type="text" 
                              defaultValue={selectedEmail.aiInterpretation.extractedData.urgency}
                              style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.85rem' }} 
                            />
                          </div>
                        </div>

                        {/* Product Matching Engine Results */}
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Identified Products</label>
                          {selectedEmail.aiInterpretation.extractedData.enrichedProducts?.map((prod, i) => (
                            <div key={i} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem', backgroundColor: 'var(--surface-raised)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <strong style={{ fontSize: '0.85rem' }}>{prod.extractedName}</strong>
                                {prod.matchStatus === 'FOUND' ? (
                                  <span style={{ fontSize: '0.65rem', backgroundColor: '#dcfce7', color: '#16a34a', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>EXACT MATCH</span>
                                ) : (
                                  <span style={{ fontSize: '0.65rem', backgroundColor: '#fee2e2', color: '#ef4444', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>NEW PRODUCT</span>
                                )}
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem' }}>
                                <div><span style={{ color: 'var(--text-muted)' }}>Qty:</span> <input type="text" defaultValue={prod.quantity} style={{ padding: '2px 4px', width: '60px', border: '1px solid var(--border)', borderRadius: '4px' }}/></div>
                                <div><span style={{ color: 'var(--text-muted)' }}>Conc:</span> <input type="text" defaultValue={prod.concentration} style={{ padding: '2px 4px', width: '60px', border: '1px solid var(--border)', borderRadius: '4px' }}/></div>
                              </div>
                              
                              {prod.matchStatus === 'NOT_FOUND' && (
                                <div style={{ marginTop: '0.75rem', padding: '0.5rem', backgroundColor: '#fffbeb', border: '1px dashed #f59e0b', borderRadius: '6px', fontSize: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                                  <AlertTriangle size={14} color="#f59e0b" style={{ flexShrink: 0 }} />
                                  <span>Atlas will create a <strong>Draft Product Proposal</strong> for this item when you approve the workflow.</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                  </div>
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
                    Error parsing AI response.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            Select an email to review
          </div>
        )}
      </div>

      <style jsx>{`
        .ai-inbox-container {
          display: flex;
          height: 100%;
          width: 100%;
          overflow: hidden;
        }
        .ai-inbox-list {
          width: 350px;
          flex-shrink: 0;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          background: var(--surface);
          overflow-y: auto;
        }
        .ai-inbox-detail {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: var(--surface-alt);
          overflow-y: auto;
        }
        .ai-inbox-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        .ai-inbox-mobile-back {
          display: none;
        }
        @media (max-width: 768px) {
          .ai-inbox-container {
            flex-direction: column;
          }
          .ai-inbox-list {
            width: 100%;
            border-right: none;
          }
          .ai-inbox-list--hidden-mobile {
            display: none !important;
          }
          .ai-inbox-detail--hidden-mobile {
            display: none !important;
          }
          .ai-inbox-mobile-back {
            display: block;
          }
          .ai-inbox-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
