import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { useLanguage } from '../../context/LanguageContext';
import { useSession, type AppRole } from '../../context/SessionContext';
import { clerkAppearance, isClerkConfigured } from '../../lib/clerkConfig';
import { Wordmark } from '../ui/Brand';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  GraduationCap,
  Presentation,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface AuthPageProps {
  mode: 'signin' | 'signup';
}

const ROLES: { id: AppRole; icon: React.ElementType; en: string; ar: string; descEn: string; descAr: string }[] = [
  { id: 'student', icon: GraduationCap, en: 'Student', ar: 'طالب', descEn: 'Labs, lessons, progress', descAr: 'معامل ودروس وتقدّم' },
  { id: 'teacher', icon: Presentation, en: 'Teacher', ar: 'معلم', descEn: 'Classes and assignments', descAr: 'فصول وواجبات' },
  { id: 'admin', icon: ShieldCheck, en: 'Administrator', ar: 'إدارة', descEn: 'School and access control', descAr: 'المدرسة والصلاحيات' },
];

const AuthAside: React.FC<{ ar: boolean }> = ({ ar }) => (
  <aside className="relative hidden overflow-hidden bg-[#0a0a0a] p-10 text-white lg:flex lg:flex-col lg:justify-between">
    <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:44px_44px]" />
    <div className="absolute -end-20 top-1/4 h-72 w-72 rounded-full bg-[radial-gradient(circle,#1d4ed8_0,transparent_70%)] opacity-30 blur-2xl" />

    <div className="relative">
      <Link to="/" aria-label="SciNexa home">
        <Wordmark inverted />
      </Link>
    </div>

    <div className="relative max-w-[420px]">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5">
        <Sparkles size={12} strokeWidth={1.8} className="text-white/70" />
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/55">
          {ar ? 'غرفة المراقبة العلمية' : 'The science observatory'}
        </span>
      </div>
      <h2 className="text-[34px] font-semibold leading-[1.15] tracking-[-0.04em] text-white">
        {ar ? 'كل تجربة تبدأ بملاحظة دقيقة.' : 'Every experiment begins with a precise observation.'}
      </h2>
      <p className="mt-4 text-[13px] leading-[1.7] text-white/50">
        {ar
          ? 'ستة معامل ثلاثية الأبعاد، ومنهج مصري كامل، وتقدّم محفوظ لكل طالب — في مكان واحد.'
          : 'Six 3D laboratories, a complete Egyptian curriculum, and saved progress for every student — in one place.'}
      </p>

      <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
        {[
          { v: '6', l: ar ? 'معامل' : 'labs' },
          { v: '2,821', l: ar ? 'بنية' : 'structures' },
          { v: '118', l: ar ? 'عنصرًا' : 'elements' },
        ].map((s) => (
          <div key={s.l}>
            <div className="text-[22px] font-semibold tracking-[-0.04em]">{s.v}</div>
            <div className="mt-1 text-[10px] text-white/40">{s.l}</div>
          </div>
        ))}
      </div>
    </div>

    <div className="relative flex items-center gap-2 text-[10px] text-white/35">
      <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
      <span className="font-mono uppercase tracking-[0.14em]">
        {ar ? 'النظام يعمل' : 'All systems operational'}
      </span>
    </div>
  </aside>
);

