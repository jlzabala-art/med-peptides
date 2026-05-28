// pushBlogToFirebaseAdmin.js – sync blogPosts using Firebase Admin SDK (ES module compatible)
// Run with: node scripts/pushBlogToFirebaseAdmin.js

import admin from "firebase-admin";
import blogPosts from "../src/data/blogData.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load service account JSON manually (import assertion not supported in this runtime)
const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = admin.firestore();

async function pushPosts() {
  const colRef = db.collection("blogPosts");
  for (const post of blogPosts) {
    const docRef = colRef.doc(post.slug);
    await docRef.set(post, { merge: true });
    console.log(`✅ Uploaded post: ${post.slug}`);
  }
  console.log("🚀 All blog posts synced to Firestore (admin).");
}

pushPosts().catch((e) => {
  console.error("❌ Error syncing blog posts (admin):", e);
});
