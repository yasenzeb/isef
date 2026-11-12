import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { fmt, parseNum } from '../../utils/mathEngine';
import { describe, heron, parseList, solveQuadratic } from '../../utils/algebraStats';
import { Note, Panel } from './mathUi';

/** free-text input (full keyboard, so minus / comma / space always work) */
const Field: React.FC<{ label: string; value: string; onChange: (v: string) => void; className?: string }> = ({ label, value, onChange, className }) => (
  <label className={`flex min-w-0 flex-col gap-1 ${className ?? ''}`}>
    <span dir="ltr" className="font-mono text-[11px] font-semibold text-slate-400">{label}</span>
    <input dir="ltr" inputMode="text" autoComplete="off" spellCheck={false} value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full min-w-0 rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm text-white outline-none transition focus:border-cyan-400" />
  </label>
);

/**
 * Per-law source. Paste the exact link of the textbook PDF (and the page) into `url` / `page`.
 * While `url` is empty nothing is shown, so no unverified source is ever displayed.
 */
export const SOURCES: Record<'quad' | 'roots' | 'heron' | 'range' | 'mean' | 'median' | 'iqr', { url: string; page: string }> = {
  quad: { url: '', page: '' }, roots: { url: '', page: '' }, heron: { url: '', page: '' },
  range: { url: '', page: '' }, mean: { url: '', page: '' }, median: { url: '', page: '' }, iqr: { url: '', page: '' },
};

type S = Record<string, string>;
const STR: Record<'ar' | 'en', S> = {
  ar: {
    source: 'المصدر: كتاب وزارة التربية والتعليم', page: 'صفحة',
    qTitle: 'القانون العام لحل المعادلة التربيعية', qHint: 'أدخل a و b و c للمعادلة ax² + bx + c = 0', a0: 'يجب ألا تساوي a صفرًا.',
    twoReal: 'جذران حقيقيان مختلفان (Δ > 0)', equalReal: 'جذران حقيقيان متساويان (Δ = 0)', complex: 'جذران مركبان مختلفان مترافقان (Δ < 0)',
    rootsTitle: 'تحديد نوع الجذرين', roots_gt: 'جذران حقيقيان مختلفان', roots_eq: 'جذران حقيقيان متساويان', roots_lt: 'جذران مركبان مختلفان مترافقان',
    hTitle: 'قانون هيرون لحساب مساحة المثلث', hHint: 'أدخل أطوال أضلاع المثلث x و y و z — p هو نصف المحيط', hPos: 'أدخل أطوالًا موجبة للأضلاع الثلاثة.', hIneq: 'هذه الأطوال لا تكوّن مثلثًا (مجموع أي ضلعين يجب أن يزيد على الثالث).',
    sTitle: 'الإحصاء الوصفي — مفاهيم أساسية', addVal: '+ إضافة رقم', clearAll: 'مسح الكل', bulkLabel: 'أو الصق/اكتب كل القيم هنا', meanNote: 'x̄ هو الوسط الحسابي، Σx مجموع القيم، n عدد القيم.', medStep1: 'ترتيب القيم تصاعديًا.', medEven: 'إذا كان عدد القيم (n) زوجيًا: رتبة الحدين الأوسطين هما n/2 و n/2 + 1، والوسيط = (الحد ذو الترتيب n/2 + الحد ذو الترتيب n/2 + 1) ÷ 2.', medOdd: 'إذا كان عدد القيم (n) فرديًا: رتبة الوسيط هي (n+1)/2، والوسيط = القيمة ذات الترتيب (n+1)/2.', oddWord: 'فردي', evenWord: 'زوجي', q1Def: 'الربيع الأول (الأدنى) — يمثل نقطة الوسط للنصف الأول من البيانات بعد ترتيبها.', q3Def: 'الربيع الثالث (الأعلى) — يمثل نقطة الوسط للنصف الثاني من البيانات بعد ترتيبها.', lowerHalf: 'النصف الأول', upperHalf: 'النصف الثاني', sHint: 'غيّر أي رقم في خانته، أو زوّد/امسح أرقام — النتايج بتتحدّث فورًا', sFew: 'أدخل قيمتين على الأقل.', sBad: 'قيم غير مفهومة:',
    range: 'المدى = أكبر قيمة − أصغر قيمة', mean: 'الوسط الحسابي (x̄)', median: 'الوسيط', iqr: 'المدى الربيعي (IQR)', sorted: 'القيم بعد الترتيب', n: 'عدد القيم',
    halves: 'الربيع الأول Q₁ = وسيط النصف الأول، الربيع الثالث Q₃ = وسيط النصف الثاني (الوسيط لا يدخل في النصفين إذا كان n فرديًا).',
    pos: 'رتبة الوسيط', area: 'المساحة',
  },
  en: {
    source: 'Source: Ministry of Education textbook', page: 'page',
    qTitle: 'The quadratic formula', qHint: 'Enter a, b, c for ax² + bx + c = 0', a0: 'a must not be 0.',
    twoReal: 'Two different real roots (Δ > 0)', equalReal: 'Two equal real roots (Δ = 0)', complex: 'Two complex conjugate roots (Δ < 0)',
    rootsTitle: 'Type of the roots', roots_gt: 'Two different real roots', roots_eq: 'Two equal real roots', roots_lt: 'Two complex conjugate roots',
    hTitle: "Heron's formula for the area of a triangle", hHint: 'Enter the side lengths x, y, z — p is the semi-perimeter', hPos: 'Enter three positive side lengths.', hIneq: 'These lengths do not form a triangle (any two sides must add up to more than the third).',
    sTitle: 'Descriptive statistics — basic concepts', addVal: '+ Add value', clearAll: 'Clear all', bulkLabel: 'or paste/type all values here', meanNote: 'x̄ is the mean, Σx the sum of the values, n the number of values.', medStep1: 'Sort the values in ascending order.', medEven: 'If n is even: the two middle positions are n/2 and n/2 + 1, and the median is the average of those two values.', medOdd: 'If n is odd: the median position is (n+1)/2, and the median is the value at that position.', oddWord: 'odd', evenWord: 'even', q1Def: 'the first (lower) quartile — the midpoint of the first half of the sorted data.', q3Def: 'the third (upper) quartile — the midpoint of the second half of the sorted data.', lowerHalf: 'First half', upperHalf: 'Second half', sHint: 'Edit any value in its box, or add/remove values — results update instantly', sFew: 'Enter at least two values.', sBad: 'Not understood:',
    range: 'Range = largest − smallest', mean: 'Mean', median: 'Median', iqr: 'Interquartile range', sorted: 'Sorted values', n: 'Number of values',
    halves: 'Q₁ = median of the lower half, Q₃ = median of the upper half (for odd n the median is left out of both halves).',
    pos: 'Median position', area: 'Area',
  },
};
const useS = (): S => { const { language } = useLanguage(); return language === 'ar' ? STR.ar : STR.en; };

