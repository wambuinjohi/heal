import { useEffect } from 'react';
import { useCurrentCompany } from '@/contexts/CompanyContext';
import { getColorAsHslVar, lightenColor, darkenColor } from '@/utils/colorUtils';

/**
 * Hook to apply company branding colors to the application
 * Sets CSS variables for the primary color and its variants
 */
export const useCompanyBranding = () => {
  const currentCompany = useCurrentCompany();

  useEffect(() => {
    if (!currentCompany?.primary_color) {
      return; // No color to apply
    }

    const primaryColor = currentCompany.primary_color || '#FF8C42';
    
    // Convert hex color to HSL for CSS variables
    const primaryHsl = getColorAsHslVar(primaryColor);
    const hoverColor = darkenColor(primaryColor, 10);
    const hoverHsl = getColorAsHslVar(hoverColor);
    const lightColor = lightenColor(primaryColor, 25);
    const lightHsl = getColorAsHslVar(lightColor);

    // Apply CSS variables to root
    const root = document.documentElement;
    root.style.setProperty('--primary', primaryHsl);
    root.style.setProperty('--primary-hover', hoverHsl);
    root.style.setProperty('--primary-light', lightHsl);
    root.style.setProperty('--primary-foreground', '0 0% 100%'); // White

    // Store in localStorage for persistence across sessions
    try {
      localStorage.setItem('companyPrimaryColor', primaryColor);
    } catch (e) {
      console.warn('Failed to save color to localStorage:', e);
    }
  }, [currentCompany?.primary_color]);

  // Apply persisted color on mount
  useEffect(() => {
    try {
      const savedColor = localStorage.getItem('companyPrimaryColor');
      if (savedColor && (!currentCompany?.primary_color || currentCompany.primary_color === '#FF8C42')) {
        const primaryHsl = getColorAsHslVar(savedColor);
        const hoverColor = darkenColor(savedColor, 10);
        const hoverHsl = getColorAsHslVar(hoverColor);
        const lightColor = lightenColor(savedColor, 25);
        const lightHsl = getColorAsHslVar(lightColor);

        const root = document.documentElement;
        root.style.setProperty('--primary', primaryHsl);
        root.style.setProperty('--primary-hover', hoverHsl);
        root.style.setProperty('--primary-light', lightHsl);
      }
    } catch (e) {
      console.warn('Failed to load color from localStorage:', e);
    }
  }, []);
};
