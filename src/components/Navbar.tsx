import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../i18n/translations';
import { UserProfileCard } from './UserProfileCard';
import { SciNexaBrand } from './SciNexaLogo';
import {
  MapPin, Download, Presentation, Globe, ArrowRight, ArrowLeft
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
  const ar = language === 'ar';

  const navLinks = [
    { href: '#labs', en: 'Labs', ar: 'المعامل', onClick: () => {
      if (currentTab !== 'home') setCurrentTab('home');
      setTimeout(() => {
        const el = document.getElementById('labs');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }},
    { href: '#curriculum', en: 'Curriculum', ar: 'المناهج', onClick: () => {
      if (currentTab !== 'home') setCurrentTab('home');
      setTimeout(() => {
        const el = document.getElementById('curriculum');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }},
    { href: '#roles', en: 'For schools', ar: 'للمدارس', onClick: () => {
      if (currentTab !== 'home') setCurrentTab('home');
      setTimeout(() => {
        const el = document.getElementById('roles');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }},
    { href: '#offline', en: 'Offline', ar: 'بدون إنترنت', onClick: onOpenOfflineModal }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#e5e5e5] bg-white/85 backdrop-blur-xl text-[#0a0a0a] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="sn-shell flex h-16 items-center justify-between gap-4">

        {/* ── Brand & Fingerprint ── */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setCurrentTab('home')}
            className="cursor-pointer select-none active:scale-95 transition-transform"
          >
            <SciNexaBrand compact={true} />
          </div>

          {/* Islam & Yaseen Fingerprint Badge */}
          <span
            title="SciNexa ISEF 2026 | © Islam & Yaseen | SHA-256: b35dcc2b2495508cd11d6e6294915f7211adfc93ce1a2188d81858b9cd38123f"
            className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-[#e5e5e5] bg-[#fafafa] text-[10px] font-mono text-[#737373]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#1d4ed8]" />
            Islam &amp; Yaseen · b35dcc2b
          </span>
        </div>

        {/* ── Main Navigation Links (Desktop) ── */}
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={link.onClick}
              className="text-[13px] font-semibold text-[#737373] transition-colors hover:text-[#0a0a0a] cursor-pointer"
            >
              {ar ? link.ar : link.en}
            </button>
          ))}
        </nav>

        {/* ── Action Controls ── */}
        <div className="flex items-center gap-2">

          {/* Smartboard Toggle */}
          <button
            type="button"
            onClick={() => setCurrentTab(currentTab === 'classroom' ? 'home' : 'classroom')}
            className={`sn-btn sn-btn-sm ${
              currentTab === 'classroom'
                ? 'sn-btn-primary'
                : 'sn-btn-outline'
            }`}
            title={t.nav.classroom}
          >
            <Presentation className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{ar ? 'السبورة' : 'Board'}</span>
          </button>

          {/* Offline Modal Trigger */}
          <button
            type="button"
            onClick={onOpenOfflineModal}
            className="sn-btn sn-btn-outline sn-btn-sm hidden sm:inline-flex"
            title={ar ? 'تحميل للاستخدام بدون إنترنت' : 'Offline Download'}
          >
            <Download className="w-3.5 h-3.5 text-[#047857] shrink-0" />
            <span className="hidden md:inline">{ar ? 'بدون إنترنت' : 'Offline'}</span>
          </button>

          {/* Location Trigger */}
          <button
            type="button"
            onClick={onOpenLocationModal}
            className="sn-btn sn-btn-outline sn-btn-sm hidden xl:inline-flex"
            title={t.egyptLocation.title}
          >
            <MapPin className="w-3.5 h-3.5 text-[#1d4ed8] shrink-0" />
            <span className="text-[11px] font-mono">{t.egyptLocation.detectedGovernorate}</span>
          </button>

          {/* Language Switcher */}
          <button
            type="button"
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="sn-btn sn-btn-quiet sn-btn-sm font-semibold"
            aria-label={ar ? 'Switch to English' : 'التبديل إلى العربية'}
          >
            <Globe className="w-3.5 h-3.5 text-[#737373] shrink-0" />
            <span>{ar ? 'EN' : 'العربية'}</span>
          </button>

          {/* Context Action Button (Back to Home if in Lab, Explore Labs if in Home) */}
          {currentTab !== 'home' ? (
            <button
              type="button"
              onClick={() => setCurrentTab('home')}
              className="sn-btn sn-btn-primary sn-btn-sm"
            >
              {isRTL ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
              <span>{ar ? 'المعامل' : 'Labs'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('labs');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="sn-btn sn-btn-primary sn-btn-sm"
            >
              <span>{ar ? 'استكشف المعامل' : 'Explore Labs'}</span>
              {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Profile Card */}
          <UserProfileCard language={language} />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
