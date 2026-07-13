const { onSchedule } = require("firebase-functions/v2/scheduler");
const { getFirestore } = require("firebase-admin/firestore");
const { BetaAnalyticsDataClient } = require("@google-analytics/data");

module.exports = (ga4PropertyId) => onSchedule(
  {
    schedule: "0 3 * * *",
    timeZone: "UTC",
    region: "europe-west1",
    secrets: [ga4PropertyId],
    timeoutSeconds: 120,
  },
  async () => {
    let propertyId;
    try {
      propertyId = ga4PropertyId.value();
    } catch (e) {
      console.warn("Could not access GA4_PROPERTY_ID secret. Skipping sync.");
      return;
    }

    if (!propertyId) return;

    const analyticsClient = new BetaAnalyticsDataClient();
    const db = getFirestore();

    try {
      const [response] = await analyticsClient.runReport({
        property: `properties/${propertyId}`,
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        dateRanges: [{ startDate: "90daysAgo", endDate: "today" }],
        dimensionFilter: {
          filter: {
            fieldName: "pagePath",
            stringFilter: { matchType: "BEGINS_WITH", value: "/peptides/" },
          },
        },
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 200,
      });

      const rows = response.rows || [];
      if (rows.length === 0) return;

      const slugScores = {};
      let maxViews = 0;
      for (const row of rows) {
        const path = row.dimensionValues?.[0]?.value || "";
        const views = parseInt(row.metricValues?.[0]?.value || "0", 10);
        const slug = path.replace(/^\/peptides\//, "").replace(/\/$/, "").toLowerCase();
        if (slug) {
          slugScores[slug] = (slugScores[slug] || 0) + views;
          if (slugScores[slug] > maxViews) maxViews = slugScores[slug];
        }
      }

      const peptidesRef = db.collection("peptides");
      const slugList = Object.keys(slugScores);
      const CHUNK = 30;

      for (let i = 0; i < slugList.length; i += CHUNK) {
        const chunk = slugList.slice(i, i + CHUNK);
        const snap = await peptidesRef.where("slug", "in", chunk).get();
        if (snap.empty) continue;

        const batch = db.batch();
        snap.forEach((doc) => {
          const slug = doc.data().slug;
          const views = slugScores[slug] || 0;
          const score = maxViews > 0 ? Math.round((views / maxViews) * 100) : 0;
          batch.update(doc.ref, {
            analytics_usage_score: score,
            view_count: views,
            analytics_synced_at: new Date().toISOString(),
          });
        });
        await batch.commit();
      }
      console.log(`✅ syncPeptideAnalytics: synced ${slugList.length} slugs.`);
    } catch (err) {
      console.error("syncPeptideAnalytics failed:", err);
    }
  }
);
