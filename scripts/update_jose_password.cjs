const dns = require('dns');

// Fix macOS DNS lookup latency by routing through Google & Cloudflare DNS
const resolver = new dns.Resolver();
resolver.setServers(['8.8.8.8', '1.1.1.1']);

dns.lookup = (hostname, options, callback) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  resolver.resolve4(hostname, (err, addresses) => {
    if (err) return callback(err);
    if (options && options.all) {
      return callback(null, addresses.map(a => ({ address: a, family: 4 })));
    }
    callback(null, addresses[0], 4);
  });
};

const fs = require('fs');
const path = require('path');
const https = require('https');
const admin = require('firebase-admin');

const key = JSON.parse(fs.readFileSync(path.join(__dirname, 'serviceAccountKey.json'), 'utf8'));
const app = admin.initializeApp({
  credential: admin.credential.cert(key)
});

async function updateFirestoreDoc(uid, fields) {
  const token = (await app.options.credential.getAccessToken()).access_token;
  const body = JSON.stringify({
    fields: {
      role: { stringValue: 'admin' },
      approved: { booleanValue: true },
      professionalStatus: { stringValue: 'approved' },
      email: { stringValue: fields.email },
      displayName: { stringValue: 'Jose Luis Zabala' },
      updatedAt: { stringValue: new Date().toISOString() }
    }
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'firestore.googleapis.com',
      path: `/v1/projects/med-peptides-app/databases/(default)/documents/users/${uid}?updateMask.fieldPaths=role&updateMask.fieldPaths=approved&updateMask.fieldPaths=professionalStatus&updateMask.fieldPaths=email&updateMask.fieldPaths=displayName&updateMask.fieldPaths=updatedAt`,
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Status ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('🔧 Synchronizing Admin accounts (jose@mediluxeme.com & jlzabala@gmail.com)...\n');
  
  // 1. Setup / Update jose@mediluxeme.com
  try {
    let uid;
    try {
      const user = await admin.auth().getUserByEmail('jose@mediluxeme.com');
      uid = user.uid;
      await admin.auth().updateUser(uid, {
        password: 'Mediluxe$123',
        emailVerified: true,
        displayName: 'Jose Luis Zabala'
      });
      console.log(`✅ [jose@mediluxeme.com] Password set to Mediluxe$123 (UID: ${uid})`);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        const newUser = await admin.auth().createUser({
          email: 'jose@mediluxeme.com',
          password: 'Mediluxe$123',
          emailVerified: true,
          displayName: 'Jose Luis Zabala'
        });
        uid = newUser.uid;
        console.log(`✅ [jose@mediluxeme.com] Created new user with password Mediluxe$123 (UID: ${uid})`);
      } else {
        throw err;
      }
    }

    await admin.auth().setCustomUserClaims(uid, { role: 'admin', admin: true });
    console.log(`✅ [jose@mediluxeme.com] Custom claims set to role: 'admin'`);

    await updateFirestoreDoc(uid, { email: 'jose@mediluxeme.com' });
    console.log(`✅ [jose@mediluxeme.com] Firestore profile set to role: 'admin' (approved: true)`);
  } catch (err) {
    console.error('❌ Error with jose@mediluxeme.com:', err.message);
  }

  // 2. Setup / Update jlzabala@gmail.com (Google Account)
  try {
    console.log('\n🔍 Checking Google account: jlzabala@gmail.com...');
    try {
      const googleUser = await admin.auth().getUserByEmail('jlzabala@gmail.com');
      await admin.auth().setCustomUserClaims(googleUser.uid, { role: 'admin', admin: true });
      await updateFirestoreDoc(googleUser.uid, { email: 'jlzabala@gmail.com' });
      console.log(`✅ [jlzabala@gmail.com] Google account promoted to admin in Firestore & Auth claims (UID: ${googleUser.uid})`);
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        console.log('ℹ️ [jlzabala@gmail.com] Not in Auth yet. Will be auto-promoted upon first Google Sign In.');
      } else {
        console.error('❌ Error with jlzabala@gmail.com:', e.message);
      }
    }
  } catch (err) {
    console.error('❌ Error processing jlzabala@gmail.com:', err.message);
  }

  console.log('\n🎉 ALL DONE! Ready to log in.');
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
