// Vercel Serverless Function: /api/fish-tool
// Handles Fish Audio Agent Webhook Tools & Platform Synchronization

let latestPlatformState: {
  currentTab: string;
  labNameAr: string;
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
  action: 'switch_lab' | 'highlight' | 'explain';
  target_lab?: string;
  detail?: string;
  timestamp: number;
}> = [];

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
    const actions = [...pendingActions];
    pendingActions = []; // Flush executed actions
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

  // Tool A: switch_lab
  if (toolName === 'switch_lab' || args.target_lab) {
    const targetLab = (args.target_lab || '').toLowerCase().trim();
    const labNames: Record<string, string> = {
      anatomy: 'أطلس التشريح 3D',
      physics: 'مختبر الفيزياء والدوائر',
      chemistry: 'مختبر الكيمياء والجدول الدوري',
      biology: 'مختبر الأحياء والخلية',
      geology: 'علوم الأرض والزلازل',
      astronomy: 'علم الفلك ومدارات كبلر',
      home: 'الصفحة الرئيسية',
    };

    if (labNames[targetLab]) {
      pendingActions.push({
        id: 'act_' + Date.now(),
        action: 'switch_lab',
        target_lab: targetLab,
        timestamp: Date.now(),
      });
      latestPlatformState.currentTab = targetLab;
      latestPlatformState.labNameAr = labNames[targetLab];

      const reply = {
        success: true,
        message: `تم الانتقال بنجاح إلى ${labNames[targetLab]}. المنصة جاهزة لاستكشاف تجارب هذا المختبر.`,
        current_lab: targetLab,
      };
      if (isNode) return res.status(200).json(reply);
      return new Response(JSON.stringify(reply), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  // Tool B: get_current_lab_status
  const labSummary = {
    current_tab: latestPlatformState.currentTab,
    lab_name: latestPlatformState.labNameAr,
    selected_item: latestPlatformState.selectedItem || 'لم يتم تحديد عنصر أو عظمة محددة بعد',
    details: latestPlatformState.details || 'المستخدم يتصفح المختبر حالياً',
    circuit_status: latestPlatformState.circuit || null,
    recommendations: 'يمكنك توجيه المستخدم أو شرح أي جزء يحدده في النموذج ثلاثي الأبعاد.',
  };

  if (isNode) return res.status(200).json(labSummary);
  return new Response(JSON.stringify(labSummary), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
