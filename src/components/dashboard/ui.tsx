import React from 'react';

export const PageHeader: React.FC<{
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}> = ({ eyebrow, title, subtitle, actions }) => (
  <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
    <div className="min-w-0">
      {eyebrow && <div className="sn-eyebrow mb-2">{eyebrow}</div>}
      <h1 className="sn-h1">{title}</h1>
      {subtitle && <p className="mt-2 max-w-[64ch] text-[13px] leading-relaxed text-[#737373]">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export const StatCard: React.FC<{
  label: string;
  value: string;
  hint?: string;
  trend?: string;
  icon?: React.ElementType;
  accent?: string;
}> = ({ label, value, hint, trend, icon: Icon, accent }) => (
  <div className="sn-card p-4">
    <div className="flex items-start justify-between gap-2">
      <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#737373]">{label}</span>
      {Icon && (
        <span className={`flex h-7 w-7 items-center justify-center rounded-[8px] ${accent ? `sn-${accent} sn-accent-bg` : 'bg-[#f5f5f5]'}`}>
          <Icon size={14} strokeWidth={1.7} className={accent ? 'sn-accent-text' : 'text-[#737373]'} />
        </span>
      )}
    </div>
    <div className="sn-stat-value mt-4">{value}</div>
    <div className="mt-2 flex items-center gap-2">
      {trend && (
        <span className="sn-badge sn-badge-green !px-1.5 !py-0 !text-[10px]">{trend}</span>
      )}
      {hint && <span className="text-[11px] text-[#737373]">{hint}</span>}
    </div>
  </div>
);

export const SectionCard: React.FC<{
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}> = ({ title, action, children, className = '', bodyClassName = '' }) => (
  <section className={`sn-card overflow-hidden ${className}`}>
    <div className="flex items-center justify-between border-b border-[#f0f0f0] px-5 py-3.5">
      <h2 className="text-[13px] font-semibold tracking-[-0.01em]">{title}</h2>
      {action}
    </div>
    <div className={bodyClassName || 'p-5'}>{children}</div>
  </section>
);

export const ProgressBar: React.FC<{ value: number; className?: string }> = ({ value, className = '' }) => (
  <div className={`sn-bar ${className}`} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
    <div className="sn-bar-fill" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
  </div>
);

export const EmptyState: React.FC<{ icon: React.ElementType; title: string; body?: string }> = ({
  icon: Icon,
  title,
  body,
}) => (
  <div className="flex flex-col items-center justify-center gap-2 rounded-[10px] border border-dashed border-[#e5e5e5] px-6 py-12 text-center">
    <Icon size={20} strokeWidth={1.6} className="text-[#a3a3a3]" />
    <div className="text-[13px] font-medium text-[#171717]">{title}</div>
    {body && <div className="max-w-[40ch] text-[11px] text-[#737373]">{body}</div>}
  </div>
);
