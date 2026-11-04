import React, { Suspense, lazy } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { getLab, LAB_MODULES, type LabId } from '../../data/labs';
import {
  ArrowLeft,
  Activity,
  Maximize2,
  ShieldCheck,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';
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
  <div className="flex min-h-[500px] flex-col items-center justify-center gap-3 text-white/60">
    <span className="h-7 w-7 animate-spin rounded-full border-2 border-white/15 border-t-cyan-400" />
    <span className="font-mono text-[11px] uppercase tracking-[0.18em]">
      {ar ? 'تحميل بيئة المحاكاة العلمية 3D...' : 'Initializing 3D Simulation Environment...'}
    </span>
  </div>
);

export const LabWorkspace: React.FC = () => {
  const { labId } = useParams();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const ar = language === 'ar';
  const lab = getLab(labId);

  if (!lab) return <Navigate to="/app/labs" replace />;

  const Component = COMPONENTS[lab.id];

  const handleOpenDarwin = () => {
    // Open Fish Audio voice agent
    const el = document.querySelector('fish-agent') as any;
    if (el?.shadowRoot) {
      const btn = el.shadowRoot.querySelector('button') as HTMLElement | null;
      if (btn) {
        btn.click();
        return;
      }
    }
    navigate('/app/assistant');
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center bg-white dark:bg-[#121215] p-3 sm:p-4 rounded-2xl border border-[#e5e5e5] dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            to="/app/labs"
            className="sn-btn sn-btn-outline sn-btn-icon !h-9 !w-9"
            aria-label={ar ? 'العودة للمعامل' : 'Back to labs'}
          >
            <ArrowLeft size={16} strokeWidth={1.8} className={ar ? 'rotate-180' : ''} />
          </Link>
          <div>
            <div className="sn-eyebrow !text-[10px] text-[#1d4ed8] dark:text-blue-400">
              {lab.index} · {ar ? lab.categoryAr : lab.categoryEn}
            </div>
            <h1 className="text-[17px] font-bold tracking-tight text-[#0a0a0a] dark:text-white">
              {ar ? lab.nameAr : lab.nameEn}
            </h1>
          </div>
        </div>

        {/* Quick Lab Switcher Pills */}
        <div className="hidden xl:flex items-center gap-1.5 overflow-x-auto py-1">
          {LAB_MODULES.map((m) => {
            const active = m.id === lab.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => navigate(`/app/labs/${m.id}`)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  active
                    ? 'bg-[#0a0a0a] text-white dark:bg-white dark:text-[#0a0a0a] shadow-sm'
                    : 'text-[#737373] hover:text-[#0a0a0a] dark:hover:text-white hover:bg-[#f5f5f5] dark:hover:bg-white/5'
                }`}
              >
                {ar ? m.nameAr : m.nameEn}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Darwin Voice Assistant quick button */}
          <button
            type="button"
            onClick={handleOpenDarwin}
            className="sn-btn sn-btn-outline sn-btn-sm !h-8 !px-2.5 flex items-center gap-1.5 text-[11px] text-[#1d4ed8] dark:text-blue-400 border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/50"
            title={ar ? 'استدعاء داروين لشرح هذا المعمل' : 'Ask Darwin about this lab'}
          >
            <Sparkles size={13} strokeWidth={1.8} />
            <span>{ar ? 'مرشد داروين AI' : 'Darwin AI Guide'}</span>
          </button>

          <span className="sn-badge sn-badge-green !text-[10px]">
            <span className="sn-live-dot h-1.5 w-1.5 rounded-full bg-[#047857]" />
            WebGL 60FPS
          </span>

          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('lab-stage-container');
              if (el?.requestFullscreen) void el.requestFullscreen().catch(() => {});
            }}
            className="sn-btn sn-btn-outline sn-btn-icon !h-8 !w-8"
            title={ar ? 'ملء الشاشة' : 'Fullscreen'}
          >
            <Maximize2 size={13} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* Seamless Integrated Lab Canvas Container */}
      <div
        id="lab-stage-container"
        className="rounded-[22px] border border-white/10 bg-[#07090e] text-white shadow-2xl relative overflow-hidden min-h-[720px] flex flex-col"
      >
        {/* Subtle sub-header inside canvas */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-2.5 bg-black/40 text-[10px] text-white/50 font-mono">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span>SciNexa Virtual Engine · {lab.id.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Precision: Research Grade</span>
            <span>ISEF 2026</span>
          </div>
        </div>

        {/* Lab Component Stage */}
        <div className="flex-1 p-2 sm:p-4 overflow-y-auto">
          <ErrorBoundary ar={ar} dark title={ar ? 'تعذّر تشغيل محرك 3D' : 'The 3D engine could not start'}>
            <Suspense fallback={<LabLoading ar={ar} />}>
              <Component />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-[#737373] dark:text-white/50">
        <span>
          {ar
            ? 'استخدم الماوس للتدوير، وعجلة الماوس للتكبير والتصغير. تُحفظ تجاربك تلقائيًا.'
            : 'Click & drag to rotate, scroll to zoom. Your progress is saved automatically.'}
        </span>
        <span className="font-mono text-[10px]">SHA-256: b35dcc2b…38123f</span>
      </div>
    </div>
  );
};

export default LabWorkspace;
