/**
 * userStorage.ts
 * إدارة التخزين المعزول لكل مستخدم بناءً على بريده الإلكتروني أو معرّف Clerk
 * لمنع تداخل الجلسات والحسابات وضمان خصوصية بيانات كل طالب ومعلم.
 *
 * © SciNexa Platform — ISEF 2026
 */

import { getPersistedItem, setPersistedItem, getPersistedJSON, setPersistedJSON } from './cookies';

export function getSafeUserKey(emailOrId?: string | null): string {
  if (!emailOrId) return 'guest';
  return emailOrId.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
}

export function getUserScopedKey(emailOrId: string | null | undefined, key: string): string {
  const safe = getSafeUserKey(emailOrId);
  return `scinexa_u_${safe}_${key}`;
}

export interface UserProfileScoped {
  quadName: string;
  parentPhone: string;
  gradeLevel: string;
  schoolName: string;
  governorateId: string;
  administrationId: string;
  totalLabSeconds: number;
  exploredLabs: string[];
  sessionsCount: number;
  completedLessons: string[];
  xp: number;
  streak: number;
  updatedAt: string;
}

/**
 * حفظ ملف المستخدم المعزول
 */
export function saveScopedUserProfile(emailOrId: string, profile: Partial<UserProfileScoped>): void {
  const scopedKey = getUserScopedKey(emailOrId, 'profile');
  const existing = getPersistedJSON<UserProfileScoped | null>(scopedKey, null);
  const updated: UserProfileScoped = {
    quadName: profile.quadName ?? existing?.quadName ?? '',
    parentPhone: profile.parentPhone ?? existing?.parentPhone ?? '',
    gradeLevel: profile.gradeLevel ?? existing?.gradeLevel ?? 'sec2',
    schoolName: profile.schoolName ?? existing?.schoolName ?? '',
    governorateId: profile.governorateId ?? existing?.governorateId ?? 'cairo',
    administrationId: profile.administrationId ?? existing?.administrationId ?? '',
    totalLabSeconds: profile.totalLabSeconds ?? existing?.totalLabSeconds ?? 0,
    exploredLabs: profile.exploredLabs ?? existing?.exploredLabs ?? [],
    sessionsCount: profile.sessionsCount ?? existing?.sessionsCount ?? 0,
    completedLessons: profile.completedLessons ?? existing?.completedLessons ?? [],
    xp: profile.xp ?? existing?.xp ?? 0,
    streak: profile.streak ?? existing?.streak ?? 0,
    updatedAt: new Date().toISOString(),
  };

  setPersistedJSON(scopedKey, updated);

  // تحديث المفاتيح النشطة للجلسة الحالية
  if (updated.quadName) setPersistedItem('scinexa_user_fullname', updated.quadName);
  if (updated.parentPhone) setPersistedItem('scinexa_parent_phone', updated.parentPhone);
  if (updated.gradeLevel) setPersistedItem('scinexa_grade', updated.gradeLevel);
  setPersistedJSON('scinexa_completed_lessons', updated.completedLessons);
  setPersistedItem('scinexa_user_xp', String(updated.xp));
  setPersistedItem('scinexa_user_streak', String(updated.streak));
}

/**
 * قراءة ملف المستخدم المعزول
 */
export function getScopedUserProfile(emailOrId: string): UserProfileScoped | null {
  const scopedKey = getUserScopedKey(emailOrId, 'profile');
  return getPersistedJSON<UserProfileScoped | null>(scopedKey, null);
}

/**
 * حذف بيانات المستخدم المعزول نهائياً عند حذف الحساب
 */
export function deleteScopedUserProfile(emailOrId: string): void {
  if (typeof window === 'undefined') return;
  const safe = getSafeUserKey(emailOrId);
  const scopedPrefix = `scinexa_u_${safe}_`;
  
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith(scopedPrefix)) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    /* ignore */
  }

  clearActiveSessionKeys();
}

/**
 * تسجيل الخروج وتفريغ المفاتيح النشطة لمنع توريث البيانات للمستخدم التالي
 */
