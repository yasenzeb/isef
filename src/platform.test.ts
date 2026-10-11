import { describe, it, expect } from 'vitest';
import { getFullPeriodicElements } from './data/periodicTableData';
import { EGYPT_GOVERNORATES } from './data/egyptLocationData';
import { translations } from './i18n/translations';

describe('Science Education Platform Automated Test Suite', () => {
  it('should include all 118 chemical elements in periodic table data', () => {
    const elements = getFullPeriodicElements();
    expect(elements).toHaveLength(118);
    expect(elements[0].symbol).toBe('H');
    expect(elements[117].symbol).toBe('Og');
  });

  it('should support full 4-language localization (EN, AR, FR, DE)', () => {
    const supportedLangs = ['en', 'ar', 'fr', 'de'] as const;
    for (const lang of supportedLangs) {
      expect(translations[lang]).toBeDefined();
      expect(translations[lang].appName).toBeTruthy();
      expect(translations[lang].nav.anatomy).toBeTruthy();
      expect(translations[lang].physics.mechanics).toBeTruthy();
      expect(translations[lang].chemistry.title).toBeTruthy();
      expect(translations[lang].biology.title).toBeTruthy();
      expect(translations[lang].geology.title).toBeTruthy();
    }
  });

  it('should maintain verified Egyptian governorates and administrations mapping', () => {
    expect(EGYPT_GOVERNORATES.length).toBeGreaterThanOrEqual(10);
    const cairo = EGYPT_GOVERNORATES.find(g => g.id === 'cairo');
    expect(cairo).toBeDefined();
    expect(cairo?.administrations.length).toBeGreaterThanOrEqual(5);
  });
});
