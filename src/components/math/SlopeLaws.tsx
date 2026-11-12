import React, { useMemo, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { mathStrings, tpl, type MathStrings } from '../../i18n/mathTranslations';
import { SLOPE_LAWS, type LawMode, type LawResult, type SlopeLaw, type Verdict } from '../../data/mathLaws';
import { parseNum, verifySlopeLaws } from '../../utils/mathEngine';
import { MATH_ACCENT, NumField, Note, Pill } from './mathUi';

const verdictText = (v: Verdict, s: MathStrings): { text: string; ok: boolean } => {
  switch (v) {
    case 'parallel': return { text: s.slopeParallelYes, ok: true };
    case 'notParallel': return { text: s.slopeParallelNo, ok: false };
    case 'perpendicular': return { text: s.slopePerpYes, ok: true };
    default: return { text: s.slopePerpNo, ok: false };
  }
};

/** runs a law mode on the typed strings: empty box → no result yet, unreadable box → invalid */
function run(mode: LawMode, vals: Record<string, string>): LawResult | 'empty' | 'invalid' {
  const nums: Record<string, number> = {};
  let anyEmpty = false;
  for (const inp of mode.inputs) {
    const raw = (vals[inp.key] ?? '').trim();
    if (raw === '') { anyEmpty = true; continue; }
    const n = parseNum(raw);
    if (!Number.isFinite(n)) return 'invalid';
    nums[inp.key] = n;
  }
  if (anyEmpty) return 'empty';
  return mode.compute(nums);
}

const defaultsFor = (law: SlopeLaw): Record<string, Record<string, string>> => {
  const out: Record<string, Record<string, string>> = {};
  law.modes.forEach((m) => {
    out[m.id] = {};
    m.inputs.forEach((i) => { out[m.id][i.key] = i.def; });
  });
  return out;
};

const LawCard: React.FC<{ law: SlopeLaw }> = ({ law }) => {
  const { language } = useLanguage();
  const s = mathStrings[language];
  const [modeId, setModeId] = useState(law.modes[0].id);
  const [vals, setVals] = useState(() => defaultsFor(law));
  const mode = law.modes.find((m) => m.id === modeId) ?? law.modes[0];
  const res = run(mode, vals[mode.id]);

  const setVal = (key: string, v: string): void =>
    setVals((p) => ({ ...p, [mode.id]: { ...p[mode.id], [key]: v } }));

  const errText = (err: 'vertical' | 'invalid' | 'zeroDen'): string =>
    err === 'vertical' ? s.slopeVertical : err === 'zeroDen' ? s.slopeZeroDen : s.slopeInvalid;

  return (
    <article className="sci-surface flex flex-col p-4 sm:p-5">
      <header className="mb-3 flex items-start gap-3">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold text-white" style={{ background: MATH_ACCENT }}>
          {law.id}
        </span>
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{s.slopeLawWord} {law.id}</div>
          <h3 className="text-sm font-bold leading-snug text-white">{law.name[language]}</h3>
        </div>
      </header>

      <div dir="ltr" className="mb-3 rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-center font-mono text-[15px] font-semibold text-violet-200">
        {mode.formula}
      </div>

      {law.modes.length > 1 && (
        <div dir="ltr" className="mb-3 flex flex-wrap gap-1.5">
          {law.modes.map((m) => (
            <Pill key={m.id} active={m.id === mode.id} onClick={() => setModeId(m.id)}>{m.label}</Pill>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {mode.inputs.map((inp) => (
          <NumField key={inp.key} label={inp.sym} value={vals[mode.id][inp.key] ?? ''} onChange={(v) => setVal(inp.key, v)} />
        ))}
      </div>

      <div className="mt-4 min-h-[88px] rounded-lg border border-white/[0.07] bg-black/25 p-3">
        {res === 'empty' && <div className="text-xs text-slate-500">—</div>}
        {res === 'invalid' && <Note tone="error">{s.slopeInvalid}</Note>}
        {typeof res === 'object' && res.kind === 'error' && <Note tone="warn">{errText(res.err)}</Note>}
        {typeof res === 'object' && res.kind === 'value' && (
          <div>
            <div className="flex flex-wrap items-baseline gap-2" dir="ltr">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{s.slopeResult}</span>
              <span className="font-mono text-base text-slate-300">{res.sym} =</span>
              <span className="font-mono text-2xl font-extrabold text-cyan-300">{res.text}</span>
              {res.verdict && (
                <span className={`ms-auto rounded-full px-2.5 py-0.5 text-xs font-bold ${verdictText(res.verdict, s).ok ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}>
                  {verdictText(res.verdict, s).text}
                </span>
              )}
            </div>
            <div className="mt-2 text-[11px] font-semibold text-slate-500">{s.slopeSteps}</div>
            <div dir="ltr" className="mt-1 space-y-0.5 font-mono text-[12.5px] text-slate-300">
              {res.steps.map((st, i) => <div key={i}>{st}</div>)}
            </div>
          </div>
        )}
      </div>

      <p className="mt-3 text-[11.5px] leading-relaxed text-slate-400">{law.note[language]}</p>
    </article>
  );
};

export const SlopeLaws: React.FC = () => {
  const { language } = useLanguage();
  const s = mathStrings[language];
  // runs the numeric self-check of all 7 laws once (200 random cases + textbook values)
  const report = useMemo(() => verifySlopeLaws(), []);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white">{s.slopeTitle}</h2>
          <p className="mt-0.5 text-xs text-slate-400">{s.slopeIntro}</p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold ${
            report.failed.length === 0 ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300' : 'border-rose-400/30 bg-rose-500/10 text-rose-300'
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          {report.failed.length === 0 ? tpl(s.slopeVerified, report.passed) : `✗ ${report.failed.length}`}
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {SLOPE_LAWS.map((law) => <LawCard key={law.id} law={law} />)}
      </div>
    </div>
  );
};

export default SlopeLaws;
