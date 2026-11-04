import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../i18n/translations';
import { UserProfileCard } from './UserProfileCard';
import {
  Atom,
  Languages,
  MapPin,
  Download,
  Presentation,
  Home,
  Activity,
  Zap,
  FlaskConical,
  Dna,
  Globe2,
  Sparkles
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

  const navItems = [
    { id: 'home', label: t.nav.home, icon: Home, color: '#818cf8' },
    { id: 'anatomy', label: t.nav.anatomy, icon: Activity, color: '#ec4899' },
    { id: 'physics', label: t.nav.physics, icon: Zap, color: '#38bdf8' },
    { id: 'chemistry', label: t.nav.chemistry, icon: FlaskConical, color: '#f59e0b' },
    { id: 'biology', label: t.nav.biology, icon: Dna, color: '#10b981' },
    { id: 'geology', label: t.nav.geology, icon: Globe2, color: '#a855f7' },
    { id: 'astronomy', label: t.nav.astronomy, icon: Sparkles, color: '#eab308' },
  ];

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#06080e]/95 backdrop-blur-xl border-b border-white/[0.08] shadow-2xl">
      {/* ── Tier 1: Main Platform Brand & Global Control Suite ── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-3">

          {/* Right (in RTL): Brand Identity */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
            onClick={() => setCurrentTab('home')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 via-sky-500/20 to-purple-500/20 border border-indigo-400/30 flex items-center justify-center shadow-lg shadow-indigo-500/10 group-hover:border-indigo-400/60 transition-all shrink-0">
              <Atom className="w-5 h-5 text-indigo-300 group-hover:rotate-180 transition-transform duration-700" />
            </div>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-wider text-white uppercase font-sans">
                  SciNexa
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-mono rounded-md bg-white/[0.08] border border-white/15 text-slate-300 font-bold">
                  {language === 'ar' ? 'الإصدار 3.0' : 'v3.0'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 tracking-tight -mt-0.5 font-medium hidden sm:block">
                {language === 'ar' 
                  ? 'منظومة المختبرات العلمية والمحاكاة التفاعلية' 
                  : language === 'fr' 
                  ? 'Matrice de Simulation Scientifique' 
                  : language === 'de' 
                  ? 'Wissenschaftliche Simulationsmatrix' 
                  : 'Interactive Scientific Simulation Matrix'}
              </span>
            </div>
          </div>

          {/* Left (in RTL): Global Utilities Suite */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* 1. Smartboard Classroom Mode (Highlighted Accent) */}
            <button
              onClick={() => setCurrentTab('classroom')}
              title={t.nav.classroom}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md shrink-0 cursor-pointer ${
                currentTab === 'classroom'
                  ? 'bg-amber-400 text-black shadow-amber-400/40 ring-2 ring-amber-300 scale-105'
                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 hover:border-amber-400'
              }`}
            >
              <Presentation className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="hidden sm:inline">{t.nav.classroom}</span>
              <span className="inline sm:hidden">{language === 'ar' ? 'السبورة' : 'Board'}</span>
            </button>

            {/* 2. Offline Mode Button */}
            <button
              onClick={onOpenOfflineModal}
              title={language === 'ar' ? 'تحميل الموقع وتشغيله بدون إنترنت بالكامل' : 'Offline Mode'}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/25 hover:border-emerald-500/40 transition-all shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline">
                {language === 'ar' ? 'بدون إنترنت' : language === 'fr' ? 'Hors ligne' : 'Offline'}
              </span>
            </button>

            {/* 3. Location / Governorate */}
            <button
              onClick={onOpenLocationModal}
              title={t.egyptLocation.title}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 bg-white/[0.03] border border-white/[0.08] hover:border-white/20 transition-all shrink-0 cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{t.egyptLocation.detectedGovernorate}</span>
            </button>

            {/* 4. Language Selector */}
            <div className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 transition-all shrink-0">
              <Languages className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={language}
                onChange={handleLanguageChange}
                aria-label="Select language"
                className="bg-transparent text-slate-200 text-xs font-bold outline-none cursor-pointer border-none p-0"
              >
                <option value="ar" className="bg-[#090a0d] text-white">العربية</option>
                <option value="en" className="bg-[#090a0d] text-white">EN</option>
                <option value="fr" className="bg-[#090a0d] text-white">FR</option>
                <option value="de" className="bg-[#090a0d] text-white">DE</option>
              </select>
            </div>

            {/* 5. User Profile Card */}
            <UserProfileCard language={language} />
          </div>
        </div>
      </div>

      {/* ── Tier 2: Dedicated Modern Laboratory Navigation Strip ── */}
      <div className="border-t border-white/[0.06] bg-[#070b16]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-2 sm:px-6">
          <nav 
            className="flex items-center justify-start sm:justify-center overflow-x-auto scrollbar-none gap-1 sm:gap-2 py-2 px-1 scroll-smooth"
            aria-label="Virtual Laboratories"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap cursor-pointer select-none ${
                    isActive
                      ? 'bg-gradient-to-r from-[#006FEE] to-[#005BC4] text-white shadow-lg shadow-[#006FEE]/30 scale-[1.02] ring-1 ring-[#006FEE]/60 font-black'
                      : 'text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08]'
                  }`}
                >
                  <Icon 
                    className="w-4 h-4 shrink-0 transition-transform" 
                    style={{ color: isActive ? '#ffffff' : item.color }} 
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
