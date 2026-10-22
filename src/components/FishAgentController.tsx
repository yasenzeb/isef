import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { saveState } from '../utils/persistence';
import { useAuth } from '../context/AuthContext';
import { EGYPT_GOVERNORATES } from '../data/egyptLocationData';

interface FishAgentControllerProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  language: string;
}

const LAB_MAP: Record<string, { ar: string; en: string }> = {
  anatomy: { ar: 'أطلس التشريح ثلاثي الأبعاد', en: '3D Anatomy Atlas' },
  physics: { ar: 'مختبر الفيزياء والدوائر والموجات', en: 'Physics & Circuits Lab' },
  chemistry: { ar: 'مختبر الكيمياء والجدول الدوري والتفاعلات', en: 'Chemistry & Periodic Table' },
  biology: { ar: 'مختبر الأحياء والخلية والكائنات الدقيقة', en: 'Biology & Cell Lab' },
  geology: { ar: 'علوم الأرض ومحاكي انهيار المباني والزلازل', en: 'Geology & Earth Sciences' },
  astronomy: { ar: 'علم الفلك ومدارات كبلر والنظام الشمسي', en: 'Astronomy & Kepler Orbits' },
  classroom: { ar: 'وضع الفصل والشاشات الذكية التفاعلية', en: 'Classroom Smartboard HUD' },
  home: { ar: 'الصفحة الرئيسية', en: 'Home Screen' },
};

function cleanText(t: string): string {
  return (t || '')
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ئ/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/[\u064B-\u065F]/g, '')
    .trim();
}

export interface ResolvedNav {
  mainTab: string;
  subModule?: string;
  labelAr: string;
  labelEn: string;
  focusPart?: string;
}

