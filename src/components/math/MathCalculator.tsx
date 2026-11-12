import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { GripHorizontal, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { mathStrings } from '../../i18n/mathTranslations';
import { calculate, fmt } from '../../utils/mathEngine';
import { MATH_ACCENT } from './mathUi';

type KeyKind = 'num' | 'op' | 'fn' | 'act' | 'eq';
interface Key { label: string; insert?: string; kind: KeyKind; act?: 'clear' | 'back' | 'eq' }

const ROWS: Key[][] = [
  [{ label: 'C', kind: 'act', act: 'clear' }, { label: '⌫', kind: 'act', act: 'back' }, { label: '(', insert: '(', kind: 'fn' }, { label: ')', insert: ')', kind: 'op' }, { label: '÷', insert: '÷', kind: 'op' }],
  [{ label: 'sin', insert: 'sin(', kind: 'fn' }, { label: '7', insert: '7', kind: 'num' }, { label: '8', insert: '8', kind: 'num' }, { label: '9', insert: '9', kind: 'num' }, { label: '×', insert: '×', kind: 'op' }],
  [{ label: 'cos', insert: 'cos(', kind: 'fn' }, { label: '4', insert: '4', kind: 'num' }, { label: '5', insert: '5', kind: 'num' }, { label: '6', insert: '6', kind: 'num' }, { label: '−', insert: '−', kind: 'op' }],
  [{ label: 'tan', insert: 'tan(', kind: 'fn' }, { label: '1', insert: '1', kind: 'num' }, { label: '2', insert: '2', kind: 'num' }, { label: '3', insert: '3', kind: 'num' }, { label: '+', insert: '+', kind: 'op' }],
  [{ label: '√', insert: '√(', kind: 'fn' }, { label: '0', insert: '0', kind: 'num' }, { label: '.', insert: '.', kind: 'num' }, { label: 'π', insert: 'π', kind: 'num' }, { label: '=', kind: 'eq', act: 'eq' }],
  [{ label: 'x²', insert: '^2', kind: 'op' }, { label: '^', insert: '^', kind: 'op' }, { label: 'ln', insert: 'ln(', kind: 'fn' }, { label: 'log', insert: 'log(', kind: 'fn' }, { label: 'Ans', insert: 'ans', kind: 'num' }],
];

const keyStyle = (k: Key): string => {
  const base = 'h-10 rounded-lg text-sm font-semibold transition active:scale-95 ';
  switch (k.kind) {
    case 'num': return base + 'bg-white/[0.07] text-white hover:bg-white/15';
    case 'op': return base + 'bg-violet-500/15 text-violet-200 hover:bg-violet-500/25';
    case 'fn': return base + 'bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20';
    case 'act': return base + 'bg-rose-500/10 text-rose-200 hover:bg-rose-500/20';
    default: return base + 'text-white hover:opacity-90';
  }
};

const isContinuation = (ins: string): boolean => /^[÷×−+^)]/.test(ins);

