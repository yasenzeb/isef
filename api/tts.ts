// Universal Vercel Serverless Function: /api/tts
// Supports Fish Audio (https://fish.audio) S2 ultra-realistic neural TTS engine

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

    const { text, reference_id } = body || {};
    if (!text || !text.trim()) {
      if (isNode) return res.status(400).json({ error: 'Text is required' });
      return new Response(JSON.stringify({ error: 'Text is required' }), { status: 400 });
    }

    const fishKey = process.env.FISH_AUDIO_API_KEY || process.env.VITE_FISH_AUDIO_API_KEY;
    const fishVoiceId = reference_id || process.env.FISH_AUDIO_VOICE_ID || process.env.VITE_FISH_AUDIO_VOICE_ID;
    const fishModel = process.env.FISH_AUDIO_MODEL || 's2.1-pro';

    // 1. If Fish Audio API Key is configured, use Fish Audio (https://fish.audio/)
    if (fishKey && fishKey.trim()) {
      try {
        const fishPayload: any = {
          text: text.trim(),
          format: 'mp3',
          normalize: true
        };

        if (fishVoiceId && fishVoiceId.trim()) {
          fishPayload.reference_id = fishVoiceId.trim();
        }

        const fishRes = await fetch('https://api.fish.audio/v1/tts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${fishKey.trim()}`,
            'Content-Type': 'application/json',
            'model': fishModel
          },
          body: JSON.stringify(fishPayload)
        });

        if (fishRes.ok) {
          const audioBuffer = await fishRes.arrayBuffer();

          if (isNode) {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Content-Type', 'audio/mpeg');
            return res.status(200).send(Buffer.from(audioBuffer));
          } else {
            return new Response(audioBuffer, {
              status: 200,
              headers: {
                'Access-Control-Allow-Origin': origin,
                'Content-Type': 'audio/mpeg'
              }
            });
          }
        } else {
          const errText = await fishRes.text().catch(() => '');
          console.error('Fish Audio API error:', fishRes.status, errText);
        }
      } catch (err: any) {
        console.error('Fish Audio fetch error:', err?.message);
      }
    }

    // 2. Fallback to Google Neural Audio
    const encoded = encodeURIComponent(text.slice(0, 180));
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=ar&client=tw-ob`;
    const gRes = await fetch(googleTtsUrl);

    if (gRes.ok) {
      const gBuffer = await gRes.arrayBuffer();
      if (isNode) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Content-Type', 'audio/mpeg');
        return res.status(200).send(Buffer.from(gBuffer));
      } else {
        return new Response(gBuffer, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': origin,
            'Content-Type': 'audio/mpeg'
          }
        });
      }
    }

    if (isNode) return res.status(500).json({ error: 'TTS generation failed' });
    return new Response(JSON.stringify({ error: 'TTS generation failed' }), { status: 500 });
  } catch (e: any) {
    if (isNode) return res.status(500).json({ error: e?.message });
    return new Response(JSON.stringify({ error: e?.message }), { status: 500 });
  }
}
