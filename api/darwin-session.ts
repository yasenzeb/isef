// /api/darwin-session
// Creates a Fish Audio LiveKit session for Darwin and returns livekit_url + token
// This allows the browser to connect directly via livekit-client SDK
// giving Darwin full real-time awareness of lab state via publishData

const DARWIN_AGENT_ID = '97720634298f4e94bdec0811de4cb3f3';

export default async function handler(req: any, res?: any) {
  const isNode = Boolean(res && typeof res.status === 'function');

  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    if (isNode) {
      Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(204).end();
    }
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const fishKey = process.env.FISH_AUDIO_API_KEY || process.env.VITE_FISH_AUDIO_API_KEY;
  if (!fishKey) {
    const err = { error: 'FISH_AUDIO_API_KEY not configured' };
    if (isNode) return res.status(500).json(err);
    return new Response(JSON.stringify(err), { status: 500, headers: corsHeaders });
  }

  try {
    const fRes = await fetch('https://api.fish.audio/v1/agent/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${fishKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ agent_id: DARWIN_AGENT_ID }),
    });

    if (!fRes.ok) {
      const errBody = await fRes.text();
      const err = { error: `Fish Audio API error ${fRes.status}`, detail: errBody };
      if (isNode) return res.status(fRes.status).json(err);
      return new Response(JSON.stringify(err), {
        status: fRes.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const session = await fRes.json();
    // session = { session_id, livekit_url, token, transport: 'livekit', ... }

    const payload = {
      session_id: session.session_id,
      livekit_url: session.livekit_url,
      token: session.token,
      transport: session.transport || 'livekit',
    };

    if (isNode) return res.status(200).json(payload);
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    const err = { error: e.message };
    if (isNode) return res.status(500).json(err);
    return new Response(JSON.stringify(err), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
