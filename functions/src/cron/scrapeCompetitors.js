const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const competitorService = require("../services/competitor.service");

const GEMINI_API_KEY_SECRET = defineSecret("GEMINI_API_KEY");

exports.scheduledScrapeCompetitors = onSchedule({
  schedule: "0 2 * * *", 
  timeZone: "America/New_York",
  memory: '1GiB',
  timeoutSeconds: 300,
  secrets: [GEMINI_API_KEY_SECRET]
}, async (event) => {
  console.log("Starting scheduled competitor scrape job...");
  const apiKey = GEMINI_API_KEY_SECRET.value();
  if (!apiKey) throw new Error("GEMINI_API_KEY secret is missing or empty");
  
  try {
    const result = await competitorService.runScrapingJob(apiKey);
    console.log("Scrape job finished.", result);
  } catch (err) {
    console.error("Scheduled scrape job failed:", err);
  }
});

exports.forceScrapeCompetitors = onRequest({
  cors: true,
  memory: '1GiB',
  timeoutSeconds: 300,
  secrets: [GEMINI_API_KEY_SECRET]
}, async (req, res) => {
  try {
    const apiKey = GEMINI_API_KEY_SECRET.value();
    if (!apiKey) throw new Error("GEMINI_API_KEY secret is missing or empty");

    const { productId } = req.query;
    const bodyProductId = req.body?.data?.productId;
    const targetId = productId || bodyProductId || null;
    
    const result = await competitorService.runScrapingJob(apiKey, targetId);
    res.status(200).json({ data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
