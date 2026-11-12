import React from 'react';

export const MATH_ACCENT = 'linear-gradient(135deg, #8b5cf6, #06b6d4)';

/** text input that keeps its value as a string so partial typing ("-", "3.") never breaks. */
export const NumField: React.FC<{
  label: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  highlight?: boolean;
  readOnly?: boolean;
  className?: string;
}> = ({ label, value, onChange, placeholder, highlight, readOnly, className }) => (
  <label className={`flex min-w-0 flex-col gap-1 ${className ?? ''}`}>
    <span dir="ltr" className="font-mono text-[11px] font-semibold text-slate-400">{label}</span>
    <input
      dir="ltr"
      inputMode="decimal"
      autoComplete="off"
      spellCheck={false}
      value={value}
      readOnly={readOnly}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full min-w-0 rounded-lg border px-3 py-2 font-mono text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 ${
        highlight ? 'border-violet-400/50 bg-violet-500/10' : 'border-white/10 bg-black/30'
      }`}
    />
  </label>
);

export const Panel: React.FC<{ title?: React.ReactNode; right?: React.ReactNode; children: React.ReactNode; className?: string }> = ({
  title, right, children, className,
}) => (
  <section className={`sci-surface p-4 sm:p-5 ${className ?? ''}`}>
    {(title || right) && (
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        {title && <h2 className="text-sm font-bold text-white">{title}</h2>}
        {right}
      </div>
    )}
    {children}
  </section>
);

export const Note: React.FC<{ tone?: 'info' | 'warn' | 'error' | 'ok'; children: React.ReactNode }> = ({ tone = 'info', children }) => {
  const cls =
    tone === 'error' ? 'border-rose-400/30 bg-rose-500/10 text-rose-200'
      : tone === 'warn' ? 'border-amber-400/30 bg-amber-500/10 text-amber-200'
        : tone === 'ok' ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
          : 'border-white/10 bg-white/[0.04] text-slate-300';
  return <div className={`rounded-lg border px-3 py-2 text-xs leading-relaxed ${cls}`}>{children}</div>;
};

export const Pill: React.FC<{ active?: boolean; onClick: () => void; children: React.ReactNode; title?: string }> = ({
  active, onClick, children, title,
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
      active ? 'border-transparent text-white' : 'border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/10 hover:text-white'
    }`}
    style={active ? { background: MATH_ACCENT } : undefined}
  >
    {children}
  </button>
);
