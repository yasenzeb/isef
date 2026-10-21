// Vercel Serverless Function: /api/fish-tool
// Handles Fish Audio Agent Webhook Tools & Platform Synchronization with deep sub-module support

function cleanText(t: string): string {
  return (t || '')
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ئ/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/[\u064B-\u065F]/g, '') // remove tashkeel
    .trim();
}

export function resolveTarget(rawInput: string): { mainTab: string; subModule?: string; label: string } {
  const c = cleanText(rawInput);

  // 1. Specific Physics Sub-Modules
  if (c.includes('مقذوف') || c.includes('رمي') || c.includes('مدفع') || c.includes('projectil')) {
    return { mainTab: 'physics', subModule: 'projectiles', label: 'مختبر الفيزياء — حركة المقذوفات وزوايا الإطلاق' };
  }
  if (c.includes('بصر') || c.includes('انكسار') || c.includes('عدس') || c.includes('ضوء') || c.includes('optic')) {
    return { mainTab: 'physics', subModule: 'optics', label: 'مختبر الفيزياء — قسم البصريات وانكسار الضوء وقانون سنيل' };
  }
  if (c.includes('موج') || c.includes('رنين') || c.includes('تردد') || c.includes('وتر') || c.includes('wave')) {
    return { mainTab: 'physics', subModule: 'waves', label: 'مختبر الفيزياء — محاكاة الموجات والتردد' };
  }
  if (c.includes('دواير') || c.includes('دائر') || c.includes('اوم') || c.includes('كيرشوف') || c.includes('مقاوم') || c.includes('تيار') || c.includes('جهد') || c.includes('circuit')) {
    return { mainTab: 'physics', subModule: 'circuits', label: 'مختبر الفيزياء — الدوائر الكهربائية وقانون أوم' };
  }
  if (c.includes('قو') || c.includes('نيوتن') || c.includes('حرك') || c.includes('تسارع') || c.includes('force')) {
    return { mainTab: 'physics', subModule: 'forces', label: 'مختبر الفيزياء — القوى والحركة وقوانين نيوتن' };
  }

  // 2. Chemistry Sub-Modules
  if (c.includes('تفاعل') || c.includes('معادل') || c.includes('وزن') || c.includes('موازن') || c.includes('احلال') || c.includes('اتحاد') || c.includes('انحلال') || c.includes('react')) {
    return { mainTab: 'chemistry', subModule: 'reactions', label: 'مختبر الكيمياء — محاكي التفاعلات وموازنة المعادلات' };
  }
  if (c.includes('ذري') || c.includes('ايون') || c.includes('مجموع') || c.includes('atomic') || c.includes('radical')) {
    return { mainTab: 'chemistry', subModule: 'atomic-groups', label: 'مختبر الكيمياء — المجموعات الذرية ثلاثية الأبعاد' };
  }
  if (c.includes('جدول') || c.includes('عناصر') || (c.includes('دوري') && c.includes('كيمي')) || c.includes('period') || c.includes('بوهر')) {
    return { mainTab: 'chemistry', subModule: 'periodic', label: 'مختبر الكيمياء — الجدول الدوري للعناصر 3D' };
  }

  // 3. Anatomy Sub-Layers
  if (c.includes('عضل') || c.includes('muscl')) {
    return { mainTab: 'anatomy', subModule: 'muscular', label: 'أطلس التشريح — الجهاز العضلي ثلاثي الأبعاد' };
  }
  if (c.includes('قلب') || c.includes('دوري') || c.includes('شرايين') || c.includes('اورده') || c.includes('دم') || c.includes('cardio') || c.includes('heart')) {
    return { mainTab: 'anatomy', subModule: 'cardiovascular', label: 'أطلس التشريح — الجهاز الدوري والقلب والأوعية' };
  }
  if (c.includes('عصب') || c.includes('دماغ') || /\bالمخ\b|\bمخ\b/.test(c) || c.includes('نخاع') || c.includes('nerv') || c.includes('brain')) {
    return { mainTab: 'anatomy', subModule: 'nervous', label: 'أطلس التشريح — الجهاز العصبي والدماغ' };
  }
  if (c.includes('مفصل') || c.includes('مفاصل') || c.includes('رباط') || c.includes('اربطه') || c.includes('غضروف') || c.includes('joint')) {
    return { mainTab: 'anatomy', subModule: 'joints', label: 'أطلس التشريح — المفاصل والأربطة الهيكلية' };
  }
  if (c.includes('احشاء') || c.includes('هضم') || c.includes('كبد') || c.includes('معده') || c.includes('رئه') || c.includes('رئتين') || c.includes('تنفس') || c.includes('viscer')) {
    return { mainTab: 'anatomy', subModule: 'visceral', label: 'أطلس التشريح — الأعضاء الحشوية والتنفسية' };
  }
  if (c.includes('عظام') || c.includes('هيكل') || c.includes('عظم') || c.includes('جمجمه') || c.includes('قفص صدري') || c.includes('عمود فقري') || c.includes('فخذ') || c.includes('skelet') || c.includes('bone')) {
    return { mainTab: 'anatomy', subModule: 'skeletal', label: 'أطلس التشريح — الهيكل العظمي 3D' };
  }

  // 4. Main Labs Matching
  if (c.includes('حيا') || c.includes('احيا') || c.includes('خل') || c.includes('dna') || c.includes('وراث') || c.includes('ميتوكوندريا') || c.includes('اميبا') || c.includes('يوجلينا') || c.includes('bio') || c.includes('cell')) {
    return { mainTab: 'biology', label: 'مختبر الأحياء والخلية والكائنات الدقيقة' };
  }
  if (c.includes('تشريح') || c.includes('جسم') || c.includes('اعضاء') || c.includes('anatom')) {
    return { mainTab: 'anatomy', label: 'أطلس تشريح جسم الإنسان ثلاثي الأبعاد' };
  }
  if (c.includes('كيمي') || c.includes('chem')) {
    return { mainTab: 'chemistry', label: 'مختبر الكيمياء والتفاعلات والجدول الدوري' };
  }
  if (c.includes('زلزال') || c.includes('زلازل') || c.includes('تسونامي') || c.includes('جيولوج') || c.includes('ارض') || c.includes('صفائح') || c.includes('ريختر') || c.includes('صخور') || c.includes('geol') || c.includes('earthquake')) {
    return { mainTab: 'geology', label: 'علوم الأرض والزلازل ومحاكي انهيار المباني' };
  }
  if (c.includes('فلك') || c.includes('كوكب') || c.includes('كواكب') || c.includes('كبلر') || c.includes('شمس') || c.includes('قمر') || c.includes('مدار') || c.includes('فضاء') || c.includes('astro') || c.includes('solar')) {
    return { mainTab: 'astronomy', label: 'علم الفلك ومدارات كبلر والنظام الشمسي' };
  }
  if (c.includes('فيزيا') || c.includes('كهرب') || c.includes('physic')) {
    return { mainTab: 'physics', label: 'مختبر الفيزياء والدوائر والموجات' };
  }
  if (c.includes('فصل') || c.includes('سبور') || c.includes('شاشه') || c.includes('بروجكتور') || c.includes('class') || c.includes('board')) {
    return { mainTab: 'classroom', label: 'وضع الفصل والشاشات الذكية التفاعلية' };
  }
  if (c.includes('رئيس') || c.includes('بداي') || c.includes('خروج') || c.includes('home')) {
    return { mainTab: 'home', label: 'الصفحة الرئيسية' };
  }

  // Fallback defaults to Home
  return { mainTab: 'home', label: 'الصفحة الرئيسية' };
}

