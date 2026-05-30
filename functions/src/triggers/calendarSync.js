const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { getFirestore } = require("firebase-admin/firestore");
const { google } = require('googleapis');

async function syncEventToGoogle(eventDoc, eventId) {
  const data = eventDoc.data();
  if (!data || !data.ownerIds || data.ownerIds.length === 0) return;
  const uid = data.ownerIds[0];

  const userDoc = await getFirestore().collection('users').doc(uid).get();
  const userData = userDoc.data();
  if (!userData?.googleCalendar?.refresh_token) return;

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID || 'dummy',
    process.env.GOOGLE_CLIENT_SECRET || 'dummy',
    process.env.GOOGLE_REDIRECT_URI || 'dummy'
  );
  oauth2Client.setCredentials(userData.googleCalendar);

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const eventBody = {
    summary: data.title,
    description: data.description || '',
    start: data.allDay ? { date: data.start.split('T')[0] } : { dateTime: data.start },
    end: data.allDay ? { date: data.end ? data.end.split('T')[0] : data.start.split('T')[0] } : { dateTime: data.end || data.start },
  };

  try {
    if (data.googleEventId) {
      await calendar.events.update({
        calendarId: 'primary',
        eventId: data.googleEventId,
        requestBody: eventBody,
      });
    } else {
      const res = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: eventBody,
      });
      await getFirestore().collection('calendar_events').doc(eventId).update({
        googleEventId: res.data.id
      });
    }
  } catch (error) {
    console.error('Error syncing to Google Calendar', error);
  }
}

exports.syncToGoogleCalendar = onDocumentWritten("calendar_events/{eventId}", async (event) => {
  if (!event.data.after.exists) {
    return;
  }
  await syncEventToGoogle(event.data.after, event.params.eventId);
});

exports.protocolDaySync = onDocumentWritten("protocols/{protocolId}", async (event) => {
  if (!event.data.after.exists) return; 
  const data = event.data.after.data();
  if (!data.doses || !Array.isArray(data.doses)) return;

  const batch = getFirestore().batch();
  data.doses.forEach((dose, index) => {
    if (!dose.date) return;
    const eventRef = getFirestore().collection('calendar_events').doc(`protocol_${event.params.protocolId}_dose_${index}`);
    batch.set(eventRef, {
      title: `Protocol Dose: ${data.protocol_name}`,
      start: new Date(dose.date).toISOString(),
      allDay: true,
      type: 'protocol',
      ownerIds: [data.created_by.user_id],
      protocolId: event.params.protocolId
    }, { merge: true });
  });

  if (data.doses.length > 0) {
    await batch.commit();
  }
});
