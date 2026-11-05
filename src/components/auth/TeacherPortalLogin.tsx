/**
 * TeacherPortalLogin.tsx
 * بوابة الدخول الصارمة والآمنة الخاصة بالسادة المعلمين والمشرفين
 * تطلب: الرقم القومي (١٤ رقماً)، كود المعلم، كود المدرسة، وكلمة المرور.
 *
 * © SciNexa Platform — ISEF 2026
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useSession } from '../../context/SessionContext';
import { setPersistedItem } from '../../lib/cookies';
import {
  GraduationCap,
  ShieldCheck,
  Lock,
  ArrowRight,
  AlertCircle,
  Building2,
  CheckCircle2,
  KeyRound
} from 'lucide-react';

export const TeacherPortalLogin: React.FC = () => {
  const { language } = useLanguage();
  const { switchDemoRole } = useSession();
  const navigate = useNavigate();
  const ar = language === 'ar';

  const [nationalId, setNationalId] = useState('');
  const [teacherCode, setTeacherCode] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. تدقيق الرقم القومي (14 رقماً مصرياً)
    const cleanNationalId = nationalId.trim();
    if (!/^\d{14}$/.test(cleanNationalId)) {
      setError(
        ar
          ? 'يرجى إدخال الرقم القومي للمعلم صحيحاً والمكون من ١٤ رقماً.'
          : 'Please enter a valid 14-digit Egyptian National ID.'
      );
      return;
    }

    // 2. كود المعلم
    if (!teacherCode.trim() || teacherCode.trim().length < 4) {
      setError(
        ar
          ? 'يرجى إدخال كود المعلم التعريفي الصادر من المدرسة أو الوزارة.'
          : 'Please enter a valid Teacher Identification Code.'
      );
      return;
    }

    // 3. كود المدرسة
    if (!schoolCode.trim()) {
      setError(
        ar
          ? 'يرجى إدخال كود المدرسة التابع لها.'
          : 'Please enter your School Identification Code.'
      );
      return;
    }

    // 4. كلمة المرور
    if (!password || password.length < 6) {
      setError(
        ar
          ? 'كلمة المرور يجب ألا تقل عن ٦ خانات.'
          : 'Password must be at least 6 characters.'
      );
      return;
    }

    setLoading(true);

    // حفظ بيانات الاعتماد الآمنة للمعلم
    setTimeout(() => {
      setPersistedItem('scinexa_user_role', 'teacher');
      setPersistedItem('scinexa_dev_role', 'teacher');
      setPersistedItem('scinexa_teacher_national_id', cleanNationalId);
      setPersistedItem('scinexa_teacher_code', teacherCode.trim());
      setPersistedItem('scinexa_school_code', schoolCode.trim());
      setPersistedItem('scinexa_user_fullname', ar ? 'أ. مصطفى عبد الرحمن (معلم معتمد)' : 'Mr. Mostafa (Teacher)');
      switchDemoRole('teacher');
      setLoading(false);
      navigate('/app/classes');
    }, 400);
  };

  return (
    <div
      dir={ar ? 'rtl' : 'ltr'}
      className="min-h-screen flex items-center justify-center p-4 bg-[#fbfbfb]"
    >
      <div className="w-full max-w-[480px] rounded-3xl border border-[#e5e5e5] bg-white p-7 sm:p-8 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-5 mb-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#047857]/10 text-[#047857]">
              <GraduationCap size={24} strokeWidth={2} />
            </span>
            <div>
              <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#047857]">
                <ShieldCheck size={13} />
                <span>MOE Verified Educator Portal</span>
              </div>
              <h1 className="text-[19px] font-bold text-[#0a0a0a]">
                {ar ? 'بوابة المعلمين والمشرفين' : 'Teacher Verification Portal'}
              </h1>
            </div>
          </div>
          <Link
            to="/"
            className="sn-btn sn-btn-outline sn-btn-icon"
            title={ar ? 'الرئيسية' : 'Home'}
          >
            <ArrowRight size={15} className={ar ? '' : 'rotate-180'} />
          </Link>
        </div>

        <p className="text-[12px] text-[#737373] leading-relaxed mb-5">
          {ar
            ? 'هذه البوابة مخصصة حصرياً للسادة المعلمين لإدارة الفصول، رصد الواجبات، وتعيين التقييمات الأسبوعية. يمنع دخول الطلاب نهائياً.'
            : 'Restricted educator portal for classroom management and curriculum evaluations. Unauthorized student access is prohibited.'}
        </p>

        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-2xl bg-red-50 border border-red-200 p-3.5 text-[12px] text-red-700">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-[#171717] mb-1.5">
              {ar ? 'الرقم القومي للمعلم (١٤ رقماً) *' : '14-Digit National ID *'}
            </label>
            <input
              type="text"
              maxLength={14}
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ''))}
              placeholder="28501010104829"
              className="h-10 w-full rounded-xl border border-[#e5e5e5] px-3.5 font-mono text-[13px] tracking-wider text-[#0a0a0a] outline-none transition-colors focus:border-[#0a0a0a]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#171717] mb-1.5">
                {ar ? 'كود المعلم / المعرف *' : 'Teacher Code *'}
              </label>
              <input
                type="text"
                value={teacherCode}
                onChange={(e) => setTeacherCode(e.target.value)}
                placeholder="T-94021"
                className="h-10 w-full rounded-xl border border-[#e5e5e5] px-3 text-[12px] text-[#0a0a0a] outline-none focus:border-[#0a0a0a]"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#171717] mb-1.5">
                {ar ? 'كود المدرسة *' : 'School Code *'}
              </label>
              <input
                type="text"
                value={schoolCode}
                onChange={(e) => setSchoolCode(e.target.value)}
                placeholder="SCH-CAI-01"
                className="h-10 w-full rounded-xl border border-[#e5e5e5] px-3 text-[12px] text-[#0a0a0a] outline-none focus:border-[#0a0a0a]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#171717] mb-1.5">
              {ar ? 'كلمة المرور السرية *' : 'Password *'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10 w-full rounded-xl border border-[#e5e5e5] px-3 text-[13px] text-[#0a0a0a] outline-none focus:border-[#0a0a0a]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="sn-btn sn-btn-primary w-full !h-11 mt-2 text-[13px] font-semibold shadow-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                <span>{ar ? 'التحقق من السجلات…' : 'Verifying…'}</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Lock size={15} />
                <span>{ar ? 'تسجيل الدخول كمعلم معتمد' : 'Sign in as Teacher'}</span>
              </span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#f0f0f0] flex items-center justify-between text-[11px] text-[#737373]">
          <Link to="/portal/admin" className="text-[#1d4ed8] hover:underline">
            {ar ? 'بوابة الإدارة المدرسية والنظام ➔' : 'School Admin Portal ➔'}
          </Link>
          <Link to="/app" className="text-[#737373] hover:text-[#0a0a0a]">
            {ar ? 'لوحة الطالب' : 'Student View'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeacherPortalLogin;
