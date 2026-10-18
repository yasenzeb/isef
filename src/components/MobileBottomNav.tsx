import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Home,
  Layers,
  Presentation,
  Download,
  Activity,
  Atom,
  Dna,
  Globe2,
  X,
  Sparkles,
  ChevronUp
} from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenOfflineModal: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  setCurrentTab,
  onOpenOfflineModal
}) => {
  const { language, isRTL } = useLanguage();
  const [labsDrawerOpen, setLabsDrawerOpen] = useState(false);

  const labsList = [
    { id: 'anatomy', labelAr: 'تشريح الإنسان 3D', labelEn: '3D Anatomy', icon: Activity, color: '#ec4899', grad: 'from-pink-500/20 to-purple-500/20' },
    { id: 'physics', labelAr: 'الفيزياء والموجات', labelEn: 'Physics & Waves', icon: Atom, color: '#38bdf8', grad: 'from-sky-500/20 to-indigo-500/20' },
    { id: 'chemistry', labelAr: 'الكيمياء 118 عنصر', labelEn: 'Chemistry 118', icon: Atom, color: '#f59e0b', grad: 'from-amber-500/20 to-rose-500/20' },
    { id: 'biology', labelAr: 'الأحياء والخلايا 3D', labelEn: 'Biology & Cells', icon: Dna, color: '#10b981', grad: 'from-emerald-500/20 to-teal-500/20' },
    { id: 'geology', labelAr: 'الجيولوجيا والزلازل', labelEn: 'Geology & Seismology', icon: Globe2, color: '#a855f7', grad: 'from-purple-500/20 to-indigo-500/20' },
    { id: 'astronomy', labelAr: 'الفلك وأطوار القمر', labelEn: 'Astronomy & Moon', icon: Sparkles, color: '#eab308', grad: 'from-yellow-500/20 to-amber-500/20' },
  ];

  const isCurrentLab = labsList.some(l => l.id === currentTab);

  return (
    <>
      {/* Labs Drawer Backdrop */}
      {labsDrawerOpen && (
        <div
          onClick={() => setLabsDrawerOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 md:hidden transition-opacity"
        />
      )}

      {/* Labs Drawer Bottom Sheet */}
      {labsDrawerOpen && (
        <div
          dir={isRTL ? 'rtl' : 'ltr'}
          className="fixed inset-x-0 bottom-0 z-50 md:hidden bg-[#070b19] border-t border-indigo-500/30 rounded-t-3xl p-5 shadow-2xl transition-transform duration-300 max-h-[85vh] overflow-y-auto"
          style={{ boxShadow: '0 -10px 40px rgba(0,0,0,0.8)' }}
        >
          {/* Drawer Handle */}
          <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4" />

          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">
                {language === 'ar' ? 'اختر المعمل العلمي التفاعلي' : 'Select Interactive Virtual Lab'}
              </h3>
            </div>
            <button
              onClick={() => setLabsDrawerOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Labs Grid */}
          <div className="grid grid-cols-2 gap-2.5 pb-4">
            {labsList.map((lab) => {
              const Icon = lab.icon;
              const isSelected = currentTab === lab.id;
              return (
                <button
                  key={lab.id}
                  onClick={() => {
                    setCurrentTab(lab.id);
                    setLabsDrawerOpen(false);
                  }}
                  className={`p-3 rounded-2xl border text-left flex flex-col gap-2 transition-all ${
                    isSelected
                      ? 'bg-gradient-to-br from-indigo-950 to-slate-900 border-indigo-400 shadow-lg shadow-indigo-500/20'
                      : 'bg-slate-900/60 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: lab.color + '22', border: `1px solid ${lab.color}44` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: lab.color }} />
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8]" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {language === 'ar' ? lab.labelAr : lab.labelEn}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      SciNexa Lab
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Docked Sticky Bottom Navigation Bar */}
      <nav
        dir={isRTL ? 'rtl' : 'ltr'}
        className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-[#050a1a]/95 backdrop-blur-2xl border-t border-white/10 px-2 py-1.5 shadow-[0_-4px_24px_rgba(0,0,0,0.6)]"
        style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="grid grid-cols-4 items-center gap-1 max-w-md mx-auto">
          {/* Tab 1: Home */}
          <button
            onClick={() => {
              setCurrentTab('home');
              setLabsDrawerOpen(false);
            }}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
              currentTab === 'home'
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div
              className={`p-1 rounded-lg ${
                currentTab === 'home'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]'
                  : ''
              }`}
            >
              <Home className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold mt-1">
              {language === 'ar' ? 'الرئيسية' : 'Home'}
            </span>
          </button>

          {/* Tab 2: Labs Drawer Opener */}
          <button
            onClick={() => setLabsDrawerOpen(!labsDrawerOpen)}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl relative transition-all ${
              isCurrentLab || labsDrawerOpen
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div
              className={`p-1 rounded-lg ${
                isCurrentLab || labsDrawerOpen
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]'
                  : ''
              }`}
            >
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold mt-1 flex items-center gap-0.5">
              <span>{language === 'ar' ? 'المعامل' : 'Labs'}</span>
              <ChevronUp className={`w-3 h-3 transition-transform ${labsDrawerOpen ? 'rotate-180' : ''}`} />
            </span>
          </button>

          {/* Tab 3: Classroom Smartboard */}
          <button
            onClick={() => {
              setCurrentTab('classroom');
              setLabsDrawerOpen(false);
            }}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
              currentTab === 'classroom'
                ? 'text-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div
              className={`p-1 rounded-lg ${
                currentTab === 'classroom'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                  : ''
              }`}
            >
              <Presentation className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold mt-1">
              {language === 'ar' ? 'السبورة' : 'Board'}
            </span>
          </button>

          {/* Tab 4: Offline / USB */}
          <button
            onClick={() => {
              onOpenOfflineModal();
              setLabsDrawerOpen(false);
            }}
            className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-emerald-400 hover:text-emerald-300 transition-all"
          >
            <div className="p-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Download className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[10px] font-semibold mt-1">
              {language === 'ar' ? 'أوفلاين' : 'Offline'}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
