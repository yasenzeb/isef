/**
 * MacOSDock.tsx — شريط تنقل زجاجي بعرض الشاشة كاملة (macOS Menubar / Windows Taskbar style)
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
  { id: 'home',      labelAr: 'الرئيسية',              labelEn: 'Home',       icon: Home,         gradient: 'linear-gradient(145deg,#1a73e8,#5856D6)', glow: 'rgba(0,122,255,0.55)'   },
  { id: 'anatomy',   labelAr: 'تشريح جسم الإنسان',     labelEn: 'Anatomy',    icon: Activity,     gradient: 'linear-gradient(145deg,#FF2D55,#FF3B30)', glow: 'rgba(255,45,85,0.55)'   },
  { id: 'physics',   labelAr: 'مختبر الفيزياء',         labelEn: 'Physics',    icon: Zap,          gradient: 'linear-gradient(145deg,#007AFF,#30B0C7)', glow: 'rgba(0,122,255,0.5)'    },
  { id: 'chemistry', labelAr: 'الجدول الدوري',           labelEn: 'Chemistry',  icon: FlaskConical, gradient: 'linear-gradient(145deg,#FF9500,#FF3B30)', glow: 'rgba(255,149,0,0.55)'   },
  { id: 'biology',   labelAr: 'مختبر الأحياء',          labelEn: 'Biology',    icon: Dna,          gradient: 'linear-gradient(145deg,#34C759,#00C7BE)', glow: 'rgba(52,199,89,0.55)'   },
  { id: 'geology',   labelAr: 'علوم الأرض والجيولوجيا', labelEn: 'Geology',   icon: Globe2,       gradient: 'linear-gradient(145deg,#AF52DE,#5856D6)', glow: 'rgba(175,82,222,0.55)'  },
  { id: 'astronomy', labelAr: 'علم الفلك والفضاء',      labelEn: 'Astronomy',  icon: Sparkles,     gradient: 'linear-gradient(145deg,#FFCC00,#FF9500)', glow: 'rgba(255,204,0,0.55)'   },
];

export const MacOSDock: React.FC<MacOSDockProps> = ({ currentTab, setCurrentTab }) => {
  const { language, isRTL } = useLanguage();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Full-width frosted glass bar */}
      <nav
        dir={isRTL ? 'rtl' : 'ltr'}
        aria-label="Main lab navigation"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '8px 12px',
          background: 'rgba(18, 18, 20, 0.82)',
          backdropFilter: 'blur(40px) saturate(200%)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          borderTop: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 -4px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        {LABS.map((lab) => {
          const Icon = lab.icon;
          const isActive = currentTab === lab.id;
          const isHovered = hoveredId === lab.id;

          return (
            <div
              key={lab.id}
              className="relative flex flex-col items-center"
              style={{ flex: 1, minWidth: 0 }}
            >
              {/* Tooltip on hover — desktop only */}
              {isHovered && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 10px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '4px 10px',
                    borderRadius: 8,
                    background: 'rgba(28,28,30,0.96)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    zIndex: 60,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                  }}
                >
                  {language === 'ar' ? lab.labelAr : lab.labelEn}
                </div>
              )}

              {/* Icon button */}
              <button
                onClick={() => setCurrentTab(lab.id)}
                onMouseEnter={() => setHoveredId(lab.id)}
                onMouseLeave={() => setHoveredId(null)}
                onFocus={() => setHoveredId(lab.id)}
                onBlur={() => setHoveredId(null)}
                aria-label={language === 'ar' ? lab.labelAr : lab.labelEn}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '22.37%',
                  background: lab.gradient,
                  boxShadow: isActive
                    ? `0 0 0 2.5px #fff, 0 6px 20px ${lab.glow}, inset 0 1px 1px rgba(255,255,255,0.3)`
                    : `0 2px 10px ${lab.glow.replace('0.55','0.25')}, inset 0 1px 1px rgba(255,255,255,0.18)`,
                  transform: isActive
                    ? 'scale(1.18) translateY(-6px)'
                    : isHovered
                      ? 'scale(1.10) translateY(-3px)'
                      : 'scale(1) translateY(0)',
                  transition: 'transform 0.22s cubic-bezier(0.16,1,0.3,1), box-shadow 0.22s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: 'none',
                  flexShrink: 0,
                }}
              >
                <Icon style={{ width: 22, height: 22, color: '#fff', flexShrink: 0 }} />
              </button>

              {/* Label */}
              <span
                style={{
                  marginTop: 4,
                  fontSize: 10,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
                  transition: 'color 0.2s ease',
                  textAlign: 'center',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  paddingInline: 2,
                }}
              >
                {language === 'ar' ? lab.labelAr : lab.labelEn}
              </span>

              {/* Active dot */}
              <div
                style={{
                  marginTop: 2,
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: isActive ? '#fff' : 'transparent',
                  transition: 'background 0.2s ease',
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