let latestPlatformState: {
  currentTab: string;
  labNameAr: string;
  language?: string;
  subModule?: string;
  selectedItem?: string;
  details?: string;
  circuit?: any;
  updatedAt: number;
} = {
  currentTab: 'home',
  labNameAr: 'الصفحة الرئيسية',
  language: 'ar',
  updatedAt: Date.now(),
};

let pendingActions: Array<{
  id: string;
  action: 'switch_lab';
  main_tab: string;
  sub_module?: string;
  message: string;
  timestamp: number;
}> = [];

// KV Relay endpoint to bridge across stateless serverless instances
const KV_RELAY_URL = 'https://kvdb.io/KxP3rS2y8K8V3W/scinexa_action';

async function relayAction(actionItem: any) {
  try {
    await fetch(KV_RELAY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actionItem),
      signal: AbortSignal.timeout(1500)
    });
  } catch {}
}

async function fetchRelayedAction(): Promise<any | null> {
  try {
    const res = await fetch(KV_RELAY_URL, { signal: AbortSignal.timeout(1200) });
    if (res.ok) {
      const data = await res.json();
      if (data && Date.now() - (data.timestamp || 0) < 25000) {
        return data;
      }
    }
  } catch {}
  return null;
}

function pruneActions() {
  const now = Date.now();
  pendingActions = pendingActions.filter(a => now - a.timestamp < 30000);
}

