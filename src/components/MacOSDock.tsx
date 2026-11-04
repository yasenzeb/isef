/**
 * MacOSDock.tsx — شريط التنقل بين المعامل بتصميم macOS Dock الزجاجي
 * يظهر في الأسفل على جميع الشاشات، ويستبدل MobileBottomNav والشريط الثاني في Navbar.
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
    gradient: 'linear-gradient(145deg, #1a73e8, #5856D6)',
    glow: 'rgba(0,122,255,0.6)',
  },
  {
    id: 'anatomy',
    labelAr: 'تشريح جسم الإنسان',
    labelEn: 'Anatomy',
    icon: Activity,
    gradient: 'linear-gradient(145deg, #FF2D55, #FF3B30)',
    glow: 'rgba(255,45,85,0.6)',
  },
  {
    id: 'physics',
    labelAr: 'مختبر الفيزياء',
    labelEn: 'Physics',
    icon: Zap,
    gradient: 'linear-gradient(145deg, #007AFF, #30B0C7)',
    glow: 'rgba(0,122,255,0.55)',
  },
  {
    id: 'chemistry',
    labelAr: 'الجدول الدوري',
    labelEn: 'Chemistry',
    icon: FlaskConical,
    gradient: 'linear-gradient(145deg, #FF9500, #FF3B30)',
    glow: 'rgba(255,149,0,0.6)',
  },
  {
    id: 'biology',
    labelAr: 'مختبر الأحياء',
    labelEn: 'Biology',
    icon: Dna,
    gradient: 'linear-gradient(145deg, #34C759, #00C7BE)',
    glow: 'rgba(52,199,89,0.6)',
  },
  {
    id: 'geology',
    labelAr: 'علوم الأرض والجيولوجيا',
    labelEn: 'Geology',
    icon: Globe2,
    gradient: 'linear-gradient(145deg, #AF52DE, #5856D6)',
    glow: 'rgba(175,82,222,0.6)',
  },
  {
    id: 'astronomy',
    labelAr: 'علم الفلك والفضاء',
    labelEn: 'Astronomy',
    icon: Sparkles,
    gradient: 'linear-gradient(145deg, #FFCC00, #FF9500)',
    glow: 'rgba(255,204,0,0.6)',
  },
];

export const MacOSDock: React.FC<MacOSDockProps> = ({ currentTab, setCurrentTab }) => {
  const { language, isRTL } = useLanguage();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    /* Fixed bottom dock — full-width on mobile, centered pill on desktop */
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
      style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))' }}
    >
      <nav
        dir={isRTL ? 'rtl' : 'ltr'}
        aria-label="Main lab navigation"
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '6px',
          padding: '10px 16px',
          borderRadius: 24,
          background: 'rgba(28, 28, 30, 0.72)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.14)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12)',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          maxWidth: 'calc(100vw - 24px)',
        }}
      >
        {LABS.map((lab) => {
          const Icon = lab.icon;
          const isActive = currentTab === lab.id;
          const isHovered = hoveredId === lab.id;

          // macOS dock magnification effect
          const scale = isActive ? 1.22 : isHovered ? 1.14 : 1;

          return (
            <div key={lab.id} className="flex flex-col items-center gap-1" style={{ flexShrink: 0 }}>
              {/* Tooltip */}
              {isHovered && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    marginBottom: 8,
                    padding: '4px 10px',
                    borderRadius: 8,
                    background: 'rgba(28,28,30,0.95)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.5)'
                  }}
                >
                  {language === 'ar' ? lab.labelAr : lab.labelEn}
                </div>
              )}

              {/* Icon Button */}
              <button
                onClick={() => setCurrentTab(lab.id)}
                onMouseEnter={() => setHoveredId(lab.id)}
                onMouseLeave={() => setHoveredId(null)}
                onFocus={() => setHoveredId(lab.id)}
                onBlur={() => setHoveredId(null)}
                aria-label={language === 'ar' ? lab.labelAr : lab.labelEn}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '22.37%',
                  background: lab.gradient,
                  boxShadow: isActive
                    ? `0 0 0 2px rgba(255,255,255,0.9), 0 6px 24px ${lab.glow}, inset 0 1px 1px rgba(255,255,255,0.3)`
                    : `0 4px 16px ${lab.glow.replace('0.6','0.3')}, inset 0 1px 1px rgba(255,255,255,0.22)`,
                  transform: `scale(${scale}) translateY(${isActive ? -6 : isHovered ? -3 : 0}px)`,
                  transition: 'transform 0.22s cubic-bezier(0.16,1,0.3,1), box-shadow 0.22s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: 'none',
                  flexShrink: 0,
                  position: 'relative',
                }}
              >
                <Icon className="text-white" style={{ width: 22, height: 22, flexShrink: 0 }} />
              </button>

              {/* Active dot */}
              <div
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: isActive ? '#fff' : 'transparent',
                  transition: 'background 0.2s ease',
                  flexShrink: 0,
                }}
              />
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default MacOSDock;
