/**
 * SciNexaNavDock.tsx — شريط التنقل الكبسولي العلمي الموحد لمنصة ساينكسا
 * يضم جميع المعامل العلمية بالإضافة لزر المساعد العلمي الذكي "داروين".
 * حركة ديناميكية وحية وسلسة تليق بأقوى المنصات العلمية التفاعلية.
 *
 * © Islam & Yaseen — SciNexa ISEF 2026
 * SHA-256: b35dcc2b2495508cd11d6e6294915f7211adfc93ce1a2188d81858b9cd38123f
 */

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Home,
  Activity,
  Zap,
  FlaskConical,
  Dna,
  Globe2,
  Sparkles,
} from 'lucide-react';

interface SciNexaNavDockProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

const LABS = [
  { 
    id: 'home',      
    labelAr: 'الرئيسية',               
    labelEn: 'Home',      
    icon: Home,         
    gradient: 'linear-gradient(135deg, #007AFF, #5856D6)', 
    glow: 'rgba(0, 122, 255, 0.45)'  
  },
  { 
    id: 'anatomy',   
    labelAr: 'تشريح جسم الإنسان',      
    labelEn: 'Anatomy',   
    icon: Activity,     
    gradient: 'linear-gradient(135deg, #FF2D55, #FF3B30)', 
    glow: 'rgba(255, 45, 85, 0.45)'  
  },
  { 
    id: 'physics',   
    labelAr: 'مختبر الفيزياء',          
    labelEn: 'Physics',   
    icon: Zap,          
    gradient: 'linear-gradient(135deg, #007AFF, #30B0C7)', 
    glow: 'rgba(0, 122, 255, 0.45)'   
  },
  { 
    id: 'chemistry', 
    labelAr: 'الجدول الدوري والكيمياء',  
    labelEn: 'Chemistry', 
    icon: FlaskConical, 
    gradient: 'linear-gradient(135deg, #FF9500, #FF3B30)', 
    glow: 'rgba(255, 149, 0, 0.45)'  
  },
  { 
    id: 'biology',   
    labelAr: 'مختبر الأحياء والخلية',   
    labelEn: 'Biology',   
    icon: Dna,          
    gradient: 'linear-gradient(135deg, #34C759, #00C7BE)', 
    glow: 'rgba(52, 199, 89, 0.45)'  
  },
  { 
    id: 'geology',   
    labelAr: 'علوم الأرض والزلازل',     
    labelEn: 'Geology',   
    icon: Globe2,       
    gradient: 'linear-gradient(135deg, #AF52DE, #5856D6)', 
    glow: 'rgba(175, 82, 222, 0.45)' 
  },
  { 
    id: 'astronomy', 
    labelAr: 'علم الفلك والفضاء',       
    labelEn: 'Astronomy', 
    icon: Sparkles,     
    gradient: 'linear-gradient(135deg, #FFCC00, #FF9500)', 
    glow: 'rgba(255, 204, 0, 0.45)'  
  },
];

