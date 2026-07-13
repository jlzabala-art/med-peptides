const { onSchedule } = require("firebase-functions/v2/scheduler");
const { getFirestore } = require("firebase-admin/firestore");
const axios = require("axios");

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;

exports.linkedinTokenRefresh = onSchedule("0 0 1,15 * *", async (event) => { // Runs twice a month (1st and 15th)
  if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET) {
    console.error("Missing LinkedIn credentials for refresh.");
    return;
  }

  const db = getFirestore();
  const settingsRef = db.collection("settings").doc("linkedin");
  const doc = await settingsRef.get();

  if (!doc.exists) {
    console.log("No LinkedIn settings found. Skipping token refresh.");
    return;
  }

  const data = doc.data();
  const refreshToken = data.refreshToken;

  if (!refreshToken) {
    console.log("No LinkedIn refresh token found. Re-authentication might be required.");
    return;
  }

  // Refresh tokens usually last a year. Access tokens last 60 days.
  // By running twice a month, we ensure we always have a fresh access token.
  try {
    console.log("Requesting new LinkedIn access token using refresh token...");
    const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
      params: {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const newAccessToken = tokenResponse.data.access_token;
    const expiresIn = tokenResponse.data.expires_in;
    // Some APIs might return a new refresh token, LinkedIn sometimes does not return it if the old one is still valid.
    const newRefreshToken = tokenResponse.data.refresh_token;
    const newRefreshTokenExpiresIn = tokenResponse.data.refresh_token_expires_in;

    const updates = {
      accessToken: newAccessToken,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      updatedAt: new Date()
    };

    if (newRefreshToken) {
      updates.refreshToken = newRefreshToken;
      if (newRefreshTokenExpiresIn) {
        updates.refreshTokenExpiresAt = new Date(Date.now() + newRefreshTokenExpiresIn * 1000);
      }
    }

    await settingsRef.set(updates, { merge: true });
    console.log("Successfully refreshed LinkedIn token.");

  } catch (error) {
    console.error("Error refreshing LinkedIn token:", error.response?.data || error.message);
  }
});
