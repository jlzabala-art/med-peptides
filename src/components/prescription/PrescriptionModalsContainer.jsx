"use client";

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal';
import PharmacyLabelsModal from '@/components/prescription/PharmacyLabelsModal';
import PrescriptionBrochureModal from '@/components/prescription/PrescriptionBrochureModal';
import RequestAtlasQuotationModal from '@/features/prescriptions/components/RequestAtlasQuotationModal';
import DoctorRxSwitcherModal from '@/components/prescription/DoctorRxSwitcherModal';
import PatientRxSwitcherModal from '@/components/prescription/PatientRxSwitcherModal';

/**
 * PrescriptionModalsContainer
 * 
 * Centralized container for all interactive modals associated with a prescription:
 * QR Code Lightbox, Document Preview, Pharmacy Labels, Brochure Preview,
 * Atlas Quotation, Doctor Rx Switcher, and Patient Rx Switcher.
 */
export default function PrescriptionModalsContainer({
  rx,
  rxId,
  isEs = false,
  lang = 'en',
  isPatientView = false,
  patient = {},
  patientName = '',
  doctorName = '',
  compoundedFormulations = [],
  genomicsData = null,
  currentStatus = 'approved',
  publicUrl = '',
  patientPublicUrl = '',
  prescriptionLabels = [],
  showQrModal = false,
  setShowQrModal,
  handleDownloadQrPng,
  previewDoc = null,
  setPreviewDoc,
  showLabelsModal = false,
  setShowLabelsModal,
  selectedLabelIndex = 0,
  setSelectedLabelIndex,
  showBrochureModal = false,
  setShowBrochureModal,
  showAtlasQuotationModal = false,
  setShowAtlasQuotationModal,
  showRxSwitcherModal = false,
  setShowRxSwitcherModal,
  showPatientRxModal = false,
  setShowPatientRxModal
}) {
  return (
    <>
      {/* Lightbox QR Modal */}
      {showQrModal && (
        <div 
          onClick={() => setShowQrModal && setShowQrModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            padding: '1rem'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '2rem',
              maxWidth: 380,
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem', color: '#0f172a', fontWeight: 800, fontSize: '1.1rem' }}>
              {isEs ? 'Código QR de Prescripción' : 'Prescription QR Code'}
            </h3>
            <p style={{ margin: '0 0 1.5rem', color: '#64748b', fontSize: '0.8rem' }}>
              {rxId} · {patientName}
            </p>
            
            <div style={{
              padding: '16px',
              background: '#ffffff',
              borderRadius: '16px',
              display: 'inline-block',
              border: '2px solid #e2e8f0',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
            }}>
              <QRCodeSVG 
                value={publicUrl}
                size={220}
                level="H"
                includeMargin={false}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={handleDownloadQrPng}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  borderRadius: '10px',
                  background: '#0284c7',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {isEs ? 'Descargar PNG' : 'Download PNG'}
              </button>
              <button
                type="button"
                onClick={() => setShowQrModal && setShowQrModal(false)}
                style={{
                  padding: '0.65rem 1rem',
                  borderRadius: '10px',
                  background: '#f1f5f9',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {isEs ? 'Cerrar' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Full Modal */}
      {previewDoc && (
        <DocumentPreviewModal 
          url={previewDoc.url}
          name={previewDoc.title || previewDoc.name}
          onClose={() => setPreviewDoc && setPreviewDoc(null)}
        />
      )}

      {/* Official Compounding Bottle Labels Modal (7.5 x 4.5 cm) */}
      <PharmacyLabelsModal
        isOpen={showLabelsModal}
        onClose={() => setShowLabelsModal && setShowLabelsModal(false)}
        labels={prescriptionLabels}
        initialLabelIndex={selectedLabelIndex}
        isEs={isEs}
      />

      {/* Official Clinical & Patient Brochure Live Preview Modal */}
      <PrescriptionBrochureModal
        isOpen={showBrochureModal}
        onClose={() => setShowBrochureModal && setShowBrochureModal(false)}
        rx={rx}
        compoundedFormulations={compoundedFormulations}
        genomicsData={genomicsData}
        currentStatus={currentStatus}
        isPatientView={isPatientView}
        publicUrl={publicUrl}
        patientPublicUrl={patientPublicUrl}
        onOpenLabels={() => {
          if (setSelectedLabelIndex) setSelectedLabelIndex(0);
          if (setShowLabelsModal) setShowLabelsModal(true);
        }}
      />

      {/* Request to Atlas Quotation Modal */}
      <RequestAtlasQuotationModal
        rx={rx}
        isOpen={showAtlasQuotationModal}
        onClose={() => setShowAtlasQuotationModal && setShowAtlasQuotationModal(false)}
      />

      {/* Doctor Prescriptions Switcher Modal (doctor view only) */}
      {!isPatientView && (
        <DoctorRxSwitcherModal
          isOpen={showRxSwitcherModal}
          onClose={() => setShowRxSwitcherModal && setShowRxSwitcherModal(false)}
          currentRx={rx}
          currentRxId={rxId}
          doctorName={doctorName}
          lang={lang}
        />
      )}

      {/* Patient Prescriptions Switcher Modal (patient view only - cross-physician record) */}
      {isPatientView && (
        <PatientRxSwitcherModal
          isOpen={showPatientRxModal}
          onClose={() => setShowPatientRxModal && setShowPatientRxModal(false)}
          currentRx={rx}
          currentRxId={rxId}
          patientName={patientName}
          patientId={rx.patientId || patient?.id}
          patientPhone={patient?.phone}
          patientEmail={patient?.email}
          lang={lang}
          onOpenBrochure={() => setShowBrochureModal && setShowBrochureModal(true)}
          onRequestRefill={() => setShowAtlasQuotationModal && setShowAtlasQuotationModal(true)}
        />
      )}
    </>
  );
}
