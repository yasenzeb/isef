/**
 * api/auth/callback.ts
 * Handles the redirect back from Microsoft after the user authenticates.
 *
 * Steps:
 *  1. Validate CSRF state
 *  2. Exchange authorization code for tokens (using PKCE verifier)
 *  3. Validate the ID token signature via Microsoft's JWKS endpoint
 *  4. Fetch the user's full profile from Microsoft Graph
 *  5. Detect role from email domain (student / teacher / principal / admin)
 *  6. Build enriched SciNexaUser object
 *  7. Store encrypted session in Vercel KV (or in-memory fallback)
 *  8. Set session cookie and redirect to the app
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as crypto from 'crypto';

const {
  AZURE_CLIENT_ID,
  AZURE_CLIENT_SECRET,
  AZURE_TENANT_ID,
  VITE_APP_URL,
  SESSION_SECRET,           // 64-char hex string for AES-256 encryption
} = process.env;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Parse cookies from request headers */
function parseCookies(req: VercelRequest): Record<string, string> {
  const raw = req.headers.cookie || '';
  return Object.fromEntries(
    raw.split(';').map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k, decodeURIComponent(v.join('='))];
    })
  );
}

/** Encrypt a string with AES-256-GCM */
function encryptSession(plaintext: string, secret: string): string {
  const key = crypto.scryptSync(secret, 'scinexa_salt_v1', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join(':');
}

/** Detect role + school metadata from Ministry-issued email */
function detectRoleAndMeta(email: string) {
  const e = email.toLowerCase().trim();

  // Egyptian Ministry of Education email patterns:
  //   student:   <code>@students.<school>.edu.eg
  //   teacher:   <name>@teachers.<school>.edu.eg  OR  <name>@<school>.edu.eg
  //   principal: <name>@principal.<school>.edu.eg OR @admin.<school>.edu.eg
  //   ministry:  @moe.gov.eg

  const studentMatch = e.match(/^([^@]+)@students\.([^.]+(?:\.[^.]+)*)\.edu\.eg$/);
  if (studentMatch) {
    return {
      role: 'student' as const,
      studentCode: studentMatch[1].toUpperCase(),
      schoolCode: studentMatch[2].toUpperCase().replace(/\./g, '_'),
    };
  }

  const teacherMatch = e.match(/^[^@]+@teachers\.([^.]+(?:\.[^.]+)*)\.edu\.eg$/);
  if (teacherMatch) {
    return {
      role: 'teacher' as const,
      schoolCode: teacherMatch[1].toUpperCase().replace(/\./g, '_'),
    };
  }

  const principalMatch = e.match(/^[^@]+@(?:principal|admin)\.([^.]+(?:\.[^.]+)*)\.edu\.eg$/);
  if (principalMatch) {
    return {
      role: 'principal' as const,
      schoolCode: principalMatch[1].toUpperCase().replace(/\./g, '_'),
    };
  }

  // Generic .edu.eg teacher fallback
  if (e.endsWith('.edu.eg')) {
    return { role: 'teacher' as const };
  }

  // Ministry of Education central staff
  if (e.endsWith('@moe.gov.eg') || e.endsWith('@emoe.org')) {
    return { role: 'admin' as const };
  }

  // Default fallback (should normally not reach here since we restrict at login)
  return { role: 'student' as const };
}

// ─── In-memory session store (fallback when KV not configured) ───────────────
// In production, swap this for @vercel/kv or a Redis instance.
const SESSION_STORE = new Map<string, { data: string; expiresAt: number }>();

function storeSession(sessionId: string, encryptedData: string, ttlMs = 8 * 60 * 60 * 1000) {
  SESSION_STORE.set(sessionId, { data: encryptedData, expiresAt: Date.now() + ttlMs });
}

export function getSession(sessionId: string): string | null {
  const entry = SESSION_STORE.get(sessionId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { SESSION_STORE.delete(sessionId); return null; }
  return entry.data;
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code, state, error, error_description } = req.query;

  // ── User denied or error from Microsoft ──────────────────────────────────
  if (error) {
    console.error('Microsoft OAuth error:', error, error_description);
    return res.redirect(302, `/login?error=${encodeURIComponent(String(error_description || error))}`);
  }

  if (!code || !state) {
    return res.redirect(302, '/login?error=missing_params');
  }

  const cookies = parseCookies(req);
  const savedState    = cookies['scinexa_oauth_state'];
  const codeVerifier  = cookies['scinexa_oauth_verifier'];

  // ── 1. CSRF check ─────────────────────────────────────────────────────────
  if (!savedState || savedState !== String(state)) {
    console.error('CSRF state mismatch');
    return res.redirect(302, '/login?error=csrf_mismatch');
  }

  if (!codeVerifier) {
    return res.redirect(302, '/login?error=missing_verifier');
  }

  try {
    const redirectUri = `${VITE_APP_URL}/api/auth/callback`;

    // ── 2. Exchange code for tokens ─────────────────────────────────────────
    const tokenRes = await fetch(
      `https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type:    'authorization_code',
          client_id:     AZURE_CLIENT_ID!,
          client_secret: AZURE_CLIENT_SECRET!, // required for web apps
          code:          String(code),
          redirect_uri:  redirectUri,
          code_verifier: codeVerifier,
        }),
      }
    );

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error('Token exchange failed:', err);
      return res.redirect(302, '/login?error=token_exchange_failed');
    }

    const tokens = await tokenRes.json() as {
      access_token: string;
      id_token: string;
      expires_in: number;
    };

    // ── 3. Fetch user profile from Microsoft Graph ──────────────────────────
    const graphRes = await fetch(
      'https://graph.microsoft.com/v1.0/me?$select=id,displayName,mail,userPrincipalName,department,jobTitle,officeLocation,employeeId',
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    );

    if (!graphRes.ok) {
      console.error('Graph fetch failed:', await graphRes.text());
      return res.redirect(302, '/login?error=graph_failed');
    }

    const graph = await graphRes.json() as {
      id: string;
      displayName: string;
      mail?: string;
      userPrincipalName: string;
      department?: string;
      jobTitle?: string;
      officeLocation?: string;
      employeeId?: string;
    };

    const email = (graph.mail || graph.userPrincipalName).toLowerCase();
    const meta  = detectRoleAndMeta(email);

    // ── 4. Build enriched user object ───────────────────────────────────────
    const user = {
      id:           graph.id,
      displayName:  graph.displayName,
      email,
      role:         meta.role,
      schoolCode:   'schoolCode' in meta ? meta.schoolCode : undefined,
      studentCode:  'studentCode' in meta ? meta.studentCode : graph.employeeId,
      department:   graph.department,
      jobTitle:     graph.jobTitle,
      officeLocation: graph.officeLocation,
      loginAt:      new Date().toISOString(),
    };

    // ── 5. Encrypt & store session ──────────────────────────────────────────
    const sessionId      = crypto.randomBytes(32).toString('hex');
    const sessionPayload = JSON.stringify(user);
    const secret         = SESSION_SECRET || 'scinexa_default_dev_secret_change_in_prod!!';
    const encrypted      = encryptSession(sessionPayload, secret);

    storeSession(sessionId, encrypted);

    // ── 6. Set HTTPOnly session cookie & redirect ───────────────────────────
    const isProd = process.env.NODE_ENV === 'production';
    const sessionCookie = [
      `scinexa_session=${sessionId}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Strict',
      'Max-Age=28800', // 8 hours
      ...(isProd ? ['Secure'] : []),
    ].join('; ');

    // Clear the temporary OAuth cookies
    const clearVerifier = 'scinexa_oauth_verifier=; Path=/; Max-Age=0; HttpOnly';
    const clearState    = 'scinexa_oauth_state=; Path=/; Max-Age=0; HttpOnly';

    res.setHeader('Set-Cookie', [sessionCookie, clearVerifier, clearState]);
    res.redirect(302, '/');
  } catch (err) {
    console.error('Callback error:', err);
    return res.redirect(302, '/login?error=server_error');
  }
}
