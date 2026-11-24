export const COUNTRY_DIAL_CODES = [
  { code: '+971', iso: 'AE', flag: '🇦🇪', name: 'UAE', aliases: ['uae', 'ae', 'united arab emirates', 'dubai', 'abu dhabi'] },
  { code: '+34', iso: 'ES', flag: '🇪🇸', name: 'Spain', aliases: ['es', 'spain', 'españa', 'espana'] },
  { code: '+1', iso: 'US', flag: '🇺🇸', name: 'US / CA', aliases: ['us', 'usa', 'united states', 'ca', 'canada'] },
  { code: '+44', iso: 'GB', flag: '🇬🇧', name: 'UK', aliases: ['gb', 'uk', 'united kingdom', 'england'] },
  { code: '+966', iso: 'SA', flag: '🇸🇦', name: 'Saudi Arabia', aliases: ['sa', 'ksa', 'saudi', 'saudi arabia'] },
  { code: '+974', iso: 'QA', flag: '🇶🇦', name: 'Qatar', aliases: ['qa', 'qatar'] },
  { code: '+965', iso: 'KW', flag: '🇰🇼', name: 'Kuwait', aliases: ['kw', 'kuwait'] },
  { code: '+973', iso: 'BH', flag: '🇧🇭', name: 'Bahrain', aliases: ['bh', 'bahrain'] },
  { code: '+968', iso: 'OM', flag: '🇴🇲', name: 'Oman', aliases: ['om', 'oman'] },
  { code: '+49', iso: 'DE', flag: '🇩🇪', name: 'Germany', aliases: ['de', 'germany', 'deutschland'] },
  { code: '+33', iso: 'FR', flag: '🇫🇷', name: 'France', aliases: ['fr', 'france'] },
  { code: '+39', iso: 'IT', flag: '🇮🇹', name: 'Italy', aliases: ['it', 'italy', 'italia'] },
  { code: '+351', iso: 'PT', flag: '🇵🇹', name: 'Portugal', aliases: ['pt', 'portugal'] },
  { code: '+41', iso: 'CH', flag: '🇨🇭', name: 'Switzerland', aliases: ['ch', 'switzerland'] },
  { code: '+31', iso: 'NL', flag: '🇳🇱', name: 'Netherlands', aliases: ['nl', 'netherlands'] },
  { code: '+52', iso: 'MX', flag: '🇲🇽', name: 'Mexico', aliases: ['mx', 'mexico', 'méxico'] },
  { code: '+57', iso: 'CO', flag: '🇨🇴', name: 'Colombia', aliases: ['co', 'colombia'] },
  { code: '+54', iso: 'AR', flag: '🇦🇷', name: 'Argentina', aliases: ['ar', 'argentina'] },
  { code: '+56', iso: 'CL', flag: '🇨🇱', name: 'Chile', aliases: ['cl', 'chile'] },
  { code: '+55', iso: 'BR', flag: '🇧🇷', name: 'Brazil', aliases: ['br', 'brazil', 'brasil'] },
  { code: '+91', iso: 'IN', flag: '🇮🇳', name: 'India', aliases: ['in', 'india'] },
  { code: '+61', iso: 'AU', flag: '🇦🇺', name: 'Australia', aliases: ['au', 'australia'] },
];

const SORTED_DIAL_CODES = [...COUNTRY_DIAL_CODES].sort((a, b) => b.code.length - a.code.length);
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function resolveInitialPhoneState(rawPhone = '', rawCountry = '') {
  const trimmed = String(rawPhone || '').trim();
  if (trimmed) {
    const normalized = trimmed.replace(/[\s()-]/g, '');
    const withPlus = normalized.startsWith('00') ? `+${normalized.slice(2)}` : normalized;
    if (withPlus.startsWith('+')) {
      const match = SORTED_DIAL_CODES.find((c) => withPlus.startsWith(c.code));
      if (match) {
        return {
          dialCode: match.code,
          digits: withPlus.slice(match.code.length).replace(/\D/g, '').slice(0, 15),
        };
      }
    }
    const onlyDigits = trimmed.replace(/\D/g, '').slice(0, 15);
    if (onlyDigits) {
      return { dialCode: '+971', digits: onlyDigits };
    }
  }

  const cNorm = String(rawCountry || '').trim().toLowerCase();
  if (cNorm) {
    const byCountry = COUNTRY_DIAL_CODES.find((c) => c.aliases.includes(cNorm));
    if (byCountry) {
      return { dialCode: byCountry.code, digits: '' };
    }
  }

  return { dialCode: '+971', digits: '' };
}
