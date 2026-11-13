import React, { useMemo, useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSession } from '../../context/SessionContext';
import { PageHeader, StatCard, SectionCard } from './ui';
import { getPersistedItem, getPersistedJSON } from '../../lib/cookies';
import { getWeeklyLabMinutes } from '../../lib/labTracker';
import { ALL_CURRICULUM_PATHWAYS } from '../../data/curriculumData';
import {
  getSubmissions,
  getAssignments,
  fetchAndSyncSubmissions,
  fetchAndSyncAssignments,
  namesMatch,
  type StudentSubmission,
  type AssignmentItem,
} from '../../data/schoolEnrollment';
import {
  Trophy,
  Star,
  Flame,
  TrendingUp,
  Award,
  Target,
  CheckCircle2,
  FileCheck2,
} from 'lucide-react';

const AR_WEEKDAYS = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
const EN_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const ProgressPage: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useSession();
  const ar = language === 'ar';

  const completed = useMemo(() => {
    return getPersistedJSON<string[]>('scinexa_completed_lessons', []);
  }, []);

  const xp = parseInt(getPersistedItem('scinexa_user_xp', '0'), 10);
  const stars = parseInt(getPersistedItem('scinexa_user_stars', '0'), 10);
  const realStreak = parseInt(getPersistedItem('scinexa_user_streak', '0'), 10);
  const studentQuadName = getPersistedItem('scinexa_user_fullname', '').trim();

  const [submissions, setSubmissions] = useState<StudentSubmission[]>(() => getSubmissions());
  const [assignments, setAssignments] = useState<AssignmentItem[]>(() => getAssignments());

  useEffect(() => {
    const syncAll = async () => {
      const [remoteSubs, remoteAssigns] = await Promise.all([
        fetchAndSyncSubmissions(),
        fetchAndSyncAssignments(),
      ]);
      if (remoteSubs) setSubmissions(remoteSubs);
      if (remoteAssigns) setAssignments(remoteAssigns);
    };
    void syncAll();
  }, []);

  const mySubmissions = useMemo(() => {
    const identity = studentQuadName || user?.name || user?.email || '';
    if (!identity) return submissions;
    const mine = submissions.filter(
      (s) =>
        namesMatch(s.studentQuadName, studentQuadName) ||
        namesMatch(s.studentQuadName, user?.name) ||
        namesMatch(s.studentQuadName, user?.email)
    );
    return mine.length > 0 ? mine : [];
  }, [submissions, studentQuadName, user?.name, user?.email]);

  const allLessons = useMemo(() => ALL_CURRICULUM_PATHWAYS.flatMap((p) => p.lessons), []);

  const lessonById = useMemo(() => {
    const map = new Map<string, (typeof allLessons)[number]>();
    allLessons.forEach((l) => map.set(l.id, l));
    return map;
  }, [allLessons]);

  const assignmentById = useMemo(() => {
    const map = new Map<string, AssignmentItem>();
    assignments.forEach((a) => map.set(a.id, a));
    return map;
  }, [assignments]);

  const weeklyMinutes = useMemo(() => {
    const rows = getWeeklyLabMinutes();
    const maxMin = Math.max(1, ...rows.map((r) => r.minutes));
    return rows.map((r) => ({
      ...r,
      label: ar ? AR_WEEKDAYS[r.dayIndex] : EN_WEEKDAYS[r.dayIndex],
      heightPct: r.minutes > 0 ? Math.max(8, Math.round((r.minutes / maxMin) * 100)) : 0,
    }));
  }, [ar]);

  // Compute real subject mastery strictly from curriculum lessons + completed lessons + graded submissions
  const subjects = useMemo(() => {
    const defs = [
      { key: 'chemistry', en: 'Chemistry', ar: 'الكيمياء', accent: 'chemistry' },
      { key: 'physics', en: 'Physics', ar: 'الفيزياء', accent: 'physics' },
      { key: 'biology', en: 'Biology', ar: 'الأحياء', accent: 'biology' },
      { key: 'anatomy', en: 'Anatomy', ar: 'التشريح', accent: 'anatomy' },
      { key: 'geology', en: 'Geology', ar: 'الجيولوجيا', accent: 'geology' },
      { key: 'astronomy', en: 'Astronomy', ar: 'الفلك', accent: 'astronomy' },
    ] as const;

    return defs.map((def) => {
      const subjectLessons = allLessons.filter((l) => l.linkedLabTab === def.key);
      const doneCount = subjectLessons.filter((l) => completed.includes(l.id)).length;
      const subjectSubs = mySubmissions.filter((s) => {
        const lesson = lessonById.get(s.assignmentId);
        if (lesson) return lesson.linkedLabTab === def.key;
        const assign = assignmentById.get(s.assignmentId);
        if (assign) return assign.linkedLab === def.key;
        return false;
      });
      const lessonPct =
        subjectLessons.length > 0 ? Math.round((doneCount / subjectLessons.length) * 100) : 0;
      const gradedSubs = subjectSubs.filter((s) => typeof s.score === 'number');
      const avgSubScore =
        gradedSubs.length > 0
          ? Math.round(gradedSubs.reduce((sum, s) => sum + (s.score || 0), 0) / gradedSubs.length)
          : 0;
      const mastery = doneCount > 0 || gradedSubs.length > 0
        ? Math.min(100, Math.round((lessonPct + (gradedSubs.length > 0 ? avgSubScore : lessonPct)) / 2))
        : 0;

      return {
        en: def.en,
        ar: def.ar,
        accent: def.accent,
        mastery,
        lessons: doneCount,
        assessments: subjectSubs.length,
      };
    });
  }, [allLessons, completed, mySubmissions, lessonById, assignmentById]);

  const activeSubjects = subjects.filter((s) => s.lessons > 0 || s.assessments > 0);
  const average = activeSubjects.length > 0
    ? Math.round(activeSubjects.reduce((sum, s) => sum + s.mastery, 0) / activeSubjects.length)
    : 0;

  return (
    <div dir={ar ? 'rtl' : 'ltr'}>
      <PageHeader
        eyebrow={ar ? 'التقدّم والأداء الفعلي' : 'Real Academic Progress'}
        title={ar ? 'ما قِسته، لا ما تتذكّره.' : 'What you measured, not what you remember.'}
        subtitle={
          ar
            ? 'كل تجربة وتقييم يضيفان إلى سجلّك الأكاديمي الحقيقي المتزامن مع قاعدة البيانات.'
            : 'Every real experiment and assessment adds to your persistent database & session record.'
        }
        actions={<span className="sn-badge sn-badge-soft">{ar ? 'الفصل الدراسي الفعلي' : 'Live Term'}</span>}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={ar ? 'متوسط الإتقان' : 'Average mastery'} value={`${average}%`} hint={ar ? 'بيانات فعلية' : 'live data'} icon={Target} />
        <StatCard label={ar ? 'دروس مكتملة' : 'Lessons complete'} value={String(completed.length)} hint={ar ? `من ${allLessons.length} درسًا` : `of ${allLessons.length}`} icon={CheckCircle2} />
        <StatCard label={ar ? 'نقاط الخبرة' : 'Experience'} value={String(xp)} hint="XP" icon={TrendingUp} />
        <StatCard label={ar ? 'النجوم' : 'Stars'} value={String(stars)} hint={ar ? 'إنجازات' : 'achievements'} icon={Star} />
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-[1.45fr_1fr]">
        <SectionCard
          title={ar ? 'وقت التعلّم الأسبوعي الفعلي' : 'Weekly learning time'}
          action={<span className="sn-badge sn-badge-soft">{ar ? 'دقائق' : 'minutes'}</span>}
        >
          <div className="flex h-[190px] items-end gap-3">
            {weeklyMinutes.map((day) => (
              <div key={day.isoDate} className="flex flex-1 flex-col items-center gap-2">
                <span className="font-mono text-[9px] text-[#a3a3a3]">{day.minutes}</span>
                <div className="flex h-full w-full items-end">
                  <div
                    className={`w-full rounded-t-[4px] ${day.minutes > 0 ? 'bg-[#0a0a0a]' : 'bg-[#ececec]'}`}
                    style={{ height: `${Math.max(4, day.heightPct)}%` }}
                  />
                </div>
                <span className="text-[10px] text-[#737373]">{day.label}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title={ar ? 'الإنجازات الفعلية' : 'Real Achievements'} bodyClassName="p-3">
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Flame, t: ar ? `${realStreak} أيام متتالية` : `${realStreak}-day streak`, done: realStreak >= 2 },
              { icon: Trophy, t: ar ? 'أول تقييم' : 'First assessment', done: mySubmissions.length > 0 },
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

      <SectionCard title={ar ? 'إتقان المواد الفعلي' : 'Subject mastery'} action={<span className="sn-badge sn-badge-outline">{ar ? `${subjects.length} مواد` : `${subjects.length} subjects`}</span>}>
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
              {mySubmissions.length} {ar ? 'نتائج مسجلة' : 'records'}
            </span>
          }
          bodyClassName="p-0"
        >
          {mySubmissions.length === 0 ? (
            <div className="p-8 text-center text-[12px] text-[#737373]">
              {ar
                ? 'لم تقم بتسليم أي تقييمات أو تكليفات بعد. أتمّ أي درس من المنهج أو سلّم واجباً من لوحتك.'
                : 'No assessment submissions recorded yet. Complete a curriculum quiz or submit a class assignment.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-start">
                <thead>
                  <tr className="border-b border-[#f0f0f0] text-[10px] uppercase tracking-[0.08em] text-[#a3a3a3]">
                    <th className="px-5 py-2.5 text-start font-medium">{ar ? 'التقييم' : 'Assessment'}</th>
                    <th className="px-3 py-2.5 text-start font-medium">{ar ? 'الطالب' : 'Student'}</th>
                    <th className="px-3 py-2.5 text-start font-medium">{ar ? 'الدرجة' : 'Score'}</th>
                    <th className="px-3 py-2.5 text-start font-medium">{ar ? 'التاريخ' : 'Date'}</th>
                    <th className="px-5 py-2.5 text-start font-medium">{ar ? 'الحالة والملاحظة' : 'Status / Feedback'}</th>
                  </tr>
                </thead>
                <tbody>
                  {mySubmissions.map((row) => {
                    const lessonMatch = lessonById.get(row.assignmentId);
                    const assignMatch = assignmentById.get(row.assignmentId);
                    const assessmentTitle = lessonMatch
                      ? ar
                        ? lessonMatch.weeklyAssessment.titleAr
                        : lessonMatch.weeklyAssessment.titleEn
                      : assignMatch
                        ? ar
                          ? assignMatch.titleAr
                          : assignMatch.titleEn
                        : row.assignmentId;
                    return (
                      <tr key={row.id} className="border-b border-[#f7f7f7] text-[12px] last:border-0 hover:bg-[#fafafa]">
                        <td className="px-5 py-3 font-medium">{assessmentTitle}</td>
                        <td className="px-3 py-3 text-[#737373]">{row.studentQuadName}</td>
                        <td className="px-3 py-3 font-mono font-semibold text-[#0a0a0a]">
                          {typeof row.score === 'number'
                            ? `${row.score}%`
                            : ar
                              ? 'قيد التقييم'
                              : 'Pending'}
                        </td>
                        <td className="px-3 py-3 text-[#737373]">{row.submittedAt}</td>
                        <td className="px-5 py-3">
                          <span className={`sn-badge !text-[10px] ${row.status === 'graded' ? 'sn-badge-green' : 'sn-badge-soft'}`}>
                            {row.teacherFeedback || (row.status === 'graded' ? (ar ? 'تم الرصد' : 'Graded') : (ar ? 'بانتظار المعلم' : 'Awaiting Review'))}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
};

export default ProgressPage;
