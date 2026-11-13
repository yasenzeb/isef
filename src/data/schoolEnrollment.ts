/**
 * schoolEnrollment.ts
 * إدارة بيانات الطلاب والربط الأكاديمي مع المعلمين والفصول والواجبات ونظام الستريك الحقيقي.
 *
 * © SciNexa Platform — ISEF 2026
 */

import {
  dbFetchClasses,
  dbCreateClass,
  dbDeleteClass,
  dbFetchEnrolledStudents,
  dbEnrollStudent,
  dbUpdateEnrolledStudent,
  dbDeleteEnrolledStudent,
  dbUpdateStudentMastery,
  dbFetchAssignments,
  dbCreateAssignment,
  dbDeleteAssignment,
  dbFetchSubmissions,
  dbSubmitAssignment,
  type DbClass,
  type DbProfile,
} from '../lib/supabase';
import { getPersistedItem, setPersistedItem, getPersistedJSON, setPersistedJSON } from '../lib/cookies';

export interface TeacherInfo {
  id: string;
  nameAr: string;
  nameEn: string;
  nameFr?: string;
  nameDe?: string;
  subjectAr: string;
  subjectEn: string;
  email: string;
  classes: string[];
}

export interface ClassInfo {
  id: string;
  nameAr: string;
  nameEn: string;
  teacherId: string;
  teacherNameAr: string;
  grade: string;
  subjectAr: string;
  subjectEn: string;
  accent: string;
}

export interface EnrolledStudent {
  id: string;
  studentId?: string;
  quadName: string;
  nationalId?: string;
  email?: string;
  parentPhone?: string;
  schoolName: string;
  governorateId: string;
  administrationId: string;
  gradeLevel: string;
  classId: string;
  classNameAr: string;
  teacherId: string;
  teacherNameAr: string;
  enrolledAt: string;
  mastery: number;
  streak: number;
  lastActiveDate: string;
}

export interface AssignmentItem {
  id: string;
  titleAr: string;
  titleEn: string;
  classId: string;
  classNameAr: string;
  targetStudentQuadName?: string | null;
  teacherId: string;
  teacherNameAr: string;
  linkedLab: string;
  dueDateAr: string;
  dueDateEn: string;
  descriptionAr: string;
  descriptionEn: string;
  totalPoints: number;
  assignedAt: string;
}

export interface StudentSubmission {
  id: string;
  assignmentId: string;
  studentQuadName: string;
  submittedAt: string;
  status: 'submitted' | 'graded';
  score?: number;
  teacherFeedback?: string;
}

// Zero fake data: Empty lists by default. Real data comes from Supabase.
export const TEACHERS: TeacherInfo[] = [];
export const INITIAL_CLASSES: ClassInfo[] = [];

const STORAGE_ENROLLED = 'scinexa_enrolled_students';
const STORAGE_ASSIGNMENTS = 'scinexa_assignments_list';
const STORAGE_SUBMISSIONS = 'scinexa_student_submissions';

export const getEnrolledStudents = (): EnrolledStudent[] => {
  const rawList = getPersistedJSON<any[]>(STORAGE_ENROLLED, []);
  if (!Array.isArray(rawList)) return [];
  return rawList.map((r: any) => ({
    id: String(r.id || `st_${Math.random().toString(36).slice(2, 9)}`),
    studentId: r.studentId || r.student_id || undefined,
    quadName: String(r.quadName || r.quad_name || r.name || 'طالب مسجل'),
    nationalId: r.nationalId || r.national_id || undefined,
    email: r.email ? String(r.email) : undefined,
    parentPhone: r.parentPhone || r.parent_phone || undefined,
    schoolName: String(r.schoolName || r.school_name || 'المدرسة المسجلة'),
    governorateId: String(r.governorateId || r.governorate_id || 'cairo'),
    administrationId: String(r.administrationId || r.administration_id || ''),
    gradeLevel: String(r.gradeLevel || r.grade_level || 'sec1'),
    classId: String(r.classId || r.class_id || ''),
    classNameAr: String(r.classNameAr || r.class_name_ar || 'فصل عام'),
    teacherId: String(r.teacherId || r.teacher_id || 't-admin'),
    teacherNameAr: String(r.teacherNameAr || r.teacher_name_ar || 'معلم الفصل'),
    enrolledAt: String(r.enrolledAt || r.enrolled_at || new Date().toISOString().slice(0, 10)),
    mastery: typeof r.mastery === 'number' ? r.mastery : 0,
    streak: typeof r.streak === 'number' ? r.streak : 0,
    lastActiveDate: String(r.lastActiveDate || r.last_active_date || new Date().toISOString().slice(0, 10)),
  }));
};