/** Optional floating calculator. Sits at the physical top-left of the lab; closed by default. */
export const MathCalculator: React.FC = () => {
  const { language } = useLanguage();
  const s = mathStrings[language];
  const [open, setOpen] = useState(false);
  const [expr, setExpr] = useState('');
  const [deg, setDeg] = useState(false);
  const [ans, setAns] = useState(0);
  const [shown, setShown] = useState<string | null>(null); // result text, or null
  const [error, setError] = useState(false);
  const [fresh, setFresh] = useState(false); // last action was "="
  const [history, setHistory] = useState<{ e: string; r: string }[]>([]);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null); // fixed-position, free to move anywhere
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const clamp = (x: number, y: number): { x: number; y: number } => {
    const w = panelRef.current?.offsetWidth ?? 312;
    const h = panelRef.current?.offsetHeight ?? 400;
    return {
      x: Math.min(Math.max(0, x), Math.max(0, window.innerWidth - w)),
      y: Math.min(Math.max(0, y), Math.max(0, window.innerHeight - Math.min(h, 60))),
    };
  };

  // close on Escape only — the panel stays open (and movable) while the student works in the lab
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent): void => { if (e.key === 'Escape') setOpen(false); };
    const onResize = (): void => setPos((p) => (p ? clamp(p.x, p.y) : p));
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('resize', onResize); };
  }, [open]);

  const toggle = (): void => {
    if (open) { setOpen(false); return; }
    if (!pos) {
      const r = btnRef.current?.getBoundingClientRect();
      const w = Math.min(312, window.innerWidth - 16);
      setPos({ x: Math.min(Math.max(8, r?.left ?? 16), Math.max(8, window.innerWidth - w - 8)), y: (r?.bottom ?? 48) + 8 });
    }
    setOpen(true);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  const onDragStart = (e: React.PointerEvent<HTMLDivElement>): void => {
    if ((e.target as HTMLElement).closest('button')) return; // header buttons stay clickable
    const cur = pos ?? { x: 0, y: 0 };
    drag.current = { dx: e.clientX - cur.x, dy: e.clientY - cur.y };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  };
  const onDragMove = (e: React.PointerEvent<HTMLDivElement>): void => {
    if (!drag.current) return;
    setPos(clamp(e.clientX - drag.current.dx, e.clientY - drag.current.dy));
  };
  const onDragEnd = (e: React.PointerEvent<HTMLDivElement>): void => {
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const evaluate = (): void => {
    if (!expr.trim()) return;
    const r = calculate(expr, deg, ans);
    if (!r.ok) { setError(true); setShown(null); return; }
    const text = fmt(r.value, 10);
    setError(false);
    setShown(text);
    setAns(r.value);
    setHistory((h) => [{ e: expr, r: text }, ...h].slice(0, 6));
    setExpr(/e/.test(text) ? 'ans' : text.replace('-', '−'));
    setFresh(true);
  };

  const press = (k: Key): void => {
    setError(false);
    if (k.act === 'clear') { setExpr(''); setShown(null); setFresh(false); return; }
    if (k.act === 'back') { setExpr((p) => p.slice(0, -1)); setFresh(false); return; }
    if (k.act === 'eq') { evaluate(); return; }
    const ins = k.insert ?? '';
    // after "=": operators continue from the result, anything else starts a new calculation
    setExpr((p) => (fresh && !isContinuation(ins) ? ins : p + ins));
    setFresh(false);
    setShown(null);
  };

  return (
    <div dir="ltr" className="shrink-0">
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label={s.calcButton}
        title={s.calcButton}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
          open ? 'border-transparent text-white' : 'border-white/10 bg-white/[0.05] text-slate-300 hover:bg-white/10 hover:text-white'
        }`}
        style={open ? { background: MATH_ACCENT } : undefined}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="5" y="2.5" width="14" height="19" rx="2.5" />
          <rect x="8" y="5.5" width="8" height="3.5" rx="0.8" />
          <path d="M8.5 13h.01M12 13h.01M15.5 13h.01M8.5 16.5h.01M12 16.5h.01M15.5 16.5h.01" />
        </svg>
        <span className="hidden sm:inline">{s.calcButton}</span>
      </button>

      {open && pos && typeof document !== 'undefined' && createPortal(
        <div
          ref={panelRef}
          dir="ltr"
          role="dialog"
          aria-label={s.calcTitle}
          style={{ position: 'fixed', left: pos.x, top: pos.y, zIndex: 1000 }}
          className="w-[19.5rem] max-w-[calc(100vw-1rem)] rounded-2xl border border-white/10 bg-[#0e1116] p-3 text-slate-200 shadow-2xl"
        >
          <div
            onPointerDown={onDragStart}
            onPointerMove={onDragMove}
            onPointerUp={onDragEnd}
            onPointerCancel={onDragEnd}
            title={s.calcDrag}
            style={{ touchAction: 'none' }}
            className="-mx-1 -mt-1 mb-2 flex cursor-grab select-none items-center justify-between rounded-lg px-1 py-1 active:cursor-grabbing"
          >
            <span className="flex items-center gap-1.5 text-xs font-bold text-white">
              <GripHorizontal className="h-4 w-4 text-slate-500" />
              {s.calcTitle}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setDeg((d) => !d)}
                className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 font-mono text-[11px] font-bold text-cyan-300 transition hover:bg-white/10"
              >
                {deg ? 'DEG' : 'RAD'}
              </button>
              <button type="button" onClick={() => setOpen(false)} aria-label={s.calcClose} className="rounded-md p-1 text-slate-400 transition hover:bg-white/10 hover:text-white">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <input
            ref={inputRef}
            value={expr}
            onChange={(e) => { setExpr(e.target.value); setFresh(false); setShown(null); setError(false); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); evaluate(); } }}
            spellCheck={false}
            autoComplete="off"
            inputMode="text"
            placeholder="0"
            aria-label={s.calcTitle}
            className="mb-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-right font-mono text-base text-white outline-none placeholder:text-slate-600 focus:border-cyan-400"
          />
          <div className="mb-2 flex min-h-[2.25rem] items-center justify-end px-1">
            {error ? (
              <span className="text-xs font-semibold text-rose-300">{s.calcError}</span>
            ) : shown !== null ? (
              <span className="font-mono text-2xl font-extrabold text-cyan-300">= {shown}</span>
            ) : (
              <span className="text-[11px] text-slate-500">{s.calcHint}</span>
            )}
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {ROWS.flat().map((k) => (
              <button
                key={k.label}
                type="button"
                onClick={() => press(k)}
                className={keyStyle(k)}
                style={k.kind === 'eq' ? { background: MATH_ACCENT } : undefined}
              >
                {k.label}
              </button>
            ))}
          </div>

          {history.length > 0 && (
            <div className="mt-3 border-t border-white/[0.07] pt-2">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">{s.calcHistory}</div>
              <ul className="space-y-0.5">
                {history.map((h, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => { setExpr(h.r.replace('-', '−')); setShown(null); setFresh(true); }}
                      className="flex w-full items-center justify-between gap-3 rounded px-1.5 py-0.5 font-mono text-[11.5px] text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
                    >
                      <span className="truncate">{h.e}</span>
                      <span className="shrink-0 text-cyan-300">= {h.r}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>,
        document.body,
      )}
    </div>
  );
};

export default MathCalculator;
