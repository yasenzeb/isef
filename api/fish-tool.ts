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

export function resolveTarget(rawInput: string): { mainTab: string; subModule?: string; label: string; focusPart?: string } {
  const c = cleanText(rawInput);
  if (!c || c.length < 2) {
    return { mainTab: 'home', label: 'الصفحة الرئيسية' };
  }

  // 1. SPECIFIC SPECIMENS & ORGANS
  if (c.includes('قلب') || c.includes('heart') || c.includes('شريان') || c.includes('اورده')) {
    return { mainTab: 'anatomy', subModule: 'cardiovascular', label: 'أطلس التشريح — القلب والجهاز الدوري', focusPart: 'Heart' };
  }
  if (c.includes('مخ') || c.includes('دماغ') || c.includes('brain')) {
    return { mainTab: 'anatomy', subModule: 'nervous', label: 'أطلس التشريح — الدماغ والجهاز العصبي', focusPart: 'Brain' };
  }
  if (c.includes('فخذ') || c.includes('femur')) {
    return { mainTab: 'anatomy', subModule: 'skeletal', label: 'أطلس التشريح — عظم الفخذ', focusPart: 'Femur' };
  }
  if (c.includes('جمجمه') || c.includes('skull') || c.includes('cranium')) {
    return { mainTab: 'anatomy', subModule: 'skeletal', label: 'أطلس التشريح — الجمجمة', focusPart: 'Cranium' };
  }
  if (c.includes('عمود فقر') || c.includes('فقرات') || c.includes('spine')) {
    return { mainTab: 'anatomy', subModule: 'skeletal', label: 'أطلس التشريح — العمود الفقري', focusPart: 'Vertebral column' };
  }
  if (c.includes('قفص صدر') || c.includes('اضلاع') || c.includes('rib')) {
    return { mainTab: 'anatomy', subModule: 'skeletal', label: 'أطلس التشريح — القفص الصدري', focusPart: 'Ribs' };
  }
  if (c.includes('معده') || c.includes('stomach')) {
    return { mainTab: 'anatomy', subModule: 'visceral', label: 'أطلس التشريح — المعدة', focusPart: 'Stomach' };
  }
  if (c.includes('كبد') || c.includes('liver')) {
    return { mainTab: 'anatomy', subModule: 'visceral', label: 'أطلس التشريح — الكبد', focusPart: 'Liver' };
  }
  if (c.includes('رئه') || c.includes('رئتين') || c.includes('lung')) {
    return { mainTab: 'anatomy', subModule: 'visceral', label: 'أطلس التشريح — الرئتان', focusPart: 'Lungs' };
  }

  // 2. ANATOMY SYSTEMS
  if (c.includes('عضل') || c.includes('muscl')) {
    return { mainTab: 'anatomy', subModule: 'muscular', label: 'أطلس التشريح — الجهاز العضلي' };
  }
  if (c.includes('دوري') || c.includes('cardio') || c.includes('قلب')) {
    return { mainTab: 'anatomy', subModule: 'cardiovascular', label: 'أطلس التشريح — الجهاز الدوري والقلب' };
  }
  if (c.includes('عصب') || c.includes('nervous')) {
    return { mainTab: 'anatomy', subModule: 'nervous', label: 'أطلس التشريح — الجهاز العصبي والدماغ' };
  }
  if (c.includes('مفصل') || c.includes('مفاصل') || c.includes('رباط') || c.includes('غضروف') || c.includes('joint')) {
    return { mainTab: 'anatomy', subModule: 'joints', label: 'أطلس التشريح — المفاصل والأربطة' };
  }
  if (c.includes('احشاء') || c.includes('هضم') || c.includes('باطن') || c.includes('viscer')) {
    return { mainTab: 'anatomy', subModule: 'visceral', label: 'أطلس التشريح — الأعضاء الحشوية' };
  }
  if (c.includes('عظام') || c.includes('عظم') || c.includes('هيكل') || c.includes('skelet') || c.includes('bone')) {
    return { mainTab: 'anatomy', subModule: 'skeletal', label: 'أطلس التشريح — الهيكل العظمي' };
  }
  if (c.includes('تشريح') || c.includes('anatom') || c.includes('جسم الانسان')) {
    return { mainTab: 'anatomy', subModule: 'skeletal', label: 'أطلس تشريح جسم الإنسان' };
  }

  // 3. CHEMISTRY
  if (c.includes('تفاعل') || c.includes('معادل') || c.includes('احماض') || c.includes('قلوي') || c.includes('reaction')) {
    return { mainTab: 'chemistry', subModule: 'reactions', label: 'مختبر الكيمياء — محاكي التفاعلات' };
  }
  if (c.includes('ذري') || c.includes('مجموعات') || c.includes('ايون') || c.includes('radical')) {
    return { mainTab: 'chemistry', subModule: 'atomic-groups', label: 'مختبر الكيمياء — المجموعات الذرية' };
  }
  if (c.includes('دوري') || c.includes('جدول') || c.includes('عناصر') || c.includes('periodic')) {
    return { mainTab: 'chemistry', subModule: 'periodic', label: 'مختبر الكيمياء — الجدول الدوري للعناصر' };
  }
  if (c.includes('كيميا') || c.includes('chem')) {
    return { mainTab: 'chemistry', subModule: 'periodic', label: 'مختبر الكيمياء' };
  }

  // 4. PHYSICS
  if (c.includes('دواير') || c.includes('دوائر') || c.includes('دائر') || c.includes('كهربا') || c.includes('اوم') || c.includes('مقاوم') || c.includes('circuit')) {
    return { mainTab: 'physics', subModule: 'circuits', label: 'مختبر الفيزياء — الدوائر الكهربائية' };
  }
  if (c.includes('مقذوف') || c.includes('مدفع') || c.includes('رمي') || c.includes('projectil')) {
    return { mainTab: 'physics', subModule: 'projectiles', label: 'مختبر الفيزياء — حركة المقذوفات' };
  }
  if (c.includes('بصر') || c.includes('انكسار') || c.includes('عدس') || c.includes('سنيل') || c.includes('optic')) {
    return { mainTab: 'physics', subModule: 'optics', label: 'مختبر الفيزياء — البصريات وانكسار الضوء' };
  }
  if (c.includes('موج') || c.includes('رنين') || c.includes('تردد') || c.includes('wave')) {
    return { mainTab: 'physics', subModule: 'waves', label: 'مختبر الفيزياء — محاكاة الموجات' };
  }
  if (c.includes('نيوتن') || c.includes('قوى') || c.includes('قوه') || c.includes('حرك') || c.includes('force')) {
    return { mainTab: 'physics', subModule: 'forces', label: 'مختبر الفيزياء — القوى والحركة وقوانين نيوتن' };
  }
  if (c.includes('فيزيا') || c.includes('physic')) {
    return { mainTab: 'physics', subModule: 'circuits', label: 'مختبر الفيزياء' };
  }

  // 5. BIOLOGY
  if (c.includes('dna') || c.includes('وراث')) {
    return { mainTab: 'biology', subModule: 'dna', label: 'مختبر الأحياء — الحمض النووي (DNA)' };
  }
  if (c.includes('ميكروب') || c.includes('اميبا') || c.includes('يوجلينا') || c.includes('براميسيوم')) {
    return { mainTab: 'biology', subModule: 'microorganisms', label: 'مختبر الأحياء — الكائنات الدقيقة' };
  }
  if (c.includes('خليه') || c.includes('خلايا') || c.includes('احيا') || c.includes('بيولوج') || c.includes('bio')) {
    return { mainTab: 'biology', subModule: 'sketchfab_cell', label: 'مختبر الأحياء والخلية' };
  }

  // 6. GEOLOGY
  if (c.includes('جيولوج') || c.includes('زلزال') || c.includes('زلازل') || c.includes('تسونامي') || c.includes('ريختر') || c.includes('geol')) {
    return { mainTab: 'geology', label: 'علوم الأرض والزلازل ومحاكي انهيار المباني' };
  }

  // 7. ASTRONOMY
  if (c.includes('فلك') || c.includes('كوكب') || c.includes('كواكب') || c.includes('شمس') || c.includes('مدار') || c.includes('كبلر') || c.includes('astro')) {
    return { mainTab: 'astronomy', label: 'علم الفلك ومدارات كبلر والنظام الشمسي' };
  }

  // 8. CLASSROOM
  if (c.includes('فصل') || c.includes('سبور') || c.includes('class') || c.includes('board')) {
    return { mainTab: 'classroom', label: 'وضع الفصل والشاشات الذكية' };
  }

  // 9. HOME
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
