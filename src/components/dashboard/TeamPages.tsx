/**
 * TeamPages.tsx
 * إدارة الفصول، الطلاب، الواجبات، المؤسسات، والمستخدمين بربط مباشر مع Supabase (Zero Mock Data).
 *
 * © SciNexa Platform — ISEF 2026
 */

import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { PageHeader, StatCard, SectionCard } from './ui';
import {
  getEnrolledStudents,
  addStudentToClassByTeacher,
  deleteStudentEnrollment,
  getAssignments,
  addAssignment,
  deleteAssignmentById,
  getSubmissions,
  fetchAndSyncClasses,
  fetchAndSyncEnrollment,
  fetchAndSyncAssignments,
  type EnrolledStudent,
  type AssignmentItem,
  type ClassInfo,
} from '../../data/schoolEnrollment';
import {
  dbFetchClasses,
  dbCreateClass,
  dbDeleteClass,
  dbFetchAllProfiles,
  dbUpdateProfileRole,
  dbDeleteProfile,
  dbFetchInstitutions,
  dbCreateInstitution,
  dbDeleteInstitution,
  type DbProfile,
  type DbClass,
  type DbInstitution,
} from '../../lib/supabase';
import { EGYPT_GOVERNORATES } from '../../data/egyptLocationData';
import {
  X,
  Users,
  GraduationCap,
  ClipboardList,
  TrendingUp,
  Search,
  ArrowRight,
  CheckCircle2,
  Clock,
  Building2,
  ShieldCheck,
  FlaskConical,
  Activity,
  FileCheck2,
  UserCog,
  MapPin,
  CalendarDays,
  BarChart3,
  Trash2,
  Plus,
  AlertCircle,
} from 'lucide-react';

