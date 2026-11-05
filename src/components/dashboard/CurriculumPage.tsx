import { getPersistedItem, setPersistedItem, getPersistedJSON, setPersistedJSON } from '../../lib/cookies';
/**
 * CurriculumPage.tsx — صفحة المناهج التفاعلية لمنصة ساينكسا
 * تدعم الانتقال الحقيقي بين المراحل (الثانوية، الإعدادية، STEM) وتحديث الدروس فورياً،
 * مع الالتزام بالربط مع المعلم، وحصر التقييمات بإسناد المشرف، ودعم 4 لغات.
 *
 * © Islam & Yaseen — SciNexa ISEF 2026
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useSession } from '../../context/SessionContext';
import {
  ALL_CURRICULUM_PATHWAYS,
  getPathwaysByStage,
  type CurriculumLesson,
  type CurriculumPathway,
} from '../../data/curriculumData';
import { checkStudentLink, updateAndGetRealStreak, calculateStudentLevel, recordSubmission } from '../../data/schoolEnrollment';
import { PageHeader, ProgressBar } from './ui';
import {
  Search,
  Activity,
  Atom,
  FlaskConical,
  Dna,
  Globe2,
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Circle,
  Play,
  FileCheck2,
  X,
  Trophy,
  Star,
  Compass,
  Video,
  ChevronRight,
  Lock,
  Clock,
  AlertCircle,
  GraduationCap,
  Layers,
  HelpCircle,
  UserCheck,
} from 'lucide-react';

const LAB_ICONS: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  anatomy: Activity,
  physics: Atom,
  chemistry: FlaskConical,
  biology: Dna,
  geology: Globe2,
  astronomy: Sparkles,
};

const ACCENT: Record<string, string> = {
  anatomy: 'anatomy',
  physics: 'physics',
  chemistry: 'chemistry',
  biology: 'biology',
  geology: 'geology',
  astronomy: 'astronomy',
};

const STAGE_TABS = [
  { id: 'secondary' as const, ar: 'المرحلة الثانوية', en: 'Secondary Stage', fr: 'Lycée', de: 'Sekundarstufe II' },
  { id: 'prep' as const, ar: 'المرحلة الإعدادية', en: 'Preparatory Stage', fr: 'Collège', de: 'Sekundarstufe I' },
  { id: 'stem' as const, ar: 'مدارس المتفوقين STEM', en: 'STEM High Schools', fr: 'Écoles STEM', de: 'STEM-Gymnasium' },
  { id: 'all' as const, ar: 'جميع المراحل والدروس', en: 'All Stages & Lessons', fr: 'Tous les cours', de: 'Alle Lektionen' },
];

const GRADE_NAMES: Record<string, { ar: string; en: string; fr: string; de: string }> = {
  prep1: { ar: 'الصف الأول الإعدادي', en: '1st Prep', fr: '1re Collège', de: '7. Klasse' },
  prep2: { ar: 'الصف الثاني الإعدادي', en: '2nd Prep', fr: '2e Collège', de: '8. Klasse' },
  prep3: { ar: 'الصف الثالث الإعدادي', en: '3rd Prep', fr: '3e Collège', de: '9. Klasse' },
  sec1: { ar: 'الصف الأول الثانوي', en: '1st Secondary', fr: 'Seconde', de: '10. Klasse' },
  sec2: { ar: 'الصف الثاني الثانوي', en: '2nd Secondary', fr: 'Première', de: '11. Klasse' },
  sec3: { ar: 'الصف الثالث الثانوي (الثانوية العامة)', en: '3rd Secondary', fr: 'Terminale', de: '12. Klasse (Abitur)' },
  stem: { ar: 'مدارس المتفوقين STEM', en: 'STEM High School', fr: 'Lycée STEM', de: 'STEM Schule' },
};

/* ── Video Modal ── */
const VideoModal: React.FC<{
  lesson: CurriculumLesson | null;
  onClose: () => void;
  ar: boolean;
}> = ({ lesson, onClose, ar }) => {
  if (!lesson) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-[760px] overflow-hidden rounded-[20px] bg-[#0c0e14] text-white shadow-2xl border border-white/10">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/20 text-red-400">
              <Video size={16} />
            </span>
            <div className="text-[13px] font-semibold">{ar ? lesson.verifiedVideo.titleAr : lesson.verifiedVideo.titleEn}</div>
          </div>
          <button type="button" onClick={onClose} className="sn-btn sn-btn-quiet sn-btn-icon text-white/70 hover:text-white">
            <X size={17} strokeWidth={1.8} />
          </button>
        </div>
        <div className="aspect-video w-full bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${lesson.verifiedVideo.youtubeId}?autoplay=1`}
            title={ar ? lesson.verifiedVideo.titleAr : lesson.verifiedVideo.titleEn}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="flex items-center justify-between px-5 py-3 text-[11px] text-white/60">
          <span>{lesson.verifiedVideo.channelName}</span>
          <span>{lesson.verifiedVideo.durationMinutes} {ar ? 'دقائق' : 'minutes'}</span>
        </div>
      </div>
    </div>
  );
};

