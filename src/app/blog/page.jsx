import React from 'react';
import BlogPage from '../../templates/BlogPage';

export const revalidate = 3600; // 1-hour ISR cache

export const metadata = {
  title: 'Physiological Optimization Academy — Scientific Insights & Protocols | Atlas Health',
  description: 'Explore peer-reviewed scientific articles, clinical mechanisms, and precision peptide insights across recovery, longevity, and metabolic health.',
  alternates: {
    canonical: 'https://www.atlashealth-services.com/blog',
  },
  openGraph: {
    title: 'Physiological Optimization Academy | Atlas Health',
    description: 'Peer-reviewed articles, clinical mechanisms, and peptide therapeutic protocols.',
    url: 'https://www.atlashealth-services.com/blog',
    siteName: 'Atlas Health',
    type: 'website',
  },
};

export default function BlogIndex() {
  return <BlogPage />;
}
