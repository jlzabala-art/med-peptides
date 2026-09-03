import admin from "firebase-admin";
import fs from "fs";

const envCode = fs.readFileSync("/Users/joseluiszabala/regenpept-web.nosync/.env", 'utf8');
const env = {};
envCode.split('\n').forEach(line => {
    const match = line.match(/^VITE_([^=]+)=(.*)/);
    if (match) env['VITE_' + match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
});

// We need a service account to use admin SDK, but we might not have it.
// Can we just use the REST API to see the error? Or just use the Admin SDK with application default credentials?
