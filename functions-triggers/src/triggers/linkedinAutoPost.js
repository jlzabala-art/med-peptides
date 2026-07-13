const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { getFirestore } = require("firebase-admin/firestore");
const linkedinService = require("../services/linkedin.service");

exports.linkedinAutoPost = onDocumentWritten("blogPosts/{docId}", async (event) => {
  const afterData = event.data.after.data();
  const beforeData = event.data.before ? event.data.before.data() : null;

  if (!afterData) return null;

  const justPublished = afterData.publishToLinkedIn === true && (!beforeData || beforeData.publishToLinkedIn !== true);
  
  if (justPublished && !afterData.linkedInShared) {
    console.log("Triggering LinkedIn auto-post for blog:", afterData.title);
    
    const db = getFirestore();
    const linkedinDoc = await db.collection("settings").doc("linkedin").get();
    
    if (!linkedinDoc.exists) {
      console.warn("No LinkedIn settings found.");
      return null;
    }

    const { accessToken, urn } = linkedinDoc.data();
    if (!accessToken || !urn) {
      console.warn("Incomplete LinkedIn settings.");
      return null;
    }

    const blogUrl = `https://med-peptides.com/blog/${afterData.slug}`;
    const summaryText = afterData.excerpt || afterData.summary || '';

    try {
      const result = await linkedinService.publishPost(accessToken, urn, afterData.title, summaryText, blogUrl);
      
      console.log("Successfully posted to LinkedIn:", result.postId);
      
      await event.data.after.ref.update({
        linkedInShared: true,
        linkedInPostId: result.postId,
        linkedInSharedAt: new Date()
      });
      
    } catch (error) {
      console.error("Failed to post to LinkedIn:", error.message);
    }
  }
  
  return null;
});
