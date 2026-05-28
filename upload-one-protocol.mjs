import fs from "fs";
import admin from "firebase-admin";

const filePath = "AI Prompts/skin_003.json";
const collectionName = "protocols";
const documentId = "skin_003";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}

const db = admin.firestore();

const raw = fs.readFileSync(filePath, "utf8");
const data = JSON.parse(raw);

await db
  .collection(collectionName)
  .doc(documentId)
  .set(data, { merge: false });

console.log(`Uploaded ${filePath} to ${collectionName}/${documentId}`);
