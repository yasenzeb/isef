import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';
import { useLanguage } from '../../context/LanguageContext';
import { useSession, type AppRole } from '../../context/SessionContext';
import { isClerkConfigured } from '../../lib/clerkConfig';
import { getPersistedItem, setPersistedItem, setPersistedJSON } from '../../lib/cookies';
import { dbUpsertProfile, dbDeleteAccount } from '../../lib/supabase';
import { saveScopedUserProfile, deleteScopedUserProfile, clearActiveSessionKeys } from '../../lib/userStorage';
import { tLang } from '../../i18n/langHelpers';
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
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';

const ROLE_META: Record<AppRole, { en: string; ar: string; fr: string; de: string; ja: string; badge: string }> = {
  student: { en: 'Student', ar: 'طالب', fr: 'Élève', de: 'Schüler', ja: '生徒', badge: 'sn-badge-blue' },
  teacher: { en: 'Teacher', ar: 'معلم', fr: 'Enseignant', de: 'Lehrer', ja: '教員', badge: 'sn-badge-green' },
  admin: { en: 'Administrator', ar: 'إدارة', fr: 'Administrateur', de: 'Administrator', ja: '管理者', badge: 'sn-badge-amber' },
};

const ManageClerkAccount: React.FC<{ language: string }> = ({ language }) => {
  const { openUserProfile } = useClerk();
  return (
    <button
      type="button"
      onClick={() => openUserProfile()}
      className="sn-btn sn-btn-outline sn-btn-sm"
    >
      <ExternalLink size={13} strokeWidth={1.8} />
      {tLang(language as any, {
        ar: 'إدارة حساب Clerk',
        en: 'Manage Clerk Account',
        fr: 'Gérer le compte Clerk',
        de: 'Clerk-Konto verwalten',
        ja: 'Clerkアカウント管理',
      })}
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
  const navigate = useNavigate();
  const ar = language === 'ar';

  // Persistent student name & phone
  const [fullName, setFullName] = useState(() => getPersistedItem('scinexa_user_fullname') || user?.name || '');
  const [parentPhone, setParentPhone] = useState(() => getPersistedItem('scinexa_parent_phone') || '');
  const [nameSaveMsg, setNameSaveMsg] = useState<string | null>(null);

  // Grade
  const [savedGrade, setSavedGrade] = useState(() => getPersistedItem('scinexa_grade', 'sec2'));
  const [gradeSavedNotice, setGradeSavedNotice] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  // Permanent Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const isResearcher = savedGrade === 'university' || savedGrade === 'researcher';

  const handleSaveNameAndPhone = async () => {
    const cleanName = fullName.trim();
    const cleanPhone = parentPhone.trim().replace(/\D/g, '');
    if (!cleanName) return;

    setPersistedItem('scinexa_user_fullname', cleanName);
    if (cleanPhone) {
      setPersistedItem('scinexa_parent_phone', cleanPhone);
    }

    if (user?.email) {
      saveScopedUserProfile(user.email, {
        quadName: cleanName,
        parentPhone: cleanPhone,
        gradeLevel: savedGrade,
      });
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
      tLang(language, {
        ar: '✓ تم حفظ الاسم الرباعي ورقم الهاتف بنجاح وتحديثهما عبر كامل المنصة.',
        en: '✓ Official name and phone number saved successfully across the platform.',
        fr: '✓ Nom complet et numéro de téléphone enregistrés avec succès.',
        de: '✓ Vollständiger Name und Telefonnummer erfolgreich gespeichert.',
        ja: '✓ 正式な氏名と連絡先番号が正常に保存されました。',
      })
    );
    setTimeout(() => setNameSaveMsg(null), 4000);
  };

  const handleSaveGrade = (newG: string) => {
    setSavedGrade(newG);
    setPersistedItem('scinexa_grade', newG);
    if (user?.email) {
      saveScopedUserProfile(user.email, { gradeLevel: newG });
    }
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
    const confirmMsg = tLang(language, {
      ar: 'هل أنت متأكد من رغبتك في تصفير سجل التقدم المعملي ونقاط XP والبدء من الصفر (0%)؟',
      en: 'Are you sure you want to reset all lab progress, completed lessons and XP to 0?',
      fr: 'Êtes-vous sûr de vouloir réinitialiser toute votre progression de labo et XP à zéro ?',
      de: 'Möchten Sie wirklich alle Laborfortschritte und XP auf 0 zurücksetzen?',
      ja: '実験室の進捗状況とXPを完全にリセットしてゼロにしますか？',
    });
    if (!window.confirm(confirmMsg)) return;

    setPersistedJSON('scinexa_completed_lessons', []);
    setPersistedItem('scinexa_user_xp', '0');
    setPersistedItem('scinexa_user_streak', '0');
    setPersistedItem('scinexa_user_stars', '0');
    setPersistedItem('scinexa_total_lab_seconds', '0');
    setPersistedJSON('scinexa_explored_labs', []);
    setPersistedItem('scinexa_lab_sessions_count', '0');

    if (user?.email) {
      saveScopedUserProfile(user.email, {
        completedLessons: [],
        xp: 0,
        streak: 0,
        totalLabSeconds: 0,
        exploredLabs: [],
        sessionsCount: 0,
      });
    }

    setResetMsg(
      tLang(language, {
        ar: '✓ تم تصفير سجل الدروس وساعات الاستكشاف ونقاط XP بنجاح (0 دروس، 0 XP).',
        en: '✓ Lab progress and exploration hours reset to zero (0 lessons, 0 XP).',
        fr: '✓ Progression et heures de recherche réinitialisées à zéro.',
        de: '✓ Fortschritt und Forschungsstunden auf Null zurückgesetzt.',
        ja: '✓ 進捗データと実験時間がゼロにリセットされました。',
      })
    );
    try {
      window.dispatchEvent(new Event('scinexa_progress_reset'));
      window.dispatchEvent(new Event('scinexa_lab_time_updated'));
    } catch {
      /* ignore */
    }
    setTimeout(() => setResetMsg(null), 4000);
  };

  const handlePermanentDeleteAccount = async () => {
    if (deleteConfirmInput.trim().toUpperCase() !== 'DELETE' && deleteConfirmInput.trim() !== 'حذف') {
      alert(
        tLang(language, {
          ar: 'يرجى كتابة كلمة "حذف" للتأكيد على مسح الحساب نهائياً.',
          en: 'Please type "DELETE" or "حذف" to confirm account deletion.',
          fr: 'Veuillez saisir "DELETE" pour confirmer la suppression.',
          de: 'Bitte geben Sie "DELETE" ein, um das Löschen zu bestätigen.',
          ja: '削除を確認するには「DELETE」と入力してください。',
        })
      );
      return;
    }

    setIsDeleting(true);
    try {
      // 1. Delete from Supabase
      await dbDeleteAccount(user?.email, user?.id);

      // 2. Delete scoped user data
      if (user?.email) {
        deleteScopedUserProfile(user.email);
      }

      // 3. Clear active session cookies and local storage
      clearActiveSessionKeys();

      // 4. Sign out of Clerk
      await signOut();

      // 5. Navigate to public landing
      navigate('/');
    } catch (e) {
      console.error('Account deletion error', e);
      setIsDeleting(false);
      setShowDeleteModal(false);
      navigate('/');
    }
  };

  const [notifications, setNotifications] = useState({
    assessments: true,
    assignments: true,
    product: false,
  });

  const roleMeta = isResearcher
    ? { en: 'Researcher', ar: 'باحث علمي حر', fr: 'Chercheur', de: 'Forscher', ja: '独立研究員', badge: 'sn-badge-green' }
    : ROLE_META[role];

  return (
    <div>
      <PageHeader
        eyebrow={tLang(language, { ar: 'الحساب', en: 'Account', fr: 'Compte', de: 'Konto', ja: 'アカウント' })}
        title={tLang(language, { ar: 'الإعدادات', en: 'Settings', fr: 'Paramètres', de: 'Einstellungen', ja: '設定' })}
        subtitle={tLang(language, {
          ar: 'بيانات الحساب، الاسم الرسمي، اللغة، الإشعارات، والوصول. كل شيء في مكان واحد.',
          en: 'Profile, official name, language, notifications and access. Everything in one place.',
          fr: 'Profil, nom officiel, langue, notifications et accès. Tout au même endroit.',
          de: 'Profil, offizieller Name, Sprache, Benachrichtigungen und Zugang an einem Ort.',
          ja: 'プロフィール、公式氏名、システム言語、通知設定、およびアクセス権限。',
        })}
      />

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <div className="space-y-4">
          {/* Profile & Official Name Editor */}
          <SectionCard title={tLang(language, { ar: 'الملف الشخصي والاسم الرسمي', en: 'Official Profile & Name', fr: 'Profil officiel & Nom', de: 'Offizielles Profil & Name', ja: '公式プロフィールと登録氏名' })}>
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
                  <span className={`sn-badge ${roleMeta.badge} !text-[10px]`}>
                    {tLang(language, { ar: roleMeta.ar, en: roleMeta.en, fr: roleMeta.fr, de: roleMeta.de, ja: roleMeta.ja })}
                  </span>
                </div>
                <div dir="ltr" className="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-[#737373]">
                  <Mail size={12} strokeWidth={1.8} />
                  {user?.email}
                </div>
                {savedGrade && (
                  <div className="mt-1 text-[11px] text-[#737373]">
                    {isResearcher
                      ? tLang(language, { ar: 'مسار البحث العلمي', en: 'Scientific Research Path', fr: 'Recherche scientifique', de: 'Forschungspfad', ja: '科学研究パス' })
                      : savedGrade}
                  </div>
                )}
              </div>
              {isClerkConfigured && <ManageClerkAccount language={language} />}
            </div>

            <div className="mt-5 grid gap-3 border-t border-[#f0f0f0] pt-4 sm:grid-cols-2">
              <div>
                <label className="sn-label" htmlFor="settings-name">
                  {isResearcher
                    ? tLang(language, { ar: 'الاسم الرباعي الرسمي للباحث', en: 'Researcher Quad Name', fr: 'Nom complet du chercheur', de: 'Vollständiger Name des Forschers', ja: '研究員正式氏名' })
                    : tLang(language, { ar: 'الاسم الرباعي الرسمي للطالب', en: 'Official Full Student Name', fr: 'Nom officiel complet de l’élève', de: 'Offizieller Name des Schülers', ja: '生徒公式氏名' })}
                </label>
                <input
                  id="settings-name"
                  className="sn-input font-medium"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={tLang(language, { ar: 'اكتب اسمك الرباعي الرسمي هنا...', en: 'Enter your 4-part full name...', fr: 'Entrez votre nom complet...', de: 'Geben Sie Ihren vollständigen Namen ein...', ja: '正式な氏名を入力してください...' })}
                />
              </div>

              <div>
                <label className="sn-label" htmlFor="settings-phone">
                  {isResearcher
                    ? tLang(language, { ar: 'رقم الهاتف الشخصي (للتواصل العلمي)', en: 'Personal Mobile Phone', fr: 'Téléphone personnel', de: 'Persönliche Handynummer', ja: '個人携帯番号' })
                    : tLang(language, { ar: 'رقم هاتف ولي الأمر (للمتابعة)', en: 'Parent Mobile Phone', fr: 'Téléphone des parents', de: 'Telefonnummer der Eltern', ja: '保護者連絡先番号' })}
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
                <label className="sn-label" htmlFor="settings-email">
                  {tLang(language, { ar: 'البريد الإلكتروني المسجل', en: 'Registered Email', fr: 'E-mail enregistré', de: 'Registrierte E-Mail', ja: '登録メールアドレス' })}
                </label>
                <input id="settings-email" dir="ltr" className="sn-input font-mono text-[12px]" defaultValue={user?.email} readOnly />
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-[#f0f0f0] pt-3">
              <p className="text-[11px] text-[#737373]">
                {tLang(language, {
                  ar: 'يظهر هذا الاسم في لوحة التحكم، تقارير المعامل، وشهادات الإنجاز بدلاً من اسم حساب جوجل.',
                  en: 'This official name appears on dashboard greetings, lab reports and certificates instead of Google username.',
                  fr: 'Ce nom officiel apparaît sur le tableau de bord et les certificats.',
                  de: 'Dieser offizielle Name erscheint im Dashboard und auf Zertifikaten.',
                  ja: 'この登録氏名がダッシュボードや実験報告書、修了証に正式に反映されます。',
                })}
              </p>
              <button
                type="button"
                onClick={handleSaveNameAndPhone}
                className="sn-btn sn-btn-primary sn-btn-sm shrink-0 flex items-center gap-1.5"
              >
                <Save size={13} strokeWidth={2} />
                <span>{tLang(language, { ar: 'حفظ البيانات الرسمية', en: 'Save Details', fr: 'Enregistrer', de: 'Speichern', ja: '保存する' })}</span>
              </button>
            </div>

            {nameSaveMsg && (
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                {nameSaveMsg}
              </div>
            )}
          </SectionCard>

          {/* Grade Locking & Management Section */}
          <SectionCard title={tLang(language, { ar: 'الصف الدراسي أو المسار البحثي', en: 'Educational Grade or Research Path', fr: 'Niveau d’études ou parcours', de: 'Klassenstufe oder Forschungspfad', ja: '学年・研究コース' })}>
            <div className="flex flex-col gap-3">
              <p className="text-[12px] text-[#737373] leading-relaxed">
                {tLang(language, {
                  ar: 'الصف أو المسار يحدد المناهج والتجارب الافتراضية المرتبطة بك في المنصة. باحثو المرحلة الجامعية والبحث العلمي الحر تتاح لهم كامل المعامل وأدوات البحث دون قيود المناهج المدرسية.',
                  en: 'Your academic stage defines available curriculum pathways and experiments. University students and independent researchers get full access to 3D labs without school curriculum restrictions.',
                  fr: 'Votre niveau académique définit les cours et expériences accessibles.',
                  de: 'Ihre akademische Stufe definiert die verfügbaren Lehrpläne und Experimente.',
                  ja: '学年またはコースにより、利用可能なカリキュラムと実験室が最適化されます。大学院生・独立研究員は制限なく全3D研究施設を利用可能です。',
                })}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
                <select
                  value={savedGrade}
                  onChange={(e) => handleSaveGrade(e.target.value)}
                  className="sn-input !h-10 text-[13px] flex-1 font-semibold"
                >
                  <option value="prep1">{tLang(language, { ar: 'الصف الأول الإعدادي', en: '1st Prep', fr: '1ère Préparatoire', de: '1. Vorbereitungsklasse', ja: '中学1年生' })}</option>
                  <option value="prep2">{tLang(language, { ar: 'الصف الثاني الإعدادي', en: '2nd Prep', fr: '2ème Préparatoire', de: '2. Vorbereitungsklasse', ja: '中学2年生' })}</option>
                  <option value="prep3">{tLang(language, { ar: 'الصف الثالث الإعدادي (الشهادة الإعدادية)', en: '3rd Prep', fr: '3ème Préparatoire', de: '3. Vorbereitungsklasse', ja: '中学3年生' })}</option>
                  <option value="sec1">{tLang(language, { ar: 'الصف الأول الثانوي', en: '1st Secondary', fr: '1ère Secondaire', de: '1. Sekundarstufe', ja: '高校1年生' })}</option>
                  <option value="sec2">{tLang(language, { ar: 'الصف الثاني الثانوي', en: '2nd Secondary', fr: '2ème Secondaire', de: '2. Sekundarstufe', ja: '高校2年生' })}</option>
                  <option value="sec3">{tLang(language, { ar: 'الصف الثالث الثانوي (الثانوية العامة)', en: '3rd Secondary', fr: 'Baccalauréat', de: 'Abitur / 3. Sekundarstufe', ja: '高校3年生' })}</option>
                  <option value="stem">{tLang(language, { ar: 'مدارس المتفوقين في العلوم والتكنولوجيا (STEM)', en: 'STEM High School', fr: 'Lycée STEM', de: 'STEM-Gymnasium', ja: 'STEM高校' })}</option>
                  <option value="university">{tLang(language, { ar: 'المرحلة الجامعية (طالب جامعي / أكاديمي)', en: 'University Student', fr: 'Étudiant universitaire', de: 'Universitätsstudent', ja: '大学・高等教育機関' })}</option>
                  <option value="researcher">{tLang(language, { ar: 'باحث علمي حر (أكاديمي مستقل)', en: 'Independent Scientific Researcher', fr: 'Chercheur indépendant', de: 'Unabhängiger Forscher', ja: '独立科学研究員' })}</option>
                </select>
              </div>
              {gradeSavedNotice && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                  ✓ {tLang(language, {
                    ar: 'تم حفظ وتحديث مسارك الدراسي بنجاح! تم تحديث واجهة المنصة والمعامل.',
                    en: 'Academic stage updated successfully! Platform interface refreshed.',
                    fr: 'Niveau mis à jour avec succès !',
                    de: 'Klassenstufe erfolgreich aktualisiert!',
                    ja: '学年・研究コースが正常に更新されました！',
                  })}
                </div>
              )}
            </div>
          </SectionCard>

          {/* Language Selector (All 5 Official Languages) */}
          <SectionCard
            title={tLang(language, { ar: 'اللغة والمظهر', en: 'Language & appearance', fr: 'Langue & apparence', de: 'Sprache & Erscheinungsbild', ja: '言語と外観' })}
            action={<Languages size={14} strokeWidth={1.7} className="text-[#a3a3a3]" />}
          >
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="text-[12px] font-medium">
                  {tLang(language, { ar: 'لغة الواجهة (٥ لغات معتمدة)', en: 'Interface language (5 supported languages)', fr: 'Langue de l’interface (5 langues)', de: 'Oberflächensprache (5 Sprachen)', ja: 'インターフェース言語（5言語対応）' })}
                </div>
                <div className="mt-0.5 text-[11px] text-[#737373]">
                  {tLang(language, {
                    ar: 'تتغير اتجاهات الواجهة والنصوص بالكامل تلقائيًا فور الاختيار.',
                    en: 'Layout direction and all copy update automatically immediately.',
                    fr: 'La mise en page et les textes changent instantanément.',
                    de: 'Layout und Texte werden sofort angepasst.',
                    ja: '選択すると画面全体の配置とテキストが即座に変更されます。',
                  })}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { code: 'ar' as const, label: 'العربية 🇪🇬' },
                  { code: 'en' as const, label: 'English 🇬🇧' },
                  { code: 'fr' as const, label: 'Français 🇫🇷' },
                  { code: 'de' as const, label: 'Deutsch 🇩🇪' },
                  { code: 'ja' as const, label: '日本語 🇯🇵' },
                ].map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLanguage(l.code)}
                    className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all ${
                      language === l.code
                        ? 'bg-[#0a0a0a] text-white shadow-xs'
                        : 'bg-[#fafafa] border border-[#e5e5e5] text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f0f0f0]'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-[#f0f0f0] pt-4">
              <div>
                <div className="text-[12px] font-medium">{tLang(language, { ar: 'المظهر', en: 'Theme', fr: 'Thème', de: 'Design', ja: 'テーマ' })}</div>
                <div className="mt-0.5 text-[11px] text-[#737373]">{tLang(language, { ar: 'الوضع الفاتح هو الافتراضي.', en: 'Light is the default surface.', fr: 'Clair par défaut.', de: 'Hell ist Standard.', ja: 'ライトモードがデフォルトです。' })}</div>
              </div>
              <div className="flex gap-1.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0a0a0a] bg-white px-2.5 py-1 text-[10px] font-medium">
                  <Laptop size={11} strokeWidth={1.8} />
                  {tLang(language, { ar: 'فاتح', en: 'Light', fr: 'Clair', de: 'Hell', ja: 'ライト' })}
                  <Check size={10} strokeWidth={2.4} />
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e5e5] bg-[#fafafa] px-2.5 py-1 text-[10px] text-[#a3a3a3]">
                  {tLang(language, { ar: 'داكن قريبًا', en: 'Dark soon', fr: 'Sombre bientôt', de: 'Dunkel bald', ja: 'ダークモード準備中' })}
                </span>
              </div>
            </div>
          </SectionCard>

          {/* Lab Progress & XP Reset Tool */}
          <SectionCard
            title={tLang(language, { ar: 'إدارة سجل التقدم المعملي ونقاط XP', en: 'Lab Progress & XP Management', fr: 'Gestion de la progression & XP', de: 'Laborfortschritt & XP-Verwaltung', ja: '実験進捗とXP管理' })}
            action={<RotateCcw size={14} strokeWidth={1.7} className="text-[#a3a3a3]" />}
          >
            <div className="space-y-3">
              <p className="text-[12px] text-[#737373] leading-relaxed">
                {tLang(language, {
                  ar: 'إذا كنت تريد بدء تدريبك المعملي من الصفر التام وبدقة واقعية (0 دروس مكتملة و 0 XP و 0 ساعات)، يمكنك تصفير السجل بضغطة واحدة.',
                  en: 'If you want to restart your lab training from scratch with strictly real statistics (0 lessons, 0 XP, 0 hours), you can reset it here.',
                  fr: 'Réinitialisez toutes vos statistiques de laboratoire à zéro.',
                  de: 'Setzen Sie alle Laborstatistiken auf Null zurück.',
                  ja: '完全なゼロ状態（0レッスン、0 XP、0時間）から学習・研究を再スタートできます。',
                })}
              </p>
              <button
                type="button"
                onClick={handleResetProgress}
                className="sn-btn sn-btn-outline sn-btn-sm text-amber-700 hover:bg-amber-50 hover:border-amber-400"
              >
                <RotateCcw size={13} strokeWidth={2} />
                <span>{tLang(language, { ar: 'تصفير السجل والبدء من الصفر (0 XP و 0 دروس)', en: 'Reset Progress to Zero (0 XP, 0 Lessons)', fr: 'Réinitialiser à zéro', de: 'Auf Null zurücksetzen', ja: 'すべてゼロにリセット' })}</span>
              </button>

              {resetMsg && (
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 text-[11px] font-semibold border border-amber-200">
                  {resetMsg}
                </div>
              )}
            </div>
          </SectionCard>

          {/* Notifications */}
          <SectionCard title={tLang(language, { ar: 'الإشعارات', en: 'Notifications', fr: 'Notifications', de: 'Benachrichtigungen', ja: '通知設定' })} action={<Bell size={14} strokeWidth={1.7} className="text-[#a3a3a3]" />} bodyClassName="p-2">
            {[
              {
                key: 'assessments' as const,
                en: 'Weekly assessments',
                ar: 'التقييمات الأسبوعية',
                fr: 'Évaluations hebdomadaires',
                de: 'Wöchentliche Bewertungen',
                ja: '週間課題・評価',
                dEn: 'A reminder before each Ministry assessment.',
                dAr: 'تذكير قبل كل تقييم من كراسة الوزارة.',
                dFr: 'Rappel avant chaque devoir.',
                dDe: 'Erinnerung vor Tests.',
                dJa: '定期課題前のリマインダー通知',
              },
              {
                key: 'assignments' as const,
                en: 'Assignments from teachers',
                ar: 'واجبات المعلمين',
                fr: 'Devoirs des professeurs',
                de: 'Aufgaben der Lehrer',
                ja: '教員からの課題配信',
                dEn: 'New work, due dates and review results.',
                dAr: 'واجبات جديدة ومواعيد تسليم ونتائج المراجعة.',
                dFr: 'Nouvelles tâches et dates limites.',
                dDe: 'Neue Aufgaben und Fristen.',
                dJa: '新規配信課題や提出期限、採点結果通知',
              },
              {
                key: 'product' as const,
                en: 'Product updates',
                ar: 'تحديثات المنصة',
                fr: 'Mises à jour de la plateforme',
                de: 'Plattform-Updates',
                ja: 'プラットフォーム最新アップデート',
                dEn: 'New labs and curriculum releases.',
                dAr: 'معامل جديدة وإصدارات المناهج.',
                dFr: 'Nouveaux laboratoires et modules.',
                dDe: 'Neue Labore und Module.',
                dJa: '新しい3D実験室やカリキュラムの追加通知',
              },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-4 rounded-[10px] px-3 py-3 hover:bg-[#fafafa]">
                <div>
                  <div className="text-[12px] font-medium">{tLang(language, { ar: item.ar, en: item.en, fr: item.fr, de: item.de, ja: item.ja })}</div>
                  <div className="mt-0.5 text-[11px] text-[#737373]">{tLang(language, { ar: item.dAr, en: item.dEn, fr: item.dFr, de: item.dDe, ja: item.dJa })}</div>
                </div>
                <Toggle
                  on={notifications[item.key]}
                  onChange={() => setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                  label={item.en}
                />
              </div>
            ))}
          </SectionCard>

          {/* DANGER ZONE: Permanent Account Deletion */}
          <div className="rounded-[18px] border border-red-200 bg-red-50/50 p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <Trash2 size={18} strokeWidth={2} />
              </span>
              <div className="flex-1">
                <h3 className="text-[14px] font-bold text-red-950">
                  {tLang(language, {
                    ar: 'منطقة الخطر: حذف الحساب نهائياً',
                    en: 'Danger Zone: Permanently Delete Account',
                    fr: 'Zone de danger : Supprimer définitivement le compte',
                    de: 'Gefahrenzone: Konto dauerhaft löschen',
                    ja: '危険区域: アカウントの完全削除',
                  })}
                </h3>
                <p className="mt-1 text-[12px] leading-relaxed text-red-800">
                  {tLang(language, {
                    ar: 'عند حذف حسابك، سيتم مسح اسمك الرباعي، رقم الهاتف، ساعات الاستكشاف المعملية، وسجلات Supabase بشكل نهائي ولا يمكن استرجاعها.',
                    en: 'Permanently deletes your 4-part name, phone number, lab exploration hours, and Supabase database records. This action is irreversible.',
                    fr: 'Supprime définitivement votre profil, heures de laboratoire et données Supabase.',
                    de: 'Löscht Ihr Profil, Laborzeiten und Supabase-Datensätze dauerhaft.',
                    ja: '登録氏名、電話番号、3D実験時間、データベース上の全記録を永久に消去します。この操作は取り消せません。',
                  })}
                </p>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="sn-btn bg-red-600 text-white hover:bg-red-700 sn-btn-sm font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <Trash2 size={13} />
                    <span>{tLang(language, { ar: 'حذف الحساب نهائياً', en: 'Delete Account Permanently', fr: 'Supprimer définitivement', de: 'Konto dauerhaft löschen', ja: 'アカウントを永久削除' })}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <SectionCard title={tLang(language, { ar: 'الوصول والدور', en: 'Access & role', fr: 'Accès & rôle', de: 'Zugang & Rolle', ja: 'アクセス権限とロール' })} action={<KeyRound size={14} strokeWidth={1.7} className="text-[#a3a3a3]" />}>
            <div className="flex items-start gap-3 rounded-[12px] border border-[#e5e5e5] bg-[#fafafa] p-3.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-white">
                <ShieldCheck size={15} strokeWidth={1.7} className="text-[#047857]" />
              </span>
              <div>
                <div className="text-[12px] font-medium">{isClerkConfigured ? (ar ? 'Clerk متصل' : 'Clerk connected') : ar ? 'جلسة تجريبية محلية' : 'Local demo session'}</div>
                <div className="mt-0.5 text-[11px] leading-relaxed text-[#737373]">
                  {isClerkConfigured
                    ? tLang(language, {
                        ar: 'حساب الطالب معزول ومؤمن بواسطة Clerk و Supabase.',
                        en: 'Student account is isolated and secured via Clerk & Supabase.',
                        fr: 'Compte sécurisé par Clerk et Supabase.',
                        de: 'Konto über Clerk und Supabase gesichert.',
                        ja: 'ClerkとSupabaseにより安全に保護された独立アカウント。',
                      })
                    : tLang(language, {
                        ar: 'أضف مفتاح Clerk لتفعيل المصادقة الحقيقية.',
                        en: 'Add a Clerk key to enable real authentication.',
                        fr: 'Ajoutez une clé Clerk.',
                        de: 'Clerk-Schlüssel hinzufügen.',
                        ja: '本番認証キーを設定してください。',
                      })}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#f0f0f0] flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-[0.08em] text-[#a3a3a3] font-semibold">
                {tLang(language, {
                  ar: 'بوابة المعلمين والإدارة المدرسية المعتمدة',
                  en: 'Official Educator Portal',
                  fr: 'Portail officiel des enseignants',
                  de: 'Offizielles Lehrerportal',
                  ja: '認定教員・学校管理者専用ポータル',
                })}
              </span>
              <a
                href="/portal/login"
                className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] hover:bg-white hover:border-[#0284c7] p-3 text-[12px] font-bold text-[#0284c7] flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} />
                  <span>{tLang(language, {
                    ar: 'دخول بوابة المعلمين والإدارة (محمية بكلمة مرور)',
                    en: 'Educator & Admin Login (Secured)',
                    fr: 'Connexion Enseignants & Direction (Sécurisée)',
                    de: 'Lehrer- & Admin-Login (Geschützt)',
                    ja: '教員・管理者ポータル（パスワード保護区域）',
                  })}</span>
                </div>
                <span>➔</span>
              </a>
            </div>
          </SectionCard>

          <SectionCard title={tLang(language, { ar: 'العمل دون إنترنت', en: 'Offline access', fr: 'Accès hors ligne', de: 'Offline-Zugriff', ja: 'オフライン利用' })} action={<WifiOff size={14} strokeWidth={1.7} className="text-[#a3a3a3]" />}>
            <p className="text-[11px] leading-relaxed text-[#737373]">
              {tLang(language, {
                ar: 'نسخة USB أو شبكة محلية متاحة للمدارس. تتزامن البيانات تلقائيًا عند العودة للاتصال.',
                en: 'A USB or LAN build is available for schools. Data syncs automatically when the connection returns.',
                fr: 'Version USB/LAN disponible. Synchronisation automatique.',
                de: 'USB- oder LAN-Version verfügbar. Automatische Synchronisierung.',
                ja: '学校向けUSBまたは校内LAN版に対応。再接続時にデータが自動同期されます。',
              })}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="sn-badge sn-badge-green">{tLang(language, { ar: 'جاهز', en: 'Ready', fr: 'Prêt', de: 'Bereit', ja: '準備完了' })}</span>
              <span className="font-mono text-[10px] text-[#a3a3a3]">PWA · USB · LAN</span>
            </div>
          </SectionCard>

          <SectionCard title={tLang(language, { ar: 'الجهاز والجلسة', en: 'Device & session', fr: 'Appareil & session', de: 'Gerät & Sitzung', ja: 'デバイスとセッション' })}>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-[#737373]">{tLang(language, { ar: 'الجهاز', en: 'Device', fr: 'Appareil', de: 'Gerät', ja: '端末' })}</span>
                <span className="font-medium">{/Mobi|Android/i.test(navigator.userAgent) ? (ar ? 'هاتف' : 'Mobile') : ar ? 'كمبيوتر' : 'Desktop'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#737373]">{tLang(language, { ar: 'اللغة الحالية', en: 'Active Locale', fr: 'Langue active', de: 'Aktive Sprache', ja: '選択言語' })}</span>
                <span className="font-mono">{language.toUpperCase()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#737373]">{tLang(language, { ar: 'الحالة', en: 'Status', fr: 'Statut', de: 'Status', ja: 'ステータス' })}</span>
                <span className="inline-flex items-center gap-1.5 font-medium text-[#047857]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#047857]" />
                  {tLang(language, { ar: 'نشطة', en: 'Active', fr: 'Actif', de: 'Aktiv', ja: 'アクティブ' })}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void signOut()}
              className="sn-btn sn-btn-outline mt-4 w-full text-[#e7000b] hover:border-[#e7000b]/30 hover:bg-[#fff1f2]"
            >
              <LogOut size={14} strokeWidth={1.8} />
              {tLang(language, { ar: 'تسجيل الخروج', en: 'Sign out', fr: 'Se déconnecter', de: 'Abmelden', ja: 'ログアウト' })}
            </button>
          </SectionCard>
        </div>
      </div>

      {/* Confirmation Modal for Permanent Account Deletion */}
      {showDeleteModal && (
        <div
          role="dialog"
          aria-modal="true"
          dir={ar ? 'rtl' : 'ltr'}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div className="relative w-full max-w-[460px] rounded-3xl bg-white p-6 shadow-2xl border border-red-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-red-600 font-bold text-[15px]">
                <AlertTriangle size={20} />
                <span>{tLang(language, { ar: 'تأكيد حذف الحساب نهائياً', en: 'Confirm Permanent Deletion', fr: 'Confirmer la suppression', de: 'Löschung bestätigen', ja: 'アカウント削除の最終確認' })}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="h-8 w-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-[12px] text-gray-700 leading-relaxed mb-4">
              {tLang(language, {
                ar: `أنت على وشك حذف حسابك نهائياً (${user?.email}). سيتم مسح بياناتك وملفك الشخصي وساعاتك المعملية نهائياً من قاعدة بيانات Supabase. للتأكيد، اكتب كلمة "حذف" أدناه:`,
                en: `You are about to permanently delete your account (${user?.email}). All personal data and lab hours will be erased from Supabase. Type "DELETE" below to confirm:`,
                fr: `Vous êtes sur le point de supprimer votre compte (${user?.email}). Tapez "DELETE" pour confirmer :`,
                de: `Sie sind dabei, Ihr Konto (${user?.email}) dauerhaft zu löschen. Geben Sie "DELETE" ein:`,
                ja: `アカウント (${user?.email}) を完全に削除します。確認のため「DELETE」と入力してください:`,
              })}
            </p>

            <div className="mb-4">
              <input
                type="text"
                value={deleteConfirmInput}
                onChange={(e) => setDeleteConfirmInput(e.target.value)}
                placeholder={ar ? 'اكتب كلمة "حذف" هنا...' : 'Type "DELETE" here...'}
                className="sn-input font-bold text-center !h-11 border-red-300 focus:border-red-600 text-red-700"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="sn-btn sn-btn-outline flex-1 py-2.5 font-medium"
                disabled={isDeleting}
              >
                {tLang(language, { ar: 'إلغاء التراجع', en: 'Cancel', fr: 'Annuler', de: 'Abbrechen', ja: 'キャンセル' })}
              </button>
              <button
                type="button"
                onClick={handlePermanentDeleteAccount}
                disabled={isDeleting || (!deleteConfirmInput.trim())}
                className="sn-btn bg-red-600 hover:bg-red-700 text-white flex-1 py-2.5 font-bold shadow-xs disabled:opacity-50"
              >
                {isDeleting
                  ? tLang(language, { ar: 'جارٍ الحذف...', en: 'Deleting...', fr: 'Suppression...', de: 'Löschen...', ja: '削除中...' })
                  : tLang(language, { ar: 'نعم، احذف نهائياً', en: 'Yes, Delete Permanently', fr: 'Oui, supprimer', de: 'Ja, dauerhaft löschen', ja: '完全に削除する' })}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
