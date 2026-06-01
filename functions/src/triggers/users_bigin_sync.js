const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const { ZOHO_OAUTH_URL, ZOHO_OAUTH_URL_GLOBAL, ZOHO_SECRETS } = require("../lib/zoho_config");

const zohoClientId = defineSecret(ZOHO_SECRETS.CLIENT_ID);
const zohoClientSecret = defineSecret(ZOHO_SECRETS.CLIENT_SECRET);
const zohoRefreshToken = defineSecret(ZOHO_SECRETS.REFRESH_TOKEN);

const BIGIN_BASE_URL_ME = "https://www.zohoapis.me/bigin/v1";
const BIGIN_BASE_URL_COM = "https://www.zohoapis.com/bigin/v1";

async function getAccessToken(clientId, clientSecret, refreshToken) {
  const urls = [ZOHO_OAUTH_URL, ZOHO_OAUTH_URL_GLOBAL];
  for (const url of urls) {
    try {
      const params = new URLSearchParams({
        grant_type: "refresh_token",
        client_id: clientId,
        client_secret: clientSecret.replace(/\n/g, ""),
        refresh_token: refreshToken.replace(/\n/g, ""),
      });
      
      const res = await fetch(`${url}?${params}`, { method: "POST", signal: AbortSignal.timeout(6000) });
      if (!res.ok) throw new Error(`OAuth failed: ${res.status}`);
      const data = await res.json();
      if (data.access_token) return data.access_token;
    } catch (err) {
      console.warn(`[Zoho OAuth] Failed for URL ${url}:`, err.message);
    }
  }
  throw new Error("Could not obtain Zoho access token");
}

async function biginUpsertContact(accessToken, contactData) {
  const bases = [BIGIN_BASE_URL_ME, BIGIN_BASE_URL_COM];
  
  for (const base of bases) {
    try {
      const url = `${base}/Contacts/upsert`;
      const payload = {
        data: [contactData],
        duplicate_check_fields: ["Email"]
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { 
          "Authorization": `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000)
      });
      
      if (!res.ok) throw new Error(`Bigin API failed: ${res.status}`);
      const result = await res.json();
      return result;
    } catch (err) {
      console.warn(`[Bigin API] Upsert failed for ${base}:`, err.message);
    }
  }
  return null;
}

module.exports = onDocumentWritten(
  {
    document: "users/{userId}",
    secrets: [zohoClientId, zohoClientSecret, zohoRefreshToken],
    region: "europe-west1",
  },
  async (event) => {
    if (!event.data.after.exists) {
      // Document was deleted. No action needed for now.
      return;
    }

    const userData = event.data.after.data();
    if (!userData || !userData.email) return;

    try {
      const accessToken = await getAccessToken(
        zohoClientId.value(),
        zohoClientSecret.value(),
        zohoRefreshToken.value()
      );

      const contactName = userData.firstName 
        ? `${userData.firstName} ${userData.lastName || ''}`.trim() 
        : userData.name || userData.displayName || 'Unknown';

      const tags = (userData.tags && Array.isArray(userData.tags)) ? [...userData.tags] : [];
      if (!tags.includes('Atlas Health')) {
        tags.push('Atlas Health');
      }

      const addressDetails = userData.address || {};

      const contactData = {
        Last_Name: userData.lastName || contactName || "Unknown",
        First_Name: userData.firstName || "",
        Email: userData.email,
        Phone: userData.phone || "",
        Description: `Professional Role: ${userData.professionalRole || 'N/A'}\nLanguage: ${userData.language || 'N/A'}`,
        Mailing_Street: addressDetails.street || "",
        Mailing_City: addressDetails.city || "",
        Mailing_Zip: addressDetails.postalCode || "",
        Mailing_Country: addressDetails.country || "",
        Tag: tags.map(t => ({ name: t }))
      };

      console.log(`[Bigin Sync] Upserting contact for: ${userData.email}`);
      const result = await biginUpsertContact(accessToken, contactData);
      
      if (result && result.data && result.data[0].status === "success") {
        console.log(`[Bigin Sync] Successfully synced contact: ${userData.email}`);
      } else {
        console.error(`[Bigin Sync] Failed to sync contact: ${userData.email}`, JSON.stringify(result));
      }
    } catch (err) {
      console.error("[Bigin Sync] Error syncing to Bigin:", err);
    }
  }
);
