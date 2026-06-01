import fetch from "node-fetch";

const clientId = "1000.NAHBCCYF5C9B3Z3YS2URAQ4TG7O76V";
const clientSecret = "088b65381f7f30dfb801ff3f901e1af2c7adef11e5";
const refreshToken = "1000.75de3342c42f527182db6393a206b01d.0b79e2205e02468baee75b6363c48674";

async function run() {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  });

  const resp = await fetch("https://accounts.zoho.com/oauth/v2/token", {
    method: "POST",
    body: params,
  });

  const data = await resp.json();
  console.log("Token Response:", data);

  if (data.access_token) {
    console.log("Got access token! Querying Bigin...");
    const biginUrl = "https://www.zohoapis.com/bigin/v1/Accounts/search?word=Magenta";
    const biginResp = await fetch(biginUrl, {
      headers: { Authorization: `Zoho-oauthtoken ${data.access_token}` },
    });
    const biginData = await biginResp.json();
    console.log("Bigin Accounts Search:", JSON.stringify(biginData, null, 2));
    
    const contactsUrl = "https://www.zohoapis.com/bigin/v1/Contacts/search?word=Magenta";
    const contactsResp = await fetch(contactsUrl, {
      headers: { Authorization: `Zoho-oauthtoken ${data.access_token}` },
    });
    const contactsData = await contactsResp.json();
    console.log("Bigin Contacts Search:", JSON.stringify(contactsData, null, 2));
  }
}

run();
