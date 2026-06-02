 
import DoctorNav from '../components/doctor/DoctorNav';
import DocumentUploadWidget from '../components/admin/DocumentUploadWidget';
import styles from './DoctorLabResults.module.css';

export default function DoctorLabResults() {
  return (
    <div className={styles.container}>
      <DoctorNav menuKey="labs" />
      <section className={styles.content} style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Patient Lab Results</h2>
          <p style={{ color: 'var(--text-muted)' }}>Upload patient lab PDFs to extract biomarkers and auto-generate clinical protocols with Atlas.</p>
        </div>
        
        <DocumentUploadWidget 
          title="Upload Patient Labs (PDF)"
          description="Drag and drop a PDF lab report here. Atlas will analyze the biomarkers."
          accept=".pdf"
          defaultDocumentType="LAB_RESULT"
        />
      </section>
    </div>
  );
}
