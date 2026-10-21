/**
 * LoginPage.tsx — Unified Institutional Authentication for SciNexa
 * Features:
 *   1. Direct Email & Password Sign-in & Sign-up
 *   2. One-Click Google Authentication (OAuth)
 *   3. Microsoft Office 365 Enterprise Authentication
 *   4. Institutional Identity Verification Password Reset (Student Code & Governorate without inbox reliance)
 */

import React, { useState, useMemo } from 'react';
import { useAuth, type SignUpParams } from '../context/AuthContext';
import { detectRoleFromEmail, isMinistryEmail, GOVERNORATE_KEYWORD_MAP } from '../lib/supabase';
import { EGYPT_GOVERNORATES } from '../data/egyptLocationData';
import {
  Lock,
  Mail,
  User,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  MapPin,
  KeyRound
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const {
    loginWithPassword,
    signUpWithPassword,
    loginWithGoogle,
    loginWithMicrosoft,
    resetPasswordWithInstitutionalVerification,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot_password'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');

  // Forgot Password Verification Fields
  const [resetCode, setResetCode] = useState('');
  const [resetGov, setResetGov] = useState('القاهرة');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Real-time email metadata detection
  const detected = useMemo(() => {
    if (!email || !email.includes('@')) return null;
    return detectRoleFromEmail(email);
  }, [email]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('يرجى إدخال البريد الإلكتروني وكلمة المرور.');
      return;
    }

    setIsLoading(true);
    const res = await loginWithPassword(email, password);
    setIsLoading(false);

    if (res.error) {
      setErrorMessage(res.error);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrorMessage('يرجى إدخال اسمك بالكامل.');
      return;
    }

    if (!email.trim() || !password) {
      setErrorMessage('يرجى ملء البريد الإلكتروني وكلمة المرور.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام.');
      return;
    }

    setIsLoading(true);
    const params: SignUpParams = {
      name: name.trim(),
      email: email.trim(),
      password,
      age: age ? Number(age) : undefined,
      birthday: birthday || undefined,
      gender,
    };

    const res = await signUpWithPassword(params);
    setIsLoading(false);

    if (res.error) {
      setErrorMessage(res.error);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !resetCode.trim()) {
      setErrorMessage('يرجى إدخال البريد الإلكتروني الموحد وكود الطالب.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('كلمة المرور الجديدة يجب أن لا تقل عن 6 أحرف أو أرقام.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('كلمتا المرور غير متطابقتين.');
      return;
    }

    setIsLoading(true);
    const res = await resetPasswordWithInstitutionalVerification({
      email: email.trim(),
      studentCode: resetCode.trim(),
      governorate: resetGov,
      newPassword,
    });
    setIsLoading(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setSuccessMessage(res.message || 'تم تحديث كلمة المرور وتوثيق هويتك بنجاح!');
      setTimeout(() => {
        setMode('login');
        setPassword(newPassword);
      }, 2000);
    }
  };

  const handleGoogleOAuth = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    const res = await loginWithGoogle();
    setIsLoading(false);
    if (res.error) {
      setErrorMessage(res.error);
    }
  };

  const handleMicrosoftOAuth = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    const res = await loginWithMicrosoft();
    setIsLoading(false);
    if (res.error) {
      setErrorMessage(res.error);
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 select-none"
      style={{
        background: `
          radial-gradient(circle at 15% 15%, rgba(79, 140, 255, 0.12), transparent 45%),
          radial-gradient(circle at 85% 85%, rgba(124, 92, 255, 0.12), transparent 45%),
          #090a0d
        `,
        fontFamily: '"Segoe UI", system-ui, -apple-system, Arial, sans-serif',
      }}
    >
      <div
        className="w-full max-w-[470px] rounded-2xl p-6 sm:p-8 backdrop-blur-xl border border-white/10 shadow-2xl"
        style={{
          background: 'rgba(18, 20, 26, 0.90)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.75)',
        }}
      >
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-blue-500/20 border border-indigo-400/30 mb-3 shadow-inner">
            <span className="text-2xl">🔬</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-wide text-white font-mono uppercase">
            SciNexa
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {mode === 'login'
              ? 'مرحباً بعودتك! سجل دخولك للمتابعة في معاملك'
              : mode === 'signup'
              ? 'أنشئ حسابك التعليمي الموحد وانضم لمنظومة المحاكاة'
              : 'استعادة وتعيين كلمة المرور عبر التحقق التعليمي'}
          </p>
        </div>

        {/* Tab Switcher Pills (Only for login and signup) */}
        {mode !== 'forgot_password' && (
          <div className="grid grid-cols-2 p-1 bg-black/40 border border-white/10 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMessage(null); setSuccessMessage(null); }}
              className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMessage(null); setSuccessMessage(null); }}
              className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              إنشاء حساب جديد
            </button>
          </div>
        )}

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3.5 mb-5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm leading-relaxed animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert Box */}
        {successMessage && (
          <div className="flex items-start gap-2.5 p-3.5 mb-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm leading-relaxed animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                البريد الإلكتروني الموحد / المدرسي
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="code@governorate.moe.edu.eg"
                  className="w-full px-3.5 py-2.5 pl-10 rounded-xl bg-[#0d0f14] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Live Detected Role Badge */}
              {detected && (
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>تم التعرّف: {detected.roleLabelAr}</span>
                  {detected.studentCode && (
                    <span className="text-slate-400 font-mono">({detected.studentCode})</span>
                  )}
                  {detected.governorateAr && (
                    <span className="text-amber-400">· {detected.governorateAr}</span>
                  )}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-slate-300">
                  كلمة المرور
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot_password');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                    if (detected?.studentCode) setResetCode(detected.studentCode);
                    if (detected?.governorateAr) setResetGov(detected.governorateAr);
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pl-10 pr-10 rounded-xl bg-[#0d0f14] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 shadow-lg shadow-indigo-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري تسجيل الدخول...</span>
                </>
              ) : (
                <>
                  <span>تسجيل الدخول للمنصة</span>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </>
              )}
            </button>
          </form>
        )}

        {/* 2. SIGN UP FORM */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                الاسم بالكامل
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="الاسم ثلاثي أو رباعي"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0d0f14] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-all"
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                البريد الإلكتروني الموحد / المدرسي
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="code@governorate.moe.edu.eg"
                  className="w-full px-3.5 py-2 pl-10 rounded-xl bg-[#0d0f14] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-all font-mono"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Smart Live Role & School Recognition */}
              {detected ? (
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>الصفة: {detected.roleLabelAr}</span>
                  </span>
                  {detected.studentCode && (
                    <span className="font-mono text-[10px] bg-emerald-950/60 px-1.5 py-0.5 rounded text-emerald-200">
                      كود: {detected.studentCode}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-[10px] text-slate-500 block">
                  يقبل إيميلات الوزارة الموحدة (.moe.edu.eg) وإيميلات المدارس (.edu.eg)
                </span>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                كلمة المرور (6 أحرف أو أكثر)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 pl-10 pr-10 rounded-xl bg-[#0d0f14] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-all font-mono"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Age & Birthday Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300">
                  العمر (سنوات)
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                  placeholder="مثال: 14"
                  className="w-full px-3 py-2 rounded-xl bg-[#0d0f14] border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300">
                  تاريخ الميلاد
                </label>
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0d0f14] border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Gender Select Radio Pills */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                النوع
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    gender === 'male'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-1 ring-blue-500'
                      : 'bg-[#0d0f14] border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <span>👦</span>
                  <span>ذكر</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    gender === 'female'
                      ? 'bg-pink-600/20 border-pink-500 text-pink-300 ring-1 ring-pink-500'
                      : 'bg-[#0d0f14] border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <span>👧</span>
                  <span>أنثى</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 mt-2 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 shadow-lg shadow-indigo-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري تسجيل الحساب...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>إنشاء الحساب وبدء التعلم فوراً</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* 3. FORGOT PASSWORD (INSTITUTIONAL IDENTITY VERIFICATION) */}
        {mode === 'forgot_password' && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs leading-relaxed">
              <strong className="block mb-0.5 text-blue-200 flex items-center gap-1">
                <ShieldCheck size={14} className="text-blue-400" />
                <span>التحقق المؤسسي الآمن:</span>
              </strong>
              استرجع كلمة المرور عبر مطابقة بياناتك المدرسية (كود الطالب والمديرية) دون الحاجة لفتح بريد وارد.
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                البريد الإلكتروني الموحد
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  dir="ltr"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    const numMatch = e.target.value.match(/^(\d+)/);
                    if (numMatch && !resetCode) setResetCode(numMatch[1]);
                  }}
                  placeholder="code@governorate.moe.edu.eg"
                  className="w-full px-3.5 py-2 pl-10 rounded-xl bg-[#0d0f14] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-all font-mono"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Student Code */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300 flex items-center justify-between">
                <span>كود الطالب الموحد</span>
                <span className="text-[10px] text-slate-500 font-mono">(الموجود في الإيميل)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  dir="ltr"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="12345678"
                  className="w-full px-3.5 py-2 pl-10 rounded-xl bg-[#0d0f14] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-all font-mono"
                />
                <GraduationCap className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Governorate / Directorate Selector */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                المحافظة / المديرية التعليمية التابع لها
              </label>
              <div className="relative">
                <select
                  value={resetGov}
                  onChange={(e) => setResetGov(e.target.value)}
                  className="w-full px-3.5 py-2 pl-10 rounded-xl bg-[#0d0f14] border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                >
                  {EGYPT_GOVERNORATES.map((g) => (
                    <option key={g.id} value={g.nameAr} className="bg-[#12141a] text-white">
                      {g.nameAr}
                    </option>
                  ))}
                </select>
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                كلمة المرور الجديدة (6 أحرف أو أكثر)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  dir="ltr"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 pl-10 pr-10 rounded-xl bg-[#0d0f14] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-all font-mono"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                تأكيد كلمة المرور الجديدة
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  dir="ltr"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 pl-10 pr-10 rounded-xl bg-[#0d0f14] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-all font-mono"
                />
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Submit & Back buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 shadow-lg shadow-indigo-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري التحقق والتحديث...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>تأكيد الهوية وتحديث كلمة المرور</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ← العودة إلى صفحة تسجيل الدخول
              </button>
            </div>
          </form>
        )}

        {/* Divider */}
        {mode !== 'forgot_password' && (
          <>
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#12141a] px-3 text-slate-500">أو المتابعة السريعة عبر</span>
              </div>
            </div>

            {/* Social Logins Grid: Google + Microsoft */}
            <div className="space-y-2.5">
              {/* Google SSO */}
              <button
                type="button"
                onClick={handleGoogleOAuth}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 transition-all cursor-pointer active:scale-[0.99]"
              >
                <svg width="18" height="18" viewBox="0 0 48 48" className="shrink-0">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>تسجيل الدخول بواسطة Google</span>
              </button>

              {/* Microsoft Office 365 SSO */}
              <button
                type="button"
                onClick={handleMicrosoftOAuth}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 transition-all cursor-pointer active:scale-[0.99]"
              >
                <svg width="17" height="17" viewBox="0 0 21 21" aria-hidden="true" className="shrink-0">
                  <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                  <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                  <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                  <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                </svg>
                <span>تسجيل مباشر بـ Microsoft Office 365</span>
              </button>
            </div>
          </>
        )}

        {/* Footer Guarantee */}
        <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>تشفير عالي الأمان (bcrypt + SSL 256-bit) لحماية بيانات الطلاب والمدارس</span>
        </div>
      </div>
    </div>
  );
};
