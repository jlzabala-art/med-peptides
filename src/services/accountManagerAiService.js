export const getChurnPredictions = async (managerId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          clientId: 'c1',
          clientName: 'Dr. Smith Clinic',
          churnRisk: 'High',
          riskScore: 82,
          reason: 'No orders placed in the last 45 days. Previously ordered 50 vials of BPC-157 monthly.',
          nextBestAction: 'Offer a 10% discount on BPC-157 bulk orders.',
        },
        {
          clientId: 'c2',
          clientName: 'LifeSpan Wellness',
          churnRisk: 'Medium',
          riskScore: 55,
          reason: 'Decreased volume by 30% month-over-month.',
          nextBestAction: 'Schedule a call to discuss the new peptide pricing matrix.',
        }
      ]);
    }, 1200);
  });
};

export const generatePitch = async (clientId, clientName, context) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`**Personalized Pitch for ${clientName}**\n\nBased on your recent discussions and their focus on ${context}, we recommend highlighting our newly arrived Semaglutide stock and the volume-based discounts. Let them know we can lock in the current price for 6 months if they sign a minimum order agreement.`);
    }, 1500);
  });
};
