import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { PageHeader, StatCard, SectionCard } from './ui';
import {
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
  MoreHorizontal,
  FlaskConical,
  Activity,
  FileCheck2,
  UserCog,
  MapPin,
  CalendarDays,
  BarChart3,
} from 'lucide-react';

const Avatar: React.FC<{ name: string; tone?: string }> = ({ name, tone = 'bg-[#f5f5f5] text-[#171717]' }) => (
  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-medium ${tone}`}>
    {name.trim().charAt(0).toUpperCase()}
  </span>
);

const CLASSES = [
  { id: '2a', nameEn: 'Chemistry 2A', nameAr: 'كيمياء ٢أ', students: 32, completion: 82, nextEn: 'Thu · 10:00', nextAr: 'الخميس · ١٠:٠٠', accent: 'chemistry' },
  { id: '3b', nameEn: 'Physics 3B', nameAr: 'فيزياء ٣ب', students: 28, completion: 64, nextEn: 'Sun · 12:30', nextAr: 'الأحد · ١٢:٣٠', accent: 'physics' },
  { id: '1c', nameEn: 'Biology 1C', nameAr: 'أحياء ١ج', students: 35, completion: 71, nextEn: 'Mon · 09:00', nextAr: 'الاثنين · ٠٩:٠٠', accent: 'biology' },
  { id: '4d', nameEn: 'Science 4D', nameAr: 'علوم ٤د', students: 33, completion: 58, nextEn: 'Tue · 11:00', nextAr: 'الثلاثاء · ١١:٠٠', accent: 'anatomy' },
];

const STUDENTS = [
  { nameEn: 'Yaseen Zed', nameAr: 'ياسين زيد', code: '2026001', classEn: 'Chemistry 2A', classAr: 'كيمياء ٢أ', mastery: 86, lastEn: '2 min ago', lastAr: 'منذ دقيقتين', status: 'active' },
  { nameEn: 'Mariam Hassan', nameAr: 'مريم حسن', code: '2026002', classEn: 'Chemistry 2A', classAr: 'كيمياء ٢أ', mastery: 91, lastEn: '18 min ago', lastAr: 'منذ ١٨ دقيقة', status: 'active' },
  { nameEn: 'Omar Adel', nameAr: 'عمر عادل', code: '2026014', classEn: 'Physics 3B', classAr: 'فيزياء ٣ب', mastery: 74, lastEn: '1 h ago', lastAr: 'منذ ساعة', status: 'active' },
  { nameEn: 'Nour Khaled', nameAr: 'نور خالد', code: '2026018', classEn: 'Biology 1C', classAr: 'أحياء ١ج', mastery: 63, lastEn: '3 h ago', lastAr: 'منذ ٣ ساعات', status: 'active' },
  { nameEn: 'Ali Mostafa', nameAr: 'علي مصطفى', code: '2026021', classEn: 'Science 4D', classAr: 'علوم ٤د', mastery: 48, lastEn: 'Yesterday', lastAr: 'أمس', status: 'review' },
  { nameEn: 'Salma Tarek', nameAr: 'سلمى طارق', code: '2026026', classEn: 'Chemistry 2A', classAr: 'كيمياء ٢أ', mastery: 79, lastEn: 'Yesterday', lastAr: 'أمس', status: 'active' },
  { nameEn: 'Hana Youssef', nameAr: 'هنا يوسف', code: '2026033', classEn: 'Biology 1C', classAr: 'أحياء ١ج', mastery: 88, lastEn: '2 days ago', lastAr: 'منذ يومين', status: 'active' },
  { nameEn: 'Ziad Samir', nameAr: 'زياد سمير', code: '2026038', classEn: 'Physics 3B', classAr: 'فيزياء ٣ب', mastery: 41, lastEn: '4 days ago', lastAr: 'منذ ٤ أيام', status: 'inactive' },
];

const ASSIGNMENTS = [
  { titleEn: 'Hydrogen reduction lab report', titleAr: 'تقرير تجربة اختزال الهيدروجين', classEn: 'Chemistry 2A', classAr: 'كيمياء ٢أ', dueEn: 'Thu, 24 Oct', dueAr: 'الخميس ٢٤ أكتوبر', submitted: 26, total: 32, accent: 'chemistry' },
  { titleEn: 'Wave harmonics worksheet', titleAr: 'ورقة عمل الموجات', classEn: 'Physics 3B', classAr: 'فيزياء ٣ب', dueEn: 'Sun, 27 Oct', dueAr: 'الأحد ٢٧ أكتوبر', submitted: 19, total: 28, accent: 'physics' },
  { titleEn: 'Cell structure diagram', titleAr: 'رسم تركيب الخلية', classEn: 'Biology 1C', classAr: 'أحياء ١ج', dueEn: 'Mon, 28 Oct', dueAr: 'الاثنين ٢٨ أكتوبر', submitted: 30, total: 35, accent: 'biology' },
  { titleEn: 'Nervous system quiz', titleAr: 'اختبار الجهاز العصبي', classEn: 'Science 4D', classAr: 'علوم ٤د', dueEn: 'Tue, 29 Oct', dueAr: 'الثلاثاء ٢٩ أكتوبر', submitted: 12, total: 33, accent: 'anatomy' },
];

const INSTITUTIONS = [
  { nameEn: 'Nile STEM School', nameAr: 'مدرسة النيل للعلوم', cityEn: 'Cairo', cityAr: 'القاهرة', users: 420, labs: 6120, status: 'active' },
  { nameEn: 'Alexandria Science College', nameAr: 'كلية العلوم بالإسكندرية', cityEn: 'Alexandria', cityAr: 'الإسكندرية', users: 380, labs: 5340, status: 'active' },
  { nameEn: 'Mansoura STEM Academy', nameAr: 'أكاديمية المنصورة للعلوم', cityEn: 'Dakahlia', cityAr: 'الدقهلية', users: 296, labs: 4120, status: 'active' },
  { nameEn: 'Assiut STEM Academy', nameAr: 'أكاديمية أسيوط', cityEn: 'Assiut', cityAr: 'أسيوط', users: 214, labs: 2890, status: 'trial' },
  { nameEn: 'Giza International School', nameAr: 'مدرسة الجيزة الدولية', cityEn: 'Giza', cityAr: 'الجيزة', users: 188, labs: 2410, status: 'active' },
  { nameEn: 'Port Said Science Hub', nameAr: 'مركز بورسعيد العلمي', cityEn: 'Port Said', cityAr: 'بورسعيد', users: 96, labs: 870, status: 'trial' },
];

const USERS = [
  { nameEn: 'Yaseen Zed', nameAr: 'ياسين زيد', email: 'yaseen@scinexa.school', role: 'student', lastEn: '2 min ago', lastAr: 'منذ دقيقتين' },
  { nameEn: 'Islam Ahmed', nameAr: 'إسلام أحمد', email: 'islam@scinexa.school', role: 'admin', lastEn: '12 min ago', lastAr: 'منذ ١٢ دقيقة' },
  { nameEn: 'Mona Fathy', nameAr: 'منى فتحي', email: 'mona@nile-stem.edu.eg', role: 'teacher', lastEn: '1 h ago', lastAr: 'منذ ساعة' },
  { nameEn: 'Omar Adel', nameAr: 'عمر عادل', email: 'omar@scinexa.school', role: 'student', lastEn: '1 h ago', lastAr: 'منذ ساعة' },
  { nameEn: 'Hala Nabil', nameAr: 'هالة نبيل', email: 'hala@alex-science.edu.eg', role: 'teacher', lastEn: '3 h ago', lastAr: 'منذ ٣ ساعات' },
  { nameEn: 'Mariam Hassan', nameAr: 'مريم حسن', email: 'mariam@scinexa.school', role: 'student', lastEn: 'Yesterday', lastAr: 'أمس' },
];

const ROLE_BADGE: Record<string, string> = {
  student: 'sn-badge-blue',
  teacher: 'sn-badge-green',
  admin: 'sn-badge-amber',
};

/* ── Classes ──────────────────────────────────────────────────────────────── */
export const ClassesPage: React.FC = () => {
  const { language } = useLanguage();
  const ar = language === 'ar';
  return (
    <div>
      <PageHeader
        eyebrow={ar ? 'التعليم' : 'Teaching'}
        title={ar ? 'فصولك، في مكان واحد.' : 'Your classes, in one room.'}
        subtitle={ar ? 'تابع الإنجاز، افتح السبورة، ووزّع الواجبات دون مغادرة اللوحة.' : 'Track completion, open the smartboard and assign work without leaving the dashboard.'}
        actions={
          <button type="button" className="sn-btn sn-btn-primary">
            <ClipboardList size={15} strokeWidth={1.8} />
            {ar ? 'واجب جديد' : 'New assignment'}
          </button>
        }
      />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={ar ? 'الفصول' : 'Classes'} value="4" hint={ar ? 'نشطة' : 'active'} icon={GraduationCap} />
        <StatCard label={ar ? 'الطلاب' : 'Students'} value="128" trend="+12" hint={ar ? 'هذا الشهر' : 'this month'} icon={Users} />
        <StatCard label={ar ? 'متوسط الإنجاز' : 'Avg. completion'} value="74%" trend="+4%" hint={ar ? 'كل الفصول' : 'all classes'} icon={TrendingUp} />
        <StatCard label={ar ? 'جلسات هذا الأسبوع' : 'Sessions'} value="18" hint={ar ? 'معمل' : 'labs'} icon={FlaskConical} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {CLASSES.map((item) => (
          <div key={item.id} className={`sn-${item.accent} sn-card sn-card-hover p-5`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="sn-icon-tile !h-10 !w-10">
                  <GraduationCap size={18} strokeWidth={1.6} />
                </span>
                <div>
                  <h2 className="text-[15px] font-semibold">{ar ? item.nameAr : item.nameEn}</h2>
                  <div className="mt-0.5 text-[11px] text-[#737373]">{item.students} {ar ? 'طالبًا' : 'students'}</div>
                </div>
              </div>
              <button type="button" className="sn-btn sn-btn-quiet sn-btn-icon" aria-label={ar ? 'خيارات' : 'Options'}>
                <MoreHorizontal size={16} strokeWidth={1.8} />
              </button>
            </div>
            <div className="mt-5">
              <div className="mb-1.5 flex items-center justify-between text-[10px] text-[#737373]">
                <span>{ar ? 'الإنجاز' : 'Completion'}</span>
                <span className="font-mono">{item.completion}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#f0f0f0]">
                <div className="h-full rounded-full sn-accent-line" style={{ width: `${item.completion}%` }} />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-[#f0f0f0] pt-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-[#737373]">
                <CalendarDays size={12} strokeWidth={1.8} />
                {ar ? item.nextAr : item.nextEn}
              </span>
              <Link to="/app/students" className="sn-link !text-[12px]">
                {ar ? 'الطلاب' : 'Students'}
                <ArrowRight size={13} strokeWidth={1.8} className={ar ? 'rotate-180' : ''} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Students ─────────────────────────────────────────────────────────────── */
export const StudentsPage: React.FC = () => {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const [query, setQuery] = useState('');
  const [onlyReview, setOnlyReview] = useState(false);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return STUDENTS.filter((student) => {
      const matches =
        !q ||
        student.nameEn.toLowerCase().includes(q) ||
        student.nameAr.includes(q) ||
        student.code.includes(q) ||
        student.classEn.toLowerCase().includes(q);
      return matches && (!onlyReview || student.status !== 'active');
    });
  }, [query, onlyReview]);

  return (
    <div>
      <PageHeader
        eyebrow={ar ? 'التعليم' : 'Teaching'}
        title={ar ? 'الطلاب' : 'Students'}
        subtitle={ar ? 'ابحث عن طالب، راجع إتقانه، وافتح تقريره الكامل.' : 'Find a student, review mastery and open the full report.'}
        actions={
          <button type="button" className="sn-btn sn-btn-outline">
            <FileCheck2 size={15} strokeWidth={1.8} />
            {ar ? 'تصدير CSV' : 'Export CSV'}
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
              </tr>
            </thead>
            <tbody>
              {rows.map((student) => (
                <tr key={student.code} className="border-b border-[#f7f7f7] text-[12px] last:border-0 hover:bg-[#fafafa]">
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
                    <span className={`sn-badge !text-[10px] ${student.status === 'active' ? 'sn-badge-green' : student.status === 'review' ? 'sn-badge-amber' : 'sn-badge-soft'}`}>
                      {student.status === 'active' ? (ar ? 'نشط' : 'Active') : student.status === 'review' ? (ar ? 'مراجعة' : 'Review') : ar ? 'غير نشط' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};

/* ── Assignments ──────────────────────────────────────────────────────────── */
export const AssignmentsPage: React.FC = () => {
  const { language } = useLanguage();
  const ar = language === 'ar';
  return (
    <div>
      <PageHeader
        eyebrow={ar ? 'التعليم' : 'Teaching'}
        title={ar ? 'الواجبات' : 'Assignments'}
        subtitle={ar ? 'كل واجب مرتبط بدرس ومعمل. التسليمات تُحسب تلقائيًا.' : 'Every assignment is tied to a lesson and a lab. Submissions count themselves.'}
        actions={
          <button type="button" className="sn-btn sn-btn-primary">
            <ClipboardList size={15} strokeWidth={1.8} />
            {ar ? 'إنشاء واجب' : 'Create assignment'}
          </button>
        }
      />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={ar ? 'مفتوحة' : 'Open'} value="6" hint={ar ? 'واجبات' : 'assignments'} icon={ClipboardList} />
        <StatCard label={ar ? 'تسليمات' : 'Submissions'} value="87" trend="+14" hint={ar ? 'هذا الأسبوع' : 'this week'} icon={FileCheck2} />
        <StatCard label={ar ? 'بانتظار المراجعة' : 'To review'} value="23" hint={ar ? 'تسليم' : 'items'} icon={Clock} />
        <StatCard label={ar ? 'متوسط الدرجة' : 'Avg. score'} value="81%" trend="+3%" hint={ar ? 'كل الفصول' : 'all classes'} icon={TrendingUp} />
      </div>
      <div className="space-y-2.5">
        {ASSIGNMENTS.map((item) => {
          const pct = Math.round((item.submitted / item.total) * 100);
          return (
            <div key={item.titleEn} className={`sn-${item.accent} sn-card p-4`}>
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <span className="sn-icon-tile">
                  <ClipboardList size={17} strokeWidth={1.7} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold">{ar ? item.titleAr : item.titleEn}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#737373]">
                    <span>{ar ? item.classAr : item.classEn}</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays size={10} strokeWidth={1.8} />
                      {ar ? item.dueAr : item.dueEn}
                    </span>
                  </div>
                </div>
                <div className="w-full md:w-[200px]">
                  <div className="mb-1.5 flex items-center justify-between text-[10px] text-[#737373]">
                    <span>{item.submitted}/{item.total} {ar ? 'تسليم' : 'submitted'}</span>
                    <span className="font-mono">{pct}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#f0f0f0]">
                    <div className="h-full rounded-full sn-accent-line" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <button type="button" className="sn-btn sn-btn-outline sn-btn-sm shrink-0">
                  {ar ? 'مراجعة' : 'Review'}
                  <ArrowRight size={12} strokeWidth={1.8} className={ar ? 'rotate-180' : ''} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── Institutions ─────────────────────────────────────────────────────────── */
export const InstitutionsPage: React.FC = () => {
  const { language } = useLanguage();
  const ar = language === 'ar';
  return (
    <div>
      <PageHeader
        eyebrow={ar ? 'الإدارة' : 'Administration'}
        title={ar ? 'المؤسسات' : 'Institutions'}
        subtitle={ar ? 'المدارس المتصلة، استخدامها، وحالة اشتراكها.' : 'Connected schools, their usage and subscription health.'}
        actions={
          <button type="button" className="sn-btn sn-btn-primary">
            <Building2 size={15} strokeWidth={1.8} />
            {ar ? 'إضافة مؤسسة' : 'Add institution'}
          </button>
        }
      />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={ar ? 'المؤسسات' : 'Institutions'} value="12" hint={ar ? 'متصلة' : 'connected'} icon={Building2} />
        <StatCard label={ar ? 'المستخدمون' : 'Users'} value="2,480" trend="+18%" hint={ar ? '٣٠ يومًا' : '30 days'} icon={Users} />
        <StatCard label={ar ? 'جلسات المعامل' : 'Lab sessions'} value="18.4k" trend="+9%" hint={ar ? 'هذا الشهر' : 'this month'} icon={FlaskConical} />
        <StatCard label={ar ? 'تجارب نشطة' : 'Active trials'} value="2" hint={ar ? 'مؤسسات' : 'schools'} icon={Clock} />
      </div>
      <SectionCard title={ar ? 'كل المؤسسات' : 'All institutions'} action={<span className="sn-badge sn-badge-outline">6 {ar ? 'ظاهرة' : 'shown'}</span>} bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px]">
            <thead>
              <tr className="border-b border-[#f0f0f0] text-[10px] uppercase tracking-[0.08em] text-[#a3a3a3]">
                <th className="px-5 py-2.5 text-start font-medium">{ar ? 'المؤسسة' : 'Institution'}</th>
                <th className="px-3 py-2.5 text-start font-medium">{ar ? 'المدينة' : 'City'}</th>
                <th className="px-3 py-2.5 text-start font-medium">{ar ? 'المستخدمون' : 'Users'}</th>
                <th className="px-3 py-2.5 text-start font-medium">{ar ? 'جلسات المعامل' : 'Lab sessions'}</th>
                <th className="px-5 py-2.5 text-start font-medium">{ar ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody>
              {INSTITUTIONS.map((item) => (
                <tr key={item.nameEn} className="border-b border-[#f7f7f7] text-[12px] last:border-0 hover:bg-[#fafafa]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#f5f5f5]">
                        <Building2 size={14} strokeWidth={1.7} className="text-[#737373]" />
                      </span>
                      <span className="font-medium">{ar ? item.nameAr : item.nameEn}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-[#737373]">
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={11} strokeWidth={1.8} />
                      {ar ? item.cityAr : item.cityEn}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-mono">{item.users}</td>
                  <td className="px-3 py-3 font-mono">{item.labs.toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <span className={`sn-badge !text-[10px] ${item.status === 'active' ? 'sn-badge-green' : 'sn-badge-amber'}`}>
                      {item.status === 'active' ? (ar ? 'نشط' : 'Active') : ar ? 'تجريبي' : 'Trial'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};

/* ── Users & roles ────────────────────────────────────────────────────────── */
export const UsersPage: React.FC = () => {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const [query, setQuery] = useState('');
  const rows = USERS.filter(
    (u) => !query || u.nameEn.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        eyebrow={ar ? 'الإدارة' : 'Administration'}
        title={ar ? 'المستخدمون والأدوار' : 'Users & roles'}
        subtitle={ar ? 'الوصول يُمنح حسب الدور. الأدوار تُدار من Clerk publicMetadata.' : 'Access follows role. Roles are managed from Clerk publicMetadata.'}
        actions={
          <button type="button" className="sn-btn sn-btn-outline">
            <UserCog size={15} strokeWidth={1.8} />
            {ar ? 'صلاحيات الأدوار' : 'Role permissions'}
          </button>
        }
      />
      <div className="mb-5 grid grid-cols-3 gap-3">
        {[
          { role: 'student', count: '2,214', labelEn: 'Students', labelAr: 'طالب', icon: GraduationCap },
          { role: 'teacher', count: '248', labelEn: 'Teachers', labelAr: 'معلم', icon: Users },
          { role: 'admin', count: '18', labelEn: 'Administrators', labelAr: 'إدارة', icon: ShieldCheck },
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
        <span className="sn-badge sn-badge-soft">Clerk</span>
      </div>

      <SectionCard title={ar ? 'دليل المستخدمين' : 'User directory'} action={<span className="sn-badge sn-badge-outline">{rows.length}</span>} bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-[#f0f0f0] text-[10px] uppercase tracking-[0.08em] text-[#a3a3a3]">
                <th className="px-5 py-2.5 text-start font-medium">{ar ? 'المستخدم' : 'User'}</th>
                <th className="px-3 py-2.5 text-start font-medium">{ar ? 'الدور' : 'Role'}</th>
                <th className="px-3 py-2.5 text-start font-medium">{ar ? 'آخر دخول' : 'Last sign-in'}</th>
                <th className="px-5 py-2.5 text-start font-medium">{ar ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((user) => (
                <tr key={user.email} className="border-b border-[#f7f7f7] text-[12px] last:border-0 hover:bg-[#fafafa]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={user.nameEn} />
                      <div>
                        <div className="font-medium">{ar ? user.nameAr : user.nameEn}</div>
                        <div dir="ltr" className="font-mono text-[10px] text-[#a3a3a3]">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`sn-badge !text-[10px] ${ROLE_BADGE[user.role]}`}>{user.role}</span>
                  </td>
                  <td className="px-3 py-3 text-[#737373]">{ar ? user.lastAr : user.lastEn}</td>
                  <td className="px-5 py-3">
                    <span className="sn-badge sn-badge-green !text-[10px]">{ar ? 'نشط' : 'Active'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};

/* ── Analytics ────────────────────────────────────────────────────────────── */
export const AnalyticsPage: React.FC = () => {
  const { language } = useLanguage();
  const ar = language === 'ar';
  return (
    <div>
      <PageHeader
        eyebrow={ar ? 'التحليلات' : 'Analytics'}
        title={ar ? 'أين يحدث التعلّم فعلًا؟' : 'Where learning actually happens.'}
        subtitle={ar ? 'استخدام المعامل، إنجاز الفصول، والاتجاهات على مستوى المدرسة.' : 'Lab usage, class completion and school-level trends.'}
        actions={<span className="sn-badge sn-badge-outline">{ar ? 'آخر ٣٠ يومًا' : 'Last 30 days'}</span>}
      />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={ar ? 'جلسات المعامل' : 'Lab sessions'} value="18.4k" trend="+9%" hint={ar ? 'هذا الشهر' : 'this month'} icon={FlaskConical} />
        <StatCard label={ar ? 'متوسط الجلسة' : 'Avg. session'} value="24m" trend="+2m" hint={ar ? 'لكل طالب' : 'per student'} icon={Clock} />
        <StatCard label={ar ? 'إتمام الدروس' : 'Lesson completion'} value="76%" trend="+5%" hint={ar ? 'كل الفصول' : 'all classes'} icon={CheckCircle2} />
        <StatCard label={ar ? 'رضا المعلمين' : 'Teacher NPS'} value="72" trend="+8" hint={ar ? 'استبيان' : 'survey'} icon={TrendingUp} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <SectionCard title={ar ? 'استخدام المعامل' : 'Lab usage'} action={<BarChart3 size={14} strokeWidth={1.7} className="text-[#a3a3a3]" />}>
          <div className="space-y-3.5">
            {[
              { en: 'Anatomy', ar: 'التشريح', value: 92, sessions: '6,120', accent: 'anatomy' },
              { en: 'Chemistry', ar: 'الكيمياء', value: 78, sessions: '5,340', accent: 'chemistry' },
              { en: 'Physics', ar: 'الفيزياء', value: 64, sessions: '4,120', accent: 'physics' },
              { en: 'Biology', ar: 'الأحياء', value: 52, sessions: '2,890', accent: 'biology' },
              { en: 'Astronomy', ar: 'الفلك', value: 38, sessions: '2,410', accent: 'astronomy' },
              { en: 'Geology', ar: 'الجيولوجيا', value: 26, sessions: '1,870', accent: 'geology' },
            ].map((lab) => (
              <div key={lab.en} className={`sn-${lab.accent}`}>
                <div className="mb-1.5 flex items-center justify-between text-[11px]">
                  <span className="font-medium">{ar ? lab.ar : lab.en}</span>
                  <span className="font-mono text-[#737373]">{lab.sessions}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#f0f0f0]">
                  <div className="h-full rounded-full sn-accent-line" style={{ width: `${lab.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title={ar ? 'نشاط المدارس' : 'School activity'} bodyClassName="p-3">
          <div className="space-y-1">
            {INSTITUTIONS.slice(0, 5).map((school) => (
              <div key={school.nameEn} className="flex items-center gap-3 rounded-[10px] px-2 py-2 hover:bg-[#fafafa]">
                <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#f5f5f5]">
                  <Building2 size={12} strokeWidth={1.8} className="text-[#737373]" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[11px] font-medium">{ar ? school.nameAr : school.nameEn}</div>
                  <div className="text-[9px] text-[#a3a3a3]">{school.users} {ar ? 'مستخدمًا' : 'users'}</div>
                </div>
                <span className="font-mono text-[10px] text-[#737373]">{school.labs.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-4">
        <SectionCard title={ar ? 'إتمام الفصول' : 'Class completion'} bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b border-[#f0f0f0] text-[10px] uppercase tracking-[0.08em] text-[#a3a3a3]">
                  <th className="px-5 py-2.5 text-start font-medium">{ar ? 'الفصل' : 'Class'}</th>
                  <th className="px-3 py-2.5 text-start font-medium">{ar ? 'الطلاب' : 'Students'}</th>
                  <th className="px-3 py-2.5 text-start font-medium">{ar ? 'الإنجاز' : 'Completion'}</th>
                  <th className="px-5 py-2.5 text-start font-medium">{ar ? 'آخر جلسة' : 'Last session'}</th>
                </tr>
              </thead>
              <tbody>
                {CLASSES.map((item) => (
                  <tr key={item.id} className="border-b border-[#f7f7f7] text-[12px] last:border-0">
                    <td className="px-5 py-3 font-medium">{ar ? item.nameAr : item.nameEn}</td>
                    <td className="px-3 py-3 font-mono">{item.students}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[#f0f0f0]">
                          <div className="h-full rounded-full bg-[#0a0a0a]" style={{ width: `${item.completion}%` }} />
                        </div>
                        <span className="font-mono text-[11px]">{item.completion}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#737373]">{ar ? item.nextAr : item.nextEn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};
