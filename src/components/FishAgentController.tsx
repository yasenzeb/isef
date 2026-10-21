import React, { useEffect, useRef, useState } from 'react';
import { saveState } from '../utils/persistence';

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

function resolveNavigation(rawInput: string): { mainTab: string; subModule?: string; labelAr: string; labelEn: string } | null {
  const c = cleanText(rawInput);
  if (!c || c.length < 2) return null;

  // 1. Specific Physics Sub-Modules
  if (c.includes('مقذوف') || c.includes('رمي') || c.includes('مدفع') || c.includes('projectil')) {
    return { mainTab: 'physics', subModule: 'projectiles', labelAr: 'مختبر الفيزياء — حركة المقذوفات', labelEn: 'Physics — Projectiles' };
  }
  if (c.includes('بصر') || c.includes('انكسار') || c.includes('عدس') || c.includes('ضوء') || c.includes('optic')) {
    return { mainTab: 'physics', subModule: 'optics', labelAr: 'مختبر الفيزياء — البصريات وانكسار الضوء', labelEn: 'Physics — Optics' };
  }
  if (c.includes('موج') || c.includes('رنين') || c.includes('تردد') || c.includes('وتر') || c.includes('wave')) {
    return { mainTab: 'physics', subModule: 'waves', labelAr: 'مختبر الفيزياء — محاكاة الموجات', labelEn: 'Physics — Waves' };
  }
  if (c.includes('دواير') || c.includes('دائر') || c.includes('اوم') || c.includes('كيرشوف') || c.includes('مقاوم') || c.includes('تيار') || c.includes('جهد') || c.includes('circuit')) {
    return { mainTab: 'physics', subModule: 'circuits', labelAr: 'مختبر الفيزياء — الدوائر الكهربائية', labelEn: 'Physics — Circuits' };
  }
  if (c.includes('قو') || c.includes('نيوتن') || c.includes('حرك') || c.includes('force')) {
    return { mainTab: 'physics', subModule: 'forces', labelAr: 'مختبر الفيزياء — القوى والحركة', labelEn: 'Physics — Forces' };
  }

  // 2. Chemistry Sub-Modules
  if (c.includes('تفاعل') || c.includes('معادل') || c.includes('وزن') || c.includes('موازن') || c.includes('احلال') || c.includes('اتحاد') || c.includes('انحلال') || c.includes('react')) {
    return { mainTab: 'chemistry', subModule: 'reactions', labelAr: 'مختبر الكيمياء — محاكي التفاعلات', labelEn: 'Chemistry — Reactions' };
  }
  if (c.includes('ذري') || c.includes('ايون') || c.includes('مجموع') || c.includes('radical') || c.includes('atomic')) {
    return { mainTab: 'chemistry', subModule: 'atomic-groups', labelAr: 'مختبر الكيمياء — المجموعات الذرية', labelEn: 'Chemistry — Radicals' };
  }
  if (c.includes('جدول') || c.includes('عناصر') || (c.includes('دوري') && c.includes('كيمي')) || c.includes('period') || c.includes('بوهر')) {
    return { mainTab: 'chemistry', subModule: 'periodic', labelAr: 'مختبر الكيمياء — الجدول الدوري', labelEn: 'Chemistry — Periodic Table' };
  }

  // 3. Anatomy Sub-Layers
  if (c.includes('عضل') || c.includes('muscl')) {
    return { mainTab: 'anatomy', subModule: 'muscular', labelAr: 'أطلس التشريح — الجهاز العضلي', labelEn: 'Anatomy — Muscular' };
  }
  if (c.includes('قلب') || c.includes('دوري') || c.includes('شرايين') || c.includes('اورده') || c.includes('دم') || c.includes('cardio') || c.includes('heart')) {
    return { mainTab: 'anatomy', subModule: 'cardiovascular', labelAr: 'أطلس التشريح — الجهاز الدوري والقلب', labelEn: 'Anatomy — Cardiovascular' };
  }
  if (c.includes('عصب') || c.includes('دماغ') || /\bالمخ\b|\bمخ\b/.test(c) || c.includes('نخاع') || c.includes('nerv') || c.includes('brain')) {
    return { mainTab: 'anatomy', subModule: 'nervous', labelAr: 'أطلس التشريح — الجهاز العصبي والدماغ', labelEn: 'Anatomy — Nervous' };
  }
  if (c.includes('مفصل') || c.includes('مفاصل') || c.includes('رباط') || c.includes('اربطه') || c.includes('غضروف') || c.includes('joint')) {
    return { mainTab: 'anatomy', subModule: 'joints', labelAr: 'أطلس التشريح — المفاصل والأربطة', labelEn: 'Anatomy — Joints' };
  }
  if (c.includes('احشاء') || c.includes('هضم') || c.includes('كبد') || c.includes('معده') || c.includes('رئه') || c.includes('رئتين') || c.includes('تنفس') || c.includes('viscer')) {
    return { mainTab: 'anatomy', subModule: 'visceral', labelAr: 'أطلس التشريح — الأعضاء الداخلية', labelEn: 'Anatomy — Visceral' };
  }
  if (c.includes('عظام') || c.includes('هيكل') || c.includes('عظم') || c.includes('جمجمه') || c.includes('قفص صدري') || c.includes('عمود فقري') || c.includes('فخذ') || c.includes('skelet') || c.includes('bone')) {
    return { mainTab: 'anatomy', subModule: 'skeletal', labelAr: 'أطلس التشريح — الهيكل العظمي', labelEn: 'Anatomy — Skeletal' };
  }

  // 4. Main Labs Matching
  if (c.includes('حيا') || c.includes('احيا') || c.includes('خل') || c.includes('dna') || c.includes('وراث') || c.includes('ميتوكوندريا') || c.includes('اميبا') || c.includes('يوجلينا') || c.includes('براميسيوم') || c.includes('bio') || c.includes('cell')) {
    return { mainTab: 'biology', labelAr: 'مختبر الأحياء والخلية والكائنات الدقيقة', labelEn: 'Biology Laboratory' };
  }
  if (c.includes('تشريح') || c.includes('جسم') || c.includes('اعضاء') || c.includes('anatom')) {
    return { mainTab: 'anatomy', labelAr: 'أطلس تشريح جسم الإنسان', labelEn: 'Human Anatomy 3D Atlas' };
  }
  if (c.includes('كيمي') || c.includes('chem')) {
    return { mainTab: 'chemistry', labelAr: 'مختبر الكيمياء والجدول الدوري', labelEn: 'Chemistry Laboratory' };
  }
  if (c.includes('زلزال') || c.includes('زلازل') || c.includes('تسونامي') || c.includes('جيولوج') || c.includes('ارض') || c.includes('صفائح') || c.includes('ريختر') || c.includes('صخور') || c.includes('geol') || c.includes('earthquake')) {
    return { mainTab: 'geology', labelAr: 'علوم الأرض والزلازل ومحاكي ريختر', labelEn: 'Geology & Earth Sciences' };
  }
  if (c.includes('فلك') || c.includes('كوكب') || c.includes('كواكب') || c.includes('كبلر') || c.includes('شمس') || c.includes('قمر') || c.includes('مدار') || c.includes('فضاء') || c.includes('astro') || c.includes('solar')) {
    return { mainTab: 'astronomy', labelAr: 'علم الفلك ومدارات كبلر والنظام الشمسي', labelEn: 'Astronomy & Solar System' };
  }
  if (c.includes('فيزيا') || c.includes('كهرب') || c.includes('physic')) {
    return { mainTab: 'physics', labelAr: 'مختبر الفيزياء والدوائر والموجات', labelEn: 'Physics Laboratory' };
  }
  if (c.includes('فصل') || c.includes('سبور') || c.includes('شاشه') || c.includes('بروجكتور') || c.includes('class') || c.includes('board')) {
    return { mainTab: 'classroom', labelAr: 'وضع الفصل والشاشات الذكية التفاعلية', labelEn: 'Classroom Smartboard Mode' };
  }
  if (c.includes('رئيس') || c.includes('بداي') || c.includes('خروج') || c.includes('home')) {
    return { mainTab: 'home', labelAr: 'الصفحة الرئيسية', labelEn: 'Home Screen' };
  }

  return null;
}

