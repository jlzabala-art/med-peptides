import fetch from 'node-fetch';

const API_KEY = "AIzaSyDOV2zFeLGtPsE_O2b-gR3NHZygPspiSws";
const ACCOUNTS = {
  admin:      { email: 'admin@regenpept.test',      password: 'TestAdmin1234!' },
  doctor:     { email: 'doctor@regenpept.test',     password: 'Test1234!' },
  wholesaler: { email: 'wholesaler@regenpept.test', password: 'Test1234!' },
  patient:    { email: 'patient@regenpept.test',    password: 'Test1234!' },
  guest:      { email: 'guest@regenpept.test',      password: 'Test1234!' }
};

async function testLogin(role, { email, password }) {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`✅ ${role} login succeeded! uid: ${data.localId}`);
    } else {
      console.error(`❌ ${role} login failed: ${data.error?.message || JSON.stringify(data)}`);
    }
  } catch (err) {
    console.error(`❌ ${role} request error: ${err.message}`);
  }
}

async function main() {
  console.log('Testing Firebase Auth REST login for all accounts...\n');
  for (const [role, creds] of Object.entries(ACCOUNTS)) {
    await testLogin(role, creds);
  }
}

main();
