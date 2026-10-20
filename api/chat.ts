// Universal Vercel Serverless Function: /api/chat
// Supports both Node.js Serverless and Edge Runtime on Vercel

const SCINEXA_SYSTEM_BRAIN = `أنت "SciNexa AI"، العقل المفكر والمعلم العلمي والباحث الذكي التفاعلي لمنصة SciNexa في مسابقة ISEF الدولية.
أنت لست روبوتاً تقليدياً ولا تستخدم إجابات معلبة أو نصوصاً مسبقة. لديك استيعاب كامل لكل تفاصيل المنصة وتجهيزاتها وتجاربها:

=== ما هي منصة SciNexa؟ ===
مشروع علمي هندسي رائد في مسابقة ISEF الدولية يهدف إلى حل عجز المعامل المدرسية ومختبرات الجامعات في العالم العربي عبر توفير بيئة محاكاة تفاعلية ثلاثية الأبعاد متكاملة تعمل 100% بدون إنترنت ومجاناً.

=== المعامل الستة وتجهيزاتها التي تعرفها وتستكشفها: ===
1. أطلس التشريح الطبي البشري (3D Anatomy Atlas):
   - 210 عظمة كاملة (الجمجمة 22 عظمة، الفك السفلي المتحرك Mandible، العمود الفقري 33 فقرة، عظم الفخذ Femur أطول وأقوى عظمة، القفص الصدري، عظام الحوض والأطراف).
   - 7 أجهزة حيوية كاملة (الهيكل العظمي، العضلي، الدوري وتدفق الدم، العصبي، الهضمي، التنفسي، البولي).
   - أدوات المعمل: فحص وعزل أي عضو أو عظمة بمفردها بتقنية 3D بـ 60 FPS، تدوير وتقريب كامل، شفافية الأجهزة، ومعلومات تشريحية وسريرية.

2. مختبر الفيزياء والدوائر الكهربائية والموجات (Physics Lab):
   - معمل تيار مستمر DC: بطاريات، مقاومات، مصابيح، مفاتيح، أجهزة قياس (فولتميتر، أميتر).
   - القوانين الفيزيائية: قانون أوم (V = I × R)، حساب المقاومة المكافئة على التوالي (Rt = Σ R) والتوازي (1/Rt = Σ 1/R)، قصر الدائرة (Short Circuit) وارتفاع التيار.
   - محاكي الموجات على وتر مشدود: سرعة الموجة v = √(T/μ) وعلاقتها بالتردد والطول الموجي (v = λ × f).
   - انكسار الضوء وقانون سنيل (n1 sin θ1 = n2 sin θ2) وظاهرة الانعكاس الكلي الداخلي.

3. مختبر الكيمياء والجدول الدوري (PraxiLabs Chemistry Engine):
   - الجدول الدوري لـ 118 عنصراً ببياناتها الذرية (العدد الذري، الكتلة، المجموعة، الدورة، إلكترونات التكافؤ).
   - دورق التفاعل التفاعلي: الطالب يسحب أي عنصرين ويدمجهما لمشاهدة التفاعل اللحظي والمعادلة الموزونة.
   - حساب الطاقة والتغير الحراري ΔH (طارد للحرارة Exothermic كدمج 2Na + Cl2 -> 2NaCl، أو ماص للحرارة Endothermic)، تصاعد الغازات، تكوين الرواسب، ومحاكي الذرة ومستويات الطاقة ثلاثي الأبعاد.

4. مختبر الأحياء ودراسة الخلية (Biology & Cytology Lab):
   - الخلية النباتية (جدار سيليلوزي، بلاستيدات خضراء للبناء الضوئي، فجوة عصارية كبيرة) مقابل الخلية الحيوانية (غشاء بلازمي، سنتريول).
   - الميتوكوندريا وتوليد الطاقة ATP عبر التنفس الخلوي.
   - الحمض النووي DNA (لولب مزدوج، ارتباط القواعد: أدينين مع ثايمين، وسيتوزين مع جوانين).
   - كائنات مياه المستنقعات والميكروسكوب: الأميبا (أقدام كاذبة والبلعمة)، اليوجلينا (سوط وبقعة عينية)، والبراميسيوم (أهداب دقيقة).

5. مختبر علوم الأرض والزلازل (Geology & Seismic Lab):
   - طبقات الأرض الأربعة: القشرة، الوشاح، اللب الخارجي المنصهر، واللب الداخلي الصلب.
   - حركة الصفائح التكتونية والصدوع، وموجات الزلازل الأولية P والثانوية S والسطحية (Love & Rayleigh).
   - ديناميكا المنشآت وظاهرة "الرنين الميكانيكي Resonance" التي تسبب انهيار الأبراج عندما يتطابق تردد الزلزال مع التردد الطبيعي للمبنى.

6. مختبر علوم الفلك والنظام الشمسي (Astronomy Lab):
   - الشمس وكواكب المجموعة الشمسية الثمانية (عطارد، الزهرة، الأرض، المريخ، المشتري، زحل، أورانوس، نبتون).
   - قوانين كبلر لحركة الكواكب وعلاقة السرعة المدارية بالبعد عن الشمس.
   - أطوار القمر الـ 8 وظواهر كسوف الشمس وخسوف القمر والمد والجزر.

=== طريقة تفاعلك وتفكيرك مع الطالب: ===
1. حلل سؤال الطالب بعمق ومنطق علمي حقيقي؛ لا تسرد إجابات جاهزة، بل تحدث كمعلم نابغة ومرشد بحثي.
2. وجه الطالب دائماً إلى أدوات المعمل الحالي: أخبره مثلاً "جرب الآن في معمل الكيمياء سحب عنصر الصوديوم مع الكلور في الدورق وشاهد وميض التفاعل" أو "اضغط على زر فحص وعزل عظم الفخذ في معمل التشريح لتشاهده 3D".
3. استخدم اللغة العربية الفصيحة والواضحة مع تنسيق أنيق (نقاط، خط عريض للكلمات المفتاحية).
4. اطرح في نهاية إجابتك سؤال تحدٍ ذكي أو اقتراح خطوة عملية تالية يجربها الطالب بنفسه.
5. التزم التزاماً صارماً بأخلاقيات العلوم المدرسية والجامعية المحترمة وتجنب أي محتوى غير لائق.`;

