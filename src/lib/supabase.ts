/**
 * supabase.ts
 * تهيئة العميل البرمجي لـ Supabase والتزامن التلقائي مع قاعدة البيانات السحابية
 * (VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY)
 *
 * يوفر استعلامات حقيقية للفصول، الطلاب المسجلين، الواجبات، التقييمات، والتحقق الأمني بالرقم القومي.
 *
 * © SciNexa Platform — ISEF 2026
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getPersistedItem, setPersistedItem, getPersistedJSON, setPersistedJSON } from './cookies';

// 1. قراءة متغيرات البيئة من Vercel أو .env مع قيم الربط الافتراضية
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://ypkcwndkvhfounqyjhyj.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_JYQGjwQppf7kXWQ0x9XHog_w0EICwb-';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-project-id')
);

// 2. إنشاء عميل Supabase
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// 3. الأنواع (TypeScript Models) المتوافقة مع جداول قاعدة البيانات
export interface DbProfile {
  id: string;
  role: 'student' | 'teacher' | 'admin';
  quad_name: string;
  national_id?: string;
  school_code?: string;
  school_name?: string;
  governorate_id?: string;
  administration_id?: string;
  grade_level?: string;
  teacher_code?: string;
  email?: string;
  xp: number;
  streak: number;
  stars: number;
  created_at?: string;
  updated_at?: string;
}

export interface DbClass {
  id: string;
  name_ar: string;
  name_en: string;
  grade: string;
  teacher_id: string;
  teacher_name_ar: string;
  school_code?: string;
  subject_ar: string;
  subject_en: string;
  accent: string;
  created_at?: string;
}

export interface DbAssignment {
  id: string;
  title_ar: string;
  title_en: string;
  class_id: string;
  class_name_ar: string;
  target_student_quad_name?: string | null;
  teacher_id: string;
  teacher_name_ar: string;
  linked_lab: string;
  due_date_ar: string;
  due_date_en: string;
  description_ar: string;
  description_en: string;
  total_points: number;
  assigned_at: string;
}

export interface DbSubmission {
  id: string;
  assignment_id: string;
  student_quad_name: string;
  score?: number;
  status: 'submitted' | 'graded';
  teacher_feedback?: string;
  submitted_at: string;
}

// 4. خدمات استرجاع وحفظ البيانات مع سوبابيز (مع كاش محلي موثوق)

/**
 * مزامنة ملف المستخدم الشخصي (Google Login أو Onboarding) مع جدول profiles في Supabase
 */
export async function dbUpsertProfile(profile: Partial<DbProfile> & { id: string }): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      const payload = {
        ...profile,
        updated_at: new Date().toISOString(),
      };
      await supabase.from('profiles').upsert([payload]);
    } catch (e) {
      console.warn('Supabase upsert profile error', e);
    }
  }
}

/**
 * جلب ملف المستخدم من Supabase بالـ id
 */
export async function dbFetchProfile(id: string): Promise<DbProfile | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
      if (!error && data) return data as DbProfile;
    } catch (e) {
      console.warn('Supabase fetch profile error', e);
    }
  }
  return null;
}

/**
 * جلب الفصول الدراسية الحقيقية من Supabase
 */
export async function dbFetchClasses(): Promise<DbClass[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('classes').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setPersistedJSON('scinexa_supabase_classes_cache', data);
        return data as DbClass[];
      }
    } catch (e) {
      console.warn('Supabase fetch classes error, falling back to cached store', e);
    }
  }
  return getPersistedJSON<DbClass[]>('scinexa_supabase_classes_cache', []);
}

/**
 * قيام المعلم أو المدير بإنشاء فصل جديد في Supabase
 */
export async function dbCreateClass(newClass: DbClass): Promise<DbClass> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('classes').upsert([newClass]);
    } catch (e) {
      console.warn('Supabase insert class error', e);
    }
  }
  const current = getPersistedJSON<DbClass[]>('scinexa_supabase_classes_cache', []);
  const updated = [newClass, ...current.filter((c) => c.id !== newClass.id)];
  setPersistedJSON('scinexa_supabase_classes_cache', updated);
  return newClass;
}

/**
 * جلب الطلاب المسجلين التابعين لفصل أو مدرسة
 */
export async function dbFetchEnrolledStudents(): Promise<any[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('students_enrollment').select('*').order('enrolled_at', { ascending: false });
      if (!error && data) {
        setPersistedJSON('scinexa_enrolled_students', data);
        return data;
      }
    } catch (e) {
      console.warn('Supabase fetch students error', e);
    }
  }
  return getPersistedJSON<any[]>('scinexa_enrolled_students', []);
}

/**
 * قيام المعلم بإضافة طالب جديد برقم قومي أو اسم رباعي
 */
export async function dbEnrollStudent(student: any): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('students_enrollment').upsert([student]);
      if (student.quad_name) {
        await supabase.from('profiles').upsert([{
          id: student.student_id || student.id,
          role: 'student',
          quad_name: student.quad_name,
          national_id: student.national_id || undefined,
          email: student.email || undefined,
          school_name: student.school_name,
          governorate_id: student.governorate_id,
          administration_id: student.administration_id,
          grade_level: student.grade_level,
          xp: 0,
          streak: student.streak || 0,
          stars: 0,
        }]);
      }
    } catch (e) {
      console.warn('Supabase insert student error', e);
    }
  }
  const current = getPersistedJSON<any[]>('scinexa_enrolled_students', []);
  const updated = [student, ...current.filter((s) => s.id !== student.id)];
  setPersistedJSON('scinexa_enrolled_students', updated);
}

/**
 * جلب الواجبات الحقيقية
 */
export async function dbFetchAssignments(): Promise<DbAssignment[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('assignments').select('*').order('assigned_at', { ascending: false });
      if (!error && data) {
        setPersistedJSON('scinexa_assignments_list', data);
        return data as DbAssignment[];
      }
    } catch (e) {
      console.warn('Supabase fetch assignments error', e);
    }
  }
  return getPersistedJSON<DbAssignment[]>('scinexa_assignments_list', []);
}

/**
 * حفظ واجب جديد في Supabase
 */
export async function dbCreateAssignment(item: DbAssignment): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('assignments').upsert([item]);
    } catch (e) {
      console.warn('Supabase insert assignment error', e);
    }
  }
  const current = getPersistedJSON<DbAssignment[]>('scinexa_assignments_list', []);
  const updated = [item, ...current.filter((a) => a.id !== item.id)];
  setPersistedJSON('scinexa_assignments_list', updated);
}

/**
 * حفظ تسليم واجب أو تقييم في Supabase
 */
export async function dbSubmitAssignment(submission: DbSubmission): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('submissions').upsert([submission]);
    } catch (e) {
      console.warn('Supabase insert submission error', e);
    }
  }
  const current = getPersistedJSON<DbSubmission[]>('scinexa_student_submissions', []);
  const updated = [submission, ...current.filter((s) => s.id !== submission.id)];
  setPersistedJSON('scinexa_student_submissions', updated);
}
