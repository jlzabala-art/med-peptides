const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // assuming it exists
if (require('fs').existsSync('./serviceAccountKey.json')) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  admin.auth().listUsers(100).then(res => {
    res.users.forEach(u => console.log(u.email, u.uid));
  });
} else {
  console.log("No serviceAccountKey.json found");
}