function formatContentsForGemini(messages: any[], currentQuery: string) {
  const list: any[] = [];
  let started = false;

  for (const m of (messages || [])) {
    if (!started && m.sender !== 'user') continue;
    started = true;
    const role = m.sender === 'user' ? 'user' : 'model';
    const text = (m.text || '').trim();
    if (!text) continue;

    if (list.length > 0 && list[list.length - 1].role === role) {
      list[list.length - 1].parts[0].text += '\n' + text;
    } else {
      list.push({ role, parts: [{ text }] });
    }
  }

  if (list.length > 0 && list[list.length - 1].role === 'user') {
    list[list.length - 1].parts[0].text = currentQuery;
  } else {
    list.push({ role: 'user', parts: [{ text: currentQuery }] });
  }

  return list;
}

// Active Gemini model candidates in priority order
const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.5-pro',
  'gemini-1.5-flash-latest',
  'gemini-pro'
];

export default async function handler(req: any, res?: any) {
  const isNode = Boolean(res && typeof res.status === 'function');
  const origin = req.headers?.origin || '*';

  if (req.method === 'OPTIONS') {
    if (isNode) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res.status(200).end();
    } else {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }
  }

  const sendResponse = (statusCode: number, data: any) => {
    if (isNode) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Content-Type', 'application/json');
      return res.status(statusCode).json(data);
    } else {
      return new Response(JSON.stringify(data), {
        status: statusCode,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Content-Type': 'application/json'
        }
      });
    }
  };

  if (req.method !== 'POST') {
    return sendResponse(405, { error: 'Method not allowed' });
  }

  try {
    let body: any;
    if (isNode) {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } else {
      body = await req.json();
    }

    const { messages, currentLab, labName } = body || {};
    const lastUserQuery = messages && messages.length > 0 ? messages[messages.length - 1].text : '';

    const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    const openAIKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

    const dynamicLabContext = `المعمل النشط الآن أمام المستخدم: "${labName || currentLab}".`;

    // 1. Google Gemini Live API with Multi-Model Fallback
    if (geminiKey && geminiKey.trim()) {
      const contents = formatContentsForGemini(messages, lastUserQuery);
      let lastErrorMsg = '';

      for (const model of GEMINI_MODELS) {
        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey.trim()}`;

          const geminiRes = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: {
                parts: [{ text: `${SCINEXA_SYSTEM_BRAIN}\n\n${dynamicLabContext}` }]
              },
              contents: contents,
              safetySettings: [
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
                { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_LOW_AND_ABOVE' },
                { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_LOW_AND_ABOVE' }
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1200
              }
            })
          });

          if (geminiRes.ok) {
            const data = await geminiRes.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              return sendResponse(200, {
                reply: text.trim(),
                model: model
              });
            }
          } else {
            const errData = await geminiRes.json().catch(() => ({}));
            lastErrorMsg = errData.error?.message || `Status ${geminiRes.status}`;
            console.warn(`Gemini model ${model} failed:`, lastErrorMsg);
          }
        } catch (e: any) {
          lastErrorMsg = e?.message || 'Network exception';
        }
      }

      // If all Gemini candidate models failed
      if (lastErrorMsg) {
        return sendResponse(200, {
          reply: `⚠️ عذراً، واجه مفتاح Gemini خطأ أثناء الاستجابة: ${lastErrorMsg}\nيرجى التأكد من صلاحية المفتاح في إعدادات Vercel.`,
          model: 'error'
        });
      }
    }

    // 2. OpenAI GPT-4o Fallback
    if (openAIKey && openAIKey.trim()) {
      try {
        const chatMessages = [
          { role: 'system', content: `${SCINEXA_SYSTEM_BRAIN}\n\n${dynamicLabContext}` },
          ...(messages || []).slice(-8).map((m: any) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text
          }))
        ];

        const openAIRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIKey.trim()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: chatMessages,
            temperature: 0.7
          })
        });

        if (openAIRes.ok) {
          const data = await openAIRes.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) {
            return sendResponse(200, {
              reply: text.trim(),
              model: 'gpt-4o-mini'
            });
          }
        }
      } catch (err: any) {
        console.error('OpenAI call error:', err?.message);
      }
    }

    // 3. Clear notice if no key configured
    return sendResponse(200, {
      reply: `⚠️ لم يتم العثور على مفتاح GEMINI_API_KEY في إعدادات البيئة.\nيرجى إضافة المفتاح في Vercel تحت اسم GEMINI_API_KEY ثم عمل Redeploy ليعمل الشات المباشر فوراً!`,
      model: 'no-key'
    });
  } catch (error: any) {
    console.error('Handler catch error:', error?.message);
    return sendResponse(500, { error: error?.message || 'Server error' });
  }
}
