/**
 * TeamPages.tsx
 * إدارة الفصول، الطلاب، الواجبات، المؤسسات، والمستخدمين بربط مباشر مع Supabase (Zero Mock Data).
 *
 * © SciNexa Platform — ISEF 2026
 */

import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useSession } from '../../context/SessionContext';
import { LAB_MODULES } from '../../data/labs';
import { PageHeader, StatCard, SectionCard } from './ui';
import {
  getEnrolledStudents,
  addStudentToClassByTeacherAsync,
  deleteStudentEnrollment,
  getAssignments,
  addAssignment,
  deleteAssignmentById,
  getSubmissions,
  fetchAndSyncClasses,
  fetchAndSyncEnrollment,
  fetchAndSyncAssignments,
  fetchAndSyncSubmissions,
  gradeSubmissionAndSync,
  searchRegisteredStudents,
  findExactRegisteredStudent,
  namesMatch,
  transferStudentClassAndSync,
  type EnrolledStudent,
  type AssignmentItem,
  type StudentSubmission,
  type ClassInfo,
} from '../../data/schoolEnrollment';
import {
  dbFetchClasses,
  dbCreateClass,
  dbUpdateClass,
  dbDeleteClass,
  dbFetchAllProfiles,
  dbUpdateProfileRole,
  dbDeleteProfile,
  dbUpdateStudentMastery,
  dbFetchInstitutions,
  dbCreateInstitution,
  dbUpdateInstitution,
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
  MessageSquare,
  Pencil,
  Phone,
  Download,
  Eye,
  Flame,
  Star,
  UserCheck,
  RefreshCw,
  ArrowRightLeft,
} from 'lucide-react';

const GRADE_LABELS_AR: Record<string, string> = {
  prep1: 'الأول الإعدادي',
  prep2: 'الثاني الإعدادي',
  prep3: 'الثالث الإعدادي',
  sec1: 'الأول الثانوي',
  sec2: 'الثاني الثانوي',
  sec3: 'الثالث الثانوي',
  stem: 'مدارس المتفوقين STEM',
  university: 'طالب جامعي',
  researcher: 'باحث علمي',
};

const gradeLabel = (grade: string | undefined, ar: boolean): string => {
  if (!grade) return ar ? 'غير محدد' : 'Unspecified';
  return ar ? (GRADE_LABELS_AR[grade] || grade) : grade.toUpperCase();
};

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

