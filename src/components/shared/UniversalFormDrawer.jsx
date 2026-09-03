"use client";

import React, { useState, useEffect } from 'react';
import { StandardDrawer, TextField, Select, Button, Autocomplete, SearchableSelect, AccountManagerSelect, CountrySelect } from '../ui';
import { toast } from 'react-hot-toast';

/**
 * UniversalFormDrawer
 * A generic form component rendered inside a StandardDrawer.
 * 
 * @param {boolean} isOpen - Controls drawer visibility
 * @param {function} onClose - Function to close the drawer
 * @param {string} title - Title of the drawer
 * UniversalForm
 * A generic form component that can be used standalone.
 */
export function UniversalForm({
  schema = [],
  initialData = {},
  onSubmit,
  submitLabel = "Save",
  customHeader = null,
  onValuesChange = null,
  initialMode = 'edit',
  onCancel = null
}) {
  const [currentMode, setCurrentMode] = useState(initialMode);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setCurrentMode(initialMode);
    const initial = {};
    schema.forEach(field => {
      initial[field.name] = initialData[field.name] !== undefined ? initialData[field.name] : '';
    });
    setFormData(initial);
    setErrors({});
  }, [initialData, schema, initialMode]);

  const handleChange = (name, value) => {
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    if (onValuesChange) onValuesChange(newData);
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    let isValid = true;
    schema.forEach(field => {
      if (field.required && (!formData[field.name] || String(formData[field.name]).trim() === '')) {
        newErrors[field.name] = `${field.label || field.name} is required`;
        isValid = false;
      }
    });
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setCurrentMode('view');
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error.message || "An error occurred while saving.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field) => {
    const value = formData[field.name] || '';
    const hasError = !!errors[field.name];
    const errorMessage = errors[field.name];

    if (currentMode === 'view') {
      let displayValue = value;
      if (field.type === 'select') {
         const opt = (field.options || []).find(o => o.value === value);
         displayValue = opt ? opt.label : value;
      }
      return (
        <div key={field.name} style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>{field.label}</label>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500, padding: '0.5rem 0' }}>{displayValue || '-'}</div>
        </div>
      );
    }

    switch (field.type) {
      case 'select':
        const selIsFullWidth = field.fullWidth;
        return (
          <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', gridColumn: selIsFullWidth ? '1 / -1' : 'auto' }}>
            <Select
              label={`${field.label} ${field.required ? '*' : ''}`}
              value={value}
              onChange={e => handleChange(field.name, e.target.value)}
              options={field.options}
              disabled={isSubmitting}
            />
            {hasError && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.2rem' }}>{errorMessage}</span>}
          </div>
        );
      case 'searchable-select':
        const ssIsFullWidth = field.fullWidth;
        return (
          <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', gridColumn: ssIsFullWidth ? '1 / -1' : 'auto' }}>
            <SearchableSelect
              label={`${field.label} ${field.required ? '*' : ''}`}
              value={value}
              onChange={val => handleChange(field.name, val)}
              options={field.options}
              placeholder={field.placeholder || "Search..."}
              disabled={isSubmitting}
              onCreateNew={field.onCreateNew}
            />
            {hasError && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.2rem' }}>{errorMessage}</span>}
          </div>
        );
      case 'autocomplete':
        const acIsFullWidth = field.fullWidth;
        return (
          <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', gridColumn: acIsFullWidth ? '1 / -1' : 'auto' }}>
            <Autocomplete
              label={`${field.label} ${field.required ? '*' : ''}`}
              value={value}
              onChange={(val) => handleChange(field.name, val)}
              placeholder={field.placeholder}
              disabled={isSubmitting}
              fetchSuggestions={field.fetchSuggestions}
              defaultSuggestions={field.defaultSuggestions}
            />
            {hasError && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.2rem' }}>{errorMessage}</span>}
          </div>
        );
      case 'account-manager-select':
        const amIsFullWidth = field.fullWidth;
        return (
          <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', gridColumn: amIsFullWidth ? '1 / -1' : 'auto' }}>
            <AccountManagerSelect
              label={field.label}
              value={value}
              onChange={(val) => handleChange(field.name, val)}
              placeholder={field.placeholder}
              disabled={isSubmitting}
              required={field.required}
            />
            {hasError && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.2rem' }}>{errorMessage}</span>}
          </div>
        );
      case 'country-select':
        const countryIsFullWidth = field.fullWidth;
        return (
          <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', gridColumn: countryIsFullWidth ? '1 / -1' : 'auto' }}>
            <CountrySelect
              label={field.label}
              value={value}
              onChange={(val) => handleChange(field.name, val)}
              placeholder={field.placeholder}
              disabled={isSubmitting}
              required={field.required}
            />
            {hasError && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.2rem' }}>{errorMessage}</span>}
          </div>
        );
      case 'checkbox-group':
        return (
          <div key={field.name} style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>{field.label} {field.required ? '*' : ''}</label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '0.75rem', 
              maxHeight: '200px', 
              overflowY: 'auto', 
              padding: '1rem', 
              border: '1px solid var(--border)', 
              borderRadius: '8px', 
              backgroundColor: 'var(--color-bg-surface)' 
            }}>
              {(field.options || []).map(opt => {
                const optValue = opt.value || opt;
                const optLabel = opt.label || opt;
                const isChecked = (value || []).includes(optValue);
                return (
                  <label key={optValue} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer', color: 'var(--text-main)' }}>
                    <input 
                      type="checkbox" 
                      checked={isChecked}
                      onChange={(e) => {
                        const currentValues = value || [];
                        const newValues = e.target.checked 
                          ? [...currentValues, optValue] 
                          : currentValues.filter(v => v !== optValue);
                        handleChange(field.name, newValues);
                      }}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                    />
                    {optLabel}
                  </label>
                );
              })}
            </div>
            {hasError && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.2rem' }}>{errorMessage}</span>}
          </div>
        );
      case 'textarea':
        return (
          <div key={field.name} style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>{field.label} {field.required ? '*' : ''}</label>
            <textarea
              value={value}
              onChange={e => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              disabled={isSubmitting}
              style={{ 
                padding: '0.85rem', 
                borderRadius: '8px', 
                border: '1px solid var(--border)', 
                minHeight: '120px',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                resize: 'vertical',
                backgroundColor: 'var(--color-bg-input, #fff)',
                color: 'var(--text-main)',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}
              className="app-textarea"
            />
            {hasError && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.2rem' }}>{errorMessage}</span>}
          </div>
        );
      case 'custom':
        const customIsFullWidth = field.fullWidth;
        return (
          <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', gridColumn: customIsFullWidth ? '1 / -1' : 'auto' }}>
            {field.render({ value, onChange: (val) => handleChange(field.name, val), formData })}
            {hasError && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.2rem' }}>{errorMessage}</span>}
          </div>
        );
      default:
        const isFullWidth = field.type === 'textarea' || field.type === 'checkbox-group' || field.fullWidth;
        
        const wrapperStyle = isFullWidth 
          ? { gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.35rem' }
          : { display: 'flex', flexDirection: 'column', gap: '0.35rem' };

        return (
          <div key={field.name} style={wrapperStyle}>
            <TextField
              type={field.type || 'text'}
              label={`${field.label} ${field.required ? '*' : ''}`}
              value={value}
              onChange={e => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              disabled={isSubmitting}
            />
            {hasError && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.2rem' }}>{errorMessage}</span>}
          </div>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem 0' }}>
      {customHeader}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '1.5rem',
        alignItems: 'start'
      }}>
         {schema.map(field => renderField(field))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
        {currentMode === 'edit' ? (
          <>
            <Button variant="ghost" onClick={() => {
              if (initialMode === 'view') setCurrentMode('view');
              else if (onCancel) onCancel();
            }} disabled={isSubmitting} style={{ color: 'var(--text-muted)' }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} loading={isSubmitting}>
              {isSubmitting ? 'Saving...' : submitLabel}
            </Button>
          </>
        ) : (
          <Button onClick={() => setCurrentMode('edit')}>
            Edit Details
          </Button>
        )}
      </div>
    </div>
  );
}

export default function UniversalFormDrawer({
  isOpen,
  onClose,
  title,
  schema = [],
  initialData = {},
  onSubmit,
  submitLabel = "Save",
  width = "500px",
  customHeader = null,
  onValuesChange = null,
  initialMode = 'edit'
}) {
  return (
    <StandardDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      width={width}
    >
      <UniversalForm 
        schema={schema}
        initialData={initialData}
        onSubmit={async (data) => {
          await onSubmit(data);
          onClose();
        }}
        submitLabel={submitLabel}
        customHeader={customHeader}
        onValuesChange={onValuesChange}
        initialMode={initialMode}
        onCancel={onClose}
      />
    </StandardDrawer>
  );
}
