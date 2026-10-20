// Diagnostic endpoint — DELETE AFTER DEBUGGING
export default async function handler(req: any, res?: any) {
  const isNode = Boolean(res && typeof res.status === 'function');

  const fishKey = (process.env.FISH_AUDIO_API_KEY || '').trim();
  const voiceId = (process.env.FISH_AUDIO_VOICE_ID || '').trim();

  const info: any = {
    has_fish_key: fishKey.length > 0,
    fish_key_length: fishKey.length,
    fish_key_first6: fishKey.slice(0, 6) || '(empty)',
    has_voice_id: voiceId.length > 0,
    voice_id_value: voiceId || '(empty)',
  };

  // Only test if key looks present
  if (fishKey) {
    for (const model of ['drama-3', 's2.1-pro-free']) {
      try {
        const payload: any = {
          text: 'مرحبا',
          format: 'mp3',
          normalize: true
        };
        if (voiceId) payload.reference_id = voiceId;

        const r = await fetch('https://api.fish.audio/v1/tts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${fishKey}`,
            'Content-Type': 'application/json',
            'model': model
          },
          body: JSON.stringify(payload)
        });

        const status = r.status;
        const ct = r.headers.get('content-type') || '';
        let body = '';
        if (!r.ok) body = await r.text().catch(() => '');

        info[`model_${model}`] = { status, content_type: ct, error: body.slice(0, 200) };
        if (r.ok) { info.working_model = model; break; }
      } catch (e: any) {
        info[`model_${model}`] = { error: e.message };
      }
    }
  }

  if (isNode) return res.status(200).json(info);
  return new Response(JSON.stringify(info, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
