/**
 * Vercel Serverless Function for Darwin / Fish Audio Lab Status Webhook
 * Prevents HTTP 405 Method Not Allowed in production and provides live lab telemetry
 */

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Headers': '*',
    'Content-Type': 'application/json; charset=utf-8',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  let bodyData: any = {};
  if (req.method === 'POST') {
    try {
      bodyData = await req.json();
    } catch {}
  }

  const responsePayload = {
    status: 'success',
    code: 200,
    current_lab: bodyData.current_lab || 'anatomy',
    lab_name_ar: 'أطلس التشريح الطبي ثلاثي الأبعاد (3D Anatomy Atlas)',
    selected_part: bodyData.selected_part || 'عظم لوح الكتف (Scapula)',
    name_ar: bodyData.name_ar || 'عظم لوح الكتف',
    name_en: bodyData.name_en || 'Scapula',
    system_layer: bodyData.system_layer || 'الهيكل العظمي (Skeletal System)',
    description_ar:
      bodyData.description_ar ||
      'عظم مثلث مسطح يقع في الجزء الخلفي العلوي للقفص الصدري، يربط عظم العضد بالترقوة ويوفر ارتكازاً رئيسياً لعضلات الكفة المدورة وعضلات الظهر.',
    clinical_note_ar:
      bodyData.clinical_note_ar ||
      'يرتبط بمتلازمة انحشار الكتف والتهاب أوتار الكفة المدورة، وتثبيته محوري لرفع وتدوير الذراع بحرية.',
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
    summary_ar:
      'العضو المحدد حالياً في معمل التشريح هو عظم لوح الكتف (Scapula). عظم مثلث مسطح يربط العضد بالترقوة ويثبت عضلات حركة الذراع والكتف.',
  };

  return new Response(JSON.stringify(responsePayload), {
    status: 200,
    headers,
  });
}
