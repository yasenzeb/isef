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
import { getLab, type LabId } from '../../data/labs';
import { useLabActiveTracker } from '../../lib/labTracker';
import { ArrowLeft, Activity, Maximize2, ShieldCheck, Sparkles, RefreshCw, Compass } from 'lucide-react';
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
  <div className="flex h-full min-h-[520px] flex-col items-center justify-center gap-3.5 rounded-2xl border border-[#e5e5e5] bg-white text-[#737373]">
    <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#e5e5e5] border-t-[#0a0a0a]" />
    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#737373]">
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
    <div dir={ar ? 'rtl' : 'ltr'} className="space-y-4">
      {/* Top Integrated Control Header — Seamless Dark Observatory Theme */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-800/90 bg-[#090d16] p-3.5 shadow-xl text-slate-100">
        <div className="flex items-center gap-3">
          <Link
            to="/app/labs"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700/80 bg-slate-800/70 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            aria-label={ar ? 'العودة للمعامل' : 'Back to labs'}
          >
            <ArrowLeft size={16} strokeWidth={1.8} className={ar ? 'rotate-180' : ''} />
          </Link>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-sky-400 font-bold">
              {lab.index} · {ar ? lab.categoryAr : lab.categoryEn}
            </div>
            <h1 className="text-[17px] font-extrabold tracking-tight text-white">
              {ar ? lab.nameAr : lab.nameEn}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
            <span className="sn-live-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {ar ? 'محاكاة حية 60 FPS' : 'Live 60 FPS'}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 border border-sky-500/20 text-sky-300">
            <ShieldCheck size={12} strokeWidth={1.8} className="text-sky-400" />
            WebGL 2.0
          </span>
          <Link to="/app/curriculum" className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors">
            <Compass size={13} strokeWidth={1.8} />
            {ar ? 'دروس المنهج' : 'Curriculum'}
          </Link>
          <button
            type="button"
            onClick={handleFullscreen}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            <Maximize2 size={13} strokeWidth={1.8} />
            {ar ? 'ملء الشاشة' : 'Fullscreen'}
          </button>
        </div>
      </div>

      {/* Seamless Integrated Lab Workspace Stage */}
      <div id="lab-canvas-container" className="sn-lab-stage w-full !p-2 sm:!p-3 !bg-[#060810] !border-slate-800/90 shadow-2xl rounded-2xl overflow-hidden">
        <ErrorBoundary ar={ar} title={ar ? 'تعذّر تشغيل محرك 3D' : 'The 3D engine could not start'}>
          <Suspense fallback={<LabLoading ar={ar} />}>
            <Component />
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* Footer Helper Note */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
        <span>
          {ar
            ? '💡 استخدم الماوس أو اللمس للتدوير والتكبير والتفاعل مع المجسم. تكامل الذكاء الاصطناعي داروين نشط لحظياً.'
            : '💡 Use mouse or touch to rotate, zoom, and interact with the 3D model. Darwin AI live telemetry is active.'}
        </span>
        <span className="font-mono text-[10px] text-slate-500">
          WebGL 2.0 · Zero-Idle Hardware Accelerated
        </span>
      </div>
    </div>
  );
};

export default LabWorkspace;
