import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { LAB_MODULES } from '../../data/labs';
import { PageHeader } from './ui';
import {
  Activity,
  Atom,
  FlaskConical,
  Dna,
  Globe2,
  Sparkles,
  Sigma,
  ArrowUpRight,
  WifiOff,
  ShieldCheck,
  Search,
} from 'lucide-react';

const ICONS: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  anatomy: Activity,
  physics: Atom,
  chemistry: FlaskConical,
  biology: Dna,
  geology: Globe2,
  astronomy: Sparkles,
  math: Sigma,
};

type Filter = 'all' | 'life' | 'physical' | 'earth';

const FILTERS: Record<Filter, string[]> = {
  all: [],
  life: ['anatomy', 'biology'],
  physical: ['physics', 'chemistry', 'math'],
  earth: ['geology', 'astronomy'],
};

export const LabsPage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const ar = language === 'ar';
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const labs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LAB_MODULES.filter((lab) => {
      const matchesFilter = filter === 'all' || FILTERS[filter].includes(lab.id);
      const matchesQuery =
        !q ||
        lab.nameEn.toLowerCase().includes(q) ||
        lab.nameAr.includes(q) ||
        lab.categoryEn.toLowerCase().includes(q) ||
        lab.categoryAr.includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [filter, query]);

  return (
    <div>
      <PageHeader
        eyebrow={ar ? 'المعامل' : 'Laboratories'}
        title={ar ? 'ستّ غرف. سؤال واحد لكل غرفة.' : 'Six rooms. One question each.'}
        subtitle={
          ar
            ? 'كل معمل يحتوي على أدوات قياس حقيقية ونماذج ثلاثية الأبعاد. تقدّمك محفوظ تلقائيًا.'
            : 'Every lab carries real measurement tools and 3D models. Your progress is saved automatically.'
        }
        actions={
          <>
            <span className="sn-badge sn-badge-green">
              <span className="h-1.5 w-1.5 rounded-full bg-[#047857]" />
              {ar ? '٦ معامل متصلة' : '6 labs online'}
            </span>
            <span className="sn-badge sn-badge-outline">WebGL 2</span>
          </>
        }
      />

      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="sn-segmented w-fit">
          {(
            [
              ['all', ar ? 'الكل' : 'All'],
              ['life', ar ? 'الحياة' : 'Life'],
              ['physical', ar ? 'الفيزياء والكيمياء' : 'Physical'],
              ['earth', ar ? 'الأرض والفضاء' : 'Earth & space'],
            ] as [Filter, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`sn-segment ${filter === id ? 'active' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-[260px]">
          <Search size={14} strokeWidth={1.8} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[#a3a3a3]" />
          <input
            className="sn-input !h-9 !ps-9 !text-[12px]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={ar ? 'ابحث في المعامل' : 'Search labs'}
            aria-label={ar ? 'بحث المعامل' : 'Search labs'}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {labs.map((lab) => {
          const Icon = ICONS[lab.id];
          const features = ar ? lab.featuresAr : lab.featuresEn;
          return (
            <article key={lab.id} className={`sn-${lab.accent} sn-card sn-card-hover flex flex-col overflow-hidden`}>
              <div className="h-[3px] w-full sn-accent-line opacity-80" />
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-5 flex items-start justify-between">
                  <span className="sn-icon-tile !h-10 !w-10">
                    <Icon size={19} strokeWidth={1.6} />
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.16em] text-[#a3a3a3]">{lab.index}</span>
                </div>

                <div className="sn-eyebrow mb-1 !text-[10px]">{ar ? lab.categoryAr : lab.categoryEn}</div>
                <h2 className="sn-h3">{ar ? lab.nameAr : lab.nameEn}</h2>
                <p className="mt-2 text-[12px] leading-relaxed text-[#737373]">{ar ? lab.descriptionAr : lab.descriptionEn}</p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {features.map((feature) => (
                    <span
                      key={feature}
                      className="rounded-full border px-2 py-0.5 text-[10px] font-medium"
                      style={{ background: 'var(--sn-accent-soft)', borderColor: 'var(--sn-accent-line)', color: 'var(--sn-accent)' }}
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex items-end justify-between border-t border-[#f0f0f0] pt-4">
                  <div>
                    <div className="sn-number text-[20px] font-semibold leading-none tracking-[-0.04em]">{lab.statValue}</div>
                    <div className="mt-1 text-[10px] text-[#737373]">{ar ? lab.statLabelAr : lab.statLabelEn}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/app/labs/${lab.id}`)}
                    className="sn-btn sn-btn-primary sn-btn-sm"
                  >
                    {ar ? 'افتح المعمل' : 'Open lab'}
                    <ArrowUpRight size={13} strokeWidth={1.9} />
                  </button>
                </div>
              </div>
            </article>
          );
        })}

        {labs.length === 0 && (
          <div className="sn-card col-span-full flex flex-col items-center gap-2 p-12 text-center">
            <Search size={20} strokeWidth={1.6} className="text-[#a3a3a3]" />
            <div className="text-[13px] font-medium">{ar ? 'لا توجد معامل مطابقة' : 'No labs match that search'}</div>
            <button type="button" onClick={() => { setQuery(''); setFilter('all'); }} className="sn-btn sn-btn-ghost sn-btn-sm mt-2">
              {ar ? 'مسح الفلاتر' : 'Clear filters'}
            </button>
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {[
          {
            icon: ShieldCheck,
            t: ar ? 'بيانات علمية موثّقة' : 'Verified scientific data',
            d: ar ? 'مراجعة مقابل المراجع الطبية والمناهج الوزارية.' : 'Reviewed against medical references and Ministry curricula.',
          },
          {
            icon: WifiOff,
            t: ar ? 'جاهز للعمل دون إنترنت' : 'Offline-ready',
            d: ar ? 'نسخة محلية كاملة على USB أو شبكة المدرسة.' : 'A complete local build on USB or the school LAN.',
          },
          {
            icon: Activity,
            t: ar ? 'تقدّم محفوظ تلقائيًا' : 'Progress saved automatically',
            d: ar ? 'كل تجربة تُستأنف من حيث توقفت.' : 'Every experiment resumes exactly where you left it.',
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.t} className="flex items-start gap-3 rounded-[16px] border border-[#e5e5e5] bg-white p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-[#f5f5f5]">
                <Icon size={15} strokeWidth={1.7} className="text-[#737373]" />
              </span>
              <div>
                <div className="text-[12px] font-medium">{item.t}</div>
                <div className="mt-0.5 text-[11px] leading-relaxed text-[#737373]">{item.d}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LabsPage;
