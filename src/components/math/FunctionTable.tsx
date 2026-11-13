import React, { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { mathStrings, tpl } from '../../i18n/mathTranslations';
import { saveState, loadState } from '../../utils/persistence';
import { buildTable, compileExpression, fmt, parseNum, type MathFn, type TableRow } from '../../utils/mathEngine';
import { NumField, Note, Panel, Pill } from './mathUi';

interface FxState { expr: string; from: string; to: string; step: string; deg: boolean }
const DEFAULTS: FxState = { expr: 'x^2 - 4x + 3', from: '-3', to: '5', step: '1', deg: false };

const PRESETS = ['x^2', '2x + 1', 'x^2 - 4x + 3', 'x^3 - 3x', 'sqrt(x)', '1/x', 'abs(x)', 'sin(x)'];

/* ───────────── graph ───────────── */

const GW = 560, GH = 320, PAD = 34;

const FunctionGraph: React.FC<{ fn: MathFn; deg: boolean; lo: number; hi: number; rows: TableRow[] }> = ({ fn, deg, lo, hi, rows }) => {
  const g = useMemo(() => {
    if (!(hi > lo)) return null;
    const N = 320;
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= N; i++) {
      const x = lo + ((hi - lo) * i) / N;
      pts.push({ x, y: fn(x, deg) });
    }
    const fin = pts.map((p) => p.y).filter(Number.isFinite).sort((a, b) => a - b);
    if (fin.length < 2) return null;
    // robust range: ignore the most extreme 2 % (asymptotes)
    let yMin = fin[Math.floor(fin.length * 0.02)];
    let yMax = fin[Math.ceil(fin.length * 0.98) - 1];
    if (yMax - yMin < 1e-9) { yMin -= 1; yMax += 1; }
    const padY = (yMax - yMin) * 0.12;
    yMin -= padY; yMax += padY;
    return { pts, yMin, yMax };
  }, [fn, deg, lo, hi]);

  if (!g) return null;
  const { pts, yMin, yMax } = g;
  const sx = (x: number): number => PAD + ((x - lo) / (hi - lo)) * (GW - 2 * PAD);
  const sy = (y: number): number => GH - PAD - ((y - yMin) / (yMax - yMin)) * (GH - 2 * PAD);
  const span = yMax - yMin;

  // path with breaks at undefined points and at asymptote-like jumps
  let d = '';
  let pen = false;
  for (let i = 0; i < pts.length; i++) {
    const { x, y } = pts[i];
    if (!Number.isFinite(y)) { pen = false; continue; }
    const prev = pts[i - 1];
    const jump = prev && Number.isFinite(prev.y) && Math.abs(y - prev.y) > span * 1.5;
    const clamped = Math.max(yMin - span * 3, Math.min(yMax + span * 3, y));
    d += `${pen && !jump ? 'L' : 'M'}${sx(x).toFixed(1)} ${sy(clamped).toFixed(1)} `;
    pen = true;
  }

  const xAxisY = yMin <= 0 && yMax >= 0 ? sy(0) : null;
  const yAxisX = lo <= 0 && hi >= 0 ? sx(0) : null;

  return (
    <svg style={{ direction: 'ltr' }} viewBox={`0 0 ${GW} ${GH}`} className="h-auto w-full rounded-xl bg-black/30" role="img" aria-label="graph">
      <defs>
        <clipPath id="fx-clip"><rect x={PAD} y={PAD - 8} width={GW - 2 * PAD} height={GH - 2 * PAD + 16} /></clipPath>
      </defs>
      <rect x={PAD} y={PAD} width={GW - 2 * PAD} height={GH - 2 * PAD} fill="none" stroke="rgba(255,255,255,0.08)" />
      {xAxisY !== null && <line x1={PAD} x2={GW - PAD} y1={xAxisY} y2={xAxisY} stroke="rgba(255,255,255,0.35)" />}
      {yAxisX !== null && <line x1={yAxisX} x2={yAxisX} y1={PAD} y2={GH - PAD} stroke="rgba(255,255,255,0.35)" />}
      {[lo, (lo + hi) / 2, hi].map((x, i) => (
        <text key={`x${i}`} x={sx(x)} y={GH - PAD + 16} textAnchor={i === 0 ? 'start' : i === 2 ? 'end' : 'middle'} fontSize="11" fill="#94a3b8" fontFamily="var(--font-mono)">{fmt(x, 3)}</text>
      ))}
      {[yMin + span * 0.12 / 1.24, (yMin + yMax) / 2, yMax - span * 0.12 / 1.24].map((y, i) => (
        <text key={`y${i}`} x={PAD - 6} y={sy(y) + 4} textAnchor="end" fontSize="11" fill="#94a3b8" fontFamily="var(--font-mono)">{fmt(y, 2)}</text>
      ))}
      <g clipPath="url(#fx-clip)">
        <path d={d} fill="none" stroke="#22d3ee" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
        {rows.length <= 60 && rows.filter((r) => Number.isFinite(r.y)).map((r, i) => (
          <circle key={i} cx={sx(r.x)} cy={sy(r.y)} r="3.6" fill="#a78bfa" stroke="#0e1116" strokeWidth="1.2" />
        ))}
      </g>
    </svg>
  );
};

