// Universal Vercel Serverless Function: /api/tts
// Primary: Google Gemini TTS (free, same API key as chat)
// Fallback: Google Translate TTS

export default async function handler(req: any, res?: any) {
  const isNode = Boolean(res && typeof res.status === 'function');
  const origin = req.headers?.origin || '*';

  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    if (isNode) {
      Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(200).end();
    }
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    if (isNode) return res.status(405).json({ error: 'Method not allowed' });
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    let body: any;
    if (isNode) {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } else {
      body = await req.json();
    }

    const { text } = body || {};
    if (!text || !text.trim()) {
      if (isNode) return res.status(400).json({ error: 'Text is required' });
      return new Response(JSON.stringify({ error: 'Text is required' }), { status: 400 });
    }

    const geminiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '').trim();

    // ── 1. PRIMARY: Gemini TTS (same free API key as chat) ──
    if (geminiKey) {
      // Try models in order of quality
      const ttsModels = [
        'gemini-2.5-flash-preview-tts',
        'gemini-2.0-flash-preview-tts',
        'gemini-2.5-flash-tts',
      ];

      for (const model of ttsModels) {
        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [{ text: text.trim() }]
                  }
                ],
                generationConfig: {
                  responseModalities: ['AUDIO'],
                  speechConfig: {
                    voiceConfig: {
                      prebuiltVoiceConfig: {
                        // Charon: calm, clear, educational — best for STEM Arabic content
                        voiceName: process.env.GEMINI_TTS_VOICE || 'Charon'
                      }
                    }
                  }
                }
              })
            }
          );

          if (geminiRes.ok) {
            const json = await geminiRes.json();
            const audioData = json?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            const mimeType = json?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType || 'audio/L16';

            if (audioData) {
              const rawPcm = Buffer.from(audioData, 'base64');

              // Gemini returns raw PCM (24kHz, 16-bit, mono) — wrap it in a WAV container
              const wavBuffer = pcmToWav(rawPcm, 24000, 1, 16);

              if (isNode) {
                res.setHeader('Access-Control-Allow-Origin', origin);
                res.setHeader('Content-Type', 'audio/wav');
                res.setHeader('X-TTS-Engine', `Gemini-${model}`);
                return res.status(200).send(wavBuffer);
              } else {
                return new Response(wavBuffer, {
                  status: 200,
                  headers: {
                    'Access-Control-Allow-Origin': origin,
                    'Content-Type': 'audio/wav',
                    'X-TTS-Engine': `Gemini-${model}`
                  }
                });
              }
            }
          } else {
            const errText = await geminiRes.text().catch(() => '');
            console.warn(`Gemini TTS model ${model} failed (${geminiRes.status}):`, errText.slice(0, 200));
          }
        } catch (err: any) {
          console.warn(`Gemini TTS ${model} exception:`, err?.message);
        }
      }
    }

    // ── 2. FALLBACK: Google Translate TTS ──
    const encoded = encodeURIComponent(text.trim().slice(0, 180));
    const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=ar&client=tw-ob`;
    const gRes = await fetch(fallbackUrl);

    if (gRes.ok) {
      const gBuffer = await gRes.arrayBuffer();
      if (isNode) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('X-TTS-Engine', 'Google-Translate-Fallback');
        return res.status(200).send(Buffer.from(gBuffer));
      } else {
        return new Response(gBuffer, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': origin,
            'Content-Type': 'audio/mpeg',
            'X-TTS-Engine': 'Google-Translate-Fallback'
          }
        });
      }
    }

    if (isNode) return res.status(500).json({ error: 'TTS generation failed' });
    return new Response(JSON.stringify({ error: 'TTS generation failed' }), { status: 500 });

  } catch (e: any) {
    console.error('TTS handler error:', e?.message);
    if (isNode) return res.status(500).json({ error: e?.message });
    return new Response(JSON.stringify({ error: e?.message }), { status: 500 });
  }
}

// ── Helper: wrap raw PCM bytes in a WAV file header ──
function pcmToWav(pcmData: Buffer, sampleRate: number, channels: number, bitDepth: number): Buffer {
  const dataLength = pcmData.length;
  const header = Buffer.alloc(44);

  // RIFF chunk
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataLength, 4);
  header.write('WAVE', 8);

  // fmt sub-chunk
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);           // Sub-chunk size
  header.writeUInt16LE(1, 20);            // PCM format
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * channels * (bitDepth / 8), 28); // Byte rate
  header.writeUInt16LE(channels * (bitDepth / 8), 32);              // Block align
  header.writeUInt16LE(bitDepth, 34);

  // data sub-chunk
  header.write('data', 36);
  header.writeUInt32LE(dataLength, 40);

  return Buffer.concat([header, pcmData]);
}