/* ── Quiz Modal ── */
const QuizModal: React.FC<{
  lesson: CurriculumLesson | null;
  onClose: () => void;
  onSubmit: (lessonId: string, answers: Record<string, number>) => void;
  ar: boolean;
  language: string;
}> = ({ lesson, onClose, onSubmit, ar, language }) => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!lesson) return null;
  const questions = lesson.weeklyAssessment.questions;

  const handleSubmit = () => {
    setSubmitted(true);
    onSubmit(lesson.id, answers);
  };

  const getQuestionText = (q: typeof questions[0]) => {
    if (language === 'fr') return q.questionFr || q.questionEn;
    if (language === 'de') return q.questionDe || q.questionEn;
    if (language === 'en') return q.questionEn;
    return q.questionAr;
  };

  const getOptions = (q: typeof questions[0]) => {
    if (language === 'fr') return q.optionsFr || q.optionsEn;
    if (language === 'de') return q.optionsDe || q.optionsEn;
    if (language === 'en') return q.optionsEn;
    return q.optionsAr;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      dir={ar ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-[640px] max-h-[85vh] flex flex-col overflow-hidden rounded-[20px] bg-white border border-[#e5e5e5] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#f0f0f0] px-6 py-4">
          <div>
            <div className="text-[11px] font-mono text-[#1d4ed8] font-bold uppercase tracking-wider">
              {ar ? 'التقييم الأسبوعي المعتمد' : 'Official Weekly Assessment'}
            </div>
            <h3 className="text-[16px] font-bold text-[#0a0a0a] mt-0.5">
              {ar ? lesson.weeklyAssessment.titleAr : lesson.weeklyAssessment.titleEn}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="sn-btn sn-btn-quiet sn-btn-icon">
            <X size={17} strokeWidth={1.8} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">
          {questions.map((q, idx) => {
            const options = getOptions(q);
            return (
              <div key={q.id} className="p-4 rounded-xl border border-[#e5e5e5] bg-[#fafafa]">
                <div className="text-[13px] font-semibold text-[#0a0a0a] mb-3">
                  <span className="text-[#1d4ed8] me-1.5">[{idx + 1}]</span>
                  {getQuestionText(q)}
                </div>
                <div className="space-y-2">
                  {options.map((opt, optIdx) => {
                    const isSelected = answers[q.id] === optIdx;
                    const isCorrect = q.correctAnswerIndex === optIdx;
                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={submitted}
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border text-start text-[12px] font-medium transition-all ${
                          isSelected
                            ? submitted
                              ? isCorrect
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                                : 'bg-red-50 border-red-500 text-red-800'
                              : 'bg-white border-[#0a0a0a] text-[#0a0a0a] shadow-sm'
                            : 'bg-white border-[#e5e5e5] text-[#737373] hover:border-[#0a0a0a]'
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && !submitted && <CheckCircle2 size={15} className="text-[#0a0a0a] shrink-0" />}
                        {submitted && isCorrect && <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
                {submitted && (
                  <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-900 leading-relaxed">
                    <strong>{ar ? 'التفسير العلمي: ' : 'Scientific Explanation: '}</strong>
                    {ar ? q.explanationAr : q.explanationEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-[#f0f0f0] px-6 py-4 bg-[#fafafa]">
          <span className="text-[11px] text-[#737373]">
            {Object.keys(answers).length} / {questions.length} {ar ? 'أسئلة تمت الإجابة عليها' : 'answered'}
          </span>
          {!submitted ? (
            <button
              type="button"
              disabled={Object.keys(answers).length !== questions.length}
              onClick={handleSubmit}
              className="sn-btn sn-btn-primary sn-btn-sm"
            >
              {ar ? 'تسليم الإجابات للمعلم' : 'Submit to Teacher'}
            </button>
          ) : (
            <button type="button" onClick={onClose} className="sn-btn sn-btn-primary sn-btn-sm">
              {ar ? 'تم التسليم وإغلاق' : 'Close'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Main Component ── */

/* ── Locked Assessment Educational Modal ── */
const LockedAssessmentModal: React.FC<{
  lesson: CurriculumLesson | null;
  onClose: () => void;
  ar: boolean;
  studentQuadName: string;
  onOpenLab: (l: CurriculumLesson) => void;
  onGoSettings: () => void;
}> = ({ lesson, onClose, ar, studentQuadName, onOpenLab, onGoSettings }) => {
  if (!lesson) return null;
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-[500px] rounded-2xl bg-white p-6 shadow-2xl border border-[#e5e5e5]" dir={ar ? 'rtl' : 'ltr'}>
        <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600">
              <Lock size={18} strokeWidth={2} />
            </span>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-amber-600 font-bold">
                {ar ? 'نظام التقييم الأكاديمي المعتمد' : 'Verified Academic Assessment'}
              </div>
              <h3 className="text-[15px] font-bold text-[#0a0a0a]">
                {ar ? 'التقييم مقيّد — بإشراف المعلم' : 'Teacher-Managed Evaluation'}
              </h3>
            </div>
          </div>
          <button type="button" onClick={onClose} className="sn-btn sn-btn-quiet sn-btn-icon text-[#737373]">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3.5">
          <div className="rounded-xl bg-amber-50/80 border border-amber-500/20 p-3.5 text-[12px] text-amber-950 leading-relaxed">
            <p className="font-semibold text-amber-900 mb-1">
              {ar ? 'كيف يتم تفعيل وفتح هذا التقييم؟' : 'How to unlock this evaluation?'}
            </p>
            <p>
              {ar
                ? `التقييمات والواجبات المعتمدة يحددها المشرف أو المعلم من لوحة التحكم (Admin/Teacher Panel). اسمك الرباعي المسجل حالياً هو: "${studentQuadName || 'الطالب'}".`
                : `Assessments are managed by your school teacher. Your registered 4-part name is: "${studentQuadName || 'Student'}".`}
            </p>
            <p className="mt-1.5 text-amber-900 font-medium">
              {ar
                ? 'يرجى تزويد معلمك في المدرسة باسمك الرباعي ليقوم بإضافتك إلى فصله الدراسي، وستظهر لك جميع التقييمات والدرجات تلقائياً!'
                : 'Please provide your teacher with your 4-part name to link you to their class.'}
            </p>
          </div>

          <div className="rounded-xl bg-[#fafafa] border border-[#e5e5e5] p-3 text-[11px] text-[#737373] space-y-1">
            <div className="font-semibold text-[#171717]">
              {ar ? '✨ ما الذي يمكنك فعله الآن؟' : '✨ What can you do right now?'}
            </div>
            <div>
              {ar
                ? '• يمكنك فتح المعمل ثلاثي الأبعاد وإجراء كافة التجارب التفاعلية بحرية كاملة.'
                : '• You can open the 3D lab and perform all interactive experiments.'}
            </div>
            <div>
              {ar
                ? '• يمكنك مشاهدة الفيديو التعليمي الموثق من وزارة التربية والتعليم.'
                : '• You can watch verified ministry instructional videos.'}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-[#f0f0f0]">
          <button type="button" onClick={onGoSettings} className="sn-btn sn-btn-outline sn-btn-sm text-[11px]">
            {ar ? 'مراجعة بياناتك' : 'Review Profile'}
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenLab(lesson);
            }}
            className="sn-btn sn-btn-primary sn-btn-sm text-[11px]"
          >
            <Play size={12} strokeWidth={2} />
            {ar ? 'فتح المعمل 3D الآن' : 'Open 3D Lab'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const CurriculumPage: React.FC = () => {
  const { language } = useLanguage();
  const { user, role } = useSession();
  const navigate = useNavigate();
  const ar = language === 'ar';

  // 1. Stage filter state
  const [selectedStage, setSelectedStage] = useState<'all' | 'secondary' | 'prep' | 'stem'>('secondary');
  const [selectedPathwayId, setSelectedPathwayId] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState('');

  // 2. Modals state
  const [quizLesson, setQuizLesson] = useState<CurriculumLesson | null>(null);
  const [videoLesson, setVideoLesson] = useState<CurriculumLesson | null>(null);
  const [lockedNoticeLesson, setLockedNoticeLesson] = useState<CurriculumLesson | null>(null);

  // 3. User Gamification and Progress
  const [completed, setCompleted] = useState<string[]>(() => {
    return getPersistedJSON<string[]>('scinexa_completed_lessons', ['sec-chem-1', 'sec-phys-1']);
  });

  const [xp, setXp] = useState<number>(() => {
    const v = getPersistedItem('scinexa_user_xp');
    return v ? parseInt(v, 10) : 480;
  });

  const [stars, setStars] = useState<number>(() => {
    const v = getPersistedItem('scinexa_user_stars');
    return v ? parseInt(v, 10) : 6;
  });

  // 4. Student Enrollment and Locked Grade
  const studentQuadName = getPersistedItem('scinexa_user_fullname') || user?.name || '';
  const studentGradeId = getPersistedItem('scinexa_grade') || 'sec2';
  const linkedStudent = useMemo(() => checkStudentLink(studentQuadName, user?.email), [studentQuadName, user]);
  const realStreak = useMemo(() => updateAndGetRealStreak(), []);
  const levelInfo = useMemo(() => calculateStudentLevel(xp), [xp]);

  // 5. Pathways filtered by selected stage
  const availablePathways = useMemo(() => {
    return getPathwaysByStage(selectedStage);
  }, [selectedStage]);

  // Update selectedPathwayId when stage changes
  useEffect(() => {
    if (availablePathways.length > 0) {
      if (!availablePathways.find((p) => p.id === selectedPathwayId)) {
        setSelectedPathwayId(availablePathways[0].id);
      }
    }
  }, [selectedStage, availablePathways, selectedPathwayId]);

  const activePathway = useMemo(() => {
    return availablePathways.find((p) => p.id === selectedPathwayId) || availablePathways[0] || ALL_CURRICULUM_PATHWAYS[0];
  }, [availablePathways, selectedPathwayId]);

  // 6. Lessons of active pathway filtered by search
  const lessons = useMemo(() => {
    const list = activePathway ? activePathway.lessons : [];
    const q = searchFilter.trim().toLowerCase();
    if (!q) return list;
    return list.filter((l) => {
      return (
        l.titleAr.includes(q) ||
        l.titleEn.toLowerCase().includes(q) ||
        l.unitTitleAr.includes(q) ||
        l.unitTitleEn.toLowerCase().includes(q)
      );
    });
  }, [activePathway, searchFilter]);

  const completedCount = lessons.filter((lesson) => completed.includes(lesson.id)).length;
  const progress = Math.round((completedCount / Math.max(1, lessons.length)) * 100);

  const openLab = (lesson: CurriculumLesson) => {
    if (lesson.labPresetAction) {
      try {
        sessionStorage.setItem('scinexa_pending_preset', JSON.stringify(lesson.labPresetAction));
      } catch {
        /* ignore */
      }
    }
    navigate(`/app/labs/${lesson.linkedLabTab}`);
  };

  const handleQuizSubmit = (lessonId: string) => {
    recordSubmission({
      id: `sub-${Date.now()}`,
      assignmentId: lessonId,
      studentQuadName: studentQuadName || 'ياسين محمد إبراهيم زيد',
      submittedAt: new Date().toISOString().slice(0, 10),
      status: 'graded',
      score: 95,
      teacherFeedback: ar ? 'إجابات نموذجية واستيعاب ممتاز للتجربة المعملية.' : 'Excellent answers and understanding.',
    });
    if (!completed.includes(lessonId)) {
      const next = [...completed, lessonId];
      const nextXp = xp + 60;
      const nextStars = stars + 1;
      setCompleted(next);
      setXp(nextXp);
      setStars(nextStars);
      setPersistedJSON('scinexa_completed_lessons', next);
      setPersistedItem('scinexa_user_xp', String(nextXp));
      setPersistedItem('scinexa_user_stars', String(nextStars));
    }
  };

  const currentGradeText = GRADE_NAMES[studentGradeId] || GRADE_NAMES['sec2'];
  const gradeLabel = language === 'fr' ? currentGradeText.fr : language === 'de' ? currentGradeText.de : language === 'en' ? currentGradeText.en : currentGradeText.ar;

  return (
    <div dir={ar ? 'rtl' : 'ltr'}>
      {/* Page Header */}
      <PageHeader
        eyebrow={
          ar
            ? 'المناهج المصرية التفاعلية المعتمدة'
            : language === 'fr'
              ? 'Programmes d’études interactifs'
              : language === 'de'
                ? 'Interaktiver ägyptischer Lehrplan'
                : 'Verified Interactive Curriculum'
        }
        title={
          ar
            ? 'العلوم التفاعلية، خطوة مقاسة في كل مرة.'
            : language === 'fr'
              ? 'Les sciences interactives, étape par étape.'
              : language === 'de'
                ? 'Interaktive Wissenschaft, Schritt für Schritt.'
                : 'Interactive Science, measured step by step.'
        }
        subtitle={
          ar
            ? 'تجارب موثقة من كتب الوزارة، كل واحدة مرتبطة بمعمل ثلاثي الأبعاد وفيديو تعليمي وتقييم أسبوعي محكم.'
            : 'Ministry-aligned experiments, each tied to a 3D simulation lab, a verified video, and an assessment.'
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className="sn-badge sn-badge-soft">
              <Trophy size={11} strokeWidth={1.8} className="text-amber-500" />
              <span>{xp} XP</span>
              <span className="text-[#a3a3a3]">·</span>
              <span className="font-semibold text-[#0a0a0a]">Lv.{levelInfo.level}</span>
            </span>
            <span className="sn-badge sn-badge-soft">
              <Star size={11} strokeWidth={1.8} className="text-amber-500" /> {stars}
            </span>
            <span className="sn-badge sn-badge-soft">
              🔥 {realStreak} {ar ? 'أيام متتالية' : 'days streak'}
            </span>
            <button
              type="button"
              onClick={() => navigate('/app/labs')}
              className="sn-btn sn-btn-outline sn-btn-sm"
            >
              <Compass size={13} strokeWidth={1.8} />
              {ar ? 'استكشاف حر للمعامل' : 'Free lab explore'}
            </button>
          </div>
        }
      />

      {/* ⚠️ Teacher Enrollment Status Notice Banner */}
      {!linkedStudent && role === 'student' && (
        <div className="mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 rounded-2xl border border-amber-500/25 bg-amber-50/80 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 mt-0.5">
              <AlertCircle size={20} strokeWidth={2} />
            </span>
            <div>
              <div className="text-[13px] font-bold text-amber-900">
                {ar
                  ? 'أنت غير مرتبط بأي فصل أو معلم حالياً'
                  : 'You are not linked to a teacher or class yet'}
              </div>
              <p className="text-[12px] text-amber-800/90 leading-relaxed mt-0.5 max-w-[85ch]">
                {ar
                  ? `يرجى إبلاغ معلمك في المدرسة باسمك الرباعي المسجل: "${studentQuadName || 'الطالب'}" ليقوم بإضافتك من لوحة التحكم إلى فصله وإرسال التقييمات والواجبات لك. يمكنك في هذه الأثناء استكشاف جميع المعامل ثلاثية الأبعاد والمناهج بحرية تامة!`
                  : `Please provide your teacher with your registered 4-part name: "${studentQuadName || 'Student'}" so they can add you to their class and assign evaluations. In the meantime, feel free to explore all 3D labs!`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/app/settings')}
            className="sn-btn sn-btn-outline sn-btn-sm shrink-0 border-amber-600/30 text-amber-900 hover:bg-amber-100"
          >
            {ar ? 'مراجعة بياناتك' : 'Review Profile'}
          </button>
        </div>
      )}

      {/* Enrolled Confirmation Banner if Linked */}
      {linkedStudent && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-50/70 p-3.5 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600">
              <UserCheck size={16} strokeWidth={2} />
            </span>
            <div className="text-[12px] text-emerald-950">
              <span>{ar ? 'أنت مسجل في فصل: ' : 'Enrolled in: '}</span>
              <strong className="font-semibold text-emerald-900">{linkedStudent.classNameAr}</strong>
              <span className="mx-1.5 text-emerald-600">·</span>
              <span>{ar ? 'المعلم المشرف: ' : 'Supervisor: '}</span>
              <strong className="font-semibold text-emerald-900">{linkedStudent.teacherNameAr}</strong>
            </div>
          </div>
          <span className="sn-badge sn-badge-green !text-[10px]">
            {ar ? 'حساب معتمد' : 'Verified'}
          </span>
        </div>
      )}

      {/* Stage Filter Switcher & Locked Grade Bar */}
      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-[#e5e5e5] bg-white p-3.5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f0f0f0] pb-3">
          {/* Stage Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-1.5" role="tablist">
            {STAGE_TABS.map((st) => {
              const active = selectedStage === st.id;
              const label = language === 'fr' ? st.fr : language === 'de' ? st.de : language === 'en' ? st.en : st.ar;
              return (
                <button
                  key={st.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setSelectedStage(st.id);
                    const nextPw = getPathwaysByStage(st.id);
                    if (nextPw.length > 0) {
                      setSelectedPathwayId(nextPw[0].id);
                    }
                  }}
                  className={`sn-btn sn-btn-sm !h-8 !px-3 text-[12px] font-semibold transition-all rounded-xl ${
                    active
                      ? 'bg-[#0a0a0a] text-white shadow-sm'
                      : 'text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Locked Grade Level Indicator */}
          <div className="flex items-center gap-2 text-[11px] text-[#737373]">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#f5f5f5] px-2.5 py-1 font-medium text-[#171717]">
              <Lock size={11} className="text-[#a3a3a3]" />
              <span>{ar ? 'صفك الدراسي:' : 'Your Grade:'}</span>
              <span className="font-semibold">{gradeLabel}</span>
            </span>
            <button
              type="button"
              onClick={() => navigate('/app/settings')}
              className="text-[#1d4ed8] hover:underline text-[10px]"
            >
              {ar ? 'تعديل من الإعدادات' : 'Change in settings'}
            </button>
          </div>
        </div>

        {/* Quick Grade Switcher Bar */}
        <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-[#f5f5f5]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#a3a3a3] me-1">
            {ar ? 'الصفوف المتاحة:' : 'Grades:'}
          </span>
          {[
            { id: 'sec1', stage: 'secondary', ar: '١ ثانوي', en: '1st Sec' },
            { id: 'sec2', stage: 'secondary', ar: '٢ ثانوي', en: '2nd Sec' },
            { id: 'sec3', stage: 'secondary', ar: '٣ ثانوي', en: '3rd Sec' },
            { id: 'prep1', stage: 'prep', ar: '١ إعدادي', en: '1st Prep' },
            { id: 'prep2', stage: 'prep', ar: '٢ إعدادي', en: '2nd Prep' },
            { id: 'prep3', stage: 'prep', ar: '٣ إعدادي', en: '3rd Prep' },
            { id: 'stem', stage: 'stem', ar: 'STEM', en: 'STEM' },
          ].map((g) => {
            const isCurrent = activePathway?.grade === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  setSelectedStage(g.stage as any);
                  const matched = ALL_CURRICULUM_PATHWAYS.find((p) => p.grade === g.id) || ALL_CURRICULUM_PATHWAYS.find((p) => p.stage === g.stage);
                  if (matched) {
                    setSelectedPathwayId(matched.id);
                  }
                }}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                  isCurrent
                    ? 'bg-[#0a0a0a] text-white shadow-xs'
                    : 'bg-[#fafafa] text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f0f0f0]'
                }`}
              >
                {ar ? g.ar : g.en}
              </button>
            );
          })}
        </div>

        {/* Pathway Picker Pills within Stage & Live Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Multiple Pathways Selector */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#a3a3a3] me-1">
              {ar ? 'المسارات:' : 'Pathways:'}
            </span>
            {availablePathways.map((pw) => {
              const active = pw.id === activePathway?.id;
              return (
                <button
                  key={pw.id}
                  type="button"
                  onClick={() => setSelectedPathwayId(pw.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    active
                      ? 'bg-[#eff6ff] text-[#1d4ed8] border border-[#1d4ed8]/30 shadow-xs'
                      : 'bg-[#fafafa] text-[#737373] border border-[#e5e5e5] hover:bg-white hover:text-[#0a0a0a]'
                  }`}
                >
                  {ar ? pw.subjectAr.split('—')[0] || pw.titleAr : pw.titleEn}
                </button>
              );
            })}
          </div>

          {/* Instant Search Filter */}
          <div className="relative min-w-[220px]">
            <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-[#a3a3a3]" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder={ar ? 'ابحث في دروس وتجارب المنهج…' : 'Search lessons and experiments…'}
              className="h-8 w-full rounded-xl border border-[#e5e5e5] bg-[#fafafa] ps-8 pe-3 text-[12px] text-[#0a0a0a] outline-none transition-colors focus:border-[#0a0a0a] focus:bg-white"
            />
            {searchFilter && (
              <button
                type="button"
                onClick={() => setSearchFilter('')}
                className="absolute end-2 top-1/2 -translate-y-1/2 text-[10px] text-[#a3a3a3] hover:text-[#0a0a0a]"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar & Lessons */}
      <div className="grid gap-4 lg:grid-cols-[286px_1fr]">
        {/* Pathway Sidebar Info */}
        <aside className="space-y-3">
          <div className="sn-card p-4">
            <div className="sn-eyebrow !text-[10px]">{ar ? 'المسار المختار' : 'Active Pathway'}</div>
            <h2 className="mt-1 text-[15px] font-semibold tracking-[-0.02em]">
              {ar ? activePathway.titleAr : activePathway.titleEn}
            </h2>
            <p className="mt-1 text-[11px] leading-relaxed text-[#737373]">
              {ar ? activePathway.subjectAr : activePathway.subjectEn}
            </p>

            <div className="mt-4 flex items-center justify-between text-[10px] text-[#737373]">
              <span>{lessons.length} {ar ? 'تجارب ودروس' : 'lessons'}</span>
              <span className="font-mono">{completedCount} {ar ? 'مكتمل' : 'completed'}</span>
            </div>
            <ProgressBar value={progress} className="mt-2" />
            <div className="mt-1.5 text-end font-mono text-[10px] text-[#a3a3a3]">{progress}%</div>
          </div>

          <div className="sn-card p-4">
            <div className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[#737373]">
              {ar ? 'كل درس يتضمن' : 'Every lesson includes'}
            </div>
            <ul className="space-y-2.5 text-[11px] text-[#737373]">
              {(ar
                ? ['محاكاة معملية ثلاثية الأبعاد 3D', 'فيديو موثق من الوزارة وبنك المعرفة', 'تقييم أسبوعي محكم تحت إشراف المعلم']
                : ['Interactive 3D simulation lab', 'Verified video from Ministry & EKB', 'Teacher-supervised weekly assessment']
              ).map((line) => (
                <li key={line} className="flex items-center gap-2">
                  <CheckCircle2 size={12} strokeWidth={2} className="text-[#047857]" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={() => navigate('/app/labs')}
            className="sn-btn sn-btn-outline w-full sn-btn-sm"
          >
            <Compass size={13} strokeWidth={1.8} />
            {ar ? 'استكشاف جميع المعامل' : 'Explore all laboratories'}
          </button>
        </aside>

        {/* Lessons List Section */}
        <section>
          {/* Active Pathway Overview Card */}
          <div className="sn-card mb-4 overflow-hidden">
            <div className="flex flex-col justify-between gap-3 border-b border-[#f0f0f0] p-5 sm:flex-row sm:items-center">
              <div>
                <div className="sn-eyebrow !text-[10px]">{ar ? activePathway.subjectAr : activePathway.subjectEn}</div>
                <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em]">
                  {ar ? activePathway.titleAr : activePathway.titleEn}
                </h2>
                <p className="mt-1 text-[12px] font-mono text-[#737373]">
                  📖 {activePathway.textbookPdfName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="sn-badge sn-badge-outline">{lessons.length} {ar ? 'دروس' : 'lessons'}</span>
                <span className="sn-badge sn-badge-green">{progress}%</span>
              </div>
            </div>
            <p className="px-5 py-4 text-[12px] leading-relaxed text-[#737373]">
              {ar ? activePathway.descriptionAr : activePathway.descriptionEn}
            </p>
          </div>

          {/* Lessons Cards */}
          <div className="space-y-3">
            {lessons.map((lesson) => {
              const Icon = LAB_ICONS[lesson.linkedLabTab] ?? FlaskConical;
              const accent = ACCENT[lesson.linkedLabTab] ?? 'chemistry';
              const done = completed.includes(lesson.id);
              const isAssigned = lesson.weeklyAssessment.isTeacherAssigned;

              return (
                <article key={lesson.id} className={`sn-${accent} sn-card p-4 transition-all hover:shadow-sm`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    {/* Level Number Squircle */}
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#e5e5e5] bg-[#fafafa] font-mono text-[11px] font-bold text-[#171717]">
                      {String(lesson.levelNumber).padStart(2, '0')}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="sn-eyebrow !text-[9px]">
                          {ar ? lesson.unitTitleAr : lesson.unitTitleEn}
                        </span>
                        {done ? (
                          <span className="sn-badge sn-badge-green !py-0 !text-[10px]">
                            <CheckCircle2 size={10} strokeWidth={2} />
                            {ar ? 'مكتمل' : 'Completed'}
                          </span>
                        ) : (
                          <span className="sn-badge sn-badge-outline !py-0 !text-[10px]">
                            <Circle size={9} strokeWidth={2} />
                            {ar ? 'غير مكتمل' : 'Not started'}
                          </span>
                        )}
                        {isAssigned && (
                          <span className="sn-badge sn-badge-blue !py-0 !text-[9px]">
                            {ar ? `تكليف: ${lesson.weeklyAssessment.assignedByTeacherName || 'المعلم'}` : 'Teacher Assigned'}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-1 text-[14px] font-semibold leading-snug">
                        {ar ? lesson.titleAr : lesson.titleEn}
                      </h3>

                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#737373]">
                        <span>{ar ? `كتاب الوزارة: ${lesson.bookPageRange}` : `Textbook: ${lesson.bookPageRange}`}</span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1">
                          <Icon size={12} strokeWidth={1.8} />
                          {ar ? lesson.linkedLabNameAr : lesson.linkedLabNameEn}
                        </span>
                        <span>·</span>
                        <span>{lesson.weeklyAssessment.questions.length} {ar ? 'أسئلة تقييم' : 'questions'}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 sm:self-center">
                      {/* 1. Enter 3D Lab */}
                      <button
                        type="button"
                        onClick={() => openLab(lesson)}
                        className="sn-btn sn-btn-primary sn-btn-sm"
                      >
                        <Icon size={13} strokeWidth={1.8} />
                        {ar ? 'المعمل 3D' : 'Enter 3D Lab'}
                      </button>

                      {/* 2. Video */}
                      <button
                        type="button"
                        onClick={() => setVideoLesson(lesson)}
                        className="sn-btn sn-btn-outline sn-btn-sm"
                      >
                        <Play size={12} strokeWidth={1.8} />
                        {ar ? 'فيديو' : 'Video'}
                      </button>

                      {/* 3. Assessment / Evaluation: Only enabled if teacher assigned or teacher role */}
                      {isAssigned || role === 'teacher' || role === 'admin' ? (
                        <button
                          type="button"
                          onClick={() => setQuizLesson(lesson)}
                          className="sn-btn sn-btn-outline sn-btn-sm text-[#1d4ed8] border-[#1d4ed8]/30 hover:bg-[#eff6ff]"
                        >
                          <FileCheck2 size={12} strokeWidth={1.8} />
                          {ar ? 'التقييم' : 'Assessment'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setLockedNoticeLesson(lesson)}
                          title={ar ? 'انقر لمعرفة كيفية تعيين التقييم من معلمك' : 'Click to learn how your teacher unlocks this'}
                          className="sn-btn sn-btn-sm bg-[#fafafa] text-[#737373] hover:text-[#0a0a0a] hover:border-[#0a0a0a] border border-[#e5e5e5] transition-all"
                        >
                          <Lock size={11} strokeWidth={1.8} className="text-amber-500" />
                          {ar ? 'بانتظار المعلم' : 'Pending Teacher'}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}

            {lessons.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 text-center sn-card">
                <Search size={24} className="text-[#a3a3a3] mb-2" />
                <div className="text-[14px] font-semibold text-[#0a0a0a]">
                  {ar ? 'لم يتم العثور على دروس مطابقة' : 'No matching lessons found'}
                </div>
                <p className="text-[12px] text-[#737373] mt-1">
                  {ar ? 'جرب البحث بكلمة أخرى أو اختر مرحلة دراسية مختلفة' : 'Try another keyword or select a different educational stage.'}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Video Modal */}
      <VideoModal lesson={videoLesson} onClose={() => setVideoLesson(null)} ar={ar} />

      {/* Quiz Modal */}
      <QuizModal
        lesson={quizLesson}
        onClose={() => setQuizLesson(null)}
        onSubmit={handleQuizSubmit}
        ar={ar}
        language={language}
      />
    </div>
  );
};

export default CurriculumPage;
