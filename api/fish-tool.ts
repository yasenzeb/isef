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
  if (!c || c.length < 2) {
    return { mainTab: 'home', label: 'الصفحة الرئيسية' };
  }

  // ========================================================
  // PRIORITY 1: CHEMISTRY (الكيمياء والتفاعلات والجدول الدوري)
  // ========================================================
  if (c.includes('كيميا') || c.includes('chem')) {
    if (c.includes('تفاعل') || c.includes('معادل') || c.includes('احماض') || c.includes('قلوي') || c.includes('احلال') || c.includes('اتحاد') || c.includes('انحلال')) {
      return { mainTab: 'chemistry', subModule: 'reactions', label: 'مختبر الكيمياء — محاكي التفاعلات الكيميائية' };
    }
    if (c.includes('ذري') || c.includes('مجموع') || c.includes('ايون')) {
      return { mainTab: 'chemistry', subModule: 'atomic-groups', label: 'مختبر الكيمياء — المجموعات الذرية' };
    }
    if (c.includes('دوري') || c.includes('جدول') || c.includes('عناصر')) {
      return { mainTab: 'chemistry', subModule: 'periodic', label: 'مختبر الكيمياء — الجدول الدوري للعناصر' };
    }
    return { mainTab: 'chemistry', label: 'مختبر الكيمياء والجدول الدوري والتفاعلات' };
  }

  // ========================================================
  // PRIORITY 2: BIOLOGY (الأحياء والخلية والوراثة)
  // ========================================================
  if (c.includes('احيا') || c.includes('حيا') || c.includes('بيولوج') || c.includes('bio') || c.includes('خليه') || c.includes('خلايا') || c.includes('dna') || c.includes('وراث') || c.includes('ميتوكوندريا') || c.includes('اميبا') || c.includes('يوجلينا') || c.includes('براميسيوم')) {
    return { mainTab: 'biology', label: 'مختبر الأحياء والخلية والكائنات الدقيقة' };
  }

  // ========================================================
  // PRIORITY 3: ANATOMY (التشريح الطبي وأجهزة الجسم)
  // ========================================================
  if (c.includes('تشريح') || c.includes('anatom') || c.includes('جسم الانسان') || c.includes('هيكل عظم') || c.includes('عضلات') || c.includes('جهاز دوري') || c.includes('جهاز عصب')) {
    if (c.includes('عضل') || c.includes('muscl')) {
      return { mainTab: 'anatomy', subModule: 'muscular', label: 'أطلس التشريح — الجهاز العضلي ثلاثي الأبعاد' };
    }
    if (c.includes('قلب') || c.includes('دوري') || c.includes('شرايين') || c.includes('اورده') || c.includes('cardio') || c.includes('heart')) {
      return { mainTab: 'anatomy', subModule: 'cardiovascular', label: 'أطلس التشريح — الجهاز الدوري والقلب والأوعية' };
    }
    if (c.includes('عصب') || c.includes('دماغ') || /\bالمخ\b|\bمخ\b/.test(c) || c.includes('نخاع') || c.includes('brain')) {
      return { mainTab: 'anatomy', subModule: 'nervous', label: 'أطلس التشريح — الجهاز العصبي والدماغ' };
    }
    if (c.includes('مفصل') || c.includes('مفاصل') || c.includes('رباط') || c.includes('غضروف') || c.includes('joint')) {
      return { mainTab: 'anatomy', subModule: 'joints', label: 'أطلس التشريح — المفاصل والأربطة الهيكلية' };
    }
    if (c.includes('احشاء') || c.includes('هضم') || c.includes('كبد') || c.includes('معده') || c.includes('رئه') || c.includes('تنفس') || c.includes('viscer')) {
      return { mainTab: 'anatomy', subModule: 'visceral', label: 'أطلس التشريح — الأعضاء الحشوية والتنفسية' };
    }
    if (c.includes('عظام') || c.includes('هيكل') || c.includes('عظم') || c.includes('جمجمه') || c.includes('skelet') || c.includes('bone')) {
      return { mainTab: 'anatomy', subModule: 'skeletal', label: 'أطلس التشريح — الهيكل العظمي ثلاثي الأبعاد' };
    }
    return { mainTab: 'anatomy', label: 'أطلس تشريح جسم الإنسان ثلاثي الأبعاد' };
  }

  // ========================================================
  // PRIORITY 4: GEOLOGY (الجيولوجيا والزلازل وعلوم الأرض)
  // ========================================================
  if (c.includes('جيولوج') || c.includes('زلزال') || c.includes('زلازل') || c.includes('تسونامي') || c.includes('علوم الارض') || c.includes('طبقات الارض') || c.includes('انهيار') || c.includes('ريختر') || c.includes('صخور') || c.includes('صفائح') || c.includes('geol') || c.includes('earthquake')) {
    return { mainTab: 'geology', label: 'علوم الأرض والزلازل ومحاكي انهيار المباني' };
  }

  // ========================================================
  // PRIORITY 5: ASTRONOMY (الفلك والنظام الشمسي والفضاء)
  // ========================================================
  if (c.includes('فلك') || c.includes('كوكب') || c.includes('كواكب') || c.includes('كبلر') || c.includes('نظام شمس') || c.includes('مجموعه شمس') || c.includes('اطوار القمر') || c.includes('فضاء') || c.includes('مدارات') || c.includes('astro') || c.includes('solar')) {
    return { mainTab: 'astronomy', label: 'علم الفلك ومدارات كبلر والنظام الشمسي' };
  }

  // ========================================================
  // PRIORITY 6: CLASSROOM (الفصل والسبورة والشاشات الذكية)
  // ========================================================
  if (c.includes('فصل') || c.includes('سبور') || c.includes('شاشه ذكي') || c.includes('بروجكتور') || c.includes('عرض تقديم') || c.includes('class') || c.includes('board') || c.includes('smartboard')) {
    return { mainTab: 'classroom', label: 'وضع الفصل والشاشات الذكية التفاعلية' };
  }

  // ========================================================
  // PRIORITY 7: PHYSICS (الفيزياء والموجات والدوائر)
  // ========================================================
  if (c.includes('فيزيا') || c.includes('مقذوف') || c.includes('بصريات') || c.includes('انكسار') || c.includes('عدسات') || c.includes('موجات') || c.includes('دوائر') || c.includes('كهربا') || c.includes('نيوتن') || c.includes('physic')) {
    if (c.includes('مقذوف') || c.includes('مدفع') || c.includes('رمي') || c.includes('projectil')) {
      return { mainTab: 'physics', subModule: 'projectiles', label: 'مختبر الفيزياء — حركة المقذوفات وزوايا الإطلاق' };
    }
    if (c.includes('بصر') || c.includes('انكسار') || c.includes('عدس') || c.includes('سنيل') || c.includes('optic')) {
      return { mainTab: 'physics', subModule: 'optics', label: 'مختبر الفيزياء — البصريات وانكسار الضوء' };
    }
    if (c.includes('موج') || c.includes('رنين') || c.includes('تردد') || c.includes('وتر') || c.includes('wave')) {
      return { mainTab: 'physics', subModule: 'waves', label: 'مختبر الفيزياء — محاكاة الموجات والتردد' };
    }
    if (c.includes('دواير') || c.includes('دائر') || c.includes('اوم') || c.includes('كيرشوف') || c.includes('مقاوم') || c.includes('circuit')) {
      return { mainTab: 'physics', subModule: 'circuits', label: 'مختبر الفيزياء — الدوائر الكهربائية وقانون أوم' };
    }
    if (c.includes('قوانين نيوتن') || c.includes('قوى وحركه') || c.includes('قوه وحركه') || c.includes('محصله القوى') || c.includes('force')) {
      return { mainTab: 'physics', subModule: 'forces', label: 'مختبر الفيزياء — القوى والحركة وقوانين نيوتن' };
    }
    return { mainTab: 'physics', label: 'مختبر الفيزياء والدوائر والموجات' };
  }

  // ========================================================
  // PRIORITY 8: HOME (الرئيسية)
  // ========================================================
  if (c.includes('رئيس') || c.includes('بداي') || c.includes('خروج') || c.includes('home')) {
    return { mainTab: 'home', label: 'الصفحة الرئيسية' };
  }

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

