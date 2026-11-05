import React, { useState, Suspense, lazy } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Maximize2, 
  Minimize2, 
  X, 
  Presentation, 
  Activity, 
  Atom, 
  FlaskConical,
  Dna, 
  Globe2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

const AnatomyViewer = lazy(() => import('./AnatomyViewer').then((m) => ({ default: m.AnatomyViewer })));
const PhysicsLab = lazy(() => import('./PhysicsLab').then((m) => ({ default: m.PhysicsLab })));
const ChemistryLab = lazy(() => import('./ChemistryLab').then((m) => ({ default: m.ChemistryLab })));
const BiologyLab = lazy(() => import('./BiologyLab').then((m) => ({ default: m.BiologyLab })));
const GeologyLab = lazy(() => import('./GeologyLab').then((m) => ({ default: m.GeologyLab })));

interface ClassroomModeProps {
  onExit: () => void;
}

export const ClassroomMode: React.FC<ClassroomModeProps> = ({ onExit }) => {
  const { language, isRTL } = useLanguage();
  const ar = language === 'ar';
  const [activeModule, setActiveModule] = useState<'anatomy' | 'physics' | 'chemistry' | 'biology' | 'geology'>('anatomy');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    const el = document.getElementById('classroom-stage-root');
    if (!document.fullscreenElement && el) {
      el.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const modules = [
    { id: 'anatomy', labelAr: 'أطلس التشريح 3D', labelEn: '3D Anatomy', icon: Activity, accent: '#f43f5e' },
    { id: 'physics', labelAr: 'مختبر الفيزياء', labelEn: 'Physics Lab', icon: Atom, accent: '#0ea5e9' },
    { id: 'chemistry', labelAr: 'الكيمياء والتفاعلات', labelEn: 'Chemistry Lab', icon: FlaskConical, accent: '#f97316' },
    { id: 'biology', labelAr: 'الأحياء والخلية', labelEn: 'Biology Lab', icon: Dna, accent: '#10b981' },
    { id: 'geology', labelAr: 'علوم الأرض والزلازل', labelEn: 'Geology Lab', icon: Globe2, accent: '#8b5cf6' },
  ];

  return (
    <div
      id="classroom-stage-root"
      dir={isRTL ? 'rtl' : 'ltr'}
      className="flex flex-col w-full h-[calc(100vh-210px)] min-h-[640px] rounded-[22px] overflow-hidden border border-[#e5e5e5] bg-white shadow-xs"
    >
      {/* Top Integrated Clean White Control Bar matching site design */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0f0f0] bg-white px-4 py-3 z-30 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0a0a0a] text-white">
            <Presentation size={16} strokeWidth={2} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-[#a3a3a3]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
              <span>Smartboard 3D · 60 FPS</span>
            </div>
            <h2 className="text-[14px] font-bold text-[#0a0a0a]">
              {ar ? 'السبورة والشاشات التفاعلية للفصول' : 'Interactive Classroom & Whiteboard'}
            </h2>
          </div>
        </div>

        {/* Center Module Selectors - Clean site-matching pills */}
        <div className="flex items-center gap-1.5 bg-[#f5f5f5] p-1 rounded-xl border border-[#e5e5e5] overflow-x-auto max-w-full">
          {modules.map((m) => {
            const Icon = m.icon;
            const isActive = activeModule === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveModule(m.id as any)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0a0a0a] text-white shadow-xs'
                    : 'text-[#737373] hover:text-[#0a0a0a] hover:bg-white/80'
                }`}
              >
                <Icon size={14} style={{ color: isActive ? '#ffffff' : m.accent }} />
                <span>{ar ? m.labelAr : m.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="sn-btn sn-btn-outline sn-btn-sm !h-8 !px-2.5"
            title={ar ? 'ملء الشاشة' : 'Toggle Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            <span className="hidden sm:inline text-[11px]">{ar ? 'شاشة كاملة' : 'Fullscreen'}</span>
          </button>
          
          <button
            type="button"
            onClick={onExit}
            className="sn-btn sn-btn-outline sn-btn-sm !h-8 !px-3 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors"
          >
            <X size={14} />
            <span className="hidden sm:inline text-[11px]">{ar ? 'خروج' : 'Exit'}</span>
          </button>
        </div>
      </header>

      {/* Presentation Content Canvas Area */}
      <main className="relative flex-1 w-full h-full overflow-hidden bg-[#090b10]">
        <Suspense fallback={
          <div className="flex h-full w-full items-center justify-center text-white/60 font-mono text-xs">
            {ar ? 'جاري تشغيل المعمل…' : 'Loading Lab…'}
          </div>
        }>
          {activeModule === 'anatomy' && <AnatomyViewer isPresentationMode={true} />}
          {activeModule === 'physics' && <PhysicsLab />}
          {activeModule === 'chemistry' && <ChemistryLab />}
          {activeModule === 'biology' && <BiologyLab />}
          {activeModule === 'geology' && <GeologyLab />}
        </Suspense>
      </main>

      {/* High-Contrast Footer Status */}
      <footer className="border-t border-[#f0f0f0] bg-white px-4 py-2 flex items-center justify-between text-[11px] text-[#737373] shrink-0">
        <div className="flex items-center gap-2">
          <ShieldCheck size={13} className="text-[#047857]" />
          <span>{ar ? 'وضع العرض التفاعلي الذكي مفعل' : 'High-Contrast Smartboard View Active'}</span>
        </div>
        <div className="font-mono text-[10px] text-[#a3a3a3]">SciNexa ISEF 2026</div>
      </footer>
    </div>
  );
};

export default ClassroomMode;
