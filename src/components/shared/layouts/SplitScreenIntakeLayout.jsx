import Upload from "lucide-react/dist/esm/icons/upload";
import React from 'react';


/**
 * Generic Split-Screen Intake Layout.
 * Used for Prescriptions, Pricing Import, Lab Results, etc.
 * 
 * @param {boolean} active - Whether an item is currently selected for analysis.
 * @param {ReactNode} leftPanel - The component to render on the left (usually document viewer).
 * @param {ReactNode} rightPanel - The component to render on the right (intelligence tools).
 * @param {ReactNode} emptyStateLeft - Custom empty state for the left panel.
 * @param {ReactNode} emptyStateRight - Custom empty state for the right panel.
 */
export default function SplitScreenIntakeLayout({
  active,
  leftPanel,
  rightPanel,
  emptyStateLeft,
  emptyStateRight
}) {
  if (!active) {
    return (
      <div style={{ display: 'flex', gap: '24px', height: '100%', minHeight: '600px' }}>
        {/* Left: Empty State Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {emptyStateLeft || (
            <div style={{ 
              flex: 1, 
              background: '#fff', 
              border: '2px dashed #cbd5e1', 
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '48px',
            }}>
              <Upload size={48} color="#94a3b8" style={{ marginBottom: '16px' }} />
              <h3 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>Upload Document</h3>
              <p style={{ margin: 0, color: '#64748b', textAlign: 'center' }}>
                Please select a file to begin the analysis.
              </p>
            </div>
          )}
        </div>

        {/* Right: Rules/Settings Area */}
        <div style={{ width: '400px', display: 'flex', flexDirection: 'column' }}>
          {emptyStateRight || (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              Waiting for document...
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '24px', height: '100%', minHeight: '600px' }}>
      {/* Left Column: Document / Source */}
      <div style={{ 
        flex: 1, 
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        overflowY: 'auto'
      }}>
        {leftPanel}
      </div>

      {/* Right Column: Intelligence & Actions */}
      <div style={{ 
        width: '500px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '24px',
        overflowY: 'auto',
        paddingRight: '8px'
      }}>
        {rightPanel}
      </div>

    </div>
  );
}