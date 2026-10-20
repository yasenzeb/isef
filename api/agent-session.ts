// Universal Vercel Serverless Function: /api/agent-session
// Generates an authenticated session token for Fish Audio Darwin Agent

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

  const fishKey = (process.env.FISH_AUDIO_API_KEY || process.env.VITE_FISH_AUDIO_API_KEY || '').trim();
  const agentId = '9772063429bf4e54bdec0811de4cb3f3';

  if (!fishKey) {
    const err = { error: 'FISH_AUDIO_API_KEY is not set in environment variables' };
    if (isNode) return res.status(500).json(err);
    return new Response(JSON.stringify(err), { status: 500, headers: corsHeaders });
  }

  try {
    const fRes = await fetch('https://api.fish.audio/v1/agent/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${fishKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ agent_id: agentId })
    });

    const data = await fRes.json();

    if (isNode) {
      Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(fRes.status).json(data);
    }
    return new Response(JSON.stringify(data), {
      status: fRes.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    const err = { error: e?.message || 'Failed to create session' };
    if (isNode) return res.status(500).json(err);
    return new Response(JSON.stringify(err), { status: 500, headers: corsHeaders });
  }
}