/* ───────────── main ───────────── */

export const FunctionTable: React.FC = () => {
  const { language } = useLanguage();
  const s = mathStrings[language];
  const [st, setSt] = useState<FxState>(() => ({ ...DEFAULTS, ...loadState<Partial<FxState>>('math_fx', {}) }));
  useEffect(() => { saveState('math_fx', st); }, [st]);
  const set = (patch: Partial<FxState>): void => setSt((p) => ({ ...p, ...patch }));

  const compiled = useMemo(() => compileExpression(st.expr), [st.expr]);
  const from = parseNum(st.from), to = parseNum(st.to), step = parseNum(st.step);

  const table = useMemo(() => {
    if (!compiled.ok) return null;
    return buildTable(compiled.fn, from, to, step, st.deg);
  }, [compiled, from, to, step, st.deg]);

  let error: string | null = null;
  if (!compiled.ok) error = compiled.error === 'empty' ? s.fxErrEmpty : s.fxErrInvalid;
  else if (table && 'error' in table) error = table.error === 'step' ? s.fxErrStep : s.fxErrRange;

  const rows = table && 'rows' in table ? table.rows : [];
  const truncated = !!(table && 'rows' in table && table.truncated);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="space-y-5">
        <Panel title={s.fxTitle}>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-slate-400">{s.fxExprLabel}</span>
            <div dir="ltr" className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 focus-within:border-cyan-400">
              <span className="font-mono text-sm text-violet-300">f(x) =</span>
              <input
                value={st.expr}
                onChange={(e) => set({ expr: e.target.value })}
                spellCheck={false}
                autoComplete="off"
                placeholder="x^2 - 4x + 3"
                className="min-w-0 flex-1 bg-transparent font-mono text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </label>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{s.fxSyntax}</p>

          <div className="mt-3">
            <div className="mb-1.5 text-[11px] font-semibold text-slate-400">{s.fxPresets}</div>
            <div dir="ltr" className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <Pill key={p} active={st.expr === p} onClick={() => set({ expr: p })}>{p}</Pill>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <NumField label={s.fxFrom} value={st.from} onChange={(v) => set({ from: v })} />
            <NumField label={s.fxTo} value={st.to} onChange={(v) => set({ to: v })} />
            <NumField label={s.fxStep} value={st.step} onChange={(v) => set({ step: v })} />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400">{s.fxAngle}</span>
            <Pill active={!st.deg} onClick={() => set({ deg: false })}>{s.fxRad}</Pill>
            <Pill active={st.deg} onClick={() => set({ deg: true })}>{s.fxDeg}</Pill>
          </div>
        </Panel>

        {error ? <Note tone={compiled.ok || (!compiled.ok && compiled.error !== 'empty') ? 'error' : 'info'}>{error}</Note> : null}

        {!error && compiled.ok && (
          <Panel title={s.fxGraph}>
            <FunctionGraph fn={compiled.fn} deg={st.deg} lo={Math.min(from, to)} hi={Math.max(from, to)} rows={rows} />
          </Panel>
        )}
      </div>

      <Panel
        title={<span dir="ltr" className="font-mono">x ↦ f(x)</span>}
        right={rows.length > 0 ? <span className="text-[11px] text-slate-500">{tpl(s.fxRows, rows.length)}</span> : undefined}
      >
        {rows.length > 0 ? (
          <>
            <div className="overflow-x-auto lg:max-h-[520px] lg:overflow-y-auto rounded-lg border border-white/[0.1]" style={{ touchAction: 'pan-x pan-y pinch-zoom' }}>
              <table dir="ltr" className="w-full border-collapse text-sm">
                <thead className="sticky top-0 bg-[#141922]">
                  <tr>
                    <th className="border-b border-white/10 px-4 py-2 text-left font-mono text-xs font-semibold text-violet-300">x</th>
                    <th className="border-b border-white/10 px-4 py-2 text-left font-mono text-xs font-semibold text-cyan-300">f(x)</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className={i % 2 ? 'bg-white/[0.025]' : ''}>
                      <td className="px-4 py-1.5 font-mono text-slate-200">{fmt(r.x)}</td>
                      <td className="px-4 py-1.5 font-mono">
                        {Number.isFinite(r.y) ? <span className="text-white">{fmt(r.y)}</span> : <span className="text-xs italic text-slate-500">{s.fxUndefined}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {truncated && <div className="mt-3"><Note tone="warn">{s.fxTruncated}</Note></div>}
          </>
        ) : (
          <div className="py-10 text-center text-xs text-slate-500">—</div>
        )}
      </Panel>
    </div>
  );
};

export default FunctionTable;
