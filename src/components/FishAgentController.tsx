import React, { useEffect, useRef } from 'react';
import { saveState } from '../utils/persistence';

interface FishAgentControllerProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  language: string;
}

const LAB_MAP: Record<string, { ar: string; en: string }> = {
  anatomy: { ar: 'أطلس التشريح 3D', en: '3D Anatomy Atlas' },
  physics: { ar: 'مختبر الفيزياء والدوائر الكهربائية', en: 'Physics & Circuits Lab' },
  chemistry: { ar: 'مختبر الكيمياء والجدول الدوري', en: 'Chemistry & Periodic Table' },
  biology: { ar: 'مختبر الأحياء والخلية', en: 'Biology & Cell Lab' },
  geology: { ar: 'علوم الأرض والزلازل', en: 'Geology & Earth Sciences' },
  astronomy: { ar: 'علم الفلك ومدارات كبلر', en: 'Astronomy & Kepler Orbits' },
  home: { ar: 'الصفحة الرئيسية', en: 'Home Screen' },
};

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

  // 1. Expose global window bridge for any direct scripts
  useEffect(() => {
    (window as any).SciNexa = {
      navigate: (tab: string, subModule?: string) => {
        setCurrentTab(tab);
        if (subModule) {
          if (tab === 'physics') saveState('physics_module', subModule);
          setTimeout(() => {
            if (tab === 'physics') {
              window.dispatchEvent(new CustomEvent('scinexa:switch_physics_module', { detail: { module: subModule } }));
            } else if (tab === 'chemistry') {
              window.dispatchEvent(new CustomEvent('scinexa:switch_chemistry_tab', { detail: { tab: subModule } }));
            } else if (tab === 'anatomy') {
              window.dispatchEvent(new CustomEvent('scinexa:switch_anatomy_layer', { detail: { layer: subModule } }));
            }
          }, 150);
        }
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
            ? 'مرحباً بك! أنا داروين مرشدك العلمي لمنصة ساينكسا، كيف يمكنني مساعدتك في تجاربك اليوم؟'
            : 'Welcome! I am Darwin, your scientific guide on SciNexa. How can I assist you with your experiments today?'
        );
      } catch (err) {
        console.warn('Could not update fish-agent attributes:', err);
      }
    }

    // Report state to backend API for Fish Audio webhook tools
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

  // Sync on tab or language change
  useEffect(() => {
    syncPlatformState();
  }, [currentTab, language]);

  // 3. Listen to scinexa:context events from 3D labs
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

  // 4. Poll for remote webhook actions triggered by Fish Audio cloud agent
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
                const targetMainTab = act.main_tab;
                const targetSubModule = act.sub_module;

                // Pre-persist sub-module before mounting component
                if (targetSubModule && targetMainTab === 'physics') {
                  saveState('physics_module', targetSubModule);
                }

                // 1. Switch main lab
                if (targetMainTab && currentTabRef.current !== targetMainTab) {
                  setCurrentTab(targetMainTab);
                }

                // 2. Dispatch events with multi-tier timeouts to guarantee delivery after lazy-mount
                if (targetSubModule) {
                  const dispatchEvents = () => {
                    if (targetMainTab === 'physics') {
                      window.dispatchEvent(
                        new CustomEvent('scinexa:switch_physics_module', {
                          detail: { module: targetSubModule },
                        })
                      );
                    } else if (targetMainTab === 'chemistry') {
                      window.dispatchEvent(
                        new CustomEvent('scinexa:switch_chemistry_tab', {
                          detail: { tab: targetSubModule },
                        })
                      );
                    } else if (targetMainTab === 'anatomy') {
                      window.dispatchEvent(
                        new CustomEvent('scinexa:switch_anatomy_layer', {
                          detail: { layer: targetSubModule },
                        })
                      );
                    }
                  };

                  // Immediate + delayed (for lazy suspense fallback)
                  dispatchEvents();
                  setTimeout(dispatchEvents, 150);
                  setTimeout(dispatchEvents, 450);
                }
              }
            }
          }
        }
      } catch {}
    }, 1200);

    return () => clearInterval(pollInterval);
  }, [setCurrentTab]);

  // Headless component: Renders NO UI elements (preserves ONLY the official Fish Audio widget)
  return null;
};
