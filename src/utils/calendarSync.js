/**
 * calendarSync.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud UX Adherence Utility: Generates Google Calendar URLs and .ICS files
 * for patient posology regimens with 1-click execution.
 */

export function generateGoogleCalendarUrl({
  title = 'Toma de Medicación',
  description = '',
  location = 'Domicilio / Clínica',
  startHour = 8,
  durationMinutes = 15,
  daysCount = 90
}) {
  const now = new Date();
  // Schedule tomorrow at startHour
  const start = new Date(now);
  start.setDate(start.getDate() + 1);
  start.setHours(startHour, 0, 0, 0);

  const end = new Date(start);
  end.setMinutes(end.getMinutes() + durationMinutes);

  const formatGCalDate = (d) => {
    return d.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const datesParam = `${formatGCalDate(start)}/${formatGCalDate(end)}`;
  const recurParam = `RRULE:FREQ=DAILY;COUNT=${daysCount}`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    details: description,
    location,
    dates: datesParam,
    recur: recurParam
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadIcsFile({
  filename = 'pauta_medica.ics',
  title = 'Toma de Medicación',
  description = '',
  location = 'Domicilio / Clínica',
  startHour = 8,
  durationMinutes = 15,
  daysCount = 90
}) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() + 1);
  start.setHours(startHour, 0, 0, 0);

  const end = new Date(start);
  end.setMinutes(end.getMinutes() + durationMinutes);

  const formatIcsDate = (d) => {
    return d.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const nowFormatted = formatIcsDate(now);
  const startFormatted = formatIcsDate(start);
  const endFormatted = formatIcsDate(end);
  const uid = `rx-reminder-${Date.now()}@atlashealth.com`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Atlas Health Services//Clinical Posology Regimen//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${nowFormatted}`,
    `DTSTART:${startFormatted}`,
    `DTEND:${endFormatted}`,
    `RRULE:FREQ=DAILY;COUNT=${daysCount}`,
    `SUMMARY:${title.replace(/\n/g, ' ')}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT10M',
    'ACTION:DISPLAY',
    `DESCRIPTION:Recordatorio de Toma: ${title.replace(/\n/g, ' ')}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
