const { scoreMatch, matchCatalogs } = require("../fuzzy_matcher");

describe("fuzzy_matcher integration scoring and catalog matching", () => {
  describe("scoreMatch", () => {
    it("should return 100 confidence for exact SKU match", () => {
      const fbProduct = {
        firebase_product_id: "p1",
        firebase_sku: "SKU-12345",
        name: "Peptide Alpha"
      };
      const zohoItem = {
        item_id: "z1",
        sku: "SKU-12345",
        name: "Some Other Name"
      };

      const result = scoreMatch(fbProduct, zohoItem);
      expect(result.confidence).toBe(100);
      expect(result.reasoning).toContain("Exact SKU match");
    });

    it("should match by similar names and calculate dice similarity", () => {
      const fbProduct = {
        firebase_product_id: "p2",
        firebase_sku: "SKU-A",
        name: "BPC 157 5mg Vial",
        description: "High purity research peptide BPC-157"
      };
      const zohoItem = {
        item_id: "z2",
        sku: "SKU-B",
        name: "BPC-157 5 mg",
        description: "Reconstituted peptide BPC 157 for lab research"
      };

      const result = scoreMatch(fbProduct, zohoItem);
      expect(result.confidence).toBeGreaterThan(60);
      expect(result.reasoning).toContain("name similarity");
      expect(result.reasoning).toContain("dosage overlap");
      expect(result.reasoning).toContain("same category");
    });

    it("should handle low similarity cases gracefully", () => {
      const fbProduct = {
        firebase_product_id: "p3",
        firebase_sku: "SKU-C",
        name: "GHK-Cu Serum",
        description: "Skincare formulation with copper peptide"
      };
      const zohoItem = {
        item_id: "z3",
        sku: "SKU-D",
        name: "NMN 250mg Capsules",
        description: "NAD booster supplement"
      };

      const result = scoreMatch(fbProduct, zohoItem);
      expect(result.confidence).toBeLessThan(40);
      expect(result.reasoning).toContain("Low similarity across all signals");
    });
  });

  describe("matchCatalogs", () => {
    it("should match lists of Firebase products against Zoho items and sort by confidence", () => {
      const firebaseProducts = [
        { firebase_product_id: "fb-1", firebase_sku: "SKU-1", name: "BPC-157 5mg" },
        { firebase_product_id: "fb-2", firebase_sku: "SKU-2", name: "NMN 500mg" },
        { firebase_product_id: "fb-3", firebase_sku: "SKU-3", name: "Unmatched Compound" }
      ];

      const zohoItems = [
        { item_id: "zh-1", sku: "SKU-1", name: "BPC-157 5mg" },
        { item_id: "zh-2", sku: "SKU-99", name: "NMN Nicotinamide 500mg" }
      ];

      const matches = matchCatalogs(firebaseProducts, zohoItems, 55);

      expect(matches).toHaveLength(2);
      expect(matches[0].firebase_product_id).toBe("fb-1");
      expect(matches[0].confidence).toBe(100); // SKU exact match

      expect(matches[1].firebase_product_id).toBe("fb-2");
      expect(matches[1].confidence).toBeGreaterThan(60); // name matching
    });
  });
});
