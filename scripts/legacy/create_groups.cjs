async function createGroups() {
  const token = "1000.67c593faf63c35ffe51235a472503eef.08430c50e18358f473862fcb79e55528";
  const orgId = "662274409";
  const baseUrl = "https://www.zohoapis.com/inventory/v1/itemgroups";

  const headers = {
    "Authorization": `Zoho-oauthtoken ${token}`,
    "Content-Type": "application/json"
  };

  const peptidesPayload = {
    group_name: "Peptides",
    description: "Péptidos inyectables o tópicos",
    unit: "g", // Wait, user said API is grams, Peptides is probably vial
    attribute_name1: "Dosage",
    attribute_name2: "Via",
    items: [
      { name: "Peptide Base 5mg Subcutaneous", sku: "PEP-BASE-5-SQ", rate: 0, purchase_rate: 0, attribute_option_name1: "5mg", attribute_option_name2: "Subcutaneous" }
    ]
  };
  peptidesPayload.unit = "vial";

  const apiPayload = {
    group_name: "API",
    description: "Active Pharmaceutical Ingredients en crudo",
    unit: "g", 
    attribute_name1: "Category",
    items: [
      { name: "API Sample Peptides", sku: "API-SAMP-PEP", rate: 0, purchase_rate: 0, attribute_option_name1: "Peptides" },
      { name: "API Sample Supplements", sku: "API-SAMP-SUP", rate: 0, purchase_rate: 0, attribute_option_name1: "Supplements" }
    ]
  };

  try {
    console.log("Creating Peptides group...");
    const pepRes = await fetch(`${baseUrl}?organization_id=${orgId}`, { method: 'POST', headers, body: JSON.stringify(peptidesPayload) });
    const pepData = await pepRes.json();
    console.log("Peptides:", JSON.stringify(pepData));

    console.log("Creating API group...");
    const apiRes = await fetch(`${baseUrl}?organization_id=${orgId}`, { method: 'POST', headers, body: JSON.stringify(apiPayload) });
    const apiData = await apiRes.json();
    console.log("API:", JSON.stringify(apiData));

  } catch (err) {
    console.error("Error creating groups:", err);
  }
}

createGroups();
