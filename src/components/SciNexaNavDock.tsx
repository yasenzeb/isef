/**
 * SciNexaNavDock.tsx — شريط التنقل الكبسولي المتطور لمنصة ساينكسا
 * كبسولة زجاجية داكنة فخمة تضم المعامل الستة والأوفر فيو وزر داروين الصوتي المباشر
 *
 * © Islam & Yaseen — SciNexa ISEF 2026
 */

import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useSession } from '../context/SessionContext';
import {
  Home,
  Activity,
  Zap,
  FlaskConical,
  Dna,
  Globe2,
  Sparkles,
  Mic,
  X,
  Radio,
  Volume2,
  Eye,
  ShieldAlert,
  Send,
  Navigation,
  Lock,
} from 'lucide-react';

interface SciNexaNavDockProps {
  className?: string;
}

interface DockItem {
  id: string;
  to: string;
  labelAr: string;
  labelEn: string;
  labelFr: string;
  labelDe: string;
  labelJa: string;
  icon: React.ElementType;
  bgGradient: string;
  glow: string;
}

const DOCK_ITEMS: DockItem[] = [
  {
    id: 'astronomy',
    to: '/app/labs/astronomy',
    labelAr: 'مرصد الفلك ومدارات كبلر',
    labelEn: 'Kepler Astronomy Lab',
    labelFr: 'Astronomie & Kepler',
    labelDe: 'Astronomie & Kepler',
    labelJa: 'ケプラー天文台・惑星軌道',
    icon: Sparkles,
    bgGradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    glow: 'rgba(245, 158, 11, 0.5)',
  },
  {
    id: 'geology',
    to: '/app/labs/geology',
    labelAr: 'علوم الأرض والزلازل',
    labelEn: 'Geology & Seismic Lab',
    labelFr: 'Géologie & Séismes',
    labelDe: 'Geologie & Erdbeben',
    labelJa: '地球科学・地震シミュレータ',
    icon: Globe2,
    bgGradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    glow: 'rgba(139, 92, 246, 0.5)',
  },
  {
    id: 'biology',
    to: '/app/labs/biology',
    labelAr: 'مختبر الأحياء والخلية',
    labelEn: 'Biology & Cell Lab',
    labelFr: 'Biologie & Cellule',
    labelDe: 'Biologie & Zelle',
    labelJa: '生物学・細胞実験室',
    icon: Dna,
    bgGradient: 'linear-gradient(135deg, #10b981, #059669)',
    glow: 'rgba(16, 185, 129, 0.5)',
  },
  {
    id: 'chemistry',
    to: '/app/labs/chemistry',
    labelAr: 'مختبر الكيمياء والتفاعلات',
    labelEn: 'Chemistry Reactions Lab',
    labelFr: 'Chimie & Réactions',
    labelDe: 'Chemie & Reaktionen',
    labelJa: '化学反応・元素実験室',
    icon: FlaskConical,
    bgGradient: 'linear-gradient(135deg, #f97316, #ea580c)',
    glow: 'rgba(249, 115, 22, 0.5)',
  },
  {
    id: 'physics',
    to: '/app/labs/physics',
    labelAr: 'مختبر الفيزياء والدوائر',
    labelEn: 'Physics & Waves Lab',
    labelFr: 'Physique & Ondes',
    labelDe: 'Physik & Wellen',
    labelJa: '物理学・電気回路実験室',
    icon: Zap,
    bgGradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    glow: 'rgba(14, 165, 233, 0.5)',
  },
  {
    id: 'anatomy',
    to: '/app/labs/anatomy',
    labelAr: 'أطلس التشريح الطبي 3D',
    labelEn: '3D Anatomy Atlas',
    labelFr: 'Atlas Anatomie 3D',
    labelDe: '3D-Anatomie-Atlas',
    labelJa: '3D人体解剖学アトラス',
    icon: Activity,
    bgGradient: 'linear-gradient(135deg, #f43f5e, #e11d48)',
    glow: 'rgba(244, 63, 94, 0.5)',
  },
  {
    id: 'overview',
    to: '/app',
    labelAr: 'الرئيسية · لوحة التحكم',
    labelEn: 'Dashboard Overview',
    labelFr: 'Tableau de bord',
    labelDe: 'Übersicht',
    labelJa: 'ダッシュボード・概要',
    icon: Home,
    bgGradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    glow: 'rgba(59, 130, 246, 0.5)',
  },
];