export const SourceLink: React.FC<{ id: keyof typeof SOURCES }> = ({ id }) => {
  const s = useS();
  const { url, page } = SOURCES[id];
  if (!url) return null;
  return (
    <p className="mt-3 border-t border-white/10 pt-2 text-[11px] text-slate-400">
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline-offset-2 hover:underline">{s.source}</a>
      {page ? ` — ${s.page} ${page}` : ''}
    </p>
  );
};

const Steps: React.FC<{ lines: string[] }> = ({ lines }) => (
  <div dir="ltr" className="space-y-1 rounded-lg bg-black/30 p-3 font-mono text-xs text-slate-200">{lines.map((l, i) => <div key={i}>{l}</div>)}</div>
);
const Big: React.FC<{ k: string; v: string }> = ({ k, v }) => (
  <div className="rounded-lg border border-violet-400/30 bg-violet-500/10 px-3 py-2">
    <div className="text-[11px] text-slate-400">{k}</div><div dir="ltr" className="font-mono text-lg font-bold text-white">{v}</div>
  </div>
);

export const QuadraticPanel: React.FC = () => {
  const s = useS();
  const [v, setV] = useState({ a: '1', b: '-5', c: '6' });
  const r = solveQuadratic(parseNum(v.a), parseNum(v.b), parseNum(v.c));
  return (
    <Panel title={s.qTitle}>
      <div dir="ltr" className="mb-3 font-mono text-sm text-cyan-200">x = (−b ± √(b² − 4ac)) / 2a</div>
      <p className="mb-2 text-xs text-slate-400">{s.qHint}</p>
      <div className="grid grid-cols-3 gap-2">
        {(['a', 'b', 'c'] as const).map((k) => <Field key={k} label={k} value={v[k]} onChange={(x) => setV({ ...v, [k]: x })} />)}
      </div>
      <div className="mt-3 space-y-2">
        {'error' in r ? <Note tone="error">{s.a0}</Note> : (
          <>
            <Note tone={r.kind === 'complex' ? 'warn' : 'ok'}>{s[r.kind]}</Note>
            <div className="grid grid-cols-2 gap-2">
              <Big k="Δ = b² − 4ac" v={fmt(r.D)} />
              {r.kind === 'complex'
                ? <Big k="x₁ , x₂" v={`${fmt(r.re!)} ± ${fmt(r.im!)} i`} />
                : <Big k="x₁ , x₂" v={r.kind === 'equalReal' ? fmt(r.x1!) : `${fmt(r.x1!)} , ${fmt(r.x2!)}`} />}
            </div>
            <Steps lines={r.steps} />
          </>
        )}
      </div>
      <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3 text-xs text-slate-300">
        <div className="mb-2 font-bold text-white">{s.rootsTitle}</div>
        <div dir="ltr" className="font-mono text-cyan-200">b² − 4ac</div>
        {(['gt', 'eq', 'lt'] as const).map((k) => {
          const cur = !('error' in r) && ((k === 'gt' && r.D > 0) || (k === 'eq' && r.D === 0) || (k === 'lt' && r.D < 0));
          return (
            <div key={k} className={`mt-1 flex gap-2 rounded px-2 py-1 ${cur ? 'bg-violet-500/20 text-white' : ''}`}>
              <span dir="ltr" className="w-10 shrink-0 font-mono">{k === 'gt' ? '> 0' : k === 'eq' ? '= 0' : '< 0'}</span><span>{s['roots_' + k]}</span>
            </div>
          );
        })}
        <SourceLink id="roots" />
      </div>
      <SourceLink id="quad" />
    </Panel>
  );
};

