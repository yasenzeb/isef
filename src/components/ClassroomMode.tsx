import React, { useState, useEffect, Suspense, lazy } from 'react';
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
  Sigma,
  Tv,
  ShieldCheck
} from 'lucide-react';

const AnatomyViewer = lazy(() => import('./AnatomyViewer').then((m) => ({ default: m.AnatomyViewer })));
const PhysicsLab = lazy(() => import('./PhysicsLab').then((m) => ({ default: m.PhysicsLab })));
const ChemistryLab = lazy(() => import('./ChemistryLab').then((m) => ({ default: m.ChemistryLab })));
const BiologyLab = lazy(() => import('./BiologyLab').then((m) => ({ default: m.BiologyLab })));
const GeologyLab = lazy(() => import('./GeologyLab').then((m) => ({ default: m.GeologyLab })));
const AstronomyLab = lazy(() => import('./AstronomyLab').then((m) => ({ default: m.AstronomyLab })));
const MathLab = lazy(() => import('./MathLab').then((m) => ({ default: m.MathLab })));

interface ClassroomModeProps {
  onExit: () => void;
}

export const ClassroomMode: React.FC<ClassroomModeProps> = ({ onExit }) => {
  const { language, isRTL } = useLanguage();
  const ar = language === 'ar';
  const [activeModule, setActiveModule] = useState<'anatomy' | 'physics' | 'chemistry' | 'biology' | 'geology' | 'astronomy' | 'math'>('physics');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTvHighContrast, setIsTvHighContrast] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    const el = document.getElementById('classroom-stage-root');
    if (!document.fullscreenElement && el) {
      el.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {
        setIsFullscreen(!isFullscreen);
      });
    } else if (document.fullscreenElement) {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {
        setIsFullscreen(false);
      });
    } else {
      setIsFullscreen(!isFullscreen);
    }
  };

  const modules = [
    { id: 'physics', labelAr: 'مختبر الفيزياء', labelEn: 'Physics Lab', icon: Atom, accent: '#0ea5e9' },
    { id: 'chemistry', labelAr: 'الكيمياء والتفاعلات', labelEn: 'Chemistry Lab', icon: FlaskConical, accent: '#f97316' },
    { id: 'anatomy', labelAr: 'أطلس التشريح 3D', labelEn: '3D Anatomy', icon: Activity, accent: '#f43f5e' },
    { id: 'biology', labelAr: 'الأحياء والخلية', labelEn: 'Biology Lab', icon: Dna, accent: '#10b981' },
    { id: 'geology', labelAr: 'علوم الأرض والزلازل', labelEn: 'Geology Lab', icon: Globe2, accent: '#8b5cf6' },
    { id: 'astronomy', labelAr: 'مرصد الفلك ومدارات كبلر', labelEn: 'Astronomy & Kepler', icon: Sparkles, accent: '#f59e0b' },
    { id: 'math', labelAr: 'معمل الرياضيات والهندسة', labelEn: 'Math & Geometry', icon: Sigma, accent: '#6366f1' },
  ];

  return (
    <div
      id="classroom-stage-root"
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`flex flex-col w-full transition-all duration-300 ${
        isFullscreen 
          ? 'fixed inset-0 z-50 h-screen w-screen bg-[#07090e] rounded-none border-0' 
          : 'relative h-[calc(100vh-100px)] min-h-[680px] rounded-[22px] overflow-hidden border border-[#e5e5e5] bg-white shadow-lg'
      }`}
    >
      {/* Top Integrated Clean White Control Bar matching site design */}
      <header className={`flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 z-30 shrink-0 transition-colors ${
        isFullscreen ? 'bg-[#0f131a] border-b border-white/10 text-white' : 'bg-white border-b border-[#f0f0f0]'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-sm">
            <Presentation size={16} strokeWidth={2} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-[#a3a3a3]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse" />
              <span>Smartboard &amp; TV 3D · 60 FPS</span>
            </div>
            <h2 className={`text-[13.5px] font-bold ${isFullscreen ? 'text-white' : 'text-[#0a0a0a]'}`}>
              {ar ? 'السبورة والشاشات التفاعلية للفصول ووضع التلفاز' : 'Interactive Classroom & TV Whiteboard'}
            </h2>
          </div>
        </div>

        {/* Center Module Selectors - Clean site-matching pills */}
        <div className={`flex items-center gap-1.5 p-1 rounded-xl border overflow-x-auto max-w-full ${
          isFullscreen ? 'bg-white/5 border-white/10' : 'bg-[#f5f5f5] border-[#e5e5e5]'
        }`}>
          {modules.map((m) => {
            const Icon = m.icon;
            const isActive = activeModule === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveModule(m.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm font-bold'
                    : isFullscreen
                      ? 'text-slate-300 hover:text-white hover:bg-white/10'
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
          {/* High Contrast TV toggle */}
          <button
            type="button"
            onClick={() => setIsTvHighContrast(!isTvHighContrast)}
            className={`sn-btn sn-btn-sm !h-8 !px-2.5 transition-colors cursor-pointer ${
              isTvHighContrast ? 'bg-amber-500 text-black font-bold' : isFullscreen ? 'bg-white/10 text-white hover:bg-white/20' : 'sn-btn-outline'
            }`}
            title={ar ? 'نمط التلفاز عالي التباين' : 'TV High-Contrast'}
          >
            <Tv size={14} />
            <span className="hidden sm:inline text-[11px]">{ar ? 'وضع التلفاز' : 'TV Mode'}</span>
          </button>

          {/* Fullscreen toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className={`sn-btn sn-btn-sm !h-8 !px-2.5 cursor-pointer ${
              isFullscreen ? 'bg-white/10 text-white hover:bg-white/20' : 'sn-btn-outline'
            }`}
            title={ar ? 'ملء الشاشة' : 'Toggle Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            <span className="hidden sm:inline text-[11px]">{ar ? 'شاشة كاملة' : 'Fullscreen'}</span>
          </button>
          
          <button
            type="button"
            onClick={onExit}
            className={`sn-btn sn-btn-sm !h-8 !px-3 transition-colors cursor-pointer ${
              isFullscreen ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30' : 'sn-btn-outline hover:bg-[#f5f5f5] text-[#171717]'
            }`}
          >
            <X size={14} />
            <span className="hidden sm:inline text-[11px]">{ar ? 'خروج' : 'Exit'}</span>
          </button>
        </div>
      </header>

      {/* Presentation Content Canvas Area */}
      <main className={`relative flex-1 w-full h-full overflow-y-auto overflow-x-hidden transition-all ${
        isTvHighContrast ? 'bg-[#000000] contrast-125' : 'bg-[#060810]'
      }`}>
        <Suspense fallback={
          <div className="flex h-full min-h-[400px] w-full items-center justify-center text-white/60 font-mono text-xs">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent me-2" />
            {ar ? 'جاري تشغيل المعمل التفاعلي للشاشة…' : 'Loading Interactive Lab…'}
          </div>
        }>
          <div className="w-full h-full min-h-[600px]">
            {activeModule === 'physics' && <PhysicsLab />}
            {activeModule === 'chemistry' && <ChemistryLab />}
            {activeModule === 'anatomy' && <AnatomyViewer isPresentationMode={true} />}
            {activeModule === 'biology' && <BiologyLab />}
            {activeModule === 'geology' && <GeologyLab />}
            {activeModule === 'astronomy' && <AstronomyLab />}
            {activeModule === 'math' && <MathLab />}
          </div>
        </Suspense>
      </main>

      {/* High-Contrast Footer Status */}
      <footer className={`px-4 py-2 flex items-center justify-between text-[11px] shrink-0 border-t transition-colors ${
        isTvHighContrast ? 'bg-black border-yellow-500/40 text-yellow-300' : 'bg-[#060810] border-slate-800 text-slate-400'
      }`}>
        <div className="flex items-center gap-2">
          <ShieldCheck size={13} className="text-[#047857]" />
          <span>
            {ar
              ? isTvHighContrast 
                ? 'وضع التلفاز عالي التباين مفعل للشاشات الكبيرة والسبورات الذكية' 
                : 'وضع العرض التفاعلي الذكي مفعل لجميع المعامل السبعة'
              : 'Interactive Smartboard Presentation Active for All 7 Labs'}
          </span>
        </div>
        <div className="font-mono text-[10px] text-[#a3a3a3]">SciNexa ISEF 2026 · Smart Classroom</div>
      </footer>
    </div>
  );
};

export default ClassroomMode;
