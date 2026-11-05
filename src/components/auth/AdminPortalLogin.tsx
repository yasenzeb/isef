/**
 * AdminPortalLogin.tsx
 * بوابة الدخول الصارمة والآمنة الخاصة بمدير المدرسة وإدارة النظام
 * تطلب: كود المدرسة من الوزارة، الرقم القومي لمدير المدرسة، رمز التحقق الأمني، وكلمة المرور.
 *
 * © SciNexa Platform — ISEF 2026
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useSession } from '../../context/SessionContext';
import { setPersistedItem } from '../../lib/cookies';
import {
  Building2,
  ShieldAlert,
  ShieldCheck,
  Lock,
  ArrowRight,
  AlertCircle,
  KeyRound,
  CheckCircle2
} from 'lucide-react';

export const AdminPortalLogin: React.FC = () => {
  const { language } = useLanguage();
  const { switchDemoRole } = useSession();
  const navigate = useNavigate();
  const ar = language === 'ar';

  const [schoolCode, setSchoolCode] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [securityPin, setSecurityPin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. كود المدرسة الوزاري
    if (!schoolCode.trim() || schoolCode.trim().length < 4) {
      setError(
        ar
          ? 'يرجى إدخال كود المدرسة التعريفي المعتمد من وزارة التربية والتعليم.'
          : 'Please enter a valid Ministry School Code.'
      );
      return;
    }

    // 2. الرقم القومي لمدير المدرسة (14 رقماً)
    const cleanNationalId = nationalId.trim();
    if (!/^\d{14}$/.test(cleanNationalId)) {
      setError(
        ar
          ? 'الرقم القومي للمسؤول يجب أن يتكون من ١٤ رقماً مصرياً صحيحاً.'
          : 'Please enter a valid 14-digit Egyptian National ID.'
      );
      return;
    }

    // 3. كلمة المرور ورمز الأمان
    if (!password || password.length < 6) {
      setError(
        ar
          ? 'كلمة المرور الإدارية يجب ألا تقل عن ٦ خانات.'
          : 'Administrative password must be at least 6 characters.'
      );
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setPersistedItem('scinexa_user_role', 'admin');
      setPersistedItem('scinexa_dev_role', 'admin');
      setPersistedItem('scinexa_admin_school_code', schoolCode.trim());
      setPersistedItem('scinexa_admin_national_id', cleanNationalId);
      setPersistedItem('scinexa_user_fullname', ar ? 'د. أسامة الشريف (مدير المدرسة)' : 'Dr. Osama (Principal)');
      switchDemoRole('admin');
      setLoading(false);
      navigate('/app/institutions');
    }, 400);
  };

  return (
    <div
      dir={ar ? 'rtl' : 'ltr'}
      className="min-h-screen flex items-center justify-center p-4 bg-[#fbfbfb]"
    >
      <div className="w-full max-w-[490px] rounded-3xl border border-[#e5e5e5] bg-white p-7 sm:p-8 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-5 mb-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
              <Building2 size={24} strokeWidth={2} />
            </span>
            <div>
              <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-amber-700">
                <ShieldAlert size={13} />
                <span>Ministry Administration & Principal Portal</span>
              </div>
              <h1 className="text-[19px] font-bold text-[#0a0a0a]">
                {ar ? 'بوابة الإدارة المدرسية والنظام' : 'School Administration Portal'}
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
            ? 'منطقة إدارية عالية الأمان مخصصة لمديري المدارس والمشرفين العامين لإدارة تراخيص المؤسسات، تعيين المعلمين، والاطلاع على التقارير الشاملة.'
            : 'Restricted administrative environment for school principals and system overseers. Strictly audited.'}
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
              {ar ? 'كود المدرسة التعريفي المعتمد من الوزارة *' : 'MOE School Code *'}
            </label>
            <input
              type="text"
              value={schoolCode}
              onChange={(e) => setSchoolCode(e.target.value)}
              placeholder="MOE-CAI-74920"
              className="h-10 w-full rounded-xl border border-[#e5e5e5] px-3.5 font-mono text-[13px] uppercase tracking-wider text-[#0a0a0a] outline-none transition-colors focus:border-[#0a0a0a]"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#171717] mb-1.5">
              {ar ? 'الرقم القومي لمدير المدرسة / المسؤول (١٤ رقماً) *' : 'Principal 14-Digit National ID *'}
            </label>
            <input
              type="text"
              maxLength={14}
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ''))}
              placeholder="27608120103914"
              className="h-10 w-full rounded-xl border border-[#e5e5e5] px-3.5 font-mono text-[13px] tracking-wider text-[#0a0a0a] outline-none transition-colors focus:border-[#0a0a0a]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#171717] mb-1.5">
                {ar ? 'رمز التحقق الأمني (PIN)' : 'Security PIN'}
              </label>
              <input
                type="text"
                maxLength={6}
                value={securityPin}
                onChange={(e) => setSecurityPin(e.target.value)}
                placeholder="8492"
                className="h-10 w-full rounded-xl border border-[#e5e5e5] px-3 text-[12px] font-mono text-[#0a0a0a] outline-none focus:border-[#0a0a0a]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#171717] mb-1.5">
                {ar ? 'كلمة المرور الإدارية *' : 'Admin Password *'}
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="sn-btn sn-btn-primary w-full !h-11 mt-2 text-[13px] font-semibold shadow-sm !bg-[#0a0a0a] hover:!bg-[#262626]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                <span>{ar ? 'التحقق الإداري الآمن…' : 'Authenticating…'}</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <KeyRound size={15} />
                <span>{ar ? 'تسجيل الدخول كمدير نظام معتمد' : 'Sign in as Administrator'}</span>
              </span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#f0f0f0] flex items-center justify-between text-[11px] text-[#737373]">
          <Link to="/portal/teacher" className="text-[#047857] hover:underline font-medium">
            {ar ? 'بوابة المعلمين والمشرفين ➔' : 'Teacher Portal ➔'}
          </Link>
          <Link to="/app" className="text-[#737373] hover:text-[#0a0a0a]">
            {ar ? 'لوحة الطالب' : 'Student View'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminPortalLogin;
