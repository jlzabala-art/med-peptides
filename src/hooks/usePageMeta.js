import { useEffect } from 'react';
import { create } from 'zustand';

const BASE_TITLE = 'Atlas Health';
const BASE_URL = 'https://regenpept.com';
const DEFAULT_IMAGE = 'https://regenpept.com/og-premium.png';

export const useSEOStore = create((set) => ({
  meta: {
    title: BASE_TITLE,
    description: 'Premium Peptides, Supplements & Protocols',
    path: '',
    image: DEFAULT_IMAGE,
    structuredData: null
  },
  setMeta: (newMeta) => set({ meta: newMeta })
}));

export function usePageMeta({ title, description, path = '', image, structuredData } = {}) {
  const setMeta = useSEOStore(state => state.setMeta);

  useEffect(() => {
    const fullTitle = title ? `${title} | ${BASE_TITLE}` : `${BASE_TITLE} | Premium Peptides, Supplements & Protocols`;
    const canonical = `${BASE_URL}${path}`;

    setMeta({
      title: fullTitle,
      description: description || 'Premium Peptides, Supplements & Protocols',
      path: canonical,
      image: image || DEFAULT_IMAGE,
      structuredData: structuredData || null
    });

    return () => {
      // Optional: reset to defaults on unmount
      setMeta({
        title: `${BASE_TITLE} | Premium Peptides, Supplements & Protocols`,
        description: 'Premium Peptides, Supplements & Protocols',
        path: BASE_URL,
        image: DEFAULT_IMAGE,
        structuredData: null
      });
    };
  }, [title, description, path, image, JSON.stringify(structuredData)]);
}
