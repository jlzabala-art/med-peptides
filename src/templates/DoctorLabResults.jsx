 
import DoctorNav from '../components/doctor/DoctorNav';
import styles from './DoctorLabResults.module.css';

export default function DoctorLabResults() {
  return (
    <div className={styles.container}>
      <DoctorNav menuKey="labs" />
      <section className={styles.content}>
        <h2>Resultados de Laboratorio</h2>
        <p>Listado de resultados de laboratorio para el doctor.</p>
        {/* TODO: Integrar API para cargar resultados */}
      </section>
    </div>
  );
}
