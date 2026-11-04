/**
 * StudentProfileOnboardingModal.tsx
 * نموذج استكمال بيانات الطالب الإلزامي عند التسجيل عبر Google أو Clerk
 * يطلب إجباريًا: الاسم رباعي، المدرسة، الصف الدراسي، المحافظة والإدارة التعليمية.
 *
 * © Islam & Yaseen — SciNexa ISEF 2026
 */

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSession } from '../../context/SessionContext';
import { EGYPT_GOVERNORATES } from '../../data/egyptLocationData';
import {
 GraduationCap,
 Building2,
 MapPin,
 UserCheck,
 ArrowRight,
 ShieldAlert,
 Sparkles,
} from 'lucide-react';

export interface StudentProfileData {
 quadName: string;
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
 try {
 const raw = localStorage.getItem(STORAGE_KEY);
 return raw ? JSON.parse(raw) : null;
 } catch {
 return null;
 }
};

export const isProfileComplete = (profile: StudentProfileData | null): boolean => {
 if (!profile) return false;
 const words = (profile.quadName || '').trim().split(/\s+/).filter(Boolean);
 return (
 words.length >= 4 &&
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
 { id: 'university', ar: 'المرحلة الجامعية / باحث علمي حر', en: 'University / Independent Researcher' },
];

export const StudentProfileOnboardingModal: React.FC = () => {
 const { language } = useLanguage();
 const { isSignedIn, user } = useSession();
 const ar = language === 'ar';

 const [isOpen, setIsOpen] = useState(false);
 const [quadName, setQuadName] = useState('');
 const [governorateId, setGovernorateId] = useState('cairo');
 const [adminId, setAdminId] = useState('');
 const [schoolName, setSchoolName] = useState('');
 const [gradeLevel, setGradeLevel] = useState('sec2');
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
 if (!isSignedIn) {
 setIsOpen(false);
 return;
 }
 const existing = getStudentProfile();
 if (!isProfileComplete(existing)) {
 setIsOpen(true);
 if (user?.name) {
 setQuadName(user.name);
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

 if (!schoolName.trim() || schoolName.trim().length < 3) {
 setError(ar ? 'يرجى إدخال اسم مدرستك الحالية.' : 'Please enter your school name.');
 return;
 }

 if (!adminId) {
 setError(ar ? 'يرجى اختيار الإدارة التعليمية التابع لها.' : 'Please select your educational administration.');
 return;
 }

 const selectedAdmin = admins.find((a) => a.id === adminId);

 const profileData: StudentProfileData = {
 quadName: quadName.trim(),
 governorateId: selectedGov.id,
 governorateNameAr: selectedGov.nameAr,
 administrationId: adminId,
 administrationNameAr: selectedAdmin?.nameAr || adminId,
 schoolName: schoolName.trim(),
 gradeLevel,
 completedAt: new Date().toISOString(),
 };

 try {
 localStorage.setItem(STORAGE_KEY, JSON.stringify(profileData));
 localStorage.setItem('scinexa_user_fullname', profileData.quadName);
 localStorage.setItem('scinexa_school', profileData.schoolName);
 localStorage.setItem('scinexa_gov_id', profileData.governorateId);
 localStorage.setItem('scinexa_admin_id', profileData.administrationId);
 localStorage.setItem('scinexa_grade', profileData.gradeLevel);
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
 <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eff6ff] text-[#1d4ed8] ">
 <GraduationCap size={24} strokeWidth={1.8} />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <span className="font-mono text-[10px] uppercase tracking-wider text-[#1d4ed8] font-bold">
 {ar ? 'خطوة إلزامية لإكمال التسجيل' : 'Mandatory Enrollment Step'}
 </span>
 <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
 </div>
 <h2 className="text-[19px] font-bold text-[#0a0a0a] mt-1">
 {ar ? 'استكمال ملف الطالب المدرسي' : 'Complete Your School Profile'}
 </h2>
 <p className="text-[12px] text-[#737373] mt-0.5">
 {ar
 ? 'يرجى تسجيل بياناتك الرسمية لربط نتائج المعامل والتقييمات بسجلك الأكاديمي.'
 : 'Please complete your official school data to link your lab results and evaluations.'}
 </p>
 </div>
 </div>

 {error && (
 <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-50 p-3 text-[12px] text-red-600 ">
 <ShieldAlert size={16} className="shrink-0 mt-0.5" />
 <span>{error}</span>
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-4">
 {/* Quad Name */}
 <div>
 <label className="block text-[12px] font-semibold text-[#171717] mb-1.5" htmlFor="quad-name">
 {ar ? 'الاسم رباعي (كما هو مسجل بالمدرسة)' : 'Full 4-Part Name'}
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
 className="w-full h-11 px-3 rounded-xl border border-[#e5e5e5] bg-[#fafafa] text-[13px] text-[#0a0a0a] outline-none focus:border-[#1d4ed8] "
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
 className="w-full h-11 px-3 rounded-xl border border-[#e5e5e5] bg-[#fafafa] text-[13px] text-[#0a0a0a] outline-none focus:border-[#1d4ed8] "
 >
 {admins.map((a) => (
 <option key={a.id} value={a.id}>
 {ar ? a.nameAr : a.nameEn}
 </option>
 ))}
 </select>
 </div>
 </div>

 {/* School Name */}
 <div>
 <label className="block text-[12px] font-semibold text-[#171717] mb-1.5" htmlFor="school-name">
 {ar ? 'اسم المدرسة' : 'School Name'}
 <span className="text-red-500 ms-1">*</span>
 </label>
 <input
 id="school-name"
 required
 value={schoolName}
 onChange={(e) => setSchoolName(e.target.value)}
 placeholder={ar ? 'مثال: مدرسة المتفوقين للعلوم والتكنولوجيا (STEM)' : 'e.g. STEM High School for Boys'}
 className="w-full h-11 px-3.5 rounded-xl border border-[#e5e5e5] bg-[#fafafa] text-[13px] text-[#0a0a0a] outline-none focus:border-[#1d4ed8] transition-all"
 />
 </div>

 {/* Grade Level */}
 <div>
 <label className="block text-[12px] font-semibold text-[#171717] mb-1.5" htmlFor="grade-select">
 {ar ? 'الصف الدراسي / المرحلة التعليمية' : 'Grade / Educational Stage'}
 <span className="text-red-500 ms-1">*</span>
 </label>
 <select
 id="grade-select"
 value={gradeLevel}
 onChange={(e) => setGradeLevel(e.target.value)}
 className="w-full h-11 px-3 rounded-xl border border-[#e5e5e5] bg-[#fafafa] text-[13px] text-[#0a0a0a] outline-none focus:border-[#1d4ed8] "
 >
 {GRADES.map((gr) => (
 <option key={gr.id} value={gr.id}>
 {ar ? gr.ar : gr.en}
 </option>
 ))}
 </select>
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