export function resolveNavigation(rawInput: string): ResolvedNav | null {
  const c = cleanText(rawInput);
  if (!c || c.length < 2) return null;

  // ========================================================
  // 1. SPECIFIC ANATOMICAL SPECIMENS & ORGANS (أجزاء وأعضاء محددة)
  // ========================================================
  if (c.includes('قلب') || c.includes('heart') || c.includes('شريان') || c.includes('اورده') || c.includes('اوعيه دمويه')) {
    return { mainTab: 'anatomy', subModule: 'cardiovascular', labelAr: 'أطلس التشريح — القلب والجهاز الدوري', labelEn: 'Anatomy — Cardiovascular & Heart', focusPart: 'Heart' };
  }
  if (c.includes('مخ') || c.includes('دماغ') || c.includes('brain') || /\bالمخ\b|\bمخ\b/.test(c)) {
    return { mainTab: 'anatomy', subModule: 'nervous', labelAr: 'أطلس التشريح — الدماغ والجهاز العصبي', labelEn: 'Anatomy — Brain & Nervous', focusPart: 'Brain' };
  }
  if (c.includes('فخذ') || c.includes('عظم الفخذ') || c.includes('femur')) {
    return { mainTab: 'anatomy', subModule: 'skeletal', labelAr: 'أطلس التشريح — عظم الفخذ (Femur)', labelEn: 'Anatomy — Femur Bone', focusPart: 'Femur' };
  }
  if (c.includes('جمجمه') || c.includes('راس') || c.includes('skull') || c.includes('cranium')) {
    return { mainTab: 'anatomy', subModule: 'skeletal', labelAr: 'أطلس التشريح — الجمجمة (Skull)', labelEn: 'Anatomy — Cranium & Skull', focusPart: 'Cranium' };
  }
  if (c.includes('عمود فقر') || c.includes('فقرات') || c.includes('spine') || c.includes('vertebra')) {
    return { mainTab: 'anatomy', subModule: 'skeletal', labelAr: 'أطلس التشريح — العمود الفقري', labelEn: 'Anatomy — Vertebral Column', focusPart: 'Vertebral column' };
  }
  if (c.includes('قفص صدر') || c.includes('اضلاع') || c.includes('ضلوع') || c.includes('rib')) {
    return { mainTab: 'anatomy', subModule: 'skeletal', labelAr: 'أطلس التشريح — القفص الصدري والأضلاع', labelEn: 'Anatomy — Rib Cage', focusPart: 'Ribs' };
  }
  if (c.includes('ترقوه') || c.includes('clavicle')) {
    return { mainTab: 'anatomy', subModule: 'skeletal', labelAr: 'أطلس التشريح — عظم الترقوة', labelEn: 'Anatomy — Clavicle', focusPart: 'Clavicle' };
  }
  if (c.includes('لوح الكتف') || c.includes('scapula')) {
    return { mainTab: 'anatomy', subModule: 'skeletal', labelAr: 'أطلس التشريح — لوح الكتف', labelEn: 'Anatomy — Scapula', focusPart: 'Scapula' };
  }
  if (c.includes('معده') || c.includes('stomach')) {
    return { mainTab: 'anatomy', subModule: 'visceral', labelAr: 'أطلس التشريح — المعدة والجهاز الهضمي', labelEn: 'Anatomy — Stomach', focusPart: 'Stomach' };
  }
  if (c.includes('كبد') || c.includes('liver')) {
    return { mainTab: 'anatomy', subModule: 'visceral', labelAr: 'أطلس التشريح — الكبد', labelEn: 'Anatomy — Liver', focusPart: 'Liver' };
  }
  if (c.includes('رئه') || c.includes('رئتين') || c.includes('lung')) {
    return { mainTab: 'anatomy', subModule: 'visceral', labelAr: 'أطلس التشريح — الرئتان والجهاز التنفسي', labelEn: 'Anatomy — Lungs', focusPart: 'Lungs' };
  }
  if (c.includes('بايسبس') || c.includes('عضله الذراع') || c.includes('biceps')) {
    return { mainTab: 'anatomy', subModule: 'muscular', labelAr: 'أطلس التشريح — العضلة ذات الرأسين (Biceps)', labelEn: 'Anatomy — Biceps', focusPart: 'Biceps' };
  }
  if (c.includes('ركبه') || c.includes('صابونه') || c.includes('knee') || c.includes('patella')) {
    return { mainTab: 'anatomy', subModule: 'joints', labelAr: 'أطلس التشريح — مفصل الركبة والرضفة', labelEn: 'Anatomy — Knee Joint', focusPart: 'Knee joint' };
  }

  // ========================================================
  // 2. ANATOMY SYSTEMS & LAYERS (أجهزة التشريح)
  // ========================================================
  if (c.includes('عضل') || c.includes('muscl')) {
    return { mainTab: 'anatomy', subModule: 'muscular', labelAr: 'أطلس التشريح — الجهاز العضلي الكامل', labelEn: 'Anatomy — Muscular System' };
  }
  if (c.includes('دوري') || c.includes('cardio') || c.includes('قلب')) {
    return { mainTab: 'anatomy', subModule: 'cardiovascular', labelAr: 'أطلس التشريح — الجهاز الدوري والقلب', labelEn: 'Anatomy — Cardiovascular' };
  }
  if (c.includes('عصب') || c.includes('nervous') || c.includes('نخاع') || c.includes('حبل شوك')) {
    return { mainTab: 'anatomy', subModule: 'nervous', labelAr: 'أطلس التشريح — الجهاز العصبي والدماغ', labelEn: 'Anatomy — Nervous System' };
  }
  if (c.includes('مفصل') || c.includes('مفاصل') || c.includes('رباط') || c.includes('اربط') || c.includes('غضروف') || c.includes('غضاريف') || c.includes('joint')) {
    return { mainTab: 'anatomy', subModule: 'joints', labelAr: 'أطلس التشريح — المفاصل والأربطة', labelEn: 'Anatomy — Joints & Ligaments' };
  }
  if (c.includes('احشاء') || c.includes('هضم') || c.includes('باطن') || c.includes('viscer')) {
    return { mainTab: 'anatomy', subModule: 'visceral', labelAr: 'أطلس التشريح — الأعضاء الحشوية والداخلية', labelEn: 'Anatomy — Visceral Organs' };
  }
  if (c.includes('عظام') || c.includes('عظم') || c.includes('هيكل') || c.includes('skelet') || c.includes('bone')) {
    return { mainTab: 'anatomy', subModule: 'skeletal', labelAr: 'أطلس التشريح — الهيكل العظمي 3D', labelEn: 'Anatomy — Skeletal System' };
  }
  if (c.includes('تشريح') || c.includes('اناتومي') || c.includes('جسم الانسان') || c.includes('anatomy')) {
    return { mainTab: 'anatomy', subModule: 'skeletal', labelAr: 'أطلس تشريح جسم الإنسان ثلاثي الأبعاد', labelEn: 'Human Anatomy 3D Atlas' };
  }

  // ========================================================
  // 3. CHEMISTRY (الكيمياء، الجدول الدوري، التفاعلات)
  // ========================================================
  if (c.includes('تفاعل') || c.includes('معادل') || c.includes('احماض') || c.includes('قلوي') || c.includes('احلال') || c.includes('اتحاد') || c.includes('انحلال') || c.includes('reaction')) {
    return { mainTab: 'chemistry', subModule: 'reactions', labelAr: 'مختبر الكيمياء — محاكي التفاعلات الكيميائية', labelEn: 'Chemistry — Chemical Reactions' };
  }
  if (c.includes('ذري') || c.includes('مجموعات') || c.includes('ايون') || c.includes('هيدروكسيد') || c.includes('radical')) {
    return { mainTab: 'chemistry', subModule: 'atomic-groups', labelAr: 'مختبر الكيمياء — المجموعات والأيونات الذرية', labelEn: 'Chemistry — Polyatomic Groups' };
  }
  if (c.includes('دوري') || c.includes('جدول') || c.includes('عناصر') || c.includes('عنصر') || c.includes('periodic')) {
    return { mainTab: 'chemistry', subModule: 'periodic', labelAr: 'مختبر الكيمياء — الجدول الدوري للعناصر', labelEn: 'Chemistry — Periodic Table' };
  }
  if (c.includes('كيميا') || c.includes('chem')) {
    return { mainTab: 'chemistry', subModule: 'periodic', labelAr: 'مختبر الكيمياء ثلاثي الأبعاد', labelEn: 'Chemistry Laboratory' };
  }

  // ========================================================
  // 4. PHYSICS (الفيزياء، الدوائر، المقذوفات، البصريات، الموجات)
  // ========================================================
  if (c.includes('دواير') || c.includes('دوائر') || c.includes('دائر') || c.includes('كهربا') || c.includes('اوم') || c.includes('كيرشوف') || c.includes('مقاوم') || c.includes('فولت') || c.includes('امبير') || c.includes('circuit')) {
    return { mainTab: 'physics', subModule: 'circuits', labelAr: 'مختبر الفيزياء — الدوائر الكهربائية وقانون أوم', labelEn: 'Physics — Electric Circuits' };
  }
  if (c.includes('مقذوف') || c.includes('مدفع') || c.includes('رمي') || c.includes('اطلاق') || c.includes('projectil')) {
    return { mainTab: 'physics', subModule: 'projectiles', labelAr: 'مختبر الفيزياء — حركة المقذوفات وزوايا الإطلاق', labelEn: 'Physics — Projectile Motion' };
  }
  if (c.includes('بصر') || c.includes('انكسار') || c.includes('عدس') || c.includes('منشور') || c.includes('سنيل') || c.includes('انعكاس') || c.includes('optic')) {
    return { mainTab: 'physics', subModule: 'optics', labelAr: 'مختبر الفيزياء — البصريات وانكسار الضوء', labelEn: 'Physics — Optics & Refraction' };
  }
  if (c.includes('موج') || c.includes('رنين') || c.includes('تردد') || c.includes('طول موج') || c.includes('اهتزاز') || c.includes('وتر') || c.includes('wave')) {
    return { mainTab: 'physics', subModule: 'waves', labelAr: 'مختبر الفيزياء — محاكاة الموجات والرنين', labelEn: 'Physics — Waves & Resonance' };
  }
  if (c.includes('نيوتن') || c.includes('قوى') || c.includes('قوه') || c.includes('حرك') || c.includes('force')) {
    return { mainTab: 'physics', subModule: 'forces', labelAr: 'مختبر الفيزياء — القوى وقوانين نيوتن للحركة', labelEn: 'Physics — Forces & Newton Laws' };
  }
  if (c.includes('فيزيا') || c.includes('physic')) {
    return { mainTab: 'physics', subModule: 'circuits', labelAr: 'مختبر الفيزياء والدوائر والموجات', labelEn: 'Physics Laboratory' };
  }

  // ========================================================
  // 5. BIOLOGY (الأحياء، الخلية، DNA، الكائنات الدقيقة)
  // ========================================================
  if (c.includes('dna') || c.includes('وراث') || c.includes('جين')) {
    return { mainTab: 'biology', subModule: 'dna', labelAr: 'مختبر الأحياء — الحمض النووي (DNA)', labelEn: 'Biology — DNA Helix' };
  }
  if (c.includes('ميكروب') || c.includes('اميبا') || c.includes('يوجلينا') || c.includes('براميسيوم') || c.includes('بكتيري') || c.includes('كائنات دقيق')) {
    return { mainTab: 'biology', subModule: 'microorganisms', labelAr: 'مختبر الأحياء — الكائنات الدقيقة والمجهرية', labelEn: 'Biology — Microorganisms' };
  }
  if (c.includes('خليه') || c.includes('خلايا') || c.includes('احيا') || c.includes('بيولوج') || c.includes('ميتوكوندريا') || c.includes('bio')) {
    return { mainTab: 'biology', subModule: 'sketchfab_cell', labelAr: 'مختبر الأحياء والخلية ثلاثية الأبعاد', labelEn: 'Biology & Cell Laboratory' };
  }

  // ========================================================
  // 6. GEOLOGY (علوم الأرض، الزلازل، ريختر، تسونامي)
  // ========================================================
  if (c.includes('جيولوج') || c.includes('زلزال') || c.includes('زلازل') || c.includes('تسونامي') || c.includes('علوم الارض') || c.includes('طبقات الارض') || c.includes('انهيار') || c.includes('ريختر') || c.includes('صفائح') || c.includes('صخور') || c.includes('geol') || c.includes('earthquake')) {
    return { mainTab: 'geology', labelAr: 'علوم الأرض والزلازل ومحاكي انهيار المباني', labelEn: 'Geology & Seismic Simulation' };
  }

  // ========================================================
  // 7. ASTRONOMY (الفلك، المجموعة الشمسية، كبلر، الكواكب)
  // ========================================================
  if (c.includes('فلك') || c.includes('كوكب') || c.includes('كواكب') || c.includes('كبلر') || c.includes('شمس') || c.includes('مجموعه شمس') || c.includes('نظام شمس') || c.includes('فضاء') || c.includes('مدار') || c.includes('اطوار القمر') || c.includes('خسوف') || c.includes('كسوف') || c.includes('astro') || c.includes('solar')) {
    return { mainTab: 'astronomy', labelAr: 'علم الفلك ومدارات كبلر والنظام الشمسي', labelEn: 'Astronomy & Kepler Orbits' };
  }

  // ========================================================
  // 8. CLASSROOM (وضع الفصل والسبورة الذكية)
  // ========================================================
  if (c.includes('فصل') || c.includes('سبور') || c.includes('شاشه ذكي') || c.includes('بروجكتور') || c.includes('class') || c.includes('board')) {
    return { mainTab: 'classroom', labelAr: 'وضع الفصل والشاشات الذكية التفاعلية', labelEn: 'Classroom Smartboard Mode' };
  }

  // ========================================================
  // 9. HOME (الصفحة الرئيسية)
  // ========================================================
  if (c.includes('رئيس') || c.includes('بداي') || c.includes('خروج') || c.includes('home')) {
    return { mainTab: 'home', labelAr: 'الصفحة الرئيسية', labelEn: 'Home Screen' };
  }

  return null;
}

