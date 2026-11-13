/**
 * EducatorPortalLogin.tsx
 * بوابة تسجيل الدخول والتسجيل الآمنة الخاصة بالمعلمين والإدارة المدرسية
 * 
 * اسم المستخدم: الاسم الرباعي المعتمد
 * كلمة المرور: الرقم القومي (١٤ رقماً)
 * + تسجيل الدخول عبر Google مع ربط الاسم الرباعي والرقم القومي
 * فحص حقيقي في Supabase بدون أي بيانات وهمية أو مدارس افتراضية
 * 
 * © SciNexa Platform — ISEF 2026
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useSession } from '../../context/SessionContext';
import {
  dbVerifyEducator,
  dbRegisterEducator,
} from '../../lib/supabase';
import { LanguageSelector } from '../ui/LanguageSelector';
import { BrandMark } from '../ui/Brand';
import {
  ShieldCheck,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  UserPlus,
  LogIn,
} from 'lucide-react';

export const EducatorPortalLogin: React.FC = () => {
  const { language } = useLanguage();
  const { loginEducator, educator } = useSession();
  const navigate = useNavigate();
  const ar = language === 'ar';
  const ja = language === 'ja';

  // If already logged in, redirect to portal
  useEffect(() => {
    if (educator) {
      navigate('/portal');
    }
  }, [educator, navigate]);

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login fields
  const [username, setUsername] = useState(''); // الاسم الرباعي
  const [password, setPassword] = useState(''); // الرقم القومي

  // Register fields
  const [regFullName, setRegFullName] = useState('');
  const [regNationalId, setRegNationalId] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regSchoolName, setRegSchoolName] = useState('');
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
      setError(
        ar
          ? 'يرجى إدخال اسم المستخدم (الاسم الرباعي المعتمد).'
          : ja
          ? '公式な氏名を入力してください。'
          : 'Please enter your official username.'
      );
      return;
    }

    if (!cleanPassword || cleanPassword.length !== 14 || !/^\d{14}$/.test(cleanPassword)) {
      setError(
        ar
          ? 'كلمة المرور يجب أن تكون الرقم القومي للمعلم/المشرف المكون من ١٤ رقماً.'
          : ja
          ? 'パスワードには14桁の国民IDを入力してください。'
          : 'Password must be your valid 14-digit National ID.'
      );
      return;
    }

    setLoading(true);
    try {
      const result = await dbVerifyEducator(cleanUsername, cleanPassword);
      if (result.success && result.profile) {
        loginEducator({
          name: result.profile.display_name || result.profile.quad_name || cleanUsername,
          nationalId: cleanPassword,
          role: result.role || (result.profile.role as 'teacher' | 'admin') || 'teacher',
          schoolName: result.profile.school_name || '',
          schoolCode: result.profile.school_code || '',
          verifiedAt: Date.now(),
        });

        setSuccess(
          ar
            ? 'تم التحقق بنجاح! جاري الانتقال للبوابة...'
            : ja
            ? '認証に成功しました。移動中...'
            : 'Verified successfully! Redirecting...'
        );
        setTimeout(() => {
          navigate('/portal');
        }, 400);
      } else {
        setError(
          result.error ||
            (ar
              ? 'بيانات الاعتماد غير مسجلة في قاعدة البيانات كمعلم أو مسؤول. يرجى إنشاء حساب جديد.'
              : 'Invalid credentials. Record not found in Supabase database.')
        );
      }
    } catch {
      setError(
        ar
          ? 'حدث خطأ أثناء الاتصال بقاعدة البيانات. يرجى المحاولة ثانية.'
          : 'Connection error. Please try again.'
      );
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
      setError(ar ? 'يرجى كتابة الاسم الرباعي المعتمد كاملاً.' : 'Please enter your full official name.');
      return;
    }

    if (!cleanNationalId || cleanNationalId.length !== 14 || !/^\d{14}$/.test(cleanNationalId)) {
      setError(
        ar
          ? 'الرقم القومي يجب أن يتكون من ١٤ رقماً مصرياً صحيحاً (سيُعتمد ككلمة سر).'
          : 'National ID must be exactly 14 digits.'
      );
      return;
    }

    setLoading(true);
    try {
      const res = await dbRegisterEducator({
        quadName: cleanFullName,
        nationalId: cleanNationalId,
        email: regEmail.trim() || undefined,
        schoolName: regSchoolName.trim() || undefined,
        role: regRole,
        subject: regSubject,
      });

      if (res.success && res.profile) {
        loginEducator({
          name: cleanFullName,
          nationalId: cleanNationalId,
          role: regRole,
          schoolName: regSchoolName.trim() || '',
          schoolCode: 'MOE.EGYPT',
          verifiedAt: Date.now(),
        });

        setSuccess(
          ar
            ? 'تم تسجيل وتفعيل حسابك الرسمي في Supabase بنجاح!'
            : 'Registered and saved to Supabase successfully!'
        );
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
    <div
      dir={ar ? 'rtl' : 'ltr'}
      className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#f5f5f5]"
    >
      {/* Top Navbar */}
      <header className="w-full max-w-[500px] flex items-center justify-between pb-4 mb-2">
        <Link
          to="/"
          className="flex items-center gap-2 text-[12px] font-semibold text-[#0a0a0a] hover:opacity-80 transition-opacity"
        >
          <ArrowRight size={14} className={ar ? '' : 'rotate-180'} />
          <span>{ar ? 'العودة للمنصة العامة' : ja ? '公開サイトへ' : 'Back to Public Platform'}</span>
        </Link>
        <LanguageSelector compact />
      </header>

      {/* Main Container */}
      <div className="w-full max-w-[500px] rounded-[24px] border border-[#e5e5e5] bg-white p-7 sm:p-9 shadow-[0_12px_32px_-12px_rgba(10,10,10,0.18)]">
        {/* Brand header */}
        <div className="flex items-center gap-3 mb-5 border-b border-[#e5e5e5] pb-5">
          <BrandMark size={36} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[17px] font-bold text-[#0a0a0a] tracking-tight">
                SciNexa Educator
              </h1>
              <span className="sn-badge sn-badge-blue !text-[9px]">ISEF 2026</span>
            </div>
            <p className="text-[11px] text-[#737373] mt-0.5">
              {ar
                ? 'بوابة المعلمين والإدارة المدرسية المعتمدة'
                : ja
                ? '公認教員および学校管理者ポータル'
                : 'Verified Teacher & School Administration Portal'}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-[#f5f5f5] rounded-xl mb-5 text-[12px] font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
              mode === 'login'
                ? 'bg-white text-[#0a0a0a] shadow-xs'
                : 'text-[#737373] hover:text-[#0a0a0a]'
            }`}
          >
            <LogIn size={14} />
            <span>{ar ? 'تسجيل الدخول' : ja ? 'ログイン' : 'Log In'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
              mode === 'register'
                ? 'bg-white text-[#0a0a0a] shadow-xs'
                : 'text-[#737373] hover:text-[#0a0a0a]'
            }`}
          >
            <UserPlus size={14} />
            <span>{ar ? 'إنشاء حساب جديد' : ja ? '新規登録' : 'Register'}</span>
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-50 p-3 text-[12px] text-red-600">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-50 p-3 text-[12px] text-emerald-700">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Isolated Portal Notice (100% separate from Clerk Student Google Auth) */}
        <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50/70 px-3.5 py-2.5 text-[11.5px] leading-relaxed text-blue-950 flex items-start gap-2.5">
          <ShieldCheck size={16} className="shrink-0 mt-0.5 text-blue-600" />
          <span>
            {ar
              ? 'هذه البوابة مستقلة كلياً عن دخول الطلاب (Google / Clerk) ولا تتداخل مع بياناتهم. سجل دخولك بالاسم الرباعي أو البريد + الرقم القومي.'
              : ja
              ? 'この教員ポータルは生徒用ログイン（Google / Clerk）と完全に分離されています。'
              : 'This portal is completely isolated from Student Google / Clerk login. Sign in with your verified official credentials.'}
          </span>
        </div>

        {/* ── MODE: LOGIN ── */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-[#0a0a0a] mb-1.5">
                {ar ? 'اسم المستخدم (الاسم الرباعي أو البريد)' : ja ? 'ユーザー名（氏名またはメール）' : 'Username (Full 4-Part Name or Email)'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={ar ? 'مثال: إسلام أسامة محمد' : 'e.g. Islam Osama Mohamed'}
                  className="w-full h-11 px-3.5 pe-10 rounded-xl border border-[#e5e5e5] bg-[#fafafa] text-[13px] text-[#0a0a0a] outline-none focus:border-[#0a0a0a] transition-colors"
                />
                <User size={16} className="absolute end-3.5 top-1/2 -translate-y-1/2 text-[#a3a3a3]" />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#0a0a0a] mb-1.5">
                {ar ? 'كلمة المرور (الرقم القومي - ١٤ رقماً)' : ja ? 'パスワード（国民ID - 14桁）' : 'Password (14-Digit National ID)'}
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  maxLength={14}
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="2990101XXXXXXXXX"
                  className="w-full h-11 px-3.5 pe-10 rounded-xl border border-[#e5e5e5] bg-[#fafafa] text-[13px] text-[#0a0a0a] outline-none focus:border-[#0a0a0a] transition-colors font-mono"
                />
                <KeyRound size={16} className="absolute end-3.5 top-1/2 -translate-y-1/2 text-[#a3a3a3]" />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-[#0a0a0a] hover:bg-[#171717] text-white font-semibold text-[13px] flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
              >
                {loading ? (
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    <span>{ar ? 'تحقق ودخول إلى لوحة الإدارة' : ja ? '認証してダッシュボードへ' : 'Verify & Enter Portal'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* ── MODE: REGISTER ── */
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-[#0a0a0a] mb-1.5">
                {ar ? 'الاسم الرباعي الرسمي' : 'Full 4-Part Official Name'}
              </label>
              <input
                type="text"
                required
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                placeholder={ar ? 'مثال: ياسين محمد عبد الله حسن' : 'Full Name'}
                className="w-full h-11 px-3.5 rounded-xl border border-[#e5e5e5] bg-[#fafafa] text-[13px] text-[#0a0a0a] outline-none focus:border-[#0a0a0a] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#0a0a0a] mb-1.5">
                {ar ? 'الرقم القومي (١٤ رقماً - سيكون كلمة مرورك)' : 'National ID (14 digits - used as password)'}
              </label>
              <input
                type="text"
                required
                maxLength={14}
                dir="ltr"
                value={regNationalId}
                onChange={(e) => setRegNationalId(e.target.value)}
                placeholder="2990101XXXXXXXXX"
                className="w-full h-11 px-3.5 rounded-xl border border-[#e5e5e5] bg-[#fafafa] text-[13px] text-[#0a0a0a] outline-none focus:border-[#0a0a0a] transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#0a0a0a] mb-1.5">
                {ar ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <input
                type="email"
                dir="ltr"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="teacher@moe.edu.eg"
                className="w-full h-11 px-3.5 rounded-xl border border-[#e5e5e5] bg-[#fafafa] text-[13px] text-[#0a0a0a] outline-none focus:border-[#0a0a0a] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#0a0a0a] mb-1.5">
                {ar ? 'اسم مدرستك الحقيقية (اختياري)' : 'School Name (Optional)'}
              </label>
              <input
                type="text"
                value={regSchoolName}
                onChange={(e) => setRegSchoolName(e.target.value)}
                placeholder={ar ? 'مثال: مدرسة السعيدية الثانوية العسكرية' : 'Your school name'}
                className="w-full h-11 px-3.5 rounded-xl border border-[#e5e5e5] bg-[#fafafa] text-[13px] text-[#0a0a0a] outline-none focus:border-[#0a0a0a] transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-[#0a0a0a] mb-1.5">
                  {ar ? 'الدور والصلاحية' : 'Role'}
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as any)}
                  className="w-full h-11 px-3 rounded-xl border border-[#e5e5e5] bg-[#fafafa] text-[12px] text-[#0a0a0a] outline-none focus:border-[#0a0a0a]"
                >
                  <option value="teacher">{ar ? 'معلم مشرف' : 'Teacher'}</option>
                  <option value="admin">{ar ? 'مدير نظام / مسؤول مدرسة' : 'Admin'}</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#0a0a0a] mb-1.5">
                  {ar ? 'التخصص العلمي' : 'Subject'}
                </label>
                <select
                  value={regSubject}
                  onChange={(e) => setRegSubject(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-[#e5e5e5] bg-[#fafafa] text-[12px] text-[#0a0a0a] outline-none focus:border-[#0a0a0a]"
                >
                  <option value="chemistry">{ar ? 'الكيمياء' : 'Chemistry'}</option>
                  <option value="physics">{ar ? 'الفيزياء' : 'Physics'}</option>
                  <option value="biology">{ar ? 'الأحياء' : 'Biology'}</option>
                  <option value="anatomy">{ar ? 'التشريح' : 'Anatomy'}</option>
                  <option value="astronomy">{ar ? 'الفلك' : 'Astronomy'}</option>
                  <option value="geology">{ar ? 'الجيولوجيا' : 'Geology'}</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-[#0a0a0a] hover:bg-[#171717] text-white font-semibold text-[13px] flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
              >
                {loading ? (
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    <UserPlus size={16} />
                    <span>{ar ? 'تسجيل وحفظ في Supabase' : 'Register & Save to Supabase'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EducatorPortalLogin;
