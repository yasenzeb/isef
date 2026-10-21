/**
 * supabase.ts — Supabase client (browser-side)
 * Uses VITE_ public env vars — safe to expose in the frontend.
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL      as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[SciNexa] Supabase env vars missing — check Vercel environment variables.');
}

export const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '', {
  auth: {
    autoRefreshToken:    true,
    persistSession:      true,
    detectSessionInUrl:  false,  // We handle OAuth code exchange manually in AuthContext
  },
});

// ── Types ────────────────────────────────────────────────────────────────────
export type UserRole = 'student' | 'teacher' | 'principal' | 'admin';

export interface SciNexaProfile {
  id:             string;
  email:          string;
  displayName:    string;
  role:           UserRole;
  isGuest?:       boolean;
  schoolCode?:    string;
  studentCode?:   string;
  governorate?:   string;
  governorateAr?: string;
  administrationAr?: string;
  age?:           number;
  birthday?:      string;
  gender?:        'male' | 'female';
  grade?:         string;
  avatarUrl?:     string;
  createdAt?:     string;
}

// ── Egyptian Governorates Keyword Map ───────────────────────────────────────
export const GOVERNORATE_KEYWORD_MAP: Record<string, string> = {
  dakahliya: 'الدقهلية',
  dakahlia:  'الدقهلية',
  cairo:     'القاهرة',
  giza:      'الجيزة',
  alex:      'الإسكندرية',
  alexandria:'الإسكندرية',
  qalyubia:  'القليوبية',
  kalyoubia: 'القليوبية',
  sharqia:   'الشرقية',
  sharkia:   'الشرقية',
  gharbia:   'الغربية',
  monufia:   'المنوفية',
  menofia:   'المنوفية',
  beheira:   'البحيرة',
  behera:    'البحيرة',
  kafr:      'كفر الشيخ',
  kafrelsheikh:'كفر الشيخ',
  damietta:  'دمياط',
  port:      'بورسعيد',
  portsaid:  'بورسعيد',
  ismailia:  'الإسماعيلية',
  suez:      'السويس',
  fayoum:    'الفيوم',
  fayum:     'الفيوم',
  beni:      'بني سويف',
  benisuef:  'بني سويف',
  minya:     'المنيا',
  asyut:     'أسيوط',
  assiut:    'أسيوط',
  sohag:     'سوهاج',
  qena:      'قنا',
  luxor:     'الأقصر',
  aswan:     'أسوان',
  redsea:    'البحر الأحمر',
  wadi:      'الوادي الجديد',
  matrouh:   'مطروح',
  sinai:     'سيناء',
};

// ── Allowed email domains (Ministry of Education Egypt & Institutional) ──────
export const ALLOWED_PATTERNS = [
  /\.edu\.eg$/i,
  /@moe\.gov\.eg$/i,
  /@emoe\.org$/i,
  /@students\./i,
  /@teachers\./i,
  /\.moe\.edu\.eg$/i,
];

export function isMinistryEmail(email: string): boolean {
  const e = email.toLowerCase().trim();
  if (!e.includes('@')) return false;
  return ALLOWED_PATTERNS.some(pattern => pattern.test(e));
}

/** Detect role, school/governorate, and student code from Egyptian Unified Email */
export function detectRoleFromEmail(email: string): {
  role: UserRole;
  roleLabelAr: string;
  roleLabelEn: string;
  schoolCode?: string;
  studentCode?: string;
  governorate?: string;
  governorateAr?: string;
} {
  const e = email.toLowerCase().trim();

  // Always extract numeric code if email starts with digits (e.g. 12345678@...)
  const numCodeMatch = e.match(/^(\d+)/);
  const detectedStudentCode = numCodeMatch ? numCodeMatch[1] : undefined;

  // Extract governorate keyword from domain
  let detectedGovEn = '';
  let detectedGovAr = '';
  for (const [key, arName] of Object.entries(GOVERNORATE_KEYWORD_MAP)) {
    if (e.includes(key)) {
      detectedGovEn = key.toUpperCase();
      detectedGovAr = arName;
      break;
    }
  }

  // Pattern 1: Egyptian Unified Student/Teacher Email: e.g. code@governorate.moe.edu.eg
  const moeMatch = e.match(/^([0-9a-zA-Z_.-]+)@([a-zA-Z0-9_-]+)\.moe\.edu\.eg$/);
  if (moeMatch) {
    const rawUserPart = moeMatch[1];
    const rawDomainPart = moeMatch[2].toUpperCase();
    const isStudent = !!detectedStudentCode;

    return {
      role: isStudent ? 'student' : 'teacher',
      roleLabelAr: isStudent ? 'طالب (الحساب الموحد)' : 'معلم (الحساب الموحد)',
      roleLabelEn: isStudent ? 'Student (Unified)' : 'Teacher (Unified)',
      studentCode: detectedStudentCode || rawUserPart,
      governorate: detectedGovEn || rawDomainPart,
      governorateAr: detectedGovAr || 'وزارة التربية والتعليم',
      schoolCode: `${rawDomainPart}_DIR`,
    };
  }

  // Pattern 2: @students.<school>.edu.eg
  const studentSubMatch = e.match(/^([^@]+)@students\.(.+)\.edu\.eg$/);
  if (studentSubMatch) {
    return {
      role: 'student',
      roleLabelAr: 'طالب (مدرسي)',
      roleLabelEn: 'Student',
      studentCode: detectedStudentCode || studentSubMatch[1].toUpperCase(),
      governorate: detectedGovEn || 'EG',
      governorateAr: detectedGovAr || 'وزارة التربية والتعليم',
      schoolCode: studentSubMatch[2].toUpperCase().replace(/\./g, '_'),
    };
  }

  // Pattern 3: @teachers.<school>.edu.eg
  const teacherSubMatch = e.match(/^[^@]+@teachers\.(.+)\.edu\.eg$/);
  if (teacherSubMatch) {
    return {
      role: 'teacher',
      roleLabelAr: 'معلم / كادر تعليمي',
      roleLabelEn: 'Teacher',
      governorate: detectedGovEn || 'EG',
      governorateAr: detectedGovAr || 'وزارة التربية والتعليم',
      schoolCode: teacherSubMatch[1].toUpperCase().replace(/\./g, '_'),
    };
  }

  // Pattern 4: @principal / @admin
  const principalMatch = e.match(/^[^@]+@(?:principal|admin)\.(.+)\.edu\.eg$/);
  if (principalMatch) {
    return {
      role: 'principal',
      roleLabelAr: 'مدير مدرسة / قيادة',
      roleLabelEn: 'Principal',
      governorate: detectedGovEn || 'EG',
      governorateAr: detectedGovAr || 'وزارة التربية والتعليم',
      schoolCode: principalMatch[1].toUpperCase().replace(/\./g, '_'),
    };
  }

  // Pattern 5: Central Ministry (@moe.gov.eg)
  if (e.endsWith('@moe.gov.eg') || e.endsWith('@emoe.org')) {
    return {
      role: 'admin',
      roleLabelAr: 'إدارة وزارة التربية والتعليم',
      roleLabelEn: 'Ministry Admin',
      governorate: 'MOE_CENTRAL',
      governorateAr: 'ديوان وزارة التربية والتعليم',
      schoolCode: 'MOE_CENTRAL',
    };
  }

  // Pattern 6: Generic .edu.eg
  if (e.endsWith('.edu.eg')) {
    const domain = e.split('@')[1];
    const schoolCode = domain.replace('.edu.eg', '').toUpperCase().replace(/\./g, '_');
    return {
      role: detectedStudentCode ? 'student' : 'student',
      roleLabelAr: detectedStudentCode ? 'طالب رسمي' : 'عضو مؤسسي',
      roleLabelEn: 'Institutional User',
      studentCode: detectedStudentCode,
      governorate: detectedGovEn || 'EG',
      governorateAr: detectedGovAr || 'وزارة التربية والتعليم',
      schoolCode,
    };
  }

  return {
    role: 'student',
    roleLabelAr: 'طالب',
    roleLabelEn: 'Student',
    studentCode: detectedStudentCode,
    governorateAr: detectedGovAr,
  };
}