const KV_RELAY_URL = 'https://kvdb.io/KxP3rS2y8K8V3W/scinexa_action';

export const FishAgentController: React.FC<FishAgentControllerProps> = ({
  currentTab,
  setCurrentTab,
  language,
}) => {
  const currentTabRef = useRef(currentTab);
  currentTabRef.current = currentTab;

  const languageRef = useRef(language);
  languageRef.current = language;

  const latestContextRef = useRef<{ title?: string; desc?: string; type?: string }>({});
  const processedActionIdsRef = useRef<Set<string>>(new Set());
  const processedTextSnippetsRef = useRef<Set<string>>(new Set());

  // Transient Toast Notification
  const [navToast, setNavToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  const showToast = (message: string) => {
    setNavToast({ message, visible: true });
    setTimeout(() => setNavToast({ message: '', visible: false }), 4500);
  };

  // Perform safe lab navigation
  const triggerNavigation = (targetMainTab: string, subModule?: string, label?: string) => {
    if (!targetMainTab) return;

    if (subModule && targetMainTab === 'physics') {
      saveState('physics_module', subModule);
    }

    if (currentTabRef.current !== targetMainTab) {
      setCurrentTab(targetMainTab);
      if (label) {
        showToast(languageRef.current === 'ar' ? `🚀 تم الانتقال إلى ${label}` : `🚀 Navigated to ${label}`);
      }
    }

    // Sub-module dispatch
    if (subModule) {
      const dispatchEvents = () => {
        if (targetMainTab === 'physics') {
          window.dispatchEvent(new CustomEvent('scinexa:switch_physics_module', { detail: { module: subModule } }));
        } else if (targetMainTab === 'chemistry') {
          window.dispatchEvent(new CustomEvent('scinexa:switch_chemistry_tab', { detail: { tab: subModule } }));
        } else if (targetMainTab === 'anatomy') {
          window.dispatchEvent(new CustomEvent('scinexa:switch_anatomy_layer', { detail: { layer: subModule } }));
        }
      };
      dispatchEvents();
      setTimeout(dispatchEvents, 180);
      setTimeout(dispatchEvents, 450);
    }
  };

  // 1. Expose global window bridge for any direct scripts or window events
  useEffect(() => {
    (window as any).SciNexa = {
      navigate: (tab: string, subModule?: string) => {
        triggerNavigation(tab, subModule);
      },
      getLab: () => currentTabRef.current,
      getLanguage: () => languageRef.current,
      getContext: () => latestContextRef.current,
    };
  }, [setCurrentTab]);

  // 2. Synchronize Platform State & Language with <fish-agent> & /api/fish-tool
  const syncPlatformState = (extraContext?: any) => {
    const tab = currentTabRef.current;
    const lang = languageRef.current;
    const labMeta = LAB_MAP[tab] || LAB_MAP.home;
    const context = extraContext || latestContextRef.current || {};

    const dynamicVars = {
      current_lab: lang === 'ar' ? labMeta.ar : labMeta.en,
      active_tab_id: tab,
      language: lang,
      user_language: lang === 'ar' ? 'العربية' : 'English',
      language_instruction:
        lang === 'ar'
          ? 'تحدث مع المستخدم واشرح له باللغة العربية الفصحى بشكل فوري وحصري'
          : 'Speak with the user and explain strictly in English immediately',
      selected_item: context.title || (lang === 'ar' ? 'تصفح عام للمختبر' : 'General lab browsing'),
      item_details: context.desc || '',
      timestamp: Date.now(),
    };

    // Update <fish-agent> DOM element
    const agentEl = document.querySelector('fish-agent');
    if (agentEl) {
      try {
        agentEl.setAttribute('language', lang);
        agentEl.setAttribute('dynamic-variables', JSON.stringify(dynamicVars));
        agentEl.setAttribute(
          'greeting',
          lang === 'ar'
            ? 'مرحباً بك! أنا داروين مرشدك العلمي لمنصة SciNexa، كيف يمكنني مساعدتك في تجاربك اليوم؟'
            : 'Welcome! I am Darwin, your scientific guide on SciNexa. How can I assist you with your experiments today?'
        );
      } catch (err) {
        console.warn('Could not update fish-agent attributes:', err);
      }
    }

    // Report state to backend API
    fetch('/api/fish-tool?action=report_state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentTab: tab,
        labNameAr: labMeta.ar,
        language: lang,
        selectedItem: context.title,
        details: context.desc,
      }),
    }).catch(() => {});
  };

  useEffect(() => {
    syncPlatformState();
  }, [currentTab, language]);

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

  // 4. REAL-TIME SHADOW DOM OBSERVER: Listens directly to Fish Audio transcript in browser
  useEffect(() => {
    let observer: MutationObserver | null = null;
    let pollAttempts = 0;

    const checkAndProcessText = (rawText: string) => {
      if (!rawText || rawText.length < 3) return;

      const trimmed = rawText.trim();
      if (processedTextSnippetsRef.current.has(trimmed)) return;
      processedTextSnippetsRef.current.add(trimmed);

      // Check if text indicates navigation request or confirmation
      const isNavIntent = 
        trimmed.includes('انقل') || 
        trimmed.includes('انتقال') || 
        trimmed.includes('افتح') || 
        trimmed.includes('وديني') || 
        trimmed.includes('روح') || 
        trimmed.includes('شغل') || 
        trimmed.includes('مختبر') || 
        trimmed.includes('معمل') || 
        trimmed.includes('سأنقلك') || 
        trimmed.includes('تم نقلك') || 
        trimmed.includes('تم انتقالك') || 
        trimmed.includes('لننتقل') ||
        trimmed.includes('نحن الان في') ||
        trimmed.includes('navigate') || 
        trimmed.includes('switch') || 
        trimmed.includes('open') || 
        trimmed.includes('take me');

      if (isNavIntent) {
        const resolved = resolveNavigation(trimmed);
        if (resolved && resolved.mainTab) {
          triggerNavigation(
            resolved.mainTab, 
            resolved.subModule, 
            languageRef.current === 'ar' ? resolved.labelAr : resolved.labelEn
          );
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

      // Attach MutationObserver to Shadow DOM
      try {
        observer = new MutationObserver((mutations) => {
          for (const m of mutations) {
            // Check character data or added text nodes
            if (m.type === 'characterData' && m.target?.textContent) {
              checkAndProcessText(m.target.textContent);
            }
            if (m.type === 'childList') {
              m.addedNodes.forEach(node => {
                const text = node.textContent;
                if (text) checkAndProcessText(text);
              });
            }
          }
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

    // Secondary periodic sweep of shadowRoot content
    const interval = setInterval(() => {
      const agentEl = document.querySelector('fish-agent') as any;
      if (agentEl?.shadowRoot) {
        const textBlocks = agentEl.shadowRoot.querySelectorAll('p, span, div');
        textBlocks.forEach((el: any) => {
          const txt = el.innerText || el.textContent;
          if (txt && txt.length > 3) {
            checkAndProcessText(txt);
          }
        });
      }
    }, 600);

    return () => {
      if (observer) observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  // 5. Fast Poll for remote webhook actions from /api/fish-tool & KV relay
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      // 1. Check local serverless route
      try {
        const res = await fetch('/api/fish-tool?action=poll_actions');
        if (res.ok) {
          const data = await res.json();
          if (data.actions && data.actions.length > 0) {
            for (const act of data.actions) {
              if (processedActionIdsRef.current.has(act.id)) continue;
              processedActionIdsRef.current.add(act.id);

              if (act.action === 'switch_lab') {
                triggerNavigation(act.main_tab, act.sub_module, act.message);
              }
            }
          }
        }
      } catch {}

      // 2. Direct check on KV relay endpoint
      try {
        const kvRes = await fetch(KV_RELAY_URL, { signal: AbortSignal.timeout(1000) });
        if (kvRes.ok) {
          const act = await kvRes.json();
          if (act && act.id && !processedActionIdsRef.current.has(act.id)) {
            if (Date.now() - (act.timestamp || 0) < 25000) {
              processedActionIdsRef.current.add(act.id);
              if (act.action === 'switch_lab') {
                triggerNavigation(act.main_tab, act.sub_module, act.message);
              }
            }
          }
        }
      } catch {}
    }, 700);

    return () => clearInterval(pollInterval);
  }, []);

  return (
    <>
      {/* Toast Notification when agent switches labs */}
      {navToast.visible && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 border border-cyan-400/60 shadow-2xl shadow-cyan-500/20 text-white flex items-center gap-2.5 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-mono font-bold">{navToast.message}</span>
        </div>
      )}
    </>
  );
};
