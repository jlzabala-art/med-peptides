const { onSchedule } = require("firebase-functions/v2/scheduler");
const { getFirestore } = require("firebase-admin/firestore");
const { GoogleGenAI } = require("@google/genai");

const API_KEY = process.env.GEMINI_API_KEY;

exports.trendingTopicsBlog = onSchedule("0 9 * * 1", async (event) => { // Runs every Monday at 9:00 AM
  if (!API_KEY) {
    console.error("GEMINI_API_KEY is not set.");
    return;
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const db = getFirestore();

  try {
    console.log("Starting trending topics search...");

    // 1. Search for trending topics and write the article
    const prompt = `You are a world-class medical writer for Atlas Health (med-peptides.com).
Your task is to write a highly engaging, scientific but accessible blog post about the most trending topic in the last 7 days regarding Peptides, longevity, or regenerative medicine.
    
Rules:
1. Write a compelling title.
2. The format MUST be pure HTML, exactly like this structure:
   <h1>[Title]</h1>
   <p><strong>[Hook]</strong> [Intro text]</p>
   <h2>[Section 1]</h2>
   <p>[Content]</p>
   <ul><li>[Point 1]</li></ul>
3. Do not include markdown blocks like \`\`\`html. Output raw HTML only.
4. Keep the tone professional, authoritative, and focused on wellness and science.
5. Provide a summary at the very end in a special tag <summary-meta>...</summary-meta> for social media.
6. Provide tags at the very end in a special tag <tags-meta>tag1,tag2,tag3</tags-meta>.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let content = response.text;
    
    // Extract metadata
    let summary = "Discover the latest breakthrough in peptide therapy and longevity.";
    let tags = ["Peptides", "Longevity", "News"];
    
    const summaryMatch = content.match(/<summary-meta>(.*?)<\/summary-meta>/s);
    if (summaryMatch) {
      summary = summaryMatch[1].trim();
      content = content.replace(summaryMatch[0], '');
    }
    
    const tagsMatch = content.match(/<tags-meta>(.*?)<\/tags-meta>/s);
    if (tagsMatch) {
      tags = tagsMatch[1].split(',').map(t => t.trim());
      content = content.replace(tagsMatch[0], '');
    }

    // Extract title from h1
    let title = "Trending in Peptides";
    const titleMatch = content.match(/<h1>(.*?)<\/h1>/);
    if (titleMatch) {
      title = titleMatch[1].trim();
    }
    
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // 2. Generate an image using Imagen 3
    console.log("Generating image for the article...");
    let imageUrl = null;
    try {
      const imageResponse = await ai.models.generateImages({
        model: 'imagen-3.0-generate-001',
        prompt: `A highly professional, premium, cinematic 3D abstract visualization representing ${title}. Use deep medical blue and vibrant cyan colors. Corporate tech-startup aesthetic, 4k, hyper-detailed.`,
        config: {
          numberOfImages: 1,
          outputMimeType: "image/jpeg",
          aspectRatio: "16:9"
        }
      });
      
      if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
        // Normally you'd upload this base64 string to Firebase Storage.
        // For simplicity, we can store the base64 or upload it using admin SDK
        const base64Image = imageResponse.generatedImages[0].image.imageBytes;
        imageUrl = `data:image/jpeg;base64,${base64Image}`;
        
        // TODO: Ideally, upload 'base64Image' to Firebase Storage and get a permanent URL.
      }
    } catch (imgError) {
      console.error("Failed to generate image:", imgError);
    }

    // 3. Save to Firestore
    const newBlog = {
      title,
      slug,
      author: "Atlas Health AI",
      content: content.trim(),
      summary,
      tags,
      status: "published", // Automatically publish it to trigger LinkedIn Auto-Post
      views: 0,
      publishToLinkedIn: true, // Trigger linkedinAutoPost
      imageUrl: imageUrl || '', // Generated Image
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await db.collection("blogPosts").add(newBlog);
    console.log("Successfully created automated blog post:", docRef.id);

  } catch (error) {
    console.error("Error in trendingTopicsBlog cron:", error);
  }
});
