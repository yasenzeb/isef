-- ==============================================================================
-- SciNexa Platform — Production Supabase Database Schema (ISEF 2026)
-- Project: https://ypkcwndkvhfounqyjhyj.supabase.co
-- Compatible with Vercel deployment (VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY)
--
-- تعليمات التشغيل في Supabase:
-- 1. افتح مشروعك في Supabase: https://supabase.com/dashboard/project/ypkcwndkvhfounqyjhyj
-- 2. اضغط على "SQL Editor" في القائمة الجانبية اليسرى
-- 3. اضغط على "+ New query"
-- 4. الصق كامل الكود أدناه واضغط "Run" (أو Ctrl+Enter)
-- ==============================================================================

-- 1. تحديث جدول profiles لدعم تسجيل الدخول الموحد وحفظ كامل بيانات الطلاب والمعلمين
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  display_name TEXT,
  quad_name TEXT,
  national_id VARCHAR(14),
  student_code TEXT,
  email TEXT,
  school_code VARCHAR(32),
  school_name TEXT,
  governorate_id TEXT DEFAULT 'cairo',
  administration_id TEXT,
  grade_level TEXT DEFAULT 'sec1',
  teacher_code TEXT,
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  stars INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- إضافة الأعمدة في حال كان الجدول موجوداً مسبقاً
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS quad_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS national_id VARCHAR(14);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS student_code TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS school_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS parent_phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS governorate_id TEXT DEFAULT 'cairo';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS administration_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS grade_level TEXT DEFAULT 'sec1';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS teacher_code TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stars INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_key ON public.profiles (lower(email));

-- فك قيد الارتباط بـ auth.users لتمكين مزامنة حسابات Clerk و Google بسلاسة
DO $$
BEGIN
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 2. جدول الفصول المدرسية (Classes)
CREATE TABLE IF NOT EXISTS public.classes (
  id TEXT PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  grade TEXT NOT NULL,
  teacher_id TEXT NOT NULL,
  teacher_name_ar TEXT NOT NULL,
  school_code VARCHAR(32),
  subject_ar TEXT NOT NULL,
  subject_en TEXT NOT NULL,
  accent TEXT DEFAULT 'chemistry',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. جدول المؤسسات والمدارس (Institutions)
CREATE TABLE IF NOT EXISTS public.institutions (
  id TEXT PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  city_ar TEXT NOT NULL,
  city_en TEXT NOT NULL,
  users_count INTEGER DEFAULT 0,
  labs_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'trial')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. جدول إلحاق الطلاب بالفصول (Student Enrollment)
CREATE TABLE IF NOT EXISTS public.students_enrollment (
  id TEXT PRIMARY KEY,
  student_id TEXT,
  quad_name TEXT NOT NULL,
  national_id VARCHAR(14),
  email TEXT,
  school_name TEXT NOT NULL DEFAULT 'المدرسة المسجلة',
  governorate_id TEXT NOT NULL DEFAULT 'cairo',
  administration_id TEXT NOT NULL DEFAULT 'default',
  grade_level TEXT NOT NULL DEFAULT 'sec1',
  class_id TEXT NOT NULL,
  class_name_ar TEXT NOT NULL,
  teacher_id TEXT NOT NULL,
  teacher_name_ar TEXT NOT NULL,
  mastery INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_active_date DATE DEFAULT CURRENT_DATE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. جدول الواجبات والتكليفات المعملية (Assignments)
CREATE TABLE IF NOT EXISTS public.assignments (
  id TEXT PRIMARY KEY,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  class_id TEXT NOT NULL,
  class_name_ar TEXT NOT NULL,
  target_student_quad_name TEXT,
  teacher_id TEXT NOT NULL,
  teacher_name_ar TEXT NOT NULL,
  linked_lab TEXT NOT NULL DEFAULT 'chemistry',
  due_date_ar TEXT NOT NULL,
  due_date_en TEXT NOT NULL,
  description_ar TEXT NOT NULL,
  description_en TEXT NOT NULL,
  total_points INTEGER DEFAULT 100,
  assigned_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. جدول تسليمات الطلاب وتقييمات المعلمين (Submissions)
CREATE TABLE IF NOT EXISTS public.submissions (
  id TEXT PRIMARY KEY,
  assignment_id TEXT NOT NULL,
  student_quad_name TEXT NOT NULL,
  score INTEGER,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded')),
  teacher_feedback TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. تفعيل أمان الصفوف (Row Level Security - RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students_enrollment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- 8. سياسات الوصول الآمنة (RLS Policies - تسمح بالقراءة والكتابة المباشرة)
DO $$
BEGIN
  -- Profiles
  DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
  CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Public profiles write" ON public.profiles;
  CREATE POLICY "Public profiles write" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

  -- Classes
  DROP POLICY IF EXISTS "Public classes read" ON public.classes;
  CREATE POLICY "Public classes read" ON public.classes FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Public classes write" ON public.classes;
  CREATE POLICY "Public classes write" ON public.classes FOR ALL USING (true) WITH CHECK (true);

  -- Institutions
  DROP POLICY IF EXISTS "Public institutions read" ON public.institutions;
  CREATE POLICY "Public institutions read" ON public.institutions FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Public institutions write" ON public.institutions;
  CREATE POLICY "Public institutions write" ON public.institutions FOR ALL USING (true) WITH CHECK (true);

  -- Students Enrollment
  DROP POLICY IF EXISTS "Public enrollment read" ON public.students_enrollment;
  CREATE POLICY "Public enrollment read" ON public.students_enrollment FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Public enrollment write" ON public.students_enrollment;
  CREATE POLICY "Public enrollment write" ON public.students_enrollment FOR ALL USING (true) WITH CHECK (true);

  -- Assignments
  DROP POLICY IF EXISTS "Public assignments read" ON public.assignments;
  CREATE POLICY "Public assignments read" ON public.assignments FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Public assignments write" ON public.assignments;
  CREATE POLICY "Public assignments write" ON public.assignments FOR ALL USING (true) WITH CHECK (true);

  -- Submissions
  DROP POLICY IF EXISTS "Public submissions read" ON public.submissions;
  CREATE POLICY "Public submissions read" ON public.submissions FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Public submissions write" ON public.submissions;
  CREATE POLICY "Public submissions write" ON public.submissions FOR ALL USING (true) WITH CHECK (true);
END $$;

-- 9. تفعيل التزامن الفوري (Supabase Realtime)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.classes, public.students_enrollment, public.assignments, public.submissions, public.profiles, public.institutions;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
END $$;
