#!/usr/bin/env node
/**
 * test-surface-policy.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Fast regression test suite for Atlas Health Navigation & Surface Policy:
 *   1. ONLY real Admin (not simulating a non-admin role) sees global menus.
 *   2. Guest & signed share-link visitors see ZERO menus (neither global nor role menu).
 *   3. Authenticated non-admin roles see ONLY their concise role-scoped menu
 *      with ZERO forbidden routes (/admin, /supplier for patients/doctors, etc.).
 *   4. `allowedSchedules` restricts pricing schedule links in the role menu.
 *   5. Admin simulating a non-admin role sees that role's exact menu (or 0 for guest).
 *
 * Usage: node scripts/test-surface-policy.mjs
 */

import assert from 'node:assert/strict';
import { getSurfacePolicy } from '../src/constants/surfacePolicy.js';
import { getRoleMenuItems } from '../src/constants/roleNavigationRegistry.js';

// 1. Real Admin -> full global menus, no secondary role menu needed
{
  const p = getSurfacePolicy({ effectiveRole: 'admin', isAdmin: true, isSimulating: false });
  assert.equal(p.canSeeGlobalMenus, true);
  assert.equal(p.canSeeRoleMenu, false);
  assert.equal(p.canSeeCostTier, true);
  assert.equal(p.canEditPricesInline, true);
  assert.deepEqual(getRoleMenuItems({ role: 'admin' }), []);
}

// 2. Guest & signed share-link visitor -> ZERO menus
{
  const g = getSurfacePolicy({ effectiveRole: 'guest', isAdmin: false });
  assert.equal(g.canSeeGlobalMenus, false);
  assert.equal(g.canSeeRoleMenu, false);
  assert.deepEqual(getRoleMenuItems({ role: 'guest' }), []);

  const shared = getSurfacePolicy({ effectiveRole: 'distributor', isAdmin: false, hasShareGrant: true });
  assert.equal(shared.canSeeGlobalMenus, false);
  assert.equal(shared.canSeeRoleMenu, false);
  assert.deepEqual(getRoleMenuItems({ role: 'distributor', hasShareGrant: true }), []);
}

// 3. Authenticated non-admin roles -> role-scoped menu ONLY, zero forbidden routes
const roleExpectations = [
  { role: 'distributor', forbidden: ['/admin', '/labels', '/supplier', '/patient'] },
  { role: 'wholesaler', forbidden: ['/admin', '/labels', '/supplier', '/patient'] },
  { role: 'doctor', forbidden: ['/admin', '/supplier', '/wholesaler'] },
  { role: 'clinic', forbidden: ['/admin', '/supplier', '/wholesaler'] },
  { role: 'patient', forbidden: ['/admin', '/pricing', '/doctor', '/wholesaler', '/labels', '/supplier'] },
  { role: 'account_manager', forbidden: ['/admin', '/supplier', '/wholesaler'] },
  { role: 'supplier', forbidden: ['/admin', '/patient', '/pricing'] },
];

for (const { role, forbidden } of roleExpectations) {
  const p = getSurfacePolicy({ effectiveRole: role, isAdmin: false });
  assert.equal(p.canSeeGlobalMenus, false, `${role} must NOT see global menus`);
  assert.equal(p.canSeeRoleMenu, true, `${role} SHOULD see its own concise role menu`);
  assert.equal(p.canSeeCostTier, false, `${role} must NOT see internal costs`);

  const items = getRoleMenuItems({ role, market: 'qatar' });
  assert.ok(items.length >= 2 && items.length <= 6, `${role} menu should be concise (2–6 items), got ${items.length}`);
  for (const item of items) {
    for (const bad of forbidden) {
      assert.ok(!item.href.startsWith(bad), `${role} menu must NOT link to ${bad} (got ${item.href})`);
    }
  }
}

// 4. allowedSchedules restricts pricing items in role menu
{
  const restricted = getRoleMenuItems({
    role: 'distributor',
    market: 'qatar',
    allowedSchedules: ['24genetics', 'colway'],
  });
  const hrefs = restricted.map((i) => i.href);
  assert.ok(hrefs.includes('/pricing/24genetics?market=qatar'));
  assert.ok(hrefs.includes('/pricing/colway?market=qatar'));
  assert.ok(!hrefs.some((h) => h.startsWith('/pricing/peptides')));
}

// 5. Admin simulating a non-admin role -> sees that role's menu; simulating guest -> 0 menus
{
  const simDoc = getSurfacePolicy({
    effectiveRole: 'doctor',
    isAdmin: true,
    isSimulating: true,
    simulatedRole: 'doctor',
  });
  assert.equal(simDoc.canSeeGlobalMenus, false);
  assert.equal(simDoc.canSeeRoleMenu, true);

  const simGuest = getSurfacePolicy({
    effectiveRole: 'guest',
    isAdmin: true,
    isSimulating: true,
    simulatedRole: 'guest',
  });
  assert.equal(simGuest.canSeeGlobalMenus, false);
  assert.equal(simGuest.canSeeRoleMenu, false);
}

console.log('✅ All Surface Policy & Role Menu invariants PASSED (Admin global menus, concise role-scoped menus, zero menus for guest/share-links).');