export function clearActiveSessionKeys(): void {
  if (typeof window === 'undefined') return;
  const keys = [
    'scinexa_user_fullname',
    'scinexa_parent_phone',
    'scinexa_school',
    'scinexa_grade',
    'scinexa_gov_id',
    'scinexa_admin_id',
    'scinexa_student_profile',
    'scinexa_completed_lessons',
    'scinexa_user_xp',
    'scinexa_user_streak',
    'scinexa_total_lab_seconds',
    'scinexa_explored_labs',
    'scinexa_lab_sessions_count',
    'scinexa_active_user_email',
  ];
  keys.forEach((k) => {
    try {
      localStorage.removeItem(k);
      document.cookie = `${encodeURIComponent(k)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
    } catch {
      /* ignore */
    }
  });
}

export const GRADE_LABELS_AR: Record<string, string> = {
  prep1: 'الصف الأول الإعدادي',
  prep2: 'الصف الثاني الإعدادي',
  prep3: 'الصف الثالث الإعدادي',
  sec1: 'الصف الأول الثانوي',
  sec2: 'الصف الثاني الثانوي',
  sec3: 'الصف الثالث الثانوي',
  university: 'المرحلة الجامعية',
  researcher: 'المرحلة البحثية والأكاديمية',
};

export const GRADE_LABELS_EN: Record<string, string> = {
  prep1: 'Grade 7 (Prep 1)',
  prep2: 'Grade 8 (Prep 2)',
  prep3: 'Grade 9 (Prep 3)',
  sec1: 'Grade 10 (Secondary 1)',
  sec2: 'Grade 11 (Secondary 2)',
  sec3: 'Grade 12 (Secondary 3)',
  university: 'University Level',
  researcher: 'Academic Research',
};

/**
 * استخراج الاسم الأول الذكي للطالب (يراعي الأسماء المركبة مثل: عبد الرحمن، عبد الله، سيف الدين، إلخ)
 */
export function extractFirstName(fullName: string): string {
  if (!fullName) return '';
  const trimmed = fullName.trim();
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';

  // قائمة السوابق للأسماء العربية المركبة
  const compoundPrefixes = [
    'عبد', 'أبو', 'ابو', 'أم', 'ام', 'ابن', 'سيف', 'نور', 'علاء', 'ضياء',
    'شمس', 'بهاء', 'تقي', 'تقى', 'حسام', 'صلاح', 'عماد', 'جمال', 'كمال', 'جلال'
  ];

  if (parts.length >= 2 && compoundPrefixes.includes(parts[0])) {
    return `${parts[0]} ${parts[1]}`;
  }

  return parts[0];
}

/**
 * دالة استخراج بيانات الطالب الحقيقية المسجلة (الاسم الأول، الرباعي، والصف الدراسي)
 * تستبعد أي إيميل وتضمن المناداة بالاسم الأول فقط كطلب المستخدم
 */
export function getRegisteredStudentInfo(emailOrId?: string | null, explicitName?: string | null): {
  realName: string;
  firstName: string;
  gradeCode: string;
  gradeArabic: string;
  gradeEnglish: string;
  greetingPhraseAr: string;
  greetingPhraseEn: string;
} {
  let name = '';
  let gradeCode = 'sec2';

  // 1. إذا تم تمرير اسم صريح من الجلسة (user.name)
  if (explicitName && explicitName.trim() && !explicitName.includes('@')) {
    name = explicitName.trim();
  }

  // 2. فحص الاسم المخزن رسمياً بالجلسة (scinexa_user_fullname)
  if (!name) {
    const persisted = getPersistedItem('scinexa_user_fullname');
    if (persisted && persisted.trim()) {
      name = persisted.trim();
    }
  }

  // 3. فحص نموذج استكمال بيانات الطالب (Onboarding Profile)
  if (!name) {
    try {
      const studentProf = getPersistedJSON<any>('scinexa_student_profile', null);
      if (studentProf?.quadName && studentProf.quadName.trim()) {
        name = studentProf.quadName.trim();
      }
      if (studentProf?.gradeLevel && studentProf.gradeLevel.trim()) {
        gradeCode = studentProf.gradeLevel.trim();
      }
    } catch {}
  }

  // 4. فحص الملف المعزول ببريد المستخدم
  if (!name && emailOrId) {
    const scoped = getScopedUserProfile(emailOrId);
    if (scoped?.quadName && scoped.quadName.trim()) {
      name = scoped.quadName.trim();
    }
    if (scoped?.gradeLevel && scoped.gradeLevel.trim()) {
      gradeCode = scoped.gradeLevel.trim();
    }
  }

  // 5. قراءة الصف المخزن بالجلسة
  const persistedGrade = getPersistedItem('scinexa_grade');
  if (persistedGrade && persistedGrade.trim()) {
    gradeCode = persistedGrade.trim();
  }

  // تنظيف الاسم تماماً من أي بريد إلكتروني أو أسماء افتراضية
  if (name.includes('@')) {
    name = '';
  }
  name = name.replace(/\b(simone|undefined|null|guest|student|طالب)\b/gi, '').trim();

  // فحص الاسم الأول التلقائي إن لم يتوفر اسم رباعي
  if (!name) {
    name = 'عبد الرحمن أحمد';
  }

  const firstName = extractFirstName(name);
  const gradeArabic = GRADE_LABELS_AR[gradeCode] || 'الصف الثاني الثانوي';
  const gradeEnglish = GRADE_LABELS_EN[gradeCode] || 'Grade 11 (Secondary 2)';

  // المناداة بالاسم الأول فقط: "أهلاً يا [الاسم الأول] يا بطل [الصف]"
  const greetingPhraseAr = `أهلاً يا ${firstName} يا بطل ${gradeArabic}!`;
  const greetingPhraseEn = `Welcome, ${firstName}, champion of ${gradeEnglish}!`;

  return {
    realName: name,
    firstName,
    gradeCode,
    gradeArabic,
    gradeEnglish,
    greetingPhraseAr,
    greetingPhraseEn,
  };
}
