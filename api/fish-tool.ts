// Vercel Serverless Function: /api/fish-tool
// Handles Fish Audio Agent Webhook Tools & Platform Synchronization

let latestPlatformState: {
  currentTab: string;
  labNameAr: string;
  subModule?: string;
  selectedItem?: string;
  details?: string;
  circuit?: any;
  updatedAt: number;
} = {
  currentTab: 'home',
  labNameAr: 'الصفحة الرئيسية',
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

// Clean up old actions older than 30 seconds
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

  // 2. Client Browser Polls for Pending Actions from Fish Audio
  if (actionParam === 'poll_actions') {
    pruneActions();
    const actions = [...pendingActions];
    pendingActions = []; // Flush executed actions so they run exactly once
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

  const toolName = body?.name || body?.tool_name || url.searchParams.get('tool');
  const args = body?.arguments || body?.parameters || body || {};

  // Tool: switch_lab (Handles both main labs and nested modules)
  if (toolName === 'switch_lab' || args.target_lab || args.module || args.section) {
    const rawInput = `${args.target_lab || ''} ${args.module || ''} ${args.section || ''}`.toLowerCase().trim();

    let mainTab = 'physics';
    let subModule: string | undefined = undefined;
    let label = 'مختبر الفيزياء';

    // Physics sub-modules
    if (rawInput.includes('قوى') || rawInput.includes('حركة') || rawInput.includes('forces')) {
      mainTab = 'physics';
      subModule = 'forces';
      label = 'مختبر الفيزياء — قسم القوى والحركة ونظام نيوتن';
    } else if (rawInput.includes('مقذوفات') || rawInput.includes('projectiles') || rawInput.includes('رمي') || rawInput.includes('مدفع')) {
      mainTab = 'physics';
      subModule = 'projectiles';
      label = 'مختبر الفيزياء — محاكاة حركة المقذوفات وزوايا الإطلاق';
    } else if (rawInput.includes('بصريات') || rawInput.includes('انكسار') || rawInput.includes('ضوء') || rawInput.includes('عدسات') || rawInput.includes('optics')) {
      mainTab = 'physics';
      subModule = 'optics';
      label = 'مختبر الفيزياء — قسم البصريات وانكسار الضوء وقانون سنيل';
    } else if (rawInput.includes('موجات') || rawInput.includes('موجة') || rawInput.includes('تردد') || rawInput.includes('waves')) {
      mainTab = 'physics';
      subModule = 'waves';
      label = 'مختبر الفيزياء — محاكاة الموجات والتردد والرنين';
    } else if (rawInput.includes('دوائر') || rawInput.includes('كهرباء') || rawInput.includes('أوم') || rawInput.includes('circuits')) {
      mainTab = 'physics';
      subModule = 'circuits';
      label = 'مختبر الفيزياء — قسم الدوائر الكهربائية وقانون أوم';
    }
    // Chemistry sub-modules
    else if (rawInput.includes('تفاعل') || rawInput.includes('تفاعلات') || rawInput.includes('معادلات') || rawInput.includes('reactions')) {
      mainTab = 'chemistry';
      subModule = 'reactions';
      label = 'مختبر الكيمياء — محاكي التفاعلات وموازنة المعادلات الكيميائية';
    } else if (rawInput.includes('مجموعات ذرية') || rawInput.includes('مركبات') || rawInput.includes('atomic-groups') || rawInput.includes('أيونات')) {
      mainTab = 'chemistry';
      subModule = 'atomic-groups';
      label = 'مختبر الكيمياء — نماذج المجموعات الذرية ثلاثية الأبعاد';
    } else if (rawInput.includes('جدول دوري') || rawInput.includes('عناصر') || rawInput.includes('periodic') || rawInput.includes('كيمياء') || rawInput.includes('chemistry')) {
      mainTab = 'chemistry';
      subModule = 'periodic';
      label = 'مختبر الكيمياء — الجدول الدوري التفاعلي ثلاثي الأبعاد';
    }
    // Anatomy sub-layers
    else if (rawInput.includes('عضل') || rawInput.includes('muscular') || rawInput.includes('muscles')) {
      mainTab = 'anatomy';
      subModule = 'muscular';
      label = 'أطلس التشريح — الجهاز العضلي ثلاثي الأبعاد';
    } else if (rawInput.includes('قلب') || rawInput.includes('دوري') || rawInput.includes('cardio') || rawInput.includes('شرايين')) {
      mainTab = 'anatomy';
      subModule = 'cardiovascular';
      label = 'أطلس التشريح — الجهاز الدوري والقلب والأوعية الدموية';
    } else if (rawInput.includes('عصب') || rawInput.includes('مخ') || rawInput.includes('دماغ') || rawInput.includes('nervous')) {
      mainTab = 'anatomy';
      subModule = 'nervous';
      label = 'أطلس التشريح — الجهاز العصبي والدماغ';
    } else if (rawInput.includes('مفاصل') || rawInput.includes('أربطة') || rawInput.includes('joints')) {
      mainTab = 'anatomy';
      subModule = 'joints';
      label = 'أطلس التشريح — المفاصل والأربطة الهيكلية';
    } else if (rawInput.includes('أحشاء') || rawInput.includes('هضم') || rawInput.includes('visceral')) {
      mainTab = 'anatomy';
      subModule = 'visceral';
      label = 'أطلس التشريح — الأعضاء الحشوية والهضمية';
    } else if (rawInput.includes('تشريح') || rawInput.includes('عظام') || rawInput.includes('هيكل') || rawInput.includes('anatomy') || rawInput.includes('skeletal')) {
      mainTab = 'anatomy';
      subModule = 'skeletal';
      label = 'أطلس التشريح ثلاثي الأبعاد — الهيكل العظمي';
    }
    // Biology
    else if (rawInput.includes('أحياء') || rawInput.includes('خلية') || rawInput.includes('dna') || rawInput.includes('وراثة') || rawInput.includes('biology')) {
      mainTab = 'biology';
      label = 'مختبر الأحياء والخلية ثلاثية الأبعاد';
    }
    // Geology
    else if (rawInput.includes('جيولوجيا') || rawInput.includes('أرض') || rawInput.includes('زلزال') || rawInput.includes('تسونامي') || rawInput.includes('صفائح') || rawInput.includes('geology')) {
      mainTab = 'geology';
      label = 'علوم الأرض والزلازل ومحاكي ريختر';
    }
    // Astronomy
    else if (rawInput.includes('فلك') || rawInput.includes('كواكب') || rawInput.includes('شمس') || rawInput.includes('كبلر') || rawInput.includes('مدارات') || rawInput.includes('astronomy')) {
      mainTab = 'astronomy';
      label = 'علم الفلك ومدارات كبلر والمجموعة الشمسية';
    }
    // Home
    else if (rawInput.includes('رئيسية') || rawInput.includes('home') || rawInput.includes('خروج')) {
      mainTab = 'home';
      label = 'الصفحة الرئيسية';
    }

    const actionItem = {
      id: 'act_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      action: 'switch_lab' as const,
      main_tab: mainTab,
      sub_module: subModule,
      message: `تم الانتقال مباشرة إلى ${label}`,
      timestamp: Date.now(),
    };

    pendingActions.push(actionItem);
    latestPlatformState.currentTab = mainTab;
    latestPlatformState.labNameAr = label;
    latestPlatformState.subModule = subModule;

    const reply = {
      success: true,
      message: actionItem.message,
      current_lab: mainTab,
      sub_module: subModule || 'default',
    };
    if (isNode) return res.status(200).json(reply);
    return new Response(JSON.stringify(reply), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Tool: get_current_lab_status
  const labSummary = {
    current_tab: latestPlatformState.currentTab,
    lab_name: latestPlatformState.labNameAr,
    sub_module: latestPlatformState.subModule || 'القسم الرئيسي',
    selected_item: latestPlatformState.selectedItem || 'المستخدم يتصفح القسم الحالي',
    details: latestPlatformState.details || 'المحاكاة جاهزة للتجربة',
    circuit_status: latestPlatformState.circuit || null,
  };

  if (isNode) return res.status(200).json(labSummary);
  return new Response(JSON.stringify(labSummary), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
