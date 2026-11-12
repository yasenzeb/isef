import React, { useEffect, useMemo, useRef, useState } from 'react';
import { RotateCcw, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { mathStrings, tpl } from '../../i18n/mathTranslations';
import { saveState, loadState } from '../../utils/persistence';
import { analyzePolygon, fmt, parseNum, type Pt } from '../../utils/mathEngine';
import { MATH_ACCENT, NumField, Note, Panel, Pill } from './mathUi';

const LABELS = 'ABCDEFGHIJKL';
const MAX_POINTS = LABELS.length;
const MAX_SHAPES = 4;
const RANGES = [5, 10, 15, 20];
const S = 600; // svg size (user units)
/** A, A′, A″, A‴ — the image of a point is written with a prime */
const PRIMES = ['', '′', '″', '‴'];

const SWATCHES = ['#f97316', '#ef4444', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];
const DEFAULT_COLORS = ['#f97316', '#3b82f6', '#22c55e', '#8b5cf6'];
/** where preset shapes land when several shapes are in play, so they never sit on top of each other */
const OFFSETS: [number, number][] = [[-5, 3], [5, -3], [-5, -6], [5, 6]];

interface Shape { pts: Pt[]; done: boolean }
interface GridState {
  shapes: Shape[];
  count: number; // how many shapes the student wants to draw
  sel: number; // which shape the colour picker edits
  colors: string[];
  opacity: number;
  range: number;
  snap: boolean;
  lengths: boolean;
}

const DEFAULT_STATE: GridState = {
  shapes: [{ pts: [{ x: -3, y: -2 }, { x: 3, y: -2 }, { x: 3, y: 2 }, { x: -3, y: 2 }], done: false }],
  count: 1, sel: 0, colors: DEFAULT_COLORS, opacity: 0.45, range: 10, snap: true, lengths: true,
};

const QUICK: { key: 'qTriangle' | 'qSquare' | 'qRectangle' | 'qParallelogram' | 'qTrapezoid'; pts: [number, number][] }[] = [
  { key: 'qTriangle', pts: [[-3, -2], [3, -2], [0, 3]] },
  { key: 'qSquare', pts: [[-2, -2], [2, -2], [2, 2], [-2, 2]] },
  { key: 'qRectangle', pts: [[-4, -2], [4, -2], [4, 2], [-4, 2]] },
  { key: 'qParallelogram', pts: [[-4, -2], [2, -2], [4, 2], [-2, 2]] },
  { key: 'qTrapezoid', pts: [[-4, -2], [4, -2], [2, 2], [-2, 2]] },
];

const clamp = (n: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, n));
const round2 = (n: number): number => Math.round(n * 100) / 100;
const cleanPts = (v: unknown): Pt[] =>
  Array.isArray(v)
    ? (v as Pt[]).filter((p) => p && Number.isFinite(p.x) && Number.isFinite(p.y)).slice(0, MAX_POINTS).map((p) => ({ x: p.x, y: p.y }))
    : [];

type Saved = Partial<GridState> & { pts?: unknown; color?: string };

function loadGrid(): GridState {
  const saved = loadState<Saved>('math_grid', {});
  let shapes: Shape[];
  if (Array.isArray(saved.shapes)) {
    shapes = saved.shapes.slice(0, MAX_SHAPES).map((sh) => ({ pts: cleanPts(sh?.pts), done: !!sh?.done })).filter((sh) => sh.pts.length > 0);
  } else if (Array.isArray(saved.pts)) {
    shapes = [{ pts: cleanPts(saved.pts), done: false }]; // older save: a single shape
  } else {
    shapes = DEFAULT_STATE.shapes;
  }
  const colors = DEFAULT_COLORS.map((c, i) => (Array.isArray(saved.colors) && typeof saved.colors[i] === 'string' ? saved.colors[i] : i === 0 && saved.color ? saved.color : c));
  const count = clamp(Math.round(Number(saved.count) || 1), Math.max(1, shapes.length), MAX_SHAPES);
  return {
    shapes, count, colors,
    sel: clamp(Math.round(Number(saved.sel) || 0), 0, count - 1),
    opacity: clamp(Number(saved.opacity) || DEFAULT_STATE.opacity, 0.05, 1),
    range: RANGES.includes(Number(saved.range)) ? Number(saved.range) : DEFAULT_STATE.range,
    snap: saved.snap ?? true,
    lengths: saved.lengths ?? true,
  };
}