export const SciNexaNavDock: React.FC<SciNexaNavDockProps> = ({ className = '' }) => {
  const { language } = useLanguage();
  const { role, educator, user } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const ar = language === 'ar';
  const ja = language === 'ja';

  const getLabel = (item: DockItem) => {
    switch (language) {
      case 'ja': return item.labelJa;
      case 'fr': return item.labelFr;
      case 'de': return item.labelDe;
      case 'en': return item.labelEn;
      default: return item.labelAr;
    }
  };

  const handleToggleDarwin = () => {
    let agent = document.querySelector('fish-agent') as HTMLElement | null;
    if (!agent) {
      agent = document.createElement('fish-agent');
      agent.setAttribute('id', 'fish-agent-darwin');
      agent.setAttribute('agent-id', '929a1bf391db4185b03ae62f05a49207');
      agent.setAttribute('language', ar ? 'ar' : 'en');
      agent.setAttribute('agent-name', ar ? 'داروين • مرشد العلوم' : 'Darwin AI');
      agent.setAttribute(
        'greeting',
        ar
          ? 'أهلاً بك يا بطل! أنا داروين مرشدك العلمي في منصة SciNexa، جاهز للإجابة عن أسئلتك ومساعدتك في المعامل.'
          : 'Welcome! I am Darwin, your science guide in SciNexa. Ready to answer your questions and assist you across all labs.'
      );
      agent.setAttribute('text-input', 'true');
      agent.setAttribute('transcript', 'true');
      agent.setAttribute('mic-muting', 'true');
      document.body.appendChild(agent);
    }

    // Toggle: if open minimize, if closed expand immediately
    if (agent && agent.shadowRoot) {
      const panel = agent.shadowRoot.querySelector('.fa-panel');
      if (panel) {
        const minBtn = agent.shadowRoot.querySelector('.fa-header-actions button') as HTMLButtonElement | null;
        if (minBtn) {
          minBtn.click();
          setIsVoiceOpen(false);
          return;
        }
      }
      const fabBtn = agent.shadowRoot.querySelector('.fa-fab') as HTMLButtonElement | null;
      if (fabBtn) {
        fabBtn.click();
        setIsVoiceOpen(true);
        return;
      }
    }

    document.dispatchEvent(new CustomEvent('fish-agent:expand'));
    setIsVoiceOpen(true);
  };

  return (
    <>

      {/* ── BOTTOM DOCK TASKBAR ── */}
      <aside
        aria-label="SciNexa Dock Taskbar"
        className={`fixed bottom-4 inset-x-0 z-40 flex justify-center items-end pointer-events-none px-3 ${className}`}
        style={{ paddingBottom: 'max(6px, env(safe-area-inset-bottom, 6px))' }}
      >
        <nav
          dir="ltr"
          className="pointer-events-auto flex items-center justify-center gap-2 sm:gap-2.5 px-3 py-2.5 rounded-[24px] bg-[#141518]/95 border border-white/15 backdrop-blur-2xl shadow-[0_18px_60px_-10px_rgba(0,0,0,0.65)] transition-all duration-300"
        >
          {DOCK_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.to === '/app'
                ? location.pathname === '/app'
                : location.pathname.startsWith(item.to);
            const isHovered = hoveredId === item.id;
            const label = getLabel(item);

            return (
              <div key={item.id} className="relative flex flex-col items-center">
                {/* Tooltip */}
                {isHovered && (
                  <div
                    className="absolute bottom-full mb-3 px-3 py-1.5 rounded-xl text-white text-[11px] font-semibold whitespace-nowrap pointer-events-none shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
                    style={{
                      background: 'rgba(15, 17, 23, 0.96)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255, 255, 255, 0.18)',
                      boxShadow: `0 8px 24px -4px ${item.glow}`,
                    }}
                  >
                    {label}
                  </div>
                )}

                {/* Squircle Button */}
                <button
                  type="button"
                  onClick={() => navigate(item.to)}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  aria-label={label}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-[14px] flex items-center justify-center transition-all duration-200 cursor-pointer select-none active:scale-95 shrink-0 relative overflow-hidden"
                  style={{
                    background: item.bgGradient,
                    transform: isHovered
                      ? 'scale(1.12) translateY(-3px)'
                      : isActive
                        ? 'scale(1.05)'
                        : 'scale(1)',
                    boxShadow: isActive
                      ? `0 0 0 2.5px #ffffff, 0 8px 20px -2px ${item.glow}`
                      : isHovered
                        ? `0 6px 18px ${item.glow}`
                        : '0 2px 8px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <Icon size={19} strokeWidth={2.1} className="text-white drop-shadow" />
                </button>

                {/* Glowing Active Indicator Dot */}
                <div
                  className="mt-1 w-1.5 h-1.5 rounded-full transition-all duration-200"
                  style={{
                    background: isActive ? '#60a5fa' : 'transparent',
                    boxShadow: isActive ? '0 0 8px #60a5fa, 0 0 2px #ffffff' : 'none',
                  }}
                />
              </div>
            );
          })}

          {/* Divider */}
          <div className="h-6 w-px bg-white/15 mx-0.5 shrink-0" />

          {/* Darwin AI Voice Companion Squircle Button */}
          <div className="relative flex flex-col items-center shrink-0">
            {hoveredId === 'darwin' && (
              <div
                className="absolute bottom-full mb-3 px-3 py-1.5 rounded-xl text-white text-[11px] font-semibold whitespace-nowrap pointer-events-none shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
                style={{
                  background: 'rgba(15, 17, 23, 0.96)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 24px rgba(6, 182, 212, 0.45)',
                }}
              >
                {ar ? 'داروين | وكيل الذكاء الصوتي (Fish Audio)' : 'Darwin | AI Voice Assistant'}
              </div>
            )}

            <button
              type="button"
              onClick={handleToggleDarwin}
              onMouseEnter={() => setHoveredId('darwin')}
              onMouseLeave={() => setHoveredId(null)}
              aria-label="Darwin AI Voice Assistant"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-[14px] flex items-center justify-center transition-all duration-200 cursor-pointer select-none active:scale-95 shrink-0 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
                transform: hoveredId === 'darwin' || isVoiceOpen ? 'scale(1.12) translateY(-3px)' : 'scale(1)',
                boxShadow: isVoiceOpen ? '0 0 0 2.5px #ffffff, 0 0 25px #22d3ee' : '0 4px 16px rgba(6, 182, 212, 0.45)',
              }}
            >
              <span className="absolute inset-0 rounded-[14px] bg-cyan-300 opacity-20 animate-ping" />
              <Mic size={18} strokeWidth={2.2} className="text-white relative z-10" />
            </button>

            <div
              className="mt-1 w-1.5 h-1.5 rounded-full"
              style={{
                background: isVoiceOpen ? '#22d3ee' : '#06b6d4',
                boxShadow: isVoiceOpen ? '0 0 10px #22d3ee' : 'none',
              }}
            />
          </div>
        </nav>
      </aside>
    </>
  );
};

export default SciNexaNavDock;
