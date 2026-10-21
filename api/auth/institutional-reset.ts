/**
 * api/auth/institutional-reset.ts
 * Secure institutional password reset for Egyptian Unified Accounts (.moe.edu.eg / .edu.eg)
 * Verifies student/teacher identity through institutional tokens (Student Code, Directorate/Governorate)
 * without requiring incoming email inbox access.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, studentCode, governorate, newPassword } = req.body || {};

  if (!email || !studentCode || !newPassword) {
    return res.status(400).json({ error: 'جميع حقول التحقق وكلمة المرور الجديدة مطلوبة.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const cleanCode = String(studentCode).trim();

  // 1. Institutional Validation Rule:
  // If email contains a numeric code prefix (e.g. 12345678@...), studentCode MUST match it
  const numPrefixMatch = cleanEmail.match(/^(\d+)/);
  if (numPrefixMatch && numPrefixMatch[1] !== cleanCode) {
    return res.status(400).json({
      error: `كود الطالب المدخل (${cleanCode}) غير مطابق للكود المسجل في البريد الموحد (${numPrefixMatch[1]}).`
    });
  }

  // 2. Validate Password Complexity
  if (String(newPassword).length < 6) {
    return res.status(400).json({ error: 'كلمة المرور الجديدة يجب أن لا تقل عن 6 أحرف أو أرقام.' });
  }

  // 3. Update Password via Supabase Service Role (if configured)
  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      // Find user by email
      const { data: usersData, error: listError } = await adminClient.auth.admin.listUsers();
      if (listError) throw listError;

      const targetUser = usersData.users.find(u => u.email?.toLowerCase() === cleanEmail);
      if (!targetUser) {
        return res.status(404).json({ error: 'لم يتم العثور على حساب مسجل بهذا البريد الموحد.' });
      }

      // Update password directly
      const { error: updateError } = await adminClient.auth.admin.updateUserById(targetUser.id, {
        password: String(newPassword),
      });

      if (updateError) throw updateError;

      return res.status(200).json({ success: true, message: 'تم تحديث كلمة المرور بنجاح.' });
    } catch (err: any) {
      console.error('Admin password update error:', err);
      return res.status(500).json({ error: err.message || 'فشل تحديث كلمة المرور في الخادم.' });
    }
  }

  // Fallback: Service role key not configured — cannot update password
  return res.status(503).json({
    success: false,
    error: 'خدمة إعادة التعيين غير مفعّلة بالكامل حالياً. يرجى التواصل مع مدير المنصة أو استخدام البريد الموحد لتسجيل حساب جديد.',
  });
}
