import React, { useState } from 'react';
import { useClerk } from '@clerk/clerk-react';
import { useLanguage } from '../../context/LanguageContext';
import { useSession, type AppRole } from '../../context/SessionContext';
import { isClerkConfigured } from '../../lib/clerkConfig';
import { getPersistedItem, setPersistedItem, setPersistedJSON } from '../../lib/cookies';
import { dbUpsertProfile } from '../../lib/supabase';
import { PageHeader, SectionCard } from './ui';
import {
  User,
  Mail,
  ShieldCheck,
  Languages,
  Bell,
  LogOut,
  Check,
  ExternalLink,
  Laptop,
  WifiOff,
  KeyRound,
  RotateCcw,
  Save,
  Phone,
  Compass,
} from 'lucide-react';

const ROLE_META: Record<AppRole, { en: string; ar: string; badge: string }> = {
  student: { en: 'Student', ar: 'طالب', badge: 'sn-badge-blue' },
  teacher: { en: 'Teacher', ar: 'معلم', badge: 'sn-badge-green' },
  admin: { en: 'Administrator', ar: 'إدارة', badge: 'sn-badge-amber' },
};

const ManageClerkAccount: React.FC<{ ar: boolean }> = ({ ar }) => {
  const { openUserProfile } = useClerk();
  return (
    <button
      type="button"
      onClick={() => openUserProfile()}
      className="sn-btn sn-btn-outline sn-btn-sm"
    >
      <ExternalLink size={13} strokeWidth={1.8} />
      {ar ? 'إدارة حساب Clerk' : 'Manage in Clerk'}
    </button>
  );
};

