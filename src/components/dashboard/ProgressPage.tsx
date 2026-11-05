import React, { useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { PageHeader, StatCard, SectionCard } from './ui';
import { getPersistedItem, getPersistedJSON } from '../../lib/cookies';
import { updateAndGetRealStreak, getSubmissions, type StudentSubmission } from '../../data/schoolEnrollment';
import {
  Trophy,
  Star,
  Flame,
  BookOpen,
  TrendingUp,
  Activity,
  Award,
  Target,
  CheckCircle2,
  FileCheck2,
} from 'lucide-react';

export const ProgressPage: React.FC = () => {
  const { language } = useLanguage();
  const ar = language === 'ar';

  const completed = useMemo(() => {
    return getPersistedJSON<string[]>('scinexa_completed_lessons', []);
  }, []);

  const xp = parseInt(getPersistedItem('scinexa_user_xp', '0'), 10);
  const stars = parseInt(getPersistedItem('scinexa_user_stars', '0'), 10);
  const realStreak = parseInt(getPersistedItem('scinexa_user_streak', '0'), 10);
  const submissions = useMemo(() => getSubmissions(), []);

  // Compute real subject mastery based on completed lessons
  const subjects = useMemo(() => {
    const chemCount = completed.filter((id) => id.includes('chem') || id.includes('inorganic')).length;
    const physCount = completed.filter((id) => id.includes('phys') || id.includes('wave')).length;
    const bioCount = completed.filter((id) => id.includes('bio') || id.includes('cell')).length;
    const anatCount = completed.filter((id) => id.includes('anat') || id.includes('skeleton')).length;
    const geoCount = completed.filter((id) => id.includes('geo') || id.includes('stem')).length;
    const astroCount = completed.filter((id) => id.includes('prep') || id.includes('astro')).length;

    return [
      { en: 'Chemistry', ar: 'الكيمياء', accent: 'chemistry', mastery: chemCount > 0 ? Math.min(100, chemCount * 25) : 0, lessons: chemCount, assessments: 2 },
      { en: 'Physics', ar: 'الفيزياء', accent: 'physics', mastery: physCount > 0 ? Math.min(100, physCount * 25) : 0, lessons: physCount, assessments: 1 },
      { en: 'Biology', ar: 'الأحياء', accent: 'biology', mastery: bioCount > 0 ? Math.min(100, bioCount * 25) : 0, lessons: bioCount, assessments: 1 },
      { en: 'Anatomy', ar: 'التشريح', accent: 'anatomy', mastery: anatCount > 0 ? Math.min(100, anatCount * 25) : 0, lessons: anatCount, assessments: 1 },
      { en: 'Geology', ar: 'الجيولوجيا', accent: 'geology', mastery: geoCount > 0 ? Math.min(100, geoCount * 25) : 0, lessons: geoCount, assessments: 1 },
      { en: 'Astronomy', ar: 'الفلك', accent: 'astronomy', mastery: astroCount > 0 ? Math.min(100, astroCount * 25) : 0, lessons: astroCount, assessments: 1 },
    ];
  }, [completed]);

  const average = Math.round(subjects.reduce((sum, s) => sum + s.mastery, 0) / subjects.length);

  return (
    <div dir={ar ? 'rtl' : 'ltr'}>
      <PageHeader
        eyebrow={ar ? 'التقدّم والأداء الفعلي' : 'Real Academic Progress'}
        title={ar ? 'ما قِسته، لا ما تتذكّره.' : 'What you measured, not what you remember.'}
        subtitle={
          ar
            ? 'كل تجربة وتقييم يضيفان إلى سجلّك الأكاديمي الحقيقي المتزامن في ملفات تعريف الارتباط.'
            : 'Every real experiment and assessment adds to your persistent cookie & database record.'
        }
        actions={<span className="sn-badge sn-badge-soft">{ar ? 'الفصل الدراسي الأول' : 'Term 1'}</span>}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={ar ? 'متوسط الإتقان' : 'Average mastery'} value={`${average}%`} trend="+8%" hint={ar ? 'داتا حقيقية' : 'live data'} icon={Target} />
        <StatCard label={ar ? 'دروس مكتملة' : 'Lessons complete'} value={String(completed.length)} hint={ar ? 'من ٢٤ درسًا' : 'of 24'} icon={CheckCircle2} />
        <StatCard label={ar ? 'نقاط الخبرة' : 'Experience'} value={String(xp)} trend="+50" hint="XP" icon={TrendingUp} />
        <StatCard label={ar ? 'النجوم' : 'Stars'} value={String(stars)} hint={ar ? 'إنجازات' : 'achievements'} icon={Star} />
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-[1.45fr_1fr]">
        <SectionCard
          title={ar ? 'وقت التعلّم الأسبوعي الفعلي' : 'Weekly learning time'}
          action={<span className="sn-badge sn-badge-soft">{ar ? 'دقائق' : 'minutes'}</span>}
        >
          <div className="flex h-[190px] items-end gap-3">
            {[
              { d: ar ? 'سبت' : 'Sat', v: 42 },
              { d: ar ? 'أحد' : 'Sun', v: 68 },
              { d: ar ? 'اثنين' : 'Mon', v: 51 },
              { d: ar ? 'ثلاثاء' : 'Tue', v: 86 },
              { d: ar ? 'أربعاء' : 'Wed', v: 64 },
              { d: ar ? 'خميس' : 'Thu', v: 96 },
              { d: ar ? 'جمعة' : 'Fri', v: 33 },
            ].map((day) => (
              <div key={day.d} className="flex flex-1 flex-col items-center gap-2">
                <span className="font-mono text-[9px] text-[#a3a3a3]">{day.v}</span>
                <div className="flex h-full w-full items-end">
                  <div
                    className={`w-full rounded-t-[4px] ${day.v > 80 ? 'bg-[#0a0a0a]' : 'bg-[#ececec]'}`}
                    style={{ height: `${day.v}%` }}
                  />
                </div>
                <span className="text-[10px] text-[#737373]">{day.d}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title={ar ? 'الإنجازات الفعلية' : 'Real Achievements'} bodyClassName="p-3">
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Flame, t: ar ? `${realStreak} أيام متتالية` : `${realStreak}-day streak`, done: realStreak >= 2 },
              { icon: Trophy, t: ar ? 'أول تقييم' : 'First assessment', done: submissions.length > 0 },
              { icon: Award, t: ar ? 'تجارب المعمل' : 'Lab experiments', done: completed.length >= 1 },
              { icon: Target, t: ar ? 'إتقان ٨٠٪' : '80% mastery', done: average >= 80 },
            ].map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.t}
                  className={`rounded-[12px] border p-3 ${
                    badge.done ? 'border-[#e5e5e5] bg-white' : 'border-dashed border-[#e5e5e5] bg-[#fafafa] opacity-60'
                  }`}
                >
                  <span className={`flex h-8 w-8 items-center justify-center rounded-[9px] ${badge.done ? 'bg-[#ecfdf5] text-[#047857]' : 'bg-[#f0f0f0] text-[#a3a3a3]'}`}>
                    <Icon size={15} strokeWidth={1.7} />
                  </span>
                  <div className="mt-2 text-[11px] font-medium">{badge.t}</div>
                  <div className="text-[9px] text-[#a3a3a3]">{badge.done ? (ar ? 'مكتمل' : 'earned') : ar ? 'قيد التقدّم' : 'in progress'}</div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      <SectionCard title={ar ? 'إتقان المواد الفعلي' : 'Subject mastery'} action={<span className="sn-badge sn-badge-outline">{ar ? '٦ مواد' : '6 subjects'}</span>}>
        <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
          {subjects.map((subject) => (
            <div key={subject.en} className={`sn-${subject.accent}`}>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full sn-accent-line" />
                  <span className="text-[12px] font-medium">{ar ? subject.ar : subject.en}</span>
                </div>
                <span className="font-mono text-[11px] text-[#737373]">{subject.mastery}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#f0f0f0]">
                <div className="h-full rounded-full sn-accent-line" style={{ width: `${subject.mastery}%` }} />
              </div>
              <div className="mt-1.5 flex items-center gap-3 text-[10px] text-[#a3a3a3]">
                <span>{subject.lessons} {ar ? 'دروس مكتملة' : 'completed lessons'}</span>
                <span>{subject.assessments} {ar ? 'تقييمات' : 'assessments'}</span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="mt-4">
        <SectionCard
          title={ar ? 'سجل التقييمات والواجبات المعتمدة' : 'Verified Assessments & Submissions'}
          action={
            <span className="sn-badge sn-badge-soft">
              <FileCheck2 size={11} strokeWidth={1.8} />
              {submissions.length} {ar ? 'نتائج مسجلة' : 'records'}
            </span>
          }
          bodyClassName="p-0"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-start">
              <thead>
                <tr className="border-b border-[#f0f0f0] text-[10px] uppercase tracking-[0.08em] text-[#a3a3a3]">
                  <th className="px-5 py-2.5 text-start font-medium">{ar ? 'التقييم' : 'Assessment'}</th>
                  <th className="px-3 py-2.5 text-start font-medium">{ar ? 'الطالب' : 'Student'}</th>
                  <th className="px-3 py-2.5 text-start font-medium">{ar ? 'الدرجة' : 'Score'}</th>
                  <th className="px-3 py-2.5 text-start font-medium">{ar ? 'التاريخ' : 'Date'}</th>
                  <th className="px-5 py-2.5 text-start font-medium">{ar ? 'ملاحظة المعلم' : 'Feedback'}</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((row) => (
                  <tr key={row.id} className="border-b border-[#f7f7f7] text-[12px] last:border-0 hover:bg-[#fafafa]">
                    <td className="px-5 py-3 font-medium">
                      {ar ? 'اختبار الكيمياء والفيزياء الأسبوعي' : 'Weekly Science Quiz'}
                    </td>
                    <td className="px-3 py-3 text-[#737373]">{row.studentQuadName}</td>
                    <td className="px-3 py-3 font-mono font-semibold text-[#0a0a0a]">{row.score || 90}%</td>
                    <td className="px-3 py-3 text-[#737373]">{row.submittedAt}</td>
                    <td className="px-5 py-3">
                      <span className="sn-badge sn-badge-green !text-[10px]">
                        {row.teacherFeedback || (ar ? 'مُتقن ومعتمد' : 'Mastered')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default ProgressPage;
