import React, { useMemo, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { mathStrings } from '../../i18n/mathTranslations';
import {
  fmt, isRightTriangle, parseNum, solveEuclid, solvePythagoras,
  type EuclidKey, type EuclidSolution, type PythKey,
} from '../../utils/mathEngine';
import { NumField, Note, Panel, Pill } from './mathUi';

type XY = [number, number];
const ptsAttr = (pts: XY[]): string => pts.map(([x, y]) => `${x.toFixed(3)},${(-y).toFixed(3)}`).join(' ');

const HALO = { paintOrder: 'stroke', stroke: '#0e1116', strokeLinejoin: 'round' } as const;

/* ───────────────────────── Pythagoras diagram (squares on the sides) ───────────────────────── */

const PythDiagram: React.FC<{ a: number; b: number; c: number }> = ({ a, b, c }) => {
  const sqA: XY[] = [[0, 0], [a, 0], [a, -a], [0, -a]];
  const sqB: XY[] = [[0, 0], [0, b], [-b, b], [-b, 0]];
  const sqC: XY[] = [[a, 0], [0, b], [b, b + a], [a + b, a]];
  const tri: XY[] = [[0, 0], [a, 0], [0, b]];
  const all = [...sqA, ...sqB, ...sqC];
  const minX = Math.min(...all.map((p) => p[0])), maxX = Math.max(...all.map((p) => p[0]));
  const minY = Math.min(...all.map((p) => p[1])), maxY = Math.max(...all.map((p) => p[1]));
  const w = maxX - minX, h = maxY - minY, size = Math.max(w, h), pad = size * 0.05;
  const fs = size / 19, sw = size / 220, m = size * 0.05;
  const label = (x: number, y: number, t: string, fill: string, key: string) => (
    <text key={key} x={x} y={-y + fs / 3} textAnchor="middle" fontSize={fs} fill={fill} fontFamily="var(--font-mono)" fontWeight={700} strokeWidth={sw * 4} {...HALO}>{t}</text>
  );
  return (
    <svg style={{ direction: 'ltr' }} viewBox={`${minX - pad} ${-maxY - pad} ${w + 2 * pad} ${h + 2 * pad}`} className="mx-auto h-auto max-h-[380px] w-full rounded-xl bg-black/30" role="img" aria-label="Pythagoras">
      <polygon points={ptsAttr(sqA)} fill="#8b5cf6" fillOpacity={0.32} stroke="#a78bfa" strokeWidth={sw} />
      <polygon points={ptsAttr(sqB)} fill="#06b6d4" fillOpacity={0.32} stroke="#22d3ee" strokeWidth={sw} />
      <polygon points={ptsAttr(sqC)} fill="#f97316" fillOpacity={0.32} stroke="#fb923c" strokeWidth={sw} />
      <polygon points={ptsAttr(tri)} fill="#ffffff" fillOpacity={0.14} stroke="#ffffff" strokeWidth={sw * 1.8} strokeLinejoin="round" />
      <polyline points={ptsAttr([[m, 0], [m, m], [0, m]])} fill="none" stroke="#fff" strokeWidth={sw} />
      {label(a / 2, -a / 2, `a² = ${fmt(a * a, 2)}`, '#ddd6fe', 'la')}
      {label(-b / 2, b / 2, `b² = ${fmt(b * b, 2)}`, '#a5f3fc', 'lb')}
      {label((a + b) / 2, (a + b) / 2, `c² = ${fmt(c * c, 2)}`, '#fed7aa', 'lc')}
    </svg>
  );
};

/* ───────────────────────── Euclid diagram ───────────────────────── */

const EuclidDiagram: React.FC<{ sol: EuclidSolution; faded?: boolean }> = ({ sol, faded }) => {
  const { a, h, p, q, b, c } = sol;
  const size = Math.max(a, h);
  const pad = size * 0.2;
  const fs = size / 17, sw = size / 200, k = size * 0.07;
  const A: XY = [p, h], B: XY = [0, 0], C: XY = [a, 0], D: XY = [p, 0];
  const uB: XY = [(B[0] - A[0]) / c, (B[1] - A[1]) / c];
  const uC: XY = [(C[0] - A[0]) / b, (C[1] - A[1]) / b];
  const markA: XY[] = [
    [A[0] + uB[0] * k, A[1] + uB[1] * k],
    [A[0] + (uB[0] + uC[0]) * k, A[1] + (uB[1] + uC[1]) * k],
    [A[0] + uC[0] * k, A[1] + uC[1] * k],
  ];
  const t = (x: number, y: number, txt: string, fill: string, key: string, anchor: 'start' | 'middle' | 'end' = 'middle') => (
    <text key={key} x={x} y={-y + fs / 3} textAnchor={anchor} fontSize={fs} fill={fill} fontFamily="var(--font-mono)" fontWeight={700} strokeWidth={sw * 4} {...HALO}>{txt}</text>
  );
  return (
    <svg
      style={{ direction: 'ltr' }}
      viewBox={`${-pad} ${-h - pad} ${a + 2 * pad} ${h + 2 * pad * 1.4}`}
      className={`mx-auto h-auto max-h-[340px] w-full rounded-xl bg-black/30 ${faded ? 'opacity-60' : ''}`}
      role="img" aria-label="Euclid"
    >
      <polygon points={ptsAttr([A, B, C])} fill="#8b5cf6" fillOpacity={0.2} stroke="#c4b5fd" strokeWidth={sw * 1.6} strokeLinejoin="round" />
      <line x1={A[0]} y1={-A[1]} x2={D[0]} y2={-D[1]} stroke="#22d3ee" strokeWidth={sw * 1.4} strokeDasharray={`${sw * 5} ${sw * 4}`} />
      <polyline points={ptsAttr(markA)} fill="none" stroke="#fff" strokeWidth={sw} />
      <polyline points={ptsAttr([[p - k, 0], [p - k, k], [p, k]])} fill="none" stroke="#22d3ee" strokeWidth={sw} />
      <polyline points={ptsAttr([[p + k, 0], [p + k, k], [p, k]])} fill="none" stroke="#22d3ee" strokeWidth={sw} />
      {t(A[0], A[1] + fs * 1.1, 'A', '#fff', 'A')}
      {t(-fs * 0.9, -fs * 0.5, 'B', '#fff', 'B')}
      {t(a + fs * 0.9, -fs * 0.5, 'C', '#fff', 'C')}
      {t(p, -fs * 1.3, 'D', '#fff', 'D')}
      {t(p / 2 - fs * 0.6, h / 2 + fs * 0.3, `c=${fmt(c, 2)}`, '#ddd6fe', 'c', 'end')}
      {t((p + a) / 2 + fs * 0.6, h / 2 + fs * 0.3, `b=${fmt(b, 2)}`, '#fed7aa', 'b', 'start')}
      {t(p + fs * 0.4, h / 2 - fs * 0.2, `h=${fmt(h, 2)}`, '#a5f3fc', 'h', 'start')}
      {t(p / 2, -fs * 0.5 - fs * 1.5 * 0, `p=${fmt(p, 2)}`, '#ddd6fe', 'p')}
      {t((p + a) / 2, -fs * 0.5 - fs * 1.5 * 0, `q=${fmt(q, 2)}`, '#fed7aa', 'q')}
    </svg>
  );
};

/* ───────────────────────── Pythagoras panel ───────────────────────── */

const TRIPLES: [number, number, number][] = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]];

