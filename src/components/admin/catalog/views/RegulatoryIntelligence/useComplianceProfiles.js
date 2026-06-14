/* eslint-disable react-hooks/purity */
import { useMemo } from 'react';

const MARKETS = ['UAE', 'KSA', 'Qatar', 'Oman', 'Bahrain', 'Europe'];

export function useComplianceProfiles(variants = []) {
  return useMemo(() => {
    const profiles = [];

    if (!variants || variants.length === 0) return { profiles: [], metrics: {}, priorityQueue: [] };

    variants.forEach((v) => {
      // Deterministically generate a subset of markets based on variant ID
      const seed = v.id
        ? v.id.charCodeAt(0) + v.id.charCodeAt(v.id.length - 1)
        : Math.random() * 100;
      const numMarkets = 1 + (seed % 4); // 1 to 4 markets

      for (let i = 0; i < numMarkets; i++) {
        const market = MARKETS[(seed + i) % MARKETS.length];

        // Deterministic status generation
        const s1 = (seed + i * 2) % 10;
        const s2 = (seed + i * 3) % 10;
        const s3 = (seed + i * 5) % 10;
        const s4 = (seed + i * 7) % 10;
        const s5 = (seed + i * 11) % 10;

        const profile = {
          id: `${v.id}-${market}`,
          variantId: v.id,
          productId: v.productId || `prod-${seed}`,
          productName: v.productName || v.name?.split('-')[0]?.trim() || 'Unknown Product',
          variantName: `${v.format || ''} ${v.size || ''}`.trim() || 'Standard',
          supplier: v.supplier || 'Unassigned',
          market: market,
          status: {
            registration: s1 > 2 ? 'Active' : s1 === 2 ? 'Pending' : 'Expired',
            coa: s2 > 1 ? 'Valid' : 'Missing',
            gmp: s3 > 1 ? 'Valid' : 'Expired',
            importPermit: s4 > 2 ? 'Active' : 'Missing',
            cpp: s5 > 3 ? 'Valid' : 'Missing',
            stability: s1 > 1 ? 'Valid' : 'Missing',
            msds: 'Valid',
            tds: 'Valid',
          },
          expiryDates: {
            registration: new Date(Date.now() + (s1 * 10 - 5) * 86400000).toISOString(),
            gmp: new Date(Date.now() + (s3 * 15 - 10) * 86400000).toISOString(),
            importPermit: new Date(Date.now() + (s4 * 20 - 5) * 86400000).toISOString(),
            coa: new Date(Date.now() + (s2 * 30 - 15) * 86400000).toISOString(),
            cpp: new Date(Date.now() + (s5 * 25 - 5) * 86400000).toISOString(),
          },
        };

        // Risk Engine Logic
        let riskScore = 0;
        let riskFactors = [];

        if (profile.status.registration === 'Expired') {
          riskScore += 40;
          riskFactors.push('Expired Registration');
        }
        if (profile.status.coa === 'Missing') {
          riskScore += 30;
          riskFactors.push('Missing COA');
        }
        if (profile.status.gmp !== 'Valid') {
          riskScore += 30;
          riskFactors.push('Invalid GMP');
        }
        if (profile.status.importPermit === 'Missing') {
          riskScore += 20;
          riskFactors.push('Missing Import Permit');
        }
        if (profile.status.cpp === 'Missing') {
          riskScore += 10;
          riskFactors.push('Missing CPP');
        }

        if (riskScore >= 70) profile.riskLevel = 'Critical';
        else if (riskScore >= 40) profile.riskLevel = 'High';
        else if (riskScore >= 20) profile.riskLevel = 'Medium';
        else profile.riskLevel = 'Low';

        profile.riskFactors = riskFactors;

        profiles.push(profile);
      }
    });

    // Calculate Dashboard Metrics
    const metrics = {
      totalProfiles: profiles.length,
      fullyCompliant: profiles.filter((p) => p.riskLevel === 'Low').length,
      highRisk: profiles.filter((p) => p.riskLevel === 'High' || p.riskLevel === 'Critical').length,
      missingCOA: profiles.filter((p) => p.status.coa === 'Missing').length,
      missingGMP: profiles.filter((p) => p.status.gmp !== 'Valid').length,
      expiringRegs: profiles.filter((p) => {
        const days = (new Date(p.expiryDates.registration) - new Date()) / 86400000;
        return days > 0 && days <= 30;
      }).length,
      missingPermits: profiles.filter((p) => p.status.importPermit === 'Missing').length,
    };

    // Priority Queue Generation
    const priorityQueue = [];
    profiles.forEach((p) => {
      if (p.status.registration === 'Expired') {
        priorityQueue.push({
          id: `q-reg-${p.id}`,
          profile: p,
          type: 'Critical',
          issue: 'Registration Expired',
        });
      } else if (p.status.coa === 'Missing') {
        priorityQueue.push({ id: `q-coa-${p.id}`, profile: p, type: 'High', issue: 'Missing COA' });
      } else if (p.status.gmp !== 'Valid') {
        priorityQueue.push({
          id: `q-gmp-${p.id}`,
          profile: p,
          type: 'High',
          issue: 'GMP Expired/Missing',
        });
      } else {
        const daysReg = (new Date(p.expiryDates.registration) - new Date()) / 86400000;
        if (daysReg > 0 && daysReg <= 30) {
          priorityQueue.push({
            id: `q-regexp-${p.id}`,
            profile: p,
            type: 'Medium',
            issue: `Registration expires in ${Math.ceil(daysReg)} days`,
          });
        }
      }
    });

    priorityQueue.sort((a, b) => {
      const order = { Critical: 3, High: 2, Medium: 1 };
      return order[b.type] - order[a.type];
    });

    return { profiles, metrics, priorityQueue };
  }, [variants]);
}
