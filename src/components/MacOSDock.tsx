/**
 * MacOSDock.tsx — شريط تنقل زجاجي كبسولي (Apple macOS Dock Pill)
 * متناسق بالكامل ومصمم بحيث تظل جميع العناصر داخل الكبسولة الزجاجية بدون أي خروج عن الحواف.
 *
 * © Islam & Yaseen — SciNexa ISEF 2026
 * SHA-256: b35dcc2b2495508cd11d6e6294915f7211adfc93ce1a2188d81858b9cd38123f
 */

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Home, Activity, Zap, FlaskConical, Dna, Globe2, Sparkles } from 'lucide-react';

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

  return (
    <aside
      aria-label="Application Dock Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center items-end pointer-events-none pb-3 sm:pb-4 px-2"
      style={{ paddingBottom: 'max(14px, env(safe-area-inset-bottom, 14px))' }}
    >
      {/* ── Glass Pill Container (macOS Dock Style) ── */}
      <nav
        dir={isRTL ? 'rtl' : 'ltr'}
        className="pointer-events-auto flex items-center justify-center gap-1.5 sm:gap-2.5 px-3 sm:px-4 py-2.5 rounded-full shadow-2xl transition-all duration-300"
        style={{
          background: 'rgba(20, 20, 22, 0.78)',
          backdropFilter: 'blur(32px) saturate(190%)',
          WebkitBackdropFilter: 'blur(32px) saturate(190%)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          boxShadow: '0 12px 40px -10px rgba(0, 0, 0, 0.7), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
          maxWidth: 'min(96vw, 680px)',
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
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  {language === 'ar' ? lab.labelAr : lab.labelEn}
                </div>
              )}

              {/* Squircle Button (Strictly Contained within the Pill) */}
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
                  transform: isActive
                    ? 'scale(1.06)'
                    : isHovered
                      ? 'scale(1.04)'
                      : 'scale(1)',
                  boxShadow: isActive
                    ? `0 0 0 2px rgba(255, 255, 255, 0.95), 0 4px 18px ${lab.glow}, inset 0 1px 1px rgba(255, 255, 255, 0.35)`
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
      </nav>
    </aside>
  );
};

export default MacOSDock;
