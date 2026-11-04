import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Language } from '../../i18n/translations';
import { Globe, ChevronDown, Check } from 'lucide-react';

const LANGUAGES: { code: Language; name: string; nativeName: string; flag: string }[] = [
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇪🇬' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
];

export const LanguageSelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div ref={containerRef} className="relative inline-block text-start">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="sn-btn sn-btn-outline sn-btn-sm !h-8 !px-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#171717] dark:text-white border-[#e5e5e5] dark:border-white/15 bg-white dark:bg-white/5 hover:bg-[#f5f5f5] dark:hover:bg-white/10 transition-colors"
        aria-label="Select language"
        aria-expanded={open}
      >
        <Globe size={13} strokeWidth={1.8} className="text-[#737373] dark:text-white/60 shrink-0" />
        <span>{compact ? current.code.toUpperCase() : current.nativeName}</span>
        <ChevronDown size={11} strokeWidth={2} className={`text-[#a3a3a3] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute end-0 top-full mt-1.5 z-50 w-44 rounded-2xl border border-[#e5e5e5] dark:border-white/15 bg-white dark:bg-[#18181b] p-1.5 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#a3a3a3] dark:text-white/40">
            Languages · اللغات
          </div>
          <div className="space-y-0.5 mt-0.5">
            {LANGUAGES.map((lang) => {
              const active = lang.code === language;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[12px] font-medium transition-colors ${
                    active
                      ? 'bg-[#0a0a0a] text-white dark:bg-white dark:text-[#0a0a0a]'
                      : 'text-[#171717] dark:text-white/80 hover:bg-[#f5f5f5] dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[13px]">{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                  </div>
                  {active && <Check size={13} strokeWidth={2.4} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
