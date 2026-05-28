/**
 * Generates an iCalendar (.ics) format string for a protocol schedule
 * 
 * @param {Object} protocol - The normalized protocol object
 * @param {string} startDateStr - The chosen start date in YYYY-MM-DD format
 * @param {Object} options - Configuration options
 * @param {boolean} options.allDay - Whether to make events all-day reminders
 * @param {string} options.timeStr - If not all-day, the HH:MM schedule time
 * @returns {string} The full .ics formatted calendar data
 */
export function generateICS(protocol, startDateStr, options = {}) {
  const { allDay = true, timeStr = '09:00' } = options;
  const start = new Date(startDateStr);
  
  if (isNaN(start.getTime())) {
    throw new Error('Invalid start date');
  }

  const events = [];
  const phases = protocol.phases || [];

  // Helper to format date to YYYYMMDD
  const formatICSDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}${m}${d}`;
  };

  // Helper to format date-time to YYYYMMDDTHHMMSS
  const formatICSDateTime = (date, time) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const [hh, mm] = time.split(':');
    return `${y}${m}${d}T${hh || '09'}${mm || '00'}00`;
  };

  const getDaysOffsets = (freq) => {
    const f = freq?.toLowerCase() || '';
    if (f.includes('daily')) return [0, 1, 2, 3, 4, 5, 6];
    if (f.includes('3x')) return [0, 2, 4]; // Mon, Wed, Fri
    if (f.includes('2x')) return [1, 3];    // Tue, Thu
    if (f.includes('5x')) return [0, 1, 2, 3, 4]; // Mon-Fri
    return [0]; // default once weekly (Monday/start day)
  };

  const escapeText = (str) => {
    if (!str) return '';
    return str.replace(/[\\,;]/g, (match) => `\\${match}`).replace(/\n/g, '\\n');
  };

  phases.forEach((phase, phaseIdx) => {
    const startWeek = phase.start_week || 1;
    const endWeek = phase.end_week || startWeek;
    const durationWeeks = endWeek - startWeek + 1;

    phase.drugs_used.forEach((drug, drugIdx) => {
      const freq = drug.dosing_frequency || 'weekly';
      const offsets = getDaysOffsets(freq);
      const compound = drug.product_title || drug.name || 'Compound';
      const strength = drug.strength || '';
      const dose = drug.weekly_dose || drug.per_administration_dose || 'As directed';
      const route = drug.route || 'SC';

      // Iterate through each week of the phase
      for (let w = 0; w < durationWeeks; w++) {
        // Calculate the base date for this week of this phase
        const weekOffsetDays = (startWeek - 1 + w) * 7;

        offsets.forEach((dayOffset) => {
          const eventDate = new Date(start);
          eventDate.setDate(start.getDate() + weekOffsetDays + dayOffset);

          const uid = `medpeptides-${protocol.id || 'proto'}-${phaseIdx}-${drugIdx}-w${w}-d${dayOffset}@medpeptides.com`;
          const dtstamp = formatICSDateTime(new Date(), '00:00'); // current time UTC

          let dtstart, dtend, valueParam = '';
          if (allDay) {
            dtstart = formatICSDate(eventDate);
            // End date for all-day event is the next day
            const eventEndDate = new Date(eventDate);
            eventEndDate.setDate(eventEndDate.getDate() + 1);
            dtend = formatICSDate(eventEndDate);
            valueParam = ';VALUE=DATE';
          } else {
            dtstart = formatICSDateTime(eventDate, timeStr);
            // End date is 15 minutes later
            const eventEndDate = new Date(eventDate);
            eventEndDate.setTime(eventEndDate.getTime() + 15 * 60 * 1000);
            dtend = formatICSDateTime(eventEndDate, timeStr);
          }

          const summary = `Med-Peptides: ${compound} Dose`;
          const description = `Protocol: ${protocol.protocol_title || 'Custom Protocol'}\nPhase: Phase ${phaseIdx + 1}: ${phase.phase_title}\nCompound: ${compound} (${strength})\nDose: ${dose}\nRoute: ${route}\nFrequency: ${freq}`;

          events.push([
            'BEGIN:VEVENT',
            `UID:${uid}`,
            `DTSTAMP:${dtstamp}`,
            `DTSTART${valueParam}:${dtstart}`,
            `DTEND${valueParam}:${dtend}`,
            `SUMMARY:${escapeText(summary)}`,
            `DESCRIPTION:${escapeText(description)}`,
            'END:VEVENT'
          ].join('\r\n'));
        });
      }
    });
  });

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Med-Peptides//Clinical Engine//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events,
    'END:VCALENDAR'
  ];

  return icsLines.join('\r\n');
}
