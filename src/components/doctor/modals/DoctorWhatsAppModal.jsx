"use client";

import React, { useState } from 'react';
import { MessageCircle, X, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function DoctorWhatsAppModal({
  isOpen,
  onClose,
  doctor,
  prescriptions = [],
  onSendWhatsApp
}) {
  const [requestInfoSubject, setRequestInfoSubject] = useState('What is the pricing / quotation for this prescription?');
  const [requestInfoSelectedRx, setRequestInfoSelectedRx] = useState('');
  const [requestInfoNotes, setRequestInfoNotes] = useState('');

  if (!isOpen) return null;

  const handleSend = () => {
    const fullDetails = [
      requestInfoSelectedRx ? `Prescription Ref: ${requestInfoSelectedRx}` : '',
      requestInfoNotes ? `Notes: ${requestInfoNotes}` : ''
    ].filter(Boolean).join('\n');

    if (onSendWhatsApp) {
      onSendWhatsApp(requestInfoSubject, fullDetails);
    }
    onClose();
  };

  const handleCopy = () => {
    const text = `Physician: ${doctor?.name || 'Doctor'}\nTopic: ${requestInfoSubject}\n${requestInfoSelectedRx ? `Ref: ${requestInfoSelectedRx}\n` : ''}${requestInfoNotes ? `Notes: ${requestInfoNotes}\n` : ''}`;
    navigator.clipboard?.writeText(text);
    toast.success('Inquiry copied to clipboard ✓');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 70,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '580px',
          maxWidth: '100%',
          background: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 8px 28px rgba(32, 33, 36, 0.28)',
          overflow: 'hidden',
          border: '1px solid #dadce0',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          background: '#ffffff',
          borderBottom: '1px solid #dadce0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              background: '#e8f0fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <MessageCircle size={18} color="#1a73e8" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 600, color: '#202124' }}>
                Request Information & Clinical Support
              </h3>
              <div style={{ fontSize: '0.74rem', color: '#5f6368', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Atlas Medical & Scientific Affairs</span>
                <span>•</span>
                <span style={{ color: '#1a73e8', fontWeight: 500 }}>WhatsApp Concierge Liaison</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: '4px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#5f6368',
              cursor: 'pointer',
              transition: 'background 0.12s'
            }}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Doctor & Channel attribution banner */}
        <div style={{
          padding: '10px 20px',
          background: '#f8f9fa',
          borderBottom: '1px solid #e8eaed',
          fontSize: '0.76rem',
          color: '#3c4043',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '6px'
        }}>
          <span>Attributed Physician: <strong style={{ color: '#202124' }}>{doctor?.name || 'Physician'}</strong></span>
          <span>Liaison Channel: <strong style={{ color: '#137333' }}>Official WhatsApp (+971 55 356 1058)</strong></span>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Question Dropdown */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#5f6368', marginBottom: '6px' }}>
              Select Inquiry Type / Common Question:
            </label>
            <select
              value={requestInfoSubject}
              onChange={(e) => setRequestInfoSubject(e.target.value)}
              style={{
                width: '100%',
                height: '38px',
                padding: '0 12px',
                borderRadius: '4px',
                border: '1px solid #dadce0',
                fontSize: '0.82rem',
                color: '#202124',
                background: '#ffffff',
                outline: 'none',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              <optgroup label="Pricing & Quotations">
                <option value="What is the pricing / quotation for this prescription?">
                  Pricing & Quotation — What is the price for this prescription?
                </option>
              </optgroup>
              <optgroup label="Delivery & Logistics">
                <option value="What is the estimated delivery time to the patient?">
                  Delivery Lead Time — When will this reach the patient?
                </option>
                <option value="What is the current fulfillment & courier tracking status?">
                  Order Tracking — What is the current dispatch / courier status?
                </option>
              </optgroup>
              <optgroup label="Compounding & Raw Materials">
                <option value="Is this peptide / API in stock, or is an approved equivalent available?">
                  Stock Availability — Is this API / peptide in stock or backordered?
                </option>
                <option value="Can the vehicle, concentration, or administration form be customized?">
                  Custom Formulation — Can we adjust vehicle, dose, or format?
                </option>
              </optgroup>
              <optgroup label="Quality, Analytical & COA">
                <option value="Request Certificate of Analysis (COA) & batch purity report">
                  COA & Quality — Request HPLC Certificate of Analysis & purity specs
                </option>
              </optgroup>
              <optgroup label="Patient Refills & Renewals">
                <option value="Request repeat batch / prescription refill for this patient">
                  Prescription Refill — Request repeat batch or protocol renewal
                </option>
              </optgroup>
              <optgroup label="General Clinical Affairs">
                <option value="General clinical consultation or pharmacopeia question">
                  Other Clinical Inquiry — Specialized medical or administrative question
                </option>
              </optgroup>
            </select>

            {/* Quick Topic Shortcut Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              {[
                { label: 'Pricing & Quote', val: 'What is the pricing / quotation for this prescription?' },
                { label: 'Delivery Lead Time', val: 'What is the estimated delivery time to the patient?' },
                { label: 'Tracking Status', val: 'What is the current fulfillment & courier tracking status?' },
                { label: 'Stock / API Availability', val: 'Is this peptide / API in stock, or is an approved equivalent available?' }
              ].map((chip, cIdx) => {
                const isSelected = requestInfoSubject === chip.val;
                return (
                  <button
                    key={cIdx}
                    type="button"
                    onClick={() => setRequestInfoSubject(chip.val)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      border: isSelected ? '1px solid #1a73e8' : '1px solid #e0e0e0',
                      background: isSelected ? '#e8f0fe' : '#ffffff',
                      color: isSelected ? '#1a73e8' : '#5f6368',
                      fontSize: '0.72rem',
                      fontWeight: isSelected ? 600 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.12s'
                    }}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reference Prescription (Optional) */}
          {prescriptions.length > 0 && (
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#5f6368', marginBottom: '6px' }}>
                Reference Prescription (Optional):
              </label>
              <select
                value={requestInfoSelectedRx}
                onChange={(e) => setRequestInfoSelectedRx(e.target.value)}
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '0 10px',
                  borderRadius: '4px',
                  border: '1px solid #dadce0',
                  fontSize: '0.80rem',
                  color: '#202124',
                  background: '#ffffff',
                  outline: 'none'
                }}
              >
                <option value="">-- General Product / Pharmacopeia Question --</option>
                {prescriptions.slice(0, 20).map(p => (
                  <option key={p.id} value={`${p.id} - ${p.patientName} (${p.treatmentTitle || 'Formulation'})`}>
                    {p.id} · {p.patientName} · {p.treatmentTitle || 'Compounded Treatment'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Physician Clinical Notes / Specific Questions */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#5f6368', marginBottom: '6px' }}>
              Physician Clinical Notes / Specific Details:
            </label>
            <textarea
              rows={3}
              value={requestInfoNotes}
              onChange={(e) => setRequestInfoNotes(e.target.value)}
              placeholder="e.g., Inquiring regarding vehicle stability, courier transit time to Dubai / Abu Dhabi, or batch release certificate..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '4px',
                border: '1px solid #dadce0',
                fontSize: '0.80rem',
                color: '#202124',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none'
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={handleSend}
              style={{
                height: '42px',
                borderRadius: '4px',
                border: 'none',
                background: '#25D366',
                color: '#ffffff',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.12)'
              }}
            >
              <MessageCircle size={18} />
              <span>Send Inquiry via WhatsApp</span>
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  flex: 1,
                  height: '36px',
                  borderRadius: '4px',
                  border: '1px solid #dadce0',
                  background: '#ffffff',
                  color: '#3c4043',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Copy size={14} />
                <span>Copy Inquiry Text</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                style={{
                  height: '36px',
                  padding: '0 16px',
                  borderRadius: '4px',
                  border: '1px solid #dadce0',
                  background: '#ffffff',
                  color: '#5f6368',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
