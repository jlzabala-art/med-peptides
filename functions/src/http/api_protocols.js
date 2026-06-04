const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");

/**
 * publicProtocols
 * Edge-cached endpoint for fetching public protocols.
 * Reduces direct reads to Firestore from unauthenticated or heavy traffic.
 * Hosted on Firebase Hosting, it will be cached by the CDN.
 */
exports.publicProtocols = onRequest(
  {
    cors: true,
    maxInstances: 10,
    region: "europe-west1"
  },
  async (req, res) => {
    // Enable Edge Caching on CDN for 5 minutes (s-maxage) and browser for 1 minute (max-age)
    res.set("Cache-Control", "public, max-age=60, s-maxage=300");

    if (req.method !== "GET") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const db = getFirestore();
      
      // We only fetch active, public protocols
      const protocolsSnap = await db.collection("protocols")
        .where("visibility", "==", "public")
        .where("active", "==", true)
        .orderBy("updated_at", "desc")
        .limit(50) // Prevent massive payloads
        .get();

      const protocols = protocolsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Return the lightweight JSON
      res.status(200).json({
        success: true,
        count: protocols.length,
        data: protocols
      });
    } catch (error) {
      console.error("[publicProtocols] Error fetching public protocols:", error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }
);
