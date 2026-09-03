"use client";

import React, { useMemo } from 'react';
import SearchableSelect from './SearchableSelect';
import { useAccountManagers } from '../../hooks/admin/useAccountManagers';

export default function AccountManagerSelect({
  value,
  onChange,
  label = "Account Manager",
  placeholder = "Search account managers...",
  disabled = false,
  required = false
}) {
  const { accountManagers, loading } = useAccountManagers({ pageSize: 100 });

  const options = useMemo(() => {
    if (!accountManagers) return [];
    return accountManagers.map(am => ({
      value: am.email,
      label: am.name || am.displayName || am.email,
      subLabel: am.email !== (am.name || am.displayName) ? am.email : ''
    }));
  }, [accountManagers]);

  return (
    <SearchableSelect
      label={`${label} ${required ? '*' : ''}`}
      value={value}
      onChange={onChange}
      options={options}
      placeholder={loading ? "Loading managers..." : placeholder}
      disabled={disabled || loading}
    />
  );
}
