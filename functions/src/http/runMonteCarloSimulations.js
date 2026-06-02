const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { callGemini } = require("./ai_utils");

exports.runMonteCarloSimulations = onCall({
  cors: true,
  maxInstances: 5
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be logged in.");
  }

  const { supplierMarkup, marketingCut, baseEbitda, mrr, cashBalance } = request.data;

  // Run 1000 lightweight simulated runs in memory
  // This is a simplified Monte Carlo approach: we introduce random variance (standard deviation of 5%)
  // to supplier costs and marketing efficiency across 1000 simulated quarters.
  
  let worstCaseEbitda = Infinity;
  let bestCaseEbitda = -Infinity;
  let simulatedEbitdaSum = 0;
  let failureRuns = 0; // runs where cash drops below 0

  for(let i=0; i<1000; i++) {
    // Normal distribution approximation for variance
    const randSupplierVar = (Math.random() + Math.random() + Math.random() - 1.5) * 0.10; // +/- 15% shock
    const randMarketingVar = (Math.random() + Math.random() + Math.random() - 1.5) * 0.15; // +/- 22% shock

    const simSupplierMarkup = (supplierMarkup / 100) + randSupplierVar;
    const simMarketingCut = (marketingCut / 100) + randMarketingVar;

    const arr = mrr * 12;
    const simEbitda = baseEbitda - (baseEbitda * simSupplierMarkup) + (arr * simMarketingCut);
    
    if (simEbitda < worstCaseEbitda) worstCaseEbitda = simEbitda;
    if (simEbitda > bestCaseEbitda) bestCaseEbitda = simEbitda;
    simulatedEbitdaSum += simEbitda;

    if (cashBalance + simEbitda < 0) {
      failureRuns++;
    }
  }

  const meanEbitda = simulatedEbitdaSum / 1000;
  const failureProbability = (failureRuns / 1000) * 100;

  // Ask Gemini to interpret the Monte Carlo results
  const prompt = `You are a strict CFO AI Advisor. 
We just ran a Monte Carlo simulation (1,000 iterations) with the following parameters:
- Baseline EBITDA: $${baseEbitda}
- Target Supplier Cost Increase: ${supplierMarkup}%
- Target Marketing Efficiency Gain: ${marketingCut}%
- Current Cash: $${cashBalance}

Simulation Results:
- Mean Projected EBITDA: $${meanEbitda.toFixed(2)}
- Worst Case EBITDA: $${worstCaseEbitda.toFixed(2)}
- Best Case EBITDA: $${bestCaseEbitda.toFixed(2)}
- Probability of Insolvency (Cash < 0): ${failureProbability.toFixed(1)}%

Provide a JSON response with:
{
  "risk_level": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "summary": "A 2-3 sentence executive summary of the stress test results.",
  "recommendation": "1 actionable financial maneuver to hedge against the worst-case scenario."
}`;

  try {
    const replyText = await callGemini(
      [{ role: "user", parts: [{ text: prompt }] }],
      "You are a strict CFO AI Advisor. Return exactly one JSON object and no markdown.",
      "gemini-2.0-flash",
      "application/json",
      1200,
      "admin"
    );
    
    let resultText = replyText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsedAi = JSON.parse(resultText);

    return {
      meanEbitda: meanEbitda,
      worstCase: worstCaseEbitda,
      bestCase: bestCaseEbitda,
      failureProbability: failureProbability,
      aiAnalysis: parsedAi
    };

  } catch (error) {
    console.error("Monte Carlo AI error:", error);
    throw new HttpsError("internal", "Failed to run AI stress test");
  }
});
