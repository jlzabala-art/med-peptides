const { onCall } = require('firebase-functions/v2/https');
const { getFirestore } = require('firebase-admin/firestore');
const { google } = require('googleapis');

// Note: Use environment variables or Secret Manager for client ID and secret
const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID || 'dummy-client-id';
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET || 'dummy-client-secret';
const REDIRECT_URI = process.env.GOOGLE_OAUTH_REDIRECT_URI || 'http://localhost:5173/oauth2callback';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

exports.generateAuthUrl = onCall(async (request) => {
  if (!request.auth) {
    throw new Error('Unauthenticated');
  }

  const scopes = [
    'https://www.googleapis.com/auth/calendar'
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: request.auth.uid, // pass uid as state to verify on callback
  });

  return { url };
});
