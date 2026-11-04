import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { CURRICULUM_PATHWAY, type CurriculumLesson } from '../../data/curriculumPathway';
import { PageHeader, ProgressBar } from './ui';
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
  Circle,
  Play,
  FileCheck2,
  X,
  Trophy,
  Star,
  Compass,
  Video,
  ChevronRight,
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

const readCompleted = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem('scinexa_completed_lessons') || '["sec2-lesson-1"]');
  } catch {
    return ['sec2-lesson-1'];
  }
};

const readNumber = (key: string, fallback: number) => Number(localStorage.getItem(key) || fallback);

const QuizModal: React.FC<{
  lesson: CurriculumLesson;
  ar: boolean;
  onClose: () => void;
  onPass: () => void;
}> = ({ lesson, ar, onClose, onPass }) => {
  const questions = lesson.weeklyAssessment.questions;
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(() => {
    const correct = questions.filter((q) => answers[q.id] === q.correctAnswerIndex).length;
    return questions.length ? Math.round((correct / questions.length) * 100) : 0;
  }, [answers, questions]);

  useEffect(() => {
    if (!submitted) return;
    if (score >= 70) onPass();
  }, [submitted, score, onPass]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-[#0a0a0a]/30 backdrop-blur-[3px]" onClick={onClose} aria-label={ar ? 'إغلاق' : 'Close'} />
      <div className="relative flex max-h-[88vh] w-full max-w-[640px] flex-col overflow-hidden rounded-[24px] border border-[#e5e5e5] bg-white shadow-[0_30px_90px_-30px_rgba(10,10,10,0.45)]">
        <div className="flex items-start justify-between gap-3 border-b border-[#e5e5e5] px-5 py-4">
          <div>
            <div className="sn-eyebrow !text-[10px]">{ar ? 'تقييم أسبوعي' : 'Weekly assessment'}</div>
            <h2 className="mt-1 text-[16px] font-semibold tracking-[-0.02em]">
              {ar ? lesson.weeklyAssessment.titleAr : `Week ${lesson.weeklyAssessment.weekNumber} assessment`}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="sn-btn sn-btn-quiet sn-btn-icon" aria-label={ar ? 'إغلاق' : 'Close'}>
            <X size={17} strokeWidth={1.8} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {!submitted ? (
            <div className="space-y-6">
              {questions.map((q, qi) => (
                <div key={q.id}>
                  <div className="mb-2.5 flex gap-2">
                    <span className="font-mono text-[10px] text-[#a3a3a3]">{String(qi + 1).padStart(2, '0')}</span>
                    <p className="text-[13px] font-medium leading-relaxed">{ar ? q.questionAr : q.questionEn}</p>
                  </div>
                  <div className="space-y-1.5">
                    {(ar ? q.optionsAr : q.optionsEn).map((option, oi) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: oi }))}
                        className={`flex w-full items-start gap-2.5 rounded-[10px] border px-3 py-2.5 text-start text-[12px] leading-relaxed transition-all ${
                          answers[q.id] === oi
                            ? 'border-[#0a0a0a] bg-white shadow-[0_0_0_1px_#0a0a0a]'
                            : 'border-[#e5e5e5] bg-[#fafafa] hover:border-[#d4d4d4]'
                        }`}
                      >
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[#d4d4d4] font-mono text-[8px]">
                          {String.fromCharCode(65 + oi)}
                        </span>
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div className="mb-5 flex items-center gap-4 rounded-[16px] border border-[#e5e5e5] bg-[#fafafa] p-4">
                <span className={`flex h-12 w-12 items-center justify-center rounded-full ${score >= 70 ? 'bg-[#ecfdf5] text-[#047857]' : 'bg-[#fff1f2] text-[#be123c]'}`}>
                  <Trophy size={20} strokeWidth={1.7} />
                </span>
                <div>
                  <div className="text-[22px] font-semibold tracking-[-0.04em]">{score}%</div>
                  <div className="text-[11px] text-[#737373]">
                    {score >= 70
                      ? ar
                        ? 'تم إتقان الدرس وإضافة ٥٠ نقطة.'
                        : 'Lesson mastered. 50 XP added.'
                      : ar
                        ? 'راجع الشرح ثم أعد المحاولة.'
                        : 'Review the explanations and try again.'}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {questions.map((q, qi) => {
                  const correct = answers[q.id] === q.correctAnswerIndex;
                  return (
                    <div key={q.id} className="rounded-[12px] border border-[#e5e5e5] p-3.5">
                      <div className="mb-1.5 flex items-start gap-2">
                        {correct ? (
                          <CheckCircle2 size={14} strokeWidth={1.9} className="mt-0.5 shrink-0 text-[#047857]" />
                        ) : (
                          <X size={14} strokeWidth={1.9} className="mt-0.5 shrink-0 text-[#be123c]" />
                        )}
                        <p className="text-[12px] font-medium leading-relaxed">
                          {qi + 1}. {ar ? q.questionAr : q.questionEn}
                        </p>
                      </div>
                      <p className="ps-5 text-[11px] leading-relaxed text-[#737373]">
                        {ar ? q.explanationAr : q.explanationEn}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#e5e5e5] px-5 py-4">
          <span className="text-[11px] text-[#737373]">
            {questions.length} {ar ? 'أسئلة' : 'questions'}
          </span>
          {!submitted ? (
            <button
              type="button"
              disabled={Object.keys(answers).length !== questions.length}
              onClick={() => setSubmitted(true)}
              className="sn-btn sn-btn-primary sn-btn-sm"
            >
              {ar ? 'إرسال الإجابات' : 'Submit answers'}
            </button>
          ) : (
            <button type="button" onClick={onClose} className="sn-btn sn-btn-primary sn-btn-sm">
              {ar ? 'إغلاق' : 'Close'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const CurriculumPage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const ar = language === 'ar';

  const [completed, setCompleted] = useState<string[]>(readCompleted);
  const [xp, setXp] = useState(() => readNumber('scinexa_user_xp', 450));
  const [stars, setStars] = useState(() => readNumber('scinexa_user_stars', 6));
  const [quizLesson, setQuizLesson] = useState<CurriculumLesson | null>(null);
  const [videoLesson, setVideoLesson] = useState<CurriculumLesson | null>(null);

  const pathway = CURRICULUM_PATHWAY;
  const lessons = pathway.lessons;
  const completedCount = lessons.filter((lesson) => completed.includes(lesson.id)).length;
  const progress = Math.round((completedCount / Math.max(1, lessons.length)) * 100);

  const markComplete = (lesson: CurriculumLesson) => {
    if (completed.includes(lesson.id)) return;
    const next = [...completed, lesson.id];
    const nextXp = xp + 50;
    const nextStars = stars + 1;
    setCompleted(next);
    setXp(nextXp);
    setStars(nextStars);
    localStorage.setItem('scinexa_completed_lessons', JSON.stringify(next));
    localStorage.setItem('scinexa_user_xp', String(nextXp));
    localStorage.setItem('scinexa_user_stars', String(nextStars));
  };

  const openLab = (lesson: CurriculumLesson) => {
    if (lesson.labPresetAction) {
      try {
        sessionStorage.setItem(
          'scinexa_pending_preset',
          JSON.stringify({
            reagents: lesson.labPresetAction.reagents ?? [],
            heat: lesson.labPresetAction.heat ?? false,
          })
        );
      } catch {
        /* ignore storage errors */
      }
    }
    navigate(`/app/labs/${lesson.linkedLabTab}`);
  };

  return (
    <div>
      <PageHeader
        eyebrow={ar ? 'المناهج' : 'Curriculum'}
        title={ar ? 'الكيمياء، خطوة مقاسة في كل مرة.' : 'Chemistry, one measured step at a time.'}
        subtitle={
          ar
            ? 'ثماني تجارب من كتاب الوزارة، كل واحدة مرتبطة بمعمل ثلاثي الأبعاد وفيديو موثّق وتقييم أسبوعي.'
            : 'Eight Ministry-aligned experiments, each linked to a 3D lab, a verified video and a weekly assessment.'
        }
        actions={
          <>
            <span className="sn-badge sn-badge-soft">
              <Trophy size={11} strokeWidth={1.8} /> {xp} XP
            </span>
            <span className="sn-badge sn-badge-soft">
              <Star size={11} strokeWidth={1.8} /> {stars}
            </span>
            <button type="button" onClick={() => navigate('/app/labs')} className="sn-btn sn-btn-outline sn-btn-sm">
              <Compass size={13} strokeWidth={1.8} />
              {ar ? 'استكشاف حر' : 'Free explore'}
            </button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[286px_1fr]">
        <aside className="space-y-3">
          <div className="sn-card p-4">
            <div className="sn-eyebrow !text-[10px]">{ar ? 'المسار' : 'Pathway'}</div>
            <h2 className="mt-1 text-[15px] font-semibold tracking-[-0.02em]">
              {ar ? pathway.titleAr : pathway.titleEn}
            </h2>
            <p className="mt-1 text-[11px] leading-relaxed text-[#737373]">
              {ar ? pathway.subjectAr : pathway.subjectEn}
            </p>

            <div className="mt-4 flex items-center justify-between text-[10px] text-[#737373]">
              <span>{lessons.length} {ar ? 'دروس' : 'lessons'}</span>
              <span className="font-mono">{completedCount} {ar ? 'مكتمل' : 'complete'}</span>
            </div>
            <ProgressBar value={progress} className="mt-2" />
            <div className="mt-1.5 text-end font-mono text-[10px] text-[#a3a3a3]">{progress}%</div>
          </div>

          <div className="sn-card p-4">
            <div className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[#737373]">
              {ar ? 'كل درس يشمل' : 'Every lesson includes'}
            </div>
            <ul className="space-y-2.5 text-[11px] text-[#737373]">
              {(ar
                ? ['تجربة ثلاثية الأبعاد', 'فيديو موثّق', 'تقييم أسبوعي من الوزارة']
                : ['A 3D laboratory', 'A verified video', 'A Ministry weekly assessment']
              ).map((line) => (
                <li key={line} className="flex items-center gap-2">
                  <CheckCircle2 size={12} strokeWidth={2} className="text-[#047857]" />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <button type="button" onClick={() => navigate('/app/labs')} className="sn-btn sn-btn-outline w-full sn-btn-sm">
            <Compass size={13} strokeWidth={1.8} />
            {ar ? 'استكشاف حر للمعامل' : 'Free lab exploration'}
          </button>
        </aside>

        <section>
          <div className="sn-card mb-4 overflow-hidden">
            <div className="flex flex-col justify-between gap-3 border-b border-[#f0f0f0] p-5 sm:flex-row sm:items-center">
              <div>
                <div className="sn-eyebrow !text-[10px]">{ar ? pathway.subjectAr : pathway.subjectEn}</div>
                <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em]">{ar ? pathway.titleAr : pathway.titleEn}</h2>
                <p className="mt-1 text-[12px] text-[#737373]">{ar ? pathway.textbookPdfName : pathway.textbookPdfName}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="sn-badge sn-badge-outline">{lessons.length} {ar ? 'دروس' : 'lessons'}</span>
                <span className="sn-badge sn-badge-green">{progress}%</span>
              </div>
            </div>
            <p className="px-5 py-4 text-[12px] leading-relaxed text-[#737373]">
              {ar ? pathway.descriptionAr : pathway.descriptionEn}
            </p>
          </div>

          <div className="space-y-2.5">
            {lessons.map((lesson) => {
              const Icon = LAB_ICONS[lesson.linkedLabTab] ?? FlaskConical;
              const accent = ACCENT[lesson.linkedLabTab] ?? 'chemistry';
              const done = completed.includes(lesson.id);
              return (
                <article key={lesson.id} className={`sn-${accent} sn-card p-4`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#e5e5e5] font-mono text-[10px] text-[#737373]">
                      {String(lesson.levelNumber).padStart(2, '0')}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="sn-eyebrow !text-[9px]">{ar ? lesson.unitTitleAr : lesson.unitTitleEn}</span>
                        {done ? (
                          <span className="sn-badge sn-badge-green !py-0 !text-[10px]">
                            <CheckCircle2 size={10} strokeWidth={2} />
                            {ar ? 'مكتمل' : 'Complete'}
                          </span>
                        ) : (
                          <span className="sn-badge sn-badge-outline !py-0 !text-[10px]">
                            <Circle size={9} strokeWidth={2} />
                            {ar ? 'غير مكتمل' : 'Not started'}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-1.5 text-[14px] font-semibold leading-snug">
                        {ar ? lesson.titleAr : lesson.titleEn}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-[#737373]">
                        {lesson.bookPageRange && <span>{ar ? 'الكتاب' : 'Book'} · {lesson.bookPageRange}</span>}
                        <span className="inline-flex items-center gap-1">
                          <Video size={11} strokeWidth={1.8} />
                          {lesson.verifiedVideo.durationMinutes} {ar ? 'دقائق' : 'min'}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <FileCheck2 size={11} strokeWidth={1.8} />
                          {lesson.weeklyAssessment.questions.length} {ar ? 'أسئلة' : 'questions'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 sm:shrink-0">
                      <button type="button" onClick={() => openLab(lesson)} className="sn-btn sn-btn-primary sn-btn-sm">
                        <Icon size={13} strokeWidth={1.8} />
                        {ar ? 'المعمل' : 'Lab'}
                      </button>
                      <button type="button" onClick={() => setVideoLesson(lesson)} className="sn-btn sn-btn-outline sn-btn-sm">
                        <Play size={12} strokeWidth={1.8} />
                        {ar ? 'فيديو' : 'Video'}
                      </button>
                      <button type="button" onClick={() => setQuizLesson(lesson)} className="sn-btn sn-btn-outline sn-btn-sm">
                        <FileCheck2 size={12} strokeWidth={1.8} />
                        {ar ? 'تقييم' : 'Quiz'}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-[16px] border border-[#e5e5e5] bg-[#fafafa] p-4">
            <div className="flex items-center gap-2.5">
              <BookOpen size={16} strokeWidth={1.7} className="text-[#737373]" />
              <span className="text-[12px] text-[#737373]">
                {ar ? 'مصدر المنهج:' : 'Curriculum source:'}{' '}
                <span className="font-mono text-[#171717]">{pathway.textbookPdfName}</span>
              </span>
            </div>
            <button type="button" onClick={() => navigate('/app/labs')} className="sn-link !text-[12px]">
              {ar ? 'كل المعامل' : 'All labs'}
              <ChevronRight size={13} strokeWidth={1.8} className={ar ? 'rotate-180' : ''} />
            </button>
          </div>
        </section>
      </div>

      {quizLesson && (
        <QuizModal
          lesson={quizLesson}
          ar={ar}
          onClose={() => setQuizLesson(null)}
          onPass={() => markComplete(quizLesson)}
        />
      )}

      {videoLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-[#0a0a0a]/40 backdrop-blur-[4px]"
            onClick={() => setVideoLesson(null)}
            aria-label={ar ? 'إغلاق' : 'Close'}
          />
          <div className="relative w-full max-w-[760px] overflow-hidden rounded-[24px] border border-[#e5e5e5] bg-white shadow-[0_30px_90px_-30px_rgba(10,10,10,0.5)]">
            <div className="flex items-center justify-between gap-3 border-b border-[#e5e5e5] px-5 py-3.5">
              <div>
                <div className="sn-eyebrow !text-[10px]">{ar ? 'فيديو موثّق' : 'Verified video'}</div>
                <h3 className="mt-1 text-[14px] font-semibold">
                  {ar ? videoLesson.verifiedVideo.titleAr : videoLesson.titleEn}
                </h3>
              </div>
              <button type="button" onClick={() => setVideoLesson(null)} className="sn-btn sn-btn-quiet sn-btn-icon" aria-label={ar ? 'إغلاق' : 'Close'}>
                <X size={17} strokeWidth={1.8} />
              </button>
            </div>
            <div className="aspect-video w-full bg-[#0a0a0a]">
              <iframe
                title={ar ? videoLesson.verifiedVideo.titleAr : videoLesson.titleEn}
                src={`https://www.youtube-nocookie.com/embed/${videoLesson.verifiedVideo.youtubeId}`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="flex items-center justify-between gap-3 px-5 py-3.5">
              <span className="text-[11px] text-[#737373]">
                {videoLesson.verifiedVideo.channelName} · {videoLesson.verifiedVideo.durationMinutes} {ar ? 'دقائق' : 'min'}
              </span>
              <a
                href={`https://www.youtube.com/watch?v=${videoLesson.verifiedVideo.youtubeId}`}
                target="_blank"
                rel="noreferrer"
                className="sn-link !text-[12px]"
              >
                {ar ? 'فتح على يوتيوب' : 'Open on YouTube'}
                <ArrowRight size={13} strokeWidth={1.8} className={ar ? 'rotate-180' : ''} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurriculumPage;
