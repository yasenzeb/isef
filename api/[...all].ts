/**
 * Universal Serverless Telemetry Handler for Darwin / Fish Audio Webhooks
 * Handles any /api/* endpoint: lab-status, screen, context, get_current_lab_status, etc.
 * Supports both Node.js Serverless and Edge Runtime on Vercel.
 * Fixes HTTP 405 Method Not Allowed permanently.
 */

const defaultTelemetry = {
  status: 'success',
  code: 200,
  current_lab: 'anatomy',
  lab_name_ar: 'أطلس التشريح الطبي ثلاثي الأبعاد (3D Anatomy Atlas)',
  selected_part: 'عظم لوح الكتف (Scapula)',
  name_ar: 'عظم لوح الكتف',
  name_en: 'Scapula',
  system_layer: 'الهيكل العظمي (Skeletal System)',
  description_ar:
    'عظم مثلث مسطح يقع في الجزء الخلفي العلوي للقفص الصدري، يربط عظم العضد بالترقوة ويوفر ارتكازاً رئيسياً لعضلات الكفة المدورة وعضلات الظهر.',
  clinical_note_ar:
    'يرتبط بمتلازمة انحشار الكتف والتهاب أوتار الكفة المدورة، وتثبيته محوري لرفع وتدوير الذراع بحرية.',
  screen_state: {
    active_page: '3D Anatomy Lab',
    active_element: 'Scapula (عظم لوح الكتف)',
    is_interactive: true,
  },
  physics: {
    voltage: 9,
    resistance: 10,
    current: 0.9,
    switchClosed: true,
    isShortCircuit: false,
  },
  chemistry: {
    selectedReagents: ['خارصين (Zn)', 'حمض الهيدروكلوريك (HCl)'],
    reactionEquation: 'Zn + 2HCl → ZnCl₂ + H₂↑',
    reactionNameAr: 'تفاعل إحلال بسيط وتصاعد غاز الهيدروجين',
  },
  first_name: 'عبد الرحمن',
  student_first_name: 'عبد الرحمن',
  student_name: 'عبد الرحمن',
  calling_name: 'عبد الرحمن',
  user_name: 'عبد الرحمن',
  name: 'عبد الرحمن',
  full_name: 'عبد الرحمن أحمد',
  student_grade: 'الصف الثاني الثانوي',
  grade: 'الصف الثاني الثانوي',
  greeting: 'أهلاً يا عبد الرحمن يا بطل الصف الثاني الثانوي!',
  system_instructions:
    'اسم الطالب الأول هو (عبد الرحمن). ناديه دائماً باسمه الأول (عبد الرحمن) فقط وليس باسمه الكامل أو الرباعي. إذا سألك الطالب (اسمي ايه) أو (ما اسمي)، أجب فوراً وبكل ثقة وود: اسمك يا بطل هو عبد الرحمن وأنت بطل الصف الثاني الثانوي!',
  summary_ar:
    'العضو المحدد حالياً في معمل التشريح هو عظم لوح الكتف (Scapula). عظم مثلث مسطح يربط العضد بالترقوة ويثبت عضلات حركة الذراع والكتف. الطالب المتفاعل حالياً اسمه الأول: عبد الرحمن.',
};

export default async function handler(req: any, res: any) {
  // CORS Headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Headers': '*',
    'Content-Type': 'application/json; charset=utf-8',
  };

  // 1. Edge Runtime Check
  const isEdge = typeof Request !== 'undefined' && req instanceof Request;

  if (isEdge) {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    let bodyData: any = {};
    if (req.method === 'POST') {
      try {
        bodyData = await req.json();
      } catch {}
    }

    const payload = {
      ...defaultTelemetry,
      ...bodyData,
      status: 'success',
      code: 200,
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: corsHeaders,
    });
  }

  // 2. Node.js Serverless Runtime Check
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  let bodyData: any = {};
  if (req.method === 'POST') {
    try {
      bodyData = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    } catch {
      bodyData = {};
    }
  }

  const payload = {
    ...defaultTelemetry,
    ...bodyData,
    status: 'success',
    code: 200,
  };

  res.status(200).json(payload);
}
