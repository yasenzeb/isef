import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../i18n/translations';
import { 
  Atom, 
  Dna, 
  Activity, 
  Globe2, 
  Presentation, 
  Home, 
  Languages, 
  MapPin,
  Menu,
  X,
  Sparkles
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
    { id: 'home', label: t.nav.home, icon: Home },
    { id: 'anatomy', label: t.nav.anatomy, icon: Activity },
    { id: 'physics', label: t.nav.physics, icon: Atom },
    { id: 'chemistry', label: t.nav.chemistry, icon: Atom },
    { id: 'biology', label: t.nav.biology, icon: Dna },
    { id: 'geology', label: t.nav.geology, icon: Globe2 },
    { id: 'classroom', label: t.nav.classroom, icon: Presentation, highlight: true },
  ];

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#030712]/90 backdrop-blur-md border-b border-sky-500/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Name */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setCurrentTab('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-500 to-teal-400 p-0.5 shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#030712] rounded-[10px] flex items-center justify-center">
                <Atom className="w-6 h-6 text-sky-400" />
              </div>
            </div>
            <div className={isRTL ? "mr-3 text-right" : ""}>
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-sky-400 bg-clip-text text-transparent block">
                {t.appName}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                {t.hero.badge}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive 
                      ? item.highlight
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                        : 'bg-sky-600 text-white shadow-md shadow-sky-600/30' 
                      : item.highlight
                        ? 'text-amber-400 hover:bg-amber-500/10 border border-amber-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className={isRTL ? "mr-2" : ""}>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls: Egypt Location & Language Selector */}
          <div className="hidden sm:flex items-center space-x-3">
            {/* Egyptian Location Helper */}
            <button
              onClick={onOpenLocationModal}
              title={t.egyptLocation.title}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 sci-surface hover:bg-slate-800 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden lg:inline">{t.egyptLocation.detectedGovernorate}</span>
            </button>

            {/* Language Selector */}
            <div className="flex items-center space-x-1.5 sci-surface rounded-xl px-2.5 py-1.5">
              <Languages className="w-4 h-4 text-sky-400" />
              <select
                value={language}
                onChange={handleLanguageChange}
                aria-label="Select language"
                className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer pr-1"
              >
                <option value="en" className="bg-slate-900 text-white">English (EN)</option>
                <option value="ar" className="bg-slate-900 text-white">العربية (AR)</option>
                <option value="fr" className="bg-slate-900 text-white">Français (FR)</option>
                <option value="de" className="bg-slate-900 text-white">Deutsch (DE)</option>
              </select>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-sky-500/15 bg-[#030712] px-4 pt-2 pb-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold ${
                  isActive 
                    ? 'bg-sky-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-5 h-5 text-sky-400" />
                <span className={isRTL ? "mr-3" : ""}>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-3 border-t border-sky-500/15 flex items-center justify-between">
            <button
              onClick={() => {
                onOpenLocationModal();
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 text-xs text-emerald-400 py-1"
            >
              <MapPin className="w-4 h-4" />
              <span>{t.egyptLocation.title}</span>
            </button>

            <select
              value={language}
              onChange={handleLanguageChange}
              aria-label="Select mobile language"
              className="bg-slate-900 text-xs text-white rounded-lg px-2.5 py-1.5 border border-sky-500/20"
            >
              <option value="en">English (EN)</option>
              <option value="ar">العربية (AR)</option>
              <option value="fr">Français (FR)</option>
              <option value="de">Deutsch (DE)</option>
            </select>
          </div>
        </div>
      )}
    </header>
  );
};
