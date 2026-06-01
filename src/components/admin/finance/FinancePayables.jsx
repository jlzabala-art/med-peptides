import React from 'react';
import PayoutManagerWidget from '../gadgets/PayoutManagerWidget';

export default function FinancePayables() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <PayoutManagerWidget />
      </div>
    </div>
  );
}