const Avatar: React.FC<{ name?: string; tone?: string }> = ({ name = '', tone = 'bg-[#f5f5f5] text-[#171717]' }) => (
  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-medium ${tone}`}>
    {(name || '').trim().charAt(0).toUpperCase() || 'U'}
  </span>
);

const ROLE_BADGE: Record<string, string> = {
  student: 'sn-badge-blue',
  teacher: 'sn-badge-green',
  admin: 'sn-badge-amber',
};

/* ── 1. Create Class Modal ─────────────────────────────────────────────────── */
const CreateClassModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreated: (cls: DbClass) => void;
  ar: boolean;
}> = ({ isOpen, onClose, onCreated, ar }) => {
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [grade, setGrade] = useState('sec1');
  const [subjectAr, setSubjectAr] = useState('الكيمياء');
  const [teacherNameAr, setTeacherNameAr] = useState('');
  const [accent, setAccent] = useState('chemistry');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim()) {
      setError(ar ? 'يرجى إدخال اسم الفصل بالعربية.' : 'Please enter class name in Arabic.');
      return;
    }
    setLoading(true);
    const newClass: DbClass = {
      id: `cls_${Date.now()}`,
      name_ar: nameAr.trim(),
      name_en: nameEn.trim() || nameAr.trim(),
      grade,
      teacher_id: `t_${Date.now()}`,
      teacher_name_ar: teacherNameAr.trim() || (ar ? 'المعلم المشرف' : 'Lead Teacher'),
      subject_ar: subjectAr,
      subject_en: subjectAr === 'الكيمياء' ? 'Chemistry' : subjectAr === 'الفيزياء' ? 'Physics' : subjectAr === 'الأحياء' ? 'Biology' : 'General Science',
      accent,
      created_at: new Date().toISOString(),
    };

    await dbCreateClass(newClass);
    setLoading(false);
    onCreated(newClass);
    onClose();
  };

  return (
    <div role="dialog" aria-modal="true" dir={ar ? 'rtl' : 'ltr'} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-[480px] rounded-[22px] bg-white border border-[#e5e5e5] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#1d4ed8]">
              <GraduationCap size={18} />
            </span>
            <div>
              <h3 className="text-[16px] font-bold text-[#0a0a0a]">{ar ? 'إضافة فصل دراسي جديد' : 'Create New Class'}</h3>
              <p className="text-[11px] text-[#737373]">{ar ? 'سيتم حفظ الفصل في Supabase لربط الطلاب والواجبات' : 'Class will be saved to Supabase'}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="sn-btn sn-btn-quiet sn-btn-icon">
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="mb-3.5 p-3 rounded-xl bg-red-50 text-red-700 text-[12px] border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[12px] font-semibold text-[#171717] mb-1">{ar ? 'اسم الفصل بالعربية *' : 'Class Name (Arabic) *'}</label>
            <input
              required
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              placeholder={ar ? 'مثال: كيمياء ١أ (الصف الأول الثانوي)' : 'e.g. Chemistry 1A'}
              className="sn-input !h-10 text-[13px]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#171717] mb-1">{ar ? 'اسم الفصل بالإنجليزية' : 'Class Name (English)'}</label>
            <input
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="e.g. Chemistry 1A"
              className="sn-input !h-10 text-[13px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-[#171717] mb-1">{ar ? 'المرحلة الدراسية *' : 'Grade Level *'}</label>
              <select value={grade} onChange={(e) => setGrade(e.target.value)} className="sn-input !h-10 text-[12px]">
                <option value="sec1">{ar ? 'الأول الثانوي' : '1st Secondary'}</option>
                <option value="sec2">{ar ? 'الثاني الثانوي' : '2nd Secondary'}</option>
                <option value="sec3">{ar ? 'الثالث الثانوي' : '3rd Secondary'}</option>
                <option value="prep1">{ar ? 'الأول الإعدادي' : '1st Prep'}</option>
                <option value="prep2">{ar ? 'الثاني الإعدادي' : '2nd Prep'}</option>
                <option value="prep3">{ar ? 'الثالث الإعدادي' : '3rd Prep'}</option>
                <option value="stem">{ar ? 'مدارس المتفوقين STEM' : 'STEM Schools'}</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#171717] mb-1">{ar ? 'المادة العلمية *' : 'Subject *'}</label>
              <select
                value={subjectAr}
                onChange={(e) => {
                  setSubjectAr(e.target.value);
                  if (e.target.value === 'الكيمياء') setAccent('chemistry');
                  else if (e.target.value === 'الفيزياء') setAccent('physics');
                  else if (e.target.value === 'الأحياء') setAccent('biology');
                  else setAccent('anatomy');
                }}
                className="sn-input !h-10 text-[12px]"
              >
                <option value="الكيمياء">{ar ? 'الكيمياء' : 'Chemistry'}</option>
                <option value="الفيزياء">{ar ? 'الفيزياء' : 'Physics'}</option>
                <option value="الأحياء">{ar ? 'الأحياء' : 'Biology'}</option>
                <option value="العلوم العامة">{ar ? 'العلوم العامة' : 'General Science'}</option>
                <option value="التشريح">{ar ? 'أطلس التشريح' : 'Anatomy'}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#171717] mb-1">{ar ? 'اسم المعلم المشرف' : 'Educator Name'}</label>
            <input
              value={teacherNameAr}
              onChange={(e) => setTeacherNameAr(e.target.value)}
              placeholder={ar ? 'مثال: أ. محمد أحمد' : 'e.g. Mr. Mohamed Ahmed'}
              className="sn-input !h-10 text-[13px]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#f0f0f0]">
            <button type="button" onClick={onClose} className="sn-btn sn-btn-outline sn-btn-sm">{ar ? 'إلغاء' : 'Cancel'}</button>
            <button type="submit" disabled={loading} className="sn-btn sn-btn-primary sn-btn-sm">
              {loading ? (ar ? 'جارٍ الحفظ…' : 'Saving…') : ar ? 'تأكيد وحفظ الفصل' : 'Confirm & Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Classes Page ─────────────────────────────────────────────────────────── */
export const ClassesPage: React.FC = () => {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const [classList, setClassList] = useState<DbClass[]>([]);
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [fetchedClasses, fetchedStudents] = await Promise.all([
      dbFetchClasses(),
      fetchAndSyncEnrollment(),
    ]);
    setClassList(fetchedClasses || []);
    setStudents(fetchedStudents || []);
    setLoading(false);
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleDeleteClass = async (id: string, name: string) => {
    if (!window.confirm(ar ? `هل أنت متأكد من حذف فصل "${name}" نهائياً من Supabase؟` : `Are you sure you want to delete "${name}"?`)) {
      return;
    }
    await dbDeleteClass(id);
    setClassList((prev) => prev.filter((c) => c.id !== id));
  };

  const totalStudents = students.length;
  const avgMastery = students.length > 0
    ? Math.round(students.reduce((acc, s) => acc + (s.mastery || 0), 0) / students.length)
    : 0;

  return (
    <div>
      <PageHeader
        eyebrow={ar ? 'التعليم' : 'Teaching'}
        title={ar ? 'فصولك، في مكان واحد.' : 'Your classes, in one room.'}
        subtitle={ar ? 'تابع الإنجاز، افتح السبورة، ووزّع الواجبات دون مغادرة اللوحة.' : 'Track completion and assign work from real Supabase records.'}
        actions={
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setIsCreateOpen(true)} className="sn-btn sn-btn-primary">
              <Plus size={15} strokeWidth={2} />
              {ar ? 'إضافة فصل جديد' : 'New Class'}
            </button>
            <Link to="/app/assignments" className="sn-btn sn-btn-outline">
              <ClipboardList size={15} strokeWidth={1.8} />
              {ar ? 'الواجبات' : 'Assignments'}
            </Link>
          </div>
        }
      />

      <CreateClassModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(newCls) => setClassList((prev) => [newCls, ...prev])}
        ar={ar}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={ar ? 'الفصول المعتمدة' : 'Classes'} value={String(classList.length)} hint={ar ? 'في قاعدة البيانات' : 'in database'} icon={GraduationCap} />
        <StatCard label={ar ? 'الطلاب المسجلون' : 'Students'} value={String(totalStudents)} hint={ar ? 'بيانات حقيقية' : 'live data'} icon={Users} />
        <StatCard label={ar ? 'متوسط الإنجاز' : 'Avg. completion'} value={`${avgMastery}%`} hint={ar ? 'تقييم فعلي' : 'real mastery'} icon={TrendingUp} />
        <StatCard label={ar ? 'المعامل التفاعلية' : 'Active Labs'} value="6" hint={ar ? 'معامل 3D' : '3D labs'} icon={FlaskConical} />
      </div>

      {loading ? (
        <div className="py-12 text-center text-[#737373] text-[13px]">
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[#0a0a0a] border-t-transparent mb-2" />
          <p>{ar ? 'جارٍ تحميل الفصول الحقيقية من Supabase…' : 'Loading classes from Supabase…'}</p>
        </div>
      ) : classList.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e5e5e5] p-10 text-center bg-[#fafafa]">
          <GraduationCap size={36} className="mx-auto text-[#a3a3a3] mb-3" />
          <h3 className="text-[15px] font-bold text-[#0a0a0a] mb-1">
            {ar ? 'لا توجد فصول دراسية مضافة حتى الآن' : 'No classes found'}
          </h3>
          <p className="text-[12px] text-[#737373] max-w-[45ch] mx-auto mb-4">
            {ar ? 'قم بإنشاء أول فصل دراسي حقيقي ليتمكن المعلمون من إلحاق الطلاب وتعيين التجارب والواجبات.' : 'Create your first class to enroll students and distribute lab tasks.'}
          </p>
          <button type="button" onClick={() => setIsCreateOpen(true)} className="sn-btn sn-btn-primary">
            <Plus size={15} strokeWidth={2} />
            {ar ? 'إضافة أول فصل الآن' : 'Add First Class'}
          </button>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {classList.map((item) => {
            const classStudents = students.filter((s) => s.classId === item.id);
            const classCount = classStudents.length;
            const classAvg = classCount > 0 ? Math.round(classStudents.reduce((a, b) => a + (b.mastery || 0), 0) / classCount) : 0;
            return (
              <div key={item.id} className={`sn-${item.accent || 'chemistry'} sn-card sn-card-hover p-5`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="sn-icon-tile !h-10 !w-10">
                      <GraduationCap size={18} strokeWidth={1.6} />
                    </span>
                    <div>
                      <h2 className="text-[15px] font-semibold">{ar ? item.name_ar : item.name_en}</h2>
                      <div className="mt-0.5 text-[11px] text-[#737373]">
                        {classCount} {ar ? 'طالب مسجل' : 'students enrolled'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteClass(item.id, item.name_ar)}
                    className="sn-btn sn-btn-quiet sn-btn-icon text-red-500 hover:bg-red-50"
                    title={ar ? 'حذف الفصل' : 'Delete Class'}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="mt-5">
                  <div className="mb-1.5 flex items-center justify-between text-[10px] text-[#737373]">
                    <span>{ar ? 'نسبة الإتقان' : 'Mastery'}</span>
                    <span className="font-mono">{classAvg}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#f0f0f0]">
                    <div className="h-full rounded-full sn-accent-line" style={{ width: `${classAvg}%` }} />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-[#f0f0f0] pt-3">
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-[#737373]">
                    <CalendarDays size={12} strokeWidth={1.8} />
                    <span>{ar ? `المشرف: ${item.teacher_name_ar}` : item.teacher_name_ar}</span>
                  </span>
                  <Link to="/app/students" className="sn-link !text-[12px]">
                    {ar ? 'عرض الطلاب' : 'Students'}
                    <ArrowRight size={13} strokeWidth={1.8} className={ar ? 'rotate-180' : ''} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ── 2. Add Student Modal ─────────────────────────────────────────────────── */
const AddStudentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAdded: (s: EnrolledStudent) => void;
  classes: DbClass[];
  ar: boolean;
}> = ({ isOpen, onClose, onAdded, classes, ar }) => {
  const [quadName, setQuadName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [classId, setClassId] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [governorateId, setGovernorateId] = useState('cairo');
  const [adminId, setAdminId] = useState('');
  const [gradeLevel, setGradeLevel] = useState('sec1');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (classes.length > 0 && !classId) {
      setClassId(classes[0].id);
    }
  }, [classes, classId]);

  if (!isOpen) return null;

  const selectedGov = EGYPT_GOVERNORATES.find((g) => g.id === governorateId) || EGYPT_GOVERNORATES[0];
  const admins = selectedGov.administrations || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const words = quadName.trim().split(/\s+/).filter(Boolean);
    if (words.length < 4) {
      setError(ar ? 'يرجى إدخال الاسم الرباعي كاملاً (٤ مقاطع على الأقل: اسم الطالب، الأب، الجد، اللقب).' : 'Please enter full 4-part name.');
      return;
    }
    if (!schoolName.trim()) {
      setError(ar ? 'يرجى إدخال اسم المدرسة.' : 'Please enter school name.');
      return;
    }

    const cleanNat = nationalId.trim();
    if (cleanNat && !/^\d{14}$/.test(cleanNat)) {
      setError(ar ? 'الرقم القومي يجب أن يتكون من ١٤ رقماً مصرياً صحيحاً.' : 'National ID must be 14 digits.');
      return;
    }

    const selectedCls = classes.find((c) => c.id === classId);

    const newStudent = addStudentToClassByTeacher({
      quadName: quadName.trim(),
      nationalId: cleanNat || undefined,
      classId: classId || (classes[0]?.id || 'default'),
      classNameAr: selectedCls?.name_ar,
      teacherId: selectedCls?.teacher_id,
      teacherNameAr: selectedCls?.teacher_name_ar,
      schoolName: schoolName.trim(),
      governorateId,
      administrationId: adminId || admins[0]?.id || 'default',
      gradeLevel,
    });

    onAdded(newStudent);
    onClose();
  };

  return (
    <div role="dialog" aria-modal="true" dir={ar ? 'rtl' : 'ltr'} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-[500px] overflow-hidden rounded-[22px] bg-white border border-[#e5e5e5] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#1d4ed8]">
              <UserCog size={18} />
            </span>
            <div>
              <h3 className="text-[16px] font-bold text-[#0a0a0a]">{ar ? 'إضافة طالب بالاسم الرباعي' : 'Add Student by Quad Name'}</h3>
              <p className="text-[11px] text-[#737373]">{ar ? 'سيتم حفظ الطالب في Supabase وربط حسابه تلقائياً' : 'Saved to Supabase students_enrollment'}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="sn-btn sn-btn-quiet sn-btn-icon">
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="mb-3.5 p-3 rounded-xl bg-red-50 text-red-700 text-[12px] border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[12px] font-semibold text-[#171717] mb-1">
              {ar ? 'الاسم الرباعي للطالب *' : 'Student 4-Part Full Name *'}
            </label>
            <input
              required
              value={quadName}
              onChange={(e) => setQuadName(e.target.value)}
              placeholder={ar ? 'مثال: ياسين محمد إبراهيم زيد' : 'e.g. Yaseen Mohamed Ibrahim Zed'}
              className="sn-input !h-10 text-[13px]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#171717] mb-1">
              {ar ? 'الرقم القومي للطالب (١٤ رقماً)' : 'National ID (14 digits)'}
            </label>
            <input
              type="text"
              maxLength={14}
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ''))}
              placeholder={ar ? 'مثال: 30801011234567' : '14-digit Egyptian National ID'}
              className="sn-input !h-10 text-[13px] font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-[#171717] mb-1">{ar ? 'الفصل الدراسي *' : 'Class *'}</label>
              <select value={classId} onChange={(e) => setClassId(e.target.value)} className="sn-input !h-10 text-[12px]">
                {classes.length === 0 ? (
                  <option value="">{ar ? 'لا توجد فصول (أنشئ فصلاً أولاً)' : 'No classes available'}</option>
                ) : (
                  classes.map((c) => (
                    <option key={c.id} value={c.id}>{ar ? c.name_ar : c.name_en}</option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#171717] mb-1">{ar ? 'المحافظة *' : 'Governorate *'}</label>
              <select value={governorateId} onChange={(e) => setGovernorateId(e.target.value)} className="sn-input !h-10 text-[12px]">
                {EGYPT_GOVERNORATES.map((g) => (
                  <option key={g.id} value={g.id}>{ar ? g.nameAr : g.nameEn}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#171717] mb-1">{ar ? 'اسم المدرسة الحالية *' : 'School Name *'}</label>
            <input
              required
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder={ar ? 'مثال: مدرسة المتفوقين للعلوم والتكنولوجيا' : 'e.g. STEM High School'}
              className="sn-input !h-10 text-[13px]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#f0f0f0]">
            <button type="button" onClick={onClose} className="sn-btn sn-btn-outline sn-btn-sm">{ar ? 'إلغاء' : 'Cancel'}</button>
            <button type="submit" className="sn-btn sn-btn-primary sn-btn-sm">{ar ? 'تأكيد وإضافة الطالب' : 'Confirm & Add'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Students Page ────────────────────────────────────────────────────────── */
export const StudentsPage: React.FC = () => {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const [query, setQuery] = useState('');
  const [onlyReview, setOnlyReview] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [customList, setCustomList] = useState<EnrolledStudent[]>([]);
  const [classes, setClasses] = useState<DbClass[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [fetchedStudents, fetchedClasses] = await Promise.all([
      fetchAndSyncEnrollment(),
      dbFetchClasses(),
    ]);
    setCustomList(fetchedStudents || []);
    setClasses(fetchedClasses || []);
    setLoading(false);
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleDeleteStudent = (id: string, name: string) => {
    if (!window.confirm(ar ? `هل أنت متأكد من حذف الطالب "${name}" نهائياً من Supabase؟` : `Delete student "${name}"?`)) {
      return;
    }
    deleteStudentEnrollment(id);
    setCustomList((prev) => prev.filter((s) => s.id !== id));
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = (customList || []).map((s) => ({
      id: s.id,
      nameEn: s.quadName || 'Student',
      nameAr: s.quadName || 'طالب مسجل',
      code: s.nationalId ? `ID: ${s.nationalId.slice(-4)}` : (s.id || '2026').slice(-6).toUpperCase(),
      classEn: s.classNameAr || 'General',
      classAr: s.classNameAr || 'فصل عام',
      mastery: s.mastery ?? 0,
      lastEn: s.lastActiveDate || 'Today',
      lastAr: s.lastActiveDate || 'اليوم',
      status: s.mastery > 50 ? 'active' : 'review',
    }));

    return all.filter((student) => {
      const sNameEn = student.nameEn || '';
      const sNameAr = student.nameAr || '';
      const sCode = student.code || '';
      const sClassEn = student.classEn || '';
      const matches =
        !q ||
        sNameEn.toLowerCase().includes(q) ||
        sNameAr.includes(q) ||
        sCode.includes(q) ||
        sClassEn.toLowerCase().includes(q);
      return matches && (!onlyReview || student.status !== 'active');
    });
  }, [query, onlyReview, customList]);

  const handleStudentAdded = (newS: EnrolledStudent) => {
    setCustomList((prev) => [newS, ...prev]);
    setSuccessMsg(ar ? `تمت إضافة الطالب "${newS.quadName}" إلى فصل ${newS.classNameAr} بنجاح!` : `Student ${newS.quadName} enrolled successfully!`);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  return (
    <div>
      <PageHeader
        eyebrow={ar ? 'التعليم' : 'Teaching'}
        title={ar ? 'الطلاب' : 'Students'}
        subtitle={ar ? 'ابحث عن طالب، راجع إتقانه، وافتح تقريره الكامل.' : 'Real student records from Supabase.'}
        actions={
          <button type="button" onClick={() => setIsAddOpen(true)} className="sn-btn sn-btn-primary">
            <Plus size={15} strokeWidth={2} />
            {ar ? 'إضافة طالب جديد' : 'Add Student'}
          </button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-[320px]">
          <Search size={14} strokeWidth={1.8} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[#a3a3a3]" />
          <input
            className="sn-input !h-9 !ps-9 !text-[12px]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={ar ? 'ابحث بالاسم أو الكود…' : 'Search by name or code…'}
            aria-label={ar ? 'بحث الطلاب' : 'Search students'}
          />
        </div>
        <button
          type="button"
          onClick={() => setOnlyReview((v) => !v)}
          className={`sn-btn sn-btn-sm ${onlyReview ? 'sn-btn-primary' : 'sn-btn-outline'}`}
        >
          <Activity size={13} strokeWidth={1.8} />
          {ar ? 'يحتاجون متابعة' : 'Needs review'}
        </button>
      </div>

      {successMsg && (
        <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-[13px] flex items-center justify-between">
          <span>✓ {successMsg}</span>
          <button type="button" onClick={() => setSuccessMsg(null)} className="text-emerald-700">✕</button>
        </div>
      )}

      <AddStudentModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdded={handleStudentAdded}
        classes={classes}
        ar={ar}
      />

      {loading ? (
        <div className="py-12 text-center text-[#737373] text-[13px]">
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[#0a0a0a] border-t-transparent mb-2" />
          <p>{ar ? 'جارٍ جلب الطلاب المسجلين من Supabase…' : 'Loading students from Supabase…'}</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e5e5e5] p-10 text-center bg-[#fafafa]">
          <Users size={36} className="mx-auto text-[#a3a3a3] mb-3" />
          <h3 className="text-[15px] font-bold text-[#0a0a0a] mb-1">
            {ar ? 'لا يوجد طلاب مسجلون حالياً' : 'No students found'}
          </h3>
          <p className="text-[12px] text-[#737373] max-w-[45ch] mx-auto mb-4">
            {ar ? 'استخدم زر "إضافة طالب جديد" لتسجيل الطلاب بالاسم الرباعي والرقم القومي وإلحاقهم بالفصول.' : 'Click "Add Student" to enroll real students into classes.'}
          </p>
          <button type="button" onClick={() => setIsAddOpen(true)} className="sn-btn sn-btn-primary">
            <Plus size={15} strokeWidth={2} />
            {ar ? 'إضافة أول طالب' : 'Add First Student'}
          </button>
        </div>
      ) : (
        <SectionCard title={ar ? 'كل الطلاب' : 'All students'} action={<span className="sn-badge sn-badge-outline">{rows.length} {ar ? 'طالب' : 'students'}</span>} bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-[#f0f0f0] text-[10px] uppercase tracking-[0.08em] text-[#a3a3a3]">
                  <th className="px-5 py-2.5 text-start font-medium">{ar ? 'الطالب' : 'Student'}</th>
                  <th className="px-3 py-2.5 text-start font-medium">{ar ? 'الفصل' : 'Class'}</th>
                  <th className="px-3 py-2.5 text-start font-medium">{ar ? 'الإتقان' : 'Mastery'}</th>
                  <th className="px-3 py-2.5 text-start font-medium">{ar ? 'آخر نشاط' : 'Last active'}</th>
                  <th className="px-5 py-2.5 text-start font-medium">{ar ? 'الحالة' : 'Status'}</th>
                  <th className="px-5 py-2.5 text-end font-medium">{ar ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((student) => (
                  <tr key={student.id} className="border-b border-[#f7f7f7] text-[12px] last:border-0 hover:bg-[#fafafa]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={student.nameEn} />
                        <div>
                          <div className="font-medium">{ar ? student.nameAr : student.nameEn}</div>
                          <div className="font-mono text-[10px] text-[#a3a3a3]">{student.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[#737373]">{ar ? student.classAr : student.classEn}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#f0f0f0]">
                          <div
                            className={`h-full rounded-full ${student.mastery >= 70 ? 'bg-[#0a0a0a]' : 'bg-[#b45309]'}`}
                            style={{ width: `${student.mastery}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px]">{student.mastery}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[#737373]">{ar ? student.lastAr : student.lastEn}</td>
                    <td className="px-5 py-3">
                      <span className={`sn-badge !text-[10px] ${student.status === 'active' ? 'sn-badge-green' : 'sn-badge-amber'}`}>
                        {student.status === 'active' ? (ar ? 'نشط' : 'Active') : (ar ? 'مراجعة' : 'Review')}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-end">
                      <button
                        type="button"
                        onClick={() => handleDeleteStudent(student.id, student.nameAr)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors"
                        title={ar ? 'حذف الطالب' : 'Delete Student'}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  );
};

