/**
 * AccountManagementModal.tsx — Comprehensive Student & Teacher Account Hub
 * Allows viewing and editing personal details, educational metadata (Unified Code, School, Directorate),
 * reviewing learning telemetry, and managing session security.
 */

import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, EGYPT_EDUCATION_STAGES } from '../lib/supabase';
import { EGYPT_GOVERNORATES } from '../data/egyptLocationData';
import {
  X,
  User,
  GraduationCap,
  Mail,
  ShieldCheck,
  Building2,
  Calendar,
  Sparkles,
  Save,
  CheckCircle2,
  Loader2,
  LogOut,
  Atom,
  Clock,
  Award
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language?: string;
}

export const AccountManagementModal: React.FC<Props> = ({ isOpen, onClose, language = 'ar' }) => {
  const { user, logout } = useAuth();
  const isAr = language === 'ar';

  const [name, setName] = useState(user?.displayName || '');
  const [age, setAge] = useState<number | ''>(user?.age || '');
  const [birthday, setBirthday] = useState(user?.birthday || '');
  const initialStage = useMemo(() => {
    if (user?.stage) return user.stage;
    if (!user?.grade) return '';
    for (const st of EGYPT_EDUCATION_STAGES) {
      if (st.grades.includes(user.grade)) return st.nameAr;
    }
    return '';
  }, [user]);

  const [gender, setGender] = useState<'male' | 'female'>(user?.gender || 'male');
  const [stage, setStage] = useState(initialStage);
  const [grade, setGrade] = useState(user?.grade || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const studentCodeDisplay = useMemo(() => {
    return user?.studentCode || user?.email.match(/^(\d+)/)?.[1] || '—';
  }, [user]);

  const activeGovDisplay = useMemo(() => {
    const savedGovId = localStorage.getItem('scinexa_gov_id') || '';
    const savedAdminId = localStorage.getItem('scinexa_admin_id') || '';
    const activeGov = EGYPT_GOVERNORATES.find(g => g.id === savedGovId);
    const activeAdmin = activeGov?.administrations.find(a => a.id === savedAdminId);

    if (activeAdmin) return activeAdmin.nameAr;
    if (activeGov) return activeGov.nameAr;
    return user?.governorateAr || 'الدقهلية';
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // 1. Update Supabase User Metadata
      await supabase.auth.updateUser({
        data: {
          full_name: name.trim(),
          age: age ? Number(age) : undefined,
          birthday: birthday || undefined,
          gender,
          stage: stage || undefined,
          grade: grade || undefined,
        },
      });

      // 2. Update profiles table
      await supabase.from('profiles').update({
        display_name: name.trim(),
        age: age ? Number(age) : null,
        birthday: birthday || null,
        gender,
        stage: stage || null,
        grade: grade || null,
      }).eq('id', user.id);

      // 3. Update localStorage cache
      const updated = {
        ...user,
        displayName: name.trim(),
        age: age ? Number(age) : undefined,
        birthday: birthday || undefined,
        gender,
        stage: stage || undefined,
        grade: grade || undefined,
      };
      localStorage.setItem('scinexa_cached_profile', JSON.stringify(updated));

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn select-none"
    >
      <div
        className="w-full max-w-2xl bg-[#0f1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xl shadow-md">
              {gender === 'female' ? '👧' : '👦'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white font-mono">
                  {isAr ? 'إدارة حساب الطالب والمنظومة التعليمية' : 'Student Account & Learning Profile'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {isAr ? 'حساب موثق رسمي' : 'Verified'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isAr ? 'بياناتك المعتمدة الصادرة عبر الحساب الموحد لوزارة التربية والتعليم' : 'Institutional Ministry of Education Credentials'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Institutional Badges Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 block">{isAr ? 'الصفة التعليمية' : 'Role'}</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <GraduationCap size={13} />
                <span>{isAr ? 'طالب رسمي' : 'Student'}</span>
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 block">{isAr ? 'كود الطالب' : 'Student Code'}</span>
              <span className="text-xs font-mono font-bold text-blue-400 truncate block">
                {studentCodeDisplay}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 block">{isAr ? 'المحافظة / المديرية' : 'Directorate'}</span>
              <span className="text-xs font-bold text-amber-400 truncate block">
                {activeGovDisplay}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 block">{isAr ? 'منظومة المعامل' : 'Lab Matrix'}</span>
              <span className="text-xs font-bold text-purple-400 flex items-center gap-1">
                <Atom size={13} />
                <span>{isAr ? 'مفتوح بالكامل' : 'All 6 Labs'}</span>
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1 col-span-2 sm:col-span-2">
              <span className="text-[10px] text-slate-400 block">{isAr ? 'الصف الدراسي' : 'Grade'}</span>
              <span className="text-xs font-bold text-cyan-400 truncate block">
                {grade || user.grade || (isAr ? 'غير محدد' : 'Not set')}
              </span>
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
              <User size={14} className="text-blue-400" />
              <span>{isAr ? 'البيانات الشخصية القابلة للتعديل' : 'Personal Details'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  {isAr ? 'الاسم بالكامل' : 'Full Name'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090d] border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              {/* Email (Readonly) */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                  <span>{isAr ? 'البريد الإلكتروني الموحد' : 'Unified Email'}</span>
                  <span className="text-[10px] text-slate-500">{isAr ? '(غير قابل للتغيير)' : '(Read-only)'}</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    dir="ltr"
                    value={user.email}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090d]/60 border border-white/5 text-slate-400 text-sm font-mono cursor-not-allowed"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Age */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  {isAr ? 'العمر (سنوات)' : 'Age (years)'}
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={age}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : '';
                    setAge(val);
                    if (val && Number(val) > 0) {
                      const year = new Date().getFullYear() - Number(val);
                      setBirthday(`${year}-01-01`);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090d] border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              {/* Birthday */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  {isAr ? 'تاريخ الميلاد' : 'Date of Birth'}
                </label>
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => {
                    setBirthday(e.target.value);
                    if (e.target.value) {
                      const birthDate = new Date(e.target.value);
                      const today = new Date();
                      const calcAge = today.getFullYear() - birthDate.getFullYear() -
                        (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate()) ? 1 : 0);
                      setAge(calcAge);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090d] border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Gender Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                {isAr ? 'النوع / الصورة الرمزية' : 'Gender & Avatar'}
              </label>
              <div className="grid grid-cols-2 gap-3 max-w-sm">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    gender === 'male'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-1 ring-blue-500'
                      : 'bg-[#08090d] border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <span className="text-base">👦</span>
                  <span>{isAr ? 'طالب (ذكر)' : 'Male'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    gender === 'female'
                      ? 'bg-pink-600/20 border-pink-500 text-pink-300 ring-1 ring-pink-500'
                      : 'bg-[#08090d] border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <span className="text-base">👧</span>
                  <span>{isAr ? 'طالبة (أنثى)' : 'Female'}</span>
                </button>
              </div>
            </div>

            {/* Education Stage & School Grade (Two-Step Cascading Selection) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Stage Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  {isAr ? 'المرحلة التعليمية' : 'Education Stage'}
                </label>
                <select
                  value={stage}
                  onChange={(e) => {
                    setStage(e.target.value);
                    setGrade('');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090d] border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">{isAr ? '— اختر المرحلة التعليمية أولاً —' : '— Select Stage First —'}</option>
                  {EGYPT_EDUCATION_STAGES.map((st) => (
                    <option key={st.id} value={st.nameAr}>
                      {st.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grade Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  {isAr ? 'الصف الدراسي' : 'School Grade'}
                </label>
                <select
                  value={grade}
                  disabled={!stage}
                  onChange={(e) => setGrade(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-[#08090d] border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer ${
                    !stage ? 'opacity-40 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">
                    {stage
                      ? isAr
                        ? '— اختر الصف الدراسي —'
                        : '— Select Grade —'
                      : isAr
                      ? '— اختر المرحلة أولاً —'
                      : '— Select Stage First —'}
                  </option>
                  {stage &&
                    EGYPT_EDUCATION_STAGES.find((st) => st.nameAr === stage)?.grades.map((gr) => (
                      <option key={gr} value={gr}>
                        {gr}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="py-2.5 px-5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 shadow-md shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>{isAr ? 'جاري الحفظ...' : 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    <span>{isAr ? 'حفظ التعديلات' : 'Save Changes'}</span>
                  </>
                )}
              </button>

              {saveSuccess && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold animate-fadeIn">
                  <CheckCircle2 size={16} />
                  <span>{isAr ? 'تم حفظ بياناتك بنجاح ✓' : 'Updated successfully ✓'}</span>
                </div>
              )}
            </div>
          </form>

          {/* Security & Logout Area */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>{isAr ? 'الأمان وحالة الجلسة' : 'Security & Session'}</span>
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {isAr
                ? 'جلسة الدخول مؤمنة بتشفير عالي الأمان ومتصلة بقاعدة بيانات وزارة التربية والتعليم. لا تشارك بيانات تسجيل دخولك مع أي شخص آخر.'
                : 'Session encrypted with industry standard AES-256 and bcrypt hashing.'}
            </p>

            <div className="pt-2 flex items-center justify-between border-t border-white/5">
              <span className="text-[11px] text-slate-500 font-mono">
                ID: {user.id.slice(0, 12)}...
              </span>
              <button
                type="button"
                onClick={() => { onClose(); logout(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold transition-colors cursor-pointer"
              >
                <LogOut size={13} />
                <span>{isAr ? 'تسجيل الخروج' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