const Toggle: React.FC<{ on: boolean; onChange: () => void; label: string }> = ({ on, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    aria-label={label}
    onClick={onChange}
    className={`relative h-[22px] w-[38px] shrink-0 rounded-full border transition-colors ${
      on ? 'border-[#0a0a0a] bg-[#0a0a0a]' : 'border-[#e5e5e5] bg-[#f0f0f0]'
    }`}
  >
    <span
      className={`absolute top-[2px] h-[16px] w-[16px] rounded-full bg-white transition-all ${
        on ? 'start-[18px]' : 'start-[2px]'
      }`}
    />
  </button>
);

export const SettingsPage: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { user, role, signOut } = useSession();
  const ar = language === 'ar';

  // Persistent student name & phone
  const [fullName, setFullName] = useState(() => getPersistedItem('scinexa_user_fullname') || user?.name || '');
  const [parentPhone, setParentPhone] = useState(() => getPersistedItem('scinexa_parent_phone') || '');
  const [nameSaveMsg, setNameSaveMsg] = useState<string | null>(null);

  // Grade
  const [savedGrade, setSavedGrade] = useState(() => getPersistedItem('scinexa_grade', 'sec2'));
  const [gradeSavedNotice, setGradeSavedNotice] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  const isResearcher = savedGrade === 'university' || savedGrade === 'researcher';

  const handleSaveNameAndPhone = async () => {
    const cleanName = fullName.trim();
    const cleanPhone = parentPhone.trim().replace(/\D/g, '');
    if (!cleanName) return;

    setPersistedItem('scinexa_user_fullname', cleanName);
    if (cleanPhone) {
      setPersistedItem('scinexa_parent_phone', cleanPhone);
    }

    try {
      await dbUpsertProfile({
        id: user?.id || ('st_' + Date.now()),
        email: user?.email,
        display_name: cleanName,
        quad_name: cleanName,
        parent_phone: cleanPhone,
        grade_level: savedGrade,
        role: 'student',
      });
      window.dispatchEvent(new CustomEvent('scinexa_profile_updated', {
        detail: { quadName: cleanName, parentPhone: cleanPhone, gradeLevel: savedGrade }
      }));
    } catch {
      /* ignore */
    }

    setNameSaveMsg(
      ar
        ? '✓ تم حفظ الاسم الرباعي ورقم الهاتف بنجاح وتحديثهما عبر كامل المنصة.'
        : '✓ Official name and phone number saved successfully across the platform.'
    );
    setTimeout(() => setNameSaveMsg(null), 4000);
  };

  const handleSaveGrade = (newG: string) => {
    setSavedGrade(newG);
    setPersistedItem('scinexa_grade', newG);
    setGradeSavedNotice(true);
    try {
      window.dispatchEvent(new CustomEvent('scinexa_profile_updated', {
        detail: { gradeLevel: newG }
      }));
    } catch {
      /* ignore */
    }
    setTimeout(() => setGradeSavedNotice(false), 4000);
  };

  const handleResetProgress = () => {
    const confirmMsg = ar
      ? 'هل أنت متأكد من رغبتك في تصفير سجل التقدم المعملي ونقاط XP والبدء من الصفر (0%)؟'
      : 'Are you sure you want to reset all lab progress, completed lessons and XP to 0?';
    if (!window.confirm(confirmMsg)) return;

    setPersistedJSON('scinexa_completed_lessons', []);
    setPersistedItem('scinexa_user_xp', '0');
    setPersistedItem('scinexa_user_streak', '0');
    setPersistedItem('scinexa_user_stars', '0');

    setResetMsg(ar ? '✓ تم تصفير سجل الدروس ونقاط XP بنجاح (0 دروس، 0 XP).' : '✓ Lab progress reset to zero (0 lessons, 0 XP).');
    try {
      window.dispatchEvent(new Event('scinexa_progress_reset'));
    } catch {
      /* ignore */
    }
    setTimeout(() => setResetMsg(null), 4000);
  };

  const [notifications, setNotifications] = useState({
    assessments: true,
    assignments: true,
    product: false,
  });

  const roleMeta = isResearcher
    ? { en: 'Researcher', ar: 'باحث علمي حر', badge: 'sn-badge-green' }
    : ROLE_META[role];

  return (
    <div>
      <PageHeader
        eyebrow={ar ? 'الحساب' : 'Account'}
        title={ar ? 'الإعدادات' : 'Settings'}
        subtitle={
          ar
            ? 'بيانات الحساب، الاسم الرسمي، اللغة، الإشعارات، والوصول. كل شيء في مكان واحد.'
            : 'Profile, official name, language, notifications and access. Everything in one place.'
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <div className="space-y-4">
          {/* Profile & Official Name Editor */}
          <SectionCard title={ar ? 'الملف الشخصي والاسم الرسمي' : 'Official Profile & Name'}>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="h-14 w-14 rounded-full object-cover" />
              ) : (
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0a0a0a] text-[20px] font-medium text-white">
                  {(fullName || user?.name || 'S').charAt(0).toUpperCase()}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[16px] font-semibold tracking-[-0.02em]">{fullName || user?.name}</h2>
                  <span className={`sn-badge ${roleMeta.badge} !text-[10px]`}>{ar ? roleMeta.ar : roleMeta.en}</span>
                </div>
                <div dir="ltr" className="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-[#737373]">
                  <Mail size={12} strokeWidth={1.8} />
                  {user?.email}
                </div>
                {savedGrade && (
                  <div className="mt-1 text-[11px] text-[#737373]">
                    {isResearcher ? (ar ? 'مسار البحث العلمي' : 'Scientific Research Path') : savedGrade}
                  </div>
                )}
              </div>
              {isClerkConfigured && <ManageClerkAccount ar={ar} />}
            </div>

            <div className="mt-5 grid gap-3 border-t border-[#f0f0f0] pt-4 sm:grid-cols-2">
              <div>
                <label className="sn-label" htmlFor="settings-name">
                  {isResearcher
                    ? (ar ? 'الاسم الرباعي الرسمي للباحث' : 'Researcher Full Name')
                    : (ar ? 'الاسم الرباعي الرسمي للطالب' : 'Official Full Name')}
                </label>
                <input
                  id="settings-name"
                  className="sn-input font-medium"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={ar ? 'اكتب اسمك الرباعي الرسمي هنا...' : 'Enter your full quad name...'}
                />
              </div>

              <div>
                <label className="sn-label" htmlFor="settings-phone">
                  {isResearcher
                    ? (ar ? 'رقم الهاتف الشخصي (للتواصل العلمي)' : 'Personal Mobile Phone')
                    : (ar ? 'رقم هاتف ولي الأمر (للمتابعة)' : 'Parent Mobile Phone')}
                </label>
                <div className="relative">
                  <input
                    id="settings-phone"
                    dir="ltr"
                    className="sn-input font-mono text-[12px] pe-8"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                  />
                  <Phone size={13} className="absolute end-2.5 top-1/2 -translate-y-1/2 text-[#737373]" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="sn-label" htmlFor="settings-email">{ar ? 'البريد الإلكتروني المسجل' : 'Registered Email'}</label>
                <input id="settings-email" dir="ltr" className="sn-input font-mono text-[12px]" defaultValue={user?.email} readOnly />
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-[#f0f0f0] pt-3">
              <p className="text-[11px] text-[#737373]">
                {ar
                  ? 'يظهر هذا الاسم في لوحة التحكم، تقارير المعامل، وشهادات الإنجاز بدلاً من اسم حساب جوجل.'
                  : 'This official name appears on dashboard greetings, lab reports and certificates.'}
              </p>
              <button
                type="button"
                onClick={handleSaveNameAndPhone}
                className="sn-btn sn-btn-primary sn-btn-sm shrink-0 flex items-center gap-1.5"
              >
                <Save size={13} strokeWidth={2} />
                <span>{ar ? 'حفظ البيانات الرسمية' : 'Save Details'}</span>
              </button>
            </div>

            {nameSaveMsg && (
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                {nameSaveMsg}
              </div>
            )}
          </SectionCard>

          {/* Grade Locking & Management Section */}
          <SectionCard title={ar ? "الصف الدراسي أو المسار البحثي" : "Educational Grade or Research Path"}>
            <div className="flex flex-col gap-3">
              <p className="text-[12px] text-[#737373] leading-relaxed">
                {ar
                  ? "الصف أو المسار يحدد المناهج والتجارب الافتراضية المرتبطة بك في المنصة. باحثو المرحلة الجامعية والبحث العلمي الحر تتاح لهم كامل المعامل وأدوات البحث دون قيود المناهج المدرسية."
                  : "Your academic stage defines available curriculum pathways and experiments. University students and independent researchers get full access to 3D labs without school curriculum restrictions."}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
                <select
                  value={savedGrade}
                  onChange={(e) => handleSaveGrade(e.target.value)}
                  className="sn-input !h-10 text-[13px] flex-1 font-semibold"
                >
                  <option value="prep1">{ar ? "الصف الأول الإعدادي" : "1st Prep"}</option>
                  <option value="prep2">{ar ? "الصف الثاني الإعدادي" : "2nd Prep"}</option>
                  <option value="prep3">{ar ? "الصف الثالث الإعدادي (الشهادة الإعدادية)" : "3rd Prep"}</option>
                  <option value="sec1">{ar ? "الصف الأول الثانوي" : "1st Secondary"}</option>
                  <option value="sec2">{ar ? "الصف الثاني الثانوي" : "2nd Secondary"}</option>
                  <option value="sec3">{ar ? "الصف الثالث الثانوي (الثانوية العامة)" : "3rd Secondary"}</option>
                  <option value="stem">{ar ? "مدارس المتفوقين في العلوم والتكنولوجيا (STEM)" : "STEM High School"}</option>
                  <option value="university">{ar ? "المرحلة الجامعية (طالب جامعي / أكاديمي)" : "University Student"}</option>
                  <option value="researcher">{ar ? "باحث علمي حر (أكاديمي مستقل)" : "Independent Scientific Researcher"}</option>
                </select>
              </div>
              {gradeSavedNotice && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                  ✓ {ar ? "تم حفظ وتحديث مسارك الدراسي بنجاح! تم تحديث واجهة المنصة والمعامل." : "Academic stage updated successfully!"}
                </div>
              )}
            </div>
          </SectionCard>

          {/* Language */}
          <SectionCard
            title={ar ? 'اللغة والمظهر' : 'Language & appearance'}
            action={<Languages size={14} strokeWidth={1.7} className="text-[#a3a3a3]" />}
          >
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="text-[12px] font-medium">{ar ? 'لغة الواجهة (٥ لغات معتمدة)' : 'Interface language (5 supported languages)'}</div>
                <div className="mt-0.5 text-[11px] text-[#737373]">
                  {ar ? 'تتغير اتجاهات الواجهة والنصوص بالكامل تلقائيًا.' : 'Layout direction and all copy update automatically.'}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { code: "ar" as const, label: "العربية 🇪🇬" },
                  { code: "en" as const, label: "English 🇬🇧" },
                  { code: "fr" as const, label: "Français 🇫🇷" },
                  { code: "de" as const, label: "Deutsch 🇩🇪" },
                  { code: "ja" as const, label: "日本語 🇯🇵" },
                ].map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLanguage(l.code)}
                    className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all ${
                      language === l.code
                        ? "bg-[#0a0a0a] text-white shadow-xs"
                        : "bg-[#fafafa] border border-[#e5e5e5] text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f0f0f0]"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-[#f0f0f0] pt-4">
              <div>
                <div className="text-[12px] font-medium">{ar ? 'المظهر' : 'Theme'}</div>
                <div className="mt-0.5 text-[11px] text-[#737373]">{ar ? 'الوضع الفاتح هو الافتراضي.' : 'Light is the default surface.'}</div>
              </div>
              <div className="flex gap-1.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0a0a0a] bg-white px-2.5 py-1 text-[10px] font-medium">
                  <Laptop size={11} strokeWidth={1.8} />
                  {ar ? 'فاتح' : 'Light'}
                  <Check size={10} strokeWidth={2.4} />
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e5e5] bg-[#fafafa] px-2.5 py-1 text-[10px] text-[#a3a3a3]">
                  {ar ? 'داكن قريبًا' : 'Dark soon'}
                </span>
              </div>
            </div>
          </SectionCard>

          {/* Lab Progress & XP Reset Tool */}
          <SectionCard
            title={ar ? 'إدارة سجل التقدم المعملي ونقاط XP' : 'Lab Progress & XP Management'}
            action={<RotateCcw size={14} strokeWidth={1.7} className="text-[#a3a3a3]" />}
          >
            <div className="space-y-3">
              <p className="text-[12px] text-[#737373] leading-relaxed">
                {ar
                  ? 'إذا كنت تريد بدء تدريبك المعملي من الصفر التام وبدقة واقعية (0 دروس مكتملة و 0 XP)، يمكنك تصفير السجل بضغطة واحدة.'
                  : 'If you want to restart your lab training from scratch with strictly real statistics (0 lessons, 0 XP), you can reset it here.'}
              </p>
              <button
                type="button"
                onClick={handleResetProgress}
                className="sn-btn sn-btn-outline sn-btn-sm text-amber-700 hover:bg-amber-50 hover:border-amber-400"
              >
                <RotateCcw size={13} strokeWidth={2} />
                <span>{ar ? 'تصفير السجل والبدء من الصفر (0 XP و 0 دروس)' : 'Reset Progress to Zero (0 XP, 0 Lessons)'}</span>
              </button>

              {resetMsg && (
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 text-[11px] font-semibold border border-amber-200">
                  {resetMsg}
                </div>
              )}
            </div>
          </SectionCard>

          {/* Notifications */}
          <SectionCard title={ar ? 'الإشعارات' : 'Notifications'} action={<Bell size={14} strokeWidth={1.7} className="text-[#a3a3a3]" />} bodyClassName="p-2">
            {[
              { key: 'assessments' as const, en: 'Weekly assessments', ar: 'التقييمات الأسبوعية', dEn: 'A reminder before each Ministry assessment.', dAr: 'تذكير قبل كل تقييم من كراسة الوزارة.' },
              { key: 'assignments' as const, en: 'Assignments from teachers', ar: 'واجبات المعلمين', dEn: 'New work, due dates and review results.', dAr: 'واجبات جديدة ومواعيد تسليم ونتائج المراجعة.' },
              { key: 'product' as const, en: 'Product updates', ar: 'تحديثات المنصة', dEn: 'New labs and curriculum releases.', dAr: 'معامل جديدة وإصدارات المناهج.' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-4 rounded-[10px] px-3 py-3 hover:bg-[#fafafa]">
                <div>
                  <div className="text-[12px] font-medium">{ar ? item.ar : item.en}</div>
                  <div className="mt-0.5 text-[11px] text-[#737373]">{ar ? item.dAr : item.dEn}</div>
                </div>
                <Toggle
                  on={notifications[item.key]}
                  onChange={() => setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                  label={ar ? item.ar : item.en}
                />
              </div>
            ))}
          </SectionCard>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <SectionCard title={ar ? 'الوصول والدور' : 'Access & role'} action={<KeyRound size={14} strokeWidth={1.7} className="text-[#a3a3a3]" />}>
            <div className="flex items-start gap-3 rounded-[12px] border border-[#e5e5e5] bg-[#fafafa] p-3.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-white">
                <ShieldCheck size={15} strokeWidth={1.7} className="text-[#047857]" />
              </span>
              <div>
                <div className="text-[12px] font-medium">{isClerkConfigured ? (ar ? 'Clerk متصل' : 'Clerk connected') : ar ? 'جلسة تجريبية محلية' : 'Local demo session'}</div>
                <div className="mt-0.5 text-[11px] leading-relaxed text-[#737373]">
                  {isClerkConfigured
                    ? ar
                      ? 'الأدوار تُقرأ من publicMetadata.role.'
                      : 'Roles are read from publicMetadata.role.'
                    : ar
                      ? 'أضف مفتاح Clerk لتفعيل المصادقة الحقيقية والأدوار.'
                      : 'Add a Clerk key to enable real authentication and roles.'}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#f0f0f0] flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-[0.08em] text-[#a3a3a3] font-semibold">
                {ar ? 'بوابة المعلمين والإدارة المدرسية المعتمدة' : 'Official Educator Portal'}
              </span>
              <a
                href="/portal/login"
                className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] hover:bg-white hover:border-[#0284c7] p-3 text-[12px] font-bold text-[#0284c7] flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} />
                  <span>{ar ? 'دخول بوابة المعلمين والإدارة (محمية بكلمة مرور)' : 'Educator & Admin Login (Secured)'}</span>
                </div>
                <span>➔</span>
              </a>
            </div>
          </SectionCard>

          <SectionCard title={ar ? 'العمل دون إنترنت' : 'Offline access'} action={<WifiOff size={14} strokeWidth={1.7} className="text-[#a3a3a3]" />}>
            <p className="text-[11px] leading-relaxed text-[#737373]">
              {ar
                ? 'نسخة USB أو شبكة محلية متاحة للمدارس. تتزامن البيانات تلقائيًا عند العودة للاتصال.'
                : 'A USB or LAN build is available for schools. Data syncs automatically when the connection returns.'}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="sn-badge sn-badge-green">{ar ? 'جاهز' : 'Ready'}</span>
              <span className="font-mono text-[10px] text-[#a3a3a3]">PWA · USB · LAN</span>
            </div>
          </SectionCard>

          <SectionCard title={ar ? 'الجهاز والجلسة' : 'Device & session'}>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-[#737373]">{ar ? 'الجهاز' : 'Device'}</span>
                <span className="font-medium">{/Mobi|Android/i.test(navigator.userAgent) ? (ar ? 'هاتف' : 'Mobile') : ar ? 'كمبيوتر' : 'Desktop'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#737373]">{ar ? 'اللغة' : 'Locale'}</span>
                <span className="font-mono">{navigator.language}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#737373]">{ar ? 'الحالة' : 'Status'}</span>
                <span className="inline-flex items-center gap-1.5 font-medium text-[#047857]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#047857]" />
                  {ar ? 'نشطة' : 'Active'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void signOut()}
              className="sn-btn sn-btn-outline mt-4 w-full text-[#e7000b] hover:border-[#e7000b]/30 hover:bg-[#fff1f2]"
            >
              <LogOut size={14} strokeWidth={1.8} />
              {ar ? 'تسجيل الخروج' : 'Sign out'}
            </button>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
