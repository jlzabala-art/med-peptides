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
    }, (error) => {
      console.error('Error fetching quotations:', error);
      setLoading(false);
      setQuotes([]); // Optional: clear quotes or set an error state
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* FULL WIDTH LIST */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <QuotationListPane 
          quotes={quotes} 
          selectedQuoteId={selectedQuote?.id} 
          onSelect={setSelectedQuote} 
          onCreateNew={() => {}}
        />
      </div>

      {/* DRAWER FOR WORKSPACE */}
      {selectedQuote && (
        <>
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 9998 }}
            onClick={() => setSelectedQuote(null)}
          />
          <div 
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width: '1200px', maxWidth: '100vw',
              backgroundColor: '#fff', zIndex: 9999, display: 'flex', flexDirection: 'column',
              boxShadow: '-4px 0 15px rgba(0,0,0,0.1)', overflow: 'hidden'
            }}
          >
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <QuotationWorkspace quote={selectedQuote} onClose={() => setSelectedQuote(null)} />
            </div>
          </div>
        </>
      )}

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
    </div>
  );
}