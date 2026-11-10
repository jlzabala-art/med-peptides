

export function formatDateDisplay(dateStr, lang = 'en') {
  if (!dateStr || dateStr === '—') return '—';
  try {
    const parts = String(dateStr).split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parts[2];
      const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthsEs = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const monthList = lang === 'es' ? monthsEs : monthsEn;
      const monthName = monthList[monthIdx] || parts[1];
      return `${day} ${monthName} ${year}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export function formatCycleStart(iso, lang) {
  const d = new Date(`${iso || '2026-11-01'}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
