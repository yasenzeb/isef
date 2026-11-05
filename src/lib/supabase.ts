/**
 * supabase.ts
 * تهيئة العميل البرمجي لـ Supabase والتزامن التلقائي مع قاعدة البيانات السحابية
 * (VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY)
 *
 * يوفر استعلامات حقيقية للفصول، الطلاب المسجلين، الواجبات، التقييمات، المؤسسات، ومستخدمي النظام.
 *
 * © SciNexa Platform — ISEF 2026
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getPersistedJSON, setPersistedJSON } from './cookies';

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

// 3. الأنواع (TypeScript Models) المتوافقة مع جداول قاعدة البيانات الحقيقية
export interface DbProfile {
  id: string;
  role: 'student' | 'teacher' | 'admin';
  display_name?: string;
  quad_name?: string;
  national_id?: string;
  student_code?: string;
  school_code?: string;
  school_name?: string;
  governorate_id?: string;
  administration_id?: string;
  grade_level?: string;
  teacher_code?: string;
  email?: string;
  xp?: number;
  streak?: number;
  stars?: number;
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

export interface DbInstitution {
  id: string;
  name_ar: string;
  name_en: string;
  city_ar: string;
  city_en: string;
  users_count?: number;
  labs_count?: number;
  status: 'active' | 'trial';
  created_at?: string;
}

// 4. خدمات استرجاع وحفظ وحذف البيانات مع سوبابيز (Zero Fake Data)

/**
 * مزامنة ملف المستخدم الشخصي (Google Login أو Onboarding) مع جدول profiles في Supabase
 */
export async function dbUpsertProfile(profile: Partial<DbProfile> & { id: string }): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      let targetId = profile.id;
      if (profile.email) {
        const { data: existing } = await supabase.from('profiles').select('id').eq('email', profile.email).maybeSingle();
        if (existing?.id) {
          targetId = existing.id;
        }
      }

      const payload: Record<string, any> = {
        id: targetId,
        display_name: profile.display_name || profile.quad_name || 'مستخدم',
        role: profile.role || 'student',
        email: profile.email || undefined,
        school_code: profile.school_code || undefined,
        student_code: profile.student_code || profile.national_id || undefined,
      };

      const { error } = await supabase.from('profiles').upsert([payload]);
      if (error && profile.email) {
        // Fallback: update by email if UUID primary key prevents inserting non-UUID id
        await supabase.from('profiles').update({
          display_name: payload.display_name,
          school_code: payload.school_code,
          student_code: payload.student_code,
        }).eq('email', profile.email);
      }
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
 * جلب جميع المستخدمين المسجلين في Supabase
 */
export async function dbFetchAllProfiles(): Promise<DbProfile[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        return data as DbProfile[];
      }
    } catch (e) {
      console.warn('Supabase fetch all profiles error', e);
    }
  }
  return [];
}

/**
 * تحديث دور المستخدم في Supabase (طالب / معلم / إدارة)
 */
export async function dbUpdateProfileRole(id: string, role: 'student' | 'teacher' | 'admin'): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('profiles').update({ role }).eq('id', id);
    } catch (e) {
      console.warn('Supabase update profile role error', e);
    }
  }
}

/**
 * حذف مستخدم من جدول profiles
 */
export async function dbDeleteProfile(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('profiles').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete profile error', e);
    }
  }
}

/**
 * جلب الفصول الدراسية الحقيقية من Supabase
 */
export async function dbFetchClasses(): Promise<DbClass[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('classes').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        setPersistedJSON('scinexa_supabase_classes_cache', data);
        return data as DbClass[];
      }
    } catch (e) {
      console.warn('Supabase fetch classes error', e);
    }
  }
  return getPersistedJSON<DbClass[]>('scinexa_supabase_classes_cache', []);
}

/**
 * إنشاء فصل جديد في Supabase
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
 * حذف فصل دراسي من Supabase
 */
export async function dbDeleteClass(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('classes').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete class error', e);
    }
  }
  const current = getPersistedJSON<DbClass[]>('scinexa_supabase_classes_cache', []);
  setPersistedJSON('scinexa_supabase_classes_cache', current.filter((c) => c.id !== id));
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
    } catch (e) {
      console.warn('Supabase insert student error', e);
    }
  }
  const current = getPersistedJSON<any[]>('scinexa_enrolled_students', []);
  const updated = [student, ...current.filter((s) => s.id !== student.id)];
  setPersistedJSON('scinexa_enrolled_students', updated);
}

/**
 * حذف طالب مسجل من Supabase
 */
export async function dbDeleteEnrolledStudent(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('students_enrollment').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete enrolled student error', e);
    }
  }
  const current = getPersistedJSON<any[]>('scinexa_enrolled_students', []);
  setPersistedJSON('scinexa_enrolled_students', current.filter((s) => s.id !== id));
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
 * حذف واجب من Supabase
 */
export async function dbDeleteAssignment(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('assignments').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete assignment error', e);
    }
  }
  const current = getPersistedJSON<DbAssignment[]>('scinexa_assignments_list', []);
  setPersistedJSON('scinexa_assignments_list', current.filter((a) => a.id !== id));
}

/**
 * جلب التسليمات الحقيقية
 */
export async function dbFetchSubmissions(): Promise<DbSubmission[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('submissions').select('*').order('submitted_at', { ascending: false });
      if (!error && data) {
        setPersistedJSON('scinexa_student_submissions', data);
        return data as DbSubmission[];
      }
    } catch (e) {
      console.warn('Supabase fetch submissions error', e);
    }
  }
  return getPersistedJSON<DbSubmission[]>('scinexa_student_submissions', []);
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

/**
 * جلب المؤسسات التعليمية من Supabase
 */
export async function dbFetchInstitutions(): Promise<DbInstitution[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('institutions').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        setPersistedJSON('scinexa_institutions_cache', data);
        return data as DbInstitution[];
      }
    } catch (e) {
      // Table might not exist yet before SQL migration, fallback to local storage
    }
  }
  return getPersistedJSON<DbInstitution[]>('scinexa_institutions_cache', []);
}

/**
 * إنشاء مؤسسة تعليمية في Supabase
 */
export async function dbCreateInstitution(inst: DbInstitution): Promise<DbInstitution> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('institutions').upsert([inst]);
    } catch (e) {
      console.warn('Supabase insert institution error', e);
    }
  }
  const current = getPersistedJSON<DbInstitution[]>('scinexa_institutions_cache', []);
  const updated = [inst, ...current.filter((i) => i.id !== inst.id)];
  setPersistedJSON('scinexa_institutions_cache', updated);
  return inst;
}

/**
 * حذف مؤسسة تعليمية من Supabase
 */
export async function dbDeleteInstitution(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('institutions').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete institution error', e);
    }
  }
  const current = getPersistedJSON<DbInstitution[]>('scinexa_institutions_cache', []);
  setPersistedJSON('scinexa_institutions_cache', current.filter((i) => i.id !== id));
}
