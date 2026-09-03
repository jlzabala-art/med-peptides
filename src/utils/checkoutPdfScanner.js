/**
 * Utility to load PDF.js dynamically from CDN and scan text content for catalogue products
 */
export const loadPdfJs = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('PDF.js can only be loaded in the browser environment'));
    }
    if (window.pdfjsLib) {
      resolve(window.pdfjsLib);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
      resolve(window.pdfjsLib);
    };
    script.onerror = (err) => {
      console.error('[loadPdfJs] Failed to load PDF.js script:', err);
      reject(err);
    };
    document.head.appendChild(script);
  });
};

/**
 * Searches a block of text for matched catalogue products and synonyms
 */
export const scanCatalogProducts = (text, productsList = []) => {
  const found = [];
  if (!text || !productsList || !productsList.length) return found;

  const textLower = text.toLowerCase();
  productsList.forEach(prod => {
    if (!prod || !prod.name) return;
    const nameLower = prod.name.toLowerCase();
    const isShort = nameLower.length <= 3;
    let matches = false;

    if (isShort) {
      const rx = new RegExp(`\\b${nameLower}\\b`, 'i');
      matches = rx.test(textLower);
    } else {
      matches = textLower.includes(nameLower);
    }

    if (!matches && prod.synonyms && Array.isArray(prod.synonyms)) {
      matches = prod.synonyms.some(syn => {
        const synLower = syn.toLowerCase();
        return synLower.length <= 3
          ? new RegExp(`\\b${synLower}\\b`, 'i').test(textLower)
          : textLower.includes(synLower);
      });
    }

    if (matches) {
      if (!found.some(f => f.id === prod.id || f.name === prod.name)) {
        found.push(prod);
      }
    }
  });

  return found;
};
