import React, { useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { PageHeader, StatCard, SectionCard, ProgressBar } from './ui';
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

const readCompleted = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem('scinexa_completed_lessons') || '["sec2-lesson-1"]');
  } catch {
    return ['sec2-lesson-1'];
  }
};

const SUBJECTS = [
  { en: 'Chemistry', ar: 'الكيمياء', accent: 'chemistry', mastery: 78, lessons: 8, assessments: 6 },
  { en: 'Physics', ar: 'الفيزياء', accent: 'physics', mastery: 62, lessons: 6, assessments: 4 },
  { en: 'Biology', ar: 'الأحياء', accent: 'biology', mastery: 54, lessons: 5, assessments: 3 },
  { en: 'Anatomy', ar: 'التشريح', accent: 'anatomy', mastery: 41, lessons: 4, assessments: 2 },
  { en: 'Geology', ar: 'الجيولوجيا', accent: 'geology', mastery: 36, lessons: 3, assessments: 1 },
  { en: 'Astronomy', ar: 'الفلك', accent: 'astronomy', mastery: 29, lessons: 2, assessments: 1 },
];

export const ProgressPage: React.FC = () => {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const completed = useMemo(readCompleted, []);
  const xp = Number(localStorage.getItem('scinexa_user_xp') || 450);
  const stars = Number(localStorage.getItem('scinexa_user_stars') || 6);

  const average = Math.round(SUBJECTS.reduce((sum, s) => sum + s.mastery, 0) / SUBJECTS.length);

  return (
    <div>
      <PageHeader
        eyebrow={ar ? 'التقدّم' : 'Progress'}
        title={ar ? 'ما قِسته، لا ما تتذكّره.' : 'What you measured, not what you remember.'}
        subtitle={
          ar
            ? 'كل تجربة وتقييم يضيفان إلى سجلّك. هذه صورة دقيقة لآخر ٤٥ يومًا.'
            : 'Every experiment and assessment adds to your record. This is a precise picture of the last 45 days.'
        }
        actions={<span className="sn-badge sn-badge-soft">{ar ? 'الفصل الدراسي الأول' : 'Term 1'}</span>}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={ar ? 'متوسط الإتقان' : 'Average mastery'} value={`${average}%`} trend="+8%" hint={ar ? 'آخر ٤٥ يومًا' : 'last 45 days'} icon={Target} />
        <StatCard label={ar ? 'دروس مكتملة' : 'Lessons complete'} value={String(completed.length + 11)} hint={ar ? 'من ٢٨' : 'of 28'} icon={CheckCircle2} />
        <StatCard label={ar ? 'نقاط الخبرة' : 'Experience'} value={String(xp)} trend="+50" hint="XP" icon={TrendingUp} />
        <StatCard label={ar ? 'النجوم' : 'Stars'} value={String(stars)} hint={ar ? 'إنجازات' : 'achievements'} icon={Star} />
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-[1.45fr_1fr]">
        <SectionCard
          title={ar ? 'وقت التعلّم الأسبوعي' : 'Weekly learning time'}
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

        <SectionCard title={ar ? 'الإنجازات' : 'Achievements'} bodyClassName="p-3">
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Flame, t: ar ? '٣ أيام متتالية' : '3-day streak', done: true },
              { icon: Trophy, t: ar ? 'أول تقييم' : 'First assessment', done: true },
              { icon: Award, t: ar ? '٥ تجارب' : '5 experiments', done: true },
              { icon: Target, t: ar ? 'إتقان ٨٠٪' : '80% mastery', done: false },
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

      <SectionCard title={ar ? 'إتقان المواد' : 'Subject mastery'} action={<span className="sn-badge sn-badge-outline">{ar ? '٦ مواد' : '6 subjects'}</span>}>
        <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
          {SUBJECTS.map((subject) => (
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
                <span>{subject.lessons} {ar ? 'دروس' : 'lessons'}</span>
                <span>{subject.assessments} {ar ? 'تقييمات' : 'assessments'}</span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="mt-4">
        <SectionCard
          title={ar ? 'آخر التقييمات' : 'Recent assessments'}
          action={
            <span className="sn-badge sn-badge-soft">
              <FileCheck2 size={11} strokeWidth={1.8} />
              {ar ? '٤ نتائج' : '4 results'}
            </span>
          }
          bodyClassName="p-0"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-start">
              <thead>
                <tr className="border-b border-[#f0f0f0] text-[10px] uppercase tracking-[0.08em] text-[#a3a3a3]">
                  <th className="px-5 py-2.5 text-start font-medium">{ar ? 'التقييم' : 'Assessment'}</th>
                  <th className="px-3 py-2.5 text-start font-medium">{ar ? 'المادة' : 'Subject'}</th>
                  <th className="px-3 py-2.5 text-start font-medium">{ar ? 'الدرجة' : 'Score'}</th>
                  <th className="px-3 py-2.5 text-start font-medium">{ar ? 'التاريخ' : 'Date'}</th>
                  <th className="px-5 py-2.5 text-start font-medium">{ar ? 'الحالة' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { t: ar ? 'تقييم الأسبوع الأول' : 'Week 1 assessment', s: ar ? 'كيمياء' : 'Chemistry', score: 90, date: ar ? '١٢ أكتوبر' : '12 Oct' },
                  { t: ar ? 'اختبار الحركة' : 'Motion quiz', s: ar ? 'فيزياء' : 'Physics', score: 85, date: ar ? '٥ أكتوبر' : '5 Oct' },
                  { t: ar ? 'الخلية والوراثة' : 'Cell & genetics', s: ar ? 'أحياء' : 'Biology', score: 76, date: ar ? '٢٨ سبتمبر' : '28 Sep' },
                  { t: ar ? 'الجهاز العصبي' : 'Nervous system', s: ar ? 'تشريح' : 'Anatomy', score: 68, date: ar ? '٢١ سبتمبر' : '21 Sep' },
                ].map((row) => (
                  <tr key={row.t} className="border-b border-[#f7f7f7] text-[12px] last:border-0 hover:bg-[#fafafa]">
                    <td className="px-5 py-3 font-medium">{row.t}</td>
                    <td className="px-3 py-3 text-[#737373]">{row.s}</td>
                    <td className="px-3 py-3 font-mono">{row.score}%</td>
                    <td className="px-3 py-3 text-[#737373]">{row.date}</td>
                    <td className="px-5 py-3">
                      <span className={`sn-badge ${row.score >= 70 ? 'sn-badge-green' : 'sn-badge-amber'} !text-[10px]`}>
                        {row.score >= 70 ? (ar ? 'مُتقن' : 'Mastered') : ar ? 'يحتاج مراجعة' : 'Review'}
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
