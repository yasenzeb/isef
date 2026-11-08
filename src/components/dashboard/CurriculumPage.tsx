import { getPersistedItem, setPersistedItem, getPersistedJSON, setPersistedJSON } from '../../lib/cookies';
/**
 * CurriculumPage.tsx — صفحة المناهج التفاعلية المطورة لمنصة ساينكسا
 * مطابقة لمناهج وزارة التربية والتعليم المصرية لجميع المراحل:
 * - المرحلة الثانوية (الأول والثاني والثالث الثانوي)
 * - المرحلة الإعدادية (الأول والثاني والثالث الإعدادي)
 * - مدارس المتفوقين STEM
 *
 * كل درس يحتوي على:
 * 1. زر فوري لفتح المعمل ثلاثي الأبعاد 3D المرتبط بالتجربة
 * 2. تقييم أسبوعي تفاعلي متاح لجميع الطلاب لكسب نقاط XP والنجوم دون أقفال تعسفية
 * 3. فيديو تعليمي موثق
 * 4. دعم كامل للغات الأربع (عربي، إنجليزي، فرنسي، ألماني)
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
import { updateAndGetRealStreak, calculateStudentLevel, recordSubmission } from '../../data/schoolEnrollment';
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
  GraduationCap,
  Layers,
  HelpCircle,
  Sparkle
} from 'lucide-react';

const LAB_ICONS: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  anatomy: Activity,
  physics: Atom,
  chemistry: FlaskConical,
  biology: Dna,
  geology: Globe2,
  astronomy: Sparkles,
};

const ACCENT_COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  chemistry: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-600', badge: 'sn-badge-amber' },
  physics: { bg: 'bg-sky-500/10', border: 'border-sky-500/30', text: 'text-sky-600', badge: 'sn-badge-blue' },
  anatomy: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-600', badge: 'sn-badge-red' },
  biology: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-600', badge: 'sn-badge-green' },
  geology: { bg: 'bg-teal-500/10', border: 'border-teal-500/30', text: 'text-teal-600', badge: 'sn-badge-teal' },
  astronomy: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-600', badge: 'sn-badge-indigo' },
};

const GRADE_FILTERS = [
  { id: 'all', stage: 'all', ar: 'جميع الصفوف', en: 'All Grades', fr: 'Toutes les classes', de: 'Alle Klassen' },
  { id: 'sec1', stage: 'secondary', ar: '١ ثانوي', en: '1st Secondary', fr: '1re Lycée', de: '10. Klasse' },
  { id: 'sec2', stage: 'secondary', ar: '٢ ثانوي', en: '2nd Secondary', fr: '2e Lycée', de: '11. Klasse' },
  { id: 'sec3', stage: 'secondary', ar: '٣ ثانوي (الثانوية العامة)', en: '3rd Secondary (Thanaweya)', fr: 'Terminale', de: '12. Klasse (Abitur)' },
  { id: 'prep1', stage: 'prep', ar: '١ إعدادي', en: '1st Prep', fr: '1re Collège', de: '7. Klasse' },
  { id: 'prep2', stage: 'prep', ar: '٢ إعدادي', en: '2nd Prep', fr: '2e Collège', de: '8. Klasse' },
  { id: 'prep3', stage: 'prep', ar: '٣ إعدادي', en: '3rd Prep', fr: '3e Collège', de: '9. Klasse' },
  { id: 'stem', stage: 'stem', ar: 'مدارس STEM', en: 'STEM Schools', fr: 'Écoles STEM', de: 'STEM Schulen' },
];

/* ── Interactive Video Modal ── */
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-[780px] overflow-hidden rounded-[24px] bg-[#0c0e14] text-white shadow-2xl border border-white/15">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/20 text-red-400">
              <Video size={17} />
            </span>
            <div>
              <div className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider">
                {ar ? 'شرح مرئي معتمد من وزارة التربية والتعليم' : 'Verified Educational Video'}
              </div>
              <h3 className="text-[14px] font-bold text-white mt-0.5">
                {ar ? lesson.verifiedVideo.titleAr : lesson.verifiedVideo.titleEn}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={17} strokeWidth={2} />
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

        <div className="flex items-center justify-between px-5 py-3 text-[11px] text-white/60 bg-[#08090d]">
          <span>{lesson.verifiedVideo.channelName}</span>
          <span>{lesson.verifiedVideo.durationMinutes} {ar ? 'دقائق' : 'minutes'}</span>
        </div>
      </div>
    </div>
  );
};