export default async function handler(req: any, res?: any) {
  const isNode = Boolean(res && typeof res.status === 'function');
  const origin = req.headers?.origin || '*';

  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    if (isNode) {
      Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(200).end();
    }
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const url = new URL(req.url || '/', 'http://localhost');
  const actionParam = url.searchParams.get('action');

  // 1. Client Browser Reports its State
  if (actionParam === 'report_state' && req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch {}
    }
    if (body) {
      latestPlatformState = {
        ...latestPlatformState,
        ...body,
        updatedAt: Date.now(),
      };
    }
    const resp = { ok: true, state: latestPlatformState };
    if (isNode) return res.status(200).json(resp);
    return new Response(JSON.stringify(resp), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 2. Client Browser Polls for Pending Actions
  if (actionParam === 'poll_actions') {
    pruneActions();
    let actions = [...pendingActions];
    pendingActions = []; // Flush in-memory

    // Also check fast external relay in case of cross-instance serverless routing
    if (actions.length === 0) {
      const relayed = await fetchRelayedAction();
      if (relayed) {
        actions.push(relayed);
      }
    }

    const resp = { actions, currentState: latestPlatformState };
    if (isNode) return res.status(200).json(resp);
    return new Response(JSON.stringify(resp), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 3. Fish Audio Tool Calls (Webhook from Fish Audio Agent Server)
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch {}
  }

  let toolName = body?.name || body?.tool_name || body?.tool || body?.action || url.searchParams.get('tool');
  let args = body?.arguments || body?.parameters || body?.args || body?.params || {};

  // Unpack stringified args (OpenAI function calling standard)
  if (typeof args === 'string') {
    try { args = JSON.parse(args); } catch {}
  }

  // Check function sub-object
  if (body?.function) {
    toolName = toolName || body.function.name;
    if (typeof body.function.arguments === 'string') {
      try { args = { ...args, ...JSON.parse(body.function.arguments) }; } catch {}
    } else if (body.function.arguments) {
      args = { ...args, ...body.function.arguments };
    }
  }

  // Check tool_calls array
  if (Array.isArray(body?.tool_calls) && body.tool_calls.length > 0) {
    const tc = body.tool_calls[0];
    toolName = toolName || tc?.function?.name || tc?.name;
    const tcArgs = tc?.function?.arguments || tc?.arguments;
    if (typeof tcArgs === 'string') {
      try { args = { ...args, ...JSON.parse(tcArgs) }; } catch {}
    } else if (tcArgs) {
      args = { ...args, ...tcArgs };
    }
  }

  // Tool: switch_lab (Handles all main labs and deep sub-modules)
  const isSwitchLab = 
    toolName === 'switch_lab' || 
    Boolean(args.target_lab || args.lab || args.target || args.destination || args.module || args.section);

  if (isSwitchLab) {
    // Collect all possible hints from all fields
    const rawInput = [
      args.target_lab,
      args.lab,
      args.target,
      args.destination,
      args.module,
      args.section,
      args.name,
      args.query,
      args.input,
      body?.message,
      body?.text,
      body?.input,
      typeof args === 'string' ? args : '',
      JSON.stringify(args),
      JSON.stringify(body)
    ].filter(Boolean).join(' ');

    const resolved = resolveTarget(rawInput);

    const actionItem = {
      id: 'act_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      action: 'switch_lab' as const,
      main_tab: resolved.mainTab,
      sub_module: resolved.subModule,
      message: `تم الانتقال مباشرة إلى ${resolved.label}`,
      timestamp: Date.now(),
    };

    pendingActions.push(actionItem);
    latestPlatformState.currentTab = resolved.mainTab;
    latestPlatformState.labNameAr = resolved.label;
    latestPlatformState.subModule = resolved.subModule;

    // Async relay to cross-instance KV
    relayAction(actionItem).catch(() => {});

    const reply = {
      success: true,
      message: actionItem.message,
      current_lab: resolved.mainTab,
      sub_module: resolved.subModule || 'main',
    };
    if (isNode) return res.status(200).json(reply);
    return new Response(JSON.stringify(reply), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Tool: verify_circuit_physics
  if (toolName === 'verify_circuit_physics' || body?.tool === 'verify_circuit_physics') {
    const v = Number(args.voltage || 12);
    const r = Number(args.resistance || 4);
    const isShort = r <= 0.05;
    const current = !isShort ? (v / r).toFixed(2) : 'Infinity (Short Circuit)';
    const power = !isShort ? (v * (v / r)).toFixed(2) : 'Dangerous';

    const result = {
      success: true,
      voltage_volts: v,
      resistance_ohms: r,
      current_amperes: current,
      power_watts: power,
      is_short_circuit: isShort,
      physics_law: 'V = I * R (Ohm) | P = V * I (Power)',
      scientific_verdict: isShort
        ? 'تحذير: دائرة قصيرة (Short Circuit)! المقاومة صفر تقريباً مما يسبب تياراً ضخماً وخطر احتراق.'
        : `الدائرة تعمل بانتظام. شدة التيار = ${current} أمبير، والقدرة المستهلكة = ${power} واط.`,
    };
    if (isNode) return res.status(200).json(result);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Tool: focus_part_3d
  if (toolName === 'focus_part_3d' || body?.tool === 'focus_part_3d') {
    const part = args.part_name || latestPlatformState.selectedItem || 'العنصر المختار';
    const reply = {
      success: true,
      focused_part: part,
      message: `تم تسليط الكاميرا ثلاثية الأبعاد على ${part} في الشاشة بنجاح.`,
    };
    if (isNode) return res.status(200).json(reply);
    return new Response(JSON.stringify(reply), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Tool: get_current_lab_status
  const isArabic = (latestPlatformState.language || 'ar') === 'ar';
  const labSummary = {
    success: true,
    current_tab: latestPlatformState.currentTab,
    lab_name: latestPlatformState.labNameAr,
    language: latestPlatformState.language || 'ar',
    sub_module: latestPlatformState.subModule || (isArabic ? 'القسم الرئيسي' : 'Main Section'),
    selected_item: latestPlatformState.selectedItem || (isArabic ? 'تصفح عام للمختبر' : 'General lab browsing'),
    item_details: latestPlatformState.details || (isArabic ? 'المحاكاة جاهزة للتجربة والاستكشاف' : 'Simulation ready for experimentation'),
    circuit_status: latestPlatformState.circuit || null,
    instruction_for_darwin: isArabic
      ? `اشرح للطالب فوراً تكوين ووظيفة الجزء المحدد (${latestPlatformState.selectedItem || 'المختبر الحالي'}) ودوره العلمي بإيجاز مشوق وعلمي دقيق.`
      : `Immediately explain to the student the structure and scientific/physiological function of (${latestPlatformState.selectedItem || 'the current lab'}) in engaging detail.`,
  };

  if (isNode) return res.status(200).json(labSummary);
  return new Response(JSON.stringify(labSummary), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
