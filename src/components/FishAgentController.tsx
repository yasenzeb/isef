import React, { useEffect, useRef } from 'react';

interface FishAgentControllerProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

const LAB_MAP: Record<string, { ar: string; keywords: string[] }> = {
  anatomy: {
    ar: 'أطلس التشريح 3D',
    keywords: ['تشريح', 'عظام', 'عضلة', 'عظم', 'جمجمة', 'قفص صدري', 'فخذ', 'جسم الإنسان', 'anatomy'],
  },
  physics: {
    ar: 'مختبر الفيزياء والدوائر الكهربائية',
    keywords: ['فيزياء', 'دوائر', 'كهرباء', 'أوم', 'فولت', 'مقاومة', 'مصباح', 'بطارية', 'physics'],
  },
  chemistry: {
    ar: 'مختبر الكيمياء والجدول الدوري',
    keywords: ['كيمياء', 'جدول دوري', 'عناصر', 'ذرة', 'تفاعل', 'صوديوم', 'كلور', 'chemistry'],
  },
  biology: {
    ar: 'مختبر الأحياء والخلية',
    keywords: ['أحياء', 'خلية', 'ميتوكوندريا', 'dna', 'وراثة', 'عضيات', 'biology'],
  },
  geology: {
    ar: 'علوم الأرض والزلازل',
    keywords: ['جيولوجيا', 'أرض', 'زلزال', 'تسونامي', 'صفائح', 'صخور', 'geology'],
  },
  astronomy: {
    ar: 'علم الفلك ومدارات كبلر',
    keywords: ['فلك', 'كواكب', 'شمس', 'كبلر', 'مدار', 'جاذبية', 'نظام شمسي', 'astronomy'],
  },
  home: {
    ar: 'الصفحة الرئيسية',
    keywords: ['رئيسية', 'البداية', 'خروج', 'القائمة', 'home'],
  },
};

export const FishAgentController: React.FC<FishAgentControllerProps> = ({
  currentTab,
  setCurrentTab,
}) => {
  const currentTabRef = useRef(currentTab);
  currentTabRef.current = currentTab;

  const lastProcessedTextRef = useRef<string>('');
  const latestContextRef = useRef<{ title?: string; desc?: string; type?: string }>({});

  // 1. Register global window bridge
  useEffect(() => {
    (window as any).SciNexa = {
      navigate: (tab: string) => setCurrentTab(tab),
      getLab: () => currentTabRef.current,
      getContext: () => latestContextRef.current,
    };
  }, [setCurrentTab]);

  // 2. Synchronize Dynamic Variables to <fish-agent> element & report state to /api/fish-tool
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

    // Update <fish-agent> DOM element dynamic-variables attribute
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

  // 4. Observe <fish-agent> ShadowRoot for live voice/text transcript to trigger instant lab navigation
  useEffect(() => {
    let observer: MutationObserver | null = null;
    let checkInterval: any = null;

    const setupObserver = () => {
      const agentEl = document.querySelector('fish-agent');
      if (!agentEl || !agentEl.shadowRoot) return false;

      observer = new MutationObserver(() => {
        const textContent = agentEl.shadowRoot?.textContent || '';
        if (!textContent || textContent === lastProcessedTextRef.current) return;

        // Check the newly added text
        const lower = textContent.toLowerCase();

        // Check if there is an intent to open a lab
        for (const [labId, meta] of Object.entries(LAB_MAP)) {
          const matched = meta.keywords.some(kw => {
            const pattern = new RegExp(`(افتح|وديني|روح|انتقل|وريني|عايز|أريد|بدنا|مختبر|معمل|عرض).*?${kw}`, 'i');
            return pattern.test(lower) || lower.includes(`افتح ${kw}`) || lower.includes(`مختبر ${kw}`);
          });

          if (matched && currentTabRef.current !== labId) {
            console.log(`[FishAgentController] Executing command to switch to ${labId}`);
            setCurrentTab(labId);
            lastProcessedTextRef.current = textContent;
            break;
          }
        }
      });

      observer.observe(agentEl.shadowRoot, {
        childList: true,
        subtree: true,
        characterData: true,
      });

      return true;
    };

    // Retry finding shadowRoot until widget is mounted
    if (!setupObserver()) {
      checkInterval = setInterval(() => {
        if (setupObserver()) {
          clearInterval(checkInterval);
        }
      }, 1000);
    }

    return () => {
      if (observer) observer.disconnect();
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [setCurrentTab]);

  // 5. Poll for remote webhook actions triggered by Fish Audio cloud agent
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/fish-tool?action=poll_actions');
        if (res.ok) {
          const data = await res.json();
          if (data.actions && data.actions.length > 0) {
            for (const act of data.actions) {
              if (act.action === 'switch_lab' && act.target_lab && LAB_MAP[act.target_lab]) {
                setCurrentTab(act.target_lab);
              }
            }
          }
        }
      } catch {}
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [setCurrentTab]);

  // This controller renders NO UI elements of its own (preserving only the Fish Audio widget)
  return null;
};
