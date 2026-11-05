import { dbFetchClasses, dbCreateClass, dbFetchEnrolledStudents, dbEnrollStudent, dbFetchAssignments, dbCreateAssignment, dbSubmitAssignment } from '../lib/supabase';
/**
 * schoolEnrollment.ts
 * إدارة بيانات الطلاب والربط الأكاديمي مع المعلمين والفصول والواجبات ونظام الستريك الحقيقي.
 *
 * © SciNexa Platform — ISEF 2026
 */

import { getPersistedItem, setPersistedItem, getPersistedJSON, setPersistedJSON } from '../lib/cookies';

export interface TeacherInfo {
  id: string;
  nameAr: string;
  nameEn: string;
  nameFr: string;
  nameDe: string;
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
  quadName: string;
  email?: string;
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

export const TEACHERS: TeacherInfo[] = [
  {
    id: 't-mona',
    nameAr: 'أ. منى فتحي',
    nameEn: 'Ms. Mona Fathy',
    nameFr: 'Mme Mona Fathy',
    nameDe: 'Fr. Mona Fathy',
    subjectAr: 'الكيمياء والعلوم التطبيقية',
    subjectEn: 'Chemistry & Applied Sciences',
    email: 'mona@scinexa.school',
    classes: ['2a', '1b'],
  },
  {
    id: 't-hala',
    nameAr: 'أ. هالة نبيل',
    nameEn: 'Ms. Hala Nabil',
    nameFr: 'Mme Hala Nabil',
    nameDe: 'Fr. Hala Nabil',
    subjectAr: 'الفيزياء وميكانيكا الفضاء',
    subjectEn: 'Physics & Space Mechanics',
    email: 'hala@scinexa.school',
    classes: ['3b', 'stem-phys'],
  },
  {
    id: 't-tarek',
    nameAr: 'أ. طارق محمود',
    nameEn: 'Mr. Tarek Mahmoud',
    nameFr: 'M. Tarek Mahmoud',
    nameDe: 'Hr. Tarek Mahmoud',
    subjectAr: 'الأحياء والجيولوجيا',
    subjectEn: 'Biology & Earth Sciences',
    email: 'tarek@scinexa.school',
    classes: ['1c', '3a-geo'],
  },
];

export const INITIAL_CLASSES: ClassInfo[] = [
  {
    id: '2a',
    nameAr: 'كيمياء ٢أ (الصف الثاني الثانوي)',
    nameEn: 'Chemistry 2A (2nd Sec)',
    teacherId: 't-mona',
    teacherNameAr: 'أ. منى فتحي',
    grade: 'sec2',
    subjectAr: 'الكيمياء',
    subjectEn: 'Chemistry',
    accent: 'chemistry',
  },
  {
    id: '3b',
    nameAr: 'فيزياء ٣ب (الصف الثالث الثانوي)',
    nameEn: 'Physics 3B (3rd Sec)',
    teacherId: 't-hala',
    teacherNameAr: 'أ. هالة نبيل',
    grade: 'sec3',
    subjectAr: 'الفيزياء',
    subjectEn: 'Physics',
    accent: 'physics',
  },
  {
    id: '1c',
    nameAr: 'أحياء ١ج (الصف الأول الثانوي)',
    nameEn: 'Biology 1C (1st Sec)',
    teacherId: 't-tarek',
    teacherNameAr: 'أ. طارق محمود',
    grade: 'sec1',
    subjectAr: 'الأحياء',
    subjectEn: 'Biology',
    accent: 'biology',
  },
  {
    id: '1b',
    nameAr: 'علوم ١ب (الصف الأول الإعدادي)',
    nameEn: 'Science 1B (1st Prep)',
    teacherId: 't-mona',
    teacherNameAr: 'أ. منى فتحي',
    grade: 'prep1',
    subjectAr: 'العلوم العامة',
    subjectEn: 'General Science',
    accent: 'chemistry',
  },
  {
    id: 'stem-phys',
    nameAr: 'ميكانيكا متقدمة (مدارس STEM)',
    nameEn: 'Advanced Mechanics (STEM)',
    teacherId: 't-hala',
    teacherNameAr: 'أ. هالة نبيل',
    grade: 'stem',
    subjectAr: 'الفيزياء التطبيقية',
    subjectEn: 'Applied Physics',
    accent: 'physics',
  },
];

const STORAGE_ENROLLED = 'scinexa_enrolled_students';
const STORAGE_ASSIGNMENTS = 'scinexa_assignments_list';
const STORAGE_SUBMISSIONS = 'scinexa_student_submissions';

// Initial pre-enrolled mock students (matching the demo records)
const DEFAULT_ENROLLED: EnrolledStudent[] = [];

export const getEnrolledStudents = (): EnrolledStudent[] => {
  const rawList = getPersistedJSON<any[]>(STORAGE_ENROLLED, DEFAULT_ENROLLED);
  if (!Array.isArray(rawList)) return [];
  return rawList.map((r: any) => ({
    id: String(r.id || `st_${Math.random().toString(36).slice(2, 9)}`),
    quadName: String(r.quadName || r.quad_name || r.name || 'طالب مسجل'),
    email: r.email ? String(r.email) : undefined,
    schoolName: String(r.schoolName || r.school_name || 'المدرسة المسجلة'),
    governorateId: String(r.governorateId || r.governorate_id || 'cairo'),
    administrationId: String(r.administrationId || r.administration_id || ''),
    gradeLevel: String(r.gradeLevel || r.grade_level || 'sec2'),
    classId: String(r.classId || r.class_id || '2a'),
    classNameAr: String(r.classNameAr || r.class_name_ar || 'كيمياء ٢أ'),
    teacherId: String(r.teacherId || r.teacher_id || 't-mona'),
    teacherNameAr: String(r.teacherNameAr || r.teacher_name_ar || 'أ. منى فتحي'),
    enrolledAt: String(r.enrolledAt || r.enrolled_at || new Date().toISOString().slice(0, 10)),
    mastery: typeof r.mastery === 'number' ? r.mastery : 0,
    streak: typeof r.streak === 'number' ? r.streak : 0,
    lastActiveDate: String(r.lastActiveDate || r.last_active_date || new Date().toISOString().slice(0, 10)),
  }));
};

export const saveEnrolledStudents = (list: EnrolledStudent[]): void => {
  setPersistedJSON(STORAGE_ENROLLED, list);
};

/**
 * فحص هل الطالب مربوط بأي معلم حالياً من خلال اسمه الرباعي أو بريده الإلكتروني
 */
export const checkStudentLink = (
  userQuadName?: string | null,
  userEmail?: string | null
): EnrolledStudent | null => {
  if (!userQuadName && !userEmail) return null;
  const list = getEnrolledStudents();

  const normalize = (s?: string | null) =>
    (s || '')
      .trim()
      .toLowerCase()
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/\s+/g, ' ');

