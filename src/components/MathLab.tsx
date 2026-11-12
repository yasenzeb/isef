import React, { Suspense, useEffect, useState } from 'react';
import { Activity, Compass, Layers, Orbit, Triangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { mathStrings } from '../i18n/mathTranslations';
import { saveState, loadState } from '../utils/persistence';
import { FunctionTable } from './math/FunctionTable';
import { PythagorasPanel, EuclidPanel } from './math/GeometryLaws';
import { CoordinateGrid } from './math/CoordinateGrid';
import { SlopeLaws } from './math/SlopeLaws';
import { MathCalculator } from './math/MathCalculator';
import { MATH_ACCENT } from './math/mathUi';

type MathTab = 'functions' | 'pyth' | 'euclid' | 'grid' | 'slope';
const TABS: MathTab[] = ['functions', 'pyth', 'euclid', 'grid', 'slope'];

/** old saves used one 'geometry' tab with a sub-choice — map it to the new separate buttons */
const normalizeTab = (saved: string): MathTab => {
  if (saved === 'geometry') return loadState<string>('math_geo_sub', 'pyth') === 'euclid' ? 'euclid' : 'pyth';
  return (TABS as string[]).includes(saved) ? (saved as MathTab) : 'functions';
};

/**
 * MathLab — same structure as ChemistryLab: a header, a tab switcher, one view per tab.
 * Supports every platform language (en · ar · fr · de) through mathStrings.
 */
export const MathLab: React.FC = () => {
  const { language } = useLanguage();
  const s = mathStrings[language];

  const [tab, setTab] = useState<MathTab>(() => {
    return normalizeTab(loadState<string>('math_tab', 'functions'));
  });
  useEffect(() => { saveState('math_tab', tab); }, [tab]);

  // remote tab switch, same convention as the chemistry lab
  useEffect(() => {
    const handler = (e: Event): void => {
      const next = (e as CustomEvent<{ tab?: string }>).detail?.tab;
      if (next) setTab(normalizeTab(next));
    };
    window.addEventListener('scinexa:switch_math_tab', handler);
    return () => window.removeEventListener('scinexa:switch_math_tab', handler);
  }, []);

  const tabMeta: Record<MathTab, { label: string; icon: React.ReactNode }> = {
    functions: { label: s.tabFunctions, icon: <Activity className="h-3.5 w-3.5 shrink-0" /> },
    pyth: { label: s.geoPyth, icon: <Triangle className="h-3.5 w-3.5 shrink-0" /> },
    euclid: { label: s.geoEuclid, icon: <Compass className="h-3.5 w-3.5 shrink-0" /> },
    grid: { label: s.tabGrid, icon: <Layers className="h-3.5 w-3.5 shrink-0" /> },
    slope: { label: s.tabSlope, icon: <Orbit className="h-3.5 w-3.5 shrink-0" /> },
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 pb-24 sm:px-6 sm:pb-16 lg:px-8">
      {/* Header (scrolls away) */}
      <div className="pb-1">
        <span className="sci-badge">{s.badge}</span>
        <h1 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>{s.title}</h1>
        <p className="mt-0.5 text-xs text-slate-400">{s.subtitle}</p>
      </div>

      {/* Fixed navigation bar: stays on top while scrolling, calculator always one tap away */}
      <div
        className="sticky top-0 z-30 -mx-2 rounded-xl px-2 py-2 backdrop-blur"
        style={{ background: 'rgba(6,8,12,0.92)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center gap-2">
          {/* calculator lives outside the scrolling strip so its panel is never clipped */}
          <MathCalculator />
          <div role="tablist" className="sci-surface flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto p-1.5 scrollbar-none">
            {TABS.map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${tab === id ? 'text-white shadow' : 'text-slate-400 hover:text-white'}`}
                style={tab === id ? { background: MATH_ACCENT } : undefined}
              >
                {tabMeta[id].icon}
                <span className="whitespace-nowrap">{tabMeta[id].label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Suspense fallback={null}>
        {tab === 'functions' && <FunctionTable />}
        {tab === 'pyth' && <PythagorasPanel />}
        {tab === 'euclid' && <EuclidPanel />}
        {tab === 'grid' && <CoordinateGrid />}
        {tab === 'slope' && <SlopeLaws />}
      </Suspense>
    </div>
  );
};

export default MathLab;
