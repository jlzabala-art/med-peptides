/**
 * searchZohoContactByEmail.js
 * Cloud Function (v2 HTTP) — Search Zoho Books contact by email
 *
 * Checks if email matches a customer in Zoho Books.
 * Returns basic data, corporate/private classification, Zoho Books link, and alreadyRegistered status.
 */

"use strict";

const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");
const { defineSecret } = require("firebase-functions/params");
const {
  ZOHO_ORG_ID,
  ZOHO_BOOKS_BASE_URL,
  ZOHO_BOOKS_BASE_URL_GLOBAL,
  ZOHO_OAUTH_URL,
  ZOHO_OAUTH_URL_GLOBAL,
  ZOHO_SECRETS,
} = require("../lib/zoho_config");

const zohoClientId     = defineSecret(ZOHO_SECRETS.CLIENT_ID);
const zohoClientSecret = defineSecret(ZOHO_SECRETS.CLIENT_SECRET);
const zohoRefreshToken = defineSecret(ZOHO_SECRETS.REFRESH_TOKEN);

// OAuth token helper
async function getAccessToken(clientId, clientSecret, refreshToken) {
  const urls = [ZOHO_OAUTH_URL, ZOHO_OAUTH_URL_GLOBAL];
  for (const url of urls) {
    try {
      const params = new URLSearchParams({
        grant_type:    "refresh_token",
        client_id:     clientId,
        client_secret: clientSecret.replace(/\n/g, ""),
        refresh_token: refreshToken.replace(/\n/g, ""),
      });
      
      const res = await fetch(`${url}?${params}`, { 
        method: "POST",
        signal: AbortSignal.timeout(6000)
      });
      if (!res.ok) throw new Error(`OAuth request failed: ${res.status}`);
      const data = await res.json();
      if (!data.access_token) throw new Error("No access token in response");
      return data.access_token;
    } catch (err) { 
      console.warn(`[Zoho OAuth] Failed for URL ${url}:`, err.message);
    }
  }
  throw new Error("Could not obtain Zoho access token");
}

// Zoho Books API GET
async function booksGet(accessToken, path, params = {}) {
  const bases = [ZOHO_BOOKS_BASE_URL, ZOHO_BOOKS_BASE_URL_GLOBAL];
  const qs = new URLSearchParams({ organization_id: ZOHO_ORG_ID, ...params });
  
  for (const base of bases) {
    try {
      const url = `${base}${path}?${qs}`;
      const res = await fetch(url, {
        headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
        signal: AbortSignal.timeout(8000)
      });
      if (res.status === 404 || res.status === 204) return null;
      if (!res.ok) throw new Error(`Books API failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`[Books API] Request failed for ${base}${path}:`, err.message);
    }
  }
  return null;
}

exports.searchZohoContactByEmail = onRequest(
  { secrets: [zohoClientId, zohoClientSecret, zohoRefreshToken], cors: true, region: "europe-west1" },
  async (req, res) => {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: "Email is required for search" });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const db = getFirestore();

    try {
      const accessToken = await getAccessToken(
        zohoClientId.value(),
        zohoClientSecret.value(),
        zohoRefreshToken.value()
      );

      console.log(`[Zoho Contact Lookup] Querying Books by email: ${trimmedEmail}`);
      const booksResult = await booksGet(accessToken, "/contacts", { email: trimmedEmail });
      
      if (!booksResult?.contacts || booksResult.contacts.length === 0) {
        return res.json({
          found: false,
          message: "No matching contact found in Zoho Books."
        });
      }

      const contact = booksResult.contacts[0];
      const contactId = contact.contact_id;

      // Classify Corporate vs Private
      const hasCompany = contact.company_name &&
        contact.company_name.trim() !== "" &&
        contact.company_name.toLowerCase() !== (contact.contact_name || "").toLowerCase();
      const type = hasCompany ? "corporate" : "private";

      // Check if user already exists in Firebase users collection
      const userQuery = await db.collection("users")
        .where("email", "==", trimmedEmail)
        .limit(1)
        .get();

      let alreadyRegistered = false;
      let registeredUser = null;

      if (!userQuery.empty) {
        alreadyRegistered = true;
        const userDoc = userQuery.docs[0];
        const userData = userDoc.data();
        registeredUser = {
          uid: userDoc.id,
          role: userData.role || null,
          status: userData.status || null,
          name: userData.fullName || userData.displayName || ""
        };
      }

      // Construct UAE Zoho Books contact URL
      const zohoLink = `https://books.zoho.me/app#/contacts/${contactId}`;

      const mappedContact = {
        contact_id: contactId,
        name: contact.contact_name || contact.display_name || "",
        email: contact.email || trimmedEmail,
        phone: contact.mobile || contact.phone || "",
        company: contact.company_name || "",
        type: type,
        address: [
          contact.billing_address?.address,
          contact.billing_address?.city,
          contact.billing_address?.country,
        ].filter(Boolean).join(", "),
        zohoLink: zohoLink
      };

      return res.json({
        found: true,
        contact: mappedContact,
        alreadyRegistered,
        registeredUser
      });

    } catch (err) {
      console.error("[searchZohoContactByEmail] Error:", err);
      return res.status(500).json({ error: err.message });
    }
  }
);
