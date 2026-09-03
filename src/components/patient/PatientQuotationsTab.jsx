"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { subscribeToPatientQuotations } from '../../../services/patientTabsService';
import { useTransactionManager } from '../../../hooks/data/useTransactionManager';
import { toast } from 'react-hot-toast';

export default function PatientQuotationsTab() {
  const { user } = useAuth();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { convertQuotationToOrder, loading: converting } = useTransactionManager();

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToPatientQuotations(user.uid, (data) => {
      setQuotations(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAcceptQuotation = async (quotation) => {
    try {
      await convertQuotationToOrder({
        quotationDocId: quotation.id,
        paymentMethod: 'invoice', // or credit_card
        paymentOwnerId: user.uid,
        patientId: user.uid,
        shippingAddress: null, // User can input in a real flow
      });
      toast.success('Quotation accepted! Order created.');
    } catch (err) {
      toast.error('Failed to accept quotation: ' + err.message);
    }
  };

  if (loading) return <div className="p-4 text-white">Loading quotations...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">My Quotations</h2>
      {quotations.length === 0 ? (
        <div className="text-gray-400">You have no pending quotations.</div>
      ) : (
        <div className="space-y-4">
          {quotations.map(quote => (
            <div key={quote.id} className="bg-slate-800 border border-slate-700 p-4 rounded-lg text-white">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-bold text-lg">{quote.quoteId}</h3>
                  <p className="text-sm text-slate-400">Total: ${quote.total}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-bold"
                    onClick={() => handleAcceptQuotation(quote)}
                    disabled={converting}
                  >
                    Accept & Pay
                  </button>
                </div>
              </div>
              <div className="text-sm text-slate-400">
                <p>Items: {quote.items?.length || 0}</p>
                <p>Status: {quote.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