export const saveEnrolledStudents = (list: EnrolledStudent[]): void => {
  setPersistedJSON(STORAGE_ENROLLED, list);
};

export const deleteStudentEnrollment = (id: string): void => {
  const list = getEnrolledStudents();
  const updated = list.filter((s) => s.id !== id);
  saveEnrolledStudents(updated);
  void dbDeleteEnrolledStudent(id);
};

export const normalizeArabicName = (s?: string | null): string =>
  (s || '')
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F]/g, '')
    .replace(/\s+/g, ' ');

/**
 * مقارنة اسمين بدقة: تطابق تام، أو تطابق مقطعَيْن متتابعين على الأقل لمنع تداخل الأسماء المتشابهة في الاسم الأول فقط
 */
export const namesMatch = (a?: string | null, b?: string | null): boolean => {
  const na = normalizeArabicName(a);
  const nb = normalizeArabicName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  const wordsA = na.split(' ').filter(Boolean);
  const wordsB = nb.split(' ').filter(Boolean);
  if (wordsA.length >= 2 && wordsB.length >= 2) {
    return na.includes(nb) || nb.includes(na);
  }
  return false;
};

/**
 * إرجاع كل قيود التحاق الطالب في الفصول (قد يكون الطالب مسجلاً في أكثر من مادة/فصل)
 */
export const findStudentEnrollmentsFromList = (
  list: EnrolledStudent[],
  userQuadName?: string | null,
  userEmail?: string | null
): EnrolledStudent[] => {
  if ((!userQuadName && !userEmail) || !Array.isArray(list)) return [];
  const targetEmail = userEmail ? userEmail.trim().toLowerCase() : '';
  const hasRealEmail = targetEmail && !targetEmail.endsWith('@scinexa.school');

  return list.filter((s) => {
    if (userQuadName && namesMatch(s.quadName, userQuadName)) return true;
    if (hasRealEmail && s.email && s.email.trim().toLowerCase() === targetEmail) return true;
    return false;
  });
};

/**
 * فحص هل الطالب مربوط بأي معلم حالياً من خلال اسمه أو بريده الإلكتروني الحقيقي
 */
export const checkStudentLink = (
  userQuadName?: string | null,
  userEmail?: string | null,
  sourceList?: EnrolledStudent[]
): EnrolledStudent | null => {
  const list = sourceList || getEnrolledStudents();
  const matches = findStudentEnrollmentsFromList(list, userQuadName, userEmail);
  return matches[0] || null;
};

/**
 * فلترة الواجبات والتكليفات بحيث تصل للطالب الصحيح وفصله الدراسي فقط (Zero Cross-Student Leakage)
 */
export const getAssignmentsForStudent = (
  assignments: AssignmentItem[],
  studentEnrollments: EnrolledStudent[],
  userQuadName?: string | null,
  userEmail?: string | null
): AssignmentItem[] => {
  if (!Array.isArray(assignments)) return [];
  const enrolledClassIds = new Set(studentEnrollments.map((s) => s.classId).filter(Boolean));
  const candidateNames = [
    userQuadName,
    ...studentEnrollments.map((s) => s.quadName),
  ].filter(Boolean) as string[];

  return assignments.filter((asg) => {
    // 1. تكليف موجه لطالب معين بالاسم: لا يظهر إلا لهذا الطالب تحديداً
    if (asg.targetStudentQuadName && asg.targetStudentQuadName.trim()) {
      const targetedToName = candidateNames.some((n) => namesMatch(asg.targetStudentQuadName, n));
      if (targetedToName) return true;
      // Check email match against any enrollment record matching assignment target name
      if (userEmail && studentEnrollments.some((s) => namesMatch(s.quadName, asg.targetStudentQuadName))) {
        return true;
      }
      return false;
    }

    // 2. تكليف عام للفصل: يظهر فقط للطلاب المسجلين داخل نفس الفصل
    return Boolean(asg.classId && enrolledClassIds.has(asg.classId));
  });
};

