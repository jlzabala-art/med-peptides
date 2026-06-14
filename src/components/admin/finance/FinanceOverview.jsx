import React from 'react';
import CFOIntelligenceHub from './cfo-hub/CFOIntelligenceHub';

export default function FinanceOverview({ dashboardData, totalBalance, activeSubs }) {
  // We pass the existing finance data into the new Hub
  return <CFOIntelligenceHub data={{ dashboardData, activeSubs }} totalBalance={totalBalance} />;
}