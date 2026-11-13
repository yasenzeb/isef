import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  Image as ImageIcon,
  FileText,
  Check,
  Award,
  Clock,
  Sparkles,
  Maximize2,
  Trash2,
  Send,
  Eye,
  Beaker,
  CheckSquare,
} from 'lucide-react';
import type { AssignmentItem, AssignmentQuestion, StudentAnswer, StudentSubmission } from '../../data/schoolEnrollment';
import { recordSubmission } from '../../data/schoolEnrollment';

interface StudentAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: AssignmentItem | null;
  existingSubmission?: StudentSubmission | null;
  studentQuadName: string;
  onSubmitted: (submission: StudentSubmission) => void;
  ar: boolean;
}

/**
 * دالة لضغط الصور تلقائياً عبر Canvas لتوليد Base64 خفيف وسريع يناسب Supabase
 */
const compressImageToBase64 = (file: File, maxDim = 1200, quality = 0.82): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(e.target?.result || ''));
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        resolve(canvas.toDataURL(mime, quality));
      };
      img.src = String(e.target?.result || '');
    };
    reader.readAsDataURL(file);
  });
};

/**
 * نماذج أسئلة تلقائية علمية عند عدم تحديد المعلم لأسئلة تفصيلية
 */
const generateDefaultQuestions = (assignment: AssignmentItem): AssignmentQuestion[] => {
  const lab = assignment.linkedLab || 'chemistry';
  if (lab === 'chemistry') {
    return [
      {
        id: 'q-mcq-1',
        type: 'mcq',
        questionAr: 'ما العامل المؤكسد في تفاعل إمرار الهيدروجين الجاف على أكسيد النحاس الأسود المسخن؟',
        questionEn: 'What is the oxidizing agent in the reaction of dry hydrogen with heated copper oxide?',
        options: ['أكسيد النحاس CuO', 'غاز الهيدروجين H2', 'بخار الماء H2O', 'عنصر النحاس Cu'],
        correctAnswer: 0,
        points: 30,
      },
      {
        id: 'q-essay-1',
        type: 'essay',
        questionAr: 'صف التغير اللوني الحادث في أنبوبة التفاعل واكتب المعادلة الكيميائية الموزونة الدالة على ذلك.',
        questionEn: 'Describe the color change observed in the tube and write the balanced chemical equation.',
        points: 35,
        instructionsAr: 'اذكر لون أكسيد النحاس قبل التسخين واللون الناتج بعد انتهاء التفاعل.',
      },
      {
        id: 'q-lab-1',
        type: 'lab_work',
        questionAr: 'صورة أو لقطة شاشة من المعمل الافتراضي توضح اكتمال التجربة وظهور النحاس الأحمر.',
        questionEn: 'Screenshot or photo from the 3D lab verifying experiment completion and red copper deposit.',
        points: 35,
        instructionsAr: 'ارفع لقطة شاشة من معمل الكيمياء ثلاثي الأبعاد أو صورة لتقريرك المعملي المكتوب بخط اليد.',
      },
    ];
  }

  if (lab === 'physics') {
    return [
      {
        id: 'q-mcq-1',
        type: 'mcq',
        questionAr: 'عند مضاعفة فرق الجهد الكهربائي بين طرفي موصل نقي مع ثبوت درجة الحرارة، فإن شدة التيار المار فيه:',
        questionEn: 'When the potential difference across a conductor is doubled at constant temperature, the current:',
        options: ['تتضاعف للضعف', 'تقل للنصف', 'تظل ثابتة لا تتغير', 'تنعدم تماماً'],
        correctAnswer: 0,
        points: 30,
      },
      {
        id: 'q-essay-1',
        type: 'essay',
        questionAr: 'وضح نص قانون أوم والعلاقة الرياضية المستخدمة لحساب المقاومة الكهربائية، مع ذكر وحدات القياس.',
        questionEn: 'State Ohm’s Law and the mathematical relationship used to calculate electrical resistance.',
        points: 35,
      },
      {
        id: 'q-lab-1',
        type: 'lab_work',
        questionAr: 'صورة الدائرة الكهربائية الافتراضية مع قراءات الفولتميتر والأميتر ورسم بياني للعلاقة.',
        questionEn: 'Photo or screenshot of the electrical circuit with voltmeter and ammeter readings.',
        points: 35,
      },
    ];
  }

  // Generic Science default
  return [
    {
      id: 'q-mcq-1',
      type: 'mcq',
      questionAr: 'ما الخطوة الأولى في المنهج العلمي المتبع عند إجراء أي تجربة واستقصاء؟',
      questionEn: 'What is the first step in the scientific method during experimental inquiry?',
      options: ['الملاحظة وطرح التساؤل', 'استخلاص النتائج النهائية', 'نشر البحث في مجلة علمية', 'تجاهل البيانات الشاذة'],
      correctAnswer: 0,
      points: 30,
    },
    {
      id: 'q-essay-1',
      type: 'essay',
      questionAr: 'سجل فرضيتك العلمية وأبرز المتغيرات المستقلة والتابعة التي قمت بضبطها أثناء التجربة.',
      questionEn: 'State your scientific hypothesis and the independent and dependent variables controlled.',
      points: 35,
    },
    {
      id: 'q-lab-1',
      type: 'lab_work',
      questionAr: 'وثيقة أو لقطة إثبات إنجاز التجربة المعملية (صورة من المعمل أو رسم بياني للنتائج).',
      questionEn: 'Proof of lab completion (3D lab screenshot or experimental data graph).',
      points: 35,
    },
  ];
};

