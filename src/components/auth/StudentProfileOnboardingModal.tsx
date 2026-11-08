/**
 * StudentProfileOnboardingModal.tsx
 * نموذج استكمال بيانات الطالب أو الباحث الأكاديمي الإلزامي عند التسجيل عبر Google أو Clerk
 * يطلب إجباريًا: الاسم رباعي، المؤسسة/المدرسة، الصف/المرحلة، المحافظة والإدارة التعليمية، ورقم الهاتف.
 *
 * © SciNexa Platform — ISEF 2026
 */

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSession } from '../../context/SessionContext';
import { EGYPT_GOVERNORATES } from '../../data/egyptLocationData';
import { getPersistedJSON, setPersistedJSON, setPersistedItem, getPersistedItem } from '../../lib/cookies';
import { dbUpsertProfile } from '../../lib/supabase';
import { getScopedUserProfile, saveScopedUserProfile } from '../../lib/userStorage';
import {
  GraduationCap,
  Building2,
  MapPin,
  UserCheck,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Phone,
  Compass,
} from 'lucide-react';

export interface StudentProfileData {
  quadName: string;
  parentPhone: string;
  governorateId: string;
  governorateNameAr: string;
  administrationId: string;
  administrationNameAr: string;
  schoolName: string;
  gradeLevel: string;
  completedAt: string;
}

const STORAGE_KEY = 'scinexa_student_profile';

export const getStudentProfile = (): StudentProfileData | null => {
  return getPersistedJSON<StudentProfileData | null>(STORAGE_KEY, null);
};

export const isProfileComplete = (profile: StudentProfileData | null): boolean => {
  if (!profile) return false;
  const words = (profile.quadName || '').trim().split(/\s+/).filter(Boolean);
  const cleanPhone = (profile.parentPhone || '').replace(/\D/g, '');
  const isPhoneValid = /^01[0125][0-9]{8}$/.test(cleanPhone);
  return (
    words.length >= 4 &&
    isPhoneValid &&
    Boolean(profile.schoolName?.trim()) &&
    Boolean(profile.gradeLevel?.trim()) &&
    Boolean(profile.governorateId?.trim()) &&
    Boolean(profile.administrationId?.trim())
  );
};

const GRADES = [
  { id: 'prep1', ar: 'الصف الأول الإعدادي', en: '1st Prep' },
  { id: 'prep2', ar: 'الصف الثاني الإعدادي', en: '2nd Prep' },
  { id: 'prep3', ar: 'الصف الثالث الإعدادي (الشهادة الإعدادية)', en: '3rd Prep' },
  { id: 'sec1', ar: 'الصف الأول الثانوي', en: '1st Secondary' },
  { id: 'sec2', ar: 'الصف الثاني الثانوي', en: '2nd Secondary' },
  { id: 'sec3', ar: 'الصف الثالث الثانوي (شهادة إتمام الثانوية)', en: '3rd Secondary' },
  { id: 'stem', ar: 'مدارس المتفوقين في العلوم والتكنولوجيا (STEM)', en: 'STEM High School' },
  { id: 'university', ar: 'طالب جامعي (المرحلة الجامعية)', en: 'University Student' },
  { id: 'researcher', ar: 'باحث علمي حر (أكاديمي مستقل)', en: 'Independent Scientific Researcher' },
];

