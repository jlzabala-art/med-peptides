/**
 * publicVersionConfig.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Single Source of Truth (SSOT) for Public Page & Protocol Versioning.
 *
 * Golden Rule (User Directive):
 * "cada vez que se pase a produccion, una pagina publica, aumentar la version en un decimal.
 * Y que se vea en la pagina el cambio, Y lo mismo en los protocolos. Que sea un estilo homogeneo."
 *
 * Current Revision: v2.5 (Incremented from v2.4 upon production shipping)
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const PUBLIC_APP_VERSION = 'v2.5';
export const PUBLIC_DOC_REVISION = '2.5';
export const PUBLIC_RELEASE_DATE = 'September 20, 2026';
export const PUBLIC_RELEASE_DATE_ES = '20 Septiembre 2026';

/**
 * Returns formatted version metadata for clinical monographs, datasheets, and protocols
 */
export function getPublicVersionInfo(customVersion = null, updatedAt = null, lang = 'en') {
  let version = customVersion;
  if (!version || version === 'v2.4' || version === '2.4') {
    version = PUBLIC_APP_VERSION;
  } else {
    version = String(version).startsWith('v') ? version : `v${version}`;
  }

  const dateFormatted = updatedAt || (lang === 'es' ? PUBLIC_RELEASE_DATE_ES : PUBLIC_RELEASE_DATE);

  return {
    version,
    revision: version.replace(/^v/, ''),
    updatedAtDate: dateFormatted,
    label: `Rev ${version}`
  };
}
