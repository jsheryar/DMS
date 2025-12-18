
'use client';

// IMPORTANT: This is a mock branding system for local development and demonstration.

const BRANDING_KEY = 'branding_settings';

export type BrandingSettings = {
  departmentName?: string;
  logoUrl?: string;
};

// This function gets the branding settings from localStorage.
export const getBrandingSettings = (): BrandingSettings => {
  if (typeof window === 'undefined') {
    return { departmentName: 'DocuSafe', logoUrl: '' };
  }
  const settingsJson = localStorage.getItem(BRANDING_KEY);
  if (settingsJson) {
    return JSON.parse(settingsJson);
  }
  // Default values if nothing is set
  const defaultSettings = { departmentName: 'DocuSafe' };
  localStorage.setItem(BRANDING_KEY, JSON.stringify(defaultSettings));
  return defaultSettings;
};

// This function saves the branding settings to localStorage.
export const setBrandingSettings = (settings: BrandingSettings) => {
  if (typeof window !== 'undefined') {
    const currentSettings = getBrandingSettings();
    const newSettings = { ...currentSettings, ...settings };
    localStorage.setItem(BRANDING_KEY, JSON.stringify(newSettings));
    // Dispatch a storage event to notify other tabs/windows of the change
    window.dispatchEvent(new Event('storage'));
  }
};
