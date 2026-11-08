/**
 * EducatorPortalLogin.tsx
 * بوابة تسجيل الدخول والتسجيل الآمنة الخاصة بالمعلمين والإدارة المدرسية
 * 
 * اسم المستخدم: الاسم الرباعي المعتمد
 * كلمة المرور: الرقم القومي (١٤ رقماً)
 * 
 * © SciNexa Platform — ISEF 2026
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useSession } from '../../context/SessionContext';
import { dbVerifyEducator, dbRegisterEducator } from '../../lib/supabase';
import { LanguageSelector } from '../ui/LanguageSelector';
import {
  GraduationCap,
  Building2,
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  UserPlus,
  LogIn,
  School,
  BookOpen
} from 'lucide-react';

export const EducatorPortalLogin: React.FC = () => {
  const { language } = useLanguage();
  const { loginEducator } = useSession();
  const navigate = useNavigate();
  const ar = language === 'ar';

  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login fields
  const [username, setUsername] = useState(''); // الاسم الرباعي
  const [password, setPassword] = useState(''); // الرقم القومي
  
  // Register fields
  const [regFullName, setRegFullName] = useState('');
  const [regNationalId, setRegNationalId] = useState('');
  const [regSchoolName, setRegSchoolName] = useState('');
  const [regSchoolCode, setRegSchoolCode] = useState('');
  const [regRole, setRegRole] = useState<'teacher' | 'admin'>('teacher');
  const [regSubject, setRegSubject] = useState('chemistry');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername) {
      setError(ar ? 'يرجى إدخال اسم المستخدم (الاسم الرباعي المعتمد).' : 'Please enter your username (4-part official name).');
      return;
    }

    if (!cleanPassword || cleanPassword.length !== 14 || !/^\d{14}$/.test(cleanPassword)) {
      setError(ar ? 'كلمة المرور يجب أن تكون الرقم القومي للمعلم/المشرف المكون من ١٤ رقماً.' : 'Password must be your valid 14-digit National ID.');
      return;
    }

    setLoading(true);
    try {
      const result = await dbVerifyEducator(cleanUsername, cleanPassword);
      if (result.success && result.profile) {
        loginEducator({
          name: result.profile.display_name || cleanUsername,
          nationalId: cleanPassword,
          role: result.role || (result.profile.role as 'teacher' | 'admin') || 'teacher',
          schoolName: result.profile.school_name || 'مدرسة المتفوقين للعلوم والتكنولوجيا',
          schoolCode: result.profile.school_code || 'CAIRO1.MOE',
          verifiedAt: Date.now(),
        });

        setSuccess(ar ? 'تم التحقق بنجاح! جاري الانتقال للبوابة...' : 'Verified successfully! Redirecting...');
        setTimeout(() => {
          navigate('/portal');
        }, 500);
      } else {
        setError(result.error || (ar ? 'بيانات الاعتماد غير صحيحة. تأكد من إدخال اسمك الرباعي ورقمك القومي بدقة.' : 'Invalid credentials.'));
      }
    } catch {
      setError(ar ? 'حدث خطأ أثناء الاتصال بقاعدة البيانات.' : 'Connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanFullName = regFullName.trim();
    const cleanNationalId = regNationalId.trim();

    if (!cleanFullName || cleanFullName.split(/\s+/).length < 2) {
      setError(ar ? 'يرجى كتابة الاسم الرباعي المعتمد كاملاً.' : 'Please enter your full 4-part name.');
      return;
    }

    if (!cleanNationalId || cleanNationalId.length !== 14 || !/^\d{14}$/.test(cleanNationalId)) {
      setError(ar ? 'الرقم القومي يجب أن يتكون من ١٤ رقماً مصرياً صحيحاً (سيُعتمد ككلمة سر).' : 'National ID must be 14 digits (will be used as password).');
      return;
    }

    if (!regSchoolName.trim()) {
      setError(ar ? 'يرجى كتابة اسم المدرسة التابع لها.' : 'Please enter your school name.');
      return;
    }

    setLoading(true);
    try {
      const res = await dbRegisterEducator({
        quadName: cleanFullName,
        nationalId: cleanNationalId,
        schoolCode: regSchoolCode.trim() || 'MOE.EGYPT',
        schoolName: regSchoolName.trim(),
        role: regRole,
        subject: regSubject,
      });

      if (res.success && res.profile) {
        loginEducator({
          name: cleanFullName,
          nationalId: cleanNationalId,
          role: regRole,
          schoolName: regSchoolName.trim(),
          schoolCode: regSchoolCode.trim() || 'MOE.EGYPT',
          verifiedAt: Date.now(),
        });

        setSuccess(ar ? 'تم تسجيل وتفعيل حسابك الرسمي بنجاح!' : 'Registered and verified successfully!');
        setTimeout(() => {
          navigate('/portal');
        }, 500);
      } else {
        setError(res.error || (ar ? 'تعذّر إتمام التسجيل.' : 'Registration failed.'));
      }
    } catch {
      setError(ar ? 'حدث خطأ غير متوقع أثناء التسجيل.' : 'Unexpected error during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir={ar ? 'rtl' : 'ltr'} className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#f8fafc]">
      {/* Top Navbar */}
      <header className="w-full max-w-[540px] flex items-center justify-between pb-4 mb-2">
        <Link to="/" className="flex items-center gap-2 text-[13px] font-semibold text-[#0f172a] hover:opacity-80 transition-opacity">
          <ArrowRight size={16} className={ar ? '' : 'rotate-180'} />
          <span>{ar ? 'العودة للمنصة العامة' : 'Back to Public Site'}</span>
        </Link>
        <LanguageSelector compact />
      </header>

      {/* Main Container Card */}
      <div className="w-full max-w-[540px] rounded-[28px] border border-[#e2e8f0] bg-white p-7 sm:p-9 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.1)]">
        {/* Header Icon & Title */}
        <div className="flex items-start justify-between border-b border-[#f1f5f9] pb-5 mb-6">
          <div className="flex items-center gap-3.5">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0284c7]/10 text-[#0284c7]">
              <ShieldCheck size={28} strokeWidth={2} />
            </span>
            <div>
              <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#0284c7]">
                <span>ISEF 2026 · Ministry of Education</span>
              </div>
              <h1 className="text-[20px] font-bold text-[#0f172a]">
                {ar ? 'بوابة المعلمين والإدارة المدرسية' : 'Educator & Admin Portal'}
              </h1>
            </div>
          </div>
          <span className="sn-badge sn-badge-blue !text-[10px]">
            {ar ? 'نظام محمي' : 'Secured'}
          </span>
        </div>

        {/* Tab switch: Login vs Register */}
        <div className="flex rounded-xl bg-[#f1f5f9] p-1 mb-6">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
            className={`flex-1 py-2 rounded-lg text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'login' ? 'bg-white text-[#0f172a] shadow-xs' : 'text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            <LogIn size={14} />
            <span>{ar ? 'تسجيل الدخول' : 'Sign In'}</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); setSuccess(null); }}
            className={`flex-1 py-2 rounded-lg text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'register' ? 'bg-white text-[#0f172a] shadow-xs' : 'text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            <UserPlus size={14} />
            <span>{ar ? 'تسجيل معلم / مشرف جديد' : 'New Educator'}</span>
          </button>
        </div>

        {/* Informational Banner */}
        <div className="mb-5 rounded-2xl bg-[#f0f9ff] border border-[#bae6fd] p-3 text-[11px] text-[#0369a1] leading-relaxed flex items-start gap-2.5">
          <Lock size={15} className="shrink-0 mt-0.5 text-[#0284c7]" />
          <div>
            <strong>{ar ? 'بيانات الدخول المعتمدة للمشرفين:' : 'Credentials format:'}</strong>{' '}
            {ar
              ? 'يُستخدم الاسم الرباعي كاسم مستخدم، والرقم القومي (١٤ رقماً) ككلمة سر محمية.'
              : 'Username is your official 4-part name; Password is your 14-digit National ID.'}
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-2xl bg-red-50 border border-red-200 p-3.5 text-[12px] text-red-700">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start gap-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-[12px] text-emerald-800">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {/* ── MODE 1: LOGIN FORM ── */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#1e293b] mb-1.5">
                {ar ? 'اسم المستخدم (الاسم الرباعي المعتمد) *' : 'Username (Official 4-part Name) *'}
              </label>
              <div className="relative">
                <User size={15} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={ar ? 'مثال: ياسين محمد إبراهيم زيد' : 'e.g. Yaseen Mohamed Ibrahim'}
                  className="h-11 w-full rounded-xl border border-[#cbd5e1] bg-[#f8fafc] ps-10 pe-3.5 text-[13px] text-[#0f172a] outline-none transition-colors focus:border-[#0284c7] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#1e293b] mb-1.5">
                {ar ? 'كلمة المرور (الرقم القومي ١٤ رقماً) *' : 'Password (14-digit National ID) *'}
              </label>
              <div className="relative">
                <KeyRound size={15} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                <input
                  type="password"
                  required
                  maxLength={14}
                  value={password}
                  onChange={(e) => setPassword(e.target.value.replace(/\D/g, ''))}
                  placeholder="2980101XXXXXXXX"
                  className="h-11 w-full rounded-xl border border-[#cbd5e1] bg-[#f8fafc] ps-10 pe-3.5 font-mono text-[13px] tracking-wider text-[#0f172a] outline-none transition-colors focus:border-[#0284c7] focus:bg-white"
                />
              </div>
              <span className="text-[10px] text-[#64748b] mt-1 block">
                {ar ? 'الرقم القومي هو كلمة المرور الرسمية لضمان عدم دخول الطلاب.' : 'Your 14-digit National ID acts as the secure educator password.'}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 h-11 w-full rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-[13px] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <span>{ar ? 'جاري التحقق من السجلات...' : 'Verifying...'}</span>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>{ar ? 'دخول بوابة المعلمين والإدارة' : 'Sign In to Educator Portal'}</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* ── MODE 2: REGISTER FORM ── */
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-[#1e293b] mb-1">
                {ar ? 'الاسم الرباعي الرسمي للمعلم / المشرف *' : 'Official Full 4-part Name *'}
              </label>
              <input
                type="text"
                required
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                placeholder={ar ? 'الاسم كاملاً كما في صحيفة الأحوال' : 'Full legal name'}
                className="h-10 w-full rounded-xl border border-[#cbd5e1] bg-[#f8fafc] px-3.5 text-[12px] text-[#0f172a] outline-none transition-colors focus:border-[#0284c7] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#1e293b] mb-1">
                {ar ? 'الرقم القومي (١٤ رقماً - سيكون كلمة المرور) *' : '14-digit National ID (Password) *'}
              </label>
              <input
                type="text"
                required
                maxLength={14}
                value={regNationalId}
                onChange={(e) => setRegNationalId(e.target.value.replace(/\D/g, ''))}
                placeholder="2980101XXXXXXXX"
                className="h-10 w-full rounded-xl border border-[#cbd5e1] bg-[#f8fafc] px-3.5 font-mono text-[12px] tracking-wider text-[#0f172a] outline-none transition-colors focus:border-[#0284c7] focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#1e293b] mb-1">
                  {ar ? 'اسم المدرسة *' : 'School Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={regSchoolName}
                  onChange={(e) => setRegSchoolName(e.target.value)}
                  placeholder={ar ? 'مثال: مدرسة النيل الثانوية' : 'e.g. Nile High School'}
                  className="h-10 w-full rounded-xl border border-[#cbd5e1] bg-[#f8fafc] px-3.5 text-[12px] text-[#0f172a] outline-none transition-colors focus:border-[#0284c7] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1e293b] mb-1">
                  {ar ? 'كود المدرسة' : 'School Code'}
                </label>
                <input
                  type="text"
                  value={regSchoolCode}
                  onChange={(e) => setRegSchoolCode(e.target.value)}
                  placeholder="CAIRO1.MOE"
                  className="h-10 w-full rounded-xl border border-[#cbd5e1] bg-[#f8fafc] px-3.5 font-mono text-[12px] text-[#0f172a] outline-none transition-colors focus:border-[#0284c7] focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#1e293b] mb-1">
                  {ar ? 'الدور الوظيفي' : 'Role'}
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as 'teacher' | 'admin')}
                  className="h-10 w-full rounded-xl border border-[#cbd5e1] bg-[#f8fafc] px-3 text-[12px] text-[#0f172a] outline-none"
                >
                  <option value="teacher">{ar ? 'معلم مشرف' : 'Teacher'}</option>
                  <option value="admin">{ar ? 'مدير مدرسة / مسؤول نظام' : 'School Admin'}</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1e293b] mb-1">
                  {ar ? 'المادة التخصصية' : 'Subject'}
                </label>
                <select
                  value={regSubject}
                  onChange={(e) => setRegSubject(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#cbd5e1] bg-[#f8fafc] px-3 text-[12px] text-[#0f172a] outline-none"
                >
                  <option value="chemistry">{ar ? 'الكيمياء' : 'Chemistry'}</option>
                  <option value="physics">{ar ? 'الفيزياء' : 'Physics'}</option>
                  <option value="biology">{ar ? 'الأحياء والعلوم' : 'Biology'}</option>
                  <option value="geology">{ar ? 'الجيولوجيا' : 'Geology'}</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-3 h-11 w-full rounded-xl bg-[#047857] hover:bg-[#065f46] text-white font-bold text-[13px] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <span>{ar ? 'جاري تسجيل الحساب في Supabase...' : 'Registering...'}</span>
              ) : (
                <>
                  <UserPlus size={16} />
                  <span>{ar ? 'إنشاء حساب وتفعيل صلاحيات المعلم' : 'Register & Enter Portal'}</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
