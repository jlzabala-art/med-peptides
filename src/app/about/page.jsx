import About from '../../templates/About';

export const revalidate = 86400; // 24h CDN static cache

export default function AboutPage() {
  return <About />;
}
