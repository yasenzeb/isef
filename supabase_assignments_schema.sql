-- ==============================================================================
-- SciNexa Assignments & Submissions Enhanced Schema (SQL)
-- يدعم الأسئلة المختلطة (MCQ، مقالي، تجارب معملية مصورة) والتصحيح التلقائي واليدوي
-- تشغيل هذا الملف في Supabase SQL Editor يحدث الجداول القائمة بأمان بدون فقدان بيانات
-- ==============================================================================

-- 1. التأكد من وجود جدول التكليفات وإضافة أعمدة الأسئلة (assignments)
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
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  questions JSONB DEFAULT '[]'::jsonb
);

-- تحديث الأعمدة بأمان إذا كان الجدول منشأ مسبقاً
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS questions JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS target_student_quad_name TEXT;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 100;

-- 2. التأكد من وجود جدول التسليمات وإضافة أعمدة الإجابات والتصحيح (submissions)
CREATE TABLE IF NOT EXISTS public.submissions (
  id TEXT PRIMARY KEY,
  assignment_id TEXT NOT NULL,
  student_quad_name TEXT NOT NULL,
  score INTEGER,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded')),
  teacher_feedback TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  answers JSONB DEFAULT '[]'::jsonb,
  auto_score NUMERIC DEFAULT 0,
  manual_score NUMERIC DEFAULT 0
);

-- تحديث الأعمدة بأمان إذا كان الجدول منشأ مسبقاً
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS auto_score NUMERIC DEFAULT 0;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS manual_score NUMERIC DEFAULT 0;

-- 3. الفهارس لتحقيق أعلى سرعة استعلام (Indexes)
CREATE INDEX IF NOT EXISTS idx_assignments_class ON public.assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_assignments_lab ON public.assignments(linked_lab);
CREATE INDEX IF NOT EXISTS idx_submissions_asg ON public.submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON public.submissions(student_quad_name);

-- 4. تفعيل أمان الصفوف (Row Level Security - RLS)
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- سياسات التكليفات (assignments)
  DROP POLICY IF EXISTS "Public assignments read" ON public.assignments;
  CREATE POLICY "Public assignments read" ON public.assignments FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Public assignments write" ON public.assignments;
  CREATE POLICY "Public assignments write" ON public.assignments FOR ALL USING (true) WITH CHECK (true);

  -- سياسات التسليمات (submissions)
  DROP POLICY IF EXISTS "Public submissions read" ON public.submissions;
  CREATE POLICY "Public submissions read" ON public.submissions FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Public submissions write" ON public.submissions;
  CREATE POLICY "Public submissions write" ON public.submissions FOR ALL USING (true) WITH CHECK (true);
END $$;

-- 5. تفعيل التزامن اللحظي (Supabase Realtime)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.assignments, public.submissions;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
END $$;