const DemoAuthForm: React.FC<{ mode: 'signin' | 'signup'; ar: boolean }> = ({ mode, ar }) => {
  const { signInDemo } = useSession();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AppRole>('student');

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    signInDemo({ name, email, role });
    navigate('/app');
  };

  return (
    <div>
      <div className="mb-6">
        <div className="sn-eyebrow">{isClerkConfigured ? (ar ? 'كليرك' : 'Clerk') : ar ? 'جلسة تجريبية' : 'Demo session'}</div>
        <h1 className="sn-h1 mt-2">
          {mode === 'signin'
            ? ar
              ? 'سجّل الدخول إلى المعمل'
              : 'Sign in to the observatory'
            : ar
              ? 'أنشئ حسابك التعليمي'
              : 'Create your school account'}
        </h1>
        <p className="mt-2 text-[13px] text-[#737373]">
          {mode === 'signin'
            ? ar
              ? 'أكمل بياناتك للوصول إلى معاملك ومتابعة تقدّمك.'
              : 'Continue to your labs and saved progress.'
            : ar
              ? 'حساب واحد لكل المعامل والمناهج والتقييمات.'
              : 'One account for every lab, curriculum and assessment.'}
        </p>
      </div>

      {!isClerkConfigured && (
        <div className="mb-5 rounded-[10px] border border-[#e5e5e5] bg-[#fafafa] px-3.5 py-3 text-[11px] leading-relaxed text-[#737373]">
          <span className="font-medium text-[#171717]">{ar ? 'وضع تجريبي محلي.' : 'Local demo mode.'}</span>{' '}
          {ar
            ? 'أضف VITE_CLERK_PUBLISHABLE_KEY لتشغيل تسجيل الدخول عبر Clerk.'
            : 'Add VITE_CLERK_PUBLISHABLE_KEY to enable Clerk authentication.'}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="sn-label" htmlFor="auth-name">
            {ar ? 'الاسم الكامل' : 'Full name'}
          </label>
          <input
            id="auth-name"
            className="sn-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={ar ? 'مثال: ياسين زيد' : 'e.g. Yaseen Zed'}
            autoComplete="name"
            required
          />
        </div>

        <div>
          <label className="sn-label" htmlFor="auth-email">
            {ar ? 'البريد المدرسي' : 'School email'}
          </label>
          <input
            id="auth-email"
            className="sn-input font-mono text-[13px]"
            type="email"
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="code@school.moe.edu.eg"
            autoComplete="email"
            required
          />
        </div>

        <div>
          <span className="sn-label">{ar ? 'الدور' : 'Role'}</span>
          <div className="grid grid-cols-3 gap-2">
            {ROLES.map((item) => {
              const Icon = item.icon;
              const selected = role === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRole(item.id)}
                  aria-pressed={selected}
                  className={`flex flex-col items-start gap-2 rounded-[10px] border p-3 text-start transition-all ${
                    selected
                      ? 'border-[#0a0a0a] bg-white shadow-[0_0_0_1px_#0a0a0a]'
                      : 'border-[#e5e5e5] bg-[#fafafa] hover:border-[#d4d4d4]'
                  }`}
                >
                  <Icon size={15} strokeWidth={1.7} className={selected ? 'text-[#0a0a0a]' : 'text-[#737373]'} />
                  <span className="text-[12px] font-medium">{ar ? item.ar : item.en}</span>
                  <span className="text-[9px] leading-tight text-[#737373]">{ar ? item.descAr : item.descEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button type="submit" className="sn-btn sn-btn-primary w-full">
          {mode === 'signin' ? (ar ? 'متابعة' : 'Continue') : ar ? 'إنشاء الحساب' : 'Create account'}
          <ArrowRight size={15} strokeWidth={1.8} className={ar ? 'rotate-180' : ''} />
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          signInDemo({ name: ar ? 'زائر' : 'Guest', email: 'guest@scinexa.school', role: 'student' });
          navigate('/app');
        }}
        className="sn-btn sn-btn-ghost mt-3 w-full"
      >
        {ar ? 'الدخول السريع كزائر' : 'Continue as guest'}
      </button>

      <p className="mt-6 text-center text-[12px] text-[#737373]">
        {mode === 'signin' ? (
          <>
            {ar ? 'ليس لديك حساب؟' : 'No account yet?'}{' '}
            <Link to="/sign-up" className="font-medium text-[#1d4ed8] hover:underline">
              {ar ? 'أنشئ حسابًا' : 'Create one'}
            </Link>
          </>
        ) : (
          <>
            {ar ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
            <Link to="/sign-in" className="font-medium text-[#1d4ed8] hover:underline">
              {ar ? 'سجّل الدخول' : 'Sign in'}
            </Link>
          </>
        )}
      </p>
    </div>
  );
};

export const AuthPage: React.FC<AuthPageProps> = ({ mode }) => {
  const { language } = useLanguage();
  const { isSignedIn, signInDemo } = useSession();
  const location = useLocation();
  const navigate = useNavigate();
  const ar = language === 'ar';
  const insecureContext =
    typeof window !== 'undefined' &&
    !window.isSecureContext &&
    !['localhost', '127.0.0.1'].includes(window.location.hostname);

  const isCallback = location.pathname.includes('sso-callback') || location.pathname.includes('callback');

  // Never redirect away from an OAuth callback: Clerk must finish processing
  // the handshake (especially in cookieless development mode).
  if (isSignedIn && !isCallback) return <Navigate to="/app" replace />;

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[0.92fr_1.08fr]" dir={ar ? 'rtl' : 'ltr'}>
      <AuthAside ar={ar} />

      <main className="flex flex-col">
        <div className="flex items-center justify-end px-6 py-5 lg:px-10">
          <Link to="/" className="sn-btn sn-btn-quiet sn-btn-sm">
            <ArrowLeft size={15} strokeWidth={1.8} className={ar ? 'rotate-180' : ''} />
            {ar ? 'العودة للموقع' : 'Back to site'}
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-12 lg:px-10">
          <div className="w-full max-w-[430px]">
            <div className="mb-8 lg:hidden">
              <Link to="/" aria-label="SciNexa home">
                <Wordmark />
              </Link>
            </div>

            {isClerkConfigured ? (
              <div className="w-full">
                {mode === 'signin' ? (
                  <SignIn
                    routing="path"
                    path="/sign-in"
                    oauthFlow="popup"
                    signUpUrl="/sign-up"
                    fallbackRedirectUrl="/app"
                    signUpFallbackRedirectUrl="/app"
                    appearance={clerkAppearance}
                  />
                ) : (
                  <SignUp
                    routing="path"
                    path="/sign-up"
                    oauthFlow="popup"
                    signInUrl="/sign-in"
                    fallbackRedirectUrl="/app"
                    signInFallbackRedirectUrl="/app"
                    appearance={clerkAppearance}
                  />
                )}

                {/* Direct Guest Access Button Under Clerk */}
                <div className="mt-4 pt-3 border-t border-[#e5e5e5]">
                  <button
                    type="button"
                    onClick={() => {
                      signInDemo({ name: ar ? 'زائر' : 'Guest', email: 'guest@scinexa.school', role: 'student' });
                      navigate('/app');
                    }}
                    className="sn-btn sn-btn-outline w-full !border-cyan-600/30 !bg-cyan-50/40 hover:!bg-cyan-100/60 !text-cyan-900 font-bold text-[13px] py-2.5 shadow-xs cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles size={15} strokeWidth={2} className="text-cyan-600" />
                    <span>{ar ? 'الدخول السريع للمنصة كزائر' : 'Instant Access as Guest'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <DemoAuthForm mode={mode} ar={ar} />
            )}

            {insecureContext && (
              <div className="mt-5 rounded-[10px] border border-[#fde68a] bg-[#fffbeb] px-3.5 py-3 text-[11px] leading-relaxed text-[#92400e]">
                {ar
                  ? 'المصادقة تحتاج HTTPS أو localhost. افتح الرابط على http://localhost:5173 بدل عنوان الشبكة المحلية.'
                  : 'Authentication requires HTTPS or localhost. Open http://localhost:5173 instead of the LAN IP address.'}
              </div>
            )}

            {isClerkConfigured ? (
              <p className="mt-6 text-center text-[10px] leading-relaxed text-[#a3a3a3]">
                {ar
                  ? 'تسجيل Google يفتح نافذة منبثقة. اسمح بالنوافذ المنبثقة لهذا الموقع إن لم تُكمل العملية.'
                  : 'Google sign-in opens a secure popup. Allow popups for this site if the flow does not complete.'}
              </p>
            ) : (
              <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-[#a3a3a3]">
                <Check size={11} strokeWidth={2} className="text-[#047857]" />
                {ar ? 'جلسة محلية تجريبية · ليست مصادقة إنتاجية' : 'Local demo session · not production auth'}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthPage;