export const HeronPanel: React.FC = () => {
  const s = useS();
  const [v, setV] = useState({ x: '3', y: '4', z: '5' });
  const r = heron(parseNum(v.x), parseNum(v.y), parseNum(v.z));
  return (
    <Panel title={s.hTitle}>
      <div dir="ltr" className="mb-3 font-mono text-sm text-cyan-200">A = √( p(p−x)(p−y)(p−z) ) , p = (x+y+z)/2</div>
      <p className="mb-2 text-xs text-slate-400">{s.hHint}</p>
      <div className="grid grid-cols-3 gap-2">
        {(['x', 'y', 'z'] as const).map((k) => <Field key={k} label={k} value={v[k]} onChange={(x) => setV({ ...v, [k]: x })} />)}
      </div>
      <div className="mt-3 space-y-2">
        {'error' in r ? <Note tone="error">{r.error === 'positive' ? s.hPos : s.hIneq}</Note> : (
          <>
            <div className="grid grid-cols-2 gap-2"><Big k="p" v={fmt(r.p)} /><Big k={s.area} v={fmt(r.area)} /></div>
            <Steps lines={r.steps} />
          </>
        )}
      </div>
      <SourceLink id="heron" />
    </Panel>
  );
};

const Law: React.FC<{ title: string; formula: string; id: keyof typeof SOURCES; children: React.ReactNode }> = ({ title, formula, id, children }) => (
  <Panel title={title}>
    <div dir="ltr" className="mb-2 font-mono text-sm text-cyan-200">{formula}</div>
    <div className="space-y-2 text-xs text-slate-300">{children}</div>
    <SourceLink id={id} />
  </Panel>
);