export const StudentProfileOnboardingModal: React.FC = () => {
  const { language } = useLanguage();
  const { isSignedIn, user } = useSession();
  const ar = language === 'ar';

  const [isOpen, setIsOpen] = useState(false);
  const [quadName, setQuadName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [governorateId, setGovernorateId] = useState('cairo');
  const [adminId, setAdminId] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('sec2');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn || !user) {
      setIsOpen(false);
      return;
    }
    const email = user.email;
    const scoped = email ? getScopedUserProfile(email) : null;

    // Use strictly user-scoped profile to prevent account cross-contamination
    const effectiveName = scoped?.quadName || '';
    const effectivePhone = scoped?.parentPhone || '';

    const hasQuad = effectiveName.trim().split(/\s+/).filter(Boolean).length >= 4;
    const hasPhone = /^01[0125][0-9]{8}$/.test(effectivePhone.replace(/\D/g, ''));

    if (!hasQuad || !hasPhone) {
      setIsOpen(true);
      if (effectiveName) {
        setQuadName(effectiveName);
      }
      if (effectivePhone) {
        setParentPhone(effectivePhone);
      }
    } else {
      setIsOpen(false);
    }
  }, [isSignedIn, user]);

  const selectedGov = EGYPT_GOVERNORATES.find((g) => g.id === governorateId) || EGYPT_GOVERNORATES[0];
  const admins = selectedGov.administrations || [];

  useEffect(() => {
    if (admins.length > 0 && (!adminId || !admins.find((a) => a.id === adminId))) {
      setAdminId(admins[0].id);
    }
  }, [governorateId, admins, adminId]);

  if (!isOpen) return null;

  const isResearcherMode = gradeLevel === 'university' || gradeLevel === 'researcher';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const words = quadName.trim().split(/\s+/).filter(Boolean);
    if (words.length < 4) {
      setError(
        ar
          ? 'يرجى كتابة الاسم الرباعي كاملاً (٤ مقاطع على الأقل: اسمك واسم الوالد والجد واللقب).'
          : 'Please enter your full 4-part name (at least 4 words).'
      );
      return;
    }

    const cleanPhone = parentPhone.trim().replace(/\D/g, '');
    if (!cleanPhone || !/^01[0125][0-9]{8}$/.test(cleanPhone)) {
      setError(
        isResearcherMode
          ? (ar ? 'يرجى إدخال رقم هاتفك الشخصي المكون من ١١ رقماً مصرياً صحيحاً للتواصل العلمي.' : 'Please enter a valid personal 11-digit mobile number.')
          : (ar
              ? 'رقم هاتف ولي الأمر إجباري للمتابعة، ويجب أن يكون رقماً مصرياً صحيحاً مكوناً من ١١ رقماً يبدأ بـ 010 أو 011 أو 012 أو 015.'
              : 'Parent mobile number is mandatory (valid 11-digit Egyptian mobile starting with 010, 011, 012, or 015).')
      );
      return;
    }

    if (!schoolName.trim() || schoolName.trim().length < 3) {
      setError(
        isResearcherMode
          ? (ar ? 'يرجى إدخال اسم الجامعة أو الكلية أو المؤسسة البحثية.' : 'Please enter your university or research institution.')
          : (ar ? 'يرجى إدخال اسم مدرستك الحالية.' : 'Please enter your school name.')
      );
      return;
    }

    if (!adminId) {
      setError(ar ? 'يرجى اختيار الإدارة التعليمية التابع لها.' : 'Please select your educational administration.');
      return;
    }

    const selectedAdmin = admins.find((a) => a.id === adminId);

    const profileData: StudentProfileData = {
      quadName: quadName.trim(),
      parentPhone: cleanPhone,
      governorateId: selectedGov.id,
      governorateNameAr: selectedGov.nameAr,
      administrationId: adminId,
      administrationNameAr: selectedAdmin?.nameAr || adminId,
      schoolName: schoolName.trim(),
      gradeLevel,
      completedAt: new Date().toISOString(),
    };

    try {
      if (user?.email) {
        saveScopedUserProfile(user.email, {
          quadName: profileData.quadName,
          parentPhone: cleanPhone,
          gradeLevel: profileData.gradeLevel,
          schoolName: profileData.schoolName,
          governorateId: profileData.governorateId,
          administrationId: profileData.administrationId,
        });
      }

      setPersistedJSON(STORAGE_KEY, profileData);
      setPersistedItem('scinexa_user_fullname', profileData.quadName);
      setPersistedItem('scinexa_parent_phone', cleanPhone);
      setPersistedItem('scinexa_school', profileData.schoolName);
      setPersistedItem('scinexa_gov_id', profileData.governorateId);
      setPersistedItem('scinexa_admin_id', profileData.administrationId);
      setPersistedItem('scinexa_grade', profileData.gradeLevel);

      void dbUpsertProfile({
        id: user?.id || ('st_' + Date.now()),
        email: user?.email,
        display_name: profileData.quadName,
        quad_name: profileData.quadName,
        parent_phone: cleanPhone,
        school_code: profileData.schoolName,
        school_name: profileData.schoolName,
        governorate_id: profileData.governorateId,
        administration_id: profileData.administrationId,
        grade_level: profileData.gradeLevel,
        role: 'student'
      });

      try {
        window.dispatchEvent(new CustomEvent('scinexa_profile_updated', { detail: profileData }));
      } catch {
        /* ignore */
      }

      setIsOpen(false);
    } catch {
      setError(ar ? 'تعذّر حفظ البيانات، يرجى المحاولة مرة أخرى.' : 'Failed to save, please try again.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      dir={ar ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a0a]/60 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-[540px] overflow-hidden rounded-[24px] border border-[#e5e5e5] bg-white p-6 sm:p-8 shadow-[0_25px_80px_-20px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="flex items-start gap-3.5 mb-5 border-b border-[#e5e5e5] pb-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eff6ff] text-[#1d4ed8]">
            {isResearcherMode ? <Compass size={24} strokeWidth={1.8} /> : <GraduationCap size={24} strokeWidth={1.8} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#1d4ed8] font-bold">
                {isResearcherMode
                  ? (ar ? 'ملف الباحث العلمي والأكاديمي' : 'Academic Researcher Profile')
                  : (ar ? 'خطوة إلزامية لإكمال التسجيل' : 'Mandatory Enrollment Step')}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </div>
            <h2 className="text-[19px] font-bold text-[#0a0a0a] mt-1">
              {isResearcherMode
                ? (ar ? 'استكمال ملف الباحث الأكاديمي والجامعي' : 'Complete Academic Researcher Profile')
                : (ar ? 'استكمال ملف الطالب المدرسي' : 'Complete Your School Profile')}
            </h2>
            <p className="text-[12px] text-[#737373] mt-0.5">
              {isResearcherMode
                ? (ar ? 'يرجى تسجيل بياناتك الرسمية لتوثيق أبحاثك ونتائج تجاربك المعملية ثلاثية الأبعاد.' : 'Please enter your academic credentials to document research and 3D simulation results.')
                : (ar ? 'يرجى تسجيل بياناتك الرسمية لربط نتائج المعامل والتقييمات بسجلك الأكاديمي.' : 'Please complete your official school data to link your lab results and evaluations.')}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-50 p-3 text-[12px] text-red-600">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Grade / Academic Status First */}
          <div>
            <label className="block text-[12px] font-semibold text-[#171717] mb-1.5" htmlFor="grade-select">
              {ar ? 'المرحلة التعليمية / المسار الأكاديمي والبحثي' : 'Academic Stage / Research Path'}
              <span className="text-red-500 ms-1">*</span>
            </label>
            <select
              id="grade-select"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-[#e5e5e5] bg-[#fafafa] text-[13px] text-[#0a0a0a] outline-none focus:border-[#1d4ed8] font-semibold"
            >
              {GRADES.map((gr) => (
                <option key={gr.id} value={gr.id}>
                  {ar ? gr.ar : gr.en}
                </option>
              ))}
            </select>
          </div>

          {/* Quad Name */}
          <div>
            <label className="block text-[12px] font-semibold text-[#171717] mb-1.5" htmlFor="quad-name">
              {isResearcherMode
                ? (ar ? 'الاسم الرباعي الرسمي للباحث' : 'Full Official Quad Name')
                : (ar ? 'الاسم رباعي (كما هو مسجل بالمدرسة)' : 'Full 4-Part Name')}
              <span className="text-red-500 ms-1">*</span>
            </label>
            <div className="relative">
              <input
                id="quad-name"
                required
                value={quadName}
                onChange={(e) => setQuadName(e.target.value)}
                placeholder={ar ? 'مثال: ياسين محمد إبراهيم زيد' : 'e.g. Yaseen Mohamed Ibrahim Zed'}
                className="w-full h-11 px-3.5 rounded-xl border border-[#e5e5e5] bg-[#fafafa] text-[13px] text-[#0a0a0a] outline-none focus:border-[#1d4ed8] transition-all"
              />
            </div>
            <p className="text-[10px] text-[#737373] mt-1">
              {ar ? 'يجب ألا يقل عن أربعة أسماء رسمية.' : 'Must contain at least 4 name segments.'}
            </p>
          </div>

          {/* Phone (Personal Phone for Researcher vs Parent Phone for Student) */}
          <div>
            <label className="block text-[12px] font-semibold text-[#171717] mb-1.5" htmlFor="parent-phone">
              {isResearcherMode
                ? (ar ? 'رقم الهاتف الشخصي (للتواصل الأكاديمي والبحث العلمي)' : 'Personal Mobile Phone')
                : (ar ? 'رقم هاتف ولي الأمر (إجباري للتواصل والمتابعة الأكاديمية)' : 'Parent / Guardian Mobile Phone')}
              <span className="text-red-500 ms-1">*</span>
            </label>
            <div className="relative">
              <input
                id="parent-phone"
                required
                type="tel"
                dir="ltr"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="010XXXXXXXX / 011... / 012... / 015..."
                className="w-full h-11 px-3.5 pe-10 rounded-xl border border-[#e5e5e5] bg-[#fafafa] text-[13px] text-[#0a0a0a] outline-none focus:border-[#1d4ed8] transition-all font-mono"
              />
              <Phone size={16} className="absolute end-3.5 top-1/2 -translate-y-1/2 text-[#737373]" />
            </div>
            <p className="text-[10px] text-[#059669] mt-1 font-medium">
              {isResearcherMode
                ? (ar ? 'يتم حفظ رقمك الشخصي للتواصل العلمي والتوثيق الأكاديمي.' : 'Your personal phone for academic communication and documentation.')
                : (ar ? 'يتم ربط الرقم مباشرة بالمعلم للتواصل الفوري عبر واتساب.' : 'Linked directly to teacher for WhatsApp progress reports.')}
            </p>
          </div>

          {/* Governorate & Administration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-[#171717] mb-1.5" htmlFor="gov-select">
                {ar ? 'المحافظة' : 'Governorate'}
                <span className="text-red-500 ms-1">*</span>
              </label>
              <select
                id="gov-select"
                value={governorateId}
                onChange={(e) => setGovernorateId(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-[#e5e5e5] bg-[#fafafa] text-[13px] text-[#0a0a0a] outline-none focus:border-[#1d4ed8]"
              >
                {EGYPT_GOVERNORATES.map((g) => (
                  <option key={g.id} value={g.id}>
                    {ar ? g.nameAr : g.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#171717] mb-1.5" htmlFor="admin-select">
                {ar ? 'الإدارة التعليمية' : 'Administration'}
                <span className="text-red-500 ms-1">*</span>
              </label>
              <select
                id="admin-select"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-[#e5e5e5] bg-[#fafafa] text-[13px] text-[#0a0a0a] outline-none focus:border-[#1d4ed8]"
              >
                {admins.map((a) => (
                  <option key={a.id} value={a.id}>
                    {ar ? a.nameAr : a.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* School Name / University / Research Center */}
          <div>
            <label className="block text-[12px] font-semibold text-[#171717] mb-1.5" htmlFor="school-name">
              {isResearcherMode
                ? (ar ? 'الجامعة / الكلية أو المركز البحثي' : 'University / Research Center')
                : (ar ? 'اسم المدرسة' : 'School Name')}
              <span className="text-red-500 ms-1">*</span>
            </label>
            <input
              id="school-name"
              required
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder={isResearcherMode ? (ar ? 'مثال: جامعة القاهرة - كلية العلوم / مركز البحوث الأكاديمية' : 'e.g. Cairo University - Faculty of Science') : (ar ? 'مثال: مدرسة المتفوقين للعلوم والتكنولوجيا (STEM)' : 'e.g. STEM High School for Boys')}
              className="w-full h-11 px-3.5 rounded-xl border border-[#e5e5e5] bg-[#fafafa] text-[13px] text-[#0a0a0a] outline-none focus:border-[#1d4ed8] transition-all"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-[#0a0a0a] hover:bg-[#171717] text-white font-semibold text-[13px] flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]"
            >
              <UserCheck size={16} strokeWidth={2} />
              <span>{ar ? 'تأكيد البيانات والدخول للمنصة' : 'Confirm & Enter Platform'}</span>
              <ArrowRight size={14} className={ar ? 'rotate-180' : ''} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentProfileOnboardingModal;
