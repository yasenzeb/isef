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
    <header className="sticky top-0 z-50" style={{ background: 'rgba(5,10,26,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setCurrentTab('home')}
          >
            <div style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', borderRadius: '14px', padding: '2px', boxShadow: '0 0 16px rgba(99,102,241,0.4)' }}>
              <div style={{ background: '#050a1a', borderRadius: '12px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Atom className="w-5 h-5" style={{ color: '#818cf8' }} />
              </div>
            </div>
            <div className={isRTL ? 'text-right' : ''}>
              <span className="text-base font-bold tracking-tight block" style={{ fontFamily: 'var(--font-display)', background: 'linear-gradient(135deg, #fff, #818cf8, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {t.appName}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest block" style={{ color: '#475569' }}>
                {t.hero.badge}
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? item.highlight
                        ? 'text-white'
                        : 'text-white'
                      : item.highlight
                        ? 'text-amber-400 hover:bg-white/5'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  style={isActive && !item.highlight ? { background: 'linear-gradient(135deg, #6366f1, #06b6d4)', boxShadow: '0 0 12px rgba(99,102,241,0.4)' } : isActive && item.highlight ? { background: 'linear-gradient(135deg, #f59e0b, #f43f5e)', boxShadow: '0 0 12px rgba(245,158,11,0.4)' } : undefined}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={onOpenLocationModal}
              title={t.egyptLocation.title}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors hover:bg-white/5"
              style={{ color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{t.egyptLocation.detectedGovernorate}</span>
            </button>

            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <Languages className="w-4 h-4" style={{ color: '#818cf8' }} />
              <select
                value={language}
                onChange={handleLanguageChange}
                aria-label="Select language"
                style={{ background: 'transparent', border: 'none', color: '#e2e8f0', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', outline: 'none' }}
              >
                <option value="en" style={{ background: '#111827' }}>English (EN)</option>
                <option value="ar" style={{ background: '#111827' }}>العربية (AR)</option>
                <option value="fr" style={{ background: '#111827' }}>Français (FR)</option>
                <option value="de" style={{ background: '#111827' }}>Deutsch (DE)</option>
              </select>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl transition-colors hover:bg-white/5"
              style={{ color: '#94a3b8' }}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-1.5" style={{ background: 'rgba(5,10,26,0.98)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setCurrentTab(item.id); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={isActive ? { background: 'linear-gradient(135deg, #6366f1, #06b6d4)', color: 'white' } : { color: '#94a3b8' }}
              >
                <Icon className="w-5 h-5" style={{ color: isActive ? 'white' : '#818cf8' }} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <button
              onClick={() => { onOpenLocationModal(); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 text-xs py-1"
              style={{ color: '#34d399' }}
            >
              <MapPin className="w-4 h-4" />
              <span>{t.egyptLocation.title}</span>
            </button>
            <select
              value={language}
              onChange={handleLanguageChange}
              aria-label="Select mobile language"
              className="text-xs rounded-lg px-2.5 py-1.5"
              style={{ background: '#111827', color: 'white', border: '1px solid rgba(99,102,241,0.3)' }}
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
