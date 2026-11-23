/**
 * vectorPdfEngine.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure 100% vector SVG-to-PDF rendering engine using svg2pdf.js + jsPDF.
 * Ensures infinite zoom crispness for typography, borders, vector icons, and QR codes
 * without rasterizing to PNG bitmaps (unless an unexpected fallback is required).
 */

const _fontBase64Cache = new Map();

/**
 * Loads a TTF font from a URL (cached in memory as base64) and registers it into
 * jsPDF's VFS so svg2pdf.js can render custom brand typography as embedded vector fonts.
 */
export async function registerCustomVectorFonts(pdf, customFonts = []) {
  if (!pdf || !Array.isArray(customFonts) || customFonts.length === 0) return [];
  const registered = [];

  for (const f of customFonts) {
    if (!f?.url || !f?.family) continue;
    try {
      let base64 = _fontBase64Cache.get(f.url);
      if (!base64) {
        const res = await fetch(f.url);
        if (!res.ok) continue;
        const buf = await res.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        base64 = btoa(binary);
        _fontBase64Cache.set(f.url, base64);
      }
      const vfsName = f.vfsName || `${f.family}-${f.style || 'normal'}.ttf`;
      pdf.addFileToVFS(vfsName, base64);
      pdf.addFont(vfsName, f.family, f.style || 'normal');
      registered.push(f.family);
    } catch (err) {
      console.warn(`[vectorPdfEngine] Could not load custom font ${f.url}:`, err);
    }
  }
  return registered;
}

/**
 * Normalizes a cloned SVG DOM node so svg2pdf.js renders it with exact vector
 * geometry, PDF-native font weights, and no emoji/percentage-dimension glitches.
 */
export function prepareSvgForVectorPdf(svgEl, { customSansFamily = null, customSerifFamily = null } = {}) {
  const clonedSvg = svgEl.cloneNode(true);

  if (!clonedSvg.getAttribute('xmlns')) {
    clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }

  // svg2pdf.js requires explicit numeric width/height (not "100%") to compute viewBox scale accurately
  const viewBox = clonedSvg.getAttribute('viewBox');
  if (viewBox) {
    const parts = viewBox.trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
      clonedSvg.setAttribute('width', String(parts[2]));
      clonedSvg.setAttribute('height', String(parts[3]));
    }
  }

  // Strip CSS border-radius / display styles that aren't needed in PDF
  clonedSvg.style.borderRadius = '0';

  // Normalize text nodes & font attributes for crisp jsPDF vector font mapping
  const textNodes = clonedSvg.querySelectorAll('text, tspan');
  textNodes.forEach((node) => {
    const ff = (node.getAttribute('font-family') || '').toLowerCase();
    if (ff.includes('georgia') || ff.includes('times') || ff.includes('serif')) {
      if (!ff.includes('sans-serif')) {
        node.setAttribute('font-family', customSerifFamily || 'Times');
      } else {
        node.setAttribute('font-family', customSansFamily || 'Helvetica');
      }
    } else if (ff) {
      node.setAttribute('font-family', customSansFamily || 'Helvetica');
    }

    // jsPDF standard fonts support "normal" and "bold" (not numeric 800/900)
    const fw = node.getAttribute('font-weight');
    if (fw) {
      const num = parseInt(fw, 10);
      if (!Number.isNaN(num)) {
        node.setAttribute('font-weight', num >= 600 ? 'bold' : 'normal');
      }
    }
  });

  // Remove Unicode color emojis from <text>/<tspan> (VectorGlyph already renders crisp vector icons)
  const walker = document.createTreeWalker(clonedSvg, NodeFilter.SHOW_TEXT);
  let textNode;
  while ((textNode = walker.nextNode())) {
    if (textNode.nodeValue) {
      textNode.nodeValue = textNode.nodeValue
        .replace(/(?:☀️|🌙|🌅|🏷️|📦|🔄|⚠️)/g, '')
        .replace(/✔/g, '+')
        .replace(/\s*·\s*·\s*/g, ' · ');
    }
  }

  return clonedSvg;
}

/**
 * Fallback high-DPI PNG rasterizer used ONLY if native svg2pdf throws on an edge case.
 */
export async function rasterizeSvgToImageData(svgEl, widthMm, heightMm, targetDpi = 600) {
  const widthPx = Math.round((widthMm / 25.4) * targetDpi);
  const heightPx = Math.round((heightMm / 25.4) * targetDpi);

  const clonedSvg = svgEl.cloneNode(true);
  if (!clonedSvg.getAttribute('xmlns')) {
    clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }
  clonedSvg.setAttribute('width', `${widthPx}px`);
  clonedSvg.setAttribute('height', `${heightPx}px`);

  const svgXml = new XMLSerializer().serializeToString(clonedSvg);
  const svgBlob = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = widthPx;
        canvas.height = heightPx;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, widthPx, heightPx);
        ctx.drawImage(img, 0, 0, widthPx, heightPx);
        URL.revokeObjectURL(svgUrl);
        resolve(canvas.toDataURL('image/png', 1.0));
      } catch (err) {
        URL.revokeObjectURL(svgUrl);
        reject(err);
      }
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(svgUrl);
      reject(err);
    };
    img.src = svgUrl;
  });
}

/**
 * Renders an SVG DOM element directly into a jsPDF instance as pure vector graphics.
 * Falls back to 600 DPI PNG raster only if svg2pdf fails.
 */
export async function renderSvgToPdfVector(svgEl, pdf, { x = 0, y = 0, width, height, fallbackDpi = 600, customFonts = [] }) {
  if (!svgEl || !pdf) return { vector: false };

  try {
    const { svg2pdf } = await import('svg2pdf.js');
    const registered = await registerCustomVectorFonts(pdf, customFonts);
    const customSansFamily = registered[0] || null;
    const preparedSvg = prepareSvgForVectorPdf(svgEl, { customSansFamily });
    await svg2pdf(preparedSvg, pdf, { x, y, width, height });
    return { vector: true };
  } catch (vecErr) {
    console.warn('[vectorPdfEngine] Native svg2pdf failed, falling back to high-DPI raster:', vecErr);
    const imgData = await rasterizeSvgToImageData(svgEl, width, height, fallbackDpi);
    pdf.addImage(imgData, 'PNG', x, y, width, height, undefined, 'SLOW');
    return { vector: false };
  }
}
