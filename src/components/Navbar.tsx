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

  // Official Apple iOS App Squircles Configuration
  const navItems = [
    { 
      id: 'home', 
      label: t.nav.home, 
      icon: Home, 
      gradient: 'linear-gradient(135deg, #007AFF, #5856D6)',
      shadow: 'rgba(0, 122, 255, 0.4)'
    },
    { 
      id: 'anatomy', 
      label: t.nav.anatomy, 
      icon: Activity, 
      gradient: 'linear-gradient(135deg, #FF2D55, #FF3B30)',
      shadow: 'rgba(255, 45, 85, 0.4)'
    },
    { 
      id: 'physics', 
      label: t.nav.physics, 
      icon: Zap, 
      gradient: 'linear-gradient(135deg, #007AFF, #30B0C7)',
      shadow: 'rgba(0, 122, 255, 0.4)'
    },
    { 
      id: 'chemistry', 
      label: t.nav.chemistry, 
      icon: FlaskConical, 
      gradient: 'linear-gradient(135deg, #FF9500, #FF3B30)',
      shadow: 'rgba(255, 149, 0, 0.4)'
    },
    { 
      id: 'biology', 
      label: t.nav.biology, 
      icon: Dna, 
      gradient: 'linear-gradient(135deg, #34C759, #00C7BE)',
      shadow: 'rgba(52, 199, 89, 0.4)'
    },
    { 
      id: 'geology', 
      label: t.nav.geology, 
      icon: Globe2, 
      gradient: 'linear-gradient(135deg, #AF52DE, #5856D6)',
      shadow: 'rgba(175, 82, 222, 0.4)'
    },
    { 
      id: 'astronomy', 
      label: t.nav.astronomy, 
      icon: Sparkles, 
      gradient: 'linear-gradient(135deg, #FFCC00, #FF9500)',
      shadow: 'rgba(255, 204, 0, 0.4)'
    },
  ];

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#000000]/80 backdrop-blur-2xl border-b border-white/[0.1] shadow-2xl">
      {/* ── Tier 1: Apple iOS Navigation Bar Header ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-3">

          {/* Right (in RTL): Brand Identity with iOS App Icon Squircle */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none group shrink-0 active:scale-95 transition-transform duration-150"
            onClick={() => setCurrentTab('home')}
          >
            <div 
              className="w-9 h-9 rounded-[11px] ios-squircle flex items-center justify-center text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #007AFF, #5856D6)' }}
            >
              <Atom className="w-5 h-5 text-white" />
            </div>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white font-sans">
                  SciNexa
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-white/10 text-white border border-white/15">
                  iOS 18
                </span>
              </div>
              <span className="text-[11px] text-[#8E8E93] font-medium hidden sm:block -mt-0.5">
                {language === 'ar' 
                  ? 'منظومة المختبرات العلمية التفاعلية 3D' 
                  : 'Interactive 3D Virtual Science Suite'}
              </span>
            </div>
          </div>

          {/* Left (in RTL): iOS Frosted Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* 1. Apple Keynote / Smartboard Button */}
            <button
              onClick={() => setCurrentTab('classroom')}
              title={t.nav.classroom}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-md shrink-0 cursor-pointer active:scale-95 duration-150 ${
                currentTab === 'classroom'
                  ? 'bg-[#FF9500] text-black shadow-lg shadow-[#FF9500]/40'
                  : 'bg-[#FF9500]/15 text-[#FF9500] border border-[#FF9500]/30 hover:bg-[#FF9500]/25'
              }`}
            >
              <Presentation className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">{t.nav.classroom}</span>
              <span className="inline sm:hidden">{language === 'ar' ? 'السبورة' : 'Board'}</span>
            </button>

            {/* 2. Apple Green Offline Button */}
            <button
              onClick={onOpenOfflineModal}
              title={language === 'ar' ? 'تحميل وتشغيل بدون إنترنت' : 'Offline Execution'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-[#34C759] bg-[#34C759]/15 border border-[#34C759]/30 hover:bg-[#34C759]/25 transition-all shrink-0 cursor-pointer active:scale-95 duration-150"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline">
                {language === 'ar' ? 'بدون إنترنت' : 'Offline'}
              </span>
            </button>

            {/* 3. Location / Governorate Pill */}
            <button
              onClick={onOpenLocationModal}
              title={t.egyptLocation.title}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-all shrink-0 cursor-pointer active:scale-95 duration-150"
            >
              <MapPin className="w-3.5 h-3.5 text-[#34C759] shrink-0" />
              <span>{t.egyptLocation.detectedGovernorate}</span>
            </button>

            {/* 4. Language Selector Pill */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/10 border border-white/10 hover:bg-white/15 transition-all shrink-0">
              <Languages className="w-3.5 h-3.5 text-[#8E8E93] shrink-0" />
              <select
                value={language}
                onChange={handleLanguageChange}
                aria-label="Select language"
                className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer border-none p-0"
              >
                <option value="ar" className="bg-[#1C1C1E] text-white">العربية</option>
                <option value="en" className="bg-[#1C1C1E] text-white">English</option>
                <option value="fr" className="bg-[#1C1C1E] text-white">Français</option>
                <option value="de" className="bg-[#1C1C1E] text-white">Deutsch</option>
              </select>
            </div>

            {/* 5. User Profile Card */}
            <UserProfileCard language={language} />
          </div>
        </div>
      </div>

      {/* ── Tier 2: Apple Dynamic Island / Segmented Lab Switcher ── */}
      <div className="border-t border-white/[0.08] bg-[#1C1C1E]/70 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-2 sm:px-6">
          <nav 
            className="flex items-center justify-start sm:justify-center overflow-x-auto scrollbar-none gap-1.5 sm:gap-2.5 py-2 px-1 scroll-smooth"
            aria-label="Virtual Laboratories"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 whitespace-nowrap cursor-pointer select-none active:scale-95 duration-150 ${
                    isActive
                      ? 'bg-white text-black shadow-lg shadow-white/25 scale-[1.03] ring-1 ring-white/60 font-black'
                      : 'text-[#8E8E93] hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.06]'
                  }`}
                >
                  <div 
                    className="w-5 h-5 rounded-[6px] ios-squircle flex items-center justify-center shrink-0"
                    style={{ background: item.gradient }}
                  >
                    <Icon className="w-3 h-3 text-white" />
                  </div>
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