// Global persistent shared object ID on restful-api.dev
const SHARED_OBJECT_ID = 'ff808181a09d98f701a15d4988ed38d4';
const RELAY_ENDPOINT = `https://api.restful-api.dev/objects/${SHARED_OBJECT_ID}`;

export const FishAgentController: React.FC<FishAgentControllerProps> = ({
  currentTab,
  setCurrentTab,
  language,
}) => {
  const { user } = useAuth();
  const userRef = useRef(user);
  userRef.current = user;

  const [locationTick, setLocationTick] = useState(0);

  // Re-sync on manual location changes
  useEffect(() => {
    const handleLocChanged = () => setLocationTick(t => t + 1);
    window.addEventListener('scinexa_location_changed', handleLocChanged);
    window.addEventListener('storage', handleLocChanged);
    return () => {
      window.removeEventListener('scinexa_location_changed', handleLocChanged);
      window.removeEventListener('storage', handleLocChanged);
    };
  }, []);

  const activeGovInfo = useMemo(() => {
    const savedGovId = localStorage.getItem('scinexa_gov_id') || '';
    const savedAdminId = localStorage.getItem('scinexa_admin_id') || '';
    const activeGov = EGYPT_GOVERNORATES.find(g => g.id === savedGovId);
    const activeAdmin = activeGov?.administrations.find(a => a.id === savedAdminId);

    const govName = activeGov?.nameAr || user?.governorateAr || 'جمهورية مصر العربية';
    const adminName = activeAdmin?.nameAr || user?.administrationAr || '';
    return { govName, adminName };
  }, [user, locationTick]);

  const currentTabRef = useRef(currentTab);
  currentTabRef.current = currentTab;

  const languageRef = useRef(language);
  languageRef.current = language;

  const latestContextRef = useRef<{ title?: string; desc?: string; type?: string }>({});
  const lastProcessedRelayTimeRef = useRef<number>(Date.now() - 5000);
  const lastNavigatedRef = useRef<{ tab: string; subModule?: string; focusPart?: string; time: number }>({ tab: '', time: 0 });
  const processedSnippetsRef = useRef<Set<string>>(new Set());

  // Transient Toast Notification
  const [navToast, setNavToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  const showToast = (message: string) => {
    setNavToast({ message, visible: true });
    setTimeout(() => setNavToast({ message: '', visible: false }), 4500);
  };

  // Perform safe lab & part navigation with cooldown protection and multi-pulse delivery
  const triggerNavigation = (
    targetMainTab: string,
    subModule?: string,
    label?: string,
    focusPart?: string
  ) => {
    if (!targetMainTab) return;

    const now = Date.now();
    // Prevent duplicate triggers if already at target within 2.5s
    if (
      lastNavigatedRef.current.tab === targetMainTab &&
      lastNavigatedRef.current.subModule === subModule &&
      lastNavigatedRef.current.focusPart === focusPart &&
      now - lastNavigatedRef.current.time < 2500
    ) {
      return;
    }

    lastNavigatedRef.current = { tab: targetMainTab, subModule, focusPart, time: now };

    // 1. Immediately persist states into localStorage so that target component initializes directly to it on mount!
    saveState('app_tab', targetMainTab);
    if (subModule) {
      if (targetMainTab === 'physics') saveState('physics_module', subModule);
      if (targetMainTab === 'chemistry') saveState('chemistry_tab', subModule);
      if (targetMainTab === 'anatomy') saveState('anatomy_layer', subModule);
      if (targetMainTab === 'biology') saveState('biology_tab', subModule);
    }
    if (focusPart) {
      saveState('anatomy_focus_part', focusPart);
    }

    // 2. Switch main tab
    if (currentTabRef.current !== targetMainTab) {
      setCurrentTab(targetMainTab);
    }

    // 3. Show HUD toast
    const displayLabel = label || targetMainTab;
    showToast(languageRef.current === 'ar' ? `🚀 تم الانتقال إلى: ${displayLabel}` : `🚀 Navigating to: ${displayLabel}`);

    // 4. Repeated event dispatch to guarantee delivery to target component
    const dispatchSubEvents = () => {
      if (targetMainTab === 'physics' && subModule) {
        window.dispatchEvent(new CustomEvent('scinexa:switch_physics_module', { detail: { module: subModule } }));
      } else if (targetMainTab === 'chemistry' && subModule) {
        window.dispatchEvent(new CustomEvent('scinexa:switch_chemistry_tab', { detail: { tab: subModule } }));
      } else if (targetMainTab === 'anatomy') {
        if (subModule) {
          window.dispatchEvent(new CustomEvent('scinexa:switch_anatomy_layer', { detail: { layer: subModule } }));
        }
        if (focusPart) {
          window.dispatchEvent(new CustomEvent('scinexa:focus_part', { detail: { part: focusPart } }));
        }
      } else if (targetMainTab === 'biology' && subModule) {
        window.dispatchEvent(new CustomEvent('scinexa:switch_biology_tab', { detail: { tab: subModule } }));
      }
    };

    dispatchSubEvents();
    setTimeout(dispatchSubEvents, 120);
    setTimeout(dispatchSubEvents, 350);
    setTimeout(dispatchSubEvents, 800);
    setTimeout(dispatchSubEvents, 1600);
  };

  // 1. Expose global window bridge for any direct scripts or window events
  useEffect(() => {
    (window as any).SciNexa = {
      navigate: (tab: string, subModule?: string, focusPart?: string) => {
        triggerNavigation(tab, subModule, undefined, focusPart);
      },
      getLab: () => currentTabRef.current,
      getLanguage: () => languageRef.current,
      getContext: () => latestContextRef.current,
    };
  }, [setCurrentTab]);

  // 2. Synchronize Platform State, Student Persona & Language with <fish-agent> & /api/fish-tool
  const syncPlatformState = useCallback((extraContext?: any) => {
    const tab = currentTabRef.current;
    const lang = languageRef.current;
    const labMeta = LAB_MAP[tab] || LAB_MAP.home;
    const context = extraContext || latestContextRef.current || {};
    const u = userRef.current;

    const studentFirstName = u?.displayName ? u.displayName.trim().split(' ')[0] : (lang === 'ar' ? 'طالبنا المتميز' : 'Student');
    const fullStudentName = u?.displayName || (lang === 'ar' ? 'طالب منصة SciNexa' : 'SciNexa Student');
    const studentRole = u?.role === 'teacher' ? 'معلم' : u?.role === 'principal' ? 'مدير مدرسة' : 'طالب';
    const studentGrade = u?.grade || '';
    const studentStage = u?.stage || '';
    const studentCode = u?.studentCode || u?.email?.match(/^(\d+)/)?.[1] || '';
    const isGuest = Boolean(u?.isGuest);
    const govName = activeGovInfo.govName;
    const adminName = activeGovInfo.adminName;

    const gradeTitle = studentGrade ? ` يا بطل ${studentGrade}` : ' يا بطل العلوم والمعامل';

    const dynamicVars = {
      current_lab: lang === 'ar' ? labMeta.ar : labMeta.en,
      active_tab_id: tab,
      language: lang,
      user_language: lang === 'ar' ? 'العربية' : 'English',
      student_name: studentFirstName,
      friend_name: studentFirstName,
      full_name: fullStudentName,
      user_role: studentRole,
      student_code: studentCode,
      educational_stage: studentStage,
      school_grade: studentGrade || 'المرحلة الإعدادية',
      hero_title: gradeTitle.trim(),
      is_guest: isGuest ? 'نعم (وضع الزائر)' : 'لا (حساب رسمي موثق)',
      student_gender: u?.gender === 'female' ? 'أنثى' : 'ذكر',
      student_age: u?.age ? `${u.age} سنة` : '',
      instruction_persona:
        lang === 'ar'
          ? `أنت "داروين"، الصديق المقرب والمرشد العلمي الذكي في منصة SciNexa.
قواعد التخاطب الصارمة والمحددة:
1. أنت صديق لـ "${studentFirstName}"؛ تحدث معه بأسلوب حواري عفوي وطبيعي ودافئ.
2. لا تكرر إطلاقاً عبارة "يا صديقي" في كل جملة! قلها في التحية الأولى فقط، ثم خاطبه باسمه مباشرة ("يا ${studentFirstName}" أو "${studentFirstName}").
3. لا تكرر إطلاقاً عبارة "يا بطل الصف كذا" في كل رد! تحدث معه دون تكرار ألقاب.
4. عندما يطلب منك الانتقال إلى أي مختبر، أو فتح أي قسم، أو فحص أي جزء أو عضو أو عظمة أو عنصر، ابدأ ردك الصوتي فوراً بـ:
"سأنقلك فوراً إلى [اسم المعمل أو القسم أو الجزء]"
(مثل: "سأنقلك فوراً إلى الهيكل العظمي"، "سأنقلك فوراً إلى القلب"، "سأنقلك فوراً إلى مختبر الكيمياء"). هذه العبارة توجه المنصة آلياً.`
          : `You are Darwin, the scientific AI mentor on SciNexa.
Rules:
1. Address "${studentFirstName}" naturally by first name without repetitive phrases like "my friend".
2. When asked to switch labs or view a specific part/organ, start with "Navigating to [destination] right away!" to trigger the platform navigation.`,
      selected_item: context.title || (lang === 'ar' ? 'تصفح عام للمختبر' : 'General lab browsing'),
      item_details: context.desc || '',
      timestamp: Date.now(),
    };

    const agentEl = document.querySelector('fish-agent');
    if (agentEl) {
      try {
        agentEl.setAttribute('language', lang);
        agentEl.setAttribute('dynamic-variables', JSON.stringify(dynamicVars));

        let greetingText = '';
        if (lang === 'ar') {
          if (isGuest) {
            greetingText = `أهلاً يا صديقي! يا بطل منصة SciNexa. أنا داروين مرشدك العلمي، مستعد لاستكشاف معمل ${labMeta.ar} اليوم؟`;
          } else {
            greetingText = `أهلاً يا صديقي ${studentFirstName}! يا بطل ${studentGrade || 'العلوم والمعامل'}. أنا داروين مرشدك العلمي، مستعد نبدأ تجاربنا اليوم؟`;
          }
        } else {
          greetingText = `Hello my friend ${studentFirstName}! Welcome to SciNexa. Ready to experiment in the ${labMeta.en}?`;
        }

        agentEl.setAttribute('greeting', greetingText);
      } catch (err) {
        console.warn('Could not update fish-agent attributes:', err);
      }
    }

    fetch('/api/fish-tool?action=report_state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentTab: tab,
        labNameAr: labMeta.ar,
        language: lang,
        selectedItem: context.title,
        details: context.desc,
        studentName: studentFirstName,
        fullName: fullStudentName,
        role: studentRole,
        governorate: govName,
        administration: adminName,
        grade: studentGrade,
        stage: studentStage,
        code: studentCode,
        isGuest,
      }),
    }).catch(() => {});
  }, [activeGovInfo]);

  useEffect(() => {
    syncPlatformState();
  }, [currentTab, language, user, activeGovInfo, syncPlatformState]);

  // 3. Listen to 3D model selection events
  useEffect(() => {
    const handleLabContext = (e: any) => {
      if (e.detail) {
        latestContextRef.current = e.detail;
        syncPlatformState(e.detail);
      }
    };

    window.addEventListener('scinexa:context', handleLabContext);
    return () => window.removeEventListener('scinexa:context', handleLabContext);
  }, []);

  // 4. REAL-TIME SHADOW DOM OBSERVER: Listens to the latest message in chat
  useEffect(() => {
    let observer: MutationObserver | null = null;
    let pollAttempts = 0;

    const checkLatestTranscriptMessage = () => {
      const agentEl = document.querySelector('fish-agent') as any;
      if (!agentEl?.shadowRoot) return;

      const elements = agentEl.shadowRoot.querySelectorAll('p, span, div, [class*="message"], [class*="text"]');
      if (!elements || elements.length === 0) return;

      // Keep processedSnippets size reasonable
      if (processedSnippetsRef.current.size > 250) {
        processedSnippetsRef.current.clear();
      }

      // Scan from bottom upwards (latest message first)
      for (let i = elements.length - 1; i >= Math.max(0, elements.length - 25); i--) {
        const text = (elements[i].innerText || elements[i].textContent || '').trim();
        if (text.length >= 2 && !processedSnippetsRef.current.has(text)) {
          processedSnippetsRef.current.add(text);

          const resolved = resolveNavigation(text);
          if (resolved && resolved.mainTab) {
            triggerNavigation(
              resolved.mainTab,
              resolved.subModule,
              languageRef.current === 'ar' ? resolved.labelAr : resolved.labelEn,
              resolved.focusPart
            );
            break;
          }
        }
      }
    };

    const setupObserver = () => {
      const agentEl = document.querySelector('fish-agent') as any;
      if (!agentEl) {
        if (pollAttempts < 30) {
          pollAttempts++;
          setTimeout(setupObserver, 500);
        }
        return;
      }

      const shadow = agentEl.shadowRoot;
      if (!shadow) {
        if (pollAttempts < 30) {
          pollAttempts++;
          setTimeout(setupObserver, 500);
        }
        return;
      }

      try {
        observer = new MutationObserver(() => {
          checkLatestTranscriptMessage();
        });

        observer.observe(shadow, {
          childList: true,
          subtree: true,
          characterData: true,
        });
      } catch (err) {
        console.warn('Could not attach Shadow DOM observer on fish-agent:', err);
      }
    };

    setupObserver();

    // Pulse sweep every 500ms to catch any stream updates
    const sweepInterval = setInterval(checkLatestTranscriptMessage, 500);

    return () => {
      if (observer) observer.disconnect();
      clearInterval(sweepInterval);
    };
  }, []);

  // 5. POLL RELAY & VERCEL ENDPOINTS (Guaranteed delivery from switch_lab webhook)
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      // 1. Direct check on Global Shared Persistent Relay
      try {
        const relayRes = await fetch(RELAY_ENDPOINT, { signal: AbortSignal.timeout(1200) });
        if (relayRes.ok) {
          const json = await relayRes.json();
          const act = json?.data;
          if (act && act.action === 'switch_lab' && act.timestamp > lastProcessedRelayTimeRef.current) {
            // Must be within last 30 seconds
            if (Date.now() - act.timestamp < 30000) {
              lastProcessedRelayTimeRef.current = act.timestamp;
              triggerNavigation(act.main_tab, act.sub_module, act.message);
            }
          }
        }
      } catch {}

      // 2. Fallback check on Vercel endpoint
      try {
        const res = await fetch('/api/fish-tool?action=poll_actions');
        if (res.ok) {
          const data = await res.json();
          if (data.actions && data.actions.length > 0) {
            for (const act of data.actions) {
              if (act.timestamp > lastProcessedRelayTimeRef.current) {
                lastProcessedRelayTimeRef.current = act.timestamp;
                if (act.action === 'switch_lab') {
                  triggerNavigation(act.main_tab, act.sub_module, act.message);
                }
              }
            }
          }
        }
      } catch {}
    }, 600);

    return () => clearInterval(pollInterval);
  }, []);

  return (
    <>
      {navToast.visible && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 border border-cyan-400/60 shadow-2xl shadow-cyan-500/20 text-white flex items-center gap-2.5 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-mono font-bold">{navToast.message}</span>
        </div>
      )}
    </>
  );
};
export default FishAgentController;