export const StudentAssignmentModal: React.FC<StudentAssignmentModalProps> = ({
  isOpen,
  onClose,
  assignment,
  existingSubmission,
  studentQuadName,
  onSubmitted,
  ar,
}) => {
  const [answers, setAnswers] = useState<Record<string, { selectedOption?: number; answerText?: string; imageBase64?: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<StudentSubmission | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const questions: AssignmentQuestion[] = assignment
    ? assignment.questions && assignment.questions.length > 0
      ? assignment.questions
      : generateDefaultQuestions(assignment)
    : [];

  // تهيئة الإجابات الحالية عند فتح النافذة
  useEffect(() => {
    if (existingSubmission && existingSubmission.answers && existingSubmission.answers.length > 0) {
      const initial: Record<string, { selectedOption?: number; answerText?: string; imageBase64?: string }> = {};
      existingSubmission.answers.forEach((ans) => {
        initial[ans.questionId] = {
          selectedOption: ans.selectedOption,
          answerText: ans.answerText,
          imageBase64: ans.imageBase64,
        };
      });
      setAnswers(initial);
      setIsEditing(false);
    } else {
      setAnswers({});
      setIsEditing(true);
    }
    setSubmissionSuccess(null);
    setErrorMsg(null);
  }, [existingSubmission, assignment, isOpen]);

  if (!isOpen || !assignment) return null;

  const isGraded = existingSubmission?.status === 'graded';
  const isSubmittedAlready = !!existingSubmission && !isEditing;

  // معالجة اختيار إجابة اختيار من متعدد
  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isSubmittedAlready) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        selectedOption: optionIndex,
      },
    }));
  };

  // معالجة كتابة المقال
  const handleTextChange = (questionId: string, text: string) => {
    if (isSubmittedAlready) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        answerText: text,
      },
    }));
  };

  // معالجة رفع صورة التجربة
  const handleFileUpload = async (questionId: string, file: File) => {
    if (isSubmittedAlready) return;
    if (!file.type.startsWith('image/')) {
      setErrorMsg(ar ? 'يرجى اختيار ملف صورة صالح (PNG, JPG, WEBP).' : 'Please select a valid image file.');
      return;
    }
    try {
      const base64 = await compressImageToBase64(file);
      setAnswers((prev) => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          imageBase64: base64,
        },
      }));
      setErrorMsg(null);
    } catch {
      setErrorMsg(ar ? 'تعذر قراءة ملف الصورة، حاول مجدداً.' : 'Failed to read image.');
    }
  };

  // إزالة الصورة المرفوعة
  const handleRemoveImage = (questionId: string) => {
    if (isSubmittedAlready) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        imageBase64: undefined,
      },
    }));
  };

  // محرك التصحيح التلقائي والإرسال
  const handleSubmitAssignment = async () => {
    setErrorMsg(null);

    // التحقق من تعبئة بعض الإجابات على الأقل
    const answeredCount = Object.values(answers).filter(
      (a) => a.selectedOption !== undefined || (a.answerText && a.answerText.trim()) || a.imageBase64
    ).length;

    if (answeredCount === 0) {
      setErrorMsg(ar ? 'يرجى الإجابة عن سؤال واحد على الأقل قبل إرسال التسليم.' : 'Please answer at least one question.');
      return;
    }

    setIsSubmitting(true);

    let calculatedAutoScore = 0;
    let totalMcqMaxPoints = 0;
    let hasManualQuestions = false;

    const formattedAnswers: StudentAnswer[] = questions.map((q) => {
      const studentAns = answers[q.id] || {};
      const answerRecord: StudentAnswer = {
        questionId: q.id,
        questionType: q.type,
        maxPoints: q.points,
        answerText: studentAns.answerText?.trim() || undefined,
        selectedOption: studentAns.selectedOption,
        imageBase64: studentAns.imageBase64,
      };

      if (q.type === 'mcq') {
        totalMcqMaxPoints += q.points;
        const isCorrect = studentAns.selectedOption !== undefined && studentAns.selectedOption === q.correctAnswer;
        answerRecord.isCorrect = isCorrect;
        answerRecord.pointsEarned = isCorrect ? q.points : 0;
        if (isCorrect) {
          calculatedAutoScore += q.points;
        }
      } else {
        hasManualQuestions = true;
        answerRecord.pointsEarned = undefined; // ينتظر تقييم المعلم
      }

      return answerRecord;
    });

    const totalAssignmentPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0) || 100;

    // إذا كانت كل الأسئلة اختيار من متعدد، ترصد الدرجة النهائية مباشرة
    let finalStatus: 'submitted' | 'graded' = 'submitted';
    let finalScore: number | undefined = undefined;

    if (!hasManualQuestions && totalMcqMaxPoints > 0) {
      finalStatus = 'graded';
      finalScore = Math.round((calculatedAutoScore / totalMcqMaxPoints) * 100);
    } else {
      // للمقالي والتجارب: درجة مبدئية تحسب النسبة من الأسئلة التلقائية، والباقي بانتظار المعلم
      finalScore = Math.round((calculatedAutoScore / totalAssignmentPoints) * 100);
    }

    const submissionPayload: StudentSubmission = {
      id: existingSubmission?.id || `sub-${assignment.id}-${Date.now().toString(36)}`,
      assignmentId: assignment.id,
      studentQuadName: studentQuadName.trim() || 'طالب SciNexa',
      submittedAt: new Date().toISOString().slice(0, 10),
      status: finalStatus,
      score: finalScore,
      teacherFeedback: existingSubmission?.teacherFeedback,
      answers: formattedAnswers,
      autoScore: calculatedAutoScore,
      manualScore: existingSubmission?.manualScore ?? 0,
    };

    const res = await recordSubmission(submissionPayload);
    setIsSubmitting(false);

    if (!res.ok) {
      setErrorMsg(ar ? `حدث خطأ أثناء حفظ التسليم: ${res.error || 'فشل الاتصال'}` : `Submission error: ${res.error}`);
      return;
    }

    setSubmissionSuccess(submissionPayload);
    setIsEditing(false);
    onSubmitted(submissionPayload);
  };

  const totalPoints = questions.reduce((acc, q) => acc + (q.points || 0), 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md overflow-y-auto"
      dir={ar ? 'rtl' : 'ltr'}
    >
      <div className="relative w-full max-w-[820px] my-auto max-h-[92vh] flex flex-col rounded-2xl bg-[#0b0f19] border border-white/10 shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#0e1424] px-5 py-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Beaker size={20} />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white truncate">
                  {ar ? assignment.titleAr : assignment.titleEn}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {assignment.classNameAr}
                </span>
                {isGraded ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 size={11} />
                    {ar ? `تم التقييم · ${existingSubmission?.score}%` : `Graded · ${existingSubmission?.score}%`}
                  </span>
                ) : isSubmittedAlready ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Clock size={11} />
                    {ar ? 'تم التسليم · قيد مراجعة المعلم' : 'Submitted · In Review'}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {ar ? 'واجب نشط' : 'Active Assignment'}
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                <span>{ar ? `المشرف: ${assignment.teacherNameAr}` : `Teacher: ${assignment.teacherNameAr}`}</span>
                <span>•</span>
                <span>{ar ? `الموعد: ${assignment.dueDateAr}` : `Due: ${assignment.dueDateEn}`}</span>
                <span>•</span>
                <span className="text-cyan-400 font-mono">{totalPoints} {ar ? 'درجة' : 'pts'}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Instructions banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 to-cyan-950/30 border border-cyan-500/20">
            <div className="flex items-start gap-2.5">
              <Sparkles size={16} className="text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed text-slate-300">
                <span className="font-semibold text-white block mb-0.5">
                  {ar ? 'تعليمات التجربة والتسليم:' : 'Instructions & Requirements:'}
                </span>
                {ar ? assignment.descriptionAr : assignment.descriptionEn}
              </div>
            </div>
          </div>

          {/* Teacher Feedback Banner if graded */}
          {existingSubmission?.teacherFeedback && (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200">
              <div className="flex items-center gap-2 mb-1 text-xs font-bold text-emerald-400">
                <Award size={15} />
                <span>{ar ? 'ملاحظات المعلم وتقييمه:' : 'Teacher Feedback:'}</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-200 ps-6">
                "{existingSubmission.teacherFeedback}"
              </p>
            </div>
          )}

          {/* Success Banner after submitting */}
          {submissionSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <div className="text-xs font-medium">
                  {ar
                    ? 'تم إرسال تسليمك بنجاح وحفظه في النظام!'
                    : 'Assignment submitted and saved successfully!'}
                </div>
              </div>
              {submissionSuccess.score !== undefined && (
                <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                  {ar ? `الدرجة الحالية: ${submissionSuccess.score}%` : `Score: ${submissionSuccess.score}%`}
                </span>
              )}
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Questions Section */}
          <div className="space-y-6">
            {questions.map((q, idx) => {
              const currentAns = answers[q.id] || {};
              const submittedAnswer = existingSubmission?.answers?.find((a) => a.questionId === q.id);

              return (
                <div
                  key={q.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/15 transition-all space-y-3.5"
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[11px] font-bold text-white">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${
                            q.type === 'mcq'
                              ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                              : q.type === 'essay'
                              ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          }`}>
                            {q.type === 'mcq'
                              ? (ar ? 'اختر الإجابة الصحيحة' : 'MCQ')
                              : q.type === 'essay'
                              ? (ar ? 'سؤال مقالي واستنتاج' : 'Essay Question')
                              : (ar ? 'عمل وتجربة معملية مصورة' : 'Lab Practical Proof')}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {q.points} {ar ? 'درجة' : 'pts'}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-white leading-snug">
                          {ar ? q.questionAr : (q.questionEn || q.questionAr)}
                        </h3>
                        {q.instructionsAr && (
                          <p className="text-[11px] text-slate-400 mt-1">{q.instructionsAr}</p>
                        )}
                      </div>
                    </div>

                    {/* Auto-grade badge for MCQ if submitted */}
                    {isSubmittedAlready && q.type === 'mcq' && (
                      <span className={`text-[11px] px-2.5 py-1 rounded-lg font-bold shrink-0 flex items-center gap-1 border ${
                        submittedAnswer?.isCorrect
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-red-500/20 text-red-300 border-red-500/40'
                      }`}>
                        {submittedAnswer?.isCorrect ? (
                          <>
                            <Check size={12} />
                            +{q.points}
                          </>
                        ) : (
                          <>
                            <X size={12} />
                            0/{q.points}
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Render Question Input according to Type */}

                  {/* 1. MCQ Question */}
                  {q.type === 'mcq' && q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = currentAns.selectedOption === optIdx;
                        const isCorrectOption = q.correctAnswer === optIdx;

                        let styleClasses = 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20';

                        if (isSubmittedAlready) {
                          if (isSelected && isCorrectOption) {
                            styleClasses = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200 font-bold';
                          } else if (isSelected && !isCorrectOption) {
                            styleClasses = 'bg-red-500/20 border-red-500/50 text-red-200';
                          } else if (isCorrectOption) {
                            styleClasses = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';
                          } else {
                            styleClasses = 'opacity-50 bg-white/[0.02] border-white/5 text-slate-400';
                          }
                        } else if (isSelected) {
                          styleClasses = 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-semibold shadow-[0_0_15px_rgba(6,182,212,0.2)]';
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={isSubmittedAlready}
                            onClick={() => handleSelectOption(q.id, optIdx)}
                            className={`flex items-center gap-3 p-3 rounded-xl border text-xs text-start transition-all cursor-pointer ${styleClasses}`}
                          >
                            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-mono border ${
                              isSelected
                                ? 'bg-cyan-500 text-black border-cyan-400 font-bold'
                                : 'border-white/20 text-slate-400'
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="flex-1 leading-relaxed">{opt}</span>
                            {isSubmittedAlready && isCorrectOption && (
                              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* 2. Essay Question */}
                  {q.type === 'essay' && (
                    <div className="space-y-2 pt-1">
                      {isSubmittedAlready ? (
                        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                          {currentAns.answerText || (
                            <span className="italic text-slate-500">{ar ? '(لم يتم تقديم إجابة نصية)' : '(No text provided)'}</span>
                          )}
                        </div>
                      ) : (
                        <div>
                          <textarea
                            rows={3}
                            value={currentAns.answerText || ''}
                            onChange={(e) => handleTextChange(q.id, e.target.value)}
                            placeholder={ar ? 'اكتب إجابتك العلمية والملاحظات المستنتجة هنا…' : 'Enter your detailed observations here…'}
                            className="w-full rounded-xl bg-black/40 border border-white/15 p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition-colors"
                          />
                          <div className="flex justify-between text-[10px] text-slate-500 px-1 mt-1">
                            <span>{ar ? 'تُصحح يدوياً بواسطة معلم الفصل' : 'Graded manually by teacher'}</span>
                            <span>{currentAns.answerText?.length || 0} {ar ? 'حرف' : 'chars'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. Lab / Practical Work Photo Submission */}
                  {q.type === 'lab_work' && (
                    <div className="space-y-3 pt-1">
                      {currentAns.imageBase64 ? (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/10">
                          <div className="relative group rounded-lg overflow-hidden border border-white/20 shrink-0 w-24 h-20 bg-slate-900">
                            <img
                              src={currentAns.imageBase64}
                              alt="Lab submission proof"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setEnlargedImage(currentAns.imageBase64!)}
                              className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity text-white"
                              title={ar ? 'تكبير الصورة' : 'Enlarge'}
                            >
                              <Maximize2 size={16} />
                            </button>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                              <CheckCircle2 size={13} />
                              <span>{ar ? 'تم إرفاق صورة التجربة بنجاح' : 'Lab photo attached'}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                              {ar ? 'جاهزة للمعاينة وتدقيق المعلم' : 'Ready for teacher inspection'}
                            </p>
                            <button
                              type="button"
                              onClick={() => setEnlargedImage(currentAns.imageBase64!)}
                              className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
                            >
                              <Eye size={12} />
                              <span>{ar ? 'معاينة بالحجم الكامل' : 'Preview full size'}</span>
                            </button>
                          </div>

                          {!isSubmittedAlready && (
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(q.id)}
                              className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                              title={ar ? 'حذف الصورة' : 'Remove image'}
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      ) : isSubmittedAlready ? (
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-500 italic">
                          {ar ? 'لم يتم إرفاق صورة معملية لهذا السؤال.' : 'No lab image uploaded.'}
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRefs.current[q.id]?.click()}
                          className="border-2 border-dashed border-white/15 hover:border-cyan-400/50 bg-white/[0.01] hover:bg-cyan-500/[0.02] rounded-xl p-5 text-center cursor-pointer transition-all"
                        >
                          <input
                            type="file"
                            accept="image/*"
                            ref={(el) => { fileInputRefs.current[q.id] = el; }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) void handleFileUpload(q.id, file);
                            }}
                            className="hidden"
                          />
                          <UploadCloud size={28} className="mx-auto text-cyan-400/80 mb-2" />
                          <div className="text-xs font-semibold text-white">
                            {ar ? 'اضغط لرفع لقطة شاشة أو صورة من المعمل' : 'Click or drop lab screenshot / photo'}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">
                            {ar ? 'PNG, JPG أو WEBP (يتم الضغط والتحسين تلقائياً للمزامنة مع Supabase)' : 'Compressed automatically for seamless sync'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-white/10 bg-[#0e1424] px-5 py-4 shrink-0">
          <div className="text-xs text-slate-400">
            {isSubmittedAlready ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <CheckCircle2 size={14} />
                {ar ? 'هذا التسليم محفوظ ومسجل في سوبابيز' : 'Submission recorded in Supabase'}
              </span>
            ) : (
              <span>
                {ar ? `الطالب المسجل: ${studentQuadName}` : `Student: ${studentQuadName}`}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isSubmittedAlready ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 rounded-xl border border-white/20 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  {ar ? 'تعديل أو إعادة الحل' : 'Resubmit / Edit'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-xl bg-white/10 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
                >
                  {ar ? 'إغلاق' : 'Close'}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:bg-white/5 transition-colors"
                >
                  {ar ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => void handleSubmitAssignment()}
                  className="inline-flex items-center gap-2 px-5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-xs font-bold text-black hover:opacity-95 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all disabled:opacity-50"
                >
                  <Send size={13} />
                  <span>
                    {isSubmitting
                      ? (ar ? 'جارٍ الإرسال والتصحيح…' : 'Submitting…')
                      : (ar ? 'إرسال التسليم النهائي' : 'Submit Assignment')}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Image Preview Modal */}
      {enlargedImage && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setEnlargedImage(null)}
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden border border-white/20 bg-black">
            <button
              type="button"
              onClick={() => setEnlargedImage(null)}
              className="absolute top-3 end-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white border border-white/20 hover:bg-white/20 transition-colors"
            >
              <X size={16} />
            </button>
            <img
              src={enlargedImage}
              alt="Enlarged lab preview"
              className="max-h-[85vh] w-auto object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};
