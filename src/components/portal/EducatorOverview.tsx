/**
 * EducatorOverview.tsx
 * لوحة التحكم الرئيسية للمعلمين والإدارة المدرسية في SciNexa
 * مطابقة تماماً لنظام التصميم الفاخر (Zero Fake Data) ومتصلة بقاعدة بيانات Supabase
 *
 * © SciNexa Platform — ISEF 2026
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useSession } from '../../context/SessionContext';
import {
  dbFetchClasses,
  dbFetchInstitutions,
  dbFetchAllProfiles,
  type DbClass,
  type DbInstitution,
  type DbProfile,
} from '../../lib/supabase';
import {
  fetchAndSyncEnrollment,
  fetchAndSyncAssignments,
  fetchAndSyncSubmissions,
  findStudentEnrollmentsFromList,
  type EnrolledStudent,
  type AssignmentItem,
  type StudentSubmission,
} from '../../data/schoolEnrollment';
import { PageHeader, StatCard, SectionCard } from '../dashboard/ui';
import {
  GraduationCap,
  Users,
  ClipboardList,
  Building2,
  Plus,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  UserCheck,
  Clock,
  Sparkles,
  School,
  Activity,
  Layers,
  FlaskConical,
  BookOpen,
} from 'lucide-react';

export const EducatorOverview: React.FC = () => {
  const { language } = useLanguage();
  const { educator } = useSession();
  const navigate = useNavigate();
  const ar = language === 'ar';
  const ja = language === 'ja';

  const [classes, setClasses] = useState<DbClass[]>([]);
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [platformStudents, setPlatformStudents] = useState<DbProfile[]>([]);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [institutions, setInstitutions] = useState<DbInstitution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const [cls, std, asgn, subs, profs, inst] = await Promise.all([
        dbFetchClasses(),
        fetchAndSyncEnrollment(),
        fetchAndSyncAssignments(),
        fetchAndSyncSubmissions(),
        dbFetchAllProfiles(),
        dbFetchInstitutions(),
      ]);
      if (mounted) {
        setClasses(cls || []);
        setStudents(std || []);
        setAssignments(asgn || []);
        setSubmissions(subs || []);
        setPlatformStudents((profs || []).filter((p) => (p.role || 'student') === 'student'));
        setInstitutions(inst || []);
        setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const totalMastery =
    students.length > 0
      ? Math.round(students.reduce((acc, s) => acc + (s.mastery || 0), 0) / students.length)
      : 0;
  const pendingReviewCount = submissions.filter((s) => s.status === 'submitted').length;
  const unenrolledRegistered = platformStudents.filter(
    (p) => findStudentEnrollmentsFromList(students, p.quad_name || p.display_name, p.email).length === 0
  );

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <PageHeader
        eyebrow={
          ar
            ? 'بوابة المعلمين والإدارة المدرسية'
            : ja
            ? '教員・学校管理者ポータル'
            : 'Educator & School Administration Portal'
        }
        title={
          ar
            ? `مرحباً، ${educator?.name || 'أستاذنا الفاضل'}`
            : ja
            ? `おかえりなさい、${educator?.name || '先生'}`
            : `Welcome, ${educator?.name || 'Educator'}`
        }
        subtitle={
          ar
            ? `المدرسة المسجلة: ${educator?.schoolName || 'لم تحدد بعد'} · بيانات حقيقية متزامنة مع Supabase.`
            : ja
            ? `所属校：${educator?.schoolName || '未設定'} · Supabaseリアルタイム連携`
            : `School: ${educator?.schoolName || 'Not specified'} · Live Supabase connection.`
        }
        actions={
          <div className="flex items-center gap-2">
            <Link to="/portal/classes" className="sn-btn sn-btn-primary">
              <Plus size={15} strokeWidth={2} />
              <span>{ar ? 'إضافة فصل دراسي' : ja ? 'クラス追加' : 'Add Class'}</span>
            </Link>
          </div>
        }
      />

      {/* ── STATS ROW ── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label={ar ? 'الفصول المدرسية' : ja ? '担当クラス' : 'Active Classes'}
          value={String(classes.length)}
          hint={ar ? 'فصول مسجلة بقاعدة البيانات' : ja ? '登録クラス数' : 'Classes in DB'}
          icon={GraduationCap}
        />
        <StatCard
          label={ar ? 'طلاب الفصول الملحقين' : ja ? '登録生徒数' : 'Enrolled Students'}
          value={String(students.length)}
          hint={
            ar
              ? `من أصل ${platformStudents.length} مسجل بالمنصة`
              : `${platformStudents.length} registered on platform`
          }
          icon={Users}
        />
        <StatCard
          label={ar ? 'متوسط إتقان المعامل' : ja ? '平均習熟度' : 'Average Mastery'}
          value={`${totalMastery}%`}
          hint={ar ? 'تقييم التجارب التفاعلية' : ja ? '3D実験完了率' : '3D lab performance'}
          icon={TrendingUp}
        />
        <StatCard
          label={ar ? 'الواجبات والتصحيح' : ja ? '課題・提出' : 'Assignments & Review'}
          value={String(assignments.length)}
          hint={
            pendingReviewCount > 0
              ? ar
                ? `${pendingReviewCount} تسليم بانتظار التقييم`
                : `${pendingReviewCount} awaiting grading`
              : ar
                ? `${submissions.length} تسليم مسجل`
                : `${submissions.length} submissions recorded`
          }
          icon={pendingReviewCount > 0 ? Clock : ClipboardList}
        />
      </div>

      {unenrolledRegistered.length > 0 && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
              <UserCheck size={17} />
            </span>
            <div>
              <div className="text-[13px] font-bold text-[#0a0a0a]">
                {ar
                  ? `${unenrolledRegistered.length} طالب مسجل بالمنصة جاهزون للإلحاق بالفصول`
                  : `${unenrolledRegistered.length} registered platform student(s) ready for class enrollment`}
              </div>
              <div className="text-[11px] text-[#525252] mt-0.5">
                {ar
                  ? `منهم: ${unenrolledRegistered.slice(0, 3).map((p) => p.quad_name || p.display_name).join('، ')}`
                  : unenrolledRegistered.slice(0, 3).map((p) => p.quad_name || p.display_name).join(', ')}
              </div>
            </div>
          </div>
          <Link to="/portal/students" className="sn-btn sn-btn-primary sn-btn-sm shrink-0">
            <Plus size={14} />
            <span>{ar ? 'إلحاق الطلاب المسجلين' : 'Enroll Registered Students'}</span>
          </Link>
        </div>
      )}

      {/* ── QUICK SHORTCUTS ── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => navigate('/portal/classes')}
          className="sn-card sn-card-interactive p-4 text-start flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <GraduationCap size={18} strokeWidth={2} />
            </span>
            <div>
              <div className="text-[13px] font-bold text-[#0a0a0a] group-hover:text-blue-600 transition-colors">
                {ar ? 'إدارة الفصول الدراسية' : ja ? 'クラス管理' : 'Manage Classes'}
              </div>
              <div className="text-[11px] text-[#737373]">
                {ar ? 'إنشاء وتعديل فصول المناهج' : ja ? '学年・科目の設定' : 'Create & edit curriculum classes'}
              </div>
            </div>
          </div>
          <ArrowRight size={14} className={`text-[#a3a3a3] ${ar ? 'rotate-180' : ''}`} />
        </button>

        <button
          type="button"
          onClick={() => navigate('/portal/students')}
          className="sn-card sn-card-interactive p-4 text-start flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Users size={18} strokeWidth={2} />
            </span>
            <div>
              <div className="text-[13px] font-bold text-[#0a0a0a] group-hover:text-emerald-600 transition-colors">
                {ar ? 'سجلات الطلاب وأولياء الأمور' : ja ? '生徒名簿・保護者連絡' : 'Student & Parent Records'}
              </div>
              <div className="text-[11px] text-[#737373]">
                {ar ? 'متابعة عبر واتساب بنقرة واحدة' : ja ? 'WhatsApp 1クリック連絡' : '1-Click WhatsApp contact'}
              </div>
            </div>
          </div>
          <ArrowRight size={14} className={`text-[#a3a3a3] ${ar ? 'rotate-180' : ''}`} />
        </button>

        <button
          type="button"
          onClick={() => navigate('/portal/institutions')}
          className="sn-card sn-card-interactive p-4 text-start flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Building2 size={18} strokeWidth={2} />
            </span>
            <div>
              <div className="text-[13px] font-bold text-[#0a0a0a] group-hover:text-amber-600 transition-colors">
                {ar ? 'المؤسسات والمدارس' : ja ? '教育機関・学校管理' : 'Institutions & Schools'}
              </div>
              <div className="text-[11px] text-[#737373]">
                {ar ? 'إضافة وتعديل وحذف المدارس' : ja ? '学校情報の追加・編集' : 'Add, edit & delete schools'}
              </div>
            </div>
          </div>
          <ArrowRight size={14} className={`text-[#a3a3a3] ${ar ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* ── RECENT ENROLLED STUDENTS WITH WHATSAPP ── */}
      <SectionCard
        title={ar ? 'أحدث الطلاب المسجلين' : ja ? '最近登録された生徒' : 'Recent Enrolled Students'}
        action={
          <Link to="/portal/students" className="sn-btn sn-btn-quiet sn-btn-sm text-[11px] font-semibold">
            <span>{ar ? 'عرض كل الطلاب' : ja ? '全員表示' : 'View all'}</span>
            <ArrowRight size={12} className={ar ? 'rotate-180' : ''} />
          </Link>
        }
        bodyClassName="p-0"
      >
        {students.length === 0 ? (
          <div className="p-8 text-center text-[#737373] text-[12px]">
            <Users size={32} className="mx-auto text-[#a3a3a3] mb-2" />
            <p className="font-semibold text-[#0a0a0a] mb-1">
              {ar ? 'لا يوجد طلاب مسجلون حتى الآن' : ja ? '登録された生徒はいません' : 'No students enrolled yet'}
            </p>
            <p className="max-w-[40ch] mx-auto text-[11px] mb-3">
              {ar
                ? 'يمكنك إضافة الطلاب بالاسم الرباعي ورقم ولي الأمر من صفحة الطلاب.'
                : 'Enroll students with parent phone numbers from the Students page.'}
            </p>
            <Link to="/portal/students" className="sn-btn sn-btn-primary sn-btn-sm inline-flex">
              <Plus size={13} />
              <span>{ar ? 'إضافة أول طالب' : 'Add First Student'}</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-[#f0f0f0] text-[10px] uppercase tracking-[0.08em] text-[#a3a3a3]">
                  <th className="px-5 py-2.5 text-start font-medium">{ar ? 'الطالب' : 'Student'}</th>
                  <th className="px-3 py-2.5 text-start font-medium">{ar ? 'الفصل الدراسي' : 'Class'}</th>
                  <th className="px-3 py-2.5 text-start font-medium">{ar ? 'هاتف ولي الأمر' : 'Parent Phone'}</th>
                  <th className="px-3 py-2.5 text-start font-medium">{ar ? 'الإتقان' : 'Mastery'}</th>
                  <th className="px-5 py-2.5 text-end font-medium">{ar ? 'واتساب' : 'WhatsApp'}</th>
                </tr>
              </thead>
              <tbody>
                {students.slice(0, 6).map((std) => {
                  const cleanPhone = (std.parentPhone || '').replace(/\D/g, '');
                  const waNumber = cleanPhone.startsWith('0') ? '2' + cleanPhone : cleanPhone;
                  const waUrl = cleanPhone
                    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(
                        `السلام عليكم ورحمة الله، تحية طيبة لولي أمر الطالب (${std.quadName}) المحترم.\nنحيطكم علماً بأن نسبة إتقان ابنكم للتجارب العلمية في منصة SciNexa بلغت ${std.mastery}%. نسعد بتواصلكم ومتابعتكم المستمرة.`
                      )}`
                    : null;

                  return (
                    <tr
                      key={std.id}
                      className="border-b border-[#f7f7f7] text-[12px] last:border-0 hover:bg-[#fafafa]"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f5f5] text-[11px] font-bold text-[#0a0a0a]">
                            {std.quadName.charAt(0) || 'S'}
                          </span>
                          <div>
                            <div className="font-semibold text-[#0a0a0a]">{std.quadName}</div>
                            <div className="text-[10px] text-[#737373]">{std.schoolName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-[#525252]">{std.classNameAr}</td>
                      <td className="px-3 py-3 font-mono text-[11px] text-[#525252]">
                        {std.parentPhone || (ar ? 'لم يسجل' : 'None')}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#f0f0f0]">
                            <div
                              className="h-full rounded-full bg-[#0a0a0a]"
                              style={{ width: `${std.mastery || 0}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px]">{std.mastery || 0}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-end">
                        {waUrl ? (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-bold transition-all shadow-xs"
                            title={ar ? 'مراسلة ولي الأمر عبر واتساب' : 'Chat via WhatsApp'}
                          >
                            <MessageSquare size={13} className="text-emerald-600" />
                            <span>WhatsApp</span>
                          </a>
                        ) : (
                          <span className="text-[11px] text-[#a3a3a3] italic">
                            {ar ? 'لا يوجد رقم' : 'No phone'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
};

export default EducatorOverview;
