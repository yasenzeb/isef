/**
 * LabWorkspace.tsx — مساحة العمل التفاعلية للمعامل ثلاثية الأبعاد
 * تصميم مدمج وأنيق ينسجم 100% مع لوحة تحكم SciNexa بألوانها ومقاييسها المعتمدة.
 *
 * © Islam & Yaseen — SciNexa ISEF 2026
 */

import React, { Suspense, lazy } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useSession } from '../../context/SessionContext';
import { LAB_MODULES, getLab, type LabId } from '../../data/labs';
import { useLabActiveTracker } from '../../lib/labTracker';
import { ArrowLeft, Maximize2, ShieldCheck, Compass } from 'lucide-react';
import { ErrorBoundary } from '../ui/ErrorBoundary';

const AnatomyViewer = lazy(() => import('../AnatomyViewer').then((m) => ({ default: m.AnatomyViewer })));
const PhysicsLab = lazy(() => import('../PhysicsLab').then((m) => ({ default: m.PhysicsLab })));
const ChemistryLab = lazy(() => import('../ChemistryLab').then((m) => ({ default: m.ChemistryLab })));
const BiologyLab = lazy(() => import('../BiologyLab').then((m) => ({ default: m.BiologyLab })));
const GeologyLab = lazy(() => import('../GeologyLab').then((m) => ({ default: m.GeologyLab })));
const AstronomyLab = lazy(() => import('../AstronomyLab').then((m) => ({ default: m.AstronomyLab })));
const MathLab = lazy(() => import('../MathLab').then((m) => ({ default: m.MathLab })));

const COMPONENTS: Record<LabId, React.LazyExoticComponent<React.ComponentType<Record<string, never>>>> = {
  anatomy: AnatomyViewer as unknown as React.LazyExoticComponent<React.ComponentType<Record<string, never>>>,
  physics: PhysicsLab,
  chemistry: ChemistryLab,
  biology: BiologyLab,
  geology: GeologyLab,
  astronomy: AstronomyLab,
  math: MathLab,
};

const LabLoading: React.FC<{ ar: boolean }> = ({ ar }) => (
  <div className="flex h-full min-h-[520px] flex-col items-center justify-center gap-3.5 rounded-2xl bg-[#0b0f17] text-slate-400">
    <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-sky-400" />
    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">
      {ar ? 'تهيئة محرك المحاكاة ثلاثي الأبعاد…' : 'Initializing 3D Simulation Engine…'}
    </span>
  </div>
);

export const LabWorkspace: React.FC = () => {
  const { labId } = useParams();
  const { language } = useLanguage();
  const { user } = useSession();
  const ar = language === 'ar';
  const lab = getLab(labId);

  // Active Real Exploration Tracking (Zero Fake Data)
  useLabActiveTracker(lab?.id, user?.email);

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
    <div dir={ar ? 'rtl' : 'ltr'} className="space-y-2.5">
      {/* Unified Seamless Observatory Shell (Docked Header + High-Contrast Dark Stage) */}
      <div
        id="lab-canvas-container"
        className="w-full overflow-hidden rounded-[22px] border border-white/10 bg-[#0b0f17] text-slate-100 shadow-[0_24px_64px_-24px_rgba(10,10,10,0.45)]"
      >
        {/* Docked Observatory Control Bar */}
        <div className="flex flex-col gap-3 border-b border-white/10 bg-[#0e1422] px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/app/labs"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
              aria-label={ar ? 'العودة للمعامل' : 'Back to labs'}
            >
              <ArrowLeft size={16} strokeWidth={1.8} className={ar ? 'rotate-180' : ''} />
            </Link>
            <div className="min-w-0">
              <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-sky-400">
                {lab.index} · {ar ? lab.categoryAr : lab.categoryEn}
              </div>
              <h1 className="truncate text-[16px] font-extrabold tracking-tight text-white">
                {ar ? lab.nameAr : lab.nameEn}
              </h1>
            </div>
          </div>

          {/* Quick Seamless Room Switcher Across All 7 Observatory Labs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
            {LAB_MODULES.map((item) => {
              const active = item.id === lab.id;
              return (
                <Link
                  key={item.id}
                  to={`/app/labs/${item.id}`}
                  className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
                    active
                      ? 'bg-white text-[#0b0f17] shadow-xs'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {ar ? item.nameAr.split(' ')[0] : item.nameEn.split(' ')[0]}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
              <span className="sn-live-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {ar ? '60 FPS' : '60 FPS'}
            </span>
            <span className="hidden xl:inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold text-sky-300">
              <ShieldCheck size={12} strokeWidth={1.8} />
              WebGL 2.0
            </span>
            <Link
              to="/app/curriculum"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Compass size={13} strokeWidth={1.8} />
              {ar ? 'المناهج' : 'Curriculum'}
            </Link>
            <button
              type="button"
              onClick={handleFullscreen}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Maximize2 size={13} strokeWidth={1.8} />
              {ar ? 'ملء الشاشة' : 'Fullscreen'}
            </button>
          </div>
        </div>

        {/* Seamless Unified Lab Stage */}
        <div className="sn-lab-stage w-full !rounded-none !border-0 !bg-[#0b0f17] !p-3 sm:!p-5">
          <ErrorBoundary dark ar={ar} title={ar ? 'تعذّر تشغيل محرك 3D' : 'The 3D engine could not start'}>
            <Suspense fallback={<LabLoading ar={ar} />}>
              <Component />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>

      {/* Footer Helper Note */}
      <div className="flex items-center justify-between px-1 pt-0.5 text-[11px] text-[#737373]">
        <span>
          {ar
            ? '💡 استخدم الماوس أو اللمس للتدوير والتكبير والتفاعل مع المجسم. تكامل الذكاء الاصطناعي داروين نشط لحظياً.'
            : '💡 Use mouse or touch to rotate, zoom, and interact with the 3D model. Darwin AI live telemetry is active.'}
        </span>
        <span className="font-mono text-[10px] text-[#a3a3a3]">
          WebGL 2.0 · Unified Dark Observatory
        </span>
      </div>
    </div>
  );
};

export default LabWorkspace;