/* ── 1. Create / Edit Class Modal ──────────────────────────────────────────── */
const CreateClassModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreated: (cls: DbClass) => void;
  onUpdated?: (cls: DbClass) => void;
  editingClass?: DbClass | null;
  ar: boolean;
}> = ({ isOpen, onClose, onCreated, onUpdated, editingClass, ar }) => {
  const { educator } = useSession();
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [grade, setGrade] = useState('sec1');
  const [subjectAr, setSubjectAr] = useState('الكيمياء');
  const [teacherNameAr, setTeacherNameAr] = useState('');
  const [accent, setAccent] = useState('chemistry');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    if (editingClass) {
      setNameAr(editingClass.name_ar || '');
      setNameEn(editingClass.name_en || '');
      setGrade(editingClass.grade || 'sec1');
      setSubjectAr(editingClass.subject_ar || 'الكيمياء');
      setTeacherNameAr(editingClass.teacher_name_ar || educator?.name || '');
      setAccent(editingClass.accent || 'chemistry');
    } else {
      setNameAr('');
      setNameEn('');
      setGrade('sec1');
      setSubjectAr('الكيمياء');
      setTeacherNameAr(educator?.name || '');
      setAccent('chemistry');
    }
  }, [isOpen, editingClass, educator?.name]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!nameAr.trim()) {
      setError(ar ? 'يرجى إدخال اسم الفصل بالعربية.' : 'Please enter class name in Arabic.');
      return;
    }
    setLoading(true);
    const subjectEnMap: Record<string, string> = {
      الكيمياء: 'Chemistry',
      الفيزياء: 'Physics',
      الأحياء: 'Biology',
      التشريح: 'Anatomy',
      'العلوم العامة': 'General Science',
    };

    if (editingClass) {
      const updates: Partial<DbClass> = {
        name_ar: nameAr.trim(),
        name_en: nameEn.trim() || nameAr.trim(),
        grade,
        teacher_name_ar: teacherNameAr.trim() || educator?.name || editingClass.teacher_name_ar,
        subject_ar: subjectAr,
        subject_en: subjectEnMap[subjectAr] || 'General Science',
        accent,
      };
      const res = await dbUpdateClass(editingClass.id, updates);
      setLoading(false);
      if (!res.ok) {
        setError(ar ? `فشل تعديل الفصل: ${res.error || 'خطأ في الاتصال'}` : `Failed to update class: ${res.error}`);
        return;
      }
      onUpdated?.({ ...editingClass, ...updates });
      onClose();
      return;
    }

    const teacherId = educator?.nationalId
      ? `edu_${educator.nationalId.slice(-6)}`
      : `edu_${Date.now()}`;
    const newClass: DbClass = {
      id: `cls_${Date.now()}`,
      name_ar: nameAr.trim(),
      name_en: nameEn.trim() || nameAr.trim(),
      grade,
      teacher_id: teacherId,
      teacher_name_ar: teacherNameAr.trim() || educator?.name || (ar ? 'المعلم المشرف' : 'Lead Teacher'),
      subject_ar: subjectAr,
      subject_en: subjectEnMap[subjectAr] || 'General Science',
      accent,
      created_at: new Date().toISOString(),
    };

    const res = await dbCreateClass(newClass);
    setLoading(false);
    if (!res.ok) {
      setError(
        ar
          ? `فشل حفظ الفصل في قاعدة البيانات: ${res.error || 'خطأ في الاتصال'}`
          : `Failed to save class to database: ${res.error || 'Connection error'}`
      );
      return;
    }
    setNameAr('');
    setNameEn('');
    onCreated(res.data);
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
              <h3 className="text-[16px] font-bold text-[#0a0a0a]">
                {editingClass
                  ? (ar ? 'تعديل بيانات الفصل الدراسي' : 'Edit Class Details')
                  : (ar ? 'إضافة فصل دراسي جديد' : 'Create New Class')}
              </h3>
              <p className="text-[11px] text-[#737373]">
                {ar ? 'متزامن مباشرة مع قاعدة بيانات Supabase' : 'Synced directly with Supabase'}
              </p>
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
              {loading
                ? (ar ? 'جارٍ الحفظ…' : 'Saving…')
                : editingClass
                  ? (ar ? 'حفظ التعديلات' : 'Save Changes')
                  : (ar ? 'تأكيد وحفظ الفصل' : 'Confirm & Save')}
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
  const [assignmentsList, setAssignmentsList] = useState<AssignmentItem[]>([]);
  const [registeredProfiles, setRegisteredProfiles] = useState<DbProfile[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<DbClass | null>(null);
  const [rosterClass, setRosterClass] = useState<DbClass | null>(null);
  const [enrollClassId, setEnrollClassId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [fetchedClasses, fetchedStudents, fetchedAsg, fetchedProfiles] = await Promise.all([
      dbFetchClasses(),
      fetchAndSyncEnrollment(),
      fetchAndSyncAssignments(),
      dbFetchAllProfiles(),
    ]);
    setClassList(fetchedClasses || []);
    setStudents(fetchedStudents || []);
    setAssignmentsList(fetchedAsg || []);
    setRegisteredProfiles(fetchedProfiles || []);
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
    if (rosterClass?.id === id) setRosterClass(null);
  };

  const handleRemoveStudentFromRoster = (enrollmentId: string, name: string) => {
    if (!window.confirm(ar ? `إزالة الطالب "${name}" من هذا الفصل؟` : `Remove ${name} from class?`)) return;
    deleteStudentEnrollment(enrollmentId);
    setStudents((prev) => prev.filter((s) => s.id !== enrollmentId));
  };

  const totalStudents = students.length;
  const avgMastery = students.length > 0
    ? Math.round(students.reduce((acc, s) => acc + (s.mastery || 0), 0) / students.length)
    : 0;

  return (
    <div>
      <PageHeader
        eyebrow={ar ? 'التعليم والإدارة' : 'Teaching & Management'}
        title={ar ? 'فصولك، في مكان واحد.' : 'Your classes, in one room.'}
        subtitle={ar ? 'أنشئ الفصول، أدر قوائم الطلاب المسجلين بالمنصة، وتابع التكليفات المعملية من لوحة واحدة.' : 'Create classes, manage enrolled platform students, and monitor lab tasks.'}
        actions={
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => void loadData()} className="sn-btn sn-btn-outline sn-btn-sm" title={ar ? 'تحديث' : 'Refresh'}>
              <RefreshCw size={14} />
            </button>
            <button type="button" onClick={() => { setEditingClass(null); setIsCreateOpen(true); }} className="sn-btn sn-btn-primary">
              <Plus size={15} strokeWidth={2} />
              {ar ? 'إضافة فصل جديد' : 'New Class'}
            </button>
            <Link to="/portal/assignments" className="sn-btn sn-btn-outline">
              <ClipboardList size={15} strokeWidth={1.8} />
              {ar ? 'الواجبات' : 'Assignments'}
            </Link>
          </div>
        }
      />

      <CreateClassModal
        isOpen={isCreateOpen || Boolean(editingClass)}
        onClose={() => { setIsCreateOpen(false); setEditingClass(null); }}
        editingClass={editingClass}
        onCreated={(newCls) => setClassList((prev) => [newCls, ...prev])}
        onUpdated={(upd) => {
          setClassList((prev) => prev.map((c) => (c.id === upd.id ? upd : c)));
          if (rosterClass?.id === upd.id) setRosterClass(upd);
        }}
        ar={ar}
      />

      {enrollClassId && (
        <AddStudentModal
          isOpen={true}
          onClose={() => setEnrollClassId(null)}
          onAdded={(newS) => setStudents((prev) => [newS, ...prev])}
          classes={classList}
          registeredProfiles={registeredProfiles}
          existingEnrollments={students}
          defaultClassId={enrollClassId}
          ar={ar}
        />
      )}

      {rosterClass && (
        <div role="dialog" aria-modal="true" dir={ar ? 'rtl' : 'ltr'} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-[680px] max-h-[88vh] flex flex-col overflow-hidden rounded-[22px] bg-white border border-[#e5e5e5] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#f0f0f0] px-6 py-4 bg-[#fafafa]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="sn-badge sn-badge-blue !text-[10px]">{gradeLabel(rosterClass.grade, ar)}</span>
                  <span className="sn-badge sn-badge-soft !text-[10px]">{ar ? rosterClass.subject_ar : rosterClass.subject_en}</span>
                </div>
                <h3 className="text-[16px] font-bold text-[#0a0a0a] mt-1">
                  {ar ? `قائمة طلاب فصل: ${rosterClass.name_ar}` : `Class Roster: ${rosterClass.name_en}`}
                </h3>
                <p className="text-[11px] text-[#737373]">
                  {ar ? `المشرف: ${rosterClass.teacher_name_ar}` : `Lead: ${rosterClass.teacher_name_ar}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEnrollClassId(rosterClass.id)}
                  className="sn-btn sn-btn-primary sn-btn-sm"
                >
                  <Plus size={14} />
                  <span>{ar ? 'إلحاق طالب مسجل' : 'Enroll Student'}</span>
                </button>
                <button type="button" onClick={() => setRosterClass(null)} className="sn-btn sn-btn-quiet sn-btn-icon">
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto p-5 space-y-4">
              {(() => {
                const clsStudents = students.filter((s) => s.classId === rosterClass.id);
                const clsAsgs = assignmentsList.filter((a) => a.classId === rosterClass.id);
                return (
                  <>
                    <div>
                      <div className="text-[12px] font-bold text-[#0a0a0a] mb-2">
                        {ar ? `الطلاب الملتحقون (${clsStudents.length})` : `Enrolled Students (${clsStudents.length})`}
                      </div>
                      {clsStudents.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-[#e5e5e5] p-6 text-center text-[12px] text-[#737373]">
                          {ar ? 'لا يوجد طلاب في هذا الفصل بعد — اضغط "إلحاق طالب مسجل" للربط المباشر.' : 'No students enrolled in this class yet.'}
                        </div>
                      ) : (
                        <div className="divide-y divide-[#f0f0f0] rounded-xl border border-[#e5e5e5]">
                          {clsStudents.map((st) => (
                            <div key={st.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-[12px]">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <Avatar name={st.quadName} />
                                <div className="min-w-0">
                                  <div className="font-semibold text-[#0a0a0a] truncate">{st.quadName}</div>
                                  <div className="text-[10px] text-[#737373] truncate">{st.email || st.schoolName}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="font-mono text-[11px] font-bold text-[#0a0a0a]">{st.mastery}%</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveStudentFromRoster(st.id, st.quadName)}
                                  className="text-red-500 hover:bg-red-50 p-1 rounded-lg"
                                  title={ar ? 'إزالة من الفصل' : 'Remove'}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-[12px] font-bold text-[#0a0a0a] mb-2">
                        {ar ? `التكليفات المرسلة للفصل (${clsAsgs.length})` : `Class Assignments (${clsAsgs.length})`}
                      </div>
                      {clsAsgs.length === 0 ? (
                        <p className="text-[11px] text-[#737373]">{ar ? 'لا توجد واجبات مرتبطة بهذا الفصل حالياً.' : 'No assignments yet.'}</p>
                      ) : (
                        <div className="space-y-1.5">
                          {clsAsgs.map((a) => (
                            <div key={a.id} className="flex items-center justify-between rounded-xl border border-[#f0f0f0] bg-[#fafafa] px-3 py-2 text-[11px]">
                              <span className="font-semibold text-[#0a0a0a]">{ar ? a.titleAr : a.titleEn}</span>
                              <span className="text-[#737373]">{ar ? a.dueDateAr : a.dueDateEn}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={ar ? 'الفصول المعتمدة' : 'Classes'} value={String(classList.length)} hint={ar ? 'في قاعدة البيانات' : 'in database'} icon={GraduationCap} />
        <StatCard label={ar ? 'الطلاب الملتحقون' : 'Enrolled'} value={String(totalStudents)} hint={ar ? 'بيانات حقيقية' : 'live data'} icon={Users} />
        <StatCard label={ar ? 'متوسط الإنجاز' : 'Avg. completion'} value={`${avgMastery}%`} hint={ar ? 'تقييم فعلي' : 'real mastery'} icon={TrendingUp} />
        <StatCard label={ar ? 'المعامل التفاعلية' : 'Active Labs'} value={String(LAB_MODULES.length)} hint={ar ? 'معامل متاحة' : 'active labs'} icon={FlaskConical} />
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
          <button type="button" onClick={() => { setEditingClass(null); setIsCreateOpen(true); }} className="sn-btn sn-btn-primary">
            <Plus size={15} strokeWidth={2} />
            {ar ? 'إضافة أول فصل الآن' : 'Add First Class'}
          </button>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {classList.map((item) => {
            const classStudents = students.filter((s) => s.classId === item.id);
            const classAsgs = assignmentsList.filter((a) => a.classId === item.id);
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
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h2 className="text-[15px] font-semibold">{ar ? item.name_ar : item.name_en}</h2>
                        <span className="sn-badge sn-badge-soft !text-[10px]">{gradeLabel(item.grade, ar)}</span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-[#737373]">
                        {classCount} {ar ? 'طالب' : 'students'} · {classAsgs.length} {ar ? 'واجب' : 'tasks'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setRosterClass(item)}
                      className="sn-btn sn-btn-quiet sn-btn-icon text-[#171717] hover:bg-[#f0f0f0]"
                      title={ar ? 'إدارة قائمة الطلاب' : 'View Roster'}
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingClass(item)}
                      className="sn-btn sn-btn-quiet sn-btn-icon text-blue-600 hover:bg-blue-50"
                      title={ar ? 'تعديل الفصل' : 'Edit Class'}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClass(item.id, item.name_ar)}
                      className="sn-btn sn-btn-quiet sn-btn-icon text-red-500 hover:bg-red-50"
                      title={ar ? 'حذف الفصل' : 'Delete Class'}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <div className="mt-5">
                  <div className="mb-1.5 flex items-center justify-between text-[10px] text-[#737373]">
                    <span>{ar ? 'متوسط الإتقان' : 'Mastery'}</span>
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
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setEnrollClassId(item.id)}
                      className="text-[11px] font-bold text-[#1d4ed8] hover:underline"
                    >
                      {ar ? '+ إلحاق طالب' : '+ Enroll'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRosterClass(item)}
                      className="sn-link !text-[12px]"
                    >
                      {ar ? 'القائمة والإدارة' : 'Manage Roster'}
                      <ArrowRight size={13} strokeWidth={1.8} className={ar ? 'rotate-180' : ''} />
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

/* ── 2. Add Student Modal (Registered Platform Lookup) ───────────────────── */
const AddStudentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAdded: (s: EnrolledStudent) => void;
  classes: DbClass[];
  registeredProfiles: DbProfile[];
  existingEnrollments: EnrolledStudent[];
  defaultClassId?: string;
  preselectedProfile?: DbProfile | null;
  ar: boolean;
}> = ({
  isOpen,
  onClose,
  onAdded,
  classes,
  registeredProfiles,
  existingEnrollments,
  defaultClassId,
  preselectedProfile,
  ar,
}) => {
  const { educator } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<DbProfile | null>(null);
  const [classId, setClassId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const platformStudents = useMemo(
    () => (registeredProfiles || []).filter((p) => (p.role || 'student') === 'student'),
    [registeredProfiles]
  );

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    if (defaultClassId) {
      setClassId(defaultClassId);
    } else if (classes.length > 0 && !classId) {
      setClassId(classes[0].id);
    }
    if (preselectedProfile) {
      setSelectedProfile(preselectedProfile);
      setSearchTerm(preselectedProfile.quad_name || preselectedProfile.display_name || preselectedProfile.email || '');
    } else {
      setSelectedProfile(null);
      setSearchTerm('');
    }
  }, [isOpen, defaultClassId, preselectedProfile, classes]);

  const searchResults = useMemo(
    () => searchRegisteredStudents(platformStudents, searchTerm).slice(0, 8),
    [platformStudents, searchTerm]
  );

  const exactMatch = useMemo(() => {
    if (selectedProfile) return selectedProfile;
    if (!searchTerm.trim()) return null;
    return findExactRegisteredStudent(platformStudents, searchTerm);
  }, [selectedProfile, platformStudents, searchTerm]);

  const resolvedProfile = selectedProfile || exactMatch;

  if (!isOpen) return null;

  const isAlreadyInClass = Boolean(
    resolvedProfile &&
      classId &&
      existingEnrollments.some(
        (e) =>
          e.classId === classId &&
          ((e.studentId && e.studentId === resolvedProfile.id) ||
            (resolvedProfile.email && e.email && e.email.toLowerCase() === resolvedProfile.email.toLowerCase()) ||
            namesMatch(e.quadName, resolvedProfile.quad_name || resolvedProfile.display_name))
      )
  );

  const handlePickProfile = (p: DbProfile) => {
    setSelectedProfile(p);
    setSearchTerm(p.quad_name || p.display_name || p.email || '');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (classes.length === 0 || !classId) {
      setError(ar ? 'يرجى إنشاء فصل دراسي أولاً من صفحة "فصولي" لإلحاق الطالب به.' : 'Please create a class first.');
      return;
    }

    if (!resolvedProfile) {
      setError(
        ar
          ? 'هذا الاسم غير مسجل بعد في قاعدة بيانات طلاب المنصة. يجب على الطالب تسجيل دخوله وإكمال ملفه في SciNexa أولاً، ثم اختياره أو كتابة اسمه كما سجّله.'
          : 'No registered SciNexa student matched this query. The student must register on the platform first.'
      );
      return;
    }

    if (isAlreadyInClass) {
      setError(ar ? 'هذا الطالب ملتحق بالفعل بنفس الفصل الدراسي المختار.' : 'This student is already enrolled in the selected class.');
      return;
    }

    const selectedCls = classes.find((c) => c.id === classId);
    const fullName = (resolvedProfile.quad_name || resolvedProfile.display_name || '').trim();

    setSaving(true);
    const res = await addStudentToClassByTeacherAsync({
      studentId: resolvedProfile.id,
      quadName: fullName,
      email: resolvedProfile.email || undefined,
      parentPhone: resolvedProfile.parent_phone || undefined,
      nationalId: resolvedProfile.national_id || undefined,
      classId,
      classNameAr: selectedCls?.name_ar,
      teacherId: selectedCls?.teacher_id || educator?.nationalId,
      teacherNameAr: selectedCls?.teacher_name_ar || educator?.name,
      schoolName: resolvedProfile.school_name || resolvedProfile.school_code || educator?.schoolName || 'المدرسة المسجلة',
      governorateId: resolvedProfile.governorate_id || 'cairo',
      administrationId: resolvedProfile.administration_id || 'default',
      gradeLevel: resolvedProfile.grade_level || selectedCls?.grade || 'sec1',
      streak: resolvedProfile.streak ?? 0,
    });
    setSaving(false);

    if (!res.ok) {
      setError(
        ar
          ? `فشل إلحاق الطالب في Supabase: ${res.error || 'خطأ في الاتصال'}`
          : `Failed to enroll student in Supabase: ${res.error || 'Connection error'}`
      );
      return;
    }

    setSearchTerm('');
    setSelectedProfile(null);
    onAdded(res.student);
    onClose();
  };

  return (
    <div role="dialog" aria-modal="true" dir={ar ? 'rtl' : 'ltr'} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-[560px] max-h-[90vh] flex flex-col overflow-hidden rounded-[22px] bg-white border border-[#e5e5e5] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#f0f0f0] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#1d4ed8]">
              <UserCheck size={18} />
            </span>
            <div>
              <h3 className="text-[16px] font-bold text-[#0a0a0a]">
                {ar ? 'إلحاق طالب مسجل بالمنصة إلى الفصل' : 'Enroll Registered Platform Student'}
              </h3>
              <p className="text-[11px] text-[#737373]">
                {ar
                  ? `ابحث باسم الطالب المسجل (${platformStudents.length} طالب بالمنصة) لسحب بياناته الحقيقية تلقائياً`
                  : `Search ${platformStudents.length} registered platform students to pull live records automatically`}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="sn-btn sn-btn-quiet sn-btn-icon">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-[12px] border border-red-200 flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Class picker */}
          <div>
            <label className="block text-[12px] font-semibold text-[#171717] mb-1">
              {ar ? 'الفصل الدراسي المستهدف *' : 'Target Class *'}
            </label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="sn-input !h-10 text-[12px]"
            >
              {classes.length === 0 ? (
                <option value="">{ar ? 'لا توجد فصول (أنشئ فصلاً أولاً)' : 'No classes available'}</option>
              ) : (
                classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {ar ? `${c.name_ar} (${gradeLabel(c.grade, true)})` : `${c.name_en} (${gradeLabel(c.grade, false)})`}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Search registered student */}
          <div>
            <label className="block text-[12px] font-semibold text-[#171717] mb-1">
              {ar ? 'اسم الطالب المسجل بالمنصة أو بريده / كوده *' : 'Registered Student Name, Email or Code *'}
            </label>
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[#a3a3a3]" />
              <input
                required
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSelectedProfile(null);
                  setError(null);
                }}
                placeholder={ar ? 'اكتب اسم الطالب كما سجله في المنصة…' : 'Type registered student name or email…'}
                className="sn-input !h-10 !ps-9 text-[13px]"
              />
            </div>
          </div>

          {/* Live matched suggestions from registered profiles */}
          {!resolvedProfile && (
            <div className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-2.5 max-h-[210px] overflow-y-auto space-y-1">
              <div className="px-2 py-1 text-[10px] font-semibold text-[#737373] uppercase tracking-wider">
                {ar
                  ? `الطلاب المسجلون المطابقون (${searchResults.length})`
                  : `Matching Platform Students (${searchResults.length})`}
              </div>
              {platformStudents.length === 0 ? (
                <div className="p-3 text-[11px] text-amber-800 bg-amber-50 rounded-lg border border-amber-200">
                  {ar
                    ? 'لا يوجد طلاب مسجلون في جدول الحسابات (profiles) حتى الآن. اطلب من الطالب تسجيل الدخول وإكمال ملفه في SciNexa أولاً.'
                    : 'No students found in profiles yet. Students must sign up on SciNexa first.'}
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-3 text-[11px] text-amber-800 bg-amber-50 rounded-lg border border-amber-200">
                  {ar
                    ? 'لم يتم العثور على طالب مسجل بهذا الاسم في المنصة — تأكد من تسجيل الطالب حسابه أولاً أو اكتب جزءاً آخر من اسمه.'
                    : 'No registered student matches your query yet.'}
                </div>
              ) : (
                searchResults.map((p) => {
                  const fullName = p.quad_name || p.display_name || p.email || 'طالب';
                  const enrolledInTarget = Boolean(
                    classId &&
                      existingEnrollments.some(
                        (e) =>
                          e.classId === classId &&
                          ((e.studentId && e.studentId === p.id) || namesMatch(e.quadName, fullName))
                      )
                  );
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handlePickProfile(p)}
                      className="w-full text-start flex items-center justify-between gap-2 rounded-lg border border-transparent bg-white px-3 py-2 hover:border-[#0a0a0a]/20 hover:bg-blue-50/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar name={fullName} />
                        <div className="min-w-0">
                          <div className="text-[12px] font-bold text-[#0a0a0a] truncate">{fullName}</div>
                          <div className="text-[10px] text-[#737373] truncate">
                            {gradeLabel(p.grade_level, ar)} · {p.school_name || p.school_code || (ar ? 'مدرسة مسجلة' : 'Registered School')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="font-mono text-[10px] text-[#525252]">{p.xp ?? 0} XP</span>
                        {enrolledInTarget && (
                          <span className="sn-badge sn-badge-green !text-[9px]">{ar ? 'ملتحق' : 'In Class'}</span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}

          {/* Auto-pulled Verified Platform Data Preview */}
          {resolvedProfile && (
            <div className={`rounded-2xl border p-4 space-y-3 ${isAlreadyInClass ? 'border-amber-300 bg-amber-50/60' : 'border-emerald-300 bg-emerald-50/50'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={18} className={isAlreadyInClass ? 'text-amber-600' : 'text-emerald-600'} />
                  <div>
                    <div className="text-[13px] font-bold text-[#0a0a0a]">
                      {resolvedProfile.quad_name || resolvedProfile.display_name}
                    </div>
                    <div className="text-[11px] text-[#525252] font-mono">
                      {resolvedProfile.email || resolvedProfile.id}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setSelectedProfile(null); setSearchTerm(''); }}
                  className="text-[11px] font-semibold text-[#525252] hover:text-[#0a0a0a] underline"
                >
                  {ar ? 'تغيير الطالب' : 'Change'}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] pt-1 border-t border-black/5">
                <div className="rounded-lg bg-white/80 px-2.5 py-1.5 border border-black/5">
                  <div className="text-[9px] text-[#737373]">{ar ? 'المرحلة الدراسية' : 'Grade'}</div>
                  <div className="font-bold text-[#0a0a0a]">{gradeLabel(resolvedProfile.grade_level, ar)}</div>
                </div>
                <div className="rounded-lg bg-white/80 px-2.5 py-1.5 border border-black/5">
                  <div className="text-[9px] text-[#737373]">{ar ? 'المدرسة المسجلة' : 'School'}</div>
                  <div className="font-bold text-[#0a0a0a] truncate">{resolvedProfile.school_name || resolvedProfile.school_code || '—'}</div>
                </div>
                <div className="rounded-lg bg-white/80 px-2.5 py-1.5 border border-black/5">
                  <div className="text-[9px] text-[#737373]">{ar ? 'هاتف ولي الأمر' : 'Parent Phone'}</div>
                  <div className="font-mono font-bold text-[#0a0a0a]">{resolvedProfile.parent_phone || '—'}</div>
                </div>
                <div className="rounded-lg bg-white/80 px-2.5 py-1.5 border border-black/5">
                  <div className="text-[9px] text-[#737373]">{ar ? 'نقاط المنصة (XP)' : 'Platform XP'}</div>
                  <div className="font-mono font-bold text-[#1d4ed8]">{resolvedProfile.xp ?? 0} XP</div>
                </div>
                <div className="rounded-lg bg-white/80 px-2.5 py-1.5 border border-black/5">
                  <div className="text-[9px] text-[#737373]">{ar ? 'أيام الاستمرارية' : 'Streak'}</div>
                  <div className="font-mono font-bold text-amber-600">{resolvedProfile.streak ?? 0} 🔥</div>
                </div>
                <div className="rounded-lg bg-white/80 px-2.5 py-1.5 border border-black/5">
                  <div className="text-[9px] text-[#737373]">{ar ? 'نجوم الإتقان' : 'Stars'}</div>
                  <div className="font-mono font-bold text-emerald-700">{resolvedProfile.stars ?? 0} ★</div>
                </div>
              </div>

              {isAlreadyInClass && (
                <div className="text-[11px] font-semibold text-amber-800">
                  {ar ? '⚠ هذا الطالب ملتحق بالفعل بهذا الفصل. اختر فصلاً آخر أو طالباً آخر.' : 'Already enrolled in this class.'}
                </div>
              )}
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#f0f0f0]">
            <button type="button" onClick={onClose} className="sn-btn sn-btn-outline sn-btn-sm">{ar ? 'إلغاء' : 'Cancel'}</button>
            <button
              type="submit"
              disabled={saving || !resolvedProfile || isAlreadyInClass || classes.length === 0}
              className="sn-btn sn-btn-primary sn-btn-sm disabled:opacity-50"
            >
              {saving ? (ar ? 'جارٍ الربط والحفظ…' : 'Linking…') : (ar ? 'تأكيد إلحاق الطالب بالفصل' : 'Enroll Verified Student')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── 2B. Student Detail & Management Modal ────────────────────────────────── */
const StudentDetailModal: React.FC<{
  student: EnrolledStudent | null;
  profile: DbProfile | null;
  classes: DbClass[];
  submissions: StudentSubmission[];
  onClose: () => void;
  onUpdated: (id: string, patch: Partial<EnrolledStudent>) => void;
  ar: boolean;
}> = ({ student, profile, classes, submissions, onClose, onUpdated, ar }) => {
  const [targetClassId, setTargetClassId] = useState('');
  const [masteryVal, setMasteryVal] = useState(0);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    if (!student) return;
    setTargetClassId(student.classId);
    setMasteryVal(student.mastery ?? 0);
    setNote(null);
  }, [student]);

  if (!student) return null;

  const studentSubs = submissions.filter((sub) => namesMatch(sub.studentQuadName, student.quadName));
  const cleanPhone = (student.parentPhone || profile?.parent_phone || '').replace(/\D/g, '');
  const gov = EGYPT_GOVERNORATES.find((g) => g.id === (student.governorateId || profile?.governorate_id));

  const handleSaveChanges = async () => {
    setSaving(true);
    setNote(null);
    const clampedMastery = Math.max(0, Math.min(100, Math.round(masteryVal)));
    if (clampedMastery !== student.mastery) {
      await dbUpdateStudentMastery(student.id, clampedMastery);
      onUpdated(student.id, { mastery: clampedMastery });
    }
    if (targetClassId && targetClassId !== student.classId) {
      const targetCls = classes.find((c) => c.id === targetClassId);
      if (targetCls) {
        await transferStudentClassAndSync(student.id, targetCls);
        onUpdated(student.id, {
          classId: targetCls.id,
          classNameAr: targetCls.name_ar,
          teacherId: targetCls.teacher_id,
          teacherNameAr: targetCls.teacher_name_ar,
        });
      }
    }
    setSaving(false);
    setNote(ar ? 'تم حفظ التعديلات ومزامنتها مع Supabase بنجاح.' : 'Saved and synced with Supabase.');
  };

  return (
    <div role="dialog" aria-modal="true" dir={ar ? 'rtl' : 'ltr'} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-[660px] max-h-[90vh] flex flex-col overflow-hidden rounded-[22px] bg-white border border-[#e5e5e5] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#f0f0f0] px-6 py-4 bg-[#fafafa]">
          <div className="flex items-center gap-3">
            <Avatar name={student.quadName} tone="bg-[#0a0a0a] text-white" />
            <div>
              <h3 className="text-[16px] font-bold text-[#0a0a0a]">{student.quadName}</h3>
              <p className="text-[11px] text-[#737373] font-mono">
                {student.email || profile?.email || student.schoolName}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="sn-btn sn-btn-quiet sn-btn-icon">
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-5">
          {note && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[12px] font-semibold">
              ✓ {note}
            </div>
          )}

          {/* Platform Live Telemetry */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="rounded-xl border border-[#e5e5e5] p-3">
              <div className="text-[10px] text-[#737373]">{ar ? 'نقاط المنصة' : 'Platform XP'}</div>
              <div className="mt-1 text-[17px] font-bold font-mono text-[#1d4ed8]">{profile?.xp ?? 0} XP</div>
            </div>
            <div className="rounded-xl border border-[#e5e5e5] p-3">
              <div className="text-[10px] text-[#737373]">{ar ? 'الاستمرارية' : 'Streak'}</div>
              <div className="mt-1 text-[17px] font-bold font-mono text-amber-600">{profile?.streak ?? student.streak ?? 0} 🔥</div>
            </div>
            <div className="rounded-xl border border-[#e5e5e5] p-3">
              <div className="text-[10px] text-[#737373]">{ar ? 'النجوم' : 'Stars'}</div>
              <div className="mt-1 text-[17px] font-bold font-mono text-emerald-700">{profile?.stars ?? 0} ★</div>
            </div>
            <div className="rounded-xl border border-[#e5e5e5] p-3">
              <div className="text-[10px] text-[#737373]">{ar ? 'الإتقان بالفصل' : 'Mastery'}</div>
              <div className="mt-1 text-[17px] font-bold font-mono text-[#0a0a0a]">{student.mastery}%</div>
            </div>
          </div>

          {/* Academic & Contact Info */}
          <div className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
            <div><span className="text-[#737373]">{ar ? 'المرحلة:' : 'Grade:'} </span><span className="font-semibold">{gradeLabel(student.gradeLevel || profile?.grade_level, ar)}</span></div>
            <div><span className="text-[#737373]">{ar ? 'المدرسة:' : 'School:'} </span><span className="font-semibold">{student.schoolName}</span></div>
            <div><span className="text-[#737373]">{ar ? 'المحافظة:' : 'Governorate:'} </span><span className="font-semibold">{gov ? (ar ? gov.nameAr : gov.nameEn) : student.governorateId}</span></div>
            <div className="flex items-center gap-2">
              <span className="text-[#737373]">{ar ? 'ولي الأمر:' : 'Parent:'} </span>
              {cleanPhone ? (
                <a
                  href={`https://wa.me/20${cleanPhone.replace(/^0/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono font-bold text-emerald-700 hover:underline"
                >
                  <MessageSquare size={12} />
                  <span>{cleanPhone}</span>
                </a>
              ) : (
                <span className="text-[#a3a3a3]">—</span>
              )}
            </div>
          </div>

          {/* Class Transfer & Mastery Adjustment */}
          <div className="rounded-xl border border-[#e5e5e5] p-4 space-y-3">
            <div className="flex items-center gap-2 text-[12px] font-bold text-[#0a0a0a]">
              <ArrowRightLeft size={14} />
              <span>{ar ? 'تعديل الفصل أو نسبة الإتقان' : 'Class Transfer & Mastery Control'}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#525252] mb-1">{ar ? 'الفصل الدراسي' : 'Enrolled Class'}</label>
                <select value={targetClassId} onChange={(e) => setTargetClassId(e.target.value)} className="sn-input !h-9 text-[12px]">
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{ar ? c.name_ar : c.name_en}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#525252] mb-1">{ar ? `تقييم الإتقان (${masteryVal}%)` : `Mastery (${masteryVal}%)`}</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={masteryVal}
                  onChange={(e) => setMasteryVal(Number(e.target.value))}
                  className="w-full accent-[#0a0a0a] mt-2"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={() => void handleSaveChanges()} disabled={saving} className="sn-btn sn-btn-primary sn-btn-sm">
                {saving ? (ar ? 'جارٍ الحفظ…' : 'Saving…') : (ar ? 'حفظ التغييرات' : 'Save Updates')}
              </button>
            </div>
          </div>

          {/* Submissions History */}
          <div>
            <div className="text-[12px] font-bold text-[#0a0a0a] mb-2">
              {ar ? `سجل تسليمات واختبارات الطالب (${studentSubs.length})` : `Student Submissions (${studentSubs.length})`}
            </div>
            {studentSubs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#e5e5e5] p-4 text-center text-[11px] text-[#737373]">
                {ar ? 'لم يسلم الطالب أي واجبات أو اختبارات بعد.' : 'No submissions recorded yet.'}
              </div>
            ) : (
              <div className="divide-y divide-[#f0f0f0] rounded-xl border border-[#e5e5e5]">
                {studentSubs.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between gap-2 px-3.5 py-2.5 text-[11px]">
                    <div>
                      <div className="font-semibold text-[#0a0a0a]">{sub.assignmentId}</div>
                      <div className="text-[10px] text-[#737373]">{sub.submittedAt} {sub.teacherFeedback ? `· ${sub.teacherFeedback}` : ''}</div>
                    </div>
                    <span className={`sn-badge !text-[10px] ${sub.status === 'graded' ? 'sn-badge-green' : 'sn-badge-amber'}`}>
                      {sub.status === 'graded' ? `${sub.score ?? 0}%` : (ar ? 'بانتظار التقييم' : 'Pending')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Students Page ────────────────────────────────────────────────────────── */
export const StudentsPage: React.FC = () => {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const [activeTab, setActiveTab] = useState<'enrolled' | 'platform'>('enrolled');
  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [onlyReview, setOnlyReview] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [preselectedProfile, setPreselectedProfile] = useState<DbProfile | null>(null);
  const [inspectStudent, setInspectStudent] = useState<EnrolledStudent | null>(null);
  const [customList, setCustomList] = useState<EnrolledStudent[]>([]);
  const [registeredProfiles, setRegisteredProfiles] = useState<DbProfile[]>([]);
  const [classes, setClasses] = useState<DbClass[]>([]);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [fetchedStudents, fetchedClasses, fetchedProfiles, fetchedSubs] = await Promise.all([
      fetchAndSyncEnrollment(),
      dbFetchClasses(),
      dbFetchAllProfiles(),
      fetchAndSyncSubmissions(),
    ]);
    setCustomList(fetchedStudents || []);
    setClasses(fetchedClasses || []);
    setRegisteredProfiles(fetchedProfiles || []);
    setSubmissions(fetchedSubs || []);
    setLoading(false);
  };

  useEffect(() => {
    void loadData();
  }, []);

  const platformStudents = useMemo(
    () => (registeredProfiles || []).filter((p) => (p.role || 'student') === 'student'),
    [registeredProfiles]
  );

  const findProfileForStudent = (s: EnrolledStudent): DbProfile | null => {
    return (
      platformStudents.find(
        (p) =>
          (s.studentId && p.id === s.studentId) ||
          (s.email && p.email && p.email.toLowerCase() === s.email.toLowerCase()) ||
          namesMatch(p.quad_name || p.display_name, s.quadName)
      ) || null
    );
  };

  const handleDeleteStudent = (id: string, name: string) => {
    if (!window.confirm(ar ? `هل أنت متأكد من إزالة الطالب "${name}" من الفصل؟` : `Remove student "${name}" from class?`)) {
      return;
    }
    deleteStudentEnrollment(id);
    setCustomList((prev) => prev.filter((s) => s.id !== id));
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (customList || [])
      .map((s) => {
        const prof = findProfileForStudent(s);
        return {
          raw: s,
          profile: prof,
          id: s.id,
          nameEn: s.quadName || 'Student',
          nameAr: s.quadName || 'طالب مسجل',
          email: s.email || prof?.email || '',
          code: s.nationalId ? `ID: ${s.nationalId.slice(-4)}` : (s.studentId || s.id || '2026').slice(-6).toUpperCase(),
          classId: s.classId,
          classEn: s.classNameAr || 'General',
          classAr: s.classNameAr || 'فصل عام',
          gradeLabelText: gradeLabel(s.gradeLevel || prof?.grade_level, ar),
          parentPhone: s.parentPhone || prof?.parent_phone || '',
          mastery: s.mastery ?? 0,
          xp: prof?.xp ?? 0,
          streak: prof?.streak ?? s.streak ?? 0,
          stars: prof?.stars ?? 0,
          lastEn: s.lastActiveDate || 'Today',
          lastAr: s.lastActiveDate || 'اليوم',
          status: (s.mastery ?? 0) >= 50 ? 'active' : 'review',
        };
      })
      .filter((student) => {
        if (classFilter !== 'all' && student.classId !== classFilter) return false;
        const matches =
          !q ||
          student.nameEn.toLowerCase().includes(q) ||
          student.nameAr.includes(q) ||
          student.email.toLowerCase().includes(q) ||
          student.code.toLowerCase().includes(q) ||
          student.classEn.toLowerCase().includes(q);
        return matches && (!onlyReview || student.status !== 'active');
      });
  }, [query, classFilter, onlyReview, customList, platformStudents, ar]);

  const filteredPlatformStudents = useMemo(() => {
    return searchRegisteredStudents(platformStudents, query);
  }, [platformStudents, query]);

  const handleStudentAdded = (newS: EnrolledStudent) => {
    setCustomList((prev) => [newS, ...prev.filter((s) => s.id !== newS.id)]);
    setSuccessMsg(
      ar
        ? `تم إلحاق الطالب المسجل "${newS.quadName}" بفصل ${newS.classNameAr} وجلب بياناته تلقائياً!`
        : `Registered student ${newS.quadName} enrolled in ${newS.classNameAr}!`
    );
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const handleExportCsv = () => {
    const header = ['Student Name', 'Email', 'Class', 'Grade', 'Parent Phone', 'Mastery %', 'XP', 'Streak', 'Last Active'];
    const csvRows = [
      header.join(','),
      ...rows.map((r) =>
        [
          `"${(r.nameAr || '').replace(/"/g, '""')}"`,
          `"${r.email}"`,
          `"${(r.classAr || '').replace(/"/g, '""')}"`,
          `"${r.gradeLabelText}"`,
          `"${r.parentPhone}"`,
          r.mastery,
          r.xp,
          r.streak,
          `"${r.lastAr}"`,
        ].join(',')
      ),
    ];
    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scinexa-students-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader
        eyebrow={ar ? 'إدارة الطلاب والسجلات' : 'Student Registry & Management'}
        title={ar ? 'الطلاب المسجلون وإلحاق الفصول' : 'Students & Class Enrollment'}
        subtitle={
          ar
            ? 'ابحث عن أي طالب مسجل بالمنصة لإلحاقه بفصلك تلقائياً، وتابع نقاطه وتسليماته وتواصل مع ولي أمره.'
            : 'Enroll registered SciNexa students by name, inspect telemetry, and message parents.'
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={handleExportCsv} disabled={rows.length === 0} className="sn-btn sn-btn-outline sn-btn-sm disabled:opacity-40">
              <Download size={14} />
              <span>{ar ? 'تصدير CSV' : 'Export CSV'}</span>
            </button>
            <button
              type="button"
              onClick={() => { setPreselectedProfile(null); setIsAddOpen(true); }}
              className="sn-btn sn-btn-primary"
            >
              <Plus size={15} strokeWidth={2} />
              {ar ? 'إلحاق طالب مسجل' : 'Enroll Registered Student'}
            </button>
          </div>
        }
      />

      {/* Tabs: Class Roster vs Registered Platform Directory */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('enrolled')}
          className={`sn-btn sn-btn-sm ${activeTab === 'enrolled' ? 'sn-btn-primary' : 'sn-btn-outline'}`}
        >
          <Users size={13} />
          <span>{ar ? `طلاب الفصول الملحقون (${customList.length})` : `Class Roster (${customList.length})`}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('platform')}
          className={`sn-btn sn-btn-sm ${activeTab === 'platform' ? 'sn-btn-primary' : 'sn-btn-outline'}`}
        >
          <UserCheck size={13} />
          <span>{ar ? `دليل طلاب المنصة المسجلين (${platformStudents.length})` : `Platform Directory (${platformStudents.length})`}</span>
        </button>
      </div>

      {/* Filters bar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative w-full sm:w-[280px]">
            <Search size={14} strokeWidth={1.8} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[#a3a3a3]" />
            <input
              className="sn-input !h-9 !ps-9 !text-[12px]"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={ar ? 'ابحث بالاسم أو البريد أو الكود…' : 'Search name, email, code…'}
              aria-label={ar ? 'بحث الطلاب' : 'Search students'}
            />
          </div>
          {activeTab === 'enrolled' && classes.length > 0 && (
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="sn-input !h-9 !w-auto text-[12px]"
            >
              <option value="all">{ar ? 'كل الفصول الدراسية' : 'All Classes'}</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{ar ? c.name_ar : c.name_en}</option>
              ))}
            </select>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'enrolled' && (
            <button
              type="button"
              onClick={() => setOnlyReview((v) => !v)}
              className={`sn-btn sn-btn-sm ${onlyReview ? 'sn-btn-primary' : 'sn-btn-outline'}`}
            >
              <Activity size={13} strokeWidth={1.8} />
              {ar ? 'يحتاجون متابعة' : 'Needs review'}
            </button>
          )}
          <button type="button" onClick={() => void loadData()} className="sn-btn sn-btn-outline sn-btn-sm" title={ar ? 'تحديث' : 'Refresh'}>
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-[13px] flex items-center justify-between">
          <span>✓ {successMsg}</span>
          <button type="button" onClick={() => setSuccessMsg(null)} className="text-emerald-700">✕</button>
        </div>
      )}

      <AddStudentModal
        isOpen={isAddOpen}
        onClose={() => { setIsAddOpen(false); setPreselectedProfile(null); }}
        onAdded={handleStudentAdded}
        classes={classes}
        registeredProfiles={registeredProfiles}
        existingEnrollments={customList}
        preselectedProfile={preselectedProfile}
        ar={ar}
      />

      <StudentDetailModal
        student={inspectStudent}
        profile={inspectStudent ? findProfileForStudent(inspectStudent) : null}
        classes={classes}
        submissions={submissions}
        onClose={() => setInspectStudent(null)}
        onUpdated={(id, patch) => {
          setCustomList((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
          setInspectStudent((prev) => (prev && prev.id === id ? { ...prev, ...patch } : prev));
        }}
        ar={ar}
      />

      {loading ? (
        <div className="py-12 text-center text-[#737373] text-[13px]">
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[#0a0a0a] border-t-transparent mb-2" />
          <p>{ar ? 'جارٍ تحميل بيانات الطلاب من Supabase…' : 'Loading student data from Supabase…'}</p>
        </div>
      ) : activeTab === 'platform' ? (
        filteredPlatformStudents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#e5e5e5] p-10 text-center bg-[#fafafa]">
            <UserCheck size={36} className="mx-auto text-[#a3a3a3] mb-3" />
            <h3 className="text-[15px] font-bold text-[#0a0a0a] mb-1">
              {ar ? 'لا يوجد طلاب مسجلون في دليل المنصة مطابِقون للبحث' : 'No matching registered platform students'}
            </h3>
            <p className="text-[12px] text-[#737373] max-w-[45ch] mx-auto">
              {ar ? 'أي طالب يسجل حسابه في SciNexa ويكمل ملفه الدراسي سيظهر هنا تلقائياً ليتمكن المعلم من إلحاقه.' : 'Registered students appear here automatically.'}
            </p>
          </div>
        ) : (
          <SectionCard
            title={ar ? 'دليل طلاب المنصة الحقيقيين (profiles)' : 'Registered Platform Student Directory'}
            action={<span className="sn-badge sn-badge-blue">{filteredPlatformStudents.length} {ar ? 'طالب مسجل' : 'registered'}</span>}
            bodyClassName="p-0"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="border-b border-[#f0f0f0] text-[10px] uppercase tracking-[0.08em] text-[#a3a3a3]">
                    <th className="px-5 py-2.5 text-start font-medium">{ar ? 'الطالب المسجل' : 'Registered Student'}</th>
                    <th className="px-3 py-2.5 text-start font-medium">{ar ? 'المرحلة والمدرسة' : 'Grade & School'}</th>
                    <th className="px-3 py-2.5 text-start font-medium">{ar ? 'النشاط (XP / نجوم)' : 'XP / Stars'}</th>
                    <th className="px-3 py-2.5 text-start font-medium">{ar ? 'حالة الإلحاق بالفصول' : 'Class Status'}</th>
                    <th className="px-5 py-2.5 text-end font-medium">{ar ? 'إجراء' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlatformStudents.map((prof) => {
                    const name = prof.quad_name || prof.display_name || prof.email || 'طالب';
                    const matchedEnrollments = customList.filter(
                      (e) =>
                        (e.studentId && e.studentId === prof.id) ||
                        (prof.email && e.email && e.email.toLowerCase() === prof.email.toLowerCase()) ||
                        namesMatch(e.quadName, name)
                    );
                    return (
                      <tr key={prof.id} className="border-b border-[#f7f7f7] text-[12px] last:border-0 hover:bg-[#fafafa]">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={name} />
                            <div>
                              <div className="font-semibold text-[#0a0a0a]">{name}</div>
                              <div className="font-mono text-[10px] text-[#737373]">{prof.email || prof.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="font-medium text-[#171717]">{gradeLabel(prof.grade_level, ar)}</div>
                          <div className="text-[10px] text-[#737373]">{prof.school_name || prof.school_code || '—'}</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2 font-mono text-[11px]">
                            <span className="font-bold text-[#1d4ed8]">{prof.xp ?? 0} XP</span>
                            <span className="inline-flex items-center gap-0.5 text-amber-600"><Flame size={11} />{prof.streak ?? 0}</span>
                            <span className="inline-flex items-center gap-0.5 text-emerald-700"><Star size={11} />{prof.stars ?? 0}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          {matchedEnrollments.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {matchedEnrollments.map((m) => (
                                <span key={m.id} className="sn-badge sn-badge-green !text-[10px]">{m.classNameAr}</span>
                              ))}
                            </div>
                          ) : (
                            <span className="sn-badge sn-badge-amber !text-[10px]">
                              {ar ? 'غير ملتحق بفصل بعد' : 'Not enrolled yet'}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-end">
                          <button
                            type="button"
                            onClick={() => { setPreselectedProfile(prof); setIsAddOpen(true); }}
                            className="sn-btn sn-btn-primary sn-btn-sm !h-8 !text-[11px]"
                          >
                            <Plus size={13} />
                            <span>{ar ? 'إلحاق بفصل' : 'Enroll'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e5e5e5] p-10 text-center bg-[#fafafa]">
          <Users size={36} className="mx-auto text-[#a3a3a3] mb-3" />
          <h3 className="text-[15px] font-bold text-[#0a0a0a] mb-1">
            {ar ? 'لا يوجد طلاب ملحقون بالفصول حالياً' : 'No enrolled students found'}
          </h3>
          <p className="text-[12px] text-[#737373] max-w-[45ch] mx-auto mb-4">
            {ar
              ? 'استخدم زر "إلحاق طالب مسجل" للبحث باسم الطالب المسجل بالمنصة وإضافته لفصلك ببياناته الحقيقية فوراً.'
              : 'Click "Enroll Registered Student" to attach existing SciNexa students to your class.'}
          </p>
          <button type="button" onClick={() => { setPreselectedProfile(null); setIsAddOpen(true); }} className="sn-btn sn-btn-primary">
            <Plus size={15} strokeWidth={2} />
            {ar ? 'إلحاق طالب مسجل بالمنصة' : 'Enroll Registered Student'}
          </button>
        </div>
      ) : (
        <SectionCard title={ar ? 'الطلاب الملتحقون بالفصول' : 'Enrolled Class Roster'} action={<span className="sn-badge sn-badge-outline">{rows.length} {ar ? 'طالب' : 'students'}</span>} bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr className="border-b border-[#f0f0f0] text-[10px] uppercase tracking-[0.08em] text-[#a3a3a3]">
                  <th className="px-5 py-2.5 text-start font-medium">{ar ? 'الطالب' : 'Student'}</th>
                  <th className="px-3 py-2.5 text-start font-medium">{ar ? 'الفصل والمرحلة' : 'Class & Grade'}</th>
                  <th className="px-3 py-2.5 text-start font-medium">{ar ? 'نقاط المنصة' : 'Telemetry'}</th>
                  <th className="px-3 py-2.5 text-start font-medium">{ar ? 'ولي الأمر وواتساب' : 'Parent & WhatsApp'}</th>
                  <th className="px-3 py-2.5 text-start font-medium">{ar ? 'الإتقان' : 'Mastery'}</th>
                  <th className="px-5 py-2.5 text-start font-medium">{ar ? 'الحالة' : 'Status'}</th>
                  <th className="px-5 py-2.5 text-end font-medium">{ar ? 'إدارة' : 'Manage'}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((student) => (
                  <tr key={student.id} className="border-b border-[#f7f7f7] text-[12px] last:border-0 hover:bg-[#fafafa]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={student.nameEn} />
                        <div>
                          <div className="font-medium text-[#0a0a0a]">{ar ? student.nameAr : student.nameEn}</div>
                          <div className="font-mono text-[10px] text-[#737373]">{student.email || student.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-[#171717]">{ar ? student.classAr : student.classEn}</div>
                      <div className="text-[10px] text-[#737373]">{student.gradeLabelText}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="font-bold text-[#1d4ed8]">{student.xp} XP</span>
                        <span className="text-amber-600">{student.streak}🔥</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      {student.parentPhone ? (
                        <a
                          href={`https://wa.me/20${student.parentPhone.replace(/\D/g, '').replace(/^0/, '')}?text=${encodeURIComponent(
                            `السلام عليكم ورحمة الله، تحية طيبة لولي أمر الطالب (${student.nameAr}) المحترم.\nنحيطكم علماً بتقرير أدائه وتفاعله في منصة SciNexa للعلوم، حيث بلغت نسبة إتقانه المعملي ${student.mastery}%. نسعد بتواصلكم ومتابعتكم المستمرة.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-bold transition-all shadow-xs"
                          title={ar ? 'مراسلة عبر واتساب' : 'Chat via WhatsApp'}
                        >
                          <MessageSquare size={12} className="text-emerald-600" />
                          <span className="font-mono">{student.parentPhone}</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-[#a3a3a3] italic">{ar ? 'لم يُسجل' : 'None'}</span>
                      )}
                    </td>
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
                    <td className="px-5 py-3">
                      <span className={`sn-badge !text-[10px] ${student.status === 'active' ? 'sn-badge-green' : 'sn-badge-amber'}`}>
                        {student.status === 'active' ? (ar ? 'نشط' : 'Active') : (ar ? 'مراجعة' : 'Review')}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-end">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setInspectStudent(student.raw)}
                          className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                          title={ar ? 'إدارة وملف الطالب' : 'Manage Student'}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStudent(student.id, student.nameAr)}
                          className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          title={ar ? 'إزالة من الفصل' : 'Remove from Class'}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
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
  students: EnrolledStudent[];
  ar: boolean;
}> = ({ isOpen, onClose, onAdded, classes, students, ar }) => {
  const { educator } = useSession();
  const [titleAr, setTitleAr] = useState('');
  const [classId, setClassId] = useState('');
  const [targetType, setTargetType] = useState<'class' | 'student'>('class');
  const [targetStudentQuadName, setTargetStudentQuadName] = useState('');
  const [linkedLab, setLinkedLab] = useState('chemistry');
  const [dueDateAr, setDueDateAr] = useState('الخميس القادم · ١٠:٠٠ م');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (classes.length > 0 && !classId) {
      setClassId(classes[0].id);
    }
  }, [classes, classId]);

  const classStudents = useMemo(() => {
    const inClass = students.filter((s) => s.classId === classId);
    return inClass.length > 0 ? inClass : students;
  }, [students, classId]);

  useEffect(() => {
    if (targetType === 'student' && classStudents.length > 0 && !targetStudentQuadName) {
      setTargetStudentQuadName(classStudents[0].quadName);
    }
  }, [targetType, classStudents, targetStudentQuadName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!titleAr.trim()) {
      setError(ar ? 'يرجى إدخال عنوان الواجب أو التكليف.' : 'Please enter assignment title.');
      return;
    }
    if (classes.length === 0 || !classId) {
      setError(ar ? 'يرجى إنشاء فصل دراسي أولاً لإرسال الواجب إليه.' : 'Please create a class first.');
      return;
    }
    if (targetType === 'student' && !targetStudentQuadName.trim()) {
      setError(ar ? 'يرجى اختيار الطالب المعني أو كتابة اسمه.' : 'Please select or enter the target student.');
      return;
    }
    const cls = classes.find((c) => c.id === classId);
    const newAssignment: AssignmentItem = {
      id: `asg-${Date.now()}`,
      titleAr: titleAr.trim(),
      titleEn: titleAr.trim(),
      classId: cls?.id || classId,
      classNameAr: cls?.name_ar || 'فصل معتمد',
      targetStudentQuadName: targetType === 'student' ? targetStudentQuadName.trim() : null,
      teacherId: cls?.teacher_id || (educator?.nationalId ? `edu_${educator.nationalId.slice(-6)}` : 't-admin'),
      teacherNameAr: cls?.teacher_name_ar || educator?.name || 'المعلم المشرف',
      linkedLab,
      dueDateAr: dueDateAr.trim() || 'الخميس القادم',
      dueDateEn: dueDateAr.trim() || 'Next Thursday',
      descriptionAr: descriptionAr.trim() || 'قم بفتح المعمل 3D وإجراء التجربة المطلوبة وتسجيل النتائج.',
      descriptionEn: descriptionAr.trim() || 'Open the 3D lab, conduct the experiment, and report findings.',
      totalPoints: 100,
      assignedAt: new Date().toISOString().slice(0, 10),
    };
    setSaving(true);
    const res = await addAssignment(newAssignment);
    setSaving(false);
    if (!res.ok) {
      setError(ar ? `فشل حفظ الواجب في Supabase: ${res.error || 'خطأ في الاتصال'}` : `Failed to save assignment: ${res.error}`);
      return;
    }
    setTitleAr('');
    setDescriptionAr('');
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
                    <option key={c.id} value={c.id}>{ar ? c.name_ar : c.name_en}</option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#171717] mb-1">
                {ar ? 'المعمل التفاعلي المرتبط *' : 'Linked Lab *'}
              </label>
              <select
                value={linkedLab}
                onChange={(e) => setLinkedLab(e.target.value)}
                className="h-9 w-full rounded-xl border border-[#e5e5e5] px-2 text-[12px] text-[#0a0a0a] outline-none focus:border-[#0a0a0a] bg-white"
              >
                {LAB_MODULES.map((lab) => (
                  <option key={lab.id} value={lab.id}>{ar ? lab.nameAr : lab.nameEn}</option>
                ))}
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
                onClick={() => {
                  setTargetType('student');
                  if (classStudents.length > 0 && !targetStudentQuadName) {
                    setTargetStudentQuadName(classStudents[0].quadName);
                  }
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl border text-[11px] font-semibold transition-all ${targetType === 'student' ? 'border-[#0a0a0a] bg-[#0a0a0a] text-white' : 'border-[#e5e5e5] bg-white text-[#737373] hover:border-[#a3a3a3]'}`}
              >
                <UserCog size={13} />
                <span>{ar ? 'طالب معين من المسجلين' : 'Specific Student'}</span>
              </button>
            </div>

            {targetType === 'student' && (
              <div className="pt-1 space-y-1.5">
                {classStudents.length > 0 ? (
                  <select
                    value={targetStudentQuadName}
                    onChange={(e) => setTargetStudentQuadName(e.target.value)}
                    className="h-9 w-full rounded-xl border border-[#e5e5e5] px-2.5 text-[12px] text-[#0a0a0a] outline-none focus:border-[#0a0a0a] bg-white"
                  >
                    {classStudents.map((st) => (
                      <option key={st.id} value={st.quadName}>
                        {st.quadName} ({st.classNameAr})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={targetStudentQuadName}
                    onChange={(e) => setTargetStudentQuadName(e.target.value)}
                    placeholder={ar ? 'اكتب الاسم الكامل للطالب المعني…' : 'Student full name…'}
                    className="h-9 w-full rounded-xl border border-[#e5e5e5] px-3 text-[12px] text-[#0a0a0a] outline-none focus:border-[#0a0a0a]"
                    required
                  />
                )}
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
            <button type="submit" disabled={saving} className="sn-btn sn-btn-primary sn-btn-sm">
              {saving ? (ar ? 'جارٍ الحفظ…' : 'Saving…') : (ar ? 'حفظ وإرسال للطلاب' : 'Save & Assign')}
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
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([]);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(() => getSubmissions());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [expandedAsgId, setExpandedAsgId] = useState<string | null>(null);
  const [classFilter, setClassFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyPendingReview, setOnlyPendingReview] = useState(false);
  const [gradingInputs, setGradingInputs] = useState<Record<string, { score: string; feedback: string }>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [fetchedAsg, fetchedClasses, fetchedStudents, fetchedSubs] = await Promise.all([
      fetchAndSyncAssignments(),
      dbFetchClasses(),
      fetchAndSyncEnrollment(),
      fetchAndSyncSubmissions(),
    ]);
    setAssignmentsList(fetchedAsg || []);
    setClasses(fetchedClasses || []);
    setEnrolledStudents(fetchedStudents || []);
    setSubmissions(fetchedSubs || []);
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
    setSuccessMsg(ar ? `تم إنشاء الواجب "${newAsg.titleAr}" وحفظه في Supabase بنجاح!` : 'Assignment created successfully!');
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const handleGradeSubmission = async (sub: StudentSubmission) => {
    const input = gradingInputs[sub.id];
    const scoreVal = Number(input?.score ?? sub.score ?? 100);
    const feedbackVal = input?.feedback ?? sub.teacherFeedback ?? (ar ? 'مكتمل ومعتمد' : 'Verified');
    const res = await gradeSubmissionAndSync(sub, scoreVal, feedbackVal);
    setSubmissions((prev) => prev.map((s) => (s.id === sub.id ? res.updated : s)));
    setSuccessMsg(
      ar
        ? `تم رصد درجة ${res.updated.score}% للطالب ${sub.studentQuadName} وتحديث إتقانه!`
        : `Recorded ${res.updated.score}% for ${sub.studentQuadName}!`
    );
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const gradedSubs = submissions.filter((s) => typeof s.score === 'number');
  const avgScore = gradedSubs.length > 0
    ? Math.round(gradedSubs.reduce((a, b) => a + (b.score || 0), 0) / gradedSubs.length)
    : null;

  const filteredAssignments = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return assignmentsList.filter((item) => {
      if (classFilter !== 'all' && item.classId !== classFilter) return false;
      if (onlyPendingReview) {
        const hasPending = submissions.some((s) => s.assignmentId === item.id && s.status === 'submitted');
        if (!hasPending) return false;
      }
      if (!q) return true;
      return (
        item.titleAr.toLowerCase().includes(q) ||
        item.titleEn.toLowerCase().includes(q) ||
        item.classNameAr.toLowerCase().includes(q) ||
        (item.targetStudentQuadName || '').toLowerCase().includes(q)
      );
    });
  }, [assignmentsList, classFilter, onlyPendingReview, searchTerm, submissions]);

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
        students={enrolledStudents}
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
        <StatCard label={ar ? 'متوسط الدرجة' : 'Avg. score'} value={avgScore !== null ? `${avgScore}%` : '—'} hint={ar ? 'تقييم فعلي' : 'real average'} icon={TrendingUp} />
      </div>

      {/* Filters bar */}
      {assignmentsList.length > 0 && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="relative w-full sm:w-[260px]">
              <Search size={14} strokeWidth={1.8} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[#a3a3a3]" />
              <input
                className="sn-input !h-9 !ps-9 !text-[12px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={ar ? 'ابحث في الواجبات أو الطلاب…' : 'Search assignments…'}
              />
            </div>
            {classes.length > 0 && (
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="sn-input !h-9 !w-auto text-[12px]"
              >
                <option value="all">{ar ? 'كل الفصول' : 'All Classes'}</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{ar ? c.name_ar : c.name_en}</option>
                ))}
              </select>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOnlyPendingReview((v) => !v)}
              className={`sn-btn sn-btn-sm ${onlyPendingReview ? 'sn-btn-primary' : 'sn-btn-outline'}`}
            >
              <Clock size={13} />
              <span>{ar ? 'بانتظار التصحيح' : 'Pending review'}</span>
            </button>
            <button type="button" onClick={() => void loadData()} className="sn-btn sn-btn-outline sn-btn-sm" title={ar ? 'تحديث' : 'Refresh'}>
              <RefreshCw size={13} />
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-[#737373] text-[13px]">
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[#0a0a0a] border-t-transparent mb-2" />
          <p>{ar ? 'جارٍ تحميل الواجبات من Supabase…' : 'Loading assignments from Supabase…'}</p>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e5e5e5] p-10 text-center bg-[#fafafa]">
          <ClipboardList size={36} className="mx-auto text-[#a3a3a3] mb-3" />
          <h3 className="text-[15px] font-bold text-[#0a0a0a] mb-1">
            {assignmentsList.length === 0
              ? (ar ? 'لا توجد واجبات منشورة حتى الآن' : 'No assignments found')
              : (ar ? 'لا توجد واجبات مطابقة للتصفية الحالية' : 'No assignments match the current filter')}
          </h3>
          <p className="text-[12px] text-[#737373] max-w-[45ch] mx-auto mb-4">
            {ar ? 'اضغط على "إنشاء واجب جديد" لتعيين تجربة معملية لفصل كامل أو لطالب معين.' : 'Click "Create assignment" to link a 3D lab task to your students.'}
          </p>
          <button type="button" onClick={() => setIsCreateOpen(true)} className="sn-btn sn-btn-primary">
            <Plus size={15} strokeWidth={2} />
            {ar ? 'إنشاء واجب الآن' : 'Create Assignment'}
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredAssignments.map((item) => {
            const accent = item.linkedLab || 'chemistry';
            const asgSubs = submissions.filter((s) => s.assignmentId === item.id);
            const targetStudents = item.targetStudentQuadName
              ? enrolledStudents.filter((st) => st.classId === item.classId && namesMatch(st.quadName, item.targetStudentQuadName))
              : enrolledStudents.filter((st) => st.classId === item.classId);
            const targetTotal = item.targetStudentQuadName ? Math.max(1, targetStudents.length) : targetStudents.length;
            const notSubmittedStudents = targetStudents.filter(
              (st) => !asgSubs.some((sub) => namesMatch(sub.studentQuadName, st.quadName))
            );
            const progressPct = targetTotal > 0 ? Math.min(100, Math.round((asgSubs.length / targetTotal) * 100)) : 0;
            const isExpanded = expandedAsgId === item.id;
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
                          {ar ? `طالب خاص: ${item.targetStudentQuadName}` : `Target: ${item.targetStudentQuadName}`}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-[#737373] line-clamp-1">{item.descriptionAr}</p>
                    {targetTotal > 0 && (
                      <div className="mt-2 flex items-center gap-2 max-w-[260px]">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#f0f0f0]">
                          <div className="h-full rounded-full bg-[#0a0a0a]" style={{ width: `${progressPct}%` }} />
                        </div>
                        <span className="font-mono text-[10px] text-[#737373]">
                          {asgSubs.length}/{targetTotal} {ar ? 'تسليم' : 'submitted'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setExpandedAsgId(isExpanded ? null : item.id)}
                      className="sn-btn sn-btn-outline sn-btn-sm !text-[11px]"
                    >
                      <FileCheck2 size={13} />
                      <span>
                        {ar ? `التسليمات (${asgSubs.length})` : `Submissions (${asgSubs.length})`}
                      </span>
                    </button>
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

                {isExpanded && (
                  <div className="mt-3.5 border-t border-[#f0f0f0] pt-3 space-y-2">
                    {asgSubs.length === 0 ? (
                      <div className="rounded-xl bg-[#fafafa] px-3 py-2.5 text-[11px] text-[#737373]">
                        {ar ? 'لا توجد تسليمات من الطلاب لهذا الواجب حتى الآن.' : 'No student submissions yet.'}
                      </div>
                    ) : (
                      asgSubs.map((sub) => {
                        const input = gradingInputs[sub.id] || {
                          score: typeof sub.score === 'number' ? String(sub.score) : '100',
                          feedback: sub.teacherFeedback || '',
                        };
                        return (
                          <div key={sub.id} className="flex flex-col gap-2 rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[12px] font-bold text-[#0a0a0a]">{sub.studentQuadName}</span>
                                <span className={`sn-badge !text-[10px] ${sub.status === 'graded' ? 'sn-badge-green' : 'sn-badge-amber'}`}>
                                  {sub.status === 'graded'
                                    ? `${ar ? 'مُقيّم' : 'Graded'} · ${sub.score ?? 0}%`
                                    : (ar ? 'بانتظار التقييم' : 'Pending Review')}
                                </span>
                              </div>
                              <div className="text-[10px] text-[#737373] mt-0.5">
                                {ar ? 'تاريخ التسليم:' : 'Submitted:'} {sub.submittedAt}
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={input.score}
                                onChange={(e) =>
                                  setGradingInputs((prev) => ({
                                    ...prev,
                                    [sub.id]: { ...input, score: e.target.value },
                                  }))
                                }
                                className="h-8 w-16 rounded-lg border border-[#e5e5e5] bg-white px-2 text-center font-mono text-[11px] outline-none"
                                aria-label="Score"
                              />
                              <input
                                type="text"
                                value={input.feedback}
                                onChange={(e) =>
                                  setGradingInputs((prev) => ({
                                    ...prev,
                                    [sub.id]: { ...input, feedback: e.target.value },
                                  }))
                                }
                                placeholder={ar ? 'ملاحظة للطالب…' : 'Feedback…'}
                                className="h-8 w-40 rounded-lg border border-[#e5e5e5] bg-white px-2 text-[11px] outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => void handleGradeSubmission(sub)}
                                className="sn-btn sn-btn-primary sn-btn-sm !h-8 !text-[11px]"
                              >
                                {ar ? 'حفظ الدرجة' : 'Save Grade'}
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                    {notSubmittedStudents.length > 0 && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2.5 text-[11px] text-amber-900">
                        <span className="font-bold">{ar ? `لم يسلموا بعد (${notSubmittedStudents.length}): ` : `Not submitted yet (${notSubmittedStudents.length}): `}</span>
                        <span>{notSubmittedStudents.map((s) => s.quadName).join('، ')}</span>
                      </div>
                    )}
                  </div>
                )}
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

/* ── Edit Institution Modal ──────────────────────────────────────────────── */
const EditInstitutionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  institution: DbInstitution | null;
  onUpdated: (updated: DbInstitution) => void;
  ar: boolean;
}> = ({ isOpen, onClose, institution, onUpdated, ar }) => {
  const [nameAr, setNameAr] = useState('');
  const [cityAr, setCityAr] = useState('القاهرة');
  const [status, setStatus] = useState<'active' | 'trial'>('active');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (institution) {
      setNameAr(institution.name_ar);
      setCityAr(institution.city_ar);
      setStatus(institution.status);
    }
  }, [institution]);

  if (!isOpen || !institution) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim()) return;
    setLoading(true);
    const updated: DbInstitution = {
      ...institution,
      name_ar: nameAr.trim(),
      city_ar: cityAr,
      city_en: cityAr === 'القاهرة' ? 'Cairo' : cityAr === 'الإسكندرية' ? 'Alexandria' : cityAr,
      status,
    };
    await dbUpdateInstitution(institution.id, {
      name_ar: nameAr.trim(),
      city_ar: cityAr,
      status,
    });
    setLoading(false);
    onUpdated(updated);
    onClose();
  };

  return (
    <div role="dialog" aria-modal="true" dir={ar ? 'rtl' : 'ltr'} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-[460px] overflow-hidden rounded-[22px] bg-white border border-[#e5e5e5] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-4 mb-4">
          <h3 className="text-[16px] font-bold text-[#0a0a0a]">{ar ? 'تعديل بيانات المؤسسة' : 'Edit Institution'}</h3>
          <button type="button" onClick={onClose} className="sn-btn sn-btn-quiet sn-btn-icon"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[12px] font-semibold text-[#171717] mb-1">{ar ? 'اسم المؤسسة / المدرسة *' : 'School Name *'}</label>
            <input required value={nameAr} onChange={(e) => setNameAr(e.target.value)} className="sn-input !h-10 text-[13px]" />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#171717] mb-1">{ar ? 'المدينة / المحافظة' : 'City / Governorate'}</label>
            <select value={cityAr} onChange={(e) => setCityAr(e.target.value)} className="sn-input !h-10 text-[12px]">
              {EGYPT_GOVERNORATES.map((g) => (
                <option key={g.id} value={g.nameAr}>{g.nameAr}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#171717] mb-1">{ar ? 'حالة الاشتراك' : 'Status'}</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="sn-input !h-10 text-[12px]">
              <option value="active">{ar ? 'نشط ومعتمد' : 'Active'}</option>
              <option value="trial">{ar ? 'فترة تجريبية' : 'Trial'}</option>
            </select>
          </div>
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#f0f0f0]">
            <button type="button" onClick={onClose} className="sn-btn sn-btn-outline sn-btn-sm">{ar ? 'إلغاء' : 'Cancel'}</button>
            <button type="submit" disabled={loading} className="sn-btn sn-btn-primary sn-btn-sm">
              {loading ? (ar ? 'جارٍ الحفظ…' : 'Saving…') : ar ? 'حفظ التعديلات' : 'Save Changes'}
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
  const [editingInst, setEditingInst] = useState<DbInstitution | null>(null);
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

      <EditInstitutionModal
        isOpen={Boolean(editingInst)}
        institution={editingInst}
        onClose={() => setEditingInst(null)}
        onUpdated={(updated) =>
          setInstitutions((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
        }
        ar={ar}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={ar ? 'المؤسسات' : 'Institutions'} value={String(institutions.length)} hint={ar ? 'في قاعدة البيانات' : 'in database'} icon={Building2} />
        <StatCard label={ar ? 'المؤسسات النشطة' : 'Active'} value={String(activeCount)} hint={ar ? 'اشتراك نشط' : 'active status'} icon={CheckCircle2} />
        <StatCard label={ar ? 'فترة تجريبية' : 'Trials'} value={String(trialCount)} hint={ar ? 'تحت الاختبار' : 'in trial'} icon={Clock} />
        <StatCard label={ar ? 'المعامل المتصلة' : 'Connected Labs'} value={String(LAB_MODULES.length)} hint={ar ? 'معامل متاحة' : 'active labs'} icon={FlaskConical} />
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
                        onClick={() => setEditingInst(item)}
                        className="text-[#737373] hover:text-[#0a0a0a] p-1 rounded-lg hover:bg-[#f5f5f5] transition-colors me-1"
                        title={ar ? 'تعديل بيانات المؤسسة' : 'Edit Institution'}
                      >
                        <Pencil size={14} />
                      </button>
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
