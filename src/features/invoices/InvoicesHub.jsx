import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

import InvoiceListPane from './InvoiceListPane';
import InvoiceWorkspace from './InvoiceWorkspace';
import InvoiceActionCenter from './InvoiceActionCenter';
import CfoDashboard from './CfoDashboard';
import InvoiceMobileViews from './InvoiceMobileViews';
import FinancialKPIHeader from './FinancialKPIHeader';

import ERPTriPaneLayout from '../../layout/ERPTriPaneLayout';

export default function InvoicesHub() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'b2b_invoices'), orderBy('createdAt', 'desc'), limit(100));
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setInvoices(docs);
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Financial Intelligence Center...</div>;

  return (
    <ERPTriPaneLayout
      leftPaneWidth="430px"
      topHeader={<FinancialKPIHeader invoices={invoices} />}
      leftPane={
        <InvoiceListPane 
          invoices={invoices} 
          selectedInvoiceId={selectedInvoice?.id} 
          onSelect={setSelectedInvoice} 
        />
      }
      centerPane={
        selectedInvoice ? <InvoiceWorkspace invoice={selectedInvoice} /> : <CfoDashboard invoices={invoices} />
      }
      rightPane={
        selectedInvoice ? <InvoiceActionCenter invoice={selectedInvoice} /> : <InvoiceActionCenter />
      }
      mobileView={
        <InvoiceMobileViews invoices={invoices} selectedInvoice={selectedInvoice} onSelect={setSelectedInvoice} />
      }
    />
  );
}
