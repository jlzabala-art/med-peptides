import About from '../../templates/About';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import { buildBilingualMetadata, normalizeMetaLang } from '@/utils/metadataHelper';

export async function generateMetadata({ searchParams }) {
  const resolvedSearch = await searchParams;
  const lang = normalizeMetaLang(resolvedSearch);

  return buildBilingualMetadata({
    lang,
    path: '/about',
    siteName: 'Atlas Health Services',
    en: {
      title: 'About Atlas Health | Clinical Peptide & Compounding Intelligence',
      description: 'Institutional mission, analytical quality standards (HPLC & cGMP), and medical governance behind Atlas Health Services.',
    },
    es: {
      title: 'Acerca de Atlas Health | Inteligencia Clínica en Péptidos y Formulación',
      description: 'Misión institucional, estándares de calidad analítica (HPLC y cGMP) y gobernanza médica de Atlas Health Services.',
    },
  });
}

export default function AboutPage() {
  return (
    <div className="atlas-page-bg">
      <PublicUnifiedHeader />
      <About />
      <PublicUnifiedFooter />
    </div>
  );
}
