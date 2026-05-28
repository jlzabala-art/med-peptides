// src/skills/protocol_engine.js
/**
 * Protocol Engine Skill
 * --------------------
 * Responsibility: build, validate and render clinical protocols.
 * Functions:
 *   - assemblePhases(protocolSpec, products) -> Protocol object with phases populated
 *   - mapProductsToPhases(protocol, productLookup) -> Protocol with product references resolved
 *   - validateProtocol(protocol) -> throws on errors
 *   - renderPreview(protocol) -> React/HTML fragment for UI preview
 *   - exportPDF(protocol) -> Blob / Uint8Array representing PDF document
 */

/** Assemble phases from a raw spec */
export function assemblePhases(spec) {
  if (!spec || !Array.isArray(spec.phases)) throw new Error('Invalid protocol spec');
  const phases = spec.phases.map((p, idx) => ({
    phase_number: idx + 1,
    title: p.title || `Phase ${idx + 1}`,
    duration_weeks: p.duration_weeks || 0,
    products_used: p.products_used || [],
    notes: p.notes || ''
  }));
  return { ...spec, phases };
}

/** Resolve product references using a lookup map (sku → product) */
export function mapProductsToPhases(protocol, productLookup) {
  const enriched = { ...protocol };
  enriched.phases = protocol.phases.map(phase => {
    const resolved = phase.products_used.map(sku => productLookup[sku] || { sku, missing: true });
    return { ...phase, products_resolved: resolved };
  });
  return enriched;
}

/** Basic validation of a protocol object */
export function validateProtocol(protocol) {
  if (!protocol.title) throw new Error('Protocol must have a title');
  if (!Array.isArray(protocol.phases) || protocol.phases.length === 0) {
    throw new Error('Protocol must contain at least one phase');
  }
  // ensure each phase has duration and at least one product
  protocol.phases.forEach(p => {
    if (typeof p.duration_weeks !== 'number') throw new Error('Phase duration must be a number');
    if (!Array.isArray(p.products_used) || p.products_used.length === 0) {
      throw new Error(`Phase ${p.phase_number} must reference products`);
    }
  });
  return true;
}

/** Render a static HTML preview (can be adapted to React) */
export function renderPreview(protocol) {
  const phasesHtml = protocol.phases.map(p => `
    <div style="margin-bottom:1rem;">
      <h4>Phase ${p.phase_number}: ${p.title}</h4>
      <p>Duration: ${p.duration_weeks} weeks</p>
      <ul>
        ${p.products_used.map(sku => `<li>${sku}</li>`).join('\n')}
      </ul>
    </div>`).join('\n');
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;">
      <h2>${protocol.title}</h2>
      ${phasesHtml}
    </div>`;
}

/** Export protocol as PDF using a lightweight client‑side library (pdf-lib) */
export async function exportPDF(protocol) {
  // Note: pdf-lib must be installed in the project. This is a placeholder.
  const { PDFDocument, StandardFonts } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  const lines = [];
  lines.push(`Protocol: ${protocol.title}`);
  protocol.phases.forEach(p => {
    lines.push(`\nPhase ${p.phase_number}: ${p.title}`);
    lines.push(`Duration: ${p.duration_weeks} weeks`);
    lines.push('Products:');
    p.products_used.forEach(sku => lines.push(` - ${sku}`));
  });
  const text = lines.join('\n');
  page.drawText(text, { x: 50, y: height - 50, size: fontSize, font });
  const pdfBytes = await pdfDoc.save();
  return new Uint8Array(pdfBytes);
}

export const ProtocolEngine = {
  assemblePhases,
  mapProductsToPhases,
  validateProtocol,
  renderPreview,
  exportPDF
};
