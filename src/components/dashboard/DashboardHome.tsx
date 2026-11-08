import { getPersistedItem, getPersistedJSON, setPersistedItem, setPersistedJSON } from '../../lib/cookies';
import {
  checkStudentLink,
  calculateStudentLevel,
  getEnrolledStudents,
  getAssignments,
  fetchAndSyncEnrollment,
  fetchAndSyncAssignments,
  type EnrolledStudent,
  type AssignmentItem,
} from '../../data/schoolEnrollment';
import {
  dbFetchClasses,
  dbFetchAllProfiles,
  dbFetchInstitutions,
  type DbClass,
  type DbProfile,
  type DbInstitution,
} from '../../lib/supabase';
import { AlertCircle, UserCheck } from 'lucide-react';
import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useSession } from '../../context/SessionContext';
import { LAB_MODULES } from '../../data/labs';
import { PageHeader, StatCard, SectionCard } from './ui';
import {
  Activity,
  Atom,
  FlaskConical,
  Dna,
  Globe2,
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Users,
  GraduationCap,
  Building2,
  Play,
  CalendarDays,
  FileCheck2,
  ChevronRight,
  Compass,
  Presentation,
  MessageSquareText,
} from 'lucide-react';

const ICONS: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  anatomy: Activity,
  physics: Atom,
  chemistry: FlaskConical,
  biology: Dna,
  geology: Globe2,
  astronomy: Sparkles,
};