/**
 * البحث عن حساب طالب مسجل بالفعل في جدول profiles بالاسم أو البريد أو الكود
 */
export const searchRegisteredStudents = (profiles: DbProfile[], query: string): DbProfile[] => {
  const students = (profiles || []).filter((p) => (p.role || 'student') === 'student');
  const q = normalizeArabicName(query);
  if (!q) return students;
  return students.filter((p) => {
    const fullName = normalizeArabicName(p.quad_name || p.display_name || '');
    const email = (p.email || '').trim().toLowerCase();
    const code = (p.student_code || p.id || '').toLowerCase();
    return fullName.includes(q) || q.includes(fullName) || email.includes(q) || code.includes(q);
  });
};

export const findExactRegisteredStudent = (
  profiles: DbProfile[],
  queryNameOrEmail: string
): DbProfile | null => {
  const students = (profiles || []).filter((p) => (p.role || 'student') === 'student');
  const q = normalizeArabicName(queryNameOrEmail);
  if (!q) return null;
  // 1. Exact email match
  const byEmail = students.find((p) => p.email && p.email.trim().toLowerCase() === queryNameOrEmail.trim().toLowerCase());
  if (byEmail) return byEmail;
  // 2. Exact student code match
  const byCode = students.find((p) => p.student_code && p.student_code.trim().toLowerCase() === queryNameOrEmail.trim().toLowerCase());
  if (byCode) return byCode;
  // 3. Exact or multi-word normalized Arabic name match
  const exactName = students.find((p) => normalizeArabicName(p.quad_name || p.display_name) === q);
  if (exactName) return exactName;
  const fuzzyMatches = students.filter((p) => namesMatch(p.quad_name || p.display_name, queryNameOrEmail));
  return fuzzyMatches.length === 1 ? fuzzyMatches[0] : null;
};

/**
 * قيام المعلم بإضافة طالب مسجل إلى فصله
 */
