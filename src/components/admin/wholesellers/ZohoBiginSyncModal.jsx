"use client";

import React, { useState } from 'react';
import Modal from '../../ui/Modal';
import { Search, Loader2, CheckCircle2, AlertCircle, Building2, User, Mail, Phone, ArrowRight } from 'lucide-react';
import { searchBiginWholesalersAction, importBiginWholesalerAction } from '@/actions/crmWholesalerActions';
import toast from 'react-hot-toast';

export default function ZohoBiginSyncModal({ isOpen, onClose, onWholesalerImported }) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [markup, setMarkup] = useState(20);
  const [currency, setCurrency] = useState('AED');
  const [isImporting, setIsImporting] = useState(false);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query || query.trim().length < 2) {
      toast.error('Enter at least 2 characters to search in Zoho Bigin');
      return;
    }

    setIsSearching(true);
    setResults([]);
    setSelectedContact(null);

    try {
      const res = await searchBiginWholesalersAction(query.trim());
      if (res.success) {
        setResults(res.contacts || []);
        setHasSearched(true);
      } else {
        toast.error(res.error || 'Failed to search Zoho Bigin');
      }
    } catch (err) {
      toast.error('Network error contacting Zoho Bigin');
    } finally {
      setIsSearching(false);
    }
  };

  const handleImport = async () => {
    if (!selectedContact) return;
    setIsImporting(true);

    try {
      const res = await importBiginWholesalerAction({
        contact: selectedContact,
        customMarkup: Number(markup) || 20,
        currency
      });

      if (res.success) {
        toast.success(`Wholesaler ${res.wholesaler.name} successfully imported!`);
        if (onWholesalerImported) onWholesalerImported(res.wholesaler);
        onClose();
      } else {
        toast.error(res.error || 'Failed to import wholesaler');
      }
    } catch (err) {
      toast.error('Unexpected error during import');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sync & Import from Zoho Bigin"
      maxWidth="600px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '4px 0' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
          Search existing contacts or companies in Zoho Bigin CRM to register them as wholesale distributors with active pricing and custom claims.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by contact name, company, email, or mobile..."
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--surface-alt)',
                color: 'var(--text-main)',
                fontSize: '0.85rem'
              }}
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="gcp-btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}
          >
            {isSearching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
            Search
          </button>
        </form>

        {/* Search Results */}
        {isSearching && (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
            <div style={{ fontSize: '0.82rem' }}>Querying Zoho Bigin Contacts...</div>
          </div>
        )}

        {!isSearching && hasSearched && results.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', background: 'var(--surface-alt)', borderRadius: '8px', border: '1px dashed var(--border)' }}>
            <AlertCircle size={20} color="#d97706" style={{ margin: '0 auto 6px' }} />
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>No matching records in Zoho Bigin</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>Check spelling or ensure the contact is registered in your Bigin CRM.</div>
          </div>
        )}

        {!isSearching && results.length > 0 && !selectedContact && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Select a Contact to Import ({results.length} found)
            </div>
            {results.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setSelectedContact(c);
                  if (c.phone?.startsWith('+34') || c.description?.toLowerCase().includes('spain')) {
                    setCurrency('EUR');
                  } else {
                    setCurrency('AED');
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                className="hover:border-sky-500 hover:bg-sky-50/20"
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>{c.name}</span>
                    {c.companyName && (
                      <span style={{ fontSize: '0.75rem', background: '#eff6ff', color: '#1e40af', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                        {c.companyName}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    {c.email && <span>✉️ {c.email}</span>}
                    {c.phone && <span>📞 {c.phone}</span>}
                  </div>
                </div>
                <ArrowRight size={16} color="var(--color-primary)" />
              </div>
            ))}
          </div>
        )}

        {/* Selected Contact Configuration */}
        {selectedContact && (
          <div style={{
            background: 'var(--surface-alt)',
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.70rem', fontWeight: 700, textTransform: 'uppercase', color: '#16a34a' }}>Selected for Import</span>
                <h4 style={{ margin: '2px 0 0', fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {selectedContact.name} {selectedContact.companyName ? `(${selectedContact.companyName})` : ''}
                </h4>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {selectedContact.email} • {selectedContact.phone || 'No phone'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedContact(null)}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Change
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Commercial Markup (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={markup}
                  onChange={(e) => setMarkup(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Default Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem'
                  }}
                >
                  <option value="AED">AED (United Arab Emirates)</option>
                  <option value="EUR">EUR (Spain / Europe)</option>
                  <option value="USD">USD (International)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={onClose}
                className="gcp-btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.82rem', borderRadius: '6px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isImporting}
                onClick={handleImport}
                className="gcp-btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.82rem', fontWeight: 700, borderRadius: '6px' }}
              >
                {isImporting ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                Import &amp; Create Wholesaler
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
