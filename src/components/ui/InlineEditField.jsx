import Edit2 from "lucide-react/dist/esm/icons/edit-2";
import Check from "lucide-react/dist/esm/icons/check";
import X from "lucide-react/dist/esm/icons/x";
import React, { useState, useRef, useEffect } from 'react';




export default function InlineEditField({
  value,
  onSave,
  type = 'text',
  options = [],
  placeholder = '',
  style = {},
  inputStyle = {},
  formatValue = (v) => v
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    let parsedValue = currentValue;
    if (type === 'number') {
      parsedValue = parseFloat(currentValue);
      if (isNaN(parsedValue)) parsedValue = 0;
    }
    onSave(parsedValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setCurrentValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  if (isEditing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', ...style }}>
        {type === 'select' ? (
          <select
            ref={inputRef}
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              padding: '4px 8px',
              border: '1px solid var(--primary)',
              borderRadius: '4px',
              fontSize: '0.85rem',
              outline: 'none',
              ...inputStyle
            }}
          >
            {options.map((opt) => (
              <option key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            ref={inputRef}
            type={type}
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            style={{
              padding: '4px 8px',
              border: '1px solid var(--primary)',
              borderRadius: '4px',
              fontSize: '0.85rem',
              outline: 'none',
              width: '100%',
              ...inputStyle
            }}
          />
        )}
        <button
          onClick={handleSave}
          title="Save"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '4px'
          }}
        >
          <Check size={16} />
        </button>
        <button
          onClick={handleCancel}
          title="Cancel"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '4px'
          }}
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div 
      style={{ display: 'flex', alignItems: 'center', gap: '8px', group: 'inline-edit', ...style }}
      onDoubleClick={() => setIsEditing(true)}
    >
      <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', ...inputStyle }}>
        {formatValue(value)}
      </span>
      <button
        onClick={() => setIsEditing(true)}
        className="inline-edit-btn"
        title="Edit"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '4px', opacity: 0.6, transition: 'opacity 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = 1}
        onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
      >
        <Edit2 size={12} />
      </button>
    </div>
  );
}