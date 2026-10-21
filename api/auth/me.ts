/**
 * api/auth/me.ts
 * Returns the current logged-in user's profile from the session cookie.
 * Called by the React AuthContext on every page load.
 *
 * SECURITY: Session ID is read from an HTTPOnly cookie (JS cannot access it).
 * The session data is AES-256-GCM encrypted at rest.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as crypto from 'crypto';
import { getSession } from './callback';

const { SESSION_SECRET } = process.env;

function parseCookies(req: VercelRequest): Record<string, string> {
  const raw = req.headers.cookie || '';
  return Object.fromEntries(
    raw.split(';').map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k, decodeURIComponent(v.join('='))];
    })
  );
}

function decryptSession(encrypted: string, secret: string): string {
  const [ivHex, authTagHex, dataHex] = encrypted.split(':');
  const key     = crypto.scryptSync(secret, 'scinexa_salt_v1', 32);
  const iv      = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const data    = Buffer.from(dataHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(data) + decipher.final('utf8');
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cookies   = parseCookies(req);
  const sessionId = cookies['scinexa_session'];

  if (!sessionId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const encrypted = getSession(sessionId);
  if (!encrypted) {
    return res.status(401).json({ error: 'Session expired or not found' });
  }

  try {
    const secret  = SESSION_SECRET || 'scinexa_default_dev_secret_change_in_prod!!';
    const payload = decryptSession(encrypted, secret);
    const user    = JSON.parse(payload);

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ user });
  } catch (err) {
    console.error('Session decryption failed:', err);
    return res.status(401).json({ error: 'Invalid session' });
  }
}
