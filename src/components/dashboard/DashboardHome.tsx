import { getPersistedItem, getPersistedJSON, setPersistedItem, setPersistedJSON } from '../../lib/cookies';
import {
  calculateStudentLevel,
  getEnrolledStudents,
  getAssignments,
  getSubmissions,
  fetchAndSyncEnrollment,
  fetchAndSyncAssignments,
  fetchAndSyncSubmissions,
  findStudentEnrollmentsFromList,
  getAssignmentsForStudent,
  recordSubmission,
  namesMatch,
  type EnrolledStudent,
  type AssignmentItem,
  type StudentSubmission,
} from '../../data/schoolEnrollment';
import { ALL_CURRICULUM_PATHWAYS } from '../../data/curriculumData';
import {
  dbFetchClasses,
  dbFetchAllProfiles,
  dbFetchInstitutions,
  type DbClass,
  type DbProfile,
  type DbInstitution,
} from '../../lib/supabase';
import { getRealLabStats, type RealLabStats } from '../../lib/labTracker';
import { tLang } from '../../i18n/langHelpers';
import { AlertCircle, UserCheck } from 'lucide-react';
import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useSession } from '../../context/SessionContext';
import { LAB_MODULES } from '../../data/labs';
import { PageHeader, StatCard, SectionCard } from './ui';
import { StudentAssignmentModal } from './StudentAssignmentModal';
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
  math: Compass,
};

