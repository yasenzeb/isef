/**
 * darwinNavigator.ts — المحرك الذكي للربط اللحظي بين وكيل Fish Audio والتنقل الفعلي في المنصة
 * يراقب إشارات ورسائل داروين ويقوم بنقل المستخدم فوراً للمعمل أو الصفحة المطلوبة
 *
 * © Islam & Yaseen — SciNexa ISEF 2026
 */

export interface NavDestination {
  path: string;
  nameAr: string;
  nameEn: string;
  keywords: string[];
}

export const DESTINATIONS: NavDestination[] = [
  {
    path: '/app/labs/chemistry',
    nameAr: 'معمل الكيمياء والتفاعلات',
    nameEn: 'Chemistry Reactions Lab',
    keywords: [
      'كيمياء', 'كيميا', 'تفاعل', 'تفاعلات', 'جدول دوري', 'عناصر', 'دورق',
      'صوديوم', 'كلور', 'حمض', 'قاعدة', 'كيميائي', 'كيميائية', 'chemistry', 'chem', 'reactions'
    ],
  },
  {
    path: '/app/labs/physics',
    nameAr: 'مختبر الفيزياء والدوائر',
    nameEn: 'Physics & DC Circuits Lab',
    keywords: [
      'فيزياء', 'فيزيا', 'دوائر', 'دائرة', 'كهربا', 'كهرباء', 'قانون أوم', 'أوم',
      'اوم', 'فولت', 'مقاومة', 'تيار', 'موجات', 'فيزيائي', 'physics', 'circuits', 'ohm'
    ],
  },
  {
    path: '/app/labs/anatomy',
    nameAr: 'أطلس التشريح الطبي 3D',
    nameEn: '3D Anatomy Atlas',
    keywords: [
      'تشريح', 'عظام', 'عظم', 'جمجمة', 'فخذ', 'هيكل', 'قلب', 'أعضاء', 'اعضاء',
      'جسد', 'جسم', 'عضلة', 'عضلات', 'قفص صدري', 'تشريحي', 'anatomy', 'skeleton', 'bones', 'skull'
    ],
  },
  {
    path: '/app/labs/astronomy',
    nameAr: 'مرصد الفلك ومدارات كبلر',
    nameEn: 'Astronomy & Kepler Lab',
    keywords: [
      'فلك', 'كواكب', 'كوكب', 'شمس', 'قمر', 'كبلر', 'مدارات', 'مدار', 'نظام شمسي',
      'نجوم', 'مشتري', 'زحل', 'مريخ', 'فضاء', 'فلكي', 'astronomy', 'kepler', 'space', 'solar'
    ],
  },
  {
    path: '/app/labs/biology',
    nameAr: 'مختبر الأحياء والخلية',
    nameEn: 'Biology & Cell Lab',
    keywords: [
      'أحياء', 'احياء', 'خلية', 'خلايا', 'dna', 'ميتوكوندريا', 'أميبا', 'اميبا',
      'يوجلينا', 'براميسيوم', 'كائنات دقيقة', 'جينات', 'مجهر', 'أحيائي', 'biology', 'cell'
    ],
  },
  {
    path: '/app/labs/geology',
    nameAr: 'معمل علوم الأرض والزلازل',
    nameEn: 'Geology & Seismic Lab',
    keywords: [
      'جيولوجيا', 'أرض', 'ارض', 'زلازل', 'زلزال', 'تسونامي', 'طبقات الأرض',
      'صفائح تكتونية', 'رنين', 'صخور', 'جيولوجي', 'geology', 'earthquake', 'seismic'
    ],
  },
  {
    path: '/app/classroom',
    nameAr: 'السبورة التفاعلية الذكية',
    nameEn: 'Smart Interactive Classroom',
    keywords: ['سبورة', 'السبورة', 'سبورة ذكية', 'فصل', 'كلاس', 'شروحات', 'classroom', 'whiteboard'],
  },
  {
    path: '/app/curriculum',
    nameAr: 'المناهج والدروس المقررة',
    nameEn: 'Curriculum & Lessons',
    keywords: ['منهج', 'مناهج', 'دروس', 'درس', 'مقررات', 'شرح المنهج', 'مذكرات', 'curriculum', 'lessons'],
  },
  {
    path: '/app/progress',
    nameAr: 'تقرير التقدّم والإنجاز',
    nameEn: 'Progress Report',
    keywords: ['تقدم', 'التقدم', 'مستواي', 'درجاتي', 'انجاز', 'إنجاز', 'احصائيات', 'progress'],
  },
  {
    path: '/app/labs',
    nameAr: 'قائمة المعامل الستة',
    nameEn: 'All Laboratories',
    keywords: ['معامل', 'المعامل', 'كل المعامل', 'قائمة المعامل', 'labs'],
  },
  {
    path: '/app/settings',
    nameAr: 'إعدادات الحساب',
    nameEn: 'Account Settings',
    keywords: ['إعدادات', 'اعدادات', 'حساب', 'ملف شخصي', 'حسابي', 'settings', 'profile'],
  },
  {
    path: '/app',
    nameAr: 'الرئيسية · لوحة التحكم',
    nameEn: 'Main Dashboard',
    keywords: ['رئيسية', 'داشبورد', 'لوحة التحكم', 'الرئيسيه', 'البداية', 'شاشة البداية', 'home', 'dashboard', 'overview'],
  },
  {
    path: '/portal',
    nameAr: 'بوابة المعلمين والإدارة',
    nameEn: 'Educator Portal',
    keywords: ['بوابة المعلم', 'بوابة المعلمين', 'إدارة مدرسية', 'ادارة', 'معلم', 'مدرس', 'مدير', 'portal', 'admin', 'teacher'],
  },
];