export const PythagorasPanel: React.FC = () => {
  const { language } = useLanguage();
  const s = mathStrings[language];
  const [unknown, setUnknown] = useState<PythKey>('c');
  const [v, setV] = useState<Record<PythKey, string>>({ a: '3', b: '4', c: '' });
  const [chk, setChk] = useState<[string, string, string]>(['6', '8', '10']);

  const known = (['a', 'b', 'c'] as PythKey[]).filter((k) => k !== unknown);
  const nums: Partial<Record<PythKey, number>> = {};
  known.forEach((k) => { const n = parseNum(v[k]); if (Number.isFinite(n)) nums[k] = n; });
  const res = known.every((k) => v[k].trim() === '') ? null : solvePythagoras(nums);

  const errMsg = res && 'error' in res
    ? res.error === 'needTwo' ? s.pythErrNeedTwo : res.error === 'positive' ? s.pythErrPositive : s.pythErrHyp
    : null;

  let steps: string[] = [];
  if (res && 'a' in res) {
    const { a, b, c } = res;
    steps = unknown === 'c'
      ? [`c² = a² + b²`, `c² = ${fmt(a)}² + ${fmt(b)}² = ${fmt(a * a)} + ${fmt(b * b)} = ${fmt(a * a + b * b)}`, `c = √${fmt(a * a + b * b)} = ${fmt(c)}`]
      : unknown === 'a'
        ? [`a² = c² − b²`, `a² = ${fmt(c)}² − ${fmt(b)}² = ${fmt(c * c)} − ${fmt(b * b)} = ${fmt(c * c - b * b)}`, `a = √${fmt(c * c - b * b)} = ${fmt(a)}`]
        : [`b² = c² − a²`, `b² = ${fmt(c)}² − ${fmt(a)}² = ${fmt(c * c)} − ${fmt(a * a)} = ${fmt(c * c - a * a)}`, `b = √${fmt(c * c - a * a)} = ${fmt(b)}`];
  }

  const labelOf = (k: PythKey): string => (k === 'a' ? s.pythLegA : k === 'b' ? s.pythLegB : s.pythHyp);
  const c1 = parseNum(chk[0]), c2 = parseNum(chk[1]), c3 = parseNum(chk[2]);
  const chkReady = [c1, c2, c3].every(Number.isFinite);
  const chkRight = chkReady && isRightTriangle(c1, c2, c3);
  const sorted = chkReady ? [c1, c2, c3].sort((x, y) => x - y) : [0, 0, 0];

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-5">
        <Panel title={s.pythTitle}>
          <div dir="ltr" className="mb-4 rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-center font-mono text-lg text-white">
            a² + b² = c²
          </div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400">{s.pythSolveFor}</span>
            {(['c', 'a', 'b'] as PythKey[]).map((k) => (
              <Pill key={k} active={unknown === k} onClick={() => setUnknown(k)}>{labelOf(k)}</Pill>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(['a', 'b', 'c'] as PythKey[]).map((k) =>
              k === unknown ? (
                <NumField
                  key={k} label={labelOf(k)} highlight readOnly
                  value={res && 'a' in res ? fmt(res[k]) : ''} placeholder="?" onChange={() => undefined}
                />
              ) : (
                <NumField key={k} label={labelOf(k)} value={v[k]} onChange={(x) => setV((p) => ({ ...p, [k]: x }))} />
              ),
            )}
          </div>
          {errMsg && <div className="mt-3"><Note tone="error">{errMsg}</Note></div>}
          {steps.length > 0 && (
            <div className="mt-4">
              <div className="mb-1.5 text-[11px] font-semibold text-slate-400">{s.pythResult}</div>
              <div dir="ltr" className="space-y-1 rounded-lg border border-white/[0.07] bg-black/25 p-3 font-mono text-[13px] text-slate-200">
                {steps.map((x, i) => <div key={i} className={i === steps.length - 1 ? 'font-bold text-cyan-300' : ''}>{x}</div>)}
              </div>
            </div>
          )}
          <div className="mt-4">
            <div className="mb-1.5 text-[11px] font-semibold text-slate-400">{s.pythTriples}</div>
            <div dir="ltr" className="flex flex-wrap gap-1.5">
              {TRIPLES.map(([a, b, c]) => (
                <Pill key={c} onClick={() => { setUnknown('c'); setV({ a: String(a), b: String(b), c: '' }); }}>{a} · {b} · {c}</Pill>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title={s.pythCheckTitle}>
          <p className="mb-3 text-xs text-slate-400">{s.pythCheckDesc}</p>
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <NumField
                key={i} label={`#${i + 1}`} value={chk[i]}
                onChange={(x) => setChk((p) => { const n: [string, string, string] = [...p]; n[i] = x; return n; })}
              />
            ))}
          </div>
          {chkReady && (
            <div className="mt-3 space-y-2">
              <Note tone={chkRight ? 'ok' : 'warn'}>{chkRight ? s.pythIsRight : s.pythNotRight}</Note>
              <div dir="ltr" className="font-mono text-[12px] text-slate-400">
                {fmt(sorted[0])}² + {fmt(sorted[1])}² = {fmt(sorted[0] ** 2 + sorted[1] ** 2)} {chkRight ? '=' : '≠'} {fmt(sorted[2])}² = {fmt(sorted[2] ** 2)}
              </div>
            </div>
          )}
        </Panel>
      </div>

      <Panel title={s.pythSquares}>
        {res && 'a' in res ? <PythDiagram a={res.a} b={res.b} c={res.c} /> : <PythDiagram a={3} b={4} c={5} />}
      </Panel>
    </div>
  );
};

/* ───────────────────────── Euclid panel ───────────────────────── */

const E_KEYS: { k: EuclidKey; name: string }[] = [
  { k: 'c', name: 'AB' }, { k: 'b', name: 'AC' }, { k: 'a', name: 'BC' },
  { k: 'h', name: 'AD' }, { k: 'p', name: 'BD' }, { k: 'q', name: 'DC' },
];

export const EuclidPanel: React.FC = () => {
  const { language } = useLanguage();
  const s = mathStrings[language];
  const [v, setV] = useState<Record<EuclidKey, string>>({ a: '', b: '', c: '', h: '', p: '4', q: '9' });

  const analysis = useMemo(() => {
    const given: Partial<Record<EuclidKey, number>> = {};
    let bad = false;
    (Object.keys(v) as EuclidKey[]).forEach((k) => {
      if (v[k].trim() === '') return;
      const n = parseNum(v[k]);
      if (Number.isFinite(n)) given[k] = n; else bad = true;
    });
    if (bad) return { error: 'invalid' as const };
    const r = solveEuclid(given);
    if ('error' in r) return { error: r.error };
    // every typed value must agree with the solved triangle
    for (const k of Object.keys(given) as EuclidKey[]) {
      const g = given[k] as number;
      if (Math.abs(r.sol[k] - g) > 1e-6 * Math.max(1, Math.abs(g))) return { error: 'inconsistent' as const };
    }
    return r;
  }, [v]);

  const sol = 'sol' in analysis ? analysis.sol : null;
  const err = 'error' in analysis
    ? analysis.error === 'needTwo' ? s.euErrNeedTwo
      : analysis.error === 'positive' ? s.euErrPositive
        : analysis.error === 'inconsistent' ? s.euErrInconsistent : s.slopeInvalid
    : null;

  const rel = sol
    ? [
      { f: 'AB² = BD × BC', n: `${fmt(sol.c ** 2)} = ${fmt(sol.p)} × ${fmt(sol.a)}` },
      { f: 'AC² = DC × BC', n: `${fmt(sol.b ** 2)} = ${fmt(sol.q)} × ${fmt(sol.a)}` },
      { f: 'AD² = BD × DC', n: `${fmt(sol.h ** 2)} = ${fmt(sol.p)} × ${fmt(sol.q)}` },
      { f: 'AB × AC = BC × AD', n: `${fmt(sol.c * sol.b)} = ${fmt(sol.a)} × ${fmt(sol.h)}` },
      { f: 'AB² + AC² = BC²', n: `${fmt(sol.c ** 2)} + ${fmt(sol.b ** 2)} = ${fmt(sol.a ** 2)}` },
    ]
    : [];

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-5">
        <Panel title={s.euTitle}>
          <p className="mb-1 text-xs text-slate-300">{s.euIntro}</p>
          <p className="mb-4 text-xs text-slate-500">{s.euEnter}</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {E_KEYS.map(({ k, name }) => (
              <NumField
                key={k}
                label={name}
                value={v[k]}
                onChange={(x) => setV((p) => ({ ...p, [k]: x }))}
                placeholder={sol && v[k].trim() === '' ? fmt(sol[k], 4) : ''}
                highlight={!!sol && v[k].trim() === ''}
              />
            ))}
          </div>
          {err && <div className="mt-3"><Note tone={'error' in analysis && analysis.error === 'needTwo' ? 'info' : 'error'}>{err}</Note></div>}
          {'twoSolutions' in analysis && analysis.twoSolutions && <div className="mt-3"><Note tone="warn">{s.euTwoSolutions}</Note></div>}
        </Panel>

        {rel.length > 0 && (
          <Panel title={s.euRelations}>
            <ul dir="ltr" className="space-y-2">
              {rel.map((r, i) => (
                <li key={i} className="rounded-lg border border-white/[0.07] bg-black/25 px-3 py-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[13px] font-bold text-violet-200">{r.f}</span>
                    <span className="text-emerald-400">✓</span>
                  </div>
                  <div className="mt-0.5 font-mono text-[12px] text-slate-400">{r.n}</div>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </div>

      <Panel title={sol ? s.euSolved : s.euTitle}>
        <EuclidDiagram sol={sol ?? { p: 4, q: 9, a: 13, c: Math.sqrt(52), b: Math.sqrt(117), h: 6 }} faded={!sol} />
      </Panel>
    </div>
  );
};

/* ───────────────────────── wrapper (kept for backward compatibility) ───────────────────────── */

export const GeometryLaws: React.FC<{ sub?: 'pyth' | 'euclid' }> = ({ sub = 'pyth' }) => (
  sub === 'pyth' ? <PythagorasPanel /> : <EuclidPanel />
);

export default GeometryLaws;
