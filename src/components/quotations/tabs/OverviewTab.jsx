import React from 'react';

export default function OverviewTab({ quotationId }) {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Overview for Quotation #{quotationId}</h2>
      <p>Basic information, client details, status, and summary.</p>
    </div>
  );
}
