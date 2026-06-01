import fetch from "node-fetch";

const clientId = "1000.NAHBCCYF5C9B3Z3YS2URAQ4TG7O76V";
const clientSecret = "088b65381f7f30dfb801ff3f901e1af2c7adef11e5";
const refreshToken = "1000.5e78cbdff88ecfe2797a758cb0d2bdb1.2a1750778aa0ca90ec9c9123632fee14";
const orgId = "662274409"; 

async function run() {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  });

  const resp = await fetch("https://accounts.zoho.com/oauth/v2/token", { method: "POST", body: params });
  const data = await resp.json();
  const accessToken = data.access_token;
  if (!accessToken) return console.error("No token");

  const baseUrl = "https://www.zohoapis.com/books/v3";
  const headers = { Authorization: `Zoho-oauthtoken ${accessToken}` };

  console.log("--- Fetching P&L ---");
  const pnlRes = await fetch(`${baseUrl}/reports/profitandloss?organization_id=${orgId}`, { headers });
  if (pnlRes.ok) {
    const pnlData = await pnlRes.json();
    console.log("P&L status:", pnlData.code, pnlData.message);
    if(pnlData.profitandloss) {
      console.log("Net Income:", pnlData.profitandloss.net_income);
    }
  } else {
    console.error("P&L Error:", pnlRes.status, await pnlRes.text());
  }

  console.log("--- Fetching Unpaid Invoices ---");
  const invRes = await fetch(`${baseUrl}/invoices?organization_id=${orgId}&status=unpaid`, { headers });
  const invData = await invRes.json();
  console.log("Unpaid Invoices Count:", invData.invoices ? invData.invoices.length : 0);

  console.log("--- Searching Lotusland ---");
  const lotusRes = await fetch(`${baseUrl}/contacts?organization_id=${orgId}&contact_name_contains=Lotusland`, { headers });
  const lotusData = await lotusRes.json();
  if (lotusData.contacts && lotusData.contacts.length > 0) {
    console.log("Lotusland ID:", lotusData.contacts[0].contact_id);
  } else {
    console.log("Lotusland not found");
  }

  console.log("--- Searching NPLAB ---");
  const nplabRes = await fetch(`${baseUrl}/contacts?organization_id=${orgId}&contact_name_contains=NPLAB`, { headers });
  const nplabData = await nplabRes.json();
  if (nplabData.contacts && nplabData.contacts.length > 0) {
    console.log("NPLAB ID:", nplabData.contacts[0].contact_id);
  } else {
    console.log("NPLAB not found");
  }
}

run();
