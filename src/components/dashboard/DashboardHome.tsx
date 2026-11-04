import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useSession } from '../../context/SessionContext';
import { LAB_MODULES } from '../../data/labs';
import { PageHeader, StatCard, SectionCard, ProgressBar } from './ui';
import {
  Activity,
  Atom,
  FlaskConical,
  Dna,
  Globe2,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Clock,
  CheckCircle2,
  TrendingUp,
  Users,
  GraduationCap,
  Building2,
  Play,
  CalendarDays,
  FileCheck2,
  ChevronRight,
} from 'lucide-react';

const ICONS: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  anatomy: Activity,
  physics: Atom,
  chemistry: FlaskConical,
  biology: Dna,
  geology: Globe2,
  astronomy: Sparkles,
};

const readCompleted = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem('scinexa_completed_lessons') || '["sec2-lesson-1"]');
  } catch {
    return ['sec2-lesson-1'];
  }
};

export const DashboardHome: React.FC = () => {
  const { language } = useLanguage();
  const { user, role } = useSession();
  const navigate = useNavigate();
  const ar = language === 'ar';
  const completed = useMemo(readCompleted, []);

  const firstName = user?.name?.trim().split(/\s+/)[0] || (ar ? 'بطلنا' : 'there');
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? ar
        ? 'صباح الخير'
        : 'Good morning'
      : hour < 18
        ? ar
          ? 'مساء الخير'
          : 'Good afternoon'
        : ar
          ? 'مساء الخير'
          : 'Good evening';

  const stats =
    role === 'student'
      ? [
          { label: ar ? 'تقدّم المنهج' : 'Curriculum', value: '68%', trend: '+6%', hint: ar ? 'هذا الأسبوع' : 'this week', icon: BookOpen },
          { label: ar ? 'دروس مكتملة' : 'Lessons', value: String(completed.length + 11), hint: ar ? 'من ٢٤ درسًا' : 'of 24', icon: CheckCircle2 },
          { label: ar ? 'نقاط الخبرة' : 'Experience', value: '480', trend: '+50', hint: 'XP', icon: TrendingUp },
          { label: ar ? 'أيام متتالية' : 'Streak', value: '3', hint: ar ? 'أيام' : 'days', icon: Activity },
        ]
      : role === 'teacher'
        ? [
            { label: ar ? 'الفصول' : 'Classes', value: '4', hint: ar ? 'نشطة' : 'active', icon: GraduationCap },
            { label: ar ? 'الطلاب' : 'Students', value: '128', trend: '+12', hint: ar ? 'هذا الشهر' : 'this month', icon: Users },
            { label: ar ? 'متوسط الإنجاز' : 'Avg. completion', value: '74%', trend: '+4%', hint: ar ? 'الفصل أ' : 'Class A', icon: TrendingUp },
            { label: ar ? 'واجبات مفتوحة' : 'Open work', value: '6', hint: ar ? 'تسليمات' : 'submissions', icon: FileCheck2 },
          ]
        : [
            { label: ar ? 'المؤسسات' : 'Institutions', value: '12', hint: ar ? 'مدرسة' : 'schools', icon: Building2 },
            { label: ar ? 'المستخدمون النشطون' : 'Active users', value: '2,480', trend: '+18%', hint: ar ? '٣٠ يومًا' : '30 days', icon: Users },
            { label: ar ? 'جلسات المعامل' : 'Lab sessions', value: '18.4k', trend: '+9%', hint: ar ? 'هذا الشهر' : 'this month', icon: FlaskConical },
            { label: ar ? 'جهوزية النظام' : 'Uptime', value: '99.98%', hint: ar ? 'آخر ٩٠ يومًا' : 'last 90 days', icon: Activity },
          ];

  const roleMessage =
    role === 'teacher'
      ? ar
        ? 'لديك ٦ واجبات بانتظار المراجعة، وفصلان بدآ وحدة الكيمياء العضوية هذا الأسبوع.'
        : 'Six assignments are waiting for review, and two classes started the organic chemistry unit this week.'
      : role === 'admin'
        ? ar
          ? 'استخدام المنصة ارتفع ١٨٪ خلال ٣٠ يومًا، مع ١٢ مدرسة متصلة.'
          : 'Platform usage is up 18% over 30 days, with 12 schools connected.'
        : ar
          ? 'أكملت ٣ دروس هذا الأسبوع. الدرس التالي يفتح معمل الكيمياء مباشرة.'
          : 'You completed 3 lessons this week. The next lesson opens the chemistry lab directly.';

  return (
    <div>
      <PageHeader
        eyebrow={new Intl.DateTimeFormat(ar ? 'ar-EG' : 'en-GB', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        }).format(new Date())}
        title={`${greeting}, ${firstName}.`}
        subtitle={roleMessage}
        actions={
          <>
            <Link to="/app/curriculum" className="sn-btn sn-btn-ghost">
              <BookOpen size={15} strokeWidth={1.8} />
              {ar ? 'المسار الدراسي' : 'Curriculum path'}
            </Link>
            <Link to="/app/labs" className="sn-btn sn-btn-primary">
              <Play size={15} strokeWidth={1.8} />
              {ar ? 'افتح معملًا' : 'Open a lab'}
            </Link>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        {/* Continue / role focus */}
        <div className="relative overflow-hidden rounded-[24px] bg-[#0a0a0a] p-6 text-white md:p-7">
          <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:44px_44px]" />
          <div className="relative">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/55">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
                {role === 'student' ? (ar ? 'الدرس التالي' : 'Up next') : ar ? 'ملخص اليوم' : 'Today'}
              </span>
              <span className="font-mono text-[10px] text-white/35">CH.03 · 42–47</span>
            </div>

            <h2 className="mt-5 max-w-[26ch] text-[22px] font-semibold leading-[1.25] tracking-[-0.03em] text-white md:text-[26px]">
              {role === 'student'
                ? ar
                  ? 'اختزال أكاسيد الفلزات بالهيدروجين'
                  : 'Hydrogen reduction of metal oxides'
                : role === 'teacher'
                  ? ar
                    ? 'الفصل ٢أ · وحدة الكيمياء العضوية'
                    : 'Class 2A · Organic chemistry unit'
                  : ar
                    ? 'تقرير استخدام المنصة · أكتوبر'
                    : 'Platform usage report · October'}
            </h2>

            <p className="mt-2 max-w-[52ch] text-[12px] leading-relaxed text-white/50">
              {role === 'student'
                ? ar
                  ? 'تجربة موجهة في معمل الكيمياء، مع تقييم أسبوعي من كراسة الوزارة.'
                  : 'A guided chemistry lab, followed by the Ministry weekly assessment.'
                : role === 'teacher'
                  ? ar
                    ? '٨٢٪ من الطلاب أكملوا التجربة الأولى. الواجب القادم يوم الخميس.'
                    : '82% completed the first experiment. Next assignment due Thursday.'
                  : ar
                    ? '١٢ مدرسة، ٢٬٤٨٠ مستخدمًا نشطًا، وأعلى استخدام في معمل التشريح.'
                    : '12 schools, 2,480 active users, highest usage in the anatomy lab.'}
            </p>

            <div className="mt-5 max-w-[320px]">
              <div className="mb-1.5 flex items-center justify-between text-[10px] text-white/45">
                <span>{ar ? 'التقدّم' : 'Progress'}</span>
                <span className="font-mono">{role === 'student' ? '72%' : '64%'}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-white" style={{ width: role === 'student' ? '72%' : '64%' }} />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() =>
                  role === 'student'
                    ? navigate('/app/labs/chemistry')
                    : role === 'teacher'
                      ? navigate('/app/classes')
                      : navigate('/app/analytics')
                }
                className="sn-btn bg-white text-[#0a0a0a] hover:bg-[#f0f0f0]"
              >
                {role === 'student' ? (ar ? 'افتح التجربة' : 'Open experiment') : role === 'teacher' ? (ar ? 'عرض الفصل' : 'View class') : ar ? 'عرض التحليلات' : 'View analytics'}
                <ArrowRight size={14} strokeWidth={1.8} className={ar ? 'rotate-180' : ''} />
              </button>
              <button
                type="button"
                onClick={() => navigate('/app/curriculum')}
                className="sn-btn border border-white/15 bg-transparent text-white hover:bg-white/10"
              >
                {ar ? 'كل الدروس' : 'All lessons'}
              </button>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <SectionCard
            title={ar ? 'هذا الأسبوع' : 'This week'}
            action={<span className="sn-badge sn-badge-soft">W42</span>}
            bodyClassName="p-5"
          >
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="sn-number text-[38px] font-semibold leading-none tracking-[-0.05em]">4.2</div>
                <div className="mt-1 text-[11px] text-[#737373]">{ar ? 'ساعات في المعامل' : 'hours in labs'}</div>
              </div>
              <div className="flex h-12 items-end gap-1.5">
                {[38, 62, 45, 78, 56, 88, 70].map((h, i) => (
                  <span
                    key={i}
                    className={`w-2 rounded-t-[2px] ${i === 5 ? 'bg-[#0a0a0a]' : 'bg-[#ececec]'}`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 border-t border-[#f0f0f0] pt-4">
              {[
                { v: '12', l: ar ? 'جلسات' : 'sessions' },
                { v: '3', l: ar ? 'معامل' : 'labs' },
                { v: '86%', l: ar ? 'إنجاز' : 'focus' },
              ].map((item) => (
                <div key={item.l}>
                  <div className="text-[16px] font-semibold tracking-[-0.03em]">{item.v}</div>
                  <div className="text-[10px] text-[#737373]">{item.l}</div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title={ar ? 'القادم' : 'Upcoming'}
            action={<CalendarDays size={14} strokeWidth={1.7} className="text-[#a3a3a3]" />}
            bodyClassName="p-3"
          >
            {[
              { t: ar ? 'تقييم الكيمياء الأسبوعي' : 'Chemistry weekly assessment', d: ar ? 'الخميس · ١٠:٠٠' : 'Thu · 10:00', icon: FileCheck2, tone: 'chemistry' },
              { t: ar ? 'جلسة تشريح مباشرة' : 'Live anatomy session', d: ar ? 'الأحد · ١٢:٣٠' : 'Sun · 12:30', icon: Activity, tone: 'anatomy' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.t} className="flex items-center gap-3 rounded-[10px] px-2 py-2 hover:bg-[#fafafa]">
                  <span className={`sn-${item.tone} sn-icon-tile !h-8 !w-8 !rounded-[8px]`}>
                    <Icon size={14} strokeWidth={1.7} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12px] font-medium">{item.t}</div>
                    <div className="text-[10px] text-[#737373]">{item.d}</div>
                  </div>
                </div>
              );
            })}
          </SectionCard>
        </div>
      </div>

      {/* Labs */}
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <div className="sn-eyebrow mb-1">{ar ? 'المعامل' : 'Laboratories'}</div>
          <h2 className="sn-h2">{ar ? 'اختر مساحة للاكتشاف' : 'Choose a room for discovery'}</h2>
        </div>
        <Link to="/app/labs" className="sn-link">
          {ar ? 'كل المعامل' : 'All labs'}
          <ArrowRight size={14} strokeWidth={1.8} className={ar ? 'rotate-180' : ''} />
        </Link>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {LAB_MODULES.map((lab) => {
          const Icon = ICONS[lab.id];
          return (
            <button
              key={lab.id}
              type="button"
              onClick={() => navigate(`/app/labs/${lab.id}`)}
              className={`sn-${lab.accent} sn-card sn-card-hover group flex items-center gap-3 p-4 text-start`}
            >
              <span className="sn-icon-tile">
                <Icon size={17} strokeWidth={1.6} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-[#0a0a0a]">{ar ? lab.nameAr : lab.nameEn}</span>
                <span className="block truncate text-[10px] text-[#737373]">{ar ? lab.categoryAr : lab.categoryEn}</span>
              </span>
              <ChevronRight
                size={15}
                strokeWidth={1.8}
                className={`shrink-0 text-[#a3a3a3] transition-transform group-hover:translate-x-0.5 ${ar ? 'rotate-180' : ''}`}
              />
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title={role === 'student' ? (ar ? 'آخر النشاط' : 'Recent activity') : ar ? 'أحدث التسليمات' : 'Recent submissions'}
          action={<span className="sn-badge sn-badge-outline">{ar ? 'اليوم' : 'Today'}</span>}
          bodyClassName="p-2"
        >
          {[
            { en: 'Completed “Metal oxide reduction” lab', ar: 'أكمل تجربة «اختزال أكاسيد الفلزات»', meta: ar ? 'كيمياء · ٤٢ دقيقة' : 'Chemistry · 42 min', icon: CheckCircle2, tone: 'text-[#047857]' },
            { en: 'Scored 90% on the weekly assessment', ar: 'حصل على ٩٠٪ في التقييم الأسبوعي', meta: ar ? 'تقييم · ١٠ دقائق' : 'Assessment · 10 min', icon: TrendingUp, tone: 'text-[#1d4ed8]' },
            { en: 'Isolated the nervous system in 3D', ar: 'عزل الجهاز العصبي في 3D', meta: ar ? 'تشريح · ١٨ دقيقة' : 'Anatomy · 18 min', icon: Activity, tone: 'text-[#be123c]' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.en} className="flex items-start gap-3 rounded-[10px] px-3 py-2.5 hover:bg-[#fafafa]">
                <Icon size={15} strokeWidth={1.8} className={`mt-0.5 shrink-0 ${item.tone}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] leading-snug text-[#171717]">{ar ? item.ar : item.en}</div>
                  <div className="mt-0.5 text-[10px] text-[#a3a3a3]">{item.meta}</div>
                </div>
              </div>
            );
          })}
        </SectionCard>

        <SectionCard
          title={ar ? 'إتقان المواد' : 'Subject mastery'}
          action={<span className="sn-badge sn-badge-soft">{ar ? 'هذا الفصل' : 'this term'}</span>}
        >
          <div className="space-y-3.5">
            {[
              { name: ar ? 'الكيمياء' : 'Chemistry', pct: 78, accent: 'chemistry' },
              { name: ar ? 'الفيزياء' : 'Physics', pct: 62, accent: 'physics' },
              { name: ar ? 'الأحياء' : 'Biology', pct: 54, accent: 'biology' },
              { name: ar ? 'التشريح' : 'Anatomy', pct: 41, accent: 'anatomy' },
              { name: ar ? 'الفلك' : 'Astronomy', pct: 29, accent: 'astronomy' },
            ].map((subject) => (
              <div key={subject.name} className={`sn-${subject.accent}`}>
                <div className="mb-1.5 flex items-center justify-between text-[11px]">
                  <span className="font-medium text-[#171717]">{subject.name}</span>
                  <span className="font-mono text-[#737373]">{subject.pct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#f0f0f0]">
                  <div className="h-full rounded-full sn-accent-line" style={{ width: `${subject.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default DashboardHome;
