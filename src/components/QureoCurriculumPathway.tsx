/**
 * QureoCurriculumPathway.tsx — منظومة مسارات المناهج والمستويات التتابعية (نظام كيريو QUREO الياباني)
 * يتيح للطالب تحديد صفه الدراسي (ابتدائي، إعدادي، ثانوي/بكالوريا) ومتابعة تقدمه في دروس الكتاب المدرسي
 * مع ربط كل درس بتجربة معملية 3D، وفيديو موثق، واختبار تقييم أسبوعي من كراسة الوزارة،
 * مع الحفاظ التام على حرية الاستكشاف الكامل لمنصة SciNexa دون أي قيود.
 *
 * © Islam & Yaseen — SciNexa ISEF 2026
 * SHA-256: b35dcc2b2495508cd11d6e6294915f7211adfc93ce1a2188d81858b9cd38123f
 */

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  GRADES_CURRICULUM_DATA,
  GradeCurriculum,
  CurriculumLesson,
  CurriculumQuizQuestion
} from '../data/curriculum/gradesCurriculumData';
import {
  Sparkles,
  Trophy,
  CheckCircle2,
  Play,
  FlaskConical,
  BookOpen,
  Award,
  Video,
  FileCheck2,
  X,
  Compass,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface QureoCurriculumPathwayProps {
  onNavigateLab: (tab: string, presetReagents?: string[], heat?: boolean) => void;
  onExploreFreeLabs: () => void;
}

export const QureoCurriculumPathway: React.FC<QureoCurriculumPathwayProps> = ({
  onNavigateLab,
  onExploreFreeLabs
}) => {
  const { language, isRTL } = useLanguage();
  const ar = language === 'ar';

  // Selected Grade ID (persisted in localStorage)
  const [selectedGradeId, setSelectedGradeId] = useState<string>(() => {
    return localStorage.getItem('scinexa_selected_grade') || 'sec2_chem_bac';
  });

  // Completed Lessons Set
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('scinexa_completed_lessons');
      return saved ? JSON.parse(saved) : ['sec2-lesson-1'];
    } catch {
      return ['sec2-lesson-1'];
    }
  });

  // User XP & Stars
  const [userXp, setUserXp] = useState<number>(() => {
    return Number(localStorage.getItem('scinexa_user_xp') || 450);
  });
  const [userStars, setUserStars] = useState<number>(() => {
    return Number(localStorage.getItem('scinexa_user_stars') || 6);
  });

  // Active Video Modal
  const [activeVideoLesson, setActiveVideoLesson] = useState<CurriculumLesson | null>(null);

  // Active Quiz Modal
  const [activeQuizLesson, setActiveQuizLesson] = useState<CurriculumLesson | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<{ [qId: string]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  // Active Grade Data
  const currentGrade = GRADES_CURRICULUM_DATA.find(g => g.id === selectedGradeId) || GRADES_CURRICULUM_DATA[0];

  // Save grade preference
  const handleSelectGrade = (gradeId: string) => {
    setSelectedGradeId(gradeId);
    localStorage.setItem('scinexa_selected_grade', gradeId);
  };

  // Save progress
  const markLessonCompleted = (lessonId: string) => {
    if (!completedLessonIds.includes(lessonId)) {
      const updated = [...completedLessonIds, lessonId];
      setCompletedLessonIds(updated);
      localStorage.setItem('scinexa_completed_lessons', JSON.stringify(updated));

      const newXp = userXp + 50;
      const newStars = userStars + 1;
      setUserXp(newXp);
      setUserStars(newStars);
      localStorage.setItem('scinexa_user_xp', String(newXp));
      localStorage.setItem('scinexa_user_stars', String(newStars));
    }
  };

  // Launch virtual lab with custom preset
  const handleLaunchLab = (lesson: CurriculumLesson) => {
    if (lesson.labPresetAction?.type === 'chemistry_preset') {
      onNavigateLab('chemistry', lesson.labPresetAction.reagents, lesson.labPresetAction.heat);
    } else {
      onNavigateLab(lesson.linkedLabTab);
    }
  };

  // Calculate Progress Percentage for Current Grade
  const currentGradeLessons = currentGrade.lessons;
  const completedInGrade = currentGradeLessons.filter(l => completedLessonIds.includes(l.id)).length;
  const progressPercent = Math.round((completedInGrade / Math.max(1, currentGradeLessons.length)) * 100);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* ── 1. QUREO HEADER DASHBOARD: GRADE SELECTOR & XP STATS ── */}
      <div className="rounded-3xl p-5 sm:p-6 bg-[#101426] border border-cyan-500/30 shadow-2xl space-y-5 relative overflow-hidden">
        {/* Glow Background Gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Info Bar */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                {ar ? 'منظومة كيريو (QUREO) للتعلم التتابعي القائم على الإتقان' : 'QUREO Mastery-Based Learning Engine'}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
              {ar ? 'مسارات المناهج الدراسية الرسمية والمستويات التفاعلية' : 'Official Curriculum & Interactive Grade Roadmaps'}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {ar
                ? 'اختر صفك الدراسي لمتابعة تسلسل دروس كتاب الوزارة، والتجارب المعملية ثلاثية الأبعاد، والفيديوهات الموثقة، وتقييمات الوزارة الأسبوعية. ويمكنك في أي لحظة الخروج للاستكشاف الحر لجميع المعامل.'
                : 'Select your grade to follow Ministry textbook units, 3D lab simulations, verified video walk-throughs, and weekly assessments.'}
            </p>
          </div>

          {/* Gamification Stats: XP & Stars & Free Exploration Button */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* XP Points */}
            <div className="px-3.5 py-2 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-2 shadow-lg">
              <Trophy className="w-4 h-4 text-amber-300 animate-bounce" />
              <div>
                <span className="text-[10px] text-amber-200/70 font-mono block leading-none">{ar ? 'نقاط الخبرة' : 'EXP'}</span>
                <span className="text-sm font-black font-mono text-amber-300">{userXp} XP</span>
              </div>
            </div>

            {/* Stars */}
            <div className="px-3.5 py-2 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center gap-2 shadow-lg">
              <Sparkles className="w-4 h-4 text-indigo-300" />
              <div>
                <span className="text-[10px] text-indigo-200/70 font-mono block leading-none">{ar ? 'نجوم الإتقان' : 'Stars'}</span>
                <span className="text-sm font-black font-mono text-indigo-300">{userStars} ⭐</span>
              </div>
            </div>

            {/* Free Exploration Mode Button */}
            <button
              onClick={onExploreFreeLabs}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Compass className="w-4 h-4" />
              <span>{ar ? '🌐 وضع الاستكشاف الحر لكافة المعامل' : '🌐 Free Lab Exploration Mode'}</span>
            </button>
          </div>
        </div>

        {/* ── Grade Selection Carousel / Tabs ── */}
        <div className="space-y-2 relative z-10">
          <span className="text-xs font-mono font-bold text-slate-300 block">
            {ar ? 'اختر المرحلة والصف الدراسي لعرض منهجه:' : 'Select Grade to Load Curriculum:'}
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {GRADES_CURRICULUM_DATA.map((grade) => {
              const isSelected = grade.id === selectedGradeId;
              return (
                <button
                  key={grade.id}
                  onClick={() => handleSelectGrade(grade.id)}
                  className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 shadow-xl shadow-cyan-500/20 ring-2 ring-cyan-400/80 scale-[1.02]'
                      : 'bg-slate-900/80 border-white/10 hover:border-white/30 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-lg">{grade.icon}</span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block truncate">
                      {ar ? grade.gradeAr : grade.gradeEn}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block truncate mt-0.5">
                      {ar ? grade.subjectAr.split('—')[0] : grade.subjectEn.split('—')[0]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Grade Progress Bar */}
        <div className="relative z-10 pt-2 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <span>{currentGrade.icon}</span>
              <span>{ar ? currentGrade.gradeAr : currentGrade.gradeEn}</span>
              <span className="text-slate-500 font-normal">({completedInGrade}/{currentGradeLessons.length} {ar ? 'درس مكتمل' : 'completed'})</span>
            </span>
            <span className="text-cyan-300 font-black">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-950 border border-white/10 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 transition-all duration-500 shadow-lg"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── 2. QUREO LESSONS ROADMAP (LEVEL BY LEVEL) ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white">
              {ar ? 'خريطة المستويات والدروس المنهجية (نظام كيريو)' : 'QUREO Level & Mission Roadmap'}
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {ar ? `مرجع الكتاب المدرسي: ${currentGrade.textbookPdfName}` : `Source: ${currentGrade.textbookPdfName}`}
          </span>
        </div>

        {/* Lessons List Grid */}
        <div className="space-y-3">
          {currentGrade.lessons.map((lesson, idx) => {
            const isCompleted = completedLessonIds.includes(lesson.id);

            return (
              <div
                key={lesson.id}
                className={`p-4 sm:p-5 rounded-3xl border transition-all relative overflow-hidden ${
                  isCompleted
                    ? 'bg-[#0d1629] border-emerald-500/40 shadow-lg shadow-emerald-950/30'
                    : 'bg-[#0e1224] border-white/10 hover:border-cyan-500/40'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  
                  {/* Left: Level Icon & Info */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Level Number Squircle */}
                    <div
                      className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 font-mono font-black border transition-all ${
                        isCompleted
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                          : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                      }`}
                    >
                      <span className="text-[10px] leading-none text-slate-400 uppercase">{ar ? 'مستوى' : 'LVL'}</span>
                      <span className="text-base leading-none font-bold mt-1">{lesson.levelNumber}</span>
                    </div>

                    {/* Lesson Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[11px] font-mono text-slate-400">
                          {ar ? lesson.unitTitleAr : lesson.unitTitleEn}
                        </span>
                        {lesson.bookPageRange && (
                          <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded-full text-slate-300 border border-white/10">
                            📖 {lesson.bookPageRange}
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {ar ? 'تم الإتقان ✓' : 'Mastered ✓'}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                        {ar ? lesson.titleAr : lesson.titleEn}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {ar ? `المعمل المرتبط: ${lesson.linkedLabNameAr}` : `Linked Lab: ${lesson.linkedLabTab}`}
                      </p>
                    </div>
                  </div>

                  {/* Right: 3 QUREO Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0">
                    
                    {/* 1. Launch 3D Simulation */}
                    <button
                      onClick={() => handleLaunchLab(lesson)}
                      className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95"
                    >
                      <FlaskConical className="w-4 h-4" />
                      <span>{ar ? '🔬 التجربة 3D' : '🔬 3D Lab'}</span>
                    </button>

                    {/* 2. Watch Verified Video Walkthrough */}
                    <button
                      onClick={() => setActiveVideoLesson(lesson)}
                      className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/15 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all hover:border-amber-400/50"
                    >
                      <Video className="w-4 h-4 text-amber-400" />
                      <span>{ar ? '🎥 فيديو التجربة' : '🎥 Video'}</span>
                    </button>

                    {/* 3. Weekly MOE Assessment Quiz */}
                    <button
                      onClick={() => {
                        setActiveQuizLesson(lesson);
                        setQuizAnswers({});
                        setQuizSubmitted(false);
                      }}
                      className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                        isCompleted
                          ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                          : 'bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 shadow-md shadow-amber-500/10'
                      }`}
                    >
                      <FileCheck2 className="w-4 h-4" />
                      <span>{ar ? '📝 تقييم الوزارة' : '📝 MOE Quiz'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. VERIFIED VIDEO MODAL ── */}
      {activeVideoLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-[#0d1222] border border-cyan-500/40 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-5 sm:p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    {activeVideoLesson.verifiedVideo.titleAr}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    {ar ? `القناة المعتمدة: ${activeVideoLesson.verifiedVideo.channelName}` : activeVideoLesson.verifiedVideo.channelName}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveVideoLesson(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Embedded Responsive Video Player */}
            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 relative">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideoLesson.verifiedVideo.youtubeId}?autoplay=1&rel=0`}
                title={activeVideoLesson.verifiedVideo.titleAr}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-400 font-mono">
                {ar ? 'فيديو موثق للاستخدام التعليمي — متوافق مع منهج الوزارة' : 'Verified educational laboratory demonstration'}
              </span>
              <button
                onClick={() => {
                  const lesson = activeVideoLesson;
                  setActiveVideoLesson(null);
                  handleLaunchLab(lesson);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <FlaskConical className="w-4 h-4" />
                <span>{ar ? 'الانتقال للتطبيق العملي في المعمل 3D ←' : 'Open 3D Lab Simulation →'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. WEEKLY MOE ASSESSMENT QUIZ MODAL ── */}
      {activeQuizLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#0e1428] border border-indigo-500/40 rounded-3xl overflow-hidden shadow-2xl p-5 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold">
                  📝
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {ar ? activeQuizLesson.weeklyAssessment.titleAr : activeQuizLesson.titleEn}
                  </h3>
                  <span className="text-xs font-mono text-cyan-300">
                    {ar ? `التقييم الأسبوعي الرسمي (الأسبوع ${activeQuizLesson.weeklyAssessment.weekNumber})` : `Official MOE Week ${activeQuizLesson.weeklyAssessment.weekNumber}`}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveQuizLesson(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Questions List */}
            <div className="space-y-5">
              {activeQuizLesson.weeklyAssessment.questions.map((q, qIndex) => {
                const selectedOpt = quizAnswers[q.id];
                const isAnswered = selectedOpt !== undefined;

                return (
                  <div key={q.id} className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3">
                    <span className="text-xs font-mono text-amber-300 font-bold block">
                      {ar ? `السؤال (${qIndex + 1}):` : `Question ${qIndex + 1}:`}
                    </span>
                    <p className="text-sm font-bold text-white leading-relaxed">
                      {ar ? q.questionAr : q.questionEn}
                    </p>

                    {/* Options */}
                    <div className="space-y-2 pt-1">
                      {q.optionsAr.map((optAr, optIdx) => {
                        const isChosen = selectedOpt === optIdx;
                        let btnStyle = 'bg-slate-950/70 border-white/10 text-slate-200 hover:border-white/30';

                        if (quizSubmitted) {
                          if (optIdx === q.correctAnswerIndex) {
                            btnStyle = 'bg-emerald-950 border-emerald-400 text-emerald-200 font-bold ring-1 ring-emerald-400';
                          } else if (isChosen && optIdx !== q.correctAnswerIndex) {
                            btnStyle = 'bg-rose-950 border-rose-400 text-rose-200 font-bold';
                          }
                        } else if (isChosen) {
                          btnStyle = 'bg-cyan-950/60 border-cyan-400 text-cyan-200 ring-1 ring-cyan-400';
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={quizSubmitted}
                            onClick={() => {
                              setQuizAnswers({ ...quizAnswers, [q.id]: optIdx });
                            }}
                            className={`w-full p-3 rounded-xl border text-right text-xs transition-all flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{ar ? optAr : q.optionsEn[optIdx]}</span>
                            <span className="font-mono text-[11px] opacity-60">
                              {['أ', 'ب', 'ج', 'د'][optIdx]}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Detailed Scientific Explanation after Submit */}
                    {quizSubmitted && (
                      <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 space-y-1">
                        <span className="font-bold font-mono block">💡 {ar ? 'التفسير العلمي الوزاري:' : 'Scientific Explanation:'}</span>
                        <p className="text-[11px] leading-relaxed text-slate-300">
                          {ar ? q.explanationAr : q.explanationEn}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quiz Submit & Score Footer */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-white/10">
              {quizSubmitted ? (
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-sm">
                    {ar ? `النتيجة: ${quizScore}/${activeQuizLesson.weeklyAssessment.questions.length}` : `Score: ${quizScore}/${activeQuizLesson.weeklyAssessment.questions.length}`}
                  </div>
                  <span className="text-xs text-amber-300 font-bold">
                    +50 XP & 1 ⭐ {ar ? 'تمت إضافتها لرصيدك!' : 'Awarded!'}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-slate-400 font-mono">
                  {ar ? 'أجب عن جميع الأسئلة ثم اضغط اعتماد النتيجة' : 'Answer questions to submit evaluation'}
                </span>
              )}

              {quizSubmitted ? (
                <button
                  onClick={() => setActiveQuizLesson(null)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  {ar ? 'إغلاق واستكمال المنهج ✓' : 'Done & Continue ✓'}
                </button>
              ) : (
                <button
                  onClick={() => {
                    let score = 0;
                    activeQuizLesson.weeklyAssessment.questions.forEach(q => {
                      if (quizAnswers[q.id] === q.correctAnswerIndex) {
                        score++;
                      }
                    });
                    setQuizScore(score);
                    setQuizSubmitted(true);
                    markLessonCompleted(activeQuizLesson.id);
                  }}
                  disabled={Object.keys(quizAnswers).length < activeQuizLesson.weeklyAssessment.questions.length}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    Object.keys(quizAnswers).length >= activeQuizLesson.weeklyAssessment.questions.length
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {ar ? 'اعتماد نتيجة التقييم وحفظ التقدم' : 'Submit Evaluation'}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
export default QureoCurriculumPathway;
