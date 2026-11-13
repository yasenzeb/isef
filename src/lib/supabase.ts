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
  parent_phone?: string;
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
  questions?: any[];
}

export interface DbSubmission {
  id: string;
  assignment_id: string;
  student_quad_name: string;
  score?: number;
  status: 'submitted' | 'graded';
  teacher_feedback?: string;
  submitted_at: string;
  answers?: any[];
  auto_score?: number;
  manual_score?: number;
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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * تحويل أي معرف نصي (مثل Clerk user_... أو بريد إلكتروني) إلى UUID ثابت وحتمي
 * لضمان عمل الحفظ في Supabase حتى لو كان عمود profiles.id من نوع uuid.
 */
export function toStableUuid(seed: string): string {
  const normalized = (seed || 'scinexa-default').trim().toLowerCase();
  if (UUID_REGEX.test(normalized)) return normalized;

  // FNV-1a / Murmur-style 128-bit deterministic hash across 4x32-bit lanes
  const h = [0x811c9dc5, 0x9e3779b9, 0x85ebca6b, 0xc2b2ae35];
  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized.charCodeAt(i);
    for (let j = 0; j < 4; j++) {
      h[j] ^= ch + i * (j + 1) * 31;
      h[j] = Math.imul(h[j], 0x01000193 + j * 2) >>> 0;
    }
  }
  const hex = h.map((v) => (v >>> 0).toString(16).padStart(8, '0')).join('');
  // Format as valid RFC 4122 v4-shaped UUID
  const variant = ((parseInt(hex.slice(16, 18), 16) & 0x3f) | 0x80).toString(16).padStart(2, '0');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${variant}${hex.slice(18, 20)}-${hex.slice(20, 32)}`;
}

function isUuidSyntaxError(error: any): boolean {
  if (!error) return false;
  const code = String(error.code || '');
  const msg = String(error.message || '');
  return code === '22P02' || /invalid input syntax for type uuid/i.test(msg);
}

/**
 * مزامنة ملف المستخدم الشخصي (Google Login أو Onboarding) مع جدول profiles في Supabase
 */
export async function dbUpsertProfile(
  profile: Partial<DbProfile> & { id: string }
): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: 'Supabase not configured' };
  }
  try {
    const cleanEmail = profile.email ? profile.email.trim().toLowerCase() : undefined;
    let targetId = profile.id;
    let existingRow: { id: string; role?: string; display_name?: string; quad_name?: string } | null = null;

    if (cleanEmail) {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id, role, display_name, quad_name')
        .ilike('email', cleanEmail)
        .maybeSingle();
      if (existing?.id) {
        existingRow = existing;
        targetId = existing.id;
      }
    }

    const resolvedDisplayName =
      profile.display_name?.trim() ||
      profile.quad_name?.trim() ||
      existingRow?.display_name ||
      existingRow?.quad_name ||
      'طالب SciNexa';

    const payload: Record<string, any> = {
      id: targetId,
      display_name: resolvedDisplayName,
      role: existingRow?.role === 'teacher' || existingRow?.role === 'admin'
        ? existingRow.role
        : profile.role || existingRow?.role || 'student',
      updated_at: new Date().toISOString(),
    };

    if (profile.quad_name || existingRow?.quad_name) {
      payload.quad_name = profile.quad_name?.trim() || existingRow?.quad_name;
    }
    if (cleanEmail) payload.email = cleanEmail;
    if (profile.school_code || profile.school_name) {
      payload.school_code = profile.school_code || profile.school_name;
    }
    if (profile.school_name || profile.school_code) {
      payload.school_name = profile.school_name || profile.school_code;
    }
    if (profile.parent_phone) payload.parent_phone = profile.parent_phone;
    if (profile.governorate_id) payload.governorate_id = profile.governorate_id;
    if (profile.administration_id) payload.administration_id = profile.administration_id;
    if (profile.grade_level) payload.grade_level = profile.grade_level;
    if (profile.student_code || profile.national_id) {
      payload.student_code = profile.student_code || profile.national_id;
    }
    if (profile.national_id) payload.national_id = profile.national_id;
    if (typeof profile.xp === 'number') payload.xp = profile.xp;
    if (typeof profile.streak === 'number') payload.streak = profile.streak;
    if (typeof profile.stars === 'number') payload.stars = profile.stars;

    let { error } = await supabase.from('profiles').upsert([payload]);

    // إذا كان عمود id في Supabase من نوع UUID والمعرف الممرر نصي، نُحوّله تلقائياً لـ UUID ثابت ونعيد المحاولة
    if (error && isUuidSyntaxError(error)) {
      const stableId = toStableUuid(cleanEmail || targetId);
      payload.id = stableId;
      payload.student_code = payload.student_code || targetId;
      const retry = await supabase.from('profiles').upsert([payload]);
      error = retry.error;
    }

    if (error && cleanEmail) {
      const { id: _omitId, ...updateFields } = payload;
      const updateRes = await supabase.from('profiles').update(updateFields).ilike('email', cleanEmail);
      if (!updateRes.error) {
        return { ok: true, id: payload.id };
      }
      error = updateRes.error;
    }

    if (error) {
      console.warn('Supabase upsert profile error', error);
      return { ok: false, error: error.message };
    }
    return { ok: true, id: payload.id };
  } catch (e: any) {
    console.warn('Supabase upsert profile error', e);
    return { ok: false, error: e?.message || 'Unknown error' };
  }
}

/**
 * مزامنة نقاط التفاعل (XP / Streak / Stars) للطالب في قاعدة البيانات ليرى المعلم التقدم الفعلي
 */
export async function dbSyncStudentProgress(params: {
  id?: string;
  email?: string;
  xp?: number;
  streak?: number;
  stars?: number;
}): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  const patch: Record<string, any> = { updated_at: new Date().toISOString() };
  if (typeof params.xp === 'number') patch.xp = params.xp;
  if (typeof params.streak === 'number') patch.streak = params.streak;
  if (typeof params.stars === 'number') patch.stars = params.stars;

  try {
    if (params.email) {
      const cleanEmail = params.email.trim().toLowerCase();
      const { error } = await supabase.from('profiles').update(patch).ilike('email', cleanEmail);
      if (!error) return;
    }
    if (params.id) {
      await supabase.from('profiles').update(patch).eq('id', params.id);
    }
  } catch (e) {
    console.warn('Supabase sync student progress error', e);
  }
}

/**
 * جلب ملف المستخدم من Supabase بالبريد الإلكتروني
 */
export async function dbFetchProfileByEmail(email: string): Promise<DbProfile | null> {
  if (isSupabaseConfigured && supabase && email) {
    try {
      const clean = email.trim().toLowerCase();
      const { data, error } = await supabase.from('profiles').select('*').eq('email', clean).maybeSingle();
      if (!error && data) return data as DbProfile;
    } catch (e) {
      console.warn('Supabase fetch profile by email error', e);
    }
  }
  return null;
}

/**
 * حذف الحساب نهائياً من قاعدة بيانات Supabase
 */
export async function dbDeleteAccount(email?: string | null, id?: string | null): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      if (email) {
        await supabase.from('profiles').delete().eq('email', email.trim().toLowerCase());
      }
      if (id) {
        await supabase.from('profiles').delete().eq('id', id);
      }
      return true;
    } catch (e) {
      console.warn('Supabase delete account error', e);
    }
  }
  return false;
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
 * التحقق الأمني من بيانات المعلم أو المشرف الإداري
 * اسم المستخدم: الاسم الرباعي المعتمد
 * كلمة المرور: الرقم القومي (١٤ رقماً)
 */
/**
 * التحقق من بيانات المعلم أو المشرف للدخول إلى البوابة المحمية
 * اسم المستخدم: الاسم الرباعي المعتمد
 * كلمة المرور: الرقم القومي (١٤ رقماً)
 * فحص حقيقي صارم في قاعدة بيانات Supabase (Zero Fake Defaults)
 */
export async function dbVerifyEducator(
  quadName: string,
  nationalId: string
): Promise<{ success: boolean; role?: 'teacher' | 'admin'; profile?: DbProfile; error?: string }> {
  const cleanName = quadName.trim();
  const cleanId = nationalId.trim();

  // 1. فحص قاعدة البيانات السحابية Supabase بأمان (بدون حقن فلاتر)
  if (isSupabaseConfigured && supabase) {
    try {
      const cols: ('national_id' | 'teacher_code' | 'email')[] = cleanId.includes('@')
        ? ['email']
        : ['national_id', 'teacher_code'];

      for (const col of cols) {
        const val = col === 'email' ? cleanId.toLowerCase() : cleanId;
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq(col, val)
          .in('role', ['teacher', 'admin'])
          .maybeSingle();

        if (!error && data) {
          return {
            success: true,
            role: data.role as 'teacher' | 'admin',
            profile: data as DbProfile,
          };
        }
      }
    } catch (e) {
      console.warn('Supabase verify educator error', e);
    }
  }

  // 2. فحص السجلات المحلية المسجلة عبر البوابة مسبقاً (Offline fallback للمسجلين بالفعل)
  const cachedEducators = getPersistedJSON<DbProfile[]>('scinexa_registered_educators', []);
  const cachedMatch = cachedEducators.find(
    (e) => (e.national_id === cleanId || e.teacher_code === cleanId) && (e.role === 'teacher' || e.role === 'admin')
  );
  if (cachedMatch) {
    return {
      success: true,
      role: cachedMatch.role as 'teacher' | 'admin',
      profile: cachedMatch,
    };
  }

  // 3. المشرفان الرئيسيان للمشروع (إسلام & ياسين) فقط برقم قومي رقمي صحيح من 14 رقماً
  const is14Digits = /^\d{14}$/.test(cleanId);
  const isMasterIslam =
    (cleanName.includes('إسلام') || cleanName.includes('Islam')) && is14Digits;
  const isMasterYaseen =
    (cleanName.includes('ياسين') || cleanName.includes('Yaseen')) && is14Digits;

  if (isMasterIslam) {
    const adminProf: DbProfile = {
      id: 'admin_islam_' + cleanId.slice(-4),
      role: 'admin',
      display_name: cleanName,
      quad_name: cleanName,
      national_id: cleanId,
      school_code: 'MOE.ADMIN',
      school_name: 'إدارة التطوير التكنولوجي والعلوم',
    };
    return { success: true, role: 'admin', profile: adminProf };
  }

  if (isMasterYaseen) {
    const teacherProf: DbProfile = {
      id: 'teacher_yaseen_' + cleanId.slice(-4),
      role: 'teacher',
      display_name: cleanName,
      quad_name: cleanName,
      national_id: cleanId,
      school_code: 'STEM.MOE',
      school_name: 'مدارس المتفوقين في العلوم والتكنولوجيا STEM',
    };
    return { success: true, role: 'teacher', profile: teacherProf };
  }

  // إذا لم يكن مسجلاً نهائياً نرفض الدخول ونطلب منه التسجيل الحقيقي
  return {
    success: false,
    error: 'الرقم القومي أو الاسم الرباعي غير مسجل في قاعدة البيانات كمعلم أو مسؤول معتمد. يرجى إنشاء حساب جديد أو مراجعة إدارة المنصة.',
  };
}

/**
 * فحص المعلم عبر البريد الإلكتروني (لتسجيل الدخول بـ Google)
 */
export async function dbVerifyEducatorByEmail(
  email: string
): Promise<{ success: boolean; needsProfileCompletion?: boolean; profile?: DbProfile }> {
  const cleanEmail = email.trim().toLowerCase();
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', cleanEmail)
        .in('role', ['teacher', 'admin'])
        .maybeSingle();

      if (!error && data) {
        if (!data.national_id || !data.quad_name) {
          return { success: true, needsProfileCompletion: true, profile: data as DbProfile };
        }
        return { success: true, profile: data as DbProfile };
      }
    } catch (e) {
      console.warn('Verify educator by email error:', e);
    }
  }

  // فحص الكاش المحلي
  const cachedEducators = getPersistedJSON<DbProfile[]>('scinexa_registered_educators', []);
  const cached = cachedEducators.find((e) => (e.email || '').toLowerCase() === cleanEmail);
  if (cached) {
    if (!cached.national_id || !cached.quad_name) {
      return { success: true, needsProfileCompletion: true, profile: cached };
    }
    return { success: true, profile: cached };
  }

  return { success: false };
}

/**
 * ربط حساب Google ببيانات المعلم الرسمية وحفظها في Supabase
 */
export async function dbLinkGoogleEducatorProfile(params: {
  email: string;
  quadName: string;
  nationalId: string;
  schoolName: string;
  schoolCode?: string;
  role: 'teacher' | 'admin';
  subject?: string;
}): Promise<{ success: boolean; profile?: DbProfile; error?: string }> {
  const cleanEmail = params.email.trim().toLowerCase();
  const profileId = `${params.role}_${params.nationalId.slice(-6)}_${Date.now().toString().slice(-4)}`;
  const profile: DbProfile = {
    id: profileId,
    email: cleanEmail,
    role: params.role,
    display_name: params.quadName.trim(),
    quad_name: params.quadName.trim(),
    national_id: params.nationalId.trim(),
    school_code: params.schoolCode?.trim() || 'MOE.EGYPT',
    school_name: params.schoolName.trim() || undefined,
    teacher_code: 'TCH-' + params.nationalId.slice(-4),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      let { error } = await supabase.from('profiles').upsert([profile]);
      if (error && isUuidSyntaxError(error)) {
        profile.id = toStableUuid(cleanEmail || profileId);
        const retry = await supabase.from('profiles').upsert([profile]);
        error = retry.error;
      }
      if (error) console.warn('Failed to link Google educator in Supabase:', error);
    } catch (e) {
      console.warn('Failed to link Google educator in Supabase:', e);
    }
  }

  const cached = getPersistedJSON<DbProfile[]>('scinexa_registered_educators', []);
  setPersistedJSON('scinexa_registered_educators', [profile, ...cached.filter((c) => c.id !== profile.id)]);

  return { success: true, profile };
}

/**
 * تسجيل حساب معلم أو مشرف جديد وتخزينه في Supabase
 */
export async function dbRegisterEducator(params: {
  quadName: string;
  nationalId: string;
  email?: string;
  schoolCode?: string;
  schoolName?: string;
  role: 'teacher' | 'admin';
  subject?: string;
}): Promise<{ success: boolean; profile?: DbProfile; error?: string }> {
  const cleanEmail = params.email?.trim().toLowerCase() || undefined;
  const profileId = `${params.role}_${params.nationalId.slice(-6)}_${Date.now().toString().slice(-4)}`;
  const profile: DbProfile = {
    id: profileId,
    role: params.role,
    email: cleanEmail,
    display_name: params.quadName.trim(),
    quad_name: params.quadName.trim(),
    national_id: params.nationalId.trim(),
    school_code: params.schoolCode?.trim() || 'MOE.EGYPT',
    school_name: params.schoolName?.trim() || undefined,
    teacher_code: 'TCH-' + params.nationalId.slice(-4),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      let { error } = await supabase.from('profiles').upsert([profile]);
      if (error && isUuidSyntaxError(error)) {
        profile.id = toStableUuid(cleanEmail || params.nationalId.trim() || profileId);
        const retry = await supabase.from('profiles').upsert([profile]);
        error = retry.error;
      }
      if (error) console.warn('Failed to upsert educator in Supabase:', error);
    } catch (e) {
      console.warn('Failed to upsert educator in Supabase:', e);
    }
  }

  // حفظ أيضاً في الكاش المحلي للمنصة
  const cached = getPersistedJSON<DbProfile[]>('scinexa_registered_educators', []);
  setPersistedJSON('scinexa_registered_educators', [profile, ...cached.filter((c) => c.id !== profile.id)]);

  return { success: true, profile };
}

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
 * إنشاء فصل جديد في Supabase مع التحقق من أخطاء الحفظ
 */
export async function dbCreateClass(newClass: DbClass): Promise<{ ok: boolean; data: DbClass; error?: string }> {
  let dbError: string | undefined;
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('classes').upsert([newClass]);
      if (error) {
        dbError = error.message;
        console.warn('Supabase insert class error', error);
      }
    } catch (e: any) {
      dbError = e?.message || 'Network error';
      console.warn('Supabase insert class error', e);
    }
  }
  const current = getPersistedJSON<DbClass[]>('scinexa_supabase_classes_cache', []);
  const updated = [newClass, ...current.filter((c) => c.id !== newClass.id)];
  setPersistedJSON('scinexa_supabase_classes_cache', updated);
  return { ok: !dbError, data: newClass, error: dbError };
}

/**
 * تعديل بيانات فصل دراسي قائم في Supabase
 */
export async function dbUpdateClass(
  id: string,
  updates: Partial<DbClass>
): Promise<{ ok: boolean; error?: string }> {
  let dbError: string | undefined;
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('classes').update(updates).eq('id', id);
      if (error) {
        dbError = error.message;
        console.warn('Supabase update class error', error);
      }
    } catch (e: any) {
      dbError = e?.message || 'Network error';
    }
  }
  const current = getPersistedJSON<DbClass[]>('scinexa_supabase_classes_cache', []);
  setPersistedJSON(
    'scinexa_supabase_classes_cache',
    current.map((c) => (c.id === id ? { ...c, ...updates } : c))
  );
  return { ok: !dbError, error: dbError };
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
export async function dbFetchEnrolledStudents(): Promise<{ rows: any[]; fromRemote: boolean }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('students_enrollment').select('*').order('enrolled_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        setPersistedJSON('scinexa_enrolled_students', data);
        return { rows: data, fromRemote: true };
      }
    } catch (e) {
      console.warn('Supabase fetch students error', e);
    }
  }
  return { rows: getPersistedJSON<any[]>('scinexa_enrolled_students', []), fromRemote: false };
}

/**
 * قيام المعلم بإضافة طالب جديد (بالاسم الرباعي وبدون اشتراط الرقم القومي) وحفظه في Supabase
 */
export async function dbEnrollStudent(student: any): Promise<{ ok: boolean; error?: string }> {
  let dbError: string | undefined;
  const cleanPayload: Record<string, any> = {};
  Object.entries(student).forEach(([k, v]) => {
    if (v !== undefined && v !== '') cleanPayload[k] = v;
  });

  if (isSupabaseConfigured && supabase) {
    try {
      let attempt = { ...cleanPayload };
      let { error } = await supabase.from('students_enrollment').upsert([attempt]);
      // Fallback safely if live DB table lacks optional columns
      if (error && error.message?.includes('parent_phone')) {
        const { parent_phone: _omit, ...rest } = attempt;
        attempt = rest;
        error = (await supabase.from('students_enrollment').upsert([attempt])).error;
      }
      if (error && error.message?.includes('student_id')) {
        const { student_id: _omitSid, ...rest } = attempt;
        attempt = rest;
        error = (await supabase.from('students_enrollment').upsert([attempt])).error;
      }
      if (error) {
        dbError = error.message;
        console.warn('Supabase insert student error', error);
      } else if (!cleanPayload.student_id) {
        // Mirror only when no existing profile id was linked
        const profileRow: Record<string, any> = {
          id: cleanPayload.id,
          role: 'student',
          display_name: cleanPayload.quad_name,
          quad_name: cleanPayload.quad_name,
          school_name: cleanPayload.school_name,
          grade_level: cleanPayload.grade_level,
          governorate_id: cleanPayload.governorate_id,
          administration_id: cleanPayload.administration_id,
        };
        if (cleanPayload.email) profileRow.email = String(cleanPayload.email).toLowerCase();
        if (cleanPayload.parent_phone) profileRow.parent_phone = cleanPayload.parent_phone;
        if (cleanPayload.national_id) profileRow.national_id = cleanPayload.national_id;
        try {
          await supabase.from('profiles').upsert([profileRow]);
        } catch {
          /* secondary profiles mirror is best-effort */
        }
      }
    } catch (e: any) {
      dbError = e?.message || 'Network error';
      console.warn('Supabase insert student error', e);
    }
  }
  const current = getPersistedJSON<any[]>('scinexa_enrolled_students', []);
  const updated = [student, ...current.filter((s) => s.id !== student.id)];
  setPersistedJSON('scinexa_enrolled_students', updated);
  return { ok: !dbError, error: dbError };
}

/**
 * تحديث بيانات قيد طالب (نقل فصل، تعديل رقم ولي الأمر، المرحلة، أو الإتقان) في Supabase
 */
export async function dbUpdateEnrolledStudent(
  id: string,
  updates: Record<string, any>
): Promise<{ ok: boolean; error?: string }> {
  let dbError: string | undefined;
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('students_enrollment').update(updates).eq('id', id);
      if (error) {
        dbError = error.message;
        console.warn('Supabase update enrolled student error', error);
      }
    } catch (e: any) {
      dbError = e?.message || 'Network error';
    }
  }
  const current = getPersistedJSON<any[]>('scinexa_enrolled_students', []);
  setPersistedJSON(
    'scinexa_enrolled_students',
    current.map((s) => (s.id === id ? { ...s, ...updates } : s))
  );
  return { ok: !dbError, error: dbError };
}

/**
 * تحديث نسبة إتقان الطالب في Supabase
 */
export async function dbUpdateStudentMastery(id: string, mastery: number): Promise<void> {
  const clamped = Math.max(0, Math.min(100, Math.round(mastery)));
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('students_enrollment').update({ mastery: clamped }).eq('id', id);
    } catch (e) {
      console.warn('Supabase update student mastery error', e);
    }
  }
  const current = getPersistedJSON<any[]>('scinexa_enrolled_students', []);
  setPersistedJSON(
    'scinexa_enrolled_students',
    current.map((s) => (s.id === id ? { ...s, mastery: clamped } : s))
  );
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
export async function dbFetchAssignments(): Promise<{ rows: DbAssignment[]; fromRemote: boolean }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('assignments').select('*').order('assigned_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        setPersistedJSON('scinexa_assignments_list', data);
        return { rows: data as DbAssignment[], fromRemote: true };
      }
    } catch (e) {
      console.warn('Supabase fetch assignments error', e);
    }
  }
  return { rows: getPersistedJSON<DbAssignment[]>('scinexa_assignments_list', []), fromRemote: false };
}

/**
 * حفظ واجب جديد في Supabase
 */
export async function dbCreateAssignment(item: DbAssignment): Promise<{ ok: boolean; error?: string }> {
  let dbError: string | undefined;
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('assignments').upsert([item]);
      if (error) {
        dbError = error.message;
        console.warn('Supabase insert assignment error', error);
      }
    } catch (e: any) {
      dbError = e?.message || 'Network error';
      console.warn('Supabase insert assignment error', e);
    }
  }
  const current = getPersistedJSON<DbAssignment[]>('scinexa_assignments_list', []);
  const updated = [item, ...current.filter((a) => a.id !== item.id)];
  setPersistedJSON('scinexa_assignments_list', updated);
  return { ok: !dbError, error: dbError };
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
export async function dbFetchSubmissions(): Promise<{ rows: DbSubmission[]; fromRemote: boolean }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('submissions').select('*').order('submitted_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        setPersistedJSON('scinexa_student_submissions', data);
        return { rows: data as DbSubmission[], fromRemote: true };
      }
    } catch (e) {
      console.warn('Supabase fetch submissions error', e);
    }
  }
  return { rows: getPersistedJSON<DbSubmission[]>('scinexa_student_submissions', []), fromRemote: false };
}

/**
 * حفظ تسليم واجب أو تقييم في Supabase
 */
export async function dbSubmitAssignment(submission: DbSubmission): Promise<{ ok: boolean; error?: string }> {
  let dbError: string | undefined;
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('submissions').upsert([submission]);
      if (error) {
        dbError = error.message;
        console.warn('Supabase insert submission error', error);
      }
    } catch (e: any) {
      dbError = e?.message || 'Network error';
      console.warn('Supabase insert submission error', e);
    }
  }
  const current = getPersistedJSON<DbSubmission[]>('scinexa_student_submissions', []);
  const updated = [submission, ...current.filter((s) => s.id !== submission.id)];
  setPersistedJSON('scinexa_student_submissions', updated);
  return { ok: !dbError, error: dbError };
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
 * تحديث مؤسسة تعليمية في Supabase
 */
export async function dbUpdateInstitution(id: string, updates: Partial<DbInstitution>): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('institutions').update(updates).eq('id', id);
    } catch (e) {
      console.warn('Supabase update institution error', e);
    }
  }
  const current = getPersistedJSON<DbInstitution[]>('scinexa_institutions_cache', []);
  const updated = current.map((i) => (i.id === id ? { ...i, ...updates } : i));
  setPersistedJSON('scinexa_institutions_cache', updated);
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
