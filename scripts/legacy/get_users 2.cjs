const admin = require('firebase-admin');
const fs = require('fs');
if (fs.existsSync('./serviceAccountKey.json')) {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  admin.auth().listUsers(100).then(res => {
    res.users.forEach(u => console.log(u.email, u.uid));
  });
} else {
  console.log("No serviceAccountKey.json found");
}
