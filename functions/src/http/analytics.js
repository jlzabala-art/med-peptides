const { onRequest } = require("firebase-functions/v2/https");
const { BetaAnalyticsDataClient } = require("@google-analytics/data");

function metricVal(rows, rowIndex = 0, metricIndex = 0) {
  return parseInt(rows?.[rowIndex]?.metricValues?.[metricIndex]?.value ?? "0", 10);
}

const analyticsClient = new BetaAnalyticsDataClient();

module.exports = (ga4PropertyId) => onRequest(
  {
    region: "europe-west1",
    secrets: [ga4PropertyId],
    timeoutSeconds: 60,
    cors: true,
  },
  async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    let propertyId;
    try {
      propertyId = ga4PropertyId.value();
    } catch (e) {
      res.status(500).json({ error: "GA4 Configuration Missing" });
      return;
    }

    if (!propertyId) {
      res.status(500).json({ error: "GA4 Property ID Missing" });
      return;
    }

    const days = parseInt(req.query.days || "7", 10);
    const property = `properties/${propertyId}`;
    const dateRanges = [
      { startDate: `${days}daysAgo`, endDate: "today" },
      { startDate: `${days * 2}daysAgo`, endDate: `${days + 1}daysAgo` }
    ];

    try {
      const makeEventFilter = (eventName) => ({
        filter: {
          fieldName: "eventName",
          stringFilter: { matchType: "EXACT", value: eventName },
        },
      });

      const reportRequests = [
        analyticsClient.runReport({ property, dateRanges, dimensions: [{ name: "dateRange" }], metrics: [{ name: "activeUsers" }, { name: "eventCount" }] }),
        analyticsClient.runReport({ property, dateRanges, dimensions: [{ name: "dateRange" }], metrics: [{ name: "eventCount" }], dimensionFilter: makeEventFilter("protocol_view") }),
        analyticsClient.runReport({ property, dateRanges, dimensions: [{ name: "dateRange" }], metrics: [{ name: "eventCount" }], dimensionFilter: makeEventFilter("peptide_view") }),
        analyticsClient.runReport({ property, dateRanges, dimensions: [{ name: "dateRange" }], metrics: [{ name: "eventCount" }], dimensionFilter: makeEventFilter("add_to_cart") }),
        analyticsClient.runReport({ property, dateRanges, dimensions: [{ name: "dateRange" }], metrics: [{ name: "eventCount" }], dimensionFilter: makeEventFilter("begin_checkout") }),
        analyticsClient.runReport({ property, dateRanges, dimensions: [{ name: "dateRange" }], metrics: [{ name: "eventCount" }], dimensionFilter: makeEventFilter("purchase") }),
        analyticsClient.runReport({ property, dateRanges: [dateRanges[0]], dimensions: [{ name: "country" }], metrics: [{ name: "activeUsers" }], orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }], limit: 5 }),
        analyticsClient.runReport({ property, dateRanges: [dateRanges[0]], dimensions: [{ name: "customEvent:peptide_name" }], metrics: [{ name: "eventCount" }], dimensionFilter: makeEventFilter("peptide_view"), orderBys: [{ metric: { metricName: "eventCount" }, desc: true }], limit: 5 }),
        analyticsClient.runReport({ property, dateRanges: [dateRanges[0]], dimensions: [{ name: "customEvent:protocol_name" }], metrics: [{ name: "eventCount" }], dimensionFilter: makeEventFilter("protocol_view"), orderBys: [{ metric: { metricName: "eventCount" }, desc: true }], limit: 5 }),
        analyticsClient.runReport({ property, dateRanges: [dateRanges[0]], dimensions: [{ name: "customEvent:search_term" }], metrics: [{ name: "eventCount" }], dimensionFilter: makeEventFilter("search"), orderBys: [{ metric: { metricName: "eventCount" }, desc: true }], limit: 5 }),
        analyticsClient.runReport({ property, dateRanges: [dateRanges[0]], dimensions: [{ name: "newVsReturning" }], metrics: [{ name: "activeUsers" }] }),
        analyticsClient.runReport({ property, dateRanges, dimensions: [{ name: "dateRange" }], metrics: [{ name: "averageSessionDuration" }, { name: "screenPageViewsPerSession" }] }),
        analyticsClient.runReport({ property, dateRanges, dimensions: [{ name: "dateRange" }], metrics: [{ name: "eventCount" }], dimensionFilter: makeEventFilter("search") }),
        analyticsClient.runReport({ property, dateRanges, dimensions: [{ name: "dateRange" }], metrics: [{ name: "eventCount" }], dimensionFilter: makeEventFilter("ai_session_start") }),
      ];

      const results = await Promise.allSettled(reportRequests);
      
      const getVal = (reportIdx, periodIdx, metricIdx = 0) => {
        const res = results[reportIdx];
        if (res.status !== "fulfilled" || !res.value?.[0]?.rows) return 0;
        const periodName = `date_range_${periodIdx}`;
        const row = res.value[0].rows.find(r => r.dimensionValues?.[0]?.value === periodName);
        return parseInt(row?.metricValues?.[metricIdx]?.value ?? "0", 10);
      };

      const calcTrend = (curr, prev) => {
        if (prev === 0) return curr > 0 ? 100 : 0;
        return Math.round(((curr - prev) / prev) * 100);
      };

      const m = (idx) => {
        const curr = getVal(idx, 0);
        const prev = getVal(idx, 1);
        return { current: curr, previous: prev, trend: calcTrend(curr, prev) };
      };

      const topRows = (reportIdx) => {
        const res = results[reportIdx];
        if (res.status !== "fulfilled" || !res.value?.[0]?.rows) return [];
        return res.value[0].rows.map(row => ({
          name: row.dimensionValues?.[0]?.value ?? "",
          count: parseInt(row.metricValues?.[0]?.value ?? "0", 10)
        }));
      };

      const visitors = getVal(0, 0, 0);
      const views    = getVal(1, 0) + getVal(2, 0);
      const cart     = getVal(3, 0);
      const checkout = getVal(4, 0);
      const orders   = getVal(5, 0);

      const newVsRetRes = results[10];
      let returningUsers = 0, newUsers = 0;
      if (newVsRetRes.status === "fulfilled" && newVsRetRes.value?.[0]?.rows) {
        for (const row of newVsRetRes.value[0].rows) {
          const seg = row.dimensionValues?.[0]?.value ?? "";
          const count = parseInt(row.metricValues?.[0]?.value ?? "0", 10);
          if (seg === "returning") returningUsers = count;
          else if (seg === "new") newUsers = count;
        }
      }
      const totalUsersForRatio = newUsers + returningUsers || 1;
      const returningRate = Math.round((returningUsers / totalUsersForRatio) * 100);

      const avgDuration = (() => {
        const r = results[11];
        if (r.status !== "fulfilled" || !r.value?.[0]?.rows) return { current: 0, trend: 0 };
        const curr = parseFloat(r.value[0].rows.find(row => row.dimensionValues?.[0]?.value === "date_range_0")?.metricValues?.[0]?.value ?? "0");
        const prev = parseFloat(r.value[0].rows.find(row => row.dimensionValues?.[0]?.value === "date_range_1")?.metricValues?.[0]?.value ?? "0");
        const trend = prev > 0 ? Math.round(((curr - prev) / prev) * 100) : (curr > 0 ? 100 : 0);
        return { current: Math.round(curr), trend };
      })();

      const pagesPerSession = (() => {
        const r = results[11];
        if (r.status !== "fulfilled" || !r.value?.[0]?.rows) return { current: 0, trend: 0 };
        const curr = parseFloat(r.value[0].rows.find(row => row.dimensionValues?.[0]?.value === "date_range_0")?.metricValues?.[1]?.value ?? "0");
        const prev = parseFloat(r.value[0].rows.find(row => row.dimensionValues?.[0]?.value === "date_range_1")?.metricValues?.[1]?.value ?? "0");
        const trend = prev > 0 ? Math.round(((curr - prev) / prev) * 100) : (curr > 0 ? 100 : 0);
        return { current: parseFloat(curr.toFixed(1)), trend };
      })();

      const searchEvents = getVal(12, 0);
      const searchEventsPrev = getVal(12, 1);
      const aiEvents = getVal(13, 0);
      const aiEventsPrev = getVal(13, 1);

      res.status(200).json({
        metrics: { visitors: m(0), protocolViews: m(1), peptideViews: m(2), addToCart: m(3), checkoutStarted: m(4), completedOrders: m(5) },
        health: {
          returningUsers: { current: returningUsers, trend: 0 },
          returningRate,
          newUsers: { current: newUsers, trend: 0 },
          avgSessionDuration: avgDuration,
          pagesPerSession,
          searchEvents: { current: searchEvents, previous: searchEventsPrev, trend: calcTrend(searchEvents, searchEventsPrev) },
          searchRate: visitors > 0 ? parseFloat((searchEvents / visitors).toFixed(2)) : 0,
          aiEvents: { current: aiEvents, previous: aiEventsPrev, trend: calcTrend(aiEvents, aiEventsPrev) },
          aiRate: visitors > 0 ? parseFloat((aiEvents / visitors).toFixed(2)) : 0,
        },
        funnel: [
          { label: "Active Visitors", value: visitors, pct: 100 },
          { label: "Content Engagement", value: views, pct: visitors > 0 ? Math.round((views / visitors) * 100) : 0 },
          { label: "Add to Cart", value: cart, pct: views > 0 ? Math.round((cart / views) * 100) : 0 },
          { label: "Checkout", value: checkout, pct: cart > 0 ? Math.round((checkout / cart) * 100) : 0 },
          { label: "Purchase", value: orders, pct: checkout > 0 ? Math.round((orders / checkout) * 100) : 0 },
        ],
        tops: { countries: topRows(6), peptides: topRows(7), protocols: topRows(8), searches: topRows(9) },
        generatedAt: new Date().toISOString(),
        periodDays: days,
      });

    } catch (err) {
      console.error("analyticsOverview error:", err);
      res.status(500).json({ error: "GA4 Internal Error" });
    }
  }
);
