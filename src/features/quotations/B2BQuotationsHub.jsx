import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

import QuotationListPane from './QuotationListPane';
import QuotationWorkspace from './QuotationWorkspace';
import QuotationIntelligencePane from './QuotationIntelligencePane';
import QuotationMobileViews from './QuotationMobileViews';
import QuotationConvertWizard from './QuotationConvertWizard';
import ERPTriPaneLayout from '../../layout/ERPTriPaneLayout';

export default function B2BQuotationsHub() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'b2b_quotations'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuotes(data);
      if (data.length > 0) {
        setSelectedQuote(prev => {
          if (!prev && window.innerWidth >= 1024) return data[0];
          if (prev) return data.find(d => d.id === prev.id) || prev;
          return prev;
        });
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '3rem' }}>
        <div className="spinner"></div>
        <style>{`.spinner { width: 40px; height: 40px; border: 4px solid var(--border); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <ERPTriPaneLayout
        leftPaneWidth="430px"
        leftPane={
          <QuotationListPane 
            quotes={quotes} 
            selectedQuoteId={selectedQuote?.id} 
            onSelect={setSelectedQuote} 
            onCreateNew={() => {}}
          />
        }
        centerPane={
          selectedQuote ? (
            <QuotationWorkspace quote={selectedQuote} />
          ) : (
            <div style={{ margin: 'auto', marginTop: '5rem', color: '#94a3b8', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
              Select a quotation to view workspace
            </div>
          )
        }
        rightPane={
          selectedQuote && (
            <QuotationIntelligencePane 
              quote={selectedQuote} 
              onConvert={() => setShowWizard(true)}
            />
          )
        }
        mobileView={
          <QuotationMobileViews 
            quotes={quotes} 
            selectedQuote={selectedQuote} 
            onSelect={setSelectedQuote} 
          />
        }
      />

      {showWizard && selectedQuote && (
        <QuotationConvertWizard 
          quote={selectedQuote} 
          onClose={() => setShowWizard(false)} 
          onConfirm={() => {
            alert('Quotation converted to Sales Order!');
            setShowWizard(false);
          }} 
        />
      )}
    </>
  );
}