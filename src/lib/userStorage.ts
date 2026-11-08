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
