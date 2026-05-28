const ENDPOINT = 'https://clinicalaiassistant-jtlgnxrofa-ew.a.run.app';

async function sendQueryWithContext(testName, message, pageContext) {
  const payload = {
    message,
    sessionId: "test-session-view-" + Date.now(),
    query_type: "general",
    context: {
      page_context: pageContext
    }
  };

  console.log(`\n--------------------------------------------------`);
  console.log(`[TEST] ${testName}`);
  console.log(`Query: "${message}"`);
  console.log(`Active Page: ${pageContext.path}`);
  console.log(`Active Entity Name: ${pageContext.activeEntityData?.name || pageContext.activeEntityData?.title}`);
  
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`❌ Failed: HTTP ${response.status} - ${text}`);
      return;
    }

    const data = await response.json();
    console.log(`✅ Success! Response length: ${data.reply?.length || 0}`);
    console.log(`Snippet of reply:\n${data.reply?.slice(0, 350)}...\n`);
  } catch (err) {
    console.error(`❌ Error during fetch:`, err);
  }
}

async function runViewContextTests() {
  // Test 1: Product Page (BPC-157)
  await sendQueryWithContext(
    "Product Page Context (BPC-157)",
    "What is the recommended dose and route of administration for this compound?",
    {
      path: "/product/bpc-157",
      isProductPage: true,
      isSupplementPage: false,
      isProtocolPage: false,
      activeEntity: "bpc-157",
      activeEntityData: {
        id: "bpc-157-5mg-vial",
        name: "BPC-157",
        displayName: "BPC-157 5mg Vial",
        slug: "bpc-157",
        desc: "Body Protection Compound-157 is a pentadecapeptide investigated for tissue healing and recovery.",
        category: "Peptides",
        objective: "Accelerate tissue, joint, and tendon recovery"
      }
    }
  );

  // Test 2: Supplement Page (NMN)
  await sendQueryWithContext(
    "Supplement Page Context (NMN)",
    "What are the main anti-aging benefits of this supplement?",
    {
      path: "/supplements/nmn",
      isProductPage: false,
      isSupplementPage: true,
      isProtocolPage: false,
      activeEntity: "nmn",
      activeEntityData: {
        id: "nmn-capsules",
        name: "NMN",
        displayName: "NMN 500mg Capsules",
        slug: "nmn",
        desc: "Nicotinamide Mononucleotide is a direct NAD+ precursor supporting cellular energy and longevity.",
        category: "Supplements",
        objective: "Mitochondrial support and longevity"
      }
    }
  );

  // Test 3: Protocol Page (Neuro-Restoration)
  await sendQueryWithContext(
    "Protocol Page Context (Semax & Selank Protocol)",
    "How long does the study last and what are the goals?",
    {
      path: "/protocol/neuro-restoration-advanced",
      isProductPage: false,
      isSupplementPage: false,
      isProtocolPage: true,
      activeEntity: "neuro-restoration-advanced",
      activeEntityData: {
        id: "neuro_001",
        protocol_id: "neuro_001",
        title: "Advanced Neuro-Restoration Protocol",
        protocol_title: "Advanced Neuro-Restoration Protocol",
        slug: "neuro-restoration-advanced",
        description: "A clinical protocol pairing Semax, Selank, and Pinealon for cognitive optimization and neural repair.",
        primary_goal: "Cognitive performance and focus"
      }
    }
  );
}

runViewContextTests();
