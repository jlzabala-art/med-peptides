const { onCall } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");
const { google } = require('googleapis');

// Create oauth2Client locally to avoid strict env requirement outside invocation
function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID || 'dummy',
    process.env.GOOGLE_CLIENT_SECRET || 'dummy',
    process.env.GOOGLE_REDIRECT_URI || 'dummy'
  );
}

exports.generateAuthUrl = onCall(async (request) => {
  if (!request.auth) {
    throw new Error('Unauthenticated');
  }

  const oauth2Client = getOAuthClient();
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar'],
    state: request.auth.uid, 
  });

  return { url };
});

exports.handleAuthCallback = onCall(async (request) => {
  if (!request.auth) {
    throw new Error('Unauthenticated');
  }
  const code = request.data.code;
  if (!code) throw new Error('Missing code');

  const oauth2Client = getOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  
  await getFirestore().collection('users').doc(request.auth.uid).update({
    googleCalendar: tokens
  });

  return { success: true };
});
