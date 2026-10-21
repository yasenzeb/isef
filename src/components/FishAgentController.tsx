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

  // PRIORITY 1: CHEMISTRY (الكيمياء والتفاعلات والجدول الدوري)
  if (c.includes('كيميا') || c.includes('chem')) {
    if (c.includes('تفاعل') || c.includes('معادل') || c.includes('احماض') || c.includes('قلوي') || c.includes('احلال') || c.includes('اتحاد') || c.includes('انحلال')) {
      return { mainTab: 'chemistry', subModule: 'reactions', labelAr: 'مختبر الكيمياء — محاكي التفاعلات', labelEn: 'Chemistry — Reactions' };
    }
    if (c.includes('ذري') || c.includes('مجموع') || c.includes('ايون')) {
      return { mainTab: 'chemistry', subModule: 'atomic-groups', labelAr: 'مختبر الكيمياء — المجموعات الذرية', labelEn: 'Chemistry — Radicals' };
    }
    if (c.includes('دوري') || c.includes('جدول') || c.includes('عناصر')) {
      return { mainTab: 'chemistry', subModule: 'periodic', labelAr: 'مختبر الكيمياء — الجدول الدوري', labelEn: 'Chemistry — Periodic Table' };
    }
    return { mainTab: 'chemistry', labelAr: 'مختبر الكيمياء والجدول الدوري والتفاعلات', labelEn: 'Chemistry Laboratory' };
  }

  // PRIORITY 2: BIOLOGY (الأحياء والخلية والوراثة)
  if (c.includes('احيا') || c.includes('حيا') || c.includes('بيولوج') || c.includes('bio') || c.includes('خليه') || c.includes('خلايا') || c.includes('dna') || c.includes('وراث') || c.includes('ميتوكوندريا') || c.includes('اميبا') || c.includes('يوجلينا') || c.includes('براميسيوم')) {
    return { mainTab: 'biology', labelAr: 'مختبر الأحياء والخلية والكائنات الدقيقة', labelEn: 'Biology Laboratory' };
  }

  // PRIORITY 3: ANATOMY (التشريح الطبي وأجهزة الجسم)
  if (c.includes('تشريح') || c.includes('anatom') || c.includes('جسم الانسان') || c.includes('هيكل عظم') || c.includes('عضلات') || c.includes('جهاز دوري') || c.includes('جهاز عصب')) {
    if (c.includes('عضل') || c.includes('muscl')) {
      return { mainTab: 'anatomy', subModule: 'muscular', labelAr: 'أطلس التشريح — الجهاز العضلي', labelEn: 'Anatomy — Muscular' };
    }
    if (c.includes('قلب') || c.includes('دوري') || c.includes('شرايين') || c.includes('اورده') || c.includes('cardio') || c.includes('heart')) {
      return { mainTab: 'anatomy', subModule: 'cardiovascular', labelAr: 'أطلس التشريح — الجهاز الدوري والقلب', labelEn: 'Anatomy — Cardiovascular' };
    }
    if (c.includes('عصب') || c.includes('دماغ') || /\bالمخ\b|\bمخ\b/.test(c) || c.includes('نخاع') || c.includes('brain')) {
      return { mainTab: 'anatomy', subModule: 'nervous', labelAr: 'أطلس التشريح — الجهاز العصبي والدماغ', labelEn: 'Anatomy — Nervous' };
    }
    if (c.includes('مفصل') || c.includes('مفاصل') || c.includes('رباط') || c.includes('غضروف') || c.includes('joint')) {
      return { mainTab: 'anatomy', subModule: 'joints', labelAr: 'أطلس التشريح — المفاصل والأربطة', labelEn: 'Anatomy — Joints' };
    }
    if (c.includes('احشاء') || c.includes('هضم') || c.includes('كبد') || c.includes('معده') || c.includes('رئه') || c.includes('تنفس') || c.includes('viscer')) {
      return { mainTab: 'anatomy', subModule: 'visceral', labelAr: 'أطلس التشريح — الأعضاء الداخلية', labelEn: 'Anatomy — Visceral' };
    }
    if (c.includes('عظام') || c.includes('هيكل') || c.includes('عظم') || c.includes('جمجمه') || c.includes('skelet') || c.includes('bone')) {
      return { mainTab: 'anatomy', subModule: 'skeletal', labelAr: 'أطلس التشريح — الهيكل العظمي', labelEn: 'Anatomy — Skeletal' };
    }
    return { mainTab: 'anatomy', labelAr: 'أطلس تشريح جسم الإنسان', labelEn: 'Human Anatomy 3D Atlas' };
  }

  // PRIORITY 4: GEOLOGY (الجيولوجيا والزلازل وعلوم الأرض)
  if (c.includes('جيولوج') || c.includes('زلزال') || c.includes('زلازل') || c.includes('تسونامي') || c.includes('علوم الارض') || c.includes('طبقات الارض') || c.includes('انهيار') || c.includes('ريختر') || c.includes('صخور') || c.includes('صفائح') || c.includes('geol') || c.includes('earthquake')) {
    return { mainTab: 'geology', labelAr: 'علوم الأرض والزلازل ومحاكي انهيار المباني', labelEn: 'Geology & Earth Sciences' };
  }

  // PRIORITY 5: ASTRONOMY (الفلك والنظام الشمسي والفضاء)
  if (c.includes('فلك') || c.includes('كوكب') || c.includes('كواكب') || c.includes('كبلر') || c.includes('نظام شمس') || c.includes('مجموعه شمس') || c.includes('اطوار القمر') || c.includes('فضاء') || c.includes('مدارات') || c.includes('astro') || c.includes('solar')) {
    return { mainTab: 'astronomy', labelAr: 'علم الفلك ومدارات كبلر والنظام الشمسي', labelEn: 'Astronomy & Solar System' };
  }

  // PRIORITY 6: CLASSROOM (الفصل والسبورة والشاشات الذكية)
  if (c.includes('فصل') || c.includes('سبور') || c.includes('شاشه ذكي') || c.includes('بروجكتور') || c.includes('عرض تقديم') || c.includes('class') || c.includes('board') || c.includes('smartboard')) {
    return { mainTab: 'classroom', labelAr: 'وضع الفصل والشاشات الذكية التفاعلية', labelEn: 'Classroom Smartboard Mode' };
  }

  // PRIORITY 7: PHYSICS (الفيزياء والموجات والدوائر)
  if (c.includes('فيزيا') || c.includes('مقذوف') || c.includes('بصريات') || c.includes('انكسار') || c.includes('عدسات') || c.includes('موجات') || c.includes('دوائر') || c.includes('كهربا') || c.includes('نيوتن') || c.includes('physic')) {
    if (c.includes('مقذوف') || c.includes('مدفع') || c.includes('رمي') || c.includes('projectil')) {
      return { mainTab: 'physics', subModule: 'projectiles', labelAr: 'مختبر الفيزياء — حركة المقذوفات', labelEn: 'Physics — Projectiles' };
    }
    if (c.includes('بصر') || c.includes('انكسار') || c.includes('عدس') || c.includes('سنيل') || c.includes('optic')) {
      return { mainTab: 'physics', subModule: 'optics', labelAr: 'مختبر الفيزياء — البصريات وانكسار الضوء', labelEn: 'Physics — Optics' };
    }
    if (c.includes('موج') || c.includes('رنين') || c.includes('تردد') || c.includes('وتر') || c.includes('wave')) {
      return { mainTab: 'physics', subModule: 'waves', labelAr: 'مختبر الفيزياء — محاكاة الموجات', labelEn: 'Physics — Waves' };
    }
    if (c.includes('دواير') || c.includes('دائر') || c.includes('اوم') || c.includes('كيرشوف') || c.includes('مقاوم') || c.includes('circuit')) {
      return { mainTab: 'physics', subModule: 'circuits', labelAr: 'مختبر الفيزياء — الدوائر الكهربائية', labelEn: 'Physics — Circuits' };
    }
    if (c.includes('قوانين نيوتن') || c.includes('قوى وحركه') || c.includes('قوه وحركه') || c.includes('محصله القوى') || c.includes('force')) {
      return { mainTab: 'physics', subModule: 'forces', labelAr: 'مختبر الفيزياء — القوى والحركة', labelEn: 'Physics — Forces' };
    }
    return { mainTab: 'physics', labelAr: 'مختبر الفيزياء والدوائر والموجات', labelEn: 'Physics Laboratory' };
  }

  // PRIORITY 8: HOME (الرئيسية)
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

  // Navigation Cooldown Guard: Prevents flipping back and forth between labs
  const lastNavigatedRef = useRef<{ tab: string; subModule?: string; time: number }>({ tab: '', time: 0 });

  // Transient Toast Notification
  const [navToast, setNavToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  const showToast = (message: string) => {
    setNavToast({ message, visible: true });
    setTimeout(() => setNavToast({ message: '', visible: false }), 4500);
  };

  // Perform safe lab navigation with cooldown protection
  const triggerNavigation = (targetMainTab: string, subModule?: string, label?: string) => {
    if (!targetMainTab) return;

    const now = Date.now();
    // If same tab and submodule requested within 4 seconds, ignore duplicate
    if (
      lastNavigatedRef.current.tab === targetMainTab &&
      lastNavigatedRef.current.subModule === subModule &&
      now - lastNavigatedRef.current.time < 4000
    ) {
      return;
    }

    // Cooldown guard: no rapid switching within 1.8 seconds to stop flickering
    if (now - lastNavigatedRef.current.time < 1800) {
      return;
    }

    lastNavigatedRef.current = { tab: targetMainTab, subModule, time: now };

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

  // 4. REAL-TIME SHADOW DOM OBSERVER: Listens ONLY to the latest message in chat
  useEffect(() => {
    let observer: MutationObserver | null = null;
    let pollAttempts = 0;

    const checkAndProcessNewText = (rawText: string) => {
      if (!rawText || rawText.length < 3) return;

      const trimmed = rawText.trim();
      if (processedTextSnippetsRef.current.has(trimmed)) return;
      processedTextSnippetsRef.current.add(trimmed);

      // Check if text is related to navigation intent
      const isNavIntent = 
        trimmed.includes('انقل') || 
        trimmed.includes('انتقال') || 
        trimmed.includes('انفل') || // Handles user typo "انفلني"
        trimmed.includes('افتح') || 
        trimmed.includes('وديني') || 
        trimmed.includes('روح') || 
        trimmed.includes('شغل') || 
        trimmed.includes('مختبر') || 
        trimmed.includes('معمل') || 
        trimmed.includes('قسم') ||
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

      try {
        // ONLY triggers on newly appended nodes, not historical sweeps
        observer = new MutationObserver((mutations) => {
          for (const m of mutations) {
            if (m.type === 'childList') {
              m.addedNodes.forEach(node => {
                const text = node.textContent;
                if (text) checkAndProcessNewText(text);
              });
            }
          }
        });

        observer.observe(shadow, {
          childList: true,
          subtree: true,
        });
      } catch (err) {
        console.warn('Could not attach Shadow DOM observer on fish-agent:', err);
      }
    };

    setupObserver();

    return () => {
      if (observer) observer.disconnect();
    };
  }, []);

  // 5. Poll for remote webhook actions from /api/fish-tool & KV relay (with deduplication)
  useEffect(() => {
    const pollInterval = setInterval(async () => {
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
    }, 900);

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
