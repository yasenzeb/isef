/**
 * schoolEnrollment.ts
 * إدارة بيانات الطلاب والربط الأكاديمي مع المعلمين والفصول والواجبات ونظام الستريك الحقيقي.
 *
 * © SciNexa Platform — ISEF 2026
 */

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
const DEFAULT_ENROLLED: EnrolledStudent[] = [
  {
    id: 'std-1',
    quadName: 'ياسين محمد إبراهيم زيد',
    email: 'yaseen@scinexa.school',
    schoolName: 'مدرسة المتفوقين للعلوم والتكنولوجيا (STEM)',
    governorateId: 'cairo',
    administrationId: 'maadi',
    gradeLevel: 'sec2',
    classId: '2a',
    classNameAr: 'كيمياء ٢أ (الصف الثاني الثانوي)',
    teacherId: 't-mona',
    teacherNameAr: 'أ. منى فتحي',
    enrolledAt: '2026-09-15',
    mastery: 88,
    streak: 4,
    lastActiveDate: new Date().toISOString().slice(0, 10),
  },
  {
    id: 'std-2',
    quadName: 'مريم حسن عبد الله السيد',
    email: 'mariam@scinexa.school',
    schoolName: 'مدرسة النيل المصرية الدولية',
    governorateId: 'giza',
    administrationId: 'dokki',
    gradeLevel: 'sec2',
    classId: '2a',
    classNameAr: 'كيمياء ٢أ (الصف الثاني الثانوي)',
    teacherId: 't-mona',
    teacherNameAr: 'أ. منى فتحي',
    enrolledAt: '2026-09-16',
    mastery: 92,
    streak: 6,
    lastActiveDate: new Date().toISOString().slice(0, 10),
  },
  {
    id: 'std-3',
    quadName: 'عمر عادل أحمد رضوان',
    email: 'omar@scinexa.school',
    schoolName: 'مدرسة الأورمان الثانوية بنين',
    governorateId: 'giza',
    administrationId: 'agouza',
    gradeLevel: 'sec3',
    classId: '3b',
    classNameAr: 'فيزياء ٣ب (الصف الثالث الثانوي)',
    teacherId: 't-hala',
    teacherNameAr: 'أ. هالة نبيل',
    enrolledAt: '2026-09-18',
    mastery: 76,
    streak: 3,
    lastActiveDate: new Date().toISOString().slice(0, 10),
  },
];

export const getEnrolledStudents = (): EnrolledStudent[] => {
  try {
    const raw = localStorage.getItem(STORAGE_ENROLLED);
    if (!raw) {
      localStorage.setItem(STORAGE_ENROLLED, JSON.stringify(DEFAULT_ENROLLED));
      return DEFAULT_ENROLLED;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ENROLLED;
  }
};

export const saveEnrolledStudents = (list: EnrolledStudent[]): void => {
  try {
    localStorage.setItem(STORAGE_ENROLLED, JSON.stringify(list));
  } catch {
    /* ignore storage errors */
  }
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

  const normalize = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/\s+/g, ' ');

  const targetQuad = userQuadName ? normalize(userQuadName) : '';
  const targetEmail = userEmail ? userEmail.trim().toLowerCase() : '';

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
  return newStudent;
};

/**
 * حساب الستريك الحقيقي (Real Consecutive Days Streak)
 */
export const updateAndGetRealStreak = (): number => {
  const today = new Date().toISOString().slice(0, 10);
  const lastDate = localStorage.getItem('scinexa_last_visit_date');
  let currentStreak = parseInt(localStorage.getItem('scinexa_user_streak') || '1', 10);

  if (!lastDate) {
    localStorage.setItem('scinexa_last_visit_date', today);
    localStorage.setItem('scinexa_user_streak', '1');
    return 1;
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

  localStorage.setItem('scinexa_last_visit_date', today);
  localStorage.setItem('scinexa_user_streak', String(currentStreak));
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
export const DEFAULT_ASSIGNMENTS: AssignmentItem[] = [
  {
    id: 'asg-1',
    titleAr: 'تقرير تجربة اختزال أكسيد النحاس بالهيدروجين وحساب كتل النواتج',
    titleEn: 'Hydrogen reduction lab report & stoichiometric yields',
    classId: '2a',
    classNameAr: 'كيمياء ٢أ (الصف الثاني الثانوي)',
    teacherId: 't-mona',
    teacherNameAr: 'أ. منى فتحي',
    linkedLab: 'chemistry',
    dueDateAr: 'الخميس القادم · ١٠:٠٠ م',
    dueDateEn: 'Next Thursday · 10:00 PM',
    descriptionAr: 'قم بفتح معمل الكيمياء 3D واختيار أكسيد النحاس CuO مع غاز الهيدروجين H2 وتشغيل التسخين، ثم سجل معادلة التفاعل والكتل الناتجة في التقرير.',
    descriptionEn: 'Open Chemistry 3D Lab, select CuO with H2, trigger heating, and record observed color shifts and stoichiometry.',
    totalPoints: 100,
    assignedAt: '2026-11-01',
  },
  {
    id: 'asg-2',
    titleAr: 'ورقة عمل حساب التردد والرنين وسرعة الموجة في وتر مشدود',
    titleEn: 'Wave Harmonics & String Tension Calculation Worksheet',
    classId: '3b',
    classNameAr: 'فيزياء ٣ب (الصف الثالث الثانوي)',
    teacherId: 't-hala',
    teacherNameAr: 'أ. هالة نبيل',
    linkedLab: 'physics',
    dueDateAr: 'الأحد القادم · ٠٨:٠٠ م',
    dueDateEn: 'Next Sunday · 08:00 PM',
    descriptionAr: 'اختبر تغيير التردد في معمل الموجات ولاحظ العقد والبطون واحسب سرعة انتشار الموجة بدقة.',
    descriptionEn: 'Observe standing waves, antinodes, and calculate wave propagation velocity under different tension loads.',
    totalPoints: 100,
    assignedAt: '2026-11-02',
  },
];

export const getAssignments = (): AssignmentItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_ASSIGNMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_ASSIGNMENTS, JSON.stringify(DEFAULT_ASSIGNMENTS));
      return DEFAULT_ASSIGNMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ASSIGNMENTS;
  }
};

export const addAssignment = (item: AssignmentItem): void => {
  const list = getAssignments();
  const updated = [item, ...list];
  try {
    localStorage.setItem(STORAGE_ASSIGNMENTS, JSON.stringify(updated));
  } catch {
    /* ignore */
  }
};