/* ── 3. Create Assignment Modal ───────────────────────────────────────────── */
const CreateAssignmentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAdded: (item: AssignmentItem) => void;
  classes: DbClass[];
  ar: boolean;
}> = ({ isOpen, onClose, onAdded, classes, ar }) => {
  const [titleAr, setTitleAr] = useState('');
  const [classId, setClassId] = useState('');
  const [targetType, setTargetType] = useState<'class' | 'student'>('class');
  const [targetStudentQuadName, setTargetStudentQuadName] = useState('');
  const [linkedLab, setLinkedLab] = useState('chemistry');
  const [dueDateAr, setDueDateAr] = useState('الخميس القادم · ١٠:٠٠ م');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (classes.length > 0 && !classId) {
      setClassId(classes[0].id);
    }
  }, [classes, classId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleAr.trim()) {
      setError(ar ? 'يرجى إدخال عنوان الواجب أو التكليف.' : 'Please enter assignment title.');
      return;
    }
    if (targetType === 'student' && !targetStudentQuadName.trim()) {
      setError(ar ? 'يرجى كتابة اسم الطالب المعني.' : 'Please enter student name.');
      return;
    }
    const cls = classes.find((c) => c.id === classId);
    const newAssignment: AssignmentItem = {
      id: `asg-${Date.now()}`,
      titleAr: titleAr.trim(),
      titleEn: titleAr.trim(),
      classId: cls?.id || classId || 'default',
      classNameAr: cls?.name_ar || 'فصل معتمد',
      targetStudentQuadName: targetType === 'student' ? targetStudentQuadName.trim() : null,
      teacherId: cls?.teacher_id || 't-admin',
      teacherNameAr: cls?.teacher_name_ar || 'المعلم المشرف',
      linkedLab,
      dueDateAr,
      dueDateEn: 'Next Thursday · 10:00 PM',
      descriptionAr: descriptionAr.trim() || 'قم بفتح المعمل 3D وإجراء التجربة المطلوبة وتسجيل النتائج.',
      descriptionEn: 'Open the 3D lab, conduct the experiment, and report findings.',
      totalPoints: 100,
      assignedAt: new Date().toISOString().slice(0, 10),
    };
    addAssignment(newAssignment);
    onAdded(newAssignment);
    onClose();
  };

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-[540px] rounded-2xl bg-white p-6 shadow-2xl border border-[#e5e5e5]" dir={ar ? 'rtl' : 'ltr'}>
        <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#eff6ff] text-[#1d4ed8]">
              <ClipboardList size={18} />
            </span>
            <h3 className="text-[15px] font-bold text-[#0a0a0a]">
              {ar ? 'إنشاء واجب أو تقييم معملي جديد' : 'Create New Assignment'}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="sn-btn sn-btn-quiet sn-btn-icon text-[#737373]">
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-[12px] text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-[#171717] mb-1">
              {ar ? 'عنوان الواجب أو التجربة *' : 'Assignment Title *'}
            </label>
            <input
              type="text"
              required
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
              placeholder={ar ? 'مثال: تقرير تجربة اختزال أكسيد النحاس بالهيدروجين' : 'e.g. Hydrogen reduction report'}
              className="h-9 w-full rounded-xl border border-[#e5e5e5] px-3 text-[12px] text-[#0a0a0a] outline-none focus:border-[#0a0a0a]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#171717] mb-1">
                {ar ? 'الفصل الدراسي *' : 'Target Class *'}
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="h-9 w-full rounded-xl border border-[#e5e5e5] px-2 text-[12px] text-[#0a0a0a] outline-none focus:border-[#0a0a0a] bg-white"
              >
                {classes.length === 0 ? (
                  <option value="">{ar ? 'لا توجد فصول (أنشئ فصلاً أولاً)' : 'No classes available'}</option>
                ) : (
                  classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name_ar}</option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#171717] mb-1">
                {ar ? 'المعمل ثلاثي الأبعاد المرتبط *' : 'Linked 3D Lab *'}
              </label>
              <select
                value={linkedLab}
                onChange={(e) => setLinkedLab(e.target.value)}
                className="h-9 w-full rounded-xl border border-[#e5e5e5] px-2 text-[12px] text-[#0a0a0a] outline-none focus:border-[#0a0a0a] bg-white"
              >
                <option value="chemistry">{ar ? 'معمل الكيمياء' : 'Chemistry Lab'}</option>
                <option value="physics">{ar ? 'معمل الفيزياء' : 'Physics Lab'}</option>
                <option value="anatomy">{ar ? 'أطلس التشريح' : 'Anatomy Lab'}</option>
                <option value="biology">{ar ? 'معمل الأحياء والوراثة' : 'Biology Lab'}</option>
                <option value="geology">{ar ? 'معمل الجيولوجيا' : 'Geology Lab'}</option>
                <option value="astronomy">{ar ? 'معمل الفلك' : 'Astronomy Lab'}</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-[#171717]">
              {ar ? 'توجيه التكليف إلى *' : 'Target Audience *'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setTargetType('class'); setTargetStudentQuadName(''); }}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl border text-[11px] font-semibold transition-all ${targetType === 'class' ? 'border-[#0a0a0a] bg-[#0a0a0a] text-white' : 'border-[#e5e5e5] bg-white text-[#737373] hover:border-[#a3a3a3]'}`}
              >
                <Users size={13} />
                <span>{ar ? 'جميع طلاب الفصل' : 'All Class'}</span>
              </button>
              <button
                type="button"
                onClick={() => setTargetType('student')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl border text-[11px] font-semibold transition-all ${targetType === 'student' ? 'border-[#0a0a0a] bg-[#0a0a0a] text-white' : 'border-[#e5e5e5] bg-white text-[#737373] hover:border-[#a3a3a3]'}`}
              >
                <UserCog size={13} />
                <span>{ar ? 'طالب معين بالاسم' : 'Specific Student'}</span>
              </button>
            </div>

            {targetType === 'student' && (
              <div className="pt-1">
                <input
                  type="text"
                  value={targetStudentQuadName}
                  onChange={(e) => setTargetStudentQuadName(e.target.value)}
                  placeholder={ar ? 'اكتب الاسم الرباعي للطالب المعني…' : 'Student full 4-part name…'}
                  className="h-9 w-full rounded-xl border border-[#e5e5e5] px-3 text-[12px] text-[#0a0a0a] outline-none focus:border-[#0a0a0a]"
                  required
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#171717] mb-1">
              {ar ? 'موعد التسليم' : 'Due Date'}
            </label>
            <input
              type="text"
              value={dueDateAr}
              onChange={(e) => setDueDateAr(e.target.value)}
              className="h-9 w-full rounded-xl border border-[#e5e5e5] px-3 text-[12px] text-[#0a0a0a] outline-none focus:border-[#0a0a0a]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#171717] mb-1">
              {ar ? 'تعليمات الواجب والتجربة' : 'Instructions'}
            </label>
            <textarea
              rows={3}
              value={descriptionAr}
              onChange={(e) => setDescriptionAr(e.target.value)}
              placeholder={ar ? 'اكتب تعليمات التجربة المعملية وكيفية تسجيل النتائج…' : 'Enter instructions…'}
              className="w-full rounded-xl border border-[#e5e5e5] p-2.5 text-[12px] text-[#0a0a0a] outline-none focus:border-[#0a0a0a]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f0f0f0]">
            <button type="button" onClick={onClose} className="sn-btn sn-btn-outline sn-btn-sm">
              {ar ? 'إلغاء' : 'Cancel'}
            </button>
            <button type="submit" className="sn-btn sn-btn-primary sn-btn-sm">
              {ar ? 'حفظ وإرسال للطلاب' : 'Save & Assign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Assignments Page ─────────────────────────────────────────────────────── */
export const AssignmentsPage: React.FC = () => {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const [assignmentsList, setAssignmentsList] = useState<AssignmentItem[]>([]);
  const [classes, setClasses] = useState<DbClass[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [fetchedAsg, fetchedClasses] = await Promise.all([
      fetchAndSyncAssignments(),
      dbFetchClasses(),
    ]);
    setAssignmentsList(fetchedAsg || []);
    setClasses(fetchedClasses || []);
    setLoading(false);
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleDeleteAssignment = (id: string, title: string) => {
    if (!window.confirm(ar ? `هل أنت متأكد من حذف واجب "${title}" نهائياً من Supabase؟` : `Delete assignment "${title}"?`)) {
      return;
    }
    deleteAssignmentById(id);
    setAssignmentsList((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAdded = (newAsg: AssignmentItem) => {
    setAssignmentsList((prev) => [newAsg, ...prev]);
    setSuccessMsg(ar ? `تم إنشاء الواجب "${newAsg.titleAr}" بنجاح!` : 'Assignment created successfully!');
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const submissions = getSubmissions();

  return (
    <div>
      <PageHeader
        eyebrow={ar ? 'التعليم والواجبات' : 'Teaching & Assignments'}
        title={ar ? 'الواجبات والتكليفات المعملية' : 'Lab Assignments'}
        subtitle={ar ? 'كل واجب مرتبط بدرس وتجربة ثلاثية الأبعاد ومحفوظ في Supabase.' : 'Every assignment is tied to a lesson and a 3D lab.'}
        actions={
          <button type="button" onClick={() => setIsCreateOpen(true)} className="sn-btn sn-btn-primary">
            <Plus size={15} strokeWidth={2} />
            {ar ? 'إنشاء واجب جديد' : 'Create assignment'}
          </button>
        }
      />

      <CreateAssignmentModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onAdded={handleAdded}
        classes={classes}
        ar={ar}
      />

      {successMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-500/30 p-3 text-[12px] font-medium text-emerald-800">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={ar ? 'واجبات نشطة' : 'Open'} value={String(assignmentsList.length)} hint={ar ? 'في قاعدة البيانات' : 'in database'} icon={ClipboardList} />
        <StatCard label={ar ? 'تسليمات مسجلة' : 'Submissions'} value={String(submissions.length)} hint={ar ? 'تسليمات حقيقية' : 'real submissions'} icon={FileCheck2} />
        <StatCard label={ar ? 'بانتظار المراجعة' : 'To review'} value={String(submissions.filter((s) => s.status === 'submitted').length)} hint={ar ? 'تسليم' : 'items'} icon={Clock} />
        <StatCard label={ar ? 'متوسط الدرجة' : 'Avg. score'} value={submissions.length > 0 ? `${Math.round(submissions.reduce((a, b) => a + (b.score || 0), 0) / submissions.length)}%` : '—'} hint={ar ? 'تقييم فعلي' : 'real average'} icon={TrendingUp} />
      </div>

      {loading ? (
        <div className="py-12 text-center text-[#737373] text-[13px]">
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[#0a0a0a] border-t-transparent mb-2" />
          <p>{ar ? 'جارٍ تحميل الواجبات من Supabase…' : 'Loading assignments from Supabase…'}</p>
        </div>
      ) : assignmentsList.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e5e5e5] p-10 text-center bg-[#fafafa]">
          <ClipboardList size={36} className="mx-auto text-[#a3a3a3] mb-3" />
          <h3 className="text-[15px] font-bold text-[#0a0a0a] mb-1">
            {ar ? 'لا توجد واجبات منشورة حتى الآن' : 'No assignments found'}
          </h3>
          <p className="text-[12px] text-[#737373] max-w-[45ch] mx-auto mb-4">
            {ar ? 'اضغط على "إنشاء واجب جديد" لتعيين تجربة معملية لفصل كامل أو لطالب معين بالاسم.' : 'Click "Create assignment" to link a 3D lab task to your students.'}
          </p>
          <button type="button" onClick={() => setIsCreateOpen(true)} className="sn-btn sn-btn-primary">
            <Plus size={15} strokeWidth={2} />
            {ar ? 'إنشاء أول واجب الآن' : 'Create First Assignment'}
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {assignmentsList.map((item) => {
            const accent = item.linkedLab || 'chemistry';
            return (
              <div key={item.id} className={`sn-${accent} sn-card p-4`}>
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <span className="sn-icon-tile">
                    <ClipboardList size={17} strokeWidth={1.7} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold text-[#0a0a0a]">{ar ? item.titleAr : item.titleEn}</div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#737373]">
                      <span className="font-medium text-[#171717]">{item.classNameAr}</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays size={11} strokeWidth={1.8} />
                        {ar ? item.dueDateAr : item.dueDateEn}
                      </span>
                      <span>·</span>
                      <span>{ar ? `المشرف: ${item.teacherNameAr}` : item.teacherNameAr}</span>
                      {item.targetStudentQuadName && (
                        <span className="sn-badge sn-badge-blue !text-[10px]">
                          {ar ? `طالب خاص: ${item.targetStudentQuadName}` : `Special: ${item.targetStudentQuadName}`}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-[#737373] line-clamp-1">{item.descriptionAr}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDeleteAssignment(item.id, item.titleAr)}
                      className="sn-btn sn-btn-quiet sn-btn-icon text-red-500 hover:bg-red-50"
                      title={ar ? 'حذف الواجب' : 'Delete Assignment'}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ── 4. Add Institution Modal ─────────────────────────────────────────────── */
const AddInstitutionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreated: (inst: DbInstitution) => void;
  ar: boolean;
}> = ({ isOpen, onClose, onCreated, ar }) => {
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [cityAr, setCityAr] = useState('القاهرة');
  const [status, setStatus] = useState<'active' | 'trial'>('active');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim()) {
      setError(ar ? 'يرجى كتابة اسم المؤسسة / المدرسة.' : 'Please enter institution name.');
      return;
    }
    setLoading(true);
    const newInst: DbInstitution = {
      id: `inst_${Date.now()}`,
      name_ar: nameAr.trim(),
      name_en: nameEn.trim() || nameAr.trim(),
      city_ar: cityAr,
      city_en: cityAr === 'القاهرة' ? 'Cairo' : cityAr === 'الإسكندرية' ? 'Alexandria' : cityAr,
      users_count: 0,
      labs_count: 0,
      status,
      created_at: new Date().toISOString(),
    };

    await dbCreateInstitution(newInst);
    setLoading(false);
    onCreated(newInst);
    onClose();
  };

  return (
    <div role="dialog" aria-modal="true" dir={ar ? 'rtl' : 'ltr'} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-[460px] rounded-[22px] bg-white border border-[#e5e5e5] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <Building2 size={18} />
            </span>
            <div>
              <h3 className="text-[16px] font-bold text-[#0a0a0a]">{ar ? 'إضافة مؤسسة / مدرسة جديدة' : 'Add New Institution'}</h3>
              <p className="text-[11px] text-[#737373]">{ar ? 'سيتم ربط المؤسسة بقاعدة بيانات Supabase' : 'Connect to Supabase database'}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="sn-btn sn-btn-quiet sn-btn-icon">
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="mb-3.5 p-3 rounded-xl bg-red-50 text-red-700 text-[12px] border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[12px] font-semibold text-[#171717] mb-1">{ar ? 'اسم المؤسسة بالعربية *' : 'Institution Name (Arabic) *'}</label>
            <input
              required
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              placeholder={ar ? 'مثال: مدرسة النيل الثانوية للعلوم' : 'e.g. Nile Science High School'}
              className="sn-input !h-10 text-[13px]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#171717] mb-1">{ar ? 'اسم المؤسسة بالإنجليزية' : 'Institution Name (English)'}</label>
            <input
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="e.g. Nile Science High School"
              className="sn-input !h-10 text-[13px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-[#171717] mb-1">{ar ? 'المدينة / المحافظة *' : 'City / Governorate *'}</label>
              <select value={cityAr} onChange={(e) => setCityAr(e.target.value)} className="sn-input !h-10 text-[12px]">
                {EGYPT_GOVERNORATES.map((g) => (
                  <option key={g.id} value={g.nameAr}>{g.nameAr}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#171717] mb-1">{ar ? 'حالة الاشتراك *' : 'Status *'}</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as 'active' | 'trial')} className="sn-input !h-10 text-[12px]">
                <option value="active">{ar ? 'نشط' : 'Active'}</option>
                <option value="trial">{ar ? 'تجريبي' : 'Trial'}</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#f0f0f0]">
            <button type="button" onClick={onClose} className="sn-btn sn-btn-outline sn-btn-sm">{ar ? 'إلغاء' : 'Cancel'}</button>
            <button type="submit" disabled={loading} className="sn-btn sn-btn-primary sn-btn-sm">
              {loading ? (ar ? 'جارٍ الحفظ…' : 'Saving…') : ar ? 'تأكيد وحفظ المؤسسة' : 'Confirm & Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Institutions Page ────────────────────────────────────────────────────── */
export const InstitutionsPage: React.FC = () => {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const [institutions, setInstitutions] = useState<DbInstitution[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const list = await dbFetchInstitutions();
    setInstitutions(list || []);
    setLoading(false);
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(ar ? `هل أنت متأكد من حذف مؤسسة "${name}" نهائياً من Supabase؟` : `Delete institution "${name}"?`)) {
      return;
    }
    await dbDeleteInstitution(id);
    setInstitutions((prev) => prev.filter((i) => i.id !== id));
  };

  const activeCount = institutions.filter((i) => i.status === 'active').length;
  const trialCount = institutions.filter((i) => i.status === 'trial').length;

  return (
    <div>
      <PageHeader
        eyebrow={ar ? 'الإدارة' : 'Administration'}
        title={ar ? 'المؤسسات التعليمية' : 'Institutions'}
        subtitle={ar ? 'إدارة المدارس والجامعات المتصلة والمحفوظة في Supabase.' : 'Connected schools and subscription health.'}
        actions={
          <button type="button" onClick={() => setIsAddOpen(true)} className="sn-btn sn-btn-primary">
            <Plus size={15} strokeWidth={2} />
            {ar ? 'إضافة مؤسسة' : 'Add institution'}
          </button>
        }
      />

      <AddInstitutionModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onCreated={(newInst) => setInstitutions((prev) => [newInst, ...prev])}
        ar={ar}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={ar ? 'المؤسسات' : 'Institutions'} value={String(institutions.length)} hint={ar ? 'في قاعدة البيانات' : 'in database'} icon={Building2} />
        <StatCard label={ar ? 'المؤسسات النشطة' : 'Active'} value={String(activeCount)} hint={ar ? 'اشتراك نشط' : 'active status'} icon={CheckCircle2} />
        <StatCard label={ar ? 'فترة تجريبية' : 'Trials'} value={String(trialCount)} hint={ar ? 'تحت الاختبار' : 'in trial'} icon={Clock} />
        <StatCard label={ar ? 'المعامل المتصلة' : 'Connected Labs'} value="6" hint={ar ? 'معامل 3D' : '3D labs'} icon={FlaskConical} />
      </div>

      {loading ? (
        <div className="py-12 text-center text-[#737373] text-[13px]">
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[#0a0a0a] border-t-transparent mb-2" />
          <p>{ar ? 'جارٍ تحميل المؤسسات من Supabase…' : 'Loading institutions from Supabase…'}</p>
        </div>
      ) : institutions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e5e5e5] p-10 text-center bg-[#fafafa]">
          <Building2 size={36} className="mx-auto text-[#a3a3a3] mb-3" />
          <h3 className="text-[15px] font-bold text-[#0a0a0a] mb-1">
            {ar ? 'لا توجد مؤسسات تعليمية مضافة حالياً' : 'No institutions added yet'}
          </h3>
          <p className="text-[12px] text-[#737373] max-w-[45ch] mx-auto mb-4">
            {ar ? 'اضغط على "إضافة مؤسسة" لإدراج مدرسة أو جامعة ومتابعة استخدام معاملها وطلابها.' : 'Click "Add institution" to add a school and monitor its usage.'}
          </p>
          <button type="button" onClick={() => setIsAddOpen(true)} className="sn-btn sn-btn-primary">
            <Plus size={15} strokeWidth={2} />
            {ar ? 'إضافة أول مؤسسة' : 'Add First Institution'}
          </button>
        </div>
      ) : (
        <SectionCard title={ar ? 'كل المؤسسات' : 'All institutions'} action={<span className="sn-badge sn-badge-outline">{institutions.length} {ar ? 'مؤسسة' : 'schools'}</span>} bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead>
                <tr className="border-b border-[#f0f0f0] text-[10px] uppercase tracking-[0.08em] text-[#a3a3a3]">
                  <th className="px-5 py-2.5 text-start font-medium">{ar ? 'المؤسسة' : 'Institution'}</th>
                  <th className="px-3 py-2.5 text-start font-medium">{ar ? 'المدينة' : 'City'}</th>
                  <th className="px-3 py-2.5 text-start font-medium">{ar ? 'الحالة' : 'Status'}</th>
                  <th className="px-5 py-2.5 text-end font-medium">{ar ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {institutions.map((item) => (
                  <tr key={item.id} className="border-b border-[#f7f7f7] text-[12px] last:border-0 hover:bg-[#fafafa]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#f5f5f5]">
                          <Building2 size={14} strokeWidth={1.7} className="text-[#737373]" />
                        </span>
                        <span className="font-medium">{ar ? item.name_ar : item.name_en}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[#737373]">
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={11} strokeWidth={1.8} />
                        {ar ? item.city_ar : item.city_en}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`sn-badge !text-[10px] ${item.status === 'active' ? 'sn-badge-green' : 'sn-badge-amber'}`}>
                        {item.status === 'active' ? (ar ? 'نشط' : 'Active') : (ar ? 'تجريبي' : 'Trial')}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-end">
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.name_ar)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors"
                        title={ar ? 'حذف المؤسسة' : 'Delete Institution'}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  );
};

/* ── Users & Roles Page ───────────────────────────────────────────────────── */
export const UsersPage: React.FC = () => {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const [query, setQuery] = useState('');
  const [profiles, setProfiles] = useState<DbProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProfiles = async () => {
    setLoading(true);
    const list = await dbFetchAllProfiles();
    setProfiles(list || []);
    setLoading(false);
  };

  useEffect(() => {
    void loadProfiles();
  }, []);

  const handleRoleChange = async (id: string, newRole: 'student' | 'teacher' | 'admin') => {
    await dbUpdateProfileRole(id, newRole);
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, role: newRole } : p)));
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!window.confirm(ar ? `هل أنت متأكد من حذف المستخدم "${name}" نهائياً من Supabase؟` : `Delete user "${name}"?`)) {
      return;
    }
    await dbDeleteProfile(id);
    setProfiles((prev) => prev.filter((p) => p.id !== id));
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return profiles.filter((u) => {
      const name = (u.display_name || u.quad_name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      return !q || name.includes(q) || email.includes(q);
    });
  }, [profiles, query]);

  const studentsCount = profiles.filter((p) => p.role === 'student').length;
  const teachersCount = profiles.filter((p) => p.role === 'teacher').length;
  const adminsCount = profiles.filter((p) => p.role === 'admin').length;

  return (
    <div>
      <PageHeader
        eyebrow={ar ? 'الإدارة' : 'Administration'}
        title={ar ? 'المستخدمون والأدوار الحقيقية' : 'Users & Roles'}
        subtitle={ar ? 'المستخدمون المسجلون فعلياً في قاعدة بيانات Supabase.' : 'Real registered users from Supabase profiles table.'}
      />

      <div className="mb-5 grid grid-cols-3 gap-3">
        {[
          { role: 'student', count: String(studentsCount), labelEn: 'Students', labelAr: 'طلاب', icon: GraduationCap },
          { role: 'teacher', count: String(teachersCount), labelEn: 'Teachers', labelAr: 'معلمون', icon: Users },
          { role: 'admin', count: String(adminsCount), labelEn: 'Administrators', labelAr: 'إدارة', icon: ShieldCheck },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.role} className="sn-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.06em] text-[#737373]">{ar ? item.labelAr : item.labelEn}</span>
                <span className={`sn-badge ${ROLE_BADGE[item.role]} !text-[10px]`}>
                  <Icon size={10} strokeWidth={1.9} />
                  {item.role}
                </span>
              </div>
              <div className="sn-stat-value mt-3 !text-[26px]">{item.count}</div>
            </div>
          );
        })}
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-[300px]">
          <Search size={14} strokeWidth={1.8} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[#a3a3a3]" />
          <input
            className="sn-input !h-9 !ps-9 !text-[12px]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={ar ? 'ابحث بالاسم أو البريد' : 'Search name or email'}
            aria-label={ar ? 'بحث المستخدمين' : 'Search users'}
          />
        </div>
        <span className="sn-badge sn-badge-soft">{ar ? 'قاعدة بيانات Supabase' : 'Supabase Live DB'}</span>
      </div>

      {loading ? (
        <div className="py-12 text-center text-[#737373] text-[13px]">
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[#0a0a0a] border-t-transparent mb-2" />
          <p>{ar ? 'جارٍ جلب المستخدمين الحقيقيين من Supabase…' : 'Loading profiles from Supabase…'}</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e5e5e5] p-10 text-center bg-[#fafafa]">
          <Users size={36} className="mx-auto text-[#a3a3a3] mb-3" />
          <h3 className="text-[15px] font-bold text-[#0a0a0a] mb-1">
            {ar ? 'لا يوجد مستخدمون مطابقون للبحث' : 'No users found'}
          </h3>
          <p className="text-[12px] text-[#737373]">
            {ar ? 'سجل مستخدمين جدد عبر تسجيل الدخول بالمنصة.' : 'Users will appear here when they register.'}
          </p>
        </div>
      ) : (
        <SectionCard title={ar ? 'دليل المستخدمين الفعليين' : 'User directory'} action={<span className="sn-badge sn-badge-outline">{rows.length} {ar ? 'مستخدم' : 'users'}</span>} bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-[#f0f0f0] text-[10px] uppercase tracking-[0.08em] text-[#a3a3a3]">
                  <th className="px-5 py-2.5 text-start font-medium">{ar ? 'المستخدم' : 'User'}</th>
                  <th className="px-3 py-2.5 text-start font-medium">{ar ? 'الدور' : 'Role'}</th>
                  <th className="px-3 py-2.5 text-start font-medium">{ar ? 'تاريخ التسجيل' : 'Registered At'}</th>
                  <th className="px-5 py-2.5 text-end font-medium">{ar ? 'تعديل الدور / حذف' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((user) => {
                  const displayName = user.display_name || user.quad_name || (ar ? 'مستخدم مسجل' : 'User');
                  return (
                    <tr key={user.id} className="border-b border-[#f7f7f7] text-[12px] last:border-0 hover:bg-[#fafafa]">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={displayName} />
                          <div>
                            <div className="font-medium text-[#0a0a0a]">{displayName}</div>
                            <div dir="ltr" className="font-mono text-[10px] text-[#a3a3a3]">{user.email || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`sn-badge !text-[10px] ${ROLE_BADGE[user.role || 'student']}`}>{user.role || 'student'}</span>
                      </td>
                      <td className="px-3 py-3 text-[#737373]">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString(ar ? 'ar-EG' : 'en-US') : '—'}
                      </td>
                      <td className="px-5 py-3 text-end">
                        <div className="inline-flex items-center gap-2">
                          <select
                            value={user.role || 'student'}
                            onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                            className="h-7 rounded-lg border border-[#e5e5e5] px-1.5 text-[11px] bg-white outline-none"
                          >
                            <option value="student">{ar ? 'طالب' : 'Student'}</option>
                            <option value="teacher">{ar ? 'معلم' : 'Teacher'}</option>
                            <option value="admin">{ar ? 'إدارة' : 'Admin'}</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user.id, displayName)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50"
                            title={ar ? 'حذف المستخدم' : 'Delete User'}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  );
};

/* ── Analytics Page ───────────────────────────────────────────────────────── */
export const AnalyticsPage: React.FC = () => {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const [classes, setClasses] = useState<DbClass[]>([]);
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [institutions, setInstitutions] = useState<DbInstitution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [c, s, a, inst] = await Promise.all([
        dbFetchClasses(),
        fetchAndSyncEnrollment(),
        fetchAndSyncAssignments(),
        dbFetchInstitutions(),
      ]);
      setClasses(c || []);
      setStudents(s || []);
      setAssignments(a || []);
      setInstitutions(inst || []);
      setLoading(false);
    };
    void load();
  }, []);

  const totalClasses = classes.length;
  const totalStudents = students.length;
  const totalAssignments = assignments.length;
  const avgMastery = totalStudents > 0
    ? Math.round(students.reduce((acc, s) => acc + (s.mastery || 0), 0) / totalStudents)
    : 0;

  return (
    <div>
      <PageHeader
        eyebrow={ar ? 'التحليلات الحقيقية' : 'Analytics'}
        title={ar ? 'إحصاءات منصة SciNexa المعتمدة' : 'Verified Platform Analytics'}
        subtitle={ar ? 'كل الأرقام مستخرجة مباشرة من قاعدة بيانات Supabase وسجلات الطلاب الفعلية.' : 'Real data fetched directly from Supabase.'}
        actions={<span className="sn-badge sn-badge-outline">{ar ? 'بيانات حية' : 'Live Data'}</span>}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={ar ? 'الفصول المعتمدة' : 'Classes'} value={String(totalClasses)} hint={ar ? 'فصل مسجل' : 'classes'} icon={GraduationCap} />
        <StatCard label={ar ? 'الطلاب المسجلون' : 'Students'} value={String(totalStudents)} hint={ar ? 'طالب فعلي' : 'students'} icon={Users} />
        <StatCard label={ar ? 'الواجبات والتكليفات' : 'Assignments'} value={String(totalAssignments)} hint={ar ? 'تكليف معملي' : 'tasks'} icon={ClipboardList} />
        <StatCard label={ar ? 'متوسط إتقان الطلاب' : 'Avg. Mastery'} value={`${avgMastery}%`} hint={ar ? 'تقييم فعلي' : 'real score'} icon={TrendingUp} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <SectionCard title={ar ? 'الفصول الدراسية والإتقان' : 'Classes Mastery'} action={<BarChart3 size={14} strokeWidth={1.7} className="text-[#a3a3a3]" />}>
          {classes.length === 0 ? (
            <div className="py-8 text-center text-[#737373] text-[12px]">
              {ar ? 'لا توجد فصول دراسية لحساب إحصاءاتها حتى الآن.' : 'No classes to analyze yet.'}
            </div>
          ) : (
            <div className="space-y-3.5">
              {classes.map((cls) => {
                const clsStudents = students.filter((s) => s.classId === cls.id);
                const count = clsStudents.length;
                const m = count > 0 ? Math.round(clsStudents.reduce((a, b) => a + (b.mastery || 0), 0) / count) : 0;
                return (
                  <div key={cls.id} className={`sn-${cls.accent || 'chemistry'}`}>
                    <div className="mb-1.5 flex items-center justify-between text-[11px]">
                      <span className="font-medium">{ar ? cls.name_ar : cls.name_en}</span>
                      <span className="font-mono text-[#737373]">{count} {ar ? 'طالب' : 'students'} · {m}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[#f0f0f0]">
                      <div className="h-full rounded-full sn-accent-line" style={{ width: `${m}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard title={ar ? 'المؤسسات التعليمية' : 'Institutions'} bodyClassName="p-3">
          {institutions.length === 0 ? (
            <div className="py-8 text-center text-[#737373] text-[12px]">
              {ar ? 'لا توجد مؤسسات تعليمية مضافة حالياً.' : 'No institutions added yet.'}
            </div>
          ) : (
            <div className="space-y-1">
              {institutions.map((school) => (
                <div key={school.id} className="flex items-center gap-3 rounded-[10px] px-2 py-2 hover:bg-[#fafafa]">
                  <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#f5f5f5]">
                    <Building2 size={12} strokeWidth={1.8} className="text-[#737373]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[11px] font-medium">{ar ? school.name_ar : school.name_en}</div>
                    <div className="text-[9px] text-[#a3a3a3]">{ar ? school.city_ar : school.city_en}</div>
                  </div>
                  <span className={`sn-badge !text-[9px] ${school.status === 'active' ? 'sn-badge-green' : 'sn-badge-amber'}`}>
                    {school.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
};
