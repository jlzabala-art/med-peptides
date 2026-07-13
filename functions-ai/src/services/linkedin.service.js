const axios = require("axios");

/**
 * Publishes an article or post to LinkedIn.
 * 
 * @param {string} accessToken - The LinkedIn OAuth access token.
 * @param {string} urn - The LinkedIn Author URN (e.g., "urn:li:person:12345").
 * @param {string} title - The title of the post/article.
 * @param {string} summary - A brief summary or excerpt to include in the commentary.
 * @param {string} url - The URL to link to in the post.
 * @returns {Promise<Object>} - The API response data containing the post ID.
 */
async function publishPost(accessToken, urn, title, summary, url) {
  const postBody = {
    author: urn,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: {
          text: `New article on our blog: ${title}\n\n${summary || ''}\n\nRead the full article here: ${url}`
        },
        shareMediaCategory: "ARTICLE",
        media: [
          {
            status: "READY",
            description: { text: summary || title },
            originalUrl: url,
            title: { text: title }
          }
        ]
      }
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
    }
  };

  try {
    const response = await axios.post("https://api.linkedin.com/v2/ugcPosts", postBody, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
        "Content-Type": "application/json"
      }
    });
    
    return { success: true, postId: response.data.id, data: response.data };
  } catch (error) {
    console.error("Error publishing to LinkedIn:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message);
  }
}

module.exports = {
  publishPost
};
