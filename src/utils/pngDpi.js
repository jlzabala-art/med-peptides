/**
 * src/utils/pngDpi.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Browsers' canvas.toBlob / toDataURL never write physical resolution metadata,
 * so every exported PNG is read as 72 DPI by Preview, Photoshop, Word and label
 * printer drivers — even when the pixel grid was rendered at 300/600/1200 DPI.
 *
 * This helper injects a standard PNG `pHYs` chunk (pixels per metre) right after
 * IHDR so the file's declared DPI matches the DPI selected in the Label Studio,
 * and the label prints at its true physical size (e.g. 75 × 45 mm).
 */

let CRC_TABLE = null;
function crcTable() {
  if (CRC_TABLE) return CRC_TABLE;
  CRC_TABLE = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    CRC_TABLE[n] = c >>> 0;
  }
  return CRC_TABLE;
}

function crc32(bytes) {
  const table = crcTable();
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) crc = table[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Returns a new PNG byte array with a pHYs chunk declaring `dpi`.
 * Any existing pHYs chunk is removed first.
 * @param {Uint8Array} png
 * @param {number} dpi
 * @returns {Uint8Array}
 */
export function setPngDpi(png, dpi) {
  const ppm = Math.round(dpi / 0.0254); // pixels per metre
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);

  // Collect chunks, skipping any existing pHYs
  const parts = [png.subarray(0, 8)]; // signature
  let offset = 8;
  let insertedAfterIhdr = false;
  const physChunk = new Uint8Array(4 + 4 + 9 + 4);
  const pv = new DataView(physChunk.buffer);
  pv.setUint32(0, 9);
  physChunk.set([0x70, 0x48, 0x59, 0x73], 4); // 'pHYs'
  pv.setUint32(8, ppm);
  pv.setUint32(12, ppm);
  physChunk[16] = 1; // unit: metre
  pv.setUint32(17, crc32(physChunk.subarray(4, 17)));

  while (offset < png.length) {
    const len = view.getUint32(offset);
    const type = String.fromCharCode(png[offset + 4], png[offset + 5], png[offset + 6], png[offset + 7]);
    const end = offset + 12 + len;
    if (type !== 'pHYs') parts.push(png.subarray(offset, end));
    if (type === 'IHDR' && !insertedAfterIhdr) {
      parts.push(physChunk);
      insertedAfterIhdr = true;
    }
    offset = end;
  }

  const total = parts.reduce((s, p) => s + p.length, 0);
  const out = new Uint8Array(total);
  let pos = 0;
  for (const p of parts) { out.set(p, pos); pos += p.length; }
  return out;
}

/**
 * Exports a canvas to a PNG Blob whose metadata declares the given DPI.
 * @param {HTMLCanvasElement} canvas
 * @param {number} dpi
 * @returns {Promise<Blob>}
 */
export async function canvasToPngBlobWithDpi(canvas, dpi) {
  const blob = await new Promise((resolve, reject) =>
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Canvas export failed'))), 'image/png')
  );
  const bytes = new Uint8Array(await blob.arrayBuffer());
  return new Blob([setPngDpi(bytes, dpi)], { type: 'image/png' });
}
