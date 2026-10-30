'use client';

import React from 'react';
import PublicLabelsAppClient from '@/app/labels/PublicLabelsAppClient';

/**
 * AdminLabelsStudioTab
 * ─────────────────────────────────────────────────────────────────────────────
 * Embedded B2B Portal version of the Compounding Label Studio (`/admin/labels`).
 * Renders inside `PanelShell` under the LOGISTICS navigation section without
 * duplicating the standalone top brand header, user avatar dropdown, or bottom dock.
 */
export default function AdminLabelsStudioTab() {
  return (
    <div style={{ width: '100%' }}>
      <PublicLabelsAppClient embedded={true} />
    </div>
  );
}