/* ── Interactive Quiz Modal (Always Unlocked & Instant Feedback) ── */
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

  const totalAnswered = Object.keys(answers).length;
  const scoreCount = submitted
    ? questions.reduce((acc, q) => acc + (answers[q.id] === q.correctAnswerIndex ? 1 : 0), 0)
    : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      dir={ar ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-[640px] max-h-[88vh] flex flex-col overflow-hidden rounded-[24px] bg-white border border-[#e2e8f0] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#f1f5f9] px-6 py-4 bg-[#f8fafc]">
          <div>
            <div className="text-[10px] font-mono text-[#0284c7] font-bold uppercase tracking-wider">
              {ar ? 'التقييم والتدريب التفاعلي المباشر' : 'Interactive Assessment'}
            </div>
            <h3 className="text-[16px] font-bold text-[#0f172a] mt-0.5">
              {ar ? lesson.weeklyAssessment.titleAr : lesson.weeklyAssessment.titleEn}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-[#64748b] hover:bg-[#e2e8f0] flex items-center justify-center transition-colors"
          >
            <X size={17} strokeWidth={2} />
          </button>
        </div>

        {/* Questions Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5">
          {submitted && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between">
              <div>
                <div className="text-[14px] font-bold">
                  {ar ? '🎉 أحسنت! تم إتمام التقييم واحتساب درجات الإتقان' : '🎉 Assessment Completed!'}
                </div>
                <div className="text-[12px] text-emerald-700 mt-0.5">
                  {ar ? `درجتك: ${scoreCount} من ${questions.length} أسئلة صحيحة (+60 XP)` : `Score: ${scoreCount}/${questions.length} (+60 XP)`}
                </div>
              </div>
              <span className="sn-badge sn-badge-green !text-[12px] font-bold">
                {Math.round((scoreCount / questions.length) * 100)}%
              </span>
            </div>
          )}

          {questions.map((q, idx) => {
            const options = getOptions(q);
            const userChoice = answers[q.id];
            const isCorrect = userChoice === q.correctAnswerIndex;

            return (
              <div key={q.id} className="p-4 rounded-2xl border border-[#e2e8f0] bg-[#fafafa]">
                <div className="text-[13px] font-bold text-[#0f172a] mb-3">
                  <span className="text-[#0284c7] me-1.5 font-mono">[{idx + 1}]</span>
                  {getQuestionText(q)}
                </div>

                <div className="space-y-2">
                  {options.map((opt, optIdx) => {
                    const isSelected = userChoice === optIdx;
                    const isRightAnswer = q.correctAnswerIndex === optIdx;

                    let btnClass = 'bg-white border-[#cbd5e1] text-[#475569] hover:border-[#0284c7]';
                    if (isSelected && !submitted) {
                      btnClass = 'bg-[#0284c7] text-white border-[#0284c7] shadow-sm';
                    } else if (submitted) {
                      if (isRightAnswer) {
                        btnClass = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                      } else if (isSelected && !isRightAnswer) {
                        btnClass = 'bg-red-50 border-red-500 text-red-900 line-through';
                      }
                    }

                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={submitted}
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border text-start text-[12px] font-medium transition-all ${btnClass}`}
                      >
                        <span>{opt}</span>
                        {isSelected && !submitted && <CheckCircle2 size={15} className="text-white shrink-0" />}
                        {submitted && isRightAnswer && <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {submitted && (
                  <div className="mt-3 p-3 rounded-xl bg-[#f0f9ff] border border-[#bae6fd] text-[11px] text-[#0369a1] leading-relaxed">
                    <strong>{ar ? '💡 التفسير العلمي: ' : '💡 Scientific Explanation: '}</strong>
                    {ar ? q.explanationAr : q.explanationEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#f1f5f9] px-6 py-4 bg-[#f8fafc]">
          <span className="text-[11px] text-[#64748b]">
            {totalAnswered} / {questions.length} {ar ? 'تمت الإجابة عليها' : 'answered'}
          </span>

          {!submitted ? (
            <button
              type="button"
              disabled={totalAnswered !== questions.length}
              onClick={handleSubmit}
              className="sn-btn sn-btn-primary sn-btn-sm font-bold text-[12px] px-5"
            >
              {ar ? 'تأكيد الإجابات واحتساب النتيجة' : 'Submit Answers'}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="sn-btn sn-btn-primary sn-btn-sm font-bold text-[12px] px-5"
            >
              {ar ? 'تم وتثبيت النقاط' : 'Done & Close'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── MAIN CURRICULUM COMPONENT ── */
export const CurriculumPage: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useSession();
  const navigate = useNavigate();
  const ar = language === 'ar';

  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [quizLesson, setQuizLesson] = useState<CurriculumLesson | null>(null);
  const [videoLesson, setVideoLesson] = useState<CurriculumLesson | null>(null);

  // Student gamification state
  const [completed, setCompleted] = useState<string[]>(() => {
    return getPersistedJSON<string[]>('scinexa_completed_lessons', []);
  });

  const [xp, setXp] = useState<number>(() => {
    const v = getPersistedItem('scinexa_user_xp');
    return v ? parseInt(v, 10) : 0;
  });

  const [stars, setStars] = useState<number>(() => {
    const v = getPersistedItem('scinexa_user_stars');
    return v ? parseInt(v, 10) : 0;
  });

  const realStreak = useMemo(() => updateAndGetRealStreak(), []);
  const levelInfo = useMemo(() => calculateStudentLevel(xp), [xp]);

  // Filter all pathways based on selected grade
  const filteredPathways = useMemo(() => {
    return ALL_CURRICULUM_PATHWAYS.filter((pw) => {
      if (selectedGrade !== 'all' && pw.grade !== selectedGrade && pw.stage !== selectedGrade) {
        return false;
      }
      if (selectedSubject !== 'all' && pw.accent !== selectedSubject) {
        return false;
      }
      return true;
    });
  }, [selectedGrade, selectedSubject]);

  // Flatten lessons from filtered pathways with search filter
  const allFilteredLessons = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const result: { lesson: CurriculumLesson; pathway: CurriculumPathway }[] = [];

    filteredPathways.forEach((pw) => {
      pw.lessons.forEach((l) => {
        if (!q) {
          result.push({ lesson: l, pathway: pw });
        } else {
          const match =
            l.titleAr.includes(q) ||
            l.titleEn.toLowerCase().includes(q) ||
            l.unitTitleAr.includes(q) ||
            l.unitTitleEn.toLowerCase().includes(q) ||
            pw.titleAr.includes(q) ||
            pw.titleEn.toLowerCase().includes(q);

          if (match) {
            result.push({ lesson: l, pathway: pw });
          }
        }
      });
    });

    return result;
  }, [filteredPathways, searchQuery]);

  const totalLessonsCount = allFilteredLessons.length;
  const completedLessonsCount = allFilteredLessons.filter((item) => completed.includes(item.lesson.id)).length;
  const progressPercent = totalLessonsCount > 0 ? Math.round((completedLessonsCount / totalLessonsCount) * 100) : 0;

  const open3DLab = (lesson: CurriculumLesson) => {
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
      studentQuadName: user?.name || 'طالب متميز',
      submittedAt: new Date().toISOString().slice(0, 10),
      status: 'graded',
      score: 100,
      teacherFeedback: ar ? 'إجابات ممتازة وتقييم معتمد.' : 'Excellent score.',
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

  return (
    <div dir={ar ? 'rtl' : 'ltr'}>
      {/* ── Page Header ── */}
      <PageHeader
        eyebrow={ar ? 'المناهج المصرية التفاعلية المعتمدة' : 'Verified Egyptian STEM Curriculum'}
        title={ar ? 'المناهج والعلوم التفاعلية خطوة بخطوة' : 'Interactive Science Curriculum, Step by Step'}
        subtitle={
          ar
            ? 'تجارب تفاعلية موثقة من كتب وزارة التربية والتعليم، كل تجربة مرتبطة بمعمل ثلاثي الأبعاد وتقييم أسبوعي فوري.'
            : 'Interactive experiments from Ministry textbooks, each linked to a 3D laboratory and assessment.'
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className="sn-badge sn-badge-soft flex items-center gap-1.5">
              <Trophy size={13} className="text-amber-500" />
              <span>{xp} XP</span>
              <span className="text-[#94a3b8]">·</span>
              <span className="font-bold">Lv.{levelInfo.level}</span>
            </span>
            <span className="sn-badge sn-badge-soft flex items-center gap-1">
              <Star size={13} className="text-amber-500 fill-amber-500" />
              <span>{stars}</span>
            </span>
            <span className="sn-badge sn-badge-soft">
              🔥 {realStreak} {ar ? 'أيام متتالية' : 'days streak'}
            </span>
          </div>
        }
      />

      {/* ── Modern Stage & Grade Filter Bar ── */}
      <div className="mb-6 rounded-3xl border border-[#e2e8f0] bg-white p-4 shadow-sm space-y-4">
        {/* Grade Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f1f5f9] pb-3.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#94a3b8] font-bold">
              {ar ? 'الصف الدراسي:' : 'Grade Level:'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {GRADE_FILTERS.map((g) => {
              const active = selectedGrade === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedGrade(g.id)}
                  className={`px-3 py-1.5 rounded-xl text-[11.5px] font-bold transition-all ${
                    active
                      ? 'bg-[#0f172a] text-white shadow-xs'
                      : 'bg-[#f8fafc] text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9]'
                  }`}
                >
                  {ar ? g.ar : g.en}
                </button>
              );
            })}
          </div>
        </div>

        {/* Subjects Filter & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#94a3b8] font-bold me-1">
              {ar ? 'المادة:' : 'Subject:'}
            </span>
            {[
              { id: 'all', ar: 'الكل', en: 'All' },
              { id: 'chemistry', ar: 'الكيمياء', en: 'Chemistry' },
              { id: 'physics', ar: 'الفيزياء', en: 'Physics' },
              { id: 'biology', ar: 'الأحياء', en: 'Biology' },
              { id: 'anatomy', ar: 'التشريح', en: 'Anatomy' },
              { id: 'geology', ar: 'الجيولوجيا', en: 'Geology' },
              { id: 'astronomy', ar: 'الفلك', en: 'Astronomy' },
            ].map((sub) => {
              const active = selectedSubject === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelectedSubject(sub.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    active
                      ? 'bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]'
                      : 'bg-[#f8fafc] text-[#64748b] hover:text-[#0f172a]'
                  }`}
                >
                  {ar ? sub.ar : sub.en}
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative min-w-[240px]">
            <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={ar ? 'ابحث عن درس، قانون، تجربة...' : 'Search lessons, formulas, labs...'}
              className="h-9 w-full rounded-xl border border-[#cbd5e1] bg-[#f8fafc] ps-8 pe-3 text-[12px] text-[#0f172a] outline-none transition-colors focus:border-[#0284c7] focus:bg-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute end-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[#94a3b8] hover:text-[#0f172a]"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Progress Status Bar ── */}
      <div className="mb-6 rounded-2xl bg-white border border-[#e2e8f0] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0284c7]/10 text-[#0284c7]">
            <BookOpen size={20} strokeWidth={2} />
          </span>
          <div>
            <div className="text-[13px] font-bold text-[#0f172a]">
              {ar ? 'معدل إنجاز الدروس والتجارب المعتمدة' : 'Curriculum Completion Rate'}
            </div>
            <div className="text-[11px] text-[#64748b] mt-0.5">
              {completedLessonsCount} {ar ? 'دروس مكتملة من إجمالي' : 'completed of'} {totalLessonsCount} {ar ? 'درساً معتمداً' : 'lessons'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 min-w-[200px]">
          <div className="flex-1">
            <ProgressBar value={progressPercent} />
          </div>
          <span className="font-mono text-[13px] font-bold text-[#0284c7]">{progressPercent}%</span>
        </div>
      </div>

      {/* ── Lessons Grid ── */}
      {allFilteredLessons.length === 0 ? (
        <div className="py-16 text-center rounded-3xl border border-[#e2e8f0] bg-white p-8">
          <BookOpen size={36} className="mx-auto text-[#94a3b8] mb-3" />
          <h3 className="text-[16px] font-bold text-[#0f172a]">
            {ar ? 'لا توجد دروس مطابقة للبحث' : 'No lessons match your search'}
          </h3>
          <p className="text-[12px] text-[#64748b] mt-1">
            {ar ? 'جرّب اختيار صف دراسي آخر أو مسح كلمة البحث.' : 'Try selecting another grade or clearing the search.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {allFilteredLessons.map(({ lesson, pathway }) => {
            const Icon = LAB_ICONS[lesson.linkedLabTab] || FlaskConical;
            const accent = ACCENT_COLORS[lesson.linkedLabTab] || ACCENT_COLORS.chemistry;
            const isDone = completed.includes(lesson.id);

            return (
              <div
                key={lesson.id}
                className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar of card */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${accent.bg} ${accent.text}`}>
                        <Icon size={20} strokeWidth={2.2} />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#94a3b8]">
                            {ar ? pathway.titleAr.split('·')[0] : pathway.titleEn.split('·')[0]}
                          </span>
                          <span className="text-[#cbd5e1]">·</span>
                          <span className="text-[10px] font-semibold text-[#0284c7]">
                            {ar ? lesson.unitTitleAr : lesson.unitTitleEn}
                          </span>
                        </div>
                        <h4 className="text-[15px] font-bold text-[#0f172a] mt-0.5 leading-snug">
                          {ar ? lesson.titleAr : lesson.titleEn}
                        </h4>
                      </div>
                    </div>

                    {isDone ? (
                      <span className="sn-badge sn-badge-green !text-[10px] shrink-0 flex items-center gap-1">
                        <CheckCircle2 size={11} strokeWidth={2.5} />
                        <span>{ar ? 'مكتمل' : 'Completed'}</span>
                      </span>
                    ) : (
                      <span className="sn-badge sn-badge-outline !text-[10px] shrink-0">
                        {ar ? 'قيد التدريب' : 'In Progress'}
                      </span>
                    )}
                  </div>

                  {/* Textbook page & Details */}
                  <div className="text-[11px] text-[#64748b] leading-relaxed mb-4 flex items-center gap-2">
                    <span>📖 {ar ? `كتاب الوزارة: ص ${lesson.bookPageRange}` : `Textbook p. ${lesson.bookPageRange}`}</span>
                    <span>·</span>
                    <span>🧪 {ar ? lesson.linkedLabNameAr : lesson.linkedLabNameEn}</span>
                  </div>
                </div>

                {/* Action Buttons Bar */}
                <div className="pt-3.5 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => open3DLab(lesson)}
                    className="sn-btn sn-btn-primary sn-btn-sm text-[11px] font-bold flex items-center gap-1.5"
                  >
                    <Play size={12} strokeWidth={2.2} />
                    <span>{ar ? 'افتح المعمل 3D' : 'Open 3D Lab'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setVideoLesson(lesson)}
                      className="sn-btn sn-btn-outline sn-btn-sm text-[11px] font-semibold flex items-center gap-1 text-[#475569]"
                      title={ar ? 'مشاهدة الشرح المرئي' : 'Watch video'}
                    >
                      <Video size={13} className="text-red-500" />
                      <span className="hidden sm:inline">{ar ? 'فيديو' : 'Video'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setQuizLesson(lesson)}
                      className="sn-btn sn-btn-outline sn-btn-sm text-[11px] font-bold flex items-center gap-1 text-[#0284c7] border-[#bae6fd] hover:bg-[#e0f2fe]"
                    >
                      <FileCheck2 size={13} />
                      <span>{ar ? 'حل التقييم والأسئلة' : 'Assessment'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modals ── */}
      {videoLesson && (
        <VideoModal
          lesson={videoLesson}
          onClose={() => setVideoLesson(null)}
          ar={ar}
        />
      )}

      {quizLesson && (
        <QuizModal
          lesson={quizLesson}
          onClose={() => setQuizLesson(null)}
          onSubmit={handleQuizSubmit}
          ar={ar}
          language={language}
        />
      )}
    </div>
  );
};