export const DashboardHome: React.FC = () => {
  const { language } = useLanguage();
  const { user, role } = useSession();
  const navigate = useNavigate();
  const ar = language === 'ar';

  // Reactive state for profile, grade, and gamification
  const [studentQuadName, setStudentQuadName] = useState(() => {
    const active = getPersistedItem('scinexa_user_fullname');
    return active || '';
  });
  const [savedGrade, setSavedGrade] = useState(() => getPersistedItem('scinexa_grade', 'sec2'));
  const [labStats, setLabStats] = useState<RealLabStats>(() => getRealLabStats(user?.email));

  const [completed, setCompleted] = useState<string[]>(() => {
    const list = getPersistedJSON<string[]>('scinexa_completed_lessons', []);
    const rawXp = parseInt(getPersistedItem('scinexa_user_xp', '0'), 10);
    // Auto purge stale legacy test artifacts (exact 5 lessons or 660 XP)
    const isLegacyMock = list.length === 5 && list.includes('chem-1') && list.includes('phys-1') && list.includes('bio-1');
    if (rawXp === 660 || isLegacyMock) {
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
      setStudentQuadName(getPersistedItem('scinexa_user_fullname') || '');
      setSavedGrade(getPersistedItem('scinexa_grade', 'sec2'));
      const currentCompleted = getPersistedJSON<string[]>('scinexa_completed_lessons', []);
      const currentXp = parseInt(getPersistedItem('scinexa_user_xp', '0'), 10);
      const isLegacyMock = currentCompleted.length === 5 && currentCompleted.includes('chem-1') && currentCompleted.includes('phys-1');
      if (currentXp === 660 || isLegacyMock) {
        setCompleted([]);
        setXp(0);
      } else {
        setCompleted(currentCompleted);
        setXp(currentXp);
      }
      setRealStreak(parseInt(getPersistedItem('scinexa_user_streak', '0'), 10));
      setLabStats(getRealLabStats(user?.email));
    };
    window.addEventListener('scinexa_profile_updated', handleSync);
    window.addEventListener('scinexa_progress_reset', handleSync);
    window.addEventListener('scinexa_lab_time_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('scinexa_profile_updated', handleSync);
      window.removeEventListener('scinexa_progress_reset', handleSync);
      window.removeEventListener('scinexa_lab_time_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [user]);

  const isResearcher = savedGrade === 'university' || savedGrade === 'researcher';

  // Real Supabase state
  const [classes, setClasses] = useState<DbClass[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>(() => getEnrolledStudents());
  const [assignments, setAssignments] = useState<AssignmentItem[]>(() => getAssignments());
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(() => getSubmissions());
  const [profiles, setProfiles] = useState<DbProfile[]>([]);
  const [institutions, setInstitutions] = useState<DbInstitution[]>([]);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [selectedAssignmentForModal, setSelectedAssignmentForModal] = useState<AssignmentItem | null>(null);

  useEffect(() => {
    const loadRealData = async () => {
      const [fetchedClasses, fetchedStudents, fetchedAssignments, fetchedSubmissions, fetchedProfiles, fetchedInst] = await Promise.all([
        dbFetchClasses(),
        fetchAndSyncEnrollment(),
        fetchAndSyncAssignments(),
        fetchAndSyncSubmissions(),
        dbFetchAllProfiles(),
        dbFetchInstitutions(),
      ]);
      setClasses(fetchedClasses || []);
      if (fetchedStudents) setEnrolledStudents(fetchedStudents);
      if (fetchedAssignments) setAssignments(fetchedAssignments);
      if (fetchedSubmissions) setSubmissions(fetchedSubmissions);
      setProfiles(fetchedProfiles || []);
      setInstitutions(fetchedInst || []);
    };
    void loadRealData();
  }, []);

  // Real Enrollment, Curriculum Denominator, & Targeted Assignments
  const studentEnrollments = useMemo(
    () => (isResearcher ? [] : findStudentEnrollmentsFromList(enrolledStudents, studentQuadName, user?.email)),
    [enrolledStudents, studentQuadName, user?.email, isResearcher]
  );
  const linkedStudent = studentEnrollments[0] || null;

  const visibleAssignments = useMemo(
    () =>
      role === 'student'
        ? getAssignmentsForStudent(assignments, studentEnrollments, studentQuadName, user?.email)
        : assignments,
    [role, assignments, studentEnrollments, studentQuadName, user?.email]
  );

  const totalCurriculumLessons = useMemo(
    () => Math.max(1, ALL_CURRICULUM_PATHWAYS.reduce((sum, p) => sum + p.lessons.length, 0)),
    []
  );

  const progressPercent =
    completed.length > 0 ? Math.min(100, Math.round((completed.length / totalCurriculumLessons) * 100)) : 0;
  const levelInfo = useMemo(() => calculateStudentLevel(xp), [xp]);

  const effectiveStudentIdentity = useMemo(
    () => studentQuadName.trim() || linkedStudent?.quadName || user?.name || user?.email || '',
    [studentQuadName, linkedStudent, user]
  );

  const handleCompleteAssignment = async (item: AssignmentItem) => {
    if (!effectiveStudentIdentity || submittingId) return;
    setSubmittingId(item.id);
    const sub: StudentSubmission = {
      id: `sub-${item.id}-${Date.now()}`,
      assignmentId: item.id,
      studentQuadName: effectiveStudentIdentity,
      submittedAt: new Date().toISOString().split('T')[0],
      status: 'submitted',
    };
    await recordSubmission(sub);
    setSubmissions(getSubmissions());
    setSubmittingId(null);
  };

  const labsCount = LAB_MODULES.length;
  const classesCount = classes.length;
  const studentsCount = enrolledStudents.length;
  const avgMastery = studentsCount > 0
    ? Math.round(enrolledStudents.reduce((acc, s) => acc + (s.mastery || 0), 0) / studentsCount)
    : 0;
  const openAssignments = visibleAssignments.length;
  const institutionsCount = institutions.length;
  const profilesCount = profiles.length;

  // Use the student's real quad name instead of Google username ("Simone")
  const nameParts = studentQuadName.trim().split(/\s+/).filter(Boolean);
  const effectiveFirstName = nameParts.length >= 2
    ? nameParts.slice(0, 2).join(' ')
    : nameParts.length === 1 && !nameParts[0].toLowerCase().includes('simone')
    ? nameParts[0]
    : tLang(language, { ar: 'الباحث المتميز', en: 'Honored Scholar', fr: 'Chercheur', de: 'Forscher', ja: '研究員' });

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? tLang(language, { ar: 'صباح الخير', en: 'Good morning', fr: 'Bonjour', de: 'Guten Morgen', ja: 'おはようございます' })
      : hour < 18
        ? tLang(language, { ar: 'مساء الخير', en: 'Good afternoon', fr: 'Bon après-midi', de: 'Guten Tag', ja: 'こんにちは' })
        : tLang(language, { ar: 'مساء الخير', en: 'Good evening', fr: 'Bonsoir', de: 'Guten Abend', ja: 'こんばんは' });

  const stats =
    isResearcher
      ? [
          {
            label: tLang(language, { ar: 'المعامل التخصصية', en: 'Specialist Labs', fr: 'Labos spécialisés', de: 'Fachlabore', ja: '専門実験室' }),
            value: String(labsCount),
            hint: tLang(language, { ar: 'معامل 3D متقدمة', en: '3D active labs', fr: 'Labos 3D actifs', de: '3D-Labore aktiv', ja: '3D稼働中' }),
            icon: FlaskConical,
          },
          {
            label: tLang(language, { ar: 'معامل مستكشفة', en: 'Explored Labs', fr: 'Labos explorés', de: 'Erkundete Labore', ja: '体験済み実験室' }),
            value: `${labStats.exploredCount}/${labsCount}`,
            hint: tLang(language, { ar: 'تجارب فعلية', en: 'active labs', fr: 'labos ouverts', de: 'aktive Labore', ja: '完了実験室' }),
            icon: Sparkles,
          },
          {
            label: tLang(language, { ar: 'نقاط البحث العلمي', en: 'Research XP', fr: 'XP de recherche', de: 'Forschungs-XP', ja: '研究XP' }),
            value: String(xp),
            hint: 'XP',
            icon: TrendingUp,
          },
          {
            label: tLang(language, { ar: 'ساعات الاستكشاف', en: 'Research Hours', fr: 'Heures de labo', de: 'Forschungsstunden', ja: '実験研究時間' }),
            value: `${labStats.totalHours}h`,
            hint: tLang(language, { ar: 'وقت معملي حقيقي', en: 'real lab time', fr: 'temps réel', de: 'Echtzeit', ja: '実稼働時間' }),
            icon: Activity,
          },
        ]
      : role === 'student'
        ? [
            {
              label: tLang(language, { ar: 'تقدّم المنهج', en: 'Curriculum Progress', fr: 'Progression du cours', de: 'Lehrplanfortschritt', ja: 'カリキュラム進捗' }),
              value: `${progressPercent}%`,
              hint: tLang(language, { ar: 'إنجاز فعلي', en: 'real progress', fr: 'réel', de: 'tatsächlich', ja: '実質進捗' }),
              icon: BookOpen,
            },
            {
              label: tLang(language, { ar: 'دروس مكتملة', en: 'Lessons Completed', fr: 'Leçons terminées', de: 'Lektionen fertig', ja: '完了レッスン' }),
              value: String(completed.length),
              hint: tLang(language, { ar: `من ${totalCurriculumLessons} درسًا`, en: `of ${totalCurriculumLessons}`, fr: `sur ${totalCurriculumLessons}`, de: `von ${totalCurriculumLessons}`, ja: `/ ${totalCurriculumLessons}` }),
              icon: CheckCircle2,
            },
            {
              label: tLang(language, { ar: 'نقاط الخبرة', en: 'Experience Points', fr: 'Points d’expérience', de: 'Erfahrungspunkte', ja: '獲得XP' }),
              value: String(xp),
              hint: 'XP',
              icon: TrendingUp,
            },
            {
              label: tLang(language, { ar: 'أيام متتالية', en: 'Day Streak', fr: 'Jours consécutifs', de: 'Tage-Serie', ja: '連続学習日数' }),
              value: String(realStreak),
              hint: tLang(language, { ar: 'أيام متواصلة', en: 'consecutive days', fr: 'jours de suite', de: 'Tage in Folge', ja: '日連続' }),
              icon: Activity,
            },
          ]
        : role === 'teacher'
          ? [
              { label: tLang(language, { ar: 'الفصول', en: 'Classes', fr: 'Classes', de: 'Klassen', ja: '担当クラス' }), value: String(classesCount), hint: 'Supabase', icon: GraduationCap },
              { label: tLang(language, { ar: 'الطلاب', en: 'Students', fr: 'Élèves', de: 'Schüler', ja: '登録生徒' }), value: String(studentsCount), hint: 'Live', icon: Users },
              { label: tLang(language, { ar: 'متوسط الإنجاز', en: 'Avg. completion', fr: 'Moyenne', de: 'Durchschnitt', ja: '平均達成率' }), value: `${avgMastery}%`, hint: 'Real', icon: TrendingUp },
              { label: tLang(language, { ar: 'واجبات منشورة', en: 'Assignments', fr: 'Devoirs', de: 'Aufgaben', ja: '配信課題' }), value: String(openAssignments), hint: 'Tasks', icon: FileCheck2 },
            ]
          : [
              { label: tLang(language, { ar: 'المؤسسات', en: 'Institutions', fr: 'Établissements', de: 'Institutionen', ja: '教育機関' }), value: String(institutionsCount), hint: 'Schools', icon: Building2 },
              { label: tLang(language, { ar: 'المستخدمون', en: 'Users', fr: 'Utilisateurs', de: 'Benutzer', ja: '全ユーザー' }), value: String(profilesCount), hint: 'Supabase', icon: Users },
              { label: tLang(language, { ar: 'الفصول', en: 'Classes', fr: 'Classes', de: 'Klassen', ja: 'クラス' }), value: String(classesCount), hint: 'Classes', icon: GraduationCap },
              { label: tLang(language, { ar: 'الطلاب', en: 'Students', fr: 'Élèves', de: 'Schüler', ja: '生徒' }), value: String(studentsCount), hint: 'Students', icon: CheckCircle2 },
            ];

  const roleMessage =
    isResearcher
      ? tLang(language, {
          ar: `مرحباً بك في المختبر العلمي المتقدم للبحث والمحاكاة. استكشف ${labsCount} معامل تخصصية، مرصد كبلر الفلكي، وأدوات التحليل العلمي.`,
          en: `Welcome to the Advanced Scientific Simulation Laboratory. Explore ${labsCount} specialized 3D labs, Kepler observatory, and research tools.`,
          fr: `Bienvenue dans le laboratoire de recherche avancée 3D. Explorez les ${labsCount} laboratoires spécialisés, l’observatoire Kepler et les outils de simulation.`,
          de: `Willkommen im fortgeschrittenen 3D-Forschungslabor. Erkunden Sie ${labsCount} Fachlabore, das Kepler-Observatorium und Analysewerkzeuge.`,
          ja: `高度3D科学シミュレーション研究所へようこそ。${labsCount}つの専門実験室、ケプラー天文台、精密分析ツールを自在に活用できます。`,
        })
      : role === 'teacher'
        ? tLang(language, {
            ar: `لديك ${classesCount} فصول و ${studentsCount} طالب مسجل، و ${openAssignments} واجب منشور للطلاب.`,
            en: `You have ${classesCount} classes, ${studentsCount} enrolled students, and ${openAssignments} active assignments.`,
            fr: `Vous avez ${classesCount} classes, ${studentsCount} élèves inscrits, et ${openAssignments} devoirs actifs.`,
            de: `Sie haben ${classesCount} Klassen, ${studentsCount} Schüler und ${openAssignments} aktive Aufgaben.`,
            ja: `担当クラス: ${classesCount}、登録生徒: ${studentsCount}名、配信中課題: ${openAssignments}件。`,
          })
        : role === 'admin'
          ? tLang(language, {
              ar: `المنصة متصلة بقاعدة بيانات Supabase وبها ${profilesCount} مستخدم و ${institutionsCount} مؤسسة و ${classesCount} فصول.`,
              en: `Connected to Supabase with ${profilesCount} users, ${institutionsCount} institutions, and ${classesCount} classes.`,
              fr: `Connecté à Supabase avec ${profilesCount} utilisateurs, ${institutionsCount} établissements et ${classesCount} classes.`,
              de: `Verbunden mit Supabase: ${profilesCount} Benutzer, ${institutionsCount} Institutionen und ${classesCount} Klassen.`,
              ja: `Supabase連携中: ユーザー ${profilesCount}名、教育機関 ${institutionsCount}校、クラス ${classesCount}件。`,
            })
          : completed.length > 0
            ? tLang(language, {
                ar: `أكملت ${completed.length} درسًا حتى الآن. تابع تقدمك الدراسي.`,
                en: `You completed ${completed.length} lessons so far. Keep going!`,
                fr: `Vous avez terminé ${completed.length} leçons jusqu'ici. Continuez!`,
                de: `Sie haben bisher ${completed.length} Lektionen abgeschlossen. Weiter so!`,
                ja: `現在までに ${completed.length} レッスンを完了しました。学習を続けましょう！`,
              })
            : tLang(language, {
                ar: 'مرحباً بك في منصة SciNexa. ابدأ باختيار درس من المنهج أو خوض أولى تجاربك في المعمل ثلاثي الأبعاد.',
                en: 'Welcome to SciNexa. Start by picking a lesson from the curriculum or exploring a 3D lab.',
                fr: 'Bienvenue sur SciNexa. Choisissez une leçon du programme ou explorez un laboratoire 3D.',
                de: 'Willkommen bei SciNexa. Wählen Sie eine Lektion aus dem Lehrplan oder erkunden Sie ein 3D-Labor.',
                ja: 'SciNexaへようこそ。公式カリキュラムのレッスンを選択するか、3Dバーチャル実験室を体験してみましょう。',
              });

  return (
    <div>
      <PageHeader
        eyebrow={
          isResearcher
            ? tLang(language, {
                ar: 'المختبر العلمي المتقدم · باحث أكاديمي مستقل',
                en: 'Advanced Scientific Laboratory · Independent Fellow',
                fr: 'Laboratoire de recherche avancé · Chercheur indépendant',
                de: 'Fortgeschrittenes Forschungslabor · Unabhängiger Forscher',
                ja: '高度科学シミュレーション研究所 · 独立研究員',
              })
            : new Intl.DateTimeFormat(ar ? 'ar-EG' : language === 'ja' ? 'ja-JP' : language === 'fr' ? 'fr-FR' : language === 'de' ? 'de-DE' : 'en-GB', {
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
                {tLang(language, { ar: 'السبورة التفاعلية', en: 'Smartboard', fr: 'Tableau interactif', de: 'Tafel', ja: '対話型黒板' })}
              </Link>
              <Link to="/app/assistant" className="sn-btn sn-btn-ghost">
                <MessageSquareText size={15} strokeWidth={1.8} />
                {tLang(language, { ar: 'المساعد داروين', en: 'Darwin AI', fr: 'Assistant Darwin', de: 'Darwin KI', ja: 'ダーウィンAI' })}
              </Link>
              <Link to="/app/labs" className="sn-btn sn-btn-primary">
                <Play size={15} strokeWidth={1.8} />
                {tLang(language, { ar: 'افتح معملًا', en: 'Open a lab', fr: 'Ouvrir un labo', de: 'Labor öffnen', ja: '実験室を開く' })}
              </Link>
            </>
          ) : (
            <>
              <Link to="/app/curriculum" className="sn-btn sn-btn-ghost">
                <BookOpen size={15} strokeWidth={1.8} />
                {tLang(language, { ar: 'المسار الدراسي', en: 'Curriculum path', fr: 'Programme', de: 'Lehrplan', ja: 'カリキュラム' })}
              </Link>
              <Link to="/app/labs" className="sn-btn sn-btn-primary">
                <Play size={15} strokeWidth={1.8} />
                {tLang(language, { ar: 'افتح معملًا', en: 'Open a lab', fr: 'Ouvrir un labo', de: 'Labor öffnen', ja: '実験室を開く' })}
              </Link>
            </>
          )
        }
      />

      {/* Teacher Enrollment Banner if student is not linked (Strictly hidden for researchers) */}
      {!linkedStudent && role === 'student' && !isResearcher && (
        <div className="mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 rounded-2xl border border-amber-500/25 bg-amber-50/80 p-4 shadow-xs">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 mt-0.5">
              <AlertCircle size={20} strokeWidth={2} />
            </span>
            <div>
              <div className="text-[13px] font-bold text-amber-900">
                {tLang(language, {
                  ar: 'أنت غير مربوط بأي فصل أو معلم حالياً',
                  en: 'You are not linked to a classroom or teacher yet',
                  fr: 'Vous n’êtes pas encore rattaché à une classe',
                  de: 'Sie sind noch keiner Klasse zugeordnet',
                  ja: '現在クラスまたは教員に紐付けられていません',
                })}
              </div>
              <p className="text-[12px] text-amber-800/90 leading-relaxed mt-0.5 max-w-[85ch]">
                {tLang(language, {
                  ar: `يرجى إبلاغ معلمك في المدرسة باسمك الرباعي المسجل: "${studentQuadName || 'الطالب'}" ليقوم بإضافتك إلى فصله الدراسي وإرسال التقييمات والواجبات المعتمدة لك. يمكنك في هذه الأثناء استكشاف جميع المعامل ثلاثية الأبعاد بحرية!`,
                  en: `Please provide your teacher with your 4-part name: "${studentQuadName || 'Student'}" so they can link you to their class and assign evaluations. Meanwhile, feel free to explore all 3D labs!`,
                  fr: `Veuillez fournir à votre enseignant votre nom officiel à 4 volets: "${studentQuadName || 'Élève'}". En attendant, vous pouvez explorer librement les laboratoires 3D!`,
                  de: `Bitte teilen Sie Ihrer Lehrkraft Ihren offiziellen 4-teiligen Namen mit: "${studentQuadName || 'Schüler'}". In der Zwischenzeit können Sie alle 3D-Labore frei nutzen!`,
                  ja: `担当教員に登録済みの正式な4部構成氏名「${studentQuadName || '生徒'}」をお伝えください。その間もすべての3D実験室を自由に利用できます！`,
                })}
              </p>
            </div>
          </div>
          <Link to="/app/settings" className="sn-btn sn-btn-outline sn-btn-sm shrink-0 border-amber-600/30 text-amber-900 hover:bg-amber-100">
            {tLang(language, { ar: 'مراجعة بياناتك', en: 'Review Profile', fr: 'Vérifier le profil', de: 'Profil prüfen', ja: '登録情報を確認' })}
          </Link>
        </div>
      )}

      {linkedStudent && role === 'student' && !isResearcher && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-50/70 p-3.5 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600">
              <UserCheck size={16} strokeWidth={2} />
            </span>
            <div className="text-[12px] text-emerald-950">
              <span>{tLang(language, { ar: 'فصلك الدراسي: ', en: 'Your Class: ', fr: 'Votre classe: ', de: 'Ihre Klasse: ', ja: '所属クラス: ' })}</span>
              <strong className="font-semibold text-emerald-900">{linkedStudent.classNameAr}</strong>
              <span className="mx-1.5 text-emerald-600">·</span>
              <span>{tLang(language, { ar: 'المعلم المشرف: ', en: 'Supervisor: ', fr: 'Enseignant: ', de: 'Lehrkraft: ', ja: '担当教員: ' })}</span>
              <strong className="font-semibold text-emerald-900">{linkedStudent.teacherNameAr}</strong>
            </div>
          </div>
          <span className="sn-badge sn-badge-green !text-[10px]">
            {tLang(language, { ar: 'حساب متصل', en: 'Connected', fr: 'Connecté', de: 'Verbunden', ja: '連携完了' })}
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
                  ? tLang(language, { ar: 'المختبر البحثي المفتوح', en: 'Open Lab', fr: 'Labo ouvert', de: 'Offenes Labor', ja: 'オープン実験室' })
                  : role === 'student'
                    ? tLang(language, { ar: 'الدرس التالي', en: 'Up next', fr: 'À suivre', de: 'Als Nächstes', ja: '次のレッスン' })
                    : tLang(language, { ar: 'نظرة عامة', en: 'Overview', fr: 'Aperçu', de: 'Übersicht', ja: '概要' })}
              </span>
            </div>

            <h2 className="mt-5 max-w-[26ch] text-[22px] font-semibold leading-[1.25] tracking-[-0.03em] text-white md:text-[26px]">
              {isResearcher
                ? tLang(language, {
                    ar: 'بيئة متكاملة للبحث العلمي والتجريب ثلاثي الأبعاد',
                    en: 'Integrated 3D Scientific Research Environment',
                    fr: 'Environnement intégré de recherche scientifique 3D',
                    de: 'Integrierte 3D-Forschungsumgebung',
                    ja: '統合型3D科学研究・実験シミュレーション環境',
                  })
                : role === 'student'
                  ? completed.length > 0
                    ? tLang(language, { ar: 'تابع مسارك الدراسي المعتمد', en: 'Continue your curriculum', fr: 'Poursuivre votre programme', de: 'Lehrplan fortsetzen', ja: 'カリキュラム学習を再開' })
                    : tLang(language, { ar: 'استكشف المعامل والتجارب التفاعلية', en: 'Explore Interactive 3D Labs', fr: 'Explorer les labos 3D', de: '3D-Labore erkunden', ja: '対話型3D実験室を体験' })
                  : role === 'teacher'
                    ? tLang(language, { ar: 'فصولك المدرسية والتكليفات', en: 'Classrooms & Assignments', fr: 'Classes et devoirs', de: 'Klassen & Aufgaben', ja: '担当クラスと配信課題' })
                    : tLang(language, { ar: 'إدارة المنصة والمعامل المدرسية', en: 'Platform & School Lab Overview', fr: 'Gestion de l’établissement', de: 'Plattform-Übersicht', ja: 'プラットフォーム管理概要' })}
            </h2>

            <p className="mt-2 max-w-[52ch] text-[12px] leading-relaxed text-white/50">
              {isResearcher
                ? tLang(language, {
                    ar: `استكشف ${labsCount} معامل تخصصية: التشريح، الكيمياء، الفيزياء، الأحياء، الزلازل وعلوم الأرض، مرصد كبلر الفلكي، ومختبر الرياضيات بحرية تامة دون قيود المناهج.`,
                    en: `Explore ${labsCount} specialist laboratories: Anatomy, Chemistry, Physics, Biology, Earth & Kepler Orbits, and Mathematics without curriculum restrictions.`,
                    fr: `Explorez ${labsCount} laboratoires spécialisés: Anatomie, Chimie, Physique, Biologie, Géologie, Kepler et Mathématiques sans restriction.`,
                    de: `Erkunden Sie ${labsCount} Fachlabore: Anatomie, Chemie, Physik, Biologie, Geologie, Kepler und Mathematik völlig frei.`,
                    ja: `解剖学、化学、物理学、生物学、地球科学、ケプラー軌道天文台、数学の${labsCount}つの専門実験室をシラバスの制限なく自由に研究できます。`,
                  })
                : role === 'student'
                  ? completed.length > 0
                    ? tLang(language, {
                        ar: `أكملت ${completed.length} درساً حتى الآن. اضغط لمتابعة بقية المنهج.`,
                        en: `You completed ${completed.length} lessons. Click to continue.`,
                        fr: `Vous avez complété ${completed.length} leçons. Cliquez pour continuer.`,
                        de: `Sie haben ${completed.length} Lektionen abgeschlossen. Klicken zum Fortfahren.`,
                        ja: `現在までに ${completed.length} レッスンを完了しました。クリックして続けましょう。`,
                      })
                    : tLang(language, {
                        ar: `لم تبدأ أي دروس بعد. توجه للمنهج الدراسي أو افتح أحد المعامل الـ ${labsCount} للبدء.`,
                        en: 'No lessons completed yet. Head to the curriculum or open any 3D lab.',
                        fr: 'Aucune leçon terminée. Accédez au programme ou ouvrez un laboratoire 3D.',
                        de: 'Noch keine Lektionen abgeschlossen. Starten Sie im Lehrplan oder einem 3D-Labor.',
                        ja: '完了したレッスンはまだありません。カリキュラムを開くか、3D実験室を体験してみましょう。',
                      })
                  : role === 'teacher'
                    ? tLang(language, {
                        ar: `لديك ${studentsCount} طالب مسجل في فصولك الدراسية، مع ${openAssignments} واجبات معتمدة في Supabase.`,
                        en: `${studentsCount} enrolled students across your classes, with ${openAssignments} active assignments.`,
                        fr: `${studentsCount} élèves inscrits, avec ${openAssignments} devoirs actifs.`,
                        de: `${studentsCount} Schüler eingetragen, mit ${openAssignments} aktiven Aufgaben.`,
                        ja: `登録生徒数: ${studentsCount}名、Supabase配信課題: ${openAssignments}件。`,
                      })
                    : tLang(language, {
                        ar: `متابعة مباشرة لقاعدة بيانات Supabase: ${profilesCount} مستخدم، ${classesCount} فصول، ${institutionsCount} مؤسسة.`,
                        en: `Direct Supabase integration: ${profilesCount} users, ${classesCount} classes, ${institutionsCount} institutions.`,
                        fr: `Intégration directe Supabase: ${profilesCount} utilisateurs, ${classesCount} classes, ${institutionsCount} établissements.`,
                        de: `Direkte Supabase-Anbindung: ${profilesCount} Benutzer, ${classesCount} Klassen, ${institutionsCount} Schulen.`,
                        ja: `Supabase直接連携: ユーザー ${profilesCount}名、クラス ${classesCount}件、教育機関 ${institutionsCount}校。`,
                      })}
            </p>

            {!isResearcher && (
              <div className="mt-5 max-w-[320px]">
                <div className="mb-1.5 flex items-center justify-between text-[10px] text-white/45">
                  <span>{tLang(language, { ar: 'التقدّم الفعلي', en: 'Real Progress', fr: 'Progression réelle', de: 'Tatsächlicher Fortschritt', ja: '実質達成率' })}</span>
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
                {isResearcher
                  ? tLang(language, { ar: 'استكشف المعامل 3D', en: 'Explore 3D Labs', fr: 'Explorer les labos 3D', de: '3D-Labore erkunden', ja: '3D実験室を探索' })
                  : role === 'student'
                    ? tLang(language, { ar: 'افتح التجربة', en: 'Open experiment', fr: 'Ouvrir l’expérience', de: 'Experiment öffnen', ja: '実験を開く' })
                    : role === 'teacher'
                      ? tLang(language, { ar: 'عرض الفصول', en: 'View classes', fr: 'Voir les classes', de: 'Klassen anzeigen', ja: 'クラス一覧' })
                      : tLang(language, { ar: 'عرض التحليلات', en: 'View analytics', fr: 'Voir les analyses', de: 'Analysen anzeigen', ja: '学習分析を表示' })}
                <ArrowRight size={14} strokeWidth={1.8} className={ar ? 'rotate-180' : ''} />
              </button>
              {isResearcher ? (
                <button
                  type="button"
                  onClick={() => navigate('/app/classroom')}
                  className="sn-btn border border-white/15 bg-transparent text-white hover:bg-white/10"
                >
                  {tLang(language, { ar: 'السبورة الذكية', en: 'Smartboard', fr: 'Tableau interactif', de: 'Tafel', ja: '対話型黒板' })}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/app/curriculum')}
                  className="sn-btn border border-white/15 bg-transparent text-white hover:bg-white/10"
                >
                  {tLang(language, { ar: 'كل الدروس', en: 'All lessons', fr: 'Toutes les leçons', de: 'Alle Lektionen', ja: 'すべてのレッスン' })}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <SectionCard
            title={isResearcher
              ? tLang(language, { ar: 'النشاط البحثي الفعلي', en: 'Real Research Activity', fr: 'Activité de recherche réelle', de: 'Tatsächliche Forschungsaktivität', ja: '実研究アクティビティ' })
              : tLang(language, { ar: 'نشاط التعلم الفعلي', en: 'Real Learning Activity', fr: 'Activité d’apprentissage réelle', de: 'Tatsächliche Lernaktivität', ja: '実学習アクティビティ' })}
            bodyClassName="p-5"
          >
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="sn-number text-[38px] font-semibold leading-none tracking-[-0.05em]">
                  {labStats.totalHours}
                </div>
                <div className="mt-1 text-[11px] text-[#737373]">
                  {tLang(language, {
                    ar: 'ساعات استكشاف وتدريب حقيقية',
                    en: 'real hours in laboratories',
                    fr: 'heures réelles en laboratoire',
                    de: 'echte Stunden im Labor',
                    ja: '実験室での実稼働時間（時間）',
                  })}
                </div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 border-t border-[#f0f0f0] pt-4">
              {[
                {
                  v: isResearcher ? String(labStats.sessionsCount) : String(completed.length),
                  l: isResearcher
                    ? tLang(language, { ar: 'جلسات', en: 'sessions', fr: 'sessions', de: 'Sitzungen', ja: 'セッション' })
                    : tLang(language, { ar: 'دروس', en: 'lessons', fr: 'leçons', de: 'Lektionen', ja: 'レッスン' }),
                },
                {
                  v: `${labStats.exploredCount}/${labsCount}`,
                  l: tLang(language, { ar: 'معامل', en: 'labs', fr: 'labos', de: 'Labore', ja: '実験室' }),
                },
                {
                  v: isResearcher ? `${xp} XP` : `${progressPercent}%`,
                  l: isResearcher
                    ? tLang(language, { ar: 'خبرة', en: 'XP', fr: 'XP', de: 'XP', ja: 'XP' })
                    : tLang(language, { ar: 'إنجاز', en: 'progress', fr: 'succès', de: 'Erfolg', ja: '進捗' }),
                },
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
              title={tLang(language, { ar: 'القادم والتكليفات', en: 'Upcoming & Assignments', fr: 'Devoirs à venir', de: 'Anstehende Aufgaben', ja: '今後の予定・課題' })}
              action={<CalendarDays size={14} strokeWidth={1.7} className="text-[#a3a3a3]" />}
              bodyClassName="p-3"
            >
              {visibleAssignments.length > 0 ? (
                visibleAssignments.slice(0, 5).map((item) => {
                  const mySub = role === 'student'
                    ? submissions.find(
                        (s) =>
                          s.assignmentId === item.id &&
                          (namesMatch(s.studentQuadName, effectiveStudentIdentity) ||
                            namesMatch(s.studentQuadName, studentQuadName) ||
                            namesMatch(s.studentQuadName, user?.email))
                      )
                    : undefined;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-[10px] px-2 py-2 hover:bg-[#fafafa] transition-colors"
                    >
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedAssignmentForModal(item)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-start cursor-pointer group"
                      >
                        <span className={'sn-' + (item.linkedLab || 'chemistry') + ' sn-icon-tile !h-8 !w-8 !rounded-[8px]'}>
                          <FileCheck2 size={14} strokeWidth={1.7} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[12px] font-medium text-[#0a0a0a] group-hover:text-cyan-600 transition-colors">
                            {ar ? item.titleAr : item.titleEn}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-[#737373]">
                            <span>{ar ? item.dueDateAr : item.dueDateEn}</span>
                            {item.targetStudentQuadName && (
                              <>
                                <span>·</span>
                                <span className="text-blue-600 font-semibold">{tLang(language, { ar: 'تكليف خاص', en: 'Assigned to you', fr: 'Assigné', de: 'Zugewiesen', ja: '個別指定課題' })}</span>
                              </>
                            )}
                            {mySub && (
                              <>
                                <span>·</span>
                                <span className={mySub.status === 'graded' ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
                                  {mySub.status === 'graded'
                                    ? `${ar ? 'الدرجة:' : 'Score:'} ${mySub.score ?? 0}%`
                                    : (ar ? 'تم التسليم' : 'Submitted')}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setSelectedAssignmentForModal(item)}
                          className={`shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-semibold transition-all ${
                            mySub
                              ? mySub.status === 'graded'
                                ? 'border border-emerald-500/30 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                                : 'border border-amber-500/30 bg-amber-50 text-amber-800 hover:bg-amber-100'
                              : 'border border-[#0a0a0a] bg-[#0a0a0a] text-white hover:bg-neutral-800 shadow-sm'
                          }`}
                        >
                          {mySub
                            ? mySub.status === 'graded'
                              ? (ar ? 'عرض النتيجة' : 'View Grade')
                              : (ar ? 'عرض التسليم' : 'View Submission')
                            : (ar ? 'حل وتسليم' : 'Solve & Submit')}
                        </button>
                        <Link
                          to={'/app/labs/' + (item.linkedLab || 'chemistry')}
                          className="shrink-0 p-1 text-[#a3a3a3] hover:text-[#0a0a0a] transition-colors"
                          title={ar ? 'فتح المعمل 3D' : 'Open 3D Lab'}
                        >
                          <ArrowRight size={13} className={ar ? 'rotate-180' : ''} />
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-[11px] text-[#a3a3a3]">
                  {tLang(language, {
                    ar: role === 'student' && !linkedStudent
                      ? 'لا توجد تكليفات موجهة لك بعد. أضف بياناتك أو اطلب من معلمك ربطك بفصلك.'
                      : 'لا توجد تكليفات معلقة حالياً. استكشف المعامل بحرية!',
                    en: 'No pending assignments. Feel free to explore the labs!',
                    fr: 'Aucun devoir en attente. Explorez librement les laboratoires!',
                    de: 'Keine anstehenden Aufgaben. Erkunden Sie die Labore nach Belieben!',
                    ja: '未提出の課題はありません。自由に3D実験室を体験しましょう！',
                  })}
                </div>
              )}
            </SectionCard>
          )}

          {isResearcher && (
            <SectionCard
              title={tLang(language, { ar: 'المعامل التخصصية السريعة', en: 'Quick Lab Access', fr: 'Accès rapide aux labos', de: 'Schnellzugriff auf Labore', ja: '実験室クイックアクセス' })}
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
              {isResearcher
                ? tLang(language, { ar: `المعامل التخصصية الـ ${labsCount} للاستكشاف والبحث`, en: 'Specialist Laboratories for Research', fr: `${labsCount} laboratoires de recherche spécialisés`, de: `${labsCount} Fachlabore für Forschung`, ja: `研究・探究のための${labsCount}つの専門実験室` })
                : tLang(language, { ar: 'اختر مساحة للاكتشاف', en: 'Choose a lab room', fr: 'Choisir un laboratoire', de: 'Laborraum wählen', ja: '体験する実験室を選択' })}
            </h3>
            <p className="text-[11px] text-[#737373]">
              {tLang(language, {
                ar: 'معامل تفاعلية متكاملة مع أدوات قياس حقيقية ونتائج حية.',
                en: 'Interactive 3D environments with live measurement tools and instant results.',
                fr: 'Environnements 3D interactifs avec outils de mesure réels et résultats directs.',
                de: 'Interaktive 3D-Umgebungen mit echten Messwerkzeugen und Live-Ergebnissen.',
                ja: '高精度な測定ツールとリアルタイムシミュレーションを備えた対話型3D環境。',
              })}
            </p>
          </div>
          <Link to="/app/labs" className="sn-btn sn-btn-ghost sn-btn-sm text-[12px]">
            {tLang(language, { ar: 'كل المعامل', en: 'All labs', fr: 'Tous les labos', de: 'Alle Labore', ja: 'すべての実験室' })}
            <ArrowRight size={13} strokeWidth={1.8} className={ar ? 'rotate-180' : ''} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
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

      {/* نافذة حل ومراجعة الواجب للطلاب مع التصحيح التلقائي والمقالي والتجارب المصورة */}
      {selectedAssignmentForModal && (
        <StudentAssignmentModal
          isOpen={true}
          onClose={() => setSelectedAssignmentForModal(null)}
          assignment={selectedAssignmentForModal}
          existingSubmission={submissions.find(
            (s) =>
              s.assignmentId === selectedAssignmentForModal.id &&
              (namesMatch(s.studentQuadName, effectiveStudentIdentity) ||
                namesMatch(s.studentQuadName, studentQuadName) ||
                namesMatch(s.studentQuadName, user?.email))
          )}
          studentQuadName={effectiveStudentIdentity || studentQuadName || 'طالب SciNexa'}
          onSubmitted={(sub) => {
            setSubmissions(getSubmissions());
            void fetchAndSyncSubmissions().then((subs) => {
              if (subs) setSubmissions(subs);
            });
          }}
          ar={ar}
        />
      )}
    </div>
  );
};

export default DashboardHome;
