import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';

// Register fonts
Font.register({
  family: 'Inter',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiA.woff2',
      fontWeight: 600,
    },
    {
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2',
      fontWeight: 700,
    },
  ],
});

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Inter',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#0ea5e9',
    paddingBottom: 20,
    marginBottom: 20,
  },
  logoContainer: {
    flexDirection: 'column',
  },
  brandName: {
    fontSize: 24,
    fontWeight: 700,
    color: '#0f172a',
  },
  brandSub: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
  },
  docInfo: {
    alignItems: 'flex-end',
  },
  docType: {
    fontSize: 20,
    fontWeight: 600,
    color: '#0ea5e9',
  },
  docDate: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
    padding: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#0ea5e9',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: 120,
    fontSize: 10,
    fontWeight: 600,
    color: '#475569',
  },
  value: {
    flex: 1,
    fontSize: 10,
    color: '#0f172a',
  },
  patientBox: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 8,
    marginBottom: 24,
  },
  table: {
    width: '100%',
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  col1: { width: '35%', fontSize: 10, color: '#0f172a' },
  col2: { width: '25%', fontSize: 10, color: '#475569' },
  col3: { width: '40%', fontSize: 10, color: '#475569' },
  colHeader: { fontSize: 10, fontWeight: 600, color: '#0f172a' },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
});

// The Template Component
const ClinicalDocument = ({ data, type }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.brandName}>FAGRON</Text>
          <Text style={styles.brandSub}>Advanced Clinical Protocols</Text>
        </View>
        <View style={styles.docInfo}>
          <Text style={styles.docType}>
            {type === 'prescription' ? 'CLINICAL PRESCRIPTION' : 'CLINICAL PROTOCOL'}
          </Text>
          <Text style={styles.docDate}>{new Date().toLocaleDateString()}</Text>
        </View>
      </View>

      {/* PATIENT INFO (Only for prescriptions) */}
      {type === 'prescription' && data.patient && (
        <View style={styles.patientBox}>
          <View style={styles.row}>
            <Text style={styles.label}>Patient Name:</Text>
            <Text style={styles.value}>{data.patient.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date of Birth:</Text>
            <Text style={styles.value}>{data.patient.dob || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Medical ID:</Text>
            <Text style={styles.value}>{data.patient.id}</Text>
          </View>
        </View>
      )}

      {/* PROTOCOL/PRESCRIPTION DETAILS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Treatment Overview</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Protocol Name:</Text>
          <Text style={styles.value}>{data.protocol_name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Category:</Text>
          <Text style={styles.value}>{data.therapeutic_category || 'General'}</Text>
        </View>
        {data.description && (
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontSize: 10, color: '#475569', lineHeight: 1.5 }}>
              {data.description}
            </Text>
          </View>
        )}
      </View>

      {/* COMPOUNDS / PHASES */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Prescribed Compounds & Posology</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.col1, styles.colHeader]}>Compound</Text>
            <Text style={[styles.col2, styles.colHeader]}>Dosage</Text>
            <Text style={[styles.col3, styles.colHeader]}>Administration / Schedule</Text>
          </View>

          {(data.phases || []).map((phase, pIdx) => (
            <React.Fragment key={pIdx}>
              {/* Phase Header */}
              <View style={[styles.tableRow, { backgroundColor: '#f8fafc' }]}>
                <Text style={{ fontSize: 10, fontWeight: 600, color: '#0f172a' }}>
                  {phase.phase_name || `Phase ${pIdx + 1}`} ({phase.duration_weeks} weeks)
                </Text>
              </View>
              {/* Phase Items */}
              {(phase.compounds || []).map((c, cIdx) => (
                <View style={styles.tableRow} key={cIdx}>
                  <Text style={styles.col1}>{c.name}</Text>
                  <Text style={styles.col2}>{c.dosage}</Text>
                  <Text style={styles.col3}>{c.frequency || c.instructions}</Text>
                </View>
              ))}
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* INSTRUCTIONS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Clinical Instructions</Text>
        <Text style={{ fontSize: 10, color: '#475569', lineHeight: 1.5 }}>
          {data.instructions ||
            'Follow the prescribed dosage strictly. Do not exceed the recommended amount. If any adverse reactions occur, contact your physician immediately.'}
        </Text>
      </View>

      {/* FOOTER */}
      <Text style={styles.footer} fixed>
        Generated by Atlas Clinical System • Confidential Medical Document •{' '}
        {new Date().getFullYear()}
      </Text>
    </Page>
  </Document>
);

/**
 * Generates and triggers download of a PDF for a Protocol or Prescription
 * @param {Object} data The protocol or prescription data
 * @param {String} type 'protocol' | 'prescription'
 */
export const generateClinicalPdf = async (data, type = 'protocol') => {
  try {
    const blob = await pdf(<ClinicalDocument data={data} type={type} />).toBlob();
    const url = URL.createObjectURL(blob);

    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.href = url;
    const safeName = (data.protocol_name || 'document').toLowerCase().replace(/[^a-z0-9]/g, '_');
    link.download = `clinical_${type}_${safeName}.pdf`;

    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error generating Clinical PDF:', error);
    throw error;
  }
};