const RELAY_ENDPOINT = 'https://api.restful-api.dev/objects/ff808181a09d98f701a15d4988ed38d4';

async function relayAction(actionItem: any) {
  try {
    await fetch(RELAY_ENDPOINT, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'scinexa_action',
        data: actionItem
      }),
      signal: AbortSignal.timeout(2000)
    });
  } catch {}
}

async function fetchRelayedAction(): Promise<any | null> {
  try {
    const res = await fetch(RELAY_ENDPOINT, { signal: AbortSignal.timeout(1500) });
    if (res.ok) {
      const json = await res.json();
      const action = json?.data;
      if (action && Date.now() - (action.timestamp || 0) < 30000) {
        return action;
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

  if (typeof args === 'string') {
    try { args = JSON.parse(args); } catch {}
  }

  if (body?.function) {
    toolName = toolName || body.function.name;
    if (typeof body.function.arguments === 'string') {
      try { args = { ...args, ...JSON.parse(body.function.arguments) }; } catch {}
    } else if (body.function.arguments) {
      args = { ...args, ...body.function.arguments };
    }
  }

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

  // Tool: switch_lab
  const isSwitchLab = 
    toolName === 'switch_lab' || 
    Boolean(args.target_lab || args.lab || args.target || args.destination || args.module || args.section);

  if (isSwitchLab) {
    // Check direct target_lab argument first before falling back to whole body
    const primaryInput = [
      args.target_lab,
      args.lab,
      args.target,
      args.destination,
      args.module,
      args.section,
    ].filter(Boolean).join(' ');

    const rawInput = primaryInput || [
      args.name,
      args.query,
      args.input,
      body?.message,
      body?.text,
      body?.input,
      typeof args === 'string' ? args : '',
      JSON.stringify(args)
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

    relayAction(actionItem).catch(() => {});

    const reply = {
      success: true,
      message: actionItem.message,
      current_lab: resolved.mainTab,
      sub_module: resolved.subModule || 'main',
      student_name: latestPlatformState.studentName || 'صديقي البطل',
      school_grade: latestPlatformState.grade || '',
      system_instruction: `خاطب الطالب باسمه الأول "${latestPlatformState.studentName || 'صديقي'}" كصديقه المقرب، وأخبره بحماس أنه تم نقله إلى ${resolved.label}.`,
    };
    if (isNode) return res.status(200).json(reply);
    return new Response(JSON.stringify(reply), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Tool: get_student_identity
  if (toolName === 'get_student_identity' || toolName === 'who_am_i' || body?.tool === 'get_student_identity') {
    const stName = latestPlatformState.studentName || 'صديقي البطل';
    const stGrade = latestPlatformState.grade || 'العلوم والمعامل';
    const stGov = latestPlatformState.governorate || 'مصر';
    const studentReply = {
      success: true,
      student_first_name: stName,
      student_full_name: latestPlatformState.fullName || stName,
      school_grade: stGrade,
      educational_stage: latestPlatformState.stage || '',
      governorate: stGov,
      administration: latestPlatformState.administration || '',
      role: latestPlatformState.role || 'طالب',
      honorific: `يا صديقي ${stName} يا بطل ${stGrade}`,
      instruction_for_speaking: `أنت تتحدث مع صديقك المقرب "${stName}" يا بطل ${stGrade}. ناده باسمه "${stName}" دائماً بحماس ومودة كأعز أصدقائه، ولقبه بـ "يا بطل ${stGrade}"، ولا تذكر أي محافظة مطلقاً.`,
    };
    if (isNode) return res.status(200).json(studentReply);
    return new Response(JSON.stringify(studentReply), {
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
  const studentName = latestPlatformState.studentName || 'الطالب';
  const fullName = latestPlatformState.fullName || studentName;
  const gov = latestPlatformState.governorate || '';
  const admin = latestPlatformState.administration || '';
  const grade = latestPlatformState.grade || '';
  const stage = latestPlatformState.stage || '';
  const role = latestPlatformState.role || 'طالب';
  const isGuest = Boolean(latestPlatformState.isGuest);

  const labSummary = {
    success: true,
    current_tab: latestPlatformState.currentTab,
    lab_name: latestPlatformState.labNameAr,
    language: latestPlatformState.language || 'ar',
    sub_module: latestPlatformState.subModule || (isArabic ? 'القسم الرئيسي' : 'Main Section'),
    selected_item: latestPlatformState.selectedItem || (isArabic ? 'تصفح عام للمختبر' : 'General lab browsing'),
    item_details: latestPlatformState.details || (isArabic ? 'المحاكاة جاهزة للتجربة والاستكشاف' : 'Simulation ready for experimentation'),
    circuit_status: latestPlatformState.circuit || null,
    student_profile: {
      name: studentName,
      full_name: fullName,
      role: role,
      governorate: gov,
      administration: admin,
      grade: grade,
      stage: stage,
      is_guest: isGuest,
    },
    instruction_for_darwin: isArabic
      ? `أنت تخاطب ${role} "${fullName}" من ${gov ? `محافظة ${gov}` : 'جمهورية مصر العربية'}${admin ? ` (${admin})` : ''}${grade ? ` في ${grade}` : ''}.
خاطبه باسمه الأول "${studentName}" مباشرة، واشرح له فوراً تكوين ووظيفة (${latestPlatformState.selectedItem || 'المختبر الحالي'}) بما يلائم منهجه الدراسي في ${grade || 'مرحلته التعليمية'}.`
      : `You are speaking with ${role} "${fullName}" from ${gov || 'Egypt'}, grade "${grade || 'appropriate level'}". Address them as "${studentName}" and explain (${latestPlatformState.selectedItem || 'the current lab'}) matching their curriculum.`,
  };

  if (isNode) return res.status(200).json(labSummary);
  return new Response(JSON.stringify(labSummary), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