/** number box that keeps its own text while typing and commits valid numbers */
const CoordInput: React.FC<{ value: number; onCommit: (n: number) => void; ariaLabel: string }> = ({ value, onCommit, ariaLabel }) => {
  const [txt, setTxt] = useState(String(value));
  useEffect(() => { if (parseNum(txt) !== value) setTxt(String(value)); }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <input
      dir="ltr" inputMode="decimal" aria-label={ariaLabel} value={txt} autoComplete="off"
      onChange={(e) => { setTxt(e.target.value); const n = parseNum(e.target.value); if (Number.isFinite(n)) onCommit(n); }}
      onBlur={() => setTxt(String(value))}
      className="w-20 rounded-md border border-white/10 bg-black/30 px-2 py-1 text-center font-mono text-xs text-white outline-none focus:border-cyan-400"
    />
  );
};

export const CoordinateGrid: React.FC = () => {
  const { language } = useLanguage();
  const s = mathStrings[language];

  const [st, setSt] = useState<GridState>(loadGrid);
  useEffect(() => { saveState('math_grid', st); }, [st]);

  const [hist, setHist] = useState<Shape[][]>([]);
  const [drag, setDrag] = useState<{ s: number; i: number } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [cx, setCx] = useState('');
  const [cy, setCy] = useState('');
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!notice) return undefined;
    const t = window.setTimeout(() => setNotice(null), 2800);
    return () => window.clearTimeout(t);
  }, [notice]);

  const { shapes, count, colors } = st;
  const R = st.range;
  const scale = S / (2 * R);
  const sel = clamp(st.sel, 0, count - 1);
  const multi = count > 1 || shapes.length > 1;

  // the shape being drawn: the last one, as long as the student has not marked it complete
  const activeIdx = shapes.length > 0 && !shapes[shapes.length - 1].done ? shapes.length - 1 : -1;
  const canStartNew = activeIdx === -1 && shapes.length < count;
  const nextIdx = activeIdx >= 0 ? activeIdx : canStartNew ? shapes.length : -1; // where the next click goes
  const canComplete = activeIdx >= 0 && shapes[activeIdx].pts.length >= 3 && shapes.length < count;

  const maxAbs = Math.max(0, ...shapes.flatMap((sh) => sh.pts.map((p) => Math.max(Math.abs(p.x), Math.abs(p.y)))));
  const infos = useMemo(() => shapes.map((sh) => analyzePolygon(sh.pts)), [shapes]);

  const px = (x: number): number => S / 2 + x * scale;
  const py = (y: number): number => S / 2 - y * scale;
  const label = (k: number, i: number): string => `${LABELS[i] ?? String(i + 1)}${PRIMES[k] ?? ''}`;
  const nameOf = (k: number): string => (k === 0 ? s.gridOriginal : k === 1 ? s.gridImage : tpl(s.gridShapeN, k + 1));

  const commit = (next: Shape[], record = true): void => {
    if (record) setHist((h) => [...h.slice(-30), shapes]);
    setSt((p) => ({ ...p, shapes: next }));
  };

  const snapV = (n: number): number => (st.snap ? Math.round(n) : round2(n));

  const toMath = (e: { clientX: number; clientY: number }): Pt | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const r = svg.getBoundingClientRect();
    if (r.width === 0) return null;
    const ux = ((e.clientX - r.left) / r.width) * S;
    const uy = ((e.clientY - r.top) / r.height) * S;
    return { x: clamp(snapV((ux - S / 2) / scale), -R, R), y: clamp(snapV((S / 2 - uy) / scale), -R, R) };
  };

  const addPoint = (p: Pt): void => {
    if (nextIdx === -1) { setNotice(s.gridAllDone); return; }
    if (nextIdx === shapes.length) {
      // first point of a brand-new shape — it never joins the previous one
      commit([...shapes, { pts: [p], done: false }]);
      setSt((q) => ({ ...q, sel: nextIdx }));
      return;
    }
    const cur = shapes[nextIdx];
    if (cur.pts.length >= MAX_POINTS) { setNotice(s.gridMax); return; }
    if (cur.pts.some((q) => Math.abs(q.x - p.x) < 1e-9 && Math.abs(q.y - p.y) < 1e-9)) { setNotice(s.gridDuplicate); return; }
    commit(shapes.map((sh, k) => (k === nextIdx ? { ...sh, pts: [...sh.pts, p] } : sh)));
  };

  const onBackgroundClick = (e: React.MouseEvent): void => {
    const p = toMath(e);
    if (p) addPoint(p);
  };

  const onPointerMove = (e: React.PointerEvent): void => {
    if (!drag) return;
    const p = toMath(e);
    if (!p) return;
    setSt((prev) => ({
      ...prev,
      shapes: prev.shapes.map((sh, k) => (k === drag.s ? { ...sh, pts: sh.pts.map((q, i) => (i === drag.i ? p : q)) } : sh)),
    }));
  };

  const endDrag = (): void => setDrag(null);

  const undo = (): void => {
    if (hist.length === 0) return;
    const last = hist[hist.length - 1];
    setHist(hist.slice(0, -1));
    setSt((p) => ({ ...p, shapes: last, count: Math.max(p.count, last.length) }));
  };

  const markComplete = (): void => {
    if (!canComplete) return;
    commit(shapes.map((sh, k) => (k === activeIdx ? { ...sh, done: true } : sh)));
  };

  const setCount = (c: number): void => setSt((p) => ({ ...p, count: c, sel: Math.min(p.sel, c - 1) }));

  const applyQuick = (pts: [number, number][]): void => {
    const target = shapes.length < count ? shapes.length : shapes.length - 1;
    const off = count > 1 ? OFFSETS[Math.min(target, OFFSETS.length - 1)] : [0, 0];
    const made: Shape = {
      pts: pts.map(([x, y]) => ({ x: clamp(x + off[0], -R, R), y: clamp(y + off[1], -R, R) })),
      done: count > 1, // a preset is a finished shape; in single-shape mode it stays editable
    };
    if (shapes.length < count) {
      // starting another shape finishes the one before it
      commit([...shapes.map((sh) => ({ ...sh, done: true })), made]);
      setSt((q) => ({ ...q, sel: target }));
    } else {
      commit(shapes.map((sh, k) => (k === target ? made : sh)));
    }
  };

  const addByCoords = (): void => {
    const x = parseNum(cx), y = parseNum(cy);
    if (!Number.isFinite(x) || !Number.isFinite(y)) { setNotice(s.slopeInvalid); return; }
    addPoint({ x: clamp(x, -R, R), y: clamp(y, -R, R) });
    setCx(''); setCy('');
  };

  const movePoint = (k: number, i: number, patch: Partial<Pt>): void =>
    commit(shapes.map((sh, a) => (a === k ? { ...sh, pts: sh.pts.map((q, b) => (b === i ? { ...q, ...patch } : q)) } : sh)), false);

  const deletePoint = (k: number, i: number): void => {
    const next = shapes
      .map((sh, a) => (a === k ? { ...sh, pts: sh.pts.filter((_, b) => b !== i) } : sh))
      .filter((sh) => sh.pts.length > 0);
    commit(next);
  };

  /* ── grid drawing ── */
  const lines: React.ReactNode[] = [];
  const ticks: React.ReactNode[] = [];
  const tickStep = R <= 10 ? 1 : 5;
  for (let i = -R; i <= R; i++) {
    const major = i % 5 === 0;
    const stroke = i === 0 ? 'rgba(255,255,255,0.7)' : major ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.07)';
    const w = i === 0 ? 1.8 : 1;
    lines.push(<line key={`v${i}`} x1={px(i)} x2={px(i)} y1={0} y2={S} stroke={stroke} strokeWidth={w} />);
    lines.push(<line key={`h${i}`} x1={0} x2={S} y1={py(i)} y2={py(i)} stroke={stroke} strokeWidth={w} />);
    if (i !== 0 && i % tickStep === 0) {
      ticks.push(<text key={`tx${i}`} x={px(i)} y={S / 2 + 14} textAnchor="middle" fontSize="10.5" fill="#94a3b8" fontFamily="var(--font-mono)">{i}</text>);
      ticks.push(<text key={`ty${i}`} x={S / 2 - 6} y={py(i) + 3.5} textAnchor="end" fontSize="10.5" fill="#94a3b8" fontFamily="var(--font-mono)">{i}</text>);
    }
  }

  const totalPoints = shapes.reduce((a, sh) => a + sh.pts.length, 0);
  const activeColor = colors[sel] ?? DEFAULT_COLORS[0];

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      {/* ───────── canvas ───────── */}
      <Panel
        title={s.gridTitle}
        right={
          <div className="flex gap-1.5">
            <button type="button" onClick={undo} disabled={hist.length === 0}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-300 transition hover:bg-white/10 disabled:opacity-40">
              <RotateCcw className="h-3 w-3" />{s.gridUndo}
            </button>
            <button type="button" onClick={() => { if (totalPoints > 0) commit([]); }} disabled={totalPoints === 0}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-300 transition hover:bg-white/10 disabled:opacity-40">
              {s.gridClear}
            </button>
          </div>
        }
      >
        <p className="mb-3 text-xs text-slate-400">{s.gridHint}</p>

        {/* how many shapes + "shape complete" */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-300">{s.gridShapes}</span>
          {Array.from({ length: MAX_SHAPES }, (_, i) => i + 1).filter((c) => c >= shapes.length).map((c) => (
            <Pill key={c} active={count === c} onClick={() => setCount(c)}>{c}</Pill>
          ))}
          {multi && nextIdx >= 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-slate-300">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: colors[nextIdx] }} />
              {nameOf(nextIdx)}
            </span>
          )}
          {canComplete && (
            <button type="button" onClick={markComplete}
              className="ms-auto rounded-full px-4 py-1.5 text-xs font-bold text-white transition hover:opacity-90" style={{ background: MATH_ACCENT }}>
              ✓ {s.gridComplete}
            </button>
          )}
        </div>

        <svg
          ref={svgRef} style={{ direction: 'ltr' }} viewBox={`0 0 ${S} ${S}`}
          className="mx-auto block h-auto w-full max-w-[640px] select-none rounded-xl bg-[#0a0d12]"
          onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag} onPointerLeave={endDrag}
          role="application" aria-label={s.gridTitle}
        >
          <rect x={0} y={0} width={S} height={S} fill="transparent" style={{ cursor: 'crosshair' }} onClick={onBackgroundClick} />
          <g pointerEvents="none">
            {lines}
            {ticks}
            <text x={S / 2 - 6} y={S / 2 + 14} textAnchor="end" fontSize="10.5" fill="#94a3b8" fontFamily="var(--font-mono)">0</text>
            <path d={`M${S - 2} ${S / 2} l-9 -4.5 v9 z`} fill="rgba(255,255,255,0.7)" />
            <path d={`M${S / 2} 2 l-4.5 9 h9 z`} fill="rgba(255,255,255,0.7)" />
            <text x={S - 14} y={S / 2 - 10} textAnchor="end" fontSize="13" fill="#e2e8f0" fontStyle="italic" fontFamily="var(--font-mono)">x</text>
            <text x={S / 2 + 12} y={16} fontSize="13" fill="#e2e8f0" fontStyle="italic" fontFamily="var(--font-mono)">y</text>

            {shapes.map((sh, k) => {
              const c = colors[k];
              const P = sh.pts.map((p) => `${px(p.x)},${py(p.y)}`).join(' ');
              const cxm = sh.pts.reduce((a, p) => a + p.x, 0) / sh.pts.length;
              const cym = sh.pts.reduce((a, p) => a + p.y, 0) / sh.pts.length;
              return (
                <g key={`sh${k}`}>
                  {sh.pts.length >= 3 && <polygon points={P} fill={c} fillOpacity={st.opacity} fillRule="evenodd" stroke={c} strokeWidth={2.6} strokeLinejoin="round" />}
                  {sh.pts.length === 2 && <line x1={px(sh.pts[0].x)} y1={py(sh.pts[0].y)} x2={px(sh.pts[1].x)} y2={py(sh.pts[1].y)} stroke={c} strokeWidth={2.8} strokeLinecap="round" />}
                  {multi && sh.pts.length >= 3 && (
                    <text x={px(cxm)} y={py(cym) + 4} textAnchor="middle" fontSize="14" fontWeight={700} fill="#fff" stroke="#0a0d12" strokeWidth={4} paintOrder="stroke" strokeLinejoin="round">
                      {nameOf(k)}
                    </text>
                  )}
                  {st.lengths && infos[k]?.sides.map((sd, i) => {
                    const a = sh.pts[sd.from], b = sh.pts[sd.to];
                    return (
                      <text key={`len${k}-${i}`} x={px((a.x + b.x) / 2)} y={py((a.y + b.y) / 2) - 6} textAnchor="middle" fontSize="11.5" fill="#f1f5f9"
                        fontFamily="var(--font-mono)" fontWeight={600} stroke="#0a0d12" strokeWidth={3.5} paintOrder="stroke" strokeLinejoin="round">
                        {fmt(sd.length, 2)}
                      </text>
                    );
                  })}
                </g>
              );
            })}
          </g>

          {shapes.map((sh, k) => sh.pts.map((p, i) => (
            <g key={`pt${k}-${i}`}>
              <circle
                cx={px(p.x)} cy={py(p.y)} r={16} fill="transparent"
                style={{ cursor: drag && drag.s === k && drag.i === i ? 'grabbing' : 'grab', touchAction: 'none' }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  (e.currentTarget as SVGCircleElement).setPointerCapture(e.pointerId);
                  setHist((h) => [...h.slice(-30), shapes]);
                  setDrag({ s: k, i });
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <circle cx={px(p.x)} cy={py(p.y)} r={6.2} fill="#fff" stroke={colors[k]} strokeWidth={3} pointerEvents="none" />
              <text x={px(p.x) + 10} y={py(p.y) - 10} fontSize="13" fontWeight={700} fill="#fff" fontFamily="var(--font-mono)"
                stroke="#0a0d12" strokeWidth={3.5} paintOrder="stroke" strokeLinejoin="round" pointerEvents="none">
                {label(k, i)}({fmt(p.x, 2)}, {fmt(p.y, 2)})
              </text>
            </g>
          )))}
        </svg>
        {notice && <div className="mt-3"><Note tone="warn">{notice}</Note></div>}
      </Panel>

      {/* ───────── controls + results ───────── */}
      <div className="space-y-5">
        <Panel title={s.gridShape}>
          {shapes.length === 0 && <Note>{s.gridNeedMore}</Note>}
          <div className="space-y-5">
            {shapes.map((sh, k) => {
              const info = infos[k];
              const n = sh.pts.length;
              return (
                <div key={k} className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {multi && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-200">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: colors[k] }} />
                        {nameOf(k)}
                      </span>
                    )}
                    <span className="rounded-full px-3 py-1 text-sm font-bold text-white" style={{ background: MATH_ACCENT }}>{s.shapes[info.kind]}</span>
                    {n >= 5 && info.kind !== 'degenerate' && <span className="text-xs text-slate-400">{tpl(s.gridSideCount, n)}</span>}
                    {n >= 4 && info.simple && info.kind !== 'degenerate' && (
                      <span className="text-xs text-slate-400">· {info.convex ? s.gridConvex : s.gridConcave}</span>
                    )}
                  </div>
                  {n < 3 && <Note>{s.gridNeedMore}</Note>}
                  {!info.simple && n >= 4 && <Note tone="warn">{s.gridNotSimple}</Note>}

                  {n === 2 && info.midpoint && (
                    <div dir="ltr" className="grid grid-cols-2 gap-2 font-mono text-xs text-slate-300">
                      <div>{s.gridLength}: <b className="text-white">{fmt(info.sides[0].length, 4)}</b></div>
                      <div>{s.gridMidpoint}: <b className="text-white">({fmt(info.midpoint.x, 3)}, {fmt(info.midpoint.y, 3)})</b></div>
                    </div>
                  )}
                  {n >= 3 && (
                    <div dir="ltr" className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-white/[0.07] bg-black/25 px-3 py-2">
                        <div className="text-[11px] text-slate-400">{s.gridArea}</div>
                        <div className="font-mono text-lg font-bold text-white">{info.kind === 'degenerate' ? '0' : fmt(info.area, 4)}</div>
                      </div>
                      <div className="rounded-lg border border-white/[0.07] bg-black/25 px-3 py-2">
                        <div className="text-[11px] text-slate-400">{s.gridPerimeter}</div>
                        <div className="font-mono text-lg font-bold text-white">{fmt(info.perimeter, 4)}</div>
                      </div>
                    </div>
                  )}
                  {info.sides.length > 0 && (
                    <div className="overflow-x-auto rounded-lg border border-white/[0.07]">
                      <table dir="ltr" className="w-full border-collapse text-xs">
                        <thead className="bg-white/[0.04] text-slate-400">
                          <tr>
                            <th className="px-3 py-1.5 text-left font-semibold">{s.gridSides}</th>
                            <th className="px-3 py-1.5 text-left font-semibold">{s.gridLength}</th>
                            <th className="px-3 py-1.5 text-left font-semibold">{s.gridSlope}</th>
                          </tr>
                        </thead>
                        <tbody className="font-mono text-slate-200">
                          {info.sides.map((sd, i) => (
                            <tr key={i} className={i % 2 ? 'bg-white/[0.025]' : ''}>
                              <td className="px-3 py-1">{label(k, sd.from)}{label(k, sd.to)}</td>
                              <td className="px-3 py-1">{fmt(sd.length, 4)}</td>
                              <td className="px-3 py-1">{sd.slope === 'vertical' ? s.gridVertical : fmt(sd.slope, 4)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {k < shapes.length - 1 && <div className="border-t border-white/[0.07]" />}
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel>
          {count > 1 && (
            <div className="mb-3 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-300">{s.gridFillFor}</span>
              {Array.from({ length: count }, (_, k) => (
                <Pill key={k} active={sel === k} onClick={() => setSt((p) => ({ ...p, sel: k }))}>
                  <span className="me-1.5 inline-block h-2 w-2 rounded-full align-middle" style={{ background: colors[k] }} />
                  {nameOf(k)}
                </Pill>
              ))}
            </div>
          )}
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              {s.gridFill}
              <input type="color" value={activeColor} onChange={(e) => setSt((p) => ({ ...p, colors: p.colors.map((c, k) => (k === sel ? e.target.value : c)) }))}
                className="h-8 w-10 cursor-pointer rounded border border-white/10 bg-transparent p-0.5" aria-label={s.gridFill} />
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SWATCHES.map((c) => (
                <button key={c} type="button" aria-label={c} onClick={() => setSt((p) => ({ ...p, colors: p.colors.map((x, k) => (k === sel ? c : x)) }))}
                  className={`h-6 w-6 rounded-full border-2 transition ${activeColor.toLowerCase() === c ? 'scale-110 border-white' : 'border-transparent hover:scale-105'}`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>
          <label className="mb-3 flex items-center gap-3 text-xs font-semibold text-slate-300">
            <span className="w-20 shrink-0">{s.gridOpacity}</span>
            <input type="range" min={0.05} max={1} step={0.05} value={st.opacity}
              onChange={(e) => setSt((p) => ({ ...p, opacity: Number(e.target.value) }))} className="w-full accent-violet-400" />
            <span dir="ltr" className="w-10 text-end font-mono text-slate-400">{Math.round(st.opacity * 100)}%</span>
          </label>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">{s.gridRange}</span>
            {RANGES.filter((r) => r >= maxAbs || r === R).map((r) => (
              <Pill key={r} active={R === r} onClick={() => setSt((p) => ({ ...p, range: r }))}>±{r}</Pill>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-300">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={st.snap} onChange={(e) => setSt((p) => ({ ...p, snap: e.target.checked }))} className="accent-violet-400" />
              {s.gridSnap}
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={st.lengths} onChange={(e) => setSt((p) => ({ ...p, lengths: e.target.checked }))} className="accent-violet-400" />
              {s.gridLengths}
            </label>
          </div>
        </Panel>

        <Panel title={s.gridQuick}>
          <div className="flex flex-wrap gap-1.5">
            {QUICK.map((q) => (
              <Pill key={q.key} onClick={() => applyQuick(q.pts)}>{s[q.key]}</Pill>
            ))}
          </div>
          <div className="mt-4 text-[11px] font-semibold text-slate-400">{s.gridAddByCoords}</div>
          <div className="mt-1.5 flex items-end gap-2">
            <NumField label="x" value={cx} onChange={setCx} className="w-24" />
            <NumField label="y" value={cy} onChange={setCy} className="w-24" />
            <button type="button" onClick={addByCoords}
              className="rounded-lg px-4 py-2 text-xs font-bold text-white transition hover:opacity-90" style={{ background: MATH_ACCENT }}>
              {s.gridAdd}
            </button>
          </div>
        </Panel>

        {totalPoints > 0 && (
          <Panel title={s.gridPoints}>
            <div className="space-y-4">
              {shapes.map((sh, k) => (
                <div key={k}>
                  {multi && (
                    <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
                      <span className="h-2 w-2 rounded-full" style={{ background: colors[k] }} />
                      {nameOf(k)} ({sh.pts.length}/{MAX_POINTS})
                    </div>
                  )}
                  <ul className="space-y-1.5">
                    {sh.pts.map((p, i) => (
                      <li key={i} dir="ltr" className="flex items-center gap-2">
                        <span className="w-8 text-center font-mono text-sm font-bold" style={{ color: colors[k] }}>{label(k, i)}</span>
                        <span className="font-mono text-xs text-slate-500">x</span>
                        <CoordInput value={p.x} ariaLabel={`${label(k, i)} x`} onCommit={(v) => movePoint(k, i, { x: clamp(v, -R, R) })} />
                        <span className="font-mono text-xs text-slate-500">y</span>
                        <CoordInput value={p.y} ariaLabel={`${label(k, i)} y`} onCommit={(v) => movePoint(k, i, { y: clamp(v, -R, R) })} />
                        <button type="button" aria-label={`${s.gridDelete} ${label(k, i)}`} onClick={() => deletePoint(k, i)}
                          className="ms-auto rounded-md p-1 text-slate-500 transition hover:bg-white/10 hover:text-rose-300">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
};

export default CoordinateGrid;
