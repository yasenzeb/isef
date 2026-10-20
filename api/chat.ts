// Vercel Serverless Function: /api/chat
// Secure server-side execution keeping API keys 100% hidden and safe

export default async function handler(req: any, res: any) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  const openAIKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

  const { messages, currentLab, labName, language } = req.body || {};

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  const isArabic = language !== 'en';
  const lastUserMsg = messages[messages.length - 1]?.text || '';

  // Strict Educational Science System Prompt with Ethical Guardrails
  const systemInstruction = `أنت "SciNexa AI"، باحث ومعلم العلوم التفاعلي الذكي والآمن لمنصة SciNexa في مسابقة ISEF الدولية.
أنت تتحدث مع طالب علم أو باحث مدرسي يستكشف معمل "${labName || currentLab}".

القواعد الصارمة للأمان والمحتوى:
1. أنت مخصص حصرياً للعلوم الأكاديمية والمدرسية والجامعية: الفيزياء، الكيمياء، الأحياء، أطلس التشريح الطبي للأعضاء والعظام، علوم الفلك، والجيولوجيا.
2. يمنع منعاً باتاً مناقشة أي مواضيع غير لائقة أو جنسية أو خارج إطار المنهج العلمي المحترم. إذا سأل المستخدم عن أي موضوع غير لائق، اعتذر بلباقة وركز فقط على العلوم.
3. اشرح المفاهيم العلمية بدقة وبأسلوب تربوي مشوق باللغة ${isArabic ? 'العربية الفصيحة والواضحة' : 'الإنجليزية'}.
4. استخدم التنسيق المنظم (نقاط وعناوين بسيطة) واقترح تجربة عملية يجربها الطالب في أدوات المعمل الافتراضي الحالي.`;

  // 1. Google Gemini 1.5 Flash with Maximum Safety Settings
  if (apiKey) {
    try {
      const contents = [];
      for (const m of messages.slice(-8)) {
        contents.push({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        });
      }

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;

      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemInstruction }]
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
            maxOutputTokens: 1000
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return res.status(200).json({
            reply: text.trim(),
            model: 'gemini-1.5-flash'
          });
        }
      }
    } catch (e: any) {
      console.error('Gemini server exception:', e?.message);
    }
  }

  // 2. OpenAI GPT-4o Fallback if key available
  if (openAIKey) {
    try {
      const chatMessages = [
        { role: 'system', content: systemInstruction },
        ...messages.slice(-8).map((m: any) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        }))
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
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

      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) {
          return res.status(200).json({
            reply: text.trim(),
            model: 'gpt-4o-mini'
          });
        }
      }
    } catch (e: any) {
      console.error('OpenAI server exception:', e?.message);
    }
  }

  // 3. Clean Educational Science Fallback
  const fallbackReply = isArabic
    ? `### 🔬 استكشاف علمي في ${labName || 'المعمل'}:\nأهلاً بك! بخصوص استفسارك حول "${lastUserMsg}":\n\nتعتمد الظواهر الفيزيائية والكيميائية على الملاحظة الدقيقة وتتبع أثر المتغيرات بالمعادلات الحاكمة.\n\n💡 **تجربة عملية داخل المعمل**: تفقد عناصر المحاكاة على الشاشة، وراقب تغير القياسات عند تعديل المتغيرات بنفسك!`
    : `### 🔬 Scientific Observation:\nRegarding "${lastUserMsg}" in ${labName || 'the virtual lab'}:\n\nEmpirical principles rely on telemetry feedback. Adjust the parameters on screen to witness real-time changes!`;

  return res.status(200).json({
    reply: fallbackReply,
    model: 'scinexa-science'
  });
}