export const buildStudentRecord = (params: {
  studentId?: string;
  quadName: string;
  classId: string;
  schoolName: string;
  governorateId: string;
  administrationId: string;
  gradeLevel: string;
  email?: string;
  nationalId?: string;
  parentPhone?: string;
  classNameAr?: string;
  teacherId?: string;
  teacherNameAr?: string;
  streak?: number;
  mastery?: number;
}): EnrolledStudent => {
  const cachedClasses = getPersistedJSON<any[]>('scinexa_supabase_classes_cache', []);
  const cls = cachedClasses.find((c) => c.id === params.classId);

  return {
    id: `std-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    studentId: params.studentId,
    quadName: params.quadName.trim(),
    nationalId: params.nationalId?.trim() || undefined,
    parentPhone: params.parentPhone?.trim() || undefined,
    email: params.email?.trim() ? params.email.trim().toLowerCase() : undefined,
    schoolName: params.schoolName.trim() || 'المدرسة المسجلة',
    governorateId: params.governorateId || 'cairo',
    administrationId: params.administrationId || 'default',
    gradeLevel: params.gradeLevel || cls?.grade || 'sec1',
    classId: params.classId,
    classNameAr: params.classNameAr || cls?.name_ar || cls?.nameAr || 'فصل دراسي',
    teacherId: params.teacherId || cls?.teacher_id || cls?.teacherId || 't-admin',
    teacherNameAr: params.teacherNameAr || cls?.teacher_name_ar || cls?.teacherNameAr || 'المعلم المشرف',
    enrolledAt: new Date().toISOString().slice(0, 10),
    mastery: typeof params.mastery === 'number' ? params.mastery : 0,
    streak: typeof params.streak === 'number' ? params.streak : 0,
    lastActiveDate: new Date().toISOString().slice(0, 10),
  };
};

export const addStudentToClassByTeacherAsync = async (params: {
  studentId?: string;
  quadName: string;
  classId: string;
  schoolName: string;
  governorateId: string;
  administrationId: string;
  gradeLevel: string;
  email?: string;
  nationalId?: string;
  parentPhone?: string;
  classNameAr?: string;
  teacherId?: string;
  teacherNameAr?: string;
  streak?: number;
  mastery?: number;
}): Promise<{ ok: boolean; student: EnrolledStudent; error?: string }> => {
  const list = getEnrolledStudents();
  const duplicate = list.find(
    (s) =>
      s.classId === params.classId &&
      ((params.studentId && s.studentId === params.studentId) ||
        (params.email && s.email && s.email.toLowerCase() === params.email.toLowerCase()) ||
        namesMatch(s.quadName, params.quadName))
  );
  if (duplicate) {
    return {
      ok: false,
      student: duplicate,
      error: 'هذا الطالب ملتحق بالفعل بنفس الفصل الدراسي.',
    };
  }

  const newStudent = buildStudentRecord(params);
  saveEnrolledStudents([newStudent, ...list]);

  const res = await dbEnrollStudent({
    id: newStudent.id,
    student_id: newStudent.studentId,
    quad_name: newStudent.quadName,
    national_id: newStudent.nationalId,
    parent_phone: newStudent.parentPhone,
    email: newStudent.email,
    school_name: newStudent.schoolName,
    governorate_id: newStudent.governorateId,
    administration_id: newStudent.administrationId,
    grade_level: newStudent.gradeLevel,
    class_id: newStudent.classId,
    class_name_ar: newStudent.classNameAr,
    teacher_id: newStudent.teacherId,
    teacher_name_ar: newStudent.teacherNameAr,
    enrolled_at: newStudent.enrolledAt,
    mastery: newStudent.mastery,
    streak: newStudent.streak,
    last_active_date: newStudent.lastActiveDate,
  });
  return { ok: res.ok, student: newStudent, error: res.error };
};

/**
 * نقل الطالب إلى فصل آخر وتحديث السجل في Supabase
 */
export const transferStudentClassAndSync = async (
  enrollmentId: string,
  targetClass: DbClass
): Promise<{ ok: boolean; error?: string }> => {
  const updates = {
    class_id: targetClass.id,
    class_name_ar: targetClass.name_ar,
    teacher_id: targetClass.teacher_id,
    teacher_name_ar: targetClass.teacher_name_ar,
  };
  const res = await dbUpdateEnrolledStudent(enrollmentId, updates);
  const current = getEnrolledStudents();
  saveEnrolledStudents(
    current.map((s) =>
      s.id === enrollmentId
        ? {
            ...s,
            classId: targetClass.id,
            classNameAr: targetClass.name_ar,
            teacherId: targetClass.teacher_id,
            teacherNameAr: targetClass.teacher_name_ar,
          }
        : s
    )
  );
  return res;
};

export const addStudentToClassByTeacher = (params: {
  quadName: string;
  classId: string;
  schoolName: string;
  governorateId: string;
  administrationId: string;
  gradeLevel: string;
  email?: string;
  nationalId?: string;
  parentPhone?: string;
  classNameAr?: string;
  teacherId?: string;
  teacherNameAr?: string;
}): EnrolledStudent => {
  const list = getEnrolledStudents();
  const newStudent = buildStudentRecord(params);
  saveEnrolledStudents([newStudent, ...list]);
  void dbEnrollStudent({
    id: newStudent.id,
    quad_name: newStudent.quadName,
    national_id: newStudent.nationalId,
    parent_phone: newStudent.parentPhone,
    email: newStudent.email,
    school_name: newStudent.schoolName,
    governorate_id: newStudent.governorateId,
    administration_id: newStudent.administrationId,
    grade_level: newStudent.gradeLevel,
    class_id: newStudent.classId,
    class_name_ar: newStudent.classNameAr,
    teacher_id: newStudent.teacherId,
    teacher_name_ar: newStudent.teacherNameAr,
    enrolled_at: newStudent.enrolledAt,
    mastery: newStudent.mastery,
    streak: newStudent.streak,
    last_active_date: newStudent.lastActiveDate,
  });
  return newStudent;
};

/**
 * حساب الستريك الحقيقي متزامن مع الكوكيز
 */
export const updateAndGetRealStreak = (): number => {
  const today = new Date().toISOString().slice(0, 10);
  const lastDate = getPersistedItem('scinexa_last_visit_date');
  let currentStreak = parseInt(getPersistedItem('scinexa_user_streak', '0'), 10);

  if (!lastDate) {
    return currentStreak;
  }

  if (lastDate === today) {
    return currentStreak;
  }

  const prevDate = new Date(lastDate);
  const currDate = new Date(today);
  const diffTime = currDate.getTime() - prevDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

  if (diffDays === 1) {
    currentStreak += 1;
  } else if (diffDays > 1) {
    currentStreak = 1;
  }

  setPersistedItem('scinexa_last_visit_date', today);
  setPersistedItem('scinexa_user_streak', String(currentStreak));
  return currentStreak;
};

/**
 * حساب المستوى الحقيقي بناءً على الـ XP
 */
export const calculateStudentLevel = (xp: number) => {
  if (xp < 200) return { level: 1, titleAr: 'مستكشف مبتدئ', titleEn: 'Novice Explorer', nextXp: 200, progress: Math.round((xp / 200) * 100) };
  if (xp < 500) return { level: 2, titleAr: 'باحث معملي', titleEn: 'Lab Researcher', nextXp: 500, progress: Math.round(((xp - 200) / 300) * 100) };
  if (xp < 1000) return { level: 3, titleAr: 'عالم تجريبي', titleEn: 'Experimental Scientist', nextXp: 1000, progress: Math.round(((xp - 500) / 500) * 100) };
  if (xp < 2000) return { level: 4, titleAr: 'خبير آيسف المعتمد', titleEn: 'Certified ISEF Scholar', nextXp: 2000, progress: Math.round(((xp - 1000) / 1000) * 100) };
  return { level: 5, titleAr: 'عالم فيزيائي متميز', titleEn: 'Distinguished Fellow', nextXp: 5000, progress: 100 };
};

export const getAssignments = (): AssignmentItem[] => {
  const raw = getPersistedJSON<any[]>(STORAGE_ASSIGNMENTS, []);
  if (!Array.isArray(raw)) return [];
  return raw.map((a: any) => ({
    id: String(a.id || `as_${Math.random().toString(36).slice(2, 9)}`),
    titleAr: String(a.titleAr || a.title_ar || ''),
    titleEn: String(a.titleEn || a.title_en || a.titleAr || a.title_ar || ''),
    classId: String(a.classId || a.class_id || ''),
    classNameAr: String(a.classNameAr || a.class_name_ar || ''),
    targetStudentQuadName: a.targetStudentQuadName || a.target_student_quad_name || null,
    teacherId: String(a.teacherId || a.teacher_id || ''),
    teacherNameAr: String(a.teacherNameAr || a.teacher_name_ar || ''),
    linkedLab: String(a.linkedLab || a.linked_lab || 'chemistry'),
    dueDateAr: String(a.dueDateAr || a.due_date_ar || 'الخميس'),
    dueDateEn: String(a.dueDateEn || a.due_date_en || 'Thursday'),
    descriptionAr: String(a.descriptionAr || a.description_ar || ''),
    descriptionEn: String(a.descriptionEn || a.description_en || ''),
    totalPoints: typeof a.totalPoints === 'number' ? a.totalPoints : (typeof a.total_points === 'number' ? a.total_points : 100),
    assignedAt: String(a.assignedAt || a.assigned_at || new Date().toISOString().slice(0, 10)),
  }));
};

export const addAssignment = async (item: AssignmentItem): Promise<{ ok: boolean; error?: string }> => {
  const list = getAssignments();
  const updated = [item, ...list];
  setPersistedJSON(STORAGE_ASSIGNMENTS, updated);
  return dbCreateAssignment({
    id: item.id,
    title_ar: item.titleAr,
    title_en: item.titleEn,
    class_id: item.classId,
    class_name_ar: item.classNameAr,
    target_student_quad_name: item.targetStudentQuadName || null,
    teacher_id: item.teacherId,
    teacher_name_ar: item.teacherNameAr,
    linked_lab: item.linkedLab,
    due_date_ar: item.dueDateAr,
    due_date_en: item.dueDateEn,
    description_ar: item.descriptionAr,
    description_en: item.descriptionEn,
    total_points: item.totalPoints,
    assigned_at: item.assignedAt,
  });
};

export const deleteAssignmentById = (id: string): void => {
  const list = getAssignments();
  const updated = list.filter((a) => a.id !== id);
  setPersistedJSON(STORAGE_ASSIGNMENTS, updated);
  void dbDeleteAssignment(id);
};

export const getSubmissions = (): StudentSubmission[] => {
  const raw = getPersistedJSON<any[]>(STORAGE_SUBMISSIONS, []);
  if (!Array.isArray(raw)) return [];
  return raw.map((s: any) => ({
    id: String(s.id || `sub_${Math.random().toString(36).slice(2, 9)}`),
    assignmentId: String(s.assignmentId || s.assignment_id || ''),
    studentQuadName: String(s.studentQuadName || s.student_quad_name || ''),
    submittedAt: String(s.submittedAt || s.submitted_at || '').slice(0, 10),
    status: s.status === 'graded' ? 'graded' : 'submitted',
    score: typeof s.score === 'number' ? s.score : undefined,
    teacherFeedback: s.teacherFeedback || s.teacher_feedback || undefined,
  }));
};

export const recordSubmission = async (submission: StudentSubmission): Promise<{ ok: boolean; error?: string }> => {
  const current = getSubmissions();
  const existingIdx = current.findIndex(
    (s) => s.assignmentId === submission.assignmentId && namesMatch(s.studentQuadName, submission.studentQuadName)
  );
  let updated: StudentSubmission[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = submission;
  } else {
    updated = [submission, ...current];
  }
  setPersistedJSON(STORAGE_SUBMISSIONS, updated);
  return dbSubmitAssignment({
    id: submission.id,
    assignment_id: submission.assignmentId,
    student_quad_name: submission.studentQuadName,
    score: submission.score,
    status: submission.status,
    teacher_feedback: submission.teacherFeedback,
    submitted_at: submission.submittedAt,
  });
};

/**
 * تقييم المعلم لتسليم الطالب ومزامنة درجة الإتقان في Supabase
 */
export const gradeSubmissionAndSync = async (
  submission: StudentSubmission,
  score: number,
  feedback: string
): Promise<{ ok: boolean; updated: StudentSubmission; error?: string }> => {
  const graded: StudentSubmission = {
    ...submission,
    status: 'graded',
    score: Math.max(0, Math.min(100, Math.round(score))),
    teacherFeedback: feedback.trim() || undefined,
  };
  const res = await recordSubmission(graded);

  // Sync student mastery in students_enrollment based on their graded submissions
  const enrolled = getEnrolledStudents();
  const allSubs = getSubmissions();
  const matchingStudents = enrolled.filter((st) => namesMatch(st.quadName, submission.studentQuadName));
  for (const st of matchingStudents) {
    const studentGraded = allSubs.filter(
      (s) => namesMatch(s.studentQuadName, st.quadName) && s.status === 'graded' && typeof s.score === 'number'
    );
    if (studentGraded.length > 0) {
      const avg = Math.round(studentGraded.reduce((sum, s) => sum + (s.score || 0), 0) / studentGraded.length);
      await dbUpdateStudentMastery(st.id, avg);
    }
  }
  return { ok: res.ok, updated: graded, error: res.error };
};

/**
 * مزامنة الفصول مع سوبابيز
 */
export const fetchAndSyncClasses = async (): Promise<ClassInfo[]> => {
  const remote = await dbFetchClasses();
  if (remote) {
    return remote.map((c) => ({
      id: c.id,
      nameAr: c.name_ar,
      nameEn: c.name_en,
      teacherId: c.teacher_id,
      teacherNameAr: c.teacher_name_ar,
      grade: c.grade,
      subjectAr: c.subject_ar,
      subjectEn: c.subject_en,
      accent: c.accent || 'chemistry',
    }));
  }
  return [];
};

/**
 * مزامنة الطلاب المسجلين مع سوبابيز (تقبل القائمة الفارغة عند الحذف)
 */
export const fetchAndSyncEnrollment = async (): Promise<EnrolledStudent[]> => {
  const { rows, fromRemote } = await dbFetchEnrolledStudents();
  if (fromRemote) {
    const mapped: EnrolledStudent[] = rows.map((r: any) => ({
      id: r.id,
      studentId: r.student_id || undefined,
      quadName: r.quad_name,
      nationalId: r.national_id || undefined,
      email: r.email || undefined,
      parentPhone: r.parent_phone || r.parentPhone || undefined,
      schoolName: r.school_name,
      governorateId: r.governorate_id,
      administrationId: r.administration_id,
      gradeLevel: r.grade_level,
      classId: r.class_id,
      classNameAr: r.class_name_ar,
      teacherId: r.teacher_id,
      teacherNameAr: r.teacher_name_ar,
      enrolledAt: r.enrolled_at || new Date().toISOString().slice(0, 10),
      mastery: r.mastery ?? 0,
      streak: r.streak ?? 0,
      lastActiveDate: r.last_active_date || new Date().toISOString().slice(0, 10),
    }));
    saveEnrolledStudents(mapped);
    return mapped;
  }
  return getEnrolledStudents();
};

/**
 * مزامنة التكليفات والواجبات المدرسية مع سوبابيز
 */
export const fetchAndSyncAssignments = async (): Promise<AssignmentItem[]> => {
  const { rows, fromRemote } = await dbFetchAssignments();
  if (fromRemote) {
    const mapped: AssignmentItem[] = rows.map((a: any) => ({
      id: a.id,
      titleAr: a.title_ar,
      titleEn: a.title_en,
      classId: a.class_id,
      classNameAr: a.class_name_ar,
      targetStudentQuadName: a.target_student_quad_name || null,
      teacherId: a.teacher_id,
      teacherNameAr: a.teacher_name_ar,
      linkedLab: a.linked_lab,
      dueDateAr: a.due_date_ar,
      dueDateEn: a.due_date_en,
      descriptionAr: a.description_ar,
      descriptionEn: a.description_en,
      totalPoints: a.total_points,
      assignedAt: a.assigned_at,
    }));
    setPersistedJSON(STORAGE_ASSIGNMENTS, mapped);
    return mapped;
  }
  return getAssignments();
};

/**
 * مزامنة تسليمات الطلاب مع سوبابيز
 */
export const fetchAndSyncSubmissions = async (): Promise<StudentSubmission[]> => {
  const { rows, fromRemote } = await dbFetchSubmissions();
  if (fromRemote) {
    const mapped: StudentSubmission[] = rows.map((s: any) => ({
      id: s.id,
      assignmentId: s.assignment_id,
      studentQuadName: s.student_quad_name,
      submittedAt: (s.submitted_at || new Date().toISOString()).slice(0, 10),
      status: s.status === 'graded' ? 'graded' : 'submitted',
      score: typeof s.score === 'number' ? s.score : undefined,
      teacherFeedback: s.teacher_feedback || undefined,
    }));
    setPersistedJSON(STORAGE_SUBMISSIONS, mapped);
    return mapped;
  }
  return getSubmissions();
};
