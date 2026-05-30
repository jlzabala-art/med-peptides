const { onDocumentWritten, onDocumentCreated } = require('firebase-functions/v2/firestore');
const { getFirestore } = require('firebase-admin/firestore');
const { google } = require('googleapis');

// 1. syncToGoogleCalendar
// Listens to changes on calendar_events and syncs to Google Calendar if the user has an OAuth token
exports.syncToGoogleCalendar = onDocumentWritten('calendar_events/{eventId}', async (event) => {
  const data = event.data.after.data();
  if (!data) return; // Deleted

  // Placeholder for Google Calendar API integration
  // 1. Fetch user's Google Calendar OAuth token from users/{uid}/googleCalendar
  // 2. Refresh token if necessary using googleapis
  // 3. Create or update event using calendar.events.insert / update
  console.log(`[Google Calendar Sync] Syncing event ${event.params.eventId} for owners ${data.ownerIds}`);
});

// 2. protocolDaySync
// Listens to writes on 'protocols/{protocolId}' and generates calendar_events for dosing days.
exports.protocolDaySync = onDocumentWritten('protocols/{protocolId}', async (event) => {
  const data = event.data.after.data();
  const prevData = event.data.before.data();
  if (!data || !data.doses) return; 

  const db = getFirestore();
  
  // Basic implementation: find new doses or changed doses and upsert them to calendar_events
  const promises = data.doses.map(async (dose, index) => {
    const calendarEventId = `protocol-${event.params.protocolId}-dose-${index}`;
    const eventPayload = {
      title: `Protocol Dosing: ${data.name || 'Treatment'}`,
      start: dose.date,
      type: 'protocol',
      ownerIds: [data.patientId, data.doctorId].filter(Boolean),
      createdBy: 'system',
      extendedProps: {
        protocolId: event.params.protocolId,
        doseIndex: index,
        description: `Dose ${index + 1} of protocol.`
      }
    };
    
    await db.collection('calendar_events').doc(calendarEventId).set(eventPayload, { merge: true });
  });

  await Promise.all(promises);
  console.log(`[Protocol Sync] Synced ${data.doses.length} doses to calendar for protocol ${event.params.protocolId}`);
});
