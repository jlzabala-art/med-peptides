import FileEdit from "lucide-react/dist/esm/icons/file-edit";
import X from "lucide-react/dist/esm/icons/x";
import React from 'react';


import Button from './Button';

export default function DraftBanner({ 
  onResume, 
  onDiscard, 
  lastSavedDate,
  title = "You have an unsaved draft"
}) {
  return (
    <div 
      className="fade-in"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--color-primary)',
        borderRadius: '8px',
        marginBottom: '24px',
        gap: '16px',
        flexWrap: 'wrap'
      }}
      role="region"
      aria-label="Draft recovery"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '200px' }}>
        <div style={{ 
          width: '32px', height: '32px', borderRadius: '50%', 
          backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <FileEdit size={16} />
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)' }}>
            {title}
          </div>
          {lastSavedDate && (
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Last saved {lastSavedDate instanceof Date ? lastSavedDate.toLocaleTimeString() : lastSavedDate}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onDiscard}
          style={{ color: 'var(--color-text-muted)' }}
        >
          Discard
        </Button>
        <Button 
          variant="primary" 
          size="sm" 
          onClick={onResume}
        >
          Resume Draft
        </Button>
      </div>
    </div>
  );
}