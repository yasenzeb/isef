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
  ChevronLeft, 
  ChevronRight, 
  X, 
  Presentation, 
  Activity, 
  Atom, 
  Dna, 
  Globe2 
} from 'lucide-react';

interface ClassroomModeProps {
  onExit: () => void;
}

export const ClassroomMode: React.FC<ClassroomModeProps> = ({ onExit }) => {
  const { t, isRTL } = useLanguage();
  const [activeModule, setActiveModule] = useState<'anatomy' | 'physics' | 'chemistry' | 'biology' | 'geology'>('anatomy');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const modules = [
    { id: 'anatomy', label: t.nav.anatomy, icon: Activity },
    { id: 'physics', label: t.nav.physics, icon: Atom },
    { id: 'chemistry', label: t.nav.chemistry, icon: Atom },
    { id: 'biology', label: t.nav.biology, icon: Dna },
    { id: 'geology', label: t.nav.geology, icon: Globe2 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between">
      
      {/* Top Classroom Control Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Presentation className="w-6 h-6" />
          </div>
          <div className={isRTL ? "mr-3 text-right" : ""}>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">Classroom & Whiteboard Mode</span>
            <h2 className="text-lg font-black text-white">{t.classroom.title}</h2>
          </div>
        </div>

        {/* Center Module Selectors */}
        <div className="hidden md:flex items-center space-x-2 bg-slate-950 p-1 rounded-2xl border border-slate-800">
          {modules.map((m) => {
            const Icon = m.icon;
            const isActive = activeModule === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setActiveModule(m.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className={isRTL ? "mr-2" : ""}>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title={t.classroom.fullscreen}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
          
          <button
            onClick={onExit}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg transition-colors"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">{t.classroom.exitPresentation}</span>
          </button>
        </div>
      </header>

      {/* Presentation Content Area */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
        {activeModule === 'anatomy' && <AnatomyViewer isPresentationMode={true} />}
        {activeModule === 'physics' && <PhysicsLab />}
        {activeModule === 'chemistry' && <ChemistryLab />}
        {activeModule === 'biology' && <BiologyLab />}
        {activeModule === 'geology' && <GeologyLab />}
      </main>

      <footer className="bg-slate-900/90 border-t border-slate-800 px-6 py-3 flex items-center justify-between text-xs text-slate-400">
        <div>High-Contrast Projector Output &bull; Smartboard Interactive Input Active</div>
        <div className="font-mono text-emerald-400">SciNexa Virtual Laboratory Engine v2.0</div>
      </footer>

    </div>
  );
};
