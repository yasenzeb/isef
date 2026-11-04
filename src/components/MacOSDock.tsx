/**
 * MacOSDock.tsx — شريط تنقل زجاجي كبسولي (Apple macOS Dock Pill)
 * يضم جميع المعامل العلمية بالإضافة لزر المساعد العلمي الذكي "داروين".
 * حركة الماوس ديناميكية وحية ومكبرة بسلاسة تامة.
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
  Bot
} from 'lucide-react';

interface MacOSDockProps {
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

export const MacOSDock: React.FC<MacOSDockProps> = ({ currentTab, setCurrentTab }) => {
  const { language, isRTL } = useLanguage();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleOpenDarwin = () => {
    if (typeof window === 'undefined') return;

    // 1. Ensure <fish-agent> element exists in the DOM
    let agentEl = document.querySelector('fish-agent') as any;
    if (!agentEl) {
      agentEl = document.createElement('fish-agent');
      agentEl.setAttribute('agent-id', '929a1bf391db4185b03ae62f05a49207');
      agentEl.setAttribute('language', language === 'ar' ? 'ar' : 'en');
      agentEl.setAttribute('theme', 'dark');
      agentEl.setAttribute(
        'greeting',
        language === 'ar'
          ? 'أهلاً بك يا بطل! أنا داروين مرشدك العلمي في منصة ساينكسا، جاهز لاستكشاف أي تجربة أو فحص أي عضو معايا؟'
          : 'Welcome! I am Darwin, your scientific AI guide in SciNexa. Ready to explore labs and experiments together?'
      );
      document.body.appendChild(agentEl);
    }

    // 2. Ensure official Fish Audio widget script is loaded
    if (!document.querySelector('script[src*="agent-widget-embed"]')) {
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/@fishaudio/agent-widget-embed';
      s.async = true;
      document.body.appendChild(s);
    }

    // 3. Trigger open/expand action on Fish Audio Agent widget
    const triggerExpand = () => {
      try {
        document.dispatchEvent(new CustomEvent('fish-agent:expand'));
        const el = document.querySelector('fish-agent') as any;
        if (el) {
          el.setAttribute('open', 'true');
          el.expanded = true;
          const innerBtn = el.shadowRoot?.querySelector('button, [role="button"]') as HTMLElement;
          if (innerBtn) {
            innerBtn.click();
          }
        }
      } catch (err) {
        console.warn('Fish agent trigger error:', err);
      }
    };

    triggerExpand();
    setTimeout(triggerExpand, 350);
    setTimeout(triggerExpand, 850);
    setTimeout(triggerExpand, 1600);
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

        {/* ── Darwin AI Assistant Button ── */}
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
              {language === 'ar' ? 'داروين | المرشد العلمي الصوتي 🎙️' : 'Darwin AI Voice Assistant 🎙️'}
            </div>
          )}

          <button
            onClick={handleOpenDarwin}
            onMouseEnter={() => setHoveredId('darwin')}
            onMouseLeave={() => setHoveredId(null)}
            onFocus={() => setHoveredId('darwin')}
            onBlur={() => setHoveredId(null)}
            aria-label={language === 'ar' ? 'المساعد العلمي داروين' : 'Darwin AI Assistant'}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-[11px] flex items-center justify-center transition-all duration-200 cursor-pointer select-none active:scale-95 shrink-0 group"
            style={{
              background: 'linear-gradient(135deg, #10b981, #06b6d4, #6366f1)',
              transform: hoveredId === 'darwin' ? 'scale(1.18) translateY(-4px)' : 'scale(1)',
              boxShadow: hoveredId === 'darwin'
                ? '0 6px 22px rgba(6, 182, 212, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
                : '0 2px 10px rgba(6, 182, 212, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
            }}
          >
            <Bot className="w-5 h-5 text-white shrink-0 group-hover:rotate-12 transition-transform duration-300 drop-shadow-sm" />
          </button>

          {/* Indicator Dot for Darwin */}
          <div className="mt-1 w-1 h-1 rounded-full bg-teal-400/80 shadow-[0_0_6px_#2dd4bf]" />
        </div>
      </nav>
    </aside>
  );
};

export default MacOSDock;
