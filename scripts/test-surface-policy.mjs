#!/usr/bin/env node
/**
 * test-surface-policy.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Fast regression test suite for Atlas Health Navigation & Surface Policy:
 *   1. ONLY real Admin (not simulating a non-admin role) sees global menus.
 *   2. Guest, Patient, Doctor, Clinic, Wholesaler, Distributor, Supplier NEVER
 *      see global menus (AppSwitcher, B2BUniversalMenu, ClinicalFormatSwitcher,
 *      Global Search ⌘K, Global Breadcrumbs, Brand Home link).
 *   3. Admin simulating a non-admin role immediately loses global menus so
 *      preview accurately matches the real customer experience.
 *   4. Admin simulating ONLY a market (simulatedRole: null) keeps Admin menus.
 *
 * Usage: node scripts/test-surface-policy.mjs
 */

import assert from 'node:assert/strict';
import { getSurfacePolicy } from '../src/constants/surfacePolicy.js';

// 1. Real Admin -> full access
{
  const p = getSurfacePolicy({ effectiveRole: 'admin', isAdmin: true, isSimulating: false });
  assert.equal(p.canSeeGlobalMenus, true);
  assert.equal(p.canSeeAppSwitcher, true);
  assert.equal(p.canSeeB2BDrawer, true);
  assert.equal(p.canSeeFormatSwitcher, true);
  assert.equal(p.canSeeGlobalSearch, true);
  assert.equal(p.canSeeCostTier, true);
  assert.equal(p.canSeeDistributorTier, true);
  assert.equal(p.canEditPricesInline, true);
}

// 2. Every non-admin role -> NO global menus
const nonAdminRoles = [
  'guest',
  'patient',
  'doctor',
  'clinic',
  'wholesaler',
  'wholeseller',
  'distributor',
  'supplier',
  'medical_director',
  'account_manager',
  'sales_agent',
];
for (const role of nonAdminRoles) {
  const p = getSurfacePolicy({ effectiveRole: role, isAdmin: false, isSimulating: false });
  assert.equal(p.canSeeGlobalMenus, false, `Role ${role} must NOT see global menus`);
  assert.equal(p.canSeeAppSwitcher, false);
  assert.equal(p.canSeeB2BDrawer, false);
  assert.equal(p.canSeeFormatSwitcher, false);
  assert.equal(p.canSeeGlobalSearch, false);
  assert.equal(p.canSeeGlobalBreadcrumbs, false);
  assert.equal(p.canNavigateBrandHome, false);
  assert.equal(p.canSeeCostTier, false);
  assert.equal(p.canEditPricesInline, false);
  assert.equal(p.canSeeDistributorTier, role === 'distributor');
}

// 3. Admin simulating a non-admin role -> NO global menus
{
  const p = getSurfacePolicy({
    effectiveRole: 'wholesaler',
    isAdmin: true,
    isSimulating: true,
    simulatedRole: 'wholesaler',
  });
  assert.equal(p.canSeeGlobalMenus, false);
  assert.equal(p.canSeeB2BDrawer, false);
  assert.equal(p.canSeeFormatSwitcher, false);
  assert.equal(p.canSeeCostTier, false);
}

// 4. Admin simulating ONLY a market (no simulatedRole) -> keeps Admin menus
{
  const p = getSurfacePolicy({
    effectiveRole: 'admin',
    isAdmin: true,
    isSimulating: true,
    simulatedRole: null,
  });
  assert.equal(p.canSeeGlobalMenus, true);
  assert.equal(p.canSeeCostTier, true);
}

console.log('✅ All Surface Policy invariants PASSED (Admin-only global menus enforced across all roles & simulation modes).');
