/**
 * api/auth/login.ts
 * Initiates Microsoft Entra ID OAuth 2.0 + PKCE flow.
 * Generates a cryptographically random state & code_verifier, stores them
 * in an HTTPOnly cookie (so JS cannot read them), then redirects the user
 * to Microsoft's login page.
 *
 * SECURITY: Uses PKCE so that even if the authorization code is intercepted,
 * it cannot be exchanged without the original code_verifier.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as crypto from 'crypto';

const {
  AZURE_CLIENT_ID,
  AZURE_TENANT_ID,
  VITE_APP_URL,
} = process.env;

/** Generate a cryptographically random URL-safe string */
function randomUrlSafe(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('base64url');
}

/** SHA-256 hash → base64url (for PKCE code_challenge) */
function sha256Base64url(plain: string): string {
  return crypto.createHash('sha256').update(plain).digest('base64url');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!AZURE_CLIENT_ID || !AZURE_TENANT_ID) {
    return res.status(500).json({ error: 'Microsoft Azure is not configured. Set AZURE_CLIENT_ID and AZURE_TENANT_ID.' });
  }

  // ── 1. Generate PKCE pair ─────────────────────────────────────────────────
  const codeVerifier = randomUrlSafe(64);           // secret, stays server-side
  const codeChallenge = sha256Base64url(codeVerifier); // sent to Microsoft

  // ── 2. Generate CSRF state ────────────────────────────────────────────────
  const state = randomUrlSafe(32);

  // ── 3. Store verifier + state in HTTPOnly, Secure, SameSite=Lax cookie ───
  //     Lax (not Strict) because we need to receive the cookie on the redirect
  //     back from Microsoft's domain.
  const cookieOptions = [
    `scinexa_oauth_verifier=${encodeURIComponent(codeVerifier)}`,
    `scinexa_oauth_state=${encodeURIComponent(state)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=600', // 10 minutes — must complete login in this window
    ...(process.env.NODE_ENV === 'production' ? ['Secure'] : []),
  ].join('; ');

  // ── 4. Build Microsoft authorization URL ─────────────────────────────────
  const redirectUri = `${VITE_APP_URL}/api/auth/callback`;
  const params = new URLSearchParams({
    client_id:             AZURE_CLIENT_ID,
    response_type:         'code',
    redirect_uri:          redirectUri,
    scope:                 'openid profile email User.Read',
    state,
    code_challenge:        codeChallenge,
    code_challenge_method: 'S256',
    response_mode:         'query',
    // Forces Microsoft to show the account picker (useful in school environments)
    prompt:                'select_account',
  });

  const authUrl = `https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/authorize?${params}`;

  res.setHeader('Set-Cookie', cookieOptions);
  res.redirect(302, authUrl);
}