export const SciNexaNavDock: React.FC<SciNexaNavDockProps> = ({ currentTab, setCurrentTab }) => {
  const { language, isRTL } = useLanguage();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleOpenDarwin = () => {
    if (typeof window === 'undefined') return;

    // Load Fish Audio script if not already loaded
    if (!document.querySelector('script[src*="agent-widget-embed"]')) {
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/@fishaudio/agent-widget-embed';
      s.async = true;
      document.body.appendChild(s);
    }

    // Inject <fish-agent> element if not already in DOM
    if (!document.querySelector('fish-agent')) {
      const el = document.createElement('fish-agent');
      el.setAttribute('agent-id', '929a1bf391db4185b03ae62f05a49207');
      el.setAttribute('language', 'ar');
      el.setAttribute(
        'greeting',
        'أهلاً بك يا بطل! أنا داروين مرشدك العلمي في منصة ساينكسا، جاهز لاستكشاف أي تجربة أو فحص أي عضو معايا؟'
      );
      document.body.appendChild(el);
    }

    // Try to trigger the widget's internal open button after it mounts
    const tryOpen = () => {
      const el = document.querySelector('fish-agent') as Element & { shadowRoot?: ShadowRoot };
      if (el?.shadowRoot) {
        const btn = el.shadowRoot.querySelector('button') as HTMLElement | null;
        if (btn) { btn.click(); return true; }
      }
      return false;
    };

    // Attempt multiple times to handle async widget initialization
    let attempts = 0;
    const interval = setInterval(() => {
      if (tryOpen() || attempts++ >= 15) clearInterval(interval);
    }, 300);
  };

  return (
    <aside
      aria-label="Application Dock Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center items-end pointer-events-none pb-3 sm:pb-4 px-2"
      style={{ paddingBottom: 'max(14px, env(safe-area-inset-bottom, 14px))' }}
    >
      {/* ── Glass Pill Container (macOS Dock Style) ── */}
      <nav
        dir={isRTL ? 'rtl' : 'ltr'}
        className="pointer-events-auto flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-full shadow-2xl transition-all duration-300"
        style={{
          background: 'rgba(20, 20, 24, 0.82)',
          backdropFilter: 'blur(36px) saturate(190%)',
          WebkitBackdropFilter: 'blur(36px) saturate(190%)',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          boxShadow: '0 16px 48px -10px rgba(0, 0, 0, 0.75), inset 0 1px 1px 0 rgba(255, 255, 255, 0.2)',
          maxWidth: 'min(98vw, 760px)',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {LABS.map((lab) => {
          const Icon = lab.icon;
          const isActive  = currentTab === lab.id;
          const isHovered = hoveredId === lab.id;

          return (
            <div
              key={lab.id}
              className="relative flex flex-col items-center justify-center shrink-0"
            >
              {/* Tooltip on hover (desktop only) */}
              {isHovered && (
                <div
                  className="absolute bottom-full mb-3 px-2.5 py-1 rounded-lg text-white text-[11px] font-semibold whitespace-nowrap pointer-events-none shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150"
                  style={{
                    background: 'rgba(28, 28, 30, 0.95)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.45)',
                  }}
                >
                  {language === 'ar' ? lab.labelAr : lab.labelEn}
                </div>
              )}

              {/* Squircle Button (Dynamic Magnification on Hover) */}
              <button
                onClick={() => setCurrentTab(lab.id)}
                onMouseEnter={() => setHoveredId(lab.id)}
                onMouseLeave={() => setHoveredId(null)}
                onFocus={() => setHoveredId(lab.id)}
                onBlur={() => setHoveredId(null)}
                aria-label={language === 'ar' ? lab.labelAr : lab.labelEn}
                aria-current={isActive ? 'page' : undefined}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-[11px] flex items-center justify-center transition-all duration-200 cursor-pointer select-none active:scale-95 shrink-0"
                style={{
                  background: lab.gradient,
                  transform: isHovered
                    ? 'scale(1.18) translateY(-4px)'
                    : isActive
                      ? 'scale(1.08)'
                      : 'scale(1)',
                  boxShadow: isActive
                    ? `0 0 0 2px rgba(255, 255, 255, 0.95), 0 4px 18px ${lab.glow}, inset 0 1px 1px rgba(255, 255, 255, 0.35)`
                    : isHovered
                      ? `0 6px 20px ${lab.glow}, inset 0 1px 1px rgba(255, 255, 255, 0.3)`
                      : `0 2px 8px ${lab.glow}, inset 0 1px 1px rgba(255, 255, 255, 0.2)`,
                }}
              >
                <Icon className="w-5 h-5 text-white shrink-0 drop-shadow-sm" />
              </button>

              {/* Active Indicator Dot */}
              <div
                className="mt-1 w-1 h-1 rounded-full transition-all duration-200"
                style={{
                  background: isActive ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
                  boxShadow: isActive ? '0 0 6px rgba(255, 255, 255, 0.8)' : 'none',
                }}
              />
            </div>
          );
        })}

        {/* ── Subtle Frosted Divider ── */}
        <div className="h-6 w-px bg-white/20 mx-0.5 sm:mx-1 shrink-0" />

        {/* ── Darwin AI Voice Agent Button (Exact Blue Soundwave Button) ── */}
        <div className="relative flex flex-col items-center justify-center shrink-0">
          {hoveredId === 'darwin' && (
            <div
              className="absolute bottom-full mb-3 px-2.5 py-1 rounded-lg text-white text-[11px] font-semibold whitespace-nowrap pointer-events-none shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150"
              style={{
                background: 'rgba(28, 28, 30, 0.95)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.45)',
              }}
            >
              {language === 'ar' ? 'وكيل داروين الصوتي الذكي 🎙️' : 'Darwin AI Voice Agent 🎙️'}
            </div>
          )}

          <button
            onClick={handleOpenDarwin}
            onMouseEnter={() => setHoveredId('darwin')}
            onMouseLeave={() => setHoveredId(null)}
            onFocus={() => setHoveredId('darwin')}
            onBlur={() => setHoveredId(null)}
            aria-label={language === 'ar' ? 'المساعد الصوتي داروين' : 'Darwin AI Voice Assistant'}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer select-none active:scale-95 shrink-0 group"
            style={{
              background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
              transform: hoveredId === 'darwin' ? 'scale(1.18) translateY(-4px)' : 'scale(1)',
              boxShadow: hoveredId === 'darwin'
                ? '0 6px 24px rgba(37, 99, 235, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.5)'
                : '0 3px 14px rgba(37, 99, 235, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.35)',
            }}
          >
            {/* White Audio Waveform Bars Icon */}
            <svg
              className="w-5 h-5 text-white shrink-0 group-hover:scale-110 transition-transform duration-200"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <rect x="3.5" y="9" width="2" height="6" rx="1" />
              <rect x="7.5" y="6" width="2" height="12" rx="1" />
              <rect x="11.5" y="3.5" width="2" height="17" rx="1" />
              <rect x="15.5" y="6" width="2" height="12" rx="1" />
              <rect x="19.5" y="9" width="2" height="6" rx="1" />
            </svg>
          </button>

          {/* Indicator Dot for Darwin */}
          <div className="mt-1 w-1 h-1 rounded-full bg-blue-400 shadow-[0_0_6px_#60a5fa]" />
        </div>
      </nav>
    </aside>
  );
};

export default SciNexaNavDock;