export const DashboardHome: React.FC = () => {
  const { language } = useLanguage();
  const { user, role } = useSession();
  const navigate = useNavigate();
  const ar = language === 'ar';

  // Reactive state for profile, grade, and gamification
  const [studentQuadName, setStudentQuadName] = useState(() => getPersistedItem('scinexa_user_fullname') || user?.name || '');
  const [savedGrade, setSavedGrade] = useState(() => getPersistedItem('scinexa_grade', 'sec2'));

  const [completed, setCompleted] = useState<string[]>(() => {
    const list = getPersistedJSON<string[]>('scinexa_completed_lessons', []);
    const rawXp = parseInt(getPersistedItem('scinexa_user_xp', '0'), 10);
    // Auto purge stale legacy test artifact (exact 5 lessons & 660 XP)
    if (rawXp === 660 && list.length === 5) {
      setPersistedJSON('scinexa_completed_lessons', []);
      setPersistedItem('scinexa_user_xp', '0');
      setPersistedItem('scinexa_user_streak', '0');
      return [];
    }
    return list;
  });

  const [xp, setXp] = useState<number>(() => {
    const rawXp = parseInt(getPersistedItem('scinexa_user_xp', '0'), 10);
    return rawXp === 660 ? 0 : rawXp;
  });

  const [realStreak, setRealStreak] = useState<number>(() => {
    return parseInt(getPersistedItem('scinexa_user_streak', '0'), 10);
  });

  useEffect(() => {
    const handleSync = () => {
      setStudentQuadName(getPersistedItem('scinexa_user_fullname') || user?.name || '');
      setSavedGrade(getPersistedItem('scinexa_grade', 'sec2'));
      const currentCompleted = getPersistedJSON<string[]>('scinexa_completed_lessons', []);
      const currentXp = parseInt(getPersistedItem('scinexa_user_xp', '0'), 10);
      setCompleted(currentCompleted);
      setXp(currentXp === 660 ? 0 : currentXp);
      setRealStreak(parseInt(getPersistedItem('scinexa_user_streak', '0'), 10));
    };
    window.addEventListener('scinexa_profile_updated', handleSync);
    window.addEventListener('scinexa_progress_reset', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('scinexa_profile_updated', handleSync);
      window.removeEventListener('scinexa_progress_reset', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [user]);

  const isResearcher = savedGrade === 'university' || savedGrade === 'researcher';

  // Real Enrollment & Streak
  const linkedStudent = useMemo(
    () => (isResearcher ? null : checkStudentLink(studentQuadName, user?.email)),
    [studentQuadName, user, isResearcher]
  );

  const progressPercent = completed.length > 0 ? Math.min(100, Math.round((completed.length / 24) * 100)) : 0;
  const levelInfo = useMemo(() => calculateStudentLevel(xp), [xp]);

  // Real Supabase state
  const [classes, setClasses] = useState<DbClass[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>(() => getEnrolledStudents());
  const [assignments, setAssignments] = useState<AssignmentItem[]>(() => getAssignments());
  const [profiles, setProfiles] = useState<DbProfile[]>([]);
  const [institutions, setInstitutions] = useState<DbInstitution[]>([]);

  useEffect(() => {
    const loadRealData = async () => {
      const [fetchedClasses, fetchedStudents, fetchedAssignments, fetchedProfiles, fetchedInst] = await Promise.all([
        dbFetchClasses(),
        fetchAndSyncEnrollment(),
        fetchAndSyncAssignments(),
        dbFetchAllProfiles(),
        dbFetchInstitutions(),
      ]);
      setClasses(fetchedClasses || []);
      if (fetchedStudents) setEnrolledStudents(fetchedStudents);
      if (fetchedAssignments) setAssignments(fetchedAssignments);
      setProfiles(fetchedProfiles || []);
      setInstitutions(fetchedInst || []);
    };
    void loadRealData();
  }, []);

  const classesCount = classes.length;
  const studentsCount = enrolledStudents.length;
  const avgMastery = studentsCount > 0
    ? Math.round(enrolledStudents.reduce((acc, s) => acc + (s.mastery || 0), 0) / studentsCount)
    : 0;
  const openAssignments = assignments.length;
  const institutionsCount = institutions.length;
  const profilesCount = profiles.length;

  // Use the student's real quad name instead of Google username ("Simone")
  const effectiveFirstName = studentQuadName
    ? studentQuadName.trim().split(/\s+/).slice(0, 2).join(' ')
    : (user?.name?.trim().split(/\s+/)[0] || (ar ? 'الباحث' : 'Scholar'));

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
    isResearcher
      ? [
          { label: ar ? 'المعامل التخصصية' : 'Specialist Labs', value: '6', hint: ar ? 'معامل 3D متقدمة' : '3D active labs', icon: FlaskConical },
          { label: ar ? 'جلسات المحاكاة' : 'Simulations', value: String(completed.length), hint: ar ? 'تجارب مستكشفة' : 'lab sessions', icon: Sparkles },
          { label: ar ? 'نقاط البحث العلمي' : 'Research XP', value: String(xp), hint: 'XP', icon: TrendingUp },
          { label: ar ? 'ساعات الاستكشاف' : 'Research Hours', value: `${(completed.length * 0.5).toFixed(1)}h`, hint: ar ? 'وقت معملي' : 'in laboratory', icon: Activity },
        ]
      : role === 'student'
        ? [
            { label: ar ? 'تقدّم المنهج' : 'Curriculum', value: `${progressPercent}%`, trend: '+0%', hint: ar ? 'إنجاز فعلي' : 'real progress', icon: BookOpen },
            { label: ar ? 'دروس مكتملة' : 'Lessons', value: String(completed.length), hint: ar ? 'من ٢٤ درسًا' : 'of 24', icon: CheckCircle2 },
            { label: ar ? 'نقاط الخبرة' : 'Experience', value: String(xp), hint: 'XP', icon: TrendingUp },
            { label: ar ? 'أيام متتالية' : 'Streak', value: String(realStreak), hint: ar ? 'أيام متواصلة' : 'consecutive days', icon: Activity },
          ]
        : role === 'teacher'
          ? [
              { label: ar ? 'الفصول' : 'Classes', value: String(classesCount), hint: ar ? 'فصول معتمدة' : 'in database', icon: GraduationCap },
              { label: ar ? 'الطلاب' : 'Students', value: String(studentsCount), hint: ar ? 'بيانات حقيقية' : 'live data', icon: Users },
              { label: ar ? 'متوسط الإنجاز' : 'Avg. completion', value: `${avgMastery}%`, hint: ar ? 'تقييم فعلي' : 'real mastery', icon: TrendingUp },
              { label: ar ? 'واجبات منشورة' : 'Assignments', value: String(openAssignments), hint: ar ? 'تكليفات' : 'tasks', icon: FileCheck2 },
            ]
          : [
              { label: ar ? 'المؤسسات' : 'Institutions', value: String(institutionsCount), hint: ar ? 'مدرسة مسجلة' : 'schools in DB', icon: Building2 },
              { label: ar ? 'المستخدمون' : 'Users', value: String(profilesCount), hint: ar ? 'مستخدم في Supabase' : 'in Supabase', icon: Users },
              { label: ar ? 'الفصول' : 'Classes', value: String(classesCount), hint: ar ? 'فصل دراسي' : 'classes', icon: GraduationCap },
              { label: ar ? 'الطلاب' : 'Students', value: String(studentsCount), hint: ar ? 'طالب ملحق' : 'enrolled students', icon: CheckCircle2 },
            ];

  const roleMessage =
    isResearcher
      ? ar
        ? 'مرحباً بك في المختبر العلمي المتقدم للبحث والمحاكاة. استكشف المعامل التخصصية، مرصد كبلر الفلكي، وأدوات التحليل العلمي.'
        : 'Welcome to the Advanced Scientific Simulation Laboratory. Explore 6 specialized 3D labs, Kepler observatory, and research tools.'
      : role === 'teacher'
        ? ar
          ? `لديك ${classesCount} فصول و ${studentsCount} طالب مسجل، و ${openAssignments} واجب منشور للطلاب.`
          : `You have ${classesCount} classes, ${studentsCount} enrolled students, and ${openAssignments} active assignments.`
        : role === 'admin'
          ? ar
            ? `المنصة متصلة بقاعدة بيانات Supabase الحقيقية وبها ${profilesCount} مستخدم و ${institutionsCount} مؤسسة و ${classesCount} فصول.`
            : `Connected to Supabase with ${profilesCount} users, ${institutionsCount} institutions, and ${classesCount} classes.`
          : completed.length > 0
            ? (ar ? `أكملت ${completed.length} درسًا حتى الآن. تابع تقدمك الدراسي.` : `You completed ${completed.length} lessons so far. Keep going!`)
            : (ar ? 'مرحباً بك في منصة SciNexa. ابدأ باختيار درس من المنهج أو خوض أولى تجاربك في المعمل ثلاثي الأبعاد.' : 'Welcome to SciNexa. Start by picking a lesson from the curriculum or exploring a 3D lab.');

  return (
    <div>
      <PageHeader
        eyebrow={
          isResearcher
            ? (ar ? 'المختبر العلمي المتقدم · باحث أكاديمي مستقل' : 'Advanced Scientific Laboratory · Independent Fellow')
            : new Intl.DateTimeFormat(ar ? 'ar-EG' : 'en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              }).format(new Date())
        }
        title={`${greeting}، ${effectiveFirstName}.`}
        subtitle={roleMessage}
        actions={
          isResearcher ? (
            <>
              <Link to="/app/classroom" className="sn-btn sn-btn-ghost">
                <Presentation size={15} strokeWidth={1.8} />
                {ar ? 'السبورة التفاعلية' : 'Smartboard'}
              </Link>
              <Link to="/app/assistant" className="sn-btn sn-btn-ghost">
                <MessageSquareText size={15} strokeWidth={1.8} />
                {ar ? 'المساعد داروين' : 'Darwin AI'}
              </Link>
              <Link to="/app/labs" className="sn-btn sn-btn-primary">
                <Play size={15} strokeWidth={1.8} />
                {ar ? 'افتح معملًا' : 'Open a lab'}
              </Link>
            </>
          ) : (
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
          )
        }
      />

      {/* Teacher Enrollment Banner if student is not linked (Strictly hidden for researchers) */}
      {!linkedStudent && role === 'student' && !isResearcher && (
        <div className="mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 rounded-2xl border border-amber-500/25 bg-amber-50/80 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 mt-0.5">
              <AlertCircle size={20} strokeWidth={2} />
            </span>
            <div>
              <div className="text-[13px] font-bold text-amber-900">
                {ar ? 'أنت غير مربوط بأي فصل أو معلم حالياً' : 'You are not linked to a classroom or teacher yet'}
              </div>
              <p className="text-[12px] text-amber-800/90 leading-relaxed mt-0.5 max-w-[85ch]">
                {ar
                  ? `يرجى إبلاغ معلمك في المدرسة باسمك الرباعي المسجل: "${studentQuadName || 'الطالب'}" ليقوم بإضافتك إلى فصله الدراسي وإرسال التقييمات والواجبات المعتمدة لك. يمكنك في هذه الأثناء استكشاف جميع المعامل ثلاثية الأبعاد بحرية!`
                  : `Please provide your teacher with your 4-part name: "${studentQuadName || 'Student'}" so they can link you to their class and assign evaluations.`}
              </p>
            </div>
          </div>
          <Link to="/app/settings" className="sn-btn sn-btn-outline sn-btn-sm shrink-0 border-amber-600/30 text-amber-900 hover:bg-amber-100">
            {ar ? 'مراجعة بياناتك' : 'Review Profile'}
          </Link>
        </div>
      )}

      {linkedStudent && role === 'student' && !isResearcher && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-50/70 p-3.5 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600">
              <UserCheck size={16} strokeWidth={2} />
            </span>
            <div className="text-[12px] text-emerald-950">
              <span>{ar ? 'فصلك الدراسي: ' : 'Your Class: '}</span>
              <strong className="font-semibold text-emerald-900">{linkedStudent.classNameAr}</strong>
              <span className="mx-1.5 text-emerald-600">·</span>
              <span>{ar ? 'المعلم المشرف: ' : 'Supervisor: '}</span>
              <strong className="font-semibold text-emerald-900">{linkedStudent.teacherNameAr}</strong>
            </div>
          </div>
          <span className="sn-badge sn-badge-green !text-[10px]">
            {ar ? 'حساب متصل' : 'Connected'}
          </span>
        </div>
      )}

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
                {isResearcher
                  ? (ar ? 'المختبر البحثي المفتوح' : 'Open Lab')
                  : role === 'student'
                    ? (ar ? 'الدرس التالي' : 'Up next')
                    : ar ? 'نظرة عامة' : 'Overview'}
              </span>
            </div>

            <h2 className="mt-5 max-w-[26ch] text-[22px] font-semibold leading-[1.25] tracking-[-0.03em] text-white md:text-[26px]">
              {isResearcher
                ? (ar ? 'بيئة متكاملة للبحث العلمي والتجريب ثلاثي الأبعاد' : 'Integrated 3D Scientific Research Environment')
                : role === 'student'
                  ? completed.length > 0
                    ? (ar ? 'تابع مسارك الدراسي المعتمد' : 'Continue your curriculum')
                    : (ar ? 'استكشف المعامل والتجارب التفاعلية' : 'Explore Interactive 3D Labs')
                  : role === 'teacher'
                    ? (ar ? 'فصولك المدرسية والتكليفات' : 'Classrooms & Assignments')
                    : (ar ? 'إدارة المنصة والمعامل المدرسية' : 'Platform & School Lab Overview')}
            </h2>

            <p className="mt-2 max-w-[52ch] text-[12px] leading-relaxed text-white/50">
              {isResearcher
                ? (ar ? 'استكشف المعامل التخصصية الستة: التشريح، الكيمياء، الفيزياء، الأحياء، الزلازل وعلوم الأرض، ومرصد كبلر الفلكي بحرية تامة دون قيود المناهج.' : 'Explore 6 specialist laboratories: Anatomy, Chemistry, Physics, Biology, Earth & Kepler Orbits without curriculum restrictions.')
                : role === 'student'
                  ? completed.length > 0
                    ? (ar ? `أكملت ${completed.length} درساً حتى الآن. اضغط لمتابعة بقية المنهج.` : `You completed ${completed.length} lessons. Click to continue.`)
                    : (ar ? 'لم تبدأ أي دروس بعد. توجه للمنهج الدراسي أو افتح أحد المعامل الستة للبدء.' : 'No lessons completed yet. Head to the curriculum or open any 3D lab.')
                  : role === 'teacher'
                    ? (ar ? `لديك ${studentsCount} طالب مسجل في فصولك الدراسية، مع ${openAssignments} واجبات معتمدة في Supabase.` : `${studentsCount} enrolled students across your classes, with ${openAssignments} active assignments.`)
                    : (ar ? `متابعة مباشرة لقاعدة بيانات Supabase: ${profilesCount} مستخدم، ${classesCount} فصول، ${institutionsCount} مؤسسة.` : `Direct Supabase integration: ${profilesCount} users, ${classesCount} classes, ${institutionsCount} institutions.`)}
            </p>

            {!isResearcher && (
              <div className="mt-5 max-w-[320px]">
                <div className="mb-1.5 flex items-center justify-between text-[10px] text-white/45">
                  <span>{ar ? 'التقدّم الفعلي' : 'Real Progress'}</span>
                  <span className="font-mono">{role === 'student' ? `${progressPercent}%` : `${avgMastery}%`}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-white" style={{ width: `${role === 'student' ? progressPercent : avgMastery}%` }} />
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => navigate('/app/labs/chemistry')}
                className="sn-btn bg-white text-[#0a0a0a] hover:bg-[#f0f0f0]"
              >
                {isResearcher ? (ar ? 'استكشف المعامل 3D' : 'Explore 3D Labs') : role === 'student' ? (ar ? 'افتح التجربة' : 'Open experiment') : role === 'teacher' ? (ar ? 'عرض الفصول' : 'View classes') : ar ? 'عرض التحليلات' : 'View analytics'}
                <ArrowRight size={14} strokeWidth={1.8} className={ar ? 'rotate-180' : ''} />
              </button>
              {isResearcher ? (
                <button
                  type="button"
                  onClick={() => navigate('/app/classroom')}
                  className="sn-btn border border-white/15 bg-transparent text-white hover:bg-white/10"
                >
                  {ar ? 'السبورة الذكية' : 'Smartboard'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/app/curriculum')}
                  className="sn-btn border border-white/15 bg-transparent text-white hover:bg-white/10"
                >
                  {ar ? 'كل الدروس' : 'All lessons'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <SectionCard
            title={isResearcher ? (ar ? 'النشاط البحثي' : 'Research Activity') : (ar ? 'نشاط التعلم' : 'Learning Activity')}
            bodyClassName="p-5"
          >
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="sn-number text-[38px] font-semibold leading-none tracking-[-0.05em]">
                  {(completed.length * 0.5).toFixed(1)}
                </div>
                <div className="mt-1 text-[11px] text-[#737373]">{ar ? 'ساعات تدريب واستكشاف فعلي' : 'hours in labs'}</div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 border-t border-[#f0f0f0] pt-4">
              {[
                { v: String(completed.length), l: isResearcher ? (ar ? 'جلسات' : 'sessions') : (ar ? 'دروس' : 'lessons') },
                { v: String(completed.length > 0 ? Math.min(6, completed.length) : 0), l: ar ? 'معامل' : 'labs' },
                { v: isResearcher ? `${xp} XP` : `${progressPercent}%`, l: isResearcher ? (ar ? 'خبرة' : 'XP') : (ar ? 'إنجاز' : 'progress') },
              ].map((item) => (
                <div key={item.l}>
                  <div className="text-[16px] font-semibold tracking-[-0.03em]">{item.v}</div>
                  <div className="text-[10px] text-[#737373]">{item.l}</div>
                </div>
              ))}
            </div>
          </SectionCard>

          {!isResearcher && (
            <SectionCard
              title={ar ? 'القادم والتكليفات' : 'Upcoming & Assignments'}
              action={<CalendarDays size={14} strokeWidth={1.7} className="text-[#a3a3a3]" />}
              bodyClassName="p-3"
            >
              {assignments.length > 0 ? (
                assignments.slice(0, 3).map((item) => (
                  <Link
                    key={item.id}
                    to={'/app/labs/' + (item.linkedLab || 'chemistry')}
                    className="flex items-center gap-3 rounded-[10px] px-2 py-2 hover:bg-[#fafafa] transition-colors"
                  >
                    <span className={'sn-' + (item.linkedLab || 'chemistry') + ' sn-icon-tile !h-8 !w-8 !rounded-[8px]'}>
                      <FileCheck2 size={14} strokeWidth={1.7} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12px] font-medium text-[#0a0a0a]">
                        {ar ? item.titleAr : item.titleEn}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-[#737373]">
                        <span>{ar ? item.dueDateAr : item.dueDateEn}</span>
                        {item.targetStudentQuadName && (
                          <>
                            <span>·</span>
                            <span className="text-blue-600 font-semibold">{ar ? 'تكليف خاص' : 'Assigned to you'}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <ArrowRight size={13} className={'text-[#a3a3a3] ' + (ar ? 'rotate-180' : '')} />
                  </Link>
                ))
              ) : (
                <div className="p-4 text-center text-[11px] text-[#a3a3a3]">
                  {ar ? 'لا توجد تكليفات معلقة حالياً. استكشف المعامل بحرية!' : 'No pending assignments. Feel free to explore the labs!'}
                </div>
              )}
            </SectionCard>
          )}

          {isResearcher && (
            <SectionCard
              title={ar ? 'المعامل التخصصية السريعة' : 'Quick Lab Access'}
              action={<FlaskConical size={14} strokeWidth={1.7} className="text-[#a3a3a3]" />}
              bodyClassName="p-3"
            >
              <div className="space-y-1">
                {[
                  { id: 'anatomy', nameAr: 'أطلس التشريح البشري 3D', nameEn: '3D Human Anatomy Atlas', accent: 'anatomy' },
                  { id: 'chemistry', nameAr: 'معمل الكيمياء والتفاعلات', nameEn: 'Interactive Chemistry Lab', accent: 'chemistry' },
                  { id: 'physics', nameAr: 'الفيزياء والموجات والدوائر', nameEn: 'Physics & DC Circuits', accent: 'physics' },
                  { id: 'astronomy', nameAr: 'مرصد كبلر والنظام الشمسي', nameEn: 'Kepler Solar Observatory', accent: 'astronomy' },
                ].map((lab) => (
                  <Link
                    key={lab.id}
                    to={`/app/labs/${lab.id}`}
                    className="flex items-center justify-between rounded-xl p-2.5 hover:bg-[#fafafa] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`sn-${lab.accent} sn-icon-tile !h-7 !w-7 !rounded-[6px]`}>
                        <Play size={12} strokeWidth={2} />
                      </span>
                      <span className="text-[12px] font-semibold text-[#171717]">
                        {ar ? lab.nameAr : lab.nameEn}
                      </span>
                    </div>
                    <ArrowRight size={13} className={'text-[#a3a3a3] ' + (ar ? 'rotate-180' : '')} />
                  </Link>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      </div>

      {/* Laboratories Grid */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-semibold text-[#0a0a0a]">
              {isResearcher ? (ar ? 'المعامل التخصصية الستة للاستكشاف والبحث' : 'Specialist Laboratories') : (ar ? 'اختر مساحة للاكتشاف' : 'Choose a lab')}
            </h3>
            <p className="text-[11px] text-[#737373]">
              {ar ? 'معامل تفاعلية متكاملة مع أدوات قياس حقيقية ونتائج حية.' : 'Interactive 3D environments with live measurement tools.'}
            </p>
          </div>
          <Link to="/app/labs" className="sn-btn sn-btn-ghost sn-btn-sm text-[12px]">
            {ar ? 'كل المعامل' : 'All labs'}
            <ArrowRight size={13} strokeWidth={1.8} className={ar ? 'rotate-180' : ''} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {LAB_MODULES.map((lab) => {
            const Icon = ICONS[lab.id] ?? FlaskConical;
            return (
              <button
                key={lab.id}
                type="button"
                onClick={() => navigate(`/app/labs/${lab.id}`)}
                className={`sn-${lab.accent} sn-card sn-card-hover group flex flex-col p-4 text-start transition-all`}
              >
                <div className="mb-3 flex items-start justify-between">
                  <span className="sn-icon-tile !h-9 !w-9 !rounded-[10px]">
                    <Icon size={16} strokeWidth={1.7} />
                  </span>
                  <span className="font-mono text-[9px] text-[#a3a3a3]">{lab.index}</span>
                </div>
                <div className="sn-eyebrow !text-[9px]">{ar ? lab.categoryAr : lab.categoryEn}</div>
                <div className="mt-1 line-clamp-1 text-[13px] font-semibold tracking-[-0.01em]">
                  {ar ? lab.nameAr : lab.nameEn}
                </div>
                <div className="mt-auto pt-3 text-[10px] text-[#737373]">
                  <span className="font-mono font-medium text-[#0a0a0a]">{lab.statValue}</span>{' '}
                  {ar ? lab.statLabelAr : lab.statLabelEn}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
