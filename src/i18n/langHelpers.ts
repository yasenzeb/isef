/**
 * langHelpers.ts
 * مساعد ترجمة النصوص إلى اللغات الخمس المعتمدة (ar, en, fr, de, ja)
 *
 * © SciNexa Platform — ISEF 2026
 */

import type { Language } from './translations';

export interface MultiLangString {
  ar: string;
  en: string;
  fr?: string;
  de?: string;
  ja?: string;
}

export function tLang(lang: Language, text: MultiLangString): string {
  if (lang === 'ja' && text.ja) return text.ja;
  if (lang === 'fr' && text.fr) return text.fr;
  if (lang === 'de' && text.de) return text.de;
  if (lang === 'ar' && text.ar) return text.ar;
  return text.en;
}
