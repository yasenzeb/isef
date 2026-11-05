-- ==============================================================================
-- SciNexa Platform — Production Supabase Schema (ISEF 2026)
-- Compatible with Vercel deployment (VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY)
-- ==============================================================================

-- 1. Profiles (Students, Teachers, and Principals/Admins)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  quad_name TEXT NOT NULL,
  national_id VARCHAR(14),
  school_code VARCHAR(32),
  school_name TEXT,
  governorate_id TEXT,
  administration_id TEXT,
  grade_level TEXT,
  teacher_code TEXT,
  email TEXT,
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

-- 3. Student Enrollment linking Students to Teachers and Classes
CREATE TABLE IF NOT EXISTS public.students_enrollment (
  id TEXT PRIMARY KEY,
  student_id TEXT,
  quad_name TEXT NOT NULL,
  national_id VARCHAR(14),
  email TEXT,
  school_name TEXT NOT NULL,
  governorate_id TEXT NOT NULL,
  administration_id TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  class_id TEXT NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  class_name_ar TEXT NOT NULL,
  teacher_id TEXT NOT NULL,
  teacher_name_ar TEXT NOT NULL,
  mastery INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  enrolled_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Assignments & Lab Tasks created by Teachers
CREATE TABLE IF NOT EXISTS public.assignments (
  id TEXT PRIMARY KEY,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  class_id TEXT NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  class_name_ar TEXT NOT NULL,
  teacher_id TEXT NOT NULL,
  teacher_name_ar TEXT NOT NULL,
  linked_lab TEXT NOT NULL,
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

-- 7. RLS Policies (Allow Read / Write for authenticated app operations)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read profiles') THEN
    CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public insert/update profiles') THEN
    CREATE POLICY "Public insert/update profiles" ON public.profiles FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public classes policy') THEN
    CREATE POLICY "Public classes policy" ON public.classes FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public enrollment policy') THEN
    CREATE POLICY "Public enrollment policy" ON public.students_enrollment FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public assignments policy') THEN
    CREATE POLICY "Public assignments policy" ON public.assignments FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public submissions policy') THEN
    CREATE POLICY "Public submissions policy" ON public.submissions FOR ALL USING (true);
  END IF;
END $$;
