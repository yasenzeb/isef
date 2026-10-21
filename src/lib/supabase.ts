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
    detectSessionInUrl:  true,
  },
});

// ── Types ────────────────────────────────────────────────────────────────────
export type UserRole = 'student' | 'teacher' | 'principal' | 'admin';

export interface SciNexaProfile {
  id:            string;
  email:         string;
  displayName:   string;
  role:          UserRole;
  schoolCode?:   string;
  studentCode?:  string;
  governorate?:  string;
  age?:          number;
  birthday?:     string;
  gender?:       'male' | 'female';
  avatarUrl?:    string;
  createdAt?:    string;
}

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
} {
  const e = email.toLowerCase().trim();

  // Pattern 1: Egyptian Unified Student Email: e.g. 12345678@cairo1.moe.edu.eg or 12345678@qalyubia.moe.edu.eg
  const moeMatch = e.match(/^([0-9a-zA-Z_.-]+)@([a-zA-Z0-9]+)(\d*)\.moe\.edu\.eg$/);
  if (moeMatch) {
    const rawCode = moeMatch[1];
    const gov = moeMatch[2].toUpperCase();
    const isNumericCode = /^\d+$/.test(rawCode);
    return {
      role: isNumericCode ? 'student' : 'teacher',
      roleLabelAr: isNumericCode ? 'طالب (الحساب الموحد)' : 'معلم (الحساب الموحد)',
      roleLabelEn: isNumericCode ? 'Student (Unified)' : 'Teacher (Unified)',
      studentCode: isNumericCode ? rawCode : undefined,
      governorate: gov,
      schoolCode: `${gov}_DIR`,
    };
  }

  // Pattern 2: @students.<school>.edu.eg
  const studentSubMatch = e.match(/^([^@]+)@students\.(.+)\.edu\.eg$/);
  if (studentSubMatch) {
    return {
      role: 'student',
      roleLabelAr: 'طالب (مدرسي)',
      roleLabelEn: 'Student',
      studentCode: studentSubMatch[1].toUpperCase(),
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
      schoolCode: principalMatch[1].toUpperCase().replace(/\./g, '_'),
    };
  }

  // Pattern 5: Central Ministry (@moe.gov.eg)
  if (e.endsWith('@moe.gov.eg') || e.endsWith('@emoe.org')) {
    return {
      role: 'admin',
      roleLabelAr: 'إدارة وزارة التربية والتعليم',
      roleLabelEn: 'Ministry Admin',
      schoolCode: 'MOE_CENTRAL',
    };
  }

  // Pattern 6: Generic .edu.eg
  if (e.endsWith('.edu.eg')) {
    const domain = e.split('@')[1];
    const schoolCode = domain.replace('.edu.eg', '').toUpperCase().replace(/\./g, '_');
    return {
      role: 'student',
      roleLabelAr: 'طالب / عضو مؤسسي',
      roleLabelEn: 'Institutional User',
      schoolCode,
    };
  }

  return {
    role: 'student',
    roleLabelAr: 'طالب',
    roleLabelEn: 'Student',
  };
}
