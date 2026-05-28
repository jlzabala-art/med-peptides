// pushBlogToFirebase.js – sync blogPosts to Firestore
// Run with: node scripts/pushBlogToFirebase.js

import { db } from "../src/firebase.js"; // reuse initialized Firestore instance
import { collection, setDoc, doc } from "firebase/firestore";
import blogPosts from "../src/data/blogData.js";

async function pushPosts() {
  const colRef = collection(db, "blogPosts");
  for (const post of blogPosts) {
    const docRef = doc(colRef, post.slug);
    await setDoc(docRef, post, { merge: true });
    console.log(`✅ Uploaded post: ${post.slug}`);
  }
  console.log("🚀 All blog posts synced to Firestore.");
}

pushPosts().catch((e) => {
  console.error("❌ Error syncing blog posts:", e);
});
