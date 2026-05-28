import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export function useHeroState() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [clinicQuery, setClinicQuery] = useState('');
  const [selectedChip, setSelectedChip] = useState('');

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return;
    sessionStorage.setItem('search_query', searchQuery);
    window.location.href = `/search?query=${encodeURIComponent(searchQuery)}`;
  }, [searchQuery]);

  const handleChipSelect = useCallback((chip) => {
    setSearchQuery(chip);
    setSelectedChip(chip);
    handleSearch();
  }, []);

  const handleAsk = useCallback(() => {
    if (!clinicQuery.trim()) return;
    // Trigger ClinicAI via custom event
    const event = new CustomEvent('open-clinical-ai', {
      detail: { query: clinicQuery, autoSend: true },
    });
    window.dispatchEvent(event);
  }, [clinicQuery]);

  const triggerUpload = useCallback(() => {
    const event = new CustomEvent('trigger-prescription-upload');
    window.dispatchEvent(event);
  }, []);

  return {
    user,
    searchQuery,
    setSearchQuery,
    clinicQuery,
    setClinicQuery,
    selectedChip,
    handleSearch,
    handleChipSelect,
    handleAsk,
    triggerUpload,
  };
}
