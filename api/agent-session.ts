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

  const candidates = [
    req.query?.agent_id,
    '97720634298f4e94bdec0811de4cb3f3',
    '9772063429bf4e94bdec0811de4cb3f3',
    '9772063429bf4e54bdec0811de4cb3f3',
    '97720634298f4e54bdec0811de4cb3f3',
  ].filter(Boolean) as string[];

  const results: any[] = [];

  for (const agentId of candidates) {
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
      results.push({ agentId, status: fRes.status, data });
      if (fRes.ok) {
        if (isNode) return res.status(200).json(data);
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    } catch (e: any) {
      results.push({ agentId, error: e.message });
    }
  }

  if (isNode) return res.status(404).json({ error: 'No working agent found', results });
  return new Response(JSON.stringify({ error: 'No working agent found', results }), {
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