// Negative phrases that indicate rejection or explanation, NOT navigation
const REJECTION_PATTERNS = [
  'لم أنقلك', 'لن أنقلك', 'ممنوع', 'مش هنفذ', 'لن أنفذ', 'غير مسموح', 'ليس من حقك',
  'أنت طالب', 'محصورة بالمعلم', 'already inside', 'already on', 'لا يمكنك الوصول'
];

// Navigation intent trigger words
const TRIGGER_WORDS = [
  'انقلني', 'انقلنى', 'وديني', 'ودينى', 'خدني', 'خدنى', 'افتح', 'أفتح', 'افتحلي', 'افتحلى',
  'أدخلني', 'ادخلني', 'ادخل', 'أدخل', 'دخول', 'نروح', 'سأنقلك', 'سانقلك', 'هنقلك',
  'جاري نقلك', 'جارٍ نقلك', 'سأقوم بنقلك', 'سأفتح', 'سأنقلك إلى', 'أوجهك', 'سأوجهك',
  'تفضل إلى', 'توجه إلى', 'عاوز أروح', 'عايز اروح', 'عايز ادخل', 'عاوز ادخل', 'عايز',
  'عاوز', 'أريد', 'اريد', 'بدي', 'ابغي', 'أبغي', 'ودني', 'انتقل', 'نقل', 'تحويل',
  'اذهب', 'أذهب', 'روح', 'take me', 'navigate', 'open', 'go to', 'launch', 'switch to', 'show me'
];

let lastNavigatedPath = '';
let lastNavigatedTime = 0;

export function analyzeNavigationIntent(rawText: string): NavDestination | null {
  if (!rawText) return null;
  const lower = rawText.toLowerCase().trim();

  // 1. Direct explicit tag matcher [NAV:<path>]
  const navTagMatch = lower.match(/\[nav:(.*?)\]/);
  if (navTagMatch && navTagMatch[1]) {
    const rawPath = navTagMatch[1].trim();
    const foundByPath = DESTINATIONS.find((d) => d.path.toLowerCase() === rawPath);
    if (foundByPath) return foundByPath;
  }

  // 2. If text contains a refusal or reprimand, do NOT navigate
  for (const neg of REJECTION_PATTERNS) {
    if (lower.includes(neg)) return null;
  }

  // 3. Check for trigger words or lab prefixes
  const hasTrigger = TRIGGER_WORDS.some((tw) => lower.includes(tw));
  const hasLabPrefix =
    lower.includes('معمل') ||
    lower.includes('مختبر') ||
    lower.includes('أطلس') ||
    lower.includes('مرصد') ||
    lower.includes('سبورة') ||
    lower.includes('صفحة');

  // 4. Find best matched destination
  for (const dest of DESTINATIONS) {
    const hasKeyword = dest.keywords.some((k) => lower.includes(k));
    if (hasKeyword && (hasTrigger || hasLabPrefix)) {
      return dest;
    }
  }

  return null;
}