  const targetQuad = userQuadName ? normalize(userQuadName) : '';
  const targetEmail = userEmail ? (userEmail || '').trim().toLowerCase() : '';

  // 1. Check exact or fuzzy quadName
  if (targetQuad) {
    const found = list.find((s) => {
      const sQuad = normalize(s.quadName);
      return sQuad === targetQuad || targetQuad.includes(sQuad) || sQuad.includes(targetQuad);
    });
    if (found) return found;
  }

  // 2. Check email
  if (targetEmail) {
    const foundByEmail = list.find((s) => s.email && s.email.toLowerCase() === targetEmail);
    if (foundByEmail) return foundByEmail;
  }

  return null;
};

/**
 * قيام المعلم بإضافة طالب جديد إلى فصله بالاسم الرباعي
 */
export const addStudentToClassByTeacher = (params: {
  quadName: string;
  classId: string;
  schoolName: string;
  governorateId: string;
  administrationId: string;
  gradeLevel: string;
  email?: string;
}): EnrolledStudent => {
  const list = getEnrolledStudents();
  const cls = INITIAL_CLASSES.find((c) => c.id === params.classId) || INITIAL_CLASSES[0];
  const teacher = TEACHERS.find((t) => t.id === cls.teacherId) || TEACHERS[0];

  const newStudent: EnrolledStudent = {
    id: `std-${Date.now()}`,
    quadName: params.quadName.trim(),
    email: params.email?.trim() || `${params.quadName.trim().split(/\s+/)[0].toLowerCase()}@scinexa.school`,
    schoolName: params.schoolName.trim() || 'المدرسة المسجلة',
    governorateId: params.governorateId || 'cairo',
    administrationId: params.administrationId || 'default',
    gradeLevel: params.gradeLevel || cls.grade,
    classId: cls.id,
    classNameAr: cls.nameAr,
    teacherId: teacher.id,
    teacherNameAr: teacher.nameAr,
    enrolledAt: new Date().toISOString().slice(0, 10),
    mastery: 75,
    streak: 1,
    lastActiveDate: new Date().toISOString().slice(0, 10),
  };

  const updated = [newStudent, ...list];
  saveEnrolledStudents(updated);
  void dbEnrollStudent({
    id: newStudent.id,
    quad_name: newStudent.quadName,
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
 * حساب الستريك الحقيقي (Real Consecutive Days Streak) متزامن مع الكوكيز
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

/**
 * قائمة الواجبات الافتراضية للمعلمين
 */
export const DEFAULT_ASSIGNMENTS: AssignmentItem[] = [];

export const getAssignments = (): AssignmentItem[] => {
  const raw = getPersistedJSON<any[]>(STORAGE_ASSIGNMENTS, DEFAULT_ASSIGNMENTS);
  if (!Array.isArray(raw)) return [];
  return raw.map((a: any) => ({
    id: String(a.id || `as_${Math.random().toString(36).slice(2, 9)}`),
    titleAr: String(a.titleAr || a.title_ar || ''),
    titleEn: String(a.titleEn || a.title_en || a.titleAr || a.title_ar || ''),
    classId: String(a.classId || a.class_id || ''),
    classNameAr: String(a.classNameAr || a.class_name_ar || ''),
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

export const addAssignment = (item: AssignmentItem): void => {
  const list = getAssignments();
  const updated = [item, ...list];
  setPersistedJSON(STORAGE_ASSIGNMENTS, updated);
  void dbCreateAssignment({
    id: item.id,
    title_ar: item.titleAr,
    title_en: item.titleEn,
    class_id: item.classId,
    class_name_ar: item.classNameAr,
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

export const getSubmissions = (): StudentSubmission[] => {
  return getPersistedJSON<StudentSubmission[]>(STORAGE_SUBMISSIONS, []);
};

export const recordSubmission = (submission: StudentSubmission): void => {
  const current = getSubmissions();
  const existingIdx = current.findIndex(
    (s) => s.assignmentId === submission.assignmentId && s.studentQuadName === submission.studentQuadName
  );
  let updated: StudentSubmission[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = submission;
  } else {
    updated = [submission, ...current];
  }
  setPersistedJSON(STORAGE_SUBMISSIONS, updated);
  void dbSubmitAssignment({
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
 * مزامنة الطلاب المسجلين مع سوبابيز وقاعدة البيانات الحقيقية
 */
export const fetchAndSyncEnrollment = async (): Promise<EnrolledStudent[]> => {
  const remote = await dbFetchEnrolledStudents();
  if (remote && remote.length > 0) {
    const mapped: EnrolledStudent[] = remote.map((r: any) => ({
      id: r.id,
      quadName: r.quad_name,
      email: r.email,
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
  const remote = await dbFetchAssignments();
  if (remote && remote.length > 0) {
    const mapped: AssignmentItem[] = remote.map((a: any) => ({
      id: a.id,
      titleAr: a.title_ar,
      titleEn: a.title_en,
      classId: a.class_id,
      classNameAr: a.class_name_ar,
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
