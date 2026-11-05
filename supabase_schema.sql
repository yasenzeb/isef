-- ==============================================================================
-- SciNexa Platform — Production Supabase Database Schema (ISEF 2026)
-- Project: https://ypkcwndkvhfounqyjhyj.supabase.co
-- Compatible with Vercel deployment (VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY)
--
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/ypkcwndkvhfounqyjhyj
-- 2. Go to "SQL Editor" in the left sidebar
-- 3. Click "New query", paste the entire code below, and click "Run" (Cmd+Enter / Ctrl+Enter)
-- ==============================================================================

-- 1. Profiles (Students, Teachers, and Principals/Admins, including Google OAuth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  quad_name TEXT NOT NULL,
  national_id VARCHAR(14),
  email TEXT,
  school_code VARCHAR(32),
  school_name TEXT,
  governorate_id TEXT DEFAULT 'cairo',
  administration_id TEXT,
  grade_level TEXT DEFAULT 'sec2',
  teacher_code TEXT,
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  stars INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. School Classes managed by Teachers
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

-- Seed Official Classes
INSERT INTO public.classes (id, name_ar, name_en, grade, teacher_id, teacher_name_ar, subject_ar, subject_en, accent)
VALUES
  ('2a', 'كيمياء ٢أ (الصف الثاني الثانوي)', 'Chemistry 2A (2nd Sec)', 'sec2', 't-mona', 'أ. منى فتحي', 'الكيمياء', 'Chemistry', 'chemistry'),
  ('3b', 'فيزياء ٣ب (الصف الثالث الثانوي)', 'Physics 3B (3rd Sec)', 'sec3', 't-hala', 'أ. هالة نبيل', 'الفيزياء', 'Physics', 'physics'),
  ('1c', 'أحياء ١ج (الصف الأول الثانوي)', 'Biology 1C (1st Sec)', 'sec1', 't-tarek', 'أ. طارق محمود', 'الأحياء', 'Biology', 'biology'),
  ('1b', 'علوم ١ب (الصف الأول الإعدادي)', 'Science 1B (1st Prep)', 'prep1', 't-mona', 'أ. منى فتحي', 'العلوم العامة', 'General Science', 'chemistry'),
  ('stem-phys', 'ميكانيكا متقدمة (مدارس STEM)', 'Advanced Mechanics (STEM)', 'stem', 't-hala', 'أ. هالة نبيل', 'الفيزياء التطبيقية', 'Applied Physics', 'physics')
ON CONFLICT (id) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  teacher_name_ar = EXCLUDED.teacher_name_ar;

-- 3. Student Enrollment linking Students to Teachers and Classes
CREATE TABLE IF NOT EXISTS public.students_enrollment (
  id TEXT PRIMARY KEY,
  student_id TEXT,
  quad_name TEXT NOT NULL,
  national_id VARCHAR(14),
  email TEXT,
  school_name TEXT NOT NULL DEFAULT 'المدرسة المسجلة',
  governorate_id TEXT NOT NULL DEFAULT 'cairo',
  administration_id TEXT NOT NULL DEFAULT 'default',
  grade_level TEXT NOT NULL DEFAULT 'sec2',
  class_id TEXT NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  class_name_ar TEXT NOT NULL,
  teacher_id TEXT NOT NULL,
  teacher_name_ar TEXT NOT NULL,
  mastery INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_active_date DATE DEFAULT CURRENT_DATE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Assignments & Lab Tasks created by Teachers (Can target entire class OR specific student)
CREATE TABLE IF NOT EXISTS public.assignments (
  id TEXT PRIMARY KEY,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  class_id TEXT NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  class_name_ar TEXT NOT NULL,
  target_student_quad_name TEXT, -- NULL for all students in class, or specific student's 4-part name
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

-- 5. Student Submissions & Teacher Evaluations
CREATE TABLE IF NOT EXISTS public.submissions (
  id TEXT PRIMARY KEY,
  assignment_id TEXT NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_quad_name TEXT NOT NULL,
  score INTEGER,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded')),
  teacher_feedback TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students_enrollment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies (Allow Read / Write for authenticated & anon app operations)
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

-- 8. Enable Realtime Publications (Optional for instant live sync)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.classes, public.students_enrollment, public.assignments, public.submissions, public.profiles;
  EXCEPTION WHEN OTHERS THEN
    -- Ignore if already added
    NULL;
  END;
END $$;