export function executeDarwinNavigation(
  targetPath: string,
  navigateFn?: (path: string) => void
): boolean {
  const now = Date.now();
  // Prevent duplicate triggers within 2.5 seconds
  if (targetPath === lastNavigatedPath && now - lastNavigatedTime < 2500) {
    return false;
  }

  // Check if already on page
  const currentPath = window.location.pathname;
  if (currentPath === targetPath) {
    return false;
  }

  lastNavigatedPath = targetPath;
  lastNavigatedTime = now;

  console.log(`[DarwinNavigator] Executing navigation to: ${targetPath}`);

  if (navigateFn) {
    navigateFn(targetPath);
  } else if ((window as any).scinexaNavigate) {
    (window as any).scinexaNavigate(targetPath);
  } else {
    window.location.href = targetPath;
  }

  return true;
}

/**
 * Attaches a deep listener to the Fish Audio agent element and shadow root.
 * Listens to speech bubbles, composer submits, and transcript additions in real time.
 */
export function initDarwinAgentWatcher(navigateFn: (path: string) => void): () => void {
  // Expose global navigator
  (window as any).scinexaNavigate = navigateFn;

  let observer: MutationObserver | null = null;
  let pollInterval: ReturnType<typeof setInterval> | null = null;
  let periodicScanner: ReturnType<typeof setInterval> | null = null;
  let attachedElement: HTMLElement | null = null;
  let lastCheckedText = '';

  const handleTextFound = (text: string) => {
    if (!text || text === lastCheckedText) return;
    const dest = analyzeNavigationIntent(text);
    if (dest) {
      lastCheckedText = text;
      // Delay slightly (350ms) so audio/text registers cleanly
      setTimeout(() => {
        executeDarwinNavigation(dest.path, navigateFn);
      }, 350);
    }
  };

  const scanShadowContent = (shadow: ShadowRoot) => {
    // Check all text blocks in shadow DOM
    const elements = shadow.querySelectorAll('[class*="bubble"], [class*="transcript"], p, span, div');
    for (const el of Array.from(elements)) {
      const text = el.textContent || '';
      if (text.length > 3) {
        handleTextFound(text);
      }
    }
  };

  const attachToAgent = (agent: HTMLElement) => {
    if (attachedElement === agent && observer) return;
    attachedElement = agent;

    const shadow = agent.shadowRoot;
    if (!shadow) return;

    // Observe text inside Shadow DOM (transcripts, speech bubbles)
    observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'childList') {
          for (const node of Array.from(m.addedNodes)) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as HTMLElement;
              const text = el.textContent || '';
              if (text.length > 3) {
                handleTextFound(text);
              }
            }
          }
        } else if (m.type === 'characterData') {
          const target = m.target;
          const text = (target as any).parentElement?.textContent || target.textContent || '';
          if (text.length > 3) {
            handleTextFound(text);
          }
        }
      }
    });

    observer.observe(shadow, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    // Listen to Enter key inside shadow root composer
    shadow.addEventListener('keydown', (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.key === 'Enter') {
        const input = shadow.querySelector('input, textarea') as HTMLInputElement | null;
        if (input && input.value) {
          handleTextFound(input.value);
        }
      }
    });

    // Listen to clicks on Send button or quick action buttons
    shadow.addEventListener('click', () => {
      const input = shadow.querySelector('input, textarea') as HTMLInputElement | null;
      if (input && input.value) {
        handleTextFound(input.value);
      }
      setTimeout(() => scanShadowContent(shadow), 200);
    });

    // Periodic scanner (every 1s) to catch any streaming audio transcripts
    periodicScanner = setInterval(() => {
      scanShadowContent(shadow);
    }, 1000);

    console.log('[DarwinNavigator] Successfully attached watcher to Fish Audio Agent shadow root');
  };

  // Poll for agent availability
  pollInterval = setInterval(() => {
    const agent = document.querySelector('fish-agent') as HTMLElement | null;
    if (agent && agent.shadowRoot) {
      attachToAgent(agent);
    }
  }, 1000);

  return () => {
    if (pollInterval) clearInterval(pollInterval);
    if (periodicScanner) clearInterval(periodicScanner);
    if (observer) observer.disconnect();
  };
}
