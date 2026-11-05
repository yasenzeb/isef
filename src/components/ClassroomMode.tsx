import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { AnatomyViewer } from './AnatomyViewer';
import { PhysicsLab } from './PhysicsLab';
import { ChemistryLab } from './ChemistryLab';
import { BiologyLab } from './BiologyLab';
import { GeologyLab } from './GeologyLab';
import { 
  Maximize2, 
  Minimize2, 
  X, 
  Presentation, 
  Activity, 
  Atom, 
  FlaskConical,
  Dna, 
  Globe2 
} from 'lucide-react';

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
      className="flex flex-col w-full h-[calc(100vh-210px)] min-h-[640px] rounded-[22px] overflow-hidden border border-[#e5e5e5] bg-[#07090e] text-white shadow-sm"
    >
      {/* Top Integrated Whiteboard Control Bar */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#0c0e15]/90 backdrop-blur-md px-4 py-2.5 z-30 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Presentation size={17} strokeWidth={2} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-mono">
              Smartboard 3D Interactive Mode
            </span>
            <h2 className="text-[14px] font-bold text-white">
              {ar ? 'السبورة والشاشات التفاعلية للفصول' : 'Interactive Classroom & Whiteboard'}
            </h2>
          </div>
        </div>

        {/* Center Module Selectors */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto max-w-full">
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
                    ? 'bg-white text-[#0a0a0a] shadow-sm'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={14} style={{ color: isActive ? m.accent : 'currentColor' }} />
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
            className="sn-btn sn-btn-sm border border-white/15 bg-white/10 hover:bg-white/20 text-white !h-8 !px-2.5"
            title={ar ? 'ملء الشاشة' : 'Toggle Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          
          <button
            type="button"
            onClick={onExit}
            className="sn-btn sn-btn-sm bg-rose-600 hover:bg-rose-500 text-white font-semibold !h-8 !px-3 shadow-sm"
          >
            <X size={14} />
            <span className="hidden sm:inline">{ar ? 'الخروج' : 'Exit'}</span>
          </button>
        </div>
      </header>

      {/* Presentation Content Canvas Area */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        {activeModule === 'anatomy' && <AnatomyViewer isPresentationMode={true} />}
        {activeModule === 'physics' && <PhysicsLab />}
        {activeModule === 'chemistry' && <ChemistryLab />}
        {activeModule === 'biology' && <BiologyLab />}
        {activeModule === 'geology' && <GeologyLab />}
      </main>

      {/* High-Contrast Footer Status */}
      <footer className="border-t border-white/10 bg-[#0c0e15] px-4 py-2 flex items-center justify-between text-[10px] text-white/50 shrink-0">
        <div>High-Contrast Projector & Smartboard Input Active &bull; 60 FPS Engine</div>
        <div className="font-mono text-emerald-400">SciNexa ISEF 2026</div>
      </footer>
    </div>
  );
};

export default ClassroomMode;