export const StatsPanel: React.FC = () => {
  const s = useS();
  const [cells, setCells] = useState<string[]>(['7', '1', '3', '9', '5', '2', '8']);
  const [bulk, setBulk] = useState('');
  const { values, bad } = (() => {
    const v: number[] = [], bd: string[] = [];
    cells.forEach((c) => { if (c.trim() === '') return; const n = parseNum(c); if (Number.isFinite(n)) v.push(n); else bd.push(c); });
    return { values: v, bad: bd };
  })();
  const r = describe(values);
  const setCell = (i: number, v: string): void => setCells(cells.map((c, j) => (j === i ? v : c)));
  const list = (a: number[]): string => a.map((x) => fmt(x)).join(' , ');
  const ok = !('error' in r);
  const odd = ok && r.n % 2 === 1;
  const hl = (on: boolean): string => `rounded-lg border px-3 py-2 ${on ? 'border-violet-400/50 bg-violet-500/10 text-white' : 'border-white/10 bg-black/20 opacity-70'}`;
  return (
    <div className="space-y-4">
      <Panel title={s.sTitle}>
        <p className="mb-2 text-xs text-slate-400">{s.sHint}</p>
        <div dir="ltr" className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {cells.map((c, i) => (
            <div key={i} className="relative">
              <Field label={`x${i + 1}`} value={c} onChange={(v) => setCell(i, v)} />
              <button type="button" aria-label="remove" onClick={() => setCells(cells.filter((_, j) => j !== i))}
                className="absolute right-1 top-0 text-sm leading-none text-slate-500 hover:text-rose-300">×</button>
            </div>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <button type="button" onClick={() => setCells([...cells, ''])} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10">{s.addVal}</button>
          <button type="button" onClick={() => setCells([''])} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10">{s.clearAll}</button>
          <Field className="min-w-[10rem] flex-1" label={s.bulkLabel} value={bulk} onChange={(v) => { setBulk(v); const p = parseList(v); const all = v.split(/[\s,;،؛]+/).filter(Boolean); setCells(all.length ? all : ['']); void p; }} />
        </div>
        {bad.length > 0 && <div className="mt-2"><Note tone="warn">{s.sBad} {bad.join(' ')}</Note></div>}
        {!ok && <div className="mt-2"><Note tone="error">{s.sFew}</Note></div>}
        {ok && <div dir="ltr" className="mt-2 font-mono text-xs text-slate-300">{s.sorted}: {list(r.sorted)}  (n = {r.n})</div>}
      </Panel>

      <Law title={s.range} formula="range = max − min" id="range">
        {ok && <><Big k={s.range} v={fmt(r.range)} /><Steps lines={[`${fmt(r.max)} − ${fmt(r.min)} = ${fmt(r.range)}`]} /></>}
      </Law>

      <Law title={s.mean} formula="x̄ = Σx / n" id="mean">
        <p>{s.meanNote}</p>
        {ok && <><Big k="x̄" v={fmt(r.mean)} /><Steps lines={[`Σx = ${fmt(r.sum)} ,  n = ${r.n}`, `x̄ = ${fmt(r.sum)} / ${r.n} = ${fmt(r.mean)}`]} /></>}
      </Law>

      <Law title={s.median} formula="Median" id="median">
        <p>① {s.medStep1}</p>
        <div className={hl(ok && !odd)}>
          <p>② {s.medEven}</p>
          <p dir="ltr" className="mt-1 font-mono">pos = n/2 , n/2 + 1</p>
          <p dir="ltr" className="font-mono">Median = ( x[n/2] + x[n/2 + 1] ) / 2</p>
        </div>
        <div className={hl(ok && odd)}>
          <p>• {s.medOdd}</p>
          <p dir="ltr" className="mt-1 font-mono">pos = (n + 1) / 2</p>
          <p dir="ltr" className="font-mono">Median = x[(n + 1) / 2]</p>
        </div>
        {ok && <><Big k={s.median} v={fmt(r.median)} /><Steps lines={[
          `n = ${r.n} (${odd ? s.oddWord : s.evenWord})`,
          odd ? `pos = (${r.n} + 1) / 2 = ${r.medianPos}` : `pos = ${r.n}/2 , ${r.n}/2 + 1 = ${r.medianPos}`,
          odd ? `Median = ${fmt(r.median)}` : `Median = (${fmt(r.sorted[r.n / 2 - 1])} + ${fmt(r.sorted[r.n / 2])}) / 2 = ${fmt(r.median)}`,
        ]} /></>}
      </Law>

      <Law title={s.iqr} formula="IQR = Q₃ − Q₁" id="iqr">
        <p>Q₁ : {s.q1Def}</p>
        <p>Q₃ : {s.q3Def}</p>
        <p className="text-slate-400">{s.halves}</p>
        {ok && <><div className="grid grid-cols-3 gap-2"><Big k="Q₁" v={fmt(r.q1)} /><Big k="Q₃" v={fmt(r.q3)} /><Big k="IQR" v={fmt(r.iqr)} /></div><Steps lines={[
          `${s.lowerHalf}: ${list(r.lower)}  →  Q₁ = ${fmt(r.q1)}`,
          `${s.upperHalf}: ${list(r.upper)}  →  Q₃ = ${fmt(r.q3)}`,
          `IQR = ${fmt(r.q3)} − ${fmt(r.q1)} = ${fmt(r.iqr)}`,
        ]} /></>}
      </Law>
    </div>
  );
};
