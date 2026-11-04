import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../i18n/translations';
import { UserProfileCard } from './UserProfileCard';
import {
  Atom,
  Languages,
  MapPin,
  Menu,
  X,
  Download,
  Presentation
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
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'home', num: '01', label: t.nav.home, shortLabel: language === 'ar' ? 'الرئيسية' : 'Home' },
    { id: 'anatomy', num: '02', label: t.nav.anatomy, shortLabel: language === 'ar' ? 'التشريح' : 'Anatomy' },
    { id: 'physics', num: '03', label: t.nav.physics, shortLabel: language === 'ar' ? 'الفيزياء' : 'Physics' },
    { id: 'chemistry', num: '04', label: t.nav.chemistry, shortLabel: language === 'ar' ? 'الكيمياء' : 'Chemistry' },
    { id: 'biology', num: '05', label: t.nav.biology, shortLabel: language === 'ar' ? 'الأحياء' : 'Biology' },
    { id: 'geology', num: '06', label: t.nav.geology, shortLabel: language === 'ar' ? 'الجيولوجيا' : 'Geology' },
    { id: 'astronomy', num: '07', label: t.nav.astronomy, shortLabel: language === 'ar' ? 'الفلك' : 'Astronomy' },
  ];

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#000000]/95 backdrop-blur-md border-b border-white/[0.08]">
      <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 gap-2">

          {/* Left: Industrial Monogram & System Title */}
          <div
            className="flex items-center gap-2 cursor-pointer select-none group shrink-0"
            onClick={() => setCurrentTab('home')}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white/20 to-white/5 border border-white/20 flex items-center justify-center shadow-inner group-hover:border-white/40 transition-colors shrink-0">
              <Atom className="w-4 h-4 text-white" />
            </div>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-base sm:text-lg font-black tracking-wider text-white uppercase">
                  SciNexa
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono rounded bg-white/[0.08] border border-white/15 text-slate-300 font-bold">
                  {language === 'ar' ? 'الإصدار 3.0' : 'v3.0'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono tracking-tight -mt-0.5 font-medium hidden lg:block">
                {language === 'ar' 
                  ? 'منظومة المحاكاة العلمية' 
                  : language === 'fr' 
                  ? 'MATRICE DE SIMULATION SCIENTIFIQUE' 
                  : language === 'de' 
                  ? 'SIMULATIONSMATRIX' 
                  : 'SCIENTIFIC SIMULATION MATRIX'}
              </span>
            </div>
          </div>

          {/* Center: Industrial Pill Navigation & Separated Classroom Presentation Button */}
          {/* Active on Tablet & Desktop (md:flex) with smooth horizontal scrollbar-none to guarantee zero overflow */}
          <div className="hidden md:flex items-center gap-1.5 lg:gap-2 min-w-0 flex-1 justify-center px-1 overflow-x-auto scrollbar-none py-1">
            <nav className="flex items-center p-1 bg-[#090a0d] border border-white/[0.08] rounded-full gap-0.5 shrink-0 max-w-full">
              {navItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`tech-tab-pill shrink-0 ${isActive ? 'active' : ''}`}
                    title={item.label}
                  >
                    <span className={`font-mono text-[9px] opacity-60 hidden 2xl:inline ${isActive ? 'text-black' : 'text-slate-400'}`}>
                      {item.num}
                    </span>
                    <span className="hidden xl:inline">{item.label}</span>
                    <span className="inline xl:hidden">{item.shortLabel}</span>
                  </button>
                );
              })}
            </nav>

            {/* Distinct Separated Classroom Mode Button */}
            <button
              onClick={() => setCurrentTab('classroom')}
              title={t.nav.classroom}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all shadow-md shrink-0 whitespace-nowrap ${
                currentTab === 'classroom'
                  ? 'bg-amber-400 text-black shadow-amber-400/40 ring-2 ring-amber-300'
                  : 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-400/60 shadow-amber-500/10'
              }`}
            >
              <Presentation className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden xl:inline">{t.nav.classroom}</span>
              <span className="inline xl:hidden">{language === 'ar' ? 'السبورة' : 'Board'}</span>
            </button>
          </div>

          {/* Right: Telemetry & Controls */}
          <div className="hidden md:flex items-center gap-1.5 lg:gap-2 shrink-0">
            {/* Status Telemetry */}
            <div className="hidden 2xl:flex items-center gap-1.5 font-mono text-[11px] text-slate-400 border-r border-white/10 pr-2">
              <span className="text-slate-500 text-[10px]">
                {language === 'ar' ? 'المحرك:' : 'ENGINE:'}
              </span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {language === 'ar' ? '60 إطار/ث' : '60FPS'}
              </span>
            </div>

            {/* Offline Mode / Download Button */}
            <button
              onClick={onOpenOfflineModal}
              title={language === 'ar' ? 'تحميل الموقع وتشغيله بدون إنترنت' : 'Download for offline execution'}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden lg:inline">
                {language === 'ar' ? 'بدون إنترنت' : language === 'fr' ? 'Hors ligne' : 'Offline'}
              </span>
            </button>

            {/* Region / Governorate */}
            <button
              onClick={onOpenLocationModal}
              title={t.egyptLocation.title}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-mono text-slate-300 bg-white/[0.03] border border-white/[0.08] hover:border-white/25 transition-all shrink-0 cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden xl:inline">{t.egyptLocation.detectedGovernorate}</span>
            </button>

            {/* Language Selector */}
            <div className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] shrink-0">
              <Languages className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={language}
                onChange={handleLanguageChange}
                aria-label="Select language"
                className="bg-transparent text-slate-200 text-xs font-mono font-medium outline-none cursor-pointer border-none p-0"
              >
                <option value="ar" className="bg-[#090a0d] text-white">العربية</option>
                <option value="en" className="bg-[#090a0d] text-white">EN</option>
                <option value="fr" className="bg-[#090a0d] text-white">FR</option>
                <option value="de" className="bg-[#090a0d] text-white">DE</option>
              </select>
            </div>

            {/* User Profile Card */}
            <UserProfileCard language={language} />
          </div>

          {/* Mobile: Profile Card + Download + Menu Toggle */}
          <div className="flex md:hidden items-center gap-1.5 shrink-0">
            {/* User Profile Card visible on mobile too */}
            <UserProfileCard language={language} />
            <button
              onClick={onOpenOfflineModal}
              className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
              title={language === 'ar' ? 'بدون إنترنت' : 'Offline'}
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="p-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Visible on md:hidden when toggled) */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-1 bg-[#090a0d] border-b border-white/[0.08] max-h-[80vh] overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono transition-all ${
                  isActive
                    ? 'bg-white text-black font-bold shadow'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span>{item.label}</span>
                <span className="text-[10px] opacity-60 font-bold">{item.num}</span>
              </button>
            );
          })}

          {/* Separated Mobile Classroom Button */}
          <button
            onClick={() => {
              setCurrentTab('classroom');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all my-1.5 ${
              currentTab === 'classroom'
                ? 'bg-amber-400 text-black shadow-md'
                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
            }`}
          >
            <span className="flex items-center gap-2">
              <Presentation className="w-4 h-4 text-amber-400" />
              <span>{t.nav.classroom}</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400/20 text-amber-300">
              {language === 'ar' ? 'شاشة ذكية' : 'SMARTBOARD'}
            </span>
          </button>

          <div className="pt-2 flex items-center justify-between border-t border-white/[0.06] mt-2">
            <button
              onClick={() => {
                onOpenLocationModal();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 py-1"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{t.egyptLocation.title}</span>
            </button>
            <select
              value={language}
              onChange={handleLanguageChange}
              className="text-xs font-mono bg-[#14171e] text-white border border-white/10 rounded px-2 py-1"
            >
              <option value="ar">العربية (AR)</option>
              <option value="en">English (EN)</option>
              <option value="fr">Français (FR)</option>
              <option value="de">Deutsch (DE)</option>
            </select>
          </div>
        </div>
      )}
    </header>
  );
};
