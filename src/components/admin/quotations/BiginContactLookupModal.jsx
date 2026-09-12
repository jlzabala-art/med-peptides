"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Mail, Phone, MapPin, Clock, CheckCircle, RefreshCw, X, Building2, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { searchBiginContactAction, applyBiginDataToQuotationAction } from '../../../actions/quotationsActions';
import notifier from '../../../services/NotificationService';
import { useDrawer } from '../../../context/DrawerContext';

export default function BiginContactLookupModal({
  isOpen,
  onClose,
  quotation = null, // If provided, allows applying data directly to this quotation
  onContactSelected = null, // Optional callback: fn(contact)
  onSuccess = null // Optional callback on successful quotation update
}) {
  const { openDrawer } = useDrawer();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [searched, setSearched] = useState(false);
  const [foundContact, setFoundContact] = useState(null);
  const [resultsList, setResultsList] = useState([]);

  // Pre-fill fields if quotation is provided
  useEffect(() => {
    if (isOpen) {
      if (quotation) {
        setName(quotation.clientName || quotation.patientName || '');
        setEmail(quotation.patientEmail || quotation.recipientEmail || quotation.contactEmail || '');
        setPhone(quotation.patientPhone || quotation.contactPhone || '');
      }
      setSearched(false);
      setFoundContact(null);
      setResultsList([]);
    }
  }, [isOpen, quotation]);

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!name.trim() && !email.trim() && !phone.trim()) {
      notifier.info("Introduce al menos un nombre, email o teléfono para buscar en Bigin.");
      return;
    }

    setLoading(true);
    setSearched(true);
    setFoundContact(null);
    setResultsList([]);

    try {
      const res = await searchBiginContactAction({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim()
      });

      if (!res.success) {
        notifier.error(res.error || "Error al buscar en Bigin");
        return;
      }

      if (res.found && res.contact) {
        setFoundContact(res.contact);
        setResultsList(res.contacts || [res.contact]);
        notifier.success(`¡Contacto encontrado en Bigin: ${res.contact.name}!`);
      } else {
        notifier.info(res.message || "No se encontraron contactos en Bigin.");
      }
    } catch (err) {
      notifier.error(err.message || "Fallo en la conexión con Bigin");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToQuotation = async (contactToApply) => {
    const target = contactToApply || foundContact;
    if (!target) return;

    if (onContactSelected) {
      onContactSelected(target);
      onClose();
      return;
    }

    if (!quotation?.id) {
      // If no quotation active, offer to create a new quotation with these details
      onClose();
      window.dispatchEvent(new CustomEvent('open-quotation-wizard', {
        detail: {
          type: 'patient',
          patientName: target.name,
          patientEmail: target.email,
          patientPhone: target.phone,
          shippingAddress: target.shippingAddress,
          deliveryInstructions: target.deliveryInstructions,
          biginContactId: target.id
        }
      }));
      notifier.success(`Iniciando cotización para ${target.name} con datos de Bigin`);
      return;
    }

    setApplying(true);
    try {
      const res = await applyBiginDataToQuotationAction(quotation.id, target);
      if (res.success) {
        notifier.success(`✅ Datos de Bigin sincronizados en la cotización #${quotation.quotationNumber || quotation.id}`);
        if (onSuccess) onSuccess(target);
        onClose();
      }
    } catch (err) {
      notifier.error(err.message || "Error al aplicar datos a la cotización");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(5px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '540px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Building2 size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                Cargar Datos desde Zoho Bigin
              </h3>
              <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b' }}>
                {quotation ? `Sincronizar cliente para cotización #${quotation.quotationNumber || quotation.id}` : 'Buscar contactos en CRM por nombre, email o teléfono'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.4 }}>
            Introduce cualquiera de los datos que tengas disponibles. Buscaremos automáticamente coincidencias en <strong>Zoho Bigin</strong> para cargar la dirección de entrega, teléfono e instrucciones de mensajería.
          </p>

          <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Input Name */}
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>
                Nombre / Apellido
              </label>
              <div style={{ position: 'relative' }}>
                <User size={15} color="#94a3b8" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Ej. Rubén Ruano"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '8px 12px 8px 32px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.86rem',
                    color: '#0f172a'
                  }}
                />
              </div>
            </div>

            {/* Input Email */}
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>
                Correo Electrónico
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="#94a3b8" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  placeholder="Ej. ruben@rubenruano.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '8px 12px 8px 32px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.86rem',
                    color: '#0f172a'
                  }}
                />
              </div>
            </div>

            {/* Input Phone */}
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>
                Teléfono / Móvil
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={15} color="#94a3b8" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Ej. +34 637316102"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '8px 12px 8px 32px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.86rem',
                    color: '#0f172a'
                  }}
                />
              </div>
            </div>

            {/* Submit Search Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1rem',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'background 0.2s'
              }}
            >
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
              {loading ? 'Consultando Zoho Bigin...' : 'Buscar en Bigin'}
            </button>
          </form>

          {/* Results Display */}
          {searched && !loading && (
            <div style={{ marginTop: '0.5rem' }}>
              {foundContact ? (
                <div style={{
                  background: '#f0fdf4',
                  border: '1.5px solid #86efac',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#166534' }}>
                        {foundContact.name}
                      </div>
                      {foundContact.company && (
                        <div style={{ fontSize: '0.76rem', color: '#15803d', fontWeight: 600 }}>
                          🏢 {foundContact.company}
                        </div>
                      )}
                    </div>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      background: '#dcfce7',
                      color: '#166534',
                      padding: '2px 8px',
                      borderRadius: 6
                    }}>
                      <ShieldCheck size={12} /> Bigin CRM
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.80rem', color: '#14532d' }}>
                    {foundContact.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Mail size={13} color="#15803d" />
                        <span>{foundContact.email}</span>
                      </div>
                    )}
                    {foundContact.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Phone size={13} color="#15803d" />
                        <span>{foundContact.phone}</span>
                      </div>
                    )}
                    {foundContact.shippingAddress?.formatted && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                        <MapPin size={13} color="#15803d" style={{ marginTop: 2, flexShrink: 0 }} />
                        <span>{foundContact.shippingAddress.formatted}</span>
                      </div>
                    )}
                    {foundContact.deliveryInstructions && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, background: '#ffffff', padding: '6px 10px', borderRadius: 6, border: '1px solid #bbf7d0', marginTop: 4 }}>
                        <Clock size={13} color="#d97706" style={{ marginTop: 2, flexShrink: 0 }} />
                        <span style={{ fontSize: '0.74rem', color: '#78350f', fontWeight: 500 }}>
                          {foundContact.deliveryInstructions}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Apply Button */}
                  <button
                    type="button"
                    disabled={applying}
                    onClick={() => handleApplyToQuotation(foundContact)}
                    style={{
                      marginTop: '0.35rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.65rem 1rem',
                      background: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.86rem',
                      fontWeight: 800,
                      cursor: applying ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {applying ? <RefreshCw size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                    {applying ? 'Aplicando a cotización...' : (quotation ? 'Aplicar Datos a esta Cotización' : 'Usar Datos para Nueva Cotización')}
                  </button>
                </div>
              ) : (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '10px',
                  padding: '1rem',
                  textAlign: 'center',
                  fontSize: '0.84rem',
                  color: '#991b1b'
                }}>
                  No se encontró ningún contacto con esos criterios en Zoho Bigin. Prueba con otro apellido, correo o teléfono.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '0.9rem 1.5rem',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'flex-end',
          background: '#f8fafc'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
