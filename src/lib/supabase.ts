/**
 * supabase.ts — Supabase client (browser-side)
 * Uses VITE_ public env vars — safe to expose in the frontend.
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL      as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[SciNexa] Supabase env vars missing — auth will not work.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken:    true,
    persistSession:      true,
    detectSessionInUrl:  true, // catches magic-link & OAuth redirects automatically
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
  avatarUrl?:    string;
  createdAt:     string;
}

// ── Allowed email domains (Ministry of Education Egypt) ───────────────────
export const ALLOWED_DOMAINS = [
  '.edu.eg',
  '@moe.gov.eg',
  '@emoe.org',
];

export function isMinistryEmail(email: string): boolean {
  const e = email.toLowerCase().trim();
  return ALLOWED_DOMAINS.some(d => e.endsWith(d));
}

/** Detect role + metadata purely from email */
export function detectRoleFromEmail(email: string): Pick<SciNexaProfile, 'role' | 'schoolCode' | 'studentCode'> {
  const e = email.toLowerCase().trim();

  const studentMatch = e.match(/^([^@]+)@students\.(.+)\.edu\.eg$/);
  if (studentMatch) {
    return {
      role:        'student',
      studentCode: studentMatch[1].toUpperCase(),
      schoolCode:  studentMatch[2].toUpperCase().replace(/\./g, '_'),
    };
  }

  const teacherMatch = e.match(/^[^@]+@teachers\.(.+)\.edu\.eg$/);
  if (teacherMatch) {
    return { role: 'teacher', schoolCode: teacherMatch[1].toUpperCase().replace(/\./g, '_') };
  }

  const principalMatch = e.match(/^[^@]+@(?:principal|admin)\.(.+)\.edu\.eg$/);
  if (principalMatch) {
    return { role: 'principal', schoolCode: principalMatch[1].toUpperCase().replace(/\./g, '_') };
  }

  if (e.endsWith('@moe.gov.eg') || e.endsWith('@emoe.org')) {
    return { role: 'admin' };
  }

  // Generic .edu.eg → teacher
  if (e.endsWith('.edu.eg')) {
    const domain = e.split('@')[1];
    const schoolCode = domain.replace('.edu.eg', '').toUpperCase().replace(/\./g, '_');
    return { role: 'teacher', schoolCode };
  }

  return { role: 'student' };
}
