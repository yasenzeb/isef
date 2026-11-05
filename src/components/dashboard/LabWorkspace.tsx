/**
 * LabWorkspace.tsx — مساحة العمل التفاعلية للمعامل ثلاثية الأبعاد
 * تصميم مدمج وأنيق ينسجم 100% مع لوحة تحكم SciNexa دون فجوات أو إطارات نافرة.
 *
 * © Islam & Yaseen — SciNexa ISEF 2026
 */

import React, { Suspense, lazy } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { getLab, type LabId } from '../../data/labs';
import { ArrowLeft, Activity, Maximize2, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';
import { ErrorBoundary } from '../ui/ErrorBoundary';

const AnatomyViewer = lazy(() => import('../AnatomyViewer').then((m) => ({ default: m.AnatomyViewer })));
const PhysicsLab = lazy(() => import('../PhysicsLab').then((m) => ({ default: m.PhysicsLab })));
const ChemistryLab = lazy(() => import('../ChemistryLab').then((m) => ({ default: m.ChemistryLab })));
const BiologyLab = lazy(() => import('../BiologyLab').then((m) => ({ default: m.BiologyLab })));
const GeologyLab = lazy(() => import('../GeologyLab').then((m) => ({ default: m.GeologyLab })));
const AstronomyLab = lazy(() => import('../AstronomyLab').then((m) => ({ default: m.AstronomyLab })));

const COMPONENTS: Record<LabId, React.LazyExoticComponent<React.ComponentType<Record<string, never>>>> = {
  anatomy: AnatomyViewer as unknown as React.LazyExoticComponent<React.ComponentType<Record<string, never>>>,
  physics: PhysicsLab,
  chemistry: ChemistryLab,
  biology: BiologyLab,
  geology: GeologyLab,
  astronomy: AstronomyLab,
};

const LabLoading: React.FC<{ ar: boolean }> = ({ ar }) => (
  <div className="flex h-full min-h-[500px] flex-col items-center justify-center gap-3 text-white/70">
    <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
    <span className="font-mono text-[11px] uppercase tracking-[0.2em]">
      {ar ? 'تهيئة محرك المحاكاة ثلاثي الأبعاد…' : 'Initializing 3D Simulation Engine…'}
    </span>
  </div>
);

export const LabWorkspace: React.FC = () => {
  const { labId } = useParams();
  const { language } = useLanguage();
  const ar = language === 'ar';
  const lab = getLab(labId);

  if (!lab) return <Navigate to="/app/labs" replace />;

  const Component = COMPONENTS[lab.id];

  const handleFullscreen = () => {
    const el = document.getElementById('lab-canvas-container');
    if (el) {
      if (!document.fullscreenElement) {
        void el.requestFullscreen().catch(() => {});
      } else {
        void document.exitFullscreen().catch(() => {});
      }
    }
  };

  return (
    <div dir={ar ? 'rtl' : 'ltr'} className="space-y-3">
      {/* Top Integrated Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[#e5e5e5] bg-white p-3.5 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            to="/app/labs"
            className="sn-btn sn-btn-outline sn-btn-icon"
            aria-label={ar ? 'العودة للمعامل' : 'Back to labs'}
          >
            <ArrowLeft size={16} strokeWidth={1.8} className={ar ? 'rotate-180' : ''} />
          </Link>
          <div>
            <div className="sn-eyebrow !text-[10px]">
              {lab.index} · {ar ? lab.categoryAr : lab.categoryEn}
            </div>
            <h1 className="text-[17px] font-bold tracking-tight text-[#0a0a0a]">
              {ar ? lab.nameAr : lab.nameEn}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="sn-badge sn-badge-green">
            <span className="sn-live-dot h-1.5 w-1.5 rounded-full bg-[#047857]" />
            {ar ? 'محاكاة حية 60 FPS' : 'Live 60 FPS'}
          </span>
          <span className="sn-badge sn-badge-outline hidden sm:inline-flex">
            <ShieldCheck size={12} strokeWidth={1.8} className="text-[#047857]" />
            WebGL 2.0
          </span>
          <button
            type="button"
            onClick={handleFullscreen}
            className="sn-btn sn-btn-outline sn-btn-sm"
          >
            <Maximize2 size={13} strokeWidth={1.8} />
            {ar ? 'ملء الشاشة' : 'Fullscreen'}
          </button>
        </div>
      </div>

      {/* Seamless Integrated 3D Viewport Stage */}
      <div
        id="lab-canvas-container"
        className="sn-lab-stage relative w-full overflow-hidden rounded-[22px] border border-[#e5e5e5] bg-[#07090e] shadow-sm min-h-[640px] h-[calc(100vh-215px)] flex flex-col !p-0"
      >
        {/* Subtle Top Info Glass Bar inside Viewport */}
        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#07090e]/80 backdrop-blur-md px-4 py-2 text-white">
          <div className="flex items-center gap-2 font-mono text-[11px] text-white/80">
            <Activity size={13} className="text-cyan-400" />
            <span>{ar ? lab.nameAr : lab.nameEn}</span>
            <span className="text-white/30">|</span>
            <span className="text-white/50 text-[10px]">{ar ? 'محرك SciNexa 3D' : 'SciNexa 3D Engine'}</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] text-white/60">
            <span>ISEF 2026 · Interactive Canvas</span>
          </div>
        </div>

        {/* 3D Component Rendering Area */}
        <div className="relative flex-1 w-full h-full pt-9">
          <ErrorBoundary ar={ar} dark title={ar ? 'تعذّر تشغيل محرك 3D' : 'The 3D engine could not start'}>
            <Suspense fallback={<LabLoading ar={ar} />}>
              <Component />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>

      {/* Footer Helper Note */}
      <div className="flex items-center justify-between text-[11px] text-[#737373] px-1">
        <span>
          {ar
            ? '💡 استخدم الماوس أو اللمس للتدوير والتكبير والتفاعل مع المجسم. تُحفظ حالتك تلقائياً.'
            : '💡 Use mouse or touch to rotate, zoom, and interact with the 3D model. Progress saves automatically.'}
        </span>
        <span className="font-mono text-[10px] text-[#a3a3a3]">
          WebGL · Hardware Accelerated
        </span>
      </div>
    </div>
  );
};

export default LabWorkspace;
