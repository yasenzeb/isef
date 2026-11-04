import React, { useState } from 'react';
import { useClerk } from '@clerk/clerk-react';
import { useLanguage } from '../../context/LanguageContext';
import { useSession, type AppRole } from '../../context/SessionContext';
import { isClerkConfigured } from '../../lib/clerkConfig';
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
  UserCog,
  Laptop,
  WifiOff,
  KeyRound,
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
  const { user, role, isDemo, isRolePreview, switchDemoRole, clearRolePreview, signOut } = useSession();
  const ar = language === 'ar';

  const [notifications, setNotifications] = useState({
    assessments: true,
    assignments: true,
    product: false,
  });

  const roleMeta = ROLE_META[role];

  return (
    <div>
      <PageHeader
        eyebrow={ar ? 'الحساب' : 'Account'}
        title={ar ? 'الإعدادات' : 'Settings'}
        subtitle={
          ar
            ? 'بيانات الحساب، اللغة، الإشعارات، والوصول. كل شيء في مكان واحد.'
            : 'Profile, language, notifications and access. Everything in one place.'
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <div className="space-y-4">
          {/* Profile */}
          <SectionCard title={ar ? 'الملف الشخصي' : 'Profile'}>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="h-14 w-14 rounded-full object-cover" />
              ) : (
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0a0a0a] text-[20px] font-medium text-white">
                  {(user?.name ?? 'S').charAt(0).toUpperCase()}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[16px] font-semibold tracking-[-0.02em]">{user?.name}</h2>
                  <span className={`sn-badge ${roleMeta.badge} !text-[10px]`}>{ar ? roleMeta.ar : roleMeta.en}</span>
                </div>
                <div dir="ltr" className="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-[#737373]">
                  <Mail size={12} strokeWidth={1.8} />
                  {user?.email}
                </div>
                {user?.grade && <div className="mt-1 text-[11px] text-[#737373]">{user.grade}</div>}
              </div>
              {isClerkConfigured && <ManageClerkAccount ar={ar} />}
            </div>

            <div className="mt-5 grid gap-3 border-t border-[#f0f0f0] pt-4 sm:grid-cols-2">
              <div>
                <label className="sn-label" htmlFor="settings-name">{ar ? 'الاسم' : 'Display name'}</label>
                <input id="settings-name" className="sn-input" defaultValue={user?.name} readOnly={!isDemo} />
              </div>
              <div>
                <label className="sn-label" htmlFor="settings-email">{ar ? 'البريد' : 'Email'}</label>
                <input id="settings-email" dir="ltr" className="sn-input font-mono text-[12px]" defaultValue={user?.email} readOnly />
              </div>
            </div>
          </SectionCard>

          {/* Language */}
          <SectionCard
            title={ar ? 'اللغة والمظهر' : 'Language & appearance'}
            action={<Languages size={14} strokeWidth={1.7} className="text-[#a3a3a3]" />}
          >
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="text-[12px] font-medium">{ar ? 'لغة الواجهة' : 'Interface language'}</div>
                <div className="mt-0.5 text-[11px] text-[#737373]">
                  {ar ? 'تتغير اتجاهات الواجهة تلقائيًا.' : 'Layout direction updates automatically.'}
                </div>
              </div>
              <div className="sn-segmented w-fit">
                <button type="button" onClick={() => setLanguage('ar')} className={`sn-segment ${ar ? 'active' : ''}`}>
                  العربية
                </button>
                <button type="button" onClick={() => setLanguage('en')} className={`sn-segment ${!ar ? 'active' : ''}`}>
                  English
                </button>
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

            {(isDemo || import.meta.env.DEV) && (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.08em] text-[#a3a3a3]">
                  <span className="flex items-center gap-1.5">
                    <UserCog size={11} strokeWidth={1.8} />
                    {ar ? 'معاينة الدور' : 'Preview role'}
                  </span>
                  {isRolePreview && (
                    <button type="button" onClick={clearRolePreview} className="normal-case tracking-normal text-[#1d4ed8] hover:underline">
                      {ar ? 'إعادة ضبط' : 'Reset'}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['student', 'teacher', 'admin'] as AppRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => switchDemoRole(r)}
                      className={`rounded-[10px] border px-2 py-2 text-[11px] font-medium transition-all ${
                        role === r ? 'border-[#0a0a0a] bg-white shadow-[0_0_0_1px_#0a0a0a]' : 'border-[#e5e5e5] bg-[#fafafa] hover:border-[#d4d4d4]'
                      }`}
                    >
                      {ar ? ROLE_META[r].ar : ROLE_META[r].en}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
