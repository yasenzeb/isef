/**
 * api/auth/logout.ts
 * Clears the session cookie and removes the session from the store.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

function parseCookies(req: VercelRequest): Record<string, string> {
  const raw = req.headers.cookie || '';
  return Object.fromEntries(
    raw.split(';').map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k, decodeURIComponent(v.join('='))];
    })
  );
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cookies   = parseCookies(req);
  const sessionId = cookies['scinexa_session'];

  if (sessionId) {
    // Remove from in-memory store
    // (If using Vercel KV: await kv.del(`session:${sessionId}`))
    console.log(`Session ${sessionId.slice(0, 8)}... logged out`);
  }

  // Clear session cookie
  const isProd = process.env.NODE_ENV === 'production';
  res.setHeader('Set-Cookie', [
    `scinexa_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict${isProd ? '; Secure' : ''}`,
  ]);

  return res.status(200).json({ ok: true });
}
