import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GlobalPreferencesDropdown from '../components/shared/AppHeader/GlobalPreferencesDropdown';
import { useShop } from '../context/ShopProvider';
import { usePreferences } from '../context/PreferencesContext';
import { useTranslation } from 'react-i18next';
import React from 'react';

// Mock Dependencies
vi.mock('../stores/uiStore', () => ({
  useUIStore: vi.fn(),
}));

vi.mock('../context/PreferencesContext', () => ({
  usePreferences: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}));

vi.mock('../context/ShopProvider', () => ({
  useShop: vi.fn(),
}));

describe('GlobalPreferencesDropdown Component', () => {
  it('renders default state accurately', () => {
    // Setup Mocks
    useShop.mockReturnValue({
      region: 'us',
      setRegion: vi.fn(),
    });
    usePreferences.mockReturnValue({
      currency: 'USD',
      updateCurrency: vi.fn(),
      density: 'comfortable',
      updateDensity: vi.fn(),
    });
    useTranslation.mockReturnValue({
      i18n: { language: 'en', changeLanguage: vi.fn() }
    });

    render(<GlobalPreferencesDropdown />);

    // Assert Initial Render
    expect(screen.getByText('EN')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
  });

  it('opens dropdown when clicked', () => {
    useShop.mockReturnValue({ region: 'us', setRegion: vi.fn() });
    usePreferences.mockReturnValue({
      currency: 'USD',
      updateCurrency: vi.fn(),
      density: 'comfortable',
      updateDensity: vi.fn(),
    });
    useTranslation.mockReturnValue({
      i18n: { language: 'en', changeLanguage: vi.fn() }
    });

    render(<GlobalPreferencesDropdown />);
    
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);
    
    // Check if the dropdown menu appeared (look for language selection text)
    expect(screen.getByText('Preferences')).toBeInTheDocument();
    expect(screen.getByText('Language')).toBeInTheDocument();
    expect(screen.getByText('Currency')).toBeInTheDocument();
  });
});
