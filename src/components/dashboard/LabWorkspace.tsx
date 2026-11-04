import React, { Suspense, lazy } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { getLab, type LabId } from '../../data/labs';
import { ArrowLeft, Activity, Maximize2, ShieldCheck } from 'lucide-react';
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
  <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-white/60">
    <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/15 border-t-white/80" />
    <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
      {ar ? 'تحميل محرك المحاكاة' : 'Loading simulation engine'}
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

  return (
    <div>
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Link to="/app/labs" className="sn-btn sn-btn-outline sn-btn-icon" aria-label={ar ? 'العودة للمعامل' : 'Back to labs'}>
            <ArrowLeft size={16} strokeWidth={1.8} className={ar ? 'rotate-180' : ''} />
          </Link>
          <div>
            <div className="sn-eyebrow !text-[10px]">
              {lab.index} · {ar ? lab.categoryAr : lab.categoryEn}
            </div>
            <h1 className="text-[17px] font-semibold tracking-[-0.02em]">{ar ? lab.nameAr : lab.nameEn}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="sn-badge sn-badge-green">
            <span className="sn-live-dot h-1.5 w-1.5 rounded-full bg-[#047857]" />
            {ar ? 'محاكاة مباشرة' : 'Live simulation'}
          </span>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('lab-stage');
              if (el?.requestFullscreen) void el.requestFullscreen().catch(() => {});
            }}
            className="sn-btn sn-btn-outline sn-btn-sm"
          >
            <Maximize2 size={13} strokeWidth={1.8} />
            {ar ? 'ملء الشاشة' : 'Fullscreen'}
          </button>
        </div>
      </div>

      <div id="lab-stage" className="sn-lab-stage">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] pb-4">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
            <Activity size={12} strokeWidth={1.8} className="text-white/70" />
            {ar ? 'محرك SciNexa ثلاثي الأبعاد' : 'SciNexa 3D engine'}
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] text-white/30">
            <ShieldCheck size={12} strokeWidth={1.8} />
            WebGL · 60 FPS
          </div>
        </div>

        <ErrorBoundary ar={ar} dark title={ar ? 'تعذّر تشغيل محرك 3D' : 'The 3D engine could not start'}>
          <Suspense fallback={<LabLoading ar={ar} />}>
            <Component />
          </Suspense>
        </ErrorBoundary>
      </div>

      <p className="mt-3 text-[10px] text-[#a3a3a3]">
        {ar
          ? 'استخدم الماوس أو اللمس للتدوير والتكبير. تُحفظ حالتك تلقائيًا عند الخروج من المعمل.'
          : 'Use the mouse or touch to rotate and zoom. Your state is saved automatically when you leave.'}
      </p>
    </div>
  );
};

export default LabWorkspace;
