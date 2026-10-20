import React, { useEffect, useRef } from 'react';

interface FishAgentControllerProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

const LAB_MAP: Record<string, { ar: string }> = {
  anatomy: { ar: 'أطلس التشريح 3D' },
  physics: { ar: 'مختبر الفيزياء والدوائر الكهربائية' },
  chemistry: { ar: 'مختبر الكيمياء والجدول الدوري' },
  biology: { ar: 'مختبر الأحياء والخلية' },
  geology: { ar: 'علوم الأرض والزلازل' },
  astronomy: { ar: 'علم الفلك ومدارات كبلر' },
  home: { ar: 'الصفحة الرئيسية' },
};

export const FishAgentController: React.FC<FishAgentControllerProps> = ({
  currentTab,
  setCurrentTab,
}) => {
  const currentTabRef = useRef(currentTab);
  currentTabRef.current = currentTab;

  const latestContextRef = useRef<{ title?: string; desc?: string; type?: string }>({});
  const processedActionIdsRef = useRef<Set<string>>(new Set());

  // 1. Expose global window bridge for any direct scripts
  useEffect(() => {
    (window as any).SciNexa = {
      navigate: (tab: string, subModule?: string) => {
        setCurrentTab(tab);
        if (subModule) {
          setTimeout(() => {
            if (tab === 'physics') {
              window.dispatchEvent(new CustomEvent('scinexa:switch_physics_module', { detail: { module: subModule } }));
            } else if (tab === 'chemistry') {
              window.dispatchEvent(new CustomEvent('scinexa:switch_chemistry_tab', { detail: { tab: subModule } }));
            }
          }, 150);
        }
      },
      getLab: () => currentTabRef.current,
      getContext: () => latestContextRef.current,
    };
  }, [setCurrentTab]);

  // 2. Synchronize Platform State with <fish-agent> & /api/fish-tool
  const syncPlatformState = (extraContext?: any) => {
    const tab = currentTabRef.current;
    const labMeta = LAB_MAP[tab] || LAB_MAP.home;
    const context = extraContext || latestContextRef.current || {};

    const dynamicVars = {
      current_lab: labMeta.ar,
      active_tab_id: tab,
      selected_item: context.title || 'تصفح عام للمختبر',
      item_details: context.desc || '',
      timestamp: Date.now(),
    };

    // Update <fish-agent> DOM element dynamic-variables
    const agentEl = document.querySelector('fish-agent');
    if (agentEl) {
      try {
        agentEl.setAttribute('dynamic-variables', JSON.stringify(dynamicVars));
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
        selectedItem: context.title,
        details: context.desc,
      }),
    }).catch(() => {});
  };

  // Sync on tab change
  useEffect(() => {
    syncPlatformState();
  }, [currentTab]);

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

                // 1. Switch main lab if needed
                if (targetMainTab && currentTabRef.current !== targetMainTab) {
                  setCurrentTab(targetMainTab);
                }

                // 2. Switch sub-module if specified
                if (targetSubModule) {
                  setTimeout(() => {
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
                  }, 200);
                }
              }
            }
          }
        }
      } catch {}
    }, 1500);

    return () => clearInterval(pollInterval);
  }, [setCurrentTab]);

  // Headless component: Renders NO UI elements (preserves ONLY the official Fish Audio widget)
  return null;
};
