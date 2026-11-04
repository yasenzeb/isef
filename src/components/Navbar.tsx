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
    {
      id: 'home',
      label: t.nav.home,
      icon: Home,
      gradient: 'linear-gradient(135deg, #007AFF, #5856D6)',
      shadow: 'rgba(0, 122, 255, 0.5)'
    },
    {
      id: 'anatomy',
      label: t.nav.anatomy,
      icon: Activity,
      gradient: 'linear-gradient(135deg, #FF2D55, #FF3B30)',
      shadow: 'rgba(255, 45, 85, 0.5)'
    },
    {
      id: 'physics',
      label: t.nav.physics,
      icon: Zap,
      gradient: 'linear-gradient(135deg, #007AFF, #30B0C7)',
      shadow: 'rgba(0, 122, 255, 0.5)'
    },
    {
      id: 'chemistry',
      label: t.nav.chemistry,
      icon: FlaskConical,
      gradient: 'linear-gradient(135deg, #FF9500, #FF3B30)',
      shadow: 'rgba(255, 149, 0, 0.5)'
    },
    {
      id: 'biology',
      label: t.nav.biology,
      icon: Dna,
      gradient: 'linear-gradient(135deg, #34C759, #00C7BE)',
      shadow: 'rgba(52, 199, 89, 0.5)'
    },
    {
      id: 'geology',
      label: t.nav.geology,
      icon: Globe2,
      gradient: 'linear-gradient(135deg, #AF52DE, #5856D6)',
      shadow: 'rgba(175, 82, 222, 0.5)'
    },
    {
      id: 'astronomy',
      label: t.nav.astronomy,
      icon: Sparkles,
      gradient: 'linear-gradient(135deg, #FFCC00, #FF9500)',
      shadow: 'rgba(255, 204, 0, 0.5)'
    },
  ];

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  return (
    <header className="sticky top-0 z-50 shadow-2xl" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>

      {/* ── Tier 1: Brand Bar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-3">

          {/* Brand Identity */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none shrink-0 active:scale-95 transition-transform duration-150"
            onClick={() => setCurrentTab('home')}
          >
            {/* App icon squircle */}
            <div
              className="w-9 h-9 flex items-center justify-center text-white shrink-0"
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
                <span className="text-lg font-black tracking-tight text-white font-sans">
                  SciNexa
                </span>

                {/* ═══ Glass Bubble — Digital Fingerprint ═══
                    SHA-256: b35dcc2b2495508cd11d6e6294915f7211adfc93ce1a2188d81858b9cd38123f
                    Seed: "SCINEXA_ISEF_2026_PROJECT_AUTHORS_ISLAM_AND_YASEEN_VIRTUAL_SCIENCE_LABS"
                    © Islam & Yaseen — All Rights Reserved 2026
                */}
                <span
                  title="SciNexa ISEF 2026 — Islam & Yaseen | SHA-256: b35dcc2b2495508cd11d6e6294915f7211adfc93ce1a2188d81858b9cd38123f"
                  data-fingerprint="b35dcc2b2495508cd11d6e6294915f7211adfc93ce1a2188d81858b9cd38123f"
                  style={{
                    padding: '2px 10px',
                    borderRadius: '999px',
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    background: 'rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.22)',
                    color: '#ffffff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.25)',
                    whiteSpace: 'nowrap',
                    cursor: 'default'
                  }}
                >
                  Islam &amp; Yaseen ✦
                </span>
              </div>
              <span className="text-[11px] text-[#8E8E93] font-medium hidden sm:block -mt-0.5">
                {language === 'ar'
                  ? 'منظومة المختبرات العلمية التفاعلية 3D'
                  : 'Interactive 3D Virtual Science Suite'}
              </span>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">

            {/* Smartboard / Classroom */}
            <button
              onClick={() => setCurrentTab('classroom')}
              title={t.nav.classroom}
              style={currentTab === 'classroom' ? {
                background: '#FF9500',
                color: '#000',
                boxShadow: '0 4px 16px rgba(255,149,0,0.45)',
                border: '1px solid #FF9500'
              } : {
                background: 'rgba(255,149,0,0.12)',
                color: '#FF9500',
                border: '1px solid rgba(255,149,0,0.3)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)'
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-md shrink-0 cursor-pointer active:scale-95 duration-150"
            >
              <Presentation className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">{t.nav.classroom}</span>
              <span className="inline sm:hidden">{language === 'ar' ? 'السبورة' : 'Board'}</span>
            </button>

            {/* Offline */}
            <button
              onClick={onOpenOfflineModal}
              title={language === 'ar' ? 'تحميل وتشغيل بدون إنترنت' : 'Offline Execution'}
              style={{
                background: 'rgba(52,199,89,0.12)',
                border: '1px solid rgba(52,199,89,0.3)',
                color: '#34C759',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)'
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-[#34C759]/25 transition-all shrink-0 cursor-pointer active:scale-95 duration-150"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline">
                {language === 'ar' ? 'بدون إنترنت' : 'Offline'}
              </span>
            </button>

            {/* Location */}
            <button
              onClick={onOpenLocationModal}
              title={t.egyptLocation.title}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)'
              }}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white hover:bg-white/15 transition-all shrink-0 cursor-pointer active:scale-95 duration-150"
            >
              <MapPin className="w-3.5 h-3.5 text-[#34C759] shrink-0" />
              <span>{t.egyptLocation.detectedGovernorate}</span>
            </button>

            {/* Language */}
            <div
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)'
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full hover:bg-white/15 transition-all shrink-0"
            >
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

            {/* User Profile */}
            <UserProfileCard language={language} />
          </div>
        </div>
      </div>

      {/* ── Tier 2: Glass Bubble Lab Navigation Strip ── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(28,28,30,0.6)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)' }}>
        <div className="max-w-7xl mx-auto px-2 sm:px-6">
          <nav
            className="flex items-center justify-start sm:justify-center overflow-x-auto scrollbar-none gap-2 sm:gap-2.5 py-2 px-1 scroll-smooth"
            aria-label="Virtual Laboratories"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  style={isActive ? {
                    background: 'rgba(255,255,255,0.22)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.35)',
                    color: '#ffffff',
                    boxShadow: `0 4px 20px ${item.shadow}, inset 0 1px 1px rgba(255,255,255,0.3)`,
                    transform: 'scale(1.04)'
                  } : {
                    background: 'rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(14px)',
                    WebkitBackdropFilter: 'blur(14px)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    color: '#8E8E93'
                  }}
                  className="flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 shrink-0 whitespace-nowrap cursor-pointer select-none active:scale-95 hover:text-white"
                >
                  {/* Mini squircle icon */}
                  <div
                    className="w-5 h-5 flex items-center justify-center shrink-0"
                    style={{
                      borderRadius: '22.37%',
                      background: item.gradient,
                      boxShadow: `0 2px 8px ${item.shadow}, inset 0 1px 1px rgba(255,255,255,0.25)`
                    }}
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
