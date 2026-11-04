import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../i18n/translations';
import { UserProfileCard } from './UserProfileCard';
import {
  Atom, Languages, MapPin, Download, Presentation
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenLocationModal: () => void;
  onOpenOfflineModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenLocationModal,
  onOpenOfflineModal
}) => {
  const { language, setLanguage, t, isRTL } = useLanguage();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  return (
    <header
      className="sticky top-0 z-50 shadow-xl"
      style={{
        background: 'rgba(0,0,0,0.80)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-3">

          {/* ── Brand ── */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none shrink-0 active:scale-95 transition-transform duration-150"
            onClick={() => setCurrentTab('home')}
          >
            <div
              className="w-9 h-9 flex items-center justify-center shrink-0"
              style={{
                borderRadius: '22.37%',
                background: 'linear-gradient(135deg, #007AFF, #5856D6)',
                boxShadow: '0 4px 16px rgba(0,122,255,0.4), inset 0 1px 1px rgba(255,255,255,0.3)'
              }}
            >
              <Atom className="w-5 h-5 text-white" />
            </div>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-black tracking-tight text-white font-sans">SciNexa</span>
                {/* ── Digital Fingerprint Badge ──
                    SHA-256: b35dcc2b2495508cd11d6e6294915f7211adfc93ce1a2188d81858b9cd38123f
                    © Islam & Yaseen — ISEF 2026 */}
                <span
                  title="SciNexa ISEF 2026 | © Islam & Yaseen | SHA-256: b35dcc2b2495508cd11d6e6294915f7211adfc93ce1a2188d81858b9cd38123f"
                  data-fingerprint="b35dcc2b2495508cd11d6e6294915f7211adfc93ce1a2188d81858b9cd38123f"
                  style={{
                    padding: '2px 10px',
                    borderRadius: 999,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    background: 'rgba(255,255,255,0.10)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.20)',
                    color: '#fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.22)',
                    whiteSpace: 'nowrap',
                    cursor: 'default'
                  }}
                >
                  Islam &amp; Yaseen ✦
                </span>
              </div>
              <span className="text-[11px] text-[#8E8E93] font-medium hidden sm:block -mt-0.5">
                {language === 'ar' ? 'منظومة المختبرات العلمية التفاعلية 3D' : 'Interactive 3D Virtual Science Suite'}
              </span>
            </div>
          </div>

          {/* ── Action Controls ── */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">

            {/* Smartboard */}
            <button
              onClick={() => setCurrentTab('classroom')}
              title={t.nav.classroom}
              style={currentTab === 'classroom' ? {
                background: '#FF9500', color: '#000',
                boxShadow: '0 4px 16px rgba(255,149,0,0.45)',
                border: '1px solid #FF9500'
              } : {
                background: 'rgba(255,149,0,0.10)', color: '#FF9500',
                border: '1px solid rgba(255,149,0,0.28)',
                backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)'
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-95 duration-150"
            >
              <Presentation className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">{t.nav.classroom}</span>
              <span className="inline sm:hidden">{language === 'ar' ? 'السبورة' : 'Board'}</span>
            </button>

            {/* Offline */}
            <button
              onClick={onOpenOfflineModal}
              style={{
                background: 'rgba(52,199,89,0.10)', color: '#34C759',
                border: '1px solid rgba(52,199,89,0.28)',
                backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)'
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-95 duration-150"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline">{language === 'ar' ? 'بدون إنترنت' : 'Offline'}</span>
            </button>

            {/* Location */}
            <button
              onClick={onOpenLocationModal}
              title={t.egyptLocation.title}
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.11)',
                backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)'
              }}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white transition-all shrink-0 cursor-pointer active:scale-95 duration-150"
            >
              <MapPin className="w-3.5 h-3.5 text-[#34C759] shrink-0" />
              <span>{t.egyptLocation.detectedGovernorate}</span>
            </button>

            {/* Language */}
            <div
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.11)',
                backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)'
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full transition-all shrink-0"
            >
              <Languages className="w-3.5 h-3.5 text-[#8E8E93] shrink-0" />
              <select
                value={language}
                onChange={handleLanguageChange}
                aria-label="Select language"
                className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer border-none p-0"
              >
                <option value="ar" className="bg-[#1C1C1E]">العربية</option>
                <option value="en" className="bg-[#1C1C1E]">English</option>
                <option value="fr" className="bg-[#1C1C1E]">Français</option>
                <option value="de" className="bg-[#1C1C1E]">Deutsch</option>
              </select>
            </div>

            {/* Profile */}
            <UserProfileCard language={language} />
          </div>
        </div>
      </div>
    </header>
  );
};
