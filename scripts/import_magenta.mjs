import fetch from "node-fetch";
import admin from 'firebase-admin';
import { readFile } from 'fs/promises';

const clientId = "1000.NAHBCCYF5C9B3Z3YS2URAQ4TG7O76V";
const clientSecret = "088b65381f7f30dfb801ff3f901e1af2c7adef11e5";
const refreshToken = "1000.75de3342c42f527182db6393a206b01d.0b79e2205e02468baee75b6363c48674";

const serviceAccount = JSON.parse(
  await readFile('/Users/joseluiszabala/Documents/Antigravity/regenpept-web/serviceAccountKey.json')
);
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
const auth = admin.auth();

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

  if (!accessToken) {
    console.error("Failed to get token");
    process.exit(1);
  }

  // First create Magenta pharmacy org
  const orgId = "magenta-health";
  await db.collection("wholesellers").doc(orgId).set({
    name: "Magenta Pharma Medicine Trading",
    companyName: "Magenta Pharma Medicine Trading",
    status: "active",
    zohoId: "7006116000001242117",
    createdAt: new Date().toISOString()
  }, { merge: true });

  const contactsUrl = "https://www.zohoapis.com/bigin/v1/Contacts/search?word=Magenta";
  const contactsResp = await fetch(contactsUrl, {
    headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
  });
  const contactsData = await contactsResp.json();
  const contacts = contactsData.data || [];
  
  console.log(`Found ${contacts.length} contacts for Magenta.`);

  for (const contact of contacts) {
    if (!contact.Email) {
      console.log(`Skipping contact ${contact.Full_Name} (No Email)`);
      continue;
    }
    
    const email = contact.Email.toLowerCase();
    let uid;
    try {
      const userRecord = await auth.getUserByEmail(email);
      uid = userRecord.uid;
      console.log(`User ${email} already in Auth (${uid})`);
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        const newUser = await auth.createUser({
          email: email,
          password: 'Password123!',
          displayName: contact.Full_Name,
          emailVerified: true
        });
        uid = newUser.uid;
        console.log(`Created new Auth user for ${email} (${uid})`);
      } else {
        console.error(e);
        continue;
      }
    }

    // Assign to wholesellers/compounding pharmacy role
    await db.collection('users').doc(uid).set({
      email: email,
      role: 'compounding_pharmacy',
      wholesellerId: orgId,
      zohoContactId: contact.id || '',
      displayName: contact.Full_Name || '',
      firstName: contact.First_Name || '',
      lastName: contact.Last_Name || '',
      phone: contact.Phone || contact.Mobile || '',
      approved: true,
      userType: 'professional',
      createdAt: new Date().toISOString()
    }, { merge: true });
    
    console.log(`Added ${email} to Firestore as compounding_pharmacy.`);
  }

  process.exit(0);
}

run();
