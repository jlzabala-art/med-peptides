const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");
const axios = require("axios");

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:5173/admin/marketing"; // Will need to be dynamic in prod

exports.generateAuthUrl = onRequest({ cors: true }, (req, res) => {
  if (!LINKEDIN_CLIENT_ID) {
    return res.status(500).json({ error: "LinkedIn Client ID missing" });
  }

  const state = Math.random().toString(36).substring(7);
  
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}&scope=w_member_social,openid,profile`;

  return res.json({ url: authUrl });
});

exports.handleAuthCallback = onRequest({ cors: true }, async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Missing authorization code" });
  }

  try {
    const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
      params: {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const accessToken = tokenResponse.data.access_token;
    const expiresIn = tokenResponse.data.expires_in;
    const refreshToken = tokenResponse.data.refresh_token;
    const refreshTokenExpiresIn = tokenResponse.data.refresh_token_expires_in;

    // Get user info to know who authorized
    const userResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const sub = userResponse.data.sub;

    const db = getFirestore();
    await db.collection("settings").doc("linkedin").set({
      accessToken: accessToken,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      refreshToken: refreshToken || null,
      refreshTokenExpiresAt: refreshTokenExpiresIn ? new Date(Date.now() + refreshTokenExpiresIn * 1000) : null,
      urn: `urn:li:person:${sub}`, // The URN for posting
      updatedAt: new Date()
    }, { merge: true });

    return res.json({ success: true, message: "LinkedIn Connected Successfully" });
  } catch (error) {
    console.error("LinkedIn OAuth Error:", error.response?.data || error.message);
    return res.status(500).json({ error: "Failed to exchange code for token" });
  }
});
