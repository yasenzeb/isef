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

    const fishKey = (process.env.FISH_AUDIO_API_KEY || process.env.VITE_FISH_AUDIO_API_KEY || '').trim();
    const rawVoiceId = (reference_id || process.env.FISH_AUDIO_VOICE_ID || process.env.VITE_FISH_AUDIO_VOICE_ID || '').trim();
    
    // Extract clean 24-64 char hex/alphanumeric voice ID if user entered a URL or raw ID
    let fishVoiceId: string | undefined = undefined;
    if (rawVoiceId) {
      const match = rawVoiceId.match(/([a-f0-9]{24,64})/i);
      if (match) {
        fishVoiceId = match[1];
      } else if (/^[a-zA-Z0-9_-]{12,64}$/.test(rawVoiceId)) {
        fishVoiceId = rawVoiceId;
      }
    }

    // 1. If Fish Audio API Key is configured, use Fish Audio (https://fish.audio/)
    if (fishKey) {
      // Determine the primary model: Free tier requires 's2.1-pro-free'
      const primaryModel = process.env.FISH_AUDIO_MODEL || 's2.1-pro-free';
      const modelsToTry = [primaryModel, 's2.1-pro'].filter((m, i, arr) => arr.indexOf(m) === i);

      for (const model of modelsToTry) {
        try {
          const fishPayload: any = {
            text: text.trim(),
            format: 'mp3',
            normalize: true,
            latency: 'normal'
          };

          if (fishVoiceId) {
            fishPayload.reference_id = fishVoiceId;
          }

          let fishRes = await fetch('https://api.fish.audio/v1/tts', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${fishKey}`,
              'Content-Type': 'application/json',
              'model': model
            },
            body: JSON.stringify(fishPayload)
          });

          // If the custom voice ID caused an error (e.g. invalid or private ID), retry once without it
          if (!fishRes.ok && fishVoiceId) {
            const errText = await fishRes.text().catch(() => '');
            console.warn(`Fish Audio custom voice failed with model ${model} (${fishRes.status}): ${errText}`);
            delete fishPayload.reference_id;
            fishRes = await fetch('https://api.fish.audio/v1/tts', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${fishKey}`,
                'Content-Type': 'application/json',
                'model': model
              },
              body: JSON.stringify(fishPayload)
            });
          }

          if (fishRes.ok) {
            const audioBuffer = await fishRes.arrayBuffer();

            if (isNode) {
              res.setHeader('Access-Control-Allow-Origin', origin);
              res.setHeader('Content-Type', 'audio/mpeg');
              res.setHeader('X-TTS-Engine', `Fish-Audio-${model}`);
              return res.status(200).send(Buffer.from(audioBuffer));
            } else {
              return new Response(audioBuffer, {
                status: 200,
                headers: {
                  'Access-Control-Allow-Origin': origin,
                  'Content-Type': 'audio/mpeg',
                  'X-TTS-Engine': `Fish-Audio-${model}`
                }
              });
            }
          } else {
            const errText = await fishRes.text().catch(() => '');
            console.error(`Fish Audio error with model ${model}:`, fishRes.status, errText);
          }
        } catch (err: any) {
          console.error(`Fish Audio fetch exception with model ${model}:`, err?.message);
        }
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
