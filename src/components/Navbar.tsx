import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../i18n/translations';
import {
  Atom,
  Languages,
  MapPin,
  Menu,
  X,
  Radio,
  Sliders,
  BarChart3,
  Layers,
  Sparkles,
  Volume2
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenLocationModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenLocationModal }) => {
  const { language, setLanguage, t, isRTL } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'home', num: '01', label: t.nav.home },
    { id: 'anatomy', num: '02', label: t.nav.anatomy },
    { id: 'physics', num: '03', label: t.nav.physics },
    { id: 'chemistry', num: '04', label: t.nav.chemistry },
    { id: 'biology', num: '05', label: t.nav.biology },
    { id: 'geology', num: '06', label: t.nav.geology },
    { id: 'classroom', num: '07', label: t.nav.classroom, highlight: true },
  ];

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#000000]/95 backdrop-blur-md border-b border-white/[0.08]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Left: Brand Identity in Industrial Silver */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setCurrentTab('home')}
          >
            <div className="w-8 h-8 rounded-lg bg-[#0e1015] border border-white/20 flex items-center justify-center text-white shadow-inner group-hover:border-white/40 transition-colors">
              <Atom className="w-4 h-4 text-white" />
            </div>
            <div className={isRTL ? 'text-right' : ''}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold tracking-wider text-white font-mono uppercase">
                  {t.appName}
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono rounded bg-white/[0.06] border border-white/10 text-slate-400">
                  v3.0
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono tracking-tight block -mt-0.5">
                SCIENTIFIC SIMULATION MATRIX
              </span>
            </div>
          </div>

          {/* Center: Industrial Pill Navigation (Identical to 01 Overview, 02 Input Data, 03 Analytics in reference) */}
          <nav className="hidden lg:flex items-center p-1 bg-[#090a0d] border border-white/[0.08] rounded-full gap-0.5">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`tech-tab-pill ${isActive ? 'active' : ''}`}
                >
                  <span className={`font-mono text-[10px] opacity-60 ${isActive ? 'text-black' : 'text-slate-400'}`}>
                    {item.num}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Telemetry & Controls (Source, Sync Status, Location, Lang) */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Status Telemetry (like SOURCE: Simulator | SYNC: BOT SYNC | NOMINAL in reference) */}
            <div className="hidden xl:flex items-center gap-2 font-mono text-[11px] text-slate-400 border-r border-white/10 pr-3">
              <span className="text-slate-500 text-[10px]">ENGINE:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                HIL PHYS-60FPS
              </span>
            </div>

            {/* Region / Governorate */}
            <button
              onClick={onOpenLocationModal}
              title={t.egyptLocation.title}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono text-slate-300 bg-white/[0.03] border border-white/[0.08] hover:border-white/25 transition-all"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">{t.egyptLocation.detectedGovernorate}</span>
            </button>

            {/* Language Selector */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.08]">
              <Languages className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={language}
                onChange={handleLanguageChange}
                aria-label="Select language"
                className="bg-transparent text-slate-200 text-xs font-mono font-medium outline-none cursor-pointer border-none p-0"
              >
                <option value="en" className="bg-[#090a0d] text-white">EN</option>
                <option value="ar" className="bg-[#090a0d] text-white">العربية</option>
                <option value="fr" className="bg-[#090a0d] text-white">FR</option>
                <option value="de" className="bg-[#090a0d] text-white">DE</option>
              </select>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md bg-white/[0.05] border border-white/10 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 py-4 space-y-2 bg-[#050608] border-b border-white/10">
          <div className="grid grid-cols-2 gap-1.5 pb-3">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setCurrentTab(item.id); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-left ${
                    isActive ? 'bg-white text-black font-bold' : 'bg-white/[0.03] text-slate-300 border border-white/[0.07]'
                  }`}
                >
                  <span className="opacity-50 text-[10px]">{item.num}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] text-xs">
            <button
              onClick={() => { onOpenLocationModal(); setMobileMenuOpen(false); }}
              className="flex items-center gap-1.5 text-emerald-400 font-mono"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{t.egyptLocation.title}</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-500">LANG:</span>
              <select
                value={language}
                onChange={handleLanguageChange}
                aria-label="Select mobile language"
                className="bg-[#101217] text-white border border-white/20 rounded px-2 py-1 text-xs font-mono"
              >
                <option value="en">English (EN)</option>
                <option value="ar">العربية (AR)</option>
                <option value="fr">Français (FR)</option>
                <option value="de">Deutsch (DE)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
