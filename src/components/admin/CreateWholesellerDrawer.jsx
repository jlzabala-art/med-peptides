import React, { useState } from 'react';
import { X, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { getAllCountries, getZonesForCountry } from '../../data/geographyZones';

export default function CreateWholesellerDrawer({ onClose, onSuccess }) {
  const [searchEmail, setSearchEmail] = useState('');
  const [isSearchingBigin, setIsSearchingBigin] = useState(false);
  const [biginResults, setBiginResults] = useState([]);
  const [selectedBiginContact, setSelectedBiginContact] = useState(null);

  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState('distributor');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedZones, setSelectedZones] = useState([]);

  const countries = getAllCountries();
  const availableZones = selectedCountry ? getZonesForCountry(selectedCountry) : null;

  const handleSearchBigin = async () => {
    if (!searchEmail) return;
    setIsSearchingBigin(true);
    setBiginResults([]);
    setSelectedBiginContact(null);
    
    try {
      // Mocking the call to Firebase Function / Zoho API
      // In production, this would be: await httpsCallable(functions, 'searchZohoBigin')({ email: searchEmail });
      await new Promise(r => setTimeout(r, 1500));
      
      // Mock results
      const mockResults = [
        { id: 'zoho_101', name: 'Acme Corp', email: searchEmail, phone: '+1 555-0198', address: '123 Business Rd' },
        { id: 'zoho_102', name: 'Acme Global', email: searchEmail, phone: '+1 555-0199', address: '456 Global Ave' }
      ];
      setBiginResults(mockResults);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearchingBigin(false);
    }
  };

  const handleSelectBigin = (contact) => {
    setSelectedBiginContact(contact);
    setCompanyName(contact.name || '');
    setBiginResults([]);
  };

  const handleZoneToggle = (zone) => {
    setSelectedZones(prev => 
      prev.includes(zone) ? prev.filter(z => z !== zone) : [...prev, zone]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      companyName,
      type: businessType,
      email: searchEmail,
      zohoContactId: selectedBiginContact ? selectedBiginContact.id : null,
      zohoSyncStatus: !!selectedBiginContact,
      country: selectedCountry,
      zones: selectedZones
    };
    onSuccess(payload);
  };

  return (
    <div
      className="drawer-overlay"
      onClick={onClose}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
        display: 'flex', justifyContent: 'flex-end',
      }}
    >
      <div
        className="drawer-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '500px', backgroundColor: 'var(--color-bg-surface)', height: '100%',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column',
        }}
      >
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Create New Wholeseller</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
        </div>
        
        <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
          <form id="create-ws-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Zoho Bigin Integration Section */}
            <div style={{ backgroundColor: 'var(--color-bg-app)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Zoho Bigin Sync (Source of Truth)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="Enter contact email..."
                  className="app-input"
                  style={{ flex: 1, padding: '0.75rem' }}
                />
                <button 
                  type="button"
                  onClick={handleSearchBigin}
                  disabled={isSearchingBigin || !searchEmail}
                  className="btn btn-outline"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Search size={16} /> {isSearchingBigin ? 'Searching...' : 'Search Zoho'}
                </button>
              </div>

              {biginResults.length > 0 && (
                <div style={{ marginTop: '1rem', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--color-bg-hover)', fontSize: '0.8rem', fontWeight: 600 }}>
                    Select matching contact:
                  </div>
                  {biginResults.map(contact => (
                    <div 
                      key={contact.id} 
                      onClick={() => handleSelectBigin(contact)}
                      style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                    >
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{contact.name}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{contact.email} | {contact.phone}</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedBiginContact && (
                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontSize: '0.85rem', fontWeight: 500 }}>
                  <CheckCircle2 size={16} /> Synced with Zoho Bigin ({selectedBiginContact.name})
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Company Name *
              </label>
              <input
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="app-input"
                style={{ width: '100%', padding: '0.75rem' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Business Type
              </label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="app-input"
                style={{ width: '100%', padding: '0.75rem' }}
              >
                <option value="distributor">Regional Distributor</option>
                <option value="clinic_network">Clinic Network</option>
                <option value="pharmacy">Pharmacy Chain</option>
              </select>
            </div>
            
            {/* Geography Assignment */}
            <div style={{ backgroundColor: 'var(--color-bg-app)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
               <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Territory Assignment
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  setSelectedZones([]); // Reset zones when country changes
                }}
                className="app-input"
                style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem' }}
              >
                <option value="">Select a Country...</option>
                {countries.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              {availableZones && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Select specific zones/regions (optional):
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px', backgroundColor: 'var(--color-bg-surface)' }}>
                    {availableZones.map(zone => (
                      <label key={zone} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={selectedZones.includes(zone)}
                          onChange={() => handleZoneToggle(zone)}
                        />
                        {zone}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </form>
        </div>
        
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="create-ws-form" className="btn btn-primary" disabled={!companyName}>
            Create Organization
          </button>
        </div>
      </div>
    </div>
  );
}
